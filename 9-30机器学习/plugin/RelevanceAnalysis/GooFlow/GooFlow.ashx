<%@ WebHandler Language="C#" Class="GooFlow" %>

using System;
using System.Web;
using System.Data;
using System.Collections.Generic;
using Boco.DssPortal.RelevanceAnalysis;
using Boco.Semantic.Entity;
using Boco.Semantic.EntityDB;
using Boco.DssPortal.RelevanceAnalysis.Entity;
using Boco.CommonToolLibrary;
using System.Web.Script.Serialization;
public class GooFlow : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        string jsonData = string.Empty;
        string type = context.Request["type"];
        switch (type)
        {
            case "getReportList"://获得列表树
                jsonData = RAReportNew.getZtreeNodes();
                break;
            case "addCaterory"://增加类别
                RAReport addCategory = createRAReport("add");
                jsonData = getResultJson(RAReportNew.addCaterory(addCategory).ToString());
                break;
            case "addReport"://增加报表
                RAReport addReport = createRAReport("add");
                jsonData = getResultJson(RAReportNew.addReport(addReport).ToString());
                break;
            case "editCaterory"://编辑类别
                RAReport editCategory = createRAReport("edit");
                jsonData = getResultJson(RAReportNew.editCategory(editCategory).ToString());
                break;
            case "editReport"://编辑报表
                RAReport editReport = createRAReport("edit");
                jsonData = getResultJson(RAReportNew.editReport(editReport).ToString());
                break;
            case "delCaterory"://删除类别
                RAReport delCategory = createRAReport("del");
                jsonData = getResultJson(RAReportNew.delCategory(delCategory).ToString());
                break;
            case "delReport"://删除报表
                RAReport delReport = createRAReport("del");
                jsonData = getResultJson(RAReportNew.delReport(delReport).ToString());
                break;
            case "loadFlow"://加载流程数据
                string reportID = context.Request["reportID"];
                string title = context.Request["reportName"];
                string version = context.Request["version_desc"];
                jsonData = RAReportNew.getGooFlowJsonDataByVerdionDesc(reportID, version, title);
                break;
            case "saveReportNodesLines"://保存报表下所有节点和连线
                string lines = context.Request["lineData"];
                string nodes = context.Request["nodeData"];
                string report_id = context.Request["reportID"];
                bool f = RAReportNew.insertLinesAndNodes(report_id, lines, nodes);
                jsonData = getResultJson(f.ToString());
                break;
            case "getFactList"://显示事实列表
                jsonData = RAReportNew.getAllFactListJson();
                break;
            case "getDim"://获取事实名称下的维度
                string factID = context.Request["factID"];
                jsonData = RAReportNew.getRelatedDimByFactID(factID);
                break;
            case "getHierarchie"://获取维度名称下所有层次集合
                string dim_ID = context.Request["dimID"];
                jsonData = RAReportNew.getHierarchieByDimID(dim_ID);
                break;
            case "getLevel"://通过 维度ID 获取所有粒度集合
                string dimID = context.Request["dimID"];
                jsonData = RAReportNew.getLevelsByDimID(dimID);
                break;
            case "getLevelByName"://通过 维度名称 获取所有粒度集合
                string f_id = context.Request["factID"];
                string d_name = context.Request["dimName"];
                jsonData = RAReportNew.getLevelsByDimName(f_id, d_name);
                break;
            case "getMeas"://获得某一事实名称下所有的指标
                string fact_id = context.Request["factID"];
                jsonData = RAReportNew.getMeasByFactID(fact_id);
                break;
            case "getSwitchTable":
                string pLevelDesc = context.Request["pLevelDesc"];//父节点
                string levelDesc = context.Request["levelDesc"]; //当前节点
                string xmlPath = "~/PlugIn/RelevanceAnalysis/Xml/NeConfig.xml";
                xmlPath = context.Server.MapPath(xmlPath);
                List<ItemInfo> items = ConfigListInfoDB.GetListByKey(xmlPath, "DimConvert", false, false);
                jsonData = getSwitchTable(items, pLevelDesc, levelDesc);
                break;
            case "getAllCondition":
                string factID2 = context.Request["factID"];
                string dimID2 = context.Request["dimID"];
                string hierID2 = context.Request["hierID"];
                jsonData = RAReportNew.getAllFactListJson() + "#" + RAReportNew.getRelatedDimByFactID(factID2) + "#" + RAReportNew.getHierarchieByDimID(dimID2) + "#" + RAReportNew.getLevelsByDimID(dimID2);
                break;
            case "saveAll":
                string strGFNode = context.Request["strGFNode"];
                string report_ID = context.Request["reportID"];
                string version_desc = context.Request["version_desc"];
                JavaScriptSerializer jssNode = new JavaScriptSerializer();
                GFReportNew report = jssNode.Deserialize<GFReportNew>(strGFNode);
                string result = RAReportNew.insertAll(report_ID, version_desc, report).ToString();
                jsonData = getResultJson(result);
                break;
            case "getVersion"://获取某一报表下所有版本号
                string rID = context.Request["reportID"];
                jsonData = RAReportNew.getVersion(rID);
                break;
            case "delVersion":
                string r_ID = context.Request["reportID"];
                string v_desc = context.Request["version_desc"];
                jsonData = RAReportNew.delVersion(r_ID, v_desc);
                break;
            case "setDefalutVersion":
                string id = context.Request["reportID"];
                string desc = context.Request["version_desc"];
                jsonData = RAReportNew.setDefaultVersion(id, desc);
                break;
        }
        context.Response.Write(jsonData);
    }
    //获取json格式的字符串 如：{"flag":"true"}
    private string getResultJson(string result)
    {
        string json = "{\"flag\":\"" + result + "\"}";
        return json;
    }
    //构造raReport对象
    private RAReport createRAReport(string type)
    {
        HttpContext context = HttpContext.Current;
        RAReport report = new RAReport();
        string name = context.Request["name"];
        string pid = context.Request["pid"];
        string id = context.Request["id"];//选中节点id
        string isReport = context.Request["isReport"];
        report.UserId = "1394";//Env.User_Info.UserID;
        if (type == "add")
        {
            //报表id 加pid+isReport+name+时间是为了避免类别和报表文件名字一样时，生成的id唯一。
            report.Id = Boco.CommonToolLibrary.CRC32.GetCRC32("新版自定义流程之" + pid + isReport + name + DateTime.Now.ToString()).ToString();
        }
        else if (type == "edit" || type == "del")
        {
            //报表id
            report.Id = id;
        }
        report.ReportTypeName = name;//报表类别名称
        report.ReportName = name;//报表名称
        report.ReportTypeParentID = pid;//报表类别的父id
        report.ReportTypeIsReport = isReport;//类别：1和报表：0
        return report;
    }
    private string getSwitchTable(List<ItemInfo> list, string value, string property1)
    {
        string str = "[";
        if (list.Count > 0)
        {
            foreach (ItemInfo item in list)
            {
                if (item.value.Trim().ToUpper() == value.ToUpper() && item.Property1.Trim().ToUpper() == property1.ToUpper())
                {
                    str += "{\"id\":\"" + item.name + "\",\"name\":\"" + item.name + "\"},";
                }
            }
            str = str.TrimEnd(',');
            if (str == "[")
            {
                str += "{\"id\":\"-1\",\"name\":\"无\"}";
            }
        }
        else
        {
            str += "{\"id\":\"-1\",\"name\":\"无\"}";
        }
        str += "]";
        return str;
    }
    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
}