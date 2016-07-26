Ansible scripts and Dockerfile for setting up an Asterisk instance on a
debian/jessie virtual machine.

-----

### Local Setup

To get your computer ready to run the ansible scripts:

- Install Ansible
- Setup your `ansible_vault` password file, which is preconfigured for this
project to reside at `~/.ansible/asteriskvm_vault`.
- Put the hostname or ip address of the virtual machine in the `inventory.ini`
file
- Put your username at the top of the `playbook.yml` in the `user` variable,
and in the `ansible.cfg` file in the `remote_user` variable

### VM Setup

To get the linux box ready for the ansible scripts from a base installation:

- add your public ssh key to the `~/.ssh/authorized_keys` for your user on the
linux box
- as root, `apt-get update -yy && apt-get install sudo`
- as root, enable passwordless sudo by pasting the following into
`/etc/sudoers` using the `visudo` command:

    ```
    ALL            ALL = (ALL) NOPASSWD: ALL
    ```

