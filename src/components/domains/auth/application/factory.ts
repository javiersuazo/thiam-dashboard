import { ApiAuthRepository } from '../infrastructure/repositories/ApiAuthRepository'
import { ApiPasskeyRepository } from '../infrastructure/repositories/ApiPasskeyRepository'
import { CookieTokenStorage } from '../infrastructure/storage/CookieTokenStorage'
import { IronSessionStorage } from '../infrastructure/storage/IronSessionStorage'
import { LoginUseCase } from './use-cases/LoginUseCase'
import { Verify2FAUseCase } from './use-cases/Verify2FAUseCase'
import { RefreshTokenUseCase } from './use-cases/RefreshTokenUseCase'
import { LogoutUseCase } from './use-cases/LogoutUseCase'
import { RegisterUseCase } from './use-cases/RegisterUseCase'
import { EmailVerificationUseCase } from './use-cases/EmailVerificationUseCase'
import { PasskeyRegistrationUseCase } from './use-cases/PasskeyRegistrationUseCase'
import { PasskeyLoginUseCase } from './use-cases/PasskeyLoginUseCase'
import { PasskeyManagementUseCase } from './use-cases/PasskeyManagementUseCase'

const authRepository = new ApiAuthRepository()
const passkeyRepository = new ApiPasskeyRepository()
const tokenStorage = new CookieTokenStorage()
const sessionStorage = new IronSessionStorage()

export function createLoginUseCase() {
  return new LoginUseCase(authRepository, tokenStorage, sessionStorage)
}

export function createVerify2FAUseCase() {
  return new Verify2FAUseCase(authRepository, tokenStorage, sessionStorage)
}

export function createRefreshTokenUseCase() {
  return new RefreshTokenUseCase(authRepository, tokenStorage, sessionStorage)
}

export function createLogoutUseCase() {
  return new LogoutUseCase(authRepository, tokenStorage, sessionStorage)
}

export function createRegisterUseCase() {
  return new RegisterUseCase(authRepository)
}

export function createEmailVerificationUseCase() {
  return new EmailVerificationUseCase(authRepository)
}

export function createPasskeyRegistrationUseCase() {
  return new PasskeyRegistrationUseCase(passkeyRepository)
}

export function createPasskeyLoginUseCase() {
  return new PasskeyLoginUseCase(passkeyRepository, tokenStorage, sessionStorage)
}

export function createPasskeyManagementUseCase() {
  return new PasskeyManagementUseCase(passkeyRepository)
}
