# 🚀 Démarrage de l'Application Toa-Mairie

## Prérequis

- Node.js 16+ 
- npm 8+
- PostgreSQL 12+ (ou Docker pour `docker-compose`)
- Git

## Option 1 : Build & Test Complets (Recommandé pour vérifier les erreurs)

Exécutez cette commande à la racine du projet pour installer, tester ET construire :

```bash
chmod +x full-build.sh
./full-build.sh
```

Cela va :
1. ✅ Installer les dépendances backend
2. ✅ Exécuter les tests Jest backend (avec logs détaillés)
3. ✅ Installer les dépendances frontend
4. ✅ Construire le frontend optimisé
5. 📊 Afficher un résumé avec les étapes suivantes

**Logs sauvegardés** :
- `backend-test-output.log` — Résultats des tests
- `frontend-build-output.log` — Logs du build

---

## Option 2 : Commandes Individuelles

### Backend

```bash
# Installation
cd backend
npm install

# Tests
npm test -- --runInBand --forceExit

# Démarrer serveur dev
npm run dev
```

### Frontend

```bash
# Installation
cd frontend
npm install

# Build production
npm run build

# Dev server (avec hot reload)
npm start

# Ou servir production
npx serve -s build
```

---

## Base de Données

### Avec Docker (Recommandé)

```bash
docker-compose up -d
# PostgreSQL accessible sur localhost:5432
# Identifiants : postgres / admin123
```

### Manuellement

```bash
# Créer la base de données
createdb toa_mairie_dev

# Exécuter les migrations
cd backend && node src/migrations/run.js

# Seeder les données par défaut
npm run seed
```

---

## Accéder à l'Application

Une fois tout lancé :

| Service | URL | Notes |
|---------|-----|-------|
| **Frontend** | http://localhost:3000 | App React |
| **Backend API** | http://localhost:5000 | API Express |
| **Health Check** | http://localhost:5000/health | Vérifier backend |
| **Offline Queue** | http://localhost:3000/offline-queue | Page hors-ligne |

---

## Identifiants par Défaut

```
Email: admin@mairie.mg
Password: password123

Autres comptes créés au seed:
- director@mairie.mg
- secretary@mairie.mg
- field_agent@mairie.mg
```

---

## Dépannage

### Erreur: "Cannot find module"
```bash
# Réinstallez les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Port déjà utilisé
```bash
# Vérifier les processus utilisant les ports
lsof -i :3000   # Frontend
lsof -i :5000   # Backend
lsof -i :5432   # PostgreSQL
```

### PostgreSQL ne démarre pas avec Docker
```bash
# Vérifier les logs
docker-compose logs postgres

# Redémarrer
docker-compose down
docker-compose up -d --force-recreate
```

---

## Architecture

```
Toa-Mairie/
├── backend/          # Express.js + Sequelize
├── frontend/         # React 18 + Tailwind
├── docker-compose.yml
├── full-build.sh     # Mega script
└── run-tests.sh      # Tests seulement
```

---

## Documentation

- [QUICKSTART.md](QUICKSTART.md) — 5-minute setup
- [SETUP.md](SETUP.md) — Configuration complète
- [GETTING_STARTED.md](GETTING_STARTED.md) — Guide exhaustif

---

**Besoin d'aide ?** Lancez `full-build.sh` et partagez les logs d'erreur!
