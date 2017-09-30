<%@ WebHandler Language="C#" Class="QueryCtrl" %>

using System;
using System.Web;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using System.Data;
using System.Configuration;

using Boco.Dss.Framework;
using Boco.Dss.Web.JsHandlers;
using Boco.CommonToolLibrary;

public class QueryCtrl : Boco.Dss.Web.JsHandlers.SelectHandler
{
    protected override DataTable GetDimensionData(SmartGridOption option, Conidition model)
    {
        DataTable dt = new DataTable();
        dt.Columns.Add("id", typeof(System.Int32));
        dt.Columns.Add("name", typeof(System.String));

        List<ItemInfo> items = GetItemInfo(model.parentValue[0].values);
        for (int i = 0; i < items.Count; i++)
        {
            DataRow row = dt.NewRow();
            row["id"] = items[i].name;
            row["name"] = items[i].Property1;
            dt.Rows.Add(row);
        }

        if (option.TotalCount <= 0)
        {
            option.TotalCount = items.Count;
        }

        option.IsTotal = 0;

        return dt;
    }

    public static List<ItemInfo> GetItemInfo(string listKey)
    {
        string xmlPhyPath = HttpContext.Current.Server.MapPath("~/plugin/Demo/xml/QueryCtrl.xml");
        List<ItemInfo> items = Boco.CommonToolLibrary.ConfigListInfoDB.GetListByKey(xmlPhyPath, listKey);
        return items;
    }
}