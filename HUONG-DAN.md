# Đưa báo cáo 일별 인원현황표 lên Netlify (dữ liệu dùng chung)

Bộ file này gồm:
- `public/index.html` — trang báo cáo (đã có sẵn số liệu tháng 10/2026, sơ đồ tổ chức…)
- `netlify/functions/db.mjs` — "kho dữ liệu chung" chạy trên Netlify (Netlify Blobs)
- `netlify.toml`, `package.json` — cấu hình cho Netlify

Khi mở trang trên link Netlify, mọi người cùng xem và sửa **một bộ số liệu chung**.
Ai sửa xong thì người khác thấy sau khoảng 5 giây (không cần tải lại trang).

## Cách đưa lên (không cần cài gì trên máy)

1. **Tạo tài khoản**: GitHub (github.com) và Netlify (app.netlify.com — chọn đăng nhập bằng GitHub).
2. **GitHub → New repository** → đặt tên, ví dụ `bao-cao-nhan-luc` → chọn **Private** → *Create repository*.
3. Trong repo mới bấm **uploading an existing file** → kéo thả **toàn bộ nội dung** thư mục đã giải nén
   (`netlify.toml`, `package.json`, thư mục `public`, thư mục `netlify`) → **Commit changes**.
4. **Netlify → Add new project → Import an existing project → GitHub** → chọn repo vừa tạo → **Deploy**.
   (Các thiết lập đã có sẵn trong `netlify.toml`, không cần sửa.)
5. Đổi tên link: **Project configuration → Change project name** → ví dụ `nhanluc-laprap`
   → link sẽ là `https://nhanluc-laprap.netlify.app`.
6. Mở link lần đầu: trang tự đưa số liệu có sẵn trong file lên kho chung. Từ đó gửi link cho mọi người.

> Lưu ý: kéo thả lên **Netlify Drop** chỉ đưa trang lên, phần kho dữ liệu chung sẽ không chạy → hãy đưa qua GitHub như trên
> (hoặc dùng Netlify CLI: `npm i -g netlify-cli` rồi `netlify deploy --prod` trong thư mục này).

## Cập nhật trang sau này
- Khi có bản báo cáo mới: vào repo GitHub → thư mục `public` → **Add file → Upload files** → thả file `index.html` mới (ghi đè) → Commit.
  Netlify tự đưa bản mới lên trong 1–2 phút. **Số liệu trong kho chung giữ nguyên**, không bị file mới ghi đè.

## Lưu ý
- Ai có link đều xem và sửa được. Không gửi link ra ngoài công ty.
- Nên bấm **Sao lưu dữ liệu** định kỳ (ví dụ cuối tuần) để giữ một bản dự phòng; nếu ai đó lỡ xóa nhầm có thể **Khôi phục từ file sao lưu**.
- Hai người cùng sửa **cùng một tháng** đúng cùng lúc thì bản lưu sau cùng được giữ — nên chia người phụ trách từng phần.
