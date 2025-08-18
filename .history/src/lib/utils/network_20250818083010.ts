// src/lib/utils/network.ts

export type NetworkStatus = 'online' | 'offline' | 'slow' | 'unknown';
export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'wimax' | 'other' | 'unknown';

export interface NetworkInfo {
  status: NetworkStatus;
  type: ConnectionType;
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export interface ConnectionQuality {
  speed: 'fast' | 'medium' | 'slow' | 'very-slow';
  reliability: 'excellent' | 'good' | 'fair' | 'poor';
  recommendation: 'optimal' | 'acceptable' | 'limited' | 'unavailable';
}

type NavConn = {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (event: string, cb: () => void) => void;
};

export class NetworkMonitor {
  private static listeners: Array<(networkInfo: NetworkInfo) => void> = [];
  private static currentStatus: NetworkStatus = 'unknown';
  private static monitoringInterval: number | null = null;

  public static initialize(): void {
    this.updateStatus();
    this.setupEventListeners();
    this.startPeriodicChecks();
  }

  public static getNetworkInfo(): NetworkInfo {
    const connection: NavConn | undefined =
      (navigator as unknown as { connection?: NavConn }).connection ||
      (navigator as unknown as { mozConnection?: NavConn }).mozConnection ||
      (navigator as unknown as { webkitConnection?: NavConn }).webkitConnection;

    const info: NetworkInfo = {
      status: this.currentStatus,
      type: this.getConnectionType(connection),
    };
    if (connection?.effectiveType) info.effectiveType = connection.effectiveType as NetworkInfo['effectiveType'];
    if (typeof connection?.downlink === 'number') info.downlink = connection.downlink;
    if (typeof connection?.rtt === 'number') info.rtt = connection.rtt;
    if (typeof connection?.saveData === 'boolean') info.saveData = connection.saveData;
    return info;
  }

  public static isOnline(): boolean {
    return this.currentStatus === 'online';
  }
  public static isOffline(): boolean {
    return this.currentStatus === 'offline';
  }

  public static getConnectionQuality(): ConnectionQuality {
    const networkInfo = this.getNetworkInfo();
    let speed: ConnectionQuality['speed'] = 'medium';
    let reliability: ConnectionQuality['reliability'] = 'good';
    let recommendation: ConnectionQuality['recommendation'] = 'acceptable';
    if (networkInfo.status === 'offline') {
      return { speed: 'very-slow', reliability: 'poor', recommendation: 'unavailable' };
    }
    if (networkInfo.effectiveType) {
      switch (networkInfo.effectiveType) {
        case 'slow-2g': speed = 'very-slow'; break;
        case '2g': speed = 'slow'; break;
        case '3g': speed = 'medium'; break;
        case '4g': speed = 'fast'; break;
      }
    }
    if (networkInfo.downlink !== undefined) {
      if (networkInfo.downlink < 0.5) speed = 'very-slow';
      else if (networkInfo.downlink < 1.5) speed = 'slow';
      else if (networkInfo.downlink < 10) speed = 'medium';
      else speed = 'fast';
    }
    if (networkInfo.rtt !== undefined) {
      if (networkInfo.rtt < 100) reliability = 'excellent';
      else if (networkInfo.rtt < 300) reliability = 'good';
      else if (networkInfo.rtt < 1000) reliability = 'fair';
      else reliability = 'poor';
    }
    if (speed === 'fast' && reliability === 'excellent') recommendation = 'optimal';
    else if (speed === 'very-slow' || reliability === 'poor') recommendation = 'limited';
    else recommendation = 'acceptable';
    return { speed, reliability, recommendation };
  }

