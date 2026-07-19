"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface ItineraryStop {
    id: string;
    day: number;
    time: string; // e.g., "12:00 PM"
    activity: string;
    type: "food" | "stay" | "activity" | "travel" | "other";
    location?: string;
    vendorId?: string;
    price?: number;
    isBooked?: boolean;
}

export type ServiceType = "stay" | "activity" | "travel" | "food";
export type CarType = "sedan" | "suv" | "hatchback" | "auto" | "bike" | "none";

interface TripPlannerContextType {
    origin: string;
    destinations: string[];
    originPoint: string; // e.g., "Chandigarh"
    destinationPoint: string; // e.g., "Manali"
    selectedOriginCity: string; // Selected origin city from dropdown
    selectedDestinationCities: string[]; // Selected destination cities
    distance: number; // in km
    startDate: string;
    endDate: string;
    servicePreferences: ServiceType[];
    carType: CarType | null;
    generatedTripId: number | null;
    stops: ItineraryStop[];
    guestCount: number;
    selectedServices: any[]; // Track selected services/packages
    tripStartPoint: string; // Starting point of the trip
    tripEndPoint: string; // End destination of the trip
    routeStops: string[]; // Intermediate stops chosen along the route
    stopServicesByDay: Record<number, string[]>; // day -> service categories included at the stop
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
    setBasicInfo: (origin: string, destinations: string[], startDate: string, endDate: string) => void;
    setRouteInfo: (originPoint: string, destinationPoint: string, distance: number) => void;
    setSelectedCities: (originCity: string, destinationCities: string[]) => void;
    setPreferences: (car: CarType) => void;
    setServicePreferences: (types: ServiceType[]) => void;
    setGeneratedTripId: (id: number | null) => void;
    setGuestCount: (count: number) => void;
    addStop: (stop: Omit<ItineraryStop, "id">) => void;
    removeStop: (id: string) => void;
    clearItinerary: () => void;
    addSelectedService: (service: any) => void;
    removeSelectedService: (serviceId: string) => void;
    updateTripPoints: (startPoint: string, endPoint: string) => void;
    setRouteStops: (stops: string[]) => void;
    setStopServicesByDay: (map: Record<number, string[]>) => void;
}

const TripPlannerContext = createContext<TripPlannerContextType | undefined>(undefined);

export const TripPlannerProvider = ({ children }: { children: ReactNode }) => {
    const [origin, setOrigin] = useState("");
    const [destinations, setDestinations] = useState<string[]>([]);
    const [originPoint, setOriginPoint] = useState("");
    const [destinationPoint, setDestinationPoint] = useState("");
    const [selectedOriginCity, setSelectedOriginCity] = useState("");
    const [selectedDestinationCities, setSelectedDestinationCities] = useState<string[]>([]);
    const [distance, setDistance] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [servicePreferences, setServicePreferences] = useState<ServiceType[]>([]);
    const [carType, setCarType] = useState<CarType | null>(null);
    const [generatedTripId, setGeneratedTripId] = useState<number | null>(null);
    const [stops, setStops] = useState<ItineraryStop[]>([]);
    const [guestCount, setGuestCount] = useState(2);
    const [selectedServices, setSelectedServices] = useState<any[]>([]);
    const [tripStartPoint, setTripStartPoint] = useState("");
    const [tripEndPoint, setTripEndPoint] = useState("");
    const [routeStops, setRouteStops] = useState<string[]>([]);
    const [stopServicesByDay, setStopServicesByDay] = useState<Record<number, string[]>>({});

    const setBasicInfo = useCallback((o: string, d: string[], s: string, e: string) => {
        setOrigin(o);
        setDestinations(d);
        setStartDate(s);
        setEndDate(e);
    }, []);

    const setRouteInfo = useCallback((o: string, d: string, dist: number) => {
        setOriginPoint(o);
        setDestinationPoint(d);
        setDistance(dist);
    }, []);

    const setPreferences = useCallback((car: CarType) => {
        setCarType(car);
    }, []);

    const addStop = useCallback((stop: Omit<ItineraryStop, "id">) => {
        const id = Math.random().toString(36).substr(2, 9);
        setStops((prev) => [...prev, { ...stop, id }]);
    }, []);

    const removeStop = useCallback((id: string) => {
        setStops((prev) => prev.filter((s) => s.id !== id));
    }, []);

    const setSelectedCities = useCallback((originCity: string, destinationCities: string[]) => {
        setSelectedOriginCity(originCity);
        setSelectedDestinationCities(destinationCities);
    }, []);

    const clearItinerary = useCallback(() => {
        setStops([]);
        setOrigin("");
        setDestinations([]);
        setOriginPoint("");
        setDestinationPoint("");
        setSelectedOriginCity("");
        setSelectedDestinationCities([]);
        setDistance(0);
        setServicePreferences([]);
        setCarType(null);
        setGeneratedTripId(null);
        setSelectedServices([]);
        setTripStartPoint("");
        setTripEndPoint("");
        setRouteStops([]);
        setStopServicesByDay({});
    }, []);

    const addSelectedService = useCallback((service: any) => {
        setSelectedServices((prev) => [...prev, service]);
    }, []);

    const removeSelectedService = useCallback((serviceId: string) => {
        setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId));
    }, []);

    const updateTripPoints = useCallback((startPoint: string, endPoint: string) => {
        setTripStartPoint(startPoint);
        setTripEndPoint(endPoint);
    }, []);

    return (
        <TripPlannerContext.Provider value={{ 
            origin, destinations, originPoint, destinationPoint, selectedOriginCity, selectedDestinationCities, distance, 
            startDate, endDate, servicePreferences, carType, generatedTripId, stops, guestCount,
            selectedServices, tripStartPoint, tripEndPoint, routeStops, stopServicesByDay,
            setStartDate, setEndDate, setBasicInfo, setRouteInfo, setSelectedCities, setPreferences, setServicePreferences, setGeneratedTripId, addStop, removeStop, clearItinerary, setGuestCount,
            addSelectedService, removeSelectedService, updateTripPoints, setRouteStops, setStopServicesByDay
        }}>
            {children}
        </TripPlannerContext.Provider>
    );
};

export const useTripPlanner = () => {
    const context = useContext(TripPlannerContext);
    if (!context) {
        throw new Error("useTripPlanner must be used within a TripPlannerProvider");
    }
    return context;
};
