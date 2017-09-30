prompt PL/SQL Developer import file
prompt Created on 2015年4月18日 by Administrator
set feedback off
set define off
prompt Dropping SYS_RA_ANALYSISEXPR...
drop table SYS_RA_ANALYSISEXPR cascade constraints;
prompt Dropping SYS_RA_ANALYSISTYPE...
drop table SYS_RA_ANALYSISTYPE cascade constraints;
prompt Dropping SYS_RA_LEVEL_REL...
drop table SYS_RA_LEVEL_REL cascade constraints;
prompt Dropping SYS_RA_LINE...
drop table SYS_RA_LINE cascade constraints;
prompt Dropping SYS_RA_NODE...
drop table SYS_RA_NODE cascade constraints;
prompt Dropping SYS_RA_REPORTRELATION...
drop table SYS_RA_REPORTRELATION cascade constraints;
prompt Dropping SYS_RA_REPORTTYPE...
drop table SYS_RA_REPORTTYPE cascade constraints;
prompt Dropping SYS_RA_RESULT...
drop table SYS_RA_RESULT cascade constraints;
prompt Dropping SYS_RA_RESULTNAME...
drop table SYS_RA_RESULTNAME cascade constraints;
prompt Dropping SYS_RA_VERSION...
drop table SYS_RA_VERSION cascade constraints;
prompt Dropping SYS_SA_DEFREPORT...
drop table SYS_SA_DEFREPORT cascade constraints;
prompt Creating SYS_RA_ANALYSISEXPR...
create table SYS_RA_ANALYSISEXPR
(
  ANALYSIS_EXPR_ID   NUMBER not null,
  RA_NODE_ID         NUMBER,
  ANALYSIS_TYPE_ID   NUMBER,
  ANALYSIS_EXPR_TYPE NUMBER,
  MAX_RE_ID          NUMBER,
  MIN_RE_ID          NUMBER,
  MAX_VALUE          VARCHAR2(20),
  MIN_VALUE          VARCHAR2(20),
  BACKCOLOR          VARCHAR2(20),
  DISPLAYTEXT        VARCHAR2(4000),
  URL_ADDRESS        VARCHAR2(300),
  AE_IMAGE           VARCHAR2(100),
  MEASURE_ID         VARCHAR2(30),
  DIMENSION_ID       VARCHAR2(30),
  HIERARCHY_ID       VARCHAR2(30),
  BIGEVT_TYPE_ID     VARCHAR2(30),
  BIGEVT_LEV_ID      VARCHAR2(30),
  DATE_DIMENSION_ID  VARCHAR2(30),
  DATE_HIERARCHY_ID  VARCHAR2(30),
  GEO_DIMENSION_ID   VARCHAR2(30),
  GEO_HIERARCHY_ID   VARCHAR2(30),
  AE_STATE           VARCHAR2(10),
  ANALYSIS_EXPR_DESC VARCHAR2(300),
  TOPN               VARCHAR2(20),
  IS_RELEVANCE_MEA   VARCHAR2(20),
  LEVEL_ID           VARCHAR2(30),
  ISPUBLIC           VARCHAR2(10),
  ANDOR              VARCHAR2(10),
  MAXANDORMIN        VARCHAR2(10),
  USER_ID            NUMBER,
  EXP_RELATION       VARCHAR2(500),
  ORDER_INDEX        NUMBER,
  VERSION            NUMBER,
  VERSION_DESC       VARCHAR2(200),
  FACT_ID            NUMBER
)
tablespace MDWH
  pctfree 10
  pctused 40
  initrans 1
  maxtrans 255
  storage
  (
    initial 64K
    next 8K
    minextents 1
    maxextents unlimited
  );
comment on column SYS_RA_ANALYSISEXPR.ANALYSIS_EXPR_ID
  is '0';
comment on column SYS_RA_ANALYSISEXPR.RA_NODE_ID
  is '1';
comment on column SYS_RA_ANALYSISEXPR.ANALYSIS_TYPE_ID
  is '2';
comment on column SYS_RA_ANALYSISEXPR.ANALYSIS_EXPR_TYPE
  is '3';
comment on column SYS_RA_ANALYSISEXPR.MAX_RE_ID
  is '4';
comment on column SYS_RA_ANALYSISEXPR.MIN_RE_ID
  is '5';
