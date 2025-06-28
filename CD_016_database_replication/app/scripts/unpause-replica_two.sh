docker exec -i replica_two \
    psql -h replica_two -U postgres -d mydb -f ../sql/unpause_replica.sql