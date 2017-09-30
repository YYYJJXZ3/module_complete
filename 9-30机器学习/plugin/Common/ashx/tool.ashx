<%@ WebHandler Language="C#" Class="tool" %>

using System;
using System.Web;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using Boco.QueryEngine;
using System.Data;
using Boco.Dss.CustomAnalysis.Entity;
using Boco.Dss.CustomAnalysis.EntityDB;
using System.Text;
using Boco.Semantic.Entity;

public class tool : Boco.Dss.Framework.HttpHandlerBase
{
    private void GetData(HttpContext context)
    {
        DataTable dt;
        StringBuilder strResult = new StringBuilder();
        strResult.Append("{\"desc\":[");
        string meaid = "\"meaids\":[";
        string ana = "\"analyzer\":";
        try
        {
            string id = context.Request["Templateid"];
            string slice = context.Request["slice"];
            string rowdim = context.Request["rowdim"];//@jyt20151005 增加行维度，解决在impala下关联表时需要有关联字段
            JavaScriptSerializer jss = new JavaScriptSerializer();
            List<Dimension> dim = jss.Deserialize<List<Dimension>>(slice);
            Analyzer analyzer;
            if (string.IsNullOrEmpty(id))
            {
                string strID = context.Request["list"];
                List<string> listid = new List<string>();
                listid = jss.Deserialize<List<string>>(strID);
                analyzer = new Analyzer();
                for (int i = 0; i < listid.Count; i++)
                {
                    Measure m = new Measure();
                    m.MeasureID = listid[i];
                    analyzer.MeasureList.Add(m);
                }
            }
            else
            {
                int _default = 0;
                int.TryParse(id, out _default);
                Template template = TemplateDB.GetTemplateByID(_default);
                analyzer = template.Analyzer;
                analyzer.RowDimList.Clear();
                analyzer.ColDimList.Clear();
            }

            //@jyt20151005 增加行维度，解决在impala下关联表时需要有关联字段
            if (!String.IsNullOrEmpty(rowdim) && rowdim != "undefined")
            {
                List<Dimension> RowDim = jss.Deserialize<List<Dimension>>(rowdim);
                analyzer.RowDimList = RowDim;
            }

            //@jyt20151005 过滤“未知”项
            for (int i = 0; i < dim.Count; i++)
            {
                if (dim[i].LevelName == "地区" || dim[i].LevelName == "用户地区")
                {
                    if (string.IsNullOrEmpty(dim[i].Val) || dim[i].Val == "全部")
                    {
                        dim[i].ValType = ValType.NotIn;
                        dim[i].ValList.Add("未知");
                    }
                }
                else if (dim[i].LevelName == "分公司" || dim[i].LevelName == "用户分公司")
                {
                    if (string.IsNullOrEmpty(dim[i].Val) || dim[i].Val == "全部")
                    {
                        dim[i].ValType = ValType.NotIn;
                        dim[i].ValList.Add("未知");
                    }
                }
                else if (dim[i].LevelName == "区县" || dim[i].LevelName == "用户区县")
                {
                    if (string.IsNullOrEmpty(dim[i].Val) || dim[i].Val == "全部")
                    {
                        dim[i].ValType = ValType.NotIn;
                        dim[i].ValList.Add("未知");
                    }
                }
            }

            for (int j = analyzer.SliceDimList.Count-1; j > -1 ; j--)
            {
                for (int i = 0; i < dim.Count; i++)
                {
                    if (analyzer.SliceDimList[j].LevelName == dim[i].LevelName) {
                        analyzer.SliceDimList.RemoveAt(j);
                        break;
                    }
                }
            }

            analyzer.SliceDimList.AddRange(dim);
            analyzer.TopN = 1;
            analyzer.PageSetting.EnableComputeTotal = false;
            analyzer.ShowUintInColumn = true;
            string sql = analyzer.GetQuerySentence()[0].Sql;

            ana += jss.Serialize(analyzer);
            dt = analyzer.GetData();

            //@jyt 将行维度的列删掉
            if (!String.IsNullOrEmpty(rowdim) && rowdim != "undefined")
            {
                for (int i = 0; i < analyzer.RowDimList.Count; i++)
                {
                    dt.Columns.RemoveAt(0);
                }
            }

            //@jyt 将时延的单位由ms改为分钟或小时
            if (dt.Rows.Count > 0)
            {
                for (int i = 0; i < dt.Columns.Count; i++)
                {
                    if (dt.Columns[i].ColumnName.Contains("ms"))
                    {
                        if (!string.IsNullOrEmpty(dt.Rows[0][i].ToString()))
                        {
                            double tmpValue = Convert.ToDouble(dt.Rows[0][i]);
                            if (tmpValue > 3600000)//满1小时，转换成小时
                            {
                                dt.Rows[0][i] = Math.Round(tmpValue / (1000 * 60 * 60), 2);
                                dt.Columns[i].ColumnName = dt.Columns[i].ColumnName.Replace("ms", "小时");
                            }
                            else if (tmpValue > 60000)//满1分钟，转换成分钟
                            {
                                dt.Rows[0][i] = Math.Round(tmpValue / (1000 * 60));
                                dt.Columns[i].ColumnName = dt.Columns[i].ColumnName.Replace("ms", "分钟");
                            }
                        }
                    }
                }
            }

            if (analyzer.MeasureList.Count > 0)
            {
                List<string> list = new List<string>();
                for (int i = 0; i < analyzer.MeasureList.Count; i++)
                {
                    list.Add(analyzer.MeasureList[i].MeasureID);
                }
                List<Sem_Measure> allList = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByListID(list);
                for (int i = 0; i < allList.Count; i++)
                {
                    //strResult.Append("\"" + allList[i].Explain + "\"");
                    strResult.Append("\"" + allList[i].Explain.Replace("\n", "<br/>") + "\"");//@jyt 将指标描述中的“\n”替换成“<br/>”
                    meaid += "\"" + allList[i].ID + "\"";
                    if (i < allList.Count - 1)
                    {
                        strResult.Append(",");
                        meaid += ",";
                    }
                }
            }

        }
        catch
        {
            dt = new DataTable();
        }
        string result = Boco.CommonToolLibrary.Table.TableHelper.CreateJsonParameters(dt, true, 2);
        strResult.Append("]," + meaid + "],"+ ana + "," + result.TrimStart('{'));
        context.Response.Write(strResult.ToString());
    }
    public override void Process(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        string type = context.Request["act"];
        if (type == "getdata")
        {
            GetData(context);
        }
        else if (type == "defaultdata")
        {
            GetDefaultData(context);
        }
    }
    private void GetDefaultData(HttpContext context)
    {
        string item = context.Request["item"];
        string app = context.Request["app"];
        string sql = "select t.measure from app_t2t_meafilter t where t.user_id=1394 and t.item='" + item + "' and t.app='" + app + "'";
        DataTable dt;
        try
        {
            string conn = System.Configuration.ConfigurationManager.ConnectionStrings["SQL_ConnDm"].ConnectionString;
            dt = Boco.BLLEngine.CommonQuery.GetDataBySql(conn, sql);
        }
        catch
        {
            dt = new DataTable();
        }
        if (dt.Rows.Count > 0)
        {
            context.Response.Write(dt.Rows[0][0].ToString());
        }
        else
        {
            context.Response.Write("");
        }
    }
}