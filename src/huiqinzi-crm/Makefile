all:crm

check_env:
	@if [ "$(TARGET_DIR)" = "" ]; then echo "ERROR: TARGET_DIR was not set"; exit 1; fi
	@if [ "$(TAG_VERSION)" = "" ]; then echo "ERROR: TAG_VERSION was not set"; exit 1; fi
	@if [ "$(REGISTRY)" = "" ]; then echo "ERROR: REGISTRY was not set"; exit 1; fi
crm:check_env
	test -e node_modules || yarn install

install:check_env
	rm -rf $(TARGET_DIR)/crm
	mkdir -p $(TARGET_DIR)/crm
	cp -r docker/* $(TARGET_DIR)/crm
	cp -r src $(TARGET_DIR)/crm/html

image:check_env
	cd $(TARGET_DIR)/crm && sudo docker build . -t $(REGISTRY)/huiqinzi/huiqinzi-crm:$(TAG_VERSION)

.PHONY: clean cleanall
clean:


cleanall:
	rm -rf node_modules

