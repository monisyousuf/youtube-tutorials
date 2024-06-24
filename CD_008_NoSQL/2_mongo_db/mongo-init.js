db.getSiblingDB('admin').auth(
    process.env.MONGO_INITDB_ROOT_USERNAME,
    process.env.MONGO_INITDB_ROOT_PASSWORD
);
db.users.insertOne({
	"_id": ObjectId('6666eb769bd64bae84c2d0a8'),
    "name": "Harry Potter",
    "phone_number": "+1234567890",
    "email": "harry.potter@coddiction.com",
    "addresses": [
        {
            "house_number": "4 Privet Drive",
            "street": "Little Whinging",
            "zipcode": "12345",
            "is_default": true
        },
        {
            "house_number": "Hogwarts Castle",
            "street": "Hogsmeade",
            "zipcode": "54321"
        }
    ]
});
db.users.insertOne({
	_id: ObjectId('6666eb769bd64bae84c2d0a9'),
    "name": "Sherlock Holmes",
    "phone_number": "+9876543210",
    "email": "sherlock.holmes@coddiction.com",
    "addresses": [
        {
            "house_number": "221B Baker Street",
            "street": "London",
            "zipcode": "98765",
            "is_default": true
        },
        {
            "house_number": "3 Abbey Grange",
            "street": "Woolwich",
            "zipcode": "13579"
        },
        {
            "house_number": "7 Popes Court, Fleet Street",
            "street": "London",
            "zipcode": "24680"
        }
    ]
});
db.users.insertOne({
	_id: ObjectId('6666eb769bd64bae84c2d0aa'),
    "name": "Barry Allen",
    "phone_number": "+1122334455",
    "email": "barry.allen@coddiction.com",
    "addresses": [
        {
            "house_number": "123 Main Street",
            "street": "Central City",
            "zipcode": "67890",
            "is_default": true
        },
        {
            "house_number": "1201 Cresthill Avenue",
            "street": "Central City",
            "zipcode": "54321"
        },
        {
            "house_number": "S.T.A.R. Labs",
            "street": "Central City",
            "zipcode": "98765"
        }
    ]
});
