<%@ WebHandler Language="C#" Class="ConfScore" %>
using System;
using System.Web;
using System.Web.Script.Serialization;
using System.Collections.Generic;
using System.Data;
using System.Configuration;

using Boco.CommonToolLibrary;
using Boco.QueryEngine;
using Boco.Dss.Demo;

public class ConfScore : Boco.Dss.Framework.HttpHandlerBase
{
    static string xmlPath = "~/plugin/Common/xml/ConfScore.xml";
    static string dbType = "oracle";//oracle、gp等
    static string nowFun = "sysdate";//sql中的当期时间函数，oracle下是sysdate、gp下是now()
    static string moduleName = "Demo专题";//专题名称
    static string tablePre = "";//表名前缀
    static ConnectionStringSettings sysConnStr = ConfigurationManager.ConnectionStrings["SQL_ConnStr"];
    static ConnectionStringSettings configConnStr = ConfigurationManager.ConnectionStrings["SQL_ConnStr"];//配置表所在库
    static string factSrc = "DW_Demo ";//事实所在的数据源

    public override void Process(System.Web.HttpContext context)
    {
        string strCon = context.Request["strCon"];
        string dataStr = context.Request["data"];
        ConfModel model = new ConfModel();
        JavaScriptSerializer jss = new JavaScriptSerializer();
        model = jss.Deserialize<ConfModel>(strCon);

        InitConfig(model.Flag);

        Data data = new Data();
        if (!String.IsNullOrEmpty(dataStr))
        {
            data = jss.Deserialize<Data>(dataStr);
        }

        string json = "";

        switch (model.Type)
        {
            case "getScoreWeight":
                json = GetScoreWeight();
                break;
            case "getTypeWeight":
                json = GetTypeWeight();
                break;
            case "getSubWeight":
                json = GetSubWeight(model.TypeId);
                break;
            case "updateTypeWeight":
                json = UpdateTypeWeight(data);
                break;
            case "updateSubWeight":
                json = UpdateSubWeight(data);
                break;
            case "syncMeasureFun":
                json = SyncMeasureFun();
                break;

            case "getScoreThreshold":
                json = GetScoreThreshold(model.TypeId, model.MeasureName);
                break;
            case "restoreScoreDefault":
                RestoreScoreDefault(model.TypeId);
                break;
            case "updateScoreThreshold":
                json = UpdateScoreThreshold(model.TypeId, model.Value1, model.Value2, model.Value3, model.Value4);
                break;
            default: break;
        }

        context.Response.Write(json);
    }

    //从xml中获取配置，初始化配置
    public void InitConfig(string flag)
    {
        ItemInfo item = GetItemInfo(xmlPath, "指标得分权重配置", flag);
        moduleName = item.value;
        configConnStr = ConfigurationManager.ConnectionStrings[item.Property1];
        dbType = item.Property2;
        factSrc = item.Property4;

        SqlParam model = new SqlParam();
        JavaScriptSerializer jss = new JavaScriptSerializer();
        model = jss.Deserialize<SqlParam>(item.Property3);
        if (!string.IsNullOrEmpty(model.TablePre))
        {
            tablePre = model.TablePre;
        }
        if (!string.IsNullOrEmpty(model.NowFun))
        {
            nowFun = model.NowFun;
        }
    }

    //获取所有的得分指标
    public string GetScoreWeight()
    {
        string sql =
            @"select 
            SCORE_MEASURE_DESC as 得分指标,
            (CAL_WEIGHTS * 100) as 权重
            from " + tablePre + @"APP_SCORE_CONFIG_SUB where MODULE_DESC='" + moduleName + "'";

        DataTable dt = GetDataBySql(sql);

        string json = GetGrid(dt);
        return json;
    }

    //获取分类的权重
    public string GetTypeWeight()
    {
        string sql =
            @"select 
            TYPE_DESC as 分类名称,
            (CAL_WEIGHTS * 100) as 权重,
            LOAD_TIME as 最后更新时间,
            '查看指标详情' as 操作,
            TYPE_ID
            from " + tablePre + @"APP_SCORE_CONFIG
            where MODULE_DESC='" + moduleName + @"' 
            order by TYPE_ID";

        DataTable dt = GetDataBySql(sql);

        string json = GetGrid(dt);
        return json;
    }

