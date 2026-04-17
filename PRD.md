# PRODUCT REQUIREMENTS DOCUMENT — ISME Ops OS

> **ISME Operations & KPI Management System**
> Phiên bản: 1.0 · Ngày: 18/03/2026 · Trạng thái: Draft

---

## 1. Tổng quan sản phẩm

### 1.1 Bối cảnh

Ban Đào tạo ISME (NEU) hiện vận hành bằng nhiều file Excel rời rạc, dẫn tới:

| Vấn đề | Hệ quả |
|---|---|
| Không có hệ thống theo dõi real-time | Mất kiểm soát tiến độ trong kỳ |
| Không phát hiện sớm rủi ro | Công việc trễ hạn không được xử lý kịp thời |
| KPI thiếu tính công bằng | Đánh giá cuối kỳ mang tính cảm tính, gây tranh cãi |
| Dữ liệu phân tán | Không chứng minh được hiệu suất bằng số liệu |

### 1.2 Tầm nhìn sản phẩm

Xây dựng một **webapp đóng vai trò Operating System cho Ban Đào tạo**, nơi:

- **Task-first**: Mọi công việc đều được ghi nhận vào hệ thống
- **Data-driven KPI**: KPI được tự động tính từ dữ liệu vận hành thực tế
- **Early warning**: Quản lý nhận cảnh báo sớm khi có rủi ro

### 1.3 Luồng hoạt động cốt lõi

```
Task → Progress → Evidence → KPI → Alert → Review
```

> **Nguyên tắc UX**: Người dùng chỉ cần tập trung **cập nhật task**. Mọi thứ còn lại (KPI, alert, review) sẽ **tự động** diễn ra phía sau.

---

## 2. Mục tiêu & Chỉ số thành công

### 2.1 Mục tiêu kinh doanh

| Mục tiêu | Chỉ tiêu đo lường |
|---|---|
| Số hoá vận hành | ≥ 90% công việc được cập nhật trong hệ thống |
| Tự động hoá KPI | ≥ 80% KPI được auto-calculate |
| Đánh giá minh bạch | Giảm ≥ 50% tranh cãi khi đánh giá cuối kỳ |

### 2.2 Chỉ số sản phẩm

| Metric | Target |
|---|---|
| Thời gian cập nhật task | < 10 giây |
| Dashboard load time | < 2 giây |
| Weekly Active Users | ≥ 80% tổng người dùng |

---

## 3. Vai trò & Phân quyền

### 3.1 Định nghĩa vai trò (Multi-Role — Kiêm nhiệm)

> **Nguyên tắc**: 1 người có thể kiêm nhiệm nhiều vai trò. Ví dụ: Chủ nhiệm CT vừa là `coordinator_director` vừa có thể được gán thêm `manager`.

| Vai trò | Code | Mô tả | Quyền chính |
|---|---|---|---|
| **Operation** | `operation` | Điều phối / Chuyên viên vận hành | Xem & cập nhật task, upload evidence, xem KPI cá nhân |
| **CN CT & Điều phối** | `coordinator_director` | Chủ nhiệm CT đồng thời là điều phối | Như Operation + xem task/KPI team chương trình |
| **Quản lý** | `manager` | Trưởng ban / Quản lý cấp trung | Xem toàn bộ team, review & đánh giá, cấu hình hệ thống |
| **Lãnh đạo Viện** | `institute_leader` | Lãnh đạo Viện Đào tạo | Xem toàn bộ viện, tổng hợp KPI, báo cáo chiến lược |

> **Legacy roles** (`staff | manager | admin`): Vẫn giữ để backward-compatible. Hệ thống ưu tiên `roles[]` khi phân quyền.

### 3.2 Ma trận phân quyền chi tiết

| Hành động | Operation | CN CT & ĐP | Quản lý | Lãnh đạo |
|---|:---:|:---:|:---:|:---:|
| Xem task của mình | ✅ | ✅ | ✅ | ✅ |
| Cập nhật task của mình | ✅ | ✅ | ✅ | ✅ |
| Xem task team chương trình | ❌ | ✅ | ✅ | ✅ |
| Xem KPI cá nhân | ✅ | ✅ | ✅ | ✅ |
| Xem KPI team (Heatmap) | ❌ | ✅ | ✅ | ✅ |
| Xem KPI toàn viện | ❌ | ❌ | ❌ | ✅ |
| Review & đánh giá | ❌ | ❌ | ✅ | ✅ |
| Quản lý hệ thống | ❌ | ❌ | ✅ | ✅ |
| Cập nhật lịch làm việc | ✅ | ✅ | ✅ | ✅ |
| Tìm giờ họp team | ❌ | ✅ | ✅ | ✅ |


---

## 4. Kiến trúc thông tin & Navigation

> **Nguyên tắc**: Tối đa 2 click để đến bất kỳ thông tin nào. Mỗi vai trò có trang chủ riêng, hiển thị đúng thông tin cần thiết.

