import { promises as fs } from 'fs';
import { lock } from 'proper-lockfile';

import { DebugLogger, ILogger } from './logger.js';

// Class
export class PidFile {
  // Constructor
  /**
   * @param filename path to the managed pidfile
   * @param logger custom logger
   */
  constructor(
    readonly filename: string,
    private readonly logger: ILogger = new DebugLogger()
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
  /**
   * Creates pidfile. If the pidfile already exists tries to update it.
   * Returns true if the pidfile was successfully created/updated, false otherwise.
   */
  async create(): Promise<boolean> {
    try {
      this.logger.debug(`Create pid file ${process.pid}`);
      await fs.writeFile(this.filename, process.pid.toString(), { flag: 'wx', encoding: 'utf-8' });
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
        // Try to update pidfile
        return await this.update();
      } else {
        throw err;
      }
    }

    return true;
  }

  /**
   * Tries to update the pidfile.
   * Returns true if the pidfile was updated false otherwise.
   */
  async update(): Promise<boolean> {
    const release = await lock(this.filename);

    try {
      // Get other process pid
      const pid = parseInt(await fs.readFile(this.filename, 'utf-8'));
      this.logger.warn(`Looks like server was already started (${pid})`);

      // Check if other process is still running
      if (PidFile._processIsRunning(pid)) {
        return false;
      }

      // Lock pidfile
      this.logger.debug(`Update pid file ${pid} => ${process.pid}`);
      await fs.writeFile(this.filename, process.pid.toString(), { flag: 'w', encoding: 'utf-8' });

      this.logger.info(`${pid} was killed or stopped, pidfile updated`);

      return true;
    } finally {
      await release();
    }
  }

  /**
   * Deletes the pidfile.
   */
  async delete(): Promise<void> {
    this.logger.debug('Delete pid file');
    await fs.unlink(this.filename);
  }
}
