export class PerformanceMonitor {
    private metrics: Map<string, number> = new Map();
  
    startTimer(metricName: string) {
      this.metrics.set(metricName, performance.now());
    }
  
    endTimer(metricName: string) {
      const startTime = this.metrics.get(metricName);
      if (startTime) {
        const duration = performance.now() - startTime;
        console.log(`Metric ${metricName}: ${duration.toFixed(2)}ms`);
        // In a real implementation, you'd want to store this metric for later analysis
      }
    }
  }
  