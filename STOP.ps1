# ========================================
# SCRIPT D'ARRÊT
# Plateforme de Formation avec IA
# ========================================

Write-Host @"
╔══════════════════════════════════════════════════════════╗
║        🛑 ARRÊT DE LA PLATEFORME DE FORMATION           ║
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Red

Write-Host "`n⏹️  Arrêt des services..." -ForegroundColor Yellow

# Arrêter MongoDB
Write-Host "`n[1] Arrêt de MongoDB..." -ForegroundColor Cyan
Set-Location backend
docker-compose down
Set-Location ..
Write-Host "✅ MongoDB arrêté" -ForegroundColor Green

# Arrêter les processus Java (Backend)
Write-Host "`n[2] Arrêt du Backend..." -ForegroundColor Cyan
$javaProcesses = Get-Process java -ErrorAction SilentlyContinue
if ($javaProcesses) {
    $javaProcesses | Stop-Process -Force
    Write-Host "✅ Backend arrêté" -ForegroundColor Green
} else {
    Write-Host "⚠️  Aucun processus Backend trouvé" -ForegroundColor Yellow
}

# Arrêter les processus Node (Frontend)
Write-Host "`n[3] Arrêt du Frontend..." -ForegroundColor Cyan
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "✅ Frontend arrêté" -ForegroundColor Green
} else {
    Write-Host "⚠️  Aucun processus Frontend trouvé" -ForegroundColor Yellow
}

# Nettoyer les scripts temporaires
if (Test-Path "start-backend.ps1") { Remove-Item "start-backend.ps1" }
if (Test-Path "start-frontend.ps1") { Remove-Item "start-frontend.ps1" }

Write-Host @"

╔══════════════════════════════════════════════════════════╗
║              ✅ TOUS LES SERVICES ARRÊTÉS                ║
╚══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

