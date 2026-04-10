export enum MeetingStatus {
  PENDING   = 'PENDING',    // créé, patient pas encore accepté
  ACCEPTED  = 'ACCEPTED',   // patient a accepté
  REJECTED  = 'REJECTED',   // patient a refusé
  ONGOING   = 'ONGOING',    // en cours
  COMPLETED = 'COMPLETED',  // terminé
  CANCELLED = 'CANCELLED',  // annulé
}