### 4.1 Cấu trúc Navigation

```
┌─────────────────────────────────────────────┐
│  ISME Ops OS                                │
├──────────────┬──────────────────────────────┤
│              │                              │
│  🏠 Tổng quan │  ← Trang chủ theo vai trò    │
│              │                              │
│  📋 Task     │  ← Danh sách & cập nhật task  │
│              │                              │
│  📊 KPI      │  ← Bảng KPI & drill-down     │
│              │                              │
│  📝 Review   │  ← Đánh giá cuối kỳ          │
│              │                              │
│  ⚙️ Cài đặt  │  ← Admin only                │
│              │                              │
└──────────────┴──────────────────────────────┘
```

### 4.2 Trang chủ theo vai trò

#### Staff — "Việc của tôi hôm nay"

Hiển thị ngay khi mở app:

| Khu vực | Nội dung | Hành động nhanh |
|---|---|---|
| **Số liệu nổi bật** | Task cần làm hôm nay, task sắp đến hạn, task quá hạn | — |
| **Task cần hành động** | Danh sách task TODO & IN_PROGRESS sắp xếp theo deadline | Swipe/Click → cập nhật nhanh |
| **KPI mini** | 4 KPI chính dạng circular progress | Click → chi tiết |
| **Thông báo** | Alert mới nhất | — |

#### Manager — "Tình hình đội ngũ"

| Khu vực | Nội dung |
|---|---|
| **Số liệu tổng hợp** | Tổng task team, % hoàn thành, số task quá hạn |
| **Bảng rủi ro** | Nhân viên/chương trình có task quá hạn (highlight đỏ/vàng) |
| **KPI Heatmap** | Lưới người dùng × KPI, màu xanh/vàng/đỏ |
| **Hoạt động gần đây** | Timeline cập nhật mới nhất của team |

#### Admin — "Quản trị hệ thống"

| Khu vực | Nội dung |
|---|---|
| **System health** | Tổng user, tổng task, weekly active rate |
| **Quick actions** | Tạo cycle mới, cấu hình KPI, quản lý template |
| **Alert tổng hợp** | Cảnh báo toàn hệ thống |

---

## 5. Module chức năng chi tiết

### 5.1 Module: Master Data (Admin)

#### 5.1.1 Quản lý Người dùng (Users)

**Dữ liệu:**

| Field | Type | Mô tả |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | String | Họ tên |
| `email` | String | Email (dùng cho Google login) |
| `role` | Enum | `staff` / `manager` / `admin` |
| `manager_id` | UUID | FK → users (quản lý trực tiếp) |
| `avatar_url` | String | URL ảnh đại diện (từ Google) |
| `active` | Boolean | Trạng thái hoạt động |
| `created_at` | Timestamp | Thời gian tạo |

**Chức năng:**

- CRUD người dùng
- Gán/thay đổi vai trò
- Gán quản lý trực tiếp
- Vô hiệu hoá tài khoản (soft delete)
- Import danh sách từ CSV

---

#### 5.1.2 Quản lý Chương trình (Programs)

**Dữ liệu:**

| Field | Type | Mô tả |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | String | Tên chương trình |
| `type` | Enum | `degree` / `certificate` / `short_course` / `event` |
| `status` | Enum | `active` / `archived` |
| `start_date` | Date | Ngày bắt đầu |
| `end_date` | Date | Ngày kết thúc (nullable) |
| `created_at` | Timestamp | Thời gian tạo |

**Bảng liên kết User ↔ Program:**

| Field | Type | Mô tả |
|---|---|---|
| `user_id` | UUID | FK → users |
| `program_id` | UUID | FK → programs |
| `role_in_program` | Enum | `coordinator` / `supporter` |

**Chức năng:**

- CRUD chương trình
- Gán/gỡ nhân viên vào chương trình
- Xem danh sách nhân viên theo chương trình

---

#### 5.1.3 Quản lý KPI Definition

**Dữ liệu:**

| Field | Type | Mô tả |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | String | Tên KPI |
| `description` | Text | Mô tả cách tính |
| `formula_type` | Enum | `on_time_rate` / `completion_rate` / `evidence_compliance` / `issue_rate` |
| `thresholds` | JSON | `{ excellent: 95, good: 80, warning: 60, critical: 40 }` |
| `weight` | Decimal | Trọng số KPI (tổng = 100%) |
| `active` | Boolean | Đang sử dụng |

**Chức năng:**

- CRUD KPI definition
- Điều chỉnh trọng số và ngưỡng
- Preview tính toán KPI với dữ liệu mẫu

---

#### 5.1.4 Quản lý Task Template

**Dữ liệu:**

