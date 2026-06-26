export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
}

export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  email: string;
  role: string;
}
