# CD_007 | Docker (Part 2)

### Pre Requisite:
[Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running on your computer.

___

## Tutorial 2: Docker Compose and Multiple Containers

This tutorial gives an overview on how you can containerize multiple applications together with docker-compose.

### Step#1: Start the application
The application can simply be started by the following command:
```shell
docker-compose up --build
# Application can also be started in detatched mode:
# docker-compose up --build -d
```
- The application will first spawn a container for postgres database. 
- Once it is ready, the application will start the container for backend i.e. a java based springboot application.
- The docker system will wait until the healthcheck of springboot app passes and then will start the frontend application

>❗ The application is configured in such a way that re-running the docker-compose will clean up the data from the database.

### Step#2: Access the application
The application can be accessed via [localhost](http://localhost) from your browser.
This will allow you to:
- **Test Connection**: This tests the connection with backend. If this is successful, it means that both; the backend and 
the database are initialised correctly.
- **Clear**: This will clear the form on the frontend application.
- **Auto Fill**: This will autofill the form with some default values. It can be manually changed by editing the text fields.
- **Submit**: Submits the data present in the form and presents the result whether the request was successful or not.
If the request was not successful, it gives the appropriate status code along with error message(s).
- **View Data**: Allows you to view what data exists in the database in tabular form.

### Step#3: Shut Down Application
1. If you used
   ```shell
   docker-compose up --build
   ```
   then you can press CMD+C or CTRL+C to shut down the containers.

2. If you started the application in **detatched** mode:
   ```shell
   docker-compose up --build -d
   ```
   then you can shut down the containers using:
   ```shell
   docker-compose down
   ```
3. Alternatively, in either case - you can also shut down the containers by pressing the stop ( ⏹ ) button 
in the Docker Desktop app.

___

## Code Structure
The code structure looks like this:

```
CD_007_docker_2
|
|___docker-compose.yml
|
|___backend/
|   |_______<some backend code files>
|   |_______backend.Dockerfile
|
|___frontend/
|   |_______<JS, HTML & CSS files>
|   |_______frontend.Dockerfile
|
|___database/
|   |________1_init_db.sql
|   |________database.Dockerfile
```

At the root, there is the [docker-compose.yml](docker-compose.yml) which uses dockerfiles from 
[backend](backend/backend.Dockerfile), [frontend](frontend/frontend.Dockerfile) and 
[database](database/database.Dockerfile).

Al these dockerfiles contain specific instructions on how to run that particular app.

___

## Additional Testing
You can test each of these applications individually as well.

### 1. Frontend App
Accessible at [localhost](http://localhost) is a simple GUI which can be tested by clicking on the buttons with specific
functions as described in previous sections.

### 2. Backend App
The backend app is accessible at [localhost:8080](http://localhost:8080/ping).
- Its **health-check endpoint** `/ping` can be accessed via [browser](http://localhost:8080/ping) or curl.
   ```shell
   # via CURL
   curl -f http://localhost:8080/ping
   
   # See headers and more details
   curl -v -f http://localhost:8080/ping
   ```

- **Create User**: User can be created by using the `POST /user` endpoint.
    ```shell
    curl -X POST http://localhost:8080/user \
    -H "Content-Type: application/json" \
    -d '{"full_name":"Harry Potter", "email":"harry@potter.com", "phone_number": "4123567890"}'
    ```
  
- **Getting user details**: Similar to before, the user details can be fetched directly via curl or browser as well.
   ```shell
   # If there are no results, the response will be: []
   curl -f http://localhost:8080/user
   ```
  


### 3. Access Postgres Directly

The postgres instance running inside a container can be accessed and SQL queries can be run for testing.

1. Go to docker desktop, expand the running cluster in green. You will see a container for backend-database.
2. Click on it. It will take you to directly to the logs.
3. Go to "Exec" tab to access the terminal. 
4. From here you can run the `psql` commands as described below
5. The following command can help you run SQL queries within the postgres docker container.

    ```shell
    psql backend_db -U user -w
    # IF prompt asks for password - enter "password" without quotes.
    select * from user_entity;
    ```
   