<%@ WebHandler Language="C#" Class="TreeChart" %>

using System;
using System.Web;
using System.Collections.Generic;
using System.Data;
using Boco.QueryEngine;
using Boco.Semantic.Entity;
using Boco.BLLEngine;
using System.Web.Script.Serialization;
using Boco.Dss.CustomAnalysis.Entity;
using Boco.Dss.CustomAnalysis.EntityDB;

public class TreeChart : Boco.Dss.Framework.HttpHandlerBase
{
    public override void Process(HttpContext context)
    {
        string strCon = context.Request["strCon"];
        TreeModel model = new TreeModel();
        JavaScriptSerializer jss = new JavaScriptSerializer();
        model = jss.Deserialize<TreeModel>(strCon);

        string json = "";

        try
        {
            if (model.Type == "getSource")
            {
                json = GetSource(model);
            }
        }
        catch (Exception)
        {
            throw;
        }

        context.Response.Write(json);
    }

    public static string GetSource(TreeModel model)
    {
        Analyzer analyzer = GetAnalyzer(model);
        if (model.GridChart != "Analyzer")
        {
            DataTable dt = new DataTable();
            if (analyzer != null)
            {
                try
                {
                    string sql = analyzer.GetQuerySentence()[0].Sql;
                    dt = analyzer.GetData();
                }
                catch (Exception e)
                {
                    return "";
                }
            }
            else
            {
                return "";
            }

            if (model.GridChart == "Chart")
            {
                return GetChart(dt);
            }
            else
            {
                return GetGrid(dt);
            }
        }
        else
        {
            if (analyzer == null)
            {
                analyzer = new Analyzer();
            }
            JavaScriptSerializer jss = new JavaScriptSerializer();
            return jss.Serialize(analyzer);
        }
    }
    