comment on column SYS_RA_ANALYSISEXPR.MAX_VALUE
  is '6';
comment on column SYS_RA_ANALYSISEXPR.MIN_VALUE
  is '7';
comment on column SYS_RA_ANALYSISEXPR.BACKCOLOR
  is '8';
comment on column SYS_RA_ANALYSISEXPR.DISPLAYTEXT
  is '9';
comment on column SYS_RA_ANALYSISEXPR.URL_ADDRESS
  is '10';
comment on column SYS_RA_ANALYSISEXPR.AE_IMAGE
  is '11';
comment on column SYS_RA_ANALYSISEXPR.MEASURE_ID
  is '12';
comment on column SYS_RA_ANALYSISEXPR.DIMENSION_ID
  is '13';
comment on column SYS_RA_ANALYSISEXPR.HIERARCHY_ID
  is '14';
comment on column SYS_RA_ANALYSISEXPR.BIGEVT_TYPE_ID
  is '15';
comment on column SYS_RA_ANALYSISEXPR.BIGEVT_LEV_ID
  is '16';
comment on column SYS_RA_ANALYSISEXPR.DATE_DIMENSION_ID
  is '17';
comment on column SYS_RA_ANALYSISEXPR.DATE_HIERARCHY_ID
  is '18';
comment on column SYS_RA_ANALYSISEXPR.GEO_DIMENSION_ID
  is '19';
comment on column SYS_RA_ANALYSISEXPR.GEO_HIERARCHY_ID
  is '20';
comment on column SYS_RA_ANALYSISEXPR.AE_STATE
  is '21';
comment on column SYS_RA_ANALYSISEXPR.ANALYSIS_EXPR_DESC
  is '22';
comment on column SYS_RA_ANALYSISEXPR.TOPN
  is '23';
comment on column SYS_RA_ANALYSISEXPR.IS_RELEVANCE_MEA
  is '24';
comment on column SYS_RA_ANALYSISEXPR.LEVEL_ID
  is '25';
comment on column SYS_RA_ANALYSISEXPR.ISPUBLIC
  is '//是否为公共预警  26';
comment on column SYS_RA_ANALYSISEXPR.ANDOR
  is '//指标表达式之间的逻辑关系  27';
comment on column SYS_RA_ANALYSISEXPR.MAXANDORMIN
  is '//最大值表达式与最小值表达式直接的逻辑关系  28';
comment on column SYS_RA_ANALYSISEXPR.USER_ID
  is '29';
comment on column SYS_RA_ANALYSISEXPR.EXP_RELATION
  is '//指标表达式之间的逻辑关系  30';
comment on column SYS_RA_ANALYSISEXPR.ORDER_INDEX
  is '//指标表达式的顺序  31';
comment on column SYS_RA_ANALYSISEXPR.VERSION
  is '//1代表当前版本 0代表上一版本  32';
comment on column SYS_RA_ANALYSISEXPR.VERSION_DESC
  is '版本号   33';
comment on column SYS_RA_ANALYSISEXPR.FACT_ID
  is '事实id   34';

prompt Creating SYS_RA_ANALYSISTYPE...
create table SYS_RA_ANALYSISTYPE
(
  ANALYSIS_TYPE_ID     NUMBER not null,
  ANALYSIS_TYPE_DESC   VARCHAR2(20),
  ANALYSIS_TYPE_KEY    VARCHAR2(20),
  UNIT                 VARCHAR2(20),
  ANALYSIS_TYPE_REMARK VARCHAR2(200)
)
tablespace MDWH
  pctfree 10
  pctused 40
  initrans 1
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );
alter table SYS_RA_ANALYSISTYPE
  add constraint PK_SYS_RA_ANALYSISTYPE primary key (ANALYSIS_TYPE_ID)
  using index 
  tablespace MDWH
  pctfree 10
  initrans 2
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );

prompt Creating SYS_RA_LEVEL_REL...
create table SYS_RA_LEVEL_REL
(
  REPORT_ID    NUMBER,
  VERSION_DESC VARCHAR2(200),
  RA_NODE_ID   NUMBER,
  DIM_ID       NUMBER,
  LEVEL_IDS    VARCHAR2(500),
  FACT_ID      NUMBER
)
tablespace MDWH
  pctfree 10
  pctused 40
  initrans 1
  maxtrans 255
  storage
  (
    initial 16K
    next 8K
    minextents 1
    maxextents unlimited
  );
