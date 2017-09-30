var frameTree = window.parent.frames[0];
var frameMain = window.parent.frames[1];
function toolbarClick(s) {
    var showType;
    if (s == "save") {
        Save();
    }
    else if (s == "saveas") {
        SaveAs();
    }
    else if (s == "template") {
        showType = frameTree.document.getElementById("divTemplate").style.display;
        if (showType == 'block') {
            frameTree.document.getElementById("divTemplate").style.display = 'none';
            window.parent.document.getElementById("frmFrame").cols = "0,*";
        }
        else {
            frameTree.document.getElementById("divTemplate").style.display = 'block';
            window.parent.document.getElementById("frmFrame").cols = "220,*";
        }

    }
    else if (s == "condition") {
        showType = document.getElementById("divChoice").style.display;
        if (showType == 'block') {
            $("#divChoice").hide();
            $("#divFilter").parent().css("margin-left", "0px");
        }
        else {
            $("#divChoice").show();
            $("#divFilter").parent().css("margin-left", "204px");
        }
    }
    else if (s == "chart") {
        if ($("#chartAreaCustom").css("display") != "none") {
            $("#chartAreaCustom").slideUp("300");
        }
        else {
            $("#chartAreaCustom").slideDown("300");
            BindChart();
        }
    }
    else if (s == "back") {

    }
    else if (s == "forword") {

    }
    else if (s == "graph") {
        showType = frameMain.frames[0].document.getElementById("divChart").style.display;
        if (showType == 'block') {
            frameMain.frames[0].document.getElementById("divChart").style.display = 'none';
        }
        else {
            frameMain.frames[0].document.getElementById("divChart").style.display = 'block';
        }
    }
    else if (s == "table") {
        if ($("#divgrid").css("display") != "none") {
            $("#divgrid").slideUp("500");
        }
        else {
            $("#divgrid").slideDown("500");
        }
    }
    else if (s == "subscribe") {
        $("#frameSubscribe").attr("src", "../Pages/Subscribe.aspx?userid=" + $("input[id$=hiddenUserID]").val() + "&reportid=" +
            ((currentTemplateId == undefined || currentTemplateId == "-1") ? "" : currentTemplateId) + "&ran=" + new Date().getSeconds());
        $("#dialogSubscribe").dialog({
            width: 640,
            height: 430,
            autoOpen: true,
            modal: true,
            buttons: {
                "关闭": function () {
                    $(this).dialog('close');
                }
            }
        });
    }
    else if (s == "run") {
        excuteTemplate();
    }
    else if (s == "publish") {
        if (currentTemplateId == "-1") {
            alertDialog("提示", "报表保存后才可以发布。");
            return;
        }
        openPageInTab("发布", "PlugIn/Dashboard/Design.html?templateid=" + currentTemplateId + "&layout=100007");
    }
    else if (s == "export") {
        exportcsv();
    }
    else if (s == "help") {
        var helpsrc = $("#frameHelp").attr("src");
        if (helpsrc == undefined || helpsrc == "") {
            $("#frameHelp").attr("src", "helper.htm");
        }
        $("#dialogHelp").dialog('open');
    }
    else if (s == "showunit") {
        setUnit();
    }
    else if (s == "showsql") {
        var tmp = $.extend(true, {}, getCurTemplate());
        var tmpstr = jsonToString(tmp);
        $.ajax({
            url: "../pages/Handler.ashx?type=sql",
            type: "POST",
            datatype: "text",
            data: {
                tmp: tmpstr
            },
            beforeSend: function () { $("#divLoadingStatus").show(); },
            complete: function () { $("#divLoadingStatus").hide(); },
            success: function (data) {
                var qs = $.parseJSON(data);
                $("#sqlStr").text(qs.Sql);
                $("#sqlStrDia").dialog("open");
            }
        });
    }
    else if (s == "tempchangedata") {
        setPanel();
    }
    else if (s == "setting") {
        showTemplateSetting();
        $("#dialogOptions").dialog("open");
    }
}

function getRootPath() {
    return dss.rootPath;
}

