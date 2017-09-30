<%@ WebHandler Language="C#" Class="Boco.Dss.CustomAnalysis.Web.CellDimHandler" %>

using System;
using System.Linq;
using System.Collections.Generic;
using System.Web;
using System.Data;
using System.Web;
using System.Web.SessionState;
using Boco.Semantic.Entity;
using Boco.Semantic.EntityDB;
using Boco.BLLEngine;

namespace Boco.Dss.CustomAnalysis.Web
{
    public class CellDimHandler : IHttpHandler, IRequiresSessionState
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/xml";
            context.Response.Buffer = true;
            context.Response.ExpiresAbsolute = DateTime.Now.AddDays(-1);
            context.Response.AddHeader("pragma", "no-cache");
            context.Response.AddHeader("cache-control", "");
            context.Response.CacheControl = "no-cache";
            string text = string.Empty;
            string dataType = context.Request.QueryString["datatype"];
            string dimID = context.Request.QueryString["dimid"];
            string levelName = context.Request.QueryString["levelname"];
            if (dataType == "datacount")
            {
                text += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
                string region = context.Request.QueryString["region"];
                if (region == "全省")
                {
                    region = "";
                }
                string cond = context.Request.QueryString["cellname"];
                text += "<DataCount>" + GetDataCount(dimID, levelName, region, cond) + "</DataCount>";
            }
            else if (dataType == "proregion")
            {
                text += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
                text += "<regions>" + GetProRegion() + "</regions>";
            }
            else if (dataType == "30nelist")
            {
                text = Top30NeList(context);
            }
            else
            {
                text += GetCellDimPage(context, dataType);
            }
            context.Response.Write(text);
        }

        private string GetProRegion()
        {
            string levelName = HttpContext.Current.Request["levelname"];
            if (levelName == "地区" || levelName == "地市")
            {
                return "";
            }
            string result = string.Empty;
            string regionGranted = GetRegionRightGranted();

            if (string.IsNullOrEmpty(regionGranted))
            {
                string dimId = HttpContext.Current.Request["dimid"];
                Sem_Dimension sd = DimensionDB.GetDimensionByID(dimId);
                if (sd != null)
                {
                    Level lvlRegion = sd.Levels.Find(p => p.Name == "地区" || p.Name == "地市");
                    if (lvlRegion != null)
                    {
                        int count = 0;
                        DataTable dt = DimensionDB.GetDimensionAttributeMember(sd, new List<string>() { lvlRegion.Name }, new List<Level>(), 0, 1000, true, -1, true, out count, false);

                        foreach (DataRow row in dt.Rows)
                        {
                            result += "<region id='" + row[0].ToString() + "' >" + row[1].ToString() + "</region>";
                        }
                    }
                }
            }
            else
            {
                foreach (string s in regionGranted.Split(','))
                {
                    result += "<region id='" + s + "' >" + s + "</region>";
                }
            }
            return result;
        }


        private string Top30NeList(HttpContext context)
        {
            System.Text.StringBuilder sb = new System.Text.StringBuilder();
            string dimID = context.Request.QueryString["dimid"];
            string levelName = context.Request.QueryString["levelname"];
            string region = context.Request.QueryString["region"];
            if (region == "全省")
            {
                region = "";
            }
            string cond = context.Request.QueryString["cellname"];
            DataTable dt = GetDimensionMemberData(dimID, levelName, region, cond, 0, 32);
            sb.Append("<?xml version=\"1.0\" encoding=\"UTF-8\"?><nes>");
            foreach (DataRow row in dt.Rows)
            {
                sb.Append("<ne name=\"" + row[1].ToString() + "\" value=\"" + row[1].ToString() + "\">");
                sb.Append("</ne>");
            }
            sb.Append("</nes>");
            return sb.ToString();
        }

        private string GetCellDimPage(HttpContext context, string dataType)
        {
            string result = string.Empty;
            string pageSize = context.Request.QueryString["pagesize"];
            string pageIndex = context.Request.QueryString["pageindex"];
            int iPageIndex = int.Parse(pageIndex);
            int iPageSize = int.Parse(pageSize);
            string dimID = context.Request.QueryString["dimid"];
            string levelName = context.Request.QueryString["levelname"];
            string region = context.Request.QueryString["region"];
            if (region == "全省")
            {
                region = "";
            }
            string cond = context.Request.QueryString["cellname"];
            DataTable dt = new DataTable();
            if (levelName == "地区" || levelName == "地市")
            {
                string dimId = HttpContext.Current.Request["dimid"];
                Sem_Dimension sd = DimensionDB.GetDimensionByID(dimId);
                if (sd != null)
                {
                    Level lvlRegion = sd.Levels.Find(p => p.Name == levelName);
                    if (lvlRegion != null)
                    {
                        int count = 0;
                        dt = DimensionDB.GetDimensionAttributeMember(sd, new List<string>() { lvlRegion.Name }, new List<Level>(),iPageIndex, 1000, true, -1, true, out count, false);
                    }
                }
                if (!string.IsNullOrEmpty(cond))
                {
                    dt = SelectRows(dt, dt.Columns[1].ColumnName + " like '%" + cond + "%'");
                }
                dt.Columns[0].ColumnName = "序号";
                dt.Columns[1].ColumnName = levelName;
                for (int r = 0; r < dt.Rows.Count; r++)
                {
                    dt.Rows[r][0] = r + 1;
                }
                dt = SelectRows(dt, "序号>" + (iPageIndex * iPageSize).ToString() + " AND 序号<=" + (iPageIndex * iPageSize + iPageSize).ToString());
            }
            else
            {
                dt = GetDimensionMemberData(dimID, levelName, region, cond, int.Parse(pageIndex), int.Parse(pageSize));
            }
            result += DataTableToTrTd(dt);
            return result;
        }

        private DataTable SelectRows(DataTable dt, string expression)
        {
            DataTable data = dt.Clone();
            DataRow[] rows = dt.Select(expression);
            foreach (DataRow row in rows)
            {
                data.ImportRow(row);
            }
            return data;
        }

        private string DataTableToTrTd(DataTable dt)
        {
            string result = "<tr>";
            for (int i = 0; i < dt.Columns.Count; i++)
            {
                if (i == 1)
                {
                    result += "<th><input type='checkbox' name=\"ALL\"/>" + dt.Columns[i].ColumnName + "</th>";
                }
                else
                {
                    result += "<th>" + dt.Columns[i].ColumnName + "</th>";
                }
            }
            result += "</tr>";
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                result += "<tr>";
                for (int j = 0; j < dt.Columns.Count; j++)
                {
                    if (1 == j)
                    {
                        result += "<td><input type='checkbox' value='" + dt.Rows[i][j].ToString() + "' />" + dt.Rows[i][j].ToString() + "</td>";
                    }
                    else
                    {
                        result += "<td>" + dt.Rows[i][j].ToString() + "</td>";
                    }
                }
                result += "</tr>";
            }
            return result;
        }

        private DataTable GetDimensionMemberData(string dimID, string levelName, string regionDesc, string cond, int page, int pagesize)
        {
            Sem_Dimension dim = DimensionDB.GetDimensionByID(dimID);
            Level currentLevel = dim.Levels.Find(p => p.Name == levelName);
            List<string> lvlNameList = new List<string>();
            lvlNameList.Add(levelName);
            if (levelName.Contains("小区"))
            {
                if (dim.Levels.Find(p => p.Name == "LAC") != null)
                {
                    lvlNameList.Add("LAC");
                }
                if (dim.Levels.Find(p => p.Name == "CI") != null)
                {
                    lvlNameList.Add("CI");
                }
            }
            List<Level> filterLvlList = new List<Level>();
            if (levelName != Boco.Semantic.sLevel.Region)
            {
                Level lvlRegion = dim.Levels.Find(p => p.Name == Boco.Semantic.sLevel.Region);
                if (lvlRegion != null)
                {
                    List<string> neList = new List<string> { "小区", "BSC", "MSC", "MSCSERVER", "TD小区", "HLR", "MGW", "热点", "AP", "RNC", "区县", "市县", "设备" };
                    if (neList.Contains(levelName))
                    {
                        lvlNameList.Add(lvlRegion.Name);
                        if (string.IsNullOrEmpty(regionDesc) || regionDesc == "全省")
                        {
                            string regionGranted = GetRegionRightGranted();
                            if (!string.IsNullOrEmpty(regionGranted))
                            {
                                lvlRegion.Val = GetRegionRightGranted();
                                filterLvlList.Add(lvlRegion);
                            }
                        }
                        else
                        {
                            lvlRegion.Val = regionDesc;
                            filterLvlList.Add(lvlRegion);
                        }
                    }
                }
            }
            if (!string.IsNullOrEmpty(cond))
            {
                currentLevel.ValType = "Contain";
                currentLevel.Val = cond;
                filterLvlList.Add(currentLevel);
            }
            DataTable dt;
            if (levelName == "月" || levelName == "周")
            {
                int count = 0;
                if (filterLvlList.Count == 0)
                {
                    Level lvlMonth = dim.Levels.Find(p => p.Name == levelName).Copy();
                    lvlMonth.ValType = "LessOrEqual";
                    if (levelName == "月")
                    {
                        lvlMonth.Val = DateTime.Now.AddMonths(4).ToString("yyyy年MM月");
                    }
                    else
                    {
                        lvlMonth.Val = DateTime.Now.AddDays(28).Year + "年" + Boco.CommonToolLibrary.DateTimeHelper.GetNumWeekToYear(DateTime.Now.AddDays(28)).ToString().PadLeft(2, '0') + "周";
                    }
                    filterLvlList.Add(lvlMonth);
                }
                dt = DimensionDB.GetDimensionAttributeMember(dim, lvlNameList, filterLvlList, page * pagesize, pagesize, false, 0, true, out count, false);
            }
            else
            {
                if (levelName.Contains("等级") || levelName == "小时")
                {
                    int ii = 0;
                    dt = DimensionDB.GetDimensionAttributeMember(dim, lvlNameList, filterLvlList, page * pagesize, pagesize, true, 0, false, out ii, false);
                    dt.Columns.RemoveAt(0);
                }
                else
                {
                    dt = DimensionDB.GetDimensionAttributeMember(dim, lvlNameList, filterLvlList, page * pagesize, pagesize, false);
                }
            }
            dt.Columns.Add("序号", typeof(double));
            dt.Columns[dt.Columns.Count - 1].SetOrdinal(0);
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                dt.Rows[i][0] = page * pagesize + i + 1;
            }
            dt = GetCurDateAttrib(currentLevel.Name, cond, dt, page);
            return dt;
        }

        private string GetDataCount(string dimID, string levelName, string regionDesc, string cond)
        {
            Sem_Dimension dim = DimensionDB.GetDimensionByID(dimID);
            Level currentLevel = dim.Levels.Find(p => p.Name == levelName);
            if (string.IsNullOrEmpty(currentLevel.TableName))
            {
                return "-1";
            }
            List<string> lvlNameList = new List<string>();
            lvlNameList.Add(levelName);
            List<Level> filterLvlList = new List<Level>();
            Level lvlRegion = dim.Levels.Find(p => p.Name == Boco.Semantic.sLevel.Region);
            if (lvlRegion != null)
            {
                List<string> neList = new List<string> { "小区", "BSC", "MSC", "MSCSERVER", "TD小区", "HLR", "MGW", "热点", "AP", "RNC", "区县", "市县", "设备" };
                if (neList.Contains(levelName))
                {
                    lvlNameList.Add(lvlRegion.Name);
                    if (string.IsNullOrEmpty(regionDesc) || regionDesc == "全省")
                    {
                        string regionGranted = GetRegionRightGranted();
                        if (!string.IsNullOrEmpty(regionGranted))
                        {
                            lvlRegion.Val = GetRegionRightGranted();
                            filterLvlList.Add(lvlRegion);
                        }
                    }
                    else
                    {
                        lvlRegion.Val = regionDesc;
                        filterLvlList.Add(lvlRegion);
                    }
                }
            }
            if (!string.IsNullOrEmpty(cond.Trim()))
            {
                currentLevel.ValType = "Contain";
                currentLevel.Val = cond;
                filterLvlList.Add(currentLevel);
            }
            string sql = DimensionDB.GetDimensionAttributeMemberSql(dim, lvlNameList, filterLvlList, false);
            sql = "SELECT COUNT(*) FROM (" + sql + ") AA";
            DataTable dt = Boco.Dss.Data.DbHelper.GetDataBySql(sql,System.Configuration.ConfigurationManager.ConnectionStrings[currentLevel.ConnectionStringName]);
            return dt.Rows[0][0].ToString();
        }


        private DataTable GetCurDateAttrib(string levelName, string cond, DataTable dt, int page)
        {
            if (page == 0 && string.IsNullOrEmpty(cond) && dt.Rows.Count > 5)
            {
                if (levelName == "日")
                {
                    dt.Rows[0][1] = "昨天";
                    dt.Rows[1][1] = "前天";
                    dt.Rows[2][1] = "上周同一天";
                    dt.Rows[3][1] = "上月同一天";
                    dt.Rows[4][1] = "今天";
                }
                else if (levelName == "月")
                {
                    dt.Rows[0][1] = "上月";
                    dt.Rows[1][1] = "上上月";
                    dt.Rows[2][1] = "去年同期";
                    dt.Rows[3][1] = "本月";
                }
                else if (levelName == "周")
                {
                    dt.Rows[0][1] = "上周";
                    dt.Rows[1][1] = "上上周";
                    dt.Rows[2][1] = "去年同期";
                    dt.Rows[3][1] = "本周";
                }
            }
            return dt;
        }

        private string GetRegionRightGranted()
        {
            string s = string.Empty;
            if (HttpContext.Current.Session["CaRegionRightGranted"] == null)
            {
                Boco.Dss.Config.DataRoleItem itemRegion = Boco.Dss.Framework.UserOnLine.CurrentUser.DataRole.ItemList.Find(p => p.LevelName == "地区" || p.LevelName == "地市");
                if (itemRegion != null)
                {
                    s = string.Join(",", itemRegion.MemberList);
                }
                HttpContext.Current.Session["CaRegionRightGranted"] = s;
            }
            else
            {
                s = HttpContext.Current.Session["CaRegionRightGranted"].ToString();
            }
            return s;
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }

    }
}