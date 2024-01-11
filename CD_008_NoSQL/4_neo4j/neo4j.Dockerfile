FROM neo4j:5.14.0-community-bullseye
WORKDIR /var/lib/neo4j/
COPY data.cql ./
COPY --chmod=765 run-ciphers.sh ./
ENTRYPOINT [ "./run-ciphers.sh" ]