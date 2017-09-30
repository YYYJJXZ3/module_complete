<%@ WebHandler Language="C#" Class="Analyst" %>

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

public class Analyst : Boco.Dss.Framework.HttpHandlerBase
{
    public string GetMeaID(string mea)
    {
        if (!string.IsNullOrEmpty(mea))
        {
            if (mea.IndexOf(',') > 0)
            {
                mea = mea.Substring(0, mea.IndexOf(','));
            }
            Sem_Measure sm = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByID(mea);
            return sm.ID;
        }
        return "";
    }

    ///
    ///生成json值
    ///
    public string GetCondition(string themeData, string meaid)
    {
        List<Boco.Dss.CustomAnalysis.Second.Entity.Dimeasion> list = DBCondition.GetDimeasionList(themeData);

        string str = "[";
        for (int i = 0; i < list.Count; i++)
        {
            if (list[i].Name != "日期维")
            {
                Sem_Measure sm = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByID(meaid);
                Sem_Dimension dim = sm.RelatedDimensionList.Find(p => p.Name == list[i].Name);
                str += "{\"dimension\": \"" + list[i].Name + "\",\"dimid\":\"" + dim.ID + "\",\"levels\": [" + GetStrByDict(list[i].List, meaid, list[i].Name) + "]},";
            }
        }
        str = str.TrimEnd(',');
        return str + "]";

    }
    public string BindMea(string mea)
    {
        List<Sem_Measure> meaList = DBCondition.GetListByMeasure(mea);
        List<Sem_Measure> list = new List<Sem_Measure>();
        for (int i = 0; i < meaList.Count; i++)
        {
            Sem_Measure sm = list.Find(p => p.ID == meaList[i].ID);
            if (sm == null)
            {
                list.Add(meaList[i]);
            }
        }
        string str = "[";
        if (list != null)
        {
            for (int i = 0; i < list.Count; i++)
            {
                str += "{\"id\":\"" + list[i].ID + "\",\"name\":\"" + list[i].DisplayName + "\"},";
            }
            str = str.TrimEnd(',');
        }
        return str + "]";
    }
    public string GetStrByDict(List<Boco.Dss.CustomAnalysis.Second.Entity.DimData> dictList, string meaid, string dimName)
    {
        string str = "";
        Sem_Measure sm = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByID(meaid);
        Sem_Dimension dim = sm.RelatedDimensionList.Find(p => p.Name == dimName);
        if (dim != null && dim.Levels.Count > 0 && !string.IsNullOrEmpty(dim.Levels[0].TableName))
        {
            for (int j = 0; j < dictList.Count; j++)
            {
                Boco.Dss.CustomAnalysis.Second.Entity.DimData dict = dictList[j];
                if (string.IsNullOrEmpty(dict.Value))
                {
                    str += "{\"level\": \"" + dict.Key + "\", \"alwaysShow\": true, \"controlType\": \"multiple\" },";
                }
                else
                {
                    str += "{\"level\": \"" + dict.Key + "\", \"controlId\":\"\", \"controlType\": \"multiple\", \"alwaysShow\": true,\"selected\": [";
                    string value = dict.Value;
                    string[] arr = value.Split(',');
                    for (int i = 0; i < arr.Length; i++)
                    {
                        str += "{\"name\": \"" + arr[i] + "\" },";
                    }
                    str = str.TrimEnd(',') + "] },";
                }
            }
        }
        else
        {
            for (int j = 0; j < dictList.Count; j++)
            {
                Boco.Dss.CustomAnalysis.Second.Entity.DimData dict = dictList[j];
                if (string.IsNullOrEmpty(dict.Value))
                {
                    str += "{\"level\": \"" + dict.Key + "\", \"alwaysShow\": true, \"controlType\": \"text\" },";
                }
                else
                {

                    str += "{ \"level\": \"" + dict.Key + "\", \"controlId\":\"\", \"controlType\": \"text\", \"alwaysShow\": true, \"selected\": [";
                    string value = dict.Value;
                    string[] arr = value.Split(',');
                    for (int i = 0; i < arr.Length; i++)
                    {
                        str += "{\"name\": \"" + arr[i] + "\" },";
                    }
                    str = str.TrimEnd(',') + "] },";
                }
            }
        }
        return str.TrimEnd(',');
    }

    public override void Process(HttpContext context)
    {
        string mea = context.Request["Measure"];
        string dim = context.Request["Dimeasion"];
        string dimTime = "";
        string dimCon = "";
        if (!string.IsNullOrEmpty(dim))
        {
            string[] arr = dim.Split(';');
            for (int i = 0; i < arr.Length; i++)
            {
                if (arr[i].Contains("日期维") || arr[i].Contains("小时维") || arr[i].Contains("分钟维"))
                {
                    dimTime += arr[i] + ";";
                }
                else
                {
                    dimCon += arr[i] + ";";
                }
            }
        }
        dimCon = dimCon.TrimEnd(';');
        dimTime = dimTime.TrimEnd(';');
        List<Boco.Dss.CustomAnalysis.Second.Entity.Dimeasion> dimList = DBCondition.GetDimeasionList(dimTime);
        string measuereID = GetMeaID(mea);
        string conList = GetCondition(dimCon, measuereID);
        string model;
        if (dimList != null && dimList.Count > 0)
        {
            model = DBCondition.GetDateCondition(measuereID, dimList);
        }
        else
        {
            model = DBCondition.GetDateCondition(measuereID, null);
        }
        string str = "{\"MeaList\":" + BindMea(mea) + ",\"ConditionList\":" + conList + ",\"MeaID\":" + measuereID + ",\"DateInit\":" + model + "}";
        context.Response.Write(str);
    }
}
