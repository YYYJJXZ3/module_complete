<%@ WebHandler Language="C#" Class="AlarmMonitor" %>

using System;
using System.Web;
using Boco.Dss.Web.JsHandlers;
using System.Data;
using System.Text;
using System.Configuration;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;
using Boco.Dss.Framework;
using Boco.Dss.ServiceManager.Entity;
using Boco.Dss.AutoAlarm;

public class AlarmMonitor : SmartGridHandler
{
    public override void Process(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        string qType = context.Request["qtype"];
        string strCon = context.Request["strCon"];
        JavaScriptSerializer jss = new JavaScriptSerializer();
        if (qType == "ManualDel")
        {
            ManualDel();
        }
        else if (qType == "SetAutoDel")
        {
            SetAutoDel(jss.Deserialize<AutoDelConfig>(strCon));
        }
        else
        {
            base.Process(context);
        }
    }

    public void SetAutoDel(AutoDelConfig config)
    {
        Service model = new Service();

        switch (config.AlarmLevel)
        {
            case "1": model.ServiceID = "910"; model.JobID = "911"; break;
            case "2": model.ServiceID = "920"; model.JobID = "921"; break;
            case "3": model.ServiceID = "930"; model.JobID = "931"; break;
            case "4": model.ServiceID = "940"; model.JobID = "941"; break;
        }

        model.ServiceName = "DeleteAlarm";
        model.ServiceType = "1";//生成方式，1表示DLL类库生成，2表示webservice生成
        model.FunctionName = "AutoDel";
        model.DllName = "Boco.Dss.AutoAlarm";
        model.DllPath = "Boco.Dss.AutoAlarm.dll";
        model.Parameters = config.AlarmLevel + ":" + config.DelType + ":" + config.Hour + ":" + config.Day;

        if (config.DelType == "2")//绝对时间
        {
            model.JobHour = config.Hour.ToString();
        }
        else if (config.DelType == "3")//相对时间
        {
            model.IsCountTime = "0";//1 按JOB_DAY、JOB_HOUR字段执行，0 每30秒执行一次
        }

        Boco.Dss.ServiceManager.Entity.Service s = new Boco.Dss.ServiceManager.Entity.Service();
        s.JobID = model.JobID;
        try
        {
            s.SetAttribute();
            Boco.Dss.ServiceManager.Entity.Result r = Boco.Dss.ServiceManager.Common.CommonHelp.Update(model.ToList());
        }
        catch (Exception)
        {
            Boco.Dss.ServiceManager.Entity.Result r = Boco.Dss.ServiceManager.Common.CommonHelp.Insert(model.ToList());
            throw;
        }
    }

    public void ManualDel()
    {
        var ids = HttpContext.Current.Request["pkcol"];

        string[] idStrArr = ids.Split('|');
        List<string> sqlList = new List<string>();
        foreach (string idStr in idStrArr)
        {
            string sqlDel = "UPDATE SYS_IP_WORKORDER SET IS_DELETE=1 WHERE TASKID='" + idStr + "'";
            sqlList.Add(sqlDel);
        }
        IList<int> a = Boco.Dss.Data.DbHelper.ExecuteNonQueryBySqlList(sqlList, GetConnction());
        int count = 0;
        foreach (var r in a)
        {
            count += r;
        }

        Result result = new Result(0, count.ToString());
        HttpContext.Current.Response.Write(result.ToJson());
    }

