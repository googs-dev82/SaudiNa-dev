import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pooledUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;
const connectionString = directUrl ?? pooledUrl;

if (!connectionString) {
  throw new Error('Missing database connection string.');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  console.log('Recent Users:');
  console.log(JSON.stringify(users, null, 2));

  const totalUsers = await prisma.user.count();
  console.log('\nTotal Users:', totalUsers);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
