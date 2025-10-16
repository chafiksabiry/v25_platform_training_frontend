# 🚀 DÉMARRAGE RAPIDE - SOLUTION AU PROBLÈME

## ❌ Problème
Le backend s'arrête automatiquement après le démarrage.

## ✅ Solution

### Étape 1 : Ouvrir un nouveau terminal PowerShell

### Étape 2 : Démarrer MongoDB
```powershell
cd E:\Project_Harx\project\backend
docker-compose up mongodb -d
```

**Attendez 10 secondes** que MongoDB initialise.

### Étape 3 : Démarrer le backend en mode visible
```powershell
mvn spring-boot:run
```

**NE FERMEZ PAS** ce terminal. Laissez-le ouvert.

### Étape 4 : Observer les logs
Regardez les messages dans le terminal :
- ✅ Si vous voyez `Started TrainingPlatformApplication` → **C'est bon !**
- ❌ Si vous voyez des erreurs → **Copiez-les et partagez-les**

---

## 🔍 Si le backend ne démarre toujours pas

### Erreur possible 1 : MongoDB non connecté
```
Error creating bean with name 'mongoTemplate'
```
**Solution :** MongoDB n'est pas démarré. Refaites l'Étape 2.

### Erreur possible 2 : Port 8080 déjà utilisé
```
Port 8080 was already in use
```
**Solution :**
```powershell
# Trouver le processus
netstat -ano | findstr :8080

# Tuer le processus (remplacez XXXX par le PID trouvé)
taskkill /PID XXXX /F
```

### Erreur possible 3 : Erreur de compilation
```
Error creating bean...
NoSuchMethodError...
```
**Solution :** Il y a une erreur dans le code récent.
Partagez l'erreur complète pour que je puisse la corriger.

---

## ⚡ Démarrage Rapide (Script)

Copiez-collez tout ça dans PowerShell :

```powershell
# 1. Aller dans le dossier backend
cd E:\Project_Harx\project\backend

# 2. Démarrer MongoDB
Write-Host "`n🚀 Démarrage de MongoDB..." -ForegroundColor Cyan
docker-compose up mongodb -d

# 3. Attendre
Write-Host "⏳ Attente de MongoDB (10 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 4. Démarrer le backend
Write-Host "`n🚀 Démarrage du Backend..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
mvn spring-boot:run
```

---

## 🎯 Une fois le backend démarré

1. **Frontend** : Le frontend tourne déjà sur http://localhost:3000
2. **Backend** : Devrait être sur http://localhost:8080
3. **MongoDB** : Devrait être sur localhost:27017

### Tester que tout fonctionne :
```powershell
# Test backend
curl http://localhost:8080/health/ping

# Si ça répond "pong" → ✅ C'est bon !
```

---

## 💡 Conseils

1. **Toujours démarrer MongoDB AVANT le backend**
2. **Laisser le terminal backend ouvert** (pour voir les logs)
3. **Si ça ne marche pas**, partagez les erreurs du terminal backend

---

## 📋 Checklist de Démarrage

- [ ] MongoDB démarré (`docker-compose up mongodb -d`)
- [ ] Attendu 10 secondes
- [ ] Backend démarré (`mvn spring-boot:run`)
- [ ] Message "Started TrainingPlatformApplication" visible
- [ ] Test `http://localhost:8080/health/ping` réussit
- [ ] Frontend accessible sur `http://localhost:3000`

**Si tous les checkboxes sont cochés → Vous êtes prêt ! 🎊**

