<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="PlugIn_JSControl_SampleChart_Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>图形插件的demo页面</title>
    <style type="text/css">
        input {
            width: 80px;
        }

        td {
            height: 25px;
            border-bottom: #91afcf 1px solid;
        }

        #tableParam td {
            height: 30px;
        }
    </style>
    <script type="text/javascript" src="../../core/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="Scripts/SampleChart.js"></script>
    <script src="../../common/tools.js" type="text/javascript"></script>
    <script type="text/javascript">
        function showInfo(xvalue, yvalue, value, xdataindex, ycolindex) {
            $("#divShowClick").text("showInfo : " + xvalue + ", " + yvalue + ", " + value);
        }

        function showInfo2(xvalue, yvalue, value, xindex, yindex) {
            $("#divShowClick").text("showInfo2 : " + xvalue);
        }

        function clr() {
            jQuery("#chartContainer").html("");
            jQuery("#Div1").html("");
        }

        jQuery(document).ready(function () {
            query1();
        });

        function exportChart() {
            dss.download();
        }

        function query1() {
            var click1 = [{ click: showInfo, colname: "2G流量", selcolor: "FF0000", defaultselindex: 0 },
                          { url: "http://www.baidu.com", colindex: 2 },
                          { click: showInfo2, colname: "流量" }];
            var tooltip = [{ colname: "流量", values: ["a{br}12000{br}", "abbb{br}15600000"] },
                           { colindex: 1, values: ["哈哈哈哈"] }];

            //options中属性为""时，可不写
            var options5 = {
                Width: $("#width").val(),
                Height: $("#height").val(),
                ClickEvent: click1,
                DataSource: changeString(getDataSource()),
                Title: $("#Text1").val(),
                Is2D: changeString($("#Select1")[0].value),
                SubTitle: $("#Text2").val(),
                XTitle: $("#Text3").val(),
                YTitle: $("#Text4").val(),
                XDataColIndex: $("#Text6").val(),
                YDataColIndex: $("#Text7").val(),
                YFormatType: $("#Select5")[0].value,
                Y2Title: getY2Title(),
                Y2DataColIndex: getY2DataColIndex(),
                Y2FormatType: getY2FormatType(),
                IsShowLegend: changeString($("#Select2")[0].value),
                LegendPosition: $("#Select3")[0].value,
                ToolTip: tooltip,
                IsShowValue: changeString($("#Select4")[0].value),
                IsShowPercentValue: changeString($("#Select14")[0].value),
                IsFlash: changeString($("#Select11")[0].value),
                XLabelStyle: $("#Select12")[0].value,
                XLabelStep: changeString($("#Text9").val()),
                IsShowLimits: changeString($("#Select8")[0].value),
                IsAutoLimits: changeString($("#Select7")[0].value),
                YMinValue: $("#Text11").val(),
                YMaxValue: $("#Text10").val(),
                Y2MinValue: $("#Text15").val(),
                Y2MaxValue: $("#Text14").val(),
                Decimals: changeString($("#Text19").val()),
                YDecimals: changeString($("#Text17").val()),
                Y2Decimals: changeString($("#Text18").val()),
                //IsLabelInPer: true,//如果是饼图，转换为百分比显示
                BgColor: $("#Text13").val(),
                SubChartType: getSubChartType(),
                //ColorArr: new Array("EA0000", "005757", "F9F900", "28FF28"),
                ChartType: $("#chartType")[0].value,

                //@jyt 20150616 
                IsAlign: changeString($("#SelectIsAlign")[0].value),
                PaddingLeft: 90,
                PaddingRight: 90,
                PaddingTop: 50,
                PaddingBottom: 60
            };

            if ($("#chartType")[0].value == "ColumnRainbow") {
                $.extend(true, options5, {
                    ColorArr: ["#7CB5EC", "#90EC7D", "#F7A35B", "#FF69B3", "#3FE0D0", '#dc69aa', '#CD5D5C', '#FF7F50', '#6395EC', '#DA70D5']
                });
            }

            var chart = jQuery("#chartContainer").SampleChart(options5);
        }

        function changeString(v) {
            if (v == "") {
                return v;
            }
            return eval("(" + v + ")");
        }

        function typechange() {
            $("#Text8").val("");
            $("#trY2").css("display", "none");
            $("#subChartType").css("display", "none");

            if (isY2Type()) {
                $("#Text8").val("2");
                $("#trY2").css("display", "");
            }
            if ($("#chartType")[0].value.indexOf("Combi") >= 0) {
                $("#subChartType").css("display", "");
            }

            if ($("#chartType")[0].value == "Combi1") {
                $("#Select10")[0].value = "Line";
                $("#Select13")[0].value = "Area";
            }
            else if ($("#chartType")[0].value == "Combi2") {
                $("#Select10")[0].value = "Column";
                $("#Select13")[0].value = "Line";
            }
            else if ($("#chartType")[0].value == "Combi3") {
                $("#Select10")[0].value = "Column";
                $("#Select13")[0].value = "Line";
            }
            else if ($("#chartType")[0].value == "Combi1Y") {
                $("#Select10")[0].value = "Column";
                $("#Select13")[0].value = "Line";
            }
            else if ($("#chartType")[0].value == "Combi2Y") {
                $("#Select10")[0].value = "";
                $("#Select13")[0].value = "";
            }
            else if ($("#chartType")[0].value == "Combi3Y") {
                $("#Select10")[0].value = "";
                $("#Select13")[0].value = "";
            }

            //某些demo页是独立的页面
            var demoPage = "";
            if ($("#chartType")[0].value == "Map" || $("#chartType")[0].value == "MapFlowOut" || $("#chartType")[0].value == "MapFlowIn" || $("#chartType")[0].value == "MapScatter") {
                demoPage = "map.html";
            }
            else if ($("#chartType")[0].value == "ColumnWaterfall") {
                demoPage = "ColumnWaterfall.html";
            }
            else if ($("#chartType")[0].value == "PieDoughnut") {
                demoPage = "PieDoughnut.html";
            }
            else if ($("#chartType")[0].value == "Treemap") {
                demoPage = "Treemap.html";
            }
            else if ($("#chartType")[0].value == "Gauge") {
                demoPage = "Gauge.html";
            }
            else if ($("#chartType")[0].value == "Scatter" || $("#chartType")[0].value == "Bubble") {
                demoPage = "Scatter.html";
            }

            if (demoPage != "") {
                window.open(demoPage);
                return;
            }
            else {
                query1();
            }

            if ($("#chartType")[0].value == "StackedBar" || $("#chartType")[0].value == "StackedColumn") {
                $("#divIsAlign").show();
            }
            else {
                $("#divIsAlign").hide();
                $("#SelectIsAlign")[0].value = false;
            }
        }

        function isY2Type() {
            if ($("#chartType")[0].value == "MultiAxisLine"
            || $("#chartType")[0].value == "Combi1Y"
            || $("#chartType")[0].value == "Combi2Y"
            || $("#chartType")[0].value == "Combi3Y") {
                return true;
            }
            return false;
        }

        function getDataSource() {
            var str = '{"colnames":["时间","2G流量","MSC个数","流量"],"rows":[{"col0":"2012年05月","col1":"568370159.29","col2":"400000000","col3":"328370000"},{"col0":"2012年07月","col1":"268370159.29","col2":"470080000","col3":"368370000"},{"col0":"2012年08月","col1":"321494718.29","col2":"367890000","col3":"308370000"},{"col0":"2012年09月","col1":"421494718.29","col2":"397890000","col3":"388370000"}]}';
            var str1 = '{"colnames":["时间","2G流量","MSC个数","流量"],"rows":[{"col0":"2012年05月","col1":"568370159.29","col2":"400000000","col3":"328370000"},{"col0":"2012年07月","col1":"268370159.29","col2":"470080000","col3":"368370000"},{"col0":"2012年08月","col1":"321494718.29","col2":"367890000","col3":"308370000"},{"col0":"1","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"11","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"12","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"13","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"14","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"15","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"16","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"17","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"18","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"19","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"111","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"112","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"113","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"11","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"12","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"13","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"14","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"15","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"16","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"17","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"18","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"19","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"111","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"112","col1":"321494718.29","col2":"3600","col3":"308370000"},{"col0":"113","col1":"321494718.29","col2":"3600","col3":"308370000"}]}';
            var str2 = '{"colnames":["指标","北京","上海","广州"],"rows":[{"col0":"总流量","col1":"568370159.29","col2":"268370159.29","col3":"321494718.29"},{"col0":"4G流量","col1":"238370159","col2":"68370159","col3":"81494718"},{"col0":"成功率","col1":"95","col2":"80","col3":"75"},{"col0":"下载速率","col1":"550","col2":"380","col3":"220"},{"col0":"时延","col1":"500","col2":"1200","col3":"1500"}]}';

            //str1比str行多，测试滚动用
            if ($("#chartType")[0].value.indexOf("Scroll") > -1) {
                return str1;
            }
            else if ($("#chartType")[0].value.indexOf("Radar") > -1) {
                return str2;
            }
            else {
                return str;
            }
        }

        function getY2Title() {
            if (isY2Type()) {
                return $("#Text5").val();
            }
            return "";
        }
        function getY2DataColIndex() {
            if (isY2Type()) {
                return $("#Text8").val();
            }
            return "";
        }
        function getY2FormatType() {
            if (isY2Type()) {
                return $("#Select6")[0].value;
            }
            return "";
        }

        function getSubChartType() {
            if ($("#chartType")[0].value.indexOf("Combi") < 0) {
                return "";
            }
            //格式为一个数组[{ colindex:1, type: "Line"},{ colindex:2, type: "Line"}]
            //1 "Select9" 2 "Select10"  3"Select13"
            var col1 = $("#Select9")[0].value;
            var col2 = $("#Select10")[0].value;
            var col3 = $("#Select13")[0].value;
            var str = "";
            if (col1 != "") {
                str += '{colindex:1,type:"' + col1 + '"}';
            }
            if (col2 != "") {
                if (str != "") {
                    str += ",";
                }
                str += '{colindex:2,type:"' + col2 + '"}';
            }
            if (col3 != "") {
                if (str != "") {
                    str += ",";
                }
                str += '{colindex:3,type:"' + col3 + '"}';
            }
            if (str != "") {
                str = "[" + str + "]"
                str = eval('(' + str + ')')
            }
            return str;
        }
    </script>
