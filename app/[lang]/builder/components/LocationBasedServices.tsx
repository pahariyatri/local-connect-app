"use client";

import React, { useState, useEffect } from "react";
import { useTripPlanner, ServiceType } from "@/contexts/TripPlannerContext";
import { useServiceStore } from "@/store/useServiceStore";
import Button from "../../components/atoms/Button";
import Typography from "../../components/atoms/Typography";

interface ServiceCardProps {
  service: any;
  onSelect: (service: any) => void;
  isSelected: boolean;
}

const ServiceCard = ({ service, onSelect, isSelected }: ServiceCardProps) => {
  const addresses = service.addresses || [];
  const prices = service.prices || [];
  const primaryAddress = addresses[0];
  const primaryPrice = prices[0];

  return (
    <div className={`p-4 border-2 rounded-2xl transition-all cursor-pointer ${
      isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
    }`} onClick={() => onSelect(service)}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 text-lg">{service.name}</h3>
          <p className="text-slate-600 text-sm mt-1">{service.description}</p>
          {primaryAddress && (
            <p className="text-slate-500 text-xs mt-2">
              📍 {primaryAddress.city}, {primaryAddress.state}
            </p>
          )}
        </div>
        {isSelected && (
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {service.subcategory?.parent?.name === 'Accommodation' ? '🏨' :
             service.subcategory?.parent?.name === 'Activities' ? '🏔️' :
             service.subcategory?.parent?.name === 'Transportation' ? '🚗' :
             service.subcategory?.parent?.name === 'Food & Dining' ? '🍽️' : '📍'}
          </span>
          <span className="text-sm font-medium text-slate-600 capitalize">
            {service.subcategory?.name}
          </span>
        </div>
        {primaryPrice && (
          <div className="text-right">
            <span className="font-bold text-lg text-slate-900">₹{primaryPrice.price}</span>
            <p className="text-xs text-slate-500">{primaryPrice.priceType}</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface LocationBasedServicesProps {
  dict: any;
}

export default function LocationBasedServices({ dict }: LocationBasedServicesProps) {
  const { 
    selectedOriginCity, 
    selectedDestinationCities, 
    servicePreferences, 
    selectedServices, 
    addSelectedService, 
    removeSelectedService 
  } = useTripPlanner();
  
  const { services, loading, total, fetchServices, setFilters, filters } = useServiceStore();
  
  // Default to first selected preference
  const [activeCategory, setActiveCategory] = useState<ServiceType | 'all'>('all');

  // Sync active category with Step 3 preferences when component mounts
  useEffect(() => {
    if (servicePreferences.length > 0 && activeCategory === 'all') {
      // Set the first selected preference as active if user has preferences
      // but still allow viewing all via the "All Services" tab
      const firstPreference = servicePreferences[0];
    }
  }, [servicePreferences, activeCategory]);

  // Get all cities for filtering (origin + destinations)
  const allCities = [selectedOriginCity, ...selectedDestinationCities].filter(Boolean);

  useEffect(() => {
    if (allCities.length > 0) {
      // Set filters to fetch services for selected cities and category
      const categoryType = activeCategory !== 'all' ? activeCategory : undefined;
      setFilters({
        city: allCities[0], // Start with first city, can be enhanced to show services from all cities
        categoryType: categoryType,
        isAvailable: true,
        take: 20
      });
    }
  }, [selectedOriginCity, selectedDestinationCities, activeCategory, setFilters]);

  // Available categories - only show those selected in Step 3, plus 'all'
  const availableCategories = [
    { id: 'all' as const, name: 'All Services', icon: '📋' },
    ...(servicePreferences.includes('stay') ? [{ id: 'stay' as ServiceType, name: 'Stay', icon: '🏨' }] : []),
    ...(servicePreferences.includes('activity') ? [{ id: 'activity' as ServiceType, name: 'Activities', icon: '🏔️' }] : []),
    ...(servicePreferences.includes('travel') ? [{ id: 'travel' as ServiceType, name: 'Travel', icon: '🚗' }] : []),
    ...(servicePreferences.includes('food') ? [{ id: 'food' as ServiceType, name: 'Food', icon: '🍽️' }] : []),
  ];

  // If no preferences selected, show all categories
  const categories = servicePreferences.length > 0 
    ? availableCategories 
    : [
        { id: 'all' as const, name: 'All Services', icon: '📋' },
        { id: 'stay' as ServiceType, name: 'Stay', icon: '🏨' },
        { id: 'activity' as ServiceType, name: 'Activities', icon: '🏔️' },
        { id: 'travel' as ServiceType, name: 'Travel', icon: '🚗' },
        { id: 'food' as ServiceType, name: 'Food', icon: '🍽️' }
      ];

  const filteredServices = activeCategory === 'all' ? services : services;

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  const handleServiceSelect = (service: any) => {
    if (isServiceSelected(service.id)) {
      removeSelectedService(service.id);
    } else {
      addSelectedService(service);
    }
  };

  if (!selectedOriginCity && selectedDestinationCities.length === 0) {
    return (
      <div className="text-center py-12">
        <Typography variant="h3" className="text-slate-600 mb-4">
          Select your origin and destinations to see available services
        </Typography>
        <p className="text-slate-500">
          Choose where you're starting from and where you want to go to discover relevant services.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Typography variant="h2" className="text-2xl font-bold text-slate-900 mb-2">
          Available Services
        </Typography>
        <p className="text-slate-600">
          Services available in {allCities.join(', ')}
        </p>
      </div>

      {/* Category Filter - Show based on Step 3 preferences */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id as ServiceType | 'all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              activeCategory === category.id
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>{category.icon}</span>
            <span className="font-medium">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Selected Preferences Indicator */}
      {servicePreferences.length > 0 && activeCategory === 'all' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-sm text-emerald-700">
            Showing services for: <span className="font-semibold">{servicePreferences.join(', ')}</span>
          </p>
        </div>
      )}

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading services...</p>
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={handleServiceSelect}
              isSelected={isServiceSelected(service.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Typography variant="h3" className="text-slate-600 mb-4">
            No services found
          </Typography>
          <p className="text-slate-500">
            {activeCategory === 'all' 
              ? "No services available for the selected locations."
              : `No ${activeCategory} services available. Try selecting "All Services" to see more options.`
            }
          </p>
        </div>
      )}

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mt-6">
          <Typography variant="h3" className="text-emerald-900 font-bold mb-4">
            Selected Services ({selectedServices.length})
          </Typography>
          <div className="space-y-2">
            {selectedServices.map(service => (
              <div key={service.id} className="flex justify-between items-center">
                <span className="text-emerald-800">{service.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeSelectedService(service.id)}
                  className="text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
