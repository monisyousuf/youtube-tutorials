# Use the official PostgreSQL image as the base image
FROM postgres:16.1

# Copy the SQL scripts into the container
COPY ./sql /docker-entrypoint-initdb.d/

# Expose the PostgreSQL default port
EXPOSE 5432
