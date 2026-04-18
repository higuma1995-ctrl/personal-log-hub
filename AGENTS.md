# AGENTS.md
# personal-log-hub
# 作成日: 2026-04-18
# 対象AI: Codex（実装担当）

---

## あなたの役割

このファイルを読んだAIは、`spec.md`に従ってpersonal-log-hubを実装する。
設計・仕様の変更は行わない。不明点があれば実装を止めて質問する。

---

## 最重要ルール

- **spec.mdが唯一の仕様。spec.mdに書いていないことは実装しない。**
- specに曖昧な点がある場合は推測実装せず、質問してから進める。
- 動作するコードを理由なく変更しない。
- 1タスクずつ完結させる（複数タスクを同時に進めない）。

---

## プロジェクト構成

```
personal-log-hub/
├── AGENTS.md
├── spec.md
├── requirements.md
├── CHANGELOG.md
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── api/
│   │   └── logApi.js
│   └── pages/
│       ├── InputPage.jsx
│       └── ListPage.jsx
├── gas/
│   └── Code.gs
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Vite + React |
| スタイル | CSS（外部UIライブラリなし） |
| GAS URL | `VITE_GAS_URL` |
| GASコード | `gas/Code.gs` |
| ホスティング | GitHub Pages |
| CI/CD | `.github/workflows/deploy.yml` |

---

## フェーズ1実装範囲

1. リポジトリ初期化（Vite + React）
2. `vite.config.js` にbase URL設定（`/personal-log-hub/`）
3. 入力画面（InputPage）
4. 一覧画面（ListPage）
5. GASとの通信（`VITE_GAS_URL` 使用）
6. GitHub Actions（`deploy.yml`）
7. `gas/Code.gs` の配置

---

## CHANGELOG更新ルール

### 対象ファイル

- `CHANGELOG.md`：変更履歴の正本として必ず更新する。
- `spec.md` 末尾の `CHANGELOG`：仕様変更がある場合は同じバージョンを追記する。

### フォーマット

- Markdownテーブルで記録する。
- 列は `日付` / `バージョン` / `変更内容` とする。
- 変更内容は実装者が後から追える粒度で、主要な仕様変更・実装修正を1行にまとめる。

### バージョニング

- バージョンは `MAJOR.MINOR.PATCH` 形式を基本とする。
- 仕様変更・UI順序変更・保存仕様変更は少なくともPATCHを上げる。
- 互換性に影響する大きな変更はMINOR以上を上げる。

### 更新タイミング

- `spec.md`、`AGENTS.md`、実装コードのいずれかを変更したタスクでは、完了前にCHANGELOGを更新する。
- ユーザーへ完了報告する前に、CHANGELOGの追記漏れがないか確認する。

---

## 禁止事項

- spec.mdに記載のない機能の追加
- 外部UIライブラリの導入（shadcn、MUI等）
- フェーズ2項目の先行実装
- 既存の動作するコードの理由なき変更
- CHANGELOGを更新せずにタスクを完了とすること
