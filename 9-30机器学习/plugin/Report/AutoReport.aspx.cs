using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.IO;
using System.Net;

public partial class _AutoReport : System.Web.UI.Page
{
    /// <summary>
    /// 获取自动报告存放的虚拟路径
    /// </summary>
    private string AutoReportPath
    {
        get
        {
            //return System.Configuration.ConfigurationManager.AppSettings["AutoReport"];
            return  Server.MapPath("Download\\");
        }

    }
    /// <summary>
    /// 窗体加载
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            try
            {
                AddRoot("自动报告", AutoReportPath);
                //AddRoot("日常报告", DailyReportPath);

                TreeView1.Nodes[0].Expand();
            }
            catch (Exception ex)
            {
                //Response.Write(ex.Message);
            }
        }
    }
    /// <summary>
    /// 加载主目录
    /// </summary>
    /// <param name="name"></param>
    /// <param name="path"></param>
    private void AddRoot(string name, string path)
    {
        //DirectoryInfo di = new DirectoryInfo(Server.MapPath(path));
        DirectoryInfo di = new DirectoryInfo(path);
        TreeNode tn = new TreeNode(name, path);
        FillTree(di, tn);
        TreeView1.Nodes.Add(tn);
    }
    /// <summary>
    /// 加载目录结构
    /// </summary>
    /// <param name="di"></param>
    /// <param name="tn"></param>
    private void FillTree(DirectoryInfo di, TreeNode tn)
    {
        foreach (DirectoryInfo temp in di.GetDirectories())
        {
            string dir = temp.Name;
            if (dir.ToUpper().Contains("SVN") || dir.ToUpper().Contains("VSS"))
            {
                continue;
            }
            TreeNode tnD = new TreeNode(dir, dir);

            tn.Expanded = (bool)false;
            tn.ChildNodes.AddAt(0, tnD);

            FillTree(temp, tnD);
        }
    }
    /// <summary>
    /// 点击树目录
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    protected void TreeView1_SelectedNodeChanged(object sender, EventArgs e)
    {
        try
        {
            TreeNode tn = TreeView1.SelectedNode;
            tn.ToggleExpandState();
            FillGird();
            tn.Selected = false; 
        }
        catch (Exception ex)
        {
            Response.Write(ex.Message);
        }
    }
    /// <summary>
    /// 生成数据表结构
    /// </summary>
    /// <returns></returns>
    private DataTable CreateDataSchema()
    {
        DataTable dt = new DataTable();
        DataColumn dc1 = new DataColumn("name", typeof(string));
        DataColumn dc2 = new DataColumn("url", typeof(string));
        DataColumn dc3 = new DataColumn("image", typeof(string));
        DataColumn dc4 = new DataColumn("createtime", typeof(string));
        DataColumn dc5 = new DataColumn("size", typeof(string));

        dt.Columns.Add(dc1);
        dt.Columns.Add(dc2);
        dt.Columns.Add(dc3);
        dt.Columns.Add(dc4);
        dt.Columns.Add(dc5);

        return dt;
    }
    /// <summary>
    /// 获取点击的树目录路径
    /// </summary>
    /// <returns></returns>
    private string GetTreePath()
    {
        bool b = true;
        TreeNode tn = TreeView1.SelectedNode;
        string url = tn.Value;
        while (b)
        {
            if (tn.Parent != null)
            {
                tn = tn.Parent;
                url = tn.Value + "\\" + url;
            }
            else
            {
                b = false;
            }
        }
        return url;
    }
    /// <summary>
    /// 填充表格
    /// </summary>
    private void FillGird()
    {
        DataTable dt = CreateDataSchema();
        string url = GetTreePath();

        //DirectoryInfo di = new DirectoryInfo(Server.MapPath(url));
        DirectoryInfo di = new DirectoryInfo(url);
        FillFile(di, dt);

        GV.DataSource = dt;
        GV.DataBind();
    }
    /// <summary>
    /// 获取目录下文件内容并填充到数据DataTable里
    /// </summary>
    /// <param name="di"></param>
    /// <param name="dt"></param>
    private void FillFile(DirectoryInfo di, DataTable dt)
    {
        foreach (FileInfo ftemp in di.GetFiles())
        {
            string image = "";
            string extension = Path.GetExtension(ftemp.FullName).ToUpper();
            string exTemp = "XLS,DOC,PPT,TXT,PDF";

            foreach (string temp in exTemp.Split(','))
            {
                if (extension.Contains(temp))
                {
                    image = "Controls/Images/" + temp + ".gif";
                }
            }

            if (image != "")
            {
                DataRow dr = dt.NewRow();

                dr[0] = Path.GetFileName(ftemp.FullName);
                string url = ftemp.FullName.Replace(Server.MapPath(""), "").Substring(1);
                //url = url.Replace(":\\Inetpub\\wwwroot\\ZJWeb\\Report\\Download", "");
                //url = "http://10.211.106.120/ZJWeb/Report/Download" + url;
                //url = "http://localhost/ZJWeb/Report/Download" + url;
                dr[1] = url;
                dr[2] = image;
                dr[3] = ftemp.LastWriteTime.ToString("yyyy年MM月dd日 HH时mm分");
                string unit = "";
                double d;
                double temp = Convert.ToDouble(ftemp.Length);
                if (Convert.ToInt32(temp / 1024 / 1024) > 0)
                {
                    unit = "M";
                    d = temp / 1024 / 1024;
                }
                else
                {
                    unit = "K";
                    d = temp / 1024;
                }
                dr[4] = d.ToString("0.####") + unit;
                dt.Rows.Add(dr);
            }
        }
    }
}
