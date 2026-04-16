# 📋 Résumé du Démarrage - Toa Mairie Application

## ✅ Application en cours d'exécution

**Date:** 16 avril 2026

### 🌐 URLs d'accès

| Service | URL | Statut |
|---------|-----|--------|
| **Frontend** | http://localhost:3000 | ✅ Running |
| **Backend API** | http://localhost:5000 | ✅ Running |
| **Health Check** | http://localhost:5000/health | ✅ OK |

---

## 🔐 Identifiants de Démonstration

### Compte Administrateur
```
Email:    admin@mairie.mg
Password: Admin@123
Rôle:     Administrateur (Accès complet)
```

### Compte Agent de Terrain
```
Email:    agent@mairie.mg
Password: Agent@123
Rôle:     Agent de terrain (Formulaires, Tâches)
```

### Compte Chef de Service
```
Email:    chief@mairie.mg
Password: Chief@123
Rôle:     Chef de service (Gestion projets)
```

---

## 📚 Documentation Complète

### Pour les prochains démarrages (2 terminaux)

**Terminal 1 - Backend:**
```bash
cd /workspaces/Toa-Mairie/backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd /workspaces/Toa-Mairie/frontend
npm start
```

### Ou utilisez le script automatisé
```bash
cd /workspaces/Toa-Mairie
chmod +x start-app.sh
./start-app.sh
```

---

## 🖥️ Cloner sur votre ordinateur

### Étape 1: Cloner le repository
```bash
git clone https://github.com/Chris-dev24/Toa-Mairie.git
cd Toa-Mairie
```

### Étape 2: Installer les dépendances

**Installer Node.js** (si pas déjà fait)
- Télécharger sur: https://nodejs.org/

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Étape 3: Configuration (.env files)

**backend/.env:**
```env
PORT=5000
NODE_ENV=development
LOG_LEVEL=debug
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

**frontend/.env:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Étape 4: Démarrer l'application

**Méthode 1 - Deux terminaux (Recommandé):**
```bash
# Terminal 1
cd backend
npm start

# Terminal 2 (nouveau terminal)
cd frontend
npm start
```

**Méthode 2 - Avec Docker:**
```bash
docker-compose up
```

**Méthode 3 - Script automatisé:**
```bash
./start-app.sh
```

---

## 🔧 Problèmes Courants & Solutions

### ❌ "Port 5000 already in use"
```bash
# Trouver le processus
lsof -i :5000

# Tuer le processus
kill -9 <PID>
```

### ❌ "Cannot find module"
```bash
# Réinstaller
cd backend
rm -rf node_modules package-lock.json
npm install
```

### ❌ CORS errors
- Vérifiez que `.env` est configuré correctement
- Assurez-vous que le backend tourne sur `http://localhost:5000`
- Assurez-vous que le frontend tourne sur `http://localhost:3000`

### ❌ Database errors
```bash
# Réinitialiser la base de données
rm backend/toa_mairie.db

# Redémarrer le backend
cd backend
npm start
```

---

## 📁 Structure du Projet

```
Toa-Mairie/
├── backend/                 # API Node.js + Express
│   ├── src/
│   │   ├── routes/         # Routes API
│   │   ├── models/         # Modèles Sequelize
│   │   ├── controllers/    # Controllers
│   │   ├── middleware/     # Middleware
│   │   └── utils/
│   ├── package.json
│   └── .env
├── frontend/                # React Application
│   ├── src/
│   │   ├── pages/          # Pages React
│   │   ├── components/     # Composants réutilisables
│   │   ├── services/       # API client
│   │   ├── hooks/          # Custom hooks
│   │   └── store/          # Zustand stores
│   ├── package.json
│   └── .env
├── docs/                    # Documentation
├── docker-compose.yml       # Docker configuration
├── DEMARRAGE.md            # Guide de démarrage (Français)
├── README.md               # Vue d'ensemble
└── package.json            # Scripts utiles
```

---

## 🚀 Fonctionnalités Principales

✅ **Authentification** - Login sécurisé avec JWT
✅ **Gestion de Projets** - Créer, gérer, suivre les projets
✅ **Gestion de Tâches** - Assigner, tracker, compléter les tâches
✅ **Formulaires Hors-ligne** - Soumettre des formulaires offline
✅ **Messagerie** - Communication en temps réel avec WebSocket
✅ **Documents** - Partager et gérer les documents
✅ **Dashboard** - Vue d'ensemble par rôle
✅ **Responsive Design** - Mobile-friendly avec Tailwind CSS

---

## 📞 Technologies Utilisées

### Backend
- Node.js + Express
- Sequelize (ORM)
- SQLite (développement)
- Socket.io (WebSocket)
- JWT (Authentification)
- Winston (Logging)

### Frontend
- React 18
- React Router
- Zustand (State Management)
- Axios (HTTP Client)
- Tailwind CSS (Styling)
- Formik + Yup (Forms)
- Socket.io Client

---

## 📝 Notes importantes

1. **Base de données**: En développement, SQLite est utilisé (`backend/toa_mairie.db`)
2. **Variables d'environnement**: JAMAIS commiter les `.env` dans Git
3. **Secrets**: Changez `JWT_SECRET` en production
4. **Ports**: Frontend sur 3000, Backend sur 5000
5. **CORS**: Configuré pour `http://localhost:3000`

---

## ✨ Prochaines Étapes

- [ ] Terminer les tests unitaires
- [ ] Ajouter plus de rôles utilisateur
- [ ] Configurer un serveur PostgreSQL pour la production
- [ ] Déployer sur un serveur (Heroku, AWS, etc.)
- [ ] Ajouter les paiements en ligne
- [ ] Implémenter les notifications par email

---

## 📞 Support

En cas de problème:
1. Consultez `DEMARRAGE.md` pour les solutions détaillées
2. Vérifiez les logs dans la console
3. Assurez-vous que Node.js v16+ est installé
4. Regénérez les modules: `rm -rf node_modules && npm install`

---

**Version:** 1.0.0  
**Dernière mise à jour:** 16 avril 2026  
**Status:** ✅ En cours d'exécution
