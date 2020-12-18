import {
	Cache,
	Configuration,
	Project,
	Report,
	StreamReport,
} from "@yarnpkg/core";
import NpmPlugin from "@yarnpkg/plugin-npm";
// import GitPlugin from "@yarnpkg/plugin-git";
// import GithubPlugin from "@yarnpkg/plugin-github";
import NodeModulesPlugin from "@yarnpkg/plugin-node-modules";

const { Writable } = require("stream");

import _memfs from "memfs";
export const memfs = _memfs;

import fakeFS from "./fs.cjs";
import { __setRegistry } from "got";

// class MyReport extends Report {
// 	reportCacheHit(locator) {}
// 	reportCacheMiss(locator) {}
// 	startTimerSync(what, opts, cb) {
// 		const realCb = typeof opts === `function` ? opts : cb;
// 		return realCb();
// 	}
// 	async startTimerPromise(what, opts, cb) {
// 		const realCb = typeof opts === `function` ? opts : cb;
// 		return await realCb();
// 	}
// 	async startCacheReport(cb) {
// 		return await cb();
// 	}
// 	reportSeparator() {}
// 	reportInfo(name, text) {
// 		console.log("reportInfo", name, text);
// 	}
// 	reportWarning(name, text) {
// 		console.log("reportWarning", name, text);
// 	}
// 	reportError(name, text) {
// 		console.log("reportError", name, text);
// 	}
// 	reportProgress(progress) {
// 		const promise = Promise.resolve().then(async () => {
// 			for await (const p of progress) {
// 				console.log("reportProgress", p);
// 			}
// 		});

// 		const stop = () => {};

// 		return { ...promise, stop };
// 	}

// 	reportJson(data) {
// 		console.log("reportJson", data);
// 	}
// 	async finalize() {}
// }

class StringStream extends Writable {
	constructor() {
		super();
		this.chunks = [];
	}
	getChunks() {
		return this.chunks;
	}
	_write(chunk, enc, next) {
		this.chunks.push(JSON.parse(chunk.toString()));
		next();
	}
}

const plugins = new Map([
	// [`@yarnpkg/plugin-git`, GitPlugin.default ?? GitPlugin],
	// [`@yarnpkg/plugin-github`, GithubPlugin.default ?? GithubPlugin],
	[`@yarnpkg/plugin-npm`, NpmPlugin.default ?? NpmPlugin],
	[
		`@yarnpkg/plugin-node-modules`,
		NodeModulesPlugin.default ?? NodeModulesPlugin,
	],
]);

const DEFAULT_REGISTRY = "registry.npmjs.cf";

export async function run({ fs, dir, options = {} }) {
	fakeFS.__override(fs);

	let registry = options.npmRegistryServer ?? DEFAULT_REGISTRY;
	__setRegistry(registry);

	const configuration = Configuration.create(dir, dir, plugins);
	configuration.useWithSource(
		"override",
		{
			nodeLinker: "node-modules",
			compressionLevel: 0,
			...options,
			npmRegistryServer: "https://" + registry,
		},
		dir
	);
	const { project } = await Project.find(configuration, dir);
	const cache = await Cache.find(configuration);

	const stdout = new StringStream();

	let report = await StreamReport.start(
		{
			configuration,
			json: true,
			stdout,
			includeLogs: true,
		},
		async (report) => {
			await project.install({ cache, report });
		}
	);

	// TODO stream into a callback
	return { report, messages: stdout.getChunks() };
}
