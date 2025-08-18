// src/lib/auth/oauth-config.ts
// Enhanced OAuth configuration (FIXED VERSION)

interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scope: string[];
  responseType: string;
  accessType: string;
  prompt: string;
  includeGrantedScopes?: boolean;
  state?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
}

interface ProviderConfig {
  google: OAuthConfig;
}

export class OAuthConfigManager {
  private config: ProviderConfig;
  private environment: 'development' | 'staging' | 'production';

  constructor() {
    this.environment = this.determineEnvironment(); // ✅ FIXED: Renamed to avoid duplicate
    this.config = this.initializeConfig();
    this.validateConfig();
  }

  // ✅ FIXED: Renamed from getEnvironment to determineEnvironment
  private determineEnvironment(): 'development' | 'staging' | 'production' {
    if (typeof window === 'undefined') {
      return process.env.NODE_ENV === 'production' ? 'production' : 'development';
    }
    
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    } else if (hostname.includes('staging') || hostname.includes('dev')) {
      return 'staging';
    }
    return 'production';
  }

  private initializeConfig(): ProviderConfig {
    const baseUrl = this.getBaseUrl();
    
    return {
      google: {
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: `${baseUrl}/auth/callback`,
        scope: [
          'openid',
          'email',
          'profile'
        ],
        responseType: 'code',
        accessType: 'offline',
        prompt: 'select_account',
        includeGrantedScopes: true,
        codeChallengeMethod: 'S256'
      }
    };
  }

  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    
    switch (this.environment) {
      case 'production':
        return process.env.NEXTAUTH_URL || 'https://asvalue.com';
      case 'staging':
        return process.env.STAGING_URL || 'https://staging.asvalue.com';
      default:
        return process.env.NEXTAUTH_URL || 'http://localhost:3000';
    }
  }

  private validateConfig(): void {
    const { google } = this.config;
    
    if (!google.clientId) {
      throw new Error('Google Client ID is required. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable.');
    }
    
    if (this.environment === 'production' && !google.clientSecret) {
      console.warn('Google Client Secret is recommended for production environments.');
    }
    
    if (!google.redirectUri.startsWith('https://') && this.environment === 'production') {
      throw new Error('HTTPS is required for OAuth redirect URIs in production.');
    }
    
    console.log(`✅ OAuth configuration validated for ${this.environment} environment`);
  }

  public getConfig(provider: keyof ProviderConfig): OAuthConfig {
    const config = this.config[provider];
    if (!config) {
      throw new Error(`OAuth configuration not found for provider: ${provider}`);
    }
    return { ...config };
  }

  public buildAuthUrl(provider: keyof ProviderConfig, state: string, codeChallenge?: string): string {
    const config = this.getConfig(provider);
    
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: config.responseType,
      scope: config.scope.join(' '),
      access_type: config.accessType,
      prompt: config.prompt,
      state: state,
      ...(config.includeGrantedScopes && { include_granted_scopes: 'true' }),
      ...(codeChallenge && config.codeChallengeMethod && {
        code_challenge: codeChallenge,
        code_challenge_method: config.codeChallengeMethod
      })
    });

    const authUrls = {
      google: 'https://accounts.google.com/o/oauth2/v2/auth'
    };

    const baseAuthUrl = authUrls[provider];
    if (!baseAuthUrl) {
      throw new Error(`Auth URL not configured for provider: ${provider}`);
    }

    const fullUrl = `${baseAuthUrl}?${params.toString()}`;
    console.log(`🔗 Built OAuth URL for ${provider}:`, fullUrl.substring(0, 100) + '...');
    
    return fullUrl;
  }

  public getTokenEndpoint(provider: keyof ProviderConfig): string {
    const tokenEndpoints = {
      google: 'https://oauth2.googleapis.com/token'
    };

    const endpoint = tokenEndpoints[provider];
    if (!endpoint) {
      throw new Error(`Token endpoint not configured for provider: ${provider}`);
    }

    return endpoint;
  }

  public getUserInfoEndpoint(provider: keyof ProviderConfig): string {
    const userInfoEndpoints = {
      google: 'https://www.googleapis.com/oauth2/v2/userinfo'
    };

    const endpoint = userInfoEndpoints[provider];
    if (!endpoint) {
      throw new Error(`User info endpoint not configured for provider: ${provider}`);
    }

    return endpoint;
  }

  public updateConfig(provider: keyof ProviderConfig, updates: Partial<OAuthConfig>): void {
    if (!this.config[provider]) {
      throw new Error(`Provider ${provider} not found in configuration`);
    }

    this.config[provider] = {
      ...this.config[provider],
      ...updates
    };

    console.log(`✅ Updated OAuth configuration for ${provider}`);
  }

  // ✅ FIXED: Renamed from getEnvironment to getCurrentEnvironment to avoid duplicate
  public getCurrentEnvironment(): 'development' | 'staging' | 'production' {
    return this.environment;
  }

  public isProduction(): boolean {
    return this.environment === 'production';
  }

  public isDevelopment(): boolean {
    return this.environment === 'development';
  }

  public getRedirectUri(provider: keyof ProviderConfig): string {
    return this.getConfig(provider).redirectUri;
  }

  public getSupportedProviders(): Array<keyof ProviderConfig> {
    return Object.keys(this.config) as Array<keyof ProviderConfig>;
  }
}

// Singleton instance
export const oauthConfig = new OAuthConfigManager();

// Convenience exports
export const getGoogleConfig = () => oauthConfig.getConfig('google');
export const buildGoogleAuthUrl = (state: string, codeChallenge?: string) => 
  oauthConfig.buildAuthUrl('google', state, codeChallenge);
export const getGoogleTokenEndpoint = () => oauthConfig.getTokenEndpoint('google');
export const getGoogleUserInfoEndpoint = () => oauthConfig.getUserInfoEndpoint('google');

// Type exports
export type { OAuthConfig, ProviderConfig };