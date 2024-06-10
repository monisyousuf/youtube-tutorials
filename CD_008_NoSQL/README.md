# CD_008 | NoSQL

## Pre Requisites
Make sure docker desktop is installed on your computer. Don't have it? Check [here](https://www.docker.com/products/docker-desktop/)

## A. Quick Start

### 1. Start All Databases
The following command will instantiate all the databases contained in the codebase on your local computer. This will
also populate the data in the databases.
```
docker compose up -d --build
```

### 2. Relational Database (Postgres)
The relational database is populated with data as described in the video. It contains data in both versions;
normalised and de-normalised. To test and run some queries, the following steps can be followed.

- #### 2.1 Connect to Database

    The following command opens a command line interface for you to interact with the postgres database. Once logged in,
    the system will allow you to run queries against the database.

    ```shell
    docker exec -it cd_008_postgres psql -d user_db -U postgres_user -w postgres_pwd
    ```

- #### 2.2 Run Queries

    Once connected to the database, run the queries to get the data as described in the video.
    ```sql
    use user_db;
    
    -- Display Normalized data --
    select * from user_details;
    select * from user_address;
    
    -- Display Denormalized data --
    select * from denormalized_user_data;
    ```

### 3. NoSQL: Document Stores (MongoDB)
A mongodb instance with data as described in the video is added to this repository. It contains denormalized data
of users along with their addresses. This mongodb instance can be accessed through command line, through which we can
fetch the data present in the database. 

- #### 3.1 Connect to MongoDB
    This command will connect to mongodb and provide a command line interface to run queries against the data.
    ```shell
    docker exec -it cd_008_mongo mongosh mongodb://localhost/users -u mongo_user -p 'mongo_pwd' --authenticationDatabase admin
    ```

- #### 3.2 Get All Users
    Fetches all the data present in the mongodb for the collections **users**
    ```javascript
    db.users.find();
    ```
  
- #### 3.3 Get a user with ID
    Fetches the user document relative to a particular ID.
    ```javascript
    db.users.find(ObjectId("6666eb769bd64bae84c2d0a9"));
    ```

- #### 3.4 Get a user's default address
  Fetches a user's default address when the user id is present
  ```javascript
  db.users.aggregate([
  {
      "$unwind": "$addresses"
  },
  {
      "$match": {
      "addresses.is_default": true,
      "_id": ObjectId("6666eb769bd64bae84c2d0a9")
      }
  },
  {
      "$replaceRoot": {
      "newRoot": "$addresses"
      }
  }
  ]);
    ```


## B. Run Individual Databases
The quickstart allows you to start all the databases together for convenience. However - if you wish to start any
individual database and play around with it, you can follow the below instructions.

___

### 1. Only Relational DB : Postgres

* ### Start Postgres
  Start a docker container to run postgres. It also initializes the tables and the data as described in the video.
  ```shell 
  docker compose -f ./1_rdbms/docker-compose-pg.yml up -d --build
  ```
  Once postgres starts, the queries can be run against the postgres database as described in the 
[QuickStart](#a-quick-start)/[RelationalDatabase(RDBMS)](#2-relational-database-postgres)

* ### Shut down Postgres
  Finally, gracefully shut down postgres docker container.

  ```shell 
  docker compose -f ./1_rdbms/docker-compose-pg.yml down
  ```
___

### 2. Only MongoDB

* ### 2.1 Start MongoDB
  Start a docker container for ONLY for MongoDB. The data will be pre-populated.
   ```shell
  docker compose -f ./2_mongo_db/docker-compose-mongo.yml up -d --build
  ```
  Once mongodb starts, the queries can be run against the mongodb database as described in the
[QuickStart](#a-quick-start)/[NOSQL: Document Stores](#3-nosql-document-stores-mongodb)
    
* ### 2.2 Shut down MongoDB
  Finally, after testing, gracefully shut down the mongodb docker container.
  ```shell
  docker compose -f ./2_mongo_db/docker-compose-mongo.yml down
  ```

___
       
        
### 4. NoSQL : Graph Based Databases
This section describes the examples of graph based databases using [neo4j](https://neo4j.com/)

### Step#1: Run neo4j
Start a docker container for neo4j which loads the data into the database as described in the video.
```shell
docker compose -f ./4_neo4j/docker-compose-neo4j.yml up -d --build
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

___

## C. Troubleshooting
Getting errors? Try these troubleshooting tips.
___
### Qs. Unable to connect with mongodb
On executing the mongo shell command, 
```
docker exec -it cd_008_mongo mongosh mongodb://localhost/users -u mongo_user -p 'mongo_pwd' --authenticationDatabase admin
```
I am getting the following error
```
Current Mongosh Log ID:	6666f70c4d5e1ddaa0c7c0cd
Connecting to:		mongodb://<credentials>@localhost/users?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin&appName=mongosh+2.1.1
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

### Solution
It might mean that your mongodb is still starting up. Try re-executing the command after a few seconds. If it is still
not working, it means something went wrong with the startup.
Go to Docker Desktop -> Containers -> Mongo Container and check the logs for specific errors.
___

### Qs. No such container: cd_008_xxxx
On running the docker exec commands, I am getting the following error:
```
Error response from daemon: No such container: cd_008_postgres
OR
Error response from daemon: No such container: cd_008_mongo
```

### Solution
1. Go to Docker Desktop -> Containers
2. Make sure that the docker compose has successfully started the container
3. If the container is started, check the name of the container by the following command
    ```
    docker ps
    ```
4. This should yield some information like this:
    ```
    CONTAINER ID   IMAGE              COMMAND                  CREATED         STATUS         PORTS                    NAMES
    8938d0087056   1_rdbms-postgres   "docker-entrypoint.s…"   5 minutes ago   Up 5 minutes   0.0.0.0:5432->5432/tcp   cd_008_postgres
    ```
5. Check the last column viz. **NAMES**
6. If it is different from `cd_008_postgres` for postgres and `cd_008_mongo`, copy this name and replace it in the 
docker exec command as follows:
    ```
    docker exec -it <name of the container found above> <rest of the command>
    ```
___

