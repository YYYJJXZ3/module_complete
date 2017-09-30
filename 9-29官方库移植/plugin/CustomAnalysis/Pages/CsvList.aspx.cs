using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

using Boco.Dss.CustomAnalysis.Entity;
using Boco.Dss.CustomAnalysis.EntityDB;

public partial class PlugIn_CustomAnalysis_Pages_CsvList : Boco.Dss.Framework.Tool.MPage
{
    protected void Page_Load(object sender, EventArgs e)
    {
        string userID = Boco.Dss.Framework.Tool.Env.User.UserID;
        string reportID = Request.QueryString["reportid"];
        if (!IsPostBack)
        {            
            if (!string.IsNullOrEmpty(userID)&&!string.IsNullOrEmpty(reportID))
            {
                BindGrid(userID,reportID);
                string file = Server.MapPath("../Csv/"+userID+"/HasNewFile.txt");
                if (System.IO.File.Exists(file))
                {
                    using (System.IO.StreamWriter sw = new System.IO.StreamWriter(file))
                    {
                        sw.Write("0");
                    }
                }
            }
        }
        linkBack.HRef = "Subscribe.aspx?userid=" + userID + "&reportid=" + reportID;
    }

    private void BindGrid(string userID,string reportID)
    {
        SubscribeDB.UpdateReadStates(userID, reportID, true);
        if(!System.IO.Directory.Exists(Server.MapPath("../Csv/"+userID)))
        {
            return;
        }
        string[] files = System.IO.Directory.GetFiles(Server.MapPath("../Csv/"+userID),"*.csv");
        System.Data.DataTable dt = new System.Data.DataTable();
        dt.Columns.Add("报表");
        dt.Columns.Add("生成时间");
        dt.Columns.Add("路径");
        foreach (string str in files)
        {
            string s = str.Substring(str.LastIndexOf('['));
            if (s.StartsWith("[" + reportID+"]"))
            {
                DataRow row = dt.NewRow();
                row[2] = s;
                s = s.Substring(s.IndexOf(']')+1);
                row[0] = s.Substring(0,s.IndexOf('('));
                s = s.Substring(s.IndexOf('(') + 1);
                row[1] = s.Substring(0, 4) + "年"+s.Substring(4, 2) + "月" + s.Substring(6, 2) + "日" + s.Substring(8, 2) + "时";
                dt.Rows.Add(row);
            }
        }
        gridCsv.Columns.Clear();
        gridCsv.AutoGenerateColumns = false;
        for (int i = 0; i < 2; i++)
        {
            BoundField col = new BoundField();
            col.HeaderText = dt.Columns[i].ColumnName;
            col.DataField = dt.Columns[i].ColumnName;
            gridCsv.Columns.Add(col);
        }
        HyperLinkField btnCol = new HyperLinkField();
        btnCol.Text = "下载";
        btnCol.DataNavigateUrlFormatString = "../Csv/"+userID+"/{0}";
        btnCol.DataNavigateUrlFields = new string[1] { dt.Columns[2].ColumnName };
        gridCsv.Columns.Add(btnCol);
        gridCsv.DataSource = dt;
        gridCsv.DataBind();
        Boco.CommonToolLibrary.Grid.Grid.HyperLinkFieldEncodeHack(gridCsv);
    }
    protected void gridCsv_RowCommand(object sender, GridViewCommandEventArgs e)
    {
    }
}