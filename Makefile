all:
	cd scripts && \
	ansible-playbook playbook.yml
.PHONY: all

asterisk:
	cd scripts && \
	ansible-playbook --tags asterisk playbook.yml
.PHONY: asterisk

agi:
	cd scripts && \
	ansible-playbook --tags agi playbook.yml
.PHONY: agi
