const fs = require('fs');
let code = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

// The mobile view has a Card for each member, and desktop has a Table. Let's find where they are.
// Looking for `setMembers(data)` to know it's a list.
// The list maps `filteredMembers.map((m) => (`

// First let's do the mobile card
code = code.replace(
    /<\/div>\s*<\/CardContent>\s*<\/Card>/g,
    `</div>
                        <div className="flex flex-col gap-2 pt-2 border-t mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className={\`w-full \${m.isActive !== false ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 border-emerald-200'}\`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleMemberStatus(m.id, m.isActive ?? true);
                            }}
                          >
                            {m.isActive !== false ? 'সদস্যপদ স্থগিত করুন' : 'সদস্যপদ সক্রিয় করুন'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>`
);

// Second let's do the Desktop Table Action Button
code = code.replace(
    /<Button\s+variant="ghost"\s+size="sm"\s+onClick=\{.*setSelectedMember\(m\).*\}>\s*<Eye className="h-4 w-4" \/>\s*<\/Button>/g,
    `<Button variant="ghost" size="sm" onClick={() => setSelectedMember(m)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={m.isActive !== false ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleMemberStatus(m.id, m.isActive ?? true);
                              }}
                            >
                              {m.isActive !== false ? 'স্থগিত' : 'সক্রিয়'}
                            </Button>`
);

// We need to also add a badge to indicate the status next to the name.
// For mobile:
code = code.replace(
    /<p className="font-semibold text-slate-800 dark:text-slate-200 text-lg">\{m\.name\}<\/p>/g,
    `<p className="font-semibold text-slate-800 dark:text-slate-200 text-lg flex items-center gap-2">
                              {m.name}
                              {m.isActive === false && <Badge variant="destructive" className="text-[10px]">স্থগিত</Badge>}
                            </p>`
);

// For desktop:
code = code.replace(
    /<div className="font-medium text-slate-800 dark:text-slate-200">\{m\.name\}<\/div>/g,
    `<div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                {m.name}
                                {m.isActive === false && <Badge variant="destructive" className="text-[10px]">স্থগিত</Badge>}
                              </div>`
);

fs.writeFileSync('src/app/admin/page.tsx', code);
console.log('patched UI');
