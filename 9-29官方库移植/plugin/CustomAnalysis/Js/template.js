
$.jstree._themes = "../Css/jstree/themes/";
var templatetabtype = $.url.param("tabtype");
var currentTemplateId = $.url.param("templateid");
var currentTemplate;
var curDimInfo = null;
var firstMeaID = null;
$(document).ready(function () {
    var curPageHeight = pageHeight();
    $("#divTmpSetting").css("height", curPageHeight - 36 + "px");
    $("#meaTree").css("height", curPageHeight - 112 + "px");
    $("#tablecol").css("height", curPageHeight - 161 + "px");
    $("#tablebody").parent().css("height", curPageHeight - 161 + "px");
    $("#meaSliceDiv").css("height", (curPageHeight - 151) / 2 - 30 + "px");
    $("#relaSliceTxtArea").css("height", ((curPageHeight - 151) / 2 - 82) + "px");
    $("#meaSliceSettingDiv").css("height", (curPageHeight - 151) / 2 - 30 + "px");
    var curPageWidth = pageWidth();
    $("#divSmartGrid").css("width", curPageWidth);
    if (templatetabtype == "Edit") {
        TemplateInit($.url.param("templateid"));
    }
    else {
        InitTreeMeasure();
        CheckSubscribeNotRead();
    }
    $("#coldimlist").sortable();
    $("#rowdimlist").sortable();
    $("#colmealist").sortable();
    $("#coldimlist").disableSelection();
    $("#rowdimlist").disableSelection();
    $("#colmealist").disableSelection();
    InitDialog();
    $("#btnSave").click(Save);
    $("#txtMeasureSearch").val("指标检索").css("color", "#C2BDBE").focusin(function () {
        if ($(this).val() == "指标检索") {
            $(this).css("color", "#000").val("");
        }
    }).focusout(function () {
        if ($(this).val() == "") {
            $(this).css("color", "#C2BDBE").val("指标检索");
        }
    });
    $("#btnMeasureSearch").click(SearchMeasure);
    $("select[id$=selectCube]").change(function () {
        InitTreeMeasure();
        $("#coldimlist").empty();
        $("#rowdimlist").empty();
        $("#colmealist").empty();
        $("#meaSlice").empty();
        var len = $("#tableChoice").find("tr.ca_slice_body") - 1;
        $("#tableChoice").find("tr.ca_slice_body:lt(" + len + ")").remove();
        $("#divFilter").height($("#divFilter").height() + 23 * len);
        $("#tablecol").height($("#tablecol").height() - 23 * len);
        $("#tablebody").parent().height($("#tablebody").parent().height() - 23 * len);
        $("#relaSliceTxtArea").empty();
        $("#sliceRelaBtn").hide();
        return false;
    });

    $("select[id$=selectCubeFolder]").change(function () {
        InitSelectCube();
        return false;
    });

    $("#operatorReg button").each(function () {
        $(this).click(function () {
            $("#inputForCal").focus();
            $("#inputForCal").insertAtCaret(" " + $.trim($(this).text()) + " ");
        });
    });
    $("#msrInput button").each(function () {
        $(this).click(function () {
            $("#msrInput_input").focus();
            $("#msrInput_input").insertAtCaret($.trim($(this).text()) + " ");
        });
    });
    initForMeaSlice();
    bindSliceForChart();
    InitTemplateSaveFolder();
    $("#rdoGridChart").click(function () {
        $("#fieldChart").show();
    });
    $("#rdoChart").click(function () {
        $("#fieldChart").show();
    });
    $("#rdoGrid").click(function () {
        $("#fieldChart").hide();
    });
    $("#ddlSwapCol").change(function () {
        ddlSwapColChange();
    });
    $("#chkRowColSwap").change(function () {
        if ($(this).prop("checked")) {
            $("#chkDimStat").prop("checked", false);
            $("#fieldRowColSwap").show();
            $("#fieldDimStat").hide();
            $("#divStatDims").find(":checkbox").prop("checked", false);

        }
        else {
            $("#fieldRowColSwap").hide(); $("#ddlSwapCol").val("-1");
            ddlSwapColChange();
        }
    });
    $("#chkDimStat").change(function () {
        if ($(this).prop("checked")) {
            $("#chkRowColSwap").prop("checked", false);
            $("#fieldDimStat").show();
            $("#fieldRowColSwap").hide();
        }
        else {
            $("#fieldDimStat").hide();
        }
        InitDdlSortCol();
    });
});

function InitTemplateSaveFolder() {
    $("#txtTmpFolder").click(function () {
        var divfolder = $("#divTmpFolder");
        if (divfolder.css("display") == "none") {
            divfolder.show();
        }
        else {
            divfolder.hide();
        }
    });
}

function InitSelectCube(cubeid) {
    var selcube = $("select[id$=selectCube]");
    selcube.empty();
    selcube.load("../pages/Handler.ashx?datatype=cube&folderid=" + $("select[id$=selectCubeFolder]").val() + "&userid=" + $("input[id$=hiddenUserID]").val(),
    function () { if (cubeid != null) { selcube.val(cubeid); } InitTreeMeasure(); });
}

function CheckSubscribeNotRead() {
    $.ajax({
        cache: false,
        type: "POST",
        url: "../pages/HandlerSubscribe.ashx",
        data: {
            userid: $("input[id$=hiddenUserID]").val()
        },
        datatype: "text",
        success: function (data) {
            if (data == "1") {
                alertDialog("消息", "您的订阅有新文件生成，请进入到订阅界面查看");
            }
        }
    });
}

//功能描述：指标检索
//创建标识：周章雄 20101119
function SearchMeasure() {
    var txtMea = $.trim($("#txtMeasureSearch").val());
    if ($("#lisearchmeasure").length > 0) {
        $("#lisearchmeasure").remove();
    }
    if (txtMea == "" || txtMea == "指标检索") {
        return false;
    }
    else {

        //将搜索到的指标添加在树的末尾
        var lis = $("#meaTree li:eq(0)").find("li[id^=mea_]");
        if (lis.length > 0) {
            var meaSearchNode = $("<li id=\"lisearchmeasure\" class=\"jstree-open \"><ins class=\"jstree-icon\">&nbsp;</ins><a ico=\"jstree-icon\"  href=\"#\"><ins class=\"jstree-icon\">&nbsp;</ins><b>搜索结果</b></a></li>");
            var meaSearchUl = $("<ul></ul>");
            lis.each(function () {
                if (contains($(this).text(), txtMea, true) && meaSearchUl.find("li[id='" + $(this).attr("id") + "_search" + "']").length == 0) {
                    $(this).clone().attr("id", $(this).attr("id") + "_search").appendTo(meaSearchUl);
                }
            });
            if (meaSearchUl.find("li:eq(0)").length > 0) {
                meaSearchNode.append(meaSearchUl).prependTo($("#meaTree ul:eq(0)"));
            }
        }
        $("#meaTree").attr("scrollTop", "0");
    }
    return false;
}

