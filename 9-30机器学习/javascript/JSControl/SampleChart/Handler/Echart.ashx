<%@ WebHandler Language="C#" Class="Echart" %>

using System;
using System.Web;
using System.Drawing;
using System.IO;
using System.Data;
using System.Web.SessionState;
using System.Web.Script.Serialization;

using Boco.Dss.Framework;
using Boco.QueryEngine;

public class Echart : Boco.Dss.Framework.HttpHandlerBase, IRequiresSessionState
{
    #region 声明变量
    private string imgPath = "";
    private string imgName = "";
    private HttpContext context;
    #endregion

    #region Override Base Type methods
    public override void Process(HttpContext context)
    {
        this.context = context;
        string actionType = context.Request["actionType"];
        string property1 = context.Request["property1"];//通用属性1
        string json = "";

        if (string.IsNullOrEmpty(actionType))
        {
            context.Response.Write("business type not found.".ToJson(HandlerStatus.Exception));
        }
        else if (actionType == "saveImg")
        {
            json = SaveImg();
        }
        else if (actionType == "getJson")
        {
            json = GetJson(property1);
        }
        else if (actionType == "getDataByAnalyzer")
        {
            JavaScriptSerializer jss = new JavaScriptSerializer();
            if (!string.IsNullOrEmpty(property1))
            {
                json = GetChart(GetDataTableByAnalyzer(jss.Deserialize<Analyzer>(property1)));
            }
        }
        else
        {
            context.Response.Write("unknown business type".ToJson(HandlerStatus.Exception));
        }

        context.Response.Write(json);
    }
    #endregion

    protected DataTable GetDataTableByAnalyzer(Analyzer a)
    {
        DataTable dt = new DataTable();

        if (a != null)
        {
            dt = a.GetData();
        }

        return dt;
    }

    //将Datatable转换成图形形式的json串
    protected string GetChart(DataTable dt)
    {
        string json = Boco.CommonToolLibrary.Table.TableHelper.CreateJsonParameters(dt, true, 2);
        json = json.Replace("\r", "").Replace("\n", "").Replace("\0", "");
        return json;
    }

    /// <summary>
    /// 将json文件转化成json对象传到前台
    /// </summary>
    /// <param name="path"></param>
    /// <returns></returns>
    protected string GetJson(string path)
    {
        return "";
    }

    #region 将图形保存成图片
    /// <summary>
    /// 将图形保存成图片
    /// </summary>
    /// <param name="imgUrl"></param>
    /// <returns></returns>
    protected string SaveImg()
    {
        string imgUrl = context.Request["imgUrl"];
        imgPath = context.Request["imgPath"];
        imgName = context.Request["imgName"];

        string json = "";
        if (!string.IsNullOrEmpty(imgUrl))
        {
            string[] url = imgUrl.Split(','); //拆分串

            string u = url[1];

            json = Base64StringToImage(u);
        }
        return json;
    }

    /// <summary>
    /// base64编码的字符串转为图片
    /// </summary>
    /// <param name="strbase64"></param>
    /// <returns></returns>
    protected string Base64StringToImage(string strbase64)
    {
        try
        {
            byte[] arr = Convert.FromBase64String(strbase64);

            MemoryStream ms = new MemoryStream(arr);

            Bitmap bmp = new Bitmap(ms);
            //string imgPath = "~/Temp2/";
            //string imgName = DateTime.Now.ToString("yyyyMMddhhmmssffff") + ".png";
            if (!Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(imgPath)))
            {
                Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath(imgPath));
            }
            bmp.Save(System.Web.HttpContext.Current.Server.MapPath(imgPath + imgName), System.Drawing.Imaging.ImageFormat.Png);

            ms.Close();

            return "success";
        }

        catch (Exception ex)
        {
            return "failed";
        }
    }
    #endregion
}