# LP分析イベント

## 収集するイベント

- `page_view`: ページ表示
- `nav_click`: ナビゲーションのクリック
- `cta_click`: 申込ボタン、メインページ導線などのクリック
- `form_start`: フォーム入力開始
- `form_submit_attempt`: フォーム送信ボタン押下
- `form_submit_success`: 送信成功
- `form_submit_error`: 送信失敗
- `calendar_booked`: 予約完了URLから戻った場合

## 主な分析指標

- CTAクリック率 = `cta_click` / `page_view`
- フォーム到達率 = `form_start` / `page_view`
- 送信完了率 = `form_submit_success` / `page_view`
- フォーム完了率 = `form_submit_success` / `form_start`
- 送信失敗率 = `form_submit_error` / `form_submit_attempt`

## 保存先

イベントは `/api/analytics` に送信され、VercelのRuntime Logsに `lp_analytics` として記録されます。

2日間キャンプ側はVercel Web Analyticsのページビュー計測も追加済みです。Vercel DashboardでWeb Analyticsを有効化すると、ページビューや流入元を確認できます。

`ANALYTICS_WEBHOOK_URL` をVercelの環境変数に設定すると、同じイベントをGoogle Sheets、Make、ZapierなどのWebhookにも転送できます。

## 専用ページ

- `/analytics`
- 難しい用語を使わず、見る場所、見る数字、判断のしかたを確認できます。
