# ISME Ops OS - Quản lý Vận hành & KPI

Hệ thống Quản lý Vận hành và Theo dõi KPI - Viện ISME (ISNEU).

---

## 📌 Thông tin Quản trị & Hạ tầng

### 1. Supabase Database
- **Tài khoản đăng nhập Supabase:** `thanhtungvn95@gmail.com` *(Đăng nhập thông qua GitHub)*
- **Project Reference ID:** `dvspdlucpdakjaodcslc`
- **Dashboard URL:** [https://supabase.com/dashboard/project/dvspdlucpdakjaodcslc](https://supabase.com/dashboard/project/dvspdlucpdakjaodcslc)
- **Region:** AWS `ap-southeast-1` (Singapore)
- **Host Connection Pooler:** `aws-1-ap-southeast-1.pooler.supabase.com:6543`

### 2. Vercel Hosting & Production
- **Production URL:** [https://ismekpifixed.vercel.app](https://ismekpifixed.vercel.app)
- **Vercel Account:** `tung68nt`
- **Project:** `isme_kpi_fixed`

### 3. GitHub Repository
- **Remote:** [https://github.com/Tulie-TSS/isme_kpi.git](https://github.com/Tulie-TSS/isme_kpi.git)
- **Default Branch:** `master`
- **Author Email:** `thanhtungvn95@gmail.com`

---

## 🔑 Tài khoản Đăng nhập Hệ thống Web (ISME Ops OS)

- **Đường dẫn đăng nhập:** [https://ismekpifixed.vercel.app/login](https://ismekpifixed.vercel.app/login)
- **Mật khẩu mặc định:** `isme2026`

| Vai trò | Người phụ trách | Email đăng nhập |
| :--- | :--- | :--- |
| **Quản trị hệ thống (Admin)** | Admin System | `admin@isneu.org` |
| **Trưởng Ban Đào tạo ĐH** | Hồ Hoàng Lan | `ho.lan@isneu.org` |
| **Phó Ban** | Nguyễn Thùy Trinh | `nguyen.trinh@isneu.org` |
| **Viện trưởng Viện Đào tạo Quốc tế** | PGS.TS. Lê Trung Thành | `le.thanh@isneu.org` |
| **Phó Viện trưởng Viện Đào tạo Quốc tế** | TS. Trịnh Thị Thu Giang | `trinh.giang@isneu.org` |
| **CNCT Năm 1** | Bùi Thị Quỳnh Trang | `bui.trang@isneu.org` |
| **CNCT Top-up CU** | Nguyễn Giang Khánh Huyền | `nguyen.huyen@isneu.org` |
| **CNCT Top-up UWE** | Vũ Minh Nhật | `vu.nhat@isneu.org` |
| **CNCT NHTC** | Trần Thị Bích Ngọc | `tran.ngoc@isneu.org` |
| **CNCT BTEC** | Trần Hương Thảo | `tran.thao@isneu.org` |
| **Phụ trách CT AU** | Đào Ngọc Diệp | `dao.diep@isneu.org` |
| **CNCT BBAE** | Nguyễn Minh Tuấn | `nguyen.tuan@isneu.org` |
| **CNCT DM** | Bùi Thu Trang | `bui.thutrang@isneu.org` |

---

## ⚙️ Cơ chế Tự động Keep-Alive (Chống Pause Supabase)
1. **Background Ping:** Tự động gửi tín hiệu đánh thức ngầm vào `/api/health` mỗi khi người dùng truy cập web.
2. **Vercel Cron Job:** Chạy định kỳ lúc 04:00 UTC hàng ngày gọi `/api/health` thực thi query `SELECT 1;` tới Supabase để duy trì hoạt động 24/7.
