- add test

```bash
__tests__/
  ├── page.test.tsx
  ├── api.test.ts

```

# 📋 REQUIREMENTS DOCUMENT

## LeetCode Submission Archive Web App

---

## 🎯 Project Overview

**Name**: Leetstalk  
**Description**: Archive LeetCode AC (Accepted) solutions từ mọi user bằng LeetCode handle  
**Tech Stack**:

- Frontend: Next.js 15 (App Router), HeroUI, Tailwind CSS
- Backend: Next.js API Routes
- Database: PostgreSQL
- ORM: Prisma
- External API: LeetCode GraphQL API
- Deployment: Vercel (with cron jobs)

---

## 🔥 Core Features

### 1️⃣ Fetch Recent AC Submissions

- **Input**: LeetCode username (ví dụ: `username123`)
- **Process**:
  - Gọi LeetCode GraphQL API để lấy `recentAcSubmissionList` (max 15 submissions)
  - Không cần login LeetCode
  - Không cần session cookie
- **Output**: Danh sách recent accepted submissions

### 2️⃣ Fetch Submission Details

- Sau khi có `recentAcSubmissionList`, fetch chi tiết từ `submissionDetails` API
- Lưu các thông tin quan trọng: code, performance metrics, metadata

### 3️⃣ Data Storage & Normalization

- Lưu vào PostgreSQL database
- **Fields được lưu**:
  - **Core**: `submissionId`, `username`, `title`, `slug`, `timestamp`
  - **Performance**: `runtime`, `runtimePercentile`, `memory`, `memoryPercentile`, `lang`
  - **Code**: `code` (full solution code), `notes`
  - **Metadata**: `difficulty`, `topics[]`, `questionId`
  - **Statistics**: `totalCorrect`, `totalTestcases`

### 4️⃣ Deduplication Logic

- Unique constraint: `(username + submissionId)`
- Không lưu trùng submissions
- **Một problem có thể có nhiều submissions** (different submissionId) → lưu tất cả

### 5️⃣ Multi-User Support

- Có thể track nhiều LeetCode usernames
- Mỗi submission được lưu với `username` field
- `TrackedUser` model để quản lý danh sách users đang track

### 6️⃣ Auto-Fetch (Cron Job)

- Cron job chạy định kỳ (mỗi 6 giờ) để fetch submissions mới
- Fetch tất cả enabled users trong `TrackedUser` table
- Update `lastFetched` timestamp sau mỗi lần fetch

### 7️⃣ Generate LeetCode URL

- Từ `submissionId` generate URL: `https://leetcode.com/submissions/detail/{submissionId}/`
- Không cần lưu URL vào database (generate khi cần)

---

## 🗄️ Database Schema

### Models

#### **Submission** (Core model)

- Lưu tất cả submission data từ LeetCode
- Unique: `(username + submissionId)`
- Indexes: `username`, `slug`, `timestamp`, `difficulty`, `lang`
- Relations: `Problem` (optional), `TrackedUser` (optional)

#### **TrackedUser**

- Quản lý danh sách LeetCode usernames cần track
- Fields: `username` (unique), `enabled`, `lastFetched`
- Relations: `Submission[]`
- Indexes: `enabled`, `lastFetched`

#### **Problem** (Existing)

- Relation với Submission (optional)

---

## 🎨 Frontend Features

### 8️⃣ Fetch Submissions Page

- Form để nhập LeetCode username
- Button để trigger fetch
- Hiển thị kết quả: số submissions đã save/skipped/errors
- Tự động add user vào `TrackedUser` table

### 9️⃣ Submissions List Display

- Hiển thị danh sách submissions đã lưu
- **Thông tin hiển thị**:
  - Problem title
  - Username
  - Time solved (timestamp → readable date)
  - Difficulty (badge)
  - Language (badge)
  - Runtime/Memory (optional)
  - Link đến LeetCode submission
- **Sort mặc định**: Mới nhất → Cũ nhất (`timestamp DESC`)

### 🔟 Search & Filter

- **Search**:
  - By username
  - By problem title
- **Filter**:
  - By difficulty (Easy/Medium/Hard)
  - By topics/tags (array)
  - By language (java, python, cpp, etc.)
  - By time range (optional - từ timestamp đến timestamp)
- **Pagination**: Nếu có nhiều submissions

### 1️⃣1️⃣ Tracked Users Management (Optional - nếu có thời gian)

- UI để xem danh sách tracked users
- Enable/disable tracking cho từng user
- Xem last fetched time
- Remove user từ tracking list

---

## 🔌 API Endpoints

### Required

#### 1. `POST /api/submissions/fetch`

