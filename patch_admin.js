const fs = require('fs');
let code = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

// 1. Update main container background
code = code.replace(
  '<div className="min-h-screen bg-background pb-20 md:pb-8">',
  '<div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20 md:pb-8">'
);

// 2. Update Mobile Header
code = code.replace(
  '<div className="md:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-20">',
  '<div className="md:hidden flex items-center justify-between p-4 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">'
);

// 3. Update Desktop Header
code = code.replace(
  '<div className="hidden md:flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">',
  '<div className="hidden md:flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">'
);
code = code.replace(
  '<h1 className="text-3xl font-bold tracking-tight text-gray-800">',
  '<h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">'
);

// 4. Update Stats Cards (make them punchier)
code = code.replace(
  '<Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/50">',
  '<Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 relative bg-gradient-to-br from-blue-500 to-blue-600 text-white group">'
);
code = code.replace(
  '<CardTitle className="text-sm font-medium text-blue-700">মোট সদস্য</CardTitle>',
  '<CardTitle className="text-sm font-medium text-blue-50/90 z-10 relative">মোট সদস্য</CardTitle>'
);
code = code.replace(
  '<Users className="h-4 w-4 text-blue-500" />',
  '<div className="p-2 bg-white/20 rounded-lg z-10 relative group-hover:scale-110 transition-transform"><Users className="h-5 w-5 text-white" /></div>'
);
code = code.replace(
  '<div className="text-2xl font-bold text-blue-900">{toBengaliNumber(members.length)}</div>',
  '<div className="text-3xl font-bold text-white z-10 relative mt-2">{toBengaliNumber(members.length)}</div><div className="absolute -bottom-4 -right-4 text-white/10 rotate-12 scale-150"><Users className="h-24 w-24" /></div>'
);

code = code.replace(
  '<Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-white to-green-50/50">',
  '<Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 relative bg-gradient-to-br from-emerald-500 to-emerald-600 text-white group">'
);
code = code.replace(
  '<CardTitle className="text-sm font-medium text-green-700">মোট তহবিল</CardTitle>',
  '<CardTitle className="text-sm font-medium text-emerald-50/90 z-10 relative">মোট তহবিল</CardTitle>'
);
code = code.replace(
  '<Wallet className="h-4 w-4 text-green-600" />',
  '<div className="p-2 bg-white/20 rounded-lg z-10 relative group-hover:scale-110 transition-transform"><Wallet className="h-5 w-5 text-white" /></div>'
);
code = code.replace(
  '<div className="text-2xl font-bold text-green-700">৳{toBengaliNumber(getTotalFund().toFixed(2))}</div>',
  '<div className="text-3xl font-bold text-white z-10 relative mt-2">৳{toBengaliNumber(getTotalFund().toFixed(2))}</div><div className="absolute -bottom-4 -right-4 text-white/10 rotate-12 scale-150"><Wallet className="h-24 w-24" /></div>'
);

code = code.replace(
  '<Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50/50">',
  '<Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 relative bg-gradient-to-br from-purple-500 to-purple-600 text-white group">'
);
code = code.replace(
  '<CardTitle className="text-sm font-medium text-purple-700">জমা (চলতি মাস)</CardTitle>',
  '<CardTitle className="text-sm font-medium text-purple-50/90 z-10 relative">জমা (চলতি মাস)</CardTitle>'
);
code = code.replace(
  '<TrendingUp className="h-4 w-4 text-purple-500" />',
  '<div className="p-2 bg-white/20 rounded-lg z-10 relative group-hover:scale-110 transition-transform"><TrendingUp className="h-5 w-5 text-white" /></div>'
);
code = code.replace(
  '<div className="text-2xl font-bold text-purple-900">৳{toBengaliNumber(getPaymentStats().totalAmount)}</div>',
  '<div className="text-3xl font-bold text-white z-10 relative mt-2">৳{toBengaliNumber(getPaymentStats().totalAmount)}</div><div className="absolute -bottom-4 -right-4 text-white/10 rotate-12 scale-150"><TrendingUp className="h-24 w-24" /></div>'
);

code = code.replace(
  '<Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-white to-red-50/50">',
  '<Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 relative bg-gradient-to-br from-rose-500 to-rose-600 text-white group">'
);
code = code.replace(
  '<CardTitle className="text-sm font-medium text-red-700">বকেয়া সদস্য</CardTitle>',
  '<CardTitle className="text-sm font-medium text-rose-50/90 z-10 relative">বকেয়া সদস্য</CardTitle>'
);
code = code.replace(
  '<AlertCircle className="h-4 w-4 text-red-500" />',
  '<div className="p-2 bg-white/20 rounded-lg z-10 relative group-hover:scale-110 transition-transform"><AlertCircle className="h-5 w-5 text-white" /></div>'
);
code = code.replace(
  '<div className="text-2xl font-bold text-red-600">{toBengaliNumber(getPaymentStats().unpaidMembers)}</div>',
  '<div className="text-3xl font-bold text-white z-10 relative mt-2">{toBengaliNumber(getPaymentStats().unpaidMembers)}</div><div className="absolute -bottom-4 -right-4 text-white/10 rotate-12 scale-150"><AlertCircle className="h-24 w-24" /></div>'
);

// 5. Update Tabs and Member Cards
code = code.replace(
  '<TabsList className="grid w-full grid-cols-5 lg:w-[600px]">',
  '<TabsList className="grid w-full grid-cols-5 lg:w-[600px] p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl">'
);

code = code.replace(
  '<Card className="hover:shadow-md transition-shadow">',
  '<Card className="hover:shadow-xl transition-all duration-300 border-slate-200/60 hover:border-blue-200 bg-white/80 backdrop-blur-sm group">'
);

code = code.replace(
  '<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">',
  '<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-slate-100 dark:border-slate-800">'
);

code = code.replace(
  '<Badge variant="outline">{toBengaliNumber(member.accountNumber)}</Badge>',
  '<Badge variant="secondary" className="bg-slate-100 text-slate-600 font-mono text-[10px] py-0">{toBengaliNumber(member.accountNumber)}</Badge>'
);

// 6. Modernize Tables
code = code.replace(
  '<Table>',
  '<Table className="border-collapse">'
);
code = code.replace(
  '<TableHeader>',
  '<TableHeader className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">'
);
code = code.replace(
  /<TableRow key={member\.id}>/g,
  '<TableRow key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">'
);

// 7. Enhance the add/action buttons
code = code.replace(
  'className="bg-blue-600 hover:bg-blue-700 text-white"',
  'className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow transition-all"'
);
code = code.replace(
  'className="bg-green-600 hover:bg-green-700 text-white"',
  'className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm hover:shadow transition-all"'
);


fs.writeFileSync('src/app/admin/page.tsx', code);
