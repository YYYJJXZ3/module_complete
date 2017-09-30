<%@ Control Language="C#" AutoEventWireup="true" CodeFile="Template.ascx.cs" Inherits="PlugIn_CustomAnalysis_Pages_Template" %>
<div id="divControlPanel" style="height: 100%; width: 100%; display: block;">
    <div id="divChoice" style="position: absolute; left: 0; width: 202px; overflow: auto;
        display: block; vertical-align: top">
        <div class="ca_select_container">
            <select id="selectCubeFolder" runat="server" style="width: 99%;">
            </select>
        </div>
        <div class="ca_select_container">
            <select id="selectCube" runat="server" style="width: 99%;">
            </select>
        </div>
        <div style="height: 24px; *height: 24px; margin: 0; padding: 0;">
            <div style="float: left; width: 178px;">
                <input type="text" id="txtMeasureSearch" style="width: 170px" /></div>
            <div style="float: left;">
                <input type="image" id="btnMeasureSearch" src="../images/toolbar/search.gif" style="width: 20px;
                    border-width: 0px;" title="搜索" />
            </div>
        </div>
        <div id="meaTree" class="ca_treemea_container" style="background-color: Transparent;">
        </div>
    </div>
    <div style="margin-left: 204px; padding: 1px; padding-top:3px;">
        <div id="divFilter" class="jstree-drop ca_dim_slice">
            <div class="ca_captionIcon">
            </div>
            <div class="ca_caption">
                <label id="lbChartLeftTitle">
                    请将仅作过滤，不在结果中显示的维度拖至下面表格中,点击右键菜单可删除</label>
            </div>
            <table id="tableChoice"  style="border-spacing:0; padding:0;" border="0" class="ca_slice_table">
                <tr class="ca_slice_header">
                    <td style="width: 25%">
                        过滤项
                    </td>
                    <td>
                        过滤值
                    </td>
                </tr>
                <tr class="ca_slice_body">
                    <td>
                        &nbsp;
                    </td>
                    <td>
                        &nbsp;
                    </td>
                </tr>
            </table>
        </div>
        <div style="float: left; width: 18%; height: 80%; margin: 0; padding: 0; margin-top: 3px;">
            <div style="height: 48px; *height: 48px; _height: 48px; border: 1px solid #bbbbbb;">
                <table  style="border-spacing:0px; height:48px;*height:48px; padding:1px; width:100%;">
                    <tr>
                        <td style="width: 50px;">
                        </td>
                        <td class="ca_coldim_corner">
                            列维度
                        </td>
                    </tr>
                    <tr>
                        <td class="ca_rowdim_corner">
                            行维度
                        </td>
                        <td class="ca_mea_corner">
                            指标
                        </td>
                    </tr>
                </table>
            </div>
            <div id="tablecol" class="jstree-drop ca_rowdim_container">
                <ul id="rowdimlist">
                </ul>
            </div>
        </div>
        <div style="float: left; width: 82%; height: 100%; margin-top: 3px;">
            <div id="tableheader" class="jstree-drop ca_coldim_container">
                <ul id="coldimlist">
                </ul>
            </div>
            <div class="ca_setting_body">
                <div id="tablebody" class="jstree-drop ca_mea_container">
                    <ul id="colmealist">
                    </ul>
                </div>
                <div class="ca_meafilter_header">
                    <table border="0"  style="border-spacing:0px; width:99%;padding-top: 2px;">
                        <tr style="vertical-align:middle;">
                            <td style="text-align:center;">
                                &nbsp;&nbsp;&nbsp;指标过滤条件
                            </td>
                            <td style="width: 40px; text-align:right">
                                <span id="btnExpend1" style="float: right; cursor:pointer">展开︽</span>
                            </td>
                        </tr>
                    </table>
                </div>
                <div id="filterDiv" style="vertical-align: bottom; overflow: hidden;" class="jstree-drop">
                    <div id="meaFilter" style="vertical-align: bottom; height: 100%; overflow: hidden;"
                        class="jstree-drop">
                        <div id="meaSliceDiv" class="jstree-drop ca_meafilter_list">
                            <ul id="meaSlice" style="list-style-type: none; margin-left: 0;">
                            </ul>
                        </div>
                        <div id="meaSliceSettingDiv" class="jstree-drop ca_meafilter_comb">
                            <table style="width: 100%;">
                                <tr style="vertical-align:top">
                                    <td>
                                        <p id="relaSliceTxtArea">
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: right">
                                        <a id="sliceRelaBtn" href="#" onclick="showMeaSliceRelaDialog();">组合指标过滤条件设置</a>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div id="divConclusion">
            </div>
        </div>
    </div>
