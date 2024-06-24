FROM neo4j:5.14.0-community-bullseye
WORKDIR /var/lib/neo4j/
COPY data.cql ./
COPY run-ciphers.sh ./
RUN chmod +x ./run-ciphers.sh
CMD ["/var/lib/neo4j/run-ciphers.sh"]