# Thông số ảnh cho trang chủ / Homepage Image Specifications

## Ảnh Hero (hiển thị ngay khi vào trang — ưu tiên cao nhất)

| File | Kích thước | Mô tả ảnh | Ghi chú kỹ thuật |
|------|------------|-----------|-----------------|
| `hero-main.jpg` | 900×675px | Giáo viên đang tương tác với học sinh nhỏ trong lớp học sáng, ấm. Góc chụp ngang, không gian rộng, tông màu tươi sáng. | Tải trước (priority), tỉ lệ 4:3 |
| `hero-small-1.jpg` | 500×300px | Một học sinh đang tự tin phát biểu hoặc trả lời câu hỏi trước lớp, biểu cảm vui, năng động. | Tỉ lệ 5:3 |
| `hero-small-2.jpg` | 500×300px | Nhóm học sinh đang cùng nhau làm bài tập hoặc chơi trò chơi tiếng Anh, ánh mắt tập trung và vui vẻ. | Tỉ lệ 5:3 |

## Ảnh Gallery / bento

| File | Kích thước | Mô tả ảnh | Ghi chú kỹ thuật |
|------|------------|-----------|-----------------|
| `gallery-classroom.jpg` | 900×640px | Toàn cảnh một giờ học — giáo viên đứng bảng, học sinh ngồi theo nhóm, lớp học rộng, trang trí màu sắc, ánh sáng tự nhiên. | Ảnh lớn chiếm 50% bento |
| `gallery-activity.jpg` | 640×380px | Học sinh đang tham gia hoạt động nhóm: chơi thẻ từ vựng, đóng kịch bằng tiếng Anh hoặc trò chơi vận động trong lớp. | Ô nhỏ bento |
| `gallery-teacher.jpg` | 640×380px | Cận cảnh giáo viên đang cúi xuống hướng dẫn một học sinh, thái độ ân cần, học sinh đang nhìn vào sách/bảng. | Ô nhỏ bento |
| `gallery-center.jpg` | 640×380px | Không gian bên trong trung tâm: phòng học sạch sẽ, bàn ghế gọn gàng, tường trang trí chữ tiếng Anh, góc học sinh. | Ô nhỏ bento |

## Ảnh thẻ chương trình theo độ tuổi

| File | Kích thước | Mô tả ảnh | Ghi chú kỹ thuật |
|------|------------|-----------|-----------------|
| `program-young-learners.jpg` | 800×400px | Trẻ 4–7 tuổi đang học qua hình ảnh/flashcard hoặc vận động theo bài hát tiếng Anh, biểu cảm thích thú, hồn nhiên. | Thẻ Tiếng Anh trẻ em, tỉ lệ 2:1 |
| `program-primary.jpg` | 800×400px | Học sinh tiểu học (lớp 1–5) đang đọc sách hoặc viết bài, ngồi theo cặp, không khí học tập tích cực. | Thẻ Tiếng Anh Tiểu học, tỉ lệ 2:1 |
| `program-secondary.jpg` | 800×400px | Học sinh THCS (lớp 6–9) đang thảo luận nhóm hoặc nghe giáo viên giảng bài, vẻ tập trung, chuyên chú. | Thẻ Tiếng Anh THCS, tỉ lệ 2:1 |
| `program-advanced.jpg` | 800×400px | Học sinh lớn hơn đang ôn thi hoặc làm bài kiểm tra, sách vở trên bàn, không khí nghiêm túc nhưng tự tin. | Thẻ Luyện thi & nâng cao, tỉ lệ 2:1 |

## Ảnh khác

| File | Kích thước | Mô tả ảnh | Ghi chú kỹ thuật |
|------|------------|-----------|-----------------|
| `gallery-teacher.jpg` | 600×750px | Chân dung đứng của giáo viên trong lớp học, đang cầm sách hoặc chỉ bảng, nụ cười thân thiện, trang phục gọn gàng. | Dùng thêm ở phần Giáo viên (dọc), tỉ lệ 4:5 |
| `parent-testimonial.jpg` | 640×380px | Phụ huynh hoặc học sinh đang mỉm cười, có thể chụp ngoài lớp học hoặc hành lang trung tâm, cảm giác chân thật. | Thẻ bài viết phần Hoạt động |

## Thư mục chứa ảnh

```
web/public/images/home/
```

## Quy tắc chung

| Quy tắc | Chi tiết |
|---------|---------|
| **Định dạng** | WebP là tốt nhất, dùng JPEG nếu không có WebP (dùng Squoosh để chuyển đổi) |
| **Chất lượng nén** | 80–85% — đủ đẹp, dung lượng hợp lý |
| **Ảnh hero-main** | Không vượt quá 200 KB |
| **Các ảnh còn lại** | Không vượt quá 100 KB mỗi ảnh |
| **Vị trí chủ thể** | Canh giữa hoặc lệch trái — tránh bị cắt mất chủ thể khi hiển thị mobile |
| **Độ phân giải tối thiểu** | Không dùng ảnh nhỏ hơn kích thước ghi ở trên — phóng to sẽ bị mờ |
