<%@ WebHandler Language="C#" Class="TableHandler" %>

using System;
using System.Web;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Xml.Serialization;
using Boco.Dss.Framework;
using System.Text;
using System.Web.Script.Serialization;
using System.IO;
using Boco.Dss.Web.JsHandlers;
using Boco.CommonToolLibrary.Sql;

public class TableHandler : Boco.Dss.Web.JsHandlers.SmartGridHandler
{

    HttpFileCollection htc;
    HttpPostedFile file;
    TableSetting curTableSetting;

    string dbType = "oracle";

    public override void Process(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        string qType = context.Request["qtype"];
        TableSetting ts = GetTableSetting();
        curTableSetting = ts;
        JavaScriptSerializer jss = new JavaScriptSerializer();
        if (qType == "init")
        {
            SetTableValueOption(ts);
            SetTableSelectSql(ts);
            context.Response.Write(ts.ToJson());
        }
        else if (qType == "delete")
        {
            DeleteRows(ts);
        }
        else if (qType == "add")
        {
            AddRows(ts);
        }
        else if (qType == "scan")
        {

        }
        else if (qType == "template")
        {
            DownloadTemplate(ts);
        }
        else if (qType == "import")
        {
            ImportExcel(ts);
        }
        else if (qType == "export")
        {
            ExportExcel(ts);
        }
        else if (qType == "update")
        {
            UpdateRow(ts);
        }
        else if (qType == "dropdownlist")
        {

        }
        else if (qType == "query")
        {
            base.Process(context);
        }
        else
        {
            context.Response.Write("Hello world".ToJson());
        }
    }

    public override DataTable GetData(SmartGridOption option)
    {
        DataTable dt = QueryTable(curTableSetting, option);
        dt.Columns.Add("编辑");
        return dt;
    }

    public override int GetCount(SmartGridOption option)
    {
        SetTableSelectSql(curTableSetting);
        string sql = GetQuerySql(curTableSetting, option);
        sql = "select count(1) from (" + sql + ") A";
        DataTable dt = Boco.Dss.Data.DbHelper.GetDataBySql(sql, System.Configuration.ConfigurationManager.ConnectionStrings[curTableSetting.ConnStringName]);
        return int.Parse(dt.Rows[0][0].ToString());
    }

    private string GetQuerySql(TableSetting ts, SmartGridOption option)
    {
        string sql = ts.SelectSql;
        string sqlCond = string.Empty;

        Dictionary<string, string> dict = new Dictionary<string, string>();
        if (option != null)//导出时option为null
        {
            JavaScriptSerializer jss = new JavaScriptSerializer();
            dict = jss.Deserialize<Dictionary<string, string>>(option.Param1);
        }

        foreach (string colname in ts.SearchColNameList)
        {
            string searchVal = "";

            if (option != null)
            {
                searchVal = dict.ContainsKey(colname) && dict[colname].Length > 0 ? dict[colname] : "";
            }
            else
            {
                searchVal = HttpContext.Current.Request[colname];
            }

            if (!string.IsNullOrEmpty(searchVal))
            {
                ValueOption vo = ts.ValueOptionList.Find(p => p.DisplayColName == colname);
                if (vo == null)
                {
                    sqlCond += colname + " LIKE '%" + searchVal + "%' AND ";
                }
                else
                {
                    TableCol tc = ts.TableColList.Find(p => p.ColName == colname);
                    sqlCond += colname + "=" + GetSqlValue(tc, searchVal) + " AND ";
                }
            }
        }
        if (sqlCond.Length > 0)
        {
            sql = sql + " WHERE " + sqlCond.Substring(0, sqlCond.Length - 4);
        }

        return sql;
    }

    private DataTable QueryTable(TableSetting ts, SmartGridOption option)
    {
        SetTableSelectSql(ts);
        string sql = GetQuerySql(ts, option);
        string sqlPage = SqlHelper.PageSql(sql,
                    ts.ConnStringName,
                    option.PageIndex - 1,
                    option.PageSize,
                    option.SortColIndex,
                    option.SortDirection == 1 ? true : false,
                    option.SecondSortColIndex,
                    option.SecondSortDirection == 1 ? true : false);
        DataTable dt = Boco.Dss.Data.DbHelper.GetDataBySql(sqlPage, System.Configuration.ConfigurationManager.ConnectionStrings[ts.ConnStringName]);
        if (dt.Columns.Contains("_RN_"))
        {
            dt.Columns.Remove("_RN_");
        }
        if (dt.Rows.Count < option.PageSize)
        {
            option.IsTotal = 0;
            if (option.TotalCount <= 0)
            {
                option.TotalCount = dt.Rows.Count;
            }
        }
        else
        {
            if (option.TotalCount > 0)
            {
                option.IsTotal = 0;
            }
            else
            {
                option.IsTotal = -1;
            }
        }
        return dt;
    }

