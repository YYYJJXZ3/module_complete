//维度拖至列维度区域
//创建标识：周章雄 20101101
function AddDim(data, dimUlId) {
    if (dimUlId == "coldimlist") {
        if ($("#coldimlist").find("li").length > 0) {
            alertDialog('添加失败', '列上维度不能超过1个');
            setTimeout("$('#alertinfo').dialog('close')", 1000);
            return;
        }
    }
    var isExist = false;
    $("#rowdimlist").find("li").each(function () {
        if ($.trim(this.innerText) == $.trim($(data.o[0]).find("a:eq(0)").text())) {
            isExist = true; return;
        }
    });
    if (!isExist) {
        $("#coldimlist").find("li").each(function () {
            if ($.trim(this.innerText) == $.trim($(data.o[0]).find("a:eq(0)").text())) {
                isExist = true; return;
            }
        });
    }
    var nodeid = data.o.attr("id");
    var dimlevel = nodeid.split("_");
    var dimname;
    var levelname = $.trim($(data.o[0]).find("a:eq(0)").text());
    if (!isExist) {
        if (dimlevel[0] == "hierlevel") {
            var dimNode = $(data.o[0]).parent().parent().parent().parent();
            dimname = $.trim(dimNode.find("a:eq(0)").text());
        }
        else if (dimlevel[0] == "level") {
            dimname = $.trim($(data.o[0]).parent().parent().find("a:eq(0)").text());
        }
        $("#tableChoice tr").each(function () {
            if ($("td:eq(0)", $(this)).text() == dimname && $("td:eq(1)", $(this)).text() == levelname) {
                isExist = true;
                return;
            }
        });
    }
    if (isExist == false) {
        var nodeID = data.o.attr("id");
        var parts = nodeID.split("_");
        var dim = { DimensionID: parts[1], LevelName: levelname, Val: "", ValType: 1, ValList: [], DimensionName: dimname };
        var newcolli = $("<li class=\"ui-widget ui-state-default ui-button-text-only\">");
        newcolli.text(levelname);
        newcolli.data("dimobj", dim);
        $("#" + dimUlId).append(newcolli);
        if (dimUlId == "coldimlist") {
            SetColDimensionMenu();
        } 
        else {
            SetRowDimensionMenu();
        }
    }
    else {
        alertDialog('添加失败', '已存在此粒度');
        setTimeout("$('#alertinfo').dialog('close')", 1500);
    }
}


//功能描述：将树叶子节点拖放至切片区
//创建标识：zzx 20101026
function SetDimFilter(data) {
    var nodeid = data.o.attr("id");
    var dimlevel = nodeid.split("_");
    var dimid = dimlevel[1];
    var rowNum = $("#tableChoice tr").length;
    var trDim = $("<tr class='ca_slice_body'>");
    if (dimlevel[0] == "level") {
        var dimname;
        var levelname = $.trim(data.o.find("a:eq(0)").text());
        var isExist = false;
        $("#coldimlist>li").each(function () {
            if ($.trim(this.innerText) == $.trim(data.o.find("a:eq(0)").text())) {
                isExist = true; return;
            }
        });
        if (!isExist) {
            $("#rowdimlist>li").each(function () {
                if ($.trim(this.innerText) == $.trim(data.o.find("a:eq(0)").text())) {
                    isExist = true; return;
                }
            });
        }
            dimname = $.trim(data.o.parent().parent().find("a:eq(0)").text());
            $("#tableChoice tr").each(function () {
                var ddim = $(this).data("dimobj");
                if (ddim!=null&&ddim.DimensionName == dimname && ddim.LevelName == levelname) {
                    isExist = true; return;
                }
            });
        if (isExist == false) {
            var dim = {
                DimensionID:dimid,
                DimensionName: dimname,
                HierarchyName: "",
                LevelName: levelname,
                ValType: 1,
                Val: "",
                ValList: []
            };
            trDim.append("<td style=' text-align: center;'>" + levelname + "</td>");
            trDim.data("dimobj", dim);
            var tdCondSel = $("<td>");
            var $txtCond = $("<input type=\"text\" style=\"display:block;width:94%;\" readonly=\"readonly\" />");
            $txtCond.attr("id", "slice_" + levelname);
            var $hiddenCond = $("<input type=\"hidden\" />");
            var $divNeListDiv = $("<div style=\"padding-left:5px;border:1px #000 solid; background-color:#fafafa;display:none;width:180px; position:absolute; z-index:999;filter:alpha(opacity=100); overflow:auto; \"></div>");
            $txtCond.click(function () {
                $("#cellHid").val($(this).attr("id")); 
                if (levelname == "日") {
                    showDimDayMember($(this).parent().parent());
                }
                else {
                    initDimFilterDialog(dim);
                }
            });
            tdCondSel.append($txtCond);
            tdCondSel.append($hiddenCond);
            trDim.append(tdCondSel);
            $("#tableChoice tr:eq(" + (rowNum - 2) + ")").after(trDim);
            SetChoiceMenu();
            $("#divFilter").height($("#divFilter").height() + 23);
            $("#tablecol").height($("#tablecol").height() - 23);
            $("#tablebody").parent().height($("#tablebody").parent().height() - 23);
        }
        else {
            alertDialog('添加失败', '可能由以下原因导致：<br />&nbsp;&nbsp;1、已存在此粒度;<br />&nbsp;&nbsp;2、同一维度下只能放置一个层级;');
            setTimeout("$('#alertinfo').dialog('close')", 2000);
        }
    }
}

