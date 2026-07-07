# Article Pattern

Use this pattern for `case-studies/*.html` pages.

## Page Requirements

- Use `../style.css`.
- Use the same header/footer as existing case-study pages.
- Keep filenames short and descriptive, e.g. `field-report.html`, `quote-flow.html`, `shop-manual.html`.
- Prefer visual assets from root `イメージ候補/` for industry-specific images and `case-studies/construction-ai-case-assets/` for existing construction/workflow images.
- Keep visible article content anonymous unless the user explicitly asks otherwise.
- Do not publish broken image paths. If an image is not present yet, use an existing real asset and save only the generation brief.

## Required Story Arc

Every article should follow this emotional and operational arc:

`Before pain -> AI receives materials -> AI drafts/organizes -> Human approves -> Result -> Why it feels good`

Before writing HTML, decide:

- Protagonist role
- Time/place where the work hurts
- Repeated task
- Materials handed to AI
- Output AI prepares
- Human approval point
- Measurable or felt result
- Regained time use
- Image role

## Recommended Sections

1. Hero
   - Eyebrow: `他社の改善事例 / 業種・用途`
   - H1: concrete and enviable outcome
   - Lead: explain the workflow problem in one breath
   - Meta chips: 要点, 対象, 成果
   - Image: actual work scene, hands, workplace, dashboard-like artifact, or before/after visual
2. 先に結論
   - State the workflow redesign, not the tool.
   - Name the repeated job that used to stop.
   - Add a `blog-aha-card` with the key "なるほど" insight.
3. 仕事の変化
   - Add three cards or short paragraphs for:
     - 現場で起きていたこと
     - 変えたこと
     - 改善後に残るもの
   - Do not write the reader's reaction as a literal catchphrase. Create it through concrete scenes and cause/effect.
4. 改善後の実感 or 結果
   - Add a `blog-takeaway-grid` with concrete before/after/result.
   - Use numbers carefully: `45〜60分`, `15〜20分`, `月40時間規模`, `週数時間`.
   - Explain why the result feels good, not only what got faster.
5. 現場の一場面
   - Add a scene-based narrative section before returning to analysis.
   - Do not expose production terms such as `ナラティブ` in public headings.
   - Use a concrete time and place in the heading.
   - Show what is on the desk, phone, shop floor, vehicle, counter, reception desk, or meeting room.
   - Include the moment the human hands work to AI.
   - End with a changed feeling or changed business action.
6. Before
   - Show repeated pain in concrete daily scenes.
   - Include hidden stress: late-night work, repeated interruption, missed follow-up, fear of mistakes, customer waiting, or staff hesitation.
7. Flow or How
   - Use `blog-timeline` or `blog-insight-grid`.
   - Make input, output, exception handling, and human approval explicit.
8. Human/AI Split
   - AI: gather, read, summarize, draft, format, compare, extract exceptions.
   - Human: judgment, price, contract, safety, medical/legal review, external sending, relationship.
9. Adoption Steps
   - Start with one repeated task.
   - Decide materials, output format, approval point, and measurement.
10. CTA
   - Link to `../index.html#contact`.
   - Use a low-pressure consultation entry, not a hard sales prompt.
   - Preferred visible copy:
     - Eyebrow: `相談の入口`
     - H2: `毎週止まっている作業を、ひとつだけ見える化します。`
     - Body: `写真、メール、Excel、メモなど実際の材料を見ながら、AIに渡す準備と人が確認する判断を分けます。`
     - Button: `30分無料診断`
   - Avoid `御社なら、どの作業をAIへ渡せるか。`, `自社に置き換える`, `30分無料診断を申し込む`, and other wording that feels like pressuring the reader.

## Must-Have Specificity

Every article needs at least one sentence for each:

- Who is stuck: `店長`, `現場責任者`, `社長`, `後継者`, `営業担当`, `受付責任者`, `経理担当`.
- When it hurts: `朝一番`, `現場から戻った夕方`, `月末`, `商談直後`, `閉店後`, `診療前`.
- What the repeated task is: `写真整理`, `Excel加工`, `希望休の調整`, `返品対応`, `フォローメール`, `問診不足確認`.
- What changes after: `作成から確認へ`, `全部確認から例外確認へ`, `口頭質問からAIマニュアルへ`.
- What result appears: speed, fewer interruptions, earlier response, regained focus time, less anxiety.

## Narrative Requirements

Every article should include one section where the reader can follow a single human through a concrete moment. Do not summarize the case from above. Write it as a small business scene.

Good narrative structure:

1. Time: `8時12分`, `15時42分`, `閉店後の21時`, `商談後の18時`.
2. Human: `社長`, `店長`, `現場責任者`, `新人スタッフ`, `営業担当`.
3. Friction: pile of documents, phone interruption, unsent email, missed photo, repeated question, waiting customer.
4. Handoff: exactly what gets sent to AI.
5. Output: draft, sorted list, exception list, checklist, reply text.
6. Human judgment: what the person still corrects or decides.
7. Payoff: earlier response, less anxiety, regained focus, better coaching, faster quote.

## Strong H1 Patterns

- `現場に出ている間に、AI事務員が報告書と連絡文を進める。`
- `3時間悩んでいたシフト表を、数分で確認できる状態にする。`
- `見積の前に消えていた毎日2時間を、ボタンひとつで進む作業に変える。`
- `店長に飛んでいた質問を、AIマニュアルが先に受け止める。`
- `営業が本当にやるべき仕事以外を、AIが前後で進めておく。`

## Weak H1 Patterns

- `AI活用事例`
- `業務効率化の事例`
- `〇〇業界のDX`
- `AIで作業時間を削減`

These are too generic unless followed by a concrete job and changed feeling.

## Public Copy Guards

Do not expose production/planning labels in public copy:

- Avoid `ナラティブ`, `読みどころ`, `自社に置き換える`, `下準備までです`, `案件別・期限別に分ける`.
- Replace with reader-facing labels such as `現場の一場面`, `仕事の変化`, `相談の入口`.
- CTA button text should be `30分無料診断`, not `30分無料診断を申し込む`.
- For bulk-generated pages, grep generated HTML and shared JS for banned phrases before finishing.

## Claim Handling

- If using a specific number from research, either cite it in research notes or make it a scale statement in the article.
- Avoid saying this service achieved the public-source numbers.
- Use phrases like `月40時間規模`, `年間数百時間規模`, `週数時間の余白` when anonymizing.
- In legal, medical, finance, safety, pricing, contracts, and external sending, explicitly keep final judgment with a human.
