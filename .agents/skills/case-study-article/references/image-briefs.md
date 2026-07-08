# Image Briefs

Use images to make the article feel like a real Japanese SMB scene, not a generic AI article.

## Asset Priority

1. Reuse suitable existing images from root `イメージ候補/`.
2. Reuse suitable existing images from `case-studies/construction-ai-case-assets/`.
3. If no real asset fits, create or update an image brief under `case-studies/construction-ai-case-assets/` and keep the public HTML pointed at an existing image until the new asset exists.

## Selection Rules

- Match the article's repeated task, not only the industry.
- Prefer scenes that show one of these: before/after, material -> draft -> human approval, manager regained focus time, staff self-service, exception list, sorted documents, handoff between field and office.
- Use 16:9 for article hero images and list cards unless another layout is explicitly needed.
- Avoid readable text, logos, real company names, and recognizable product UI.
- Avoid generic robots, glowing brains, abstract networks, and stock-like smiling office scenes.
- Avoid using the same generic workflow image across many unrelated industries when a specific asset exists.
- For high-risk areas, prefer images of review, checklist, documents, or human approval rather than autonomous action.

## Public Image Copy Rules

Public HTML must assume the chosen image may not perfectly match the surrounding sentence. Do not write alt text, captions, or image-card copy that claims a precise visible action, person, location, device, or object unless the image has been checked directly.

Use role-based wording:

- Good: `店舗スタッフ向けAIマニュアルの業務改善イメージ`
- Good: `通常対応・確認条件・店長へ上げる基準を同じ順番で見られる状態にします。`
- Avoid: `レジ横でスタッフが返品条件をタブレット確認する場面`
- Avoid: `スタッフが店長を呼ぶ前に、レジ横の端末で通常対応か例外かを確認している場面です。`

For image-adjacent cards, describe the workflow state the article wants to communicate, not what appears in the picture. Prefer `状態にします`, `確認しやすくします`, `一覧にします` over `場面です`, `見せます`, `写っています`, or exact scene narration.

## Useful Existing Image Families

- `187`-`203`: industry-specific cases such as clinic, school, legal, recruiting, sales, BCP, procurement, property, care, agriculture, NPO, EC.
- `267`-`296`: case-study improvement scenes with stronger workplace specificity.
- `317`-`346`: polished case-study, consultant, metrics, workflow, and young professional images.
- `construction-ai-case-assets/01`-`10`: construction and workflow-specific images.

## Brief Format

Create briefs as Markdown files under `case-studies/construction-ai-case-assets/`. Include:

- Target filename
- Article filename
- Scene purpose
- 16:9 prompt
- Negative prompt: no readable text, no logo, no robot, no real company, no identifiable product UI
- Why the image supports the article's narrative

## Useful Scenes

- Field worker sending a mobile instruction while on site.
- Photos and reports being organized into a draft.
- Store manager reviewing a shift candidate after closing.
- Inventory or accounting exceptions highlighted without readable UI text.
- Factory owner reviewing estimate preprocessing, with documents and parts visible.
- Staff asking an in-store AI manual on a tablet.
- Sales rep reviewing customer research before a meeting.
- Clinic receptionist checking missing information before opening.
- Care service lead reviewing handoff notes.
- Owner seeing a prepared draft at the end of the day.
