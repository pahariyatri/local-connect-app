"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import NextImage from "next/image";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";
import { useNotification } from "@/contexts/NotificationContext";
import TopNavigation from "../../components/organisms/TopNavigation";
import VendorQRCode from "../../components/molecules/VendorQRCode";
import api from "@/lib/apiClient";

// Rich, structured mock data representing various Himalayan locals and guides
const VENDOR_PROFILES: Record<string, {
    id: string;
    name: string;
    image: string;
    rating: number;
    reviews: number;
    priceRange: string;
    category: string;
    isSecretGroupMember: boolean;
    description: string;
    features: string[];
    services: { id: string; name: string; price: number; unit: string; description: string }[];
    languages?: string[];
    experienceYears?: number;
    hometown?: string;
    story?: string;
    faq?: { q: string; a: string }[];
}> = {
    p1: {
        id: "p1",
        name: "Tenzing Sherpa",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800",
        rating: 4.9,
        reviews: 142,
        priceRange: "₹₹₹",
        category: "Guides",
        isSecretGroupMember: true,
        description: "Tenzing is an elite, UIAGM-certified mountain guide with over 15 years of experience leading expeditions across the Himalayas. Renowned for mountaineering safety and deep local knowledge.",
        features: ["Expedition Leadership", "First-Aid Certified", "High-Altitude Gear Included", "Hidden Trail Expert"],
        services: [
            { id: "s1", name: "Full Day Peak Trek", price: 3500, unit: "day", description: "A high-altitude guided day hike featuring local peaks and glacier views." },
            { id: "s2", name: "Overnight Alpine Camping", price: 5000, unit: "night", description: "Stay under the stars in premium tents with local sherpa cuisine cooked fresh." },
            { id: "s3", name: "Safety & Rope Technique Crash Course", price: 1500, unit: "session", description: "Master mountain navigation, ropes, and safety standards." }
        ],
        languages: ["English", "Hindi", "Nepali", "Sherpa"],
        experienceYears: 15,
        hometown: "Khumbu Valley",
        story: "Born in the high hills of Mount Everest, Tenzing was trained by veteran alpinists from a young age. He believes that climbing is not just about reaching the summit, but respecting the divine spirit of the peaks and sharing the authentic lifestyle of the high-altitude locals with travellers.",
        faq: [
            { q: "Is high-altitude experience required?", a: "No, we adapt our routes based on your fitness level. Acclimatization walks are conducted." },
            { q: "What gear is included in the package?", a: "We provide high-quality harnesses, helmets, ropes, and cold-weather camping equipment." }
        ]
    },
    p2: {
        id: "p2",
        name: "Priya Homestay",
        image: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=800",
        rating: 4.8,
        reviews: 89,
        priceRange: "₹₹",
        category: "Homestays",
        isSecretGroupMember: false,
        description: "Nestled in the quiet apple orchards of Old Manali, Priya Homestay offers traditional wooden rooms with modern amenities, organic home-cooked meals, and high-speed Wi-Fi.",
        features: ["Panoramic Peak Views", "Organic Kitchen Garden", "Traditional Wooden Architecture", "High-speed Wi-Fi"],
        services: [
            { id: "s1", name: "Deluxe Orchard Room", price: 2200, unit: "night", description: "Spacious wooden room with double bed and sweeping views." },
            { id: "s2", name: "Traditional Attic Suite", price: 3200, unit: "night", description: "Rustic top-floor attic experience with direct peak vistas." },
            { id: "s3", name: "Organic Cooking Class", price: 600, unit: "person", description: "Learn how to prepare authentic local Himachali cuisine." }
        ],
        languages: ["Hindi", "English", "Pahari"],
        experienceYears: 8,
        hometown: "Old Manali",
        story: "Priya's family has lived in Manali for generations, farming heritage apple orchards. They opened their traditional wooden home to travelers to share their organic garden meals, local stories around the tandoor heater, and pure mountain tranquility.",
        faq: [
            { q: "Is breakfast included in the stay?", a: "Yes, a hearty organic home-cooked traditional breakfast is included in the room price." },
            { q: "How is the internet connectivity?", a: "We have fiber broadband Wi-Fi (up to 100 Mbps), which is highly stable for remote work." }
        ]
    },
    p3: {
        id: "p3",
        name: "Arjun Thakur",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
        rating: 4.7,
        reviews: 63,
        priceRange: "₹",
        category: "Food",
        isSecretGroupMember: false,
        description: "A local culinary historian and chef, Arjun hosts walking food tours through Shimla's ancient alleys, sharing traditional stories and delicious Himachali Dham delicacies.",
        features: ["Local Delicacies Tasting", "Historical Walk", "English Speaking Guide", "Vegetarian Friendly"],
        services: [
            { id: "s1", name: "Heritage Street Food Walk", price: 900, unit: "person", description: "A tasting tour through the city's oldest local sweet and spice stalls." },
            { id: "s2", name: "Traditional Himachali Dham Feast", price: 1200, unit: "person", description: "Experience a full festive sit-down banquet cooked by a traditional chef." }
        ],
        languages: ["English", "Hindi", "Punjabi"],
        experienceYears: 10,
        hometown: "Shimla Hills",
        story: "Arjun spent a decade researching vanishing recipes of the Himachali valleys. His food walks combine culinary history with local legends, allowing travelers to taste centuries of cultural heritage.",
        faq: [
            { q: "Are vegan options available?", a: "Yes, many of our traditional dishes are naturally vegan or can be modified on request." },
            { q: "What should I wear for the walk?", a: "Comfortable walking shoes are recommended as Shimla's lanes are steep and cobbled." }
        ]
    },
    p4: {
        id: "p4",
        name: "Sonam Wangchuk",
        image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=800",
        rating: 4.9,
        reviews: 211,
        priceRange: "₹₹₹₹",
        category: "Transport",
        isSecretGroupMember: true,
        description: "Sonam is a veteran driver based in Leh, operating robust 4x4 vehicles. He helps arrange inner-line permits and specializes in navigating the challenging mountain passes.",
        features: ["4x4 Custom SUV", "Permit Facilitation", "Oxygen Cylinder Onboard", "Pangong & Nubra Specialist"],
        services: [
            { id: "s1", name: "Leh Airport Pick-up & Tour", price: 2500, unit: "day", description: "Comfortable pickup and acclimatization sightseeing tour." },
            { id: "s2", name: "3-Day Private Circuit Tour", price: 14000, unit: "tour", description: "Full drive package to Nubra Valley and Pangong Tso Lake." }
        ],
        languages: ["Ladakhi", "Tibetan", "English", "Hindi"],
        experienceYears: 18,
        hometown: "Leh Old Town",
        story: "Navigating high altitude mountain passes like Khardung La is an art. Sonam has driven these extreme routes for 18 years, guaranteeing not just safe journeys but also connecting travelers to local monastery monks and hidden homestays.",
        faq: [
            { q: "Do you provide emergency oxygen?", a: "Yes, a professional 5L oxygen cylinder is always fitted in our SUV for safety." },
            { q: "Who handles the Inner Line Permits?", a: "We take care of all document submissions and permit approvals ahead of your trip." }
        ]
    },
    p5: {
        id: "p5",
        name: "Kavya Nair",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800",
        rating: 5.0,
        reviews: 47,
        priceRange: "₹₹",
        category: "Wellness",
        isSecretGroupMember: false,
        description: "Certified Yoga Alliance instructor offering meditation, sound healing, and custom wellness sessions along the quiet banks of the Ganges in Rishikesh.",
        features: ["Sound Healing Instruments", "Hatha & Ashtanga Specialty", "Sunrise Meditation Sessions", "Private Riverside Deck"],
        services: [
            { id: "s1", name: "Private Sunrise Yoga & Sound Session", price: 1500, unit: "person", description: "One-on-one session at sunrise including mindfulness exercises." },
            { id: "s2", name: "3-Day Wellness & Sound Healing Program", price: 4000, unit: "person", description: "Immersive program targeting stress relief and alignment." }
        ],
        languages: ["English", "Hindi", "Malayalam"],
        experienceYears: 6,
        hometown: "Rishikesh",
        story: "Kavya moved to Rishikesh to connect with ancient sound therapies. She blends classical Hatha teachings with Tibetan singing bowl therapy, creating restorative sessions that align physical and mental energy.",
        faq: [
            { q: "What should I bring to the class?", a: "Just comfortable clothes. Premium yoga mats and sound props are provided at the deck." },
            { q: "Is the deck private?", a: "Yes, our wellness deck is completely private and overlooks a quiet stretch of the river." }
        ]
    },
    p6: {
        id: "p6",
        name: "Rajan Chauhan",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800",
        rating: 4.8,
        reviews: 178,
        priceRange: "₹₹",
        category: "Adventures",
        isSecretGroupMember: false,
        description: "National rafting athlete offering high-adrenaline river rafting and kayaking lessons on the Beas and Sutlej rivers, with international safety gear standards.",
        features: ["Rafting Gear Included", "HD Action Cam Footage", "Safety Kayaker Backup", "Certified Lifeguard"],
        services: [
            { id: "s1", name: "Standard 14km Rafting Stretch", price: 1200, unit: "person", description: "Classic Class II-III rapids stretch with experienced guides." },
            { id: "s2", name: "Full-Day Extreme Rapids Expedition", price: 3000, unit: "person", description: "Heavy Class IV rapid expedition for thrill-seekers." },
            { id: "s3", name: "Introductory Kayak Course", price: 2500, unit: "day", description: "Learn paddle strokes, rolling, and basic river reading." }
        ],
        languages: ["Hindi", "English", "Pahari"],
        experienceYears: 12,
        hometown: "Kullu Valley",
        story: "Rajan is a former competitive kayak racer who returned to Kullu to promote eco-adventure tourism. He believes river reading is a dialogue with nature, prioritizing strict international safety procedures above all else.",
        faq: [
            { q: "Is swimming knowledge mandatory?", a: "No, our international-standard high-float lifejackets and helmets keep you perfectly safe. Our guides stay with you." },
            { q: "Are videos included in the price?", a: "Yes, HD action-cam footages of the rapids are included in all standard packages." }
        ]
    }
};

