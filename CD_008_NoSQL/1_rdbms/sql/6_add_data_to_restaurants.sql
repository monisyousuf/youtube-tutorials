-- Insert data into Area
INSERT INTO Area (zipcode, city) VALUES ('12345', 'London');
INSERT INTO Area (zipcode, city) VALUES ('40001', 'London');

-- Insert data into Cuisine
INSERT INTO Cuisine (name) VALUES ('Italian');
INSERT INTO Cuisine (name) VALUES ('Indian');
INSERT INTO Cuisine (name) VALUES ('Greek');

-- Insert data into Dish
INSERT INTO Dish (name, description) VALUES ('Pizza Bianca', 'Pizza Bianca description');
INSERT INTO Dish (name, description) VALUES ('Pizza Rustica', 'Pizza Rustica description');
INSERT INTO Dish (name, description) VALUES ('Spaghetti Cacio-e-Pepe', 'Spaghetti Cacio-e-Pepe description');
INSERT INTO Dish (name, description) VALUES ('Penne Arrabiata', 'Penne Arrabiata description');
INSERT INTO Dish (name, description) VALUES ('Pasta Carbonara', 'Pasta Carbonara description');
INSERT INTO Dish (name, description) VALUES ('Palak Paneer', 'Palak Paneer description');
INSERT INTO Dish (name, description) VALUES ('Butter Chicken', 'Butter Chicken description');
INSERT INTO Dish (name, description) VALUES ('Samosa Chat', 'Samosa Chat description');
INSERT INTO Dish (name, description) VALUES ('Gyros', 'Gyros description');
INSERT INTO Dish (name, description) VALUES ('Kalamari', 'Kalamari description');
INSERT INTO Dish (name, description) VALUES ('Tzatziki', 'Tzatziki description');
INSERT INTO Dish (name, description) VALUES ('Pizza Margharetta', 'Pizza Margharetta description');

-- Insert data into Restaurant
INSERT INTO Restaurant (name, location, rating, address, area_id)
VALUES ('Osteria Sippi', '12345', 5, '123 Sippi St', (SELECT id FROM Area WHERE zipcode='12345' AND city='London'));

INSERT INTO Restaurant (name, location, rating, address, area_id)
VALUES ('Taste of India', '12345', 4, '221B Baker Street', (SELECT id FROM Area WHERE zipcode='12345' AND city='London'));

INSERT INTO Restaurant (name, location, rating, address, area_id)
VALUES ('Sorella', '40001', 5, 'Strada Italiano', (SELECT id FROM Area WHERE zipcode='40001' AND city='London'));

INSERT INTO Restaurant (name, location, rating, address, area_id)
VALUES ('Hostaria Farnese', '12345', 4, 'Garfield Street', (SELECT id FROM Area WHERE zipcode='12345' AND city='London'));

INSERT INTO Restaurant (name, location, rating, address, area_id)
VALUES ('Athens', '12345', 5, '123 Athens Rd', (SELECT id FROM Area WHERE zipcode='12345' AND city='London'));

-- Insert data into Restaurant_Cuisine
INSERT INTO Restaurant_Cuisine (restaurant_id, cuisine_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Osteria Sippi'), (SELECT id FROM Cuisine WHERE name='Italian'));

INSERT INTO Restaurant_Cuisine (restaurant_id, cuisine_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Taste of India'), (SELECT id FROM Cuisine WHERE name='Indian'));

INSERT INTO Restaurant_Cuisine (restaurant_id, cuisine_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Sorella'), (SELECT id FROM Cuisine WHERE name='Italian'));

INSERT INTO Restaurant_Cuisine (restaurant_id, cuisine_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Hostaria Farnese'), (SELECT id FROM Cuisine WHERE name='Italian'));

INSERT INTO Restaurant_Cuisine (restaurant_id, cuisine_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Athens'), (SELECT id FROM Cuisine WHERE name='Greek'));

-- Insert data into Restaurant_Dish
INSERT INTO Restaurant_Dish (restaurant_id, dish_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Osteria Sippi'), (SELECT id FROM Dish WHERE name='Pizza Bianca'));
INSERT INTO Restaurant_Dish (restaurant_id, dish_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Osteria Sippi'), (SELECT id FROM Dish WHERE name='Pizza Rustica'));
INSERT INTO Restaurant_Dish (restaurant_id, dish_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Osteria Sippi'), (SELECT id FROM Dish WHERE name='Spaghetti Cacio-e-Pepe'));

INSERT INTO Restaurant_Dish (restaurant_id, dish_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Taste of India'), (SELECT id FROM Dish WHERE name='Palak Paneer'));
INSERT INTO Restaurant_Dish (restaurant_id, dish_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Taste of India'), (SELECT id FROM Dish WHERE name='Butter Chicken'));
INSERT INTO Restaurant_Dish (restaurant_id, dish_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Taste of India'), (SELECT id FROM Dish WHERE name='Samosa Chat'));

INSERT INTO Restaurant_Dish (restaurant_id, dish_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Sorella'), (SELECT id FROM Dish WHERE name='Spaghetti Cacio-e-Pepe'));
INSERT INTO Restaurant_Dish (restaurant_id, dish_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Sorella'), (SELECT id FROM Dish WHERE name='Penne Arrabiata'));

INSERT INTO Restaurant_Dish (restaurant_id, dish_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Hostaria Farnese'), (SELECT id FROM Dish WHERE name='Spaghetti Cacio-e-Pepe'));
INSERT INTO Restaurant_Dish (restaurant_id, dish_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Hostaria Farnese'), (SELECT id FROM Dish WHERE name='Pizza Margharetta'));
INSERT INTO Restaurant_Dish (restaurant_id, dish_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Hostaria Farnese'), (SELECT id FROM Dish WHERE name='Pasta Carbonara'));

INSERT INTO Restaurant_Dish (restaurant_id, dish_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Athens'), (SELECT id FROM Dish WHERE name='Gyros'));
INSERT INTO Restaurant_Dish (restaurant_id, dish_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Athens'), (SELECT id FROM Dish WHERE name='Kalamari'));
INSERT INTO Restaurant_Dish (restaurant_id, dish_id)
VALUES ((SELECT id FROM Restaurant WHERE name='Athens'), (SELECT id FROM Dish WHERE name='Tzatziki'));
