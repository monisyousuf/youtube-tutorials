FROM postgres:16.1
COPY *.sql /docker-entrypoint-initdb.d/