// ⚠️ Phase 1: Core infrastructure exports
export * from './core/constants';
export * from './core/types';
export { refreshBackendJwt } from './core/client';

// ⚠️ Phase 2: Auth module exports
export {
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  registerChild,
  registerUser,
} from './auth';

// TODO: Add users, teams, games, etc. exports in later phases
