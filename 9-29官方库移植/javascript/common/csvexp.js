function analyzerCsvExport(analyzer, rowcount) {
    csvExport("", "", rowcount, analyzer);
}

function csvExport(sql, connKey, rowcount, analyzer) {
    var datacount = 0;
    var anaStr = "";
    if (analyzer == null) {
        anaStr = "";
    }
    else {
        anaStr = jsonToString_2(analyzer);
    }
    if (rowcount != undefined && rowcount != "") {
        datacount = Number(rowcount);
        if (datacount <= 30000) {
            downloadFile(sql, connKey, anaStr);
        }
        else {
            showDialogExp(datacount, sql, connKey, anaStr);
        }
    }
    else {
        var rootpath = getRootPath_2();
        $.ajax({
            cache: false,
            type: "POST",
            url: rootpath + "/framework/CsvHandler.ashx?type=count",
            beforeSend: function () { $("#divExpLoadingStatus").show(); },
            complete: function () { $("#divExpLoadingStatus").hide(); },
            data: {
                sql: sql,
                conn: connKey,
                analyzer: anaStr
            },
            datatype: "text",
            success: function (data) {
                datacount = Number(data);
                if (datacount <= 30000) {
                    downloadFile(sql, connKey, 0, datacount, anaStr);
                }
                else {
                    showDialogExp(datacount, sql, connKey, anaStr);
                }
            },
            error: function (d, status, reason) {
                $("#divLoadingStatus").hide();
            }
        });
    }
}

function getCsvExportDiv() {
    var calDiv = $(">html>body>#dialogCsvExport");
    if (calDiv.length == 0) {
        calDiv = $("<div id='dialogCsvExport' title='数据导出' style='display:none;'></div>");
        calDiv.append($(""));
        $(">html>body").append(calDiv);
    }
    return calDiv;
}

// 为避免方法名冲突，特地把getRootPath方法名更新为getRootPath_2，本文件内的同名方法已同步更新。
function getRootPath_2() {
    var strFullPath = window.document.location.href;
    var strPath = window.document.location.pathname;
    var pos = strFullPath.indexOf(strPath);
    var prePath = strFullPath.substring(0, pos);
    var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
    return prePath + postPath;
}

function downloadFile(sql, connKey, start, end, anaStr) {
    if (start == undefined) {
        start = "";
    }
    if (end == undefined) {
        end = "";
    }
    var rootpath = getRootPath_2();
    $.ajax({
        cache: false,
        type: "POST",
        url: url = rootpath + "/framework/CsvHandler.ashx",
        data: {
            sql: sql,
            conn: connKey,
            start: start,
            end: end,
            analyzer: anaStr
        },
        datatype: "text",
        success: function (data) {
            showDownloadLink(data);
        }
    });
}

function showDownloadLink(fileName) {
    var rootpath = getRootPath_2();
    var diaexport = getCsvExportDiv();
    diaexport.empty();
    var linkDownload = $("<a target='_top'>下载</a>");
    linkDownload.attr("href", rootpath + "/Temp/" + fileName);
    diaexport.append(linkDownload);
    diaexport.dialog({
        autoOpen: true,
        width: 200,
        height: 120,
        modal: true,
        title: "数据导出"
    });
}

function showDownloadLinks(title, data) {
    if (data != undefined && data != "") {
        var rootpath = getRootPath_2();
        var files = data.split(",");
        var html = "";
        for (var index = 0; index < files.length; index++) {
            var links = files[index].split(":");
            var a_title = "";
            var href = "";
            a_title = links[0];
            if (links.length == 2) {
                href = links[1];
            }
            else {
                href = links[0];
            }
            html += "<a target='_blank' href='" + rootpath + "/temp/" + href + "'>" + a_title + "</a>";
            html += "&nbsp;&nbsp;";
        }
        var temp = $("<div></div");
        temp.html(html);
        $(document.body).append(temp);
        temp.dialog({
            autoOpen: true,
            width: 300,
            height: 120,
            modal: true,
            title: title,
            close: function (event, ui) {
                temp.remove();
            }
        });
    }
}

function showDialogExp(datacount, sql, connKey, anaStr) {
    var diaexp = getCsvExportDiv();
    diaexp.empty();
    var tbl = $("<table></table>");
    var rootpath = getRootPath_2();
    for (var i = 1; i <= datacount; i += 20000) {
        var tr = $("<tr></tr>");
        tr.append($("<td></td>")); tr.append($("<td></td>"));
        var end = (i + 20000) < datacount ? (i + 20000 - 1) : datacount;
        var link = $("<a>第" + i + "--" + end + "条</a>");
        link.attr("href", "javascript:void(0);");
        link.click(function () {
            var downloadtd = $("td:eq(1)", $(this).parent().parent());
            $.ajax({
                cache: false,
                type: "POST",
                url: rootpath + "/framework/CsvHandler.ashx",
                beforeSend: function () { downloadtd.empty(); },
                data: {
                    sql: sql,
                    conn: connKey,
                    start: $(this).text().substring(1, $(this).text().indexOf("-")),
                    end: $(this).text().substring($(this).text().lastIndexOf("-") + 1).replace("条", ""),
                    analyzer: anaStr
                },
                datatype: "text",
                success: function (data) {
                    downloadtd.empty();
                    var linkDownload = $("<a target='_top'></a>");
                    linkDownload.text("下载");
                    linkDownload.attr("href", rootpath + "/Temp/" + data);
                    downloadtd.append(linkDownload);
                }
            });
        });
        $("td:eq(0)", tr).append(link);
        tbl.append(tr);

    }
    diaexp.append(tbl);
    $(">html>body>#dialogCsvExport").dialog({
        autoOpen: true,
        width: 400,
        height: 300,
        modal: true,
        title: "总记录数：" + datacount + ", 请选择记录数导出"
    });
}

function jsonToString_2(obj) {
    var THIS = this;
    switch (typeof (obj)) {
        case 'string':
            return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';
        case 'array':
            return '[' + obj.map(jsonToString_2).join(',') + ']';
        case 'object':
            if (obj instanceof Array) {
                var strArr = [];
                var len = obj.length;
                for (var i = 0; i < len; i++) {
                    strArr.push(jsonToString_2(obj[i]));
                }
                return '[' + strArr.join(',') + ']';
            } else if (obj == null) {
                return 'null';

            } else {
                var string = [];
                for (var property in obj) string.push(jsonToString_2(property) + ':' + jsonToString_2(obj[property]));
                return '{' + string.join(',') + '}';
            }
        case 'number':
            return obj;
        default:
            return obj;
    }
}