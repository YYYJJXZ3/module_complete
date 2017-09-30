<%@ WebHandler Language="C#" Class="DashBoart" %>

using System;
using System.Web;
using System.Text;
using System.Linq;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using System.Data;
using System.Configuration;

using Boco.QueryEngine;
using Boco.Semantic.Entity;
using Boco.Semantic.EntityDB;
using Boco.CommonToolLibrary;
using Boco.Dss.CustomAnalysis.Entity;
using Boco.Dss.CustomAnalysis.EntityDB;
using Boco.Dss.CustomAnalysis.Entity.DashBoard;
using System.Web.SessionState;
using System.Text.RegularExpressions;
using Boco.Dss.Framework;

/*----------------------------------------------------------------
    // Copyright (C) 2015 北京亿阳信通新产品预言
    // 版权所有。 
    //
    // 文件名：DashBoart.cs
    // 文件功能描述：报表归属路径
    //
    // 
    // 创建标识：hufenghcao 20150328
    //
    // 修改标识：
    // 修改描述：
    //
//----------------------------------------------------------------*/
public class DashBoart : HttpHandlerBase
{
    public override void Process(HttpContext context)
    {
        string act = context.Request["act"];
        if (act == "getreporttree")
        {
            GetReportTree(context);
        }
        else if (act == "getdashboardtree")
        {
            GetDashBoardTree(context);
        }
        else if (act == "deletedashboard")
        {
            DeleteDashBoard(context);
        }
        else if (act == "createfile")
        {
            CreateFile(context);
        }
        else if (act == "rename")
        {
            Rename(context);
        }
        else if (act == "getlayout")
        {
            GetLayout(context);
        }
        else if (act == "GetReportDim")
        {
            GetReportDim(context);
        }
        else if (act == "getdimdata")
        {
            GetDataTableByDimension(context);
        }
        else if (act == "savedashboard")
        {
            SaveDashboard(context);
        }
        else if (act == "getdashboard")
        {
            GetDashboard(context);
        }
    }
    private void GetDashboard(HttpContext context)
    {
        string key = context.Request["key"];
        JavaScriptSerializer jss = new JavaScriptSerializer();
        Dashboard model = DashboardDB.Selcet(key);
        context.Response.Write(jss.Serialize(model));
    }
    private void SaveDashboard(HttpContext context)
    {
        string strCon = context.Request["strCon"];
        JavaScriptSerializer jss = new JavaScriptSerializer();
        Dashboard model = jss.Deserialize<Dashboard>(strCon);
        if (string.IsNullOrEmpty(model.DashboardID))
        {
            model.DashboardID = CRC32.GetCRC32(loginUseid + model.FolderID + model.Desc).ToString();
        }
        model.UserID = loginUseid;
        int val = DashboardDB.Insert(model);
        if (val > 0)
        {
            context.Response.Write(model.DashboardID.ToJson(HandlerStatus.OK));
        }
        else
        {
            context.Response.Write((0).ToJson(HandlerStatus.OK));
        }
    }
    private void GetDataTableByDimension(HttpContext context)
    {
        string key = context.Request["key"];
        string pageIndex = context.Request["pageIndex"];
        string dimensionID = context.Request["dimid"];
        string levelName = context.Request["levleName"];
        int pIndex = 1;
        int.TryParse(pageIndex, out pIndex);
        int pSize = 8;
        DataTable dt = new DataTable();
        if (string.IsNullOrEmpty(dimensionID))
        {
            context.Response.Write(CreateJsonParameters(pIndex, pSize, 0, dt));
            return;
        }

        int curCount = 0;
        Sem_Dimension dim = Boco.Semantic.EntityDB.DimensionDB.GetDimensionByID(dimensionID);
        if (dim == null)
        {
            context.Response.Write(CreateJsonParameters(pIndex, pSize, 0, dt));
            return;
        }
        Level currentLevel = dim.Levels.Find(p => p.Name == levelName);
        if (currentLevel == null)
        {
            context.Response.Write(CreateJsonParameters(pIndex, pSize, 0, dt));
            return;
        }
        if (!string.IsNullOrEmpty(key))
        {
            currentLevel.ValType = "Contain";
            currentLevel.Val = key;
        }
        dt = Boco.Semantic.EntityDB.DimensionDB.GetDimensionAttributeMember(
            dim,
            new List<string>() { levelName },
            new List<Level>() { currentLevel },
            (pIndex - 1) * pSize,
            pSize,
            true,
            0,
            false,
            out curCount);
        context.Response.Write(CreateJsonParameters(pIndex, pSize, curCount, dt));
        return;
    }
    private string CreateJsonParameters(int pageindex, int pageSize, int records, DataTable dt)
    {
        var str = Boco.CommonToolLibrary.Table.TableHelper.CreateJsonParameters(dt).TrimStart(new char[] { '{' });
        return string.Format("{0}\"page\":{1},\"records\":{2},{3}", "{", pageindex, records, str);
    }
    private List<Level> GetLevel(Sem_Dimension dim, string depValue)
    {
        List<Level> list = new List<Level>();
        if (!string.IsNullOrEmpty(depValue))
        {
            string[] arrLevel = depValue.Split(';');
            for (int i = 0; i < arrLevel.Length; i++)
            {
                string[] arrValue = arrLevel[i].Split('.');
                string level = arrValue[0].Replace("[", "").Replace("]", "");
                Level parentLevel = dim.Levels.Find(p => p.Name == level);
                if (parentLevel != null)
                {
                    parentLevel.Val = arrValue[1].Replace("[", "").Replace("]", "");
                    list.Add(parentLevel);
                }
            }
        }
        return list;
    }
    public void GetReportDim(HttpContext context)
    {
        int reportId = int.Parse(context.Request["rid"]);
        Template template = TemplateDB.GetTemplateByID(reportId);
        List<Condition> list = new List<Condition>();
        List<Condition> row = GetDimJosn(template.Analyzer.RowDimList, false, 0);
        if (row.Count > 0)
        {
            list.AddRange(row);
        }
        List<Condition> slice = GetDimJosn(template.Analyzer.SliceDimList, false, 2);
        if (slice.Count > 0)
        {
            list.AddRange(slice);
        }
        List<Condition> col = GetDimJosn(template.Analyzer.ColDimList, true, 3);
        if (col.Count > 0)
        {
            list.AddRange(col);
        }
        List<Condition> mea = GetDimByMea(template.Analyzer.MeasureList);
        if (mea.Count > 0)
        {
            list.AddRange(mea);
        }
        JavaScriptSerializer jss = new JavaScriptSerializer();
        context.Response.Write(jss.Serialize(list));
    }
    private List<Condition> GetDimByMea(List<Boco.QueryEngine.Measure> meaList)
    {
        List<Condition> list = new List<Condition>();
        if (meaList != null && meaList.Count > 0)
        {
            for (int i = 0; i < meaList.Count; i++)
            {
                Condition model = new Condition();
                model.DimensionID = meaList[i].MeasureID;
                model.DimensionName = meaList[i].DisplayName;
                model.LevelName = meaList[i].DisplayName;
                model.IsMeasure = 1;
                list.Add(model);
            }
        }
        return list;
    }
    private List<Condition> GetDimJosn(List<Dimension> dimList, bool isNeed, int ismeasure)
    {
        List<Condition> list = new List<Condition>();
        foreach (Boco.QueryEngine.Dimension dim in dimList)
        {
            Condition model = new Condition(dim);
            Boco.Semantic.Entity.Sem_Dimension sd = Boco.Semantic.EntityDB.DimensionDB.GetDimensionByID(dim.DimensionID);
            if (sd != null)
            {
                model.Hierarchies = sd.Hierarchies;
            }
            model.IsMeasure = ismeasure;
            if (dim.DimensionName == "日期维")
            {
                model.DimensionType = DimensionType.Date;
                model.IsNeed = true;
            }
            else if (dim.DimensionName == "小时维")
            {
                model.DimensionType = DimensionType.Hour;
            }
            else
            {
                model.DimensionType = DimensionType.Ne;
            }
            model.IsNeed = isNeed;
            list.Add(model);
        }
        return list;
    }
    public void GetLayout(HttpContext context)
    {
        var list = LayoutDB.Selcet();
        JavaScriptSerializer json = new JavaScriptSerializer();
        context.Response.Write(json.Serialize(list));
    }
    private void Rename(HttpContext context)
    {
        var name = string.IsNullOrEmpty(context.Request["name"]) ? "未命名" : context.Request["name"];
        var id = string.IsNullOrEmpty(context.Request["id"]) ? "-1" : context.Request["id"];
        var pid = string.IsNullOrEmpty(context.Request["pid"]) ? "-1" : context.Request["pid"];
        var type = string.IsNullOrEmpty(context.Request["type"]) ? "-1" : context.Request["type"];
        if (type == "2")
        {
            if (DashboardFolderDB.IsExistsByFolderName(name, pid))
            {
                context.Response.Write(this.SetMesseges(false, "", "该节点下已经存在的文件夹名称"));
            }
            else
            {
                int a = DashboardFolderDB.UpdateFolderDesc(id, name);
                if (a == 1)
                {
                    context.Response.Write(this.SetMesseges(true, "", "文件夹改名成功"));
                }
                else
                {
                    context.Response.Write(this.SetMesseges(false, "", "文件夹改名失败：数据库操作失败"));
                }
            }
        }
        else if ((type == "3"))
        {
            if (DashboardDB.IsExistsDashBoardName(name, pid))
            {
                context.Response.Write(this.SetMesseges(false, "", "该节点下已经存在的报表名称"));
            }
            else
            {
                int a = DashboardDB.UpdateDashboardDesc(id, name);
                if (a == 1)
                {
                    context.Response.Write(this.SetMesseges(true, "", "报表改名成功"));
                }
                else
                {
                    context.Response.Write(this.SetMesseges(false, "", "报表改名失败：数据库操作失败"));
                }
            }
        }
        else
        {
            context.Response.Write(this.SetMesseges(false, "", "修改类型不明确！"));
        }
    }