    public static Analyzer GetAnalyzer(TreeModel model)
    {
        try
        {
            Template tmp = TemplateDB.GetTemplateByID(model.TemplateID);
            if (tmp == null)
            {
                return null;
            }

            Analyzer analyzer = tmp.Analyzer;

            string con = string.Empty;

            if (!string.IsNullOrEmpty(model.MeaFilter))
            {
                if (!string.IsNullOrEmpty(con))
                {
                    con += " and ";
                }
                con += model.MeaFilter;
            }

            if (!string.IsNullOrEmpty(con))
            {
                analyzer.MeasureFilter = con;
            }

            for (int i = 0; i < analyzer.RowDimList.Count; i++)
            {
                if (analyzer.RowDimList[i].LevelName != model.LevelName)
                {
                    analyzer.RowDimList.RemoveAt(i);
                    i--;
                }
            }

            for (int i = 0; i < analyzer.RowDimList.Count; i++)
            {
                if (analyzer.RowDimList[i].LevelName == "日")
                {
                    if (model.TimeType == "Day" && (!string.IsNullOrEmpty(model.Time)))
                    {
                        if (model.TimeRangeNum > 0)
                        {
                            List<String> list = new List<string>();
                            string startTime = DateTime.Parse(model.Time).AddDays(-model.TimeRangeNum).ToString("yyyy年MM月dd日");
                            list.Add(startTime);
                            list.Add(model.Time);
                            analyzer.RowDimList[i].ValType = ValType.Range;
                            analyzer.RowDimList[i].ValList = list;
                        }
                        else
                        {
                            analyzer.RowDimList[i].ValType = ValType.Equal;
                            analyzer.RowDimList[i].Val = model.Time;
                        }
                    }
                    else
                    {
                        analyzer.RowDimList.RemoveAt(i);
                        i--;
                    }
                }
                else if (analyzer.RowDimList[i].LevelName == "月")
                {
                    if (model.TimeType == "Month" && (!string.IsNullOrEmpty(model.Time)))
                    {
                        if (model.TimeRangeNum > 0)
                        {
                            List<String> list = new List<string>();
                            string startTime = DateTime.Parse(model.Time).AddDays(-model.TimeRangeNum).ToString("yyyy年MM月");
                            list.Add(startTime);
                            list.Add(model.Time);
                            analyzer.RowDimList[i].ValType = ValType.Range;
                            analyzer.RowDimList[i].ValList = list;
                        }
                        else
                        {
                            analyzer.RowDimList[i].ValType = ValType.Equal;
                            analyzer.RowDimList[i].Val = model.Time;
                        }
                    }
                    else
                    {
                        analyzer.RowDimList.RemoveAt(i);
                        i--;
                    }
                }
                else if (analyzer.RowDimList[i].LevelName == "小时")
                {
                    if (!string.IsNullOrEmpty(model.Hour))
                    {
                        analyzer.RowDimList[i].ValType = ValType.Equal;
                        analyzer.RowDimList[i].Val = model.Hour;
                    }
                }
            }

            for (int i = 0; i < analyzer.SliceDimList.Count; i++)
            {
                if (analyzer.SliceDimList[i].LevelName == "日")
                {
                    if (model.TimeRangeNum > 0)
                    {
                        List<String> list = new List<string>();
                        string startTime = DateTime.Parse(model.Time).AddDays(-model.TimeRangeNum).ToString("yyyy年MM月dd日");
                        list.Add(startTime);
                        list.Add(model.Time);
                        analyzer.SliceDimList[i].ValType = ValType.Range;
                        analyzer.SliceDimList[i].ValList = list;
                    }
                    else
                    {
                        analyzer.SliceDimList[i].ValType = ValType.Equal;
                        analyzer.SliceDimList[i].Val = model.Time;
                    }
                }
                else if (analyzer.SliceDimList[i].LevelName == "月")
                {
                    if (model.TimeType == "Month" && (!string.IsNullOrEmpty(model.Time)))
                    {
                        if (model.TimeRangeNum > 0)
                        {
                            List<String> list = new List<string>();
                            string startTime = DateTime.Parse(model.Time).AddDays(-model.TimeRangeNum).ToString("yyyy年MM月");
                            list.Add(startTime);
                            list.Add(model.Time);
                            analyzer.SliceDimList[i].ValType = ValType.Range;
                            analyzer.SliceDimList[i].ValList = list;
                        }
                        else
                        {
                            analyzer.SliceDimList[i].ValType = ValType.Equal;
                            analyzer.SliceDimList[i].Val = model.Time;
                        }
                    }
                }
                else if (analyzer.SliceDimList[i].LevelName == model.Property1)
                {
                    if (!string.IsNullOrEmpty(model.Property2))
                    {
                        String[] str = model.Property2.Split(',');
                        analyzer.SliceDimList[i].ValList = new List<System.String>(str);
                    }
                }
            }

            if (model.Unit == 0)
            {
                analyzer.ShowUintInColumn = true;
            }

            if (!string.IsNullOrEmpty(model.Sort))
            {
                if (!string.IsNullOrEmpty(model.SortName))
                {
                    analyzer.SortSetting.SortColIndex = GetColIndex(analyzer, model.SortName);
                }
                else
                {
                    analyzer.SortSetting.SortColIndex = model.SortIndex;
                }

                if (model.Sort.ToUpper() == "DESC")
                {
                    analyzer.SortSetting.SortDirection = SortDirection.Desc;
                }
                else
                {
                    analyzer.SortSetting.SortDirection = SortDirection.Asc;
                }
            }

            analyzer.PageSetting.EnableComputeTotal = false;

            if (model.TopN != 0)
            {
                analyzer.TopN = model.TopN;
            }

            analyzer.PageSetting.PageSize = 0;
            if (analyzer.RowColSwapSetting.IsSwap == true)//行列交换时PageSize为0则获取不到dt
            {
                analyzer.PageSetting.PageSize = 100;
            }

            return analyzer;
        }
        catch
        {
            return null;
        }
    }

    //根据列名找到其在analyzer中的列索引
    public static int GetColIndex(Analyzer a, string colName)
    {
        int idx = 0;
        bool isRowDim = false;

        for (int i = 0; i < a.RowDimList.Count; i++)
        {
            if (a.RowDimList[i].LevelName == colName)
            {
                idx = i;
                isRowDim = true;
                break;
            }
        }

        if (!isRowDim)
        {
            for (int i = 0; i < a.MeasureList.Count; i++)
            {
                if (a.MeasureList[i].DisplayName == colName)
                {
                    idx = i;
                    break;
                }
            }
        }

        return idx;
    }

    public static string GetGrid(DataTable dt)
    {
        var str = Boco.CommonToolLibrary.Table.TableHelper.CreateJsonParameters(dt, true, 2).TrimStart(new char[] { '{' });
        string json = string.Format("{0}\"page\":{1},\"records\":{2},{3}", "{", 1, dt.Rows.Count, str);
        json = json.Replace("\r", "").Replace("\n", "").Replace("\0", "");
        return json;
    }

    public static string GetChart(DataTable dt)
    {
        string json = Boco.CommonToolLibrary.Table.TableHelper.CreateJsonParameters(dt, true, 2);
        json = json.Replace("\r", "").Replace("\n", "").Replace("\0", "");
        return json;
    }
}