</div>
<div>
</div>
<div id="divShowDataPanel" style="display: none; text-align: center; clear: both;padding-top:3px;
    margin-left: auto; margin-right: auto; overflow: auto; overflow-y: visible; height: 100%;
    width: 100%;">
    <div id="chartAreaCustom" style="display: none; overflow: hidden; clear: both;">
        <div style="z-index: 999; height: 24px; position: absolute; padding-left: 50px;">
            <div style="width: 151px; float: left;">
                <a id="xText" style="cursor: pointer; color: #e1a3a3;">设置X轴▼</a><br />
                <div id="XDiv" style="padding-left: 0px; border: 1px #000 solid; background-color: #fafafa;
                    text-align: left; display: none; width: 150px; position: absolute; z-index: 999;
                    overflow: auto;">
                    <input type="hidden" value="0" id="hiddenIsXtextShown" />
                    <table id="XOption" style="width: 149px">
                    </table>
                </div>
            </div>
            <div style="width: 182px; float: left; height: 360px;">
                <a id="yText" style="cursor: pointer; font-style: normal; color: #e1a3a3;">设置Y轴▼</a><br />
                <div id="YDiv" style="padding-left: 0px; border: 1px #000 solid; background-color: #fafafa;
                    white-space: nowrap; text-align: left; display: none; width: 180px; position: absolute;
                    z-index: 999; overflow: auto;">
                    <input type="hidden" value="0" id="hiddenIsYtextShown" />
                    <table id="YOption" style="width:100%;">
                    </table>
                </div>
            </div>
        </div>
        <div id="chartCustom" style="border: 1px solid #dddddd; height: 260px; vertical-align: bottom;
            overflow: hidden; clear: both;">
        </div>
    </div>
    <div id="divgrid" style="overflow: auto; text-align: center; clear: both; margin-left: auto;
        height: 100%; width: 100%; margin-right: auto;">
        <div id="divSmartGrid">
        </div>
    </div>
</div>
<div id="divLoadingStatus" style="display: none; text-align: center; padding-top: 200px;
    color: Red; font-size: larger;" class="ui-widget-overlay">
    加载中...
</div>
<div class="contextMenu" id="colDimDataMenu" style="display: none;">
    <ul>
        <li id="ColDataDrillDown">下钻</li>
        <li id="ColDataDrillUp">上钻</li>
        <li id="ColDataSortAsc">升序</li>
        <li id="ColDataSortDesc">降序</li>
    </ul>
</div>
<input type="hidden" id="hiddenIsShowUnit" />
<input type="hidden" id="hiddenUserID" runat="server" />
<div class="contextMenu" id="myMenu1" style="display: none;">
    <ul>
        <li id="del">删除</li>
        <li id="chgdispname">显示名</li>
        <li id="chgdecimal">小数位</li>
        <li id="filter">过滤</li>
        <li id="metaData">元数据</li>
        <li id="Ring">环比值</li>
        <li id="RingGrowth">环比增幅</li>
        <li id="YearOnYear">同比值</li>
        <li id="YearOnYearGrowth">同比增幅</li>
        <li id="RelatedMea">添加关联指标</li>
    </ul>
    <input id="lastTarget" type="hidden" />
</div>
<div class="contextMenu" id="choiceMenu" style="display: none;">
    <ul>
        <li id="delChoice">删除</li>
    </ul>
    <input id="Hidden1" type="hidden" />
