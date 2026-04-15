// ============================================================
// GOOGLE APPS SCRIPT - IZONE IELTS PLACEMENT TEST
// ============================================================
// HƯỚNG DẪN CÀI ĐẶT:
// 1. Mở Google Sheets mới tại sheets.google.com
// 2. Vào Extensions > Apps Script
// 3. Xoá code cũ, paste toàn bộ file này vào
// 4. Click Deploy > New deployment > Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Copy URL và paste vào CONFIG.GOOGLE_SCRIPT_URL trong index.html
// ============================================================

const SHEET_NAME_RESULTS  = 'KetQua';
const SHEET_NAME_QUESTIONS = 'CauHoi';

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getQuestions') {
    return getQuestions(e.parameter.type);
  }
  if (action === 'saveResult') {
    return saveResult(e);
  }

  // Default: return info
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'HappyHouseEntryTestDatabase' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Allow CORS
function doPost(e) {
  return doGet(e);
}

// ============================================================
// LẤY CÂU HỎI TỪ SHEET "CauHoi"
// ============================================================
// Cột trong Sheet CauHoi:
// A: id | B: section | C: type | D: level | E: question |
// F: passage | G: audio | H: optionA | I: optionB | J: optionC | K: optionD |
// L: correct (A/B/C/D) | M: active (TRUE/FALSE)
function getQuestions(testType) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME_QUESTIONS);

    if (!sheet) {
      // Tạo sheet với dữ liệu mẫu nếu chưa có
      sheet = createSampleQuestionsSheet(ss);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const questions = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // bỏ qua dòng trống

      const active = row[12]; // cột M
      if (active === false || active === 'FALSE') continue;

      const section = row[1].toString().toLowerCase();

      // Filter theo test type
      if (testType === 'mini' && !['grammar', 'vocabulary'].includes(section)) continue;

      const options = [];
      if (row[7]) options.push(row[7].toString());
      if (row[8]) options.push(row[8].toString());
      if (row[9]) options.push(row[9].toString());
      if (row[10]) options.push(row[10].toString());

      questions.push({
        id: row[0].toString(),
        section: section,
        type: row[2].toString() || 'multiple_choice',
        level: row[3].toString() || 'B1',
        question: row[4].toString(),
        passage: row[5] ? row[5].toString() : null,
        audio: row[6] ? row[6].toString() : null,
        options: options,
        correct: row[11].toString().toUpperCase()
      });
    }

    // Shuffle và giới hạn số câu
    const shuffled = shuffle(questions);
    const limit = testType === 'mini' ? 30 : 95;

    return ContentService
      .createTextOutput(JSON.stringify({ questions: shuffled.slice(0, limit) }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// LƯU KẾT QUẢ VÀO SHEET "KetQua"
// ============================================================
function saveResult(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME_RESULTS);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME_RESULTS);
      // Tạo header
      sheet.appendRow([
        'Thời gian', 'Họ tên', 'Số điện thoại', 'Email',
        'Loại bài test', 'Band IELTS', 'Điểm đúng', 'Tổng câu',
        'Tỷ lệ (%)', 'Ngữ pháp', 'Từ vựng', 'Nghe', 'Đọc',
        'Thời gian làm (phút)', 'Chi tiết'
      ]);
      // Format header
      const headerRange = sheet.getRange(1, 1, 1, 15);
      headerRange.setBackground('#1A2744');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const p = e.parameter;
    const sections = JSON.parse(p.sections || '{}');
    const pct = p.totalQ > 0 ? Math.round(p.totalCorrect / p.totalQ * 100) : 0;
    const durationMin = Math.round(parseInt(p.duration || 0) / 60 * 10) / 10;

    const getSectionScore = (key) => {
      const s = sections[key];
      return s ? `${s.correct}/${s.total}` : '-';
    };

    sheet.appendRow([
      new Date(p.timestamp || new Date()),
      p.name,
      p.phone,
      p.email || '',
      p.testType === 'full' ? 'Full Test' : 'Mini Test',
      parseFloat(p.band),
      parseInt(p.totalCorrect),
      parseInt(p.totalQ),
      pct + '%',
      getSectionScore('grammar'),
      getSectionScore('vocabulary'),
      getSectionScore('listening'),
      getSectionScore('reading'),
      durationMin,
      p.sections
    ]);

    // Auto format cột A (date)
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setNumberFormat('dd/MM/yyyy HH:mm');

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// TẠO SHEET CÂU HỎI MẪU
// ============================================================
function createSampleQuestionsSheet(ss) {
  const sheet = ss.insertSheet(SHEET_NAME_QUESTIONS);

  // Headers
  sheet.appendRow([
    'id', 'section', 'type', 'level', 'question',
    'passage', 'audio_url',
    'optionA', 'optionB', 'optionC', 'optionD',
    'correct', 'active'
  ]);

  // Format header
  const headerRange = sheet.getRange(1, 1, 1, 13);
  headerRange.setBackground('#E8303A');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Câu hỏi mẫu
  const sampleData = [
    [1, 'grammar', 'multiple_choice', 'A2',
     '‘............................... on Sundays?’ ‘No, not usually.’',
     '', '', 'Do you work', 'Are you work', 'Do you working', 'Are you working', 'A', true],
  
    [2, 'grammar', 'multiple_choice', 'B1',
     "I've told my bank to close my account. ... an account with a more ethical bank.",
     '', '', 'I opened', 'I open', 'I am going to open', 'I’m opening', 'C', true],
  
    [3, 'grammar', 'multiple_choice', 'A2',
     '‘What ……… next weekend?’ ‘Nothing. I’ve got no plans.’',
     '', '', 'do you do', 'are you doing', 'will you do', 'would you do', 'B', true],
  
    [4, 'grammar', 'multiple_choice', 'A2',
     'I’m going shopping. I need ……………………………….',
     '', '', 'some new jeans', 'a new jeans', 'a new pair of jeans', 'a new pair jeans', 'C', true],
  
    [5, 'grammar', 'multiple_choice', 'A2',
     'My sister …………………………….. by plane.',
     '', '', 'has never travel', 'has never travelled', 'is never travelled', 'has never been travelled', 'B', true],
  
    [6, 'grammar', 'multiple_choice', 'B1',
     'I ______ (lie)! It’s true!',
     '', '', 'lie', 'am lying', 'am not lying', 'lied', 'C', true],
  
    [7, 'grammar', 'multiple_choice', 'A2',
     'What time ______ (Lisa/phone)?',
     '', '', 'did Lisa phone', 'does Lisa phone', 'Lisa phones', 'has Lisa phoned', 'A', true],
  
    [8, 'grammar', 'multiple_choice', 'A2',
     '______ (you/see) Jenny last night?',
     '', '', 'Do you see', 'Did you see', 'Have you seen', 'Are you seeing', 'B', true],
  
    [9, 'grammar', 'multiple_choice', 'B1',
     'It ______ (rain) a lot while we were on holiday.',
     '', '', 'rained', 'was raining', 'has rained', 'rains', 'B', true],
  
    [10, 'grammar', 'multiple_choice', 'A2',
     'I think you look ______ (pretty)',
     '', '', 'pretty', 'prettier', 'prettiest', 'beauty', 'A', true],
  
    [11, 'grammar', 'multiple_choice', 'A2',
     'Dad didn’t help me. I did it all themselves.',
     '', '', 'themselves', 'myself', 'himself', 'yourself', 'B', true],
  
    [12, 'grammar', 'multiple_choice', 'B1',
     'A lot of time wastes on pointless meetings.',
     '', '', 'wastes', 'is wasted', 'was waste', 'wasting', 'B', true],
  
    [13, 'grammar', 'multiple_choice', 'B1',
     'What would you do if you have to do this again?',
     '', '', 'have', 'had', 'will have', 'having', 'B', true],
  
    [14, 'grammar', 'multiple_choice', 'A2',
     'I’m not very good with telling stories.',
     '', '', 'with', 'at', 'in', 'for', 'B', true],
  
    [15, 'grammar', 'multiple_choice', 'B1',
     'I wish you will put your toys away!',
     '', '', 'will', 'would', 'can', 'are', 'B', true],
  
    [16, 'vocabulary', 'multiple_choice', 'A1',
     'A ... is white or grey and is high in the sky.',
     '', '', 'cloud', 'cold', 'storm', 'wind', 'A', true],
  
    [17, 'vocabulary', 'multiple_choice', 'A1',
     'A ... is where you see films.',
     '', '', 'bank', 'cinema', 'post office', 'stadium', 'B', true],
  
    [18, 'vocabulary', 'multiple_choice', 'A1',
     'We need this ... to get on transport.',
     '', '', 'glasses', 'bill', 'ticket', 'cheque', 'C', true],
  
    [19, 'vocabulary', 'multiple_choice', 'A1',
     'Most people have five... on each hand.',
     '', '', 'arms', 'fingers', 'legs', 'toes', 'B', true],
  
    [20, 'vocabulary', 'multiple_choice', 'A1',
     'An ... area with many trees.',
     '', '', 'forest', 'mountain', 'plant', 'lake', 'A', true],
  
    [21, 'vocabulary', 'multiple_choice', 'A2',
     'Bob ….. a lot of money in business.',
     '', '', 'spent', 'made', 'saved', 'owed', 'B', true],
  
    [22, 'vocabulary', 'multiple_choice', 'A2',
     'Home Lovers have lots of ….. in sale.',
     '', '', 'debts', 'fortunes', 'bargains', 'fees', 'C', true],
  
    [23, 'vocabulary', 'multiple_choice', 'A2',
     'Let me just add ….. what I’m buying.',
     '', '', 'on', 'up', 'over', 'in', 'B', true],
  
    [24, 'vocabulary', 'multiple_choice', 'A2',
     'I’ve bought a new ______ book (COOK)',
     '', '', 'cook', 'cooked', 'cooking', 'cookery', 'C', true],
  
    [25, 'vocabulary', 'multiple_choice', 'B1',
     'I’ve come to the ______ (CONCLUDE)',
     '', '', 'conclude', 'conclusion', 'concluding', 'concluded', 'B', true],
  
    [26, 'vocabulary', 'multiple_choice', 'A2',
     'We are all in ______ (AGREE)',
     '', '', 'agree', 'agreement', 'agreeing', 'agreed', 'B', true],
  
    [27, 'vocabulary', 'multiple_choice', 'A2',
     'Todd is really ______ (ART)',
     '', '', 'art', 'artist', 'artistic', 'artistry', 'C', true],
  
    [28, 'vocabulary', 'multiple_choice', 'A2',
     'Women still ______ less than men.',
     '', '', 'earn', 'alone', 'close', 'examine', 'A', true],
  
    [29, 'vocabulary', 'multiple_choice', 'A2',
     'My diary is ______.',
     '', '', 'earn', 'private', 'close', 'artistic', 'B', true],
  
    [30, 'vocabulary', 'multiple_choice', 'A2',
     'We have a very ______ relationship.',
     '', '', 'alone', 'private', 'close', 'examine', 'C', true]
  
  ];

  sampleData.forEach(row => sheet.appendRow(row));

  // Auto-resize columns
  sheet.autoResizeColumns(1, 13);

  // Ghi chú hướng dẫn
  const note = sheet.getRange(1, 1);
  note.setNote(
    'HƯỚNG DẪN:\n' +
    '- section: grammar / vocabulary / listening / reading\n' +
    '- type: multiple_choice / fill_blank / reading / listening\n' +
    '- correct: A, B, C hoặc D\n' +
    '- active: TRUE để hiện, FALSE để ẩn câu hỏi\n' +
    '- passage: đoạn văn đọc hiểu (nếu có)\n' +
    '- audio_url: link file MP3 (nếu có)'
  );

  return sheet;
}

// ============================================================
// HELPER: SHUFFLE ARRAY
// ============================================================
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
