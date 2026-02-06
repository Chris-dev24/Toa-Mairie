# Toamasina Mairie - Application de Productivité

## 📋 Vue d'ensemble

Application complète de gestion de productivité pour la Mairie de Toamasina, avec support multiplateforme (web et mobile), authentification hiérarchique, gestion de projets et tâches, formulaires dynamiques avec support offline, et dashboards personnalisés par rôle.

## 🏗️ Architecture

### Backend
- **Framework**: Node.js + Express.js
- **Base de données**: PostgreSQL
- **Authentication**: JWT
- **Real-time**: WebSocket (Socket.io)
- **ORM**: Sequelize

### Frontend
- **Framework**: React.js 18
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client
- **Forms**: Formik + Yup

### Mobile (Future)
- **Framework**: React Native ou Flutter
- **Offline Storage**: SQLite/Realm
- **Sync**: Automatic sync on connection

## 📁 Structure du Projet

```
Toa-Mairie/
├── backend/                    # API Backend
│   ├── src/
│   │   ├── models/            # Sequelize models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Express middleware
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utilities (logger, etc.)
│   │   └── index.js           # Entry point
│   ├── package.json
│   └── .env.example
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── store/             # State management
│   │   ├── App.jsx
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── .env.example
├── mobile/                     # React Native (future)
├── docs/                       # Documentation
└── README.md
```

## 🔑 Fonctionnalités Principales

### 1. Authentification & Rôles
- ✅ Enregistrement et connexion sécurisés
- ✅ JWT avec expiration configurable
- ✅ 6 rôles prédéfinis: Director, Service Head, Secretary, Field Agent, Communication, Admin
- ✅ Permissions basées sur les rôles
- ✅ Audit des actions utilisateurs

### 2. Gestion de Projets & Tâches
- ✅ CRUD complet pour projets
- ✅ Gestion des tâches avec priorités
- ✅ Kanban/Gantt ready (frontend à développer)
- ✅ Suivi du progrès en temps réel
- ✅ Notifications pour deadlines
- ✅ Historique des modifications

### 3. Communication Interne
- ✅ Messagerie sécurisée
- ✅ Conversations privées
- ✅ Support pour groupes (infrastructure)
- ✅ Partage de documents
- ✅ Historique des messages

### 4. Collecte Terrain - Mode Offline
- ✅ Formulaires dynamiques
- ✅ Support photos, géolocalisation, signatures
- ✅ Stockage local (IndexedDB - web)
- ✅ Sync automatique
- ✅ Gestion des conflits
- ✅ Indicateur online/offline

### 5. Dashboards Personnalisés
- ✅ Dashboard Director: Vue globale des projets et KPI
- ✅ Dashboard Service Head: Équipe et tâches
- ✅ Dashboard Field Agent: Tâches assignées et soumissions
- ✅ Dashboard Communication: Statistiques des formulaires
- ✅ Export PDF/Excel (infrastructure)

### 6. Admin & Sécurité
- ✅ Gestion des utilisateurs
- ✅ Gestion des rôles et permissions
- ✅ Chiffrement des données sensibles (bcrypt)
- ✅ Audit logging complet
- ✅ Session management

## 🚀 Installation & Démarrage

### Prérequis
- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

### Backend Setup

```bash
cd backend
cp .env.example .env

# Configurer .env avec les paramètres PostgreSQL
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=toa_mairie_db
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_secret_key

npm install
npm run migrate  # Si migrations existent
npm run seed    # Seed initial data (optionnel)
npm run dev     # Démarrer en mode développement
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env

# .env should contain:
# REACT_APP_API_URL=http://localhost:5000/api
# REACT_APP_SOCKET_URL=http://localhost:5000

npm install
npm start      # Démarre sur http://localhost:3000
```

## 📊 Modèles de Données

### User
- id, email, firstName, lastName, password
- phone, role, department
- isActive, lastLogin, profilePicture
- timestamps

### Project
- id, title, description
- status (PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED)
- startDate, endDate, priority
- createdBy, assignedTo, progress
- budget, department

### Task
- id, title, description
- status (TODO, IN_PROGRESS, REVIEW, COMPLETED, BLOCKED)
- projectId, assignedTo, createdBy
- priority, dueDate, startDate
- estimatedHours, actualHours
- tags

### Form
- id, title, description
- formSchema (JSON structure)
- status, allowOffline
- createdBy

### FormSubmission
- id, formId, submittedBy
- data (JSON), geoLocation
- attachments, isOfflineSubmission
- syncedAt, status

