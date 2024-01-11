# CD_008 | NoSQL

## Pre Requisites
- Make sure docker desktop is installed on your computer. Don't have it? Check [here](https://www.docker.com/products/docker-desktop/)

## 1. Relational Database: Normalized and Denormalized form

### Step#1: Run Postgres
Start a docker container to run postgres. It also initializes the tables and the data as described in the video.

```shell 
docker-compose -f ./1_rdbms/docker-compose-pg.yml up -d --build
```

### Step#2: Connect to the database
When the docker container is able to run successfully, sql commands can be run directly using the docker container using the `psql` shell in the container by using the following command:

```shell
docker exec -it cd_008_postgres psql -d user_db -U postgres_user -w postgres_pwd
```

This should open up a psql shell where you can run the queries from Step#3.

### Step#3: Run Queries
Once connected to the database, run the queries to get the data as described in the video.

```sql
use user_db;
-- Display Normalized data
select * from user_details;
select * from user_address;
-- Display Denormalized data
select * from denormalized_user_data;
```

### Step#4: Shut down Postgres
Finally, gracefully shut down postgres docker container.

```shell 
docker-compose -f ./1_rdbms/docker-compose-pg.yml down
```

### Optional: Connect using a client
Connection to the database (from Step#2) can also be done via different clients. For example:

- pgcli
Assuming, pgcli is installed on mac/linux, the following command can be used to connect to the database.

    ```shell
    pgcli postgres://postgres_user:postgres_pwd@localhost:5432/user_db
    ```

- GUI Based Tools
For all operating systems, GUI clients like [pgAdmin](https://www.pgadmin.org/download/) can be used to connect to the database using the following connection details

    ```bash
    URL: localhost
    PORT: 5432
    USERNAME: postgres_user
    PASSWORD: postgres_pwd
    DATABASE: user_db
    ```

## 2. NoSQL : Document Based Databases / Document Stores
MongoDB is used as an example. A web-based client to query mongodb ([mongo-express](https://github.com/mongo-express/mongo-express)) is also embedded in the setup (steps described later).

### Step#1: Run MongoDB
Start a docker container for MongoDB. It contains the collection and the corresponding document data as described in the video. This also starts a web-based MongoDB client.
```shell
docker-compose -f ./2_mongo_db/docker-compose-mongo.yml up -d --build
```

### Step#2: View Data
Embedded ([mongo-express](https://github.com/mongo-express/mongo-express)) client can be used to query mongodb by following the below steps:

1. Open http://localhost:8081/
2. The system will ask for a username and password. `Username = admin, Password = pass`
3. On the top, beside "Mongo Express", select the dropdown for `Database`
4. Select `user_db`
5. Click on the green "View" button.
6. The documents can be clearly seen. Click on any row to see the whole document.


### Step#3: Shut down MongoDB
Finally, after testing, gracefully shut down the mongodb docker container along with mongo-express web client.

```shell
docker-compose -f ./2_mongo_db/docker-compose-mongo.yml down
```

### Optional: Connect with external client
As an alternative to Step#2, an external client like [Studio3t](https://studio3t.com/download/) can be used to connect to this setup as well.
1. Click on "Connect" -> "New Connection" -> "Manually Configure..."
2. Give your connection a name "e.g. NoSQL Test"
3. In the server tab, set Server to `localhost` and port to `27017`
4. In the Authentication tab, set username as `mongo_user`, password as `mongo_pwd` and Authentication db as `admin`
5. Click Test Connection to test your connection and then click Save.
6. Double click on the newly created connection to connect.
7. On the left panel, the databases can be seen along with the documents and collections inside it.


## 4. NoSQL : Graph Based Databases
This section describes the examples of graph based databases using [neo4j](https://neo4j.com/)

### Step#1: Run neo4j
Start a docker container for neo4j which loads the data into the database as described in the video.
```shell
docker-compose -f ./4_neo4j/docker-compose-neo4j.yml up -d --build
```

### Step#2: Connect to neo4j
The following command can be used to connect to neo4j's cypher-shell, where the neo4j queries can run. (Similar to how a psql client works)

```bash
docker exec -it cd_008_neo4j cypher-shell -u neo4j -p password
```

Example READ Query
```cql
MATCH (harry:User {name: 'Harry Potter'})-[:LIVES_IN]->(address:Address)
RETURN harry, COLLECT(address) AS addresses;
```