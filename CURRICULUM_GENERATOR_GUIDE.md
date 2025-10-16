# 🎓 Guide du Générateur de Curriculum AI

## ✨ Vue d'Ensemble

Le système génère maintenant des curriculums de formation **RÉELS** avec GPT-4 au lieu de contenu simulé.

---

## 🚀 Fonctionnalités Implémentées

### **Backend (Java/Spring Boot)**

#### 1. **Nouvelle Méthode dans `AIService.java`**
```java
public Map<String, Object> generateCurriculum(
    Map<String, Object> documentAnalysis, 
    String industry
)
```

**Ce qu'elle fait** :
- Prend l'analyse du document (sujets clés, objectifs, difficulté)
- Envoie un prompt à GPT-4 pour générer un curriculum complet
- Retourne 4-6 modules détaillés avec :
  - Titre et description
  - Durée estimée
  - Niveau de difficulté
  - Éléments multimédia enrichis
  - Objectifs d'apprentissage spécifiques

#### 2. **Nouvel Endpoint dans `AIController.java`**
```
POST /ai/generate-curriculum
```

**Requête** :
```json
{
  "analysis": {
    "keyTopics": ["Project Management", "SMART Goals"],
    "difficulty": 7,
    "learningObjectives": [...],
    "prerequisites": [...],
    "suggestedModules": [...]
  },
  "industry": "General"
}
```

**Réponse** :
```json
{
  "success": true,
  "title": "Project Management Mastery",
  "description": "Comprehensive training...",
  "totalDuration": 480,
  "methodology": "360° Methodology",
  "modules": [
    {
      "title": "Introduction to Project Management",
      "description": "...",
      "duration": 90,
      "difficulty": "beginner",
      "contentItems": 5,
      "assessments": 1,
      "enhancedElements": [
        "Video Introduction",
        "Interactive Infographic",
        "Knowledge Check"
      ],
      "learningObjectives": [
        "Define and structure a complete project",
        "Apply SMART method to set objectives"
      ]
    }
  ]
}
```

---

### **Frontend (React/Next.js)**

#### 1. **Nouvelles Interfaces dans `AIService.ts`**
```typescript
export interface CurriculumModule {
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  contentItems: number;
  assessments: number;
  enhancedElements: string[];
  learningObjectives: string[];
}

export interface Curriculum {
  success: boolean;
  title: string;
  description: string;
  totalDuration: number;
  methodology: string;
  modules: CurriculumModule[];
}
```

#### 2. **Nouvelle Méthode**
```typescript
static async generateCurriculum(
  analysis: DocumentAnalysis, 
  industry: string = 'General'
): Promise<Curriculum>
```

#### 3. **Component Modifié : `CurriculumDesigner.tsx`**
- ❌ **AVANT** : Curriculum simulé avec des données statiques
- ✅ **APRÈS** : Appelle `AIService.generateCurriculum()` pour obtenir un curriculum réel de GPT-4

---

## 📋 Workflow Complet

### **1. Upload de Document**
```
Utilisateur → Upload fichier (PDF/DOCX/TXT)
              ↓
Backend → Extraction du texte (DocumentParserService)
              ↓
Backend → Analyse AI (GPT-4) via /ai/analyze-document
              ↓
Retour → {keyTopics, difficulty, learningObjectives, etc.}
```

### **2. Génération du Curriculum**
```
Frontend → Passe à l'étape "Curriculum Design"
              ↓
CurriculumDesigner → Appelle AIService.generateCurriculum()
              ↓
Backend → Envoie prompt détaillé à GPT-4
              ↓
GPT-4 → Génère curriculum complet avec 4-6 modules
              ↓
Backend → Parse la réponse JSON de GPT-4
              ↓
Frontend → Affiche le curriculum généré
              ↓
Utilisateur → Voit les modules RÉELS basés sur son document
```

---

## 🧪 Test du Système

### **Test Backend Direct (PowerShell)**
```powershell
# 1. Créer le body de test
$analysis = @{
    analysis = @{
        keyTopics = @("Project Management", "SMART Goals", "Deliverables")
        difficulty = 7
        estimatedReadTime = 30
        learningObjectives = @("Define projects", "Apply SMART method")
        prerequisites = @("Basic management knowledge")
        suggestedModules = @("Intro", "Planning", "Execution")
    }
    industry = "General"
} | ConvertTo-Json -Depth 10

# 2. Appeler l'API
Invoke-RestMethod -Uri "http://localhost:8080/ai/generate-curriculum" `
    -Method Post `
    -ContentType "application/json" `
    -Body $analysis `
    -TimeoutSec 60 | ConvertTo-Json -Depth 10
```