| Field | Type | Mô tả |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | String | Tên template |
| `description` | Text | Mô tả công việc |
| `phase` | Enum | `preparation` / `execution` / `post` |
| `default_duration_days` | Integer | Thời gian mặc định (ngày) |
| `due_rule` | String | Quy tắc tính deadline, e.g. `program_start - 7d` |
| `requires_evidence` | Boolean | Yêu cầu minh chứng |
| `evidence_description` | Text | Mô tả loại minh chứng cần nộp |
| `checklist` | JSON | Danh sách bước con (optional) |

**Chức năng:**

- CRUD template
- Duplicate template
- Preview khi áp dụng vào chương trình cụ thể

---

### 5.2 Module: Task Management

> **UX Principle**: Cập nhật task phải nhanh nhất có thể. Mục tiêu: **< 10 giây** cho mỗi lần update.

#### 5.2.1 Task Data Model

| Field | Type | Mô tả |
|---|---|---|
| `id` | UUID | Primary key |
| `template_id` | UUID | FK → task_templates (nullable) |
| `title` | String | Tên công việc |
| `description` | Text | Mô tả chi tiết |
| `owner_id` | UUID | FK → users (người thực hiện) |
| `program_id` | UUID | FK → programs |
| `due_date` | Date | Deadline |
| `status` | Enum | `TODO` / `IN_PROGRESS` / `DONE` / `BLOCKED` |
| `progress` | Integer | 0–100 (%) |
| `evidence_url` | String | Link minh chứng (URL) |
| `evidence_uploaded_at` | Timestamp | Thời điểm upload evidence |
| `issue_flag` | Boolean | Đánh dấu có vấn đề |
| `issue_note` | Text | Ghi chú vấn đề |
| `completed_at` | Timestamp | Thời điểm hoàn thành |
| `created_at` | Timestamp | Thời gian tạo |
| `updated_at` | Timestamp | Cập nhật lần cuối |

#### 5.2.2 Task Status Flow

```
                    ┌──────────┐
                    │   TODO   │
                    └────┬─────┘
                         │
                         ▼
               ┌─────────────────┐
          ┌────│  IN_PROGRESS    │────┐
          │    └─────────────────┘    │
          │                           │
          ▼                           ▼
   ┌──────────┐               ┌──────────┐
   │ BLOCKED  │───────────────│   DONE   │
   └──────────┘               └──────────┘
```

**Business Rules:**

| Rule | Logic |
|---|---|
| Overdue detection | `now > due_date AND status ≠ DONE` |
| Overdue severity: Warning | 1–3 ngày quá hạn |
| Overdue severity: Critical | > 3 ngày quá hạn |
| Evidence validation | Nếu `requires_evidence = true` → phải attach file trước khi chuyển sang `DONE` |
| Evidence penalty | Task yêu cầu evidence nhưng thiếu → bị trừ điểm KPI Evidence Compliance |

#### 5.2.3 Giao diện Task

**A. Danh sách Task (Task List View)**

