#!/bin/bash

# 🚀 Script de démarrage - Toa Mairie App
# Usage: ./start-app.sh (Linux/Mac) ou start-app.bat (Windows)

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         🚀 Démarrage de Toa Mairie Application 🚀              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé!"
    echo "   Téléchargez-le sur https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Vérifier les répertoires
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Erreur: Veuillez exécuter ce script depuis le répertoire racine du projet"
    exit 1
fi

# Installer les dépendances si nécessaire
echo "📦 Vérification des dépendances..."
if [ ! -d "backend/node_modules" ]; then
    echo "   → Installation dépendances backend..."
    cd backend
    npm install > /dev/null 2>&1
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "   → Installation dépendances frontend..."
    cd frontend
    npm install > /dev/null 2>&1
    cd ..
fi
echo "✅ Dépendances prêtes"
echo ""

# Vérifier les ports
echo "🔍 Vérification des ports..."
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 5000 déjà utilisé"
    read -p "   Continuer quand même? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 3000 déjà utilisé"
    read -p "   Continuer quand même? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo "✅ Ports disponibles"
echo ""

echo "🎯 Démarrage des serveurs..."
echo ""
echo "📝 Backend:   Ouverture Terminal 1"
echo "📝 Frontend:  Ouverture Terminal 2"
echo ""
echo "⏳ Les serveurs démarrent..."
echo ""

# Créer le script de démarrage du backend
cat > /tmp/start_backend.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
cd backend
echo "════════════════════════════════════════════════════════════"
echo "Backend Toa Mairie - Port 5000"
echo "════════════════════════════════════════════════════════════"
npm start
EOF

# Créer le script de démarrage du frontend
cat > /tmp/start_frontend.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
cd frontend
echo "════════════════════════════════════════════════════════════"
echo "Frontend Toa Mairie - Port 3000"
echo "════════════════════════════════════════════════════════════"
npm start
EOF

chmod +x /tmp/start_backend.sh
chmod +x /tmp/start_frontend.sh

# Démarrer les serveurs
cd backend &
BG_PID=$!
npm start &

sleep 2

cd ../frontend &
npm start &

echo ""
echo "✅ Services démarrés!"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Application accessible à:  http://localhost:3000              ║"
echo "║                                                                 ║"
echo "║  Identifiants de démo:                                         ║"
echo "║  • Email: admin@mairie.mg                                      ║"
echo "║  • Mot de passe: Admin@123                                     ║"
echo "║                                                                 ║"
echo "║  Appuyez sur Ctrl+C pour arrêter les serveurs                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

wait
