<%@ WebHandler Language="C#" Class="Handler" %>

using System;
using System.Web;
using System.Data;

public class Handler : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        DataTable dt = new DataTable();
        dt.Columns.Add("地区ID");
        dt.Columns.Add("地区");
        DataRow row1 = dt.NewRow();
        row1[0] = "1";
        row1[1] = "杭州市";
        dt.Rows.Add(row1);
        DataRow row2 = dt.NewRow();
        row2[0] = "2";
        row2[1] = "温州市";
        dt.Rows.Add(row2);
        DataRow row3 = dt.NewRow();
        row3[0] = "3";
        row3[1] = "宁波市";
        dt.Rows.Add(row3);
        for (int i = 1; i < 20; i++)
        {
            DataRow row = dt.NewRow();
            row[0] = (i + 3).ToString();
            row[1] = "TEST" + i.ToString();
            dt.Rows.Add(row);
        }
        string json = Boco.CommonToolLibrary.Table.TableHelper.CreateJsonParameters(dt);
        context.Response.Write(json);
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}