    private void ExportExcel(TableSetting ts)
    {
        SetTableSelectSql(ts);
        string sql = GetQuerySql(ts, null);
        DataTable dt = Boco.Dss.Data.DbHelper.GetDataBySql(sql, System.Configuration.ConfigurationManager.ConnectionStrings[ts.ConnStringName]);
        for (int i = 0; i < dt.Columns.Count; i++)
        {
            dt.Columns[i].ColumnName = ts.TableColList[i].ColDesc;
        }
        string fileName = "tablemaintain" + new Random().Next(1000, 9999).ToString() + ".xlsx";
        string path = HttpContext.Current.Server.MapPath("~/Files/") + fileName;
        Boco.CommonToolLibrary.Excel.ExcelHelper.ExportToExcel(dt, path);
        Result result = new Result(0, fileName);
        HttpContext.Current.Response.Write(result.ToJson());
    }


    private void ImportExcel(TableSetting ts)
    {
        Result result = new Result();
        htc = HttpContext.Current.Request.Files;
        file = htc["filepath"];
        string json = string.Empty;
        DataTable dtExcel = new DataTable();
        DataTable dtSend = new DataTable();
        bool isColumn = true;
        bool isValidateExcel = CheckExcelValidate(ref dtExcel);
        List<string> sqlList = new List<string>();
        if (file != null)
        {
            if (isValidateExcel)
            {
                if (dtExcel.Columns.Count == ts.TableColList.Count)//要导入的表中字段与xml字段是否一致
                {
                    string errorColumnName = string.Empty;
                    for (int i = 0; i < ts.TableColList.Count; i++)
                    {
                        if (dtExcel.Columns[i].ColumnName == ts.TableColList[i].ColDesc)
                        {
                            isColumn = true;
                        }
                        else
                        {
                            isColumn = false;
                            errorColumnName = dtExcel.Columns[i].ColumnName;
                            break;
                        }
                    }
                    if (isColumn)
                    {
                        dtSend = dtExcel.Copy();
                        sqlList = GetTableInsertSql(ts, dtSend);
                        Boco.Dss.Data.DbHelper.ExecuteNonQueryBySqlList(sqlList, System.Configuration.ConfigurationManager.ConnectionStrings[ts.ConnStringName]);
                        result = new Result(0, "导入成功!");
                    }
                    else
                    {
                        result = new Result(1, "列名[" + errorColumnName + "]错误。");
                    }
                }
                else
                {
                    result = new Result(0, "导入的表不匹配，请检查列数和模板是否一致。");
                }
            }
            else
            {
                result = new Result(0, "Excel文件格式错误！");
            }
        }
        else
        {
            result = new Result(0, "请选择要上传或导入的文件！");
        }
        HttpContext.Current.Response.Write(result.ToJson());
    }

    private void UpdateRow(TableSetting ts)
    {
        string sql = GetUpdateSql(ts);
        int count = ExecuteNonQuery(ts.ConnStringName, sql);
        Result result = new Result(0, count.ToString());
        HttpContext.Current.Response.Write(result.ToJson());
    }

    private string GetUpdateSql(TableSetting ts)
    {
        string sqlWhere = string.Empty;
        string sqlUpdate = "UPDATE " + ts.TableName + " SET ";
        for (int i = 0; i < ts.TableColList.Count; i++)
        {
            string colName = ts.TableColList[i].ColName;
            string colValue = HttpContext.Current.Request[colName];
            if (colValue != null)
            {
                if (ts.TableColList[i].IsPK == true)
                {
                    sqlWhere += colName + "=";
                    if (ts.TableColList[i].DateType == "STRING")
                    {
                        sqlWhere += "'" + colValue + "' AND";
                    }
                    else
                    {
                        sqlWhere += colValue + " AND";
                    }
                }
                else
                {
                    sqlUpdate += colName + "=" + GetSqlValue(ts.TableColList[i], colValue);
                    sqlUpdate += ",";
                }
            }
        }
        sqlUpdate = sqlUpdate.TrimEnd(',') + " WHERE " + sqlWhere.Substring(0, sqlWhere.Length - 3);
        return sqlUpdate;
    }


