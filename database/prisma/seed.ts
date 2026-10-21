import { PrismaClient } from '../src/generated/client/index.js';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await argon2.hash(adminPassword);
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: 'ADMIN' },
      create: {
        email: adminEmail,
        passwordHash,
        displayName: process.env.ADMIN_NAME ?? 'Administrador',
        role: 'ADMIN',
        language: 'es',
      },
    });
    console.log(`✔ Admin listo: ${admin.email}`);
  } else {
    console.log('ℹ️  ADMIN_EMAIL/ADMIN_PASSWORD no definidos — se omite creación de admin.');
  }

  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
