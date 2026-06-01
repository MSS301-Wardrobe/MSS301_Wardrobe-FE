# AI-Powered Wardrobe Management UI

Giao diện web (Frontend) cho hệ thống quản lý tủ đồ ứng dụng AI: số hóa quần áo, nhận diện trang phục bằng AI, gợi ý outfit theo ngữ cảnh/sự kiện, và quản trị hệ thống.

## Công nghệ sử dụng

- **React 18** + **TypeScript**
- **Vite** – dev server & build
- **React Router** – định tuyến (browser router)
- **TanStack React Query** – fetch & cache dữ liệu từ API
- **Axios** – HTTP client
- **Tailwind CSS** + **Radix UI / shadcn** – hệ thống UI components
- **Sonner** – toast notifications

## Cấu trúc thư mục

```
src/
├── main.tsx                # Điểm khởi chạy app, mount React vào #root
├── app/
│   ├── App.tsx             # Root component: RouterProvider + Toaster
│   ├── routes.ts           # Khai báo toàn bộ route (public / user / admin)
│   └── providers/          # AuthProvider, QueryProvider (context dùng chung)
├── pages/                  # Các trang theo nhóm chức năng
│   ├── landing/            # Trang giới thiệu
│   ├── auth/               # Login, Register, Forgot password
│   ├── user/               # Tính năng cho người dùng cuối
│   └── admin/              # Trang quản trị
├── components/
│   ├── layout/             # UserLayout, AdminLayout, Sidebar, Topbar, ProtectedRoute
│   ├── common/             # Component tái sử dụng
│   └── ui/                 # Bộ UI primitives (button, dialog, table, ...)
├── services/               # Tầng gọi API (apiClient + service theo domain)
├── hooks/                  # Custom hooks (useAuth, useWardrobe, useAI, ...)
├── types/                  # Định nghĩa TypeScript types theo domain
└── utils/                  # Hàm tiện ích, hằng số, formatters
```

## Luồng hoạt động của Frontend

1. **Khởi tạo app**: `main.tsx` mount `App`, trong đó `App.tsx` dựng `RouterProvider` (định tuyến) cùng `Toaster` (thông báo).

2. **Định tuyến (`app/routes.ts`)** chia làm 3 nhóm:
   - **Public**: `/` (Landing), `/login`, `/register`, `/forgot-password`.
   - **User** (`/app/*`): được bọc bởi `RequireUser` → `UserLayout`. Gồm dashboard, quản lý tủ đồ (wardrobe), nhận diện AI, gợi ý outfit, trang phục theo sự kiện, nhóm bạn bè, thư viện ảnh, hồ sơ & tùy chọn.
   - **Admin** (`/admin/*`): được bọc bởi `RequireAdmin` → `AdminLayout`. Gồm phân tích hệ thống, quản lý người dùng, danh mục, log AI, log gợi ý và cài đặt hệ thống.

3. **Phân quyền (`components/layout/ProtectedRoute.tsx`)**: `RequireUser` / `RequireAdmin` kiểm tra role hiện tại và điều hướng (redirect) nếu không đúng quyền truy cập.

4. **Layout & điều hướng**: mỗi nhóm có layout riêng (Sidebar + Topbar) bao quanh `Outlet` để render trang con tương ứng.

5. **Gọi API & dữ liệu**:
   - `services/apiClient.ts` tạo instance Axios với `baseURL` từ biến môi trường `VITE_API_BASE_URL` (mặc định `http://localhost:8080`), tự động đính kèm `Bearer accessToken` từ `localStorage` vào mỗi request.
   - Các service theo domain (`authService`, `wardrobeService`, `aiService`, `recommendationService`, `userService`, `storageService`) gọi tới backend.
   - **React Query** (`QueryProvider`) quản lý fetch/cache; các custom hook trong `hooks/` đóng gói logic dữ liệu cho từng tính năng.

## Cấu hình môi trường

Tạo file `.env` ở thư mục gốc nếu cần trỏ tới backend khác:

```
VITE_API_BASE_URL=http://localhost:8080
```

## Chạy dự án

Cài đặt dependencies:

```
npm i
```

Chạy môi trường phát triển:

```
npm run dev
```

Build production:

```
npm run build
```