</div>
<div class="contextMenu" id="colDimensionMenu" style="display: none;">
    <ul>
        <li id="delColDimension">删除</li>
        <li id="filtColDimension">过滤</li>
        <li id="colRowChg">转到行维度</li>
    </ul>
</div>
<div class="contextMenu" id="rowDimensionMenu" style="display: none;">
    <ul>
        <li id="delRowDimension">删除</li>
        <li id="filtRowDimension">过滤</li>
        <li id="rowColChg">转到列维度</li>
    </ul>
</div>
<div class="contextMenu" id="meaSliceMenu" style="display: none;">
    <ul>
        <li id="delMeaSlice">删除</li>
        <li id="filtMeaSlice">编辑</li>
    </ul>
</div>
<div class="contextMenu" id="customMenu" style="display: none;">
    <ul>
        <li id="customMenuBtn">添加计算列</li>
    </ul>
</div>
<div class="contextMenu" id="newMeaMenu" style="display: none;">
    <ul>
        <li id="delNewMea">删除</li>
        <li id="editNewMea">编辑</li>
    </ul>
</div>
<div id="dialogFiltColDim" style="overflow: auto; height: 300px;" title="维度过滤">
</div>
<div id="dialogMeaSlice" title="指标过滤条件" style="display: none;">
    <ul style="width: 90%">
        <li style="text-align: left"><span></span>&nbsp&nbsp
            <select>
                <option selected="selected" value="&gt;">&gt;</option>
                <option value="&gt;=">&gt;=</option>
                <option value="&lt;">&lt;</option>
                <option value="&lt;=">&lt;=</option>
                <option value="=">=</option>
            </select>&nbsp&nbsp
            <input id="userInput" type="text" style="width: 80px" />&nbsp;<span id="spanSliceMeaUnit"></span>
        </li>
        <li>
            <label id="errorTipForMS" style="color: red">
            </label>
        </li>
    </ul>
</div>
<div id="sliceRelaConfig" title="组合指标过滤条件设置" style="display: none;">
    <table style="width: 100%; height: 100%">
        <tr>
            <td rowspan="4" style="width: 40%; height: 100%">
                <table style="width: 100%; text-align: left; height: 100%">
                    <tr style="height: 30%">
                        <td style="width: 80%; text-align: center;">
                            <b>指标条件</b>
                        </td>
                    </tr>
                    <tr style="height: 70%">
                        <td>
                            <div style="float: left; width: 80%; margin-left: 0;" class="jstree-drop">
                                <ul id="meaSliceList" style="width: 100%; list-style-type: none; margin-left: 0;">
                                </ul>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
            <td>
                <table id="msrInput" style="width: 100%; height: 100%">
                    <tr style="height: 30%; text-align: center; vertical-align: top">
                        <td style="width: 16%">
                            <button style="width: 100%">
                                (</button>
                        </td>
                        <td style="width: 16%">
                            <button style="width: 100%">
                                )</button>
                        </td>
                        <td style="width: 16%">
                            <button style="width: 100%">
                                AND</button>
                        </td>
                        <td style="width: 16%">
                            <button style="width: 100%">
                                OR</button>
                        </td>
                        <td style="width: 16%">
                            <button id="btnMeaCondDefault" style="width: 100%">
                                默认</button>
                        </td>
                        <td style="width: 16%">
                            <button id="btnMeaCondClear" style="width: 100%">
                                清空</button>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr style="height: 10%">
            <td>
            </td>
        </tr>
        <tr style="height: 70%">
            <td colspan="4">
                <textarea rows="10" style="width: 100%; height: 100%; overflow: hidden" id="msrInput_input"></textarea>
            </td>
        </tr>
        <tr style="height: 10%">
            <td>
                <label id="errorTip" style="color: red">
                </label>
            </td>
        </tr>
    </table>
