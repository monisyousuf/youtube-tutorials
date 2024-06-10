-- Insert data into user_details table
INSERT INTO user_details (id, name, phone_number, email)
VALUES
  ('0f0365e0-7c5d-4149-9204-09c3199dace3', 'Harry Potter', '+1234567890', 'harry.potter@coddiction.io'),
  ('d45aa268-3d5a-47d2-8e4c-00085a41d53b', 'Sherlock Holmes', '+9876543210', 'sherlock.holmes@coddiction.io'),
  ('ec792961-902f-4aa9-9e14-79b873c8cd3c', 'Barry Allen', '+1122334455', 'barry.allen@coddiction.io');

-- Insert data into user_address table
-- Addresses for Harry Potter
INSERT INTO user_address (house_number, street, zipcode, is_default, user_id)
VALUES
  ('4 Privet Drive', 'Little Whinging', '12345', 'true', (SELECT ID FROM user_details WHERE name = 'Harry Potter')),
  ('Hogwarts Castle', 'Hogsmeade', '54321', 'false', (SELECT ID FROM user_details WHERE name = 'Harry Potter'));

-- Addresses for Sherlock Holmes
INSERT INTO user_address (house_number, street, zipcode, is_default, user_id)
VALUES
  ('221B Baker Street', 'London', '98765', 'true', (SELECT ID FROM user_details WHERE name = 'Sherlock Holmes')),
  ('3 Abbey Grange', 'Woolwich', '13579', 'false', (SELECT ID FROM user_details WHERE name = 'Sherlock Holmes')),
  ('7 Popes Court, Fleet Street', 'London', '24680', 'false', (SELECT ID FROM user_details WHERE name = 'Sherlock Holmes'));

-- Addresses for Barry Allen (Flash)
INSERT INTO user_address (house_number, street, zipcode, is_default, user_id)
VALUES
  ('123 Main Street', 'Central City', '67890', 'true', (SELECT ID FROM user_details WHERE name = 'Barry Allen')),
  ('1201 Cresthill Avenue', 'Central City', '54321', 'false', (SELECT ID FROM user_details WHERE name = 'Barry Allen')),
  ('S.T.A.R. Labs', 'Central City', '98765', 'false', (SELECT ID FROM user_details WHERE name = 'Barry Allen'));
