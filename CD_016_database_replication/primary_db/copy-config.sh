#!/bin/bash
#
#   /docker-entrypoint-initdb.d/00-copy-conf.sh
#
# Immediately after initdb, but before Postgres first starts,
# overwrite the fresh pg_hba.conf and postgresql.conf in $PGDATA.

set -e

echo "==> Copying custom postgresql.conf into \$PGDATA"
cp /tmp/postgresql.conf \
   "$PGDATA/postgresql.conf"
chmod 600 "$PGDATA/postgresql.conf"

echo "==> Copying custom pg_hba.conf into \$PGDATA"
cp /tmp/pg_hba.conf \
   "$PGDATA/pg_hba.conf"
chmod 600 "$PGDATA/pg_hba.conf"
