<%@ WebHandler Language="C#" Class="InitOperation" %>

using System;
using System.Web;
using Boco.Dss.Framework;
using System.Text;
using System.Collections.Generic;
using Boco.Dss.CustomAnalysis.Entity;
using Boco.Dss.CustomAnalysis.EntityDB;
using Boco.QueryEngine;
using Boco.DssPortal.WorkFlow.Alarm.Entity;
using System.Data;
using System.Web.Script.Serialization;


public class InitOperation : HttpHandlerBase
{
    protected override bool NeedLogin
    {
        get
        {
            return false;
        }
    }
    public override void Process(HttpContext context)
    {
        string act = context.Request["act"];
        if (act == "getthemes")
        {
            GetNode(context);
        }
        else if (act == "gettemplate")
        {
            GetTemplate(context);
        }
        else if (act == "save")
        {
            Save(context);
        }
        else if (act == "delete")
        {
            Delete(context);
        }
    }
    void Delete(HttpContext context)
    {
        string content = context.Request["contents"];
        int flag = 1;
        if (!string.IsNullOrEmpty(content))
        {
            flag = Boco.DssPortal.WorkFlow.Alarm.EntityDb.RuleOperation.Delete(content);
        }
        context.Response.Write(flag.ToJson());
    }
    void Save(HttpContext context)
    {
        string content = context.Request["contents"];
        JavaScriptSerializer jss = new JavaScriptSerializer();

        Boco.DssPortal.WorkFlow.Alarm.Entity.Rule rule = jss.Deserialize<Boco.DssPortal.WorkFlow.Alarm.Entity.Rule>(content);
        int flag;
        if (string.IsNullOrEmpty(rule.ID))
        {
            flag = Boco.DssPortal.WorkFlow.Alarm.EntityDb.RuleOperation.Insert(rule);
        }
        else
        {
            flag = Boco.DssPortal.WorkFlow.Alarm.EntityDb.RuleOperation.Update(rule);
        }
        context.Response.Write(flag.ToJson());
    }
    void GetTemplate(HttpContext context)
    {
        string id = context.Request["id"];
        int _id = 0;
        int.TryParse(id, out _id);

        Template list = TemplateDB.GetTemplateByID(_id);
        Analyzer an;
        if (list == null)
        {
            list = new Template();
            an = new Analyzer();
        }
        else
        {
            an = list.Analyzer;
        }
        context.Response.Write(an.ToJson());
    }
    void GetNode(HttpContext context)
    {
        string id = context.Request["id"];
        ReturnNode rn = new ReturnNode();
        rn.Tree = GetThemes();

        if (!string.IsNullOrEmpty(id))
        {
            Boco.DssPortal.WorkFlow.Alarm.Entity.Rule r = Boco.DssPortal.WorkFlow.Alarm.EntityDb.RuleOperation.GetRuleById(id);

            if (r != null)
            {
                Template list = TemplateDB.GetTemplateByID(r.TemplateID);
                if (list != null)
                {
                    rn.analyzer = list.Analyzer;
                }
                rn.rulenode = r;
            }
        }
        context.Response.Write(rn.ToJson());
    }
    List<Dictionary<string, object>> GetThemes()
    {
        StringBuilder str = new StringBuilder();
        str.Append("{ \"id\": -1, \"pId\": 0, \"name\": \"自定义报表数据\", \"isParent\": true, \"open\": true },");
        string userid = "1394";
        if (this.CurrentUser != null)
        {
            userid = this.CurrentUser.UserID;
        }
        List<Dictionary<string, object>> list = new List<Dictionary<string, object>>();
        Dictionary<string, object> dpict = new Dictionary<string, object>();
        dpict.Add("id", -1);
        dpict.Add("name", "自定义报表数据");
        dpict.Add("pId", 0);
        dpict.Add("open", true);
        dpict.Add("isParent", true);

        list.Add(dpict);
        List<TempPath> folderList = TempPathDB.GetTempPathByUserID(userid);
        foreach (var item in folderList)
        {
            Dictionary<string, object> dict = new Dictionary<string, object>();
            dict.Add("id", item.FolderID);
            dict.Add("name", item.FolderDesc);

            dict.Add("pId", item.ParentID);
            dict.Add("isParent", true);
            list.Add(dict);
        }
        List<Template> Templates = TemplateDB.GetTemplateNameListByUserID(userid, "");
        for (int i = 0; i < Templates.Count; i++)
        {

            Dictionary<string, object> dict = new Dictionary<string, object>();
            dict.Add("id", Templates[i].TemplateID);
            dict.Add("name", Templates[i].TemplateName);

            dict.Add("pId", Templates[i].FolderID);
            dict.Add("isParent", false);
            list.Add(dict);
        }

        return list;
    }

    class ReturnNode
    {
        public List<Dictionary<string, object>> Tree { get; set; }
        public Analyzer analyzer { get; set; }
        public Boco.DssPortal.WorkFlow.Alarm.Entity.Rule rulenode { get; set; }
        public List<NodeSys> SystemNameList
        {
            get
            {
                string sql = "select t.key,t.name from sys_ip_systemname t order by orderby";
                DataTable dt = Boco.DssPortal.WorkFlow.Alarm.EntityDb.RuleOperation.GetDataSetBySql(sql);
                List<NodeSys> list = new List<NodeSys>();
                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    list.Add(new NodeSys()
                    {
                        id = dt.Rows[i][0].ToString(),
                        name = dt.Rows[i][1].ToString()
                    });
                }
                return list;
            }
        }
        public List<NodeSys> DepNameList
        {
            get
            {
                string sql = "select dept_id,dept_desc from sys_ip_dept t order by order_index";
                DataTable dt = Boco.DssPortal.WorkFlow.Alarm.EntityDb.RuleOperation.GetDataSetBySql(sql);
                List<NodeSys> list = new List<NodeSys>();
                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    list.Add(new NodeSys()
                    {
                        id = dt.Rows[i][0].ToString(),
                        name = dt.Rows[i][1].ToString()
                    });
                }
                return list;
            }
        }
    }
    class NodeSys
    {
        public string id { get; set; }
        public string name { get; set; }
    }

}
