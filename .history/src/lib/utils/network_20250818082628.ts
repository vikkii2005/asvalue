// src/lib/utils/network.ts
// Network status detection and connection utilities

export type NetworkStatus = 'online' | 'offline' | 'slow' | 'unknown';
export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'wimax' | 'other' | 'unknown';

export interface NetworkInfo {
  status: NetworkStatus;
  type: ConnectionType;
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number; // in Mbps
  rtt?: number; // in milliseconds
  saveData?: boolean;
}

export interface ConnectionQuality {
  speed: 'fast' | 'medium' | 'slow' | 'very-slow';
  reliability: 'excellent' | 'good' | 'fair' | 'poor';
  recommendation: 'optimal' | 'acceptable' | 'limited' | 'unavailable';
}

export class NetworkMonitor {
  private static listeners: Array<(networkInfo: NetworkInfo) => void> = [];
  private static currentStatus: NetworkStatus = 'unknown';
  private static monitoringInterval: number | null = null;

  // Initialize network monitoring
  public static initialize(): void {
    this.updateStatus();
    this.setupEventListeners();
    this.startPeriodicChecks();
  }

  // Get current network information
  public static getNetworkInfo(): NetworkInfo {
    const navigator = window.navigator;
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    const networkInfo: NetworkInfo = {
      status: this.currentStatus,
      type: this.getConnectionType(connection),
    };

    if (connection) {
      if (connection.effectiveType) {
        networkInfo.effectiveType = connection.effectiveType;
      }
      if (typeof connection.downlink === 'number') {
        networkInfo.downlink = connection.downlink;
      }
      if (typeof connection.rtt === 'number') {
        networkInfo.rtt = connection.rtt;
      }
      if (typeof connection.saveData === 'boolean') {
        networkInfo.saveData = connection.saveData;
      }
    }

    return networkInfo;
  }

  // Check if currently online
  public static isOnline(): boolean {
    return this.currentStatus === 'online';
  }

  // Check if currently offline
  public static isOffline(): boolean {
    return this.currentStatus === 'offline';
  }

  // Get connection quality assessment
  public static getConnectionQuality(): ConnectionQuality {
    const networkInfo = this.getNetworkInfo();
    
    let speed: ConnectionQuality['speed'] = 'medium';
    let reliability: ConnectionQuality['reliability'] = 'good';
    let recommendation: ConnectionQuality['recommendation'] = 'acceptable';

    if (networkInfo.status === 'offline') {
      return {
        speed: 'very-slow',
        reliability: 'poor',
        recommendation: 'unavailable'
      };
    }

    // Assess speed based on effective type and downlink
    if (networkInfo.effectiveType) {
      switch (networkInfo.effectiveType) {
        case 'slow-2g':
          speed = 'very-slow';
          break;
        case '2g':
          speed = 'slow';
          break;
        case '3g':
          speed = 'medium';
          break;
        case '4g':
          speed = 'fast';
          break;
      }
    }

    // Refine based on downlink speed
    if (networkInfo.downlink !== undefined) {
      if (networkInfo.downlink < 0.5) {
        speed = 'very-slow';
      } else if (networkInfo.downlink < 1.5) {
        speed = 'slow';
      } else if (networkInfo.downlink < 10) {
        speed = 'medium';
      } else {
        speed = 'fast';
      }
    }

    // Assess reliability based on RTT
    if (networkInfo.rtt !== undefined) {
      if (networkInfo.rtt < 100) {
        reliability = 'excellent';
      } else if (networkInfo.rtt < 300) {
        reliability = 'good';
      } else if (networkInfo.rtt < 1000) {
        reliability = 'fair';
      } else {
        reliability = 'poor';
      }
    }

    // Generate recommendation
    if (speed === 'fast' && reliability === 'excellent') {
      recommendation = 'optimal';
    } else if (speed === 'very-slow' || reliability === 'poor') {
      recommendation = 'limited';
    } else {
      recommendation = 'acceptable';
    }

    return { speed, reliability, recommendation };
  }

