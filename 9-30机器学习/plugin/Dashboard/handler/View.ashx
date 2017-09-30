<%@ WebHandler Language="C#" Class="View" %>

using System;
using System.Web;
using Boco.Dss.CustomAnalysis.EntityDB;
using System.Web.Script.Serialization;
using Boco.Dss.CustomAnalysis.Entity.DashBoard;
using Boco.QueryEngine;
using System.Data;
using System.Collections.Generic;
using Boco.Dss.CustomAnalysis.Entity;
using System.Text;
/*----------------------------------------------------------------
    // Copyright (C) 2015 北京亿阳信通新产品预言
    // 版权所有。 
    //
    // 文件名：View.cs
    // 文件功能描述：报表归属路径
    //
    // 
    // 创建标识：hufenghcao 20150328
    //
    // 修改标识：hufenghcao 20150328
    // 修改描述：GetListTeplate获取方式，提高性能
    //
//----------------------------------------------------------------*/
public class View : Boco.Dss.Framework.HttpHandlerBase
{
    public override void Process(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        string actintype = context.Request["act"];
        string jsonData = "";
        switch (actintype.ToLower())
        {
            case "dashboard":
                jsonData = GetDashBoard(context);
                break;
            case "getreportdataandoption":
                jsonData = GetReportDataAndOption(context);
                break;
            case "getalltemplate":
                jsonData = GetListTeplate(context);
                break;
        }
        context.Response.Write(jsonData);
    }
    /// <summary>
    /// 根据ID获取对象
    /// </summary>
    /// <param name="context"></param>
    /// <returns></returns>
    private string GetListTeplate(HttpContext context)
    {
        string strCon = context.Request["strCon"];
        JavaScriptSerializer jss = new JavaScriptSerializer();
        List<string> templaeList = jss.Deserialize<List<string>>(strCon);
        List<ParamNode> nodeList = new List<ParamNode>();
        string param = context.Request["param"]; ;
        if (!string.IsNullOrEmpty(param))
        {
            nodeList = jss.Deserialize<List<ParamNode>>(param);
        }
        List<Template> list = TemplateDB.GetTemplateByIdList(templaeList);
        StringBuilder sb = new StringBuilder();
        sb.Append("{");
        for (int i = 0; i < list.Count; i++)
        {
            Template template = list[i];
            SetDimValue(template, nodeList);
            sb.Append("\"" + list[i].TemplateID + "\":" + jss.Serialize(list[i]));
            if (i < list.Count - 1)
            {
                sb.Append(",");
            }
        }
        sb.Append("}");
        return sb.ToString();
    }
    /// <summary>
    /// 得到报表的配置信息和数据
    /// </summary>
    /// <param name="context"></param>
    /// <returns></returns>
    public string GetReportDataAndOption(HttpContext context)
    {
        int reportid = 0;
        int.TryParse(context.Request["reportid"], out reportid);
        JavaScriptSerializer json = new JavaScriptSerializer();
        List<ParamNode> nodeList = new List<ParamNode>(); ;
        string param = context.Request["param"];
        if (!string.IsNullOrEmpty(param))
        {
            nodeList = json.Deserialize<List<ParamNode>>(param);
        }
        Boco.Dss.CustomAnalysis.Entity.Template template = TemplateDB.GetTemplateByID(reportid);
        SetDimValue(template, nodeList);
        return json.Serialize(template);
    }

