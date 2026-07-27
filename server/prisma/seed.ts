// =============================================================================
// server/prisma/seed.ts
// Initial database seed for SmartDine system.
// Run: npm run db:seed (from server/)
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

  const staffUser = await prisma.user.upsert({
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

  await prisma.user.upsert({
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

  console.log('  ✔ Users seeded: admin, staff, customer');

  // 2. Seed Staff Profiles
  const adminStaff = await prisma.staff.findUnique({ where: { userId: admin.id } });
  if (!adminStaff) {
    await prisma.staff.create({
      data: { userId: admin.id, role: 'manager', shift: 'morning' },
    });
    console.log('  ✔ Staff profile created for admin');
  }

  const alexStaff = await prisma.staff.findUnique({ where: { userId: staffUser.id } });
  if (!alexStaff) {
    await prisma.staff.create({
      data: { userId: staffUser.id, role: 'waiter', shift: 'evening' },
    });
    console.log('  ✔ Staff profile created for staff');
  }

  // 3. Seed Tables
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
  console.log('  ✔ Tables seeded: 5 tables');

  // 4. Seed Expanded Michelin Menu Items
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
      name: 'Wagyu Beef Tenderloin',
      description: 'Grade A5 Japanese Wagyu served with truffle jus, potato puree, and smoked shallots.',
      price: 850.00,
      category: 'Mains',
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947',
    },
    {
      name: 'Pan-Seared Chilean Sea Bass',
      description: 'Wild sea bass served over saffron risotto, braised leeks, and champagne emulsion.',
      price: 680.00,
      category: 'Mains',
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb',
    },
    {
      name: 'Saffron Seafood Paella',
      description: 'Spanish Bomba rice infused with saffron, jumbo prawns, calamari, and black mussels.',
      price: 720.00,
      category: 'Mains',
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a',
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
      name: 'Charred Asparagus & Burrata',
      description: 'Fresh Italian burrata cheese, charred asparagus, heirloom tomatoes, and balsamic reduction.',
      price: 410.00,
      category: 'Starters',
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81',
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
      name: 'Matcha Green Tea Tiramisu',
      description: 'Uji matcha infused ladyfingers layered with mascarpone cream and dusted with green tea powder.',
      price: 390.00,
      category: 'Desserts',
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
    },
    {
      name: 'Signature Berry Mocktail',
      description: 'Muddled fresh berries, mint, lime, and sparkling soda.',
      price: 250.00,
      category: 'Beverages',
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd',
    },
    {
      name: 'Smoked Old Fashioned Cocktail',
      description: 'Bourbon whiskey infused with aromatic bitters, orange peel, and oakwood cold smoke.',
      price: 490.00,
      category: 'Beverages',
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b',
    },
  ];

  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.menuItem.create({ data: item });
    }
  }
  console.log('  ✔ Menu items seeded: 12 expanded dishes across 4 categories');

  // 5. Seed Inventory Items
  const inventoryItems = [
    { name: 'Arborio Rice',           quantity: 8.0,  unit: 'kg',   reorderThreshold: 5.0  },
    { name: 'Wild Mushrooms',         quantity: 3.5,  unit: 'kg',   reorderThreshold: 2.0  },
    { name: 'Parmesan Cheese',        quantity: 4.0,  unit: 'kg',   reorderThreshold: 3.0  },
    { name: 'Atlantic Salmon',        quantity: 12.0, unit: 'kg',   reorderThreshold: 4.0  },
    { name: 'Wagyu Beef',             quantity: 10.0, unit: 'kg',   reorderThreshold: 3.0  },
    { name: 'Chilean Sea Bass',       quantity: 7.0,  unit: 'kg',   reorderThreshold: 2.0  },
    { name: 'Asparagus',              quantity: 6.0,  unit: 'kg',   reorderThreshold: 3.0  },
    { name: 'Sourdough Bread',        quantity: 20.0, unit: 'units',reorderThreshold: 10.0 },
    { name: 'Cherry Tomatoes',        quantity: 5.0,  unit: 'kg',   reorderThreshold: 3.0  },
    { name: 'Romaine Lettuce',        quantity: 2.0,  unit: 'kg',   reorderThreshold: 2.5  }, // low stock
    { name: 'Valrhona Dark Chocolate',quantity: 4.0,  unit: 'kg',   reorderThreshold: 2.0  },
    { name: 'Vanilla Bean Gelato',    quantity: 8.0,  unit: 'L',    reorderThreshold: 3.0  },
    { name: 'Fresh Mint',             quantity: 1.5,  unit: 'kg',   reorderThreshold: 0.5  },
    { name: 'Mixed Berries',          quantity: 3.0,  unit: 'kg',   reorderThreshold: 1.5  },
    { name: 'Extra Virgin Olive Oil', quantity: 6.0,  unit: 'L',    reorderThreshold: 2.0  },
    { name: 'White Truffle Oil',      quantity: 0.8,  unit: 'L',    reorderThreshold: 1.0  }, // low stock
  ];

  for (const inv of inventoryItems) {
    const existing = await prisma.inventoryItem.findFirst({ where: { name: inv.name } });
    if (!existing) {
      await prisma.inventoryItem.create({ data: inv });
    }
  }
  console.log('  ✔ Inventory seeded: 16 items');

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
