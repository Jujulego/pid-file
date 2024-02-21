import { Logger, logger$, withLabel } from '@kyrielle/logger';
import fs from 'node:fs/promises';
import process from 'node:process';
import { lock } from 'proper-lockfile';

// Class
export class PidFile {
  // Attributes
  readonly logger: Logger;

  // Constructor
  /**
   * @param filename path to the managed pid file
   * @param logger custom logger
   */
  constructor(
    readonly filename: string,
    logger: Logger = logger$()
  ) {
    this.logger = logger.child(withLabel('pid-file'));
  }

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
   * Creates pid file. If the pid file already exists tries to update it.
   * Returns true if the pid file was successfully created/updated, false otherwise.
   */
  async create(): Promise<'created' | 'updated' | false> {
    try {
      this.logger.debug`Create pid file as process ${process.pid}`;
      await fs.writeFile(this.filename, process.pid.toString(), { flag: 'wx', encoding: 'utf-8' });
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
        return await this.update() && 'updated';
      } else {
        throw err;
      }
    }

    return 'created';
  }

  /**
   * Tries to update the pid file.
   * Returns true if the pid file was updated false otherwise.
   */
  async update(): Promise<boolean> {
    const release = await lock(this.filename);

    try {
      // Get other process pid
      const pid = parseInt(await fs.readFile(this.filename, 'utf-8'));

      // Check if other process is still running
      if (PidFile._processIsRunning(pid)) {
        this.logger.debug`As pid file already exists and its process ${pid} still runs`;
        return false;
      }

      // Update pid file
      this.logger.debug`Update pid file from ${pid} to ${process.pid}`;
      await fs.writeFile(this.filename, process.pid.toString(), { flag: 'w', encoding: 'utf-8' });

      return true;
    } finally {
      await release();
    }
  }

  /**
   * Deletes the pid file.
   */
  async delete(): Promise<void> {
    try {
      this.logger.debug('Delete pid file');
      await fs.unlink(this.filename);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return;
      } else {
        throw err;
      }
    }
  }
}
