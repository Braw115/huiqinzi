include rules.mk
all:huiqinzi-crm srv

install:srv-install  crm-install 
image:srv-image crm-image 
test:srv-test

echo-env:
	@echo "TARGET_DIR=$(TARGET_DIR)"
	@echo "TAG_VERSION=$(TAG_VERSION)"
	@echo "REGISTRY=$(REGISTRY)"

srv:
	$(MAKE) -C huiqinzi
srv-install:
	$(MAKE) -C huiqinzi install
srv-image:
	$(MAKE) -C huiqinzi image
srv-test:
	$(MAKE) -C huiqinzi test


huiqinzi-crm:
	$(MAKE) -C huiqinzi-crm
crm-install:
	$(MAKE) -C huiqinzi-crm install
crm-image:
	$(MAKE) -C huiqinzi-crm image

.PHONY: clean cleanall
clean:srv-clean  
cleanall:srv-cleanall crm-cleanall
	rm -rf $(TARGET_DIR)

srv-clean:
	$(MAKE) -C huiqinzi clean
srv-cleanall:
	$(MAKE) -C huiqinzi cleanall
crm-clean:
	$(MAKE) -C huiqinzi-crm clean
crm-cleanall:
	$(MAKE) -C huiqinzi-crm cleanall