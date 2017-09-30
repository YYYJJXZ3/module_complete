<%@ WebHandler Language="C#" Class="Boco.Dss.CustomAnalysis.Web.Gather" %>

using System;
using System.Web;
using System.Data;
using System.Collections.Generic;
using Boco.BLLEngine;
using Boco.QueryEngine;
using Boco.Dss.Framework;
namespace Boco.Dss.CustomAnalysis.Web
{
    public class Gather : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {

            string type = context.Request["type"];
            string measureID = context.Request["measureID"];
            string columsName = context.Request["columsName"];
            string jsonData = context.Request["jsonData"];
            string analyzer = context.Request["ana"];
            string json = string.Empty;
            if (type == "theme")
            {
                json = GetThemeName();
            }
            else if (type == "export")
            {
                json = ExportDataToExcel(columsName, jsonData);
            }

            context.Response.Write(json);

        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
        private string GetThemeName()
        {
            string sql = "select theme_desc from sys_meta_measure where measure_id=-1352849413";
            DataTable dt = CommonQuery.GetDataBySql(System.Configuration.ConfigurationManager.ConnectionStrings["SQL_ConnStr"].ConnectionString, sql);
            string themeName = dt.Rows[0][0].ToString();
            return themeName;
        }

        private string ExportDataToExcel(string columsName, string jsonData)
        {
            DataTable dtGrid = Boco.CommonToolLibrary.Table.TableHelper.CreateTableParameters(columsName, jsonData);
            string fileName = HttpContext.Current.Server.MapPath("~/Temp") + "/" + (new Random().Next(1000, 9999).ToString()) + ".xls";
            Boco.Dss.Framework.EPPlusHelper.ExportExcelHelper.ExportExcelToPath(new List<DataTable>() { dtGrid }, fileName);
            return fileName;
        }

    }
}