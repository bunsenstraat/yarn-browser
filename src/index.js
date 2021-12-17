import { Cache, Configuration, Project, StreamReport } from "@yarnpkg/core";
// import GitPlugin from "@yarnpkg/plugin-git";
// import GithubPlugin from "@yarnpkg/plugin-github";
import NpmPlugin from "@yarnpkg/plugin-npm";
import NodeModulesPlugin from "@yarnpkg/plugin-node-modules";

const { Writable } = require("stream");

import fakeFS from "./fs.cjs";
import { __setRegistry } from "got";

class CallbackStream extends Writable {
	constructor(cb) {
		super();
		this.cb = cb;
	}
	_write(chunk, enc, next) {
		Promise.resolve().then(() => this.cb(JSON.parse(chunk.toString())));
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

export async function run({ fs, dir, options = {}, progress = () => {} }) {
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
			enableScripts: false
		},
		dir
	);
	const { project } = await Project.find(configuration, dir);
	const cache = await Cache.find(configuration);

	let report = await StreamReport.start(
		{
			configuration,
			json: true,
			stdout: new CallbackStream(progress),
			includeLogs: true,
		},
		async (report) => {
			await project.install({ cache, report });
		}
	);

	return { report };
}
