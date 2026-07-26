/**
 * Приймач статистики тесту «Перевірте, чи легко вами маніпулювати».
 *
 * Аркуші:
 *  - "results":   Дата | Бали | Рівень | Q1..Q10 (лише обрана літера А/Б/В/Г)
 *  - "questions": довідник Q# | Пастка | Текст питання (разово: Run → setupQuestions)
 *  - "stats":     авто-дашборд з формулами (разово: Run → setupStats)
 *
 * Після зміни коду: Deploy → Manage deployments → ✏️ → Deploy.
 */
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

var TRAPS = [
  "Упередження підтвердження", "Упередження підтвердження",
  "Ефект фреймінгу", "Ефект фреймінгу",
  "Евристика доступності", "Евристика доступності",
  "Ефект ілюзорної правди", "Ефект ілюзорної правди",
  "Упередження авторитету", "Упередження авторитету",
];

/** Правильні відповіді Q1..Q10. */
var KEY = ["Б", "Г", "А", "В", "Б", "Б", "В", "В", "В", "В"];

/** Разове заповнення довідника питань: Run → setupQuestions */
function setupQuestions() {
  var Q = [
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("questions") || ss.insertSheet("questions");
  sh.clear();
  sh.appendRow(["Q#", "Пастка", "Правильна", "Текст питання"]);
  Q.forEach(function (t, i) { sh.appendRow([i + 1, TRAPS[i], KEY[i], t]); });
}

/** Разове створення авто-дашборда: Run → setupStats */
function setupStats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("stats") || ss.insertSheet("stats");
  sh.clear();

  sh.appendRow(["Питання", "Пастка", "Правильна", "А", "Б", "В", "Г", "Відповідей", "% правильних"]);
  // Q1..Q10 лежать у results!D..M
  var cols = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
  for (var i = 0; i < 10; i++) {
    var c = cols[i];
    var rng = "results!" + c + "2:" + c;
    sh.appendRow([
      "Q" + (i + 1),
      TRAPS[i],
      KEY[i],
      '=COUNTIF(' + rng + ',"А")',
      '=COUNTIF(' + rng + ',"Б")',
      '=COUNTIF(' + rng + ',"В")',
      '=COUNTIF(' + rng + ',"Г")',
      "=COUNTA(" + rng + ")",
      '=IFERROR(ROUND(COUNTIF(' + rng + ',"' + KEY[i] + '")/COUNTA(' + rng + ')*100)&"%","—")',
    ]);
  }

  sh.appendRow([""]);
  sh.appendRow(["Рівень", "Проходжень"]);
  ["Час вмикати критичне мислення", "Обережний читач", "Майстер медіаграмотності"].forEach(function (l) {
    sh.appendRow([l, '=COUNTIF(results!C2:C,"' + l + '")']);
  });
  sh.appendRow(["Всього проходжень", "=COUNTA(results!A2:A)"]);
  sh.appendRow(["Середній бал", '=IFERROR(ROUND(AVERAGE(results!B2:B),1),"—")']);
}
