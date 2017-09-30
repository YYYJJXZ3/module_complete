<%@ WebHandler Language="C#" Class="Boco.Dss.CustomAnalysis.Web.Trend" %>

using System;
using System.Web;
using System.Data;
using System.Collections.Generic;
using Boco.QueryEngine;
using Boco.Semantic.Entity;
using System.Linq;
using System.Text;
using Boco.Dss.CustomAnalysis.Second;
using System.Web.Script.Serialization;

namespace Boco.Dss.CustomAnalysis.Web
{
    public class Trend : Boco.Dss.Framework.HttpHandlerBase
    {

        public void GetSourceJson(HttpContext context)
        {
            string mea = context.Request["meaList"];
            string rowDimeasion = context.Request["Condition"];
            string timeStr = context.Request["getTimeStr"];
            string hourStr = context.Request["getHourStr"];
            string timeType = context.Request["getTimeType"];
            string levelname = context.Request["levelname"];
            Analyzer analyzer = new Analyzer();
            JavaScriptSerializer jss = new JavaScriptSerializer();
            if (!string.IsNullOrEmpty(mea))
            {
                List<Sem_Measure> meaList = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByListID(mea.Split(',').ToList());
                for (int i = 0; i < meaList.Count; i++)
                {
                    Sem_Measure sm = meaList[i];
                    analyzer.MeasureList.Add(new Boco.QueryEngine.Measure(meaList[i]));
                }
                List<Dimension> list = jss.Deserialize<List<Dimension>>(rowDimeasion);
                analyzer.ColDimList = DBCondition.FilterDimension(list, levelname, true);
                analyzer.SliceDimList = DBCondition.FilterDimension(list, levelname, false);
                analyzer.RowDimList = DBCondition.GetDimeasionByTime(hourStr, timeStr, timeType);
                analyzer.SortSetting.SortColIndex = 0;
                analyzer.SortSetting.SortDirection = SortDirection.Asc;
            }
            string sql = analyzer.GetQuerySentence()[0].Sql;
            string str = jss.Serialize(analyzer);
            context.Response.Write(str);
        }

        public override void Process(HttpContext context)
        {
            GetSourceJson(context);
        }
    }
}

