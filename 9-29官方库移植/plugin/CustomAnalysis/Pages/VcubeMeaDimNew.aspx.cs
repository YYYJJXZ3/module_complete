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

public partial class PlugIn_CustomAnalysis_Pages_VcubeMeaDimNew : System.Web.UI.Page
{
    string factid = null;
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
                    BindSource(); 
                    BindTvCubeNewly();
                    BindingFact();
                    BindTvCubeOriginal();
                    
                }
            }
        }
    }

    private void BindSource()
    {
        List<Source> srcList = SourceDB.GetAllSource();
        ddlSource.DataSource = srcList;
        ddlSource.DataTextField = "NAME";
        ddlSource.DataValueField = "ID";
        ddlSource.DataBind();
    }

    private void BindingFact()
    {
        try
        {
            List<Fact> factList = FactDB.GetFactAll();
            string srcID = null;
            if (!string.IsNullOrEmpty(factid))
            {
                Fact curFact = factList.Find(p => p.ID == factid);
                if (curFact != null)
                {
                    srcID = curFact.Source.ID;
                    ddlSource.ClearSelection();
                    foreach (ListItem item in ddlSource.Items)
                    {
                        if (item.Value == srcID)
                        {
                            item.Selected = true;
                            break;
                        }
                    }
                }
            }
            List<Fact> factsToBind = factList.FindAll(p => p.Source.ID == ddlSource.SelectedValue);
            factsToBind.Sort(new FactCompare());
            ddlFact.Items.Clear();
            foreach (Fact f in factsToBind)
            {
                ddlFact.Items.Add(new ListItem(f.Name + "   （" + f.FactTable + "）", f.ID));
            }
            ddlFact.Items.Insert(0, new ListItem("---选择事实---", ""));
            if (string.IsNullOrEmpty(factid))
            {
                if (ddlFact.Items.Count > 1)
                {
                    ddlFact.ClearSelection();
                    ddlFact.SelectedIndex = 1;
                }
            }
            else
            {
                ddlFact.ClearSelection();
                foreach (ListItem item in ddlFact.Items)
                {
                    if (item.Value == factid)
                    {
                        item.Selected = true;
                        break;
                    }
                }
            }
        }
        catch (Exception e)
        {
            ScriptManager.RegisterStartupScript(Page, GetType(), "", "alert('异常信息：" + e.Message + "')", true);
        }
    }

    class FactCompare : IComparer<Fact>
    {

        public int Compare(Fact x, Fact y)
        {
            return string.Compare(x.Name, y.Name);
        }
    }

    class MeasureCompare : IComparer<Sem_Measure>
    {

        public int Compare(Sem_Measure x, Sem_Measure y)
        {
            return string.Compare(x.DisplayName, y.DisplayName);
        }
    }

    protected void ddlSource_SelectedIndexChanged(object sender, EventArgs e)
    {
        List<Fact> factsToBind = FactDB.GetFactAll().FindAll(p => p.Source.ID == ddlSource.SelectedValue);
        factsToBind.Sort(new FactCompare());
        ddlFact.Items.Clear();
        foreach (Fact f in factsToBind)
        {
            ddlFact.Items.Add(new ListItem(f.Name + "   （" + f.FactTable + "）", f.ID));
        }
        ddlFact.Items.Insert(0, new ListItem("---选择事实---", ""));
        if (ddlFact.Items.Count > 1)
        {
            ddlFact.SelectedIndex = 1;
            BindTvCubeOriginal();
            chkAllDimension.Checked = false;
            chkAllMeasure.Checked = false;
        }
    }


    private void BindTvCubeOriginal()
    {
        tvCubeOriginal.Nodes.Clear();
        #region 绑定tvCubeOriginal by yl
        TreeNode tnKpi = new TreeNode("指标", "Measure");
        List<Sem_Measure> listMeasure = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByFactID(ddlFact.SelectedValue);
        TreeNode tnDim = new TreeNode("维度", "Dim");
        List<Sem_Dimension> listDim = new List<Sem_Dimension>();
        if (listMeasure.Count > 0)
        {
            listDim.AddRange(listMeasure[0].RelatedDimensionList);
        }
        listMeasure.Sort(new MeasureCompare());
        foreach (Sem_Measure item in listMeasure)
        {
            TreeNode tn = new TreeNode(item.DisplayName, item.ID);
            tnKpi.ChildNodes.Add(tn);
        }

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
        smList.Sort(new MeasureCompare());
        if (smList.Count > 0)
        {
            factid = smList[0].FactID;
        }
        IEnumerable<IGrouping<string, Sem_Measure>> smGps = smList.GroupBy(m => m.TableName);
        foreach (var gp in smGps)
        {
            TreeNode factNode = new TreeNode();
            factNode.Text = gp.Key;
            factNode.Value = "FactTable"+gp.Key;
            tnMeasureNew.ChildNodes.Add(factNode);
            foreach (Sem_Measure sm in gp.ToList<Sem_Measure>())
            {
                factNode.ChildNodes.Add(new TreeNode(sm.DisplayName, sm.ID));
            }
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
        string facttable = ddlFact.SelectedItem.Text.Substring(ddlFact.SelectedItem.Text.IndexOf('（')+1);
        facttable = facttable.TrimEnd('）');
        foreach (TreeNode node in tvCubeOriginal.Nodes[0].ChildNodes)
        {
            if (node.Checked)
            {
                TreeNode nodeTable = tvCubeNewly.FindNode("Measure/FactTable" + facttable);
                if (nodeTable == null)
                {
                    nodeTable = new TreeNode(facttable, "FactTable" + facttable);
                    tvCubeNewly.Nodes[0].ChildNodes.Add(nodeTable);
                }
                if (tvCubeNewly.FindNode("Measure/FactTable"+facttable+"/" + node.Value) == null)
                {
                    nodeTable.ChildNodes.Add(new TreeNode(node.Text, node.Value));
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
            for (int j =tvCubeNewly.Nodes[0].ChildNodes[i].ChildNodes.Count-1; j > -1; j--)
            {
                if (tvCubeNewly.Nodes[0].ChildNodes[i].ChildNodes[j].Checked)
                {
                    tvCubeNewly.Nodes[0].ChildNodes[i].ChildNodes.RemoveAt(j);
                }
            }
            if (tvCubeNewly.Nodes[0].ChildNodes[i].ChildNodes.Count == 0)
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
                foreach (TreeNode factNode in tvCubeNewly.Nodes[i].ChildNodes)
                {
                    for (int j = 0; j < factNode.ChildNodes.Count; j++)
                    {
                        string sql = string.Format(strInsertMeasure, hiddenCubeID.Value, factNode.ChildNodes[j].Value);
                        sqlList.Add(sql);
                    }
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
        if (ddlFact.SelectedIndex > 0)
        {
            BindTvCubeOriginal();
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
                List<Sem_Measure> listMeasure = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByFactID(ddlFact.SelectedValue);
                if (!string.IsNullOrEmpty(serTxt))
                {
                    listMeasure = listMeasure.FindAll(p => p.DisplayName.Contains(serTxt) || p.UniqueName.Contains(serTxt) ||
                        p.KeyWord.Contains(Boco.Semantic.Pinyin.ConvertHzToPy(serTxt)));
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