const DEFAULT_PROFILE = {
    id: "default",
    name: "Himalayan Retreat",
    image: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=800",
    rating: 4.8,
    reviews: 124,
    priceRange: "₹₹₹",
    category: "Stay",
    isSecretGroupMember: true,
    description: "Nestled in the heart of Old Manali, Himalayan Retreat offers a sanctuary for those seeking peace and authentic hospitality. As a Local Connect Legend, this property is part of our invitation-only Secret Group.",
    features: ["Panoramic Peak Views", "Organic Kitchen garden", "Traditional Mud-walled Rooms", "Guided Meditation sessions"],
    services: [
        { id: "s1", name: "Premium Suite", price: 4500, unit: "night", description: "Luxury double room." },
        { id: "s2", name: "Riverside Cottage", price: 6500, unit: "night", description: "Charming cottage near stream." },
        { id: "s3", name: "Local Thali Experience", price: 800, unit: "person", description: "Authentic local flavors." }
    ],
    languages: ["English", "Hindi"],
    experienceYears: 7,
    hometown: "Old Manali",
    story: "Dedicated to providing unforgettable Himalayan journeys, showing you the side of our home that standard travel operators miss entirely.",
    faq: [
        { q: "What is your check-in time?", a: "Standard check-in is at 12:00 PM and check-out is at 10:00 AM." }
    ]
};

