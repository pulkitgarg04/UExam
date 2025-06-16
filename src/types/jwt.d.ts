export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number; // Issued At
  exp?: number; // Expiration Time
}