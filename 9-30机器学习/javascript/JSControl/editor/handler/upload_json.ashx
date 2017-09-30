<%@ WebHandler Language="C#" Class="Upload" %>

/**
 * KindEditor ASP.NET
 *
 * 本ASP.NET程序是演示程序，建议不要直接在实际项目中使用。
 * 如果您确定直接使用本程序，使用之前请仔细确认相关安全设置。
 *
 */

using System;
using System.Collections;
using System.Web;
using System.IO;
using System.Globalization;
using Boco.Dss.Framework;

public class Upload : HttpHandlerBase
{

    private void showError(string message)
    {
        Hashtable hash = new Hashtable();
        hash["error"] = 1;
        hash["message"] = message;
        HttpContext.Current.Response.Write(hash.ToJson(HandlerStatus.OK));
    }
    public override void Process(HttpContext context)
    {
        //定义允许上传的文件扩展名
        Hashtable extTable = new Hashtable();
        extTable.Add("image", "gif,jpg,jpeg,png,bmp");
        extTable.Add("flash", "swf,flv");
        extTable.Add("media", "swf,flv,mp3,wav,wma,wmv,mid,avi,mpg,asf,rm,rmvb");
        extTable.Add("file", "doc,docx,xls,xlsx,ppt,htm,html,txt,zip,rar,gz,bz2");

        //最大文件大小
        int maxSize = 1000000;

        HttpPostedFile imgFile = context.Request.Files["imgFile"];
        if (imgFile == null)
        {
            showError("请选择文件。");
        }
        String dirName = context.Request.QueryString["dir"];
        if (String.IsNullOrEmpty(dirName))
        {
            dirName = "image";
        }
        if (!extTable.ContainsKey(dirName))
        {
            showError("目录名不正确。");
        }

        String fileName = imgFile.FileName;
        String fileExt = Path.GetExtension(fileName).ToLower();

        if (imgFile.InputStream == null || imgFile.InputStream.Length > maxSize)
        {
            showError("上传文件大小超过限制。");
        }

        if (String.IsNullOrEmpty(fileExt) || Array.IndexOf(((String)extTable[dirName]).Split(','), fileExt.Substring(1).ToLower()) == -1)
        {
            showError("上传文件扩展名是不允许的扩展名。\n只允许" + ((String)extTable[dirName]) + "格式。");
        }
        string path = "~/Files/";
        var defaultPath = System.Configuration.ConfigurationManager.AppSettings[""];
        if (!string.IsNullOrEmpty(defaultPath))
        {
            path = defaultPath;
        }
        CreateDirectory(path);
        path += "attached/";
        CreateDirectory(path);
        if (this.CurrentUser == null)
        {
            path += "default/";
        }
        else
        {
            path += this.CurrentUser.LoginName + "/";
        }
        CreateDirectory(path);
        //创建文件夹


        string newFileName = DateTime.Now.ToString("yyyyMMddHHmmss_ffff", DateTimeFormatInfo.InvariantInfo) + fileExt;
        string filePath = HttpContext.Current.Server.MapPath(path) + newFileName;

        imgFile.SaveAs(filePath);

        string fileUrl = GetCurrentFullHost(path) + newFileName;

        Hashtable hash = new Hashtable();
        hash["error"] = 0;
        hash["url"] = fileUrl;
        context.Response.Write(hash.ToJson(HandlerStatus.OK));
    }
    private static string GetCurrentFullHost(string url)
    {
        string path = HttpContext.Current.Request.Url.OriginalString;
        string name = HttpContext.Current.Request.ApplicationPath;
        path = path.Substring(0, path.IndexOf(name) + name.Length);
        path = path.TrimEnd('/') + "/";
        if (url.IndexOf("~/") > -1)
        {
            url = url.Replace("~/", "");
        }
        path += url;
        return path;
    }
    private void CreateDirectory(string path)
    {
        string url = HttpContext.Current.Server.MapPath(path);
        if (!Directory.Exists(url))
        {
            Directory.CreateDirectory(url);
        }
    }
}
