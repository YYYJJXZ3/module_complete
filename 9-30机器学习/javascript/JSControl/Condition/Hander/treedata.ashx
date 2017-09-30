<%@ WebHandler Language="C#" Class="treedata" %>

using System;
using System.Web;
using System.Data;
using System.Text;
using Boco.Semantic.Entity;
using System.Collections.Generic;
using System.Web.SessionState;
using System.Web.Script.Serialization;

public class treedata : Boco.Dss.Framework.HttpHandlerBase
{
    public override void Process(HttpContext context)
    {
        string dimensionID = context.Request["dimid"];
        string hier = context.Request["hirename"];
        string levelname = context.Request["levelname"];
        string name = context.Request["name"];
        string keyword = context.Request["keyword"];
        List<Boco.Dss.Tree.TreeNode> list = new List<Boco.Dss.Tree.TreeNode>();
        if (!string.IsNullOrEmpty(keyword))
        {
            List<string> _list;
            DataTable dt = GetTableByKey(dimensionID, hier, keyword, out _list);
            list = GetList(dt, _list, dimensionID);
        }
        else
        {
            string _levelname;
            bool _isparent;
            DataTable dt = GetTable(dimensionID, hier, "未知", out _levelname, out _isparent, levelname, name);
            list = GetList(dt, _levelname, _isparent, dimensionID, hier);
        }
        JavaScriptSerializer jss = new JavaScriptSerializer();
        context.Response.Write(jss.Serialize(list));
    }
    private List<Boco.Dss.Tree.TreeNode> GetList(DataTable dt, List<string> _list, string dimid)
    {
        List<Boco.Dss.Tree.TreeNode> list = new List<Boco.Dss.Tree.TreeNode>();
        if (dt != null)
        {
            int j;
            for (j = 0; j < dt.Columns.Count; j = j + 2)
            {
                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    Boco.Dss.Tree.TreeNode _node = list.Find(p => p.id == dt.Rows[i][j].ToString());
                    if (_node == null)
                    {
                        Boco.Dss.Tree.TreeNode node = new Boco.Dss.Tree.TreeNode();
                        node.id = dt.Rows[i][j].ToString();
                        node.name = dt.Rows[i][j + 1].ToString();
                        if (j > 1)
                        {
                            node.pId = dt.Rows[i][j - 2].ToString();
                        }
                        else
                        {
                            node.pId = "-1";
                        }
                        node.dimid = dimid;
                        node.levelname = _list.Count > j / 2 ? _list[j / 2] : "";
                        node.isParent = j + 2 == dt.Columns.Count ? "false" : "true";
                        list.Add(node);
                    }
                }
            }
        }
        return list;
    }
    private List<Boco.Dss.Tree.TreeNode> GetList(DataTable dt, string levelname, bool isparent, string dimid, string hireName)
    {
        List<Boco.Dss.Tree.TreeNode> list = new List<Boco.Dss.Tree.TreeNode>();
        if (dt != null)
        {
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                Boco.Dss.Tree.TreeNode node = new Boco.Dss.Tree.TreeNode();
                node.id = dt.Rows[i][0].ToString();
                node.name = dt.Rows[i][1].ToString();
                node.pId = "-1";
                node.levelname = levelname;
                node.isParent = isparent.ToString();
                node.dimid = dimid;
                node.hirename = hireName;
                list.Add(node);
            }
        }
        return list;
    }
    private DataTable GetTable(string dimensionID, string hierName, string condition, out string _levelname, out bool _isparent, string levelName, string name)
    {
        DataTable dt = new DataTable();
        _levelname = "";
        _isparent = false;
        int pagesize = 300;
        if (string.IsNullOrEmpty(dimensionID))
        {
            return new DataTable();
        }
        Sem_Dimension dim = new Sem_Dimension();
        dim = Boco.Semantic.EntityDB.DimensionDB.GetDimensionByID(dimensionID);
        if (dim == null)
        {
            return dt;
        }
        Hierarchie hire = dim.Hierarchies.Find(p => p.Desc == hierName);
        if (hire == null)
        {
            return dt;
        }
        Level currentLevel = hire.Levels[0];
        if (!string.IsNullOrEmpty(levelName))
        {
            for (int i = 0; i < hire.Levels.Count; i++)
            {
                if (hire.Levels[i].Desc == levelName)
                {
                    if (hire.Levels.Count > i + 1)
                    {
                        currentLevel = hire.Levels[i + 1];
                        _levelname = currentLevel.Desc;
                        if (i < hire.Levels.Count - 2)
                        {
                            _isparent = true;
                        }
                        else
                        {
                            _isparent = false;
                            pagesize = 50;
                        }
                        break;
                    }
                }
            }
        }
        else
        {
            if (hire.Levels.Count > 0)
            {
                currentLevel = hire.Levels[0];
                _levelname = currentLevel.Desc;
                _isparent = hire.Levels.Count > 1 ? true : false;
                pagesize = hire.Levels.Count > 1 ? 300 : 50;
            }
            else
            {
                return dt;
            }
        }
        List<Level> filter = GetLevel(hire, levelName, name);
        if (currentLevel == null)
        {
            return dt;
        }
        if (!string.IsNullOrEmpty(condition))
        {
            currentLevel.ValType = "NotIn";
            currentLevel.Val = condition;
            filter.Add(currentLevel);
        }
        dt = Boco.Semantic.EntityDB.DimensionDB.GetDimensionAttributeMember(dim, new List<string>() { currentLevel.Desc }, filter, 0, pagesize, true);
        return dt;
    }
    private DataTable GetTableByKey(string dimid, string hirename, string keyword, out List<string> _list)
    {
        DataTable dt = new DataTable();

        Sem_Dimension dim = new Sem_Dimension();
        dim = Boco.Semantic.EntityDB.DimensionDB.GetDimensionByID(dimid);
        _list = new List<string>();
        if (dim == null)
        {
            return dt;
        }
        Hierarchie hire = dim.Hierarchies.Find(p => p.Desc == hirename);
        if (hire == null)
        {
            return dt;
        }
        List<Level> filter = new List<Level>();
        List<string> listStr = new List<string>();
        if (hire.Levels.Count > 0)
        {
            for (int i = 0; i < hire.Levels.Count; i++)
            {
                _list.Add(hire.Levels[i].Desc);
                listStr.Add(hire.Levels[i].Desc);
                if (i == hire.Levels.Count - 1)
                {
                    Level l = hire.Levels[i];
                    l.Val = keyword;
                    l.ValType = "Contain";
                    filter.Add(l);
                }
            }
        }
        dt = Boco.Semantic.EntityDB.DimensionDB.GetDimensionAttributeMember(dim, listStr, filter, 0, 300, true);
        return dt;
    }
    private DataTable GetTableByKey(string dimensionID, string hierName, string condition, out string _levelname, out bool _isparent, string levelName, string name)
    {
        DataTable dt = new DataTable();
        _levelname = "";
        _isparent = false;
        if (string.IsNullOrEmpty(dimensionID))
        {
            return new DataTable();
        }
        Sem_Dimension dim = new Sem_Dimension();
        dim = Boco.Semantic.EntityDB.DimensionDB.GetDimensionByID(dimensionID);
        if (dim == null)
        {
            return dt;
        }
        Hierarchie hire = dim.Hierarchies.Find(p => p.Desc == hierName);
        if (hire == null)
        {
            return dt;
        }
        Level currentLevel = hire.Levels[0];
        if (!string.IsNullOrEmpty(levelName))
        {
            for (int i = 0; i < hire.Levels.Count; i++)
            {
                if (hire.Levels[i].Desc == levelName)
                {
                    if (hire.Levels.Count > i + 1)
                    {
                        currentLevel = hire.Levels[i + 1];
                        _levelname = currentLevel.Desc;
                        if (i < hire.Levels.Count - 2)
                        {
                            _isparent = true;
                        }
                        else
                        {
                            _isparent = false;
                        }
                        break;
                    }
                }
            }
        }
        else
        {
            if (hire.Levels.Count > 0)
            {
                currentLevel = hire.Levels[0];
                _levelname = currentLevel.Desc;
                _isparent = hire.Levels.Count > 1 ? true : false;
            }
            else
            {
                return dt;
            }
        }
        List<Level> filter = GetLevel(hire, levelName, name);
        if (currentLevel == null)
        {
            return dt;
        }
        if (!string.IsNullOrEmpty(condition))
        {
            currentLevel.ValType = "NotIn";
            currentLevel.Val = condition;
            filter.Add(currentLevel);
        }
        dt = Boco.Semantic.EntityDB.DimensionDB.GetDimensionAttributeMember(dim, new List<string>() { currentLevel.Desc }, filter, 0, 300, true);
        return dt;
    }
    private List<Level> GetLevel(Hierarchie hire, string levelname, string name)
    {
        List<Level> list = new List<Level>();
        Level l = hire.Levels.Find(p => p.Desc == levelname);
        if (l != null)
        {
            l.Val = name;
            l.ValType = "Equal";
            list.Add(l);
        }
        return list;
    }
}

namespace Boco.Dss.Tree
{
    public class TreeNode
    {

        public string id
        {
            get;
            set;
        }
        public string name
        {
            get;
            set;
        }
        public string pId
        {
            get;
            set;
        }
        public string levelname
        {
            get;
            set;
        }
        public string isParent
        {
            get;
            set;
        }
        public string dimid
        {
            get;
            set;
        }
        public string hirename
        {
            get;
            set;
        }
    }
}