import type { Review, ReviewRating } from '../types';

/**
 * Mock garage reviews.
 *
 * Seeds carry only what varies; the builder derives ids and timestamps the way
 * the backend would. Ratings are deliberately mixed — a wall of five stars
 * reads as fake, and the useful review is usually the three-star one.
 */

interface ReviewSeed {
  garageId: string;
  authorName: string;
  rating: ReviewRating;
  title: string;
  body: string;
  daysAgo: number;
  verifiedBuyer?: boolean;
  vehicleSummary?: string;
  response?: { body: string; daysAfter: number };
}

const SEEDS: ReviewSeed[] = [
  {
    garageId: 'g-001',
    authorName: 'Tebogo M.',
    rating: 5,
    title: 'Paperwork sorted in two days',
    body: 'Bought a Fortuner here in March. What sold me was that they let me take it to my own mechanic in Broadhurst before I paid anything. Registration and change of ownership were done in two days.',
    daysAgo: 34,
    verifiedBuyer: true,
    vehicleSummary: '2020 Toyota Fortuner',
  },
  {
    garageId: 'g-001',
    authorName: 'Naledi K.',
    rating: 4,
    title: 'Good car, slow on the service book',
    body: 'The car is exactly as described and drives well. Only complaint is that it took three weeks and a lot of phone calls to get the full service book handed over. Worth the wait but it should not need chasing.',
    daysAgo: 61,
    verifiedBuyer: true,
    vehicleSummary: '2018 Mazda CX-5',
    response: {
      body: 'Thank you Naledi, and apologies for the delay. The book was with the previous owner and we should have chased it harder. We have changed how we hold documents before a sale closes.',
      daysAfter: 3,
    },
  },
  {
    garageId: 'g-001',
    authorName: 'Kabelo S.',
    rating: 3,
    title: 'Fine, but negotiate',
    body: 'Nothing wrong with the yard or the cars. First price quoted was well above what I eventually paid, so do not take the sticker as final. Staff were patient with my questions.',
    daysAgo: 95,
  },
  {
    garageId: 'g-001',
    authorName: 'Mpho T.',
    rating: 5,
    title: 'Second car I have bought from them',
    body: 'Third time dealing with this yard. They remember you, and they do not push you towards something you did not come for.',
    daysAgo: 140,
    verifiedBuyer: true,
  },
  {
    garageId: 'g-002',
    authorName: 'Lesedi R.',
    rating: 5,
    title: 'Showroom standard, showroom prices',
    body: 'Everything on the floor is clean and properly prepared. You pay for that, but the C-Class I bought had no surprises at all and the service history was complete.',
    daysAgo: 21,
    verifiedBuyer: true,
    vehicleSummary: '2019 Mercedes-Benz C-Class',
  },
  {
    garageId: 'g-002',
    authorName: 'Onalenna P.',
    rating: 4,
    title: 'Knew the car properly',
    body: 'Asked detailed questions about the service intervals on a German import and got real answers rather than guesses. The appointment system means you are not standing around.',
    daysAgo: 55,
  },
  {
    garageId: 'g-002',
    authorName: 'Gorata B.',
    rating: 2,
    title: 'Car sold while I was arranging finance',
    body: 'I was told the vehicle would be held for me for a week while the bank processed. It was sold on day four. I understand business, but I had already paid for an inspection.',
    daysAgo: 88,
    response: {
      body: 'Gorata, this was our mistake and we are sorry. We did not have a written hold in place. We now take a refundable reservation so this cannot happen again.',
      daysAfter: 2,
    },
  },
  {
    garageId: 'g-003',
    authorName: 'Thato L.',
    rating: 5,
    title: 'Good first car, no pressure',
    body: 'I am a first time buyer and said so. They showed me what I could actually afford rather than the most expensive thing on the floor. The Polo Vivo has given me no trouble.',
    daysAgo: 12,
    verifiedBuyer: true,
    vehicleSummary: '2019 Volkswagen Polo Vivo',
  },
  {
    garageId: 'g-003',
    authorName: 'Boitumelo N.',
    rating: 4,
    title: 'Busy but honest',
    body: 'Saturday mornings are chaos, go during the week if you can. Pricing is fair and they were upfront about a scratch I had not even noticed.',
    daysAgo: 40,
  },
  {
    garageId: 'g-003',
    authorName: 'Kitso D.',
    rating: 3,
    title: 'Car was fine, aircon was not',
    body: 'Aircon stopped working two weeks after I bought it. They did regas it for free when I came back, so credit for that, but it should have been picked up before the sale.',
    daysAgo: 73,
    verifiedBuyer: true,
    response: {
      body: 'Sorted at no charge, and we have added an aircon check to our pre-sale list. Thank you for coming back to us rather than just leaving a review.',
      daysAfter: 5,
    },
  },
  {
    garageId: 'g-004',
    authorName: 'Odirile G.',
    rating: 5,
    title: 'They know bakkies',
    body: 'Went in asking about a Hilux and left understanding the difference between the 2.4 and the 2.8 properly. No sales talk, just someone who actually works on these.',
    daysAgo: 28,
    verifiedBuyer: true,
    vehicleSummary: '2019 Toyota Hilux',
  },
  {
    garageId: 'g-004',
    authorName: 'Tshepo M.',
    rating: 4,
    title: 'Solid workhorse, honest about wear',
    body: 'The load bin had more wear than the photos showed and they said so before I drove out. The price reflected it. That is how it should work.',
    daysAgo: 66,
    verifiedBuyer: true,
  },
  {
    garageId: 'g-004',
    authorName: 'Refilwe A.',
    rating: 5,
    title: 'Helped with the tow bar',
    body: 'Fitted a tow bar at cost after I bought the Ranger. They did not have to do that.',
    daysAgo: 110,
  },
  {
    garageId: 'g-005',
    authorName: 'Amogelang J.',
    rating: 5,
    title: 'Mileage was exactly as stated',
    body: 'They showed me the verification paperwork without me having to ask. For a used import that matters more than anything else on the listing.',
    daysAgo: 18,
    verifiedBuyer: true,
    vehicleSummary: '2021 Toyota RAV4',
  },
  {
    garageId: 'g-005',
    authorName: 'Keabetswe O.',
    rating: 4,
    title: 'Appointment only, which is fine',
    body: 'You cannot just walk in, which caught me out the first time. Once booked, the whole thing was efficient and the car was ready and clean.',
    daysAgo: 47,
  },
  {
    garageId: 'g-006',
    authorName: 'Lorato S.',
    rating: 4,
    title: 'Cheapest prices I found',
    body: 'The floor changes every week so you have to keep checking. Got a Note well under what others were asking. Do bring your own mechanic.',
    daysAgo: 25,
    verifiedBuyer: true,
  },
  {
    garageId: 'g-006',
    authorName: 'Bakang M.',
    rating: 2,
    title: 'Sold as seen means sold as seen',
    body: 'The clutch went within a month. They were clear that it was sold as seen and I signed that, so this is partly on me, but I would get anything here inspected first.',
    daysAgo: 52,
  },
  {
    garageId: 'g-006',
    authorName: 'Neo K.',
    rating: 3,
    title: 'Fast turnover, mixed stock',
    body: 'Quality varies a lot car to car. Some are genuinely good buys, some are tired. Worth the trip if you know what you are looking at.',
    daysAgo: 81,
  },
  {
    garageId: 'g-007',
    authorName: 'Goitseone T.',
    rating: 5,
    title: 'Handled everything end to end',
    body: 'Insurance, registration and change of ownership all done by them. I signed papers twice and that was it. A family business and it shows.',
    daysAgo: 15,
    verifiedBuyer: true,
    vehicleSummary: '2017 Toyota Corolla',
  },
  {
    garageId: 'g-007',
    authorName: 'Pako L.',
    rating: 5,
    title: 'Straight about a car they could not sell me',
    body: 'Told me the Tucson I came for had a history they were not happy with and steered me away from it. Lost them a sale that day, gained a customer.',
    daysAgo: 38,
    verifiedBuyer: true,
  },
  {
    garageId: 'g-007',
    authorName: 'Masego W.',
    rating: 4,
    title: 'Fair on the trade-in',
    body: 'The offer on my old car was close to what I expected rather than an insult. Negotiation was quick and reasonable.',
    daysAgo: 70,
  },
  {
    garageId: 'g-008',
    authorName: 'Tumelo R.',
    rating: 4,
    title: 'Small floor, well chosen',
    body: 'Only about six cars when I visited but all of them were prepared properly. Not verified on Motora yet which made me cautious, but there were no issues at all.',
    daysAgo: 30,
    verifiedBuyer: true,
  },
  {
    garageId: 'g-008',
    authorName: 'Sethunya M.',
    rating: 5,
    title: 'Hybrid was a good call',
    body: 'Talked me through the battery health report on a Honda Fit before I asked. Running costs are exactly what they said they would be.',
    daysAgo: 58,
  },
];

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export const REVIEWS: Review[] = SEEDS.map((seed, index) => ({
  id: `rev-${String(index + 1).padStart(3, '0')}`,
  garageId: seed.garageId,
  authorName: seed.authorName,
  rating: seed.rating,
  title: seed.title,
  body: seed.body,
  createdAt: isoDaysAgo(seed.daysAgo),
  verifiedBuyer: seed.verifiedBuyer ?? false,
  vehicleSummary: seed.vehicleSummary,
  response: seed.response
    ? {
        body: seed.response.body,
        respondedAt: isoDaysAgo(Math.max(0, seed.daysAgo - seed.response.daysAfter)),
      }
    : undefined,
}));
