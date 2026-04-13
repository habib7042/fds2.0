const fs = require('fs');
let code = fs.readFileSync('src/app/member/[accountNumber]/page.tsx', 'utf8');

// 1. Calculate the due month and amount
// A simple way is to check the diff between the member's registration month (or a fixed start month) and current month minus contributions.
// But wait, the standard subscription is 1000 TK per month.
// Let's add a helper inside the component to calculate this.

const dueCalcCode = `
  // Calculate Due Info
  const calculateDue = () => {
    if (!member) return { months: 0, amount: 0, status: 'No Due' };

    // Member join date or fixed start date
    const joinDate = new Date(member.createdAt);
    const currentDate = new Date();

    // Calculate total months since joining
    let totalMonths = (currentDate.getFullYear() - joinDate.getFullYear()) * 12;
    totalMonths -= joinDate.getMonth();
    totalMonths += currentDate.getMonth() + 1; // Include current month

    if (totalMonths <= 0) totalMonths = 1;

    // If the member is inactive, maybe they don't accrue dues after being inactive?
    // The requirement says: "সদস্যপদ বাতিল করলেও তার টাকা জমা পড়ে থাকবে। কিন্তু তার নামে আর কোনো চাঁদা যোগ করা যাবে না।"
    // This implies we shouldn't show new dues if inactive? Or maybe just stop counting months.
    // Assuming if inactive, we calculate dues until updated at or just simply ignore for now or use updated date.

    const expectedContribution = totalMonths * 1000;
    const paidContribution = member.contributions.reduce((sum, c) => sum + c.amount, 0);

    const dueAmount = expectedContribution - paidContribution;
    const dueMonths = Math.ceil(dueAmount / 1000);

    return {
      months: dueMonths > 0 ? dueMonths : 0,
      amount: dueAmount > 0 ? dueAmount : 0,
      status: dueAmount > 0 ? \`\${dueMonths} মাসের বকেয়া\` : 'কোনো বকেয়া নেই'
    };
  };

  const dueInfo = calculateDue();
`;

// Insert the due calc before `const handleShareCard` or similar
code = code.replace(
    '  const handleShareCard = async () => {',
    dueCalcCode + '\n  const handleShareCard = async () => {'
);

// 2. Display the due on the UI
// Let's find where stats are displayed, maybe total balance card.
const statsCodeToReplace = `          {/* Main Info Cards */}`;
const statsCodeReplacement = `          {/* Main Info Cards */}
          {member && member.isActive === false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl flex items-center justify-center gap-2 font-medium"
            >
              <AlertCircle className="w-5 h-5" />
              আপনার সদস্যপদ স্থগিত করা হয়েছে। নতুন কোনো চাঁদা যোগ করা যাবে না।
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">সর্বমোট চাঁদা</p>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                ৳{toBengaliNumber(personalContributionSum)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={\`p-4 rounded-2xl shadow-sm border \${dueInfo.amount > 0 ? 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800' : 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'}\`}
            >
              <p className={\`text-sm mb-1 \${dueInfo.amount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}\`}>
                বকেয়া (সর্বমোট)
              </p>
              <div className="flex flex-col">
                <p className={\`text-xl font-bold \${dueInfo.amount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}\`}>
                  ৳{toBengaliNumber(dueInfo.amount)}
                </p>
                {dueInfo.amount > 0 && (
                  <p className="text-xs text-rose-500/80 font-medium">
                    {toBengaliNumber(dueInfo.months)} মাসের বকেয়া
                  </p>
                )}
              </div>
            </motion.div>
          </div>`;

// But first I need to check what the existing UI has. Let's inspect the page first before replacing blindly.
fs.writeFileSync('patch_temp.js', '');
console.log('Prepared');
