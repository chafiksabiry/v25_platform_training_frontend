# ========================================
# SCRIPT DE DÉMARRAGE AUTOMATIQUE
# Plateforme de Formation avec IA
# ========================================

Write-Host @"
╔══════════════════════════════════════════════════════════╗
║   🚀 DÉMARRAGE DE LA PLATEFORME DE FORMATION IA 🚀      ║
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Fonction pour afficher les étapes
function Show-Step {
    param($number, $title)
    Write-Host "`n[$number] $title" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
}

# Fonction pour vérifier un service
function Test-Service {
    param($url, $name)
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ $name est accessible" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ $name n'est pas accessible" -ForegroundColor Red
        return $false
    }
}

# ÉTAPE 1 : MongoDB
Show-Step "1" "Vérification de MongoDB"

$mongoRunning = docker ps --filter "name=mongodb" --filter "status=running" -q
if ($mongoRunning) {
    Write-Host "✅ MongoDB est déjà en cours d'exécution" -ForegroundColor Green
} else {
    Write-Host "⚡ Démarrage de MongoDB..." -ForegroundColor Cyan
    Set-Location backend
    docker-compose up -d mongodb
    Start-Sleep -Seconds 5
    Set-Location ..
    Write-Host "✅ MongoDB démarré" -ForegroundColor Green
}

# ÉTAPE 2 : Backend
Show-Step "2" "Démarrage du Backend (Spring Boot)"

# Vérifier si le backend tourne déjà
$backendRunning = Test-Service "http://localhost:8080/api/actuator/health" "Backend"

if (-not $backendRunning) {
    Write-Host "⚡ Lancement du backend dans une nouvelle fenêtre..." -ForegroundColor Cyan
    
    # Créer un script temporaire pour le backend
    $backendScript = @"
Set-Location '$PWD\backend'
Write-Host '🚀 Démarrage du Backend Spring Boot...' -ForegroundColor Cyan
Write-Host 'URL: http://localhost:8080' -ForegroundColor Green
Write-Host ''
Write-Host 'Attendez de voir: "Started TrainingPlatformApplication"' -ForegroundColor Yellow
Write-Host ''
mvn spring-boot:run
"@
    
    $backendScript | Out-File -FilePath "start-backend.ps1" -Encoding UTF8
    
    Start-Process powershell -ArgumentList "-NoExit", "-File", "start-backend.ps1"
    
    Write-Host "⏳ Attendre 30 secondes que le backend démarre..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
} else {
    Write-Host "✅ Le backend est déjà en cours d'exécution" -ForegroundColor Green
}

# ÉTAPE 3 : Frontend
Show-Step "3" "Démarrage du Frontend (Next.js)"

# Vérifier si le frontend tourne déjà
$frontendRunning = Test-Service "http://localhost:3000" "Frontend"

if (-not $frontendRunning) {
    Write-Host "⚡ Lancement du frontend dans une nouvelle fenêtre..." -ForegroundColor Cyan
    
    # Créer un script temporaire pour le frontend
    $frontendScript = @"
Set-Location '$PWD'
Write-Host '🚀 Démarrage du Frontend Next.js...' -ForegroundColor Cyan
Write-Host 'URL: http://localhost:3000' -ForegroundColor Green
Write-Host ''
Write-Host 'Attendez de voir: "Ready in Xms"' -ForegroundColor Yellow
Write-Host ''
npm run dev
"@
    
    $frontendScript | Out-File -FilePath "start-frontend.ps1" -Encoding UTF8
    
    Start-Process powershell -ArgumentList "-NoExit", "-File", "start-frontend.ps1"
    
    Write-Host "⏳ Attendre 15 secondes que le frontend démarre..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
}

# VÉRIFICATION FINALE
Show-Step "4" "Vérification des Services"

Write-Host "`n🔍 Test de connectivité..." -ForegroundColor Cyan
Write-Host ""

$mongoOk = docker ps --filter "name=mongodb" --filter "status=running" -q
if ($mongoOk) {
    Write-Host "✅ MongoDB      : http://localhost:27017" -ForegroundColor Green
} else {
    Write-Host "❌ MongoDB      : Non accessible" -ForegroundColor Red
}

Start-Sleep -Seconds 2
$backendOk = Test-Service "http://localhost:8080/api/actuator/health" "Backend"
Write-Host "   Backend      : http://localhost:8080" -ForegroundColor $(if($backendOk){"Green"}else{"Red"})

Start-Sleep -Seconds 2
$frontendOk = Test-Service "http://localhost:3000" "Frontend"
Write-Host "   Frontend     : http://localhost:3000" -ForegroundColor $(if($frontendOk){"Green"}else{"Red"})

# RÉSUMÉ
Write-Host "`n" -NoNewline
Write-Host @"
╔══════════════════════════════════════════════════════════╗
║                    ✅ DÉMARRAGE TERMINÉ                  ║
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green

Write-Host "`n📱 ACCÈS À L'APPLICATION :" -ForegroundColor Cyan
Write-Host "   🌐 Frontend : " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Yellow
Write-Host "   🔧 Backend  : " -NoNewline
Write-Host "http://localhost:8080" -ForegroundColor Yellow

Write-Host "`n🧪 TESTER L'IA :" -ForegroundColor Cyan
Write-Host "   1. Ouvrez http://localhost:3000"
Write-Host "   2. Créez un Training Journey"
Write-Host "   3. Uploadez un document PDF ou Word"
Write-Host "   4. L'IA va l'analyser avec GPT-4 ! 🎉"

Write-Host "`n📊 MONITORING :" -ForegroundColor Cyan
Write-Host "   Health Check : http://localhost:8080/api/actuator/health"

Write-Host "`n❌ POUR ARRÊTER :" -ForegroundColor Red
Write-Host "   Fermez les fenêtres PowerShell ouvertes"
Write-Host "   Ou exécutez : .\STOP.ps1"

Write-Host "`n🆘 EN CAS DE PROBLÈME :" -ForegroundColor Yellow
Write-Host "   Consultez GUIDE_DEMARRAGE.md"

Write-Host ""

