insert into sys_ra_analysistype (ANALYSIS_TYPE_ID, ANALYSIS_TYPE_DESC, ANALYSIS_TYPE_KEY, UNIT, ANALYSIS_TYPE_REMARK)
values (1, '同比增幅预警', 'TB', '%', '获取与历史同期比较做增长幅度根据表达式判断.同比:以年为差距单位，如今年跟去年比；今年季度跟去年季度比；今年月份跟去年季度比');

insert into sys_ra_analysistype (ANALYSIS_TYPE_ID, ANALYSIS_TYPE_DESC, ANALYSIS_TYPE_KEY, UNIT, ANALYSIS_TYPE_REMARK)
values (2, '环比增幅预警', 'HB', '%', '获取与上一统计段比较做增长幅度根据表达式判断.环比:以比较的时间跨度为差距单位，如：今年跟去年比；今年季度跟今年季度比；今年月跟今年月比。');

insert into sys_ra_analysistype (ANALYSIS_TYPE_ID, ANALYSIS_TYPE_DESC, ANALYSIS_TYPE_KEY, UNIT, ANALYSIS_TYPE_REMARK)
values (3, '指标值预警', 'Value', '%', '获取当前值根据表达式判断.');

