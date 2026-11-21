import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from './config/db';
import { User } from './modules/auth/auth.model';
import { MembershipPlan } from './modules/members/membershipPlan.model';
import { Member } from './modules/members/member.model';
import { Court } from './modules/courts/court.model';
import { Category, Product } from './modules/products/product.model';
import { MenuItem, Table } from './modules/cafeteria/cafeteria.model';
import { Employee } from './modules/employees/employee.model';
import { Trial } from './modules/trials/trial.model';

const seedData = async () => {
  await connectDB();
  console.log('🌱 Seeding initial club data...');

  // 1. Membership Plans (Free Trial, Gold, Silver, Junior)
  let trialPlan = await MembershipPlan.findOne({ tier: 'trial' });
  if (!trialPlan) {
    trialPlan = await MembershipPlan.create({
      name: '7-Day Free Trial',
      tier: 'trial',
      description: 'Experience full club benefits for 7 days at zero cost with complimentary session booking.',
      price: 0,
      durationMonths: 0,
      durationDays: 7,
      discountPercentage: 10,
      courtBookingDiscount: 10,
      shopDiscount: 5,
      cafeDiscount: 5,
      maxBookingsPerDay: 1,
      benefits: ['7 Days Full Club Access', '1 Free Trial Court Session', 'Complimentary Equipment Rental'],
      isActive: true,
    });
    console.log('✅ 7-Day Free Trial plan created');
  }

  let goldPlan = await MembershipPlan.findOne({ tier: 'gold' });
  if (!goldPlan) {
    goldPlan = await MembershipPlan.create({
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
    });
    console.log('✅ Gold plan created');
  }

  let silverPlan = await MembershipPlan.findOne({ tier: 'silver' });
  if (!silverPlan) {
    silverPlan = await MembershipPlan.create({
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
    });
    console.log('✅ Silver plan created');
  }

  let juniorPlan = await MembershipPlan.findOne({ tier: 'junior' });
  if (!juniorPlan) {
    juniorPlan = await MembershipPlan.create({
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
    });
    console.log('✅ Junior plan created');
  }

  // 2. Users & Staff Credentials
  const createOrGetUser = async (data: {
    name: string;
    email: string;
    password?: string;
    role: 'super_admin' | 'owner' | 'manager' | 'receptionist' | 'shop_staff' | 'bar_staff' | 'accountant' | 'coach' | 'member' | 'visitor';
    phone: string;
  }) => {
    let user = await User.findOne({ email: data.email });
    if (!user) {
      user = await User.create({
        name: data.name,
        email: data.email,
        password: data.password || 'Password123',
        role: data.role,
        phone: data.phone,
        isActive: true,
      });
      console.log(`👤 User created: ${data.name} (${data.role})`);
    } else {
      user.password = data.password || 'Password123';
      user.role = data.role;
      user.isActive = true;
      await user.save();
    }
    return user;
  };

  const adminUser = await createOrGetUser({
    name: 'Admin Master',
    email: 'admin@championsclub.com',
    role: 'super_admin',
    phone: '9876543200',
  });

  const managerUser = await createOrGetUser({
    name: 'Vikram Mehta (Manager)',
    email: 'manager@championsclub.com',
    role: 'manager',
    phone: '9876543201',
  });

  const receptionUser = await createOrGetUser({
    name: 'Pooja Verma (Receptionist)',
    email: 'reception@championsclub.com',
    role: 'receptionist',
    phone: '9876543202',
  });

  const coachUser = await createOrGetUser({
    name: 'Coach Rohan (Head Coach)',
    email: 'coach@championsclub.com',
    role: 'coach',
    phone: '9876543203',
  });

  const shopStaffUser = await createOrGetUser({
    name: 'Anil Kumar (Shop Staff)',
    email: 'shop@championsclub.com',
    role: 'shop_staff',
    phone: '9876543204',
  });

  const barStaffUser = await createOrGetUser({
    name: 'Karan Singhania (Bar Staff)',
    email: 'bar@championsclub.com',
    role: 'bar_staff',
    phone: '9876543205',
  });

  const goldUser = await createOrGetUser({
    name: 'Arjun Kapoor (Gold Member)',
    email: 'goldmember@example.com',
    role: 'member',
    phone: '9876543210',
  });

  const trialUser = await createOrGetUser({
    name: 'Neha Saxena (Trial Member)',
    email: 'trialmember@example.com',
    role: 'member',
    phone: '9876543211',
  });

  const visitorUser = await createOrGetUser({
    name: 'Siddharth Roy (Visitor)',
    email: 'visitor@example.com',
    role: 'visitor',
    phone: '9876543212',
  });

  // 3. Employee Records for Staff
  const createOrGetEmployee = async (user: typeof managerUser, dept: string, title: string, salary: number) => {
    let emp = await Employee.findOne({ userId: user._id });
    if (!emp) {
      emp = await Employee.create({
        userId: user._id,
        department: dept,
        designation: title,
        salary,
        joiningDate: new Date(),
        isActive: true,
      });
      console.log(`👔 Employee profile created: ${title}`);
    }
    return emp;
  };

  await createOrGetEmployee(managerUser, 'Operations', 'Club Operations Manager', 75000);
  await createOrGetEmployee(receptionUser, 'Front Office', 'Front Desk Executive', 35000);
  await createOrGetEmployee(coachUser, 'Sports & Coaching', 'Head Tennis Coach', 60000);
  await createOrGetEmployee(shopStaffUser, 'Retail', 'Sports Shop Specialist', 30000);
  await createOrGetEmployee(barStaffUser, 'Hospitality', 'Cafeteria Supervisor', 32000);

  // 4. Memberships for Gold & Trial Members
  const existingGoldMember = await Member.findOne({ userId: goldUser._id });
  if (!existingGoldMember && goldPlan) {
    const start = new Date();
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    await Member.create({
      userId: goldUser._id,
      membershipPlan: goldPlan._id,
      tier: 'gold',
      status: 'active',
      startDate: start,
      endDate: end,
      amountPaid: goldPlan.price,
      paymentMethod: 'online',
      paymentReference: 'TXN-GOLD-INIT-001',
      notes: 'Initial Gold membership seeded',
    });
    console.log('🎖️  Gold membership created for Arjun Kapoor');
  }

  const existingTrialMember = await Member.findOne({ userId: trialUser._id });
  if (!existingTrialMember && trialPlan) {
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    await Member.create({
      userId: trialUser._id,
      membershipPlan: trialPlan._id,
      tier: 'trial',
      status: 'active',
      startDate: start,
      endDate: end,
      amountPaid: 0,
      paymentMethod: 'free_trial',
      notes: '7-Day Free trial activated',
    });
    console.log('🆓 Free Trial membership created for Neha Saxena');
  }

  // 5. Sample Trial Session Registration
  const existingTrial = await Trial.findOne({ email: 'siddharth@example.com' });
  if (!existingTrial) {
    await Trial.create({
      userId: visitorUser._id,
      name: 'Siddharth Roy',
      email: 'siddharth@example.com',
      phone: '9876543212',
      sport: 'tennis',
      preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      preferredTimeSlot: '09:00 AM - 10:00 AM',
      experienceLevel: 'beginner',
      status: 'registered',
      assignedCoach: coachUser._id,
      feedbackNotes: 'Interested in beginner weekend tennis classes',
    });
    console.log('🎾 Trial session booked for visitor Siddharth Roy');
  }

  // 6. Courts
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

  // 7. Shop Categories & Products
  const existingCats = await Category.countDocuments();
  if (existingCats === 0) {
    const racketsCat = await Category.create({ name: 'Rackets', slug: 'rackets', description: 'Tennis and badminton rackets' });
    const ballsCat = await Category.create({ name: 'Balls & Equipment', slug: 'balls-equipment', description: 'Match balls, shuttlecocks, and accessories' });
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

  // 8. Cafeteria Tables & Menu
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
