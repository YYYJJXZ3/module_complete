using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class PlugIn_CustomAnalysis_Pages_Content : Boco.Dss.Framework.Tool.MPage
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (Request.QueryString["qtype"] == "anaagain")
        {
            tdSave.Visible = false;
            tdSaveAs.Visible = false;
            tdSubscribe.Visible = false;
            tdPublish.Visible = false;
        }
        else
        {
            if (Request.QueryString["isshare"] == "1")
            {
                tdSave.Visible = false;
            }
            if (Boco.Dss.Framework.UserOnLine.CurrentUser.UserID == System.Configuration.ConfigurationManager.AppSettings["AdminUserId"])
            {
                tdPublish.Visible = true;
            }
            else
            {
                tdPublish.Visible = false;
            }
            if (!string.IsNullOrEmpty(Request.QueryString["anameaid"]) ||
                !string.IsNullOrEmpty(Request.QueryString["filename"]))
            {
                tdSave.Visible = false;
                tdSaveAs.Visible = false;
                tdSubscribe.Visible = false;
                tdPublish.Visible = false;
            }
        }
    }

    protected void Page_PreInit()
    {
        this.Theme = "";
    }
}
