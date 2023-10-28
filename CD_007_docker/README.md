# CD_007 | Docker

## Tutorial 1: Hosting HTML via NGINX using Docker

### Step#1: Docker Build
```shell 
docker build -f app.Dockerfile -t docker_nginx_image .
# -f parameter refers to the file which contains the instructions
# -t parameter to specify the name of an image
# . (current directory) refers to the directory where the app.Dockerfile is present
```

### Step#2: View Images
```shell
docker images
# This should list all the docker images on your system
# If your previous command was successful, the name of your previous image (i.e. docker_nginx_image) should be visible
```

### Step#3: Run your image
Nginx, by default runs on the port 80. For Nginx running within docker to receive traffic from your computers browser (which is outside of docker), any traffic received on port 80 of your computer must be forwarded to the port `80` inside docker.
This can be achieved using the `-p` parameter with the `docker run` command as follows.
```shell
docker run -p 80:80 docker_nginx_image
# -p 80:80 => The left one is your computer's port and the right one is the docker's port where NGINX is running. Any requests to the port 80 on your computer will be forwarded to the docker's port 80.
# Second param is the image name which you created in the steps before
```

### Step#4: Test in your browser
Once the above commands are successful, the application can be accessed at:
http://localhost (default port is 80)

### Step#5: Response Headers
The response headers of this app can also be seen through the `curl` command as follows:
```shell
curl -v localhost:80
```
A `Server` header specifies that nginx is indeed hosting this page.