    private void DownloadTemplate(TableSetting ts)
    {
        DataTable dt = new DataTable();
        string random = System.DateTime.Now.ToString("yyyyMMddhhssmmffff");
        for (int i = 0; i < ts.TableColList.Count; i++)
        {
            dt.Columns.Add(ts.TableColList[i].ColDesc);
        }
        DataRow row0 = dt.NewRow();
        for (int i = 0; i < ts.TableColList.Count; i++)
        {
            row0[i] = ts.TableColList[i].DateType;
        }
        dt.Rows.Add(row0);
        string pathStr = HttpContext.Current.Server.MapPath("~/Temp") + "\\DownLoadExcel\\";
        try
        {
            if (!Directory.Exists(pathStr))
            {
                Directory.CreateDirectory(pathStr);
            }
            pathStr = pathStr + ts.TableName + random + ".xlsx";
            Boco.Dss.Framework.EPPlusHelper.ExportExcelHelper.ExportExcelToPath(new List<DataTable>() { dt }, pathStr);
            Result result = new Result(0, "~/Temp/DownLoadExcel/" + ts.TableName + random + ".xlsx");
            HttpContext.Current.Response.Write(result.ToJson());
        }
        catch (Exception ex)
        {
            Result result = new Result(1, "模板下载失败" + ex.Message);
            HttpContext.Current.Response.Write(result.ToJson());
        }
    }


    private int ExecuteNonQuery(string connName, string sql)
    {
        return Boco.Dss.Data.DbHelper.ExecuteNonQueryBySql(sql, System.Configuration.ConfigurationManager.ConnectionStrings[connName]);
    }

    private TableSetting GetTableSetting()
    {
        string fileName = HttpContext.Current.Request["nam"];
        string xmlFilePath = HttpContext.Current.Server.MapPath("~/Xml/TableMaintain/" + fileName + ".xml");
        if (!System.IO.File.Exists(xmlFilePath))
        {
            throw new System.IO.FileNotFoundException("未找到配置文件" + fileName + ".xml");
        }
        TableSetting ts = new TableSetting();
        Boco.CommonToolLibrary.Xml.Serializer.Deserialize<TableSetting>(xmlFilePath, ref ts);
        if (ts.TableColList.Count(p => p.IsPK) == 0)
        {
            throw new Exception("表配置中没有主键设置，请检查xml配置。");
        }
        System.Configuration.ConnectionStringSettings connSettings = System.Configuration.ConfigurationManager.ConnectionStrings[ts.ConnStringName];
        if (connSettings == null)
        {
            throw new Exception("连接串" + ts.ConnStringName + "未找到。");
        }
        if (connSettings.ProviderName == "MySql.Data.MySqlClient")
        {
            dbType = "MySql";
        }
        return ts;
    }

    private void AddRows(TableSetting ts)
    {
        string sql = GetAddSql(ts);
        int count = ExecuteNonQuery(ts.ConnStringName, sql);
        Result result = new Result(0, count.ToString());
        HttpContext.Current.Response.Write(result.ToJson());
    }

    //得到新增sql
    private string GetAddSql(TableSetting ts)
    {
        string sql = "INSERT INTO";
        sql += " " + ts.TableName + "(";
        string sqlColName = string.Empty;
        string sqlColVal = string.Empty;
        for (int i = 0; i < ts.TableColList.Count; i++)
        {
            string colName = ts.TableColList[i].ColName;
            string colValue = HttpContext.Current.Request[colName];
            sqlColName += colName + ",";
            sqlColVal += GetSqlValue(ts.TableColList[i], colValue) + ",";
        }
        if (sqlColName.Length > 0)
        {
            sqlColName = sqlColName.TrimEnd(',');
        }
        if (sqlColVal.Length > 0)
        {
            sqlColVal = sqlColVal.TrimEnd(',');
        }
        sql += " " + sqlColName + ")";

        sql += " VALUES(" + sqlColVal + ")";
        return sql;
    }


    private void DeleteRows(TableSetting ts)
    {
        var ids = HttpContext.Current.Request["pkcol"];
        List<string> sqlList = GetTableDeleteSqlList(ts, ids);
        IList<int> a = Boco.Dss.Data.DbHelper.ExecuteNonQueryBySqlList(sqlList, System.Configuration.ConfigurationManager.ConnectionStrings[ts.ConnStringName]);
        int count = 0;
        foreach (var r in a)
        {
            count += r;
        }
        Result result = new Result(0, count.ToString());
        HttpContext.Current.Response.Write(result.ToJson());
    }