```
┌─────────────────────────────────────────────────────────────┐
│  📋 Task của tôi                    [+ Tạo task] [Lọc ▼]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Bộ lọc nhanh:  [Tất cả] [Cần làm] [Đang làm] [Quá hạn]  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🔴 Chuẩn bị tài liệu khóa MBA          Quá hạn 2d │    │
│  │    MBA K29 · Deadline: 15/03 · Progress: 60%       │    │
│  │    [Cập nhật ▸]                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🟡 Liên hệ giảng viên module 3          Còn 2 ngày │    │
│  │    Executive MBA · Deadline: 20/03 · Progress: 30% │    │
│  │    [Cập nhật ▸]                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🟢 Gửi khảo sát sinh viên               Hoàn thành │    │
│  │    MBA K28 · Hoàn thành: 14/03 · ✅ Evidence       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**B. Quick Update Panel (Slide-over / Modal)**

> Khi nhấn "Cập nhật", mở panel nhỏ ngay tại chỗ — **không navigate sang trang khác**.

```
┌──────────────────────────────────────┐
│  Cập nhật task                   [✕] │
├──────────────────────────────────────┤
│                                      │
│  Trạng thái:                         │
│  [TODO] [IN_PROGRESS ✓] [DONE] [❌]  │
│                                      │
│  Tiến độ:                            │
│  ━━━━━━━━━━━━━░░░░░░  60%  [+10]    │
│                                      │
│  Minh chứng:                         │
│  [📎 Upload file / Paste link]       │
│                                      │
│  Ghi chú nhanh:                      │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  └────────────────────────────────┘  │
│                                      │
│  ☐ Đánh dấu có vấn đề               │
│                                      │
│         [💾 Lưu]                     │
│                                      │
└──────────────────────────────────────┘
```

**Yêu cầu UX:**

- Nút **+10%** để tăng progress nhanh thay vì nhập số
- **1-tap status change**: Nhấn vào status chip để chuyển trạng thái
- Tự động lưu khi chuyển status (không cần nhấn Save)
- Hiển thị validation inline: "Cần upload evidence trước khi đánh dấu DONE"

#### 5.2.4 Chức năng Task

| Chức năng | Mô tả | Vai trò |
|---|---|---|
| **Auto-generate tasks** | Tạo task tự động từ template khi bắt đầu cycle/program mới | Admin |
| **Quick update** | Cập nhật status, progress, evidence trong < 10s | Staff |
| **Bulk assign** | Gán nhiều task cùng lúc cho nhân viên | Manager, Admin |
| **Clone task** | Sao chép task cho chương trình khác | Manager, Admin |
| **Filter & Search** | Lọc theo status, program, owner, deadline | All |
| **Sort** | Sắp xếp theo deadline, status, program | All |
| **Issue flagging** | Đánh dấu task có vấn đề + ghi chú | Staff |

---

### 5.3 Module: Reminder Engine

> Hệ thống tự động nhắc nhở để đảm bảo không task nào bị bỏ quên.

#### 5.3.1 Trigger Rules

| Trigger | Thời điểm | Nội dung | Người nhận |
|---|---|---|---|
| **Sắp đến hạn** | T-3 ngày | "Task X sẽ đến hạn trong 3 ngày" | Owner |
| **Gần deadline** | T-1 ngày | "Task X đến hạn ngày mai!" | Owner |
| **Quá hạn** | T+1, T+3, T+7 | "Task X đã quá hạn N ngày" | Owner + Manager |
| **Không cập nhật** | Sau 3 ngày không update | "Task X chưa có cập nhật trong 3 ngày" | Owner |

#### 5.3.2 Kênh gửi

| Kênh | Mô tả | Ưu tiên |
|---|---|---|
| **In-app notification** | Badge + notification panel trong app | Luôn bật |
| **Email** | Gửi email tóm tắt | Daily digest hoặc theo từng event |

#### 5.3.3 Cấu hình

- Admin có thể bật/tắt từng loại trigger
- User có thể chọn nhận email hoặc chỉ in-app
- Không gửi quá 3 email/ngày cho mỗi user (chống spam)

---

### 5.4 Module: Monitoring Dashboard

> **Nguyên tắc**: Mở dashboard → thấy ngay tình hình → biết cần hành động gì.

#### 5.4.1 Manager Dashboard

**A. Summary Cards (Row đầu tiên)**

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Tổng    │ │ Hoàn     │ │ Quá hạn  │ │ Có vấn   │
│  Task    │ │ thành    │ │          │ │ đề       │
│   124    │ │   89     │ │   12     │ │    5     │
│          │ │  72%     │ │  🔴 10%  │ │  🟡 4%   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

**B. Bảng rủi ro (Risk Table)**

| Nhân viên | Task quá hạn | Task tổng | Tỷ lệ | Mức độ |
|---|:---:|:---:|:---:|---|
| Nguyễn A | 5 | 15 | 33% | 🔴 Critical |
| Trần B | 2 | 12 | 17% | 🟡 Warning |
| Lê C | 0 | 10 | 0% | 🟢 OK |

**C. Overdue Task List**

- Sắp xếp theo số ngày quá hạn (nhiều nhất lên trước)
- Click vào → xem chi tiết task
- Filter theo chương trình, nhân viên

#### 5.4.2 KPI Heatmap

```
              KPI1     KPI2     KPI3     KPI4     Tổng
              On-time  Complet  Evidence Issue
