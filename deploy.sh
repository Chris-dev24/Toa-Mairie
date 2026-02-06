#!/bin/bash

# Script de commit et push automatisé pour Toa-Mairie

set -e

echo "🚀 Toamasina Mairie - Commit & Push Script"
echo "==========================================="
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d ".git" ]; then
    echo "❌ Erreur: Pas dans un dépôt git"
    exit 1
fi

# Afficher le statut
echo "📊 Statut Git Actuel:"
git status --short
echo ""

# Ajouter tous les fichiers
echo "📝 Ajout de tous les fichiers..."
git add -A
echo "✓ Fichiers ajoutés"
echo ""

# Message de commit
COMMIT_MESSAGE="feat: Complete setup with all pages, testing, and documentation

- Fix duplicate route definitions in projects.js and tasks.js
- Create environment files (.env) for production-ready setup
- Add comprehensive guides: QUICKSTART.md, SETUP.md, GETTING_STARTED.md
- Create React pages: ProjectsList, FormsList, DocumentsList, Messaging, UserProfile
- Create error handling pages: NotFound (404), Unauthorized (403), ErrorBoundary
- Add React hooks: useProjects, useTasks, useForms, useFetch, useDebounce, usePagination
- Update App.jsx with complete routing for all pages
- Add complete test suite for Projects API (projects.test.js)
- Setup all development and production configurations
- Ready for deployment and team development"

# Créer le commit
echo "💾 Création du commit..."
git commit -m "$COMMIT_MESSAGE" || {
    echo "⚠️  Aucun changement à committer (dépôt à jour)"
    exit 0
}

echo "✓ Commit créé"
echo ""

# Pousser sur GitHub
echo "🚀 Envoi vers GitHub..."
git push origin main -v || {
    echo "❌ Erreur lors du push"
    exit 1
}

echo ""
echo "✅ SUCCESS! Tous les changements ont été pushés sur GitHub"
echo ""
echo "📋 Résumé:"
echo "  ✓ Code committé"
echo "  ✓ Code pushé sur main"
echo ""
echo "🔗 Consultez votre repo: https://github.com/Chris-dev24/Toa-Mairie"
echo ""
