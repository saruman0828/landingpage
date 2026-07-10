# LP分析イベント

## 収集するイベント

- `page_view`: ページ表示
- `nav_click`: ナビゲーションのクリック
- `cta_click`: 申込ボタン、実績ボタン、2日間キャンプ導線などのクリック
- `form_start`: フォーム入力開始
- `form_submit_attempt`: フォーム送信ボタン押下
- `form_submit_success`: 送信成功
- `form_submit_error`: 送信失敗
- `calendar_open`: 日程予約リンクのクリック
- `calendar_booked`: 予約完了URLから戻った場合
- `case_view`: 個別事例ページの表示
- `case_open`: 事例リンクのクリック
- `outbound_click`: 外部サイトへの移動
- `scroll_depth`: ページの50%・90%まで読まれた時点
- `copy_view`: 表示した文言の版
- `lead_completed`: サンクスページ到達による問い合わせ完了

## 主な分析指標

- CTAクリック率 = `cta_click` / `page_view`
- フォーム到達率 = `form_start` / `page_view`
- 送信完了率 = `form_submit_success` / `page_view`
- フォーム完了率 = `form_submit_success` / `form_start`
- 送信失敗率 = `form_submit_error` / `form_submit_attempt`
- 事例閲覧率 = `case_view` / `page_view`
- 読了率 = `scroll_depth（90）` / `page_view`
- 文言別問い合わせ率 = `lead_completed` / `copy_view`

## 保存先

ページ表示はVercel Web Analyticsへ、行動イベントはVercel Web Analyticsのカスタムイベントへ送信します。同じイベントを `/api/analytics` にも送り、VercelのRuntime Logsに `lp_analytics` として記録します。

Vercel管理画面でWeb Analyticsを有効にし、変更後のデプロイを本番へ反映すると計測が始まります。カスタムイベントはPro以上で利用できます。

`ANALYTICS_WEBHOOK_URL` をVercelの環境変数に設定すると、同じイベントをGoogle Sheets、Make、ZapierなどのWebhookにも転送できます。