</head>
<body>
    <form id="form1" runat="server" style="padding: 5px 20px 20px 20px;">
        <div style="padding: 5px;">
            数据源（绑定滚动以外的类型时，只取3行数据测试）：
        <div style="padding-left: 0px; height: 125px; overflow: auto;">
            <asp:GridView runat="server" ID="gvData">
            </asp:GridView>
        </div>
            参数：<br />
            <table id="tableParam" cellspacing="0" style="width: 100%">
                <tr>
                    <td colspan="2">
                        <label>
                            ChartType：</label><select id="chartType" onchange="typechange()">
                                <option value="Column">Column（柱图）</option>
                                <option value="ColumnRainbow">ColumnRainbow（彩虹柱图）</option>
                                <option value="ColumnWaterfall">ColumnWaterfall（瀑布图）</option>
                                <option value="Line">Line（折线图）</option>
                                <option value="Bar">Bar（长条图）</option>
                                <option value="Radar">Radar（雷达图）</option>
                                <option value="RadarArea">RadarArea（雷达面积图）</option>
                                <option value="Pie">Pie（s 饼图）</option>
                                <option value="PieRose">PieRose（南丁格尔玫瑰图）</option>
                                <option value="PieLayered">PieLayered（分层饼图）</option>
                                <option value="PieDoughnut">PieDoughnut（嵌套饼图）</option>
                                <option value="Doughnut">Doughnut（s 圆环图）</option>
                                <option value="Treemap">Treemap（矩形树图）</option>
                                <option value="Pareto">Pareto（s 帕累托图）</option>
                                <option value="Area">Area（面积图）</option>
                                <option value="ScrollColumn">ScrollColumn（带滚动条柱图）</option>
                                <option value="ScrollLine">ScrollLine</option>
                                <option value="ScrollArea">ScrollArea</option>
                                <option value="ScrollStackedColumn">ScrollStackedColumn</option>
                                <option value="StackedColumn">StackedColumn（堆叠柱图）</option>
                                <option value="StackedBar">StackedBar（堆叠长条图）</option>
                                <option value="StackedArea">StackedArea（堆叠面积图）</option>
                                <option value="Scatter">Scatter（散点图）</option>
                                <option value="Bubble">Bubble（气泡图）</option>
                                <option value="Gauge">Gauge（仪表盘）</option>
                                <option value="Map">Map（地图）</option>
                                <option value="MapFlowOut">MapFlowOut（流出型地图）</option>
                                <option value="MapFlowIn">MapFlowIn（流入型地图）</option>
                                <option value="MapScatter">MapScatter（打点地图）</option>
                                <option value="Combi1">Combi1 组合（柱,线,面积）</option>
                                <option value="Combi2">Combi2 组合（柱,线）</option>
                                <option value="Combi3">Combi3 组合（堆叠,线）</option>
                                <option value="Combi1Y">Combi1Y 组合（柱,线,面积）(Y2)</option>
                                <option value="Combi2Y">Combi2Y 组合（Y柱,Y2线）(Y2)</option>
                                <option value="Combi3Y">Combi3Y 组合（Y堆叠,Y2线）(Y2)</option>
                                <%--<option value="MultiAxisLine">MultiAxisLine（Y2）</option>--%>
                            </select>
                        <div id="divIsAlign" style="display: none;">
                            <label>
                                每层是否对齐：</label><select id="SelectIsAlign">
                                    <option value="false">否</option>
                                    <option value="true">是</option>
                                </select>
                        </div>
                    </td>
                    <td colspan='4'>
                        <div id="subChartType" style="display: none;">
                            SubChartType:1列：
                        <select id="Select9">
                            <option value=''></option>
                            <option value='Column'>Column</option>
                            <option value='Line'>Line</option>
                            <option value='Area'>Area</option>
                        </select>2列：
                        <select id="Select10">
                            <option value=''></option>
                            <option value='Column'>Column</option>
                            <option value='Line'>Line</option>
                            <option value='Area'>Area</option>
                        </select>3列：
                        <select id="Select13">
                            <option value=''></option>
                            <option value='Column'>Column</option>
                            <option value='Line'>Line</option>
                            <option value='Area'>Area</option>
                        </select>
                            (需指定各列样式,不指定则Y默认为柱,Y2默认为线)
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <label>
                            Width：</label><input id="width" value="70%" />
                    </td>
                    <td>
                        <label>
                            Height：</label><input id="height" value="350" />
                    </td>
                    <td>
                        <label>
                            Is2D：</label><select id="Select1">
                                <option value="false">false</option>
                                <option value="true" selected="selected">true</option>
                            </select>
                    </td>
                    <td>
                        <label>
                            IsFlash：</label><select id="Select11">
                                <option value="true">true</option>
                                <option value="false">false</option>
                            </select>
                    </td>
                    <td>
                        <label>
                            IsShowLegend：</label><select id="Select2">
                                <option value="true">true</option>
                                <option value="false">false</option>
                            </select>
                    </td>
                    <td>
                        <label>
                            LegendPosition：</label><select id="Select3">
                                <option value=""></option>
                                <option value="RIGHT">RIGHT</option>
                                <option value="BOTTOM">BOTTOM</option>
                                <option value="LEFT">LEFT</option>
                                <option value="TOP">TOP</option>
                                <option value="LEFTTOP">LEFTTOP</option>
                                <option value="LEFTBOTTOM">LEFTBOTTOM</option>
                                <option value="RIGHTTOP">RIGHTTOP</option>
                                <option value="RIGHTBOTTOM">RIGHTBOTTOM</option>
                            </select>
                    </td>
                </tr>
                <tr>
                    <td>
                        <label>
                            X轴坐标样式：</label><select id="Select12">
                                <option value="Wrap">换行</option>
                                <option value="Stagger">交错</option>
                                <option value="Rotate">旋转</option>
                            </select>
                    </td>
                    <td>
                        <label>
                            Title：</label><input id="Text1" value="" />
                    </td>
                    <td>
                        <label>
                            SubTitle：</label><input id="Text2" value="" />
                    </td>
                    <td>
                        <label>
                            XTitle：</label><input id="Text3" value="" />
                    </td>
                    <td>背景色：<input id="Text13" value="" />
                    </td>
                    <td>
                        <label>
                            ToolTip自定义:</label>
                        <input id="Text12" value='参考"流量""5月,7月"' readonly="readonly" style="width: 100px" />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label>
                            X轴显示间隔：</label><input id="Text9" value="1" />
                    </td>
                    <td>
                        <label>
                            XDataColIndex：</label><input id="Text6" value="" />
                    </td>
                    <td>
                        <label>
                            IsShowValue：</label><select id="Select4">
                                <option value="false">false</option>
                                <option value="true">true</option>
                            </select>
                        <br />
                        <label>
                            IsShowPercentValue：</label><select id="Select14">
                                <option value="true">true</option>
                                <option value="false">false</option>
                            </select>
                    </td>
                    <td>
                        <label>
                            显示极值：</label><select id="Select8">
                                <option value="false">false</option>
                                <option value="true">true</option>
                            </select>
                    </td>
                    <td>
                        <label>
                            自动计算Y极值：</label><select id="Select7">
                                <option value="false">false</option>
                                <option value="true">true</option>
                            </select>
                    </td>
                    <td>
                        <label>
                            数据小数位:</label><input id="Text19" value="" />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label>
                            Y Title：</label><input id="Text4" value="" />
                    </td>
                    <td>
                        <label>
                            Y DataColIndex：
                        </label>
                        <input id="Text7" value="" />
                        <br />
                        (多个用逗号分隔)
                    </td>
                    <td>
                        <label>
                            Y FormatType：</label><select id="Select5">
                                <option value=""></option>
                                <option value="1000">1000</option>
                                <option value="1024">1024</option>
                                <option value="%">%</option>
                            </select>
                    </td>
                    <td>
                        <label>
                            Y 轴最大值：</label><input id="Text10" value="" />
                    </td>
                    <td>
                        <label>
                            Y 轴最小值：</label><input id="Text11" value="" />
                    </td>
                    <td>
                        <label>
                            Y轴小数位:</label><input id="Text17" value="" />
                    </td>
                </tr>
                <tr id="trY2" style="display: none;">
                    <td>
                        <label>
                            Y2Title：</label><input id="Text5" value="" />
                    </td>
                    <td>
                        <label>
                            Y2DataColIndex：</label><input id="Text8" value="" /><br />
                        (多个用逗号分隔)
                    </td>
                    <td>
                        <label>
                            Y2FormatType：</label><select id="Select6">
                                <option value=""></option>
                                <option value="1000">1000</option>
                                <option value="1024">1024</option>
                                <option value="%">%</option>
                            </select>
                    </td>
                    <td>
                        <label>
                            Y2轴最大值：</label><input id="Text14" value="" />
                    </td>
                    <td>
                        <label>
                            Y2轴最小值：</label><input id="Text15" value="" />
                    </td>
                    <td>
                        <label>
                            Y2轴小数位:</label><input id="Text18" value="" />
                    </td>
                </tr>
            </table>
        </div>
        <div id="divShowClick" style="height: 20px;">
        </div>
        <input value="Clear" type="button" onclick="clr()" />
        <input value="Bind" type="button" onclick="query1();" /><input value="Export" type="button" onclick="    exportChart();" />
        div容器[width: 100%; height: 500px;]
        <div id="chartContainer" style="width: 100%; height: 350px; border: #91afcf 1px solid;">
        </div>
        <div style="padding-left: 20px;">
            <br />
            说明：
        <br />
            x,y,y2绑定的列：如果指定了index（XDataIndex、YDataIndex、Y2DataIndex），以index为准；确认顺序x、y、y2；如果x未指定，默认为index=0；如果y2未指定，默认全部绑定到y；如果y未指定，除x和y2均为y；
        <br />
            图形判断规则：根据ChartType和Is2D确定图形；如果图形不支持y2，y2属性忽略；
        <br />
            Click事件：click和url，click优先级高；colindex和colname，colindex优先级高；
        <br />
            Y轴极值：自动设置Y轴极值为"false"时，设置的Y轴最大值、最小值才会有效；如果设置了自动设置Y轴极值为true，自动设置优先；
        <br />
        </div>
    </form>
</body>
</html>
