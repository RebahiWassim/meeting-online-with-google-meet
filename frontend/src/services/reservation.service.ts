// services/reservation.service.ts
// Re-exports from the unified API layer for backward compatibility.
// All reservation API calls should use ../api/reservation.api.ts directly.

export { reservationApi, scheduleApi } from '../api/reservation.api';