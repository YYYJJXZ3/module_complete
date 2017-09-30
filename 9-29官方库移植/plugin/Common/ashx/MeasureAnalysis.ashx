<%@ WebHandler Language="C#" Class="MeasureAnalysis" %>

using System;
using System.Web;
using System.Collections.Generic;
using Boco.Semantic.Entity;
using Boco.Semantic.EntityDB;
using Boco.QueryEngine;
using System.Web.Script.Serialization;

public class MeasureAnalysis : Boco.Dss.Framework.HttpHandlerBase
{

    public override void Process(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        string qType = context.Request["qtype"];
        if (qType == "trend")
        {
            context.Response.Write(GetMeasureTrendAnalyzerString());
        }
        else
        {
            context.Response.Write("Hello World");
        }
    }

    private string GetMeasureTrendAnalyzerString()
    {
        string meaID = HttpContext.Current.Request["meaid"];
        List<Sem_Measure> smList = MeasureDB.GetMeasureWithRelateMeasures(meaID, MeasureRelationType.CalculateFactor);
        Sem_Measure sm = smList[0];
        Sem_Dimension sd = sm.RelatedDimensionList.Find(p => p.Name.StartsWith("日期维") || p.Name == "月份维");
        Level lvl = sd.Levels.Find(p => p.Name == "月" || p.Name == "日");
        Analyzer ana = new Analyzer();
        smList.ForEach(p => ana.MeasureList.Add(new Measure(p)));
        ana.RowDimList.Add(new Dimension() { DimensionID = sd.ID, DimensionName = sd.Name, LevelName = lvl.Name, DimensionType = DimensionType.Date });
        ana.SortSetting.SortColIndex = 0;
        ana.SortSetting.SortDirection = SortDirection.Asc;
        ana.ShowUintInColumn = true;

        //@jyt 增加下钻页面传来的过滤条件
        string key = HttpContext.Current.Request["cachekey"];
        if (!string.IsNullOrEmpty(key))
        {
            string aStr = Boco.Dss.Demo.CommonHelp.GetCache(key);
            JavaScriptSerializer jss = new JavaScriptSerializer();
            Analyzer a = new Analyzer(); ;
            if (!string.IsNullOrEmpty(aStr))
            {
                a = jss.Deserialize<Analyzer>(aStr);

                if (a != null)
                {
                    for (int i = 0; i < a.SliceDimList.Count; i++)
                    {
                        if (a.SliceDimList[i].LevelName == "日" || a.SliceDimList[i].LevelName == "月" || a.SliceDimList[i].LevelName == "小时")
                        {
                            a.SliceDimList.RemoveAt(i);
                            i--;
                        }
                    }

                    ana.MeasureFilter = a.MeasureFilter;
                    ana.SliceDimList = a.SliceDimList;
                }
            }
        }

        MeasureAnaSetting mas = new MeasureAnaSetting();
        mas.Ana = ana;
        List<Level> dateLevels = sd.Levels.FindAll(p => new List<string>() { "日", "月", "周", "小时" }.Contains(p.Name));
        dateLevels.ForEach(p => mas.DateLevels.Add(p.Name));
        return new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(mas);
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }


    class MeasureAnaSetting
    {
        public MeasureAnaSetting()
        {
            DateLevels = new List<string>();
        }

        public Analyzer Ana
        {
            get;
            set;
        }

        public List<string> DateLevels
        {
            get;
            set;
        }
    }



}