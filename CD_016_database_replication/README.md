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

## Testing
How to test different replication strategies?
A basic test to see if replication is fundamentally working, is to write something to the primary and check if it is updated on the read replicas.

### 1. Basic Test
1. Start the app: `./app/start.sh` if not started already (see QuickStart)
2. Select `1` to write something to the primary.
3. The system will ask you to enter some text.
4. Enter any text as you wish (e.g. `test1`)
5. The system will write this data to the primary and will display the written data.
6. The system will revent back to the main menu, select the option to read from a replica
7. Your data should reflect in both the replicas

### 2. Synchronous Replication
The system, by default is set to fully synchronous replication. The basic test discussed before should work as all the replicas will be healthy. To test the fully synchronous mode, we can pause a replica (let's say replica two) and try to write something to the primary. Since the primary will wait for acknowledgements from both the replicas, and the second replica is not healthy, the system will get stuck, waiting indefinitely for the `replica_two`. In such a case, manual termination will be needed.

1. Open two terminals
2. In Terminal 1, Start the app: `./app/start.sh`
3. In Terminal 2, stop one of the read replica `docker stop replica_two`
4. From Terminal 1, select Option `1` (Write to PRIMARY)
5. The system will ask you to enter some text.
6. Enter any text as you wish (e.g. `test2`)
7. On pressing ENTER, the prompt will be "stuck" waiting for ACK from the REPLICA_TWO
8. In Terminal 2, start the read replica `docker start replica_two`
9. In Terminal 1, the prompt will be unblocked after successful start of replica_two and after recieving its ACK.

### 3. Semi-Synchronous Replication
In order to switch to semi-synchronous replication, a minor configuration change needs to be done in [primary_db/postgresql.conf](./primary_db/postgresql.conf).

1. Update the postgresql.conf to comment the two lines marked under synchronous commit and uncomment the semi-synchronous commit. The config should look like this:

    ```shell
    synchronous_commit = on
    synchronous_standby_names = 'ANY 1 (replica_one,replica_two)'
    ```

2. Shut down the docker compose including volumes to flush all the configuration

    ```shell
    docker compose down -v
    ```

3. Rebuild all servers

    ```shell
    docker compose up --build -d
    ```

4. Once started, open two terminals
5. In Terminal 1, run the app by `./app/start.sh`
6. In Terminal 2, stop the replica_two by `docker stop replica_two`
7. From Terminal 1, select Option `1` to write something to PRIMARY replica
8. The system will ask for an input. Enter some data (e.g. `test 1 - semi sync`) and press ENTER.
9. Once written, the system will return to the menu
10. Select Option `2` to read data from `replica_one`
11. This should return the recently written data, meaning one acknowledgement was enough.
12. Now, in Terminal 2, stop the replica_one by `docker stop replica_one`
13. In Terminal 1, select Option `1` to write something to PRIMARY replica (e.g. `test2 - semi sync`)
14. The prompt will hang because all replicas are down and there are no acknowledgements
15. In Terminal 2, start any of the replicas e.g. `docker start replica_one`
16. Once the replica starts and gets the latest LOG, the prompt will resume.

### Asynchronous Replication
In order to switch to asynchronous replication, simply turn the synchronous commit as off and comment the standby names in [primary_db/postgresql.conf](./primary_db/postgresql.conf).

1. Update the postgresql.conf to comment the two lines marked under synchronous commit and semi-synchronous commit. The file contents should look like

    ```shell
    synchronous_commit = off
    ```

2. Shut down the docker compose including volumes to flush all the configuration

    ```shell
    docker compose down -v
    ```

3. Rebuild all servers

    ```shell
    docker compose up --build -d
    ```

4. With the `./app/start.sh`, write some data to primary and it should be written to both the replicas.
5. However, when you stop BOTH the replicas (`docker stop replica_one replica_two`) and then try to write the data to PRIMARY it will be successfully written to primary without waiting for any acknowledgement.
6. When the replicas come back online, they will pull the latest LOG and update themselves.

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