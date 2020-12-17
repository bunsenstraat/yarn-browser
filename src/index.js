import { Cache, Configuration, Project, Report } from "@yarnpkg/core";
import NpmPlugin from "@yarnpkg/plugin-npm";
import GitPlugin from "@yarnpkg/plugin-git";
import GithubPlugin from "@yarnpkg/plugin-github";
import NodeModulesPlugin from "@yarnpkg/plugin-node-modules";

import _memfs from "memfs";
export const memfs = _memfs;

import fakeFS from "./fs.cjs";

class MyReport extends Report {
	reportCacheHit(locator) {}
	reportCacheMiss(locator) {}
	startTimerSync(what, opts, cb) {
		const realCb = typeof opts === `function` ? opts : cb;
		return realCb();
	}
	async startTimerPromise(what, opts, cb) {
		const realCb = typeof opts === `function` ? opts : cb;
		return await realCb();
	}
	async startCacheReport(cb) {
		return await cb();
	}
	reportSeparator() {}
	reportInfo(name, text) {
		console.log("reportInfo", name, text);
	}
	reportWarning(name, text) {
		console.log("reportWarning", name, text);
	}
	reportError(name, text) {
		console.log("reportError", name, text);
	}
	reportProgress(progress) {
		const promise = Promise.resolve().then(async () => {
			for await (const p of progress) {
				console.log("reportProgress", p);
			}
		});

		const stop = () => {};

		return { ...promise, stop };
	}

	reportJson(data) {
		console.log("reportJson", data);
	}
	async finalize() {}
}

const plugins = new Map([
	[`@yarnpkg/plugin-npm`, NpmPlugin.default ?? NpmPlugin],
	[`@yarnpkg/plugin-git`, GitPlugin.default ?? GitPlugin],
	[`@yarnpkg/plugin-github`, GithubPlugin.default ?? GithubPlugin],
	[
		`@yarnpkg/plugin-node-modules`,
		NodeModulesPlugin.default ?? NodeModulesPlugin,
	],
]);

export default async ({ fs, dir }) => {
	fakeFS.__override(fs);

	const configuration = Configuration.create(dir, dir, plugins);
	configuration.useWithSource(
		"override",
		{
			nodeLinker: "node-modules",
			npmRegistryServer: "https://registry.npmjs.cf",
		},
		dir
	);
	const { project } = await Project.find(configuration, dir);
	const cache = await Cache.find(configuration);

	await project.install({ cache, report: new MyReport() });
};


// import { tgzUtils, structUtils } from "@yarnpkg/core";
// import { Buffer } from "buffer";

// import fs from "memfs";

// export default async ({ /*fs, */ dir }) => {
// 	// fakeFS.__override(fs);
// 	fs.mkdirSync("/tmp");

// 	let sourceBuffer = Buffer.from(
// 		"H4sIAAAAAAAAA+1W32vbMBDus/+KIxk0gdV2bCeG7geDvaxlG2PpnkpGNftSq7EtT5LThtL/fScpSfMwyGBtYMzfi9B3p7uTdKdTw7IFu8agcaN/o0R99MQIw3CSJGDGdDK2Yxi5ucEkDuFoFMXjME7SZJIchaPYyZ86kN+hVZpJCuVv7bi9wHb8R3DvAfRqVmHvFHqZUicNkwp7Lw29RKm4qI0k8kM/dGyOKpO80WvJ++kU7BrpxBXjlud1jneOmvMSFXGXNIG1hBKtR9PZ2mSDRNYZt3r3To+iMYa+O9/EPVhl1upCSCO5OIcPohS3bJUV7QJe65t3S24iPqkw58zP2FsXQMkzrJXd4qezC8dJbITiWsjVo0e9aqzSNddWiahWloYptG7UaRCQpGh/+JmoAom3Qi4oyGB7bL5ZuA10gSvSyHd2bna0trtzZDRTekVHVCDa5TPvwTvU/a/rPthcynP42FP/YZLa+k/idBTGaUj1H43ScVf/h0Al8rZEH+8aIbWCNyDxZ8slDo4pWY+Hvs3TVwdLxw4Hxqb+vyLLK/Sr/Bl87Kn/JIp26n9s6z9Koq7+D4E+bLuXR63nnC3Z1LZ3eGzsMBcSPovc/A5hsHkqdIFwZRWuoELqyTmIOVySudlgX7scDj2v34ezmg6/LJn5SxjvL6BuKuCO3Q2MdL8pSlOj9KVEphAUog3hDx2Ce+ggF1lbYa2tT99a/uh+B8Y2/Q66p65Dhw7/CX4BBXc2ugAQAAA",
// 		"base64"
// 	);

// 	let zipFs = await tgzUtils.convertToZip(sourceBuffer, {
// 		compressionLevel: "mixed",
// 		prefixPath: "node_modules/lodash-es",
// 		stripComponents: 1,
// 	});
// 	console.log(zipFs);
// 	console.log(zipFs.getRealPath());
// 	zipFs.saveAndClose();
// 	console.log(fs.readdirSync("/tmp/" + fs.readdirSync("/tmp")[0]));
// };
