<%@ WebHandler Language="C#" Class="QuickQuery" %>

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Data;
using System.Web;
using Boco.CommonToolLibrary;
using Boco.Semantic.Entity;
using Boco.Semantic.EntityDB;
using Boco.QueryEngine;
using Boco.Dss.CustomAnalysis.Entity;
using Boco.Dss.Config;

public class QuickQuery : IHttpHandler, System.Web.SessionState.IReadOnlySessionState {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        string qType = context.Request["qtype"];
        string text = "Hello World";
        if (qType == "dim")
        {
            text = GetDimentionMember();
        }
        else if (qType == "tmps")
        {
            text = GetTemplates();
        }
        else if (qType == "trend")
        {
            text = GetTrendSource();
        }
        context.Response.Write(text);
    }

    private string GetTemplates()
    {
        string ids = HttpContext.Current.Request["tid"];
        List<Template> tmpList = new List<Template>();
        if (!string.IsNullOrEmpty(ids))
        {
            List<string> idList = ids.Split(',').ToList();
            tmpList = Boco.Dss.CustomAnalysis.EntityDB.TemplateDB.GetTemplateByIdList(idList);
            tmpList.ForEach(p => p.Analyzer.ShowUintInColumn = true);
        }
        string json = new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(tmpList);
        return json;
    }

    private string GetDimentionMember()
    {
        string dimID = HttpContext.Current.Request["dimid"];
        string levelName = HttpContext.Current.Request["levelname"];
        Sem_Dimension sd = DimensionDB.GetDimensionByID(dimID);
        Hierarchie hier = sd.Hierarchies.Find(p => p.Levels.Find(pp => pp.Name == levelName) != null);
        List<string> levelNameList = new List<string>();
        if (hier == null)
        {
            levelNameList.Add(levelName);
        }
        else
        {
            for (int i = 0; i < hier.Levels.Count; i++)
            {
                levelNameList.Add(hier.Levels[i].Name);
                if (hier.Levels[i].Name == levelName)
                {
                    break;
                }
            }
        }
        levelNameList.Reverse();
        int recount = 0;
        DataTable dt = null;
        if (levelName == "带宽")
        {
            dt = DimensionDB.GetDimensionAttributeMember(sd, levelNameList, new List<Level>(), 0, 2000, true, 0, false,
                out recount, false);
            dt.Columns.RemoveAt(0);
        }
        else
        {
            dt = DimensionDB.GetDimensionAttributeMember(sd, levelNameList, new List<Level>(), 0, 2000, false, -1, false,
                out recount, false);
        }
        FilterByDataRole(dt);
        string json = Boco.CommonToolLibrary.Table.TableHelper.CreateJsonParameters(dt);
        return json;
    }


    private DataTable FilterByDataRole(DataTable dt)
    {
        List<DataRoleItem> driList = Boco.Dss.Framework.UserOnLine.CurrentUser.DataRole.ItemList;
        if (driList.Count == 0)
        {
            return dt;
        }
        foreach (DataRoleItem dri in driList)
        {
            if (dri.MemberList.Count > 0)
            {
                int lastIndex = dt.Columns.Count - 1;
                if (dri.LevelName == dt.Columns[lastIndex].ColumnName)
                {
                    for (int i = dt.Rows.Count - 1; i > -1; i--)
                    {
                        if (dri.MemberList.Find(p => p.MemberDesc == dt.Rows[i][lastIndex].ToString()) == null)
                        {
                            dt.Rows.RemoveAt(i);
                        }
                    }
                    break;
                }
            }
        }
        return dt;
    }


    private string GetTrendSource()
    {
        string meaids = HttpContext.Current.Request["mea"];
        Analyzer ana = new Analyzer();
        foreach (string id in meaids.Split(','))
        {
            ana.MeasureList.Add(new Boco.QueryEngine.Measure() { MeasureID = id});
        }
        string ne = HttpContext.Current.Request["ne"];
        foreach (string s in ne.Split('$'))
        {
            int index = s.IndexOf(':');
            if (index > -1)
            {
                Dimension dim = new Dimension()
                {
                    LevelName = s.Substring(0, index),
                    ValType = ValType.In,
                    ValList = s.Substring(index + 1).Split('￥').ToList<string>()
                };
                ana.SliceDimList.Add(dim);
            }
        }
        string timeType = HttpContext.Current.Request["timetype"];
        string date = HttpContext.Current.Request["date"];
        if (timeType == "Day" || timeType == "日")
        {
            DateTime endTime = DateTime.Parse(date.Replace("年", "-").Replace("月", "-").Replace("日", ""));
            DateTime startTime = endTime.AddDays(-14);
            ana.RowDimList.Add(new Dimension()
            {
                LevelName = "日",
                ValType = ValType.Range,
                ValList = new List<string>() { startTime.ToString("yyyy年MM月dd日"),endTime.ToString("yyyy年MM月dd日") }
            });
        }
        else if (timeType == "Month" || timeType == "月")
        {
            DateTime endTime = DateTime.Parse(date.Replace("年", "-").Replace("月", "")+"-01");
            DateTime startTime = endTime.AddDays(-5);
            ana.RowDimList.Add(new Dimension()
            {
                LevelName = "月",
                ValType = ValType.Range,
                ValList = new List<string>() { startTime.ToString("yyyy年MM月"),endTime.ToString("yyyy年MM月") }
            });
        }
        else if (timeType == "Hour" || timeType == "小时")
        {
            ana.RowDimList.Add(new Dimension()
            {
                LevelName = "小时"
            });
            ana.SliceDimList.Add(new Dimension()
            {
                LevelName = "日",
                ValType = ValType.Equal,
                Val = date
            });
        }
        ana.ShowUintInColumn = true;
        DataTable dt = ana.GetData();
        string json = Boco.CommonToolLibrary.Table.TableHelper.CreateJsonParameters(dt);
        return json;
    }


    public bool IsReusable {
        get {
            return false;
        }
    }

}