Nguyễn A     🟢 95    🟢 92    🟡 78    🟢 90    🟢 89
Trần B       🟡 82    🟡 85    🟢 95    🟡 80    🟡 85
Lê C         🔴 65    🟡 80    🔴 50    🔴 70    🔴 66
Phạm D       🟢 98    🟢 95    🟢 100   🟢 95    🟢 97
```

**Quy tắc màu:**

| Ngưỡng | Màu | Ý nghĩa |
|---|---|---|
| ≥ 85 | 🟢 Xanh | Tốt |
| 60–84 | 🟡 Vàng | Cần cải thiện |
| < 60 | 🔴 Đỏ | Cảnh báo |

**Interaction:**

- Click vào ô → drill-down xem danh sách task liên quan
- Hover → tooltip hiện chi tiết con số
- Filter theo chương trình, kỳ đánh giá

---

### 5.4b Module: Lịch Làm việc Tuần (Weekly Schedule)

> Mọi người cập nhật lịch làm việc **trước Thứ 7** để Quản lý xem tuần sau khung giờ nào ít người bận nhất và book lịch họp.

#### 5.4b.1 Dữ liệu

| Field | Type | Mô tả |
|---|---|---|
| `userId` | UUID | FK → users |
| `weekStart` | Date | Thứ 2 đầu tuần |
| `lastUpdatedAt` | Timestamp | Cập nhật lần cuối |
| `slots` | JSON | Array `DaySchedule[]` — 5 ngày (Thứ 2 → Thứ 6) |

**DaySchedule:**

| Field | Type | Mô tả |
|---|---|---|
| `date` | Date | Ngày cụ thể |
| `dayLabel` | String | "Thứ 2", "Thứ 3"... |
| `busySlots` | Array | `TimeSlot[]` — khung giờ bận |

**TimeSlot:**

| Field | Type |
|---|---|
| `start` | String (HH:mm) |
| `end` | String (HH:mm) |
| `label` | String (mô tả) |

#### 5.4b.2 Giao diện

**Tab 1: "Lịch của tôi" (All users)**
- Grid 5 cột (Thứ 2 → Thứ 6), 8 hàng (08:00–17:00)
- Click/toggle ô → bận/rảnh
- Banner nhắc nhở khi chưa cập nhật trước Thứ 7
- Nút "Lưu lịch tuần tới"

**Tab 2: "Tìm giờ họp" (Manager / Leader / CN CT)**
- Heatmap: trục X = ngày, trục Y = khung giờ, ô = số người bận
- Top 5 khung giờ ít người bận nhất (gợi ý)
- Click vào ô → modal hiện ai bận / ai rảnh
- Badge tình trạng cập nhật: ai đã cập nhật, ai chưa

#### 5.4b.3 Business Rules

| Rule | Logic |
|---|---|
| Deadline cập nhật | Trước Thứ 7 mỗi tuần |
| Hiển thị banner | Nếu `lastUpdatedAt` trống hoặc trước thứ 7 tuần hiện tại |
| Khung giờ làm việc | 8 slots: 08-09, 09-10, 10-11, 11-12, 13-14, 14-15, 15-16, 16-17 |

---

### 5.4c KPI Operations (Trung bình cộng)

> Phân biệt với **KPI Tổng hợp** (có trọng số). Operations = trung bình cộng đơn giản.

```
operations_score = Σ kpi_score[i] / N
```

- Tính trung bình cộng **tất cả** KPI definitions (10 KPIs)
- Không áp dụng trọng số
- Hiển thị song song với KPI Tổng hợp trên trang KPI cá nhân

---

### 5.5 Module: KPI Engine

> KPI được tính **tự động** từ dữ liệu task — không cần nhập tay.

#### 5.5.1 Công thức KPI

**KPI 1: On-time Completion Rate (Tỷ lệ hoàn thành đúng hạn)**

```
on_time_rate = completed_on_time / total_tasks × 100
```

| Khoảng | Điểm |
|---|---|
| ≥ 95% | 100 điểm |
| 80%–95% | Linear interpolation (80→60, 95→100) |
| < 80% | Penalty: điểm = on_time_rate × 0.5 |

---

**KPI 2: Task Completion Rate (Tỷ lệ hoàn thành)**

```
completion_rate = completed_tasks / total_tasks × 100
```

| Khoảng | Điểm |
|---|---|
| ≥ 95% | 100 điểm |
| 70%–95% | Linear interpolation |
| < 70% | Penalty |

---

**KPI 3: Evidence Compliance (Tuân thủ minh chứng)**

```
evidence_rate = tasks_with_valid_evidence / tasks_requiring_evidence × 100
```

| Khoảng | Điểm |
|---|---|
| 100% | 100 điểm |
| 80%–99% | Linear interpolation |
| < 80% | Penalty |

---

**KPI 4: Issue Rate (Tỷ lệ phát sinh vấn đề)**

```
issue_rate = tasks_flagged_with_issue / total_tasks × 100
```

| Khoảng | Điểm |
|---|---|
| ≤ 5% | 100 điểm |
| 5%–15% | Linear interpolation (100→70) |
| > 15% | Penalty |

> **Lưu ý**: Issue rate thấp = tốt (ngược với các KPI khác).

---

#### 5.5.2 KPI Tổng hợp

```
overall_score = Σ (KPI_score[i] × weight[i])
```

Trọng số mặc định (Admin điều chỉnh được):

| KPI | Trọng số |
|---|---|
| On-time Rate | 30% |
| Completion Rate | 30% |
| Evidence Compliance | 20% |
| Issue Rate | 20% |

#### 5.5.3 KPI Snapshot

**Dữ liệu:**

| Field | Type | Mô tả |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → users |
| `kpi_definition_id` | UUID | FK → kpi_definitions |
| `period` | String | Kỳ đánh giá, e.g. `2026-Q1` |
| `score` | Decimal | Điểm KPI |
| `raw_data` | JSON | `{ numerator: X, denominator: Y }` |
| `calculated_at` | Timestamp | Thời điểm tính |

**Tính toán:**

- **Daily cron job**: Chạy hàng ngày lúc 00:00 để cập nhật KPI snapshot
- **On-demand**: Manager/Admin có thể nhấn "Tính lại KPI" bất kỳ lúc nào
- Lưu snapshot theo kỳ để so sánh historical

#### 5.5.4 KPI Drill-down

> Khi click vào bất kỳ ô KPI nào → hiện danh sách task tạo nên con số đó.

```
┌────────────────────────────────────────────────────────┐
│  KPI Drill-down: On-time Rate — Nguyễn A              │
│  Score: 82% (24/29 tasks on time)                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ✅ Task hoàn thành đúng hạn (24)                      │
│  ├─ Chuẩn bị tài liệu MBA K29 · Done 14/03           │
│  ├─ Liên hệ GV module 2 · Done 10/03                  │
│  └─ ...                                               │
│                                                        │
│  ❌ Task trễ hạn (5)                                   │
│  ├─ Gửi lịch học HK2 · Done 18/03 (trễ 3 ngày)       │
│  ├─ Báo cáo tuyển sinh · Done 20/03 (trễ 5 ngày)     │
│  └─ ...                                               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### 5.6 Module: Review (Đánh giá cuối kỳ)

