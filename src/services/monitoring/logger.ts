import * as Sentry from '@sentry/react-native';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.debug(`[DEBUG] ${message}`, ...args);
          break;
        case 'info':
          console.info(`[INFO] ${message}`, ...args);
          break;
        case 'warn':
          console.warn(`[WARN] ${message}`, ...args);
          break;
        case 'error':
          console.error(`[ERROR] ${message}`, ...args);
          break;
      }
    }

    // Always send warnings and errors to Sentry
    if (level === 'error') {
      this.sendToSentry(message, 'error', args);
    } else if (level === 'warn') {
      this.sendToSentry(message, 'warning', args);
    }
  }

  private sendToSentry(message: string, level: Sentry.SeverityLevel, args: any[]) {
    Sentry.withScope((scope) => {
      scope.setLevel(level);
      if (args && args.length > 0) {
        scope.setExtra('additionalInfo', args);
      }
      Sentry.captureMessage(message);
    });
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, error?: any, ...args: any[]) {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, ...args);
    }
    
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setExtra('context', message);
        if (args.length > 0) scope.setExtra('additionalInfo', args);
        Sentry.captureException(error);
      });
    } else {
      this.log('error', message, error, ...args);
    }
  }
}

export const logger = new Logger();
