import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new JsonLogger();
    logSpy = jest.spyOn(console, 'log').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    debugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log()', () => {
    it('пишет валидную JSON-строку в console.log', () => {
      logger.log('hello');

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(() => JSON.parse(logSpy.mock.calls[0][0])).not.toThrow();
    });

    it('включает level "log" и сообщение в JSON, а optionalParams — пустой массив', () => {
      logger.log('hello');

      const parsed = JSON.parse(logSpy.mock.calls[0][0]);
      expect(parsed).toMatchObject({
        level: 'log',
        message: 'hello',
        optionalParams: [],
      });
    });

    it('помещает дополнительные аргументы в массив optionalParams', () => {
      logger.log('hello', 'ctx', { extra: 1 });

      const parsed = JSON.parse(logSpy.mock.calls[0][0]);
      expect(parsed.optionalParams).toEqual(['ctx', { extra: 1 }]);
    });
  });

  describe('error()', () => {
    it('пишет в console.error, а не в console.log', () => {
      logger.error('boom');

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('указывает level "error" в JSON-сообщении', () => {
      logger.error('boom');

      const parsed = JSON.parse(errorSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('boom');
    });
  });

  describe('warn()', () => {
    it('пишет JSON с level "warn" в console.warn', () => {
      logger.warn('careful');

      expect(warnSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(warnSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('warn');
    });
  });

  describe('debug()', () => {
    it('пишет JSON с level "debug" в console.debug', () => {
      logger.debug('details');

      expect(debugSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(debugSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('debug');
    });
  });

  describe('verbose()', () => {
    it('пишет JSON с level "verbose" в console.log', () => {
      logger.verbose('chatty');

      expect(logSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(logSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('verbose');
    });
  });

  describe('fatal()', () => {
    it('пишет JSON с level "fatal" в console.error', () => {
      logger.fatal('critical');

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(errorSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('fatal');
    });
  });

  describe('нестроковые значения message', () => {
    it('сериализует объект-сообщение без ошибок и сохраняет его в распарсенном JSON', () => {
      logger.log({ foo: 'bar' });

      const parsed = JSON.parse(logSpy.mock.calls[0][0]);
      expect(parsed.message).toEqual({ foo: 'bar' });
    });
  });
});
