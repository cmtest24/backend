# Hướng dẫn cập nhật tài khoản admin

## 1. Đăng nhập để lấy access_token
Gửi request:
```
POST /api/auth/login
{
  "email": "admin@admin.com",
  "password": "admin123"
}
```
Lấy access_token từ response.

---

## 2. Cập nhật role user thành admin qua API (nếu có quyền admin)

Gửi request:
```
PUT /api/users/{id}
Headers:
  Authorization: Bearer <access_token của admin>
Body:
{
  "role": "admin"
}
```
- `{id}` là id của user vừa tạo (ví dụ: `cc6c9a7d-527a-4f90-8bcb-10aef4bdea98`).
- Nếu bạn chưa có tài khoản admin, bạn cần cập nhật trực tiếp trong database.

---

## 3. Cập nhật trực tiếp trong database (PostgreSQL)

Chạy lệnh SQL sau:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@admin.com';
```
Sau đó, tài khoản này sẽ có quyền admin.

---

**Lưu ý:** Nếu hệ thống không cho phép cập nhật role qua API, bạn bắt buộc phải cập nhật trực tiếp trong database.