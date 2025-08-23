import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await db.admin.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      name: 'System Administrator'
    }
  })

  console.log('Admin user created:', admin)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })