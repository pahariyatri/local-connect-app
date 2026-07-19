/**
 * Single source of truth for mapping UI/trip plan → backend discover/prep API.
 * Use this whenever calling discover or prep so destinations and types stay in sync.
 */

/** Destination IDs sent to backend (must match address.city in DB). Same as DestinationSelector ids. */
export const BACKEND_DESTINATION_IDS = [
  'manali',
  'shimla',
  'kasol',
  'dharamshala',
  'tirthan',
  'spiti',
] as const;

export type BackendDestinationId = (typeof BACKEND_DESTINATION_IDS)[number];

/**
 * The four UI types users can select (single or multiple) in the builder.
 * Id is stored in servicePreferences and mapped to backend vendor type.
 */
export const SERVICE_INTEREST_IDS = ['stay', 'activity', 'travel', 'food'] as const;
export type ServicePreferenceId = (typeof SERVICE_INTEREST_IDS)[number];

/** Default UI labels for each type (dict can override for i18n). */
export const SERVICE_INTEREST_LABELS: Record<ServicePreferenceId, string> = {
  stay: 'Unique Stays',
  activity: 'Adventures',
  travel: 'Local Transport',
  food: 'Culinary',
};

/** UI preference (builder step) → backend vendor type */
export const PREFERENCE_TO_VENDOR_TYPE: Record<ServicePreferenceId, string> = {
  stay: 'hotel',
  travel: 'transport',
  activity: 'adventure',
  food: 'restaurant',
};

/** Backend category name (if ever sent) → backend vendor type */
export const CATEGORY_TO_VENDOR_TYPE: Record<string, string> = {
  Accommodation: 'hotel',
  'Tours and Activities': 'adventure',
  Activities: 'adventure',
  Transportation: 'transport',
  'Food & Dining': 'restaurant',
};

/** All vendor types for "no filter" (show all). */
export const ALL_VENDOR_TYPES = ['hotel', 'transport', 'adventure', 'restaurant'] as const;

/** Backend vendor type → UI preference id */
export const VENDOR_TYPE_TO_PREFERENCE: Record<string, ServicePreferenceId> = {
  hotel: 'stay',
  transport: 'travel',
  adventure: 'activity',
  restaurant: 'food',
};

export interface TripPlanForApi {
  destinations: string[];
  servicePreferences?: string[];
  guestCount?: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface DiscoveryParamsForApi {
  destinations: string[];
  vendorTypes: string[];
  travelers?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Build API params from trip plan. Use this for every discover/prep call.
 * - destinations: passed as-is (manali, shimla, ... = backend address.city)
 * - vendorTypes: from servicePreferences (stay→hotel, etc.) or all four if none selected
 * - travelers, startDate, endDate: passed through when present
 */
export function buildDiscoveryParams(plan: TripPlanForApi): DiscoveryParamsForApi {
  const {
    destinations,
    servicePreferences = [],
    guestCount,
    startDate,
    endDate,
  } = plan;

  const vendorTypes =
    servicePreferences.length > 0
      ? servicePreferences
          .map((p) => PREFERENCE_TO_VENDOR_TYPE[p])
          .filter((t): t is string => Boolean(t))
      : [...ALL_VENDOR_TYPES];

  const params: DiscoveryParamsForApi = {
    destinations: destinations.filter((d) => d && d !== 'null' && d !== 'undefined'),
    vendorTypes,
  };
  if (guestCount != null && !isNaN(guestCount) && guestCount > 0) {
    params.travelers = guestCount;
  }
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  return params;
}