> Đánh giá dựa trên dữ liệu, không còn cảm tính.

#### 5.6.1 Review Cycle

**Dữ liệu:**

| Field | Type | Mô tả |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | String | Tên kỳ đánh giá, e.g. "Q1-2026" |
| `start_date` | Date | Ngày bắt đầu kỳ |
| `end_date` | Date | Ngày kết thúc kỳ |
| `review_deadline` | Date | Hạn nộp đánh giá |
| `status` | Enum | `open` / `in_review` / `closed` |
| `created_by` | UUID | FK → users (Admin) |

#### 5.6.2 Self Review (Tự đánh giá — Staff)

```
┌────────────────────────────────────────────────────────┐
│  📝 Tự đánh giá — Q1 2026                             │
├────────────────────────────────────────────────────────┤
│                                                        │
│  KPI tự động (từ hệ thống):                           │
│  ┌──────────────────────┬────────┬──────────┐          │
│  │ KPI                  │ Điểm   │ Trọng số │          │
│  ├──────────────────────┼────────┼──────────┤          │
│  │ On-time Rate         │ 85     │ 30%      │          │
│  │ Completion Rate      │ 92     │ 30%      │          │
│  │ Evidence Compliance  │ 100    │ 20%      │          │
│  │ Issue Rate           │ 90     │ 20%      │          │
│  ├──────────────────────┼────────┼──────────┤          │
│  │ TỔNG                 │ 91.1   │          │          │
│  └──────────────────────┴────────┴──────────┘          │
│                                                        │
│  Ghi chú của bạn:                                      │
│  ┌────────────────────────────────────────────┐        │
│  │ Trong Q1, tôi đã hoàn thành tốt các task   │        │
│  │ liên quan đến MBA K29. Một số task trễ do  │        │
│  │ phải chờ phản hồi từ đối tác...            │        │
│  └────────────────────────────────────────────┘        │
│                                                        │
│                           [📤 Gửi đánh giá]           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### 5.6.3 Manager Review

```
┌────────────────────────────────────────────────────────┐
│  📋 Review — Nguyễn A — Q1 2026                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  So sánh:                                              │
│  ┌────────────────────┬──────────┬───────────┐         │
│  │ KPI                │ Hệ thống │ Tự đánh giá│        │
│  ├────────────────────┼──────────┼───────────┤         │
│  │ On-time Rate       │ 85       │ 85        │         │
│  │ Completion Rate    │ 92       │ 92        │         │
│  │ Evidence           │ 100      │ 100       │         │
│  │ Issue Rate         │ 90       │ 90        │         │
│  │ TỔNG              │ 91.1     │ 91.1      │         │
│  └────────────────────┴──────────┴───────────┘         │
│                                                        │
│  Nhận xét của nhân viên:                               │
│  "Trong Q1, tôi đã hoàn thành tốt..."                 │
│                                                        │
│  Nhận xét của Manager:                                 │
│  ┌────────────────────────────────────────────┐        │
│  │                                            │        │
│  └────────────────────────────────────────────┘        │
│                                                        │
│  Điểm điều chỉnh (nếu có): [____]                     │
│  Lý do điều chỉnh: [________________________]         │
│                                                        │
│                    [✅ Xác nhận] [↩ Yêu cầu bổ sung]  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Nguyên tắc:**

- KPI auto-fill từ hệ thống, Manager **không cần nhập lại**
- Manager chỉ cần nhập: nhận xét + điểm điều chỉnh (nếu có)
- Nếu điều chỉnh → bắt buộc nêu lý do
- Lịch sử điều chỉnh được lưu lại (audit log)

---

## 6. Hệ thống cảnh báo (Alert System)

### 6.1 Alert Logic

#### Task Alerts

| Loại | Điều kiện | Mức độ | Người nhận |
|---|---|---|---|
| Quá hạn 1–3 ngày | `overdue_days BETWEEN 1 AND 3` | ⚠️ Warning | Owner, Manager |
| Quá hạn > 3 ngày | `overdue_days > 3` | 🚨 Critical | Owner, Manager |
| Không cập nhật | `last_updated > 3 days ago AND status ≠ DONE` | ⚠️ Warning | Owner |

#### KPI Alerts

