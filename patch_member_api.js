const fs = require('fs');
let code = fs.readFileSync('src/app/api/admin/members/route.ts', 'utf8');

// Include isActive when fetching members
code = code.replace(
    /include: \{/,
    'include: {\n        _count: true,'
);
// We don't really need to add isActive if we fetch all fields by default, but let's check what it fetches.
// It uses findMany. findMany returns all scalar fields unless select is used.
// So isActive will be included by default!
console.log('Member API is fine');
