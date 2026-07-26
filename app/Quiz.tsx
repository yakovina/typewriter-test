"use client";

import { useRef, useState } from "react";
import {
  GameState,
  OptionKey,
  blockElement,
  getLevel,
  intro,
  questions,
} from "../data/quiz";
import { renderEmphasis } from "./emphasis";
import ShareButtons from "./ShareButtons";
import { SITE_URL, TEST_SHARE_TEXT, TEST_SHARE_TITLE, resultShareUrl } from "./share";

/** Акцентний колір кожного блоку-пастки (1..5). */
const BLOCK_ACCENTS: Record<number, string> = {
  1: "#c03a2e", // упередження підтвердження — цегляний
  2: "#1f6f8b", // фреймінг — морський синій
  3: "#b07d2b", // евристика доступності — вохра
  4: "#7b4b94", // ілюзорна правда — фіолетовий
  5: "#2e7d3b", // авторитет — зелений
};

const accentStyle = (color: string) =>
  ({ "--acc": color }) as React.CSSProperties;

/** Тасування Фішера–Єйтса (новий масив). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Pill({
  current,
  total,
  scoreCount,
}: {
  current: number;
  total: number;
  /** Якщо задано — режим підсумку: перші scoreCount кружечків зелені. */
  scoreCount?: number;
}) {
  const label =
    scoreCount !== undefined
      ? `Правильних відповідей: ${scoreCount} з ${total}`
      : `Питання ${current + 1} з ${total}`;
  return (
    <div className="pill" aria-label={label}>
      {Array.from({ length: total }, (_, i) => {
        const cls =
          scoreCount !== undefined
            ? i < scoreCount
              ? "dot ok"
              : "dot off"
            : i < current
              ? "dot done"
              : i === current
                ? "dot now"
                : "dot off";
        return (
          <span key={i} className={cls}>
            {i + 1}
          </span>
        );
      })}
    </div>
  );
}

