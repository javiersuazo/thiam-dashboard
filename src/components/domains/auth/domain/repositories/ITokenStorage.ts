export interface TokenData {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface ITokenStorage {
  save(tokens: TokenData): Promise<void>
  getAccessToken(): Promise<string | null>
  getRefreshToken(): Promise<string | null>
  clear(): Promise<void>
  exists(): Promise<boolean>
}
