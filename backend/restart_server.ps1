Write-Host "🔄 Restarting Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Kill all node processes
Write-Host "1️⃣  Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Verify all killed
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "⚠️  Some node processes still running. Force killing..." -ForegroundColor Red
    taskkill /F /IM node.exe
    Start-Sleep -Seconds 2
}

Write-Host "✅ All Node.js processes stopped" -ForegroundColor Green
Write-Host ""

# Start the server
Write-Host "2️⃣  Starting backend server..." -ForegroundColor Yellow
Set-Location "C:\Klinik Sentosa Final Project\backend"

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Backend Server Log" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Start server
node server.js
