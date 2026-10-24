# Nirmal Aqua - Daily Instagram + WhatsApp Status Automation

Posts one product per day at 10:00 IST with an AI-generated image and an AI-generated caption + hashtags, with no manual work.

```
Schedule 10:00 IST -> Google Sheet (first row with empty "posted")
  -> Groq (llama-3.3-70b-versatile) -> {caption, hashtags[]}
  -> Hugging Face FLUX.1-schnell -> (error/rate-limit?) -> Pollinations fallback
  -> normalize to 1080x1080 JPEG -> ImgBB (public URL)
  -> Instagram Graph API: /media -> wait 10s -> /media_publish
  -> (parallel) WAHA WhatsApp Status image
  -> write posted=<date> back to the Sheet
```

## Files

| File | Purpose |
|---|---|
| `docker-compose.yml` | n8n (persistent volume, Asia/Kolkata) + WAHA on one network (`http://waha:3000`) |
| `workflows/daily-product-post.json` | the n8n workflow (17 nodes) |
| `scripts/post-daily.mjs` | same pipeline as a dependency-free Node 20+ script (`--dry-run`, `--no-ai`) |
| `scripts/validate-workflow.mjs` | checks workflow JSON, connections, secrets and `$env` usage |
| `github-actions-daily-post.yml` | zero-cost GitHub Actions fallback (cron `30 4 * * *`) |
| `sample/products.sample.csv` | 3 sample products; import into a Google Sheet |
| `.env.example` | every environment variable |

## Setup

### 1. Google Sheet
1. Create a Google Sheet, rename the tab to **`products`**, and import `sample/products.sample.csv` (File > Import). Columns: `id,name,category,price,description,image,posted`. Leave `posted` empty.
2. Copy the Sheet ID from the URL (`docs.google.com/spreadsheets/d/<SHEET_ID>/edit`) into `GOOGLE_SHEET_ID`.

### 2. Free keys (put all in `.env`, copied from `.env.example`)
- **Groq**: console.groq.com > API Keys > `GROQ_API_KEY`.
- **Hugging Face**: huggingface.co/settings/tokens > create a token that can call Inference Providers > `HF_TOKEN`.
- **ImgBB**: api.imgbb.com > "Get API key" > `IMGBB_API_KEY`.
- **Meta / Instagram**:
  1. Convert the Instagram account to **Business or Creator** and link it to a Facebook Page.
  2. developers.facebook.com > Create App (type Business) > add the Instagram / Graph API product. Add yourself as app admin/tester (Development mode is enough for your own account).
  3. In Graph API Explorer generate a user token with `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`.
  4. Exchange for a long-lived token (about 60 days):
     `GET https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=<APP_ID>&client_secret=<APP_SECRET>&fb_exchange_token=<SHORT_TOKEN>` -> `IG_ACCESS_TOKEN`.
  5. Get the IG user id: `GET /me/accounts` (find the Page id), then `GET /<PAGE_ID>?fields=instagram_business_account&access_token=...` -> `IG_USER_ID`.
- Also set `WHATSAPP_API_KEY`, `N8N_ENCRYPTION_KEY` and the WAHA dashboard password to long random values.

### 3. Start n8n + WAHA
```bash
cp .env.example .env   # fill it in
docker compose up -d
```
- n8n: http://localhost:5678 - first visit asks you to create the owner account (the old `N8N_BASIC_AUTH_*` variables no longer exist in current n8n).
- Keep the machine on at 10:00 IST (or use the GitHub Actions fallback below).

### 4. WAHA (WhatsApp Status, bonus)
1. Open http://localhost:3000/dashboard (user/password from `.env`), start session **`default`** (WAHA Core supports only this session name), and scan the QR with the **secondary** WhatsApp number (WhatsApp > Linked devices).
2. Authorize the dashboard/Swagger with your `WHATSAPP_API_KEY`.
3. Test: `curl -X POST http://localhost:3000/api/default/status/text -H "X-Api-Key: $WHATSAPP_API_KEY" -H "Content-Type: application/json" -d '{"text":"hello"}'`.

### 5. Import and activate the workflow
1. n8n > Workflows > Import from file > `workflows/daily-product-post.json`.
2. Open **Read Products Sheet** and **Mark Row Posted**, pick/create a *Google Sheets OAuth2* credential (the only credential in the workflow; every other node reads `$env.*`).
3. Click **Execute workflow** once to test with the first product, check Instagram and WhatsApp, then toggle **Active**. The schedule trigger fires daily at 10:00 (`Asia/Kolkata`).

