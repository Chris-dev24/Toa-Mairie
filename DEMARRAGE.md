# 🚀 Guide de démarrage - Toa Mairie App

## 📋 Table des matières
1. [Démarrage rapide sur votre ordinateur](#démarrage-rapide)
2. [Démarrage de l'application (développement)](#démarrage-de-lapplication)
3. [Dépannage](#dépannage)
4. [Identifiants de démonstration](#identifiants-de-démonstration)

---

## 🖥️ Démarrage rapide

### 1️⃣ Cloner le repository

```bash
git clone https://github.com/Chris-dev24/Toa-Mairie.git
cd Toa-Mairie
```

### 2️⃣ Installer les dépendances

**Backend:**
```bash
cd backend
npm install
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### 3️⃣ Configurer les variables d'environnement

**Backend (`backend/.env`):**
```
PORT=5000
NODE_ENV=development
LOG_LEVEL=debug
DB_HOST=localhost
DB_PORT=5432
DB_NAME=toa_mairie_db
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

**Frontend (`frontend/.env`):**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## ⚡ Démarrage de l'application

### Option 1: Deux terminaux séparés (Recommandé)

**Terminal 1 - Backend:**
```bash
cd /workspaces/Toa-Mairie/backend
npm start
```
✅ Vous devriez voir: `Server running on port 5000`

**Terminal 2 - Frontend:**
```bash
cd /workspaces/Toa-Mairie/frontend
npm start
```
✅ L'application s'ouvrira automatiquement sur `http://localhost:3000`

### Option 2: Avec les scripts fournis

```bash
# À partir du répertoire racine
# Terminal 1
npm run backend:dev

# Terminal 2
npm run frontend:dev
```

### Option 3: Mode production (Docker)

```bash
docker-compose up
```
✅ L'application sera accessible sur `http://localhost`

---

## 📲 Identifiants de démonstration

### Admin
- **Email:** `admin@mairie.mg`
- **Mot de passe:** `Admin@123`

### Agent de terrain
- **Email:** `agent@mairie.mg`
- **Mot de passe:** `Agent@123`

### Chef de service
- **Email:** `chief@mairie.mg`
- **Mot de passe:** `Chief@123`

---

## 🔧 Dépannage

### ❌ Problème: "Port 5000 already in use"

**Solution:**
```bash
# Trouver le processus utilisant le port
lsof -i :5000

# Arrêter le processus
kill -9 <PID>

# Ou changer le port dans backend/.env
PORT=5001
```

### ❌ Problème: "Cannot find module..."

**Solution:**
```bash
# Réinstaller les dépendances
cd backend
rm -rf node_modules package-lock.json
npm install
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### ❌ Problème: "CORS error"

**Solution:**
1. Vérifier que le backend tourne sur `http://localhost:5000`
2. Vérifier le frontend sur `http://localhost:3000`
3. Vérifier le fichier `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### ❌ Problème: Database error

**Solution:**
```bash
# Supprimer la base de données SQLite
rm backend/toa_mairie.db

# Redémarrer le backend (créera une nouvelle DB)
cd backend
npm start
```

### ❌ Problème: "npm start" lance le mauvais projet

**Solution:**
```bash
# Assurez-vous d'être dans le bon répertoire
pwd  # Vérifiez votre localisation

# Pour le backend
cd /chemin/complet/vers/Toa-Mairie/backend
npm start

# Pour le frontend
cd /chemin/complet/vers/Toa-Mairie/frontend
npm start
```

---

## 📊 Architecture

```
Toa-Mairie/
├── backend/          # API Node.js/Express
│   ├── src/
│   │   ├── routes/   # Routes API
│   │   ├── models/   # Modèles Sequelize
│   │   ├── controllers/
│   │   └── middleware/
│   └── package.json
├── frontend/         # React App
│   ├── src/
│   │   ├── pages/    # Pages React
│   │   ├── components/
│   │   ├── services/ # API client
│   │   └── hooks/
│   └── package.json
└── docker-compose.yml
```

---

## 🌐 URLs importantes

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:5000/api | 5000 |
| Health Check | http://localhost:5000/health | 5000 |

---

## 📚 Commandes utiles

```bash
# Backend
npm start          # Démarrer le serveur
npm run dev        # Démarrer avec nodemon
npm test           # Lancer les tests
npm run migrate    # Exécuter les migrations
npm run seed       # Seeder la base de données

# Frontend
npm start          # Démarrer le serveur de développement
npm run build      # Builder pour la production
npm test           # Lancer les tests
npm run eject      # Configuration avancée (irréversible!)
```

---

## ✅ Vérification de démarrage

Quand l'application est prête, vous devriez voir:

✅ **Backend:** `Server running on port 5000`
✅ **Frontend:** Page de connexion sur `http://localhost:3000`
✅ Les deux se connectent correctement

Si vous voyez des erreurs, consultez la section [Dépannage](#dépannage) ci-dessus.

---

## 💡 Conseil: Raccourcis VS Code

Ajoutez ces scripts à votre `package.json` racine pour un lancement facile:

```json
{
  "scripts": {
    "backend:dev": "cd backend && npm start",
    "frontend:dev": "cd frontend && npm start",
    "backend:install": "cd backend && npm install",
    "frontend:install": "cd frontend && npm install"
  }
}
```

Puis lancez simplement:
```bash
npm run backend:dev  # Terminal 1
npm run frontend:dev # Terminal 2
```

---

**Besoin d'aide?** Consultez:
- [README.md](README.md) - Vue d'ensemble du projet
- [SETUP.md](SETUP.md) - Configuration détaillée
- [RUNNING.md](RUNNING.md) - Instructions de lancement avancées

**Dernière mise à jour:** 16 avril 2026
