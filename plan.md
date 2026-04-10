1.  **Update `src/components/member-card.tsx` to support native sharing:**
    -   Modify `handleShare` to use `navigator.share` if available (with Web Share API). We need to create a `File` object from the canvas blob to share the image natively.
    -   If `navigator.share` is not available, fallback to the current download behavior.
    -   Enhance the visual design of the `MemberCard` to make it more professional, modern, and graphical (e.g., adding an NFC icon or chip icon, improving fonts, adjusting gradients and glow effects).
2.  **Add a monthly deposit reminder feature to `src/app/member/[accountNumber]/page.tsx` (or a subcomponent):**
    -   Create a "Add Reminder to Calendar" button/functionality.
    -   This feature can generate an ICS file (iCalendar format) to allow the user to add a recurring monthly event (e.g., "FDS Monthly Deposit Reminder" on a specific day of the month) to their default calendar app on their mobile device.
3.  **Refine the User Dashboard (`src/app/member/[accountNumber]/page.tsx`):**
    -   Enhance the UI to look more professional and modern.
    -   Use a cleaner layout, perhaps using more grid layouts and better spacing.
    -   Add the calendar reminder button in a logical place, maybe near the member card or in the quick actions menu.
4.  **Pre-commit checks**: run tests and required commands.
