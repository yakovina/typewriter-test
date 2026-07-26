// Відправлення статистики проходжень у Google Sheets через Apps Script Web App.
// STATS_URL — URL деплою скрипта (див. docs/apps-script.gs). Порожній рядок = вимкнено.

export const STATS_URL =
  "https://script.google.com/macros/s/AKfycbwC0AYubYOmKnB0huyoCQbuwbzZaUNA3zy3ok1L-LvJxxCl252fI_XStyktJPPatj1m/exec";

export interface AnswerStat {
  /** id питання (1..10, стабільний незалежно від перемішування). */
  id: number;
  /** Назва пастки. */
  block: string;
  /** Обрана відповідь. */
  picked: string;
  /** Чи правильна. */
  ok: boolean;
}

export interface ResultStat {
  score: number;
  total: number;
  level: string;
  answers: AnswerStat[];
}

/** Тихо відправляє результат; помилки ігноруємо, щоб не заважати користувачу. */
export function sendStats(payload: ResultStat): void {
  if (!STATS_URL) return;
  try {
    fetch(STATS_URL, {
      method: "POST",
      mode: "no-cors", // Apps Script не віддає CORS-заголовки; відповідь нам не потрібна
      keepalive: true,
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}