  public static async testConnectionSpeed(): Promise<{ downloadSpeed: number; latency: number }> {
    const testStartTime = performance.now();
    try {
      const testUrl = '/favicon.ico?' + Date.now();
      const response = await fetch(testUrl, { cache: 'no-cache' });
      if (!response.ok) throw new Error('Test request failed');
      const testEndTime = performance.now();
      const latency = testEndTime - testStartTime;
      const contentLength = response.headers.get('content-length');
      const sizeBytes = contentLength ? parseInt(contentLength, 10) : 1024;
      const timeDiff = latency / 1000;
      const downloadSpeed = (sizeBytes * 8) / (timeDiff * 1000000);
      return { downloadSpeed: Math.round(downloadSpeed * 100) / 100, latency: Math.round(latency) };
    } catch {
      return { downloadSpeed: 0, latency: -1 };
    }
  }

  public static addListener(callback: (networkInfo: NetworkInfo) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  public static async waitForOnline(timeout = 30000): Promise<boolean> {
    if (this.isOnline()) return true;
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => { cleanup(); resolve(false); }, timeout);
      const unsubscribe = this.addListener((networkInfo) => {
        if (networkInfo.status === 'online') {
          cleanup();
          resolve(true);
        }
      });
      const cleanup = () => { clearTimeout(timeoutId); unsubscribe(); };
    });
  }

  public static isSuitableForOperation(operation: 'auth' | 'upload' | 'stream' | 'basic'): boolean {
    const quality = this.getConnectionQuality();
    const networkInfo = this.getNetworkInfo();
    if (networkInfo.status === 'offline') return false;
    switch (operation) {
      case 'auth': return quality.recommendation !== 'unavailable';
      case 'upload': return quality.speed !== 'very-slow' && quality.reliability !== 'poor';
      case 'stream': return quality.speed === 'fast' && quality.reliability === 'excellent';
      case 'basic': return quality.recommendation !== 'unavailable';
      default: return true;
    }
  }

  private static updateStatus(): void {
    const previousStatus = this.currentStatus;
    this.currentStatus = navigator.onLine === false ? 'offline' : 'online';
    if (previousStatus !== this.currentStatus) this.notifyListeners();
  }

  private static setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.currentStatus = 'online'; this.notifyListeners();
      });
      window.addEventListener('offline', () => {
        this.currentStatus = 'offline'; this.notifyListeners();
      });
      const connection: NavConn | undefined =
        (navigator as unknown as { connection?: NavConn }).connection ||
        (navigator as unknown as { mozConnection?: NavConn }).mozConnection ||
        (navigator as unknown as { webkitConnection?: NavConn }).webkitConnection;
      if (connection?.addEventListener) {
        connection.addEventListener('change', () => { this.notifyListeners(); });
      }
    }
  }

  private static startPeriodicChecks(): void {
    this.monitoringInterval = window.setInterval(() => { this.updateStatus(); }, 30000);
  }

  private static notifyListeners(): void {
    const networkInfo = this.getNetworkInfo();
    this.listeners.forEach(callback => {
      try { callback(networkInfo); } catch (error) { /* ignore */ }
    });
  }

  private static getConnectionType(connection?: NavConn): ConnectionType {
    if (!connection || !connection.type) return 'unknown';
    const type = connection.type.toLowerCase();
    if (
      type === 'wifi' ||
      type === 'ethernet' ||
      type === 'cellular' ||
      type === 'bluetooth' ||
      type === 'wimax'
    ) return type as ConnectionType;
    return 'other';
  }

  public static cleanup(): void {
    if (this.monitoringInterval) clearInterval(this.monitoringInterval);
    this.monitoringInterval = null;
    this.listeners = [];
  }
}

export const initializeNetworkMonitor = () => NetworkMonitor.initialize();
export const getNetworkInfo = () => NetworkMonitor.getNetworkInfo();
export const isOnline = () => NetworkMonitor.isOnline();
export const isOffline = () => NetworkMonitor.isOffline();
export const getConnectionQuality = () => NetworkMonitor.getConnectionQuality();
export const testConnectionSpeed = () => NetworkMonitor.testConnectionSpeed();
export const waitForOnline = (timeout?: number) => NetworkMonitor.waitForOnline(timeout);
export const isSuitableForAuth = () => NetworkMonitor.isSuitableForOperation('auth');
export const addNetworkListener = (cb: (networkInfo: NetworkInfo) => void) => NetworkMonitor.addListener(cb);