comment on column SYS_RA_LEVEL_REL.REPORT_ID
  is '报表id 0';
comment on column SYS_RA_LEVEL_REL.VERSION_DESC
  is '版本号 1';
comment on column SYS_RA_LEVEL_REL.RA_NODE_ID
  is '2';
comment on column SYS_RA_LEVEL_REL.DIM_ID
  is '3';
comment on column SYS_RA_LEVEL_REL.LEVEL_IDS
  is '关联粒度的所有id  用逗号隔开 4';
comment on column SYS_RA_LEVEL_REL.FACT_ID
  is '5';

prompt Creating SYS_RA_LINE...
create table SYS_RA_LINE
(
  LINE_ID      NUMBER not null,
  FROM_NODE    VARCHAR2(50),
  TO_NODE      VARCHAR2(50),
  LINE_NAME    VARCHAR2(50),
  LINE_TYPE    VARCHAR2(50),
  LINE_M       VARCHAR2(50),
  REPORT_ID    NUMBER not null,
  VERSION_DESC VARCHAR2(200)
)
tablespace MDWH
  pctfree 10
  pctused 40
  initrans 1
  maxtrans 255
  storage
  (
    initial 16K
    next 8K
    minextents 1
    maxextents unlimited
  );
comment on column SYS_RA_LINE.LINE_ID
  is '连线id 0';
comment on column SYS_RA_LINE.FROM_NODE
  is '连线开始节点id 1';
comment on column SYS_RA_LINE.TO_NODE
  is '连线结束节点id 2';
comment on column SYS_RA_LINE.LINE_NAME
  is '连线名字 3';
comment on column SYS_RA_LINE.LINE_TYPE
  is '连线类型如： s1 lr tb等 4';
comment on column SYS_RA_LINE.LINE_M
  is '用于存储折线的M值 5';
comment on column SYS_RA_LINE.REPORT_ID
  is '所属报表id 6';
comment on column SYS_RA_LINE.VERSION_DESC
  is '版本号 7';

prompt Creating SYS_RA_NODE...
create table SYS_RA_NODE
(
  RA_NODE_ID        NUMBER not null,
  IS_START          VARCHAR2(20),
  NODE_TYPE         VARCHAR2(30),
  PARENT_NODE       NUMBER,
  DEFAULT_TEXT      VARCHAR2(4000),
  REPORT_ID         NUMBER,
  URL_ADDRESS       VARCHAR2(300),
  WIDTH             NUMBER,
  HEIGHT            NUMBER,
  TOP               NUMBER,
  LEFT              NUMBER,
  RA_NODE_DESC      VARCHAR2(50),
  DEFAULT_BACKCOLOR VARCHAR2(20),
  PARENT_STATE      VARCHAR2(10),
  DEFAULT_IMAGE     VARCHAR2(50),
  ISSHOWCOUNT       NUMBER,
  LEVELLINK         VARCHAR2(200),
  DIMENSIONFILTER   VARCHAR2(2000),
  VERSION           NUMBER,
  VERSION_DESC      VARCHAR2(200),
  ISTRUECONDITION   NUMBER
)
tablespace MDWH
  pctfree 10
  pctused 40
  initrans 1
  maxtrans 255
  storage
  (
    initial 64K
    next 8K
    minextents 1
    maxextents unlimited
  );
comment on column SYS_RA_NODE.RA_NODE_ID
  is '0';
comment on column SYS_RA_NODE.IS_START
  is '1';
comment on column SYS_RA_NODE.NODE_TYPE
  is '2';
comment on column SYS_RA_NODE.PARENT_NODE
  is '3';
comment on column SYS_RA_NODE.DEFAULT_TEXT
  is '4';
comment on column SYS_RA_NODE.REPORT_ID
  is '5';
comment on column SYS_RA_NODE.URL_ADDRESS
  is '6';
comment on column SYS_RA_NODE.WIDTH
  is '7';
comment on column SYS_RA_NODE.HEIGHT
  is '8';
comment on column SYS_RA_NODE.TOP
  is '9';
comment on column SYS_RA_NODE.LEFT
  is '10';
comment on column SYS_RA_NODE.RA_NODE_DESC
  is '11';
