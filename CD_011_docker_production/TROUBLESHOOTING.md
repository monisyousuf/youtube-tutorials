# Troubleshooting Guide
This guide is to help you troubleshoot any issues that you may have while deploying this app on production.
> [!IMPORTANT] 
> Before referring to this guide make sure that you have followed the instructions properly from the [README](./README.md)

### 0. System Updates
❗Make sure that your system and Docker Desktop is up-to-date.

### 1. Error while pushing image
**Qs.** My  `docker push` command is giving my the following error:

```shell
The push refers to repository [docker.io/my-namespace/my-personal-image]
An image does not exist locally with the tag: my-namespace/my-personal-image
```

**Things to Check**:
- Make sure that there are no typos between in the image name (underscores instead of hifins etc.)
- To double-check this, you can use the `docker images` command to see.
    ```shell
    docker images | awk '/my-personal-image/ || NR==1'
    ```
- If this command does not provide you with any images, there is a possibility that your image was not created properly.
- In such a case, try re-creating the image and make sure that you specify the namespace (your docker hub username) and the repository name correctly. For example:
    ```shell
    docker build -f app.Dockerfile -t <my-docker-hub-username>/<my-docker-repository-name>:v1 .
    ```

### 2. Docker Commands not working on the production server

**Solution** If your production server cannot recognise "docker" commands. You may need to install the docker client.
You can do this by following the below steps. **Once the steps are done, RESTART your instance**.

```shell
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user
# Restart your EC2 Instance
# !! Replace ec2-user with the user that is used to login to the production server
```

### 3. Error while running image
**Qs.** While executing the `docker run` command on production, I am getting the following error:
```
image with reference docker.io/my-namespace/my-personal-image:v1 was found but does not match the specified platform: wanted linux/amd64, actual: linux/arm64/v8.
```

**Solution**

This might happen when the server architecture does not match your local machine's architecture. For example, if you
built your image with a Macbook's Apple Silicon, but the production architecture is `linux/amd64`. 
Here, it is important to look at the error and find your server architecture. In this error it clearly says
`wanted linux/amd64`. So, we need to build an image which is compatible with this architecture. This can be done by the 
`docker buildx` command and supplying the `--platform` parameter with the argument of the target architecture.

For example,

```shell
docker buildx build --platform linux/amd64 -f app.Dockerfile -t my-namespace/my-personal-image:v1 .
```

### 4. Error while re-deploying on production
**Qs.** When I try to re-deploy on production with a new image, I get the following error
```shell
docker: Error response from daemon: Conflict. The container name "/my_container" is already in use by container "<some id>". 
You have to remove (or rename) that container to be able to reuse that name.
```

**Solution** In order to deploy a new image with the same container name, the old one needs to be removed first. 
```shell
docker stop my_container
docker rm my_container
# Now you can re-run your docker run command to deploy a new version
```


### 5. My deployment was successful, but I cannot see the app in the browser
There could be many reasons that you are not able to access your app.

**Things to Check**
1. Can you access it with the curl command?
    ```shell
    curl <your-server-ip-or-url>
    ```
2. **If yes**, then most likely your browser is defaulting to https. Prefix your IP with `http://` explicitly. If you don't type this explicitly, and just copy-paste the URL, some browsers default this to `https://` and the server is not equipped to handle that yet.
3. **If not**,
   - See if your server allows the access of port `80` from all URLs. 
   - In AWS, this can be allowed from your EC2 page -> Security Groups -> Select your EC2's security group -> See "Inbound Rules" at the bottom -> Edit inbound rules.
   - Click on "Add Rule" -> Select "Type" as HTTP, Port range to `80` and Source to "Anywhere-IPv4" 
   - Repeat this for IPv6 as well. Click on "Add Rule" -> Select "Type" as HTTP, Port range to `80` and Source to "Anywhere-IPv6" 
   - Click "Save Rules" in the bottom right corner.
4. If you followed these steps and none of it works, double-check the docker logs and see if there were any errors while starting the application. 
    ```shell
    docker logs my_container
    ```
   

## Still having Issues?
Write your problem in the comments of my video and I'll try my best to address them :)