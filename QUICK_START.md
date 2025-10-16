# ⚡ Quick Start - 3 Minutes

## Démarrage en 3 commandes

### 1️⃣ Démarrer MongoDB
```bash
cd backend
docker-compose up -d mongodb
```

### 2️⃣ Démarrer le Backend
```bash
# Dans backend/
mvn spring-boot:run
```

### 3️⃣ Démarrer le Frontend
```bash
# Dans le dossier racine
npm run dev
```

## ✅ Vérification

- Backend : http://localhost:8080/api/actuator/health
- Frontend : http://localhost:3000

## 🧪 Test AI

1. Ouvrez http://localhost:3000
2. Créez un Journey
3. Uploadez un document PDF
4. **L'IA va vraiment l'analyser !** 🎉

## 🆘 Problème ?

```bash
# Vérifier MongoDB
docker ps

# Vérifier les ports
netstat -ano | findstr :8080
netstat -ano | findstr :3000
```

**C'est tout ! 🚀**