public class TreeModel
{
    #region ==========标识==========

    /// <summary>
    /// 操作类型
    /// </summary>
    public string Type
    {
        get;
        set;
    }
    /// <summary>
    /// 标识
    /// </summary>
    public string Flag
    {
        get;
        set;
    }
    /// <summary>
    /// GridChart
    /// </summary>
    public string GridChart
    {
        get;
        set;
    }

    #endregion


    #region ==========时间==========

    /// <summary>
    /// 时间，日、月
    /// </summary>
    public string Time
    {
        get;
        set;
    }
    /// <summary>
    /// 时间类型
    /// </summary>
    public string TimeType
    {
        get;
        set;
    }
    /// <summary>
    /// 小时
    /// </summary>
    public string Hour
    {
        get;
        set;
    }
    /// <summary>
    /// 时间范围数
    /// </summary>
    public int TimeRangeNum
    {
        get;
        set;
    }

    #endregion


    #region ==========数据库==========

    /// <summary>
    /// ConnStr
    /// </summary>
    public string ConnStr
    {
        get;
        set;
    }
    /// <summary>
    /// SQL
    /// </summary>
    public string SQL
    {
        get;
        set;
    }

    #endregion


    #region ==========维度==========

    /// <summary>
    /// 粒度名称
    /// </summary>
    public string LevelName
    {
        get;
        set;
    }

    #endregion


    #region ==========指标==========


    /// <summary>
    /// MeaFilter
    /// </summary>
    public string MeaFilter
    {
        get;
        set;
    }

    #endregion


    #region ==========常用条件==========

    /// <summary>
    /// 手机号
    /// </summary>
    public string MSISDN
    {
        get;
        set;
    }
    /// <summary>
    /// 地区
    /// </summary>
    public string Region
    {
        get;
        set;
    }
    /// <summary>
    /// 区县
    /// </summary>
    public string City
    {
        get;
        set;
    }
    /// <summary>
    /// 小区
    /// </summary>
    public string Cell
    {
        get;
        set;
    }

    #endregion


    #region ==========引擎==========

    /// <summary>
    /// TemplateID
    /// </summary>
    public int TemplateID
    {
        get;
        set;
    }
    /// <summary>
    /// 单位
    /// </summary>
    public int Unit
    {
        get;
        set;
    }
    /// <summary>
    /// 排序
    /// </summary>
    public string Sort
    {
        get;
        set;
    }
    /// <summary>
    /// 排序的列名
    /// </summary>
    public string SortName
    {
        get;
        set;
    }
    private int _sortindex = 1;
    /// <summary>
    /// 排序列索引
    /// </summary>
    public int SortIndex
    {
        get
        {
            return _sortindex;
        }
        set
        {
            _sortindex = value;
        }
    }
    /// <summary>
    /// 
    /// </summary>
    public string SecondSort
    {
        get;
        set;
    }
    private int _SecondSortColIndex = -1;
    /// <summary>
    /// 
    /// </summary>
    public int SecondSortColIndex
    {
        get
        {
            return _SecondSortColIndex;
        }
        set
        {
            _SecondSortColIndex = value;
        }
    }
    /// <summary>
    /// TOPN
    /// </summary>
    private int _topn = 0;
    public int TopN
    {
        get
        {
            return _topn;
        }
        set
        {
            _topn = value;
        }
    }

    #endregion


    #region ==========备用属性==========

    /// <summary>
    /// 备用属性1
    /// </summary>
    public string Property1
    {
        get;
        set;
    }
    /// <summary>
    /// 备用属性2
    /// </summary>
    public string Property2
    {
        get;
        set;
    }
    /// <summary>
    /// 备用属性3
    /// </summary>
    public string Property3
    {
        get;
        set;
    }
    /// <summary>
    /// 备用属性4
    /// </summary>
    public string Property4
    {
        get;
        set;
    }
    /// <summary>
    /// 备用属性5
    /// </summary>
    public string Property5
    {
        get;
        set;
    }

    #endregion


    #region ==========专题特有==========

    /// <summary>
    /// BRAS
    /// </summary>
    public string BRAS
    {
        get;
        set;
    }
    /// <summary>
    /// OLT
    /// </summary>
    public string OLT
    {
        get;
        set;
    }
    /// <summary>
    /// ONU
    /// </summary>
    public string ONU
    {
        get;
        set;
    }
    /// <summary>
    /// TreeUser
    /// </summary>
    public string TreeUser
    {
        get;
        set;
    }

    #endregion
}