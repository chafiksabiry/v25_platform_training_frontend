# 🎮 Mode Simulation - Manuel d'Utilisation

## Vue d'ensemble

Le **Mode Simulation** permet aux créateurs de formations de tester leur formation comme s'ils étaient des apprenants, avant de la publier.

## Fonctionnalités

### 📚 Navigation dans les Modules
- Parcourez tous les modules de votre formation dans l'ordre
- Visualisez votre progression globale en temps réel
- Naviguez entre les sections avec les boutons "Previous" et "Next"

### 📖 Types de Contenu Supportés
1. **Texte** : Affichage formaté avec points clés
2. **YouTube** : Vidéos YouTube embarquées
3. **Vidéo** : Lecteur vidéo intégré pour vos vidéos uploadées
4. **Documents** : Liens pour ouvrir les PDFs et documents

### ✅ Système de Quiz
- Quiz automatique à la fin de chaque module
- Questions à choix multiples, vrai/faux, et réponses courtes
- Feedback immédiat avec explications
- Calcul automatique du score
- Critère de passage configurable

### 🏆 Examen Final
- Examen complet à la fin de tous les modules
- Couvre tous les concepts du training
- Score final et feedback détaillé

### ⏱️ Statistiques en Temps Réel
- Chronomètre de session
- Barre de progression globale
- Indicateurs de sections/modules complétés

## Comment Utiliser

### 1. Lancer la Simulation
Dans le `ModuleEditor`, cliquez sur le bouton **"Simulate"** (violet) en haut à droite.

### 2. Naviguer dans la Formation
- **Lire le contenu** : Parcourez chaque section à votre rythme
- **Marquer comme complet** : Cliquez sur "Mark Complete & Continue"
- **Navigation manuelle** : Utilisez les boutons Previous/Next

### 3. Passer les Quiz
- Les quiz apparaissent automatiquement à la fin de chaque module
- Répondez à toutes les questions
- Cliquez sur "Submit Quiz"
- Consultez votre score et les explications
- Cliquez sur "Continue" pour passer au module suivant

### 4. Examen Final
- Apparaît automatiquement après le dernier module
- Couvre tous les modules de la formation
- Score minimum requis configurable (par défaut : 80%)

### 5. Quitter la Simulation
Cliquez sur **"Exit Simulation"** en haut à gauche pour revenir à l'éditeur.

## Points Clés

### ✨ Avantages
- **Test avant publication** : Identifiez les problèmes avant de déployer
- **Expérience réaliste** : Voyez exactement ce que verront vos apprenants
- **Validation des quiz** : Vérifiez que les questions et réponses sont correctes
- **Timing** : Évaluez la durée réelle de la formation

### ⚠️ Limitations Actuelles
- Les scores ne sont pas sauvegardés (simulation temporaire)
- Pas de certificat généré (fonctionnalité réservée aux vrais apprenants)
- Aucune donnée n'est persistée dans la base de données

## Architecture Technique

### Frontend
- **Composant** : `ManualTrainingSimulator.tsx`
- **État local** : Gestion de la progression, des quiz, et du timing
- **Navigation** : Flux séquentiel avec possibilité de retour en arrière

### Backend
- **Endpoints utilisés** :
  - `GET /manual-trainings/{trainingId}/modules` - Charge tous les modules
  - `GET /manual-trainings/modules/{moduleId}/quizzes` - Charge les quiz par module
  - `GET /manual-trainings/{trainingId}/quizzes` - Charge l'examen final

### Types TypeScript
```typescript
interface Module {
  id: string;
  title: string;
  description: string;
  sections?: Section[];
}

interface Section {
  id: string;
  title: string;
  type: 'text' | 'video' | 'document' | 'youtube';
  content?: {
    text?: string;
    youtubeUrl?: string;
    videoUrl?: string;
    documentUrl?: string;
    keyPoints?: string[];
  };
}

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore?: number;
  timeLimit?: number;
}
```

## Améliorations Futures

### 🚀 Prochaines Fonctionnalités
- [ ] Sauvegarde de la progression de simulation
- [ ] Annotations et notes pendant la simulation
- [ ] Mode "Preview" vs "Test complet"
- [ ] Export du rapport de simulation (PDF)
- [ ] Comparaison avant/après modifications
- [ ] Mode "Fast Forward" pour les créateurs pressés
- [ ] Simulation multi-utilisateurs (inviter des collègues à tester)

### 🎯 Optimisations
- [ ] Lazy loading des contenus lourds
- [ ] Cache des modules déjà visités
- [ ] Offline mode pour les tests sans connexion

## Support

Pour toute question ou bug concernant le mode Simulation :
1. Vérifiez que tous vos modules ont du contenu
2. Assurez-vous que les quiz sont générés
3. Consultez la console du navigateur pour les erreurs
4. Contactez l'équipe de développement

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2 Novembre 2025  
**Auteur** : Training Platform Team

