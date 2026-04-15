# 🎯 IZONE IELTS Placement Test — Hướng dẫn cài đặt

## Tổng quan
Website gồm 2 file chính:
- `index.html` — Giao diện website (chạy trên trình duyệt)
- `google-apps-script.js` — Code chạy trên Google Sheets (làm backend + database)

---

## BƯỚC 1: Tạo Google Sheets + Apps Script

### 1.1 Tạo Spreadsheet mới
1. Vào [sheets.google.com](https://sheets.google.com)
2. Tạo file mới, đặt tên ví dụ: **"IZONE IELTS Database"**

### 1.2 Cài Apps Script
1. Trong Spreadsheet, vào **Extensions > Apps Script**
2. Xóa hết code mặc định
3. Copy toàn bộ nội dung file `google-apps-script.js` và paste vào
4. Nhấn **Save** (Ctrl+S)

### 1.3 Deploy Web App
1. Nhấn **Deploy > New deployment**
2. Chọn loại: **Web App**
3. Cấu hình:
   - **Description**: IZONE IELTS API
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone ← quan trọng!
4. Nhấn **Deploy**
5. **Copy URL** dạng: `https://script.google.com/macros/s/XXXXX/exec`

---

## BƯỚC 2: Kết nối website với Google Sheets

Mở file `index.html`, tìm dòng:
```javascript
GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
```

Thay `YOUR_SCRIPT_ID` bằng URL thực bạn vừa copy:
```javascript
GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycb.../exec',
```

---

## BƯỚC 3: Chạy lần đầu — tạo Sheet tự động

1. Mở `index.html` trong trình duyệt (hoặc upload lên hosting)
2. Điền thông tin, chọn test, làm bài
3. Lần đầu chạy, Apps Script sẽ **tự tạo** 2 Sheet:
   - **CauHoi** — chứa câu hỏi (đã có sẵn câu mẫu)
   - **KetQua** — lưu kết quả học sinh

---

## BƯỚC 4: Thêm/sửa câu hỏi trong Sheet "CauHoi"

### Cấu trúc cột:

| Cột | Tên | Mô tả |
|-----|-----|-------|
| A | id | Số thứ tự (1, 2, 3...) |
| B | section | `grammar` / `vocabulary` / `listening` / `reading` |
| C | type | `multiple_choice` / `fill_blank` / `reading` / `listening` |
| D | level | `A1` / `A2` / `B1` / `B2` / `C1` |
| E | question | Nội dung câu hỏi |
| F | passage | Đoạn văn đọc hiểu (để trống nếu không có) |
| G | audio_url | Link file MP3 (để trống nếu không có) |
| H | optionA | Đáp án A |
| I | optionB | Đáp án B |
| J | optionC | Đáp án C |
| K | optionD | Đáp án D (để trống nếu chỉ có 3 đáp án) |
| L | correct | Đáp án đúng: **A**, **B**, **C**, hoặc **D** |
| M | active | **TRUE** để hiện, **FALSE** để ẩn |

### Ví dụ thêm câu mới:
```
1  | 8         | grammar | multiple_choice | B1 
2  | He _____ for 3 hours when she called.
3  | (để trống) | (để trống)
4  | had been waiting | was waiting | has waited | waited
5  | A | TRUE
```

---

## BƯỚC 5: Xem kết quả học sinh

Mở Sheet **KetQua** trong Google Sheets:

| Cột | Nội dung |
|-----|---------|
| A | Thời gian làm bài |
| B | Họ tên |
| C | **Số điện thoại** ← quan trọng nhất |
| D | Email |
| E | Loại bài test |
| F | Band IELTS |
| G | Số câu đúng |
| H | Tổng số câu |
| I | Tỷ lệ % |
| J-M | Điểm từng kỹ năng |
| N | Thời gian làm (phút) |

---

## BƯỚC 6: Đưa website lên hosting

### Cách 1 — Miễn phí (Netlify)
1. Vào [netlify.com](https://netlify.com), tạo tài khoản
2. Kéo thả file `index.html` vào ô "Deploy manually"
3. Nhận URL dạng: `yoursite.netlify.app`

### Cách 2 — GitHub Pages (miễn phí)
1. Upload `index.html` lên GitHub repo
2. Vào Settings > Pages > chọn branch main
3. URL: `yourusername.github.io/repo-name`

### Cách 3 — Host riêng
Upload `index.html` lên bất kỳ hosting nào hỗ trợ HTML tĩnh.

---

## Câu hỏi thường gặp

**Q: Câu hỏi có audio thì làm thế nào?**
A: Upload file MP3 lên Google Drive, lấy link chia sẻ công khai, paste vào cột G (audio_url).

**Q: Muốn thêm logo hoặc thay đổi màu sắc?**
A: Mở `index.html`, tìm phần `:root { }` để đổi màu. Tìm class `.logo-icon` để đổi logo.

**Q: Bài test không load câu hỏi từ Sheets?**
A: Kiểm tra URL trong CONFIG có đúng không, và Web App đã được deploy với quyền "Anyone".

**Q: Muốn thêm phần Listening (có audio)?**
A: Điền URL file MP3 vào cột G trong Sheet CauHoi. Website sẽ tự hiển thị audio player.

---

## Liên hệ hỗ trợ
Nếu cần hỗ trợ kỹ thuật, liên hệ đội ngũ phát triển của bạn.
