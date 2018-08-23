
CREATE SCHEMA if not exists sys;
CREATE SCHEMA if not exists mall;
CREATE SCHEMA if not exists users;

CREATE TABLE "mall"."activity" (
"uuid" uuid PRIMARY KEY,
"title" text,
"price" float8,
"realprice" float8,
"pics" text[],
"detail" text,
"groupbyprice" float8,
"amount" int4,
"opentime" varchar(20),
"closetime" varchar(20),
"category" uuid,
"subcategory" uuid,
"pricetag" jsonb,
"state" varchar(3) check (state in ('on','off','new')),
"position" int4 DEFAULT 0,
"city" varchar(12),
"sold" int4 DEFAULT 0,
"realsold" int4 DEFAULT 0,
"businessuuid" uuid,
"acttime"	text[],
"endtime"	 timestamp(6)
"deleted" int4 DEFAULT 0,
"substance" boolean,
"reservation" boolean,
"hotposition" int4 DEFAULT null,
"created" timestamp(6) DEFAULT now(),
"modified" timestamp(6) DEFAULT now()
);


CREATE OR REPLACE FUNCTION update_modified()
RETURNS TRIGGER AS $$
BEGIN
   NEW.modified = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';


CREATE TRIGGER "mall_activity_modified" BEFORE UPDATE ON "mall"."activity"
FOR EACH ROW
EXECUTE PROCEDURE "update_modified"();

ALTER TABLE mall.activity OWNER to pguser;


CREATE TABLE "mall"."banner" (
"uuid" uuid PRIMARY KEY,
"pic" text,
"gooduuid" uuid NOT NULL,
"position" int4,
"synopsis"	text,
"price"	float,
"title"	varchar(225),
"deleted" int4 DEFAULT 0 NOT NULL,
"created" timestamp(6) DEFAULT now(),
"modified" timestamp(6) DEFAULT now()
);


CREATE TRIGGER "mall_banner_modified" BEFORE UPDATE ON "mall"."banner"
FOR EACH ROW
EXECUTE PROCEDURE "update_modified"();

ALTER TABLE mall.banner OWNER to pguser;


CREATE TABLE "mall"."category" (
"uuid" uuid PRIMARY KEY,
"name" varchar(64) NOT NULL,
"parent" uuid,
"pic" text,
"key" varchar(255),
"position" int4
);

ALTER TABLE mall.category OWNER to pguser;


CREATE TABLE "mall"."goods" (
"uuid" uuid PRIMARY KEY,
"title" text,
"price" float8,
"realprice" float8,
"pics" text[],
"detail" text,
"category" uuid,
"subcategory" uuid,
"pricetag" jsonb,
"state" varchar(3) check (state in ('on','off','new')),
"position" int4 DEFAULT 0,
"inventory" int4,
"sold" int4,
"deleted" int4 DEFAULT 0,
"created" timestamp(6) DEFAULT now(),
"modified" timestamp(6) DEFAULT now()
);


CREATE TRIGGER "mall_goods_modified" BEFORE UPDATE ON "mall"."goods"
FOR EACH ROW
EXECUTE PROCEDURE "update_modified"();

ALTER TABLE mall.goods OWNER to pguser;


CREATE TABLE "mall"."logistics" (
"uuid" uuid PRIMARY KEY,
"logisticscode" varchar(64),
"ordercode" varchar(64),
"shippercode" varchar(64),
"traces" jsonb[],
"created" timestamp(6) DEFAULT now(),
"modified" timestamp(6) DEFAULT now()
);

CREATE TRIGGER "mall_logistics_modified" BEFORE UPDATE ON "mall"."logistics"
FOR EACH ROW
EXECUTE PROCEDURE "update_modified"();

ALTER TABLE mall.logistics OWNER to pguser;


