<%@ WebHandler Language="C#" Class="GooFlowShow" %>

using System;
using System.Web;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using System.Data;
//using OfficeOpenXml;
//using OfficeOpenXml.Style;
using System.Drawing;
public class GooFlowShow : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        string json = "{}";
        string type = context.Request["type"];


        string MaxVal = context.Request["MaxVal"];
        string MinVal = context.Request["MinVal"];
        string urlPara = context.Request["urlPara"];
        string expr_desc = context.Request["expr_desc"];
        string reportid = context.Request["reportid"];
        string nodeid = context.Request["nodeid"];
        string versiondesc = context.Request["versiondesc"];
        string meaid = context.Request["meaid"];
        string dimfiler = context.Request["dimfiler"];

        switch (type)
        {
            case "flownodeLoad":
                Boco.DssPortal.RelevanceAnalysis.Entity.UrlParameter url = new Boco.DssPortal.RelevanceAnalysis.Entity.UrlParameter();
                url.ReportId = urlPara.Split(',')[0];
                url.Version_Desc = urlPara.Split(',')[1];
                url.DateType = urlPara.Split(',')[2];
                url.Date = urlPara.Split(',')[3];
                url.NeType = urlPara.Split(',')[4];
                url.NeStr = urlPara.Split(',')[5];
                url.Hour = urlPara.Split(',')[6];
                url.UserId = urlPara.Split(',')[7];
                url.isResult = urlPara.Split(',')[8] == "0" ? false : true;
                url.IsCache = urlPara.Split(',')[9];
                url.isPassval = urlPara.Split(',')[10];
                json = Boco.DssPortal.RelevanceAnalysis.EntityDB.AnalysisReport1.GetFlowJson(url);

                break;
            //case "createText":
            //    string reportID = context.Request["reportID"];
            //    string version = context.Request["version"];
            //    string date = context.Request["date"];
            //    string ne = context.Request["ne"];
            //    string content = context.Request["content"];
            //    //json = createCacheFile(reportID, version, date, ne, "ddddddddd你好");
            //    json = createCacheFile("111", "222", "2014年08月25日", "上海", "上海你好");
            //    break;
            //case "readText":
            //    string rid = context.Request["reportID"];
            //    string ver = context.Request["version"];
            //    string d = context.Request["date"];
            //    string n = context.Request["ne"];
            //    //json = readCacheFile(rid,ver,d,n);
            //    json = readCacheFile("111", "222", "2014年08月25日", "上海");
            //    break;
            case "updateMea":
                json = UpdateExpr(reportid, nodeid, versiondesc, meaid, MaxVal, MinVal, expr_desc);
                break;
            case "updateDim":
                json = UpdateNodeDimFiler(reportid, nodeid, versiondesc, dimfiler);
                break;
        }
        context.Response.Write(json);
    }

    private string UpdateExpr(string reportid, string nodeid, string versiondesc, string measure_id, string MaxVal, string MinVal, string expr_desc)
    {

        string sql = "update sys_ra_analysisexpr set max_value='" + MaxVal + "',min_value='" + MinVal +
            "' ,analysis_expr_desc='" + expr_desc + "' where ra_node_id in (select ra_node_id from sys_ra_node " +
            "where parent_node =" + nodeid + " or ra_node_id =" + nodeid + " and version_desc = '" + versiondesc + "' and report_id =" +
             reportid + ") and version_desc = '" + versiondesc + "' and   measure_id =" + measure_id;
        int n = Boco.Dss.Data.DbHelper.ExecuteNonQueryBySql(sql, Boco.Dss.Web.Common.Utils.GetConnStringByName("SQL_ConnStr"));
        if (n > 0)
        {
            return "成功";
        }

        return "失败";

    }
    private string UpdateNodeDimFiler(string reportid, string nodeid, string versiondesc, string dimfiler)
    {

        string sql = "update sys_ra_node  set dimensionfilter='" + dimfiler + "' where ra_node_id=" + nodeid +
            " and version_desc = '" + versiondesc + "' and report_id =" + reportid;
        int n = Boco.Dss.Data.DbHelper.ExecuteNonQueryBySql(sql, Boco.Dss.Web.Common.Utils.GetConnStringByName("SQL_ConnStr"));
        if (n > 0)
        {
            return "成功";
        }
        return "失败";
    }
    private string createCacheFile(string reportID, string version, string date, string ne, string content)
    {
        string result = "{\"result\":\"false\"}";
        try
        {
            writeFile(reportID, version, date, ne, content);
            result = "{\"result\":\"true\"}";
        }
        catch (Exception)
        {
            result = "{\"result\":\"false\"}";
        }
        return result;
    }
    //写文件
    private void writeFile(string reportID, string version, string date, string ne, string content)
    {
        string dirPath = HttpContext.Current.Server.MapPath("../../RelevanceAnalysis/CacheFiles/" + date + "/");
        string fileNamePath = HttpContext.Current.Server.MapPath("../../RelevanceAnalysis/CacheFiles/" + date + "/" + reportID + "_" + version + "_" + date + "_" + ne + ".txt");
        //判断目录是否存在
        if (!Directory.Exists(dirPath))
        {
            Directory.CreateDirectory(dirPath);
        }
        //判断文件是否存在
        if (!File.Exists(fileNamePath))
        {
            File.Create(fileNamePath).Close();
            FileStream fs = new FileStream(fileNamePath, FileMode.Create, FileAccess.ReadWrite);
            StreamWriter sw = new StreamWriter(fs, System.Text.Encoding.Default);
            sw.Write(content);
            sw.Flush();
            sw.Close();
        }
    }
    private string readCacheFile(string reportID, string version, string date, string ne)
    {
        string content = string.Empty; ;
        string fileNamePath = HttpContext.Current.Server.MapPath("../../RelevanceAnalysis/CacheFiles/" + date + "/" + reportID + "_" + version + "_" + date + "_" + ne + ".txt");
        //判断文件是否存在
        if (File.Exists(fileNamePath))
        {
            try
            {
                using (FileStream fs = new FileStream(fileNamePath, FileMode.Open))
                {
                    using (StreamReader sr = new StreamReader(fs, System.Text.Encoding.GetEncoding("GB2312")))
                    {
                        while (sr.Peek() >= 0)
                        {
                            content += sr.ReadLine();
                        }
                    }
                }
            }
            catch (Exception)
            {
                content = "";
            }
        }
        content = "{\"result\":\"" + content + "\"}";
        return content;
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}