const mapSingleVendor = (v: any) => {
    const type = v.types?.[0] || "Guides";
    const categoryMap: Record<string, string> = {
        "hotel": "Homestays",
        "adventure": "Adventures",
        "transport": "Transport",
        "restaurant": "Food",
        "guide": "Guides",
        "wellness": "Wellness"
    };
    const category = categoryMap[type.toLowerCase()] || "Guides";

    const categoryImages: Record<string, string> = {
        "Homestays": "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=800",
        "Adventures": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800",
        "Transport": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=800",
        "Food": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
        "Guides": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800",
        "Wellness": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800"
    };

    let location = "Manali";
    const lowerName = v.businessName.toLowerCase();
    if (lowerName.includes("dharamshala")) location = "Dharamshala";
    else if (lowerName.includes("tirthan")) location = "Tirthan";
    else if (lowerName.includes("spiti")) location = "Spiti";
    else if (lowerName.includes("goa")) location = "Goa";
    else if (lowerName.includes("leh")) location = "Leh";
    else if (lowerName.includes("rishikesh")) location = "Rishikesh";
    else if (lowerName.includes("shimla")) location = "Shimla";

    let cleanName = v.businessName.replace(/\s*\(.*?\)\s*/g, "").trim();

    const mappedServices = v.services && v.services.length > 0
        ? v.services.map((s: any, idx: number) => ({
            id: s.id || `s-${idx}`,
            name: s.name,
            price: s.price,
            unit: s.unit || "day",
            description: s.description || "Premium local service."
          }))
        : [
            { id: "s1", name: "Standard Guided Tour", price: 2500, unit: "day", description: "All-inclusive guided tour showcasing the best local secrets." }
          ];

    return {
        id: v.id,
        name: cleanName,
        rating: v.trustScore || 4.8,
        reviews: v.reviews || Math.floor((v.trustScore || 4.8) * 20) + 40,
        priceRange: v.isInstantBooking ? "₹₹" : "₹₹₹",
        category,
        isSecretGroupMember: lowerName.includes("legend") || v.isVerified,
        description: v.description || "Authentic local connect partner.",
        features: [
            "Verified Credentials",
            v.isInstantBooking ? "Instant Booking Enabled" : "Quick Response Time",
            "Local Culture Specialist",
            "100% Safe & Audited"
        ],
        services: mappedServices,
        languages: ["English", "Hindi"],
        experienceYears: 5,
        hometown: location,
        story: v.description,
        faq: [
            { q: "Is the price inclusive of local taxes?", a: "Yes, all listed prices are inclusive of taxes and guide service fees." },
            { q: "What is the cancellation policy?", a: "Cancel up to 24 hours in advance for a full refund." }
        ]
    };
};