CREATE TABLE "mall"."orders" (
"uuid" uuid PRIMARY KEY,
"useruuid" uuid NOT NULL,
"goods" jsonb,
"gooduuid" uuid NOT NULL,
"name" varchar(16),
"phone" varchar(16),
"remark" text,
"total_fee" float8,
"realtotal_fee" float8,
"amount" int4,
"address" text,
"state" varchar(10),
"logisticscode" varchar(16),
"shippercode" varchar(8),
"out_trade_no" text,
"groupuuid" uuid,
"activityuuid" uuid,
"code" varchar(16) DEFAULT '',
"rebate1" uuid,
"rebate2" uuid,
"brokerage1" float8,
"brokerage2" float8,
"ext" jsonb,
"created" timestamp(6) DEFAULT now(),
"modified" timestamp(6) DEFAULT now()
);


CREATE TRIGGER "mall_orders_modified" BEFORE UPDATE ON "mall"."orders"
FOR EACH ROW
EXECUTE PROCEDURE "update_modified"();

ALTER TABLE mall.orders OWNER to pguser;


CREATE TABLE "mall"."shipper" (
"shippercode" varchar(64) PRIMARY KEY,
"shippername" varchar(64) UNIQUE
);

ALTER TABLE mall.shipper OWNER to pguser;


CREATE TABLE "mall"."withdraw" (
"uuid" uuid PRIMARY KEY,
"useruuid" uuid NOT NULL,
"amount" float8,
"remark" varchar(128),
"state" varchar(10),
"created" timestamp(6) DEFAULT now(),
"modified" timestamp(6) DEFAULT now()
);


CREATE TRIGGER "mall_withdraw_modified" BEFORE UPDATE ON "mall"."withdraw"
FOR EACH ROW
EXECUTE PROCEDURE "update_modified"();

ALTER TABLE mall.withdraw OWNER to pguser;


CREATE TABLE "mall"."wxtrade" (
"uuid" uuid PRIMARY KEY,
"out_trade_no" text,
"openid" text,
"prepay_id" text,
"state" varchar(24) check (state in ('new','fin','abandon')),
"appid" text,
"mch_id" text,
"body" text,
"total_fee" float8,
"spbill_create_ip" text,
"trade_type" varchar(24) check (trade_type in ('JSAPI','WEB')),
"ext" jsonb,
"created" timestamp(6) DEFAULT now(),
"modified" timestamp(6) DEFAULT now()
);


CREATE TRIGGER "mall_wxtrade_modified" BEFORE UPDATE ON "mall"."wxtrade"
FOR EACH ROW
EXECUTE PROCEDURE "update_modified"();

ALTER TABLE mall.wxtrade OWNER to pguser;

CREATE TABLE "sys"."system" (
"name" text PRIMARY KEY,
"value" jsonb
);

ALTER TABLE sys.system OWNER to pguser;


CREATE TABLE "users"."address" (
"uuid" uuid PRIMARY KEY,
"useruuid" uuid,
"address" text ,
"contact" varchar(32),
"phone" varchar(20),
"defaul" varchar(5) check (defaul in ('yes','no')),
"created" timestamp(6) DEFAULT now(),
"modified" timestamp(6) DEFAULT now()
);

ALTER TABLE users.address OWNER to pguser;


CREATE TRIGGER "users_address_modified" BEFORE UPDATE ON "users"."address"
FOR EACH ROW
EXECUTE PROCEDURE "update_modified"();


CREATE TABLE "users"."crmusers" (
"uuid" uuid PRIMARY KEY,
"username" varchar(128),
"password" varchar(128) NOT NULL,
"description" text,
"state" varchar(24) check (state in ('on','off')),
"perm" varchar(24),
"phone" varchar(24),
"email" varchar(64),
"realname" varchar(64),
"address" varchar(2048),
"remark" text,
"deleted" int4 DEFAULT 0 NOT NULL,
"ext" jsonb,
"created" timestamp(6) DEFAULT now(),
"modified" timestamp(6) DEFAULT now()
);