//消息框初始化
//创建标识：周章雄 20101102
function InitDialog() {
    $("#dialogFiltColDim").dialog({
        autoOpen: false,
        height: 300,
        maxHeight: 600,
        //        show: "blind",
        modal: true,
        buttons: {
            "确定": function () {
                var diminfo = $("#" + $(this).find("input:hidden").val()).next("input:hidden");
                var dimvalue = diminfo.val().substr(0, diminfo.val().lastIndexOf('$'));
                dimvalue = dimvalue.substr(0, dimvalue.lastIndexOf('$'));
                dimvalue = dimvalue + "$" + $("#selectDimValType").val() + "$";
                //dimvalue = dimvalue + "$";
                var levelVal = "";
                if ($("#selectDimValType").val() == "Sql") {
                    levelVal = $("#txtDimSql").text();
                }
                else {
                    $(this).find("input:checkbox:checked").each(function () { levelVal = levelVal + $(this).next("span").text().replace(",", "◎").replace(":", "㊣") + ","; });
                    levelVal = levelVal.substr(0, levelVal.lastIndexOf(','));
                }
                dimvalue += levelVal;
                var levelDivID = $(this).find("input[id=cellHid]").val();
                if (contains(levelDivID, "_slice_", true)) {
                    $("#" + levelDivID).parent().nextAll("td:eq(1)").find(":text").val(levelVal.replace("◎", ",").replace("㊣", ":"));
                }
                diminfo.val(dimvalue);
                $(this).dialog('close');
            },
            "取消": function () {
                $(this).dialog('close');
            }

        }
    });
    $("#dialogSave").dialog({
        autoOpen: false,
        modal: true,
        width: 400,
        maxHeight: 480,
        height: 292,
        buttons: {
            "确定": function () { SaveTemplate(); },
            "取消": function () {
                $(this).dialog('close');
            }

        }
    });
    $("#dialogOptions").dialog({
        width: 560,
        maxHeight: 480,
        autoOpen: false,
        modal: true,
        buttons: {
            "确定": function () {
                SetTemplateSetting();
                $(this).dialog('close');
            },
            "取消": function () {
                $(this).dialog('close');
            }

        }
    });
    $("#alertinfo").dialog({
        autoOpen: false,
        modal: true,
        buttons: { "确定": function () { $(this).dialog('close'); } }
    });
    $("#dialogMeaSlice").dialog({
        minWidth: 480,
        autoOpen: false,
        modal: true
    });
    $("#sliceRelaConfig").dialog({
        minWidth: 800,
        minHeight: 300,
        autoOpen: false,
        modal: true,
        buttons: {
            "确定": function () {
                if ($.trim($("#msrInput_input").text()) === "") {
                    $("#errorTip").text("请输入条件配置公式")
                }
                else {
                    var input = $("#msrInput_input").text();
                    if (isMatching(input)) {
                        $("#meaSliceList>li>button>span").each(function () {
                            var reg = $(this).find("span:eq(0)").text();
                            var beReplace = $(this).find("span:eq(1)").text();
                            input = input.replace(reg, beReplace);
                        });
                        $("#relaSliceTxtArea").text(input);
                        $(this).dialog('close')
                    }
                    else {
                        $("#errorTip").text("条件表达式错误！")
                    }
                }
            },
            "取消": function () {
                $(this).dialog('close');
                $("#msrInput_input").text("");
                $("#msrInput_input").setCaret();
            }
        }
    });
    $("#meaMeta").dialog({
        width: 600,
        height: 400,
        autoOpen: false, maxHeight: 560,
        modal: true,
        buttons: {
            "确定": function () {
                $("#meaName_meta").empty();
                $("#display_meta").empty();
                $("#unit_meta").empty();
                $("#calculate_meta").empty();
                $("#tbName_meta").empty();
                $("#relaDim_meta").empty();
                $(this).dialog('close');
            },
            "取消": function () {
                $(this).dialog('close');
            }
        }
    });
    $("#sqlStrDia").dialog({
        width: 600,
        height: 400,
        autoOpen: false,
        modal: true,
        buttons: {
            "复制": function () {
                copyToClipboard($("#sqlStr").text());
            },
            "取消": function () {
                $(this).dialog('close');
            }
        }
    });
    $("#linkDia").dialog({
        width: 450,
        autoOpen: false,
        modal: true,
        buttons: {
            "确定": function () {
                var orgid = $("#linkDia input[type=hidden]").val();
                $("#rowdimlist input[id^=" + orgid + "]").val($("#linkTxt").val());
                $(this).dialog('close');
            },
            "取消": function () {
                $(this).dialog('close');
            }
        }
    });
    $("#cellDia").dialog({
        width: 500,
        maxHeight: 500,
        autoOpen: false,
        modal: true,
        buttons: {
            "确定": function () {
                var dim = $(this).find("input[id=cellHid]").data("dimobj");
                var valContainerID = $(this).find("input[id=cellHid]").val();
                var selnes = "";
                if ($("#selectDimValType").val() == "Sql") {
                    selnes = $("#txtDimSql").text();
                    dim.ValType = 8;
                }
                else {
                    $("#seleCell input:checkbox:checked").each(function () {
                        selnes += $(this).val().replace(",", "◎").replace(":", "㊣") + ",";
                    });
                    if ($("#selectDimValType").val() == "NotIn") {
                        dim.ValType = 2;
                    }
                    selnes = selnes.substr(0, selnes.lastIndexOf(","));
                }
                dim.Val = selnes;
                dim.ValList = selnes.split(",");
                if (valContainerID != undefined && valContainerID.startWith("slice_")) {
                    $("#" + valContainerID).val(selnes.replace("◎", ",").replace("㊣", ":"));
                }
                $(this).dialog('close');
            },
            "取消": function () {
                $(this).dialog('close');
            }
        }
    });
    $("#dialogShareTemp").dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "确定": function () {
                if (frameTree.menuflag == "share") {
                    var name = $("#txtShareTemplateName").val();
                    $.ajax({
                        url: "Tree.ashx",
                        type: "POST",
                        datatype: "json",
                        data: {
                            datatype: "ShareTemp",
                            tempID: $("#hiddenShareTempID").val(),
                            tempShareName: name
                        },
                        success: function (data) {
                            if (data == "") {
                                //共享成功，修改节点图标
                                window.parent.frames[0].ShareTemp(name);
                                $("#dialogShareTemp").dialog('close');
                            }
                            else {
                                $("#shareInfo").text(data);
                            }
                        },
                        error: function () {
                        }
                    });
                }
            },
            "取消": function () {
                $(this).dialog('close');
            }

        }
    });
    $("#dialogHelp").dialog({
        autoOpen: false,
        modal: true,
        width: 720,
        height: 440
    });
    $("#dialogRename").dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "确定": function () {
                if (frameTree.menuflag == "RenameTemp") {
                    var name = $("#txtName").val();
                    var desc = $("#txtDesc").val();
                    $.ajax({
                        url: "Tree.ashx",
                        type: "POST",
                        datatype: "json",
                        data: {
                            datatype: frameTree.menuflag,
                            sName: $("#hiddenSNames").val(),
                            reID: $("#hiddenObjid").val(),
                            reName: name,
                            reDesc: desc
                        },
                        success: function (data) {
                            if (data == "") {
                                window.parent.frames[0].RenameTemp(name, desc);
                                $("#dialogRename").dialog('close');
                            }
                            else {
                                $("#renameInfo").text(data);
                            }
                        },
                        error: function () {
                        }
                    });
                }
            },
            "取消": function () {
                $(this).dialog('close');
            }

        }
    });
    $("#dialogRenameFolder").dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "确定": function () {
                if (frameTree.menuflag == "RenameFolder") {
                    var name = $("#txtNameFolder").val();
                    $.ajax({
                        url: "Tree.ashx",
                        type: "POST",
                        datatype: "json",
                        data: {
                            datatype: frameTree.menuflag,
                            sName: $("#hiddenSNamesFolder").val(),
                            reID: $("#hiddenObjidFolder").val(),
                            reName: name
                        },
                        success: function (data) {
                            if (data == "") {
                                window.parent.frames[0].RenameFolder(name);
                                $("#dialogRenameFolder").dialog('close');
                            }
                            else {
                                $("#renameInfoFolder").text(data);
                            }
                        },
                        error: function () {
                        }
                    });
                }
            },
            "取消": function () {
                $(this).dialog('close');
            }

        }
    });
    $("#dialogFolder").dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "确定": function () {
                if (frameTree.menuflag == "newfolder") {
                    var username = $("input[id$=hiddenUserID]").val();
                    if (username == undefined || username == "") {
                        username = "-1";
                    }
                    var foldername = $("#txtFolderName").val();
                    $.ajax({
                        url: "Tree.ashx",
                        type: "POST",
                        datatype: "json",
                        data: {
                            datatype: "NewFolder",
                            parentfolder: $("#hiddenParentFolderID").val(),
                            foldersname: $("#hiddenFolderSNames").val(),
                            foldername: foldername,
                            username: username
                        },
                        success: function (data) {
                            if (data.indexOf("￥") < 0) {
                                $("#folderInfo").text(data);
                            }
                            else {
                                window.parent.frames[0].NewFolder(data.replace("￥", ""), foldername);
                                $("#dialogFolder").dialog('close');
                            }
                        },
                        error: function () {
                        }
                    });
                }
            },
            "取消": function () {
                $(this).dialog('close');
            }

        }
    });
}

//指标过滤相关初始化
//创建标识：lyh 20120320
function initForMeaSlice() {
    $("#sliceRelaBtn").button();
    $("#sliceRelaBtn").hide();
    $("#msrInput button").button();
    $("#msrInput_input").setCaret();
    $("#userInput").focus(function () {
        $("#errorTipForMS").empty();
    });
    $("#msrInput_input").focus(function () {
        $("#errorTip").empty();
    });
    $("#meaName").focus(function () {
        $("#errorTipForCal").empty();
    });
    $("#inputForCal").focus(function () {
        $("#errorTipForCal").empty();
    });
    $("#inputForCal").setCaret();
    $("#mlForCal button").each(function () {
        $(this).click(function () {
            $("#inputForCal").focus();
            $("#inputForCal").insertAtCaret($(this).text().substring($(this).text().indexOf('>') + 2, $(this).text().length));
        });
    });
    $("#btnExpend1").click(function () {
        if ($(this).data("isexpand") == "1") {
            $("#tablebody").animate({ height: '94%' }, 1000);
            $("#filterDiv").animate({ height: '6%' }, 1000);
            $('#meaSliceDiv').slideUp(1000);
            $('#meaSliceSettingDiv').slideUp(1000);
            $(this).text("展开︽");
            $(this).data("isexpand", "0");
        }
        else {
            $("#tablebody").animate({ height: '50%' }, 1000);
            $("#filterDiv").animate({ height: '50%' }, 1000);
            $('#meaSliceDiv').slideDown(1000);
            $('#meaSliceSettingDiv').slideDown(1000);
            $(this).text("收起︾");
            $(this).data("isexpand", "1");
        }
    });
}

//弹出指标过滤条件关系对话框
//创建标识：lyh 20120320
function showMeaSliceRelaDialog() {
    var ms_ul = $("#meaSlice>li");
    $("#meaSliceList").empty();
    ms_ul.each(function () {
        var msli = $("<li style='width:100%'><button style='width:100%;text-align:left'>" + $(this).html() + "</button></li>");
        $("#meaSliceList").append(msli);
    });
    $("#meaSliceList button").button();
    $("#meaSliceList button:lt(4)").each(function () {
        $(this).click(function () {
            $("#msrInput_input").focus();
            $("#msrInput_input").insertAtCaret($(this).find(">span>span:eq(0)").text() + " ");
        });
    });
    $("#btnMeaCondDefault").click(function () {
        var arr = [];
        $("#meaSliceList>li>button>span>span:even").each(function (i) {
            arr.push($(this).text());
        });
        $("#msrInput_input").text(arr.join(" AND "));
    });
    $("#btnMeaCondClear").click(function () {
        $("#msrInput_input").text("");
    });
    var formula = $("#relaSliceTxtArea").text();
    $("#meaSlice>li").each(function () {
        formula = formula.replace($(this).find("span:eq(1)").text(), $(this).find("span:eq(0)").text());
    });
    $("#msrInput_input").text(formula);
    $('#sliceRelaConfig').dialog('open');
    $("#msrInput_input").focus();
}

