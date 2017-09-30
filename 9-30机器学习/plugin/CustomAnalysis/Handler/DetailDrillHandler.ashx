<%@ WebHandler Language="C#" Class="DetailDrillHandler" %>

using System;
using System.Web;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using Boco.QueryEngine;
using Boco.Semantic.Entity;
using Boco.Semantic.EntityDB;

public class DetailDrillHandler : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        string qType = context.Request.QueryString["qtype"];
        if (qType == "candrill")
        {
            string anaStr = context.Request["ana"];
            Analyzer ana = new System.Web.Script.Serialization.JavaScriptSerializer().Deserialize<Analyzer>(anaStr);
            bool canDrill = CanDrillToDetail(ana);
            if (canDrill)
            {
                context.Response.Write("1");
            }
            else
            {
                context.Response.Write("0");
            }
        }
        else if (qType == "sql")
        {
            string anaStr = context.Request["ana"];
            Analyzer ana = new System.Web.Script.Serialization.JavaScriptSerializer().Deserialize<Analyzer>(anaStr);
            List<QuerySentence> qsList = GetDetailSql(ana);
            string qsJson = new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(qsList);
            context.Response.Write(qsJson);
        }
        else
        {
            context.Response.Write("Hello World");
        }
    }

    private bool CanDrillToDetail(Analyzer analyzer)
    {
        Sem_Measure sm = MeasureDB.GetMeasureByID(analyzer.MeasureList[0].MeasureID);
        if (string.IsNullOrEmpty(sm.TableName))
        {
            return false;
        }
        else
        {
            string sql = @"select t.dimension_desc, t.level_desc
  from sys_meta_detail_dim t, sys_meta_fact f, sys_meta_detail d
 where d.fact_id = f.fact_id
   and d.detail_id = t.detail_id
   and f.fact_desc='"+sm.TableName+"'";
            bool canDrillDetail = true;
            DataTable dt = Boco.BLLEngine.CommonQuery.GetDataBySql(ConfigurationManager.ConnectionStrings["SQL_ConnStr"].ConnectionString, sql);
            if (dt.Rows.Count == 0)
            {
                canDrillDetail = false;
            }
            else
            {
                foreach (DataRow row in dt.Rows)
                {
                    int rowIndex = analyzer.RowDimList.FindIndex(p => p.DimensionName == row[0].ToString() && p.LevelName == row[1].ToString());
                    if (rowIndex < 0)
                    {
                        int sliceIndex = analyzer.SliceDimList.FindIndex(p => p.DimensionName == row[0].ToString() && p.LevelName == row[1].ToString());
                        if (sliceIndex < 0)
                        {
                            canDrillDetail = false;
                            break;
                        }
                    }
                }
            }
            return canDrillDetail;
        }
    }

    private List<QuerySentence> GetDetailSql(Analyzer analyzer)
    {
        //Sem_Measure sm = MeasureDB.GetMeasureByID(analyzer.MeasureList[0].MeasureID);
        string sql = @"select d.detail_id, d.table_name, d.conn_key
  from sys_meta_detail d, sys_meta_measure m
 where d.fact_id = m.fact_id and m.measure_id=" + analyzer.MeasureList[0].MeasureID;
        DataTable dt = Boco.BLLEngine.CommonQuery.GetDataBySql(ConfigurationManager.ConnectionStrings["SQL_ConnStr"].ConnectionString, sql);
        List<DetailFact> detailFactList = new List<DetailFact>();
        foreach (DataRow row in dt.Rows)
        {
            DetailFact df = new DetailFact();
            df.DetailID = row[0].ToString();
            df.DetailTableName = row[1].ToString();
            df.ConnKey = row[2].ToString();
            detailFactList.Add(df); 
        }
        SetDetailFactProp(detailFactList);
        return GetDetailSql(detailFactList,analyzer);
    }
    

    private void SetDimMemberID(Dimension dim)
    {
        if(dim.DimensionName=="日期维")
        {
            dim.Val = dim.Val.Replace("年","").Replace("月","").Replace("日","");
            for (int i = 0; i < dim.ValList.Count; i++)
            {
                dim.ValList[i] = dim.ValList[i].Replace("年", "").Replace("月", "").Replace("日", "");
            }
        }
        else if (dim.DimensionName == "小时维")
        {
            dim.Val = dim.Val.Replace("时", "");
            for (int i = 0; i < dim.ValList.Count; i++)
            {
                dim.ValList[i] = dim.ValList[i].Replace("时", "");
            }
        }
        else if (!string.IsNullOrEmpty(dim.DimensionID))
        {
            Sem_Dimension sd = DimensionDB.GetDimensionByID(dim.DimensionID);
            Level lvl = sd.Levels.Find(p => p.Name == dim.LevelName);
            if (lvl.KeyCol == lvl.DescCol || string.IsNullOrEmpty(lvl.TableName))
            {
                
            }
            else
            {
                string ids = dim.Val;
                if (dim.ValType == ValType.In || dim.ValType == ValType.Range || dim.ValType == ValType.NotIn)
                {
                    ids = string.Join("','", dim.ValList); 
                }
                string sql = "select " + lvl.KeyCol + " from " + lvl.TableName + " where " + lvl.DescCol + " in ('" + dim.Val + "')";
                DataTable dt = Boco.BLLEngine.CommonQuery.GetDataBySql(ConfigurationManager.ConnectionStrings[lvl.ConnectionStringName].ConnectionString, sql);
                if (dt.Rows.Count > 0)
                {
                    dim.ValList.Clear();
                    foreach (DataRow row in dt.Rows)
                    {
                        dim.ValList.Add(row[0].ToString());
                    }
                    dim.Val = string.Join(",", dim.ValList);
                }
                else
                {
                    dim.Val = "-999999";
                    dim.ValList = new List<string>() { "-999999" };
                }
            }
        }
    }

    private List<QuerySentence> GetDetailSql(List<DetailFact> dfList,Analyzer analyzer)
    {
        List<QuerySentence> qsList = new List<QuerySentence>();
        List<Dimension> dimList = new List<Dimension>();
        dimList.AddRange(analyzer.RowDimList);
        dimList.AddRange(analyzer.SliceDimList);
        foreach (DetailFact df in dfList)
        {
            QuerySentence qs = new QuerySentence();
            qs.ConnStr = df.ConnKey;
            qs.Sql = "select ";
            foreach (DetailMeasure mea in df.MeasureList)
            {
                if (mea.Decimal != "-1")
                {
                    qs.Sql += "round(" + mea.Column + "," + mea.Decimal + ") " + mea.DisplayName + ",";
                }
                else
                {
                    qs.Sql += mea.Column + " " + mea.DisplayName + ",";
                }
            }
            qs.Sql = qs.Sql.TrimEnd(',');
            qs.Sql += " from " + df.DetailTableName + " where ";
            foreach (Dimension dim in dimList)
            {
                foreach (DetailDimension dd in df.DimList)
                {
                    if (dim.DimensionName == dd.DimensionName && dim.LevelName == dd.LevelName)
                    {
                        if (dd.IsFilterByID)
                        {
                            SetDimMemberID(dim);
                        }
                        string cond = "";
                        if (dim.ValType == ValType.Equal)
                        {
                            cond = dd.DimColumn + " = " + (dd.IsFilterByID ? "" : "'") + dim.Val + (dd.IsFilterByID ? "" : "'") + " and ";
                        }
                        else if (dim.ValType == ValType.In)
                        {
                            cond = dd.DimColumn + " in (" + (dd.IsFilterByID ? string.Join(",", dim.ValList) : ("'" + string.Join("','", dim.ValList) + "'")) + ") and ";
                        }
                        else if (dim.ValType == ValType.Range)
                        {
                            cond = dd.DimColumn + " >= " + dim.ValList[0] + " and " + dd.DimColumn + " <= " + dim.ValList[1] + " and ";
                        }
                        qs.Sql += cond;
                        break;
                    }
                }
            }
            qs.Sql += " 1=1 ";
            qsList.Add(qs);
        }
        return qsList;
    }

    private void SetDetailFactProp(List<DetailFact> dfList)
    {
        List<string> detailIdList = new List<string>();
        dfList.ForEach(p => detailIdList.Add(p.DetailID));
        string ids = string.Join(",", detailIdList);
        string[] sqls = new string[2];
        sqls[0] = @"select t.detail_id,t.select_column, t.measure_desc, t.decimal_digits
  from sys_meta_detail_mea t
  where t.detail_id in ("+ids+")";
        sqls[1] = @"select t.detail_id,t.dimension_desc, t.level_desc, t.is_id, t.dim_column
  from sys_meta_detail_dim t
  where t.detail_id in ("+ids+")";
        DataSet ds = Boco.BLLEngine.CommonQuery.GetDataBySqlList(ConfigurationManager.ConnectionStrings["SQL_ConnStr"].ConnectionString, sqls);
        foreach (DetailFact df in dfList)
        {
            DataRow[] meaRows = ds.Tables[0].Select("detail_id=" + df.DetailID);
            foreach (DataRow dr in meaRows)
            {
                DetailMeasure mea = new DetailMeasure();
                mea.Column = dr[1].ToString();
                mea.DisplayName = dr[2].ToString();
                mea.Decimal = dr[3].ToString();
                df.MeasureList.Add(mea);
            }
            DataRow[] dimRows = ds.Tables[1].Select("detail_id=" + df.DetailID);
            foreach (DataRow dr in dimRows)
            {
                DetailDimension dim = new DetailDimension();
                dim.DimensionName = dr[1].ToString();
                dim.LevelName = dr[2].ToString();
                dim.IsFilterByID = dr[3].ToString() == "1";
                dim.DimColumn = dr[4].ToString();
                df.DimList.Add(dim); 
            }
        }
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}