ALTER TABLE users.crmusers OWNER to pguser;


CREATE TRIGGER "users_crmusers_modified" BEFORE UPDATE ON "users"."crmusers"
FOR EACH ROW
EXECUTE PROCEDURE "update_modified"();


CREATE TABLE "users"."groups" (
"uuid" uuid PRIMARY KEY,
"activityuuid" uuid,
"useruuids" varchar(36)[],
"state" varchar(20) check (state in ('processing','finish','cancelled','success')),
"pic"	varchar(255),
"created" timestamp(6) DEFAULT now(),
"modified" timestamp(6) DEFAULT now()
);

ALTER TABLE users.groups OWNER to pguser;


CREATE TRIGGER "users_groups_modified" BEFORE UPDATE ON "users"."groups"
FOR EACH ROW
EXECUTE PROCEDURE "update_modified"();


CREATE TABLE "users"."search" (
"uuid" uuid PRIMARY KEY,
"useruuid" uuid,
"words" text,
"created" timestamp(6) DEFAULT now()
);

ALTER TABLE users.search OWNER to pguser;


CREATE TABLE "users"."wxusers" (
"uuid" uuid PRIMARY KEY,
"openid" varchar(64) UNIQUE,
"headurl" varchar(1024),
"wxname" varchar(128),
"realname" varchar(16),
"phone" varchar(16),
"balance" float8 DEFAULT 0,
"withdrawbalance" float8 DEFAULT 0,
"customer" int4 DEFAULT 0,
"storename" varchar(16),
"storelogo" varchar(128),
"upuseruuid" uuid,
"switch" bool DEFAULT true,
"deleted" int4 DEFAULT 0 NOT NULL,
"created" timestamp(6) DEFAULT now(),
"modified" timestamp(6) DEFAULT now()
);

ALTER TABLE users.wxusers OWNER to pguser;


CREATE TRIGGER "users_wxusers_modified" BEFORE UPDATE ON "users"."wxusers"
FOR EACH ROW
EXECUTE PROCEDURE "update_modified"();