//正则匹配指标过滤条件配置中的用户输入 
//创建标识：lyh 20120321
function isMatching(userInput) {
    //替换待匹配字符串中的‘and’‘or’
    var userInput_cg = $.trim(userInput.replace(/and/gi, "&").replace(/or/gi, "@").replace(/\s/g, ""));
    //初步检验 排除有其他字符出现
    if (/[^\(\)0-9<>&@]/.test(userInput_cg))
        return false;
    //初始化正则匹配公式
    var regx;
    var meaCount = eval("'" + $("#meaSliceList button").length + "'");
    var meaFlag = "[1-" + meaCount[0] + "]";
    for (j = 0; j < meaCount.length; j++) {
        if (j > 0) {
            meaFlag += "[0-";
            meaFlag += meaCount[j];
            meaFlag += "]";
        }
    }
    regx = eval("/^(~|<" + meaFlag + ">)([&@](~|<" + meaFlag + ">))*$/");
    //检验嵌套括号内的内容
    var stack = new Stack();
    var uiArray = userInput_cg.split('');
    for (i = 0; i < uiArray.length; i++) {
        stack.Push(uiArray[i]);
        if (uiArray[i] === ')') {
            var part = new Array();
            var count = stack.GetSize();
            for (m = 0; m < count; m++) {
                var pop = stack.Pop();
                part.push(pop);
                if (pop === "(")
                    break;
                else {
                    if (stack.GetSize() == 0) {
                        return false;
                    }
                }
            }
            stack.Push("~");
            part = (part.reverse()).toString().replace(/,/g, "").replace("(", "").replace(")", "");
            if (regx.test(part) == false)
                return false;
        }
    }
    //检验最终字符串
    var finalStr = stack.toString();
    return regx.test(finalStr);
}

//正则匹配计算列配置中的用户输入 
//创建标识：lyh 20120323
function isCalMatching(userInput) {
    if (userInput.length > 2 && userInput[0] === "'" && userInput[userInput.length - 1] === "'") return true;

    var ml = $("#mlForCal button");
    var input = userInput;
    for (i = 0; i < ml.length; i++) {
        var temp = '\\' + $(ml[i]).text().substring($(ml[i]).text().indexOf('['), $(ml[i]).text().indexOf(']')) + '\\]';
        mex = eval('/' + temp.replace(/\(/, "\\(").replace(/\)/, "\\)") + '/g');
        if (mex.test(userInput)) {
            input = input.replace(mex, $(ml[i]).text().substring(0, $(ml[i]).text().indexOf(' ')));
        }
    }
    var userInput_cg = $.trim(input.replace(/\s/g, ""));
    //初步检验 排除有其他字符出现
    if (/[^\(\)0-9<>\-\+\*\/\.]/.test(userInput_cg))
        return false;
    //初始化正则匹配公式
    var regx;
    var meaCount = $("#mlForCal button").length;
    var firstDigit = meaCount;
    var secondDigit = "";
    if (meaCount > 10) {
        firstDigit = meaCount / 10 + "";
        secondDigit = meaCount % 10 + "";
    }
    //    var meaFlag = "[1-" + firstDigit + "]";
    //    if (secondDigit.length > 0) {
    //        meaFlag = "[1-9]|" + "[1-" + firstDigit + "][0-";
    //        meaFlag += "9";// secondDigit;
    //        meaFlag += "]";
    //    }
    var meaFlag = "[0-9]*[1-9][0-9]*";
    regx = eval("/^((~|<" + meaFlag + ">)|([0-9]+\\.[0-9]*)?[1-9][0-9]*)([\\+\\-\\*\\/]((~|<"
            + meaFlag + ">)|([0-9]+\\.[0-9]*)?[1-9][0-9]*))*$/");
    //检验嵌套括号内的内容
    var stack = new Stack();
    var uiArray = userInput_cg.split('');
    for (i = 0; i < uiArray.length; i++) {
        stack.Push(uiArray[i]);
        if (uiArray[i] === ')') {
            var part = new Array();
            var count = stack.GetSize();
            for (m = 0; m < count; m++) {
                var pop = stack.Pop();
                part.push(pop);
                if (pop === "(")
                    break;
                else {
                    if (stack.GetSize() == 0) {
                        return false;
                    }
                }
            }
            stack.Push("~");
            part = (part.reverse()).toString().replace(/,/g, "").replace("(", "").replace(")", "");
            if (regx.test(part) == false)
                return false;
        }
    }
    //检验最终字符串
    var finalStr = stack.toString();
    return regx.test(finalStr);
}

//弹出消息框
//title：消息框标题  content：消息框中内容
//创建标识：周章雄 20101102
function alertDialog(title, content) {
    var alertdiv = $("#alertinfo")
    alertdiv.empty();
    alertdiv.attr("title", title).append($("<span>" + content + "</span>"));
    alertdiv.dialog("option", "title", title);
    alertdiv.dialog('open');
}


//指标 维度选择树加载
function InitTreeMeasure(tmpltFileName, meaid) {
    var meadimurl = "";
    if (meaid != undefined && meaid != "") {
        meadimurl = "../pages/Handler.ashx?datatype=meadim&anameaid=" + meaid;
    }
    else if (tmpltFileName != undefined && tmpltFileName != "") {
        meadimurl = "../pages/Handler.ashx?datatype=meadim&filename=" + tmpltFileName;
    }
    else {
        meadimurl = "../pages/Handler.ashx?datatype=meadim&cube=" + $("[id$=selectCube]").val();
    }
    $("#meaTree")
                .jstree({
                    "xml_data": {
                        "ajax": {
                            "url": meadimurl
                        },
                        "xsl": "nest"
                    },
                    "plugins": ["themes", "xml_data", "ui", "cookies", "dnd"],
                    "dnd": {
                        "drop_finish": function (data) {
                            var isExist = false;
                            var meaOrDim = data.o.attr("id").split('_')[0];
                            if (meaOrDim == "mea") {
                                for (var j = 0; j < data.o.length; j++) {
                                    meaOrDim = $(data.o[j]).attr("id").split('_')[0];
                                    isExist = false;
                                    var meaDimText = $.trim($(data.o[j]).text());
                                    var meaID = $(data.o[j]).attr("id").substring(4, $(data.o[j]).attr("id").indexOf("￥"));
                                    if ((data.r[0].id == "tablebody" || data.r.parent().parent().attr("id") == "tablebody") && $(data.o[j]).find("ul").length == 0) {
                                        $("#colmealist").find("li>div").each(function () {
                                            if ($.trim($(this).text()) === meaDimText) {
                                                isExist = true; return;
                                            }
                                        });
                                        if (isExist == false) {
                                            var newcolli = $("<li class=\"ui-widget ui-state-default ui-button-text-only\">");
                                            newcolli.append($("<div>" + meaDimText + "</div>"));
                                            var meaItemID = $(data.o[j]).attr("id");
                                            var meaobj = "{" + "\"MeasureID\":\"" + meaID + "\",\"DisplayName\":\"" + meaDimText.replace(/\\/, "\\\\") +
                                        "\",\"Unit\":\"" + meaItemID.substring(meaItemID.indexOf("￥") + 1).replace("_search", "") + "\",\"MeasureType\":\"0\",\"Decimal\":\"\"}";
                                            newcolli.data("meaobj", $.parseJSON(meaobj));
                                            $("#colmealist").append(newcolli);
                                            SetMeasureMenu();
                                            SetCustomMeaMenu();
                                        }
                                    }
                                    else if ((data.r[0].id == "meaSliceDiv" || data.r.parent().parent().attr("id") == "meaSliceDiv") && $(data.o[j]).find("ul").length == 0) {
                                        $("#meaSlice").find("li>div").each(function () {
                                            if ($.trim($(this).text()) === meaDimText) {
                                                isExist = true; return;
                                            }
                                        });
                                        if (isExist == false) {
                                            $("#dialogMeaSlice span:eq(0)").text(meaDimText);
                                            $("#dialogMeaSlice input").val("");
                                            var meaItemID = $(data.o[j]).attr("id");
                                            $("#spanSliceMeaUnit").text(meaItemID.substring(meaItemID.indexOf("￥") + 1).replace("_search", ""));
                                            $("#dialogMeaSlice").dialog("option", "buttons", {
                                                "确定": function () {
                                                    var dia = $(this);
                                                    var mea = { MeasureID: meaid, DisplayName: meaDimText, Unit: $("#spanSliceMeaUnit").text(), MeasureType: 0, IsCondition: true }
                                                    addMeaSliceConfirm(dia, mea);
                                                },
                                                "取消": function () {
                                                    $(this).find("span").empty();
                                                    $(this).find("#userInput").val("");
                                                    $(this).dialog('close');
                                                }
                                            });
                                            $("#dialogMeaSlice").dialog('open');
                                            $("#dialogMeaSlice input").focus();
                                            $("#dialogMeaSlice input").focus(function () {
                                                $("#errorTipForMS").text("");
                                            });
                                            $("#sliceRelaBtn").fadeIn(500);
                                            break;
                                        }

                                    }
                                }
                            }
                            else if (meaOrDim == "level" || meaOrDim == "hierlevel") {
                                if (data.r[0].id == "tableheader" || data.r.parent().parent().attr("id") == "tableheader") {
                                    AddDim(data, "coldimlist");
                                }
                                else if (data.r[0].id == "tablecol" || data.r.parent().parent().attr("id") == "tablecol") {
                                    AddDim(data, "rowdimlist");
                                }
                                else if (data.r[0].id == "divFilter" || data.r.parent().parent().parent().attr("id") == "tableChoice") {
                                    SetDimFilter(data);
                                }
                            }
                        },
                        "drag_check": function (data) {
                            return {
                                after: true,
                                before: true,
                                inside: false
                            };
                        },
                        "drag_finish": function (data) {
                        }
                    },
                    // Using types - most of the time this is an overkill
                    // Still meny people use them - here is how
                    "types": {
                        // I set both options to -2, as I do not need depth and children count checking
                        // Those two checks may slow jstree a lot, so use only when needed
                        "max_depth": -2,
                        "max_children": -2,
                        // I want only `drive` nodes to be root nodes 
                        // This will prevent moving or creating any other type as a root node
                        "valid_children": ["drive"],
                        "types": {
                            // The `drive` nodes 
                            "drive": {
                                // those options prevent the functions with the same name to be used on the `drive` type nodes
                                // internally the `before` event is used
                                "start_drag": false,
                                "move_node": false,
                                "delete_node": false,
                                "remove": false
                            }
                        }
                    },
                    "themes": {
                        "theme": "default",
                        "dots": true,
                        "icons": true
                    }
                });
}

