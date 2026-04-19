export const GENRES = {
  dev: {
    key: "dev",
    label: "開発・学習",
    sheetSuffix: "dev",
    headers: ["timestamp", "date", "title", "tag", "mood", "duration", "status", "content"],
    tags: [
      "実装",
      "設計",
      "バグ",
      "調査",
      "公開",
      "環境構築",
      "仕様",
      "リファクタ",
      "達成",
      "停滞",
      "疲労",
      "集中",
      "迷い",
      "気づき",
    ],
    fields: ["date", "title", "tag", "mood", "duration", "status", "content"],
  },
  fitness: {
    key: "fitness",
    label: "筋トレ",
    sheetSuffix: "fitness",
    headers: ["timestamp", "date", "title", "tag", "mood", "部位", "重量", "回数", "セット", "時間", "content"],
    tags: ["胸", "背中", "肩", "腕", "脚", "体幹", "有酸素", "全身"],
    fields: ["date", "title", "tag", "mood", "part", "weight", "reps", "sets", "time", "content"],
  },
  diary: {
    key: "diary",
    label: "日記",
    sheetSuffix: "diary",
    headers: ["timestamp", "date", "title", "mood", "content"],
    tags: [],
    fields: ["date", "title", "mood", "content"],
  },
};

export const GENRE_OPTIONS = Object.values(GENRES);

export function getGenre(key) {
  return GENRES[key] || GENRES.dev;
}

export function getGenreSheetName(key, date = new Date()) {
  const genre = getGenre(key);
  return `${date.getFullYear()}-${genre.sheetSuffix}`;
}

export function createEmptyLog(genreKey) {
  return {
    date: getTodayString(),
    title: "",
    tag: [],
    mood: "",
    duration: "",
    status: "",
    part: "",
    weight: "",
    reps: "",
    sets: "",
    time: "",
    content: "",
  };
}

export function getTodayString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
