<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Content.aspx.cs" Inherits="PlugIn_CustomAnalysis_Pages_Content" %>

<%@ Register Src="../Controls/Template.ascx" TagName="Template" TagPrefix="uc2" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title></title>
    <style type="text/css">
        html {
            height: 100%;
            margin: 0;
            overflow: hidden;
        }

        form {
            margin: 0;
            height: 100%;
        }

        #tableChoice td {
            border-right: 1px solid #aaaaaa;
            border-bottom: 1px solid #aaaaaa;
        }

        div {
            margin: 0 0 0 0;
        }

        #rowdimlist {
            list-style: none;
            margin: auto;
            padding: 4px;
            white-space: nowrap;
        }

            #rowdimlist li {
                float: left;
                padding: 4px;
                margin: 1px;
                white-space: nowrap;
            }

        #coldimlist {
            list-style: none;
            margin: auto;
            padding: 4px;
        }

            #coldimlist li {
                float: left;
                padding: 4px;
                margin: 1px;
            }

        #meaSlice {
            list-style: none;
            margin: auto;
            padding: 4px;
        }

            #meaSlice li {
                padding: 4px;
            }

        #colmealist {
            margin: auto;
            padding: 4px;
            list-style-type: none;
            white-space: nowrap;
        }

            #colmealist li {
                float: left;
                padding: 4px;
                margin: 1px;
                white-space: nowrap;
            }

        .NewMea {
            cursor: hand;
            padding: 4px;
            color: Black;
            border: #aed0ea 1px solid;
            height:22px;
        }

        .pagination {
            font-size: 80%;
        }

            .pagination a {
                text-decoration: none;
                border: solid 1px #AAE;
                color: #15B;
            }

            .pagination a, .pagination span {
                display: block;
                float: left;
                padding: 0.3em 0.5em;
                margin-right: 5px;
                margin-bottom: 5px;
            }

            .pagination .current {
                background: #26B;
                color: #fff;
                border: solid 1px #AAE;
            }

                .pagination .current.prev, .pagination .current.next {
                    color: #999;
                    border-color: #999;
                    background: #fff;
                }

        .table {
            border-bottom: 1px solid #91afcf;
            border-right: 1px solid #91afcf;
        }

            .table th {
                border-top: 1px solid #91afcf;
                border-left: 1px solid #91afcf;
                height: 25px;
                padding-left: 7px;
                background-color: #deebf8;
                font-weight: normal;
            }

            .table td {
                border-top: 1px solid #91afcf;
                border-left: 1px solid #91afcf;
                color: #666;
                height: 20px;
                padding: 1px;
                padding-right: 3px;
                padding-left: 3px;
            }

        .linkAutoDay {
            padding-right: 6px;
            color: Blue;
        }

            .ui-state-focus,
    .ui-widget-content .ui-state-focus,
    .ui-widget-header .ui-state-focus {
        border: 1px solid #74b2e2;
        background: #e4f1fb 50% 50% repeat-x;
        font-weight: bold;
        color: #0070a3;
    }
    </style>
    <link href="../../../Themes/lightblue/p.css" rel="stylesheet" type="text/css" />
    <link href="../../../Themes/lightblue/jqgrid/ui.jqgrid.css" rel="stylesheet" type="text/css" />
    <link href="../../../Themes/lightblue/jqueryui/jquery-ui-1.10.3.custom.min.css" rel="stylesheet"
        type="text/css" />
    <script src="../../../Javascript/core/jquery-1.9.1.min.js" type="text/javascript"></script>
    <script src="../../../Javascript/core/jquery-ui-1.10.3.custom.min.js" type="text/javascript"></script>
    <script src="../../../Javascript/JSControl/SmartGrid/JqGrid/grid.locale-cn.js" type="text/javascript"></script>
    <script src="../../../Javascript/JSControl/SmartGrid/JqGrid/jquery.jqGrid.min.js"
        type="text/javascript"></script>
    <script src="../../../Javascript/JSControl/SmartGrid/JqGrid/SmartGrid.js" type="text/javascript"></script>
    <link href="../Css/jstree/!style.css" rel="stylesheet" type="text/css" />
    <link href="../Css/jstree/syntax/!style.css" rel="stylesheet" type="text/css" />
    <link href="../Css/jquery.cluetip.css" rel="stylesheet" type="text/css" />
    <link href="../../../Themes/lightblue/ca/ca.css" rel="stylesheet" type="text/css" />
    <script src="../Css/jstree/syntax/!script.js" type="text/javascript"></script>
    <script src="../Js/tree/jquery.jstree.js" type="text/javascript"></script>
    <script src="../../../javascript/JSControl/DownloadManager/jqExport.js"></script>
    <script src="../../../Javascript/JSControl/SampleChart/Scripts/SampleChart.js" type="text/javascript"></script>
    <script src="../Js/jquery.ca.tool.js" type="text/javascript"></script>
    <script src="../Js/template.js" type="text/javascript"></script>
    <script src="../Js/templaterun.js" type="text/javascript"></script>
    <script src="../Js/templatedim.js" type="text/javascript"></script>
    <script src="../Js/ToolBar.js" type="text/javascript"></script>
    <script src="../../../Javascript/common/openTabPage.js" type="text/javascript"></script>
    <script src="../../../Javascript/JSControl/Condition/timepicker.js" type="text/javascript"></script>
    <script src="../../../javascript/common/tools.js" type="text/javascript"></script>
    <script src="../../../javascript/common/pagetools.js"></script>