comment on column SYS_RA_NODE.DEFAULT_BACKCOLOR
  is '12';
comment on column SYS_RA_NODE.PARENT_STATE
  is '13';
comment on column SYS_RA_NODE.DEFAULT_IMAGE
  is '14';
comment on column SYS_RA_NODE.ISSHOWCOUNT
  is '//该节点是否显示异常个数 0 不显示 1显示 15';
comment on column SYS_RA_NODE.LEVELLINK
  is '//父子节点间粒度转换关系16';
comment on column SYS_RA_NODE.DIMENSIONFILTER
  is '//维度过滤17';
comment on column SYS_RA_NODE.VERSION
  is '//1代表当前版本 0代表上一版本18';
comment on column SYS_RA_NODE.VERSION_DESC
  is '19';
comment on column SYS_RA_NODE.ISTRUECONDITION
  is '20';

prompt Creating SYS_RA_REPORTRELATION...
create table SYS_RA_REPORTRELATION
(
  TYPE_ID   NUMBER not null,
  REPORT_ID NUMBER not null
)
tablespace MDWH
  pctfree 10
  pctused 40
  initrans 1
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );

prompt Creating SYS_RA_REPORTTYPE...
create table SYS_RA_REPORTTYPE
(
  TYPE_ID       NUMBER not null,
  TYPE_DESC     VARCHAR2(200),
  TYPEPARENT_ID NUMBER,
  ISREPORT      NUMBER
)
tablespace MDWH
  pctfree 10
  pctused 40
  initrans 1
  maxtrans 255
  storage
  (
    initial 64K
    next 8K
    minextents 1
    maxextents unlimited
  );
comment on column SYS_RA_REPORTTYPE.TYPE_ID
  is '//流量分类id';
comment on column SYS_RA_REPORTTYPE.TYPE_DESC
  is '//流量分类名称';
comment on column SYS_RA_REPORTTYPE.TYPEPARENT_ID
  is '//父分类名称 无父则为0';
comment on column SYS_RA_REPORTTYPE.ISREPORT
  is '//0 代表分类 1 代表报表';

prompt Creating SYS_RA_RESULT...
create table SYS_RA_RESULT
(
  DATE_TYPE    VARCHAR2(100),
  DATE_DESC    VARCHAR2(200),
  NE_TYPE      VARCHAR2(100),
  NE_DESC      VARCHAR2(2000),
  HOUT_DESC    VARCHAR2(100),
  RESULT_VALUE VARCHAR2(200),
  RESULT_TYPE  VARCHAR2(100),
  REPORT_ID    NUMBER,
  USER_ID      NUMBER,
  LOAD_TIME    DATE default sysdate not null,
  NODE_NAME    VARCHAR2(100)
)
tablespace MDWH
  pctfree 10
  pctused 40
  initrans 1
  maxtrans 255
  storage
  (
    initial 2M
    next 1M
    minextents 1
    maxextents unlimited
  );

prompt Creating SYS_RA_RESULTNAME...
create table SYS_RA_RESULTNAME
(
  REPORT_ID NUMBER not null,
  RES_NAME  VARCHAR2(200)
)
tablespace MDWH
  pctfree 10
  pctused 40
  initrans 1
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );

prompt Creating SYS_RA_VERSION...
create table SYS_RA_VERSION
(
  REPORT_ID    NUMBER,
  VERSION_DESC VARCHAR2(200),
  ISDEFAULT    NUMBER default 0,
  CREATE_TIME  DATE default sysdate
)
tablespace MDWH
  pctfree 10
  pctused 40
  initrans 1
  maxtrans 255
  storage
  (
    initial 16K
    next 1M
    minextents 1
    maxextents unlimited
  );
comment on column SYS_RA_VERSION.REPORT_ID
  is '//报表id';
comment on column SYS_RA_VERSION.VERSION_DESC
  is '版本号';
comment on column SYS_RA_VERSION.ISDEFAULT
  is '是否是默认的版本';
comment on column SYS_RA_VERSION.CREATE_TIME
  is '版本生成时间';

