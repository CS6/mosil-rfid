import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create a dummy user for testing
  const user = await prisma.user.upsert({
    where: { uuid: 'dummy-user-uuid' },
    update: {},
    create: {
      uuid: 'dummy-user-uuid',
      account: 'testuser',
      password: 'hashed-password-placeholder', // In real app, this should be hashed
      code: 'TST',
      name: 'Test User',
      userType: 'admin',
      isActive: true,
    },
  });

  console.log('Created user:', user);
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });