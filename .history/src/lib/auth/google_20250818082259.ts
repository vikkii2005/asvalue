// src/lib/auth/google.ts
// Google OAuth utility functions

import { getGoogleConfig } from './oauth-config';

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
  error?: string;
}

export async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<GoogleTokenResponse> {
  const config = getGoogleConfig();
  const url = 'https://oauth2.googleapis.com/token';

  const params = new URLSearchParams({
    client_id: config.clientId,
    code,
    code_verifier: codeVerifier,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(url, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.json() as Promise<GoogleTokenResponse>;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.json() as Promise<GoogleUserInfo>;
}