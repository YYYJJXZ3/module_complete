using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Boco.Semantic.EntityDB;
using Boco.Semantic.Entity;
using System.Data;
using Boco.BLLEngine;
using Boco.Dss.CustomAnalysis.Entity;
using Boco.Dss.CustomAnalysis.EntityDB;

public partial class PlugIn_CustomAnalysis_Pages_VcubeMeaDim : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            string cubeID = Request.QueryString["cubeid"];
            if (string.IsNullOrEmpty(cubeID))
            {
                lblMsg.Visible = true;
                lblMsg.Text = "参数错误，未能获取CubeID。";
            }
            else
            {
                Cube cube = CubeDB.GetCubeById(cubeID);
                if (cube == null)
                {
                    lblMsg.Visible = true;
                    lblMsg.Text = "未找到此Cube，请确认CubeID：" + cubeID + "是否正确。";
                }
                else
                {
                    lblCubeName.Text = cube.Name;
                    hiddenCubeID.Value = cube.ID.ToString();
                    BindDdlTheme();
                    BindTvCubeOriginal();
                    BindTvCubeNewly();
                }
            }
        }
    }

    private void BindDdlTheme()
    {
        ddlTheme.Items.Clear();
        List<Theme> listTheme = ThemeDB.GetAllTheme();
        foreach (Theme theme in listTheme)
        {
            ddlTheme.Items.Add(new ListItem
            {
                Value = theme.ID,
                Text = theme.Desc
            });
        }
    }

    protected void ddlTheme_SelectedIndexChanged(object sender, EventArgs e)
    {
        BindTvCubeOriginal();
        chkAllDimension.Checked = false;
        chkAllMeasure.Checked = false;
    }


    private void BindTvCubeOriginal()
    {
        tvCubeOriginal.Nodes.Clear();
        #region 绑定tvCubeOriginal by yl
        TreeNode tnKpi = new TreeNode("指标", "Measure");
        List<Sem_Measure> listMeasure = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByThemeID(ddlTheme.SelectedValue);
        ddlFactTable.Items.Clear();
        ddlFactTable.Items.Add(new ListItem("-------事实表-------", ""));
        foreach (Sem_Measure item in listMeasure)
        {
            TreeNode tn = new TreeNode(item.DisplayName, item.ID);
            tnKpi.ChildNodes.Add(tn);
            if (!string.IsNullOrEmpty(item.TableName) && ddlFactTable.Items.FindByValue(item.TableName) == null)
            {
                ddlFactTable.Items.Add(new ListItem(item.TableName, item.TableName));
            }
        }
        if (ddlFactTable.Items.Count > 2)
        {
            ddlFactTable.Visible = true;
        }
        else
        {
            ddlFactTable.Visible = false;
        }
        TreeNode tnDim = new TreeNode("维度", "Dim");
        List<Sem_Dimension> listDim = Boco.Semantic.EntityDB.DimensionDB.GetDimensionsByThemeID(ddlTheme.SelectedValue);
        foreach (Sem_Dimension item in listDim)
        {
            TreeNode tn = new TreeNode(item.Name, item.ID);
            foreach (Level lvl in item.Levels)
            {
                tn.ChildNodes.Add(new TreeNode(lvl.Name, lvl.ID));
            }
            tnDim.ChildNodes.Add(tn);
        }
        tvCubeOriginal.Nodes.Add(tnKpi);
        tvCubeOriginal.Nodes.Add(tnDim);
        #endregion
    }

    private void BindTvCubeNewly()
    {
        tvCubeNewly.Nodes.Clear();
        #region 绑定tvCubeNewly
        string strCubeId = lblCubeName.Text;
        TreeNode tnMeasureNew = new TreeNode("指标", "Measure");
        TreeNode tnDimNew = new TreeNode("维度", "Dim");
        List<Sem_Measure> smList = CubeDB.GetMeasureByCubeID(hiddenCubeID.Value);
        foreach (Sem_Measure sm in smList)
        {
            tnMeasureNew.ChildNodes.Add(new TreeNode(sm.DisplayName, sm.ID));
        }
        List<Sem_Dimension> sdList = CubeDB.GetDimensionByCubeID(hiddenCubeID.Value);
        foreach (Sem_Dimension item in sdList)
        {
            TreeNode tn = new TreeNode(item.Name, item.ID);
            foreach (Level lvl in item.Levels)
            {
                tn.ChildNodes.Add(new TreeNode(lvl.Name, lvl.ID));
            }
            tnDimNew.ChildNodes.Add(tn);
        }
        tvCubeNewly.Nodes.Add(tnMeasureNew);
        tvCubeNewly.Nodes.Add(tnDimNew);

        #endregion
    }

    /// <summary>
    /// 添加指标或维度 by yl
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    protected void btnAdd_Click(object sender, EventArgs e)
    {
        foreach (TreeNode node in tvCubeOriginal.Nodes[0].ChildNodes)
        {
            if (node.Checked)
            {
                if (tvCubeNewly.FindNode("Measure/" + node.Value) == null)
                {
                    tvCubeNewly.Nodes[0].ChildNodes.Add(new TreeNode(node.Text, node.Value));
                }
            }
        }
        foreach (TreeNode nodeDim in tvCubeOriginal.Nodes[1].ChildNodes)
        {
            foreach (TreeNode nodeLvl in nodeDim.ChildNodes)
            {
                if (nodeLvl.Checked)
                {
                    TreeNode nodeCurDim = tvCubeNewly.FindNode("Dim/" + nodeDim.Value);
                    if (nodeCurDim == null)
                    {
                        nodeCurDim = new TreeNode(nodeDim.Text, nodeDim.Value);
                        tvCubeNewly.Nodes[1].ChildNodes.Add(nodeCurDim);
                    }
                    if (tvCubeNewly.FindNode("Dim/" + nodeCurDim.Value + "/" + nodeLvl.Value) == null)
                    {
                        nodeCurDim.ChildNodes.Add(new TreeNode(nodeLvl.Text, nodeLvl.Value));
                    }
                }
            }
        }
    }
    /// <summary>
    /// 删除指标或维度 by yl
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    protected void btnDel_Click(object sender, EventArgs e)
    {
        //因为是二级，就不用递归了  by yl
        for (int i = tvCubeNewly.Nodes[0].ChildNodes.Count - 1; i > -1; i--)
        {
            if (tvCubeNewly.Nodes[0].ChildNodes[i].Checked)
            {
                tvCubeNewly.Nodes[0].ChildNodes.RemoveAt(i);
            }
        }
        for(int j=tvCubeNewly.Nodes[1].ChildNodes.Count - 1;j>-1;j--)
        {
            for (int i = tvCubeNewly.Nodes[1].ChildNodes[j].ChildNodes.Count - 1; i > -1; i--)
            {
                if (tvCubeNewly.Nodes[1].ChildNodes[j].ChildNodes[i].Checked)
                {
                    tvCubeNewly.Nodes[1].ChildNodes[j].ChildNodes.RemoveAt(i);
                }
            }
            if (tvCubeNewly.Nodes[1].ChildNodes[j].ChildNodes.Count == 0)
            {
                tvCubeNewly.Nodes[1].ChildNodes.RemoveAt(j);
            }
        }
    }
    /// <summary>
    /// 保存虚拟Cube的指标及维度 by yl
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    protected void btnSave_Click(object sender, EventArgs e)
    {
        //删除 by yl
        List<string> sqlList = new List<string>();
        sqlList.Add("DELETE FROM SYS_CA_RELATION_CD WHERE CUBE_ID=" + hiddenCubeID.Value);
        sqlList.Add("DELETE FROM SYS_CA_RELATION_MC WHERE CUBE_ID=" + hiddenCubeID.Value);
        string strInsertMeasure = "INSERT INTO SYS_CA_RELATION_MC(CUBE_ID,MEASURE_ID) VALUES({0},{1})";
        string strInsertDim = "INSERT INTO SYS_CA_RELATION_CD(CUBE_ID,DIMENSION_ID,LEVEL_ID,POS_INDEX) VALUES({0},{1},{2},{3})";
        //添加 by yl
        for (int i = 0; i < tvCubeNewly.Nodes.Count; i++)
        {
            if (tvCubeNewly.Nodes[i].Value == "Measure")
            {
                for (int j = 0; j < tvCubeNewly.Nodes[i].ChildNodes.Count; j++)
                {
                    string sql = string.Format(strInsertMeasure, hiddenCubeID.Value, tvCubeNewly.Nodes[i].ChildNodes[j].Value);
                    sqlList.Add(sql);
                }
            }
            else if (tvCubeNewly.Nodes[i].Value == "Dim")
            {
                int n = 0;
                foreach (TreeNode nodeDim in tvCubeNewly.Nodes[i].ChildNodes)
                {
                    foreach (TreeNode nodeLvl in nodeDim.ChildNodes)
                    {
                        string sql = string.Format(strInsertDim, hiddenCubeID.Value, nodeDim.Value, nodeLvl.Value, n.ToString());
                        sqlList.Add(sql);
                        n++;
                    }
                }
            }
        }
        try
        {
            CommonQuery.ExecuteNonQueryBySqlList(Boco.Dss.CustomAnalysis.CustomEnv.ConnectionString, sqlList.ToArray());
            lblMessage.Text = "保存成功！";
        }
        catch (Exception ex)
        {
            lblMessage.Text = ex.Message;
        }
    }

    protected void ddlFactTable_SelectIndexChanged(object sender, EventArgs e)
    {
        if (ddlFactTable.SelectedIndex > 0)
        {
            tvCubeOriginal.Nodes.Clear();
            TreeNode tnKpi = new TreeNode("指标", "Measure");
            List<Sem_Measure> listMeasure = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByThemeID(ddlTheme.SelectedValue);
            listMeasure = listMeasure.FindAll(p => p.TableName == ddlFactTable.SelectedValue);
            foreach (Sem_Measure item in listMeasure)
            {
                TreeNode tn = new TreeNode(item.DisplayName, item.ID);
                tnKpi.ChildNodes.Add(tn);
            }
            tvCubeOriginal.Nodes.Add(tnKpi);
            TreeNode tnDim = new TreeNode("维度", "Dim");
            if (listMeasure.Count > 0)
            {
                List<Sem_Dimension> listDim = listMeasure[0].RelatedDimensionList;
                foreach (Sem_Dimension item in listDim)
                {
                    TreeNode tn = new TreeNode(item.Desc, item.ID);
                    tnDim.ChildNodes.Add(tn);
                }
            }
            tvCubeOriginal.Nodes.Add(tnDim);
        }
    }

    protected void btnSearch_Click(object sender, EventArgs e)
    {
        tvBindBySerach();
    }
    /// <summary>
    /// 查询指标绑定
    /// </summary>
    private void tvBindBySerach()
    {
        foreach (TreeNode tvParent in tvCubeOriginal.Nodes)
        {
            if (tvParent.Value == "Measure")
            {
                tvParent.ChildNodes.Clear();
                string serTxt = txtIndex.Text.Trim();
                List<Sem_Measure> listMeasure = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByThemeID(ddlTheme.SelectedValue);
                if (!string.IsNullOrEmpty(serTxt))
                {
                    listMeasure = listMeasure.FindAll(p => p.DisplayName.Contains(serTxt) || p.UniqueName.Contains(serTxt) ||
                        p.KeyWord.Contains(Boco.Semantic.Pinyin.ConvertHzToPy(serTxt)));
                }
                if (ddlFactTable.SelectedIndex > 0)
                {
                    listMeasure = listMeasure.FindAll(p => p.TableName == ddlFactTable.SelectedValue);
                }
                foreach (Sem_Measure item in listMeasure)
                {
                    TreeNode tv = new TreeNode(item.DisplayName, item.ID);
                    tvParent.ChildNodes.Add(tv);
                }
            }
        }
        //txtIndex.Text = "";
    }

    protected void chkAllDimension_CheckedChanged(object sender, EventArgs e)
    {
        foreach (TreeNode node in tvCubeOriginal.Nodes[1].ChildNodes)
        {
            foreach (TreeNode tn in node.ChildNodes)
            {
                tn.Checked = chkAllDimension.Checked;
            }
        }
    }
    protected void chkAllMeasure_CheckedChanged(object sender, EventArgs e)
    {
        foreach (TreeNode node in tvCubeOriginal.Nodes[0].ChildNodes)
        {
            node.Checked = chkAllMeasure.Checked;
        }
    }

}