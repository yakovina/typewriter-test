// Відправлення статистики проходжень.
//
// Два транспорти:
//  1) Google Form (масштабується без квот) — вмикається, коли заповнено FORM.action
//     і всі entry-ідентифікатори; має пріоритет.
//  2) Google Apps Script Web App (STATS_URL) — поточний робочий варіант.

export const STATS_URL =
  "https://script.google.com/macros/s/AKfycbwC0AYubYOmKnB0huyoCQbuwbzZaUNA3zy3ok1L-LvJxxCl252fI_XStyktJPPatj1m/exec";

/**
 * Конфіг Google Form: action — URL …/formResponse,
 * entries — ідентифікатори полів (entry.XXXXXXX) для балів, рівня та Q1..Q10.
 */
export const FORM = {
  action:
    "https://docs.google.com/forms/d/e/1FAIpQLSdlF1vMFAXRGKwWm6wP79dAEDxWzezL_o2gDgEsRrwEZDBkpg/formResponse",
  entries: {
    score: "entry.1529046415",
    level: "entry.1115484389",
    q: [
      "entry.1482872937",
      "entry.122240314",
      "entry.713812458",
      "entry.371672774",
      "entry.1615217560",
      "entry.1656246622",
      "entry.1093236524",
      "entry.1629397288",
      "entry.1527043675",
      "entry.275439209",
    ],
  },
};

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

const formReady = () =>
  FORM.action !== "" &&
  FORM.entries.score !== "" &&
  FORM.entries.level !== "" &&
  FORM.entries.q.every((e) => e !== "");

/** Тихо відправляє результат; помилки ігноруємо, щоб не заважати користувачу. */
export function sendStats(payload: ResultStat): void {
  try {
    if (formReady()) {
      const params = new URLSearchParams();
      params.set(FORM.entries.score, String(payload.score));
      params.set(FORM.entries.level, payload.level);
      for (const a of payload.answers) {
        const entry = FORM.entries.q[a.id - 1];
        if (entry) params.set(entry, a.picked);
      }
      fetch(FORM.action, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }).catch(() => {});
      return;
    }
    if (!STATS_URL) return;
    fetch(STATS_URL, {
      method: "POST",
      mode: "no-cors", // Apps Script не віддає CORS-заголовки; відповідь не потрібна
      keepalive: true,
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}