prompt Creating SYS_SA_DEFREPORT...
create table SYS_SA_DEFREPORT
(
  REPORT_ID   NUMBER not null,
  CREATE_TYPE VARCHAR2(20),
  MODEL_TYPE  VARCHAR2(20),
  MODEL_FILE  VARCHAR2(100),
  XML_FILE    VARCHAR2(100),
  REMARK      VARCHAR2(100),
  LOAD_TIME   DATE
)
tablespace MDWH
  pctfree 10
  pctused 40
  initrans 1
  maxtrans 255
  storage
  (
    initial 64K
  );
alter table SYS_SA_DEFREPORT
  add constraint PK_SYS_SA_DEFREPORT primary key (REPORT_ID)
  using index 
  tablespace MDWH
  pctfree 10
  initrans 2
  maxtrans 255
  storage
  (
    initial 64K
  );

prompt Disabling triggers for SYS_RA_ANALYSISEXPR...
alter table SYS_RA_ANALYSISEXPR disable all triggers;
prompt Disabling triggers for SYS_RA_ANALYSISTYPE...
alter table SYS_RA_ANALYSISTYPE disable all triggers;
prompt Disabling triggers for SYS_RA_LEVEL_REL...
alter table SYS_RA_LEVEL_REL disable all triggers;
prompt Disabling triggers for SYS_RA_LINE...
alter table SYS_RA_LINE disable all triggers;
prompt Disabling triggers for SYS_RA_NODE...
alter table SYS_RA_NODE disable all triggers;
prompt Disabling triggers for SYS_RA_REPORTRELATION...
alter table SYS_RA_REPORTRELATION disable all triggers;
prompt Disabling triggers for SYS_RA_REPORTTYPE...
alter table SYS_RA_REPORTTYPE disable all triggers;
prompt Disabling triggers for SYS_RA_RESULT...
alter table SYS_RA_RESULT disable all triggers;
prompt Disabling triggers for SYS_RA_RESULTNAME...
alter table SYS_RA_RESULTNAME disable all triggers;
prompt Disabling triggers for SYS_RA_VERSION...
alter table SYS_RA_VERSION disable all triggers;
prompt Disabling triggers for SYS_SA_DEFREPORT...
alter table SYS_SA_DEFREPORT disable all triggers;
prompt Loading SYS_RA_ANALYSISEXPR...
prompt Table is empty
prompt Loading SYS_RA_ANALYSISTYPE...
prompt Table is empty
prompt Loading SYS_RA_LEVEL_REL...
prompt Table is empty
prompt Loading SYS_RA_LINE...
prompt Table is empty
prompt Loading SYS_RA_NODE...
prompt Table is empty
prompt Loading SYS_RA_REPORTRELATION...
prompt Table is empty
prompt Loading SYS_RA_REPORTTYPE...
prompt Table is empty
prompt Loading SYS_RA_RESULT...
prompt Table is empty
prompt Loading SYS_RA_RESULTNAME...
prompt Table is empty
prompt Loading SYS_RA_VERSION...
prompt Table is empty
prompt Loading SYS_SA_DEFREPORT...
prompt Table is empty
prompt Enabling triggers for SYS_RA_ANALYSISEXPR...
alter table SYS_RA_ANALYSISEXPR enable all triggers;
prompt Enabling triggers for SYS_RA_ANALYSISTYPE...
alter table SYS_RA_ANALYSISTYPE enable all triggers;
prompt Enabling triggers for SYS_RA_LEVEL_REL...
alter table SYS_RA_LEVEL_REL enable all triggers;
prompt Enabling triggers for SYS_RA_LINE...
alter table SYS_RA_LINE enable all triggers;
prompt Enabling triggers for SYS_RA_NODE...
alter table SYS_RA_NODE enable all triggers;
prompt Enabling triggers for SYS_RA_REPORTRELATION...
alter table SYS_RA_REPORTRELATION enable all triggers;
prompt Enabling triggers for SYS_RA_REPORTTYPE...
alter table SYS_RA_REPORTTYPE enable all triggers;
prompt Enabling triggers for SYS_RA_RESULT...
alter table SYS_RA_RESULT enable all triggers;
prompt Enabling triggers for SYS_RA_RESULTNAME...
alter table SYS_RA_RESULTNAME enable all triggers;
prompt Enabling triggers for SYS_RA_VERSION...
alter table SYS_RA_VERSION enable all triggers;
prompt Enabling triggers for SYS_SA_DEFREPORT...
alter table SYS_SA_DEFREPORT enable all triggers;
set feedback on
set define on
prompt Done.
