import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLevelBySlug, levels } from "../../../data/quiz";
import { asset } from "../../bp";
import { renderEmphasis } from "../../emphasis";
import ShareButtons from "../../ShareButtons";
import { SITE_URL, resultShareUrl } from "../../share";

// Статично генеруємо лише три сторінки рівнів.
export const dynamicParams = false;
export function generateStaticParams() {
  return levels.map((l) => ({ level: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string }>;
}): Promise<Metadata> {
  const { level } = await params;
  const lvl = getLevelBySlug(level);
  if (!lvl) return {};

  const title = `Мій рівень — «${lvl.title}» · Тест на медіаграмотність`;
  const ogImage = `${SITE_URL}/og-${lvl.slug}.jpg`;
  const url = resultShareUrl(lvl.slug);

  return {
    title,
    description: lvl.description,
    openGraph: {
      title,
      description: lvl.description,
      url,
      siteName: "Хмарочос",
      locale: "uk_UA",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: lvl.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: lvl.description,
      images: [ogImage],
    },
  };
}

export default async function ResultSharePage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  const lvl = getLevelBySlug(level);
  if (!lvl) notFound();

  return (
    <>
      <div className="bgCollage" aria-hidden />
      <div className="bgVeil" aria-hidden />
      <main className="stage">
        <section
          className="card withChar"
          style={{ "--acc": lvl.accent } as CSSProperties}
        >
          <p className="kicker">Результат тесту · Медіаграмотність</p>
          <h1 className="title" style={{ fontSize: "clamp(24px, 4vw, 32px)" }}>
            Рівень «<span style={{ color: "var(--acc)" }}>{lvl.title}</span>»
          </h1>
          <p className="range">({lvl.range})</p>
          <div className="charScene" aria-hidden>
            <span className="decoStrip left" />
            <span className="decoStrip right" />
            <img className="deco d1" src={asset("/art/el-1.png")} alt="" />
            <img className="deco d2" src={asset("/art/el-3.png")} alt="" />
            <img className="deco d3" src={asset("/art/el-5.png")} alt="" />
            <img className="deco d4" src={asset("/art/el-4.png")} alt="" />
            <span className="charDisc" />
            <img className="char" src={asset(lvl.character)} alt="" />
          </div>
          <div className="prose">
            <p>{renderEmphasis(lvl.description)}</p>
          </div>
          <div style={{ height: 10 }} />
          <Link href="/" className="btn" style={{ textDecoration: "none" }}>
            Пройти тест
          </Link>
          <ShareButtons
            url={resultShareUrl(lvl.slug)}
            text={lvl.shareText}
            title={lvl.title}
            label="Поділитися результатом"
          />
        </section>
      </main>
    </>
  );
}
