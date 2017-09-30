<%@ WebHandler Language="C#" Class="Task" %>

using System;
using System.Web;
using System.Data;
using System.Web.Script.Serialization;

public class Task : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        string qType = context.Request["qtype"];
        if (qType == "save")
        {
            string taskStr = context.Request["task"];
            Task1 t = new JavaScriptSerializer().Deserialize<Task1>(taskStr);
            context.Response.Write(t.Insert() == 0 ? "派单成功" : "派单失败");
        }
        else if (qType == "dept") {
            string sql = "select t.dept_id,t.dept_desc  from sys_ip_dept t order by t.order_index asc";
            DataTable dt = Boco.Dss.Data.DbHelper.GetDataBySql(sql, System.Configuration.ConfigurationManager.ConnectionStrings["SQL_ConnStr"]);
            string optstr = "";
            foreach (DataRow row in dt.Rows)
            {
                optstr += "<option value=\"" + row[0].ToString() + "\" >" + row[1].ToString() + "</option>";
            }
            context.Response.Write(optstr);
        }
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

    public class Task1
    {
        public string systemName { get; set; }
        public string status { get; set; }
        public string title { get; set; }
        public string content { get; set; }
        public string networktype { get; set; }
        public string alarmEvent { get; set; }
        public string eventTime { get; set; }
        public string interfaceType { get; set; }
        public string neType { get; set; }
        public string neLabel { get; set; }
        public string region { get; set; }
        public string is_success { get; set; }
        public string is_execute { get; set; }
        public string levels { get; set; }
        public string create_time { get; set; }
        public string acceptTime { get; set; }
        public string comepeteTime { get; set; }
        public string dept { get; set; }
        //is_success: "0",
        //is_execute: "0",
        //levels: "1",
        //create_time:""
        public int Insert()
        {
            Boco.DssPortal.WorkFlow.Entity.WorkOrder worker = new Boco.DssPortal.WorkFlow.Entity.WorkOrder();
          
            worker.TaskTitle = title;
            worker.SystemName = systemName;
            worker.TaskStatus = "0";
            worker.IsExecute = "0";
            worker.IsSuccess = "0";
            int iLevel = 2;
            if (int.TryParse(levels, out iLevel))
            {
                if (iLevel < 0 || iLevel > 5)
                {
                    iLevel = 2;
                }
                worker.Levels = iLevel.ToString();
            }
            else {
                worker.Levels = "2";
            }
            worker.NetworkType = networktype;
            worker.AlertEvent = alarmEvent;
            worker.InterfaceType = interfaceType;
            worker.NeType = neType;
            worker.NeLavel = neLabel;
            worker.Region = region;
            worker.TaskContent = content.Replace("<br/>", "\r\n").Replace("<br>", "\r\n").Replace("<BR>", "\r\n");
            worker.UrgentGrade = "2";
            worker.EventTime = eventTime;
            worker.ExecuteTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            worker.TaskType = "1";
            worker.PlanAcceptTime = DateTime.Parse(acceptTime.Replace("年","-").Replace("月","-").Replace("日"," ").Replace("时","")+":00:00");
            worker.PlanCompleteTime = DateTime.Parse(comepeteTime.Replace("年", "-").Replace("月", "-").Replace("日", " ").Replace("时", "") + ":00:00");
            worker.DeptId = dept;
            Boco.Dss.ServiceManager.Entity.Result r = Boco.Dss.ServiceManager.Common.CommonHelp.Insert(worker.ToList());
            return r.Key;
        }

    }

}