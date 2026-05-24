I am building a native Android application using Kotlin/Java (or Flutter/React Native) with Vibecode. This app is a mobile client for my web application: Friends Development Society (FDS 2.0).

Base URL: `https://newfds.vercel.app`

Test Credentials for Development:
- **Admin**: Username: `admin`, Password: `admin123`
- **Member**: Mobile: `01893669791`, PIN: `7042`

Please generate the necessary data models, API service interfaces (e.g., using Retrofit), repository layers, and UI screens for the following endpoints. Ensure proper error handling and loading states.

---
### Authentication & Core Headers

1. **Admin Auth**: Admin login returns a base64 encoded token. Include this header in all Admin requests:
   `Authorization: Bearer <admin_token>`
2. **Member Auth**: Member login returns an HTTP-only cookie (`member_session`). Make sure to enable CookieJar in the HTTP client (e.g., OkHttp) to automatically handle and attach cookies for all Member and Community routes.

---
### 1. Authentication Endpoints

**Admin Login**
- **Endpoint**: `POST /api/auth/login`
- **Request Body (JSON)**: `{"username": "admin", "password": "admin123"}`
- **Response (200)**: `{"token": "...", "admin": {"id": "...", "username": "...", "name": "..."}}`

**Member Login**
- **Endpoint**: `POST /api/auth/member-login`
- **Request Body (JSON)**: `{"phone": "01893669791", "pin": "7042"}`
- **Response (200)**: `{"message": "Login successful", "member": {"id": "...", "name": "...", "accountNumber": "..."}}`
- *Note*: Sets the `member_session` HttpOnly cookie.

---
### 2. Admin Endpoints `[Requires Admin Token]`

**Get All Members**
- **Endpoint**: `GET /api/admin/members`
- **Response**: Array of Member objects including nested `contributions` and `adjustments`.

**Add New Member**
- **Endpoint**: `POST /api/admin/members`
- **Request Body (JSON)**: `{"name": "...", "phone": "...", "email": "...", "address": "..."}`

**Add Member Contribution (Monthly Fee)**
- **Endpoint**: `POST /api/admin/contributions`
- **Request Body (JSON)**: `{"memberId": "...", "month": "01", "year": 2024, "amount": 1000, "description": ""}`

**Manage Fund Adjustments**
- **Endpoint**: `POST /api/admin/adjustments`
- **Request Body (JSON)**: `{"type": "CHARGE" | "INTEREST", "amount": 100, "description": "...", "target": "all" | "specific", "memberId": "optional_id"}`

**Get & Manage Loans**
- **Endpoint**: `GET /api/admin/loans`
- **Endpoint**: `PATCH /api/admin/loans`
- **PATCH Body (JSON)**: `{"id": "loan_id", "status": "APPROVED" | "REJECTED" | "PAID"}`

**Get & Manage Investments**
- **Endpoint**: `GET /api/admin/investments`
- **Endpoint**: `POST /api/admin/investments`
- **POST Body (JSON)**: `{"amount": 50000, "project": "Project Name", "description": "..."}`
- **Endpoint**: `PATCH /api/admin/investments/{id}`
- **PATCH Body (JSON)**: `{"status": "RETURNED"}`

**Manage Polls**
- **Endpoint**: `POST /api/admin/polls`
- **Request Body (JSON)**: `{"question": "...", "options": ["Yes", "No"]}`
- **Endpoint**: `PATCH /api/admin/polls`
- **Request Body (JSON)**: `{"id": "poll_id", "isActive": false}`

---
### 3. Member Endpoints `[Requires member_session Cookie]`

**Get Member Dashboard Data**
- **Endpoint**: `GET /api/member/{accountNumber}`
- **Response (200)**: Member object with `contributions`, `adjustments`, `fundAdjustments`, `memberCount`, `isVerified`.

**Update Member Profile**
- **Endpoint**: `PATCH /api/member/{accountNumber}`
- **Request Body (Multipart/Form-Data)**: Text fields (`dob`, `nid`, `fatherName`, `motherName`, `maritalStatus`, `nomineeName`, `nomineeNid`, `nomineeRelation`, `phone`, `email`, `address`) and File uploads (`profileImage`, `nomineeImage`).

**Get & Apply for Loans**
- **Endpoint**: `GET /api/loans`
- **Endpoint**: `POST /api/loans`
- **POST Body (JSON)**: `{"amount": 5000, "purpose": "..."}`

---
### 4. Community Endpoints `[Requires member_session Cookie]`

**Get Community Feed**
- **Endpoint**: `GET /api/community/posts`

**Create a Post**
- **Endpoint**: `POST /api/community/posts`
- **Request Body (Multipart/Form-Data)**: `content` (text) and `image` (file).

**Like/Unlike a Post**
- **Endpoint**: `POST /api/community/posts/{postId}/like`
- **Request Body (JSON)**: `{"authorId": "logged_in_member_id"}`

**Add a Comment**
- **Endpoint**: `POST /api/community/posts/{postId}/comment`
- **Request Body (JSON)**: `{"content": "...", "authorId": "logged_in_member_id"}`

**Get & Vote on Polls**
- **Endpoint**: `GET /api/community/polls`
- **Endpoint**: `POST /api/community/polls/{pollId}/vote`
- **Request Body (JSON)**: `{"voterId": "logged_in_member_id", "optionId": "selected_option_id"}`

---
### 5. Utility Endpoints

**Get Member Stats**
- **Endpoint**: `GET /api/stats`
- **Response**: `{"count": 15}`
