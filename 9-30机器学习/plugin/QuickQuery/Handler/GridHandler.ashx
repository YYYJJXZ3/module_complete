<%@ WebHandler Language="C#" Class="Boco.Dss.Web.QuickQuery.GridHandler" %>

using System;
using System.Collections.Generic;
using System.Data;
using System.Web;
using Boco.Dss.Web;
using Boco.Dss.Web.JsHandlers;
using Boco.Dss.Config;
using Boco.QueryEngine;
using Boco.Semantic.Entity;
using Boco.Semantic.EntityDB;
using System.Web.Script.Serialization;

namespace Boco.Dss.Web.QuickQuery
{
    public class GridHandler : Boco.Dss.Web.JsHandlers.JqGridAnalyzer
    {

        public override int GetCount(SmartGridOption option)
        {
            JavaScriptSerializer jss = new JavaScriptSerializer();
            Analyzer analyzer = jss.Deserialize<Analyzer>(option.Param1);
            AddNeFilterFormDataRole(analyzer);
            option.Param1 = jss.Serialize(analyzer);
            return base.GetCount(option);
        }

        public override DataTable GetData(SmartGridOption option)
        {
            option.SortColIndex --;
            option.SecondSortColIndex --;
            JavaScriptSerializer jss = new JavaScriptSerializer();
            Analyzer analyzer = jss.Deserialize<Analyzer>(option.Param1);
            AddNeFilterFormDataRole(analyzer);
            option.Param1 = jss.Serialize(analyzer);
            DataTable dt = base.GetData(option);
            dt.Columns.Add("趋势");
            dt.Columns[dt.Columns.Count - 1].SetOrdinal(0);
            return dt;
        }

        private void AddNeFilterFormDataRole(Analyzer ana)
        {
            List<DataRoleItem> driList = Boco.Dss.Framework.UserOnLine.CurrentUser.DataRole.ItemList;
            if (driList.Count == 0)
            {
                return;
            }
            foreach (DataRoleItem dri in driList)
            {
                if (dri.MemberList.Count > 0)
                {
                    List<Dimension> dimList = new List<Dimension>();
                    dimList.AddRange(ana.RowDimList);
                    dimList.AddRange(ana.SliceDimList);
                    List<string> valList = new List<string>();
                    dri.MemberList.ForEach(p => valList.Add(p.MemberDesc));
                    Dimension dim = dimList.Find(p => p.LevelName == dri.LevelName);
                    if (dim != null)
                    {
                        if (dim.ValType == ValType.Equal)
                        {
                            if (string.IsNullOrEmpty(dim.Val) || !valList.Contains(dim.Val))
                            {
                                dim.ValType = ValType.In;
                                dim.ValList = valList;
                            }
                        }
                        else if(dim.ValType == ValType.In)
                        {
                            if (dim.ValList==null||dim.ValList.Count == 0)
                            {
                                dim.ValList = valList;
                            }
                            else
                            {
                                for (int i = dim.ValList.Count - 1; i > -1; i--)
                                {
                                    if (!valList.Contains(dim.ValList[i]))
                                    {
                                        dim.ValList.RemoveAt(i);
                                    }
                                }
                            }
                        }
                    }
                    else
                    {
                        Sem_Measure sm = MeasureDB.GetMeasureByID(ana.MeasureList[0].MeasureID);
                        Level lvl = GetLevelByName(sm.RelatedDimensionList, dri.LevelName);
                        if (lvl != null)
                        {
                            Dimension dd = new Dimension()
                            {
                                LevelName = dri.LevelName,
                                ValType = ValType.In,
                                ValList = valList
                            };
                            ana.SliceDimList.Add(dd);
                        }
                    }
                }
            }
        }

        private Level GetLevelByName(List<Sem_Dimension> sdList, string levelName)
        {
            foreach (Sem_Dimension sd in sdList)
            {
                foreach (Level l in sd.Levels)
                {
                    if (l.Name == levelName)
                    {
                        return l;
                    }
                }
            }
            return null;
        }

    }
}