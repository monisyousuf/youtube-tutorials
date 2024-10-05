# CD_011 | Docker On Production
___

## Pre Requisites
- Make sure docker desktop is installed on your computer. Don't have it? Check [here](https://www.docker.com/products/docker-desktop/).
- Make sure you are in the **CD_011_docker_production** directory when executing the commands
  ```shell
  cd CD_011_docker_production
  ```
- You have a private docker registry (Steps detailed below)
- You have a linux server on a cloud environment (e.g. AWS EC2)

## Getting a Docker Registry
1. Go to [hub.docker.com](https://hub.docker.com)
2. Click on "Sign Up" to create a new account.
3. Choose a **username**. This will be used as your **namespace**
4. Once logged-in, Click on **Create Repository**
5. Your namespace will be pre-selected. Give your repository a name (e.g. `my-personal-image`)
6. Select Visibility to **Private** and click create.

> [!IMPORTANT] 
> Choose your username and repository name wisely. While creating an image, you need to use both. 
> For example: `<namespace>/<repository-name>`


## Deployment Process
1. An image from the current code can be created using the following command:
    ```shell
    docker build -f app.Dockerfile -t my-namespace/my-personal-image:v1 .
    ```
2. Check if your image has been successfully created
    ```shell
    docker images | awk '/my-personal-image/ || NR==1'
    ```
3. Log on to your docker hub account from **command line** before pushing. It will ask for the username and password of your [docker hub](https://hub.docker.com) account.
    ```shell
    docker login
    ```
4. Push (upload) your newly created image to your private docker registry.
    ```shell
    docker push my-namespace/my-personal-image:v1
    ```
5. Login to your remote server and get access to its terminal (via SSH or AWS CloudShell)
6. Once you have access to the terminal, do a docker login and provide your docker hub username and password when asked.
    ```shell
    docker login
    ```
7. Pull (download) the docker image from the private registry.
    ```shell
    docker pull my-namespace/my-personal-image:v1
    ```
8. Validate if your image has been successfully pulled (downloaded).
    ```shell
    docker images | awk '/my-personal-image/ || NR==1'
    ```
9. Now, run the image.
    ```shell
    docker run -d -p 80:8080 --name my_container namespace/my_personal_image:v1
    ```
10. You can also check the logs to see if everything is working without errors.
    ```shell
    docker logs my_container
    ```
11. You can exit from the shell.
12. From your browser you can hit the server URL. (Make sure to explicitly write **http://**)
    ```
    http://<your-server-url>
    ```
13. Alternatively, you can also use the curl command to fetch your page
    ```shell
    curl <your-server-ip-or-url>
    ```

## Running into Issues?
Have a look at the [Troubleshooting Guide](./TROUBLESHOOTING.md).