</div>
<div id="meaCalculate" title="计算列设置" style="display: none;">
    <table style="width: 100%; height: 100%">
        <tr>
            <td rowspan="4" style="width: 40%; height: 100%; vertical-align:top;">
                <table style="width: 100%; text-align: left; height: 100%">
                    <tr>
                        <td style="width: 60px">
                            指标名：
                        </td>
                        <td>
                            <input type="text" id="meaName" style="width: 160px;" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            小数位：
                        </td>
                        <td>
                            <select id="ddlCalcColDecimal">
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3" selected="selected">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            基础指标（计算因子）：
                        </td>
                    </tr>
                    <tr>
                        <td valign="top" colspan="2">
                            <div class="jstree-drop" style="float: left; height:280px; overflow:auto; overflow-x:hidden; width: 80%; margin-left: 0;">
                                <ul id="mlForCal" style="width: 90%; list-style-type: none; margin-left: 0;">
                                </ul>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
            <td>
                <table id="operatorReg" style="width: 100%; height: 100%">
                    <tr style="height: 30%; text-align: center; vertical-align: top">
                        <td style="width: 16.6%">
                            <button style="width: 100%">
                                (</button>
                        </td>
                        <td style="width: 16.6%">
                            <button style="width: 100%">
                                )</button>
                        </td>
                        <td style="width: 16.6%">
                            <button style="width: 100%">
                                +</button>
                        </td>
                        <td style="width: 16.6%">
                            <button style="width: 100%">
                                -</button>
                        </td>
                        <td style="width: 16.6%">
                            <button style="width: 100%">
                                *</button>
                        </td>
                        <td style="width: 16.6%">
                            <button style="width: 100%">
                                /</button>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr style="height: 10%">
            <td>
            </td>
        </tr>
        <tr style="height: 70%">
            <td colspan="4" style="vertical-align:top;">
                <textarea cols="28" rows="10" style="width: 100%; height: 100%; overflow: hidden" id="inputForCal"></textarea>
            </td>
        </tr>
        <tr style="height: 10%">
            <td>
                <label id="errorTipForCal" style="color: red">
                </label>
            </td>
        </tr>
    </table>
</div>
<div id="meaMeta" title="指标元数据" style="display: none;">
    <table  style="border-spacing:0px; padding:2px; width:100%;" class="table">
        <tr>
            <td style="width: 18%; text-align: right;">
                指标名称：
            </td>
            <td>
                <span id="meaName_meta"></span>
            </td>
        </tr>
        <tr>
            <td style="text-align: right;">
                显示名称：
            </td>
            <td>
                <span id="display_meta"></span>
            </td>
        </tr>
        <tr>
            <td style="text-align: right;">
                单位：
            </td>
            <td>
                <span id="unit_meta"></span>&nbsp;
            </td>
        </tr>
        <tr>
            <td style="text-align: right;">
                字段（算法）：
            </td>
            <td>
                <span id="calculate_meta"></span>
            </td>
        </tr>
        <tr>
            <td style="text-align: right;">
                表名：
            </td>
            <td>
                <span id="tbName_meta"></span>
            </td>
        </tr>
        <tr>
            <td style="text-align: right;">
                关联维度：
            </td>
            <td>
                <span id="relaDim_meta"></span>
            </td>
        </tr>
        <tr>
            <td style="vertical-align: top; text-align: right;">
                指标描述：
            </td>
            <td>
                &nbsp; <span id="mea_explain"></span>
            </td>
        </tr>
        <tr>
            <td colspan="2" style="text-align: right;">
                <a id="linkMeaDetail" target="_blank" href="#">查看更多</a>
            </td>
        </tr>
    </table>
</div>
<div id="linkDia" title="设置链接" style="display: none;">
    链接URL：<input type="text" id="linkTxt" style="width: 310px" />
    <input type="hidden" id="linkDiaHd" />
</div>
<div id="diaMeaDispName" title="更改指标显示名称" style="display: none;">
    <input type="text" id="txtMeaDispName" style="width: 200px" />
</div>
<div id="diaMeaDecimal" title="更改指标保留小数位" style="display: none;">
    小数位：<select id="selMeaDecimal">
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
    </select>
