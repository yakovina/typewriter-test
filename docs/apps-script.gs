/**
 * Приймач статистики тесту «Перевірте, чи легко вами маніпулювати».
 *
 * Як підключити:
 * 1. Створіть Google-таблицю (sheets.new).
 * 2. Extensions → Apps Script, вставте цей код замість усього, збережіть.
 * 3. Deploy → New deployment → тип "Web app":
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    → Deploy → скопіюйте "Web app URL" (…/exec).
 * 4. Вставте цей URL у app/stats.ts (STATS_URL) на сайті.
 *
 * Структура: аркуш "results" — один рядок на проходження:
 *   дата | бали | рівень | Q1 | Q2 | … | Q10
 *   у клітинці питання: обрана літера + ✓/✗ (наприклад "Б ✓").
 * Аркуш "answers" — довгий формат, один рядок на відповідь (для зведених таблиць):
 *   дата | id питання | пастка | обрана | правильно (TRUE/FALSE)
 */
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var now = new Date();

  // --- results: рядок на проходження ---
  var res = ss.getSheetByName("results") || ss.insertSheet("results");
  if (res.getLastRow() === 0) {
    var head = ["Дата", "Бали", "Рівень"];
    for (var i = 1; i <= 10; i++) head.push("Q" + i);
    res.appendRow(head);
  }
  var byId = {};
  (data.answers || []).forEach(function (a) { byId[a.id] = a; });
  var row = [now, data.score, data.level];
  for (var q = 1; q <= 10; q++) {
    var a = byId[q];
    row.push(a ? a.picked + " " + (a.ok ? "✓" : "✗") : "");
  }
  res.appendRow(row);

  // --- answers: довгий формат ---
  var ans = ss.getSheetByName("answers") || ss.insertSheet("answers");
  if (ans.getLastRow() === 0) {
    ans.appendRow(["Дата", "Питання", "Пастка", "Обрана", "Правильно"]);
  }
  (data.answers || []).forEach(function (a) {
    ans.appendRow([now, a.id, a.block, a.picked, a.ok]);
  });

  return ContentService.createTextOutput("ok");
}
