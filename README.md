# @jujulego/pid-file
[![Version](https://img.shields.io/npm/v/@jujulego/pid-file)](https://www.npmjs.com/package/@jujulego/pid-file)
![Licence](https://img.shields.io/github/license/jujulego/pid-file)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=jujulego_pid-file&metric=alert_status)](https://sonarcloud.io/dashboard?id=jujulego_pid-file)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=jujulego_pid-file&metric=coverage)](https://sonarcloud.io/dashboard?id=jujulego_pid-file)
[![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)

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

## Logging
`pid-file` uses by default [`debug`](https://www.npmjs.com/package/debug) to log.
You can view those logs by setting the `DEBUG` env variable to `pid-file`.

### Customization
The logger can be customized by passing yours to the `PidFile` constructor. It will have to match the `ILogger` interface:

#### Using console
```typescript
const pidfile = new PidFile('.example.pid', console);
```

#### Or custom levels
```typescript
const pidfile = new PidFile('.example.pid', {
  debug(msg) { console.log(msg); },
  info(msg)  { console.log(msg); },
  warn(msg)  { console.warn(msg); }
});
```

# Documentation
## Classes

<dl>
<dt><a href="#DebugLogger">DebugLogger</a></dt>
<dd><p>Implements <code>ILogger</code> using the <code>debug</code> module.</p>
</dd>
<dt><a href="#PidFile">PidFile</a></dt>
<dd></dd>
</dl>

<a name="DebugLogger"></a>

## DebugLogger
Implements `ILogger` using the `debug` module.

**Kind**: global class  
<a name="PidFile"></a>

## PidFile
**Kind**: global class  

* [PidFile](#PidFile)
    * [new PidFile(filename, _logger)](#new_PidFile_new)
    * [.create()](#PidFile+create)
    * [.update()](#PidFile+update)
    * [.delete()](#PidFile+delete)

<a name="new_PidFile_new"></a>

### new PidFile(filename, _logger)

| Param | Description |
| --- | --- |
| filename | path to the managed pidfile |
| _logger | custom logger |

<a name="PidFile+create"></a>

### pidFile.create()
Creates pidfile. If the pidfile already exists tries to update it.
Returns true if the pidfile was successfully created/updated, false otherwise.

**Kind**: instance method of [<code>PidFile</code>](#PidFile)  
<a name="PidFile+update"></a>

### pidFile.update()
Tries to update the pidfile.
Returns true if the pidfile was updated false otherwise.

**Kind**: instance method of [<code>PidFile</code>](#PidFile)  
<a name="PidFile+delete"></a>

### pidFile.delete()
Deletes the pidfile.

**Kind**: instance method of [<code>PidFile</code>](#PidFile)  
