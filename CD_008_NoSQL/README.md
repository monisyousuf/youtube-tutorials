# CD_008 | NoSQL

## Pre Requisites
- Make sure docker desktop is installed on your computer. Don't have it? Check [here](https://www.docker.com/products/docker-desktop/)

## Relational Database: Normalized and Denormalized form

### Step#0: Postgres Client
Make sure you have a postgres client of your choice. 
- For mac, pgcli is really good. It can be installed with homebrew: `brew install pgcli`
- For both windows and mac, a GUI based clients can also be used. E.g. [pgAdmin](https://www.pgadmin.org/download/)

### Step#1: Run Postgres
Start a docker container to run postgres. It also initializes the tables and the data as described in the video.

```shell 
docker-compose -f ./1_rdbms/docker-compose-pg.yml up -d --build
```

### Step#2: Connect to the database
Connect to the database using either a command line client (psql or pgcli) OR using a GUI client client like [PgAdmin](https://www.pgadmin.org/download/)

```bash
## MAC
pgcli postgres://postgres_user:postgres_pwd@localhost:5432/user_db

## GUI Client (e.g. pgAdmin) Connection Details
URL: localhost
PORT: 5432
USERNAME: postgres_user
PASSWORD: postgres_pwd
DATABASE: user_db
```

### Step#3: Run Queries
Once connected to the database, run the queries to get the data as described in the video.

```sql
use user_db;
-- Display Normalized data
select * from user_details;
select * from user_addresses;
-- Display Denormalized data
select * from denormalized_user_data;
```

### Step#4: Shut down Postgres
Finally, gracefully shut down postgres docker container.

```shell 
docker-compose -f ./1_rdbms/docker-compose-pg.yml down
```


## NoSQL : Document Based Databases / Document Stores
MongoDB is used as an example. A web-based client to query mongodb ([mongo-express](https://github.com/mongo-express/mongo-express)) is embedded in the setup (steps described later), therefore it is not mandatory to have an external client for MongoDB. However, if you wish to use an external client - [Studio3t](https://studio3t.com/download/) can be used.

### Step#1: Run MongoDB
Start a docker container for MongoDB. It contains the collection and the corresponding document data as described in the video. This also starts a web-based MongoDB client.
```shell
docker-compose -f ./2_mongo_db/docker-compose-mongo.yml up -d --build
```

### Step#2: View Data

1. Open http://localhost:8081/
2. The system will ask for a username and password. `Username = admin, Password = pass`
3. On the top, beside "Mongo Express", select the dropdown for `Database`
4. Select `user_db`
5. Click on the green "View" button.
6. The documents can be clearly seen. Click on any row to see the whole document.

### Optional: Connect with external client
An external client like [Studio3t](https://studio3t.com/download/) can be used to connect to this setup as well.
1. Click on "Connect" -> "New Connection" -> "Manually Configure..."
2. Give your connection a name "e.g. NoSQL Test"
3. In the server tab, set Server to `localhost` and port to `27017`
4. In the Authentication tab, set username as `mongo_user`, password as `mongo_pwd` and Authentication db as `admin`
5. Click Test Connection to test your connection and then click Save.
6. Double click on the newly created connection to connect.
7. On the left panel, the databases can be seen along with the documents and collections inside it.

### Step#3: Shut down MongoDB
Finally, after testing, gracefully shit down the mongodb docker container along with mongo-express web client.

```shell
docker-compose -f ./2_mongo_db/docker-compose-mongo.yml down
```





