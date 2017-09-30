<%@ WebHandler Language="C#" Class="TestData" %>

using System;
using System.Web;
using System.Data;


public class TestData : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        string pageIndex = context.Request["pagenum"];
        string pageSize = context.Request["pagerows"];
        string pageTotle = context.Request["pageTotle"];
        string type = context.Request["dtype"];
        string jsonData = "";
        if (type == "dt")
        {
            jsonData = this.GetJosn(pageIndex, pageSize);
        }
        else if (type == "ch")
        {
            jsonData = this.TestChartlocal();
        }
        else
        {
            jsonData = Testlocal(pageIndex, pageTotle);
        }

        context.Response.ContentType = "text/plain";
        context.Response.Buffer = true;
        context.Response.ExpiresAbsolute = DateTime.Now.AddDays(-1);
        context.Response.AddHeader("pragma", "no-cache");
        context.Response.AddHeader("cache-control", "");
        context.Response.CacheControl = "no-cache";
        context.Response.Write(jsonData);//返回json数据
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

    //得到Json
    private string GetJosn(string pageIndex, string pageSize)
    {
        int pIndex = 1;
        int.TryParse(pageIndex, out pIndex);
        int pSize = 10;
        int.TryParse(pageSize, out pSize);
        int records;
        DataTable dt = GetDataTable(out records, pIndex, pSize);
        return CreateJsonParameters(pIndex, pSize, records, dt);
    }

    #region  CreateJsonParameters
    /// <summary>
    /// 反回JSON数据到前台
    /// </summary>
    /// <param name="dt">数据表</param>
    /// <returns>JSON字符串</returns>   
    /// <author>william</author>
    /// <createtime>2011-7-1</createtime>
    /// <remarks></remarks>
    public string CreateJsonParameters(int pageindex, int pageSize, int records, DataTable dt)
    {

        var str = Boco.CommonToolLibrary.Table.TableHelper.CreateJsonParameters(dt).TrimStart(new char[] { '{' });
        return string.Format("{0}\"page\":{1},\"records\":{2},{3}", "{", pageindex, records, str);
    }

    public DataTable GetDataTable(out int records, int pageIndex, int pageSize)
    {
        string[] names = new string[10] { "李磊", "韩梅梅", "吉姆", "Tom", "Touny", "Matt", "Joanne", "Robert", "丽丽", "玛丽" };
        int[] age = new int[4] { 1, 2, 3, 4 };
        double[] avg = new double[6] { 40, 50.50, 60.78, 70, 80, 98 };
        //System.Int32
        DataTable dt = new DataTable();
        dt.Columns.Add("id", System.Type.GetType("System.String"));
        dt.Columns.Add("name", System.Type.GetType("System.String"));
        dt.Columns.Add("age", System.Type.GetType("System.String"));
        dt.Columns.Add("class", System.Type.GetType("System.Int32"));
        dt.Columns.Add("avg", System.Type.GetType("System.Double"));
        //dt.Columns.Add("55", System.Type.GetType("System.Decimal"));
        int startId = (pageIndex - 1) * pageSize + 1;
        int record = 998;
        Random rand = new Random();
        for (int i = pageIndex; i < pageIndex + pageSize && startId < record; i++)
        {
            DataRow dr = dt.NewRow();
            dr[0] = startId++;
            dr[1] = names[rand.Next(0, 9)];
            dr[2] = DateTime.Today.AddYears(-10 - (age[rand.Next(0, 3)])).ToString("yyyy-MM-dd");
            dr[3] = age[rand.Next(0, 3)];
            dr[4] = avg[rand.Next(0, 5)];
            dt.Rows.Add(dr);
        }
        records = record;
        return dt;
    }
    #endregion

    public string Testlocal(string pageIndex,string pageTotle)
    {
        int pindex = 1, ptatol = 99;
        int.TryParse(pageIndex, out pindex);
        int.TryParse(pageTotle, out ptatol);
        System.Text.StringBuilder jsonStr = new System.Text.StringBuilder();
        jsonStr.Append("{\"page\":" + pindex + ",\"records\":28,");
        jsonStr.Append("\"colnames\":[\"学号\", \"用户名\",\"性别\",\"邮箱\",\"分数\",\"QQ\",\"生日\"],");
        jsonStr.Append("\"rows\":[");
        jsonStr.Append("{ \"col0\": \"1\", \"col1\": \"polaris\", \"col2\": \"男\", \"col3\": \"fef@163.com\", \"col4\": \"88.88\", \"col5\": \"1322<br />3423424\", \"col6\": \"1985-10-01\" },");
        jsonStr.Append("{ \"col0\": \"2\", \"col1\": \"李    四\", \"col2\": \"女\", \"col3\": \"aaaaa\", \"col4\": \"99.33\", \"col5\": \"13223423\", \"col6\": \"1986-07-01\" },");
        jsonStr.Append("{ \"col0\": \"3\", \"col1\": \"王五\", \"col2\": \"男\", \"col3\": \"fae@163.com\", \"col4\": \"112.11\", \"col5\": \"1322342342\", \"col6\": \"1985-10-01\" },");
        jsonStr.Append("{ \"col0\": \"4\", \"col1\": \"马六\", \"col2\": \"女\", \"col3\": \"aaaa@gmail.com\", \"col4\": \"122.44\", \"col5\": \"132234662\", \"col6\": \"1987-05-01\" },");
        jsonStr.Append("{ \"col0\": \"5\", \"col1\": \"赵钱\", \"col2\": \"男\", \"col3\": \"4fja@gmail.com\", \"col4\": \"112.11\", \"col5\": \"1343434662\", \"col6\": \"1982-10-01\" },");
        jsonStr.Append("{ \"col0\": \"6\", \"col1\": \"小毛\", \"col2\": \"男\", \"col3\": \"ahfi@yahoo.com\", \"col4\": \"124.22\", \"col5\": \"1328884662\", \"col6\": \"1987-12-01\" },");
        jsonStr.Append("{ \"col0\": \"7\", \"col1\": \"小李\", \"col2\": \"女\", \"col3\": \"note@sina.com\", \"col4\": \"120\", \"col5\": \"13220046620\", \"col6\": \"1985-10-01\" },");
        jsonStr.Append("{ \"col0\": \"8\", \"col1\": \"小三\", \"col2\": \"男\", \"col3\": \"oefh@sohu.com\", \"col4\": \"110\", \"col5\": \"1327734662\", \"col6\": \"1988-12-01\" },");
        jsonStr.Append("{ \"col0\": \"9\", \"col1\": \"孙先\", \"col2\": \"男\", \"col3\": \"76454533@qq.com\", \"col4\": \"121.11\", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"10\", \"col1\": \"李磊\", \"col2\": \"男\", \"col3\": \"76454533@qq.com\", \"col4\": \"0.11\", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"11\", \"col1\": \"韩梅梅\", \"col2\": \"女\", \"col3\": \"76454533@qq.com\", \"col4\": \"100\", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"12\", \"col1\": \"吉姆\", \"col2\": \"男\", \"col3\": \"76454533@qq.com\", \"col4\": \"127.96\", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"13\", \"col1\": \"李丽\", \"col2\": \"男\", \"col3\": \"76454533@qq.com\", \"col4\": \"123\", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"14\", \"col1\": \"露西\", \"col2\": \"男\", \"col3\": \"76454533@qq.com\", \"col4\": \" \", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"8\", \"col1\": \"小三\", \"col2\": \"男\", \"col3\": \"oefh@sohu.com\", \"col4\": \"110\", \"col5\": \"1327734662\", \"col6\": \"1988-12-01\" },");
        jsonStr.Append("{ \"col0\": \"9\", \"col1\": \"孙先\", \"col2\": \"男\", \"col3\": \"76454533@qq.com\", \"col4\": \"121.11\", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"10\", \"col1\": \"李磊\", \"col2\": \"男\", \"col3\": \"76454533@qq.com\", \"col4\": \"0.11\", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"11\", \"col1\": \"韩梅梅\", \"col2\": \"女\", \"col3\": \"76454533@qq.com\", \"col4\": \"100\", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"12\", \"col1\": \"吉姆\", \"col2\": \"男\", \"col3\": \"76454533@qq.com\", \"col4\": \"127.96\", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"13\", \"col1\": \"李丽\", \"col2\": \"男\", \"col3\": \"76454533@qq.com\", \"col4\": \"123\", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"14\", \"col1\": \"露西\", \"col2\": \"男\", \"col3\": \"76454533@qq.com\", \"col4\": \" \", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"8\", \"col1\": \"小三\", \"col2\": \"男\", \"col3\": \"oefh@sohu.com\", \"col4\": \"110\", \"col5\": \"1327734662\", \"col6\": \"1988-12-01\" },");
        jsonStr.Append("{ \"col0\": \"9\", \"col1\": \"孙先\", \"col2\": \"男\", \"col3\": \"76454533@qq.com\", \"col4\": \"121.11\", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"10\", \"col1\": \"李磊\", \"col2\": \"男\", \"col3\": \"76454533@qq.com\", \"col4\": \"0.11\", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"11\", \"col1\": \"韩梅梅\", \"col2\": \"女\", \"col3\": \"76454533@qq.com\", \"col4\": \"100\", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"12\", \"col1\": \"吉姆\", \"col2\": \"男\", \"col3\": \"76454533@qq.com\", \"col4\": \"127.96\", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"13\", \"col1\": \"李丽\", \"col2\": \"男\", \"col3\": \"76454533@qq.com\", \"col4\": \"123\", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" },");
        jsonStr.Append("{ \"col0\": \"14\", \"col1\": \"露西\", \"col2\": \"男\", \"col3\": \"76454533@qq.com\", \"col4\": \" \", \"col5\": \"132290062\", \"col6\": \"1989-11-21\" }");
        jsonStr.Append("]");
        jsonStr.Append("}");
        return jsonStr.ToString();

    }


    public string TestChartlocal()
    {
        return "{colnames:[\"时间\",\"2G流量\",\"MSC个数\",\"流量\"],rows:[{col0:\"2012年05月\",col1:\"568370159.29\",col2:\"4000\",col3:\"328370000\"},{col0:\"2012年07月\",col1:\"268370159.29\",col2:\"4700\",col3:\"368370000\"},{col0:\"2012年08月\",col1:\"321494718.29\",col2:\"3600\",col3:\"308370000\"}]}";
    }
}