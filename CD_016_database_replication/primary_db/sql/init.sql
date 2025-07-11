-- CREATE read_replica role. This will be used for readonly access to the `mydb` database
CREATE ROLE read_replica 
  WITH REPLICATION 
  LOGIN 
  PASSWORD 'read_replica_password';

-- Add extension to enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- CREATE a dummy table with an ID and some data
CREATE TABLE IF NOT EXISTS dummy_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  some_data varchar(255)
);

-- GRANT read-only access to read_replica for the `mydb` database and its tables
GRANT CONNECT ON DATABASE mydb TO read_replica;
GRANT USAGE ON SCHEMA public TO read_replica;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO read_replica;