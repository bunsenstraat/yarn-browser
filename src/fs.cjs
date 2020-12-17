let fs = {};

function __override(_fs) {
  fs = _fs;
}

export const methods = [
  "renameSync",
  "ftruncateSync",
  "truncateSync",
  "chownSync",
  "fchownSync",
  "lchownSync",
  "chmodSync",
  "fchmodSync",
  "lchmodSync",
  "statSync",
  "lstatSync",
  "fstatSync",
  "linkSync",
  "symlinkSync",
  "readlinkSync",
  "realpathSync",
  "unlinkSync",
  "rmdirSync",
  "mkdirSync",
  "mkdirpSync",
  "readdirSync",
  "closeSync",
  "openSync",
  "utimesSync",
  "futimesSync",
  "fsyncSync",
  "writeSync",
  "readSync",
  "readFileSync",
  "writeFileSync",
  "appendFileSync",
  "existsSync",
  "accessSync",
  "fdatasyncSync",
  "mkdtempSync",
  "copyFileSync",

  "createReadStream",
  "createWriteStream",
  "rename",
  "ftruncate",
  "truncate",
  "chown",
  "fchown",
  "lchown",
  "chmod",
  "fchmod",
  "lchmod",
  "stat",
  "lstat",
  "fstat",
  "link",
  "symlink",
  "readlink",
  "realpath",
  "unlink",
  "rmdir",
  "mkdir",
  "mkdirp",
  "readdir",
  "close",
  "open",
  "utimes",
  "futimes",
  "fsync",
  "write",
  "read",
  "readFile",
  "writeFile",
  "appendFile",
  "exists",
  "access",
  "fdatasync",
  "mkdtemp",
  "copyFile",

  "watchFile",
  "unwatchFile",
  "watch",
];

const constants = {
  O_RDONLY: 0,
  O_WRONLY: 1,
  O_RDWR: 2,
  S_IFMT: 61440,
  S_IFREG: 32768,
  S_IFDIR: 16384,
  S_IFCHR: 8192,
  S_IFBLK: 24576,
  S_IFIFO: 4096,
  S_IFLNK: 40960,
  S_IFSOCK: 49152,
  O_CREAT: 64,
  O_EXCL: 128,
  O_NOCTTY: 256,
  O_TRUNC: 512,
  O_APPEND: 1024,
  O_DIRECTORY: 65536,
  O_NOATIME: 262144,
  O_NOFOLLOW: 131072,
  O_SYNC: 1052672,
  O_DIRECT: 16384,
  O_NONBLOCK: 2048,
  S_IRWXU: 448,
  S_IRUSR: 256,
  S_IWUSR: 128,
  S_IXUSR: 64,
  S_IRWXG: 56,
  S_IRGRP: 32,
  S_IWGRP: 16,
  S_IXGRP: 8,
  S_IRWXO: 7,
  S_IROTH: 4,
  S_IWOTH: 2,
  S_IXOTH: 1,

  F_OK: 0,
  R_OK: 4,
  W_OK: 2,
  X_OK: 1,

  UV_FS_SYMLINK_DIR: 1,
  UV_FS_SYMLINK_JUNCTION: 2,

  UV_FS_COPYFILE_EXCL: 1,
  UV_FS_COPYFILE_FICLONE: 2,
  UV_FS_COPYFILE_FICLONE_FORCE: 4,
  COPYFILE_EXCL: 1,
  COPYFILE_FICLONE: 2,
  COPYFILE_FICLONE_FORCE: 4,

  ISUID: 0b100000000000,
  ISGID: 0b10000000000,
  ISVTX: 0b1000000000,
  IRUSR: 0b100000000,
  IWUSR: 0b10000000,
  IXUSR: 0b1000000,
  IRGRP: 0b100000,
  IWGRP: 0b10000,
  IXGRP: 0b1000,
  IROTH: 0b100,
  IWOTH: 0b10,
  IXOTH: 0b1,
};

module.exports = new Proxy(
  {},
  {
    get: (target, prop) => {
      if (prop === "__override") {
        return __override;
      } else if (methods.includes(prop)) {
        return (...args) => fs[prop](...args);
      } else if (prop === "constants") {
        return constants;
      }
    },
    ownKeys() {
      return [...methods, "constants"];
    },
    getOwnPropertyDescriptor(target, name) {
      return {
        value: this.get(target, name),
        configurable: true,
        enumerable: true,
      };
    },
  }
);
