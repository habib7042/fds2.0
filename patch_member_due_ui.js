const fs = require('fs');
let code = fs.readFileSync('src/app/member/[accountNumber]/page.tsx', 'utf8');

// 1. Due calculation logic
const dueCalcCode = `
  // Calculate Due Info
  const calculateDue = () => {
    if (!member) return { months: 0, amount: 0, status: 'No Due' };

    const joinDate = new Date(member.createdAt);
    const currentDate = new Date();

    let totalMonths = (currentDate.getFullYear() - joinDate.getFullYear()) * 12;
    totalMonths -= joinDate.getMonth();
    totalMonths += currentDate.getMonth() + 1; // Include current month

    // Stop accruing dues if inactive. This requires knowing WHEN they became inactive,
    // but without tracking that, we can assume if inactive, dues don't increment from now.
    // If they are inactive, we ideally stop at updatedAt, but to keep it simple, we just use current date or their last update.
    if (member.isActive === false) {
      const updateDate = new Date(member.updatedAt);
      totalMonths = (updateDate.getFullYear() - joinDate.getFullYear()) * 12;
      totalMonths -= joinDate.getMonth();
      totalMonths += updateDate.getMonth() + 1;
    }

    if (totalMonths <= 0) totalMonths = 1;

    const expectedContribution = totalMonths * 1000;
    const paidContribution = member.contributions.reduce((sum, c) => sum + c.amount, 0);

    const dueAmount = expectedContribution - paidContribution;
    const dueMonths = Math.ceil(dueAmount / 1000);

    return {
      months: dueMonths > 0 ? dueMonths : 0,
      amount: dueAmount > 0 ? dueAmount : 0,
    };
  };

  const dueInfo = calculateDue();
`;

code = code.replace(
    '  const getTotalBalance = () => {',
    dueCalcCode + '\n  const getTotalBalance = () => {'
);

// 2. Add Inactive warning alert above Member Card
const inactiveWarning = `
        {/* Inactive Member Warning */}
        {member.isActive === false && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl flex items-center gap-3 shadow-sm"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-sm font-medium leading-relaxed">
              আপনার সদস্যপদ স্থগিত করা হয়েছে। নতুন কোনো চাঁদা যোগ করা যাবে না। তবে আপনার জমাকৃত টাকা ও হিসাব সুরক্ষিত আছে।
            </div>
          </motion.div>
        )}
`;

code = code.replace(
    '{/* Member Card Section */}',
    inactiveWarning + '\n        {/* Member Card Section */}'
);

// 3. UI Update for Quick Actions / Stats
// Right now there's a 3-column grid for Quick Actions / Stats. Let's modify it to include due amount.
// First, find the grid.
const oldGrid = `<div className="grid grid-cols-3 gap-3">
           <Card className="bg-white border-0 shadow-md">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <DollarSign className="h-5 w-5" />
                 </div>
                 <div>
                    <div className="text-xl font-bold text-gray-900">৳{toBengaliNumber(getTotalBalance().toFixed(0))}</div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">মোট স্থিতি</div>
                 </div>
              </CardContent>
           </Card>

           <Card className="bg-white border-0 shadow-md">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <TrendingUp className="h-5 w-5" />
                 </div>
                 <div>
                    <div className="text-xl font-bold text-gray-900">৳{toBengaliNumber(personalContributionSum)}</div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">জমা</div>
                 </div>
              </CardContent>
           </Card>

           <Card className="bg-white border-0 shadow-md">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Users className="h-5 w-5" />
                 </div>
                 <div>
                    <div className="text-xl font-bold text-gray-900">{toBengaliNumber(member.contributions.length)}</div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">কিস্তি</div>
                 </div>
              </CardContent>
           </Card>
        </div>`;

const newGrid = `<div className="grid grid-cols-2 gap-3">
           <Card className="bg-white border-0 shadow-md">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <TrendingUp className="h-5 w-5" />
                 </div>
                 <div>
                    <div className="text-xl font-bold text-gray-900">৳{toBengaliNumber(personalContributionSum)}</div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">মোট জমা</div>
                 </div>
              </CardContent>
           </Card>

           <Card className={\`bg-white border-0 shadow-md ring-1 \${dueInfo.amount > 0 ? 'ring-rose-200' : 'ring-emerald-200'}\`}>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                 <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${dueInfo.amount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}\`}>
                    <AlertCircle className="h-5 w-5" />
                 </div>
                 <div>
                    <div className={\`text-xl font-bold \${dueInfo.amount > 0 ? 'text-rose-600' : 'text-emerald-600'}\`}>
                      ৳{toBengaliNumber(dueInfo.amount)}
                    </div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1 flex gap-1 justify-center items-center">
                       বকেয়া
                       {dueInfo.months > 0 && <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full">{toBengaliNumber(dueInfo.months)} মাস</span>}
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>`;

if(code.includes('grid-cols-3 gap-3')) {
  code = code.replace(oldGrid, newGrid);
} else {
  console.log("Could not find grid cols to replace");
}

fs.writeFileSync('src/app/member/[accountNumber]/page.tsx', code);
console.log('patched UI member due');
