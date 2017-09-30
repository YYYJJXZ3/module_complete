<%@ WebHandler Language="C#" Class="Order" %>

using System;
using System.Web;
using System.Web.Script.Serialization;
using System.Collections.Generic;
using System.Data;

using Boco.Dss.Demo;

public class Order : Boco.Dss.Framework.HttpHandlerBase
{
    static System.Configuration.ConnectionStringSettings connDm = System.Configuration.ConfigurationManager.ConnectionStrings["dwdb_demo"];
    public override void Process(HttpContext context)
    {
        string strCon = context.Request["strCon"];
        MealOrder model = new MealOrder();
        JavaScriptSerializer jss = new JavaScriptSerializer();
        model = jss.Deserialize<MealOrder>(strCon);

        string json = "";

        if (model.Type == "saveOrder")
        {
            json = SaveOrder(model);
        }

        context.Response.Write(json);
    }

    public string SaveOrder(MealOrder order)
    {
        List<string> sqlList = new List<string>() { };

        int userId = Boco.CommonToolLibrary.CRC32.GetCRC32(order.UserName);
        DataTable dtUser = Boco.Dss.Data.DbHelper.GetDataBySql("select user_id from meal_user where user_id=" + userId, connDm);
        if (dtUser.Rows.Count == 0)
        {
            string sqlUser = "insert into meal_user(user_id,user_name) values(" + userId + ",'" + order.UserName + "')";
            sqlList.Add(sqlUser);
        }

        int orderId = Boco.CommonToolLibrary.CRC32.GetCRC32(userId.ToString() + order.DayId.ToString());
        string sqlOrder = "insert into meal_order values(" + orderId + "," + userId + "," + order.DayId + "," + order.NormalNum + "," + order.FaceNum + ")";
        sqlList.Add(sqlOrder);

        List<int> cntList = new List<int>();
        try
        {
            cntList = (List<int>)Boco.Dss.Data.DbHelper.ExecuteNonQueryBySqlList(sqlList, connDm);
        }
        catch (Exception)
        {
            throw;
        }

        if (cntList[1] > 0)
        {
            return "success";
        }
        else
        {
            return "fail";
        }
    }

    protected override bool NeedLogin
    {
        get
        {
            return false;
        }
    }
}

public class MealOrder
{
    public string Type
    {
        get;
        set;
    }
    public int UserId
    {
        get;
        set;
    }
    public string UserName
    {
        get;
        set;
    }
    public int NormalNum
    {
        get;
        set;
    }
    public int FaceNum
    {
        get;
        set;
    }
    public int DayId
    {
        get;
        set;
    }
}