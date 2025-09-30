# @jujulego/pid-file
[![version](https://img.shields.io/npm/v/@jujulego/pid-file)](https://www.npmjs.com/package/@jujulego/pid-file)
![licence](https://img.shields.io/github/license/jujulego/pid-file)
[![codecov](https://codecov.io/gh/Jujulego/pid-file/graph/badge.svg?token=d8GCA59frs)](https://codecov.io/gh/Jujulego/pid-file)

A simple pidfile utility. A pidfile holds the current pid of the process running your server.
It can be used to detect if your process is already running, and interact with it using signals.

# Installation
```shell
yarn add @jujulego/pid-file
```

# Design
First `pid-file` will try to create the pidfile with the `wx` [filesystem flag](https://nodejs.org/docs/latest-v14.x/api/fs.html#fs_file_system_flags).
If the operation succeed, the pidfile didn't exist before, and this process now owns it.

If the file creation failed it means that the pidfile already existed, `pid-file` will check if the process owning the pidfile is still running.
If the other process still runs the creation fails, else `pid-file` will update the pidfile with it's own pid.
While `pid-file` tries to update the pidfile, this one is locked using [`proper-lockfile`](https://www.npmjs.com/package/proper-lockfile)
to ensure no other process also try to update it.

# Usage
## Example
Nothing beats an example:
```typescript
import { PidFile } from '@jujulego/pid-file';

const pidfile = new PidFile('.example.pid');

if (!await pidfile.create()) {
  console.warn('Failed to create .example.pid');
  process.exit(1);
}

// Do your job ;)

// When every thing is finished you should delete the pidfile:
await pidfile.delete();
```
