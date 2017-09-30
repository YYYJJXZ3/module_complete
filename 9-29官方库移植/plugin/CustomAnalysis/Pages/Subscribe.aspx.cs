using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

using Boco.CommonToolLibrary;
using Boco.Dss.CustomAnalysis.Entity;
using Boco.Dss.CustomAnalysis.EntityDB;

public partial class PlugIn_CustomAnalysis_Pages_Subscribe : Boco.Dss.Framework.Tool.MPage
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            string userID = Request.QueryString["userid"];
            string reportID = Request.QueryString["reportid"];
            if (!string.IsNullOrEmpty(userID))
            {
                BindSubscribeList(userID);
                if (!string.IsNullOrEmpty(reportID))
                {
                    InitSelectSubscribe(userID, reportID);
                }
                else
                {
                    
                    lbtnAddCurReport.Visible = false;
                }
            }
            divSetting.Visible = false;
        }
    }


    private void BindSubscribeList(string userID)
    {
        List<Rss> rssList = SubscribeDB.GetSubScribeList(userID);
        int curReportIndex = rssList.FindIndex(p=>p.TemplateID==Request.QueryString["reportid"]);
        if(curReportIndex>=0)
        {
            lbtnAddCurReport.Visible = false;
        }
        gridSubscribe.DataSource = rssList;
        gridSubscribe.DataBind();
        gridSubscribe.SelectedIndex = curReportIndex;
    }

    private void InitSelectSubscribe(string userID,string reportID)
    {
        divSetting.Visible = true;
        Rss entity = SubscribeDB.GetSubScribe(userID, reportID);
        if (entity == null)
        {
            hideTempID.Value = reportID;
            FillDateType("");
            FillDate(-1);
            FillTime(-1);
            FillSendType("");
            return;
        }
        FillDateType(entity.DateType);
        hideTempID.Value = entity.TemplateID;
        lblTempName.Text = entity.TemplateName;
        FillDate(entity.SendDay);
        FillTime(Convert.ToDateTime(entity.SendTime).Hour);
        FillSendType(entity.SendType);
        txtCC.Text = entity.SendTo;
    }


        /// <summary>
    /// 增加日期类型
    /// </summary>
    /// <param name="dateType"></param>
    private void FillDateType(string dateType)
    { 
        if (!String.IsNullOrEmpty(dateType))
        {
            ddlDateType.ClearSelection();
            ddlDateType.Items.FindByText(dateType).Selected = true;
        }
    }
    /// <summary>
    /// 增加日期值
    /// </summary>
    /// <param name="idx"></param>
    private void FillDate(int day)
    {
        ddlDate.Items.Clear();
        if (ddlDateType.SelectedValue == "Day")
        {
            ddlDate.Items.Add("每日");
        }
        else if (ddlDateType.SelectedValue == "Week")
        {
            for (int i = 1; i <= 7; i++)
            {
                ddlDate.Items.Add("星期" + DateTimeHelper.GetWeekNum(i));
            }
        }
        else if (ddlDateType.SelectedValue == "Month")
        {
            for (int i = 1; i <= 28; i++)
            {
                ddlDate.Items.Add(i.ToString() + "日");
            }
        }
        else if (ddlDateType.SelectedValue == "Now")
        {
            ddlDate.Items.Add(ddlDateType.SelectedItem.Text);
        }
        if (day != -1)
        {
            if (ddlDate.Items.Count > day)
            {
                ddlDate.ClearSelection();
                ddlDate.Items[day - 1].Selected = true;
            }
        }
    }
    /// <summary>
    /// 增加发送时间
    /// </summary>
    /// <param name="idx"></param>
    private void FillTime(int idx)
    {
        ddlTime.Items.Clear();
        for (int i = 0; i <= 23; i++)
        {
            ddlTime.Items.Add(i.ToString() + " 时");
        }
        if (idx != -1)
        {
            ddlTime.ClearSelection();
            ddlTime.Items[idx].Selected = true;
        }
        else
        {
            ddlTime.ClearSelection();
            ddlTime.SelectedIndex = 9;
        }
    }
    /// <summary>
    /// 增加发送类型
    /// </summary>
    /// <param name="sendType"></param>
    private void FillSendType(string sendType)
    {
        if (!String.IsNullOrEmpty(sendType))
        {
            ListItem li = ddlSendType.Items.FindByText(sendType);
            if (li != null)
            {
                ddlSendType.ClearSelection();
                li.Selected = true;
            }
        }
    }
    /// <summary>
    /// 发送日期类型变化后发送日期进行变化
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    protected void ddlDateType_SelectedIndexChanged(object sender, EventArgs e)
    {
        FillDate(-1);
    }
    /// <summary>
    /// 保存，保存后关闭
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    protected void btnOK_Click(object sender, EventArgs e)
    {
        try
        {
            Rss rss = new Rss();
            rss.CreateDate = DateTime.Now.ToString();
            rss.DateType = ddlDateType.SelectedItem.Text ;
            rss.SendDay = ddlDate.SelectedIndex+1;
            rss.SendTime += ddlTime.SelectedIndex.ToString().PadLeft(2, '0') + ":00:00";
            rss.SendTo = txtCC.Text;
            rss.TemplateID = hideTempID.Value;
            rss.UserID = Request.QueryString["userid"];
            rss.SendType = ddlSendType.SelectedItem.Text;
            if (!String.IsNullOrEmpty(rss.TemplateID))
            {
                SubscribeDB.DeleteSubScribe(rss);
            }
            SubscribeDB.InsertSubScribe(rss);
            lblError.Text = "成功";
            string userID = Request.QueryString["userid"];
            if (!string.IsNullOrEmpty(userID))
            {
                BindSubscribeList(userID);
            }
        }
        catch (Exception ex)
        {
            lblError.Text = ex.Message;
            lblError.Visible = true;
        }
    }
    protected void gridSubscribe_RowCommand(object sender, GridViewCommandEventArgs e)
    {
        if (e.CommandName == "Setting")
        {
            int rowindex = int.Parse(e.CommandArgument.ToString());
            gridSubscribe.SelectedIndex = rowindex;
            string reportID = gridSubscribe.DataKeys[rowindex].Value.ToString();
            InitSelectSubscribe(Request.QueryString["userid"],reportID);
        }
        else if (e.CommandName == "DelRss")
        {
            int rowindex = int.Parse(e.CommandArgument.ToString());
            string reportID = gridSubscribe.DataKeys[rowindex].Value.ToString();
            Rss rss = new Rss();
            string userID = Request.QueryString["userid"];
            rss.UserID = userID;
            rss.TemplateID = reportID;
            SubscribeDB.DeleteSubScribe(rss);
            BindSubscribeList(userID);
            divSetting.Visible = false;
        }
    }
    protected void gridSubscribe_RowDataBound(object sender, GridViewRowEventArgs e)
    {
        if (e.Row.RowType == DataControlRowType.DataRow)
        {
            ((ImageButton)e.Row.Cells[e.Row.Cells.Count - 2].Controls[0]).Attributes.Add("onclick", "javascript:if(!confirm('确信要删除该条记录吗？'))return false;");
        }
    }

    protected void lbtnAddCurReport_Click(object sender, EventArgs e)
    {
        string userID = Request.QueryString["userid"];
        string reportID = Request.QueryString["reportid"];
        if (!string.IsNullOrEmpty(userID))
        {
            if (!string.IsNullOrEmpty(reportID))
            {
                InitSelectSubscribe(userID, reportID);
            }
        }
    }
}