    //得到删除sql
    private List<string> GetTableDeleteSqlList(TableSetting ts, string ids)
    {
        string[] idStrArr = ids.Split('|');
        List<string> sqlList = new List<string>();
        foreach (string idStr in idStrArr)
        {
            string[] idArr = idStr.Split('$');
            string sqlDel = "DELETE FROM ";
            sqlDel += ts.TableName + " WHERE ";
            int idx = 0;
            foreach (TableCol tc in ts.TableColList)
            {
                if (tc.IsPK == true)
                {
                    sqlDel += tc.ColName + "=" + GetSqlValue(tc, idArr[idx]);
                    sqlDel += " AND";
                    idx++;
                }
            }
            sqlDel = sqlDel.Substring(0, sqlDel.Length - 3);
            sqlList.Add(sqlDel);
        }
        return sqlList;
    }

    ///<summary>
    ///得到导入终端sql
    ///</summary>
    ///<param name="dtSource">DataTable</param>
    ///<returns>string[]类型的sql</returns>
    private List<string> GetTableInsertSql(TableSetting ts, DataTable dtSource)
    {
        List<string> sqlList = new List<string>();
        string key = string.Empty;
        Dictionary<string, string> Dic = new Dictionary<string, string>();
        for (int i = 0; i < dtSource.Rows.Count; i++)
        {
            string sql = "INSERT INTO " + ts.TableName + "(";
            string sqlValues = " VALUES(";
            foreach (var col in ts.TableColList)
            {
                sql += col.ColName + ",";
                sqlValues += GetSqlValue(col, dtSource.Rows[i][col.ColDesc].ToString()) + ",";
            }
            sql = sql.TrimEnd(',') + ") " + sqlValues.TrimEnd(',') + ") ";
            sqlList.Add(sql);
        }
        return sqlList;
    }

    private string GetSqlValue(TableCol tc, string cellValue)
    {
        if (tc.DateType.Equals("STRING", StringComparison.CurrentCultureIgnoreCase))
        {
            return "'" + cellValue + "'";
        }
        else if (tc.DateType.Equals("DATE", StringComparison.CurrentCultureIgnoreCase))
        {
            if (dbType == "MySql")
            {
                return "date_format('" + cellValue + "','%Y-%c-%d %h:%i:%s')";
            }
            else
            {
                return "TO_DATE('" + cellValue + "','yyyy-mm-dd hh24:mi:ss')";
            }
        }
        else
        {
            return string.IsNullOrEmpty(cellValue) ? "null" : cellValue;
        }
    }


    private Result GetResult(int code, string message)
    {
        Result result = new Result();
        result.code = code;
        result.msg = message;
        return result;
    }


    private void SetTableSelectSql(TableSetting ts)
    {
        StringBuilder sbSql = new StringBuilder();
        sbSql.Append("SELECT ");
        StringBuilder sbSelect = new StringBuilder();
        foreach (var col in ts.TableColList)
        {
            sbSelect.Append("  ");
            sbSelect.Append(col.ColName);
            sbSelect.Append(" AS \"");
            sbSelect.Append(col.ColDesc);
            sbSelect.AppendLine("\",");
        }
        sbSql.AppendLine(sbSelect.ToString().Trim().TrimEnd(','));
        sbSql.Append("FROM ");
        sbSql.AppendLine(ts.TableName);
        ts.SelectSql = sbSql.ToString();
    }

    private void SetTableValueOption(TableSetting ts)
    {
        foreach (ValueOption vo in ts.ValueOptionList)
        {
            if (vo.RowList == null || vo.RowList.Count == 0)
            {
                vo.RowList = new List<TableRow>();
                if (vo.ValueOptionSql != null && !string.IsNullOrEmpty(vo.ValueOptionSql.Sql))
                {
                    DataTable dt = Boco.Dss.Data.DbHelper.GetDataBySql(vo.ValueOptionSql.Sql, System.Configuration.ConfigurationManager.ConnectionStrings[vo.ValueOptionSql.ConnStringName]);
                    foreach (DataRow row in dt.Rows)
                    {
                        TableRow tr = new TableRow();
                        for (int i = 0; i < dt.Columns.Count; i++)
                        {
                            tr.ValList.Add(row[i].ToString());
                        }
                        vo.RowList.Add(tr);
                    }
                }
            }
        }
    }


