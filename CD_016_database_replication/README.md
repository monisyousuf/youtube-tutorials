# Database Replication
This project aims to demonstrate how database replication works. This setup is composed of a primary and two secondary (readonly) replicas along with a menu-driven app to test things.


## QuickStart

1. Make sure you're in the correct directory

    ```shell
    cd <directory_where_this_repo_is_cloned>/CD_016_database_replication
    ```

2. Start the servers

    ```shell
    docker compose up --build -d
    ```

3. Once the servers are started, run the following

    ```shell
    ./app/start.sh
    ```

4. This will access the menu-driven program from your computer for you to interact with the database. No configuration necessary.


## Setup Explanation
The [docker-compose.yml](docker-compose.yml) defines the following services:

1. [app](./app): A simple python based menu driven program which allows you to interact with the database. This allows you to write some data to the PRIMARY DB and read from the PRIMARY and SECONDARY replicas without writing any SQL queries. It is a demonstration of how data written to the primary is also reflected in the secondary replicas under various circumstances. The underlying sql queries which are executed are present in [app/sql](./app/sql/) directory. **See _Quickstart_ for running the app.** 

2. [primary](./primary_db/): This is the primary (master) database which houses the main configuration. All the writes go here. The database is initialised with the following configuration

    | File    | Description |
    | -------- | ------- |
    | [sql/init.sql](./primary_db/sql/init.sql)  |  Creates a `read_replica` user, creates some base tables and grants access to the `read_replica` on those tables |
    | [postgresql.conf](./primary_db/postgresql.conf) | Main configuration of the postgres instance. Defines replication strategy. Configuration can be easily flipped by uncommenting some lines.  |
    | [pg_hba.conf](./primary_db/pg_hba.conf)    | Defines what type of connections are allowed. More details inside the file.   |
    | [copy-config.sh](./primary_db/copy-config.sh)    | Simple script used by docker to copy the configuration files into correct directories inside the postgres container  |

3. [replica_one](./secondary_db/): The directory [secondary_db](./secondary_db/) contains the configuration for both the read replicas. The script [setup-replica.sh](./secondary_db/setup-replica.sh) does the job of pulling the configuration, tables, users and such from the primary replica. It also assigns a name to each replica (e.g. replica_one and replica_two) so that the PRIMARY knows what "replica_one" or "replica_two" means. This is cruicial for the communication between PRIMARY and the SECONDARY replicas. Once this communication is established, anything written to PRIMARY will reach SECONDARY replicas. Apart from this, there is no additional configuration for read replicas.

3. [replica_two](./secondary_db/): Everything exactly the same as the replica_one, but with a different name. This is controlled via environment variables provided in the docker compose.


> [!IMPORTANT] Most of the environment variables are sourced from the [.env](.env) file. This is acceptable for a local setup, but not optimal for production.