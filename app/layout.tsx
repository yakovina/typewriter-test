import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL, TEST_SHARE_TITLE } from "./share";

const TITLE = "Перевірте, чи легко вами маніпулювати · Тест на медіаграмотність";
const DESC =
  "10 життєвих сценаріїв і 5 когнітивних пасток. Дізнайтеся, наскільки надійним є ваш особистий «фаєрвол» проти фейків та маніпуляцій.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  openGraph: {
    title: TEST_SHARE_TITLE,
    description: DESC,
    url: `${SITE_URL}/`,
    siteName: "Хмарочос",
    locale: "uk_UA",
    type: "website",
    images: [
      { url: `${SITE_URL}/og-test.jpg`, width: 1200, height: 630, alt: TEST_SHARE_TITLE },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TEST_SHARE_TITLE,
    description: DESC,
    images: [`${SITE_URL}/og-test.jpg`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>
        <header className="masthead">
          <span className="tag ink">Тест</span>
          <a
            href="https://hmarochos.kiev.ua/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Хмарочос — відкрити сайт"
            className="logo"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hmarochos_logo_new.svg" alt="Хмарочос" />
          </a>
          <span className="tag red">Медіаграмотність</span>
        </header>
        {children}
      </body>
    </html>
  );
}