export default function Quiz() {
  const [state, setState] = useState<GameState>("intro");
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<OptionKey | null>(null);
  /** Випадковий порядок питань цього проходження. */
  const [order, setOrder] = useState<number[]>(() => questions.map((_, i) => i));
  const topRef = useRef<HTMLDivElement>(null);
  const fbRef = useRef<HTMLDivElement>(null);

  const q = questions[order[idx]] ?? questions[idx];
  const total = questions.length;

  // Подвійний rAF: чекаємо, поки новий екран відрендериться і зміниться висота
  // сторінки, інакше scroll спрацьовує по старій розкладці.
  const toTop = () =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }))
    );

  const start = () => {
    setOrder(shuffle(questions.map((_, i) => i)));
    setState("playing");
    setIdx(0);
    setScore(0);
    setPicked(null);
    toTop();
  };

  const answer = (key: OptionKey) => {
    if (picked !== null) return;
    setPicked(key);
    if (key === q.correct) setScore((s) => s + 1);
    setState("feedback");
    // проскролюємо до вердикту, щойно він з'явиться
    requestAnimationFrame(() =>
      fbRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const next = () => {
    if (idx + 1 < total) {
      setIdx((i) => i + 1);
      setPicked(null);
      setState("playing");
    } else {
      setState("finished");
    }
    toTop();
  };

  const level = getLevel(score);

  return (
    <>
      <div className="bgCollage" aria-hidden />
      <div className="bgVeil" aria-hidden />
      <main className="stage">
        <div ref={topRef} style={{ scrollMarginTop: 24 }} />

        {state === "intro" && (
          <section className="card">
            <p className="kicker">{intro.kicker}</p>
            <h1 className="title">
              {intro.titleLead} <span className="accent">{intro.titleAccent}</span>
            </h1>
            <p className="range" style={{ marginTop: 10 }}>
              10 питань · 5 когнітивних пасток
            </p>
            <p className="lead">{intro.lead}</p>
            <div className="prose">
              {intro.body.map((p, i) => (
                <p key={i}>{renderEmphasis(p)}</p>
              ))}
            </div>
            <ol className="steps">
              {intro.steps.map((s, i) => (
                <li key={i}>
                  <span className="n">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <button className="btn" onClick={start}>
              Почати тест
            </button>
            <ShareButtons url={`${SITE_URL}/`} text={TEST_SHARE_TEXT} title={TEST_SHARE_TITLE} />
          </section>
        )}

        {(state === "playing" || state === "feedback") && (
          <section
            className="card"
            /* колір пастки вмикається лише разом з розкриттям відповіді */
            style={accentStyle(state === "feedback" ? BLOCK_ACCENTS[q.blockNo] : "#262626")}
          >
            <Pill current={idx} total={total} />
            <div className="clip">
              <div className="src">{q.source}</div>
              <div className="txt">{renderEmphasis(q.stimulus)}</div>
              {q.quotes?.map((qu, i) => (
                <div className="quote" key={i}>
                  <span className="qLabel">{qu.label}</span>
                  <p className="qText">{renderEmphasis(qu.text)}</p>
                </div>
              ))}
            </div>
            <p className="prompt">{q.prompt}</p>
            <div className="opts">
              {q.options.map((o) => {
                let cls = "opt";
                if (state === "feedback") {
                  if (o.key === q.correct) cls += " correct";
                  else if (o.key === picked) cls += " wrongPick";
                  else cls += " dim";
                }
                return (
                  <button
                    key={o.key}
                    className={cls}
                    disabled={state === "feedback"}
                    onClick={() => answer(o.key)}
                  >
                    <span className="k">{o.key}</span>
                    <span>{o.text}</span>
                  </button>
                );
              })}
            </div>

            {state === "feedback" && (
              <>
                <div
                  ref={fbRef}
                  style={{ scrollMarginTop: 80 }}
                  className={picked === q.correct ? "verdict ok" : "verdict"}
                >
                  {picked === q.correct
                    ? "✓ Так! Пастка не спрацювала"
                    : `✗ Пастка спрацювала. Правильна відповідь — ${q.correct}`}
                </div>
                <div className="trapCard">
                  <div className="trapHead">
                    <span className="trapIcon">
                      <img src={blockElement(q.blockNo)} alt="" />
                    </span>
                    <div>
                      <div className="trapKicker">Когнітивна пастка</div>
                      <div className="uk">{q.block}</div>
                      <div className="en">({q.blockEn})</div>
                    </div>
                  </div>
                  <p className="expl">{renderEmphasis(q.explanation)}</p>
                </div>
                <button className="btn" onClick={next}>
                  {idx + 1 < total ? "Далі" : "Мій результат"}
                </button>
              </>
            )}
            <ShareButtons
              compact
              url={`${SITE_URL}/`}
              text={TEST_SHARE_TEXT}
              title={TEST_SHARE_TITLE}
            />
          </section>
        )}

        {state === "finished" && (
          <section className="card withChar" style={accentStyle(level.accent)}>
            <Pill current={total} total={total} scoreCount={score} />
            <h1 className="title" style={{ fontSize: "clamp(24px, 4vw, 32px)" }}>
              Рівень «<span style={{ color: "var(--acc)" }}>{level.title}</span>»
            </h1>
            <p className="range">({level.range})</p>
            <p className="score">
              Ваш результат: <b>{score}</b> з {total}
            </p>
            <div className="charScene" aria-hidden>
              <span className="decoStrip left" />
              <span className="decoStrip right" />
              <img className="deco d1" src="/art/el-1.png" alt="" />
              <img className="deco d2" src="/art/el-3.png" alt="" />
              <img className="deco d3" src="/art/el-5.png" alt="" />
              <img className="deco d4" src="/art/el-4.png" alt="" />
              <span className="charDisc" />
              <span className="charStamp">
                {score}/{total}
              </span>
              <img className="char" src={level.character} alt="" />
            </div>
            <div className="prose">
              <p>{renderEmphasis(level.description)}</p>
            </div>
            <div style={{ height: 10 }} />
            <button className="btn" onClick={start}>
              Пройти ще раз
            </button>
            <ShareButtons
              url={resultShareUrl(level.slug)}
              text={level.shareText}
              title={level.title}
              label="Поділитися результатом"
            />
          </section>
        )}
      </main>
    </>
  );
}
