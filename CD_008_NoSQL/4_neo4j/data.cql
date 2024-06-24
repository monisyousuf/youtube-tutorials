// Create Area nodes for London with custom IDs
MERGE (london_12345:Area {zipcode: '12345', city: 'London'})
MERGE (london_40001:Area {zipcode: '40001', city: 'London'})

// Create Cuisine nodes
MERGE (italian:Cuisine {name: 'Italian'})
MERGE (indian:Cuisine {name: 'Indian'})
MERGE (greek:Cuisine {name: 'Greek'})

// Create Restaurant nodes and connect them to Area and Cuisine
MERGE (osteria_sippi:Restaurant {name: 'Osteria Sippi', location: '12345', rating: 5, address: 'Some Address'})
MERGE (osteria_sippi)-[:LOCATED_IN]->(london_12345)
MERGE (osteria_sippi)-[:COOKS]->(italian)

MERGE (taste_of_india:Restaurant {name: 'Taste of India', location: '12345', rating: 4, address: '221B Baker Street'})
MERGE (taste_of_india)-[:LOCATED_IN]->(london_12345)
MERGE (taste_of_india)-[:COOKS]->(indian)

MERGE (sorella:Restaurant {name: 'Sorella', location: '40001', rating: 5, address: 'Strada Italiano'})
MERGE (sorella)-[:LOCATED_IN]->(london_40001)
MERGE (sorella)-[:COOKS]->(italian)

MERGE (hostaria_farnese:Restaurant {name: 'Hostaria Farnese', location: '12345', rating: 4, address: 'Garfield Street'})
MERGE (hostaria_farnese)-[:LOCATED_IN]->(london_12345)
MERGE (hostaria_farnese)-[:COOKS]->(italian)

// Create Restaurant node for Athens and connect it to Area and Cuisine
MERGE (athens:Restaurant {name: 'Athens', location: '12345', rating: 5, address: 'Some Greek Address'})
MERGE (athens)-[:LOCATED_IN]->(london_12345)
MERGE (athens)-[:COOKS]->(greek)

// Create Dish nodes and connect them to the respective Restaurants
MERGE (pizza_bianca:Dish {name: 'Pizza Bianca', description: 'Pizza Bianca description'})
MERGE (osteria_sippi)-[:SERVES]->(pizza_bianca)

MERGE (pizza_rustica:Dish {name: 'Pizza Rustica', description: 'Pizza Rustica description'})
MERGE (osteria_sippi)-[:SERVES]->(pizza_rustica)

MERGE (spaghetti_cacio_e_pepe:Dish {name: 'Spaghetti Cacio-e-Pepe', description: 'Spaghetti Cacio-e-Pepe description'})
MERGE (osteria_sippi)-[:SERVES]->(spaghetti_cacio_e_pepe)
MERGE (sorella)-[:SERVES]->(spaghetti_cacio_e_pepe)
MERGE (hostaria_farnese)-[:SERVES]->(spaghetti_cacio_e_pepe)

MERGE (palak_paneer:Dish {name: 'Palak Paneer', description: 'Palak Paneer description'})
MERGE (taste_of_india)-[:SERVES]->(palak_paneer)

MERGE (butter_chicken:Dish {name: 'Butter Chicken', description: 'Butter Chicken description'})
MERGE (taste_of_india)-[:SERVES]->(butter_chicken)

MERGE (samosa_chat:Dish {name: 'Samosa Chat', description: 'Samosa Chat description'})
MERGE (taste_of_india)-[:SERVES]->(samosa_chat)

MERGE (spaghetti_aglio_e_olio:Dish {name: 'Spaghetti Aglio-e-olio', description: 'Spaghetti Aglio-e-olio description'})
MERGE (sorella)-[:SERVES]->(spaghetti_aglio_e_olio)

MERGE (penne_arrabiata:Dish {name: 'Pasta Penne Arrabiata', description: 'Pasta Penne Arrabiata description'})
MERGE (sorella)-[:SERVES]->(penne_arrabiata)

MERGE (pizza_margharetta:Dish {name: 'Pizza Margharetta', description: 'Pizza Margharetta description'})
MERGE (hostaria_farnese)-[:SERVES]->(pizza_margharetta)

MERGE (penne_alfredo:Dish {name: 'Pasta Penne Alfredo', description: 'Pasta Penne Alfredo description'})
MERGE (hostaria_farnese)-[:SERVES]->(penne_alfredo)

MERGE (pasta_carbonara:Dish {name: 'Pasta Carbonara', description: 'Pasta Carbonara description'})
MERGE (hostaria_farnese)-[:SERVES]->(pasta_carbonara)

// Create Dish nodes for Athens and connect them to the Restaurant
MERGE (gyros:Dish {name: 'Gyros', description: 'Gyros description'})
MERGE (athens)-[:SERVES]->(gyros)

MERGE (kalamari:Dish {name: 'Kalamari', description: 'Kalamari description'})
MERGE (athens)-[:SERVES]->(kalamari)

MERGE (tzatziki:Dish {name: 'Tzatziki', description: 'Tzatziki description'})
MERGE (athens)-[:SERVES]->(tzatziki)
