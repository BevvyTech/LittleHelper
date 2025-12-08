import { type IOAuthGateway, type OAuthUserInfo } from '../../application/ports/gateways/IOAuthGateway.js';
import { createExternalServiceError } from '@littlehelper/shared';

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export class OAuthGoogleGateway implements IOAuthGateway {
  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string
  ) {}

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw createExternalServiceError('Google OAuth', `Token exchange failed: ${error}`);
    }

    const data = (await response.json()) as GoogleTokenResponse;
    return data.access_token;
  }

  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw createExternalServiceError('Google OAuth', 'Failed to fetch user info');
    }

    const data = (await response.json()) as GoogleUserInfo;

    return {
      email: data.email,
      name: data.name ?? null,
      avatarUrl: data.picture ?? null,
    };
  }
}
