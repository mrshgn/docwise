from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from uuid import uuid4
from pathlib import Path
from threading import Thread
import shutil
import os
from processing import extract_text_from_pdf, extract_text_from_docx, extract_text_from_pptx, save_html, make_audio
from ai_client import simplify_and_structure

APP_DIR = Path(__file__).parent
TMP_DIR = APP_DIR / "tmp"
STATIC_DIR = APP_DIR / "static"
TMP_DIR.mkdir(exist_ok=True)
STATIC_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Docwise Backend")

JOBS = {}

@app.post('/api/upload')
async def upload(file: UploadFile = File(...)):
    job_id = str(uuid4())
    in_path = TMP_DIR / f"{job_id}_{file.filename}"
    # Save uploaded file
    with in_path.open('wb') as f:
        shutil.copyfileobj(file.file, f)
    JOBS[job_id] = {'status':'queued', 'progress':0}
    def worker(job_id, path):
        try:
            JOBS[job_id] = {'status':'processing', 'progress':10}
            ext = path.suffix.lower()
            if ext == '.pdf':
                text = extract_text_from_pdf(path)
            elif ext == '.docx':
                text = extract_text_from_docx(path)
            elif ext in ('.pptx', '.ppt'):
                text = extract_text_from_pptx(path)
            else:
                text = path.read_text(encoding='utf-8', errors='ignore')
            JOBS[job_id]['progress'] = 30
            ai = simplify_and_structure(text)
            JOBS[job_id]['progress'] = 60
            out_dir = STATIC_DIR / job_id
            out_dir.mkdir(parents=True, exist_ok=True)
            html_path = out_dir / 'accessible.html'
            save_html(ai.get('structured_html', ai.get('plain_text','')), html_path)
            audio_path = out_dir / 'summary.mp3'
            make_audio(ai.get('summary','No summary available'), audio_path)
            accessible_pdf = out_dir / f"accessible{path.suffix}"
            # For now, copy original as placeholder for accessible PDF
            shutil.copy(path, accessible_pdf)
            JOBS[job_id] = {
                'status':'done',
                'progress':100,
                'summary': ai.get('summary',''),
                'html_url': f"/api/result/{job_id}/accessible.html",
                'audio_url': f"/api/result/{job_id}/summary.mp3",
                'accessible_pdf_url': f"/api/result/{job_id}/{accessible_pdf.name}",
                'report': ['Added heading structure via AI', 'Generated HTML version', 'Generated audio summary']
            }
        except Exception as e:
            JOBS[job_id] = {'status':'error', 'error': str(e)}
    t = Thread(target=worker, args=(job_id, in_path))
    t.start()
    return JSONResponse({'job_id': job_id})

@app.get('/api/status/{job_id}')
async def status(job_id: str):
    r = JOBS.get(job_id)
    if not r:
        return JSONResponse({'status':'not_found'}, status_code=404)
    return r

@app.get('/api/result/{job_id}/{filename}')
async def download(job_id: str, filename: str):
    path = STATIC_DIR / job_id / filename
    if not path.exists():
        return JSONResponse({'error':'not found'}, status_code=404)
    return FileResponse(path)

if __name__=='__main__':
    import uvicorn
    uvicorn.run('main:app', host='0.0.0.0', port=int(os.environ.get('PORT',8000)))