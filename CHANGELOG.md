# CHANGELOG

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-04-19 | 0.2.0-pre | フェーズ2に向けてlog-format.mdを追加し、spec.mdとAGENTS.mdをログ整形・年別シート・GET通信前提の新方針へ更新 |
| 2026-04-18 | 0.1.7 | GAS URL調査用に完全URL・ベースURL・/exec終端判定のconsoleログを追加し、VITE_GAS_URLの前後空白を除去するよう修正 |
| 2026-04-18 | 0.1.6 | GAS GET送信用URLの各クエリパラメータをencodeURIComponentで明示的にエンコードするよう修正 |
| 2026-04-18 | 0.1.5 | GAS書き込みをfetchのGET方式に変更し、action=postのクエリパラメータcategory/content/tagsで送信するよう修正 |
| 2026-04-18 | 0.1.4 | GASへのPOSTをCORS回避のためno-corsに変更し、fetchが例外を投げなければ送信成功として扱う方式へ変更 |
| 2026-04-18 | 0.1.3 | VITE_GAS_URL参照をsrc/config.jsへ集約し、GitHub Actionsのビルド前にVITE_GAS_URL未設定を検出してデプロイを止める検証を追加 |
| 2026-04-18 | 0.1.2 | GitHub Pages公開元をgh-pagesブランチに合わせ、deploy.ymlでgh-pagesをdist成果物のみのクリーンな公開ブランチとして更新する設定を追加 |
| 2026-04-18 | 0.1.1 | GitHub PagesデプロイをPages API方式からpeaceiris/actions-gh-pages@v3によるgh-pagesブランチ公開方式へ変更 |
| 2026-04-18 | 0.1.0 | フェーズ1として仕様・AGENTS.md・requirements.mdをpersonal-log-hubへ更新し、Vite+React初期構成、入力画面、一覧画面、VITE_GAS_URL経由のGAS通信、GitHub Pages自動デプロイ、gas/Code.gsを実装 |
