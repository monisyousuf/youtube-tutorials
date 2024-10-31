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
- Docker CLI is installed on your cloud server (see Pt#2 of the [Troubleshooting Guide](./TROUBLESHOOTING.md))

### Getting a Docker Registry
1. Go to [hub.docker.com](https://hub.docker.com)
2. Click on "Sign Up" to create a new account.
3. Choose a **username**. This will be used as your **namespace**
4. Once logged-in, Click on **Create Repository**
5. Your namespace will be pre-selected. Give your repository a name (e.g. `my-personal-image`)
6. Select Visibility to **Private** and click create.

> [!IMPORTANT] 
> Choose your username and repository name wisely. While creating an image, you need to use both. 
> For example: `<namespace>/<repository-name>`

### AWS EC2 Server Setup
Setting up a server will be useful for testing the full docker deployment process. Especially in the case of a CI/CD pipeline.
An AWS account is required to create an EC2 Instance. Once logged-in into the AWS Account, the following steps can be followed:

1. In the search bar, search for "EC2" and click on the EC2 from the autosuggest bar.
2. Click on "Instances"
3. Click on "Launch Instances" (See top right corner, orange button)
4. Select "Amazon Linux"
5. Select "Instance Type" as "t2.micro" or any other Free tier eligible server
6. In the "Key-Pair" section, click on "Create new key pair"
7. Keep the defaults, name your key as `ec2-remote-login-key`. Key Pair type as `RSA` and the format as `.pem` and click "Create Key Pair"
8. This will open a download dialog. Save the key in a safe location. Preferably in your code directory - but make sure its NOT committed (add `*.pem` in the `.gitignore` file)
9. Scroll down to "Network Settings" and keep the default settings except for two things:
    - Check "Allow SSH traffic from Anywhere"
    - Check "Allow HTTP traffic from the internet"
10. Keep rest of the defaults and click "Launch Instance"
11. Give it a few minutes to spin up. It will soon be visible in the "Instances" section of EC2.

### Connecting to the EC2 Server remotely
1. In the "Instances" section of EC2, click on the checkbox beside the running instance.
2. On the top, click "Connect"
3. Using "EC2 Instance Connect" will enable you to remotely access your server terminal quickly via browser
4. Alternatively, you can click on "SSH Client", which will give you a couple of commands to remotely access your server terminal via your computer's command line.
5. This method requires that OpenSSH is installed on your computer.
6. The command to connect to your remote server could look like this:

```bash
# ssh -i <path to your key> ec2-user@<your-ec2-server-public-ip>
ssh -i "<path-to>/ec2-remote-login-key.pem" ec2-user@52.12.345.678
```

### Install Docker on your server (One Time)
Once successfully logged in into the server terminal, docker CLI can be installed by using the following commands.
Once executed successfully, please RESTART your EC2 instance.

```bash
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user
# Restart your EC2 Instance
# !! Replace ec2-user with the user that is used to login to the production server
```

___
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