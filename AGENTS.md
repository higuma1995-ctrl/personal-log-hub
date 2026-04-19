# AGENTS.md
# personal-log-hub
# 更新：2026-04-19

## 基本方針

- spec.mdが唯一の仕様。不明点はspec.mdに従う
- 動作確認はスキップしてOK（スマホ実機で確認する）
- CHANGELOG.mdを必ず更新してからpushする
- コミットメッセージ形式：「機能名 vX.X.X」

## 設計原則

- 手動作業ゼロ設計：一度設定したら二度と手動で触らない
- GASは汎用受け口のみ・ロジックはReact側に持つ
- 変更はReactコードの修正→pushのみで完結させる
- 外部サービスの再設定が必要な構成は採用しない

## 技術構成

- Vite + React
- GitHub Pages（gh-pagesブランチ）
- GitHub Actions（deploy.yml）
- GAS（Google Apps Script）
- Googleスプレッドシート

## GAS通信ルール

- fetchはGETのみ使用（POSTは使わない）
- パラメータ形式：?action=post&key=value
- CORS問題の結論：GETで回避・再調査不要

## スプレッドシートルール

- シート名は年（YYYY形式）
- GASが送信時に当年シートの存在確認・なければ自動生成
- ヘッダー行：timestamp・date・title・tag・mood・duration・status・content
- timestampはGAS側で自動付与

## ファイル管理ルール

requirements.md：目的・スコープ
spec.md：唯一の仕様書
CHANGELOG.md：変更履歴
AGENTS.md：この指示書
log-format.md：ログ整形フォーマット

## 作業完了時の手順

1. CHANGELOG.mdに変更内容を追記（vX.X.X）
2. spec.mdのCHANGELOGを更新
3. GitHubにpush
4. コミットメッセージ：「変更内容 vX.X.X」

## 禁止事項

- spec.md未記載の機能を勝手に追加しない
- POSTでGASにリクエストしない
- 動作確認のためにブラウザを起動しようとしない
