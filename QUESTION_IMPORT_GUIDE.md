# Hướng dẫn nhập câu hỏi vào hệ thống

## Tổng quan quy trình

```
Câu hỏi thô (text/doc)  →  AI format JSON  →  Dán vào Admin  →  Nhập vào database
```

---

## Bước 1 — Dùng prompt này với AI khác (ChatGPT, Gemini, v.v.)

Sao chép toàn bộ prompt bên dưới, dán vào AI, rồi dán câu hỏi thô vào phần cuối.

---

### PROMPT (copy nguyên)

```
You are a question bank formatter. I will paste raw, unstructured English test questions.
Your job is to parse them and output a JSON array of question objects, strictly matching this schema:

{
  "section": "grammar" | "vocabulary" | "reading" | "listening",
  "type": "multiple_choice" | "fill_blank" | "true_false" | "reading" | "listening",
  "level": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
  "question_text": "string — the question or sentence stem",
  "option_a": "string or null",
  "option_b": "string or null",
  "option_c": "string or null",
  "option_d": "string or null",
  "correct_answer": "A" | "B" | "C" | "D" | null,
  "fill_answer": "string or null",
  "explanation": "string or null",
  "topic_tags": ["tag1", "tag2"]
}

Rules:
- multiple_choice: fill option_a–option_d, set correct_answer to A/B/C/D, fill_answer = null.
- fill_blank: option_a–option_d = null, correct_answer = null, fill_answer = the expected answer string.
- true_false: option_a = "True", option_b = "False", option_c = null, option_d = null. Set correct_answer to "A" or "B".
- Infer section: grammar rules → "grammar", word meaning/usage → "vocabulary", passage-based → "reading", audio-based → "listening".
- Infer level from difficulty: A1–A2 = basic, B1–B2 = intermediate, C1–C2 = advanced. Default to "B1" if unsure.
- Output valid JSON only. No markdown, no explanation — just the raw JSON array.
- If a question is ambiguous or malformed, do your best and include it anyway.

Input:
[DÁN CÂU HỎI VÀO ĐÂY]
```

---

## Bước 2 — Kiểm tra JSON đầu ra

Trước khi nhập, kiểm tra nhanh:

- Đầu ra bắt đầu bằng `[` và kết thúc bằng `]`
- Mỗi câu có đủ `section`, `type`, `question_text`
- `correct_answer` là `"A"`, `"B"`, `"C"`, hoặc `"D"` (hoặc `null` nếu là fill_blank)
- `fill_blank` phải có `fill_answer`

Nếu AI trả về có bọc markdown (```json ... ```), xoá phần đó đi, chỉ giữ lại mảng `[...]`.

---

## Bước 3 — Nhập vào hệ thống

1. Mở trang **Admin → Câu hỏi** (`/admin/questions`)
2. Nhấn nút **Nhập JSON** (góc trên bên phải, cạnh nút Thêm)
3. Dán JSON vào ô text
4. Hệ thống sẽ hiển thị số câu được phát hiện (ví dụ: *"20 câu hỏi được phát hiện"*)
5. Nhấn **Nhập N câu**
6. Hệ thống sẽ:
   - Nhập tất cả câu hợp lệ
   - Bỏ qua câu lỗi và thông báo số câu bị bỏ
   - Tự động reload danh sách

---

## Lưu ý

| Trường | Bắt buộc | Giá trị hợp lệ |
|---|---|---|
| `section` | ✅ | `grammar`, `vocabulary`, `reading`, `listening` |
| `type` | ✅ | `multiple_choice`, `fill_blank`, `true_false`, `reading`, `listening` |
| `level` | ❌ | `A1` `A2` `B1` `B2` `C1` `C2` — mặc định `B1` |
| `correct_answer` | ✅ (trừ fill_blank) | `A` `B` `C` `D` |
| `fill_answer` | ✅ (chỉ fill_blank) | chuỗi text |
| `explanation` | ❌ | chuỗi text |
| `topic_tags` | ❌ | mảng string |

Câu hỏi nhập vào mặc định ở trạng thái **active** và có thể chỉnh sửa sau trong Admin.
