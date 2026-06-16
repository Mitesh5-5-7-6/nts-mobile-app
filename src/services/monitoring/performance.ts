import { logger } from './logger';

class PerformanceMonitor {
  private marks: Record<string, number> = {};

  // Track Startup and Load times
  startMark(name: string) {
    this.marks[name] = Date.now();
  }

  endMark(name: string, customData?: Record<string, any>) {
    const startTime = this.marks[name];
    if (!startTime) {
      logger.warn(`Performance mark '${name}' ended without being started.`);
      return;
    }

    const duration = Date.now() - startTime;
    delete this.marks[name];

    // Log the performance metric
    logger.info(`Performance [${name}]: ${duration}ms`, customData);

    // If using Firebase Performance or Sentry Tracing, record it there as well.
    // Example: Sentry.addBreadcrumb({ category: 'performance', message: `[${name}]: ${duration}ms` });
    return duration;
  }

  // Example specific trackers
  trackApiCall(endpoint: string, duration: number) {
    logger.info(`API Response Time [${endpoint}]: ${duration}ms`);
  }

  trackScreenLoad(screenName: string, duration: number) {
    logger.info(`Screen Load Time [${screenName}]: ${duration}ms`);
  }
}

export const performanceMonitor = new PerformanceMonitor();
