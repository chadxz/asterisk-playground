all:
	cd ansible && \
	ansible-playbook playbook.yml
.PHONY: all

deploy:
	cd ansible && \
	ansible-playbook --tags deploy playbook.yml
.PHONY: deploy
