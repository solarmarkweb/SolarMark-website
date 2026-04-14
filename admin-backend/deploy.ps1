# SolarMark Admin Backend Deployment Script
$ProjectID = "solarmark-1000"
$Account = "solarmarkweb@gmail.com"
$Region = "asia-south1"
$ServiceName = "admin-backend"

Write-Host "`n--- SolarMark Admin Backend Deployment ---" -ForegroundColor Cyan

# 1. Setup Configuration
Write-Host "[1/3] Configuring gcloud..." -ForegroundColor Yellow
gcloud config set account $Account
gcloud config set project $ProjectID

# 2. Fix potential permission issues (handles bucket access errors)
Write-Host "[2/3] Verifying service account permissions..." -ForegroundColor Yellow
$ProjectNumber = gcloud projects describe $ProjectID --format="value(projectNumber)"
# Grant Storage Admin to Compute and App Engine service accounts to ensure build succeeds
gcloud projects add-iam-policy-binding $ProjectID --member="serviceAccount:$($ProjectNumber)-compute@developer.gserviceaccount.com" --role="roles/storage.admin" --quiet | Out-Null
gcloud projects add-iam-policy-binding $ProjectID --member="serviceAccount:$($ProjectID)@appspot.gserviceaccount.com" --role="roles/storage.admin" --quiet | Out-Null

# 3. Deploy to Cloud Run
Write-Host "[3/3] Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
    --source . `
    --region $Region `
    --allow-unauthenticated `
    --env-vars-file backend.env.yaml `
    --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
    $ServiceUrl = gcloud run services describe $ServiceName --region $Region --format="value(status.url)"
    Write-Host "Service URL: $ServiceUrl" -ForegroundColor White
} else {
    Write-Host "`n❌ Deployment failed. Please check the logs above." -ForegroundColor Red
}
