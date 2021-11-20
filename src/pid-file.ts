import { promises as fs } from 'fs';
import { lock } from 'proper-lockfile';

import { DebugLogger, Logger } from './logger';

// Class
export class PidFile {
  // Constructor
  constructor(
    readonly filename: string,
    private readonly _logger: Logger = new DebugLogger()
  ) {}

  // Statics
  private static _processIsRunning(pid: number): boolean {
    try {
      process.kill(pid, 0);
      return true;
    } catch (err) {
      return false;
    }
  }

  // Methods
  private async _lock<R>(fun: () => Promise<R>): Promise<R> {
    const release = await lock(this.filename);

    try {
      return await fun();
    } finally {
      await release();
    }
  }

  async create(): Promise<boolean> {
    try {
      this._logger.debug(`Create pid file ${process.pid}`);
      await fs.writeFile(this.filename, process.pid.toString(), { flag: 'wx', encoding: 'utf-8' });
    } catch (err) {
      if (err.code === 'EEXIST') {
        // Try to update pidfile
        return await this.update();
      } else {
        this._logger.error(err.stack || err.message);
      }

      return false;
    }

    return true;
  }

  async update(): Promise<boolean> {
    // Get other process pid
    const pid = parseInt(await fs.readFile(this.filename, 'utf-8'));
    this._logger.warn(`Looks like myr was already started (${pid})`);

    // Check if other process is still running
    if (PidFile._processIsRunning(pid)) return false;

    try {
      // Lock pidfile
      await this._lock(async () => {
        this._logger.debug(`Update pid file ${pid} => ${process.pid}`);
        await fs.writeFile(this.filename, process.pid.toString(), { flag: 'w', encoding: 'utf-8' });
      });

      this._logger.info(`${pid} was killed or stopped, pidfile updated`);
    } catch (err) {
      this._logger.error(err);
      return false;
    }

    return true;
  }

  async delete(): Promise<void> {
    this._logger.debug('Delete pid file');
    await fs.unlink(this.filename);
  }
}