function addMeaSliceConfirm(dia, mea) {
    var reg = /^\-?((\d+\.\d+|[1-9][0-9]*)|0)$/g;
    if (reg.test($.trim($("#userInput").val()))) {
        var $meaSlice = $("#meaSlice");
        var thresholdvalue = dia.find("#userInput").val();
        var condexpression = "[" + $("span:eq(0)", dia).text() + "] " + dia.find("select").val() + " " + thresholdvalue;
        if ($.trim($("#relaSliceTxtArea").text()) != "") {
            $("#relaSliceTxtArea").text($("#relaSliceTxtArea").text() + " AND " + condexpression);
        }
        else {
            $("#relaSliceTxtArea").text(condexpression);
        }
        var newcolli = $("<li class=\"ui-widget ui-state-default ui-button-text-only\">");
        var num = $meaSlice.find("li").length + 1;
        newcolli.append($("<span><" + num + "></span>&nbsp;<span>" + condexpression + "</span>"));
        newcolli.data("meaobj", mea);
        $meaSlice.append(newcolli);
        SetMeaSliceMenu();
        dia.dialog('close');
        $("#tablebody").animate({ height: '50%' }, 1000);
        $("#filterDiv").animate({ height: '50%' }, 1000);
        $('#meaSliceDiv').slideDown(1000);
        $('#meaSliceSettingDiv').slideDown(1000);
        $("#btnExpend1").text("收起︾");
        $("#btnExpend1").data("isexpand", "1");
    }
    else {
        $("#errorTipForMS").text("请输入有效的数字！");
    }
}

//功能描述：设置指标Drag后的指标右键菜单
//创建标识：周章雄 20101102
function SetMeasureMenu() {
    $('#colmealist').find("li[class!=NewMea]").contextMenu('myMenu1', {

        onShowMenu: function (e, menu) {
            if (contains($(e.target).text(), '环比', false) || contains($(e.target).text(), '同比', false)) {
                $(menu).find("li:gt(4)").prop("disabled", true);
            }
            return menu;
        },

        bindings: {
            "del": function (t) {
                $(t).remove();
            },
            "chgdispname": function (t) {
                var mea = $.extend({}, $(t).data("meaobj"));
                $("#txtMeaDispName").val(mea.DisplayName);
                $("#diaMeaDispName").dialog({
                    width: 400,
                    autoOpen: true,
                    modal: true,
                    buttons: {
                        "确定": function () {
                            var mesdisname = $.trim($("#txtMeaDispName").val());
                            if (mesdisname != "" && mesdisname != mea.DisplayName) {
                                mea.DisplayName = mesdisname;
                                $(t).find("div:first").text(mesdisname);
                                $(t).data("meaobj", mea);
                            }
                            $(this).dialog('close');
                        },
                        "取消": function () {
                            $(this).dialog('close');
                        }
                    }
                });
            },
            "chgdecimal": function (t) {
                var mea = $.extend({}, $(t).data("meaobj"));
                $("#selMeaDecimal").val(mea.Decimal);
                $("#diaMeaDecimal").dialog({
                    width: 400,
                    autoOpen: true,
                    modal: true,
                    buttons: {
                        "确定": function () {
                            var mesdecimal = $("#selMeaDecimal").val();
                            if (mesdecimal != mea.Decimal) {
                                mea.Decimal = mesdecimal;
                                $(t).data("meaobj", mea);
                            }
                            $(this).dialog('close');
                        },
                        "取消": function () {
                            $(this).dialog('close');
                        }
                    }
                });
            },
            "filter": function (t) {
                var mea = $.extend({}, $(t).data("meaobj"));
                $("#dialogMeaSlice span:eq(0)").text(mea.DisplayName);
                $("#dialogMeaSlice input").val("");
                $("#spanSliceMeaUnit").text(mea.Unit == undefined ? "" : mea.Unit);
                $("#dialogMeaSlice").dialog("option", "buttons", {
                    "确定": function () {
                        var dia = $(this);
                        addMeaSliceConfirm(dia, mea);

                    },
                    "取消": function () {
                        $(this).dialog("close");
                    }
                });
                $("#dialogMeaSlice").dialog('open');
                $("#dialogMeaSlice input").focus();
                $("#dialogMeaSlice input").focus(function () {
                    $("#errorTipForMS").text("");
                });
                $("#sliceRelaBtn").fadeIn(500);
            },
            "metaData": function (t) {
                var mea = $(t).data("meaobj");
                $.ajax({
                    url: "../pages/Handler.ashx?datatype=metadata&meaid=" + mea.MeasureID,
                    success: function (data) {
                        var semMea = $(data).find("Sem_Measure");
                        $("#meaName_meta").text(semMea.attr("UniqueName"));
                        $("#display_meta").text(semMea.attr("DisplayName"));
                        $("#unit_meta").text(semMea.attr("Unit"));
                        $("#calculate_meta").text(semMea.attr("Column"));
                        $("#tbName_meta").text(semMea.attr("TableName"));
                        $("#mea_explain").text(semMea.attr("Explain"));
                        var relaDim = "";
                        $(data).find("Sem_Measure RelatedDimensionList Sem_Dimension").each(function () {
                            relaDim += $(this).attr("Name") + " ";
                        });
                        $("#relaDim_meta").text(relaDim);
                        $("#linkMeaDetail").attr("href", "../../Measure/Details.aspx?id=" + semMea.attr("ID"));
                        $("#meaMeta").dialog('open');
                    },
                    dataType: "xml"
                });
            },
            "Ring": function (t) {
                addThbMea(t, 1);
            },
            "RingGrowth": function (t) {
                addThbMea(t, 2);
            },
            "YearOnYear": function (t) {
                addThbMea(t, 3);
            },
            "YearOnYearGrowth": function (t) {
                addThbMea(t, 4);
            },
            "RelatedMea": function (t) {
                addRealtedMea(t);
            }
        },

        menuStyle: {
            border: '1px solid #000'
        },

        itemStyle: {
            fontFamily: 'verdana',
            backgroundColor: '#fff',
            color: '#333',
            border: 'none',
            padding: '1px'
        },

        itemHoverStyle: {
            color: '#fff',
            backgroundColor: '#aaaaaa',
            border: 'none'
        }
    });
}

function addRealtedMea(t) {
    var mea = $(t).data("meaobj");
    $.ajax({
        url: "../pages/Handler.ashx?datatype=relatedmea&meaid=" + mea.MeasureID,
        success: function (data) {
            var meas = $.parseJSON(data);
            var dialog = $("#dialogRelatedMea");
            dialog.empty();
            if (meas.length == 0) {
                dialog.text("此指标无关联指标。");
            }
            else {
                $(meas).each(function () {
                    var chk = $("<input type='checkbox'/>");
                    dialog.append(chk);
                    var relMea = this;
                    chk.data("meaobj", relMea);
                    dialog.append("<span>" + relMea.DisplayName + "</span>");
                    dialog.append("<br/>");
                });
            }
            dialog.dialog({
                width: 400, maxHeight: 400,
                modal: true,
                title: "添加关联指标",
                buttons: {
                    "确定": function () {
                        var limeaori = $(t);
                        dialog.find(":checkbox:checked").each(function () {
                            var isexist = false;
                            var meanewobj = $(this).data("meaobj");
                            $(t).parent().find("li>div").each(function () {
                                if ($(this).text() == meanewobj.DisplayName) {
                                    isexist = true;
                                }
                            });
                            if (!isexist) {
                                var limeanew = $("<li></li>");
                                limeanew.attr("class", limeaori.attr("class"));
                                limeanew.append($("<div>" + meanewobj.DisplayName + "</div>"));
                                limeanew.data("meaobj", meanewobj);
                                $(t).parent().append(limeanew);
                                SetMeasureMenu();
                                SetCustomMeaMenu();
                            }
                        });
                        $(this).dialog('close');
                    },
                    "取消": function () {
                        $(this).dialog('close');
                    }
                }
            });
            $("#dialogRelatedMea").dialog("open");
        },
        dataType: "text"
    });

}

