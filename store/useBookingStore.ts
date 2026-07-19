import { create } from "zustand";

interface Booking {
    id: string;
    services: string[];
    totalAmount: number;
}

interface BookingState {
    bookings: Booking[];
    addBooking: (booking: Booking) => void;
    removeBooking: (id: string) => void;
    clearBookings: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
    bookings: [],
    addBooking: (booking) =>
        set((state) => ({
            bookings: [...state.bookings, booking],
        })),
    removeBooking: (id) =>
        set((state) => ({
            bookings: state.bookings.filter((booking) => booking.id !== id),
        })),
    clearBookings: () => set({ bookings: [] }),
}));
