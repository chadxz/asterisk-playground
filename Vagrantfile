# The "2" in Vagrant.configure configures the configuration version.
# Don't change it unless you know what you're doing.
Vagrant.configure("2") do |config|

  # For a complete configuration reference,
  # see the online documentation at https://docs.vagrantup.com.

  config.vm.define 'playground' do |node|
    node.vm.hostname = "playground.vagrant"
    node.vm.network 'private_network', { ip: '192.168.68.68' }
    node.vm.box = 'ubuntu/xenial64'
    node.vm.provider 'virtualbox' do |v|
      v.cpus = 1
      v.memory = 1024
    end

    ssh_pub_key = File.readlines("#{Dir.home}/.ssh/id_rsa.pub").first.strip

    node.vm.provision 'shell' do |s|
      s.inline = <<-SHELL
        set -ex

        # xenial only ships with Python 3 by default,
        # but ansible requires Python 2.7
        DEBIAN_FRONTEND=noninteractive \
          apt-get update && apt-get install -y python

        # Setup ssh permissions for vagrant user
        echo #{ssh_pub_key} >> /home/vagrant/.ssh/authorized_keys
      SHELL
    end
  end
end
