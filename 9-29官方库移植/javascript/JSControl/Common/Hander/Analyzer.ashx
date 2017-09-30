<%@ WebHandler Language="C#" Class="Analyzer" %>

using System;
using System.Web;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using Boco.QueryEngine;

public class Analyzer : Boco.Dss.Framework.HttpHandlerBase
{
    public override void Process(HttpContext context)
    {
        string strCon = context.Request["strCon"];
        JavaScriptSerializer jss = new JavaScriptSerializer();
        jss.MaxJsonLength = 100000000;
        List<string> meaList = jss.Deserialize<List<string>>(strCon);
        List<Boco.Semantic.Entity.Sem_Measure> list = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByListID(meaList);

        List<string> factList = new List<string>();
        for (int i = 0; i < list.Count; i++)
        {
            if (!factList.Contains(list[i].FactID))
            {
                factList.Add(list[i].FactID);
            }
        }
        string key = Boco.CommonToolLibrary.CRC32.GetCRC32(string.Join("-", factList.ToArray())).ToString();
        List<Measure> result = Boco.Dss.Framework.Tool.CacheHelper.Get<List<Measure>>(key);
        if (result == null)
        {
            result = new List<Measure>();
            if (factList.Count > 0)
            {
                for (int i = 0; i < factList.Count; i++)
                {
                    List<Boco.Semantic.Entity.Sem_Measure> temp = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByFactID(factList[i]);
                    temp.ForEach(p => result.Add(new Measure(p)));
                }
            }
            Boco.Dss.Framework.Tool.CacheHelper.Insert(key, result, 100);
        }
        context.Response.Write(jss.Serialize(result));
    }
}