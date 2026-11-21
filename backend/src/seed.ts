import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from './config/db';
import { MembershipPlan } from './modules/members/membershipPlan.model';
import { Court } from './modules/courts/court.model';
import { Category, Product } from './modules/products/product.model';
import { MenuItem, Table } from './modules/cafeteria/cafeteria.model';

const seedData = async () => {
  await connectDB();
  console.log('🌱 Seeding initial club data...');

  // 1. Membership Plans (Gold, Silver, Junior)
  const existingPlans = await MembershipPlan.countDocuments();
  if (existingPlans === 0) {
    await MembershipPlan.create([
      {
        name: 'Gold Membership',
        tier: 'gold',
        description: 'Premium membership with full access and maximum club discounts.',
        price: 15000,
        durationMonths: 12,
        discountPercentage: 20,
        courtBookingDiscount: 25,
        shopDiscount: 15,
        cafeDiscount: 15,
        maxBookingsPerDay: 2,
        benefits: ['Unlimited court access', '25% court discount', '15% shop & cafe discount', 'VIP lounge access'],
        isActive: true,
      },
      {
        name: 'Silver Membership',
        tier: 'silver',
        description: 'Standard membership with regular court access and member pricing.',
        price: 9000,
        durationMonths: 12,
        discountPercentage: 10,
        courtBookingDiscount: 15,
        shopDiscount: 10,
        cafeDiscount: 5,
        maxBookingsPerDay: 2,
        benefits: ['Standard court booking', '15% court discount', '10% shop discount'],
        isActive: true,
      },
      {
        name: 'Junior Membership',
        tier: 'junior',
        description: 'Discounted membership plan for youth members under 18 years of age.',
        price: 5000,
        durationMonths: 12,
        discountPercentage: 15,
        courtBookingDiscount: 20,
        shopDiscount: 10,
        cafeDiscount: 10,
        maxBookingsPerDay: 1,
        benefits: ['Weekend training slots', 'Junior coaching sessions', '20% court discount'],
        isActive: true,
      },
    ]);
    console.log('✅ Membership plans seeded');
  }

  // 2. Courts (Tennis & Cricket)
  const existingCourts = await Court.countDocuments();
  if (existingCourts === 0) {
    await Court.create([
      {
        name: 'Centre Court (Tennis)',
        type: 'tennis',
        description: 'Synthetic grass championship tennis court with floodlights.',
        status: 'available',
        memberPrice: 400,
        walkInPrice: 700,
        facilities: ['Floodlights', 'Spectator Seating', 'Locker Room Access'],
        isActive: true,
      },
      {
        name: 'Court 2 (Clay Tennis)',
        type: 'tennis',
        description: 'Professional red clay tennis court.',
        status: 'available',
        memberPrice: 350,
        walkInPrice: 600,
        facilities: ['Clay Surface', 'Ball Boy Assistance'],
        isActive: true,
      },
      {
        name: 'Cricket Pitch A (Net Practice)',
        type: 'cricket',
        description: 'Astro-turf cricket practice nets with bowling machine support.',
        status: 'available',
        memberPrice: 500,
        walkInPrice: 850,
        facilities: ['Astro-Turf', 'Bowling Machine', 'Protective Netting'],
        isActive: true,
      },
      {
        name: 'Main Cricket Ground',
        type: 'cricket',
        description: 'Full-size cricket ground for 20-over matches and tournaments.',
        status: 'available',
        memberPrice: 2500,
        walkInPrice: 4500,
        facilities: ['Pavilion', 'Scoreboard', 'Umpire Room'],
        isActive: true,
      },
    ]);
    console.log('✅ Courts seeded');
  }

  // 3. Shop Categories & Products
  const existingCats = await Category.countDocuments();
  if (existingCats === 0) {
    const racketsCat = await Category.create({ name: 'Rackets', slug: 'rackets', description: 'Tennis and badminton rackets' });
    const ballsCat = await Category.create({ name: 'Balls & Equipment', slug: 'balls-equipment', description: 'Match balls, shuttlecocks, and training accessories' });
    const apparelCat = await Category.create({ name: 'Apparel & Shoes', slug: 'apparel-shoes', description: 'Sports jerseys, shorts, and court shoes' });

    await Product.create([
      {
        name: 'Wilson Pro Staff 97 Tennis Racket',
        category: racketsCat._id,
        sku: 'RKT-WIL-001',
        price: 18999,
        memberPrice: 16999,
        stock: 12,
        lowStockThreshold: 3,
        brand: 'Wilson',
        isAvailableOnline: true,
        isAvailableInStore: true,
      },
      {
        name: 'Slazenger Wimbledon Tennis Balls (Pack of 4)',
        category: ballsCat._id,
        sku: 'BAL-SLAZ-004',
        price: 899,
        memberPrice: 799,
        stock: 50,
        lowStockThreshold: 10,
        brand: 'Slazenger',
        isAvailableOnline: true,
        isAvailableInStore: true,
      },
      {
        name: 'SG Club Leather Cricket Ball',
        category: ballsCat._id,
        sku: 'BAL-SG-001',
        price: 650,
        memberPrice: 550,
        stock: 35,
        lowStockThreshold: 5,
        brand: 'SG',
        isAvailableOnline: true,
        isAvailableInStore: true,
      },
      {
        name: 'Asics Gel-Resolution 9 Tennis Shoes',
        category: apparelCat._id,
        sku: 'SHO-ASC-009',
        price: 11999,
        memberPrice: 10499,
        stock: 8,
        lowStockThreshold: 2,
        brand: 'Asics',
        isAvailableOnline: true,
        isAvailableInStore: true,
      },
    ]);
    console.log('✅ Categories and Products seeded');
  }

  // 4. Cafeteria Tables & Menu
  const existingTables = await Table.countDocuments();
  if (existingTables === 0) {
    await Table.create([
      { tableNumber: 'T-01', capacity: 2, status: 'available', location: 'Patio' },
      { tableNumber: 'T-02', capacity: 4, status: 'available', location: 'Indoor' },
      { tableNumber: 'T-03', capacity: 4, status: 'available', location: 'Indoor' },
      { tableNumber: 'T-04', capacity: 6, status: 'available', location: 'Lounge' },
      { tableNumber: 'T-05', capacity: 8, status: 'available', location: 'Courtside Terrace' },
    ]);

    await MenuItem.create([
      { name: 'Fresh Protein Shake (Whey & Banana)', category: 'beverages', price: 180, memberPrice: 150, isAvailable: true },
      { name: 'Cold Pressed Orange Juice', category: 'beverages', price: 120, memberPrice: 100, isAvailable: true },
      { name: 'Grilled Chicken & Avocado Wrap', category: 'food', price: 280, memberPrice: 240, isAvailable: true },
      { name: 'Paneer Tikka Brown Rice Bowl', category: 'food', price: 260, memberPrice: 220, isAvailable: true },
      { name: 'Energy Snack Bar (Granola & Almond)', category: 'snacks', price: 90, memberPrice: 80, isAvailable: true },
      { name: 'Espresso / Americano', category: 'beverages', price: 110, memberPrice: 90, isAvailable: true },
    ]);
    console.log('✅ Tables and Cafe menu seeded');
  }

  console.log('✨ Seed completed successfully!');
  await mongoose.disconnect();
};

seedData().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
