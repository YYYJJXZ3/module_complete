using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Text;

public partial class PlugIn_JSControl_SampleChart_Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            TestGetJson();
        }
    }


    private void TestGetJson()
    {
        DataTable dt = new DataTable();
        dt.Columns.Add("时间");
        dt.Columns.Add("2G流量");
        dt.Columns.Add("MSC个数");
        dt.Columns.Add("流量");

        dt.Rows.Add(new object[] { "2012年05月", "568370159.29", "40000000", "328370000" });
        dt.Rows.Add(new object[] { "2012年07月", "268370159.29", "470080000", "368370000" });
        dt.Rows.Add(new object[] { "2012年08月", "321494718.29", "367890000", "308370000" });
        dt.Rows.Add(new object[] { "2012年08月", "421494718.29", "397890000", "388370000" });

        gvData.DataSource = dt;
        gvData.DataBind();

        string result = Boco.CommonToolLibrary.Table.TableHelper.CreateJsonParameters(dt);
    }

    //fc图形类型
    /*
        //单数据集
        //Column3D,Column2D,Line,Area2D,Bar2D,Pie2D,Pie3D,Doughnut2D,Doughnut3D, Pareto2D,Pareto3D,
        //多重数据集图表
        //MSColumn2D,MSColumn3D,MSLine,MSBar2D,MSBar3D,MSArea,##### Marimekko,ZoomLine,
        //堆叠图 
        //StackedColumn3D,StackedColumn2D,StackedBar2D,StackedBar3D,StackedArea2D,MSStackedColumn2D
        //组合图 
        //MSCombi3D,MSCombi2D,MSColumnLine3D,StackedColumn2DLine,StackedColumn3DLine,MSCombiDY2D,MSColumn3DLineDY,StackedColumn3DLineDY,MSStackedColumn2DLineDY,
        //分布图 
        //Scatter,Bubble,
        //可滚动图
        //ScrollColumn2D,ScrollLine2D,ScrollArea2D,ScrollStackedColumn2D,ScrollCombi2D,ScrollCombiDY2D 
         
        //组合图个别说明：
        //单轴（不支持多轴的不要加parentYAxis='S'，会影响系列指定样式的显示）
        //MSCombi3D.swf   //组合图（柱状图+折线图+面积图，不指定为柱图）在dataset后加上具体的图形 renderAs='Area';   特殊3D
        //MSCombi2D.swf   //组合图（柱状图+折线图+面积图，不指定为柱图）
        //MSColumnLine3D.swf //只有折线和柱图
        //StackedColumn2DLine.swf  （指定为Line，其他均为柱，柱子堆叠） 
        //StackedColumn3DLine.swf  （指定为Line，其他均为柱，柱子堆叠）
        //多轴  -- dataset加 parentYAxis='S'  
        //MSCombiDY2D.swf  //组合图（柱状图+折线图+面积图，不指定为柱图）
        //MSColumn3DLineDY.swf   //只有折线和柱图, Y2的为折线，Y1的为柱图； 指定 renderAs=''无效
        //StackedColumn3DLineDY.swf //只有堆叠和折线，Y2为折线，Y1均为柱子堆叠； 指定 renderAs=''无效
     * * /

    // chartData 测试数据
    /*
    var xmlstr = "<chart caption='月度销售单' xAxisName='月份' yAxisName='销售额'"
    + "      bgColor='#ffffff' showValues='1' formatNumberScale='0'"
    + "      showBorder='1' bgAlpha='30' palette='6'>"
    + "<set label='一月' value='462' />"
    + "<set label='二月' value='857' />"
    + "<set label='三月' value='671' />"
    + "<set label='四月' value='1494' />"
    + "<set label='五月' value='761' />"
    + "<set label='六月' value='960' />"
    + "<set label='七月' value='1629'/>"
    + "<set label='八月' value='622' />"
    + "<set label='九月' value='376' />"
    + "<set label='十月' value='494'/>"
    + "<set label='十一月' value='1761'/>"
    + "<set label='十二月' value='1960' />"
    + "</chart>";

    var xmlstr1 = "<chart caption='hahahahah' showAboutMenuItem='0' subcaption='' xAxisName='' yAxisName='' numberPrefix='' decimals='2'  borderColor='eeeeee' border='1'>"
    + "   <categories>"
    + "     <category label=' ' />"
    + "     <category label='广州 2012年05月' />"
    + "     <category label='广州 2012年07月' />"
    + "     <category label='广州 2012年08月' />"
    + "   </categories>"
    + "   <dataset seriesName='2G流量' color='A4D3EE'>"
    + "     <set value='' />"
    + "     <set value='568370159.29' />"
    + "     <set value='568370159.29' />"
    + "     <set value='321494718.44' />"
    + "   </dataset>"
    + "   <dataset seriesName='GPRS流量' color='458B00'>"
    + "     <set value='' />"
    + "     <set value='49066070.14' />"
    + "     <set value=' ' />"
    + "     <set value=' ' />"
    + "   </dataset>"
    + "</chart>";
    var xmlstr2 = "<chart caption='' showAboutMenuItem='0' subcaption='' xAxisName='' yAxisName='' numberPrefix='' decimals='2'  borderColor='eeeeee' border='1'>"
    + "  <set label=' ' value='' />"
    + "  <set label='广州 2012年05月' value='568370159.29' />"
    + "  <set label='广州 2012年07月' value='568370159.29' />"
    + "  <set label='广州 2012年08月' value='321494718.44' />"
    + "</chart>";

    var xmlstr3 = "<chart caption='hahahahah' showAboutMenuItem='0' subcaption='' xAxisName='' yAxisName='' numberPrefix='' decimals='2'  borderColor='eeeeee' border='1'>"
    + "   <categories>"
    + "     <category label=' ' />"
    + "     <category label='广州 2012年05月' />"
    + "     <category label='广州 2012年07月' />"
    + "     <category label='广州 2012年08月' />"
    + "   </categories>"
    + "   <dataset seriesName='2G流量' color='A4D3EE'>"
    + "     <set value='' />"
    + "     <set value='568370159.29' />"
    + "     <set value='568370159.29' />"
    + "     <set value='321494718.44' />"
    + "   </dataset>"
    + "</chart>";

    var xmlstr4 = "<chart caption='' showAboutMenuItem='0' subcaption='' xAxisName='' yAxisName='' numberPrefix='' decimals='2'  borderColor='eeeeee' border='1'>"
                 + "    <categories>"
                 + "       <category label='' />"
                 + "       <category label='2012年05月' />"
                 + "       <category label='2012年07月' />"
                 + "       <category label='2012年08月' />"
                 + "  </categories>"
                 + "  <axis title='Y轴' titlePos='left' tickWidth='10' divlineisdashed='1' numberSuffix=''>"
                 + "    <dataset seriesName='2G流量' color='A4D3EE'>"
                 + "      <set value='' />"
                 + "      <set value='568370159.29' />"
                 + "      <set value='568370159.29' />"
                 + "      <set value='321494718.44' />"
                 + "    </dataset>"
                 + "    <dataset seriesName='小区业务量' color='458B00'>"
                 + "      <set value='' />"
                 + "      <set value='106149249' />"
                 + "      <set value=' ' />"
                 + "      <set value=' ' />"
                 + "    </dataset>"
                 + "  </axis>"
                 + "  <axis title='Y2轴' titlePos='right' axisOnLeft='0' tickWidth='' divlineisdashed='' numberSuffix=''>"
                 + "    <dataset seriesName='GPRS流量' color='FFFF00'>"
                 + "      <set value='' />"
                 + "      <set value='49066070.14' />"
                 + "      <set value=' ' />"
                 + "      <set value=' ' />"
                 + "    </dataset>"
                 + "  </axis>"
                 + "</chart> ";
    return xmlstr4;*/
}