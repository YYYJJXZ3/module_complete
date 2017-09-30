<%@ WebHandler Language="C#" Class="Boco.Dss.CustomAnalysis.Web.Contrast" %>

using System;
using System.Web;
using System.Data;
using System.Collections.Generic;
using Boco.QueryEngine;
using Boco.Semantic.Entity;
using System.Linq;
using System.Text;
using System.Web.Script.Serialization;
using Boco.Dss.CustomAnalysis.Second;

namespace Boco.Dss.CustomAnalysis.Web
{
    public class Contrast : Boco.Dss.Framework.HttpHandlerBase
    {

        /// <summary>
        ///
        /// </summary>
        /// <param name="mea"></param>
        /// <param name="sliceDimeasion"></param>
        /// <param name="rowDimeasion"></param>
        /// <returns></returns>
        private string GetSource(string mea, string hourStr, string timeStr, string timeType, string rowDimeasion, string levelname)
        {
            Analyzer analyzer = new Analyzer();
            JavaScriptSerializer jss = new JavaScriptSerializer();
            List<Sem_Measure> meaList = DBCondition.GetListByMeasure(mea);
            for (int i = 0; i < meaList.Count; i++)
            {
                Sem_Measure sm = meaList[i];
                analyzer.MeasureList.Add(new Boco.QueryEngine.Measure(meaList[i]));
            }
            analyzer.SliceDimList = DBCondition.GetDimeasionTime(hourStr, timeStr, timeType);
            List<Dimension> list = jss.Deserialize<List<Dimension>>(rowDimeasion);
            analyzer.SliceDimList.AddRange(DBCondition.FilterDimension(list, levelname, false));
            analyzer.RowDimList = DBCondition.FilterDimension(list, levelname, true);
            string str = jss.Serialize(analyzer);
            return str;
        }

        public override void Process(HttpContext context)
        {
            string mea = context.Request["meaList"];
            string rowDimeasion = context.Request["Condition"];
            string timeStr = context.Request["getTimeStr"];
            string hourStr = context.Request["getHourStr"];
            string timeType = context.Request["getTimeType"];
            string levelname = context.Request["levelname"];
            context.Response.Write(GetSource(mea, hourStr, timeStr, timeType, rowDimeasion, levelname));
        }
    }
}

