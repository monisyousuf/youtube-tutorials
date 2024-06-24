#!/bin/bash

# Start Neo4j in the background
neo4j start

# Run the CQL queries. If server not ready, sleep 20 seconds before next attempt
until cypher-shell -f /var/lib/neo4j/data.cql
do
  echo "Attempt to seed data in neo4j failed. Waiting for startup for 10 seconds..."
  sleep 10
done

echo "Seeding data successful"

# Keep the container running (optional)
tail -f /dev/null