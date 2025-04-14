# Báo cáo chi tiết API & Hướng dẫn test với Postman

## 1. Thông tin chung
- **Base URL:** `http://127.0.0.1:5000`
- **Prefix:** Hầu hết các API đều có prefix `/api`
- **Xác thực:** Các API cần xác thực sử dụng JWT Bearer Token (`Authorization: Bearer <token>`)

---

## 2. Danh sách endpoint chi tiết

### 2.1. Auth (Xác thực)
#### Đăng ký
- `POST /api/auth/register`
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword",
    "fullName": "Tên người dùng"
  }
  ```
- Response: 201 Created, trả về thông tin user hoặc thông báo thành công.

#### Đăng nhập
- `POST /api/auth/login`
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- Response: 200 OK
  ```json
  {
    "access_token": "..."
  }
  ```
- Lưu ý: Dùng access_token này cho các API cần xác thực.

#### Quên mật khẩu
- `POST /api/auth/forgot-password`
- Body:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- Response: 200 OK, gửi email reset password.

#### Đặt lại mật khẩu
- `POST /api/auth/reset-password`
- Body:
  ```json
  {
    "token": "token_reset",
    "password": "newpassword"
  }
  ```
- Response: 200 OK, đổi mật khẩu thành công.

#### Đăng nhập MXH
- `POST /api/auth/social-login`
- Body: Tùy nền tảng, thường gồm access_token của MXH.
- Response: 200 OK, trả về access_token.

---

### 2.2. Users (Người dùng)
#### Lấy thông tin cá nhân
- `GET /api/users/me` (Bearer Token)
- Response: 200 OK, trả về thông tin user.

#### Cập nhật thông tin cá nhân
- `PUT /api/users/me` (Bearer Token)
- Body: các trường muốn cập nhật (fullName, phoneNumber, ...)
- Response: 200 OK, trả về user đã cập nhật.

#### Quản trị (admin)
- `GET /api/users` - Lấy danh sách user
- `GET /api/users/:id` - Lấy user theo id
- `PUT /api/users/:id` - Sửa user
- `DELETE /api/users/:id` - Xóa user
- Tất cả đều cần Bearer Token của admin.

---

### 2.3. Products (Sản phẩm)
#### Tạo sản phẩm (admin)
- `POST /api/products`
- Body: các trường sản phẩm (name, price, ...)
- Response: 201 Created

#### Lấy danh sách sản phẩm
- `GET /api/products?search=...&category=...&sortBy=...&order=...&limit=...&page=...`
- Response: 200 OK, trả về mảng sản phẩm.

#### Lấy sản phẩm nổi bật
- `GET /api/products/featured`

#### Lấy chi tiết sản phẩm
- `GET /api/products/:id`

#### Sửa/Xóa sản phẩm (admin)
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

---

### 2.4. Categories (Danh mục)
- `POST /api/categories` (admin)
- `GET /api/categories`
- `GET /api/categories/:id`
- `PUT /api/categories/:id` (admin)
- `DELETE /api/categories/:id` (admin)

---

### 2.5. Orders (Đơn hàng)
#### Người dùng
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Lấy đơn hàng của tôi
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `PUT /api/orders/:id/cancel` - Hủy đơn hàng

#### Quản trị (admin)
- `GET /api/orders/admin/orders` - Lấy tất cả đơn hàng
- `PUT /api/orders/admin/orders/:id/status` - Cập nhật trạng thái đơn hàng

---

### 2.6. Posts (Bài viết)
- `POST /api/posts` (admin)
- `GET /api/posts?search=...&tag=...&limit=...&page=...`
- `GET /api/posts/:slug`
- `PUT /api/posts/:id` (admin)
- `DELETE /api/posts/:id` (admin)

---

### 2.7. Các module khác (Cart, Reviews, Wishlist, Payments, Promotions, Subscriptions, Contact)
- Tương tự, các endpoint theo module: `/api/cart`, `/api/reviews`, `/api/wishlist`, `/api/payments`, `/api/promotions`, `/api/subscriptions`, `/api/contact`
- Tham khảo thêm trong code hoặc swagger.

---

## 3. Hướng dẫn test với Postman

### 3.1. Đăng nhập lấy token
- Gửi request `POST /api/auth/login` để lấy access_token.
- Thêm header: `Authorization: Bearer <access_token>` cho các request cần xác thực.

### 3.2. Test các API
- Chọn đúng method (GET/POST/PUT/DELETE).
- Gửi dữ liệu dạng JSON cho các request POST/PUT.
- Kiểm tra response code và message.

### 3.3. Lưu ý
- Một số API chỉ dành cho admin (cần tài khoản admin).
- Các API có thể trả về lỗi 401 nếu thiếu hoặc sai token.
- Các trường hợp lỗi thường gặp: 400 (input sai), 401 (chưa đăng nhập), 403 (không đủ quyền), 404 (không tìm thấy), 409 (trùng dữ liệu).

---

## 4. Tham khảo nâng cao
- Nếu có Swagger, truy cập: `http://127.0.0.1:5000/api/docs` để xem/tương tác trực tiếp với API.
- Xem chi tiết request/response trong các file controller tương ứng.

---

**Chúc bạn test API thành công! Nếu cần chi tiết từng trường dữ liệu, hãy xem các file DTO trong từng module.**