# Setup Initial Guide

## Backend Setup

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL 12+
- Git

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd Backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run migrations and seeds
```bash
npm run migrate
npm run seed
```

5. Start development server
```bash
npm run dev
```

Server will be running on `http://localhost:5000`

## API Endpoints

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
