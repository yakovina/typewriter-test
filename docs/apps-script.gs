/**
 * Приймач статистики тесту «Перевірте, чи легко вами маніпулювати».
 *
 * Аркуші:
 *  - "results":   Дата | Бали | Рівень | Q1..Q10 (лише обрана літера А/Б/В/Г)
 *  - "questions": довідник Q# | Пастка | Правильна | Текст питання (Run → setupQuestions)
 *  - "stats":     авто-дашборд з формулами (Run → setupStats)
 *
 * Разові утиліти: cleanupResults — прибирає ✓/✗ зі старих рядків results.
 * Після зміни doPost: Deploy → Manage deployments → ✏️ → Version: New version → Deploy.
 */

var TRAPS = [
  "Упередження підтвердження", "Упередження підтвердження",
  "Ефект фреймінгу", "Ефект фреймінгу",
  "Евристика доступності", "Евристика доступності",
  "Ефект ілюзорної правди", "Ефект ілюзорної правди",
  "Упередження авторитету", "Упередження авторитету",
];

/** Правильні відповіді Q1..Q10. */
var KEY = ["Б", "Г", "А", "В", "Б", "Б", "В", "В", "В", "В"];

/** Аркуш із даними: відповіді Google Form. */
var DATA_SHEET = "Form Responses 1";

/** Тексти питань Q1..Q10. */
var QTEXTS = [
  "Який матеріал ви відкриєте першим і прочитаєте з більшою увагою? (велодоріжки: два заголовки)",
  "Якою буде ваша реакція після прочитання цього тексту? (колонка про податки для ФОПів)",
  "Який заголовок інтуїтивно викликає у вас більше бажання віднести гроші до банку? (депозити: зберегти 85% vs втратити 15%)",
  "Чому ці два видання, описуючи одну й ту саму подію, викликають протилежні емоції? (зведення ППО: 80% збито vs 20% прорвалось)",
  "Чому поїздка автомобілем інтуїтивно здається вашим знайомим безпечнішою за переліт? (літаки vs автомобілі)",
  "Чому після прочитання виникає інтуїтивне відчуття, що небезпека тепер у кожній шаурмічній? (вірусний допис про отруєння)",
  "Наскільки впевнено ви почуватиметеся, оплачуючи покупку на незнайомому сайті в режимі «Інкогніто»? (міф про режим інкогніто)",
  "Як ви відреагуєте на таке повідомлення? (фейк про блокування карток і 19,5% податку)",
  "Як ця категорична порада від всесвітньо відомого інноватора має вплинути на ставлення до медичних призначень? (Маск про антидепресанти)",
  "Який із цих двох прогнозів викликає у вас більше довіри для ухвалення фінансового рішення? (нерухомість: анонім vs чиновник)",
];

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var res = ss.getSheetByName("results") || ss.insertSheet("results");
  if (res.getLastRow() === 0) {
    var head = ["Дата", "Бали", "Рівень"];
    for (var i = 1; i <= 10; i++) head.push("Q" + i);
    res.appendRow(head);
  }
  var byId = {};
  (data.answers || []).forEach(function (a) { byId[a.id] = a; });
  var row = [new Date(), data.score, data.level];
  for (var q = 1; q <= 10; q++) {
    var a = byId[q];
    row.push(a ? a.picked : "");
  }
  res.appendRow(row);

  return ContentService.createTextOutput("ok");
}

/** Разова зачистка results: у Q-колонках лишає тільки першу літеру (без ✓/✗). */
function cleanupResults() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("results");
  if (!sh || sh.getLastRow() < 2) return;
  var rng = sh.getRange(2, 4, sh.getLastRow() - 1, 10); // D2:M
  var vals = rng.getValues();
  for (var r = 0; r < vals.length; r++) {
    for (var c = 0; c < vals[r].length; c++) {
      var v = String(vals[r][c]).trim();
      vals[r][c] = v ? v.charAt(0) : "";
    }
  }
  rng.setValues(vals);
}

/** Разове заповнення довідника питань: Run → setupQuestions */
function setupQuestions() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("questions") || ss.insertSheet("questions");
  sh.clear();
  sh.appendRow(["Q#", "Пастка", "Правильна", "Текст питання"]);
  QTEXTS.forEach(function (t, i) { sh.appendRow([i + 1, TRAPS[i], KEY[i], t]); });
}

/** Разове створення авто-дашборда: Run → setupStats */
function setupStats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("stats") || ss.insertSheet("stats");
  sh.clear();

  sh.appendRow([
    "Питання", "Пастка", "Текст питання", "Правильна",
    "А", "Б", "В", "Г", "Відповідей", "% правильних",
  ]);
  // Q1..Q10 лежать у results!D..M
  var cols = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
  for (var i = 0; i < 10; i++) {
    var c = cols[i];
    var rng = "'" + DATA_SHEET + "'!" + c + "2:" + c;
    sh.appendRow([
      "Q" + (i + 1),
      TRAPS[i],
      QTEXTS[i],
      KEY[i],
      '=COUNTIF(' + rng + ',"А")',
      '=COUNTIF(' + rng + ',"Б")',
      '=COUNTIF(' + rng + ',"В")',
      '=COUNTIF(' + rng + ',"Г")',
      "=COUNTA(" + rng + ")",
      "=IFERROR(COUNTIF(" + rng + ',"' + KEY[i] + '")/COUNTA(' + rng + '),"")',
    ]);
  }
  sh.getRange("J2:J11").setNumberFormat("0%");

  sh.appendRow([""]);
  sh.appendRow(["Рівень", "Проходжень"]);
  ["Час вмикати критичне мислення", "Обережний читач", "Майстер медіаграмотності"].forEach(function (l) {
    sh.appendRow([l, '=COUNTIF(\'' + DATA_SHEET + '\'!C2:C,"' + l + '")']);
  });
  sh.appendRow(["Всього проходжень", "=COUNTA('" + DATA_SHEET + "'!A2:A)"]);
  sh.appendRow(["Середній бал", '=IFERROR(ROUND(AVERAGE(\'' + DATA_SHEET + '\'!B2:B),1),"—")']);
}

