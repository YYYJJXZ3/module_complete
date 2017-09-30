<%@ WebHandler Language="C#" Class="Data" %>

using System;
using System.Web;
using System.Web.Script.Serialization;
using Boco.QueryEngine;
using Boco.Semantic.Entity;
using System.Collections.Generic;
using System.Data;

public class Data : Boco.Dss.Framework.HttpHandlerBase
{
    static string connSys = System.Configuration.ConfigurationManager.ConnectionStrings["SQL_ConnStr"].ConnectionString;
    static string connDm = System.Configuration.ConfigurationManager.ConnectionStrings["SQL_ConnDm"].ConnectionString;
    static string connFact = System.Configuration.ConfigurationManager.ConnectionStrings["dxtest_db"].ConnectionString;

    public override void Process(HttpContext context)
    {
        string strCon = context.Request["strCon"];
        ConModel model = new ConModel();
        JavaScriptSerializer jss = new JavaScriptSerializer();
        model = jss.Deserialize<ConModel>(strCon);

        string json = "";

        if (model.Type == "0")
        {
            json = GetSource(model);
        }
        else if (model.Type == "1")
        {
            json = Execute(model);
        }

        context.Response.Write(json);
    }

    public string GetSource(ConModel model)
    {
        DataTable dt = new DataTable();

        if (model.ConnStr != "" && model.ConnStr != null && model.ConnStr != "undefined")
        {
            string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[model.ConnStr].ConnectionString;
            dt = Boco.BLLEngine.CommonQuery.GetDataBySql(connStr, model.SQL);
        }
        else
        {
            dt = Boco.BLLEngine.CommonQuery.GetDataBySql(connFact, model.SQL);
        }

        return GetGrid(dt);
    }

    public string Execute(ConModel model)
    {
        if (model.ConnStr != "" && model.ConnStr != null && model.ConnStr != "undefined")
        {
            return Execute(model.ConnStr, model.SQL);
        }
        else
        {
            return Boco.BLLEngine.CommonQuery.ExecuteNonQueryBySql(connDm, model.SQL).ToString();
        }
    }

    public string Execute(string connStr, string sql)
    {
        connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connStr].ConnectionString;
        string[] sqlList = sql.Split('￥');
        try
        {
            Boco.BLLEngine.CommonQuery.ExecuteNonQueryBySqlList(connStr, sqlList);
            return "1";
        }
        catch (Exception)
        {
            return "-1";
        }
    }

    public static string GetGrid(DataTable dt)
    {
        var str = Boco.CommonToolLibrary.Table.TableHelper.CreateJsonParameters(dt, true, 2).TrimStart(new char[] { '{' });
        string json = string.Format("{0}\"page\":{1},\"records\":{2},{3}", "{", 1, dt.Rows.Count, str);
        json = json.Replace("\r", "").Replace("\n", "").Replace("\0", "");
        return json;
    }

    protected override bool NeedLogin
    {
        get
        {
            return false;
        }
    }
}


public class ConModel
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
    /// 时间，日、月
    /// </summary>
    public string Time
    {
        get;
        set;
    }

    /// <summary>
    /// 时间类型
    /// </summary>
    public string TimeType
    {
        get;
        set;
    }

    /// <summary>
    /// 用户分组
    /// </summary>
    public string Group
    {
        get;
        set;
    }

    /// <summary>
    /// 手机号
    /// </summary>
    public string MSISDN
    {
        get;
        set;
    }

    /// <summary>
    /// 终端厂家
    /// </summary>
    public string Vendor
    {
        get;
        set;
    }

    /// <summary>
    /// 终端型号
    /// </summary>
    public string TermType
    {
        get;
        set;
    }

    /// <summary>
    /// IMEI
    /// </summary>
    public string IMEI
    {
        get;
        set;
    }

    /// <summary>
    /// Tac
    /// </summary>
    public string Tac
    {
        get;
        set;
    }

    /// <summary>
    /// ConnStr
    /// </summary>
    public string ConnStr
    {
        get;
        set;
    }

    /// <summary>
    /// SQL
    /// </summary>
    public string SQL
    {
        get;
        set;
    }
}