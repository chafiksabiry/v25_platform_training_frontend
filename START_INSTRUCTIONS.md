# 🚀 Instructions de Démarrage - Plateforme de Formation IA

## ⚠️ IMPORTANT - Problème de Version Java

Votre système a **2 versions de Java** :
- **Java 8** (dans le PATH par défaut) - ❌ Trop ancien
- **Java 17** (utilisé par Maven) - ✅ Requis

### Solution : Toujours Utiliser Maven

**NE FAITES PAS** : `java -jar target/...`  
**FAITES** : `mvn spring-boot:run`

---

## 📋 Démarrage Complet - 3 Étapes

### 1. MongoDB (Base de données)

```powershell
cd E:\Project_Harx\project\backend
docker-compose up -d mongodb
```

**Vérification** :
```powershell
docker ps --filter "name=mongodb"
```

---

### 2. Backend Spring Boot (API)

```powershell
cd E:\Project_Harx\project\backend
mvn spring-boot:run
```

**Attendez** : ~30-60 secondes pour le premier démarrage

**Vérification** :
- Ouvrez http://localhost:8080/health dans votre navigateur
- Vous devriez voir : `{"status":"UP", ...}`

---

### 3. Frontend Next.js (Interface)

```powershell
cd E:\Project_Harx\project
npm run dev
```

**Vérification** :
- Ouvrez http://localhost:3000
- L'interface devrait s'afficher sans erreurs CORS

---

## 🛑 Arrêt des Services

### Arrêt complet
```powershell
# 1. MongoDB
cd E:\Project_Harx\project\backend
docker-compose down

# 2. Backend (Ctrl+C dans le terminal Maven)

# 3. Frontend (Ctrl+C dans le terminal npm)
```

### Arrêt rapide de tous les processus Java
```powershell
Get-Process java | Stop-Process -Force
```

---

## 🔍 Dépannage

### Erreur "UnsupportedClassVersionError"
- **Cause** : Utilisation de `java -jar` au lieu de `mvn spring-boot:run`
- **Solution** : Utilisez toujours Maven

### Port 8080 déjà utilisé
```powershell
# Trouver le processus
netstat -ano | findstr :8080

# Arrêter le processus (remplacez PID)
Stop-Process -Id <PID> -Force
```

### Erreurs CORS
1. Rafraîchissez le navigateur (Ctrl+Shift+R)
2. Vérifiez que le backend est démarré via Maven
3. Le filtre CORS (`CorsFilter.java`) devrait gérer automatiquement

### MongoDB ne démarre pas
```powershell
# Nettoyer et redémarrer
docker-compose down
docker-compose up -d mongodb
```

---

## 📊 URLs de Vérification

| Service | URL | Statut Attendu |
|---------|-----|----------------|
| Frontend | http://localhost:3000 | Page d'accueil |
| Backend Health | http://localhost:8080/health | `{"status":"UP"}` |
| Backend Ping | http://localhost:8080/health/ping | `{"message":"pong"}` |
| MongoDB | mongodb://localhost:27017 | (via client MongoDB) |

---

## 🔑 Variables d'Environnement

### Backend (`backend/.env`)
```bash
MONGODB_URI=mongodb://localhost:27017/training_platform
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-proj-...
ELEVENLABS_API_KEY=sk_...
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 💡 Conseils

1. **Toujours démarrer dans cet ordre** : MongoDB → Backend → Frontend
2. **Utilisez des terminals séparés** pour chaque service
3. **Attendez que chaque service démarre** avant de lancer le suivant
4. **Les logs sont votre ami** : regardez les messages de démarrage

---

## 🆘 Besoin d'Aide ?

- Vérifiez les logs dans chaque terminal
- Assurez-vous que Docker Desktop est en cours d'exécution
- Vérifiez que les ports 27017, 8080, et 3000 sont libres
- Consultez `GUIDE_DEMARRAGE.md` pour plus de détails

---

## ✅ Checklist de Démarrage Réussi

- [ ] Docker Desktop en cours d'exécution
- [ ] MongoDB container actif
- [ ] Backend répond sur http://localhost:8080/health
- [ ] Frontend accessible sur http://localhost:3000
- [ ] Aucune erreur CORS dans la console du navigateur
- [ ] Connexion WebSocket établie (si applicable)

---

**Dernière mise à jour** : Octobre 2025  
**Version** : 1.0.0

