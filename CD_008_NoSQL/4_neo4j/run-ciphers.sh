#!/bin/bash

# Start Neo4j in the background
neo4j start

# Run the CQL queries. If server not ready, sleep 10 seconds before next attempt
until cypher-shell -u neo4j -p password -f /var/lib/neo4j/data.cql
do
  echo "Attempt to seed data in neo4j failed. Waiting for startup..."
  sleep 10
done

echo "Seeding data successful"

# Keep the container running (optional)
tail -f /dev/null