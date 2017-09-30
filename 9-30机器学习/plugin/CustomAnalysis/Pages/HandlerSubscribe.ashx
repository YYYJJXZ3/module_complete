<%@ WebHandler Language="C#" Class="Boco.Dss.CustomAnalysis.Web.HandlerSubscribe" %>

using System;
using System.IO;
using System.Web;

namespace Boco.Dss.CustomAnalysis.Web
{
    public class HandlerSubscribe : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string userID = context.Request["userid"];
            if (!string.IsNullOrEmpty(userID))
            {
                string hasNewFile = HasNewFile(userID);
                context.Response.Write(hasNewFile);
            }
            else
            {
                context.Response.Write("0");
            }

        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }


        private string HasNewFile(string userID)
        {
            string fileName = HttpContext.Current.Server.MapPath("../Csv/" + userID + "/HasNewFile.txt");
            if (!System.IO.File.Exists(fileName))
            {
                return "0";
            }
            else
            {
                string s = string.Empty;
                using (StreamReader sr = new StreamReader(fileName))
                {
                    s = sr.ReadToEnd();
                }
                if (s == "1")
                {
                    return "1";
                }
                else
                {
                    return "0";
                }
            }
        }

    }
}