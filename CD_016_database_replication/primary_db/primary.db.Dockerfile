FROM postgres:17.5

# 1. Copy custom config somewhere tmp
COPY postgresql.conf pg_hba.conf /tmp/

# 2. COPY SQL Files
COPY sql/ /docker-entrypoint-initdb.d/

# 3. Shell script to copy the config to proper place
COPY copy-config.sh /docker-entrypoint-initdb.d/copy-config.sh

# 4. Fix ownership so Postgres can read them
RUN chown postgres:postgres \
    /tmp/postgresql.conf \
    /tmp/pg_hba.conf \
    /docker-entrypoint-initdb.d/

# 5. Execute permissions to the `copy-config.sh` script
RUN chmod +x /docker-entrypoint-initdb.d/copy-config.sh