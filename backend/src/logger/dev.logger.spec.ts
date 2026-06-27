import { ConsoleLogger } from '@nestjs/common';
import { DevLogger } from './dev.logger';

describe('DevLogger', () => {
  it('расширяет встроенный ConsoleLogger', () => {
    const logger = new DevLogger();
    expect(logger).toBeInstanceOf(ConsoleLogger);
  });

  it('делегирует вызов log() выводу базового ConsoleLogger', () => {
    const logSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
    const logger = new DevLogger();

    expect(() => logger.log('hello')).not.toThrow();
    expect(logSpy).toHaveBeenCalled();

    logSpy.mockRestore();
  });
});