- **Body**: `{ username: string }`
- Fetch và save submissions cho username
- **Return**: `{ success, results: { saved, skipped, errors } }`

#### 2. `GET /api/submissions/cron`

- Cron job endpoint (called by Vercel cron)
- Fetch tất cả enabled users
- **Return**: Summary results

#### 3. `GET /api/submissions`

- **Query params**: `?username=xxx&difficulty=Easy&lang=java&search=xxx`
- Get submissions với search/filter
- **Return**: `{ submissions: [], total: number }`

### Optional

#### 4. `GET /api/tracked-users`

- Get danh sách tracked users

#### 5. `POST /api/tracked-users`

- **Body**: `{ username: string }`
- Add user vào tracking list

#### 6. `PATCH /api/tracked-users/:id`

- **Body**: `{ enabled: boolean }`
- Enable/disable tracking

---

## ✅ Implementation Status

### Completed ✅

- ✅ Database schema (Submission, TrackedUser models)
- ✅ Prisma migrations
- ✅ Vercel cron job configuration
- ✅ Dependencies installed (graphql-request, graphql)
- ✅ Project structure setup

### Pending Implementation ⏳

#### 1. Backend Services:

- ⏳ `lib/leetcode.ts` - LeetCode GraphQL API client
- ⏳ `lib/submission-service.ts` - Business logic để fetch và save

#### 2. API Routes:

- ⏳ `app/api/submissions/fetch/route.ts`
- ⏳ `app/api/submissions/cron/route.ts`
- ⏳ `app/api/submissions/route.ts` (GET với search/filter)

#### 3. Frontend Pages:

- ⏳ `app/submissions/page.tsx` - Fetch submissions page
- ⏳ `app/submissions/list/page.tsx` - Submissions list với search/filter
- ⏳ `app/submissions/[id]/page.tsx` - Submission detail page (optional)

#### 4. Helper Utilities:

- ⏳ `lib/utils.ts` - Helper functions (format date, generate URL, etc.)

---

## 📊 Data Flow

```
1. User nhập username
   ↓
2. POST /api/submissions/fetch
   ↓
3. Add user vào TrackedUser (nếu chưa có)
   ↓
4. Fetch recentAcSubmissionList từ LeetCode GraphQL
   ↓
5. Với mỗi submission:
   - Check duplicate (username + submissionId)
   - Fetch submissionDetails
   - Normalize & save vào database
   ↓
6. Return results (saved/skipped/errors)
   ↓
7. Cron job chạy mỗi 6 giờ:
   - Query tất cả enabled TrackedUsers
   - Fetch submissions cho mỗi user
   - Update lastFetched
```

---

## 🔐 Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `CRON_SECRET` - (Optional) Secret để bảo vệ cron endpoint (nếu dùng external cron)

---

## 📝 Notes

### 1. LeetCode GraphQL API

- **Endpoint**: `https://leetcode.com/graphql`
- Public API, không cần authentication
- Rate limiting: Unknown (nên implement retry logic)

### 2. Performance

- Mỗi user fetch ~15 submissions
- Mỗi submission cần 2 API calls (list + details)
- Cron job có thể chạy lâu nếu nhiều users

### 3. Error Handling

- Handle LeetCode API errors
- Handle network errors
- Log errors để debug

### 4. Future Enhancements (Optional)

- User authentication
- Statistics/analytics dashboard
- Export data (JSON/CSV)
- Webhook notifications
- Search index optimization (Algolia/Meilisearch)

---

## 🔄 CRON_SECRET Explanation

**CRON_SECRET** = Secret token để bảo vệ cron job endpoint

Khi setup cron job, endpoint `/api/submissions/cron` sẽ bị gọi tự động từ Vercel (hoặc external service). Để tránh người khác gọi endpoint này, cần bảo vệ bằng secret token.

**Note**: Với Vercel Cron Jobs thì **KHÔNG CẦN** check CRON_SECRET vì Vercel tự động bảo vệ endpoint. Chỉ cần check nếu dùng external cron service (như cron-job.org).

---

## 📌 Key Decisions

1. **Multi-submissions per problem**: Một problem có thể có nhiều submissions → lưu tất cả vì unique key là `(username + submissionId)`, không phải `(username + slug)`

2. **TrackedUser model**: Thêm model này để quản lý danh sách users cần track, enable/disable tracking, và track last fetched time

3. **URL generation**: Không lưu URL vào database, generate từ `submissionId` khi cần

4. **GraphQL approach**: Dùng Fetch API thuần (không cần install thêm package) hoặc `graphql-request` (đã có trong dependencies)

---

**Last Updated**: 2024-12-30  
**Version**: 1.0