function sliceNeClick() {
    var $curTxtCond = $(this).parent().parent().find(":text");
    var $dimlevelinput = $(this).parents("tr:eq(0)").find("div:eq(0)").next("input");
    var dimlevel = $dimlevelinput.val();
    var cond = dimlevel.substr(dimlevel.lastIndexOf('$') + 1);
    var selval = $(this).val().replace(",", "◎").replace(":", "㊣");
    if ($(this).is(":checked") || $(this).attr("checked") == true) {
        if (cond == undefined || cond == "") {
            cond = selval;
            $curTxtCond.val($(this).val());
        }
        else {
            cond = cond + "," + selval;
            $curTxtCond.val($curTxtCond.val() + "," + $(this).val());
        }
    }
    else {
        if (cond == selval) {
            cond = "";
            $curTxtCond.val("");
        }
        else {
            cond = cond.replace(selval + ",", "").replace("," + selval, "");
            $curTxtCond.val($curTxtCond.val().replace($(this).val() + ",", "").replace("," + $(this).val(), ""));
        }
    }
    $dimlevelinput.val(dimlevel.substr(0, dimlevel.lastIndexOf('$')) + "$" + cond);
}


//功能描述：设置切片区右键菜单
//创建标识：周章雄 20101106
function SetChoiceMenu() {
    $("#tableChoice tr:gt(0)").has(":text").contextMenu("choiceMenu", {
        onShowMenu: function (e, menu) {
            return menu;
        },
        bindings: {
            "delChoice": function (t) {
                $(t).remove();
                $("#divFilter").height($("#divFilter").height() - 23);
                $("#tablecol").height($("#tablecol").height() + 23);
                $("#tablebody").parent().height($("#tablebody").parent().height() + 23);
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

//功能描述：设置列维度拖放区右键菜单
//创建标识：周章雄 20101106
function SetColDimensionMenu() {
    $("#coldimlist").find("li").contextMenu("colDimensionMenu", {
        onShowMenu: function (e, menu) {
            return menu;
        },
        bindings: {
            "delColDimension": function (t) { $(t).remove(); },
            "filtColDimension": function (t) { showDimensionMember(t); },
            "colRowChg": function (t) {
                var tcol = $(t).clone();
                tcol.data("dimobj", $(t).data("dimobj"));
                $("#rowdimlist").append(tcol);
                $(t).remove();
                SetRowDimensionMenu();
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

function pageComplate(page_id, jq) {
    getCellPageData(page_id, "8");
}
function pageComplateSearch(page_id, jq) {
    getCellPageData(page_id, "8", "1", $("#cellUI").val(), $("#regionUI option:selected").text());
}
//获取小区、TD小区、热点、AP某一页的数据
//创建标识：lyh 20120428
function getCellPageData(currentPage, pageSize, requestType, cell, region) {
    var dataType;
    var dim = $("#cellHid").data("dimobj");
    var dimid = dim.DimensionID;
    var levelname = dim.LevelName;
    var url = "../Pages/CellDimHandler.ashx?datatype=nelist&dimid=" + dimid + "&levelname=" + encodeURI(levelname) +
        "&pageindex=" + currentPage + "&pagesize=" + pageSize;
    if (undefined != requestType && requestType.length > 0)
        url += "&rqtype=" + requestType;
    if (undefined != cell && cell.length > 0)
        url += "&cellname=" + encodeURI(cell);
    if (undefined != region && region.length > 0)
        url += "&region=" + encodeURI(region);
    $("#cellDimTb").load(url, function () {
        $("#cellDimTb input").each(function () {
            if ($("#seleCell").text().indexOf($(this).val()) > -1) {
                $(this).attr("checked", $("#seleCell input[value=" + $(this).val() + "]").attr("checked"));
            }
            $(this).change(function () {
                if ($(this).attr("name") != "ALL") {
                    if ($(this).prop("checked")) {
                        $("#seleCell").append("<input type='checkbox' checked='checked' value='" + $(this).val() + "' />" + $(this).val() + " ");
                    }
                    else {
                        var seleCell = $("#seleCell");
                        seleCell.find("input[value='" + $(this).val() + "']").remove();
                        seleCell.html(seleCell.html().replace(eval("/" + $(this).val() + "\s?/g"), ""));
                    }
                }
                else {
                    if ($(this).prop("checked")) {
                        $("#cellDimTb input[name!=ALL]").each(function () {
                            if ($(this).prop("checked") == false) {
                                $(this).prop("checked", true);
                                $("#seleCell").append("<input type='checkbox' checked='checked' value='" + $(this).val() + "' />" + $(this).val() + " ");
                            }
                        });
                    }
                    else {
                        $("#cellDimTb input").each(function () {
                            $(this).prop("checked", false);
                            var seleCell = $("#seleCell");
                            seleCell.find("input[value='" + $(this).val() + "']").remove();
                            seleCell.html(seleCell.html().replace($(this).val(), ""));
                        });
                    }
                }
            });
        });
        if ($("#cellDimTb").find("tr:first").find("th:last").text() == "地区" && levelname != "地区") {
            $("#regionUI").show();
            $("#lblRegionFilter").show();
        }
        else {
            $("#regionUI").hide();
            $("#lblRegionFilter").hide();
        }
        if (undefined == requestType) {
            if ($("#regionUI option").length == 0) {
                $("#regionUI").append("<option >全省</option>");
                $.ajax({
                    url: "../Pages/CellDimHandler.ashx?datatype=proregion&dimid="+dimid+"&levelname=" + encodeURI(levelname),
                    datatype: "xml",
                    success: function (data) {
                        if ($(data).find("region").length > 0) {
                            $(data).find("region").each(function () {
                                $("#regionUI").append("<option value='" + $(this).attr("id") + "' >" + $(this).text() + "</option>");
                            });
                        }
                        $("#cellDia").dialog('open');
                    }
                });
            }
            else {
                //                cellSearchEvent();
                $("#cellDia").dialog('open');
            }
        }
    });
}
//初始化小区过滤对话框
//创建标识：lyh 20120428
function initCellDimDia(dim) {
    initDimFilterDialog(dim);
}

function initDimFilterDialog(dim) {
    $("#seleCell").empty();
    $("#cellUI").val("");
    $("#cellHid").data("dimobj", dim);
    var dimvalue = dim.Val;
    var dimAry = dimvalue.split(',');
    if (dim.ValType == "1" || dim.ValType == "2") {
        dimAry = dim.ValList;
    }
    if (dimAry.length > 0) {
        for (var i = 0; i < dimAry.length; i++) {
            if (dimAry != "") {
                $("#seleCell").html($("#seleCell").html() + "<input checked='checked' type='checkbox' value='" + dimAry[i].replace("◎", ",").replace("㊣", ":") + "' />" + dimAry[i].replace("◎", ",").replace("㊣", ":") + " ");
            }
        }
    }
    var opt = {
        items_per_page: 8,
        num_display_entries: 10,
        current_page: 0,
        num_edge_entries: 0,
        link_to: "#",
        prev_text: "上一页",
        next_text: "下一页",
        ellipse_text: "...",
        prev_show_always: true,
        next_show_always: true,
        callback: pageComplate
    };
    $("#celllbl").text(dim.LevelName);
    $.ajax({
        url: "../Pages/CellDimHandler.ashx?datatype=datacount&dimid=" + dim.DimensionID + "&levelname=" + encodeURI(dim.LevelName) + "&rqtype=1&cellname=" + encodeURI($("#cellUI").val()) + "&region=" + encodeURI($("#regionUI option:selected").text()),
        datatype: "xml",
        success: function (data) {
            var rowscount = $(data).find("DataCount").text();
            if (rowscount == "-1") {
                $("#lblRegionFilter").hide();
                $("#regionUI").hide();
                $("#btnSearchNe").hide();
                $("#btnAddNe").show();
                $("#cellDimTb").empty();
                $("#pagePlugIn").hide();
                $("#cellDia").dialog('open');
            }
            else {
                $("#lblRegionFilter").show();
                $("#regionUI").show();
                $("#btnSearchNe").show();
                $("#btnAddNe").hide();
                $("#pagePlugIn").show();
                $("#pagePlugIn").pagination(parseInt(rowscount), opt);
            }
        }
    });
}


function addInputNe() {
    var inputNe = $("#cellUI").val();
    if ($("#seleCell").find("input[value=" + inputNe + "]").length == 0) {
        $("#seleCell").append("<input type='checkbox' checked='checked' value='" + $("#cellUI").val() + "' />" + $("#cellUI").val() + " ");
        $("#cellUI").val("")
    }
}

//小区搜索按钮点击事件
//创建标识：lyh 20120430
function cellSearchEvent() {
    $("#pagination").empty();
    var dim = $("#cellHid").data("dimobj");
    var dimid = dim.DimensionID;
    var levelname = dim.LevelName;
    var opt = {
        items_per_page: 8,
        num_display_entries: 10,
        current_page: 0,
        num_edge_entries: 0,
        link_to: "#",
        prev_text: "上一页",
        next_text: "下一页",
        ellipse_text: "...",
        prev_show_always: true,
        next_show_always: true,
        callback: pageComplateSearch
    };
    $.ajax({
        url: "../Pages/CellDimHandler.ashx?datatype=datacount&dimid=" + dimid + "&levelname=" + encodeURI(dim.LevelName) + "&rqtype=1&cellname=" + encodeURI($("#cellUI").val()) + "&region=" + encodeURI($("#regionUI option:selected").text()),
        datatype: "xml",
        success: function (data) {
            $("#pagePlugIn").pagination(parseInt($(data).find("DataCount").text()), opt);
        }
    });
}

function changeDimValType(selectType) {
    var $sel = $(selectType);
    if ($sel.val() == "Sql") {
        $("#tableDimSql").show();
        $("#tableDimValList").hide();
    }
    else {
        $("#tableDimSql").hide();
        $("#tableDimValList").show();
        var dim = $("input[id=cellHid]").data("dimobj");
        initDimFilterDialog(dim);
    }
}

function weekOfYear(date) {
    var date1 = new Date(date.getFullYear(), 0, 1);
    var dayMS = 24 * 60 * 60 * 1000;
    var firstDay = (7 - date1.getDay()) * dayMS;
    var weekMS = 7 * dayMS;
    date1 = date1.getTime();
    var date2 = date.getTime();
    return Math.ceil((date2 - date1 - firstDay) / weekMS) + 1;
} 

function getDateString(date) {
    var month = date.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    var day = date.getDate();
    if (day < 10) {
        day = "0" + month;
    }
    return date.getFullYear() + "年" + month + "月" + day + "日";
}

function showDimDayRange($dimDay) {
    $("#divDayChecked").empty();
    $("#divDateRange").show();
    $("#divDateList").hide();
    var timepickopt = { showTypeMonth: false,
        showTypeWeek: false,
        showTypeHour: false,
        showTypeDay: true,
        range: false,
        defaultDateStr: null
    };
    var timepickoptend = $.extend({}, timepickopt);
    if (!($dimDay != null && $dimDay.ValList != null && $dimDay.ValList.length > 1)) {
        var defaultdate = new Date();
        defaultdate.setDate(defaultdate.getDate() - 30);
        timepickopt.defaultDateStr = getDateString(defaultdate);
    }
    $("#dimDayStart").timepicker(timepickopt);
    $("#dimDayEnd").timepicker(timepickoptend);
    if ($dimDay != null && $dimDay.ValList != null && $dimDay.ValList.length > 1) {
        $("#dimDayStart").val($dimDay.ValList[0]);
        $("#dimDayEnd").val($dimDay.ValList[1]);
    }
}

function showDimDayList($dimDay) {
    $("#divDateRange").hide();
    $("#divDateList").show();
    if ($dimDay != null && $dimDay.ValList != null) {
        for (var i = 0; i < $dimDay.ValList.length; i++) {
            $("#divDayChecked").append($("<input type='checkbox' checked='checked' value='" + $dimDay.ValList[i] + "'/><span style='padding-right:10px;'>" + $dimDay.ValList[i] + "</span>"));
        }
    }
    $("#divDatePicker1").datepicker({
        inline: true,
        dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"],
        monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        prevText: '上月',
        nextText: '下月',
        dateFormat: "yy年mm月dd日",
        changeMonth: true,
        changeYear: true,
        maxDate: "+0M +0D",
        showOtherMonths: true,
        selectOtherMonths: true,
        firstDay: 1,
        onSelect: function (dateText, inst) {
            if ($("#divDayChecked").find("input[value=" + dateText + "]").length < 1) {
                $("#divDayChecked").append($("<input type='checkbox' checked='checked' value='" + dateText + "'/><span style='padding-right:10px;'>" + dateText + "</span>"));
            }
        }
    });
}

function showDimDayMember(t) {
    var $dimDay = $(t).data("dimobj");
    $("#divDayChecked").empty();
    $("#divAutoDate>a").unbind();
    $("#divAutoDate>a").click(function () {
        dateText = $(this).text();
        if ($("#divDayChecked").find("input[value=" + dateText + "]").length < 1) {
            $("#divDayChecked").append($("<input type='checkbox' checked='checked' value='" + dateText + "'/><span style='padding-right:10px;'>" + dateText + "</span>"));
        }
    });
    $("#tdDateStart>a").unbind();
    $("#tdDateEnd>a").unbind();
    $("#tdDateStart>a").click(function () {
        $("#dimDayStart").val($(this).text());
    });
    $("#tdDateEnd>a").click(function () {
        $("#dimDayEnd").val($(this).text());
    });
    $("#chkDayRange").change(function () {
        if ($(this).prop("checked")) {
            showDimDayRange();
        }
        else {
            showDimDayList();
        }
    });
    if ($dimDay.ValType == 3) {
        showDimDayRange($dimDay);
        $("#chkDayRange").prop("checked", true);
    }
    else {
        showDimDayList($dimDay);
        $("#chkDayRange").prop("checked", false);
    }
    $("#dialogDimDay").dialog({
        width: 500,
        maxHeight: 500,
        modal: true,
        buttons: {
            "确定": function () {
                $dimDay.ValType = $("#chkDayRange").prop("checked") == true ? 3 : 1;
                var $vallist = [];
                var valstr = "";
                if ($dimDay.ValType == 3) {
                    $vallist.push($("#dimDayStart").val());
                    $vallist.push($("#dimDayEnd").val());
                    valstr = $("#dimDayStart").val() + ":" + $("#dimDayEnd").val();
                }
                else {
                    $("#divDayChecked").find(":checked").each(function () {
                        $vallist.push($(this).val());
                        valstr += $(this).val() + ",";
                    });
                    valstr = valstr.substr(0, valstr.lastIndexOf(","));
                } $dimDay.ValList = $vallist;
                $dimDay.Val = valstr;
                $(t).data("dimobj", $dimDay);

                var valContainerID = $("#cellHid").val();
                if (valContainerID != undefined && valContainerID.startsWith("slice_")) {
                    $("#" + valContainerID).val(valstr);
                }
                $(this).dialog('close');
            },
            "取消": function () {
                $(this).dialog('close');
            }
        }
    });
    $("#dialogDimDay").dialog("open");
}

function showDimensionMember(t) {
    var $dim = $(t).data("dimobj");
    var levelname = $dim.LevelName;
    $("#cellHid").val(levelname);
    if (levelname == "日") {
        showDimDayMember(t);
    }
    else if ($dim.ValType == "8") {
        $("#selectDimValType").val("Sql");
        $("#tableDimSql").show();
        $("#tableDimValList").hide();
        $("#txtDimSql").text($dim.Val);
        $("#cellDia").dialog('open');
    }
    else {
        if ($dim.ValType == "2") {
            $("#selectDimValType").val("NotIn");
        }
        else {
            $("#selectDimValType").val("In");
        }
        $("#txtDimSql").text("");
        $("#tableDimSql").hide();
        $("#tableDimValList").show();
        initCellDimDia($dim);
    }
}


//功能描述：显示表格维度列右键菜单
//selector:选取的单元格
//创建标识：周章雄  20101117
function SetColDimDataMenu(selector, isDim) {
    selector.contextMenu("colDimDataMenu", {
        onShowMenu: function (e, menu) {
            if (isDim == true) {
                $(menu).find("li:lt(2)").each(function () { $(this).show(); });
                curdimname = selector.attr("aria-describedby").substr(selector.attr("aria-describedby").indexOf('_') + 1);
                var selecteddimlevel = currentTemplate.find("RowDimensions>Dimension>Hierarchies>Hierarchie>Levels>Level[Name='" + curdimname + "']");
                if (selecteddimlevel.attr("IsDrillDown") == "true") {
                    $(menu).find("li:first").css("display", "block");
                }
                else {
                    $(menu).find("li:first").css("display", "none");
                }
                if (selecteddimlevel.attr("IsDrillUp") == "true") {
                    $(menu).find("li:eq(1)").css("display", "block");
                }
                else {
                    $(menu).find("li:eq(1)").css("display", "none");
                }
            }
            else {
                $(menu).find("li:lt(2)").each(function () { $(this).hide(); });
            }
            return menu;
        },
        bindings: {
            "ColDataDrillDown": function (t) {
                ColDrill("down", t);
            },
            "ColDataDrillUp": function (t) {
                ColDrill("up", t);
            },
            "ColDataFilt": function (t) { },
            "ColDataSortAsc": function (t) {
                var colindex = $(t).attr("aria-describedby").substr($(t).attr("aria-describedby").indexOf('_') + 1);
                if (isLoadOnce) {
                    $("#gridCustom").setGridParam({ sortname: colindex, sortorder: 'asc', page: 1 }).trigger('reloadGrid');
                }
                else {
                    colindex = $(t).parent().find("td").index($(t));
                    var pagesize1 = $("#gridCustom").getGridParam("rowNum");
                    RunTemplate(1, pagesize1, "asc", colindex);
                }
            },
            "ColDataSortDesc": function (t) {
                var colindex = $(t).attr("aria-describedby").substr($(t).attr("aria-describedby").indexOf('_') + 1);
                if (isLoadOnce) {
                    $("#gridCustom").setGridParam({ sortname: colindex, sortorder: 'desc', page: 1 }).trigger('reloadGrid');
                }
                else {
                    colindex = $(t).parent().find("td").index($(t));
                    var pagesize1 = $("#gridCustom").getGridParam("rowNum");
                    RunTemplate(1, pagesize1, "desc", colindex);
                }
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


function SetRowDimensionMenu() {
    $("#rowdimlist").find("li").contextMenu("rowDimensionMenu", {
        onShowMenu: function (e, menu) {
            return menu;
        },
        bindings: {
            "delRowDimension": function (t) {
                $("#cellDimTb").empty();
                $("#pagination").empty();
                $("#seleCell").empty();
                $("#regionUI").empty();
                $("#cellUI").val("");
                $(t).remove();
            },
            "filtRowDimension": function (t) { showDimensionMember(t); },
            "rowColChg": function (t) {
                var trow = $(t).clone();
                trow.data("dimobj", $(t).data("dimobj"));
                $("#coldimlist").append(trow);
                $(t).remove();
                SetColDimensionMenu();
            },
            "configLink": function (t) {
                if ($(t).find("input").length > 1) {
                    $("#linkTxt").val($(t).find("input:eq(1)").val());
                }
                $("#linkDia #linkDiaHd").attr("value", $(t).find("div").attr("id"));
                $("#linkDia").dialog('open');
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



function DisplayEle(ele) {
    if ($(ele).attr("disabled") == "disabled") {
        $(ele).removeAttr("disabled");
    }
    else {
        $(ele).attr("disabled", "disabled");
    }
}


//功能描述：已有模板加载，设置切片区
//创建标识：zzx 20101102
function SetSliceDim(tmp) {
    $(tmp.Analyzer.SliceDimList).each(function () {
        AddSliceDim(this);
    });
}

function sliceNeDeSelectAll() {
    $(this).parent().find(":checkbox").removeAttr("checked");
    var $curTxtCond = $(this).parent().parent().find(":text");
    var $dimlevelinput = $(this).parents("tr:eq(0)").find("div:eq(0)").next("input");
    var dimlevel = $dimlevelinput.val();
    $curTxtCond.val("");
    $dimlevelinput.val(dimlevel.substr(0, dimlevel.lastIndexOf('$')) + "$");
}

function sliceNeSelectAll() {
    $(this).parent().find(":checkbox").attr("checked", "checked");
    var $curTxtCond = $(this).parent().parent().find(":text");
    var $dimlevelinput = $(this).parents("tr:eq(0)").find("div:eq(0)").next("input");
    var dimlevel = $dimlevelinput.val();
    var cond = dimlevel.substr(dimlevel.lastIndexOf('$') + 1);
    $curTxtCond.val("");
    cond = "";
    $(this).parent().find("input:checked").each(function () {
        var selval = $(this).val().replace(",", "◎").replace(":", "㊣");
        if (cond == "") {
            cond = selval;
            $curTxtCond.val($(this).val());
        }
        else {
            cond = cond + "," + selval;
            $curTxtCond.val($curTxtCond.val() + "," + $(this).val());
        }
    });
    $dimlevelinput.val(dimlevel.substr(0, dimlevel.lastIndexOf('$')) + "$" + cond);
}


function htmlspecialchars(str) {
    var s = "";
    if (str.length == 0) return "";
    for (var i = 0; i < str.length; i++) {
        switch (str.substr(i, 1)) {
            case "<": s += "&lt;"; break;
            case ">": s += "&gt;"; break;
            case "&": s += "&amp;"; break;
            case "\"": s += "&quot;"; break;
            default: s += str.substr(i, 1); break;
        }
    }
    return s;
}



//功能描述：往切片区添加一个条件
//curLevel：粒度   dimname：维度名   hiername：层次名
//创建标识：zzx 20101102
function AddSliceDim(dim) {
    var rowNum = $("#tableChoice tr").length;
    var trDim = $("<tr></tr>");
    trDim.data("dimobj", dim);
    trDim.append("<td style='text-align: center;'>" + dim.LevelName + "</td>");
    var tdCondSel = $("<td>");
    var $txtCond = $("<input type=\"text\" style=\"display:block;width:94%;\" readonly=\"readonly\" />");
    $txtCond.val(dim.Val);
    $txtCond.attr("id", "slice_" + dim.LevelName);
    $txtCond.click(function () {
        $("#cellHid").val($(this).attr("id"));
        if (dim.LevelName == "日") {
            showDimDayMember($(this).parent().parent());
        }
        else {
            initDimFilterDialog(dim);
        }
    });
    tdCondSel.append($txtCond);
    trDim.append(tdCondSel);
    $("#tableChoice tr:eq(" + (rowNum - 2) + ")").after(trDim);
    SetChoiceMenu();
    $("#divFilter").height($("#divFilter").height() + 23);
    $("#tablecol").height($("#tablecol").height() - 23);
    $("#tablebody").parent().height($("#tablebody").parent().height() - 23);
}

function setCurDimInfo() {
    var limeas = $("#colmealist>li");
    if (limeas.length > 0) {
        var meaid = $(limeas[0]).data("meaobj").MeasureID;
        var rootPath = dss.rootPath;
        if (meaid != firstMeaID) {
            $.ajax({
                cache: true,
                type: "POST",
                url: rootPath + "PlugIn/CustomAnalysis/Handler/Dimension.ashx?type=dim",
                data: {
                    meaid: meaid
                },
                datatype: "json",
                success: function (data) {
                    curDimInfo = $.parseJSON(data);
                }
            });
        }
    }
}