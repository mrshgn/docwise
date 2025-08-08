# Docwise Backend — Cloud Run deployment

This backend accepts file uploads, processes them (text extraction, AI simplification), and returns downloadable results.

## Files
- main.py — FastAPI app
- processing.py — Text extraction + helpers
- ai_client.py — AI wrapper (uses OPENAI_API_KEY if set)
- requirements.txt — Python deps
- Dockerfile — Container for Cloud Run

## Local testing
1. Create venv and install deps (optional, local testing may need system packages for pytesseract):
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

## Deploy to Google Cloud Run
1. Install and authenticate gcloud CLI: https://cloud.google.com/sdk/docs/install
2. Enable Cloud Run and Container Registry/Artifact Registry APIs:
   ```bash
   gcloud services enable run.googleapis.com containerregistry.googleapis.com
   ```
3. Build and submit the container:
   ```bash
   gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/docwise-backend
   ```
4. Deploy to Cloud Run:
   ```bash
   gcloud run deploy docwise-backend --image gcr.io/$(gcloud config get-value project)/docwise-backend --platform managed --region us-central1 --allow-unauthenticated --port 8080
   ```
5. After deploy, you'll get a public URL. Use that as your API base in the frontend.

## Notes
- Set environment variable OPENAI_API_KEY on Cloud Run if you want AI-generated summaries.
- For production storage, replace the local `static/` with Cloud Storage or R2.
