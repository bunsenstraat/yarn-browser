import run from "./src/index.js";
import { ppath } from "@yarnpkg/fslib";
import fs from "fs";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const dir = ppath.join(__dirname, "test");

run({ dir, fs }).catch((e) => {
  console.error(e);
  process.exit(1);
});
