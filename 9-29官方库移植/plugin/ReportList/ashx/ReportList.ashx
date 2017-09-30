<%@ WebHandler Language="C#" Class="Report" %>

using System;
using System.Web;
using System.Collections.Generic;
using System.Data;
using System.Text;
using System.Web.Script.Serialization;

using Boco.BLLEngine;
using Boco.QueryEngine;
using Boco.Semantic.Entity;
using Boco.Dss.CustomAnalysis.Entity;
using Boco.Dss.CustomAnalysis.EntityDB;

public class Report : Boco.Dss.Framework.HttpHandlerBase
{
    static string connSys = System.Configuration.ConfigurationManager.ConnectionStrings["SQL_ConnStr"].ConnectionString;
    static string connDw = System.Configuration.ConfigurationManager.ConnectionStrings["RolapCube_XnglDw"].ConnectionString;

    public override void Process(HttpContext context)
    {
        string json = "";

        string actionType = context.Request["type"];

        string sql = "";
        if (actionType == "getFileList")
        {
            sql = @"select cl.class_desc 报告类别,ca.catelog_desc 目录,f.file_name 报告名称,u.real_name 上传人,f.load_time 上传时间,f.download_count 下载次数,f.remarks 备注,f.file_path 文件路径
                    from sys_file_file f,sys_fw_user u,sys_file_catelog ca,sys_file_class cl 
                    where f.class_id=cl.class_id and f.catelog_id=ca.catelog_id and f.user_id=u.user_id";
        }
        else if (actionType == "getOperateLog")
        {
            sql = "select * from (select day_id,ul_data,dl_data from dm_f_xdr_gn_isp_cell_h) where rownum<11";
        }

        DataTable dt = Boco.BLLEngine.CommonQuery.GetDataBySql(connSys, sql);

        json = GetGrid(dt);

        context.Response.Write(json);
    }

    public static string GetGrid(DataTable dt)
    {
        var str = Boco.CommonToolLibrary.Table.TableHelper.CreateJsonParameters(dt, true, 2).TrimStart(new char[] { '{' });
        string json = string.Format("{0}\"page\":{1},\"records\":{2},{3}", "{", 1, dt.Rows.Count, str);
        json = json.Replace("\r", "").Replace("\n", "").Replace("\0", "");
        return json;
    }

    protected override bool NeedLogin
    {
        get
        {
            return false;
        }
    }
}