#!/bin/bash

# Production Deployment Script for Belote Backend
# This script handles the complete deployment process including
# pulling code, building images, running migrations, and health checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
PROJECT_DIR="/home/user/belote-backend"
BRANCH="main"

# Functions
log_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

log_success() {
    echo -e "${GREEN}✅ ${NC}$1"
}

log_warning() {
    echo -e "${YELLOW}⚠️  ${NC}$1"
}

log_error() {
    echo -e "${RED}❌ ${NC}$1"
}

# Change to project directory
cd "$PROJECT_DIR" || exit 1

echo ""
log_info "🚀 Starting deployment process..."
echo ""

# Pull latest code
log_info "📦 Pulling latest code from $BRANCH..."
if git pull origin "$BRANCH"; then
    log_success "Code updated successfully"
else
    log_error "Failed to pull latest code"
    exit 1
fi

# Create backup before deployment
log_info "💾 Creating database backup..."
if [ -f "./scripts/backup-db.sh" ]; then
    ./scripts/backup-db.sh
    log_success "Backup completed"
else
    log_warning "Backup script not found, skipping backup"
fi

# Build Docker images
log_info "🐳 Building Docker images..."
if docker-compose -f "$COMPOSE_FILE" build --no-cache; then
    log_success "Docker images built successfully"
else
    log_error "Failed to build Docker images"
    exit 1
fi

# Stop old containers
log_info "🛑 Stopping old containers..."
if docker-compose -f "$COMPOSE_FILE" down; then
    log_success "Old containers stopped"
else
    log_warning "Failed to stop old containers (they might not be running)"
fi

# Start new containers
log_info "▶️  Starting new containers..."
if docker-compose -f "$COMPOSE_FILE" up -d; then
    log_success "New containers started"
else
    log_error "Failed to start new containers"
    exit 1
fi

# Wait for services to be ready
log_info "⏳ Waiting for services to be ready..."
sleep 10

# Run database migrations
log_info "🗄️  Running database migrations..."
if docker-compose -f "$COMPOSE_FILE" exec -T app npm run db:migrate; then
    log_success "Database migrations completed"
else
    log_error "Database migrations failed"
    exit 1
fi

# Health check
log_info "🏥 Performing health check..."
sleep 5

if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log_success "Health check passed"
else
    log_error "Health check failed"
    log_info "Checking container logs..."
    docker-compose -f "$COMPOSE_FILE" logs --tail=50 app
    exit 1
fi

# Display container status
log_info "📊 Container status:"
docker-compose -f "$COMPOSE_FILE" ps

echo ""
log_success "✨ Deployment completed successfully at $(date)"
echo ""

# Show recent logs
log_info "Recent application logs:"
docker-compose -f "$COMPOSE_FILE" logs --tail=20 app

echo ""
log_success "Deployment finished! 🎉"
