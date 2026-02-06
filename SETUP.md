# 📋 Setup Guide - Configuration Complète

Guide complet pour configurer l'environnement de développement.

## 1️⃣ Prérequis Système

### Logiciels Requis
- **Node.js** 18+ - [Télécharger](https://nodejs.org)
- **PostgreSQL** 12+ - [Télécharger](https://www.postgresql.org)
- **Git** - [Télécharger](https://git-scm.com)
- **VS Code** (optionnel) - [Télécharger](https://code.visualstudio.com)

### Vérifier les Installations

```bash
node -v        # v18.0.0 ou plus
npm -v         # v9.0.0 ou plus
psql -v        # psql (PostgreSQL) 12.0 ou plus
git -v         # git version 2.30.0 ou plus
```

## 2️⃣ Backend Setup

### Étape 1 : Installer les Dépendances

```bash
cd backend
npm install
```

### Étape 2 : Configurer PostgreSQL

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE toa_mairie_db;
\q
```

### Étape 3 : Configuration des Variables d'Environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos paramètres
```

Configuration minimale:
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=toa_mairie_db
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=dev_secret_key_change_in_production
PORT=5000
```

### Étape 4 : Initialiser la Base de Données

```bash
npm run migrate
npm run seed
```

### Étape 5 : Démarrer le Backend

```bash
npm run dev
```

Server sur `http://localhost:5000`

## 3️⃣ Frontend Setup

### Étape 1 : Installer les Dépendances

```bash
cd ../frontend
npm install
```

### Étape 2 : Configuration

```bash
cp .env.example .env
```

### Étape 3 : Démarrer

```bash
npm start
```

Frontend sur `http://localhost:3000`

## 4️⃣ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/refresh` - Refresh token  
- `POST /api/auth/change-password` - Change password

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project (requires DIRECTOR/SERVICE_HEAD/ADMIN)
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project (ADMIN only)

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task (mark complete, change status)
- `DELETE /api/tasks/:id` - Delete task

### Offline Synchronization
- `POST /api/sync/push` - Push local changes to server
- `POST /api/sync/pull` - Pull server updates to device
- `POST /api/sync/full` - Full sync (push + pull)
- `GET /api/sync/logs` - Get sync history
- `POST /api/sync/resolve-conflict` - Resolve sync conflicts

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents` - Upload document
- `GET /api/documents/:id` - Download document
- `DELETE /api/documents/:id` - Delete document

### Messaging
- `GET /api/messaging` - Get messages
- `POST /api/messaging` - Send message
- `PUT /api/messaging/:id` - Mark as read

### Forms
- `GET /api/forms` - List forms
- `POST /api/forms` - Create form (ADMIN/DIRECTOR)
- `POST /api/forms/:id/submit` - Submit form response

### Dashboard
- `GET /api/dashboard` - Get dashboard data (role-specific)

## User Roles and Permissions

### ADMIN
- Full access to all modules
- Can create, update, delete any resource
- Can manage users

### DIRECTOR
- Manage projects in their department
- View all tasks
- Create forms for citizens
- Access communication module

### SERVICE_HEAD
- Manage teams within service
- Assign and track tasks
- Submit data from field teams

### SECRETARY
- Manage documents and calendar
- Schedule meetings
- Coordinate communication
- Sync offline data

### FIELD_AGENT
- Submit forms and data
- Sync offline (devices)
- Update task status
- Report issues

### COMMUNICATION
- Manage citizen requests
- Track response times
- Monitor satisfaction
- Create campaigns

## Testing

Run tests
```bash
npm test
```

Run tests with coverage
```bash
npm test -- --coverage
```

## Database

### Migrations
Migrations use Sequelize `sync({ alter: true })` for development.

For production, implement proper migration files or scripts.

### Schema

**Users**
- id (UUID)
- email (unique)
- firstName, lastName
- password (hashed)
- role (ENUM)
- department
- isActive
- lastLogin

**Projects**
- id (UUID)
- title
- description
- status (PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED)
- startDate, endDate
- budget
- priority (LOW, MEDIUM, HIGH, CRITICAL)
- progress (0-100)
- createdBy, assignedTo (FK Users)

**Tasks**
- id (UUID)
- title, description
- status (TODO, IN_PROGRESS, REVIEW, COMPLETED, BLOCKED)
- projectId (FK Projects)
- assignedTo, createdBy (FK Users)
- priority
- dueDate, startDate, completedAt  
- estimatedHours, actualHours
- tags (array)

**Forms**
- id (UUID)
- title, description
- fields (JSON)
- status (ACTIVE, INACTIVE)
- createdBy (FK Users)

**FormSubmissions**
- id (UUID)
- formId (FK Forms)
- data (JSON)
- submittedBy (FK Users)
- status

**Documents**
- id (UUID)
- title
- path (file storage)
- type (enum: PDF, XLSX, IMAGE, etc.)
- createdBy (FK Users)
- department

**Messages**
- id (UUID)
- subject, content
- senderId, receiverId (FK Users)
- isRead
- createdAt

**SyncLogs**
- id (UUID)
- userId (FK Users)
- deviceId
- deviceType (MOBILE, TABLET, WEB)
- syncType (PUSH, PULL, FULL)
- status (PENDING, IN_PROGRESS, SUCCESS, FAILED)
- recordsCount, conflictCount
- lastSyncAt

## Deployment

### Local Testing
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t toa-mairie-backend .
docker run -p 5000:5000 --env-file .env toa-mairie-backend
```

### Environment Best Practices
- Use strong JWT_SECRET in production
- Enable SSL/TLS for database connections
- Set NODE_ENV=production
- Implement proper logging and monitoring
- Use environment variables for all secrets
- Enable database backups

## Troubleshooting

### Database Connection Failed
- Check DB_HOST, DB_PORT in .env
- Verify PostgreSQL is running
- Check DB credentials

### JWT Token Issues
- Verify JWT_SECRET matches across environments
- Check token expiry time
- Ensure Authorization header format: `Bearer <token>`

### Sync Failures
- Check device connectivity
- Verify deviceId is unique
- Check sync logs for detailed error messages

## Support

For issues and questions, contact the development team.
