<%@ WebHandler Language="C#" Class="ComHandler" %>

using System;
using System.Web;
using System.Web.Script.Serialization;
using Boco.Dss.Demo;

public class ComHandler : Boco.Dss.Framework.HttpHandlerBase
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
        else if (model.Type == "decrypt")
        {
            json = CommonHelp.Decrypt(model.Property1);
        }
        else if (model.Type == "encrypt")
        {
            json = CommonHelp.Encrypt(model.Property1);
        }
        else if (model.Type == "getAnalyzerSql")
        {
            json = CommonHelp.GetAnalyzerSql(model);
        }
        else if (model.Type == "getCRC32")
        {
            json = CommonHelp.GetCRC32(model.Property1);
        }
        else if (model.Type == "setCache")
        {
            json = CommonHelp.SetCache(model.Property1);
        }
        else if (model.Type == "getCache")
        {
            json = CommonHelp.GetCache(model.Property1);
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