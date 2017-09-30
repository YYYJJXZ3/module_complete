<%@ WebHandler Language="C#" Class="AnalystData" %>

using System;
using System.Web;
using System.Data;
using Boco.QueryEngine;
using System.Collections.Generic;
using Boco.Semantic.Entity;
using System.Linq;
using System.Text;
using System.Web.Script.Serialization;
using Boco.Dss.CustomAnalysis.Second;

public class AnalystData : Boco.Dss.Framework.HttpHandlerBase
{
    public void GetSourceJson(HttpContext context)
    {
        string mea = context.Request["meaList"];
        string rowDimeasion = context.Request["Condition"];
        string getTimeStr = context.Request["getTimeStr"];
        string getHourStr = context.Request["getHourStr"];
        string getTimeType = context.Request["getTimeType"];
        Analyzer analyzer = new Analyzer();
        JavaScriptSerializer jss = new JavaScriptSerializer();
        List<Sem_Measure> meaList = DBCondition.GetListByMeasure(mea);
        Sem_Measure sm = meaList[0];
        analyzer.MeasureList.Add(new Boco.QueryEngine.Measure(meaList[0]));
        Boco.QueryEngine.Measure m1 = new Boco.QueryEngine.Measure(sm);
        m1.MeasureType = MeasureType.Ring;
        analyzer.MeasureList.Add(m1);
        Boco.QueryEngine.Measure m2 = new Boco.QueryEngine.Measure(sm);
        m2.MeasureType = MeasureType.RingGrowth;
        analyzer.MeasureList.Add(m2);
        Boco.QueryEngine.Measure m3 = new Boco.QueryEngine.Measure(sm);
        m3.MeasureType = MeasureType.YearOnYear;
        analyzer.MeasureList.Add(m3);
        Boco.QueryEngine.Measure m4 = new Boco.QueryEngine.Measure(sm);
        m4.MeasureType = MeasureType.YearOnYearGrowth;
        analyzer.MeasureList.Add(m4);
        analyzer.RowDimList = jss.Deserialize<List<Dimension>>(rowDimeasion);
        analyzer.SliceDimList = DBCondition.GetDimeasionByTime(getHourStr, getTimeStr, getTimeType);
        string str = jss.Serialize(analyzer);
        context.Response.Write(str);
    }

    public override void Process(HttpContext context)
    {
        string type = context.Request["act"];
        if (type == "grid")
        {
            GetSourceJson(context);
        }
        else if (type == "chart")
        {
            GetChart(context);
        }
    }
    private void GetChart(HttpContext context)
    {
        string mea = context.Request["meaList"];
        string getTimeStr = context.Request["getTimeStr"];
        string getHourStr = context.Request["getHourStr"];
        string getTimeType = context.Request["getTimeType"];
        string DateInterval = context.Request["DateInterval"];
        string rowDimeasion = context.Request["Condition"];
        Analyzer analyzer = new Analyzer();
        DataTable dt = new DataTable();
        List<Sem_Measure> meaList = DBCondition.GetListByMeasure(mea);
        Sem_Measure sm = meaList[0];
        analyzer.MeasureList.Add(new Boco.QueryEngine.Measure(meaList[0]));

        if (getTimeType == "Minute" || getTimeType == "Hour" || getTimeType == "Day")
        {
            Boco.QueryEngine.Measure m1 = new Boco.QueryEngine.Measure(sm);
            m1.MeasureType = MeasureType.YearOnYearW;
            m1.DisplayName = "上周同期";
            analyzer.MeasureList.Add(m1);

            Boco.QueryEngine.Measure m2 = new Boco.QueryEngine.Measure(sm);
            m2.MeasureType = MeasureType.YearOnYear;
            m2.DisplayName = "上月同期";
            analyzer.MeasureList.Add(m2);
        }
        else
        {
            Boco.QueryEngine.Measure m2 = new Boco.QueryEngine.Measure(sm);
            m2.MeasureType = MeasureType.YearOnYear;
            m2.DisplayName = "上月同期";
            analyzer.MeasureList.Add(m2);
        }
        JavaScriptSerializer jss = new JavaScriptSerializer();
        analyzer.SliceDimList = jss.Deserialize<List<Dimension>>(rowDimeasion);
        analyzer.RowDimList = DBCondition.GetDimeasionTime(getHourStr, getTimeStr, getTimeType);
        analyzer.SortSetting.SortColIndex = 0;
        dt = analyzer.GetData();
        context.Response.Write(Boco.CommonToolLibrary.Table.TableHelper.CreateJsonParameters(dt));
    }
}