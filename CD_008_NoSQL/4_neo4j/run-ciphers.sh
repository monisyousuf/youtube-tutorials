#!/bin/bash
echo "Hello World"
until cypher-shell -u neo4j -p password -f data.cypher
do
  echo "Neo4j warming up. Waiting.."
  sleep 2
done
# cypher-shell -u neo4j -p password -f data.cypher



