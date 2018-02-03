# asterisk-playground

Vagrant + Ansible scripts for setting up an Asterisk instance on a ubuntu/xenial
virtual machine. Comes with Dockerized Asterisk and a Node.js AGI + ARI app.

-----

### pre-reqs

To get your computer ready to run the ansible scripts:

- Ensure you have an [ssh key](https://help.github.com/articles/generating-an-ssh-key/)

- Ensure you have Python 2.7.x installed. (Installed by default on OSX)

- Ensure you have homebrew installed.

    ```/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"```

- Install Python pip package manager.

    ```easy_install pip```

- Use pip to install Ansible.

    ```pip install ansible```

- Install virtualbox and vagrant.

    ```brew cask install virtualbox vagrant```

- Start the virtual machine with `vagrant up`

### deploying the system

To setup the vm from scratch:

```
$ make
```

Once deployed to, you can ssh into it:

```
$ ssh 192.168.68.68
```

To upgrade the asterisk box or agi+ari application:

```
$ make deploy
```

### accessing the system

Once deployed, a few services will be available on the vm:

- cAdvisor will be running, providing monitoring for the system and
containers. Access this at
[http://192.168.68.68:4194/containers/](http://192.168.68.68:4194/containers/)

- SwaggerUi will be running at
[http://192.168.68.68:1337](http://192.168.68.68:1337) pointing at Asterisk.

- Asterisk will be running. Point a sip client at 192.168.68.68 using the
credentials from [asterisk/conf/pjsip.conf](asterisk/conf/pjsip.conf).

- The 'call-control' node app will be running, but it only interacts with Asterisk
and exposes no public facing ui.

- To view logs of any application, ssh into the box with `vagrant ssh playground`
and use `docker ps` to view the container statuses and `docker logs <container name>`
to view logs of any individual container. For Asterisk, you can access the console
using the command `docker exec -ti asterisk asterisk -c`