### 6. Test the script without any keys
```bash
node scripts/post-daily.mjs --dry-run --no-ai --csv sample/products.sample.csv   # offline
node scripts/post-daily.mjs --dry-run                                            # real AI calls, no posting (needs GROQ/HF keys; saves out/preview-<id>.jpg)
node scripts/post-daily.mjs                                                       # live (uses products.csv or SHEET_CSV_URL)
node scripts/validate-workflow.mjs                                                # workflow sanity check
```
For a read-only Sheet use File > Share > Publish to web > CSV and set `SHEET_CSV_URL`; the script then cannot mark rows posted and rotates products by day instead.

### GitHub Actions fallback
Copy `github-actions-daily-post.yml` to `.github/workflows/daily-post.yml`, commit `automation/products.csv`, add the secrets listed in the file. It runs the script at 04:30 UTC (10:00 IST) and commits the updated `posted` column. WhatsApp Status needs WAHA reachable from the internet, so it is normally skipped here (the script reports it as not posted and still succeeds).

## Tool choices & alternatives

| Need | Chosen | Why / alternative |
|---|---|---|
| Orchestration | n8n (Docker) | visual, free self-hosted. Fallback: GitHub Actions + the Node script |
| Caption | Groq `llama-3.3-70b-versatile` | free tier, fast, JSON mode. Alternative: Gemini API |
| Image | Hugging Face FLUX.1-schnell, then **Pollinations** | If HF errors, rate-limits or the free credits run out, the IF node routes to Pollinations (no key, free) so the post still has an AI image |
| Public hosting | ImgBB | Free, one key, returns a direct public `.jpg` URL, which is all Instagram and WAHA need. Cloudinary also works but needs more setup (cloud name, preset or signed upload) for no extra benefit here |
| Instagram | Meta Graph API v21.0 | the only official posting route |
| WhatsApp | WAHA Core in Docker | free, open source, secondary number |

## Troubleshooting

- **Instagram error 9004/2207052 "media could not be fetched" or format errors**: Instagram accepts only a public **JPEG** URL (no redirects, no login). That is why the image is converted to 1080x1080 JPEG and hosted on ImgBB. Open the logged `image_url` in a private browser window to confirm it loads.
- **"Only photo or video can be accepted as media type" / permissions errors**: the account must be Instagram **Business/Creator** linked to a Facebook Page, and the token needs `instagram_content_publish`.
- **Error 190 / "Session has expired"**: the long-lived token lasts about 60 days. Regenerate it (step 2) and update `IG_ACCESS_TOKEN`, then `docker compose up -d` to reload env. Set a calendar reminder at about day 50.
- **`$env` access denied in n8n**: keep `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` (set in the compose file).
- **Edit Image node fails**: the node needs GraphicsMagick/ImageMagick in the n8n image. If your image lacks it, delete that node and connect both image branches straight to ImgBB, but then confirm that the images are JPEG (Pollinations returns JPEG; FLUX via HF may return PNG).
- **HF returns 404/403/429/503**: normal on the free tier; the fallback branch handles it. To always use Pollinations, leave `HF_TOKEN` empty.
- **WAHA status fails**: the session must be `WORKING`; the Status endpoints may be restricted to WAHA Plus in your WAHA version (check the Swagger page). The WAHA node uses continue-on-error, so Instagram still posts and the row is still marked.
- **Nothing posted / empty run**: all rows have a `posted` value. Add products or clear the column.
- **Container clock**: `TZ` and `GENERIC_TIMEZONE` are both `Asia/Kolkata`; the workflow also sets its own timezone.

## Scoring criteria -> nodes

| Criterion | Satisfied by |
|---|---|
| Scheduled daily workflow, no manual input (10) | `Daily 10:00 IST` (Schedule Trigger) -> `Read Products Sheet` -> `Pick Next Product` ... -> `Mark Row Posted` (writes `posted`, so the next day picks the next product) |
| AI image in post (8) | `HF Image (FLUX.1-schnell)` -> `HF OK?` (IF) -> `Pollinations Fallback` -> `Normalize to JPEG` -> `Upload to ImgBB` -> `IG Create Container` (`image_url`) |
| AI caption with hashtags (7) | `Groq Caption` + `Parse Caption` (validates JSON, 8-12 hashtags, max 2 emojis) -> `IG Create Container` (`caption`) |
| Instagram publishing | `IG Create Container` -> `Wait 10s` -> `IG Publish` |
| WAHA WhatsApp Status (+10) | `WAHA Status Image` (parallel to the Instagram chain), merged by `Merge Results` |

## Verification status

Checked locally: workflow JSON parses and all connections/expressions reference existing nodes (`node scripts/validate-workflow.mjs`); the script runs with `--dry-run --no-ai` on the sample CSV. Not run against live services (no keys): Groq, Hugging Face, ImgBB, Meta Graph API, WAHA and a real n8n import. The HF router URL and model availability, Pollinations parameters, the WAHA Core status endpoint and the Edit Image node setup should be confirmed on first run.
