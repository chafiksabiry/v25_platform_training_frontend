# 🚀 Guide de Démarrage MANUEL (Pas à Pas)

Si vous préférez démarrer manuellement, voici les commandes exactes :

---

## **TERMINAL 1 : MongoDB**

```powershell
# Aller dans le dossier backend
cd backend

# Démarrer MongoDB avec Docker
docker-compose up -d mongodb

# Vérifier que MongoDB tourne
docker ps

# Vous devriez voir : mongodb:7
```

**✅ MongoDB est prêt quand vous voyez :** `mongodb:7 ... Up`

---

## **TERMINAL 2 : Backend (Spring Boot)**

```powershell
# Aller dans le dossier backend
cd backend

# Démarrer le backend
mvn spring-boot:run
```

**✅ Backend est prêt quand vous voyez :**
```
Started TrainingPlatformApplication in X seconds
Tomcat started on port(s): 8080
```

**⏰ Temps de démarrage :** ~30-60 secondes

**URL de test :** http://localhost:8080/api/actuator/health

---

## **TERMINAL 3 : Frontend (Next.js)**

```powershell
# Aller dans le dossier racine du projet
cd E:\Project_Harx\project

# (Première fois seulement) Installer les dépendances
npm install

# Démarrer le frontend
npm run dev
```

**✅ Frontend est prêt quand vous voyez :**
```
✓ Ready in Xms
○ Local:   http://localhost:3000
```

**⏰ Temps de démarrage :** ~10-15 secondes

---

## **🔍 VÉRIFICATION**

### **1. Vérifier MongoDB**
```powershell
docker ps
# Doit montrer mongodb:7 en cours
```

### **2. Vérifier Backend**
```powershell
# Dans PowerShell ou navigateur
curl http://localhost:8080/api/actuator/health
# Doit retourner: {"status":"UP"}
```

### **3. Vérifier Frontend**
```powershell
# Ouvrir dans le navigateur
start http://localhost:3000
```

---

## **🧪 TESTER L'IA**

### **Test 1 : Via l'Interface**

1. Ouvrez : http://localhost:3000
2. Cliquez sur "Create Training Journey"
3. Remplissez les infos de l'étape 1 (Setup)
4. À l'étape 2 (Upload), uploadez un document PDF ou Word
5. **L'IA va vraiment l'analyser avec GPT-4 !** 🎉

### **Test 2 : Via API (PowerShell)**

```powershell
# Test Health Check
Invoke-RestMethod -Uri "http://localhost:8080/api/actuator/health"

# Test AI Chat
$body = @{
    message = "Explique-moi le service client"
    context = ""
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/ai/chat" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

---

## **🛑 ARRÊTER LES SERVICES**

### **Arrêter Frontend**
```powershell
# Dans le terminal du frontend
Ctrl + C
```

### **Arrêter Backend**
```powershell
# Dans le terminal du backend
Ctrl + C
```

### **Arrêter MongoDB**
```powershell
cd backend
docker-compose down
```

---

## **🐛 RÉSOLUTION DE PROBLÈMES**

### **Problème : Port 8080 déjà utilisé**

```powershell
# Trouver le processus
netstat -ano | findstr :8080

# Tuer le processus (remplacer PID par le numéro trouvé)
taskkill /PID [PID] /F
```

### **Problème : Port 3000 déjà utilisé**

```powershell
# Trouver le processus
netstat -ano | findstr :3000

# Tuer le processus
taskkill /PID [PID] /F
```

### **Problème : MongoDB ne démarre pas**

```powershell
# Arrêter tous les containers
docker stop $(docker ps -aq)

# Redémarrer MongoDB
cd backend
docker-compose up -d mongodb

# Vérifier les logs
docker logs mongodb
```

### **Problème : Backend compile mais crash**

```powershell
# Vérifier les logs Java
# Regardez le terminal où mvn spring-boot:run tourne

# Vérifier que MongoDB est accessible
docker ps

# Vérifier le fichier .env
cd backend
cat .env
```

### **Problème : Frontend ne trouve pas le backend**

```powershell
# Vérifier .env.local
cat .env.local
# Doit contenir: NEXT_PUBLIC_API_URL=http://localhost:8080

# Vérifier que le backend tourne
curl http://localhost:8080/api/actuator/health
```

---

## **📊 MONITORING**

### **Vérifier l'état des services en temps réel**

```powershell
# Dans une boucle
while ($true) {
    Clear-Host
    Write-Host "=== ÉTAT DES SERVICES ===" -ForegroundColor Cyan
    Write-Host ""
    
    # MongoDB
    Write-Host "MongoDB:" -NoNewline
    if (docker ps -q -f name=mongodb) {
        Write-Host " ✅ UP" -ForegroundColor Green
    } else {
        Write-Host " ❌ DOWN" -ForegroundColor Red
    }
    
    # Backend
    Write-Host "Backend:" -NoNewline
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:8080/api/actuator/health" -UseBasicParsing -TimeoutSec 1
        Write-Host " ✅ UP" -ForegroundColor Green
    } catch {
        Write-Host " ❌ DOWN" -ForegroundColor Red
    }
    
    # Frontend
    Write-Host "Frontend:" -NoNewline
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 1
        Write-Host " ✅ UP" -ForegroundColor Green
    } catch {
        Write-Host " ❌ DOWN" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 5
}
```

Appuyez sur `Ctrl+C` pour arrêter le monitoring.

---

## **📝 CHECKLIST DE DÉMARRAGE**

- [ ] MongoDB démarré (`docker ps` montre mongodb)
- [ ] Backend démarré (voir "Started TrainingPlatformApplication")
- [ ] Frontend démarré (voir "Ready in Xms")
- [ ] http://localhost:8080/api/actuator/health retourne UP
- [ ] http://localhost:3000 s'ouvre dans le navigateur
- [ ] Aucune erreur dans les logs

**Si toutes les cases sont cochées : Vous êtes prêt ! 🎉**

---

## **🆘 AIDE**

Si vous avez toujours des problèmes :

1. Consultez les logs de chaque service
2. Vérifiez que les ports ne sont pas déjà utilisés
3. Vérifiez vos clés API dans `backend/.env`
4. Consultez `GUIDE_DEMARRAGE.md` pour plus de détails