    public override DataTable GetData(SmartGridOption option)
    {
        StringBuilder strSql = new StringBuilder();
        DateTime start = DateTime.Now.AddDays(-30),
            end = DateTime.Now;
        if (option.Param1.IndexOf(":") > 0)
        {
            string[] arrTime = option.Param1.Split(':');
            start = DateTime.Parse(arrTime[0]);
            end = DateTime.Parse(arrTime[1]).AddDays(1);
        }
        strSql.Append("select t.taskid,t.task_title,");
        strSql.Append("t.event_time,t.province,t.region,t.other1,'告警指标','告警指标值','告警指标分母','告警指标分母值',t.task_content_1,t.levels ");
        strSql.Append("from sys_ip_workorder t left join sys_ip_systemname s on t.system_name = s.key ");//t.rule_name like '%%'
        strSql.Append("where t.is_delete=0 and t.event_time between to_date('" + start.ToString("yyyy-MM-dd") + "', 'yyyy-mm-dd hh24:mi:ss') ");
        strSql.Append("and to_date('" + end.ToString("yyyy-MM-dd") + "', 'yyyy-mm-dd hh24:mi:ss')");

        string sql = Boco.CommonToolLibrary.Sql.SqlHelper.PageSql(strSql.ToString(),
            "SQL_ConnStr",
            option.PageIndex - 1,
            option.PageSize,
            option.SortColIndex,
            option.SortDirection == 1 ? true : false,
            option.SecondSortColIndex,
            option.SecondSortDirection == 1 ? true : false);
        string[] arrTitles = { "告警序号", "告警标题", "告警时间", "告警省份", "告警地市", "告警小区", "告警指标", "告警指标值", "告警指标分母", "告警指标分母值", "告警门限", "告警级别" };
        DataTable dt = Boco.Dss.Data.DbHelper.GetDataBySql(sql, GetConnction());
        if (dt != null)
        {
            if (dt.Columns.Contains("_RN_"))
            {
                dt.Columns.Remove("_RN_");
            }
            for (int i = 0; i < dt.Columns.Count; i++)
            {
                if (i < arrTitles.Length)
                {
                    dt.Columns[i].ColumnName = arrTitles[i];
                }
            }

            for (int i = 0; i < dt.Rows.Count; i++)
            {
                Dictionary<string, string> dict = new Dictionary<string, string>();
                string[] content = dt.Rows[i]["告警门限"].ToString().Replace("\r\n", "").Replace("\r", "").Replace("\n", "").Replace("【", "").Split('】');
                for (int j = 0; j < content.Length; j++)
                {
                    if (!string.IsNullOrEmpty(content[j].ToString()))
                    {
                        if (j != 2)
                        {
                            dict.Add(content[j].Split(':')[0], content[j].Split(':')[1]);
                        }
                        else
                        {
                            dict.Add("表格", content[j]);
                        }
                    }
                }

                Dictionary<string, string> dictCol = new Dictionary<string, string>();

                string[] col = dict["表格"].Split(',');
                string[] item;
                string tmpKey;
                for (int j = 0; j < col.Length; j++)
                {
                    item = col[j].Split(':');
                    tmpKey = DropUnit(item[0]);
                    if (col[j].Contains(":") && !dictCol.ContainsKey(tmpKey))
                    {
                        dictCol.Add(tmpKey, item[1]);
                    }
                }

                dt.Rows[i]["告警门限"] = dict["告警规则"].Replace("异常", "");

                string mea = dt.Rows[i]["告警门限"].ToString();
                int startIdx = mea.IndexOf('[');
                int endIdx = mea.IndexOf(']');
                dt.Rows[i]["告警指标"] = mea.Substring(startIdx + 1, endIdx - startIdx - 1);
                dt.Rows[i]["告警指标值"] = dictCol[dt.Rows[i]["告警指标"].ToString()];
                dt.Rows[i]["告警省份"] = "吉林省";
                dt.Rows[i]["告警地市"] = dict.ContainsKey("地区") ? dict["地区"] : "";
            }
        }
        if (dt.Rows.Count < option.PageSize)
        {
            option.IsTotal = 0;
            option.TotalCount = dt.Rows.Count;
        }
        else
        {
            option.IsTotal = -1;
        }
        return dt;
    }

    public override int GetCount(SmartGridOption option)
    {
        StringBuilder strSql = new StringBuilder();
        DateTime start = DateTime.Now.AddDays(-30),
           end = DateTime.Now;
        if (option.Param1.IndexOf(":") > 0)
        {
            string[] arrTime = option.Param1.Split(':');
            start = DateTime.Parse(arrTime[0]);
            end = DateTime.Parse(arrTime[1]).AddDays(1);
        }
        strSql.Append("select count(*) from sys_ip_workorder t left join sys_ip_systemname s on t.system_name = s.key ");//t.rule_name like '%%'
        strSql.Append("where  t.event_time between to_date('" + start.ToString("yyyy-MM-dd") + "', 'yyyy-mm-dd hh24:mi:ss') ");
        strSql.Append("and to_date('" + end.ToString("yyyy-MM-dd") + "', 'yyyy-mm-dd hh24:mi:ss')");
        DataTable dt = Boco.Dss.Data.DbHelper.GetDataBySql(strSql.ToString(), GetConnction());
        int _default = 0;
        if (dt != null && dt.Rows.Count > 0)
        {
            int.TryParse(dt.Rows[0][0].ToString(), out _default);
        }
        return _default;
    }

    //删掉指标名中的单位
    private string DropUnit(string mea)
    {
        if (mea.Contains("（"))
        {
            mea = mea.Substring(0, mea.IndexOf("（"));
        }
        return mea;
    }

    ConnectionStringSettings GetConnction()
    {
        return System.Configuration.ConfigurationManager.ConnectionStrings["SQL_ConnStr"];
    }
}

public class Result
{
    public Result()
    {

    }

    public Result(int code, string message)
    {
        this.code = code;
        this.msg = message;
    }

    /// <summary>
    /// 编码
    /// </summary>
    public int code
    {
        get;
        set;
    }

    /// <summary>
    /// 消息
    /// </summary>
    public string msg
    {
        get;
        set;
    }
}