</div>
<div id="diaDrillDimAdd" title="添加维度" style="display: none;">
</div>
<div id="sqlStrDia" title="查看SQL">
    <table style="width:98%;">
        <tr>
            <td>
                <div style="white-space: pre-wrap; word-spacing: 3px;" id="sqlStr">
                </div>
            </td>
        </tr>
    </table>
</div>
<div id="cellDia" style="display: none;">
    过滤类型：<select id="selectDimValType" onchange="changeDimValType(this);">
        <option value="In">列表</option>
        <option value="NotIn">列表外</option>
        <option value="Sql">SQL</option>
    </select>
    <table style="width: 100%" id="tableDimValList">
        <tr>
            <td>
                <table>
                    <tr>
                        <td>
                            <label id="lblRegionFilter">
                                地区：</label>
                        </td>
                        <td>
                            <select id="regionUI">
                            </select>
                        </td>
                        <td>
                            <label id="celllbl">
                            </label>
                            :
                        </td>
                        <td>
                            <input type="text" id="cellUI" />
                        </td>
                        <td>
                            <input type="button" id="btnSearchNe" class="btn_search" value="搜索" onclick="javascript:cellSearchEvent();" />
                        </td>
                        <td>
                            <input type="button" class="btn_add" id="btnAddNe" value="添加" style="display: none;"
                                onclick="addInputNe();" />
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="width: 99%">
                <table class="table" id="cellDimTb" style="width: 95%">
                </table>
            </td>
        </tr>
        <tr>
            <td style="width: 99%">
                <div id="pagePlugIn" class="pagination" style="width: 99%">
                </div>
            </td>
        </tr>
        <tr>
            <td style="width: 99%">
                <input type="hidden" id="cellHid" />
                <p id="seleCell">
                </p>
            </td>
        </tr>
    </table>
    <table id="tableDimSql" style="width: 100%; display: none;">
        <tr>
            <td>
                <textarea id="txtDimSql" rows="12" cols="70"></textarea>
            </td>
        </tr>
    </table>
</div>
<div id="dialogSave" title="保存报表" style="display: none;">
    <table style="border-spacing:0px; padding:2px;" border="0" class="table">
        <tr>
            <td class="tdtitle">
                选择目录：
            </td>
            <td>
                <input type="text" id="txtTmpFolder" readonly="readonly" style="width: 200px" value="自定义报表" /><input
                    type="hidden" id="hideTmpFolderID" value="-1" /><div>
                    </div>
                <div id="divTmpFolder" style="position: absolute; z-index: 10; width: 200px; background-color: #FFFFE0;
                    height: 150px; border: 1px solid #696969; overflow: auto; display: none;">
                </div>
            </td>
        </tr>
        <tr>
            <td class="tdtitle">
                报表名：
            </td>
            <td>
                <input type="text" id="txtTmptName" style="width: 200px" />
            </td>
        </tr>
        <tr>
            <td class="tdtitle">
                报表描述：
            </td>
            <td>
                <textarea id="txtTmptDesc" cols="36" rows="5"></textarea>
            </td>
        </tr>
    </table>
</div>
<div id="alertinfo">
</div>
<div id="sliceNeListDiv" style="display: none;">
</div>
<div id="dialogSubscribe" title="报表订阅" style="display: none;">
    <iframe id="frameSubscribe" width="100%" height="100%" frameborder="0"></iframe>
