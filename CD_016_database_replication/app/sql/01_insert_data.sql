-- insert_data.sql
-- Inserts a new row with a timestamped payload
INSERT INTO dummy_table (some_data)
VALUES ('data-' || to_char(now(), 'YYYYMMDD-HH24MISS'));