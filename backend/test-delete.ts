import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.create({
      data: {
        email: `test_${Date.now()}@example.com`,
        displayName: 'Test',
      }
    });
    console.log('created user', user.id);
    
    await prisma.auditLog.create({
        data: {
            action: 'CREATED',
            resourceType: 'User',
            userId: user.id
        }
    });

    console.log('deleting user...');
    await prisma.user.delete({ where: { id: user.id }});
    console.log('deleted successfully');
  } catch (err: any) {
    console.error('ERROR CATCHED:', err?.code, err?.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
