# asterisk-playground

Vagrant + Ansible scripts for setting up an Asterisk instance on a ubuntu/xenial
virtual machine. Comes with Dockerized Asterisk and a Node.js AGI + ARI app.

-----

### Local Setup

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

### Deploying the system

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