### **Test Frontend**
1. Allez sur `http://localhost:3000`
2. Créez un parcours de formation
3. Uploadez un document (ex: `Exercice pratique projet.docx`)
4. Attendez l'analyse AI
5. Cliquez sur "Suivant" → Étape "Curriculum Design"
6. **Le curriculum sera généré automatiquement avec GPT-4 !**

---

## ⚙️ Configuration

### **Variables d'Environnement**
Vérifiez dans `backend/src/main/resources/application.yml` :
```yaml
app:
  ai:
    openai:
      api-key: sk-proj-...  # Votre clé OpenAI
      model: gpt-4
      temperature: 0.7
      max-tokens: 2500
```

---

## 📊 Prompt GPT-4 Utilisé

Le système envoie un prompt structuré à GPT-4 :

```
Create a comprehensive training curriculum based on this document analysis:

Key Topics: [Project Management, SMART Goals, ...]
Learning Objectives: [Define projects, Apply SMART method, ...]
Suggested Modules: [Introduction, Planning, Execution, ...]
Difficulty Level: 7.0/10
Industry: General

Generate a detailed curriculum with:
1. A curriculum title
2. A description (2-3 sentences)
3. Total training duration estimate in hours
4. 4-6 detailed training modules, each with:
   - Module title
   - Module description (2 sentences)
   - Duration in minutes
   - Difficulty level (beginner/intermediate/advanced)
   - Number of content items
   - Number of assessments
   - Enhanced content elements (list 3-5 multimedia elements)
   - 3-7 specific learning objectives

Return ONLY valid JSON in this exact format: {...}
```

---

## 🎯 Résultats Attendus

### **Avant (Simulé)**
- Curriculum générique "Health Insurance Brokerage Mastery Program"
- Modules prédéfinis non liés au document
- Contenu statique

### **Après (Réel avec GPT-4)**
- Curriculum personnalisé basé sur le document uploadé
- Modules générés spécifiquement pour les sujets du document
- Objectifs d'apprentissage adaptés
- Éléments multimédia suggérés (vidéos, infographies, scénarios)

---

## 🐛 Troubleshooting

### **Problème : Curriculum toujours mocké**
**Solution** : Vérifiez que le backend a été redémarré après la compilation

### **Problème : Erreur 500 lors de la génération**
**Causes possibles** :
1. Clé OpenAI invalide → Vérifiez `application.yml`
2. Timeout GPT-4 → Augmentez `Duration.ofSeconds(60)` dans `AIService.java`
3. Format JSON invalide → GPT-4 n'a pas retourné le bon format

### **Problème : Génération trop lente**
**Solution** : Normal, GPT-4 prend 5-15 secondes pour générer un curriculum complet

---

## 📈 Améliorations Futures

### **Court Terme**
- [ ] Ajouter un cache pour les curriculums générés
- [ ] Permettre la modification manuelle du curriculum
- [ ] Ajouter des variations de prompt selon l'industrie

### **Moyen Terme**
- [ ] Générer des scripts de vidéo avec GPT-4
- [ ] Créer automatiquement des quiz avec questions détaillées
- [ ] Intégrer ElevenLabs pour les narrations audio

### **Long Terme**
- [ ] Génération de vidéos avec IA (Runway, Synthesia)
- [ ] Création d'infographies automatiques
- [ ] Adaptation du curriculum en temps réel selon la progression

---

## ✅ Checklist de Déploiement

- [x] Méthode `generateCurriculum` ajoutée dans `AIService.java`
- [x] Endpoint `/ai/generate-curriculum` créé dans `AIController.java`
- [x] Interface `Curriculum` créée dans `AIService.ts`
- [x] Méthode `generateCurriculum` ajoutée dans `AIService.ts` (frontend)
- [x] `CurriculumDesigner.tsx` modifié pour utiliser l'API réelle
- [x] Backend recompilé et testé
- [x] Frontend testé avec curriculum réel
- [x] Documentation créée

---

## 🎉 Résultat Final

**Avant** : Curriculum générique non personnalisé
**Après** : Curriculum complet généré par GPT-4, spécifique au contenu uploadé !

🚀 **Le système est maintenant prêt pour la génération intelligente de formations !**