function addThbMea(t, mType) {
    var newMeaName = $("div:first", t).text() + getMeasureTypeDescription(mType);
    var isexist = false;
    $(t).parent().find("li>div").each(function () {
        if ($(this).text() == newMeaName) {
            isexist = true;
        }
    });
    if (isexist) {
        alertDialog("", "已存在该指标。");
        return;
    }
    var tcopy = $(t).clone(true).data("meaobj", $.extend({}, $(t).data("meaobj")));
    var mdiv = $("div:first", tcopy);
    mdiv.text(newMeaName);
    tcopy.data("meaobj").MeasureType = mType;
    if (mType == 1 || mType == 4) {
        tcopy.data("meaobj").Decimal = "2";
        tcopy.data("meaobj").Unit = "%";
    }
    $(t).after(tcopy);
}

function getMeasureTypeDescription(meatype) {
    switch (meatype) {
        case 1: s = "环比值"; break;
        case 2: s = "环比增幅"; break;
        case 3: s = "同比值"; break;
        case 4: s = "同比增幅"; break;
        case 5: s = "同比值"; break;
        case 6: s = "同比增幅"; break;
        default: s = ""; break;
    }
    return s;
}

//功能描述：设置指标过滤拖放区右键菜单
//创建标识：lyh 20120316
function SetMeaSliceMenu() {
    $("#meaSlice").find("li").contextMenu("meaSliceMenu", {
        onShowMenu: function (e, menu) {
            return menu;
        },
        bindings: {
            "delMeaSlice": function (t) {
                $(t).remove();
                $("#meaSlice>li>span:even").each(function (i) {
                    $(this).text("<" + (i + 1) + ">");
                });
                var arr = [];
                $("#meaSlice>li>span:odd").each(function (i) {
                    arr.push($(this).text());
                });
                $("#relaSliceTxtArea").text(arr.join(" AND "));
                if ($("#meaSlice>li").length == 0) {
                    $("#sliceRelaBtn").fadeOut(500);
                }
            },
            "filtMeaSlice": function (t) {
                var oldexp = $(t).find("span:eq(1)").text();
                var exp = oldexp.substring(oldexp.lastIndexOf("]") + 1);
                var mea = $(t).data("meaobj");
                $("#dialogMeaSlice span:eq(0)").text(mea.DisplayName);
                $("#spanSliceMeaUnit").text(mea.Unit);
                var lastequalindex = exp.lastIndexOf("=");
                var lastlagerindex = exp.lastIndexOf(">");
                var lastlessindex = exp.lastIndexOf("<");
                if (lastequalindex < lastlagerindex) lastequalindex = lastlagerindex;
                if (lastequalindex < lastlessindex) lastequalindex = lastlessindex;
                var compare = $.trim(exp.substring(0, lastequalindex + 1));
                $("#userInput").val($.trim(exp.substring(lastequalindex + 1)));
                $(t).find("select").val(compare);
                $("#dialogMeaSlice").dialog("option", "buttons", {
                    "确定": function () {
                        var reg = /^\-?((\d+\.\d+|[1-9][0-9]*)|0)$/g;
                        if (reg.test($.trim($("#userInput").val()))) {
                            var dia = $(this);
                            if ($.trim(dia.find("#userInput").val()) != "") {
                                var thresholdvalue = $.trim(dia.find("#userInput").val());
                                var newexp = "[" + mea.DisplayName + "] " + dia.find("select").val() + " " + thresholdvalue;
                                $(t).find("span:eq(1)").text(newexp);
                                $("#relaSliceTxtArea").text($("#relaSliceTxtArea").text().replace(oldexp, newexp));
                            }

                            $(this).dialog('close')
                        }
                        else {
                            $("#errorTipForMS").text("请输入有效的数字！");
                        }
                    },
                    "取消": function () {
                        $(this).find("span").empty();
                        $(this).find("#userInput").val("")
                        $(this).dialog('close');
                    }
                });
                $("#dialogMeaSlice").dialog('open');
                $("#userInput").focus();
                $("#userInput").focus(function () {
                    $("#errorTipForMS").text("");
                });
                //                $("#dialogMeaSlice").setCaret();
            }
        },
        menuStyle: {
            border: '1px solid #000'
        },

        itemStyle: {
            fontFamily: 'verdana',
            backgroundColor: '#fff',
            color: '#333',
            border: 'none',
            padding: '1px'
        },

        itemHoverStyle: {
            color: '#fff',
            backgroundColor: '#aaaaaa',
            border: 'none'
        }
    });

}

function customMeaConfirm(dialog, meaobj) {
    var formulaText = $.trim($("#inputForCal").val());
    if (formulaText === "") {
        $("#errorTipForCal").text("请输入公式");
    }
    else if ($("#mlForCal button").length <= 0) {
        $("#errorTipForCal").text("基础指标为空！");
    }
    else {
        if (isCalMatching(formulaText)) {
            if ($.trim($("#meaName").val()) === "") {
                $("#errorTipForCal").text("请输入指标名称！");
            }
            else {
                var displayname = $.trim($("#meaName").val());
                var liMeas = $("#colmealist>li")
                var isok = false;
                var sameCnt = 0;
                $("#colmealist>li").each(function () {
                    if ($(this).data("meaobj").DisplayName == displayname) {
                        sameCnt++;
                    }
                });
                if ((meaobj == null && sameCnt == 0) || (meaobj != null && sameCnt < 2)) {
                    isok = true;
                }
                if (isok) {
                    var $newli;
                    if (meaobj != null) {
                        $("#colmealist>li").each(function () {
                            if ($(this).data("meaobj").DisplayName == meaobj.DisplayName) {
                                $newli = $(this);
                                return;
                            }
                        });
                    }
                    else {
                        $newli = $("<li class=\"NewMea\"><div id=\"" + displayname + "\"></div></li>");
                    }
                    $newli.find("div").text(displayname);
                    $newli.attr("title", "计算公式|" + formulaText);
                    var newmeaobj = {
                        ID: "", DisplayName: displayname, MeasureType: 7,
                        Decimal: parseInt($("#ddlCalcColDecimal").val()), Formula: formulaText, Unit: ""
                    };
                    $newli.data("meaobj", newmeaobj);
                    if (meaobj == null) {
                        $("#colmealist").append($newli);
                    }
                    $(".NewMea").cluetip({ local: true, splitTitle: '|', tracking: true, cursor: 'hand', cluetipClass: 'default', arrows: true });
                    setNewMeaMenu();
                    $(dialog).dialog('close');
                    return true;
                }
                else {
                    $("#errorTipForCal").text("指标名称已存在！");
                }
            }
        }
        else {
            $("#errorTipForCal").text("公式错误！");
        }
    }
    return false;
}

//功能描述：设置添加计算列右键菜单
//创建标识：lyh 20120322
function SetCustomMeaMenu() {
    $("#tablebody").contextMenu("customMenu", {
        onShowMenu: function (e, menu) {
            return menu;
        },
        bindings: {
            "customMenuBtn": function (t) {
                showDiaCalMea(null);
            }
        },
        menuStyle: {
            border: '1px solid #000'
        },

        itemStyle: {
            fontFamily: 'verdana',
            backgroundColor: '#fff',
            color: '#333',
            border: 'none',
            padding: '1px'
        },

        itemHoverStyle: {
            color: '#fff',
            backgroundColor: '#aaaaaa',
            border: 'none'
        }
    });

}

function showDiaCalMea(meaobj, cfmexcute) {
    $("#mlForCal").empty();
    var meali = $("#colmealist>li");
    for (i = 0; i < meali.length; i++) {
        var mea = $(meali[i]).data("meaobj");
        if (mea.MeasureType == 0) {
            var dispname = mea.DisplayName;
            $("#mlForCal").append("<li style='width:100%'><button style='width:100%;text-align:left'>" + "<" + (i + 1) + "> [" + dispname + "]</button></li>");
        }
    }
    $("#mlForCal button").button();
    $("#operatorReg button").button();
    if (meaobj != null) {
        $("#meaName").val(meaobj.DisplayName);
        $("#inputForCal").val(meaobj.Formula);
    }
    else {
        $("#meaName").val("");
        $("#inputForCal").val("");
        $("#ddlCalcColDecimal").val("")
    }
    $("#meaCalculate").dialog({
        minWidth: 800,
        minHeight: 300,
        autoOpen: false,
        modal: true,
        buttons: {
            "确定": function () {
                var that = this;
                if (customMeaConfirm(that, meaobj) && cfmexcute == "1") {
                    excuteTemplate();
                }
            },
            "取消": function () {
                $(this).dialog('close');
                $("#meaName").val("");
                $("#inputForCal").val("");
            }
        }
    });
    $("#mlForCal button").each(function () {
        $(this).click(function () {
            $("#inputForCal").insertAtCaret($(this).text().substring($(this).text().indexOf('>') + 2, $(this).text().length));
        });
    });
    $("#meaCalculate").dialog('open');
}

