all:
	cd scripts && \
	ansible-playbook playbook.yml
.PHONY: all

deploy:
	cd scripts && \
	ansible-playbook --tags deploy playbook.yml
.PHONY: deploy
