<%@ WebHandler Language="C#" Class="WebServiceQuery" %>

using System;
using System.Web;
using Boco.Dss.Web.JsHandlers;
using System.Data;
using System.Collections.Generic;
using System.Collections;
using System.Web.Script.Serialization;

public class WebServiceQuery : Boco.Dss.Web.JsHandlers.SmartGridHandler
{
    public override DataTable GetData(SmartGridOption option)
    {
        DataTable dt = new DataTable();
        string[] titleNames = { "省份", "地市", "开始时间", "结束时间", "一级业务", "二级业务", "业务时长(ms)", "总流量（byte）", "上行流量（byte）", "下行流量（byte）" };
        for (int i = 0; i < titleNames.Length; i++)
        {
            dt.Columns.Add(titleNames[i]);
        }

        if (!string.IsNullOrEmpty(option.Param1) && option.Param1 != "1")
        {
            JavaScriptSerializer jss = new JavaScriptSerializer();
            Dictionary<string, string> dict = jss.Deserialize<Dictionary<string, string>>(option.Param1);
            string url = System.Configuration.ConfigurationManager.AppSettings["WS_Demo_BJ_Log"],
                   methodName = "WebServiceQuery",
                   startTime = dict.ContainsKey("startTime") ? dict["startTime"] : "",
                   endTime = dict.ContainsKey("endTime") ? dict["endTime"] : "",
                   MSISDN = dict.ContainsKey("MSISDN") && dict["MSISDN"].Length > 0 ? dict["MSISDN"] : "13393038570",
                   interfaceType = dict.ContainsKey("interfaceType") ? dict["interfaceType"] : "";

            Hashtable ht = new Hashtable();
            ht.Add("arg0", "O_RE_ST_XDR_PS_S1U_HTTP_DETAIL");
            ht.Add("arg1", MSISDN);
            ht.Add("arg2", startTime);
            ht.Add("arg3", endTime);
            ht.Add("arg4", interfaceType);
            ht.Add("arg5", option.PageSize);
            ht.Add("arg6", option.PageIndex);

            System.Xml.XmlDocument XmlNodeList = Boco.CommonToolLibrary.Other.soapHelper.QuerySoapWebService(url, methodName, ht, null);

            if (XmlNodeList.ChildNodes.Count > 1)
            {
                for (int i = 0; i < XmlNodeList.ChildNodes[1].ChildNodes.Count; i++)
                {
                    if (i == 0)
                    {
                        int _page = 0;
                        int.TryParse(XmlNodeList.ChildNodes[1].ChildNodes[i].InnerText, out _page);
                        option.TotalCount = _page;
                    }
                    else
                    {
                        string[] con = XmlNodeList.ChildNodes[1].ChildNodes[i].InnerText.Split('|');
                        DataRow dr = dt.NewRow();
                        for (int j = 0; j < con.Length; j++)
                        {
                            if (j < dt.Columns.Count)
                            {
                                dr[j] = con[j];
                            }
                        }
                        dt.Rows.Add(dr);
                    }
                }
            }
        }
        else
        {
            option.TotalCount = 0;
        }

        option.IsTotal = 0;

        return dt;
    }
}