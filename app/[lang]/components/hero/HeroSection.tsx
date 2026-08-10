import React from 'react';
import { Icon } from '../atoms/Icon';
import Image from 'next/image';

export default function HeroSection({ onSearch, onPlan }: { onSearch: () => void; onPlan: () => void }) {
  return (
    <section className="relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1400')" }}>
      <div className="bg-black/40 inset-0 absolute" />
      <div className="relative max-w-4xl mx-auto px-4 py-32 text-center text-white">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">Explore Himachal<br />like you know a local</h1>
        <p className="text-lg md:text-xl mb-8">Find trusted stays, rides and experiences — or build the whole journey.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={onSearch} className="btn-primary rounded-full h-control px-9 text-xs">
            <Icon name="search" className="w-4 h-4 mr-2" /> Search Local Services
          </button>
          <button onClick={onPlan} className="btn-brand rounded-full h-control px-9 text-xs">
            <Icon name="map-pin" className="w-4 h-4 mr-2" /> Plan My Trip
          </button>
        </div>
      </div>
    </section>
  );
}
