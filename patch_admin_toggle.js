const fs = require('fs');
let code = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

// Add toggle handle
const handleToggle = `
  const handleToggleMemberStatus = async (memberId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(\`/api/admin/members/\${memberId}\`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${token}\`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        toast.success(currentStatus ? "সদস্যপদ স্থগিত করা হয়েছে" : "সদস্যপদ সক্রিয় করা হয়েছে")
        fetchMembers()
      } else {
        toast.error("স্ট্যাটাস পরিবর্তন করতে ব্যর্থ")
      }
    } catch (err) {
      toast.error("Network error occurred")
    }
  }
`;

if (!code.includes('handleToggleMemberStatus')) {
    code = code.replace(
        '  const handleAddContribution = async (e: React.FormEvent) => {',
        handleToggle + '\n  const handleAddContribution = async (e: React.FormEvent) => {'
    );
}

// Add Toggle Button UI
const buttonCode = `
                        <div className="flex flex-col gap-2 pt-2 border-t mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className={\`w-full \${m.isActive ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'}\`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleMemberStatus(m.id, m.isActive ?? true);
                            }}
                          >
                            {m.isActive !== false ? 'সদস্যপদ স্থগিত করুন' : 'সদস্যপদ সক্রিয় করুন'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
`;

// It seems there's a Card for members. Let's find it.
// First, add isActive to Member type if it's there
if (!code.includes('isActive?: boolean')) {
    code = code.replace(
        '  contributions: Contribution[]',
        '  contributions: Contribution[]\n  isActive?: boolean'
    );
}

fs.writeFileSync('src/app/admin/page.tsx', code);
console.log('patched handleToggleMemberStatus');