  // Test actual connection speed
  public static async testConnectionSpeed(): Promise<{ downloadSpeed: number; latency: number }> {
    const testStartTime = performance.now();
    
    try {
      // Test with a small image to measure speed
      const testUrl = '/favicon.ico?' + Date.now(); // Cache busting
      const response = await fetch(testUrl, { cache: 'no-cache' });
      
      if (!response.ok) {
        throw new Error('Test request failed');
      }

      const testEndTime = performance.now();
      const latency = testEndTime - testStartTime;
      
      // Get response size if available
      const contentLength = response.headers.get('content-length');
      const sizeBytes = contentLength ? parseInt(contentLength, 10) : 1024; // Default estimate
      
      // Calculate download speed in Mbps
      const timeDiff = latency / 1000; // Convert to seconds
      const downloadSpeed = (sizeBytes * 8) / (timeDiff * 1000000); // Convert to Mbps

      return {
        downloadSpeed: Math.round(downloadSpeed * 100) / 100,
        latency: Math.round(latency)
      };
    } catch (error) {
      console.error('Connection speed test failed:', error);
      return {
        downloadSpeed: 0,
        latency: -1
      };
    }
  }

  // Add network status listener
  public static addListener(callback: (networkInfo: NetworkInfo) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Wait for network to be online
  public static async waitForOnline(timeout = 30000): Promise<boolean> {
    if (this.isOnline()) {
      return true;
    }

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        cleanup();
        resolve(false);
      }, timeout);

      const unsubscribe = this.addListener((networkInfo) => {
        if (networkInfo.status === 'online') {
          cleanup();
          resolve(true);
        }
      });

      const cleanup = () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    });
  }

  // Check if connection is suitable for specific operations
  public static isSuitableForOperation(operation: 'auth' | 'upload' | 'stream' | 'basic'): boolean {
    const quality = this.getConnectionQuality();
    const networkInfo = this.getNetworkInfo();

    if (networkInfo.status === 'offline') {
      return false;
    }

    switch (operation) {
      case 'auth':
        // Authentication requires at least a working connection
        return quality.recommendation !== 'unavailable';
      
      case 'upload':
        // File uploads need decent speed and reliability
        return quality.speed !== 'very-slow' && quality.reliability !== 'poor';
      
      case 'stream':
        // Streaming requires fast, reliable connection
        return quality.speed === 'fast' && quality.reliability === 'excellent';
      
      case 'basic':
        // Basic operations work with any connection
        return quality.recommendation !== 'unavailable';
      
      default:
        return true;
    }
  }

  // Private methods
  private static updateStatus(): void {
    const previousStatus = this.currentStatus;
    
    if (navigator.onLine === false) {
      this.currentStatus = 'offline';
    } else {
      this.currentStatus = 'online';
    }

    // Notify listeners if status changed
    if (previousStatus !== this.currentStatus) {
      this.notifyListeners();
    }
  }

  private static setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.currentStatus = 'online';
        this.notifyListeners();
      });

      window.addEventListener('offline', () => {
        this.currentStatus = 'offline';
        this.notifyListeners();
      });

      // Listen for connection changes
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      if (connection) {
        connection.addEventListener('change', () => {
          this.notifyListeners();
        });
      }
    }
  }

  private static startPeriodicChecks(): void {
    // Check connection status every 30 seconds
    this.monitoringInterval = window.setInterval(() => {
      this.updateStatus();
    }, 30000);
  }

  private static notifyListeners(): void {
    const networkInfo = this.getNetworkInfo();
    this.listeners.forEach(callback => {
      try {
        callback(networkInfo);
      } catch (error) {
        console.error('Network listener error:', error);
      }
    });
  }

  private static getConnectionType(connection: any): ConnectionType {
    if (!connection || !connection.type) {
      return 'unknown';
    }

    const type = connection.type.toLowerCase();
    
    if (['wifi', 'ethernet', 'cellular', 'bluetooth', 'wimax'].includes(type)) {
      return type as ConnectionType;
    }
    
    return 'other';
  }

  // Cleanup when no longer needed
  public static cleanup(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.listeners = [];
  }
}

// Convenience exports
export const initializeNetworkMonitor = () => NetworkMonitor.initialize();
export const getNetworkInfo = () => NetworkMonitor.getNetworkInfo();
export const isOnline = () => NetworkMonitor.isOnline();
export const isOffline = () => NetworkMonitor.isOffline();
export const getConnectionQuality = () => NetworkMonitor.getConnectionQuality();
export const testConnectionSpeed = () => NetworkMonitor.testConnectionSpeed();
export const waitForOnline = (timeout?: number) => NetworkMonitor.waitForOnline(timeout);
export const isSuitableForAuth = () => NetworkMonitor.isSuitableForOperation('auth');
export const addNetworkListener = (callback: (networkInfo: NetworkInfo) => void) => 
  NetworkMonitor.addListener(callback);