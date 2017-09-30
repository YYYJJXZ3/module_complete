(function ($, undefined) {
    $.extend({
        download: {
            init: function (opts) {
                opts = $.extend({
                    fileName: '新建文件',
                    colAttr: []
                }, opts);
                var objArr = [];
                $("div[downDataType='down']").each(function () {
                    if ($(this).css("display") != "none") {
                        objArr.push($(this));
                    }
                });
                if (objArr.length <= 0) {
                    $(document.body).find("div").each(function () {
                        if ($(this).data("downDataType") == "down") {
                            if ($(this).css("display") != "none") {
                                objArr.push($(this));
                            }
                        }
                    });
                }
                if (objArr.length <= 0) {
                    return;
                }
                method.exportData(objArr, opts);
            },
            exportAnanlyzer: function (totalCount, analyzer, fileName) {
                var dataList = [{
                    sql: null,
                    conn: null,
                    source: null,
                    analyzer: dss.jsonToString(analyzer),
                    titleName: fileName
                }];
                method.ajax({
                    fileName: fileName
                }, totalCount, dataList);
            },
            exportDiv: function (objArr, opts, totalCount) {
                method.exportData(objArr, opts, totalCount);
            }
        }
    });

    var method = {
        exportData: function (objArr, opts, totalCount) {
            dss.load(true);
            var dataList = [];
            $.each(objArr, function (i, item) {
                var temp = item.data("downDataSource");
                var data = $.extend({}, true, temp);
                if (data.source != null) {
                    data.source = dss.jsonToString(data.source);
                } else if (data.analyzer != null) {
                    data.analyzer = dss.jsonToString(data.analyzer);
                }
                if (opts.colAttr.length > 0) {
                    var p = method.getFilter(item[0].id, opts.colAttr);
                    if (p != null) {
                        if (p.colList != null) {
                            data["colList"] = p.colList;
                        }
                        if (p.sheetName != null && p.sheetName.length > 0) {
                            data.titleName = p.sheetName;
                        }
                    }
                }
                dataList.push(data);
            });
            dss.load(false);
            method.ajax(opts, totalCount, dataList);
        },
        ajax: function (opts, totalCount, dataList) {
            var strList = dss.jsonToString(dataList);
            $.ajax({
                url: dss.rootPath + 'javascript/JSControl/DownloadManager/Handler/Export.ashx',
                type: 'post',
                dataType: 'json',
                data: {
                    datalist: strList,
                    fileName: opts.fileName,
                    listid: dss.request("listid"),
                    totalCount: totalCount
                },
                beforeSend: function () {
                    dss.load(true);
                },
                complete: function () {
                    dss.load(false);
                },
                success: function (data) {
                    if (data.status == 0) {
                        if (data.data.msg == "3") {
                            dss.dialog({
                                content: '<div style="margin: 3px; width: 200px; font-size: 12px; color: #666;"><div style="margin-bottom: 10px;">' + data.url + '</div><div><span>验证码:</span><input type="text" id="txtCodeExport" style="width: 80px;" /></div></div>',
                                width: 300,
                                height: 200,
                                title: '提示信息',
                                buttons: {
                                    "确定": function () {
                                        $(this).dialog("close");
                                        $.ajax({
                                            url: dss.rootPath + 'javascript/JSControl/DownloadManager/Handler/Export.ashx',
                                            type: 'post',
                                            dataType: 'json',
                                            data: {
                                                datalist: strList,
                                                fileName: opts.fileName,
                                                listid: dss.request("listid"),
                                                totalCount: totalCount,
                                                code: $("#txtCodeExport").val()
                                            },
                                            beforeSend: function () {
                                                dss.load(true);
                                            },
                                            complete: function () {
                                                dss.load(false);
                                            },
                                            success: function (datachild) {
                                                if (datachild.status == 0) {
                                                    if (datachild.data.msg == "1") {
                                                        method.openfile(dss.rootPath + "Files/" + datachild.data.url);
                                                    } else {
                                                        dss.alert(datachild.data.url, null, "提示信息", 3);
                                                    }
                                                }
                                                else {
                                                    dss.alert(datachild.data.data);
                                                }
                                            }
                                        });
                                    },
                                    "取消": function () {
                                        $(this).dialog("close");
                                    }
                                }
                            });
                        }
                        else if (data.data.msg == "1") {
                            method.openfile(data.data.url);
                        } else {
                            dss.alert(data.data.url, null, "提示信息", 3);
                        }
                    }
                    else {
                        console.log(data.data);
                        dss.alert("暂无可导出数据");
                    }
                }
            });
        },
        getFilter: function (id, colList) {
            var value = null;
            $.each(colList, function (i, val) {
                if (val.divName == id) {
                    value = val;
                    return false;
                }
            });
            return value;
        },
        openfile: function (url) {
            var iframe = document.createElement('iframe');
            iframe.src = dss.rootPath + "javascript/JSControl/DownloadManager/Handler/FileDownLoad.ashx?name=" + url;
            iframe.style.display = "None";
            document.body.appendChild(iframe);
        }
    };
})(jQuery)