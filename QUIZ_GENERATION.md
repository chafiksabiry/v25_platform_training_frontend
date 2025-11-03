# 🎯 Génération Automatique de Quiz par IA

## 📋 Vue d'ensemble

Le système inclut maintenant deux fonctionnalités puissantes de génération de quiz par IA :
1. **Génération de quiz par module** - Créez automatiquement des quiz basés sur le contenu de chaque module
2. **Examen final complet** - Générez un examen final couvrant tous les modules du training

## ✨ Fonctionnalités

### 1. Génération de Quiz par Module

#### Accès
- Naviguez vers un module dans le `ModuleEditor`
- Cliquez sur "Manage Quizzes"
- Cliquez sur le bouton "Générer avec l'IA" 

#### Options configurables
- **Nombre de questions** : 3-20 questions (défaut: 5)
- **Difficulté** : Facile, Moyen, Difficile
- **Types de questions** :
  - ✅ Choix multiples (4 options)
  - ✅ Vrai/Faux
  - ✅ Réponse courte
- **Score de passage** : 0-100% (défaut: 70%)
- **Temps limite** : 5-120 minutes (défaut: 15 min)

#### Processus
1. L'IA analyse le contenu du module (titre, description, sections)
2. Génère des questions pertinentes avec :
   - Question claire et spécifique
   - Options de réponse (pour choix multiples)
   - Réponse correcte
   - Explication détaillée
   - Points attribués selon la difficulté
3. Le quiz est créé automatiquement et prêt à l'emploi

### 2. Examen Final

#### Accès
- Dans le `ModuleEditor`, cliquez sur le bouton "Examen Final" (🏆)

#### Caractéristiques
- Couvre **TOUS les modules** du training
- Distribution équilibrée des questions entre les modules
- Mix de difficultés : 30% facile, 50% moyen, 20% difficile
- Types de questions variés

#### Options configurables
- **Nombre de questions** : 10-50 questions (recommandé: 15-25)
- **Score de passage** : Défaut 80% (recommandé: 75-85%)
- **Temps limite** : 15-180 minutes (recommandé: 45-90 min)
- **Tentatives** : Maximum 2 tentatives

#### Particularités de l'examen final
- ❌ Pas de réponses correctes affichées immédiatement
- ❌ Pas d'explications avant la réussite
- ✅ Questions mélangées aléatoirement
- ✅ Options mélangées aléatoirement
- ✅ Révision autorisée

## 🔧 Configuration Backend

### Prérequis
L'API OpenAI doit être configurée dans le backend :

```properties
# application.properties
app.ai.openai.api-key=sk-your-openai-api-key
app.ai.openai.model=gpt-4o-mini
```

### Endpoints API

#### Générer un quiz pour un module
```http
POST /manual-trainings/ai/generate-quiz
Content-Type: application/json

{
  "moduleContent": {
    "title": "Module Title",
    "description": "Module Description",
    "sections": [...]
  },
  "numberOfQuestions": 5,
  "difficulty": "medium",
  "questionTypes": {
    "multipleChoice": true,
    "trueFalse": true,
    "shortAnswer": false
  },
  "moduleId": "module-id",
  "trainingId": "training-id"
}
```

#### Générer un examen final
```http
POST /manual-trainings/ai/generate-final-exam
Content-Type: application/json

{
  "trainingId": "training-id",
  "numberOfQuestions": 20
}
```

## 🎨 Interface Utilisateur

### Génération de Quiz par Module

Le composant `AIQuizGenerator` offre :
- Interface modale élégante avec gradient violet/bleu
- Configuration intuitive avec validation
- Barre de progression animée
- Aperçu des questions générées
- Messages d'erreur clairs

### Examen Final

Le composant `FinalExamGenerator` offre :
- Interface modale premium avec gradient ambre/orange
- Badge d'examen final (🏆)
- Résumé détaillé de l'examen
- Informations sur la couverture des modules

## 📊 Format des Questions

### Choix Multiple
```json
{
  "id": "q1",
  "question": "Quelle est la question?",
  "type": "multiple-choice",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Explication de la réponse correcte",
  "points": 1
}
```

### Vrai/Faux
```json
{
  "id": "q2",
  "question": "Cette affirmation est-elle vraie?",
  "type": "true-false",
  "options": ["True", "False"],
  "correctAnswer": 0,
  "explanation": "Explication",
  "points": 1
}
```

### Réponse Courte
```json
{
  "id": "q3",
  "question": "Quelle est la réponse?",
  "type": "short-answer",
  "correctAnswer": "La réponse attendue",
  "explanation": "Explication",
  "points": 2
}
```

## 🚀 Utilisation

### Pour les Créateurs de Training

1. **Créer un training** avec plusieurs modules et sections
2. **Pour chaque module** :
   - Ajoutez du contenu (vidéos, documents, etc.)
   - Cliquez sur "Manage Quizzes" → "Générer avec l'IA"
   - Configurez les paramètres
   - Générez le quiz
   - Révisez et modifiez si nécessaire

3. **Créer l'examen final** :
   - Une fois tous les modules complétés
   - Cliquez sur "Examen Final"
   - Configurez les paramètres de l'examen
   - Générez l'examen
   - L'examen sera disponible pour tous les apprenants

### Pour les Apprenants

1. Complétez les modules dans l'ordre
2. Passez les quiz de fin de module
3. Une fois tous les modules terminés, passez l'examen final
4. Obtenez votre certification après avoir réussi l'examen final

## 🔍 Dépannage

### Erreur : "AI service is not available"
- Vérifiez que la clé API OpenAI est configurée
- Vérifiez la connectivité internet
- Consultez les logs du backend

### Erreur : "No modules found for this training"
- Assurez-vous que le training contient au moins un module
- Vérifiez que les modules sont sauvegardés correctement

### Questions générées non pertinentes
- Ajoutez plus de contenu dans les sections
- Enrichissez les descriptions des modules
- Ajustez le niveau de difficulté

## 📝 Notes Importantes

1. **Coût** : La génération de quiz utilise l'API OpenAI (payante)
2. **Qualité** : La qualité des questions dépend de la qualité du contenu des modules
3. **Révision** : Toujours réviser les questions générées avant de publier
4. **Personnalisation** : Les questions peuvent être éditées manuellement après génération

## 🔮 Améliorations Futures

- [ ] Support de questions à choix multiples (plusieurs réponses correctes)
- [ ] Génération d'images pour les questions
- [ ] Analyse de la difficulté des questions
- [ ] Banque de questions réutilisables
- [ ] Statistiques de performance par question
- [ ] Adaptation de la difficulté en temps réel

## 🤝 Support

Pour toute question ou problème :
1. Consultez la documentation
2. Vérifiez les logs du backend
3. Contactez l'équipe de support

