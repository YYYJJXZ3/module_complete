using Boco.Dss.CustomAnalysis;
using Boco.Dss.CustomAnalysis.Entity;
using Boco.Dss.CustomAnalysis.EntityDB;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Text;

public partial class PlugIn_CustomAnalysis_Pages_Template : System.Web.UI.UserControl
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            if (Boco.Dss.Framework.UserOnLine.CurrentUser != null)
            {
                hiddenUserID.Value = Boco.Dss.Framework.UserOnLine.CurrentUser.UserID;
                InitSelectCubeFolder();
                string templateID = Request.QueryString["templateid"];
                if (string.IsNullOrEmpty(templateID) || templateID == "-1")
                {
                    InitSelectCube(selectCubeFolder.Value);
                }
            }
        }
    }

    protected void InitSelectCube(string folderID)
    {
        List<Cube> lstCube = CubeDB.GetCubeListByFolder(folderID);
        foreach (Cube c in lstCube)
        {
            ListItem item = new ListItem();
            item.Text = c.Name;
            item.Value = c.ID.ToString();
            selectCube.Items.Add(item);
        }
    }

    private void InitSelectCubeFolder()
    {
        List<CubeFolder> folderList = CubeFolderDB.GetAllFolderList();
        selectCubeFolder.Items.Add(new ListItem("----全部分类----",""));
        foreach (CubeFolder c in folderList)
        {
            ListItem item = new ListItem();
            item.Text = c.Name;
            item.Value = c.ID.ToString();
            selectCubeFolder.Items.Add(item);
        }
        if (folderList.Count > 0)
        {
            selectCubeFolder.SelectedIndex = 1;
        }
    }

}
