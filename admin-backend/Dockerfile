FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=TRUE

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Set default port
ENV PORT 8080

# Start application using uvicorn
CMD exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --proxy-headers --forwarded-allow-ips='*'
