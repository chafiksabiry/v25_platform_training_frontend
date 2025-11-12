# Configuration Nginx CORS pour training.harx.ai

## Problème
Le serveur envoie deux valeurs pour `Access-Control-Allow-Origin` (`*` et `https://v25.harx.ai`), ce qui cause une erreur CORS.

## Solution

Ajoutez la configuration suivante dans le fichier de configuration nginx pour `training.harx.ai` (probablement `/etc/nginx/conf.d/training.conf` ou similaire) :

```nginx
server {
    listen 80;
    server_name training.harx.ai;

    # Configuration CORS - IMPORTANT: Utiliser 'always' pour forcer l'envoi
    # et s'assurer qu'il n'y a qu'UN SEUL header Access-Control-Allow-Origin
    location / {
        # Supprimer tous les headers CORS existants avant d'ajouter les nouveaux
        add_header 'Access-Control-Allow-Origin' 'https://v25.harx.ai' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        # Gérer les requêtes OPTIONS (preflight)
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://v25.harx.ai' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
            add_header 'Access-Control-Max-Age' '1728000' always;
            add_header 'Content-Type' 'text/plain; charset=utf-8' always;
            add_header 'Content-Length' '0' always;
            return 204;
        }

        # Configuration du proxy ou du root selon votre setup
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        
        # Ou si vous utilisez un proxy :
        # proxy_pass http://localhost:5190;
        # proxy_set_header Host $host;
        # proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Points importants

1. **Utiliser `always`** : Le mot-clé `always` force nginx à envoyer les headers même pour les codes de réponse autres que 2xx/3xx.

2. **Un seul header Access-Control-Allow-Origin** : Assurez-vous qu'il n'y a qu'UN SEUL `add_header 'Access-Control-Allow-Origin'` dans votre configuration. Si vous avez plusieurs blocs `location`, vérifiez qu'ils n'ajoutent pas de headers en double.

3. **Vérifier les includes** : Vérifiez si votre configuration nginx inclut d'autres fichiers qui pourraient ajouter des headers CORS :
   ```nginx
   # Vérifiez ces lignes dans votre config principale
   include /etc/nginx/conf.d/*.conf;
   include /etc/nginx/sites-enabled/*;
   ```

4. **Éviter les headers en double** : Si vous avez des headers définis dans plusieurs endroits (par exemple dans un fichier de configuration global et dans le bloc server), nginx peut les combiner. Assurez-vous de ne définir les headers CORS qu'à un seul endroit.

## Vérification

Après avoir modifié la configuration nginx :

1. Rechargez nginx :
   ```bash
   sudo nginx -t  # Vérifier la syntaxe
   sudo nginx -s reload  # Recharger la configuration
   ```

2. Vérifiez les headers avec curl :
   ```bash
   curl -I -H "Origin: https://v25.harx.ai" https://training.harx.ai/
   ```

   Vous devriez voir UN SEUL header `Access-Control-Allow-Origin: https://v25.harx.ai`

3. Testez dans le navigateur : L'erreur CORS devrait disparaître.

## Alternative : Configuration avec plusieurs origines autorisées

Si vous devez autoriser plusieurs origines, vous pouvez utiliser une variable :

```nginx
map $http_origin $cors_origin {
    default "";
    "https://v25.harx.ai" "https://v25.harx.ai";
    "https://localhost:3000" "https://localhost:3000";
}

server {
    location / {
        if ($cors_origin) {
            add_header 'Access-Control-Allow-Origin' $cors_origin always;
        }
        # ... reste de la config
    }
}
```

