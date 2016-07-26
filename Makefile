all:
	cd scripts && \
	ansible-playbook playbook.yml
.PHONY: all

update:
	cd scripts && \
	ansible-playbook --tags asterisk playbook.yml
.PHONY: update