| Loại | Điều kiện | Mức độ | Người nhận |
|---|---|---|---|
| KPI thấp | `score < threshold_warning` | ⚠️ Warning | Owner, Manager |
| KPI giảm mạnh | `score_drop > 10%` (so với snapshot trước) | 🚨 Critical | Owner, Manager |

#### Team Alerts (Manager)

| Loại | Điều kiện | Mức độ | Người nhận |
|---|---|---|---|
| Chương trình rủi ro | `> 30% tasks overdue trong 1 program` | 🚨 Critical | Manager |
| Nhân viên rủi ro | `> 30% tasks overdue của 1 user` | 🚨 Critical | Manager |

### 6.2 Hiển thị Alert

- **Notification bell** ở header → badge đỏ khi có alert mới
- **Alert panel**: slide-over panel hiện danh sách alert
- Click alert → navigate thẳng tới task/KPI liên quan
- Mark as read / dismiss

---

## 7. Data Model tổng hợp

### 7.1 Entity Relationship Diagram

```
┌────────┐     ┌──────────────┐     ┌────────────┐
│ users  │────<│ user_programs │>────│  programs  │
└───┬────┘     └──────────────┘     └─────┬──────┘
    │                                      │
    │  ┌──────────────┐                    │
    ├──│    tasks     │────────────────────┘
    │  └──────┬───────┘
    │         │
    │         │  ┌────────────────┐
    │         └──│ task_templates │
    │            └────────────────┘
    │
    │  ┌────────────────┐     ┌──────────────────┐
    ├──│ kpi_snapshots  │────>│ kpi_definitions  │
    │  └────────────────┘     └──────────────────┘
    │
    │  ┌────────────────┐
    └──│ review_cycles  │
       └────────────────┘
```

### 7.2 Bảng tổng hợp

| Bảng | Mô tả | Quan hệ chính |
|---|---|---|
| `users` | Người dùng | → `manager_id` (self-ref) |
| `programs` | Chương trình đào tạo | — |
| `user_programs` | Liên kết user ↔ program | → `users`, → `programs` |
| `task_templates` | Mẫu công việc | — |
| `tasks` | Công việc thực tế | → `users`, → `programs`, → `task_templates` |
| `kpi_definitions` | Định nghĩa KPI | — |
| `kpi_snapshots` | Ảnh chụp KPI theo kỳ | → `users`, → `kpi_definitions` |
| `review_cycles` | Kỳ đánh giá | → `users` (created_by) |
| `reviews` | Bản đánh giá cá nhân | → `users`, → `review_cycles` |
| `notifications` | Thông báo / Alert | → `users` |

---

## 8. Yêu cầu Phi chức năng

### 8.1 Hiệu năng

| Chỉ tiêu | Mục tiêu |
|---|---|
| Response time (API) | < 500ms (p95) |
| Dashboard render | < 2 giây |
| Concurrent users | 100 |
| KPI calculation | < 30 giây cho toàn bộ user |

### 8.2 Bảo mật

| Yêu cầu | Giải pháp |
|---|---|
| Authentication | Google OAuth 2.0 (dùng email @isme / @neu) |
| Authorization | Role-based Access Control (RBAC) |
| Data isolation | Row-Level Security — user chỉ thấy data được phép |
| Audit trail | Log mọi thay đổi quan trọng (status change, review submit) |

### 8.3 UX / Accessibility

| Nguyên tắc | Cụ thể |
|---|---|
| Mobile-friendly | Responsive design, ưu tiên xem + cập nhật task trên điện thoại |
| Tốc độ thao tác | Quick update < 10s, giảm số click tối đa |
| Ngôn ngữ | Giao diện tiếng Việt |
| Feedback rõ ràng | Toast notification khi lưu thành công, inline error khi thiếu data |

---

## 9. Lộ trình triển khai (MVP Phasing)

### Phase 1 — Nền tảng (Tuần 1–4)

> **Mục tiêu**: Staff dùng được hệ thống hàng ngày

| Module | Chức năng |
|---|---|
| Auth | Google login, role-based routing |
| Master Data | Users, Programs CRUD |
| Task | Tạo task, quick update, filter/sort |
| Reminder | Email reminder T-3, T-1, overdue |
| Dashboard (basic) | Summary cards + overdue list |

**Tiêu chí hoàn thành Phase 1:**

- ✅ Staff có thể đăng nhập và cập nhật task hàng ngày
- ✅ Manager có thể xem danh sách task quá hạn của team
- ✅ Email reminder hoạt động

---

### Phase 2 — KPI Engine (Tuần 5–8)

> **Mục tiêu**: KPI tự động, Manager có data để đánh giá

| Module | Chức năng |
|---|---|
| KPI Definitions | CRUD KPI, cấu hình trọng số |
| KPI Engine | Auto calculation (daily cron) |
| KPI Dashboard | Heatmap, drill-down |
| Task Template | Template CRUD, auto-generate |
| Alert System | KPI alerts, team alerts |

