/**
 * useTripStore — Zustand + persist
 *
 * Replaces TripPlannerContext as the handoff layer between
 * the builder page and the results page. Survives page refresh.
 *
 * TripPlannerContext is kept for all other components that already
 * use it (vendor selections, stops, etc.). This store handles
 * only the plan-level inputs submitted by the builder.
 */
import { create } from 'zustand';
import { ServiceType } from '@/contexts/TripPlannerContext';

interface TripState {
  // Plan inputs (set by builder, read by results)
  origin: string;
  destinations: string[];
  startDate: string | null;
  endDate: string | null;
  guestCount: number;
  servicePreferences: ServiceType[];

  // Derived helpers
  hasValidPlan: () => boolean;

  // Actions
  setTrip: (plan: Partial<Omit<TripState, 'setTrip' | 'reset' | 'hasValidPlan'>>) => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  origin: '',
  destinations: [] as string[],
  startDate: null as string | null,
  endDate: null as string | null,
  guestCount: 2,
  servicePreferences: [] as ServiceType[],
};

// Zustand v5 — persist middleware with localStorage
// We do manual persistence since zustand v5 middleware import changed
function loadFromStorage(): Partial<typeof DEFAULT_STATE> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('lc_trip_plan');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(state: typeof DEFAULT_STATE) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('lc_trip_plan', JSON.stringify(state));
  } catch { /* storage full */ }
}

export const useTripStore = create<TripState>((set, get) => ({
  ...DEFAULT_STATE,
  ...loadFromStorage(),

  hasValidPlan: () => {
    const { destinations, startDate } = get();
    return destinations.length > 0 && !!startDate;
  },

  setTrip: (plan) => {
    set((prev) => {
      const next = { ...prev, ...plan };
      saveToStorage({
        origin: next.origin,
        destinations: next.destinations,
        startDate: next.startDate,
        endDate: next.endDate,
        guestCount: next.guestCount,
        servicePreferences: next.servicePreferences,
      });
      return next;
    });
  },

  reset: () => {
    saveToStorage(DEFAULT_STATE);
    set(DEFAULT_STATE);
  },
}));

export default useTripStore;
