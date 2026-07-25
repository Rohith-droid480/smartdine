// =============================================================================
// server/prisma/seed.ts
// Development seed script — placeholder structure.
// Realistic data will be added in H36–H42 per BUILD_PLAN.md.
// Run: npm run db:seed (from server/)
// =============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱  Starting database seed...');

  // TODO (H36-H42): Add realistic 2-3 week order history seed data.
  // Seed order:
  //   1. Restaurant config
  //   2. Menu items (10-20 dishes across 3-4 categories)
  //   3. Tables (10-15 tables with varied capacities)
  //   4. Admin + staff users
  //   5. Inventory items linked to menu dishes
  //   6. Historical orders (2-3 weeks, realistic day/time distribution)
  //   7. Test customer accounts

  console.log('✅  Seed complete (placeholder — full seed coming in H36)');
}

main()
  .catch((err) => {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