</div>
<div id="dialogOptions" title="报表设置(修改设置后点击“运行”才能看到运行效果。)" style="display: none;">
    <fieldset>
        <legend>报表属性</legend>
        <div><div style="float:left;">
        <table  style="border-spacing:0px; padding:2px;" border="0" class="table">
            <tr>
                <td class="tdtitle">
                    图表显示类型：
                </td>
                <td>
                    <input type="radio" id="rdoGrid" name="gridchart" value="Grid" checked="checked" />表格
                    <input type="radio" id="rdoChart" name="gridchart" value="Chart" />图形
                    <input type="radio" id="rdoGridChart" name="gridchart" value="GridChart" />表格图形
                </td>
            </tr>
            <tr>
                <td class="tdtitle">
                    默认排序列：
                </td>
                <td>
                    <select id="ddlSortCol">
                    </select><select id="ddlSort">
                        <option value="1">降序</option>
                        <option value="0">升序</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td class="tdtitle">
                    第二排序列：
                </td>
                <td>
                    <select id="ddlSortCol2">
                    </select><select id="ddlSort2">
                        <option value="1">降序</option>
                        <option value="0">升序</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td class="tdtitle">
                    TopN设置：
                </td>
                <td>
                    <select id="ddlTopN">
                        <option value="0">--TopN--</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="200">200</option>
                        <option value="1000">1000</option>
                    </select>
                </td>
            </tr>
        </table></div><div style="padding:2px">
        <input type="checkbox" value="xxx" id="chkRowColSwap" /><span>行列转换</span>
        <input type="checkbox" value="xxx" id="chkDimStat" /><span>维度汇总</span>
    </div></div>
    </fieldset>
    
    <fieldset id="fieldRowColSwap" style="display:none;">
        <legend>行列转换设置</legend>
        <table style="border-spacing:0px; padding:2px;" border="0" class="table">
            <tr>
                <td class="tdtitle">
                    转换列：
                </td>
                <td>
                    <select id="ddlSwapCol"></select>
                </td>
            </tr></table>
    </fieldset>
    <fieldset id="fieldDimStat" style="display:none;">
        <legend>维度汇总设置</legend>
        <table style="border-spacing:0px; padding:2px;" border="0" class="table">
            <tr>
                <td class="tdtitle">
                    汇总维度：
                </td>
                <td>
                    <div id="divStatDims">
                    </div>
                </td>
            </tr>
            <tr>
                <td class="tdtitle">
                    汇总类型：
                </td>
                <td>
                    <select id="ddlStaType">
                        <option value="0">计数</option>
                        <option value="1">求和</option>
                        <option value="2">平均</option>
                        <option value="3">最大</option>
                        <option value="4">最小</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td class="tdtitle">
                    汇总列：
                </td>
                <td>
                    <select id="ddlStaMea">
                    </select>
                </td>
            </tr>
        </table>
    </fieldset>
    <fieldset id="fieldChart">
        <legend>图形属性</legend>
        <table style="border-spacing:0px; padding:2px; width:98%;" border="0" class="table">
            <tr>
                <td class="tdtitle">
                    X轴：
                </td>
                <td>
                    <select id="ddlAsixX">
                    </select>
                </td>
            </tr>
            <tr>
                <td class="tdtitle">
                    Y轴：
                </td>
                <td>
                    <table style="border-spacing:0px; width:100%;">
                        <tr>
                            <td>
                                <table  style="border-spacing:0px; padding:2px; width:98%;" border="0" id="tableAsixY" class="table">
                                    <tr>
                                        <th>
                                            呈现列
                                        </th>
                                        <th>
                                            图形
                                        </th>
                                        <th>
                                            Y/Y2轴
                                        </th>
                                        <th>
                                        </th>
                                    </tr>
                                </table>
                            </td>
                            <td style="vertical-align:top;">
                                <input type="image" src="../images/add.png" id="btnAddAsixY" value="增加" onclick="addAsixY();" />
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </fieldset>
    <fieldset>
        <legend>表格属性</legend>
        <table  style="border-spacing:0px; padding:2px;" border="0" class="table">
            <tr>
                <td class="tdtitle">
                    默认每页记录数：
                </td>
                <td>
                    <select id="ddlPageSize">
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20" selected="selected">20</option>
                        <option value="30">30</option>
                        <option value="50">50</option>
                    </select>
                </td>
                <td class="tdtitle">
                    锁定列：
                </td>
                <td>
                    <select id="ddlLockCol">
                    </select>
                </td>
            </tr>
            <tr>
                <td class="tdtitle">
                    表头是否显示单位：
                </td>
                <td>
                    <select id="ddlShowUnit">
                        <option value="1">是</option>
                        <option value="0">否</option>
                    </select>
                </td>
                <td class="tdtitle">
                </td>
                <td>
                </td>
            </tr>
        </table>
    </fieldset>
</div>