    private void CreateXml()
    {
        TableSetting ts = new TableSetting();
        ts.TableName = "dim_xdr_subapp";
        ts.TableDesc = "二级业务";
        ts.ConnStringName = "SQL_ConnDw";
        ts.TableColList.Add(new TableCol() { ColDesc = "一级业务ID", ColName = "APP_ID", DateType = "INT", DefaultValue = "", IsCrc = false, IsPK = false, Nullable = true });
        ts.TableColList.Add(new TableCol() { ColDesc = "一级业务名", ColName = "APP_DESC", DateType = "STRING", DefaultValue = "", IsCrc = false, IsPK = false, Nullable = true });
        ts.TableColList.Add(new TableCol() { ColDesc = "二级业务ID", ColName = "SUBAPP_ID", DateType = "INT", DefaultValue = "", IsCrc = false, IsPK = false, Nullable = true });
        ts.TableColList.Add(new TableCol() { ColDesc = "二级业务KEY", ColName = "SUBAPP_KEY", DateType = "INT", DefaultValue = "", IsCrc = true, IsPK = true, Nullable = true });
        ts.TableColList.Add(new TableCol() { ColDesc = "二级业务名", ColName = "SUBAPP_DESC", DateType = "STRING", DefaultValue = "", IsCrc = false, IsPK = false, Nullable = true });
        ValueOption vo = new ValueOption();
        vo.ColNameList.Add("APP_ID");
        vo.ColNameList.Add("APP_DESC");
        vo.DisplayColName = "APP_DESC";
        vo.RowList.Add(new TableRow() { ValList = new List<string>() { "1", "即时通信" } });
        vo.RowList.Add(new TableRow() { ValList = new List<string>() { "2", "阅读" } });
        vo.ValueOptionSql = new ValueOptionSql() { Sql = "", ConnStringName = "" };
        ts.ValueOptionList.Add(vo);
        ts.SearchColNameList.Add("APP_DESC");
        ts.SearchColNameList.Add("SUBAPP_DESC");
        string path = HttpContext.Current.Server.MapPath("~/subapp.xml");
        Boco.CommonToolLibrary.Xml.Serializer.Serialiaze<TableSetting>(path, ts);
    }


    //上传EXCEL,并进行验证
    private bool CheckExcelValidate(ref DataTable dtExcel)
    {
        string fileName = "";
        string uploadFullName = "";
        string fileFullName = file.FileName;
        fileName = fileFullName.Substring(fileFullName.LastIndexOf("\\") + 1);
        if (!validateFileupload(fileName))
        {
            return false;
        }
        uploadFullName = HttpContext.Current.Server.MapPath("~/Temp") + "/UploadExcel";
        if (!Directory.Exists(uploadFullName))
        {
            Directory.CreateDirectory(uploadFullName);
        }
        uploadFullName += "/" + fileName;
        file.SaveAs(uploadFullName);
        List<DataTable> dsUpload = Boco.Dss.Framework.EPPlusHelper.ExportExcelHelper.ReadExcel(uploadFullName);
        if (dsUpload == null || dsUpload.Count == 0)
        {
            return false;
        }
        dtExcel = dsUpload[0];
        if (dtExcel.Rows.Count == 0)
        {
            return false;
        }
        return true;
    }

    /// <summary>
    /// 验证Excel中录入的文件格式是否正确
    /// </summary>
    /// <param name="fileName">文件名称</param>
    private bool validateFileupload(string fileName)
    {
        if (fileName == "")
        {
            return false;
        }
        FileInfo fileinfo = new FileInfo(fileName);
        if (fileinfo.Extension.ToLower() != ".xlsx")
        {
            return false;
        }
        return true;
    }

    public string SerializeDataTable(DataTable dt)
    {
        var str = Boco.CommonToolLibrary.Table.TableHelper.CreateJsonParameters(dt).TrimStart(new char[] { '{' });
        return string.Format("{0}\"page\":{1},\"records\":{2},{3}", "{", 1, dt.Rows.Count, str);
    }


    [Serializable]
    public class TableSetting
    {
        public TableSetting()
        {
            ValueOptionList = new List<ValueOption>();
            TableColList = new List<TableCol>();
            CrcSettingList = new List<CrcSetting>();
            SearchColNameList = new List<string>();
            SelectSql = string.Empty;
        }

        /// <summary>
        /// 表名
        /// </summary>
        [XmlAttribute]
        public string TableName
        {
            get;
            set;
        }

        /// <summary>
        /// 表描述
        /// </summary>
        [XmlAttribute]
        public string TableDesc
        {
            get;
            set;
        }

