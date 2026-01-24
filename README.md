# Web Push Notification System v2.0 (Multi-Admin)

ระบบส่ง Push Notification ผ่านเว็บบราวเซอร์ รองรับหลาย Admin พร้อม Dashboard และ Click Tracking

## 🚀 Features

- ✅ **Multi-Admin Support** - แต่ละ Admin มี URL เฉพาะสำหรับรับ Subscriber
- ✅ **Dashboard** - แสดงสถิติและกราฟครบถ้วน
- ✅ **Template System** - บันทึกข้อความที่ใช้บ่อยเป็น Template
- ✅ **Click Tracking** - ติดตามการคลิกลิงก์
- ✅ **Subscriber Management** - ดูและจัดการผู้ติดตาม
- ✅ **Cross-Browser Support** - รองรับ Chrome, Firefox, Safari, Edge, Samsung Internet
- ✅ **iOS Support** - รองรับ iOS 16.4+ (Add to Home Screen)
- ✅ **Responsive Design** - ใช้งานได้ทุกอุปกรณ์

## 📦 การติดตั้ง

### 1. อัพเดทฐานข้อมูล

รันไฟล์ SQL ในฐานข้อมูลเดิม:

```bash
mysql -u username -p web_push_db < database_update.sql
```

หรือ import ผ่าน phpMyAdmin

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment

แก้ไขไฟล์ `.env`:

```env
# Database Configuration
DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=web_push_db

# VAPID Keys (ใช้ key เดิม)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:your@email.com

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Web Push Notification System

# Server Port
PORT=5240
```

### 4. Build และ Run

```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

## 📱 การใช้งาน

### สำหรับ Admin

1. เข้าสู่ระบบที่ `https://your-domain.com/login`
2. ใช้ username/password เดิม (jonz/รหัสผ่านเดิม)
3. ไปที่ Settings เพื่อดู URL สำหรับรับ Subscriber

### URL สำหรับรับ Subscriber

แต่ละ Admin จะมี URL เฉพาะ:
```
https://your-domain.com/s/{admin-token}
```

แชร์ URL นี้ให้ผู้ใช้เพื่อสมัครรับ Push Notification

### การส่ง Push

1. ไปที่หน้า "ส่ง Push"
2. กรอกหัวข้อและข้อความ
3. (Optional) เพิ่ม icon, image, URL
4. คลิก "ส่ง"

### Template System

- สามารถบันทึกข้อความเป็น Template เพื่อใช้ซ้ำได้
- เลือก Template จากประวัติหรือ Template ที่บันทึกไว้

## 📊 Database Schema (เพิ่มใหม่)

### ตารางใหม่

- `admin_sessions` - เก็บ session login
- `templates` - เก็บ template ข้อความ
- `click_tracking` - เก็บข้อมูลการคลิก

### Field ใหม่

- `admins.token` - UUID สำหรับ URL เฉพาะของ Admin
- `admins.email` - อีเมล Admin
- `subscribers.admin_id` - Foreign key เชื่อมกับ Admin
- `push_logs.admin_id` - Foreign key เชื่อมกับ Admin
- `push_logs.total_clicks` - จำนวนคลิกทั้งหมด

## 🔒 Security

- Session-based authentication
- HTTP-only cookies
- CSRF protection
- Password hashing with bcrypt

## 🛠 Tech Stack

- **Framework:** Next.js 16
- **Database:** MySQL 8
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts
- **Push:** web-push library
- **Auth:** bcryptjs + session cookies

## 📝 API Endpoints

### Auth
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/logout` - ออกจากระบบ
- `GET /api/auth/me` - ดูข้อมูล user ปัจจุบัน

### Push
- `POST /api/push` - ส่ง Push Notification
- `GET /api/push` - ดูประวัติการส่ง

### Subscribers
- `POST /api/subscribe` - สมัคร subscription
- `DELETE /api/subscribe` - ยกเลิก subscription
- `GET /api/subscribers` - ดูรายการ subscribers
- `DELETE /api/subscribers` - ยกเลิก subscriber

### Templates
- `GET /api/templates` - ดู templates ทั้งหมด
- `POST /api/templates` - สร้าง template
- `PUT /api/templates` - แก้ไข template
- `DELETE /api/templates` - ลบ template

### Stats
- `GET /api/stats` - ดูสถิติทั้งหมด

### Click Tracking
- `POST /api/click` - บันทึกการคลิก
- `GET /api/click` - Redirect พร้อมบันทึกคลิก

## 🔧 Nginx Configuration

```nginx
server {
    listen 80;
    server_name push.your-domain.com;

    location / {
        proxy_pass http://localhost:5240;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📄 License

MIT License

## 👨‍💻 Developer

สร้างโดย Claude AI สำหรับ Jonnoy