### Document
- id, title, filePath
- fileType, fileSize
- createdBy, department, category
- isPublic, sharedWith

### Message
- id, senderId, receiverId, groupId
- content, attachments
- isRead, readAt

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - S'enregistrer
- `POST /api/auth/login` - Se connecter
- `GET /api/auth/verify` - Vérifier le token
- `POST /api/auth/change-password` - Changer le mot de passe

### Users
- `GET /api/users` - Lister les utilisateurs
- `GET /api/users/:id` - Détail utilisateur
- `PUT /api/users/:id` - Mettre à jour
- `GET /api/users/role/:role` - Utilisateurs par rôle

### Projects
- `GET /api/projects` - Lister
- `POST /api/projects` - Créer
- `GET /api/projects/:id` - Détail
- `PUT /api/projects/:id` - Mettre à jour
- `DELETE /api/projects/:id` - Supprimer

### Tasks
- `GET /api/tasks` - Lister
- `POST /api/tasks` - Créer
- `GET /api/tasks/:id` - Détail
- `PUT /api/tasks/:id` - Mettre à jour
- `DELETE /api/tasks/:id` - Supprimer

### Forms
- `GET /api/forms` - Lister
- `POST /api/forms` - Créer
- `POST /api/forms/:id/submit` - Soumettre
- `GET /api/forms/:id/submissions` - Récupérer les soumissions
- `POST /api/forms/sync/offline` - Synchroniser offline

### Dashboards
- `GET /api/dashboard/director` - Dashboard Director
- `GET /api/dashboard/service-head` - Dashboard Chef de Service
- `GET /api/dashboard/field-agent` - Dashboard Agent Terrain
- `GET /api/dashboard/communication` - Dashboard Communication

## 🔐 Sécurité

- ✅ JWT Authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control (RBAC)
- ✅ SQL injection prevention (Sequelize ORM)
- ✅ XSS protection (React)
- ✅ CORS configured
- ✅ HTTPS ready
- ✅ Audit logging

## 📱 Mode Offline (Frontend Web)

Le frontend supporte le mode offline via:
- **Service Workers**: Cache API pour les ressources
- **IndexedDB**: Stockage des données locales
- **Sync Manager**: Queue des actions pour synchronisation

Implémentation:
```javascript
// Détecté automatiquement par le frontend
// Les formulaires peuvent être remplis offline
// Sync automatique quand la connexion revient
navigator.onLine // Utilisé par le frontend
```

## 🧪 Tests

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 🚢 Déploiement

### Production Backend
```bash
# Build
npm run build

# Avec Docker
docker build -t toa-mairie-backend .
docker run -e DB_HOST=... -p 5000:5000 toa-mairie-backend
```

### Production Frontend
```bash
npm run build
# Servir avec Nginx/Apache ou déployer sur Vercel/Netlify
```

## 📈 Roadmap

### Phase 1 ✅ (Complète)
- Authentication & User Management
- Role-based access control

### Phase 2 🔄 (En cours)
- Project & Task Management
- Frontend UI components

### Phase 3 (Next)
- Internal messaging & document sharing
- Real-time collaboration

### Phase 4 (Next)
- Offline forms & field data collection
- Geo-location & attachments

### Phase 5 (Next)
- Advanced dashboards & KPI
- PDF/Excel export

### Phase 6 (Next)
- Mobile app (React Native)
- Push notifications

### Phase 7 (Next)
- Performance optimization
- Analytics & reporting

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|-------------|
| Frontend | React 18, Tailwind CSS, Zustand |
| Backend | Node.js, Express, PostgreSQL |
| Real-time | Socket.io |
| Auth | JWT, bcrypt |
| Mobile | React Native (future) |
| Offline | IndexedDB, Service Workers |
| DevOps | Docker, PostgreSQL |

## 📝 Notes Importantes

1. **Base de données**: Installer PostgreSQL et créer la DB avant de lancer
2. **Variables d'environnement**: Copier les fichiers .env.example et les configurer
3. **JWT Secret**: À changer en production!
4. **CORS**: Configured pour localhost:3000 par défaut
5. **Mode offline**: Partiellement implémenté, à améliorer dans Phase 4

## 📞 Support & Contribution

Pour toute question ou contribution, consultez la documentation ou ouvrez une issue.

---

**Version**: 1.0.0  
**Dernière mise à jour**: Février 2026  
**Statut**: En développement actif 🚀
