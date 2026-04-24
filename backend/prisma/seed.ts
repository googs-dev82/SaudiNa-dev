import 'dotenv/config';
console.log('Seed script started - loading pg and adapter...');
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env['DATABASE_URL'] || process.env['DIRECT_URL'];
if (!connectionString) {
  throw new Error('DATABASE_URL or DIRECT_URL is required');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const updatedAt = new Date();
  console.log('Seed script started - probing table existence via pg...');
  const poolCheck = new pg.Pool({ connectionString });
  const checkClient = await poolCheck.connect();
  const checkRes = await checkClient.query("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'");
  console.log('PG check - users table count in information_schema:', checkRes.rows[0].count);
  checkClient.release();
  await poolCheck.end();

  console.log('Seeding super admin...');
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@saudina.local' },
    update: { displayName: 'SaudiNA Super Admin', status: 'ACTIVE' },
    create: {
      email: 'admin@saudina.local',
      displayName: 'SaudiNA Super Admin',
      provider: 'INTERNAL',
      status: 'ACTIVE',
      updatedAt,
    },
  });

  console.log('Seeding assignments...');
  await prisma.assignments.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      userId: superAdmin.id,
      roleCode: 'SUPER_ADMIN',
      scopeType: 'GLOBAL',
      active: true,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      userId: superAdmin.id,
      roleCode: 'SUPER_ADMIN',
      scopeType: 'GLOBAL',
      active: true,
      updatedAt,
    },
  });

  console.log('Seeding region and area...');
  const region = await prisma.region.upsert({
    where: { code: 'riyadh' },
    update: { nameAr: 'الرياض', nameEn: 'Riyadh', isActive: true },
    create: {
      code: 'riyadh',
      nameAr: 'الرياض',
      nameEn: 'Riyadh',
      isActive: true,
      updatedAt,
    },
  });

  const area = await prisma.area.upsert({
    where: { code: 'north-riyadh' },
    update: { regionId: region.id, nameAr: 'شمال الرياض', nameEn: 'North Riyadh', isActive: true },
    create: {
      code: 'north-riyadh',
      regionId: region.id,
      nameAr: 'شمال الرياض',
      nameEn: 'North Riyadh',
      isActive: true,
      updatedAt,
    },
  });

  console.log('Seeding committee and categories...');
  await prisma.committee.upsert({
    where: { code: 'PR_COMMITTEE' },
    update: {
      regionId: region.id,
      areaId: area.id,
      level: 'AREA',
      nameAr: 'لجنة العلاقات العامة',
      nameEn: 'PR Committee',
      isActive: true,
    },
    create: {
      code: 'PR_COMMITTEE',
      regionId: region.id,
      areaId: area.id,
      level: 'AREA',
      nameAr: 'لجنة العلاقات العامة',
      nameEn: 'PR Committee',
      isActive: true,
      updatedAt,
    },
  });

  await prisma.resourceCategory.upsert({
    where: { code: 'guidelines' },
    update: { nameAr: 'الإرشادات', nameEn: 'Guidelines' },
    create: {
      code: 'guidelines',
      nameAr: 'الإرشادات',
      nameEn: 'Guidelines',
      updatedAt,
    },
  });

  console.log('Seeding sample recovery meeting...');
  await prisma.recoveryMeeting.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      regionId: region.id,
      areaId: area.id,
      nameAr: 'اجتماع الأمل',
      nameEn: 'Hope Meeting',
      descriptionAr: 'اجتماع أسبوعي للمتعافين',
      descriptionEn: 'Weekly recovery meeting',
      language: 'ARABIC',
      gender: 'MIXED',
      city: 'Riyadh',
      district: 'Olaya',
      dayOfWeek: 'MONDAY',
      startTime: '19:00',
      latitude: 24.7136,
      longitude: 46.6753,
      status: 'PUBLISHED',
      createdById: superAdmin.id,
      updatedAt,
    },
  });

  console.log('Seeding complete!');
}

void main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