    private void CreateFile(HttpContext context)
    {
        string desc = context.Request["desc"];
        string parent = context.Request["parent"];
        var name = string.IsNullOrEmpty(context.Request["desc"]) ? "未命名" : context.Request["desc"];
        var pid = string.IsNullOrEmpty(context.Request["parent"]) ? "-1" : context.Request["parent"];
        string key = pid + "-" + name;
        string listid = CRC32.GetCRC32(key).ToString();
        if (DashboardFolderDB.IsExistsByFolderName(listid))
        {
            context.Response.Write(this.SetMesseges(false, "", "该节点下已经存在的文件夹名称"));
        }
        else
        {
            var tempPath = new DashboardFolder();

            tempPath.CreateDate = DateTime.Now.ToShortTimeString();
            tempPath.FolderDesc = name;
            tempPath.IsDelete = "1";
            tempPath.ParentID = pid;
            tempPath.UserID = loginUseid;
            tempPath.FolderID = listid;
            tempPath.ModuleCode = "db";
            int a = DashboardFolderDB.InsertFolder(tempPath);
            if (a == 1)
            {
                context.Response.Write(this.SetMesseges(true, listid, "添加文件夹成功"));
            }
            else
            {
                context.Response.Write(this.SetMesseges(false, "", "添加文件夹失败：数据库操作失败"));
            }
        }

    }
    private void DeleteDashBoard(HttpContext context)
    {
        string key = context.Request["key"];
        string type = context.Request["nodetype"];
        int val = 0;
        string message = "删除";
        if (type == "2")
        {
            val = DashboardFolderDB.DeleteFolder(key);
            message += "文件";
        }
        else
        {
            val = DashboardDB.Delete(key);
            message += "报表";
        }
        if (val > 0)
        {
            message += "成功！";
        }
        else
        {
            message += "过程中发生意外，请重试！";
        }
        context.Response.Write(SetMesseges(val > 0, "", message));
    }
    private void GetReportTree(HttpContext context)
    {
        string key = string.IsNullOrEmpty(context.Request["key"]) ? "" : context.Request["key"];
        StringBuilder str = new StringBuilder();
        str.Append("{ \"id\": -1, \"pId\": 0, \"name\": \"自定义报表数据\", \"isParent\": true, \"open\": true },");
        List<TempPath> folderList = TempPathDB.GetTempPathByUserID(loginUseid);
        foreach (var item in folderList)
        {
            str.Append("{");
            str.Append("\"id\":\"" + item.FolderID + "\",");
            str.Append("\"pId\":\"" + item.ParentID + "\",");
            str.Append("\"name\":\"" + item.FolderName + "\",");
            str.Append("\"isParent\":true");
            str.Append("},");
        }
        List<Template> Templates = TemplateDB.GetTemplateNameListByUserID(loginUseid, key);
        for (int i = 0; i < Templates.Count; i++)
        {
            str.Append("{");
            str.Append("\"id\":\"" + Templates[i].TemplateID + "\",");
            str.Append("\"pId\":\"" + Templates[i].FolderID + "\",");
            str.Append("\"name\":\"" + Templates[i].TemplateName + "\",");
            str.Append(Templates[i].ShowGrid ? "\"showGrid\":true," : "\"showGrid\":false,");
            str.Append(Templates[i].ShowChart ? "\"showChart\":true," : "\"showChart\":false,");
            str.Append("\"isParent\":false");
            str.Append("},");
        }

        context.Response.Write("[" + str.ToString().TrimEnd(new char[] { ',' }) + "]");
    }
    private string SetMesseges(bool result, string jsomData = "", string tip = "")
    {
        return "{\"result\":\"" + (result ? "1" : "2") + "\",\"data\":\"" + jsomData + "\",\"message\":\"" + tip + "\"}";
    }
    public void GetDashBoardTree(HttpContext context)
    {
        var key = string.IsNullOrEmpty(context.Request["key"]) ? "" : context.Request["key"];
        StringBuilder str = new StringBuilder("");
        str.Append("{ \"id\": -1, \"pId\": 0, \"name\": \"发布报表\", \"isParent\": true, \"open\": true,\"nodetype\":1,\"isPub\":false},");
        List<DashboardFolder> folders = DashboardFolderDB.GetDashboardFolderByUserID(loginUseid, key);
        for (int i = 0; i < folders.Count; i++)
        {
            str.Append("{");
            str.Append("\"id\":" + folders[i].FolderID + ",");
            str.Append("\"pId\":" + folders[i].ParentID + ",");
            str.Append("\"name\":\"" + folders[i].FolderDesc + "\",");
            str.Append("\"nodetype\":2,");
            str.Append("\"isParent\":true,");
            str.Append("\"open\":false,");
            str.Append("\"isPub\":false},");
        }
        List<Dashboard> dashboard = DashboardDB.SelcetByUser(loginUseid, key);
        for (int i = 0; i < dashboard.Count; i++)
        {
            str.Append("{");
            str.Append("\"id\":" + dashboard[i].DashboardID + ",");
            str.Append("\"pId\":" + dashboard[i].FolderID + ",");
            str.Append("\"name\":\"" + (string.IsNullOrEmpty(dashboard[i].Desc) ? dashboard[i].DashboardID : dashboard[i].Desc) + "\",");
            str.Append("\"nodetype\":3,");
            str.Append("\"isParent\":false,");
            str.Append("\"urlType\":\"" + dashboard[i].LayoutUrl + "\",");
            str.Append("\"isPub\":" + dashboard[i].IsPub.ToString().ToLower() + "},");
        }
        context.Response.Write("[" + str.ToString().TrimEnd(new char[] { ',' }) + "]");
    }
    private string loginUseid
    {
        get
        {
            try
            {
                if (string.IsNullOrEmpty(this.CurrentUser.UserID))
                {
                    return System.Configuration.ConfigurationManager.AppSettings["AdminUserId"];
                }
                else
                {
                    return this.CurrentUser.UserID;
                }
            }
            catch
            {
                return System.Configuration.ConfigurationManager.AppSettings["AdminUserId"];
            }
        }
    }
}