export class TokenTTL {
  private constructor(private readonly seconds: number) {}

  static fromExpiresAt(expiresAt: number): TokenTTL {
    const expiresInSeconds = this.calculateTTL(expiresAt)
    return new TokenTTL(expiresInSeconds)
  }

  static fromSeconds(seconds: number): TokenTTL {
    return new TokenTTL(seconds)
  }

  private static calculateTTL(expiresAtTimestamp: number): number {
    if (expiresAtTimestamp > Date.now()) {
      return Math.floor((expiresAtTimestamp - Date.now()) / 1000)
    } else {
      return Math.max(0, expiresAtTimestamp - Math.floor(Date.now() / 1000))
    }
  }

  toSeconds(): number {
    return this.seconds
  }

  toMilliseconds(): number {
    return this.seconds * 1000
  }

  isExpired(): boolean {
    return this.seconds <= 0
  }

  expiresWithin(minutes: number): boolean {
    return this.seconds <= minutes * 60
  }

  toString(): string {
    const minutes = Math.floor(this.seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }
}
