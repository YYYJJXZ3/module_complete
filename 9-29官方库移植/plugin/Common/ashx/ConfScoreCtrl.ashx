<%@ WebHandler Language="C#" Class="ConfScoreCtrl" %>

using System;
using System.Web;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using System.Data;
using System.Configuration;

using Boco.Dss.Framework;
using Boco.Dss.Web.JsHandlers;
using Boco.CommonToolLibrary;

public class ConfScoreCtrl : Boco.Dss.Web.JsHandlers.SelectHandler
{
    static string xmlPath = "~/plugin/Common/xml/ConfScore.xml";
    static ConnectionStringSettings configConnStr = ConfigurationManager.ConnectionStrings["SQL_ConnStr"];//配置表所在库

    protected override DataTable GetDimensionData(SmartGridOption option, Conidition model)
    {
        DataTable dt = new DataTable();
        dt.Columns.Add("id", typeof(System.Int32));
        dt.Columns.Add("name", typeof(System.String));

        DataRow row0 = dt.NewRow();
        row0["id"] = "-1";
        row0["name"] = "全部";
        dt.Rows.Add(row0);

        DataTable dtType = GetTypes();
        for (int i = 0; i < dtType.Rows.Count; i++)
        {
            DataRow row = dt.NewRow();
            row["id"] = dtType.Rows[i][0];
            row["name"] = dtType.Rows[i][1];
            dt.Rows.Add(row);
        }

        if (option.TotalCount <= 0)
        {
            option.TotalCount = dtType.Rows.Count;
        }

        option.IsTotal = 0;

        return dt;
    }

    //获取分类得分的数据
    public static DataTable GetTypes()
    {
        ItemInfo item = GetItemInfo(xmlPath, "指标得分权重配置", HttpContext.Current.Request["flag"].ToString());

        string sql = "SELECT TYPE_ID,TYPE_DESC FROM APP_SCORE_CONFIG T WHERE T.MODULE_DESC='" + item.value + "' ORDER BY TYPE_ID";

        DataTable dtType = Boco.Dss.Data.DbHelper.GetDataBySql(sql, configConnStr);

        return dtType;
    }

    //从xml中获取配置，初始化配置
    public static ItemInfo GetItemInfo(string xmlPath, string listKey, string itemKey)
    {
        string xmlPhyPath = HttpContext.Current.Server.MapPath(xmlPath);
        ItemInfo item = Boco.CommonToolLibrary.ConfigListInfoDB.GetListItem(xmlPhyPath, listKey, itemKey);
        return item;
    }
}