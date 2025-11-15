#!/bin/bash

# Database backup script for TalentConnect
# Usage: ./scripts/backup.sh

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_NAME="${DB_NAME:-talentconnect}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"

echo "Creating backup: $BACKUP_FILE"

PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -F c \
  -f "$BACKUP_FILE"

echo "Backup completed: $BACKUP_FILE"

# Optional: Compress backup
if command -v gzip &> /dev/null; then
  gzip "$BACKUP_FILE"
  echo "Backup compressed: ${BACKUP_FILE}.gz"
fi

# Optional: Upload to S3 (uncomment and configure)
# aws s3 cp "$BACKUP_FILE" s3://your-backup-bucket/backups/

# Optional: Clean old backups (keep last 30 days)
find "$BACKUP_DIR" -name "backup_*.sql*" -mtime +30 -delete

echo "Backup process completed"