    //获取子项指标的权重
    public string GetSubWeight(string typeId)
    {
        string sql = String.Format(
            @"select 
            MEASURE_DESC as 指标名称,
            (CAL_WEIGHTS * 100) as 权重,
            LOAD_TIME as 最后更新时间
            from " + tablePre + @"APP_SCORE_CONFIG_SUB where MODULE_DESC='" + moduleName + @"' and TYPE_ID = {0}", typeId);

        DataTable dt = GetDataBySql(sql);

        string json = GetGrid(dt);
        return json;
    }

    //更新分类的权重
    private static string UpdateTypeWeight(Data data)
    {
        string info = "";
        List<string> sqlList = new List<string>();
        if (data.DataEntryList.Count > 0)
        {
            foreach (DataEntry de in data.DataEntryList)
            {
                string sql = String.Format(
                    @"update " + tablePre + @"APP_SCORE_CONFIG
                    set CAL_WEIGHTS = {0}, LOAD_TIME = " + nowFun + @" where MODULE_DESC='" + moduleName + @"' and TYPE_DESC = '{1}'", de.Value, de.Name);

                sqlList.Add(sql);
                info += sql + "\r\n";
            }
            ExecuteNonQueryBySqlList(sqlList);
        }
        return info;
    }

    //更新子项指标的权重
    private static string UpdateSubWeight(Data data)
    {
        string info = "";
        List<string> sqlList = new List<string>();
        if (data.DataEntryList.Count > 0)
        {
            foreach (DataEntry de in data.DataEntryList)
            {
                string sql = String.Format(
                    @"update " + tablePre + @"APP_SCORE_CONFIG_SUB
                    set CAL_WEIGHTS = {0}, LOAD_TIME = " + nowFun + @" where MODULE_DESC='" + moduleName + @"' and MEASURE_DESC = '{1}'", de.Value, de.Name);

                sqlList.Add(sql);
                info += sql + "\r\n";
            }
            ExecuteNonQueryBySqlList(sqlList);
        }
        return info;
    }

    //同步，将指标算法更新到语义层
    public string SyncMeasureFun()
    {
        List<string> sqlList = new List<string>();//要执行的批量sql

        string sql =
            @"select 
            TYPE_DESC,
            CAL_WEIGHTS
            from " + tablePre + @"APP_SCORE_CONFIG where MODULE_DESC='" + moduleName + @"'";

        DataTable dtType = GetDataBySql(sql);//分类得分

        sql = @"
            select TYPE_DESC,SCORE_MEASURE_DESC,CAL_WEIGHTS
            from " + tablePre + @"APP_SCORE_CONFIG_SUB 
            where MODULE_DESC='" + moduleName + @"'";

        DataTable dtSub = GetDataBySql(sql);//指标得分

        sql = @"
            select distinct t.fact_id from app_score_config_total t where t.module_desc='" + moduleName + @"'";
        DataTable dtFact = GetDataBySql(sql);//事实
        List<string> factList = new List<string>();
        foreach (DataRow drFact in dtFact.Rows)
        {
            if (!string.IsNullOrEmpty(drFact[0].ToString()))
            {
                factList.Add(drFact[0].ToString());
            }
        }

        if (dtType.Rows.Count > 0 && dtSub.Rows.Count > 0)
        {
            List<string> measureList = new List<string>();
            foreach (DataRow drSub in dtSub.Rows)
            {
                measureList.Add(drSub[1].ToString());
            }

            sql = String.Format(@"
                select MEASURE_DESC,SELECT_COLUMN
                from sys_meta_measure 
                where " + (factList.Count > 0 ? (" fact_id in (" + String.Join(",", factList) + ") and ") : "") + @" MEASURE_DESC in ('{0}')", String.Join("','", measureList));

            DataTable dtMeasure = GetDataBySql(sql, sysConnStr);//指标算法

            if (dtMeasure.Rows.Count > 0)
            {
                Dictionary<string, string> dictMeasure = new Dictionary<string, string>();//指标算法字典
                foreach (DataRow drMeasure in dtMeasure.Rows)
                {
                    if (!dictMeasure.ContainsKey(drMeasure[0].ToString()))
                    {
                        dictMeasure.Add(drMeasure[0].ToString(), drMeasure[1].ToString());
                    }
                }

                #region ======生成修改“分类得分算法”的sql======

                Dictionary<string, string> dictType = new Dictionary<string, string>();//分类算法字典
                foreach (DataRow drType in dtType.Rows)
                {
                    string typeDesc = drType[0].ToString();
                    List<string> innerSqlList = new List<string>();
                    foreach (DataRow drSub in dtSub.Rows)
                    {
                        if (typeDesc == drSub[0].ToString())
                        {
                            string colName = dictMeasure[drSub[1].ToString()];
                            string innerSql = String.Format(
                                "{0}*{1}", colName, drSub[2].ToString());
                            innerSqlList.Add(innerSql);
                        }
                    }
                    if (innerSqlList.Count > 0)
                    {
                        string selectColumn = String.Join("+", innerSqlList);

                        dictType.Add(typeDesc, selectColumn);

                        string outerSql = String.Format(
                            @"update sys_meta_measure set LOAD_TIME = SYSDATE, SELECT_COLUMN = '{0}', SELECT_FUNCTION = 'AVG({0})' 
                            where " + (factList.Count > 0 ? (" fact_id in (" + String.Join(",", factList) + ") and ") : "") + @" MEASURE_DESC = '{1}'",
                            selectColumn, typeDesc);

                        sqlList.Add(outerSql);
                    }
                }

                #endregion

                #region ======生成修改“总得分算法”的sql======

                sql = @"
                    select t.t_id,t.type_id,c.type_desc from app_score_relation_tt t ,app_score_config c where t.type_id=c.type_id and t.module_desc='" + moduleName + "'";
                DataTable dtRelation = GetDataBySql(sql);//总得分与分类得分的关系

                sql = @"
                    select t.t_id,t.t_desc,t.fact_id from app_score_config_total t where t.module_desc='" + moduleName + @"'";
                DataTable dtTotal = GetDataBySql(sql);//总得分
                foreach (DataRow drTotal in dtTotal.Rows)
                {
                    List<string> totalFunList = new List<string>();
                    foreach (DataRow drRelation in dtRelation.Rows)
                    {
                        if (drTotal["T_ID"].ToString() == drRelation["T_ID"].ToString())
                        {
                            totalFunList.Add(dictType[drRelation["TYPE_DESC"].ToString()]);
                        }
                    }

                    if (totalFunList.Count > 0)
                    {
                        string selectColumn = String.Join("+", totalFunList);
                        string outerSql = String.Format(
                            @"update sys_meta_measure set LOAD_TIME = SYSDATE, SELECT_COLUMN = '{0}', SELECT_FUNCTION = 'AVG({0})' 
                        where " + (!string.IsNullOrEmpty(drTotal["FACT_ID"].ToString()) ? (" fact_id in (" + drTotal["FACT_ID"] + ") and ") : "") + @" MEASURE_DESC = '" + drTotal["T_DESC"] + "'", selectColumn);

                        sqlList.Add(outerSql);
                    }
                }

                #endregion

                if (sqlList.Count > 0)
                {
                    ExecuteNonQueryBySqlList(sqlList, sysConnStr);
                }
            }
        }

        return "";
    }

    //获取指标得分阈值等信息
    public string GetScoreThreshold(string typeId, string measureName)
    {
        string sql = String.Format(
            @"select 
            MEASURE_DESC as 指标名称,
            TYPE_DESC as 所属分类,
            STANDARD_VALUE as 达标值,
            GOOD_VALUE as 优秀值,
            '达标值得分' || STANDARD_SCORE || '，优秀值得分' || GOOD_SCORE || '，线性得分' as 指标得分规则,
            '调整,恢复默认' as 操作,
            MEASURE_ID,
            STANDARD_SCORE,
            GOOD_SCORE
            from " + tablePre + @"APP_SCORE_CONFIG_SUB where MODULE_DESC='" + moduleName + @"' ");

        if (!string.IsNullOrEmpty(typeId) && !"-1".Equals(typeId))
        {
            sql += string.Format(" and TYPE_ID = {0}", typeId);
        }
        if (!String.IsNullOrEmpty(measureName))
        {
            sql += string.Format(" and MEASURE_DESC like '%{0}%'", measureName.ToUpper());
        }
        sql += " order by  TYPE_DESC";

        DataTable dt = GetDataBySql(sql);

        string json = GetGrid(dt);
        return json;
    }

    //恢复默认的指标得分阈值
    private static void RestoreScoreDefault(string id)
    {
        string sql = String.Format(
            @"update " + tablePre + @"APP_SCORE_CONFIG_SUB
            set STANDARD_VALUE = DEFAULT_STANDARD_VALUE,STANDARD_SCORE=DEFAULT_STANDARD_SCORE, GOOD_VALUE = DEFAULT_GOOD_VALUE,GOOD_SCORE=DEFAULT_GOOD_SCORE where MEASURE_ID = {0}", id);

        ExecuteNonQueryBySql(sql);
    }

    private static string UpdateScoreThreshold(string id, string value1, string value2, string value3, string value4)
    {
        string sql = String.Format(
            @"update " + tablePre + @"APP_SCORE_CONFIG_SUB set 
            STANDARD_VALUE = {0}, GOOD_VALUE = {1}, 
            STANDARD_SCORE = {2}, GOOD_SCORE = {3} 
            where MEASURE_ID = {4}", value1.Trim(), value2.Trim(), value3.Trim(), value4.Trim(), id);

        ExecuteNonQueryBySql(sql);
        return sql;
    }

    private static DataTable GetDataBySql(string sql)
    {
        return GetDataBySql(sql, configConnStr);
    }

    private static DataTable GetDataBySql(string sql, ConnectionStringSettings css)
    {
        return Boco.Dss.Data.DbHelper.GetDataBySql(sql, css);
    }

    private static void ExecuteNonQueryBySql(string sql)
    {
        Boco.Dss.Data.DbHelper.ExecuteNonQueryBySql(sql, configConnStr);
    }

    private static void ExecuteNonQueryBySqlList(List<string> sql)
    {
        ExecuteNonQueryBySqlList(sql, configConnStr);
    }

    private static void ExecuteNonQueryBySqlList(List<string> sql, ConnectionStringSettings css)
    {
        Boco.Dss.Data.DbHelper.ExecuteNonQueryBySqlList(sql, css);
    }

    private static string GetGrid(System.Data.DataTable dt)
    {
        return Boco.CommonToolLibrary.Table.TableHelper.CreateJsonParameters(dt);
    }

    public static ItemInfo GetItemInfo(string xmlPath, string listKey, string itemKey)
    {
        string xmlPhyPath = HttpContext.Current.Server.MapPath(xmlPath);
        ItemInfo item = Boco.CommonToolLibrary.ConfigListInfoDB.GetListItem(xmlPhyPath, listKey, itemKey);
        return item;
    }
}

public class Data
{
    public List<DataEntry> DataEntryList { get; set; }
}

public class DataEntry
{
    public string Name { get; set; }
    public string Value { get; set; }
}

//sql的一些参数
public class SqlParam
{
    public string TablePre { get; set; }//表名前缀
    public string NowFun { get; set; }//当前时间的函数
}

public class ConfModel
{
    /// <summary>
    /// 操作类型
    /// </summary>
    public string Type
    {
        get;
        set;
    }
    /// <summary>
    /// 标识
    /// </summary>
    public string Flag
    {
        get;
        set;
    }
    public string TypeId
    {
        get;
        set;
    }
    public string MeasureName
    {
        get;
        set;
    }

    public string Value1
    {
        get;
        set;
    }

    public string Value2
    {
        get;
        set;
    }

    public string Value3
    {
        get;
        set;
    }

    public string Value4
    {
        get;
        set;
    }
}