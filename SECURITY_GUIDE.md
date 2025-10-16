# 🔒 Guide de Sécurité - Clés API

## ⚠️ ATTENTION IMPORTANTE

Vos clés API sont **HAUTEMENT SENSIBLES**. Ne les partagez JAMAIS publiquement.

## 🚨 Actions Immédiates à Faire

### 1. Révoquer votre clé OpenAI actuelle

**La clé que vous avez partagée doit être révoquée immédiatement :**

1. Allez sur : https://platform.openai.com/api-keys
2. Trouvez votre clé actuelle
3. Cliquez sur "Revoke" (Révoquer)
4. Créez une nouvelle clé
5. Mettez à jour `backend/.env` avec la nouvelle clé

### 2. Vérifier votre clé ElevenLabs

1. Allez sur : https://elevenlabs.io/app/settings/api-keys
2. Vérifiez si votre clé a été compromise
3. Si nécessaire, régénérez-la

## 📋 Checklist de Sécurité

- [ ] Clés API stockées dans `.env` (JAMAIS dans le code)
- [ ] Fichiers `.env` ajoutés dans `.gitignore`
- [ ] Vérifier que `.env` n'est PAS dans votre historique Git
- [ ] Ne jamais partager vos clés dans : chat, email, Slack, etc.
- [ ] Utiliser des variables d'environnement en production
- [ ] Limiter les permissions des clés API
- [ ] Monitorer l'utilisation de vos clés API

## 🔐 Bonnes Pratiques

### Backend (Spring Boot)

```yaml
# application.yml - Utiliser des variables d'environnement
app:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}  # ✅ Bon
      # api-key: sk-proj-xxx       # ❌ JAMAIS comme ça
```

### Frontend (Next.js)

```bash
# .env.local - Préfixe NEXT_PUBLIC_ pour variables publiques uniquement
NEXT_PUBLIC_API_URL=http://localhost:8080  # ✅ OK (public)
# NEXT_PUBLIC_OPENAI_KEY=sk-xxx            # ❌ JAMAIS (secret)
```

## 🛡️ Protection Git

### Vérifier que .env n'est pas committé

```bash
# Vérifier l'historique
git log --all --full-history -- "*/.env"

# Si trouvé, nettoyer l'historique (ATTENTION: change l'historique)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all
```

### Ajouter un hook pre-commit

```bash
# .git/hooks/pre-commit
#!/bin/sh
if git diff --cached --name-only | grep -E '\.env$|api.*key'; then
    echo "❌ ERREUR: Tentative de commit de fichiers secrets détectée!"
    exit 1
fi
```

## 📊 Monitoring des Clés API

### OpenAI
- Dashboard : https://platform.openai.com/usage
- Configurez des alertes de coût
- Limitez les quotas

### ElevenLabs
- Dashboard : https://elevenlabs.io/app/usage
- Surveillez votre utilisation mensuelle

## 🚨 En Cas de Fuite de Clé

1. **IMMÉDIAT** : Révoquez la clé compromise
2. Générez une nouvelle clé
3. Mettez à jour vos environnements
4. Vérifiez les logs d'utilisation
5. Contactez le support du service si activité suspecte

## 📧 Contact Support

- **OpenAI** : https://help.openai.com/
- **ElevenLabs** : support@elevenlabs.io

---

**Date de création** : ${new Date().toISOString()}
**Statut des clés** : ⚠️ À RÉVOQUER ET RÉGÉNÉRER

