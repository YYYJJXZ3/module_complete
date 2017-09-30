<%@ WebHandler Language="C#" Class="SiteMap" %>

using System;
using System.Collections.Generic;
using System.Web;
using System.Web.SessionState;
using Boco.Dss.Framework;

public class SiteMap : HttpHandlerBase
{
    public override void Process(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        string listID = context.Request.QueryString["listid"];
        string s = "";
        if (!string.IsNullOrEmpty(listID) && listID != "undefined")
        {
            if (this.CurrentUser != null)
            {
                s = GetNamePath(this.CurrentUser.Role.MenuItemList, listID);
            }
        }
        context.Response.Write(s.Replace(">>", " >> "));
    }

    private string GetNamePath(List<Boco.Dss.Config.MenuItem> list, string listid)
    {
        for (int i = 0; i < list.Count; i++)
        {
            if (list[i].ID == listid)
            {

                return list[i].NamePath;
            }
            if (list[i].ChildList.Count > 0)
            {
                string _strtm = GetNamePath(list[i].ChildList, listid);
                if (_strtm.Length > 0)
                {
                    return _strtm;
                }
            }
        }
        return "";
    }
}