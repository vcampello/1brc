NODE_VERSION := $(file < .nvmrc)
LOCAL := ./node_modules/.bin

.PHONY: clean
clean:
	rm -rf ./dist 

.PHONY: build
build:
	$(LOCAL)/tsc --project tsconfig.build.json
	$(LOCAL)/tsc-alias --project tsconfig.build.json


.PHONY: run
run: clean build
	node dist/index.js
