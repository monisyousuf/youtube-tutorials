docker exec -i primary \
    psql -U master_user -d mydb < ../sql/01_insert_data.sql