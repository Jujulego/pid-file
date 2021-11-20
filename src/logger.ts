import { debug } from 'debug';

// Types
export interface Logger {
  debug(msg: string): void;
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
}

// Logger
export class DebugLogger implements Logger {
  // Attributes
  private readonly _debug = debug('pid-file');

  // Methods
  debug(msg: string): void {
    this._debug.log(`debug ${msg}`);
  }

  info(msg: string): void {
    this._debug.log(`info  ${msg}`);
  }

  warn(msg: string): void {
    this._debug.log(`warn  ${msg}`);
  }

  error(msg: string): void {
    this._debug.log(`error ${msg}`);
  }
}