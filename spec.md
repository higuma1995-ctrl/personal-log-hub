# spec.md
# personal-log-hub
# version: 0.1.5
# 作成日: 2026-04-18
# 注意: 実装AIが唯一従う仕様。変更はCHANGELOG→spec→requirementsの順で行う。

---

## 1. フェーズ1の目的

日々の記録をカテゴリ付きテキストとして登録し、登録済みの記録を一覧・カテゴリフィルターで確認できる最小構成を実装する。

---

## 2. 画面構成

React SPAとして以下の2画面を持つ。

| 画面 | パス | 内容 |
|------|------|------|
| 入力画面 | `#/input` | カテゴリ選択、テキスト入力、GASへのPOST送信 |
| 一覧画面 | `#/list` | GASからGETで取得、カテゴリフィルター表示 |

初回表示時または未知のハッシュの場合は `#/input` を表示する。

---

## 3. 入力画面（InputPage）

### 3-1. 入力項目

| 項目 | 仕様 |
|------|------|
| カテゴリ | 固定選択肢から1つ選ぶ |
| テキスト | 記録本文を入力する |

カテゴリの固定選択肢は以下とする。

- 日記
- 仕事
- 学習
- 健康
- その他

### 3-2. 送信仕様

- 送信ボタン押下時にGASへPOSTする。
- 送信先URLは `import.meta.env.VITE_GAS_URL` から取得する。
- `VITE_GAS_URL` が未設定の場合は送信せず、画面にエラーを表示する。
- テキストが空の場合は送信せず、画面にエラーを表示する。
- POST送信後はレスポンスを読まず、送信処理が例外を投げなければテキスト入力を空にし、完了メッセージを表示する。

### 3-3. POSTデータ

hidden formから以下のフォーム項目として送信する。

| name | value |
|------|-------|
| category | 選択カテゴリ |
| text | 記録本文 |

---

## 4. 一覧画面（ListPage）

### 4-1. 取得仕様

- 画面表示時にGASへGETする。
- 取得先URLは `import.meta.env.VITE_GAS_URL` から取得する。
- `VITE_GAS_URL` が未設定の場合は取得せず、画面にエラーを表示する。
- 再読み込みボタンで再取得できる。

### 4-2. 表示仕様

- 取得した記録を新しい順に表示する。
- カテゴリフィルターで「すべて」または固定カテゴリを選択できる。
- 記録がない場合は空状態メッセージを表示する。

### 4-3. GETレスポンス

```json
{
  "items": [
    {
      "id": "2026-04-18T12:00:00.000Z-abc123",
      "category": "日記",
      "text": "記録本文",
      "createdAt": "2026-04-18T12:00:00.000Z"
    }
  ]
}
```

---

## 5. GAS通信

- フロントエンドは外部ライブラリを使わず通信する。
- GAS URLは `.env` ではなく環境変数名 `VITE_GAS_URL` として参照する。
- GETは `fetch` で通信する。
- CORS制約を避けるため、POSTは `fetch` ではなくhidden formをhidden iframeへsubmitして送信する。
- POSTレスポンスは受け取らず、送信処理が例外を投げなければ成功として扱う。
- GAS側は `gas/Code.gs` に `doPost` と `doGet` を配置する。

---

## 6. GAS保存仕様

- フェーズ1ではGASの `PropertiesService.getScriptProperties()` にJSON配列として保存する。
- 保存キーは `PERSONAL_LOG_ITEMS` とする。
- `doPost` は受け取ったカテゴリ・テキストに `id` と `createdAt` を付与して保存する。
- `doGet` は保存済み記録を新しい順に返す。

---

## 7. 技術仕様

| 項目 | 内容 |
|------|------|
| フレームワーク | Vite + React |
| スタイル | CSS（外部UIライブラリなし） |
| GAS URL | `VITE_GAS_URL` |
| ホスティング | GitHub Pages |
| CI/CD | `.github/workflows/deploy.yml` |
| ビルド出力 | `dist/` |
| base URL | `vite.config.js` で `/personal-log-hub/` を設定 |

---

## 8. 非スコープ（フェーズ1では実装しない）

- ログイン
- ユーザー別同期
- 編集・削除
- ページネーション
- 検索
- 添付ファイル
- Markdownプレビュー
- 外部UIライブラリ導入

---

## CHANGELOG
| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-04-18 | 0.1.5 | GAS POSTをfetchからhidden form submit方式へ変更し、レスポンスを読まず送信処理完了で成功扱いとする仕様へ更新 |
| 2026-04-18 | 0.1.0 | フェーズ1仕様として入力画面、一覧画面、GAS通信、GitHub Pages自動デプロイ、gas/Code.gs配置を定義し、AGENTS.md・requirements.mdとの構成を同期 |