//功能描述：设置自定义指标右键菜单
//创建标识：lyh 20120323
function setNewMeaMenu() {
    $(".NewMea").contextMenu("newMeaMenu", {
        onShowMenu: function (e, menu) {
            return menu;
        },
        bindings: {
            "delNewMea": function (t) {
                $(t).remove();
            },
            "editNewMea": function (t) {
                var mea = $(t).data("meaobj");
                showDiaCalMea(mea);
            }
        },
        menuStyle: {
            border: '1px solid #000'
        },

        itemStyle: {
            fontFamily: 'verdana',
            backgroundColor: '#fff',
            color: '#333',
            border: 'none',
            padding: '1px'
        },

        itemHoverStyle: {
            color: '#fff',
            backgroundColor: '#aaaaaa',
            border: 'none'
        }
    });
}



function Save() {
    if (templatetabtype == "New") {
        var divfolder = $("#divTmpFolder");
        var url = "../pages/handler.ashx?datatype=tmpfolder&userid=" + $("input[id$=hiddenUserID]").val();
        divfolder.jstree({
            "xml_data": {
                "ajax": {
                    "url": url
                },
                "xsl": "nest"
            },
            "plugins": ["themes", "xml_data", "ui"],
            "themes": {
                "theme": "default",
                "dots": true,
                "icons": true
            }
        }).bind("select_node.jstree", function (event, data) {
            $("#txtTmpFolder").val($.trim(data.rslt.obj.find(">a").text()));
            $("#hideTmpFolderID").val(data.rslt.obj.attr("id").substr(2));
            divfolder.hide();
        }).delegate("a", "click", function (event, data) {
            event.preventDefault();
        }).bind("loaded.jstree", function (event, data) {
            var folderid = $.url.param("folderid");
            if (folderid != undefined && folderid != "-1") {
                $("#hideTmpFolderID").val(folderid);
                $("#txtTmpFolder").val($.trim($("#tp" + folderid + ">a").text()));
            }
        });
        $("#dialogSave").dialog("open");
        return false;
    }
    else {
        SaveTemplate();
    }
}

function SaveAs() {
    templatetabtype = "New";
    Save();
}


//功能描述：判断字符串string中是否包含字符串substr，包含则返回true
//string:原始字符串
//substr:子字符串
//isIgnoreCase:忽略大小写
//创建标识：周章雄 20101116
function contains(string, substr, isIgnoreCase) {
    if (isIgnoreCase) {
        string = string.toLowerCase();
        substr = substr.toLowerCase();
    }
    var startChar = substr.substring(0, 1);
    var strLen = substr.length;
    for (var j = 0; j < string.length - strLen + 1; j++) {
        if (string.charAt(j) == startChar) {
            if (string.substring(j, j + strLen) == substr) {
                return true;
            }
        }
    }
    return false;
}

//功能描述：数据表格与条件拖放区切换
//创建标识：周章雄 20101125
function setPanel() {
    var controlPanel = $("#divControlPanel");
    var dataPanel = $("#divShowDataPanel");
    var measlice = $("#filterDiv");
    var dimslice = $("divFilter");
    if (controlPanel.css("display") == "none") {
        controlPanel.css("display", "block");
        dataPanel.css("display", "none");
        measlice.css("display", "block");
        dimslice.css("display", "block");
    }
    else {
        controlPanel.css("display", "none");
        dataPanel.css("display", "block");
        measlice.css("display", "none");
        dimslice.css("display", "none");
    }
}

function setUnit() {
    if ($("#hiddenIsShowUnit").val() == "1") {
        hideUnit();
    }
    else {
        showUnit();
    }
}

//功能描述：显示指标单位
//创建标识：周章雄  20101125
function showUnit() {
    var head = $("#gridCustom").parent().parent().prev();
    head.find("tr:eq(" + (head.find("tr").length - 1 - $("#coldimlist>li").length) + ")").each(function () {
        var rowdimlength = $("#rowdimlist>li").length;
        var $meacols = $(this).find("th:visible:gt(" + rowdimlength + ")");
        for (var i = 0; i < $meacols.length; i++) {
            var mea = $("#colmealist>li:eq(" + i + ")").data("meaobj");
            if (mea.MeasureType > 0 && mea.MeasureType < 7) {
                $("div>span:last", $(this).find("th:eq(" + (rowdimlength + i + 1) + ")")).before("<span>(%)</span>");
            }
            else {
                if (mea.Unit != undefined && mea.Unit != "") {
                    $("div>span:last", $(this).find("th:eq(" + (rowdimlength + i + 1) + ")")).before("<span>(" + mea.Unit + ")</span>");
                }
            }
        }
    });
    $("#hiddenIsShowUnit").val("1");
}

//功能描述：隐藏指标单位
//创建标识：周章雄  20101125
function hideUnit() {
    var head = $("#gridCustom").parent().parent().prev();
    head.find("tr:eq(" + (head.find("tr").length - 1 - $("#coldimlist>li").length) + ")").each(function () {
        $(this).find("th:gt(" + $("#rowdimlist>li").length + ")").each(function () {
            $("div>span:last", $(this)).prev("span").remove();
        });
    });
    $("#hiddenIsShowUnit").val("0");
}


//获取当前窗口高度
//创建标识：周章雄  20101201
function pageHeight() {
    if (isIE()) {
        return document.compatMode == "CSS1Compat" ? document.documentElement.clientHeight : document.body.clientHeight;
    }
    else {
        return self.innerHeight;
    }
}

function pageWidth() {
    if (isIE()) {
        return document.compatMode == "CSS1Compat" ? document.documentElement.clientWidth : document.body.clientWidth;
    }
    else {
        return self.innerWidth;
    }
}

function isIE() {
    if (!$.support.tbody || !$.support.cssFloat) {
        return true;
    }
    else {
        return false;
    }
}

//扩展方法：获取计算指标 
//返回值：指标名及部分指标属性，如{"ID":"11111","DisplayName":"网络掉话率","CaMeasureType":"Cal","Unit":"%"}
//创建标识：lyh  20120326
$.getCalMeasures = function () {
    var result = "";
    $(".NewMea").each(function () {
        result += $(this).find("span").text() + ",";
    });
    return result;
}

//扩展方法：获取指标过滤相关条件
//返回值：指标过滤条件的字符串 如： (([指标1] >3 and [指标2] < 8) or [指标3] = 5) or [指标4] < 9
//创建标识：lyh  20120326
$.getCondMeasureExp = function () {
    var result = $.trim($("#relaSliceTxtArea").text());
    if (result === "") {
        var arr = [];
        $("#meaSlice>li>span:odd").each(function (i) {
            arr.push($(this).text());
        });
        result = arr.join(" AND ");
    }
    return result;
}

//扩展方法：获取过滤指标集
//返回值：过滤指标字符串数组 如：{[指标1],[指标2],[指标3]}
//创建标识：lyh  20120326
$.getCondMeasures = function () {
    var result = "";
    $("#meaSlice>li>span").each(function () {
        result += $(this).text() + ",";
    });
    return result;
}


function CreateTemplateSetting() {
    var Template = {
        Analyzer: {
            SortSetting: {
                SortColIndex: -1,
                SecondSortColIndex: -1,
                SortDirection: 0,
                SecondSortDirection: 0
            },
            PageSetting: {
                PageSize: 20,
                EnableComputeTotal: true,
                Page: 0,
                TotalPage: 0,
                TotalRecord: 0
            },
            TopN: 0,
            MeasureFilter: "",
            StatisticsSetting: {
                DimensionIndexList: [],
                StatisticsList: []
            },
            RowColSwapSetting: {
                IsSwap: false,
                SwapColIndex: 0
            },
            ShowUintInColumn: true
        },
        ChartSetting: {
            AxisX: 0,
            ChartAxisYList: []
        },
        GridSetting: {
            ShowUnit: true,
            LockCol: -1
        },
        ShowGrid: true,
        ShowChart: false
    };
    return Template;
}


