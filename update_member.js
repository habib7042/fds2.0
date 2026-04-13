const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

schema = schema.replace(
    '  accountNumber   String   @unique',
    '  accountNumber   String   @unique\n  isActive        Boolean  @default(true)'
);
fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Added isActive to Member model');