    /// <summary>
    /// 得到报表
    /// </summary>
    /// <param name="context"></param>
    /// <returns></returns>
    private string GetDashBoard(HttpContext context)
    {
        var dashboardId = context.Request["dashboardId"];
        var listid = context.Request["listid"];
        string param = context.Request["param"];
        JavaScriptSerializer json = new JavaScriptSerializer();
        List<ParamNode> nodeList = new List<ParamNode>(); ;
        if (!string.IsNullOrEmpty(param))
        {
            nodeList = json.Deserialize<List<ParamNode>>(param);
        }
        Dashboard dashboard;
        if (!string.IsNullOrEmpty(dashboardId))
        {
            dashboard = DashboardDB.Selcet(dashboardId, 1);
        }
        else
        {
            dashboard = DashboardDB.SelectByListId(listid);
        }
        if (dashboard.Conditions.Count > 0)
        {
            List<string> timeType = new List<string>() { "日", "月", "周", "季度", "年", "半年" };
            for (int i = 0; i < dashboard.Conditions.Count; i++)
            {
                if (dashboard.Conditions[i].IsUse)
                {
                    ParamNode pn = nodeList.Find(p => p.k == dashboard.Conditions[i].LevelName);
                    if (pn != null)
                    {
                        dashboard.Conditions[i].DefaultValue = pn.t ?? pn.v;
                    }

                    if (timeType.Contains(dashboard.Conditions[i].LevelName))
                    {
                        if (pn == null)
                        {
                            for (int j = 0; j < dashboard.Conditions[i].DimGroup.Count; j++)
                            {
                                pn = nodeList.Find(p => p.k == dashboard.Conditions[i].DimGroup[j]);
                                if (pn != null)
                                {
                                    break;
                                }
                            }
                        }
                        if (pn != null)
                        {
                            dashboard.Conditions[i].DimGroup.Remove(pn.k);
                            dashboard.Conditions[i].DimGroup.Insert(0, pn.k);
                        }
                        if (!string.IsNullOrEmpty(dashboard.Conditions[i].DefaultValue))
                        {
                            dashboard.Conditions[i].DefaultValue = FormatLevelVal(dashboard.Conditions[i].DefaultValue, dashboard.Conditions[i].LevelName);
                        }
                    }
                    else if (dashboard.Conditions[i].LevelName == "小时")
                    {
                        if (pn != null)
                        {
                            dashboard.Conditions[i].HasAll = true;
                        }
                    }
                }
            }
        }

        return json.Serialize(dashboard);
    }
    /// <summary>
    /// 将昨天、上月等特殊时间转为实际时间，如“今天”转为“yyyy年MM月dd日”
    /// </summary>
    /// <param name="val"></param>
    /// <param name="levelName"></param>
    /// <returns></returns>
    private string FormatLevelVal(string val, string levelName)
    {
        if (string.IsNullOrEmpty(val))
        {
            return "";
        }
        else if (levelName != "日" && levelName != "月" && levelName != "周")
        {
            return val;
        }
        else
        {
            if (levelName == "日")
            {
                val = val.Replace("昨天", DateTime.Now.AddDays(-1).ToString("yyyy年MM月dd日")).Replace("前天",
                    DateTime.Now.AddDays(-2).ToString("yyyy年MM月dd日")).Replace("上周同一天",
                    DateTime.Now.AddDays(-8).ToString("yyyy年MM月dd日")).Replace("上月同一天",
                    DateTime.Now.AddDays(-1).AddMonths(-1).ToString("yyyy年MM月dd日")).Replace("今天",
                    DateTime.Now.ToString("yyyy年MM月dd日"));
            }
            else if (levelName == "月")
            {
                val = val.Replace("上上月", DateTime.Now.AddMonths(-2).ToString("yyyy年MM月")).Replace("上月",
                    DateTime.Now.AddMonths(-1).ToString("yyyy年MM月")).Replace("去年同期",
                   DateTime.Now.AddMonths(-1).AddYears(-1).ToString("yyyy年MM月")).Replace("本月",
                   DateTime.Now.ToString("yyyy年MM月"));
            }
            else
            {
                DateTime lastWeek = DateTime.Now.AddDays(-7);
                DateTime lastLastWeek = DateTime.Now.AddDays(-14);
                DateTime tbWeek = DateTime.Now.AddDays(-7).AddYears(-1);
                val = val.Replace("上上周", lastLastWeek.Year.ToString() + "年" + Boco.CommonToolLibrary.DateTimeHelper.GetNumWeekToYear(lastLastWeek).ToString("00") + "周").Replace("上周",
                    lastWeek.Year.ToString() + "年" + Boco.CommonToolLibrary.DateTimeHelper.GetNumWeekToYear(lastWeek).ToString("00") + "周").Replace("去年同期",
                  tbWeek.Year.ToString() + "年" + Boco.CommonToolLibrary.DateTimeHelper.GetNumWeekToYear(tbWeek).ToString("00") + "周").Replace("本周",
                  DateTime.Now.Year.ToString() + "年" + Boco.CommonToolLibrary.DateTimeHelper.GetNumWeekToYear(DateTime.Now).ToString("00") + "周");
            }
            return val;
        }
    }
    private void SetDimValue(Template template, List<ParamNode> nodeList)
    {
        if (template != null)
        {
            if (nodeList.Count > 0)
            {
                for (int i = 0; i < template.Analyzer.RowDimList.Count; i++)
                {
                    ParamNode pn = nodeList.Find(p => p.k == template.Analyzer.RowDimList[i].LevelName);
                    if (pn != null)
                    {
                        template.Analyzer.RowDimList[i].Val = pn.v;
                    }
                }
                for (int i = 0; i < template.Analyzer.SliceDimList.Count; i++)
                {
                    ParamNode pn = nodeList.Find(p => p.k == template.Analyzer.SliceDimList[i].LevelName);
                    if (pn != null)
                    {
                        template.Analyzer.SliceDimList[i].Val = pn.v;
                    }
                }
                for (int i = 0; i < template.Analyzer.ColDimList.Count; i++)
                {
                    ParamNode pn = nodeList.Find(p => p.k == template.Analyzer.ColDimList[i].LevelName);
                    if (pn != null)
                    {
                        template.Analyzer.ColDimList[i].Val = pn.v;
                    }
                }
            }
        }
    }
    class ParamNode
    {
        public string k { get; set; }
        public string t { get; set; }
        public string v { get; set; }
    }
}