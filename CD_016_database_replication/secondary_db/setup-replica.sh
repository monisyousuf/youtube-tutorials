#!/bin/bash
set -e

DATA_DIR="/var/lib/postgresql/data"
DEFAULT_DB_NAME="postgres"

# Only clone if data directory is empty
if [ -z "$(ls -A $DATA_DIR)" ]; then
  echo "Waiting for primary to be ready..."
  until PGPASSWORD=$REPLICA_PASSWORD pg_isready --dbname="postgresql://$REPLICA_USER:$REPLICA_PASSWORD@$PRIMARY_HOST:5432/$DEFAULT_DB_NAME"; do
    sleep 2
  done
  
  echo "Cloning from primary..."
  PGPASSWORD=$REPLICA_PASSWORD pg_basebackup \
  --dbname="postgresql://$REPLICA_USER:$REPLICA_PASSWORD@$PRIMARY_HOST:5432/$DEFAULT_DB_NAME" \
  -D "$DATA_DIR" -P -R -X stream

  # Permissions Hack, after pulling the conf files, grant permissions explicitly
  echo "Fixing ownership on $DATA_DIR"
  chown -R postgres:postgres "$DATA_DIR"
  chmod 700 "$DATA_DIR"
fi

echo "Starting PostgreSQL replica..."
exec gosu postgres postgres -D "$DATA_DIR"