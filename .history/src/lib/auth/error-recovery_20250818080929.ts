// src/lib/auth/error-recovery.ts
// Advanced error handling logic (FIXED VERSION)

export interface AuthError {
  type: 'network' | 'timeout' | 'config' | 'security' | 'server' | 'user_cancelled' | 'rate_limited' | 'unknown';
  message: string;
  code?: string;
  retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface RetryStrategy {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

export class AuthErrorRecovery {
  private retryAttempts: Map<string, number> = new Map();
  private lastErrors: Map<string, AuthError> = new Map();

  private defaultRetryStrategy: RetryStrategy = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true
  };

  public classifyError(error: unknown, context?: Record<string, unknown>): AuthError {
    const timestamp = new Date();
    
    if (this.isNetworkError(error)) {
      return {
        type: 'network',
        message: 'Network connection failed. Please check your internet connection.',
        retryable: true,
        severity: 'medium',
        timestamp,
        context
      };
    }

    if (this.isTimeoutError(error)) {
      return {
        type: 'timeout',
        message: 'Request timed out. Please try again.',
        retryable: true,
        severity: 'medium',
        timestamp,
        context
      };
    }

    if (this.isConfigError(error)) {
      return {
        type: 'config',
        message: 'Authentication configuration error. Please contact support.',
        retryable: false,
        severity: 'critical',
        timestamp,
        context
      };
    }

    if (this.isSecurityError(error)) {
      return {
        type: 'security',
        message: 'Security validation failed. Please start a new authentication attempt.',
        retryable: false,
        severity: 'high',
        timestamp,
        context
      };
    }

    if (this.isRateLimitedError(error)) {
      return {
        type: 'rate_limited',
        message: 'Too many requests. Please wait before trying again.',
        retryable: true,
        severity: 'medium',
        timestamp,
        context
      };
    }

    if (this.isServerError(error)) {
      return {
        type: 'server',
        message: 'Server error occurred. Please try again later.',
        retryable: true,
        severity: 'high',
        timestamp,
        context
      };
    }

    if (this.isUserCancelledError(error)) {
      return {
        type: 'user_cancelled',
        message: 'Authentication was cancelled.',
        retryable: true,
        severity: 'low',
        timestamp,
        context
      };
    }

    return {
      type: 'unknown',
      message: this.extractErrorMessage(error) || 'An unexpected error occurred.', // ✅ FIXED: Renamed to avoid duplicate
      retryable: true,
      severity: 'medium',
      timestamp,
      context
    };
  }

  public shouldRetry(error: AuthError, attemptKey: string): boolean {
    if (!error.retryable) {
      return false;
    }

    const attempts = this.retryAttempts.get(attemptKey) || 0;
    const strategy = this.getRetryStrategyForError(error);
    
    return attempts < strategy.maxAttempts;
  }

  public calculateRetryDelay(error: AuthError, attemptKey: string): number {
    const attempts = this.retryAttempts.get(attemptKey) || 0;
    const strategy = this.getRetryStrategyForError(error);
    
    let delay = strategy.initialDelay * Math.pow(strategy.backoffMultiplier, attempts);
    delay = Math.min(delay, strategy.maxDelay);
    
    if (strategy.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.floor(delay);
  }

  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    attemptKey: string,
    onError?: (error: AuthError, attempt: number) => void
  ): Promise<T> {
    let lastError: AuthError;
    
    for (let attempt = 0; attempt < this.defaultRetryStrategy.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        this.retryAttempts.delete(attemptKey);
        this.lastErrors.delete(attemptKey);
        
        return result;
      } catch (error) {
        lastError = this.classifyError(error, { attempt, attemptKey });
        this.lastErrors.set(attemptKey, lastError);
        
        console.log(`🔄 Attempt ${attempt + 1} failed:`, lastError.message);
        
        if (onError) {
          onError(lastError, attempt + 1);
        }
        
        if (!lastError.retryable) {
          break;
        }
        
        if (attempt === this.defaultRetryStrategy.maxAttempts - 1) {
          break;
        }
        
        this.retryAttempts.set(attemptKey, attempt + 1);
        
        const delay = this.calculateRetryDelay(lastError, attemptKey);
        console.log(`⏰ Waiting ${delay}ms before retry...`);
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }

  // ✅ FIXED: Renamed from getErrorMessage to getUserFriendlyMessage to avoid duplicate
  public getUserFriendlyMessage(authError: AuthError): string {
    const messages: Record<AuthError['type'], string> = {
      network: 'Unable to connect. Please check your internet connection and try again.',
      timeout: 'The request took too long. Please try again with a better connection.',
      config: 'There\'s a configuration issue. Please contact our support team.',
      security: 'Security check failed. Please start a new sign-in attempt.',
      server: 'Our servers are experiencing issues. Please try again in a few minutes.',
      user_cancelled: 'Sign-in was cancelled. Click "Try Again" to restart.',
      rate_limited: 'Too many attempts. Please wait a moment before trying again.',
      unknown: 'Something unexpected happened. Please try again or contact support.'
    };

    return messages[authError.type] || authError.message;
  }

  public getRecoverySteps(authError: AuthError): string[] {
    const steps: Record<AuthError['type'], string[]> = {
      network: [
        'Check your internet connection',
        'Try switching between WiFi and mobile data',
        'Disable VPN if active',
        'Restart your router if needed'
      ],
      timeout: [
        'Ensure stable internet connection',
        'Close other bandwidth-heavy applications',
        'Try again with better connection',
        'Clear browser cache and cookies'
      ],
      config: [
        'This is a system configuration issue',
        'Please contact our support team',
        'Provide the error details when contacting support',
        'Try again later as we work to fix the issue'
      ],
      security: [
        'Clear your browser cache and cookies',
        'Start a fresh authentication attempt',
        'Ensure you\'re on the correct website',
        'Contact support if the issue persists'
      ],
      server: [
        'Our servers are experiencing temporary issues',
        'Please try again in a few minutes',
        'Check our status page for updates',
        'Contact support if the problem continues'
      ],
      user_cancelled: [
        'Click "Try Again" to restart the process',
        'Complete the Google authorization when prompted',
        'Ensure you select the correct account',
        'Contact support if you need assistance'
      ],
      rate_limited: [
        'Wait a few minutes before trying again',
        'Avoid rapid repeated attempts',
        'Clear browser cache if needed',
        'Contact support if limits seem excessive'
      ],
      unknown: [
        'Try refreshing the page',
        'Clear browser cache and cookies',
        'Try using a different browser',
        'Contact support with error details'
      ]
    };

    return steps[authError.type] || steps.unknown;
  }

  public clearRetryHistory(attemptKey?: string): void {
    if (attemptKey) {
      this.retryAttempts.delete(attemptKey);
      this.lastErrors.delete(attemptKey);
    } else {
      this.retryAttempts.clear();
      this.lastErrors.clear();
    }
  }

  public getRetryStats(attemptKey: string): { attempts: number; lastError?: AuthError } {
    return {
      attempts: this.retryAttempts.get(attemptKey) || 0,
      lastError: this.lastErrors.get(attemptKey)
    };
  }

  private isNetworkError(error: unknown): boolean {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }
    return this.extractErrorMessage(error).toLowerCase().includes('network');
  }

  private isTimeoutError(error: unknown): boolean {
    const message = this.extractErrorMessage(error).toLowerCase();
    return message.includes('timeout') || message.includes('aborted');
  }

  private isConfigError(error: unknown): boolean {
    const message = this.extractErrorMessage(error).toLowerCase();
    return message.includes('client_id') || 
           message.includes('configuration') ||
           message.includes('invalid_client');
  }

  private isSecurityError(error: unknown): boolean {
    const message = this.extractErrorMessage(error).toLowerCase();
    return message.includes('csrf') || 
           message.includes('state') ||
           message.includes('invalid_grant') ||
           message.includes('security');
  }

  private isRateLimitedError(error: unknown): boolean {
    const message = this.extractErrorMessage(error).toLowerCase();
    return message.includes('rate') || 
           message.includes('limit') ||
           message.includes('too many');
  }

  private isServerError(error: unknown): boolean {
    const message = this.extractErrorMessage(error).toLowerCase();
    return message.includes('server') || 
           message.includes('internal') ||
           message.includes('503') ||
           message.includes('502');
  }

  private isUserCancelledError(error: unknown): boolean {
    const message = this.extractErrorMessage(error).toLowerCase();
    return message.includes('cancelled') || 
           message.includes('denied') ||
           message.includes('user_denied');
  }

  // ✅ FIXED: Renamed from getErrorMessage to extractErrorMessage to avoid duplicate
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message); // ✅ FIXED: Removed 'any' type
    }
    return 'Unknown error';
  }

  private getRetryStrategyForError(error: AuthError): RetryStrategy {
    switch (error.type) {
      case 'network':
      case 'timeout':
        return {
          ...this.defaultRetryStrategy,
          maxAttempts: 5,
          initialDelay: 2000
        };
      case 'rate_limited':
        return {
          ...this.defaultRetryStrategy,
          maxAttempts: 2,
          initialDelay: 10000,
          maxDelay: 30000
        };
      case 'server':
        return {
          ...this.defaultRetryStrategy,
          maxAttempts: 3,
          initialDelay: 5000
        };
      default:
        return this.defaultRetryStrategy;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const authErrorRecovery = new AuthErrorRecovery();

// Convenience functions
export const classifyAuthError = (error: unknown, context?: Record<string, unknown>) => 
  authErrorRecovery.classifyError(error, context);

export const executeWithRetry = <T>(
  operation: () => Promise<T>,
  attemptKey: string,
  onError?: (error: AuthError, attempt: number) => void
) => authErrorRecovery.executeWithRetry(operation, attemptKey, onError);

export const getErrorMessage = (authError: AuthError) => 
  authErrorRecovery.getUserFriendlyMessage(authError);

export const getRecoverySteps = (authError: AuthError) => 
  authErrorRecovery.getRecoverySteps(authError);