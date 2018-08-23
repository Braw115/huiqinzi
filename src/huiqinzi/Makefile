all: huiqinzi-srv
	
check_env:
	@if [ "$(TARGET_DIR)" = "" ]; then echo "ERROR: TARGET_DIR was not set"; exit 1; fi
	@if [ "$(TAG_VERSION)" = "" ]; then echo "ERROR: TAG_VERSION was not set"; exit 1; fi
	@if [ "$(REGISTRY)" = "" ]; then echo "ERROR: REGISTRY was not set"; exit 1; fi

huiqinzi-srv:check_env
	test -e node_modules || npm install
	test -e typings || typings install
	tsc

install:check_env
	rm -rf $(TARGET_DIR)/huiqinzi-srv/huiqinzi-srv
	mkdir -p $(TARGET_DIR)/huiqinzi-srv/huiqinzi-srv
	cp -r build node_modules public package.json logs $(TARGET_DIR)/huiqinzi-srv/huiqinzi-srv
	cp -r docker/* $(TARGET_DIR)/huiqinzi-srv

image:check_env
	cd $(TARGET_DIR)/huiqinzi-srv && sudo docker build . -t $(REGISTRY)/huiqinzi/huiqinzi-srv:$(TAG_VERSION)

test:check_env
	npm test

.PHONY: clean cleanall
clean:
	rm -rf build

cleanall:
	rm -rf node_modules typings build