insert into mall.shipper(shippercode,shippername) values('ZTO',	'中通速递');
insert into mall.shipper(shippercode,shippername) values('YTO',	'圆通速递');
insert into mall.shipper(shippercode,shippername) values('SF',	'顺丰快递');	
insert into mall.shipper(shippercode,shippername) values('STO',	'申通快递');
insert into mall.shipper(shippercode,shippername) values('YD',	'韵达快递');
insert into mall.shipper(shippercode,shippername) values('HHTT','天天快递');
insert into mall.shipper(shippercode,shippername) values('GTO',	'国通快递');
insert into mall.shipper(shippercode,shippername) values('HTKY','百世快递');
insert into mall.shipper(shippercode,shippername) values('AJ',	'安捷快递');	
insert into mall.shipper(shippercode,shippername) values('ANE',	'安能物流');	
insert into mall.shipper(shippercode,shippername) values('AXD',	'安信达快递');	
insert into mall.shipper(shippercode,shippername) values('BQXHM',	'北青小红帽');	
insert into mall.shipper(shippercode,shippername) values('BFDF',	'百福东方');	
insert into mall.shipper(shippercode,shippername) values('BTWL',	'百世快运');	
insert into mall.shipper(shippercode,shippername) values('CCES',	'CCES快递');	
insert into mall.shipper(shippercode,shippername) values('CITY100',	'城市100');	
insert into mall.shipper(shippercode,shippername) values('COE',	'COE东方快递');	
insert into mall.shipper(shippercode,shippername) values('CSCY',	'长沙创一');	
insert into mall.shipper(shippercode,shippername) values('CDSTKY',	'成都善途速运');	
insert into mall.shipper(shippercode,shippername) values('DBL',	'德邦');	
insert into mall.shipper(shippercode,shippername) values('DSWL',	'D速物流');	
insert into mall.shipper(shippercode,shippername) values('DTWL',	'大田物流');	
insert into mall.shipper(shippercode,shippername) values('EMS',	'EMS');	
insert into mall.shipper(shippercode,shippername) values('FAST',	'快捷速递');	
insert into mall.shipper(shippercode,shippername) values('FEDEX',	'FEDEX联邦(国内件）');	
insert into mall.shipper(shippercode,shippername) values('FEDEX_GJ',	'FEDEX联邦(国际件）');	
insert into mall.shipper(shippercode,shippername) values('FKD',	'飞康达');	
insert into mall.shipper(shippercode,shippername) values('GDEMS',	'广东邮政');	
insert into mall.shipper(shippercode,shippername) values('GSD',	'共速达');		
insert into mall.shipper(shippercode,shippername) values('GTSD',	'高铁速递');	
insert into mall.shipper(shippercode,shippername) values('HFWL',	'汇丰物流');		
insert into mall.shipper(shippercode,shippername) values('HLWL',	'恒路物流');	
insert into mall.shipper(shippercode,shippername) values('HOAU',	'天地华宇');	
insert into mall.shipper(shippercode,shippername) values('hq568',	'华强物流');		
insert into mall.shipper(shippercode,shippername) values('HXLWL',	'华夏龙物流');	
insert into mall.shipper(shippercode,shippername) values('HYLSD',	'好来运快递');	
insert into mall.shipper(shippercode,shippername) values('JGSD',	'京广速递');	
insert into mall.shipper(shippercode,shippername) values('JIUYE',	'九曳供应链');	
insert into mall.shipper(shippercode,shippername) values('JJKY',	'佳吉快运');	
insert into mall.shipper(shippercode,shippername) values('JLDT',	'嘉里物流');	
insert into mall.shipper(shippercode,shippername) values('JTKD',	'捷特快递');	
insert into mall.shipper(shippercode,shippername) values('JXD',	'急先达');	
insert into mall.shipper(shippercode,shippername) values('JYKD',	'晋越快递');	
insert into mall.shipper(shippercode,shippername) values('JYM',	'加运美');	
insert into mall.shipper(shippercode,shippername) values('JYWL',	'佳怡物流');	
insert into mall.shipper(shippercode,shippername) values('KYWL',	'跨越物流');	
insert into mall.shipper(shippercode,shippername) values('LB',	'龙邦快递');	
insert into mall.shipper(shippercode,shippername) values('LHT',	'联昊通速递');	
insert into mall.shipper(shippercode,shippername) values('MHKD',	'民航快递');	
insert into mall.shipper(shippercode,shippername) values('MLWL',	'明亮物流');	
insert into mall.shipper(shippercode,shippername) values('NEDA',	'能达速递');	
insert into mall.shipper(shippercode,shippername) values('PADTF',	'平安达腾飞快递');	
insert into mall.shipper(shippercode,shippername) values('QCKD',	'全晨快递');	
insert into mall.shipper(shippercode,shippername) values('QFKD',	'全峰快递');	
insert into mall.shipper(shippercode,shippername) values('QRT',	'全日通快递');	
insert into mall.shipper(shippercode,shippername) values('RFD',	'如风达');	
insert into mall.shipper(shippercode,shippername) values('SAD',	'赛澳递');	
insert into mall.shipper(shippercode,shippername) values('SAWL',	'圣安物流');	
insert into mall.shipper(shippercode,shippername) values('SBWL',	'盛邦物流');	
insert into mall.shipper(shippercode,shippername) values('SDWL',	'上大物流');		
insert into mall.shipper(shippercode,shippername) values('SFWL',	'盛丰物流');	
insert into mall.shipper(shippercode,shippername) values('SHWL',	'盛辉物流');	
insert into mall.shipper(shippercode,shippername) values('ST',	'速通物流');		
insert into mall.shipper(shippercode,shippername) values('STWL',	'速腾快递');	
insert into mall.shipper(shippercode,shippername) values('SURE',	'速尔快递');	
insert into mall.shipper(shippercode,shippername) values('TSSTO',	'唐山申通');	
insert into mall.shipper(shippercode,shippername) values('UAPEX',	'全一快递');	
insert into mall.shipper(shippercode,shippername) values('UC',	'优速快递');	
insert into mall.shipper(shippercode,shippername) values('WJWL',	'万家物流');	
insert into mall.shipper(shippercode,shippername) values('WXWL',	'万象物流');	
insert into mall.shipper(shippercode,shippername) values('XBWL',	'新邦物流');	
insert into mall.shipper(shippercode,shippername) values('XFEX',	'信丰快递');	
insert into mall.shipper(shippercode,shippername) values('XYT',	'希优特');	
insert into mall.shipper(shippercode,shippername) values('XJ',	'新杰物流');	
insert into mall.shipper(shippercode,shippername) values('YADEX',	'源安达快递');	
insert into mall.shipper(shippercode,shippername) values('YCWL',	'远成物流');		
insert into mall.shipper(shippercode,shippername) values('YDH',	'义达国际物流');	
insert into mall.shipper(shippercode,shippername) values('YFEX',	'越丰物流');	
insert into mall.shipper(shippercode,shippername) values('YFHEX',	'原飞航物流');	
insert into mall.shipper(shippercode,shippername) values('YFSD',	'亚风快递');	
insert into mall.shipper(shippercode,shippername) values('YTKD',	'运通快递');	
insert into mall.shipper(shippercode,shippername) values('YXKD',	'亿翔快递');	
insert into mall.shipper(shippercode,shippername) values('YZPY',	'邮政平邮/小包');	
insert into mall.shipper(shippercode,shippername) values('ZENY',	'增益快递');	
insert into mall.shipper(shippercode,shippername) values('ZHQKD',	'汇强快递');	
insert into mall.shipper(shippercode,shippername) values('ZJS',	'宅急送');	
insert into mall.shipper(shippercode,shippername) values('ZTE',	'众通快递');	
insert into mall.shipper(shippercode,shippername) values('ZTKY',	'中铁快运');		
insert into mall.shipper(shippercode,shippername) values('ZTWL',	'中铁物流');	
insert into mall.shipper(shippercode,shippername) values('ZYWL',	'中邮物流');	
insert into mall.shipper(shippercode,shippername) values('AMAZON',	'亚马逊物流');	
insert into mall.shipper(shippercode,shippername) values('SUBIDA',	'速必达物流');	
insert into mall.shipper(shippercode,shippername) values('RFEX',	'瑞丰速递');	
insert into mall.shipper(shippercode,shippername) values('QUICK',	'快客快递');	
insert into mall.shipper(shippercode,shippername) values('CJKD',	'城际快递');	
insert into mall.shipper(shippercode,shippername) values('CNPEX',	'CNPEX中邮快递');	
insert into mall.shipper(shippercode,shippername) values('HOTSCM',	'鸿桥供应链');	
insert into mall.shipper(shippercode,shippername) values('HPTEX',	'海派通物流公司');	
insert into mall.shipper(shippercode,shippername) values('AYCA',	'澳邮专线');	
insert into mall.shipper(shippercode,shippername) values('PANEX',	'泛捷快递');	
insert into mall.shipper(shippercode,shippername) values('PCA',	'PCA');
insert into mall.shipper(shippercode,shippername) values('UEQ',	'UEQ');


insert into users.crmusers(uuid, username, password, perm) values ('df611ca1-9f56-4a15-8e1f-4718da7c37d0', 'root', '123456', 'root');


insert into sys.system values('service','{"phone":"13590450686"}');
insert into sys.system values('rebate','{"rebate1":0.01,"rebate2":0.01}');
insert into sys.system values('hotsearch','["大梅沙","世界之窗","欢乐谷"]');