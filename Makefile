all:
	cd ansible && \
	ansible-playbook -v --diff playbook.yml
.PHONY: all

deploy:
	cd ansible && \
	ansible-playbook -v --diff --tags deploy playbook.yml
.PHONY: deploy
