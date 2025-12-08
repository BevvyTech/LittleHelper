export interface OAuthUserInfo {
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface IOAuthGateway {
  getAuthorizationUrl(state: string): string;
  exchangeCodeForToken(code: string): Promise<string>;
  getUserInfo(accessToken: string): Promise<OAuthUserInfo>;
}
