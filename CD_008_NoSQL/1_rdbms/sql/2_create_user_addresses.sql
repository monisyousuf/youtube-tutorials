-- Create user_address table
CREATE TABLE user_address (
    ID UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    house_number VARCHAR(50),
    street VARCHAR(255),
    zipcode VARCHAR(25),
    user_id UUID REFERENCES user_details(ID)
);

-- Add foreign key constraint
ALTER TABLE user_address
ADD CONSTRAINT fk_user_details
FOREIGN KEY (user_id) REFERENCES user_details(ID);
