-- Creating a denormalized version of tables and data already created
CREATE TABLE denormalized_user_data AS
SELECT
    ud.ID AS user_id,
    ud.name,
    ud.phone_number,
    ud.email,
    ua.house_number,
    ua.street,
    ua.zipcode,
    ua.is_default
FROM
    user_details ud
JOIN
    user_address ua ON ud.ID = ua.user_id;
