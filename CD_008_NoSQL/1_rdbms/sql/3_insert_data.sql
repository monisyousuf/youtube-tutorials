-- Insert data into user_details table
INSERT INTO user_details (name, phone_number, email)
VALUES
  ('Harry Potter', '+1234567890', 'harry.potter@coddiction.io'),
  ('Sherlock Holmes', '+9876543210', 'sherlock.holmes@coddiction.io'),
  ('Barry Allen', '+1122334455', 'barry.allen@coddiction.io');

-- Insert data into user_address table
-- Addresses for Harry Potter
INSERT INTO user_address (house_number, street, zipcode, user_id)
VALUES
  ('4 Privet Drive', 'Little Whinging', '12345', (SELECT ID FROM user_details WHERE name = 'Harry Potter')),
  ('Hogwarts Castle', 'Hogsmeade', '54321', (SELECT ID FROM user_details WHERE name = 'Harry Potter'));

-- Addresses for Sherlock Holmes
INSERT INTO user_address (house_number, street, zipcode, user_id)
VALUES
  ('221B Baker Street', 'London', '98765', (SELECT ID FROM user_details WHERE name = 'Sherlock Holmes')),
  ('3 Abbey Grange', 'Woolwich', '13579', (SELECT ID FROM user_details WHERE name = 'Sherlock Holmes')),
  ('7 Popes Court, Fleet Street', 'London', '24680', (SELECT ID FROM user_details WHERE name = 'Sherlock Holmes'));

-- Addresses for Barry Allen (Flash)
INSERT INTO user_address (house_number, street, zipcode, user_id)
VALUES
  ('123 Main Street', 'Central City', '67890', (SELECT ID FROM user_details WHERE name = 'Barry Allen')),
  ('1201 Cresthill Avenue', 'Central City', '54321', (SELECT ID FROM user_details WHERE name = 'Barry Allen')),
  ('S.T.A.R. Labs', 'Central City', '98765', (SELECT ID FROM user_details WHERE name = 'Barry Allen'));
