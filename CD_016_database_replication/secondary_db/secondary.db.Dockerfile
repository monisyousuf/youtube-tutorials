FROM postgres:17.5

# Create replication setup directory
RUN mkdir -p /docker-replica-init

# Copy replica initialization script
COPY setup-replica.sh /docker-replica-init/
RUN chmod +x /docker-replica-init/setup-replica.sh

# Set custom command (will run before PostgreSQL starts)
CMD ["/docker-replica-init/setup-replica.sh"]