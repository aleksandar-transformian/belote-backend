#!/bin/bash

# Database Backup Script for Belote Backend
# This script creates compressed backups of the PostgreSQL database
# and automatically removes backups older than 7 days

set -e

# Configuration
BACKUP_DIR="/home/user/belote-backend/backups"
DB_CONTAINER="belote_postgres_prod"
DB_NAME="belote_production"
DB_USER="belote_prod_user"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting database backup at $(date)"
echo "Backup file: $BACKUP_FILE"

# Perform backup
if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"; then
    echo "Database dump completed successfully"
else
    echo "ERROR: Database dump failed"
    exit 1
fi

# Compress backup
echo "Compressing backup..."
if gzip "$BACKUP_FILE"; then
    echo "Backup compressed successfully: $BACKUP_FILE.gz"
else
    echo "ERROR: Compression failed"
    exit 1
fi

# Delete backups older than retention period
echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
echo "Backup size: $BACKUP_SIZE"

# List recent backups
echo "Recent backups:"
ls -lh "$BACKUP_DIR" | tail -5

echo "Backup completed successfully at $(date)"