        /// <summary>
        /// 连接串
        /// </summary>
        [XmlAttribute]
        public string ConnStringName
        {
            get;
            set;
        }

        public List<TableCol> TableColList
        {
            get;
            set;
        }

        public List<ValueOption> ValueOptionList
        {
            get;
            set;
        }

        public List<CrcSetting> CrcSettingList
        {
            get;
            set;
        }

        [XmlArrayItem("SearchColName")]
        public List<string> SearchColNameList
        {
            get;
            set;
        }

        [XmlIgnore]
        public string SelectSql
        {
            get;
            set;
        }

        [XmlIgnore]
        public string InsertSql
        {
            get;
            set;
        }

    }

    /// <summary>
    /// 字段值选择项（页面上呈现为下拉框）
    /// </summary>
    [Serializable]
    public class ValueOption
    {
        public ValueOption()
        {
            ColNameList = new List<string>();
            RowList = new List<TableRow>();
        }

        /// <summary>
        /// 列名
        /// </summary>
        [XmlArrayItem("ColName")]
        public List<string> ColNameList
        {
            get;
            set;
        }

        /// <summary>
        /// 行
        /// </summary>
        [XmlArrayItem("Row")]
        public List<TableRow> RowList
        {
            get;
            set;
        }

        /// <summary>
        /// 列值来源（SQL）
        /// </summary>
        public ValueOptionSql ValueOptionSql
        {
            get;
            set;
        }

        /// <summary>
        /// 下拉框中显示的字段
        /// </summary>
        public string DisplayColName
        {
            get;
            set;
        }
    }

    [Serializable]
    public class TableRow
    {
        public TableRow()
        {
            ValList = new List<string>();
        }

        [XmlArrayItem("Val")]
        public List<string> ValList
        {
            get;
            set;
        }
    }

    [Serializable]
    public class ValueOptionSql
    {
        public string Sql
        {
            get;
            set;
        }

        public string ConnStringName
        {
            get;
            set;
        }
    }

    [Serializable]
    public class TableCol
    {
        public TableCol()
        {
            Show = true;
            Nullable = true;
            IsCrc = false;
            IsPK = false;
        }

        /// <summary>
        /// 字段名
        /// </summary>
        [XmlAttribute]
        public string ColName
        {
            get;
            set;
        }

        /// <summary>
        /// 字段描述
        /// </summary>
        [XmlAttribute]
        public string ColDesc
        {
            get;
            set;
        }

        /// <summary>
        /// 字段类型(STRING/INT/DOUBLE/DATE)
        /// </summary>
        [XmlAttribute]
        public string DateType
        {
            get;
            set;
        }

        /// <summary>
        /// 是否为主键
        /// </summary>
        [XmlAttribute]
        public bool IsPK
        {
            get;
            set;
        }

        /// <summary>
        /// 是否允许空
        /// </summary>
        [XmlAttribute]
        public bool Nullable
        {
            get;
            set;
        }
        /// <summary>
        /// 是否根据时戳生成CRC码
        /// </summary>
        [XmlAttribute]
        public bool IsCrc
        {
            get;
            set;
        }

        /// <summary>
        /// 默认值
        /// </summary>
        [XmlAttribute]
        public string DefaultValue
        {
            get;
            set;
        }

        /// <summary>
        /// 是否显示
        /// </summary>
        [XmlAttribute]
        public bool Show
        {
            get;
            set;
        }
    }


    public class CrcSetting
    {
        /// <summary>
        /// CRC列名
        /// </summary>
        [XmlAttribute]
        public string ColName
        {
            get;
            set;
        }

        /// <summary>
        /// CRC消息来源，多个字段时用逗号隔开
        /// </summary>
        [XmlAttribute]
        public string CrcMsg
        {
            get;
            set;
        }

        /// <summary>
        /// 分隔符，当运算CRC来源是多个字段是，字段之间应该有个分隔符
        /// </summary>
        [XmlAttribute]
        public string Separator
        {
            get;
            set;
        }
    }


    public class Result
    {
        public Result()
        {

        }

        public Result(int code, string message)
        {
            this.code = code;
            this.msg = message;
        }

        /// <summary>
        /// 编码
        /// </summary>
        public int code
        {
            get;
            set;
        }

        /// <summary>
        /// 消息
        /// </summary>
        public string msg
        {
            get;
            set;
        }

    }


    /// <summary>
    /// Query查询类
    /// </summary>
    ///
    public class Query
    {
        public Query()
        {
        }
        public string val;//下拉框value
        public string text;//下拉框text
    }

}