import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Connection successful.');

    console.log('Listing tables using raw query...');
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';`;
    console.log('Tables:', tables);

    console.log('Testing Region count...');
    const count = await prisma.region.count();
    console.log('Region count:', count);

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
