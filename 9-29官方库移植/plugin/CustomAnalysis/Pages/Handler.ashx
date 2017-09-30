<%@ WebHandler Language="C#" Class="Boco.Dss.CustomAnalysis.Web.Handler" %>
using Boco.Dss.CustomAnalysis.Entity;
using Boco.Dss.CustomAnalysis.EntityDB;
using Boco.Semantic;
using Boco.Semantic.Entity;
using Boco.Semantic.EntityDB;
using Boco.QueryEngine;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.SessionState;
using System.Xml;
using System.Web.Script.Serialization;
using Boco.Dss.Config;

namespace Boco.Dss.CustomAnalysis.Web
{
    public class Handler : IHttpHandler, IReadOnlySessionState
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            context.Response.Buffer = true;
            context.Response.ExpiresAbsolute = DateTime.Now.AddDays(-1);
            context.Response.AddHeader("pragma", "no-cache");
            context.Response.AddHeader("cache-control", "");
            context.Response.CacheControl = "no-cache";
            string text = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
            string dataType = context.Request.QueryString["datatype"];
            if (dataType == "meadim")
            {
                context.Response.ContentType = "text/xml";
                text += GetMeaDimString();
            }
            else if (dataType == "tmptstore")
            {
                text = StoreAnalyzerString();
            }
            else if (dataType == "anaagain")
            {
                text = GetAnalyzerStringStored(context.Request["key"]);
            }
            else if (dataType == "template")
            {
                text = GetTemplateByID(context.Request.QueryString["templateid"]);
            }
            else if (dataType == "singlemea")
            {
                text = GetSingleMeasureTemplate();
            }
            else if (dataType == "templatefile")
            {
                text = ReadTemplateFile(context);
            }
            else if (dataType == "metadata")
            {
                text += GetMetaMeasure(context);
            }
            else if (dataType == "cube")
            {
                text = GetCubeListString();
            }
            else if (dataType == "forecast")
            {
                text = ForecastQueryTime();
            }
            else if (dataType == "folderid")
            {
                try
                {
                    Cube cube = CubeDB.GetCubeById(context.Request["cubeid"]);
                    text = cube.CubeFolder.ID;
                }
                catch (Exception ex)
                {
                    text = "-1";
                }
            }
            else if (dataType == "relatedmea")
            {
                text = GetRelatedMeaList();
            }
            else if (dataType == "tmpfolder")
            {
                context.Response.ContentType = "text/xml";
                text += GetTemplateFolderXmlString();
            }
            else
            {
                context.Response.ContentType = "text/xml";
                string type = context.Request.QueryString["type"];
                if (type == "save")
                {
                    text = SaveTemplate();
                }
                else if (type == "add")
                {
                    text += AddTemplate(context);
                }
                else if (type == "export")
                {
                    text += CreateCsv();
                }
                else if (type == "sql")
                {
                    context.Response.ContentType = "text/plain";
                    text = GetQuerySentence();
                }
                else
                {
                    text = "<root>Hello World!</root>";
                }
            }
            context.Response.Write(text);
        }

        private string GetCubeListString()
        {
            string folderID = HttpContext.Current.Request["folderid"];
            List<Cube> cubeList = CubeDB.GetCubeListByFolder(folderID);
            string str = "";
            foreach (Cube c in cubeList)
            {
                str += "<option value='" + c.ID + "'>" + c.Name + "</option>";
            }
            return str;
        }

        private string ForecastQueryTime()
        {
            string azStr = HttpContext.Current.Request["az"];
            Analyzer az = new System.Web.Script.Serialization.JavaScriptSerializer().Deserialize<Analyzer>(azStr);
            Template t = new Template();
            t.Analyzer = az;
            FormatDateLevelVal(t);
            double duration = QueryLog.ForecastQueryTime(az);
            duration = (int)duration+1;
            return duration.ToString();
        }

        private string GetRelatedMeaList()
        {
            string meaID = HttpContext.Current.Request["meaid"];
            List<Measure> meaList = new List<Measure>();
            if (!string.IsNullOrEmpty(meaID))
            {
                List<Sem_Measure> relatedMeaList = Boco.Semantic.EntityDB.MeasureDB.GetMeasureWithRelateMeasures(meaID, MeasureRelationType.CalculateFactor);
                if (relatedMeaList != null && relatedMeaList.Count > 0)
                {
                    relatedMeaList.RemoveAt(0);
                    relatedMeaList.ForEach(p => meaList.Add(new Measure(p)));
                }
            }
            return new JavaScriptSerializer().Serialize(meaList);
        }

        /// <summary>
        /// 根据模板ID获取模板对象并序列化字符串
        /// </summary>
        /// <param name="templateid">模板ID</param>
        /// <returns>模板对象序列化字符串</returns>
        public string GetTemplateByID(string templateid)
        {
            try
            {
                Boco.Dss.CustomAnalysis.Entity.Template tmplt = TemplateDB.GetTemplateByID(int.Parse(templateid));
                if (tmplt != null)
                {
                    tmplt.Analyzer.ShowUintInColumn = tmplt.GridSetting.ShowUnit;
                    string text = new JavaScriptSerializer().Serialize(tmplt);
                    return text;
                }
                else
                {
                    return "<stat value=\"-1\">未找到此模板</stat>";
                }
            }
            catch (Exception ex)
            {
                return "<stat value=\"-1\">" + ex.Message + "</stat>";
            }
        }

        /// <summary>
        /// 保存已有模板
        /// </summary>
        /// <param name="context">上下文信息</param>
        /// <returns>保存成功则返回“<stat value="模板ID"></stat>”，
        /// 异常则输出异常消息</returns>
        public string SaveTemplate()
        {
            string tempId = HttpContext.Current.Request["templateid"];
            try
            {
                HttpContext context = HttpContext.Current;
                Template temp = GetPostTemplate();
                if (temp.Analyzer.MeasureList.Count < 1)
                {
                    return "<stat value=\"-1\">未选择任何指标</stat>";
                }
                temp.Analyzer.MeasureFilter = context.Request["filterexp"];
                TemplateDB.UpdateTemplate(temp);
                TemplateDB.SaveTemplateObject(temp);
                return "<stat value=\"" + temp.TemplateID + "\"></stat>";
            }
            catch (Exception ex)
            {
                return "<stat value=\"-1\">保存失败，" + ex.Message + "</stat>";
            }
        }


        private string GetQuerySentence()
        {
            try
            {
                Template tmplt = GetPostTemplate();
                FormatDateLevelVal(tmplt);
                QuerySentence qs = tmplt.Analyzer.GetQuerySentence()[0];
                qs.Sql = qs.Sql.Replace("/*+  ORDERED */", "");
                string sql = new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(qs);
                return sql;
            }
            catch (Exception ex)
            {
                QuerySentence qs = new QuerySentence();
                qs.Sql = ex.ToString();
                return new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(qs);
            }
        }

        private string CreateCsv()
        {
            int maxRowCount = 10000;
            string strMaxRowCount = System.Configuration.ConfigurationManager.AppSettings["ExportDataNum"];
            if (!string.IsNullOrEmpty(strMaxRowCount))
            {
                if (!int.TryParse(strMaxRowCount, out maxRowCount))
                {
                    maxRowCount = 10000;
                }
            }
            try
            {
                Template tmplt = GetPostTemplate();
                FormatDateLevelVal(tmplt);
                SetAnalyzerSortSetting(tmplt.Analyzer);
                SetAnalysisPage(tmplt.Analyzer);
                string total = HttpContext.Current.Request["total"];
                if (string.IsNullOrEmpty(total))
                {
                    total = tmplt.Analyzer.GetRowsCount().ToString();
                }

                tmplt.Analyzer.PageSetting.EnableComputeTotal = false;
                tmplt.Analyzer.PageSetting.PageSize = maxRowCount;
                tmplt.Analyzer.PageSetting.Page = 0;
                DataTable dt = tmplt.Analyzer.GetData();
                string fileNmae = DataTableToCsv(dt);
                return "<file total=\"" + total + "\" max=\"" + maxRowCount.ToString() + "\">" + fileNmae + "</file>";
            }
            catch (Exception ex)
            {
                return "<file total=\"-1\" max=\"" + maxRowCount.ToString() + "\">" + ex.Message + "</file>";
            }
        }

        private string DataTableToCsv(DataTable dt)
        {
            string filename = new Random().Next(900000, 999999).ToString() + ".csv";
            if (!System.IO.Directory.Exists(HttpContext.Current.Server.MapPath("../../../Temp/ca")))
            {
                System.IO.Directory.CreateDirectory(HttpContext.Current.Server.MapPath("../../../Temp/ca"));
            }
            using (var sw = new System.IO.StreamWriter(HttpContext.Current.Server.MapPath("../../../Temp/ca/" + filename), false, Encoding.Default, 10000000))
            {
                int iColCount = dt.Columns.Count;
                for (int i = 0; i < iColCount; i++)
                {
                    sw.Write(dt.Columns[i]);
                    if (i < iColCount - 1)
                    {
                        sw.Write(",");
                    }
                }
                sw.Write(Environment.NewLine);
                foreach (System.Data.DataRow dr in dt.Rows)
                {
                    for (int i = 0; i < iColCount; i++)
                    {
                        if (!Convert.IsDBNull(dr[i]))
                        {
                            sw.Write("\"" + dr[i].ToString().Replace("\"", "\"\"") + "\"");
                        }
                        if (i < iColCount - 1)
                        {
                            sw.Write(",");
                        }
                    }
                    sw.Write(Environment.NewLine);
                }
            }
            return filename;
        }

        private bool CheckDimMeaMatching(List<Measure> meaList, List<Dimension> dimList)
        {
            foreach (Measure m in meaList)
            {
                if (m.MeasureType != MeasureType.CalculateColumn)
                {
                    Sem_Measure sm = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByID(m.MeasureID);
                    foreach (Dimension dim in dimList)
                    {
                        if (dim.DimensionName != "地理维" && sm.RelatedDimensionList.Find(p => p.Name == dim.DimensionName) == null)
                        {
                            throw new Exception("不能在[" + dim.DimensionName + "]上查询指标[" + m.DisplayName + "]");
                        }
                    }
                }
            }
            return true;
        }

        private string GetMetaMeasure(HttpContext context)
        {
            string meaID = context.Request.QueryString["meaid"];
            string meaText = "<root>";
            if (!string.IsNullOrEmpty(meaID))
            {
                Sem_Measure sm = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByID(meaID);
                if (sm != null)
                {
                    string s = Boco.CommonToolLibrary.Xml.Serializer.XmlSerializerToText(sm);
                    meaText += s.Substring(s.IndexOf("?>") + 2); ;
                    meaText += "<stat value=\"1\">" + sm.ID + "</stat>";
                }
                else
                {
                    meaText += "<stat value=\"-1\">未找到该指标的相关信息</stat>";
                }
            }
            else
            {
                meaText += "<stat value=\"-1\">参数错误</stat>";
            }
            return meaText + "</root>";
        }

        private string GetSingleMeasureTemplate()
        {
            string meaID = HttpContext.Current.Request.QueryString["anameaid"];
            Sem_Measure sm = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByID(meaID);
            if (sm != null)
            {
                Template t = new Template();
                t.Analyzer.MeasureList.Add(new Measure(sm));
                Sem_Dimension sdNe = sm.RelatedDimensionList.Find(p => p.DimensionType == "Ne" && p.Levels.FindIndex(pp => pp.Name == "地区") > -1);
                if (sdNe != null)
                {
                    Dimension dimNe = GetAnaDimension(sdNe, "地区");
                    t.Analyzer.RowDimList.Add(dimNe);
                }
                Sem_Dimension sdTime = sm.RelatedDimensionList.Find(p => p.DimensionType == "Date");
                Dimension dimDay = GetAnaDimension(sdTime, "日");
                if (dimDay != null)
                {
                    List<string> valList = new List<string>();
                    valList.Add(DateTime.Now.AddDays(-1).ToString("yyyy年MM月dd日"));
                    valList.Add(DateTime.Now.AddDays(-2).ToString("yyyy年MM月dd日"));
                    valList.Add(DateTime.Now.AddDays(-8).ToString("yyyy年MM月dd日"));
                    dimDay.ValList = valList;
                    dimDay.ValType = ValType.In;
                    t.Analyzer.RowDimList.Add(dimDay);
                }
                else
                {
                    Dimension dimMonth = GetAnaDimension(sdTime, "月");
                    if (dimMonth != null)
                    {
                        List<string> valList = new List<string>();
                        valList.Add(DateTime.Now.AddMonths(-1).ToString("yyyy年MM月"));
                        valList.Add(DateTime.Now.AddMonths(-2).ToString("yyyy年MM月"));
                        valList.Add(DateTime.Now.AddMonths(-13).ToString("yyyy年MM月"));
                        dimMonth.ValList = valList;
                        dimMonth.ValType = ValType.In;
                        t.Analyzer.RowDimList.Add(dimMonth);
                    }
                }
                t.Analyzer.PageSetting.PageSize = 20;
                string templateXml = new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(t);
                return templateXml;
            }
            return "";
        }

        private Dimension GetAnaDimension(Sem_Dimension sdNe, string levelName)
        {
            if (sdNe == null)
            {
                return null;
            }
            Dimension dim = new Dimension();
            dim.DimensionID = sdNe.ID;
            dim.DimensionName = sdNe.Name;
            dim.LevelName = levelName;
            return dim;
        }

        private string GetAnalyzerStringStored(string cacheKey)
        {
            if (HttpRuntime.Cache[cacheKey] != null)
            {
                string anastr = HttpRuntime.Cache[cacheKey].ToString();
                string tmpltStr = "{\"Analyzer\":" + anastr +
                    ",\"ShowGrid\":true,\"ShowChart\":false,\"GridSetting\":{\"ShowUnit\":true,\"LockCol\":-1},"+
                    "\"ChartSetting\":{\"AxisX\":0,\"ChartAxisYList\":[]}}";
                return tmpltStr;
            }
            else
            {
                return "-1";
            }
        }

        private string StoreAnalyzerString()
        {
            string anaStr = HttpContext.Current.Request["anastr"];
            string cacheKey = HttpContext.Current.Session.SessionID + DateTime.Now.ToString("hhmmss");
            HttpRuntime.Cache.Insert(cacheKey, anaStr, null, System.Web.Caching.Cache.NoAbsoluteExpiration, new TimeSpan(0, 5, 0));
            return cacheKey;
        }

        private string ReadTemplateFile(HttpContext context)
        {
            string fileName = context.Request.QueryString["filename"];
            if (string.IsNullOrEmpty(fileName))
            {
                return "{\"stat\":\"参数有误，未找到filename\",\"value\":\"-1\"}";
            }
            else
            {
                try
                {
                    string fullPath = context.Server.MapPath("../Xml/" + fileName.Replace(".xml", "") + ".xml");
                    if (!System.IO.File.Exists(fullPath))
                    {
                        return "{\"stat\":\"参数有误,不能刷新此页面,请重新进入此页面\",\"value\":\"-1\"}";
                    }
                    else
                    {
                        Template tmp = new Template();
                        Boco.CommonToolLibrary.Xml.Serializer.Deserialize<Template>(fullPath, ref tmp);
                        foreach (var m in tmp.Analyzer.MeasureList)
                        {
                            if (string.IsNullOrEmpty(m.DisplayName))
                            {
                                Sem_Measure sm = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByID(m.MeasureID);
                                if (sm != null)
                                {
                                    m.DisplayName = sm.DisplayName; m.Unit = sm.Unit;
                                }
                            }
                        }
                        tmp.Analyzer.PageSetting.PageSize = 20;
                        return new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(tmp);
                    }
                }
                catch (System.IO.FileNotFoundException ex)
                {
                    return "{\"stat\":\"初始化失败：" + ex.Message + "\",\"value\":\"-1\"}";
                }
            }
        }

        private Template GetTemplateFromFile(string fileName)
        {
            Template t = new Template();
            Boco.CommonToolLibrary.Xml.Serializer.Deserialize<Template>(
                HttpContext.Current.Server.MapPath("../Xml/" + fileName.Replace(".xml", "") + ".xml"), ref t);
            return t;
        }


        private Dimension CopyDimension(Dimension dim)
        {
            Dimension d = new Dimension();
            d.DimensionID = dim.DimensionID;
            d.DimensionName = dim.DimensionName;
            d.DimensionType = dim.DimensionType;
            d.HierarchyName = dim.HierarchyName;
            d.ValType = dim.ValType;
            d.ValList = dim.ValList;
            d.Val = dim.Val;
            return d;
        }


        /// <summary>
        /// 获取钻取后的粒度
        /// </summary>
        /// <param name="dim">当前维度</param>
        /// <param name="direct">当前粒度</param>
        /// <returns>维度对象</returns>
        private Dimension GetSiblingLevel(Dimension dim, string direct)
        {
            Sem_Dimension siblingLevelSemDim = Boco.Semantic.EntityDB.DimensionDB.GetDimensionByID(dim.DimensionID);
            Dimension dimNext = CopyDimension(dim);
            Hierarchie hier = siblingLevelSemDim.Hierarchies.Find(p => p.Name == dim.HierarchyName);
            int levelIndex = hier.Levels.FindIndex(p => p.Name == dim.DimensionName);
            if (direct == "down")
            {
                dimNext.LevelName = hier.Levels[levelIndex + 1].Name;
            }
            else
            {
                dimNext.LevelName = hier.Levels[levelIndex + 1].Name;
            }
            return dimNext;
        }


        private string GetMeaDimString()
        {
            HttpContext context = HttpContext.Current;
            string cubeid = context.Request.QueryString["cube"];
            try
            {
                List<Boco.Dss.CustomAnalysis.Entity.MeasurePath> lstMeasurePath = new List<MeasurePath>();
                List<Boco.Semantic.Entity.Sem_Dimension> lstDimension = new List<Sem_Dimension>();
                if (!string.IsNullOrEmpty(cubeid))
                {
                    lstMeasurePath = CubeDB.GetMeasuresByCubeID(cubeid, "2");
                    lstDimension = CubeDB.GetDimensionByCubeID(cubeid);
                }
                else
                {
                    string anaMeaID = context.Request.QueryString["anameaid"];
                    string fileName = context.Request.QueryString["filename"];
                    List<Sem_Dimension> sdList = new List<Sem_Dimension>();
                    if (!string.IsNullOrEmpty(anaMeaID))
                    {
                        MeasuresDimensionsFromMeaID(anaMeaID, out lstMeasurePath, out sdList);
                    }
                    if (!string.IsNullOrEmpty(fileName))
                    {
                        MeasuresDimensionsFromXml(fileName, out lstMeasurePath, out sdList);
                    }
                    lstDimension.AddRange(sdList);
                }
                return MeaDimToTreeXmlString(lstMeasurePath, lstDimension);
            }
            catch(Exception ex)
            {
                return ex.ToString();
            }

        }


        private void MeasuresDimensionsFromXml(string fileName, out List<MeasurePath> smList, out List<Sem_Dimension> sdList)
        {
            smList = new List<MeasurePath>();
            sdList = new List<Sem_Dimension>();
            string fullPath = HttpContext.Current.Server.MapPath("../Xml/" + fileName.Replace(".xml", "") + ".xml");
            if (System.IO.File.Exists(fullPath))
            {
                XmlDocument xmldoc = new XmlDocument();
                xmldoc.Load(fullPath);
                XmlNodeList xnlMea = xmldoc.GetElementsByTagName("Measure");
                if (xnlMea.Count > 0)
                {
                    List<string> fromTables = new List<string>();
                    foreach (XmlNode xn in xnlMea)
                    {
                        Sem_Measure sm = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByID(xn.Attributes["MeasureID"].Value);
                        if (sm != null && !string.IsNullOrEmpty(sm.TableName))
                        {
                            string fromtable = sm.TableName;
                            if (!string.IsNullOrEmpty(fromtable) && !fromTables.Contains(fromtable))
                            {
                                fromTables.Add(fromtable);
                                foreach (Sem_Dimension sd in sm.RelatedDimensionList)
                                {
                                    if (sdList.Find(p => p.Name == sd.Name) == null)
                                    {
                                        sdList.Add(sd.Copy());
                                    }
                                }
                            }
                        }
                    }
                    if (fromTables.Count > 0)
                    {
                        smList = CubeDB.GetMeasuresByFactTable(fromTables, "2");
                    }
                }
                System.IO.File.Delete(fullPath);
            }
        }


        private void MeasuresDimensionsFromMeaID(string meaID, out List<MeasurePath> smList, out List<Sem_Dimension> sdList)
        {
            smList = new List<MeasurePath>();
            sdList = new List<Sem_Dimension>();
            Sem_Measure mea = Boco.Semantic.EntityDB.MeasureDB.GetMeasureByID(meaID);
            if (mea != null)
            {
                foreach (Sem_Dimension sd in mea.RelatedDimensionList)
                {
                    if (sdList.Find(p => p.Name == sd.Name) == null)
                    {
                        sdList.Add(sd.Copy());
                    }
                }
                if (!string.IsNullOrEmpty(mea.FactID))
                {
                    smList = CubeDB.GetMeasuresByFactID(mea.FactID, "2");
                }
            }
        }



        /// <summary>
        /// 指标和维度信息生成xml字符串，以绑定到树
        /// </summary>
        /// <param name="meaList">指标集合</param>
        /// <param name="dimList">维度集合</param>
        /// <returns>xml字符串</returns>
        private string MeaDimToTreeXmlString(List<Boco.Dss.CustomAnalysis.Entity.MeasurePath> meaList, List<Boco.Semantic.Entity.Sem_Dimension> dimList)
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("<root>");
            //sb.Append("<item state=\"close\" id=\"meapathroot\">");
            //sb.Append("<content><name ico=\"jstree-icon\">指标集</name></content>");
            sb.Append(MeasureToTreeXmlString(meaList, true));
            //sb.Append("</item>");
            sb.Append(DimensionToTreeXmlString(dimList));
            sb.Append("</root>");
            return sb.ToString();
        }

        /// <summary>
        /// 由指标集合生成xml字符串
        /// </summary>
        /// <param name="meaList">指标目录集合</param>
        /// <returns>xml字符串</returns>
        private string MeasureToTreeXmlString(List<Boco.Dss.CustomAnalysis.Entity.MeasurePath> meaList, bool isRoot)
        {
            StringBuilder sb = new StringBuilder();
            foreach (Boco.Dss.CustomAnalysis.Entity.MeasurePath meaPath in meaList)
            {
                sb.Append(MeasurePathToXmlString(meaPath, isRoot));
            }
            return sb.ToString();
        }

        /// <summary>
        /// 由指标集合生成xml字符串
        /// </summary>
        /// <param name="meaPath">指标目录</param>
        /// <returns></returns>
        private string MeasurePathToXmlString(Boco.Dss.CustomAnalysis.Entity.MeasurePath meaPath, bool isRoot)
        {
            if (meaPath == null)
                return "";
            StringBuilder sb = new StringBuilder();
            if (isRoot)
            {
                sb.Append("<item state=\"open\" id=\"meapath_");
            }
            else
            {
                sb.Append("<item state=\"close\" id=\"meapath_");
            }
            sb.Append(meaPath.FolderID);
            sb.Append("\">");
            sb.Append("<content><name ico=\"jstree-icon\"><![CDATA[");
            sb.Append(meaPath.FolderName);
            sb.Append("]]></name></content>");
            sb.Append(MeasureToTreeXmlString(meaPath.ChildFolder, false));
            sb.Append(MeasureToXmlString(meaPath.Measures));
            sb.Append("</item>");
            return sb.ToString();
        }

        /// <summary>
        /// 由指标集合生成xml字符串
        /// </summary>
        /// <param name="meaList">指标集合</param>
        /// <returns></returns>
        private string MeasureToXmlString(List<Boco.Semantic.Entity.Sem_Measure> meaList)
        {
            StringBuilder sb = new StringBuilder();
            foreach (Boco.Semantic.Entity.Sem_Measure mea in meaList)
            {
                sb.Append("<item id=\"mea_");
                sb.Append(mea.ID);
                sb.Append("￥" + mea.Unit);
                sb.Append("\">");
                sb.Append("<content><name class=\"jstree-mea\"><![CDATA[");
                sb.Append(mea.DisplayName);
                sb.Append("]]></name></content></item>");
            }
            return sb.ToString();
        }


        /// <summary>
        /// 由维度生成xml字符串，以绑定到树控件
        /// </summary>
        /// <param name="dimList">维度集合</param>
        /// <returns></returns>
        private string DimensionToTreeXmlString(List<Boco.Semantic.Entity.Sem_Dimension> dimList)
        {
            StringBuilder sb = new StringBuilder();
            foreach (Boco.Semantic.Entity.Sem_Dimension m in dimList)
            {
                sb.Append("<item id=\"dim_");
                sb.Append(m.ID);
                sb.Append("\">");
                sb.Append("<content><name ico=\"jstree-dim\"><![CDATA[");
                sb.Append(m.Name);
                sb.Append("]]></name></content>");
                foreach (Level l in m.Levels)
                {
                    sb.Append("<item id=\"level_");
                    sb.Append(m.ID);
                    sb.Append("_");
                    sb.Append(l.ID);
                    sb.Append("\">");
                    sb.Append("<content><name ico=\"jstree-level\"><![CDATA[");
                    sb.Append(l.Name);
                    sb.Append("]]></name></content>");
                    sb.Append("</item>");
                }
                sb.Append("</item>");
            }
            return sb.ToString();
        }

        private string GetTemplateFolderXmlString()
        {
            string userID = HttpContext.Current.Request["userid"];
            if (string.IsNullOrEmpty(userID))
            {
                return "";
            }
            List<TempPath> pathList = TempPathDB.GetTempPathByUserID(userID);
            pathList.Add(new TempPath() { FolderID = "-1", FolderName = "自定义报表", ParentID = "", UserID = userID });
            StringBuilder sb = new StringBuilder();
            sb.Append("<root>");
            CreateTemplateFolderString(sb, pathList, "");
            sb.Append("</root>");
            return sb.ToString();

        }

        private void CreateTemplateFolderString(StringBuilder sb, List<TempPath> pathList, string parentID)
        {
            List<TempPath> childList = pathList.FindAll(p => p.ParentID == parentID);
            foreach (TempPath path in childList)
            {
                sb.Append("<item state=\"open\" id=\"tp" + path.FolderID);
                sb.Append("\">");
                sb.Append("<content><name ico=\"jstree-icon\"><![CDATA[");
                sb.Append(path.FolderName);
                sb.Append("]]></name></content>");
                CreateTemplateFolderString(sb, pathList, path.FolderID);
                sb.Append("</item>");
            }
        }


        private string DimensionMemberToXml(string dimID, string dimName, string hierName, string levelName, string themeID)
        {
            Boco.Semantic.Entity.Sem_Dimension dim = Boco.Semantic.EntityDB.DimensionDB.GetDimensionByID(dimID);//.DimensionDB.GetDimensionByName(dimName,themeID);
            if (!string.IsNullOrEmpty(hierName))
            {
                Hierarchie curHier = new Hierarchie();
                foreach (Hierarchie hier in dim.Hierarchies)
                {
                    if (hier.Name == hierName)
                    {
                        curHier = hier;
                        Level curLevel = new Level();
                        foreach (Level l in curHier.Levels)
                        {
                            if (l.Name == levelName)
                            {
                                curLevel = l;
                                break;
                            }
                        }
                        curHier.Levels.Clear();
                        curHier.Levels.Add(curLevel);
                        break;
                    }
                }
                dim.Hierarchies.Clear();
                dim.Hierarchies.Add(curHier);
            }
            else
            {
                dim.Hierarchies.Clear();
                Level currentLevel = new Level();
                foreach (Level l in dim.Levels)
                {
                    if (l.Name == levelName)
                    {
                        currentLevel = l;
                        break;
                    }
                }
                dim.Levels.Clear();
                dim.Levels.Add(currentLevel);
            }

            List<Attrib> lstAttrib = Boco.Semantic.EntityDB.DimensionDB.GetAttrib(dim, 60);
            if (dim.DimensionType == "Date")
            {
                lstAttrib.InsertRange(0, GetCurDateAttrib(levelName));
            }
            StringBuilder sb = new StringBuilder();
            sb.Append("<nes>");
            sb.Append(GetAttribsString(lstAttrib));
            sb.Append("</nes>");
            return sb.ToString();
        }

        private string GetAttribsString(List<Attrib> attribList)
        {
            StringBuilder sb = new StringBuilder();
            foreach (Attrib attr in attribList)
            {
                sb.Append("<ne name=\"" + attr.Desc + "\" value=\"" + attr.ID + "\">");
                if (attr.ChildAttribs.Count > 0)
                {
                    sb.Append(GetAttribsString(attr.ChildAttribs));
                }
                sb.Append("</ne>");
            }
            return sb.ToString();
        }

        /// <summary>
        /// 获取“昨天”、“前天”、“同比天”等常用日期
        /// </summary>
        /// <param name="levelName"></param>
        /// <returns></returns>
        private List<Attrib> GetCurDateAttrib(string levelName)
        {
            List<Attrib> attList = new List<Attrib>();
            if (levelName == "日")
            {
                Attrib attYesterday = new Attrib();
                attYesterday.ID = DateTime.Now.AddDays(-1).ToString("yyyyMMdd");
                attYesterday.Desc = attYesterday.Name = "昨天";
                attList.Add(attYesterday);
                Attrib attBeforeYesterday = new Attrib();
                attBeforeYesterday.ID = DateTime.Now.AddDays(-2).ToString("yyyyMMdd");
                attBeforeYesterday.Desc = attBeforeYesterday.Name = "前天";
                attList.Add(attBeforeYesterday);
                Attrib attLastWeek = new Attrib();
                attLastWeek.ID = DateTime.Now.AddDays(-8).ToString("yyyyMMdd");
                attLastWeek.Desc = attLastWeek.Name = "上周同一天";
                attList.Add(attLastWeek);
                Attrib attBeforeMonth = new Attrib();
                attBeforeMonth.ID = DateTime.Now.AddMonths(-1).ToString("yyyyMMdd");
                attBeforeMonth.Desc = attBeforeMonth.Name = "上月同一天";
                attList.Add(attBeforeMonth);
                Attrib attToday = new Attrib();
                attToday.ID = DateTime.Now.ToString("yyyyMMdd");
                attToday.Desc = attToday.Name = "今天";
                attList.Add(attToday);
            }
            else if (levelName == "月")
            {
                Attrib attYesterday = new Attrib();
                attYesterday.ID = DateTime.Now.AddMonths(-1).ToString("yyyyMM");
                attYesterday.Desc = attYesterday.Name = "上月";
                attList.Add(attYesterday);
                Attrib attBeforeYesterday = new Attrib();
                attBeforeYesterday.ID = DateTime.Now.AddMonths(-2).ToString("yyyyMM");
                attBeforeYesterday.Desc = attBeforeYesterday.Name = "上上月";
                attList.Add(attBeforeYesterday);
                Attrib attBeforeMonth = new Attrib();
                attBeforeMonth.ID = DateTime.Now.AddMonths(-1).AddYears(-1).ToString("yyyyMM");
                attBeforeMonth.Desc = attBeforeMonth.Name = "去年同期";
                attList.Add(attBeforeMonth);
                Attrib attToday = new Attrib();
                attToday.ID = DateTime.Now.ToString("yyyyMM");
                attToday.Desc = attToday.Name = "本月";
                attList.Add(attToday);
            }
            else if (levelName == "周")
            {
                Attrib attLastWeek = new Attrib();
                attLastWeek.ID = Boco.CommonToolLibrary.DateTimeHelper.GetNumWeekToYear(DateTime.Now.AddDays(-7)).ToString("00");
                attLastWeek.Desc = attLastWeek.Name = "上周";
                attList.Add(attLastWeek);
                Attrib attBeforeYesterday = new Attrib();
                attBeforeYesterday.ID = Boco.CommonToolLibrary.DateTimeHelper.GetNumWeekToYear(DateTime.Now.AddDays(-18)).ToString("00");
                attBeforeYesterday.Desc = attBeforeYesterday.Name = "上上周";
                attList.Add(attBeforeYesterday);
                Attrib attBeforeMonth = new Attrib();
                attBeforeMonth.ID = Boco.CommonToolLibrary.DateTimeHelper.GetNumWeekToYear(DateTime.Now.AddDays(-7).AddYears(-1)).ToString("00");
                attBeforeMonth.Desc = attBeforeMonth.Name = "去年同期";
                attList.Add(attBeforeMonth);
                Attrib attToday = new Attrib();
                attToday.ID = Boco.CommonToolLibrary.DateTimeHelper.GetNumWeekToYear(DateTime.Now).ToString("00");
                attToday.Desc = attToday.Name = "本周";
                attList.Add(attToday);
            }
            foreach (Attrib att in attList)
            {
                att.LevelName = levelName;
            }
            return attList;
        }

        private void FormatDateLevelVal(Template tmpt)
        {
            foreach (Dimension dim in tmpt.Analyzer.RowDimList)
            {
                dim.Val = FormatLevelVal(dim.Val, dim.LevelName);
                dim.ValList = FormatDateLevelValList(dim.LevelName, dim.ValList);
            }
            foreach (Dimension dim in tmpt.Analyzer.ColDimList)
            {
                dim.Val = FormatLevelVal(dim.Val, dim.LevelName);
                dim.ValList = FormatDateLevelValList(dim.LevelName, dim.ValList);
            }
            foreach (Dimension dim in tmpt.Analyzer.SliceDimList)
            {
                dim.Val = FormatLevelVal(dim.Val, dim.LevelName);
                dim.ValList = FormatDateLevelValList(dim.LevelName, dim.ValList);
            }
        }

        private List<string> FormatDateLevelValList(string levelName, List<string> valList)
        {
            if (valList == null)
            {
                return new List<string>();
            }
            List<string> valueList = new List<string>();
            foreach (string val in valList)
            {
                valueList.Add(FormatLevelVal(val, levelName));
            }
            return valueList;
        }

        /// <summary>
        /// 将昨天、上月等特殊时间转为实际时间，如“今天”转为“yyyy年MM月dd日”
        /// </summary>
        /// <param name="val"></param>
        /// <param name="levelName"></param>
        /// <returns></returns>
        private string FormatLevelVal(string val, string levelName)
        {
            if (string.IsNullOrEmpty(val))
            {
                return "";
            }
            else if (levelName != "日" && levelName != "月" && levelName != "周")
            {
                return val;
            }
            else
            {
                if (levelName == "日")
                {
                    val = val.Replace("昨天", DateTime.Now.AddDays(-1).ToString("yyyy年MM月dd日")).Replace("前天",
                        DateTime.Now.AddDays(-2).ToString("yyyy年MM月dd日")).Replace("上周同一天",
                        DateTime.Now.AddDays(-8).ToString("yyyy年MM月dd日")).Replace("上月同一天",
                        DateTime.Now.AddDays(-1).AddMonths(-1).ToString("yyyy年MM月dd日")).Replace("今天",
                        DateTime.Now.ToString("yyyy年MM月dd日"));
                }
                else if (levelName == "月")
                {
                    val = val.Replace("上上月", DateTime.Now.AddMonths(-2).ToString("yyyy年MM月")).Replace("上月",
                        DateTime.Now.AddMonths(-1).ToString("yyyy年MM月")).Replace("去年同期",
                       DateTime.Now.AddMonths(-1).AddYears(-1).ToString("yyyy年MM月")).Replace("本月",
                       DateTime.Now.ToString("yyyy年MM月"));
                }
                else
                {
                    DateTime lastWeek = DateTime.Now.AddDays(-7);
                    DateTime lastLastWeek = DateTime.Now.AddDays(-14);
                    DateTime tbWeek = DateTime.Now.AddDays(-7).AddYears(-1);
                    val = val.Replace("上上周", lastLastWeek.Year.ToString() + "年" + Boco.CommonToolLibrary.DateTimeHelper.GetNumWeekToYear(lastLastWeek).ToString("00") + "周").Replace("上周",
                        lastWeek.Year.ToString() + "年" + Boco.CommonToolLibrary.DateTimeHelper.GetNumWeekToYear(lastWeek).ToString("00") + "周").Replace("去年同期",
                      tbWeek.Year.ToString() + "年" + Boco.CommonToolLibrary.DateTimeHelper.GetNumWeekToYear(tbWeek).ToString("00") + "周").Replace("本周",
                      DateTime.Now.Year.ToString() + "年" + Boco.CommonToolLibrary.DateTimeHelper.GetNumWeekToYear(DateTime.Now).ToString("00") + "周");
                }
                return val;
            }
        }


        private string AddTemplate(HttpContext context)
        {
            string text = "";
            Template temp = GetPostTemplate();
            bool isExist = TemplateDB.IsExistByTemplateName(temp.FolderID, temp.TemplateName);
            if (isExist)
            {
                return ("<stat value=\"0\"></stat>");//返回0表示模板重名
            }
            else
            {
                try
                {
                    temp.CreateDate = DateTime.Now.ToString();
                    if (temp.IsShare == "1")
                    {
                        temp.FolderID = "-1";
                    }
                    temp.IsShare = "0";
                    TemplateDB.Insert(temp);
                    TemplateDB.SaveTemplateObject(temp);
                    text = "<stat value=\"" + temp.TemplateID + "\"></stat>";
                    return text;
                }
                catch (Exception ex)
                {
                    return text + "<stat value=\"-1\">" + ex.Message + "</stat>"; //增加失败
                }
            }
        }

        /// <summary>
        /// 3月8日为处理多层次crossjoin出错，重装方法，取数据时不带层次属性，丁健
        /// </summary>
        /// <param name="context"></param>
        /// <param name="lstDimension"></param>
        /// <param name="lstMeasure"></param>
        /// <returns></returns>
        private Template GetPostTemplate()
        {
            HttpContext context = HttpContext.Current;
            Template tmplt = new JavaScriptSerializer().Deserialize<Template>(context.Request["tmp"]);
            if (tmplt.GridSetting != null)
            {
                tmplt.Analyzer.ShowUintInColumn = tmplt.GridSetting.ShowUnit;
            }
            //FormatDateLevelVal(tmplt);
            return tmplt;
        }

        #region 运行报表

        /// <summary>
        /// 获取模板运行数据
        /// </summary>
        /// <param name="tmplt">模板</param>
        /// <returns></returns>
        private DataTable GetResult(Template tmplt, out List<string> sqlList, out bool hasPaged)
        {
            sqlList = new List<string>();
            foreach (QuerySentence qs in tmplt.Analyzer.GetQuerySentence())
            {
                sqlList.Add(qs.Sql);
            }
            if (tmplt.Analyzer.PageSetting.PageSize > 0)
            {
                hasPaged = true;
            }
            else
            {
                hasPaged = false;
            }
            DataTable dt = tmplt.Analyzer.GetData();
            return dt;
        }

        /// <summary>
        /// 查询小区数据时如果没有BSC或MSC条件限制
        /// </summary>
        /// <param name="ao"></param>
        private void SetAnalyzerSortSetting(Analyzer analyzer)
        {
            string sortcol = HttpContext.Current.Request["sortcol"];
            string sort = HttpContext.Current.Request["sortorder"];
            if (!string.IsNullOrEmpty(sortcol))
            {
                analyzer.SortSetting.SortColIndex = int.Parse(sortcol) - 1;
                if (sort == "asc")
                {
                    analyzer.SortSetting.SortDirection = SortDirection.Asc;
                }
                else
                {
                    analyzer.SortSetting.SortDirection = SortDirection.Desc;
                }
            }
        }

        private void SetAnalysisPage(Analyzer analyzer)
        {
            string page = HttpContext.Current.Request["page"];
            string pagesize = HttpContext.Current.Request["pagesize"];

            if (!string.IsNullOrEmpty(page))
            {
                analyzer.PageSetting.Page = int.Parse(page) - 1;
            }
            if (!string.IsNullOrEmpty(pagesize))
            {
                analyzer.PageSetting.PageSize = int.Parse(pagesize);
            }
        }

        #endregion

        private string GetRegionRightGranted()
        {
            List<Boco.Dss.Config.DataRoleItem> driList = Boco.Dss.Framework.Tool.Env.User.DataRole.ItemList;
            foreach (DataRoleItem dri in driList)
            {
                if (dri.MemberList.Count > 0)
                {
                    if (dri.LevelName == "地区"||dri.LevelName == "地市")
                    {
                        string s = "";
                        dri.MemberList.ForEach(p => s += p.MemberDesc+",");
                        s = s.TrimEnd(',');
                        return s;
                    }

                }
            }
            return "";
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