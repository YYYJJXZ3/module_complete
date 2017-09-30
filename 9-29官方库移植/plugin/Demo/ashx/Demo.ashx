<%@ WebHandler Language="C#" Class="Demo" %>

using System;
using System.Web;
using System.Web.Script.Serialization;
using Boco.Dss.Demo;

public class Demo : Boco.Dss.Framework.HttpHandlerBase
{
    public override void Process(HttpContext context)
    {
        string strCon = context.Request["strCon"];
        ConModel model = new ConModel();
        JavaScriptSerializer jss = new JavaScriptSerializer();
        model = jss.Deserialize<ConModel>(strCon);

        string json = "";

        if (model.Type == "executeSql")
        {
            json = CommonHelp.Execute(model);
        }
        else if (model.Type == "getThreshold")
        {
            json = Common.GetThreshold(model);
        }
        else
        {
            json = Common.GetSource(model);
        }

        context.Response.Write(json);
    }

    protected override bool NeedLogin
    {
        get
        {
            return false;
        }
    }
}