function InitTemplateSetting($template) {
    $(":radio[name=gridchart]").prop("checked", false);
    if ($template.ShowGrid && $template.ShowChart) {
        $("#rdoGridChart").prop("checked", true);
        $("#fieldChart").show();
    }
    else if ($template.ShowChart) {
        $("#rdoChart").prop("checked", true);
        $("#fieldChart").show();
    }
    else {
        $("#rdoGrid").prop("checked", true);
        $("#fieldChart").hide();
    }
    InitDdlSortCol();
    InitDdlStat(); InitDdlSwapCol();
    if ($template.Analyzer != undefined) {
        if ($template.Analyzer.SortSetting != undefined) {
            var sortCol = $template.Analyzer.SortSetting.SortColIndex;
            var sortCol2 = $template.Analyzer.SortSetting.SecondSortColIndex;
            if (sortCol != -1 && sortCol < $("#ddlSortCol").find("option").length) {
                $("#ddlSortCol").val(sortCol);
                $("#ddlSort").val($template.Analyzer.SortSetting.SortDirection);
            }
            if (sortCol2 != -1 && sortCol2 < $("#ddlSortCol2").find("option").length) {
                $("#ddlSortCol2").val(sortCol2);
                $("#ddlSort2").val($template.Analyzer.SortSetting.SecondSortDirection);
            }
        }
        if ($template.Analyzer.RowColSwapSetting != null && $template.Analyzer.RowColSwapSetting.IsSwap) {
            $("#ddlSwapCol").val($template.Analyzer.RowColSwapSetting.SwapColIndex);
        }
        if ($template.Analyzer.TopN != undefined) {
            $("#ddlTopN").val($template.Analyzer.TopN);
        }
        if ($template.Analyzer.PageSetting != undefined) {
            $("#ddlPageSize").val($template.Analyzer.PageSetting.PageSize);
        }
        var staSetting = $template.Analyzer.StatisticsSetting;
        if (staSetting != null) {
            if (staSetting.DimensionIndexList != null) {
                $(staSetting.DimensionIndexList).each(function () {
                    if (this != -1) {
                        $("#divStatDims").find(":checkbox[value=" + this + "]").prop("checked", true);
                    }
                });
            }
            if (staSetting.StatisticsList != null && staSetting.StatisticsList.length > 0) {
                $("#ddlStaMea").val(staSetting.StatisticsList[0].MeasureIndex);
                $("#ddlStaType").val(staSetting.StatisticsList[0].StatisticsType);
                $("#chkDimStat").prop("checked", true);
                $("#fieldDimStat").show();
            }
            else {
                $("#chkDimStat").prop("checked", false);
                $("#fieldDimStat").hide();
            }
        }
        var swapSetting = $template.Analyzer.RowColSwapSetting;
        if (swapSetting != null) {
            if (swapSetting.IsSwap && swapSetting.SwapColIndex > -1) {
                $("#chkRowColSwap").prop("checked", true);
                $("#fieldRowColSwap").show();
                $("#fieldDimStat").hide();
                $("#divStatDims").find(":checkbox").prop("checked", false);
            }
        }
    }
    if ($template.ChartSetting != undefined) {
        addAsixX($template);
        $("#ddlAsixX").val($template.ChartSetting.AxisX);
        $("#tableAsixY").find("tr:gt(0)").remove();
        $($template.ChartSetting.ChartAxisYList).each(function (i) {
            var tr = addAsixY();
            tr.find("select:eq(0)").val(this.ColumnIndex);
            tr.find("select:eq(1)").val(this.ChartType);
            tr.find("select:eq(2)").val(this.AxisYType);
        });
        if ($($template.ChartSetting.ChartAxisYList).length == 0) {
            addAsixY();
        }
    }
    var colcount = $("#rowdimlist>li").length;
    var ddlLock = $("#ddlLockCol");
    ddlLock.empty();
    ddlLock.append("<option value='-1'>不锁定</option>");
    for (var i = 0; i < colcount; i++) {
        ddlLock.append("<option value='" + i + "'>前" + (i + 1) + "列</option>");
    }
    if ($template.GridSetting != undefined) {
        if ($template.GridSetting.ShowUnit == false) {
            $("#ddlShowUnit").val("0");
        }
        else {
            $("#ddlShowUnit").val("1");
        }
        ddlLock.val($template.GridSetting.LockCol);
    }
}

function addAsixX(tmp) {
    $("#ddlAsixX").empty(); $("#ddlAsixX").append("<option value='-1'>选择X轴</option>");
    if (tmp == null || tmp.Analyzer.StatisticsSetting == null || tmp.Analyzer.StatisticsSetting.DimensionIndexList.length == 0) {
        var swapcol = parseInt($("#ddlSwapCol").val());
        $("#rowdimlist>li").each(function (i) {
            var displayname = $(this).text();
            if (swapcol == i) {
                displayname = "指标名";
            }
            $("#ddlAsixX").append("<option value='" + i + "'>" + displayname + "</option>");
        });
    }
    else {
        $(tmp.Analyzer.StatisticsSetting.DimensionIndexList).each(function (j) {
            var dispname = $("#rowdimlist>li:eq(" + this + ")").text();
            $("#ddlAsixX").append("<option value='" + j + "'>" + dispname + "</option>");
        });
    }
}

function SetTemplateSetting() {
    var tmp = getCurTemplate();
    if ($("#rdoGrid").prop("checked") || $("#rdoGridChart").prop("checked")) {
        tmp.ShowGrid = true;
    }
    else {
        tmp.ShowGrid = false;
    }
    if ($("#rdoChart").prop("checked") || $("#rdoGridChart").prop("checked")) {
        tmp.ShowChart = true;
    }
    else {
        tmp.ShowChart = false;
    }
    tmp.Analyzer.SortSetting.SortColIndex = parseInt($("#ddlSortCol").val());
    tmp.Analyzer.SortSetting.SecondSortColIndex = parseInt($("#ddlSortCol2").val());
    tmp.Analyzer.SortSetting.SortDirection = $("#ddlSort").val();
    tmp.Analyzer.SortSetting.SecondSortDirection = $("#ddlSort2").val();
    tmp.Analyzer.PageSetting.PageSize = parseInt($("#ddlPageSize").val());
    tmp.Analyzer.TopN = parseInt($("#ddlTopN").val());
    tmp.GridSetting.ShowUnit = $("#ddlShowUnit").val() == "1" ? true : false;
    tmp.GridSetting.LockCol = $("#ddlLockCol").val();
    tmp.Analyzer.RowColSwapSetting.SwapColIndex = parseInt($("#ddlSwapCol").val());
    if (tmp.Analyzer.RowColSwapSetting.SwapColIndex > -1) {
        tmp.Analyzer.RowColSwapSetting.IsSwap = true;
    }
    else {
        tmp.Analyzer.RowColSwapSetting.IsSwap = false;
    }
    var axisX = $("#ddlAsixX").val();
    tmp.ChartSetting.AxisX = parseInt(axisX);
    $("#XOption input").each(function (i) {
        if (i == tmp.ChartSetting.AxisX) {
            $(this).prop("checked", true);
        }
        else {
            $(this).prop("checked", false);
        }
    });
    var headrow = $("#tableAsixY tr:first");
    tmp.ChartSetting.ChartAxisYList = [];
    var chartrows = headrow.parent().find(">tr:gt(0)");
    if (chartrows.length > 0) {
        $("#YOption input").each(function (j) {
            $(this).prop("checked", false);
        });
        chartrows.each(function () {
            var asixY = {
                ColumnIndex: parseInt($(this).find("select:eq(0)").val()),
                ChartType: parseInt($(this).find("select:eq(1)").val()),
                AxisYType: parseInt($(this).find("select:eq(2)").val())
            };
            tmp.ChartSetting.ChartAxisYList.push(asixY);
            $("#YOption input").each(function (j) {
                if (j == asixY.ColumnIndex - tmp.Analyzer.RowDimList.length) {
                    $(this).prop("checked", true);
                }
            });
        });
    }
    tmp.Analyzer.StatisticsSetting.DimensionIndexList = [];
    tmp.Analyzer.StatisticsSetting.StatisticsList = [];
    if ($("#chkDimStat").prop("checked")) {
        $("#divStatDims").find(":checkbox:checked").each(function () {
            tmp.Analyzer.StatisticsSetting.DimensionIndexList.push(parseInt($(this).val()));
        });
        tmp.Analyzer.StatisticsSetting.StatisticsList.push({ MeasureIndex: parseInt($("#ddlStaMea").val()), StatisticsType: parseInt($("#ddlStaType").val()) });
    }
    tmp.Analyzer.ShowUintInColumn = $("#ddlShowUnit").val() == "1";
    saveTemporary(tmp);
}

function addAsixY() {
    var tr = $("<tr><td></td><td></td><td></td><td></td></tr>");
    tr.find(">td:eq(0)").append(addAsixYDdl());
    tr.find(">td:eq(1)").append(addChartTypeDdl());
    tr.find(">td:eq(2)").append(addAsixYType());
    tr.find(">td:eq(3)").append(addBtnDelAsixY());
    $("#tableAsixY").append(tr);
    return tr;
}

function addAsixYDdl() {
    var ddl = $("<select></select>");
    var statDimCount = $("#divStatDims").find(":checkbox:checked").length;
    if (statDimCount > 0) {
        ddl.append("<option value='" + statDimCount + "'>统计指标</option>");
    }
    else {
        var rowdimcount = $("#rowdimlist>li").length;
        var vallist = getColDimVals();
        $("#colmealist>li").each(function (i) {
            var displayname = $(this).data("meaobj").DisplayName + getMeasureTypeDescription($(this).data("meaobj").MeasureType);
            if (vallist.length > 0) {
                for (var j = 0; j < vallist.length; j++) {
                    ddl.append("<option value='" + (i * vallist.length + j + rowdimcount) + "'>" + displayname + " " + vallist[j] + "</option>");
                }
            }
            else {
                ddl.append("<option value='" + (i + rowdimcount) + "'>" + displayname + "</option>");
            }
        });
    }
    return ddl;
}

function addChartTypeDdl() {
    var ddl = $("<select></select>");
    ddl.append("<option value='0'>柱状图</option>");
    ddl.append("<option value='1'>折线图</option>");
    ddl.append("<option value='6'>面积图</option>");
    ddl.append("<option value='2'>条状图</option>");
    ddl.append("<option value='3'>饼图</option>");
    ddl.append("<option value='4'>圆环图</option>");
    ddl.append("<option value='18'>南丁格尔玫瑰图</option>");
    ddl.append("<option value='14'>雷达图</option>");
    ddl.append("<option value='15'>散点图</option>");
    ddl.append("<option value='16'>气泡图</option>");
    ddl.append("<option value='5'>帕累托图</option>");
    ddl.append("<option value='7'>滚动柱图</option>");
    ddl.append("<option value='8'>滚动折线图</option>");
    ddl.append("<option value='9'>滚动面积图</option>");
    ddl.append("<option value='10'>滚动堆叠柱图</option>");
    ddl.append("<option value='11'>堆叠柱图</option>");
    ddl.append("<option value='12'>堆叠长条图</option>");
    ddl.append("<option value='13'>堆叠面积图</option>");
    ddl.append("<option value='17'>地图</option>");
    return ddl;
}

