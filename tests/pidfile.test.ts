import fs from 'node:fs/promises';
import process from 'node:process';
import { lock } from 'proper-lockfile';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { PidFile } from '../src/pid-file.js';

// Mocks
vi.mock('proper-lockfile');

// Setup
beforeEach(() => {
  vi.resetAllMocks();
});

// Test suites
describe('PidFile.create', () => {
  beforeEach(() => {
    vi.spyOn(fs, 'writeFile')
      .mockRejectedValue({ message: 'Failed !', code: 'EEXIST' });
  });

  // Tests
  it('should create pidfile and return true', async () => {
    vi.spyOn(fs, 'writeFile').mockImplementation(async () => {});

    // Test
    const pidfile = new PidFile('.test.pid');
    await expect(pidfile.create()).resolves.toBe('created');

    expect(fs.writeFile).toHaveBeenCalledWith('.test.pid', process.pid.toString(), { flag: 'wx', encoding: 'utf-8' });
  });

  it('should fail to create pidfile and try to update it', async () => {
    const pidfile = new PidFile('.test.pid');
    vi.spyOn(pidfile, 'update').mockResolvedValue(true);

    // Test
    await expect(pidfile.create()).resolves.toBe('updated');

    expect(pidfile.update).toHaveBeenCalled();
  });

  it('should fail to create pidfile and return false', async () => {
    vi.spyOn(fs, 'writeFile').mockRejectedValue(new Error('Failed !'));

    // Test
    const pidfile = new PidFile('.test.pid');
    await expect(pidfile.create()).rejects.toEqual(new Error('Failed !'));
  });
});

describe('PidFile.update', () => {
  let lockRelease: Mock;

  beforeEach(() => {
    vi.spyOn(fs, 'readFile').mockResolvedValue('-10');
    vi.spyOn(fs, 'writeFile').mockImplementation(async () => {});

    vi.spyOn(process, 'kill').mockImplementation(() => {
      throw new Error('Process not found');
    });

    lockRelease = vi.fn();
    vi.mocked(lock).mockResolvedValue(lockRelease);
  });

  // Tests
  it('should update pidfile as process is not running', async () => {
    // Test
    const pidfile = new PidFile('.test.pid');
    await expect(pidfile.update()).resolves.toBe(true);

    expect(fs.readFile).toHaveBeenCalledWith('.test.pid', 'utf-8');
    expect(process.kill).toHaveBeenCalledWith(-10, 0);
    expect(lock).toHaveBeenCalledWith('.test.pid');
    expect(fs.writeFile).toHaveBeenCalledWith('.test.pid', process.pid.toString(), { flag: 'w', encoding: 'utf-8' });
    expect(lockRelease).toHaveBeenCalled();
  });

  it('should not update pidfile as process is still running', async () => {
    vi.spyOn(process, 'kill').mockImplementation(async (): Promise<true> => true);

    // Test
    const pidfile = new PidFile('.test.pid');
    await expect(pidfile.update()).resolves.toBe(false);

    expect(lock).toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should fail to update pidfile', async () => {
    vi.spyOn(fs, 'writeFile').mockRejectedValue(new Error('Failed !'));

    // Test
    const pidfile = new PidFile('.test.pid');
    await expect(pidfile.update()).rejects.toEqual(new Error('Failed !'));

    expect(lock).toHaveBeenCalledWith('.test.pid');
    expect(lockRelease).toHaveBeenCalled();
  });
});

describe('PidFile.delete', () => {
  // Tests
  it('should delete pidfile', async () => {
    vi.spyOn(fs, 'unlink').mockResolvedValue();

    // Test
    const pidfile = new PidFile('.test.pid');
    await expect(pidfile.delete()).resolves.toBeUndefined();

    expect(fs.unlink).toHaveBeenCalledWith('.test.pid');
  });
});