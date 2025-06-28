docker exec -i replica_one \
    psql -h replica_one -U app_user -d mydb -f ../sql/02_read_data.sql