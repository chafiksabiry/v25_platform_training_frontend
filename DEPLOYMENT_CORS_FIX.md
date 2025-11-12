# 🔧 Fix CORS - Configuration Serveur

## ⚠️ Problème Actuel

Le serveur `training.harx.ai` envoie **deux valeurs** pour le header `Access-Control-Allow-Origin` :
- `*` (wildcard)
- `https://v25.harx.ai` (valeur spécifique)

Cela cause l'erreur :
```
Access-Control-Allow-Origin header contains multiple values '*, https://v25.harx.ai', but only one is allowed
```

## ✅ Solution

### Option 1 : Utiliser le fichier nginx.conf fourni

1. **Copiez le fichier `nginx.conf`** dans votre serveur :
   ```bash
   # Sur le serveur
   sudo cp nginx.conf /etc/nginx/sites-available/training.harx.ai
   sudo ln -s /etc/nginx/sites-available/training.harx.ai /etc/nginx/sites-enabled/
   ```

2. **Vérifiez la configuration** :
   ```bash
   sudo nginx -t
   ```

3. **Rechargez nginx** :
   ```bash
   sudo nginx -s reload
   # ou
   sudo systemctl reload nginx
   ```

### Option 2 : Modifier la configuration existante

Si vous avez déjà une configuration nginx, **supprimez tous les headers CORS existants** et ajoutez uniquement :

```nginx
location / {
    # UN SEUL header Access-Control-Allow-Origin (pas de wildcard *)
    add_header 'Access-Control-Allow-Origin' 'https://v25.harx.ai' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    
    # ... reste de votre configuration
}
```

### Points Critiques

1. **❌ NE PAS utiliser `*`** si vous avez déjà un header spécifique
2. **✅ Utiliser `always`** pour forcer l'envoi des headers
3. **✅ Un seul header** `Access-Control-Allow-Origin` par location
4. **✅ Vérifier les includes** : Si votre config inclut d'autres fichiers, vérifiez qu'ils n'ajoutent pas de headers en double

### Vérification

Testez avec curl :
```bash
curl -I -H "Origin: https://v25.harx.ai" https://training.harx.ai/
```

Vous devriez voir **UN SEUL** header :
```
Access-Control-Allow-Origin: https://v25.harx.ai
```

### Si le problème persiste

1. **Vérifiez tous les fichiers de configuration nginx** :
   ```bash
   grep -r "Access-Control-Allow-Origin" /etc/nginx/
   ```

2. **Vérifiez les configurations globales** :
   ```bash
   cat /etc/nginx/nginx.conf
   cat /etc/nginx/conf.d/*.conf
   ```

3. **Vérifiez si un reverse proxy ajoute des headers** :
   - Cloudflare
   - Load balancer
   - Autre proxy

4. **Redémarrez nginx complètement** :
   ```bash
   sudo systemctl restart nginx
   ```

## 📝 Notes

- Le fichier `nginx.conf` fourni est prêt à l'emploi
- Assurez-vous que le chemin `root /usr/share/nginx/html;` correspond à votre répertoire de build
- Si vous utilisez Docker, copiez ce fichier dans votre image nginx

