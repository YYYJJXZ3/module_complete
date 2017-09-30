<%@ WebHandler Language="C#" Class="InitGrid" %>

using System;
using System.Web;
using Boco.Dss.Web.JsHandlers;
using System.Data;
using System.Text;
using System.Configuration;

public class InitGrid : SmartGridHandler
{
    public override DataTable GetData(SmartGridOption option)
    {
        StringBuilder strSql = new StringBuilder();
        DateTime start = DateTime.Now.AddDays(-30),
            end = DateTime.Now;
        if (option.Param1.IndexOf(":") > 0)
        {
            string[] arrTime = option.Param1.Split(':');
            start = DateTime.Parse(arrTime[0]);
            end = DateTime.Parse(arrTime[1]).AddDays(1);
        }
        strSql.Append("select t.rule_id,t.rule_name,decode(s.name, null, '未分类', s.name) as name,");
        strSql.Append("t.rule_continuity,t.rule_abnormal,t.create_time,decode(t.istrue,1,'是','否')istrue  ");
        strSql.Append("from sys_ip_alerm_rule t left join sys_ip_systemname s on t.systemname = s.key ");//t.rule_name like '%%'
        strSql.Append("where  t.create_time between to_date('" + start.ToString("yyyy-MM-dd") + "', 'yyyy-mm-dd hh24:mi:ss') ");
        strSql.Append("and to_date('" + end.ToString("yyyy-MM-dd") + "', 'yyyy-mm-dd hh24:mi:ss')");

        string sql = Boco.CommonToolLibrary.Sql.SqlHelper.PageSql(strSql.ToString(),
            "SQL_ConnStr",
            option.PageIndex - 1,
            option.PageSize,
            option.SortColIndex,
                        option.SortDirection == 1 ? true : false,
                        option.SecondSortColIndex,
                        option.SecondSortDirection == 1 ? true : false);
        string[] arrTitles = { "ID", "告警名称", "归属专题", "比较次数", "异常次数", "生成时间", "是否生效", "操作" };
        DataTable dt = Boco.Dss.Data.DbHelper.GetDataBySql(sql, GetConnction());
        if (dt != null)
        {
            for (int i = 0; i < dt.Columns.Count; i++)
            {
                if (i < arrTitles.Length)
                {
                    dt.Columns[i].ColumnName = arrTitles[i];
                }
            }
        }
        if (dt.Rows.Count < option.PageSize)
        {
            option.IsTotal = 0;
            option.TotalCount = dt.Rows.Count;
        }
        else
        {
            option.IsTotal = -1;
        }
        return dt;
    }

    public override int GetCount(SmartGridOption option)
    {
        StringBuilder strSql = new StringBuilder();
        DateTime start = DateTime.Now.AddDays(-30),
           end = DateTime.Now;
        if (option.Param1.IndexOf(":") > 0)
        {
            string[] arrTime = option.Param1.Split(':');
            start = DateTime.Parse(arrTime[0]);
            end = DateTime.Parse(arrTime[1]).AddDays(1);
        }
        strSql.Append("select count(*) from sys_ip_alerm_rule t left join sys_ip_systemname s on t.systemname = s.key ");//t.rule_name like '%%'
        strSql.Append("where  t.create_time between to_date('" + start.ToString("yyyy-MM-dd") + "', 'yyyy-mm-dd hh24:mi:ss') ");
        strSql.Append("and to_date('" + end.ToString("yyyy-MM-dd") + "', 'yyyy-mm-dd hh24:mi:ss')");
        DataTable dt = Boco.Dss.Data.DbHelper.GetDataBySql(strSql.ToString(), GetConnction());
        int _default = 0;
        if (dt != null && dt.Rows.Count > 0)
        {
            int.TryParse(dt.Rows[0][0].ToString(), out _default);
        }
        return _default;
    }

    ConnectionStringSettings GetConnction()
    {
        return System.Configuration.ConfigurationManager.ConnectionStrings["SQL_ConnStr"];
    }
}