function addAsixYType() {
    var ddl = $("<select></select>");
    ddl.append("<option value='0'>Y</option>");
    ddl.append("<option value='1'>Y2</option>");
    return ddl;
}

function addBtnDelAsixY() {
    var btnDel = $("<img src='../images/close.png' />");
    btnDel.click(function () {
        $(this).parent().parent().remove();
    });
    return btnDel;
}

function showTemplateSetting() {
    var tmp = $("#dialogOptions").data("tmpobj");
    if (tmp == undefined) {
        tmp = CreateTemplateSetting();
    }
    InitTemplateSetting(tmp);
}

function InitDdlStat() {
    $("#divStatDims").empty();
    var rowdimcount = $("#rowdimlist").find("li").length;
    $("#rowdimlist>li").each(function (i) {
        var disname = $(this).text();
        var $chk = $("<input type='checkbox' name='chkStaDim' value='" + i + "'/>");
        $chk.change(function () {
            InitDdlSortCol();
            var checked = false;
            $("#ddlAsixX").empty();
            var c = 0;
            $("#divStatDims").find(":checkbox").each(function (j) {
                if ($(this).prop("checked")) {
                    checked = true;
                    $("#ddlAsixX").append("<option value='" + c + "'>" + $(this).next().text() + "</option>");
                    c++;
                }
            });
            if (!checked) {
                addAsixX();
            }
            else {
                $("#ddlAsixX").prepend("<option value='-1'>选择X轴</option>");

            }
            $("#tableAsixY").find("tr:gt(0)").remove();
            addAsixY();
        });
        $("#divStatDims").append($chk);
        $("#divStatDims").append("<span>" + disname + "</span>");
    });
    $("#ddlStaMea").empty();
    var vallist = getColDimVals();
    $("#colmealist>li").each(function (i) {
        var displayname = $(this).data("meaobj").DisplayName + getMeasureTypeDescription($(this).data("meaobj").MeasureType);
        if (vallist.length > 0) {
            for (var j = 0; j < vallist.length; j++) {
                $("#ddlStaMea").append("<option value='" + (i * vallist.length + j) + "'>" + displayname + " " + vallist[j] + "</option>");
            }
        }
        else {
            $("#ddlStaMea").append("<option value='" + (i) + "'>" + displayname + "</option>");
        }
    });
}

function InitDdlSwapCol() {
    $("#ddlSwapCol").empty();
    $("#ddlSwapCol").append("<option value='-1'>选择转换列</option>");
    $("#rowdimlist>li").each(function (i) {
        var displayname = $(this).text();
        $("#ddlSwapCol").append("<option value='" + i + "'>" + displayname + "</option>");
    });
}

function ddlSwapColChange() {
    var scval = $("#ddlSwapCol").val();
    scval = parseInt(scval);
    $("#ddlAsixX").empty(); $("#ddlAsixX").append("<option value='-1'>选择X轴</option>");
    if (scval > -1) {
        $(":checkbox", $("#divStatDims")).prop("checked", false);
    }
    $("#rowdimlist>li").each(function (i) {
        var displayname = $(this).text();
        if (scval == i) {
            displayname = "指标名";
        }
        $("#ddlAsixX").append("<option value='" + i + "'>" + displayname + "</option>");
    });
}

function InitDdlSortCol() {
    $("#ddlSortCol").empty();
    $("#ddlSortCol2").empty();
    $("#ddlSortCol").append("<option value='-1'>第一排序列</option>");
    $("#ddlSortCol2").append("<option value='-1'>第二排序列</option>");
    var rowdimlis = $("#rowdimlist>li");
    if ($("#chkDimStat").prop("checked")) {
        var chks = $("#divStatDims").find(":checked");
        for (var j = 0; j < chks.length; j++) {
            for (var i = 0; i < rowdimlis.length; i++) {
                if ($(chks[j]).val() == i) {
                    var displayname = $(rowdimlis[i]).text();
                    $("#ddlSortCol").append("<option value='" + i + "'>" + displayname + "</option>");
                    $("#ddlSortCol2").append("<option value='" + i + "'>" + displayname + "</option>");
                    break;
                }
            }
        }
        $("#ddlSortCol").append("<option value='" + chks.length + "'>统计指标</option>");
        $("#ddlSortCol2").append("<option value='" + chks.length + "'>统计指标</option>");
    }
    else {
        var rowdimcount = rowdimlis.length;
        rowdimlis.each(function (i) {
            var displayname = $(this).text();
            $("#ddlSortCol").append("<option value='" + i + "'>" + displayname + "</option>");
            $("#ddlSortCol2").append("<option value='" + i + "'>" + displayname + "</option>");
        });
        var vallist = getColDimVals();
        $("#colmealist>li").each(function (i) {
            var displayname = $(this).data("meaobj").DisplayName + getMeasureTypeDescription($(this).data("meaobj").MeasureType);
            if (vallist.length > 0) {
                for (var j = 0; j < vallist.length; j++) {
                    $("#ddlSortCol").append("<option value='" + (i * vallist.length + j + rowdimcount) + "'>" + displayname + " " + vallist[j] + "</option>");
                    $("#ddlSortCol2").append("<option value='" + (i * vallist.length + j + rowdimcount) + "'>" + displayname + " " + vallist[j] + "</option>");
                }
            }
            else {
                $("#ddlSortCol").append("<option value='" + (i + rowdimcount) + "'>" + displayname + "</option>");
                $("#ddlSortCol2").append("<option value='" + (i + rowdimcount) + "'>" + displayname + "</option>");
            }
        });
    }
}

function getColDimVals() {
    var valArr = [];
    $("#coldimlist>li").each(function () {
        var vl = $(this).data("dimobj").ValList;
        if (vl != undefined) {
            valArr.push(vl);
        }
    });
    var vallist = [];
    generateColVal(valArr, 0, "", vallist);
    return vallist;
}

function generateColVal(valArr, index, val, vallist) {
    if (valArr.length > 0) {
        for (var i = 0; i < valArr[index].length; i++) {
            var newval = val + " " + valArr[index][i];
            if (index == valArr.length - 1) {
                vallist.push(newval);
            }
            else {
                generateColVal(valArr, index + 1, newval, vallist);
            }
        }
    }
}

function getCurTemplate() {
    var tmp = $("#dialogOptions").data("tmpobj");
    if (tmp == undefined) {
        tmp = CreateTemplateSetting();
    }
    tmp.Analyzer.RowDimList = [];
    tmp.Analyzer.ColDimList = [];
    tmp.Analyzer.SliceDimList = [];
    tmp.Analyzer.MeasureList = [];
    $("#rowdimlist>li").each(function () {
        tmp.Analyzer.RowDimList.push($(this).data("dimobj"));
    });
    if (tmp.Analyzer.RowDimList.length < tmp.Analyzer.RowColSwapSetting.SwapColIndex + 1) {
        tmp.Analyzer.RowColSwapSetting.IsSwap = false;
        tmp.Analyzer.RowColSwapSetting.SwapColIndex = -1;
    }
    $("#coldimlist>li").each(function () {
        tmp.Analyzer.ColDimList.push($(this).data("dimobj"));
    });
    $("#tableChoice tr:gt(0)").each(function () {
        var dim = $(this).data("dimobj");
        if (dim != undefined) {
            tmp.Analyzer.SliceDimList.push(dim);
        }
    });
    $("#colmealist>li").each(function () {
        tmp.Analyzer.MeasureList.push($(this).data("meaobj"));
    });
    tmp.UserID = $("input[id$=hiddenUserID]").val();
    if ($.url.param("folderid") != undefined) {
        tmp.FolderID = $.url.param("folderid");
    }
    tmp.CubeID = $("[id$=selectCube]").val();
    tmp.Analyzer.MeasureFilter = $.getCondMeasureExp();
    return tmp;
}

function jsonToString(obj) {
    var THIS = this;
    switch (typeof (obj)) {
        case 'string':
            return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';
        case 'array':
            return '[' + obj.map(THIS.jsonToString).join(',') + ']';
        case 'object':
            if (obj instanceof Array) {
                var strArr = [];
                var len = obj.length;
                for (var i = 0; i < len; i++) {
                    strArr.push(THIS.jsonToString(obj[i]));
                }
                return '[' + strArr.join(',') + ']';
            } else if (obj == null) {
                return 'null';
            } else {
                var string = [];
                for (var property in obj) string.push(THIS.jsonToString(property) + ':' + THIS.jsonToString(obj[property]));
                return '{' + string.join(',') + '}';
            }
        case 'number':
            return obj;
        default:
            return obj;
    }
}

//@jyt 将内容复制到剪贴板
function copyToClipboard(txt) {
    if (window.clipboardData) {
        //window.clipboardData.clearData();
        window.clipboardData.setData("Text", txt);
        dss.alert("复制成功！", function () { }, "", 1);
    }
    else if (navigator.userAgent.indexOf("Opera") != -1) {
        window.location = txt;
    }
    else if (window.netscape) {
        try {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        }
        catch (e) {
            alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将'signed.applets.codebase_principal_support'设置为'true'");
        }
        var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
        if (!clip)
            return; var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
        if (!trans)
            return;
        trans.addDataFlavor('text/unicode');
        var str = new Object();
        var len = new Object();
        var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
        var copytext = txt; str.data = copytext; trans.setTransferData("text/unicode", str, copytext.length * 2);
        var clipid = Components.interfaces.nsIClipboard;
        if (!clip)
            return false;
        clip.setData(trans, null, clipid.kGlobalClipboard);
    }
}
