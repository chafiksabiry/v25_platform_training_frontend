# Configuration API - Environnements

## 📋 Vue d'ensemble

Le fichier `src/lib/manualTrainingApi.ts` détecte automatiquement l'environnement et utilise l'URL API appropriée.

## 🔧 Configuration

### Mode Automatique (Recommandé)

Par défaut, l'application détecte automatiquement l'environnement :

- **Développement** → `http://localhost:5010`
- **Production** → `https://votre-api-production.com` ⚠️ **À configurer**

### Mode Manuel (Variables d'environnement)

Vous pouvez surcharger la détection automatique en créant des fichiers `.env` :

#### `.env.local` (Développement local)
```env
VITE_API_BASE_URL=http://localhost:5010
```

#### `.env.production` (Production)
```env
VITE_API_BASE_URL=https://votre-api-production.com
```

## ⚙️ Étapes de Configuration

### 1. Configurer l'URL de Production

Modifiez `src/lib/manualTrainingApi.ts` ligne 20 :

```typescript
return 'https://votre-api-production.com'; // ← Remplacez par votre URL
```

### 2. (Optionnel) Créer les fichiers .env

Si vous préférez utiliser des variables d'environnement :

```bash
# Créer .env.local pour le développement
echo "VITE_API_BASE_URL=http://localhost:5010" > .env.local

# Créer .env.production pour la production
echo "VITE_API_BASE_URL=https://votre-api-production.com" > .env.production
```

## 🚀 Utilisation

### Développement

```bash
npm run dev
# Utilise automatiquement http://localhost:5010
```

### Build de Production

```bash
npm run build
# Utilise automatiquement l'URL de production configurée
```

## 🔍 Vérification

Au démarrage de l'application, vérifiez la console du navigateur :

```
🌐 API Base URL: http://localhost:5010
```

Cela confirme quelle URL est utilisée.

## 📝 Notes Importantes

1. **Sécurité** : Ne commitez JAMAIS les fichiers `.env.local` ou `.env.production` contenant des secrets
2. **Git** : Ces fichiers sont déjà dans `.gitignore`
3. **Docker** : Pour Docker, utilisez les variables d'environnement dans le `docker-compose.yml`
4. **CI/CD** : Configurez `VITE_API_BASE_URL` dans vos pipelines

## 🐛 Dépannage

### L'API ne répond pas
- Vérifiez que le backend est lancé
- Vérifiez la console pour voir l'URL utilisée
- Vérifiez les CORS sur votre API

### Mauvaise URL utilisée
- Vérifiez `import.meta.env.MODE` dans la console
- Vérifiez vos fichiers `.env`
- Redémarrez le serveur de développement après modification des `.env`

