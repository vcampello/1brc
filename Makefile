NODE_VERSION := $(file < .nvmrc)
LOCAL := ./node_modules/.bin

.PHONY: clean
clean:
	rm -rf ./dist 

.PHONY: build
build:
	$(LOCAL)/tsc --project tsconfig.build.json
	$(LOCAL)/tsc-alias --project tsconfig.build.json


.PHONY: run-v1
run-v1: clean build
	# node --inspect dist/v1.js
	node dist/v1.js

.PHONY: run-v2
run-v2: clean build
	# node --inspect dist/v1.js
	node dist/v2.js

.PHONY: run-v3
run-v3: clean build
	# node --inspect dist/v1.js
	node dist/v3.js
