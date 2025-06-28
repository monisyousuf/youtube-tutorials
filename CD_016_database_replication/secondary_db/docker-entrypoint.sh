#!/bin/bash
set -e

# If data directory is empty, initialize replica
if [ -z "$(ls -A /var/lib/postgresql/data)" ]; then
    # Wait for primary to be ready
    until pg_isready -h "$PRIMARY_HOST" -U "$REPLICA_USER"; do
        echo "Waiting for primary to start..."
        sleep 2
    done
    
    # Run replica setup as postgres user
    gosu postgres /scripts/setup-replica.sh
fi

# Run original entrypoint
exec /usr/local/bin/docker-entrypoint.sh "$@"