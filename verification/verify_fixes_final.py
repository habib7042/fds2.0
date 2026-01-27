import time
import random
from playwright.sync_api import sync_playwright

def verify_fixes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Login as Admin to create member
        print("Logging in as Admin...")
        page.goto("http://localhost:3000")
        page.click("button:has-text('অ্যাডমিন')")
        page.fill("input[id='username']", "admin")
        page.fill("input[id='password']", "admin123")
        page.click("button[type='submit']")
        page.wait_for_url("http://localhost:3000/admin")

        # 2. Add Member
        print("Adding a member...")
        page.click("button:has-text('সদস্য যোগ')")

        unique_phone = f"017{random.randint(10000000, 99999999)}"
        unique_name = f"Card Test {unique_phone}"

        page.fill("input[id='name']", unique_name)
        page.fill("input[id='phone']", unique_phone)
        page.fill("textarea[id='address']", "Dhaka")
        page.click("button:has-text('সংরক্ষণ করুন')")

        print(f"Member created: {unique_name}")
        page.reload()
        page.wait_for_selector(f"text={unique_name}")

        page.click("button:has-text('লগআউট')")

        # 3. Login as Member
        print("Logging in as Member...")
        page.click("button:has-text('সদস্য')")
        page.fill("input[id='mobileNumber']", unique_phone)
        for digit in "1234":
            page.click(f"button:has-text('{digit}')")
        page.click("button:has-text('লগইন')")

        print("Waiting for member dashboard...")
        try:
            page.wait_for_selector("text=লেনদেন", timeout=15000)
        except:
            print("Failed to load dashboard")
            exit(1)

        # 4. Check Member Card Name
        print("Checking Member Card Name...")
        card_holder_label = page.locator("text=Card Holder")
        if card_holder_label.count() > 0:
            if page.locator(f"text={unique_name}").count() >= 2:
                print(f"SUCCESS: Name '{unique_name}' found on page.")
            else:
                print(f"WARNING: Name '{unique_name}' might not be on the card.")
        else:
            print("FAILURE: 'Card Holder' label not found.")

        # 5. Check for Download functionality (button presence)
        print("Checking for Card Share/Download button...")
        share_btn = page.locator("button:has-text('কার্ড শেয়ার')")
        if share_btn.count() > 0:
            print("SUCCESS: Share button found.")
        else:
            print("FAILURE: Share button not found.")

        browser.close()

if __name__ == "__main__":
    verify_fixes()
