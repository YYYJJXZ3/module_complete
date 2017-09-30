using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Boco.Dss.CustomAnalysis.Entity;
using Boco.Dss.CustomAnalysis.EntityDB;

public partial class PlugIn_CustomAnalysis_Pages_VcubeManage : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            BindDdlCubeFolder();
            if (ddlCubeFolder.Items.Count > 2)
            {
                ddlCubeFolder.SelectedIndex = 2;
            }
            if (ddlCubeFolder.SelectedValue == "-1" || ddlCubeFolder.SelectedValue=="")
            {
                lbtnEditFolder.Visible = false;
                lbtnDelFolder.Visible = false;
            }
            BindGridCube(ddlCubeFolder.SelectedValue);
        }
    }

    private void BindDdlCubeFolder()
    {
        List<CubeFolder> folderList = CubeFolderDB.GetAllFolderList();
        ddlCubeFolder.Items.Clear();
        foreach (CubeFolder folder in folderList)
        {
            ListItem item = new ListItem(folder.Name, folder.ID);
            ddlCubeFolder.Items.Add(item);
        }
        ddlCubeFolder.Items.Insert(0,new ListItem("-------全部-------", ""));
        ddlCubeFolder.Items.Insert(1, new ListItem("------未分类------", "-1"));
    }

    private void BindDdlCubeFolderInGrid(DropDownList ddl, List<CubeFolder> folderList,string cubeID)
    {
        ddl.Items.Clear();
        foreach (CubeFolder folder in folderList)
        {
            ListItem item = new ListItem(folder.Name, folder.ID);
            ddl.Items.Add(item);
        }
        ddl.Items.Insert(0, new ListItem("---------未分类---------", "-1")); 
        foreach (ListItem item in ddl.Items)
        {
            if (item.Value == cubeID)
            {
                item.Selected = true;
                break;
            }
        }
    }

    private void BindGridCube(string folderID)
    {
        List<Cube> cubeList = CubeDB.GetCubeListByFolder(folderID);
        gridCube.DataSource = cubeList;
        gridCube.DataBind();
        List<CubeFolder> folderList = CubeFolderDB.GetAllFolderList();
        foreach (GridViewRow row in gridCube.Rows)
        {
            DropDownList ddl = row.Cells[1].FindControl("ddlCubeFolderInGrid") as DropDownList;
            BindDdlCubeFolderInGrid(ddl, folderList,cubeList.Find(p=>p.ID.ToString()==gridCube.DataKeys[row.RowIndex].Value.ToString()).CubeFolder.ID);
            if (row.RowIndex != gridCube.EditIndex)
            {
                ddl.Enabled = false;
            }
        }
    }
    protected void gridCube_RowEditing(object sender, GridViewEditEventArgs e)
    {
        gridCube.EditIndex = e.NewEditIndex;
        BindGridCube(ddlCubeFolder.SelectedValue);
    }
    protected void gridCube_RowUpdating(object sender, GridViewUpdateEventArgs e)
    {
        gridCube.EditIndex = -1;
        if (e.NewValues[0] != null)
        {
            Cube cube = CubeDB.GetCubeById(gridCube.DataKeys[e.RowIndex].Value.ToString());
            cube.Name = e.NewValues[0].ToString();
            if (e.NewValues[1] != null)
            {
                cube.Explain = e.NewValues[1].ToString();
            }
            else
            {
                cube.Explain = "";
            }
            cube.CubeFolder.ID = (gridCube.Rows[e.RowIndex].Cells[1].FindControl("ddlCubeFolderInGrid") as DropDownList).SelectedValue;
            CubeDB.UpdateCube(cube);
        }
        BindGridCube(ddlCubeFolder.SelectedValue);
    }
    protected void gridCube_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
    {
        gridCube.EditIndex = -1;
        BindGridCube(ddlCubeFolder.SelectedValue);
    }
    protected void gridCube_RowDeleting(object sender, GridViewDeleteEventArgs e)
    {
        Cube cube = new Cube();
        cube.ID = int.Parse(gridCube.DataKeys[e.RowIndex].Value.ToString());
        CubeDB.DeleteCube(cube);
        BindGridCube(ddlCubeFolder.SelectedValue);
    }
    protected void gridCube_PageIndexChanging(object sender, GridViewPageEventArgs e)
    {

    }

    protected void btnAddCube_Click(object sender, EventArgs e)
    {
        tableCubeAdd.Visible = true;
        List<CubeFolder> folderList = CubeFolderDB.GetAllFolderList();
        ddlCubeToAddFoler.Items.Clear();
        foreach (CubeFolder folder in folderList)
        {
            ListItem item = new ListItem(folder.Name, folder.ID);
            ddlCubeToAddFoler.Items.Add(item);
        }
        ddlCubeToAddFoler.Items.Insert(0, new ListItem("---------未分类---------", "-1"));
        foreach (ListItem item in ddlCubeToAddFoler.Items)
        {
            if (item.Value == ddlCubeFolder.SelectedValue)
            {
                item.Selected = true;
                break;
            }
        }
        lblCubeAddMsg.Text = "";
        txtCubeName.Text = "";
        txtExplain.Text = "";
    }

    protected void btnAddCubeCancel_Click(object sender, EventArgs e)
    {
        tableCubeAdd.Visible = false;
        lblCubeAddMsg.Text = "";
    }

    protected void btnAddCubeConfirm_Click(object sender, EventArgs e)
    {
        if (txtCubeName.Text.Trim() == "")
        {
            lblCubeAddMsg.Text = "Cube名称不能为空。";
            return;
        }
        Cube cube = new Cube();
        cube.Name = txtCubeName.Text.Trim();
        cube.Explain = txtExplain.Text.TrimEnd();
        cube.CubeFolder = new CubeFolder();
        cube.CubeFolder.ID = ddlCubeToAddFoler.SelectedValue;
        try
        {
            CubeDB.AddCube(cube);
            lblCubeAddMsg.Text = "添加Cube成功。";
            if (ddlCubeFolder.SelectedValue == ddlCubeToAddFoler.SelectedValue)
            {
                BindGridCube(ddlCubeFolder.SelectedValue);
            }
            tableCubeAdd.Visible = false;
        }
        catch (Exception ex)
        {
            lblCubeAddMsg.Text = "添加Cube失败。" + ex.Message;
        }
    }

    protected void lbtnAddFolder_Click(object sender, EventArgs e)
    {
        txtFolderName.Visible = true;
        txtFolderName.Text = "";
        btnAddFolder.Visible = true;
        btnUpdateFolder.Visible = false;
    }

    protected void lbtnEditFolder_Click(object sender, EventArgs e)
    {
        txtFolderName.Visible = true;
        txtFolderName.Text = ddlCubeFolder.SelectedItem.Text;
        btnAddFolder.Visible = false;
        btnUpdateFolder.Visible = true;
    }

    protected void btnAddFolder_Click(object sender, EventArgs e)
    {
        if (txtFolderName.Text.Trim() == "")
        {
            lblMsg.Text = "名称不能为空。";
            return;
        }
        CubeFolder folder = new CubeFolder();
        folder.Name = txtFolderName.Text.Trim();
        try
        {
            CubeFolderDB.AddFolder(folder);
            BindDdlCubeFolder();
            lblMsg.Text = "添加成功。";
        }
        catch (Exception ex)
        {
            lblMsg.Text = "添加失败。" + ex.Message;
        }
    }
    protected void ddlCubeFolder_SelectedIndexChanged(object sender, EventArgs e)
    {
        gridCube.PageIndex = 0;
        BindGridCube(ddlCubeFolder.SelectedValue);
        if (ddlCubeFolder.SelectedValue == "-1")
        {
            lbtnEditFolder.Visible = false;
            lbtnDelFolder.Visible = false;
        }
        else
        {
            lbtnEditFolder.Visible = true;
            lbtnDelFolder.Visible = true;
        }
        txtFolderName.Visible = false;
        btnAddFolder.Visible = false;
        btnUpdateFolder.Visible = false;
        lblMsg.Text = "";
    }

    protected void btnUpdateFolder_Click(object sender, EventArgs e)
    {
        if (txtFolderName.Text.Trim() == "")
        {
            lblMsg.Text = "名称不能为空。";
            return;
        }
        CubeFolder folder = new CubeFolder();
        folder.ID = ddlCubeFolder.SelectedValue;
        folder.Name = txtFolderName.Text.Trim();
        try
        {
            CubeFolderDB.UpdateFolder(folder);
            BindDdlCubeFolder();
            lblMsg.Text = "更新成功。";
        }
        catch (Exception ex)
        {
            lblMsg.Text = "更新失败。" + ex.Message;
        }
        
    }

    protected void lbtnDelFolder_Click(object sender, EventArgs e)
    {
        try
        {
            CubeFolderDB.DeleteFolder(ddlCubeFolder.SelectedValue);
            BindDdlCubeFolder();
            BindGridCube(ddlCubeFolder.SelectedValue);
            lblMsg.Text = "删除成功。";
        }
        catch (Exception ex)
        {
            lblMsg.Text = "删除失败。" + ex.Message;
        }
    }

    protected void gridCube_RowDataBound(object sender, GridViewRowEventArgs e)
    {
        if (e.Row.RowType == DataControlRowType.DataRow)
        {
            if (e.Row.Cells[e.Row.Cells.Count - 2].Controls.Count > 0)
            {
                ((LinkButton)e.Row.Cells[e.Row.Cells.Count - 2].Controls[0]).Attributes.Add("onclick", "javascript:return confirm('你确认要删除');");
            }
        }
    }

    protected void lnkbtnFrist_Click(object sender, EventArgs e)
    {
        this.gridCube.PageIndex = 0;
        BindGridCube(ddlCubeFolder.SelectedValue);
    }
    protected void lnkbtnPre_Click(object sender, EventArgs e)
    {
        if (this.gridCube.PageIndex > 0)
        {
            this.gridCube.PageIndex = this.gridCube.PageIndex - 1;
            BindGridCube(ddlCubeFolder.SelectedValue);
        }
    }
    protected void lnkbtnNext_Click(object sender, EventArgs e)
    {
        if (this.gridCube.PageIndex < this.gridCube.PageCount)
        {
            this.gridCube.PageIndex = this.gridCube.PageIndex + 1;
            BindGridCube(ddlCubeFolder.SelectedValue);
        }
    }
    protected void lnkbtnLast_Click(object sender, EventArgs e)
    {
        this.gridCube.PageIndex = this.gridCube.PageCount - 1;
        BindGridCube(ddlCubeFolder.SelectedValue);
    }

    protected void gridCube_DataBound(object sender, EventArgs e)
    {
        this.lblCurrentPage.Text = string.Format("当前第{0}页/总共{1}页", this.gridCube.PageIndex + 1, this.gridCube.PageCount);
        if (gridCube.PageIndex == 0)
        {
            lnkbtnFrist.Enabled = false;
            lnkbtnPre.Enabled = false;
        }
        else
        {
            lnkbtnFrist.Enabled = true;
            lnkbtnPre.Enabled = true;
        }
        if (gridCube.PageIndex == gridCube.PageCount - 1)
        {
            lnkbtnLast.Enabled = false;
            lnkbtnNext.Enabled = false;
        }
        else
        {
            lnkbtnLast.Enabled = true;
            lnkbtnNext.Enabled = true;
        }
    }
}
