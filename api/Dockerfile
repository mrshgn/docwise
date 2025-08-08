# Use official Python image
FROM python:3.11-slim

# set workdir
WORKDIR /app

# install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    tesseract-ocr \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy app files
COPY . /app

# expose port
ENV PORT 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
