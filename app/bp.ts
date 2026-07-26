// basePath для статичних асетів: Next підставляє префікс лише в роутинг,
// тож у <img src> додаємо його самі. Має збігатися з repo у next.config.ts.
export const BP = process.env.NODE_ENV === "production" ? "/typewriter-test" : "";

export const asset = (p: string) => `${BP}${p}`;