</head>
<body style="background-color: White; height: 100%; margin: 0;">
    <form id="form1" runat="server">
        <asp:ScriptManager runat="server" ID="ScriptManager1" EnablePartialRendering="false">
        </asp:ScriptManager>
        <div style="height: 100%; width: 100%; *height: auto; _height: 100%;">
            <div id="divtemplate" style="height: 100%; width: 100%; *height: auto; _height: 100%;">
                <div class="ca_toolbar">
                    <table style="text-align: center; vertical-align: middle;" border="0" cellspacing="3"
                        cellpadding="0">
                        <tr>
                            <td id="tdSave" runat="server" onclick="toolbarClick('save');" onmouseover="toolbarover('save',this)" onmouseout="toolbarout('save',this)" title="保存" class="ca_toolbar_icon ca_toolbar_save"></td>
                            <td id="tdSaveAs" onclick="toolbarClick('saveas');" onmouseover="toolbarover('saveas',this)" onmouseout="toolbarout('saveas',this)" runat="server" title="另存为" class="ca_toolbar_icon ca_toolbar_saveas"></td>
                            <td id="tdShowReportList" onclick="toolbarClick('template');" onmouseover="toolbarover('rptlist',this)" onmouseout="toolbarout('rptlist',this)" title="显示或隐藏报表列表区" class="ca_toolbar_icon ca_toolbar_rptlist"></td>
                            <td onclick="toolbarClick('condition');" onmouseover="toolbarover('cond',this)" onmouseout="toolbarout('cond',this)" title="显示或隐藏条件选择区" class="ca_toolbar_icon ca_toolbar_cond"></td>
                            <td onclick="toolbarClick('run');" onmouseover="toolbarover('run',this)" onmouseout="toolbarout('run',this)" title="运行报表" class="ca_toolbar_icon ca_toolbar_run"></td>
                            <td id="tdShowSql" onclick="toolbarClick('showsql');" onmouseover="toolbarover('sql',this)" onmouseout="toolbarout('sql',this)" title="查看查询语句" class="ca_toolbar_icon ca_toolbar_sql"></td>
                            <td onclick="toolbarClick('tempchangedata');" onmouseover="toolbarover('swap',this)" onmouseout="toolbarout('swap',this)" title="运行结果与设置界面切换" class="ca_toolbar_icon ca_toolbar_swap"></td>
                            <td onclick="toolbarClick('chart');" onmouseover="toolbarover('chart',this)" onmouseout="toolbarout('chart',this)" title="显示或隐藏图形" class="ca_toolbar_icon ca_toolbar_chart"></td>
                            <td onclick="toolbarClick('table');" onmouseover="toolbarover('table',this)" onmouseout="toolbarout('table',this)" title="显示或隐藏表格" class="ca_toolbar_icon ca_toolbar_table"></td>
                            <td id="tdExport" onclick="toolbarClick('export');" onmouseover="toolbarover('export',this)" onmouseout="toolbarout('export',this)" title="导出" style="display: none;" class="ca_toolbar_icon ca_toolbar_export"></td>
                            <td onclick="toolbarClick('subscribe');" onmouseover="toolbarover('subscrib',this)" onmouseout="toolbarout('subscrib',this)" id="tdSubscribe" runat="server" title="订阅" class="ca_toolbar_icon ca_toolbar_subscrib"></td>
                            <td onclick="toolbarClick('setting');" onmouseover="toolbarover('setting',this)" onmouseout="toolbarout('setting',this)" title="高级设置" class="ca_toolbar_icon ca_toolbar_setting"></td>
                            <td onclick="toolbarClick('publish');" onmouseover="toolbarover('pub',this)" onmouseout="toolbarout('pub',this)" id="tdPublish" runat="server" title="发布" class="ca_toolbar_icon ca_toolbar_pub"></td>
                            <td onclick="toolbarClick('help');" onmouseover="toolbarover('help',this)" onmouseout="toolbarout('help',this)" title="帮助" class="ca_toolbar_icon ca_toolbar_help"></td>
                        </tr>
                    </table>
                </div>
                <div id="divTmpSetting" style="top: 26; *top: 26; /*_top: 26; */ *height: auto; _height: 100%;">
                    <uc2:Template ID="Template1" runat="server" />
                </div>
            </div>
            <div id="dialogShareTemp" title="共享模板" style="display: none;">
                模板名：<input value="" type="text" id="txtShareTemplateName" style="width: 210;" />
                <br />
                <label id="shareInfo" style="color: Red">
                </label>
                <input type="hidden" id="hiddenShareTempID" />
            </div>
            <div id="dialogFolder" title="新建文件夹" style="display: none;">
                名称：<input value="" type="text" id="txtFolderName" style="width: 210;" />
                <br />
                <label id="folderInfo" style="color: Red">
                </label>
                <input type="hidden" id="hiddenParentFolderID" /><input type="hidden" id="hiddenFolderSNames" />
            </div>
            <div id="dialogRename" title="报表重命名" style="display: none;">
                <table>
                    <tr style="height: 22px;">
                        <td>名称:
                        </td>
                        <td style="text-align:left;">
                            <input id="txtName" type="text" style="width: 160px;" />
                        </td>
                    </tr>
                    <tr id="trDesc">
                        <td valign="top">描述:
                        </td>
                        <td>
                            <textarea rows="3" cols="10" id="txtDesc" style="overflow: auto; width: 160px;"></textarea>
                        </td>
                    </tr>
                </table>
                <label id="renameInfo" style="color: Red">
                </label>
                <input type="hidden" id="hiddenSNames" />
                <input type="hidden" id="hiddenObjid" />
            </div>
            <div id="dialogRenameFolder" title="文件夹重命名" style="display: none;">
                <table>
                    <tr style="height: 22px;">
                        <td>名称:
                        </td>
                        <td>
                            <input id="txtNameFolder" type="text" style="width: 160px;" />
                        </td>
                    </tr>
                </table>
                <label id="renameInfoFolder" style="color: Red">
                </label>
                <input type="hidden" id="hiddenSNamesFolder" />
                <input type="hidden" id="hiddenObjidFolder" />
            </div>
            <div id="dialogHelp" title="自定义分析说明">
                <iframe id="frameHelp" width="100%" height="100%" frameborder="0"></iframe>
            </div>
            <div id="dialogCsvExport">
            </div>
            <div id="dialogDimDay" style="display: none;">
                <input id="chkDayRange" type="checkbox" />范围<br />
                <div id="divDateRange">
                    <table border="0">
                        <tr>
                            <td id="tdDateStart">
                                <input type="text" id="dimDayStart" class="ui-button-text" style="width: 120px;" />
                                <a href="#" class="linkAutoDay">昨天</a><br />
                                <a href="#" class="linkAutoDay">前天</a><br />
                                <a href="#" class="linkAutoDay">今天</a><br />
                                <a href="#" class="linkAutoDay">上周同一天</a><br />
                                <a href="#" class="linkAutoDay">上月同一天</a>
                            </td>
                            <td valign="top">
                                <span style="padding: 4px;">--</span>
                            </td>
                            <td id="tdDateEnd">
                                <input type="text" id="dimDayEnd" class="ui-button-text" style="width: 120px;" />
                                <a href="#" class="linkAutoDay">昨天</a><br />
                                <a href="#" class="linkAutoDay">前天</a><br />
                                <a href="#" class="linkAutoDay">今天</a><br />
                                <a href="#" class="linkAutoDay">上周同一天</a><br />
                                <a href="#" class="linkAutoDay">上月同一天</a>
                            </td>
                        </tr>
                    </table>
                </div>
                <div id="divDateList">
                    <div id="divAutoDate" style="padding: 2px;">
                        <a href="#" class="linkAutoDay">昨天</a>
                        <a href="#" class="linkAutoDay">前天</a>
                        <a href="#" class="linkAutoDay">今天</a>
                        <a href="#" class="linkAutoDay">上周同一天</a>
                        <a href="#" class="linkAutoDay">上月同一天</a>
                    </div>
                    <div id="divDatePicker1">
                    </div>
                    <div style="clear: left;" id="divDayChecked">
                    </div>
                </div>
            </div>
            <div id="dialogRelatedMea" style="display: none;"></div>
            <div id="dialogRule" style="display:none;">

            </div>
        </div>
    </form>
    <input runat="server" id="hidanastr" type="hidden" />
</body>
</html>
