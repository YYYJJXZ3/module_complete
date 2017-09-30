using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class PlugIn_CustomAnalysis_Pages_Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            TempTree.Attributes.Add("src", "Tree.htm?listid=" + Request.QueryString["listid"]);
            Main.Attributes.Add("src", "Content.aspx?tabtype=New&folderid=-1&templateid=-1&listid=" + Request.QueryString["listid"]);
        }
    }
}
