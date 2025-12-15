// Core infrastructure
export * from './core/constants';
export * from './core/types';
export { refreshBackendJwt } from './core/client';

// Auth
export {
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  registerChild,
  registerUser,
} from './auth';

// Locations
export {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getCourts,
  createCourt,
  updateCourt,
  deleteCourt,
} from './locations';

// Practices
export {
  createPractice,
  createRecurringPractice,
  getPracticePrograms,
} from './practices';

// Barber / haircuts
export {
  getHaircutAndBarberServices,
  createHaircutBooking,
  getUpcomingBookings,
  getBarberAvailability,
} from './barber';

// Events
export {
  getEventEnrollmentOptions,
  enrollEventWithCredits,
} from './events';

// Teams
export {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getExternalTeams,
  createExternalTeam,
} from './teams';

// Games
export {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
} from './games';

// Memberships, credits, subsidies
export {
  getCreditPackages,
  getAllMembershipPlans,
  getUserMemberships,
  getMembershipPlans,
  getPlansForMembership,
  purchaseMembershipPlan,
  purchaseCreditPackage,
  getMembershipByCustomerId,
  getUserCredits,
  getUserSubsidies,
  getUserSubsidyBalance,
  getUserSubsidyUsage,
} from './membership';

// Users / waivers
export {
  deleteUserAccount,
  uploadWaiver,
  getUserWaivers,
  type Waiver,
} from './users';
