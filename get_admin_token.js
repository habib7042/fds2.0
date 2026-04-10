const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const admin = await prisma.admin.findFirst();
    if(admin) {
        const token = Buffer.from(`${admin.id}:${Date.now()}`).toString("base64")
        console.log("Token:", token);
    } else {
        console.log("No admin found");
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
