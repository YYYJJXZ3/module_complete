<%@ WebHandler Language="C#" Class="GridData" %>

using System;
using System.Web;

using System.Data;
using System.Text;

public class GridData : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        
        //write your handler implementation here.
        context.Response.ContentType = "text/plain";
        context.Response.Buffer = true;
        context.Response.ExpiresAbsolute = DateTime.Now.AddDays(-1);
        context.Response.AddHeader("pragma", "no-cache");
        context.Response.AddHeader("cache-control", "");
        context.Response.CacheControl = "no-cache";

        string sqlstr = context.Request["sql"];
        string connstr = context.Request["conn"];
        string pageNum = context.Request["pageNum"];
        string jsonData = "{\"page\": \"1\",\"total\": \"2\",\"records\": \"6\",\"rows\": [{ \"id\": \"1\", \"name\": \"xxxx1\", \"addr\": \"xxxx\", \"a\": \"v\" },{ \"id\": \"2\", \"name\": \"xxxx2\", \"addr\": \"xxxx\", \"a\": \"q\" },{ \"id\": \"3\", \"name\": \"xxxx1\", \"addr\": \"xxxx\", \"a\": \"z\" },{ \"id\": \"4\", \"name\": \"xxxx2\", \"addr\": \"xxxx\", \"a\": \"d\" },{ \"id\": \"5\", \"name\": \"xxxx1\", \"addr\": \"xxxx\", \"a\": \"r\" },{ \"id\": \"6\", \"name\": \"xxxx2\", \"addr\": \"xxxx\", \"a\": \"qw\" }]}";
        context.Response.Write(jsonData);//返回json数据
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }
}