function toolbarover(key, c) {
    $(c).addClass("ca_toolbar_" + key + "_hover");
}

function toolbarout(key, c) {
    $(c).removeClass("ca_toolbar_" + key + "_hover");
}

function exportcsv() {
    var tmp = $.extend(true, {}, getCurTemplate());
    if (tmp.Analyzer.MeasureList.length == 0) {
        alertDialog("提示信息", "未添加任何指标");
        return;
    }
    if (tmp.Analyzer.ColDimList.length > 0) {
        var b = false;
        $(tmp.Analyzer.ColDimList).each(function () {
            if (this.ValList == undefined || this.ValList.length == 0) {
                b = true;
            }
        });
        if (b) {
            alertDialog("提示信息", "列维度未作过滤设置");
            return;
        }
    }
    if (tmp.Analyzer.ColDimList.length == 0 && tmp.Analyzer.RowDimList.length == 0 && tmp.Analyzer.SliceDimList.length == 0) {
        alertDialog("提示信息", "未选择任何维度");
        return;
    }
    if (hasTimeDim(tmp.Analyzer.RowDimList) == false && hasTimeDim(tmp.Analyzer.ColDimList) == false && hasTimeDim(tmp.Analyzer.SliceDimList) == false) {
        alertDialog("提示信息", "没有发现任何时间（日期维）的设置");
        return;
    }
    tmp.Analyzer.PageSetting.Page = 0;
    tmp.Analyzer.PageSetting.PageSize = 20000;
    var tmpstr = jsonToString(tmp);
    $.ajax({
        url: "../pages/Handler.ashx?type=export",
        type: "POST",
        datatype: "xml",
        data: {
            tmp: tmpstr
        },
        beforeSend: function () { $("#divLoadingStatus").show(); },
        complete: function () { $("#divLoadingStatus").hide(); },
        success: function (data) {
            var fileName = $(data).find("file").text();
            var rowcount = $(data).find("file").attr("total");
            var maxRow = $(data).find("file").attr("max");
            var datacount = Number(rowcount);
            var max = Number(maxRow);
            if (datacount > -1) {
                var rootpath = dss.rootPath;
                var dialogCsv = $("#dialogCsvExport");
                dialogCsv.empty();
                var linkDownload = $("<a style='color:blue;' target='_top'>下载</a>");
                linkDownload.attr("href", rootpath + "Temp/ca/" + fileName);
                dialogCsv.append(linkDownload);
                if (datacount > max) {
                    dialogCsv.append("<br/>");
                    var txt = $("<span>您导出的数据超过" + max + "条，点击“下载”可导出前" + max + "条数据，若想导出更多的数据，请点击“转至后台导出“按钮。</span>");
                    dialogCsv.append(txt);
                    var btn = $("<input type='button' class='button' value='转至后台导出'/>");
                    dialogCsv.append(btn);
                    btn.click(function () {
                        var dataList = [{
                            sql: null,
                            conn: null,
                            source: null,
                            analyzer: jsonToString(tmp.Analyzer),
                            titleName: "ca"
                        }];
                        $.ajax({
                            url: dss.rootPath + 'javascript/JSControl/DownloadManager/Handler/Export.ashx',
                            type: 'post',
                            dataType: 'json',
                            data: {
                                datalist: jsonToString(dataList),
                                fileName: "",
                                listid: dss.request("listid"),
                                totalCount: datacount
                            },
                            success: function (data) {
                                alertDialog("提示信息", "已成功转为后台导出。导出完成后将以系统消息的方式通知您，请关注右上角的未读消息。");
                            },
                            error: function () {
                                dss.load(false);
                            },
                            beforeSend: function () {
                                dss.load(true);
                            },
                            complete: function () {
                                dss.load(false);
                            }
                        });
                    });
                }
                dialogCsv.dialog({
                    autoOpen: true,
                    width: 300,
                    height: 180,
                    modal: true,
                    title: "数据导出"
                });
            }
            else {
                alertDialog("导出失败", fileName);
            }
        }
    });
}