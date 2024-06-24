-- Create Area table
CREATE TABLE area (
    id SERIAL PRIMARY KEY,
    zipcode VARCHAR(10),
    city VARCHAR(100),
    CONSTRAINT unique_area UNIQUE (zipcode, city)
);

-- Create Cuisine table
CREATE TABLE cuisine (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

-- Create Dish table
CREATE TABLE dish (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    description TEXT
);

-- Create Restaurant table
CREATE TABLE restaurant (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    location VARCHAR(100),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    address TEXT,
    area_id INTEGER,
    FOREIGN KEY (area_id) REFERENCES Area(id)
);

-- Create relationships
-- Relationship between Restaurant and Cuisine
CREATE TABLE restaurant_cuisine (
    restaurant_id INTEGER,
    cuisine_id INTEGER,
    PRIMARY KEY (restaurant_id, cuisine_id),
    FOREIGN KEY (restaurant_id) REFERENCES Restaurant(id),
    FOREIGN KEY (cuisine_id) REFERENCES Cuisine(id)
);

-- Relationship between Restaurant and Dish
CREATE TABLE restaurant_dish (
    restaurant_id INTEGER,
    dish_id INTEGER,
    PRIMARY KEY (restaurant_id, dish_id),
    FOREIGN KEY (restaurant_id) REFERENCES Restaurant(id),
    FOREIGN KEY (dish_id) REFERENCES Dish(id)
);
