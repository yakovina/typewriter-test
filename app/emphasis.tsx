import type { ReactNode } from "react";

/** Підсвічує фрагменти, обгорнуті **зірочками**. Працює і на сервері, і на клієнті. */
export function renderEmphasis(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
  );
}
