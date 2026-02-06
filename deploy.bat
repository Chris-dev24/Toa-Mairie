@echo off
REM Script de commit et push pour Toamasina Mairie (Windows)

setlocal enabledelayedexpansion

echo.
echo === Toamasina Mairie - Commit & Push Script ===
echo.

REM Vérifier qu'on est dans un dépôt git
if not exist ".git" (
    echo Erreur: Pas dans un depot git
    exit /b 1
)

REM Afficher le statut
echo Status Git Actuel:
git status --short
echo.

REM Ajouter tous les fichiers
echo Ajout de tous les fichiers...
git add -A || (
    echo Erreur lors du git add
    exit /b 1
)
echo Status veri

REM Créer le commit
echo.
echo Creation du commit...
git commit -m "feat: Complete setup with all pages, testing, and documentation" ^
           -m "- Fix duplicate route definitions in projects.js and tasks.js" ^
           -m "- Create environment files (.env) for production-ready setup" ^
           -m "- Add comprehensive guides: QUICKSTART.md, SETUP.md, GETTING_STARTED.md" ^
           -m "- Create React pages: ProjectsList, FormsList, DocumentsList, etc." ^
           -m "- Create error handling components with ErrorBoundary" ^
           -m "- Add custom React hooks for API management" ^
           -m "- Update App.jsx with complete routing" ^
           -m "- Add complete test suite for Projects API" ^
           -m "- All development and production configurations ready" || (
    echo Aucun changement a committer ou erreur de commit
)
echo.

REM Pousser sur GitHub
echo Envoi vers GitHub...
git push origin main -v || (
    echo Erreur lors du push
    exit /b 1
)

echo.
echo === SUCCESS! Tous les changements ont ete pushes ===
echo.
echo Resume:
echo  - Code committe
echo  - Code pousse sur main
echo.
echo Repo: https://github.com/Chris-dev24/Toa-Mairie
echo.
pause
