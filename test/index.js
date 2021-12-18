import { run, memfs } from "../dist/yarn-browser-standalone.es.js";
import {
	openDB,
	deleteDB,
	wrap,
	unwrap,
} from "https://unpkg.com/idb@5.0.8?module";

const IDB_DB_YARN = "yarn-cache";
const IDB_STORE_CACHE = "cache";
const IDB_STORE_LOCK = "lockfile";
const IDB_CACHE_VERSION = 1;

async function getDB() {
	return openDB(IDB_DB_YARN, IDB_CACHE_VERSION, {
		upgrade(db, oldVersion, newVersion, transaction) {
			db.createObjectStore(IDB_STORE_CACHE, {
				keyPath: "name",
			});
			db.createObjectStore(IDB_STORE_LOCK, {
				keyPath: "name",
			});
		},
		blocked() {},
		blocking() {},
		terminated() {},
	});
}

const YARN_CACHE_DIR = "/.yarn-global/cache";
const YARN_LOCKFILE = "/app/yarn.lock";
const Cache = {
	async saveCache() {
		const files = memfs
			.readdirSync(YARN_CACHE_DIR)
			.map((name) => [
				name,
				memfs.readFileSync(YARN_CACHE_DIR + "/" + name),
			]);

		const db = await getDB();
		const tx = db.transaction(IDB_STORE_CACHE, "readwrite");
		await Promise.all([
			...files.map(([name, data]) =>
				tx.store.put({
					name,
					data,
				})
			),
			tx.done,
		]);
	},
	async restoreCache() {
		memfs.mkdirpSync(YARN_CACHE_DIR);
		const db = await getDB();
		for (let { name, data } of await db.getAll(IDB_STORE_CACHE)) {
			memfs.writeFileSync(YARN_CACHE_DIR + "/" + name, data);
		}
	},

	async saveLockfile() {
		const data = memfs.readFileSync(YARN_LOCKFILE);

		const db = await getDB();
		const tx = db.transaction(IDB_STORE_LOCK, "readwrite");
		const result = await db.put(IDB_STORE_LOCK, {
			name: "yarn.lock",
			data,
		});
	},
	async restoreLockfile() {
		const db = await getDB();
		const result = await db.get(IDB_STORE_LOCK, "yarn.lock");
		if (result) {
			memfs.writeFileSync(YARN_LOCKFILE, result.data);
		}
	},
};

globalThis.fs = memfs;

(async () => {
	// await new Promise((res) => setTimeout(() => res(), 1000));

	memfs.mkdirSync("/tmp");
	memfs.mkdirSync("/app");
	memfs.writeFileSync(
		"/app/package.json",
		JSON.stringify(
			{
				dependencies: {
					"core-js": "^3.0.0",
					// "lodash-es": "^4.17.15",
					// "parcel": "nightly",
					react: "^17.0.0",
					// "react-dom": "latest",
				},
			},
			null,
			2
		)
	);

	const dir = "/app";

	console.log("Restoring cache...");
	await Cache.restoreLockfile();
	await Cache.restoreCache();
	console.log("Starting Yarn...");
	console.time("Finished in");
	let { report } = await run({
		dir,
		fs: memfs,
		options: {
			enableGlobalCache: true,
			globalFolder: "/.yarn-global",
		},
		progress({ type, indent, data, displayName }) {
			console.log(
				`%c[${displayName}] ${indent} ${data}`,
				`font-family: monospace;${
					type === "error" ? "color: red;" : ""
				}`
			);
		},
	});
	console.timeEnd("Finished in");

	if (report.reportedErrors.size > 0) throw [...report.reportedErrors][0];

	console.log("node_modules:", memfs.readdirSync("/app/node_modules"));

	await Cache.saveLockfile();
	await Cache.saveCache();
})().catch((e) => {
	console.error(e);
});
