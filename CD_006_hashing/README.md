# CD_006 | Hashing

### Pre-Requisites
In order to run the code/app for hashing on your computer, you need ANY ONE installed on your computer.
1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) **OR**
2. [Nginx](https://nginx.org/en/download.html)

>❗ With Docker Desktop it would be much easier, as you will be able to run most of the code examples in my other videos.

___

## Intro
The hashing demo can be run by ANY of the following methods. Once the app is up and running, it can be viewed 
through your browser at the address -> [http://localhost](http://localhost)


### Method#1: Run With Docker
If you have docker installed on your computer, you can simply use the following command:

1. **Start the app** (this will print a container name)
    ```shell 
    docker-compose up --build -d
   .... some logs ...
   ✔ Network cd_006_hashing_default          Created                                                                                                                                                             0.0s 
   ✔ Container cd_006_hashing-hashing_app-1  Started  
    ```
   
2. **Stop the app**
    ```shell
    docker-compose down
    ```

3. **View Logs**: Copy the container name from the first command and then use it in the following command
    ```shell
    docker logs <container_name>
    #Example
    docker logs cd_006_hashing-hashing_app-1
    ```

---

### Method#2: Nginx
If you have nginx installed on your computer, simply copy all the html, css and javascript files from this directory, 
to the nginx root directory (can be viewed from `nginx.conf`). 
For more details, see the [Nginx docs](https://docs.nginx.com/nginx/admin-guide/basic-functionality/managing-configuration-files/).

Once the files are copied into the root directory, start the server and you should be able to see the app at
[http://localhost](http://localhost)


___

### Method#3: Alternate way with Docker
If you don't want to use `docker-compose`, you can use the build and run commands separately.
1. Build Command
    ```shell
    docker build -f app.Dockerfile -t docker_hashing_image . 
    ```
2. Run Command (Use `CMD+C` or `CTRL+C` to shut down)
    ```shell
    docker run -p 80:80 docker_hashing_image
    ```