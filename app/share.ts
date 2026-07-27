// Публічна адреса задеплоєного сайту — шер завжди веде на неї (навіть у dev).
// Перевизначається змінною NEXT_PUBLIC_SITE_URL на етапі збірки.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://yakovina.github.io/typewriter-test";

// Загальний текст, коли ділимося самим тестом (інтро / під час проходження).
export const TEST_SHARE_TEXT =
  "Чи легко тобою зманіпулювати? Тест на 10 когнітивних пасток — перевір свою медіаграмотність:";

export const TEST_SHARE_TITLE = "Перевірте, чи легко вами маніпулювати";

/** URL шер-сторінки конкретного результату: /r/{slug}/ */
export function resultShareUrl(slug: string): string {
  return `${SITE_URL}/r/${slug}/`;
}
