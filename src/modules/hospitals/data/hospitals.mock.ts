import { Hospital } from '../interfaces/hospital.interface';

/** Temporary seed data — remove when HospitalsRepository + DB are added. */
export const HOSPITALS_MOCK: Hospital[] = [
  {
    id: '1',
    name: 'City Hospital',
    city: 'New York',
    state: 'NY',
    averageRating: 4.5,
  },
  {
    id: '2',
    name: 'Riverside Medical Center',
    city: 'Boston',
    state: 'MA',
    averageRating: 4.2,
  },
];
