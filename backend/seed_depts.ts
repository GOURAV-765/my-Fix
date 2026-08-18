import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const s = await prisma.society.findFirst();
  if(!s) {
    console.log('No society found');
    return;
  }
  
  await prisma.department.createMany({
    data: [
      {name: 'Web Development', description: 'Web dev', societyId: s.id},
      {name: 'AI & Machine Learning', description: 'AI', societyId: s.id},
      {name: 'UI/UX Design', description: 'Design', societyId: s.id},
      {name: 'Marketing & PR', description: 'Marketing', societyId: s.id}
    ],
    skipDuplicates: true
  });
  console.log('Departments added');
}

main().catch(console.error);
