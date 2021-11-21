import { debug } from 'debug';

// Types
export interface ILogger {
  debug(msg: string): void;
  info(msg: string): void;
  warn(msg: string): void;
}

// Logger
/**
 * Implements `ILogger` using the `debug` module.
 */
export class DebugLogger implements ILogger {
  // Attributes
  private readonly _debug = debug('pid-file');

  // Methods
  debug(msg: string): void {
    this._debug(`debug ${msg}`);
  }

  info(msg: string): void {
    this._debug(`info  ${msg}`);
  }

  warn(msg: string): void {
    this._debug(`warn  ${msg}`);
  }
}