export default function VendorProfilePage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const { showNotification } = useNotification();
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (id && id.startsWith("p") && id.length <= 3) {
                    setProfile(VENDOR_PROFILES[id] || DEFAULT_PROFILE);
                } else {
                    const response = await api.get(`/vendors/${id}`);
                    if (response && response.id) {
                        setProfile(mapSingleVendor(response));
                    } else {
                        setProfile(VENDOR_PROFILES[id] || DEFAULT_PROFILE);
                    }
                }
            } catch (err) {
                console.error("Error fetching vendor profile:", err);
                setProfile(VENDOR_PROFILES[id] || DEFAULT_PROFILE);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 pb-32 animate-pulse">
                <TopNavigation title="Loading Profile..." />
                <div className="h-96 w-full bg-slate-200" />
                <main className="max-w-xl mx-auto px-4 -mt-12 relative z-10">
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-slate-100/50 space-y-6">
                        <div className="h-8 bg-slate-200 rounded-lg w-2/3" />
                        <div className="h-4 bg-slate-200 rounded-lg w-1/3" />
                        <div className="grid grid-cols-3 gap-3">
                            <div className="h-16 bg-slate-100 rounded-2xl" />
                            <div className="h-16 bg-slate-100 rounded-2xl" />
                            <div className="h-16 bg-slate-100 rounded-2xl" />
                        </div>
                        <div className="h-20 bg-slate-100 rounded-2xl" />
                        <div className="h-32 bg-slate-150 rounded-2xl" />
                    </div>
                </main>
            </div>
        );
    }

    if (!profile) return null;

    const currentSelected = profile.services.find((s: any) => s.id === selectedService);

    const handleAddToPackage = () => {
        if (!selectedService || !currentSelected) {
            return showNotification("Please select a service first", "error");
        }
        showNotification(`${currentSelected.name} added to your journey!`, "success");
        // Redirect back to landing page or builder
        router.push(`/${params.lang}/builder`);
    };

    const handleBookInstantly = () => {
        if (!selectedService || !currentSelected) {
            return showNotification("Please select a service first", "error");
        }
        
        // Mock instant booking redirect with required search parameters for checkout
        const bookingId = Math.floor(Math.random() * 90000) + 10000;
        const orderId = `order_${Math.random().toString(36).substring(2, 10)}`;
        const amount = currentSelected.price;
        
        showNotification("Generating instant booking slot...", "success");
        setTimeout(() => {
            router.push(`/${params.lang}/checkout?bookingId=${bookingId}&orderId=${orderId}&amount=${amount}&currency=INR`);
        }, 800);
    };

    const handleSharePortfolio = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            showNotification("Public portfolio link copied to clipboard!", "success");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <TopNavigation title="Vendor Profile" />
            
            {/* Hero Image */}
            <div className="h-96 w-full relative">
                <NextImage 
                    src={profile.image} 
                    fill 
                    className="object-cover" 
                    alt={profile.name} 
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-16 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-md tracking-wider shadow-lg">
                            LOCALconnect LEGEND
                        </span>
                        {profile.isSecretGroupMember && (
                            <span className="px-3 py-1 bg-amber-400 text-slate-900 text-[9px] font-black uppercase rounded-md tracking-wider shadow-md">
                                SECRET GROUP MEMBER 🤫
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-xl mx-auto px-4 -mt-12 relative z-10">
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-slate-200/60 border border-slate-100/50">
                    <div className="flex justify-between items-start mb-6 gap-4">
                        <div>
                            <Typography variant="h1" className="text-3xl font-black text-slate-950 mb-1.5 uppercase italic">
                                {profile.name}
                            </Typography>
                            <div className="flex items-center gap-2">
                                <span className="text-amber-500 font-bold text-sm">★ {profile.rating}</span>
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">({profile.reviews} reviews)</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end shrink-0">
                            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10">
                                 <span className="font-black text-sm">{profile.priceRange}</span>
                            </div>
                            <button 
                                onClick={handleSharePortfolio}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 touch-manipulation"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Host Quick Badges */}
                    <div className="grid grid-cols-3 gap-2.5 mb-6 border-b border-slate-100 pb-6 text-center">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Hometown</p>
                            <p className="text-[10px] font-black text-slate-800 uppercase mt-1 truncate" title={profile.hometown}>{profile.hometown || "Himalayas"}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Experience</p>
                            <p className="text-[10px] font-black text-slate-800 uppercase mt-1">{profile.experienceYears || 5} Years</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Languages</p>
                            <p className="text-[10px] font-black text-slate-800 uppercase mt-1 truncate" title={profile.languages?.join(", ") || "English"}>
                                {profile.languages?.[0] || "English"}{profile.languages && profile.languages.length > 1 ? ` +${profile.languages.length - 1}` : ""}
                            </p>
                        </div>
                    </div>

                    <Typography variant="p" className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">
                        {profile.description}
                    </Typography>

                    {/* Story Section */}
                    <div className="mb-8">
                        <Typography variant="h3" className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">
                            Meet Your Local Host
                        </Typography>
                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100/80 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                            <p className="text-[10px] text-slate-600 font-medium leading-relaxed italic">
                                "{profile.story || "Dedicated to providing unforgettable Himalayan journeys, showing you the side of our home that standard travel operators miss entirely."}"
                            </p>
                        </div>
                    </div>

                    {/* Features list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        {profile.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wide text-slate-700">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <Typography variant="h3" className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">
                        Featured Services
                    </Typography>
                    
                    {/* Services options with active select style */}
                    <div className="space-y-3.5 mb-10">
                        {profile.services.map(service => (
                            <button 
                                key={service.id}
                                onClick={() => setSelectedService(service.id)}
                                className={`w-full p-5 rounded-2xl border-2 transition-all flex flex-col gap-2 group text-left ${
                                    selectedService === service.id 
                                        ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/5' 
                                        : 'border-slate-100 hover:border-slate-200 hover:-translate-y-0.5'
                                }`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div>
                                        <p className="font-black text-slate-950 leading-none uppercase text-[11px] tracking-wider">{service.name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Acclaimed Local Specialty</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-black text-emerald-600 text-sm">₹{service.price}</p>
                                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">per {service.unit}</p>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1 border-t border-slate-100/60 pt-2 w-full">
                                    {service.description}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Public Portfolio Showcase */}
                    <div className="mt-8 border-t border-slate-100 pt-6">
                        <Typography variant="h3" className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">
                            Public Portfolio Showcase
                        </Typography>
                        <div className="grid grid-cols-2 gap-3.5 mb-8">
                            {[
                                { title: "Peak Expedition 2025", role: "100% Safe Summits", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=250" },
                                { title: "Community Meet & Greet", role: "Local Culture Host", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250" }
                            ].map((proj, idx) => (
                                <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-100 p-2.5 flex flex-col gap-2 group/port">
                                    <div className="h-24 w-full relative rounded-xl overflow-hidden bg-slate-200">
                                        <NextImage src={proj.img} fill className="object-cover group-hover/port:scale-105 transition-transform duration-500" alt={proj.title} sizes="(max-width: 768px) 50vw, 33vw" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-950 uppercase tracking-tight truncate">{proj.title}</p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{proj.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ & Travel Advisories */}
                    {profile.faq && profile.faq.length > 0 && (
                        <div className="mt-8 border-t border-slate-100 pt-6">
                            <Typography variant="h3" className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">
                                FAQs & Advisories
                            </Typography>
                            <div className="space-y-3">
                                {profile.faq.map((item, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                                        <p className="text-[10px] font-black text-slate-950 uppercase tracking-wide">{item.q}</p>
                                        <p className="text-[10px] text-slate-500 font-semibold mt-1.5 leading-relaxed">{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Verified Security Registry */}
                    <div className="mt-8 border-t border-slate-100 pt-6 mb-8">
                        <Typography variant="h3" className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">
                            Verified Security & Credentials
                        </Typography>
                        <div className="space-y-2 bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/50">
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase">
                                <span>Verification Registry</span>
                                <span className="text-emerald-600 font-black">✓ Fully Verified & Audited</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase">
                                <span>Background Check</span>
                                <span className="text-emerald-600 font-black">✓ Pass (Zero Records)</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase">
                                <span>Registry ID</span>
                                <span className="font-mono text-slate-700 select-all">LCP-{profile.id.toUpperCase()}-REG</span>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Tag */}
                    <div className="bg-slate-950 rounded-[2rem] text-center mb-10 pb-8 pt-4 border border-slate-900 shadow-2xl">
                        <Typography variant="h3" className="text-white text-[9px] font-black uppercase tracking-widest mb-4 mt-6">
                            Official Authenticity QR Tag
                        </Typography>
                        <div className="inline-block relative p-2 bg-white rounded-2xl shadow-md">
                            <VendorQRCode vendorId={id} businessName={profile.name} />
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col gap-3">
                        <Button 
                            onClick={handleBookInstantly}
                            className="w-full h-16 rounded-2xl bg-slate-950 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-950/15 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                            Book Instantly
                        </Button>
                        <Button 
                            onClick={handleAddToPackage}
                            className="w-full h-16 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all duration-300"
                        >
                            Add to Trip Package
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
