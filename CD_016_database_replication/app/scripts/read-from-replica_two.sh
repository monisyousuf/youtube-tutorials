docker exec -i replica_two \
    psql -h replica_two -U app_user -d mydb -f ../sql/02_read_data.sql