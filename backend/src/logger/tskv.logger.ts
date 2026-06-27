import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class TskvLogger implements LoggerService {
  private escapeValue(value: unknown): string {
    const raw = typeof value === 'string' ? value : JSON.stringify(value);
    return raw
      .replace(/\\/g, '\\\\')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n');
  }

  private formatMessage(
    level: string,
    message: unknown,
    optionalParams: unknown[],
  ): string {
    const fields: [string, string][] = [
      ['timestamp', new Date().toISOString()],
      ['level', level],
      ['message', this.escapeValue(message)],
    ];

    if (optionalParams.length > 0) {
      fields.push(['optionalParams', this.escapeValue(optionalParams)]);
    }

    return fields.map(([key, value]) => `${key}=${value}`).join('\t') + '\n';
  }

  log(message: unknown, ...optionalParams: unknown[]) {
    console.log(this.formatMessage('log', message, optionalParams));
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    console.error(this.formatMessage('error', message, optionalParams));
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    console.warn(this.formatMessage('warn', message, optionalParams));
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    console.debug(this.formatMessage('debug', message, optionalParams));
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    console.log(this.formatMessage('verbose', message, optionalParams));
  }

  fatal(message: unknown, ...optionalParams: unknown[]) {
    console.error(this.formatMessage('fatal', message, optionalParams));
  }
}
