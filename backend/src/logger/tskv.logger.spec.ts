import { TskvLogger } from './tskv.logger';

function parseTskvFields(line: string): Record<string, string> {
  const withoutTrailingNewline = line.replace(/\n$/, '');
  const fields: Record<string, string> = {};
  for (const part of withoutTrailingNewline.split('\t')) {
    const separatorIndex = part.indexOf('=');
    fields[part.slice(0, separatorIndex)] = part.slice(separatorIndex + 1);
  }
  return fields;
}

function unescapeTskvValue(value: string): string {
  return value.replace(/\\\\|\\t|\\n/g, (match) => {
    if (match === '\\\\') return '\\';
    if (match === '\\t') return '\t';
    return '\n';
  });
}

describe('TskvLogger', () => {
  let logger: TskvLogger;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new TskvLogger();
    logSpy = jest.spyOn(console, 'log').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    debugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log()', () => {
    it('пишет в console.log строку key=value через табуляцию, заканчивающуюся переносом строки', () => {
      logger.log('hello');

      expect(logSpy).toHaveBeenCalledTimes(1);
      const line: string = logSpy.mock.calls[0][0];
      expect(line.endsWith('\n')).toBe(true);
      expect(line.split('\t').length).toBeGreaterThanOrEqual(3);
    });

    it('включает поля level и message с верными значениями', () => {
      logger.log('hello');

      const fields = parseTskvFields(logSpy.mock.calls[0][0]);
      expect(fields.level).toBe('log');
      expect(fields.message).toBe('hello');
    });

    it('не добавляет поле optionalParams, если доп. аргументы не переданы', () => {
      logger.log('hello');

      const fields = parseTskvFields(logSpy.mock.calls[0][0]);
      expect(fields).not.toHaveProperty('optionalParams');
    });

    it('включает поле optionalParams с доп. аргументами, если они переданы', () => {
      logger.log('hello', 'a', 1);

      const fields = parseTskvFields(logSpy.mock.calls[0][0]);
      expect(JSON.parse(unescapeTskvValue(fields.optionalParams))).toEqual([
        'a',
        1,
      ]);
    });
  });

  describe('error()', () => {
    it('пишет в console.error с level=error', () => {
      logger.error('boom');

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const fields = parseTskvFields(errorSpy.mock.calls[0][0]);
      expect(fields.level).toBe('error');
    });
  });

  describe('warn()', () => {
    it('пишет в console.warn с level=warn', () => {
      logger.warn('careful');

      expect(warnSpy).toHaveBeenCalledTimes(1);
      const fields = parseTskvFields(warnSpy.mock.calls[0][0]);
      expect(fields.level).toBe('warn');
    });
  });

  describe('debug() и verbose()', () => {
    it('пишет в console.debug с level=debug', () => {
      logger.debug('details');

      expect(debugSpy).toHaveBeenCalledTimes(1);
      const fields = parseTskvFields(debugSpy.mock.calls[0][0]);
      expect(fields.level).toBe('debug');
    });

    it('пишет в console.log с level=verbose', () => {
      logger.verbose('chatty');

      expect(logSpy).toHaveBeenCalledTimes(1);
      const fields = parseTskvFields(logSpy.mock.calls[0][0]);
      expect(fields.level).toBe('verbose');
    });
  });

  describe('fatal()', () => {
    it('пишет в console.error с level=fatal', () => {
      logger.fatal('critical');

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const fields = parseTskvFields(errorSpy.mock.calls[0][0]);
      expect(fields.level).toBe('fatal');
    });
  });

  describe('экранирование зарезервированных символов', () => {
    it('экранирует символ табуляции в сообщении, чтобы строка сохранила ожидаемое число полей', () => {
      logger.log('a\tb');

      const line: string = logSpy.mock.calls[0][0];
      const fields = parseTskvFields(line);
      expect(Object.keys(fields)).toEqual(['timestamp', 'level', 'message']);
      expect(unescapeTskvValue(fields.message)).toBe('a\tb');
    });

    it('экранирует символ переноса строки внутри сообщения, чтобы запись оставалась в одной строке', () => {
      logger.log('line1\nline2');

      const line: string = logSpy.mock.calls[0][0];
      expect(line.match(/\n/g)?.length).toBe(1);
      expect(line.endsWith('\n')).toBe(true);

      const fields = parseTskvFields(line);
      expect(unescapeTskvValue(fields.message)).toBe('line1\nline2');
    });

    it('экранирует обратный слэш, чтобы экранированные последовательности оставались однозначными', () => {
      logger.log('a\\tb');

      const fields = parseTskvFields(logSpy.mock.calls[0][0]);
      expect(unescapeTskvValue(fields.message)).toBe('a\\tb');
    });

    it('даёт значение, которое можно разэкранировать обратно в исходную строку', () => {
      const original = 'mix\tof\\stuff\nand more';
      logger.log(original);

      const fields = parseTskvFields(logSpy.mock.calls[0][0]);
      expect(unescapeTskvValue(fields.message)).toBe(original);
    });
  });
});
