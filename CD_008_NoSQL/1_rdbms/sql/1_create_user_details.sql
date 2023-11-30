CREATE TABLE user_details (
    ID UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255),
    phone_number VARCHAR(15) UNIQUE,
    email VARCHAR(255) UNIQUE
);
