CREATE (harry:User {name: 'Harry Potter', phone_number: '+1234567890', email: 'harry.potter@coddiction.com'})
CREATE (address1:Address {house_number: '4 Privet Drive', street: 'Little Whinging', zipcode: '12345'})
CREATE (address2:Address {house_number: 'Hogwarts Castle', street: 'Hogsmeade', zipcode: '54321'})
CREATE (harry)-[:LIVES_IN]->(address1)
CREATE (harry)-[:LIVES_IN]->(address2);
