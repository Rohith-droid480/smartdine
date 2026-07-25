// =============================================================================
// server/prisma/seed.ts
// Initial database seed for SmartDine system.
// =============================================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  const passwordHash = await bcrypt.hash('Password123', 12);

  // 1. Seed Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartdine.com' },
    update: {},
    create: {
      email: 'admin@smartdine.com',
      name: 'Admin Manager',
      passwordHash,
      role: 'admin',
      isVerified: true,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@smartdine.com' },
    update: {},
    create: {
      email: 'staff@smartdine.com',
      name: 'Wait Staff Alex',
      passwordHash,
      role: 'staff',
      isVerified: true,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@smartdine.com' },
    update: {},
    create: {
      email: 'customer@smartdine.com',
      name: 'John Customer',
      passwordHash,
      role: 'customer',
      isVerified: true,
    },
  });

  console.log('  Users seeded: admin, staff, customer');

  // 2. Seed Tables
  const tableData = [
    { number: 1, capacity: 2, status: 'free' as const },
    { number: 2, capacity: 2, status: 'free' as const },
    { number: 3, capacity: 4, status: 'free' as const },
    { number: 4, capacity: 4, status: 'free' as const },
    { number: 5, capacity: 6, status: 'free' as const },
  ];

  for (const t of tableData) {
    await prisma.table.upsert({
      where: { number: t.number },
      update: { capacity: t.capacity },
      create: t,
    });
  }

  console.log('  Tables seeded: 5 tables');

  // 3. Seed Menu Items
  const menuItems = [
    {
      name: 'Truffle Mushroom Risotto',
      description: 'Arborio rice cooked with wild mushrooms, white truffle oil, and shaved parmesan.',
      price: 650.00,
      category: 'Mains',
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9',
    },
    {
      name: 'Grilled Salmon Asparagus',
      description: 'Pan-seared Atlantic salmon served with roasted asparagus and lemon butter sauce.',
      price: 850.00,
      category: 'Mains',
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288',
    },
    {
      name: 'Artisanal Garlic Bruschetta',
      description: 'Toasted sourdough topped with vine-ripened tomatoes, fresh basil, and extra virgin olive oil.',
      price: 320.00,
      category: 'Starters',
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f',
    },
    {
      name: 'Classic Caesar Salad',
      description: 'Crisp romaine lettuce, garlic croutons, shaved parmesan, and house-made Caesar dressing.',
      price: 380.00,
      category: 'Starters',
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9',
    },
    {
      name: 'Valrhona Chocolate Fondant',
      description: 'Warm chocolate cake with a molten center, served with vanilla bean gelato.',
      price: 420.00,
      category: 'Desserts',
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c',
    },
    {
      name: 'Signature Berry Mocktail',
      description: 'Muddled fresh berries, mint, lime, and sparkling soda.',
      price: 250.00,
      category: 'Beverages',
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd',
    },
  ];

  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.menuItem.create({ data: item });
    }
  }

  console.log('  Menu items seeded: 6 items');
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
