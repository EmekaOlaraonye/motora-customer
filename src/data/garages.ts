import type { Garage } from '../types';

const STANDARD_HOURS = [
  { day: 'Monday – Friday', hours: '08:00 – 17:30' },
  { day: 'Saturday', hours: '08:00 – 13:00' },
  { day: 'Sunday', hours: 'Closed' },
];

const SATURDAY_TRADER_HOURS = [
  { day: 'Monday – Friday', hours: '07:30 – 18:00' },
  { day: 'Saturday', hours: '08:00 – 16:00' },
  { day: 'Sunday', hours: '09:00 – 13:00' },
];

/**
 * Mock garages. Shapes match the API contract exactly, so swapping in a real
 * data source is a repository change rather than a component change.
 */
export const GARAGES: Garage[] = [
  {
    id: 'g-001',
    slug: 'kgale-view-motors',
    name: 'Kgale View Motors',
    coverImageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=80',
    description:
      'Established on the Lobatse Road opposite Kgale Hill, Kgale View Motors has been importing and preparing Japanese vehicles for Gaborone families since 2011. Every vehicle on the floor is roadworthy-tested and comes with a full import history.',
    verified: true,
    rating: 4.8,
    reviewCount: 214,
    location: {
      area: 'Kgale',
      city: 'Gaborone',
      addressLine: 'Plot 2841, Lobatse Road, Kgale',
      coordinates: { lat: -24.6982, lng: 25.8934 },
    },
    contact: {
      phone: '+267 391 4820',
      whatsapp: '26771234820',
      email: 'sales@kgaleviewmotors.co.bw',
      website: 'www.kgaleviewmotors.co.bw',
    },
    openingHours: STANDARD_HOURS,
    establishedYear: 2011,
    specialties: ['Japanese imports', 'Family SUVs', 'Finance assistance'],
    listingCount: 0,
  },
  {
    id: 'g-002',
    slug: 'phakalane-auto-hub',
    name: 'Phakalane Auto Hub',
    coverImageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80',
    description:
      'A premium showroom in Phakalane specialising in low-mileage executive vehicles and German marques. Trade-ins welcome, and every listing is accompanied by a documented service history.',
    verified: true,
    rating: 4.9,
    reviewCount: 132,
    location: {
      area: 'Phakalane',
      city: 'Gaborone',
      addressLine: 'Phakalane Golf Estate, Plot 104, Gaborone North',
      coordinates: { lat: -24.5623, lng: 25.9412 },
    },
    contact: {
      phone: '+267 392 7715',
      whatsapp: '26772557715',
      email: 'info@phakalaneautohub.co.bw',
      website: 'www.phakalaneautohub.co.bw',
    },
    openingHours: STANDARD_HOURS,
    establishedYear: 2016,
    specialties: ['Executive sedans', 'German marques', 'Low mileage'],
    listingCount: 0,
  },
  {
    id: 'g-003',
    slug: 'broadhurst-car-centre',
    name: 'Broadhurst Car Centre',
    coverImageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1600&q=80',
    description:
      'Broadhurst Car Centre keeps a broad, honestly priced floor of everyday runabouts and first cars. Popular with young professionals buying their first vehicle in Gaborone.',
    verified: true,
    rating: 4.5,
    reviewCount: 389,
    location: {
      area: 'Broadhurst',
      city: 'Gaborone',
      addressLine: 'Plot 1123, Nelson Mandela Drive, Broadhurst',
      coordinates: { lat: -24.6295, lng: 25.9284 },
    },
    contact: {
      phone: '+267 393 2210',
      whatsapp: '26773442210',
      email: 'hello@broadhurstcars.co.bw',
    },
    openingHours: SATURDAY_TRADER_HOURS,
    establishedYear: 2009,
    specialties: ['First cars', 'Hatchbacks', 'Budget-friendly'],
    listingCount: 0,
  },
  {
    id: 'g-004',
    slug: 'tlokweng-motor-yard',
    name: 'Tlokweng Motor Yard',
    coverImageUrl: 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?auto=format&fit=crop&w=1600&q=80',
    description:
      'Bakkie and 4x4 specialists on the Tlokweng border road. If you need a workhorse for the cattle post or a double cab for the weekend, this is the yard that stocks it.',
    verified: true,
    rating: 4.7,
    reviewCount: 176,
    location: {
      area: 'Tlokweng',
      city: 'Gaborone',
      addressLine: 'Plot 5567, Tlokweng Border Road',
      coordinates: { lat: -24.6602, lng: 25.9683 },
    },
    contact: {
      phone: '+267 395 6104',
      whatsapp: '26774116104',
      email: 'sales@tlokwengmotoryard.co.bw',
    },
    openingHours: SATURDAY_TRADER_HOURS,
    establishedYear: 2013,
    specialties: ['Bakkies', '4x4', 'Commercial vehicles'],
    listingCount: 0,
  },
  {
    id: 'g-005',
    slug: 'cbd-premium-cars',
    name: 'CBD Premium Cars',
    coverImageUrl: 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1600&q=80',
    description:
      'A compact, appointment-friendly showroom in the Gaborone CBD. CBD Premium Cars focuses on late-model vehicles with verified mileage and complete documentation.',
    verified: true,
    rating: 4.6,
    reviewCount: 98,
    location: {
      area: 'Gaborone CBD',
      city: 'Gaborone',
      addressLine: 'Plot 54358, Prime Plaza, Gaborone CBD',
      coordinates: { lat: -24.6541, lng: 25.9139 },
    },
    contact: {
      phone: '+267 316 8890',
      whatsapp: '26775338890',
      email: 'enquiries@cbdpremiumcars.co.bw',
      website: 'www.cbdpremiumcars.co.bw',
    },
    openingHours: STANDARD_HOURS,
    establishedYear: 2018,
    specialties: ['Late-model', 'Verified mileage', 'By appointment'],
    listingCount: 0,
  },
  {
    id: 'g-006',
    slug: 'mogoditshane-auto-traders',
    name: 'Mogoditshane Auto Traders',
    coverImageUrl: 'https://images.unsplash.com/photo-1517672651691-24622a91b550?auto=format&fit=crop&w=1600&q=80',
    description:
      'High-turnover yard just off the Molepolole Road. Mogoditshane Auto Traders moves a lot of stock, so the floor changes weekly and is worth checking often.',
    verified: false,
    rating: 4.2,
    reviewCount: 241,
    location: {
      area: 'Mogoditshane',
      city: 'Gaborone',
      addressLine: 'Plot 8890, Molepolole Road, Mogoditshane',
      coordinates: { lat: -24.6274, lng: 25.8663 },
    },
    contact: {
      phone: '+267 390 4432',
      whatsapp: '26776554432',
      email: 'sales@mogoautotraders.co.bw',
    },
    openingHours: SATURDAY_TRADER_HOURS,
    establishedYear: 2015,
    specialties: ['Fast turnover', 'Trade-ins', 'Cash deals'],
    listingCount: 0,
  },
  {
    id: 'g-007',
    slug: 'riverwalk-motors',
    name: 'Riverwalk Motors',
    coverImageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=80',
    description:
      'Family-run dealership near Riverwalk Mall on the Tlokweng Road, trading since 2007. Known for straight talk about condition and for handling the paperwork end to end.',
    verified: true,
    rating: 4.8,
    reviewCount: 305,
    location: {
      area: 'The Village',
      city: 'Gaborone',
      addressLine: 'Plot 3021, Tlokweng Road, near Riverwalk',
      coordinates: { lat: -24.6668, lng: 25.9459 },
    },
    contact: {
      phone: '+267 391 1177',
      whatsapp: '26771881177',
      email: 'sales@riverwalkmotors.co.bw',
      website: 'www.riverwalkmotors.co.bw',
    },
    openingHours: STANDARD_HOURS,
    establishedYear: 2007,
    specialties: ['Full paperwork service', 'Family cars', 'Trade-ins'],
    listingCount: 0,
  },
  {
    id: 'g-008',
    slug: 'block-8-auto-sales',
    name: 'Block 8 Auto Sales',
    coverImageUrl: 'https://images.unsplash.com/photo-1547744152-14d985cb937f?auto=format&fit=crop&w=1600&q=80',
    description:
      'Neighbourhood yard in Block 8 with a tight, well-chosen selection. A small floor, but the cars are prepared properly before they go on sale.',
    verified: false,
    rating: 4.3,
    reviewCount: 67,
    location: {
      area: 'Block 8',
      city: 'Gaborone',
      addressLine: 'Plot 20455, Segoditshane Way, Block 8',
      coordinates: { lat: -24.6383, lng: 25.9366 },
    },
    contact: {
      phone: '+267 397 2043',
      whatsapp: '26777332043',
      email: 'sales@block8auto.co.bw',
    },
    openingHours: STANDARD_HOURS,
    establishedYear: 2019,
    specialties: ['Hand-picked stock', 'Compact cars'],
    listingCount: 0,
  },
];