/* ===================== ОФОРМЛЕННЯ ===================== */

var INK = "#262626";
var PAPER = "#f6f1e2";
var PAPER2 = "#efe7d0";
var RED = "#c03a2e";
var GOLD = "#b07d2b";
var GREEN = "#2e7d3b";
var GREEN_BG = "#e2efe3";
var RED_BG = "#f8e6e3";

/** Разове оформлення всіх аркушів: Run → formatAll */
function formatAll() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  formatResults_(ss);
  formatQuestions_(ss);
  formatStats_(ss);
}

function header_(sh, cols) {
  sh.getRange(1, 1, 1, cols)
    .setBackground(INK).setFontColor("#ffffff").setFontWeight("bold")
    .setFontSize(11).setVerticalAlignment("middle");
  sh.setRowHeight(1, 34);
  sh.setFrozenRows(1);
}

function formatResults_(ss) {
  var sh = ss.getSheetByName(DATA_SHEET);
  if (!sh) return;
  header_(sh, 13);
  sh.setColumnWidth(1, 150);
  sh.getRange("A2:A").setNumberFormat("dd.mm.yyyy hh:mm");
  sh.getRange("B2:B").setHorizontalAlignment("center").setFontWeight("bold");
  sh.getRange("D1:M1000").setHorizontalAlignment("center");
  sh.getRange("A2:M1000").setBackground(PAPER);

  // правильна відповідь — зелена клітинка, неправильна — рожева
  var cols = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
  var rules = [];
  for (var i = 0; i < 10; i++) {
    var c = cols[i];
    var rng = sh.getRange(c + "2:" + c + "1000");
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($' + c + '2<>"",$' + c + '2="' + KEY[i] + '")')
      .setBackground(GREEN_BG).setFontColor(GREEN).setRanges([rng]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($' + c + '2<>"",$' + c + '2<>"' + KEY[i] + '")')
      .setBackground(RED_BG).setFontColor(RED).setRanges([rng]).build());
  }
  sh.setConditionalFormatRules(rules);
}

function formatQuestions_(ss) {
  var sh = ss.getSheetByName("questions");
  if (!sh) return;
  header_(sh, 4);
  sh.setColumnWidth(2, 220);
  sh.setColumnWidth(4, 560);
  sh.getRange("A2:A11").setHorizontalAlignment("center").setFontWeight("bold");
  sh.getRange("C2:C11").setHorizontalAlignment("center")
    .setFontWeight("bold").setFontColor(GREEN);
  sh.getRange("D2:D11").setWrap(true);
  sh.getRange("A2:D11").setBackground(PAPER).setVerticalAlignment("middle");
}

function formatStats_(ss) {
  var sh = ss.getSheetByName("stats");
  if (!sh) return;
  header_(sh, 10);
  sh.setColumnWidth(2, 210);
  sh.setColumnWidth(3, 420);
  sh.getRange("C2:C11").setWrap(true).setFontSize(9);
  sh.getRange("A2:A11").setHorizontalAlignment("center").setFontWeight("bold");
  sh.getRange("D2:D11").setHorizontalAlignment("center")
    .setFontWeight("bold").setFontColor(GREEN);
  sh.getRange("E2:J11").setHorizontalAlignment("center");
  sh.getRange("A2:J11").setBackground(PAPER).setVerticalAlignment("middle");
  sh.getRange("A3:J3").setBackground(PAPER2);
  sh.getRange("A5:J5").setBackground(PAPER2);
  sh.getRange("A7:J7").setBackground(PAPER2);
  sh.getRange("A9:J9").setBackground(PAPER2);
  sh.getRange("A11:J11").setBackground(PAPER2);

  // градієнт на % правильних: червоний → жовтий → зелений
  var rules = sh.getConditionalFormatRules() || [];
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .setGradientMinpointWithValue("#e39c92", SpreadsheetApp.InterpolationType.NUMBER, "0")
    .setGradientMidpointWithValue("#ecd9a8", SpreadsheetApp.InterpolationType.NUMBER, "0.5")
    .setGradientMaxpointWithValue("#9ec9a4", SpreadsheetApp.InterpolationType.NUMBER, "1")
    .setRanges([sh.getRange("J2:J11")]).build());
  sh.setConditionalFormatRules(rules);

  // блок рівнів
  sh.getRange("A13:B13").setFontWeight("bold").setBackground(INK).setFontColor("#ffffff");
  sh.getRange("A14:B14").setBackground(RED_BG).setFontColor(RED).setFontWeight("bold");
  sh.getRange("A15:B15").setBackground("#f3ead6").setFontColor(GOLD).setFontWeight("bold");
  sh.getRange("A16:B16").setBackground(GREEN_BG).setFontColor(GREEN).setFontWeight("bold");
  sh.getRange("A17:B18").setFontWeight("bold");
}