**Tiêu chí hoàn thành Phase 2:**

- ✅ KPI tự động cập nhật hàng ngày
- ✅ Manager xem được heatmap KPI team
- ✅ Drill-down từ KPI xuống task cụ thể

---

### Phase 3 — Review System (Tuần 9–12)

> **Mục tiêu**: Quy trình đánh giá cuối kỳ hoàn chỉnh

| Module | Chức năng |
|---|---|
| Review Cycle | Tạo & quản lý kỳ đánh giá |
| Self Review | Auto-fill KPI, staff ghi chú & submit |
| Manager Review | So sánh system vs self, nhận xét, điều chỉnh |
| Reports | Xuất báo cáo KPI, review history |
| Notification hub | In-app notification center |

**Tiêu chí hoàn thành Phase 3:**

- ✅ Quy trình review end-to-end hoạt động
- ✅ Data review được lưu trữ có audit trail
- ✅ Xuất được báo cáo KPI theo kỳ

---

## 10. Rủi ro & Giải pháp

| Rủi ro | Xác suất | Tác động | Giải pháp |
|---|:---:|:---:|---|
| Nhân viên không dùng hệ thống | Cao | Cao | UX đơn giản, quick update < 10s, mobile-friendly |
| KPI tính sai | Trung bình | Cao | Test kỹ business rules, cho preview trước khi áp dụng |
| Dữ liệu không đồng bộ | Trung bình | Trung bình | Validation chặt, required fields |
| Resistance to change | Cao | Trung bình | Training, phát động sử dụng từ leadership |
| Performance với lượng data lớn | Thấp | Trung bình | Indexing, pagination, caching dashboard |

---

## 11. Định hướng tương lai

| Feature | Mô tả | Ưu tiên |
|---|---|---|
| AI Prediction | Dự đoán task có khả năng trễ hạn từ pattern lịch sử | P2 |
| Mobile App | Native app cho iOS/Android | P2 |
| Integration | Kết nối Google Calendar, Slack notification | P3 |
| Gamification | Leaderboard, badges cho nhân viên tốt nhất | P3 |
| Advanced Analytics | Trend analysis, workload balancing | P3 |

---

## 12. Tech Stack (Đề xuất)

| Layer | Công nghệ |
|---|---|
| Frontend | Next.js (App Router) + TypeScript |
| UI Library | Shadcn/UI + Tailwind CSS |
| Backend | Next.js API Routes / Server Actions |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |
| Email | Resend / Supabase Edge Functions |
| Hosting | Vercel |
| Cron Jobs | Vercel Cron / Supabase pg_cron |

---

## 13. Kết luận

**ISME Ops OS** không phải là một công cụ KPI đơn thuần — nó là một **Task-driven KPI Operating System** cho Ban Đào tạo, nơi:

1. **Mọi công việc** đều được ghi nhận và theo dõi real-time
2. **KPI** được tính tự động từ dữ liệu vận hành thật, không cảm tính
3. **Cảnh báo sớm** giúp Manager can thiệp kịp thời
4. **Đánh giá** minh bạch, dựa trên số liệu, giảm tranh cãi

> **Nguyên tắc vàng**: Người dùng chỉ cần tập trung vào 1 việc duy nhất — **cập nhật task**. Tất cả KPI, alert, review sẽ tự động vận hành phía sau.

---

## 14. Nguyên tắc Phát triển (Feature Gate)

> Để tránh sa đà vào chức năng tưởng quan trọng nhưng không phục vụ giá trị cốt lõi.

### 14.1 Luồng xử lý cốt lõi

```
Task → Progress → Evidence → KPI → Alert → Review
```

Mọi tính năng phải phục vụ 1 trong 6 bước trên.

### 14.2 Feature Gate Checklist

Trước khi thêm bất kỳ tính năng mới nào, phải trả lời "Có" cho ít nhất 1 câu hỏi:

| # | Câu hỏi | Nếu "Không" |
|---|---|---|
| 1 | Tính năng này giúp user **cập nhật task nhanh hơn**? | Cân nhắc bỏ |
| 2 | Tính năng này giúp **manager ra quyết định tốt hơn**? | Cân nhắc bỏ |
| 3 | Tính năng này **giảm thao tác thủ công** đáng kể? | Cân nhắc bỏ |
| 4 | Không có tính năng này, hệ thống có **thiếu sót nghiêm trọng**? | Không cần thiết |

### 14.3 Nguyên tắc chống Feature Creep

1. **Tích hợp, không tách riêng** — Tính năng mới nên tích hợp vào module hiện tại thay vì tạo trang mới
2. **Tự động, không thủ công** — Operations KPI tự tính, không cần nhập tay
3. **Mục đích duy nhất** — Lịch làm việc CHỈ phục vụ book lịch họp, KHÔNG phải quản lý thời gian
4. **Task-first UX** — Mọi flow bắt đầu và kết thúc tại Task
