/*
  *Version:2.1215.1.1
  *Author:胡峰超
  *Date:2015-12-15
  *Description:主要实现dashboard功能页面呈现

  *修改:hufenghcao   
  *时间：2016-01-14
  *描述：处理手机号码呈现问题
*/
(function ($, undefined) {
    $.extend({
        dashboard: {
            init: function (option) {
                if (dss.request("listid").length > 0) {
                    dss.pageheader("m");
                }
                option = $.extend(true, {
                    dashboardId: "",
                    isLayout: false,
                    autoInitCondition: true,
                    isSwitch: true,
                    condition: [],
                    layoutSettings: [],
                    callback: {
                        beforeQuery: null,
                        exportClick: null
                    }
                }, option);
                jsTools.init();
                $.ajax({
                    url: layour.url,
                    data: {
                        act: 'dashboard',
                        dashboardId: option.dashboardId,
                        param: (dss.request("initvalues").length > 0 ? decodeURI(dss.request("initvalues")) : "")
                    },
                    dataType: 'json',
                    success: function (data) {
                        document.title = data.Desc;
                        method.initDom(data, option);
                    },
                    beforeSend: function () {
                        dss.load(true);
                    },
                    complete: function () {
                        dss.load(false);
                    }
                });
            },
            update: function (reportid, params) {
                $.dashboard.setConditon(reportid, params);
                dataShow.getData(reportid);
            },
            getParams: function () {
                return jsTools.getparam();
            },
            setAnalyzer: function (reportid, analyzer) {
                if (jsTools.isTrue(analyzer, 'object')) {
                    var temp = $("#" + reportid).data("strAnalyzer");
                    if (jsTools.isTrue(temp, 'object')) {
                        analyzer = $.extend(true, temp, analyzer);
                    }
                    $("#" + reportid).data("strAnalyzer", analyzer);
                }
            },
            setConditon: function (reportid, params) {
                if (jsTools.isTrue(params, 'object')) {
                    if (params.length > 0) {
                        jsTools.setCondition(reportid, params, 1);
                    }
                }
            },
            setTemplateId: function (reportid, value) {
                var obj = $("#" + reportid);
                if (obj.attr("reportid") != value) {
                    obj.attr("reportid", "");
                    obj.attr("setReportid", value);
                }
            }
        },
        preview: {
            init: function (data) {
                var option = $.extend(true, {
                    dashboardId: "",
                    isLayout: true,
                    autoInitCondition: true,
                    condition: [],
                    layoutSettings: [],
                    callback: {
                        beforeQuery: null,
                        exportClick: null
                    }
                }, {});
                jsTools.init();
                method.initDom(data, option);
            }
        }
    });
    var layour = {
        condition: 'dashboard-query',
        layour: 'dashboard-layout',
        showCode: false,
        myquery: null,
        url: dss.rootPath + 'plugin/Dashboard/handler/View.ashx',
        time: ["日", "月", "周", "季度", "半年", "年"],
        timetype: ["日", "月", "周", "小时", "分钟", "季度", "半年", "年", "十五分钟", "五分钟"],
        telArr: ["MSISDN", "号码", "手机号码", "用户号码"]
    };

    var method = {
        initDom: function (option, initOpt) {
            if (initOpt.autoInitCondition) {
                condition.initTime(option.Conditions);
                var otherDims = option.Conditions.getOtherDim();
                if (otherDims.length > 0 || initOpt.condition.length > 0) {
                    condition.initOther(otherDims, initOpt.condition);
                }
            }
            condition.initDom(option, initOpt);
            $("#btnQuery").click(function () {
                var sourceCondition = jsTools.getparam();
                $("#" + layour.layour)
                    .find("div[isreport=\"true\"]")
                    .each(function () {
                        jsTools.setCondition($(this)[0].id, sourceCondition, 1);
                        if ($(this).attr("isExe") == "true") {
                            if ($(this).attr("ison") != "1") {
                                dataShow.getData($(this)[0].id);
                            }
                        }
                    });
                if (jsTools.isTrue(initOpt.callback.beforeQuery, "function")) {
                    initOpt.callback.beforeQuery();
                }

            });
            $("#btnExport").click(function () {
                if (jsTools.isTrue(initOpt.callback.exportclick, "function")) {
                    initOpt.callback.exportclick();
                }
                dss.download({
                    fileName: document.title
                });
            });
        }
    };
    var condition = {
        initTime: function (arrCondition) {
            var dateoption = {
                showTypeMonth: false,
                showTypeWeek: false,
                showTypeDay: false,
                showTypeHour: false,
                showTypeMinute: false,
                isMultipleHour: false,
                defaultTimeType: undefined,
                defaultDateStr: undefined,
                defaultHourStr: undefined,
                range: false,
                isTile: true
            };
            var date = arrCondition.getDimByName();
            if (date == null) {
                return;
            }
            if (date.DimGroup.indexOf("日") > -1) {
                dateoption.showTypeDay = true;
                if (date.DimGroup.indexOf("日") == 0) {
                    dateoption.defaultTimeType = "Day";
                }
            }
            if (date.DimGroup.indexOf("月") > -1) {
                dateoption.showTypeMonth = true;
                if (date.DimGroup.indexOf("月") == 0) {
                    dateoption.defaultTimeType = "Month";
                }
            }
            if (date.DimGroup.indexOf("周") > -1) {
                dateoption.showTypeWeek = true;
                if (date.DimGroup.indexOf("周") == 0) {
                    dateoption.defaultTimeType = "Week";
                }
            }
            if (date.DimGroup.indexOf("季度") > -1) {
                dateoption.showTypeQuarter = true;
                if (date.DimGroup.indexOf("季度") == 0) {
                    dateoption.defaultTimeType = "Quarter";
                }
            }
            if (date.DimGroup.indexOf("半年") > -1) {
                dateoption.showTypeHalfYear = true;
                if (date.DimGroup.indexOf("半年") == 0) {
                    dateoption.defaultTimeType = "HalfYear";
                }
            }
            if (date.DimGroup.indexOf("年") > -1) {
                dateoption.showTypeYear = true;
                if (date.DimGroup.indexOf("年") == 0) {
                    dateoption.defaultTimeType = "Year";
                }
            }
            if (date.ShowType == "1") {
                dateoption.range = true;
            }
            if (date.DefaultValue != null && date.DefaultValue.length > 0) {
                dateoption.defaultDateStr = date.DefaultValue;
            }

            var hour = arrCondition.getDimByName("小时");
            if (hour != null) {
                dateoption.showTypeHour = true;
                if (typeof hour.DefaultValue == 'string' && hour.DefaultValue.length > 0) {
                    dateoption.defaultHourStr = hour.DefaultValue;
                }
                if (hour.ShowType == "3") {
                    dateoption.isMultipleHour = true;
                }
                if (hour.HasAll && date.LevelName == "日") {
                    dateoption.defaultTimeType = "Hour";
                }
            }
            var minute = arrCondition.getDimByName("分钟");
            if (minute != null) {
                dateoption.showTypeMinute = true;
            }
            else {
                minute = arrCondition.getDimByName("十五分钟");
                if (minute != null) {
                    dateoption.showTypeMinute15 = true;
                }
                else {
                    minute = arrCondition.getDimByName("五分钟");
                    if (minute != null) {
                        dateoption.showTypeMinute5 = true;
                    }
                }
            }
            $("#txtTime").timepicker(dateoption);
        },
        initOther: function (curConds, conititon) {
            var conoptions = [];
            $.each(curConds, function (index, item) {
                if (item.isUse != 'false') {
                    var curLevel = {
                        labelname: item.LableName,
                        width: 80,
                        defaultShow: item.LevelName,
                        key: index,
                        type: 'text',
                        items: []
                    };
                    $.each(item.DimGroup, function (key, varitem) {
                        var team = {
                            dimid: item.DimensionID,
                            levelname: varitem,
                            dimname: item.DimensionName,
                            selectmode: "single",
                            initValues: [],
                            initClass: "commdata",
                            hascheckall: true
                        };
                        if (item.ShowType == "3") {
                            team.selectmode = "multiple";
                            curLevel.type = "dropdown";
                        }
                        else if (item.ShowType == "2") {
                            curLevel.type = "dropdown";
                        }
                        if (item.DefaultValue != null && item.DefaultValue.length > 0) {
                            var arrTem = item.DefaultValue.split(",");
                            for (var j = 0; j < arrTem.length; j++) {
                                if (item.ShowType == "5") {
                                    team.initValues.push(arrTem[j]);
                                }
                                else {
                                    team.initValues.push({
                                        name: arrTem[j]
                                    });
                                }
                            }
                        }
                        curLevel.items.push(team);
                    });
                    conoptions.push(curLevel);
                }
            });
            if (typeof conititon == 'object' && conititon.length > 0) {
                for (var i = 0; i < conititon.length; i++) {
                    conoptions.push(conititon[i]);
                }
            }
            $('#queryControl').controlmanager(conoptions);
        },
        initDom: function (option, initOpt) {
            if (initOpt.isLayout) {
                dss.ajax({
                    url: dss.rootPath + "plugin/Dashboard/" + option.LayoutUrl,
                    dataType: 'html',
                    success: function (data) {
                        $("#" + layour.layour)
                            .empty()
                            .html(data);
                    },
                    complete: function () {
                        dataShow.init(option, initOpt);
                    }
                });
            }
            else {
                dataShow.init(option, initOpt);
            }

        }
    };
    var dataShow = {
        init: function (option, initOpt) {
            var templates = [];
            var param = [];
            $.each(option.Conditions, function (index, item) {
                if (layour.timetype.indexOf(item.LevelName) > -1) {
                    var result = jsTools.getTimeType();
                    if (layour.time.indexOf(item.LevelName) > -1) {
                        param.setCondition(result.ch, result.value, 1, 0);
                    }
                    else {
                        param.setCondition("日", result.value, 1, 0);
                        param.setCondition("小时", result.hour, 1, 0);
                    }
                }
                else {
                    param.setCondition(item.LevelName,
                            item.DefaultValue,
                            item.ShowType,
                            item.ValType);
                }
            });
            var reqStr = dss.request("initvalues");
            if (reqStr.length > 0) {
                var paramStr = jsTools.anaReq(decodeURI(reqStr));
                for (var j = 0; j < paramStr.length; j++) {
                    param.setCondition(paramStr[j].k, paramStr[j].v, 1, 0);
                }
            }
            $.each(option.DashboardRelations, function (i, p) {
                templates.push(p.ReportID);
                var div = $("<div></div>");
                div.attr("id", "div" + p.ReportID)
                    .attr("cra", "cra");
                $("#" + p.LayoutDivID)
                    .append(div)
                    .attr("reportid", p.ReportID);

                var optitem = jsTools.getItemById(initOpt.layoutSettings, p.LayoutDivID);
                if (optitem != null) {
                    $("#" + p.LayoutDivID)
                        .data("initParam", optitem)
                        .attr("isExe", (optitem.autoBind == undefined ? true : optitem.autoBind));
                } else {
                    $("#" + p.LayoutDivID)
                        .attr("isExe", "true");
                }
                var dataUrl = jsTools.anaReq(p.JumpUrlSet);
                if (dataUrl.length > 0) {
                    $.each(dataUrl, function (lp, lk) {
                        if (lk.t == "2") {
                            var tarArr = jsTools.anaReq(lk.lu);
                            if (tarArr.length > 0) {
                                $.each(tarArr, function (kj, kl) {
                                    $("#" + kl.id).attr("ison", "1");
                                });
                            }
                        }
                    });
                }
                $("#" + p.LayoutDivID)
                    .data("dataCondition", param)
                    .data("dataUrl", dataUrl)
                    .data("isswitch", initOpt.isSwitch);
            });
            dss.ajax({
                url: layour.url,
                type: 'post',
                data: {
                    act: 'getalltemplate',
                    strCon: dss.jsonToString(templates),
                    param: (dss.request("initvalues").length > 0 ? decodeURI(dss.request("initvalues")) : "")
                },
                success: function (data) {
                    $.each(option.DashboardRelations, function (i, p) {
                        $("#" + p.LayoutDivID).data("datasource", data[p.ReportID]);
                        if ($("#" + p.LayoutDivID).attr("isExe") == "true") {
                            if ($("#" + p.LayoutDivID).attr("ison") != "1") {
                                dataShow.getData(p.LayoutDivID);
                            }
                        }
                    });
                },
                complete: function () {
                    if (jsTools.isTrue(initOpt.callback.beforeQuery, "function")) {
                        initOpt.callback.beforeQuery();
                    }
                }
            })
        },
        getData: function (reportid) {
            var obj = $("#" + reportid);
            if (obj.attr("reportid") == undefined
                || obj.attr("reportid").length == 0) {
                dss.ajax({
                    url: layour.url,
                    type: 'post',
                    data: {
                        act: 'getreportdataandoption',
                        reportid: obj.attr("setReportid"),
                        param: (dss.request("initvalues").length > 0 ? decodeURI(dss.request("initvalues")) : "")
                    },
                    success: function (data) {
                        $("#" + reportid).data("datasource", data);
                    },
                    complete: function () {
                        obj.attr("reportid", obj.attr("setReportid"));
                        dataShow.getDataSource(reportid);
                    }
                });
            }
            else {
                dataShow.getDataSource(reportid);
            }
        },
        getDataSource: function (reportid) {
            var source = $("#" + reportid).data("datasource");
            if (source != undefined) {
                var analyer = $.extend(true, {}, source.Analyzer);
                if (analyer.RowDimList.length > 0) {
                    analyer.RowDimList.setData(reportid, "row", analyer.SliceDimList);
                }
                if (analyer.SliceDimList.length > 0) {
                    analyer.SliceDimList.setData(reportid, "slice", null);
                }
                if (analyer.ColDimList.length > 0) {
                    analyer.ColDimList.setData(reportid, "col", null);
                }
                analyer.ShowUintInColumn = source.GridSetting.ShowUnit;
                var ana = $("#" + reportid).data("strAnalyzer");
                if (jsTools.isTrue(ana, 'object')) {
                    if (jsTools.isTrue(ana.MeasureFilter, "string")) {
                        if (ana.MeasureFilter.length > 0) {
                            analyer.MeasureFilter = ana.MeasureFilter;
                        }
                    }
                    if (jsTools.isTrue(ana.TopN, 'number')) {
                        if (ana.TopN > 0) {
                            analyer.TopN = ana.TopN;
                        }
                    }
                    if (jsTools.isTrue(ana.MeasureList, 'object')) {
                        if (ana.MeasureList.length > 0) {
                            analyer.MeasureList = ana.MeasureList;
                        }
                    }
                }
                if (source.ShowGrid && !source.ShowChart) {
                    dataShow.grid(analyer, reportid, source);
                }
                else if (!source.ShowGrid && source.ShowChart) {
                    dataShow.chart(source, analyer, reportid);
                }
                else {
                    dataShow.gridchart(analyer, reportid, source);
                }
            }
        },
        grid: function (analyer, reportid, source) {
            var all = $("#" + reportid);
            var div = all.find("div[cra=\"cra\"]").eq(0);
            var datasource = {
                captionName: source.TemplateName,
                showrownum: false,
                islocaldata: false,
                ispaging: true,
                col: {
                    property: []
                },
                analyzer: analyer,
                paging: {
                    rowNum: (analyer.PageSetting.PageSize != undefined ? analyer.PageSetting.PageSize : 15),
                    rowList: [10, 15, 20, 30, 50]
                }
            };
            var lenCol = analyer.RowDimList.length + (
                analyer.ColDimList.length == 0 ?
                analyer.MeasureList.length :
                 analyer.MeasureList.length * analyer.ColDimList.length
                );

            if (source.GridSetting.LockCol >= 0 && lenCol > 8) {
                for (var i = 0; i < source.GridSetting.LockCol; i++) {
                    datasource.col.property.push({
                        colindex: i,
                        frozen: true
                    });
                }
            };
            for (var i = analyer.RowDimList.length;
                i < analyer.RowDimList.length + analyer.MeasureList.length;
                i++) {
                datasource.col.property.push({
                    colindex: i,
                    align: 'right',
                    sorttype: "float"

                });
            }
            datasource["callback"] = {
                gridComplete: function (gridObj, opts) {
                    evUrl.gridComplete(gridObj, opts, reportid);
                }
            };
            var iparam = $("#" + reportid).data("initParam");
            if (jsTools.isTrue(iparam, 'object')) {
                if (jsTools.isTrue(iparam.beforeBind, 'function')) {
                    datasource = iparam.beforeBind(reportid, datasource);
                }
            }
            if (datasource) {
                div.smartgrid(datasource);
            }
        },
        chart: function (source, analyer, reportid) {
            var all = $("#" + reportid);
            var height = all.height();
            if (height == 0) {
                height = 250;
            } else {
                height = height - 30;
            }
            var div = all.find("div[cra=\"cra\"]").eq(0);
            div.css("min-height", height).css("width", "l00%");;
            if ($("#" + reportid + "title").length == 0) {
                var sdiv = $("<div class='dss_db_chart_title' id='" + reportid + "title'></div>");
                $("<div class='left'>" + source.TemplateName + "</div>").appendTo(sdiv);//right
                $("<div class='right'></div>").appendTo(sdiv)
                div.before(sdiv);
            }
            evUrl.bindchart(all, div, source, analyer, reportid);
        },
        gridchart: function (analyer, reportid, source) {
            var all = $("#" + reportid);
            if ($("#Grid" + reportid).length) {
                $("#Grid" + reportid).remove();
            }
            if ($("#Chart" + reportid).length) {
                $("#Chart" + reportid).remove();
            }
            var divGrid = $("<div id=\"Grid" + reportid + "\"></div>");
            var divChart = $("<div id=\"Chart" + reportid + "\"></div>");
            var $div = all.find("div[cra=\"cra\"]").eq(0);
            $div.append(divChart)
            .append(divGrid);

            var datasource = {
                captionName: source.TemplateName,
                showrownum: false,
                islocaldata: false,
                col: {
                    property: []
                },
                analyzer: analyer,
                paging: {
                    rowNum: (analyer.PageSetting.PageSize != undefined ? analyer.PageSetting.PageSize : 15),
                    rowList: [10, 15, 20, 30, 50]
                }
            };
            var lenCol = analyer.RowDimList.length + (
                analyer.ColDimList.length == 0 ?
                analyer.MeasureList.length :
                 analyer.MeasureList.length * analyer.ColDimList.length
                );

            if (source.GridSetting.LockCol >= 0 && lenCol > 8) {
                if (source.GridSetting.LockCol >= 0 && lenCol > 8) {
                    for (var i = 0; i < source.GridSetting.LockCol; i++) {
                        datasource.col.property.push({
                            colindex: i,
                            frozen: true
                        });
                    }
                };
            }
            for (var i = analyer.RowDimList.length;
                 i < analyer.RowDimList.length + analyer.MeasureList.length;
                    i++) {
                datasource.col.property.push({
                    colindex: i,
                    align: 'right',
                    sorttype: "float"

                });
            }
            datasource["callback"] = {
                gridComplete: function (gridObj, opts) {
                    evUrl.gridComplete(gridObj, opts, reportid);
                    divChart.css("display", "block");
                    if ($("#" + reportid + "title").length == 0) {
                        var sdiv = $("<div class='dss_db_chart_title' id='" + reportid + "title'></div>");
                        $("<div class='left'>" + source.TemplateName + "</div>").appendTo(sdiv);//right
                        $("<div class='right'></div>").appendTo(sdiv)
                        divChart.append(sdiv);
                    }
                    var chart = $("#" + reportid + "chart");
                    if (chart.length == 0) {
                        var height = all.height();
                        if (height == 0) {
                            height = 260;
                        }
                        else {
                            height = 260;//height - 30;
                        }
                        chart = $("<div id=\"" + reportid + "chart\"></div>");
                        chart.css("min-height", height)
                        .css("width", "l00%");
                        divChart.append(chart);
                    }
                    evUrl.bindchart(all, chart, source, opts.analyzer, reportid, divGrid.smartgrid("getDatasource"), true);
                }
            };
            divGrid.smartgrid(datasource);
        }
    };
    var evUrl = {
        gridComplete: function (obj, opts, reportid) {
            var iparam = $("#" + reportid).data("initParam");
            var condition = $("#" + reportid).data("dataUrl");
            if (condition && condition.length > 0) {
                $.each(condition, function (index, p) {
                    if (p.t == "2") {
                        if (obj.find("tr").length > 1) {
                            var vparam = jsTools.anaReq(p.lu);
                            var param = jsTools.getCreateParam(p.p, opts, obj.find("tr").eq(1));
                            $.each(vparam, function (lk, kl) {
                                if ($("#" + kl.id).attr("isExe") == "true") {
                                    jsTools.setloopParam(param, kl.id);
                                }
                            });
                        }
                    }

                    obj.find("tr").each(function (i, item) {
                        if (i > 0) {
                            var trObj = $(this);
                            var pin;
                            if (layour.time.indexOf(p.n) > -1) {
                                pin = evUrl.getIndex(opts.analyzer, p.n);
                                if (pin < 0) {
                                    pin = evUrl.getIndex(opts.analyzer, "日");
                                }
                                if (pin < 0) {
                                    pin = evUrl.getIndex(opts.analyzer, "月");
                                }
                                if (pin < 0) {
                                    pin = evUrl.getIndex(opts.analyzer, "周");
                                }
                            }
                            else {
                                pin = evUrl.getIndex(opts.analyzer, p.n);
                            }
                            if (pin >= 0) {
                                var param = jsTools.getCreateParam(p.p, opts, trObj);
                                trObj.find("td")
                                    .eq(pin)
                                    .click(function () {
                                        if (p.t == "1") {
                                            if (p.ly == "0") {
                                                var url = p.lu;
                                                if (p.lu.indexOf("?") < 0) {
                                                    url += "?";
                                                }
                                                else {
                                                    url += "&";
                                                }
                                                if (param.length > 0) {
                                                    url += "initvalues=" + encodeURI(dss.jsonToString(param));
                                                }
                                                if (p.o == "0") {
                                                    dss.openPageInTab(p.ln, url);
                                                }
                                                else {
                                                    if (url.toLocaleLowerCase().indexOf("http://") > -1) {
                                                        window.location.href = url;
                                                    }
                                                    else {
                                                        window.location.href = dss.rootPath + url;
                                                    }
                                                }
                                            }
                                            else {
                                                var url = "plugin/Dashboard/View.html?dashboardid=" + p.lu;
                                                if (param.length > 0) {
                                                    url = url + "&initvalues=" + encodeURI(dss.jsonToString(param));
                                                }
                                                if (p.o == "0") {
                                                    dss.openPageInTab(p.ln, url);
                                                }
                                                else {
                                                    window.location.href = dss.rootPath + url;
                                                }
                                            }
                                        }
                                        else {
                                            var vparam = jsTools.anaReq(p.lu);
                                            $.each(vparam, function (lk, kl) {
                                                jsTools.setloopParam(param, kl.id);
                                            });
                                            if (jsTools.isTrue(iparam, "object")) {
                                                if (jsTools.isTrue(iparam.rowClick, "function")) {
                                                    iparam.rowClick(vparam, pin, opts.analyzer);
                                                }
                                            }
                                        }
                                    })
                                    .css("color", "blue")
                                    .css("cursor", "pointer");
                            }
                        }
                    });
                });
            }
            if (jsTools.isTrue(iparam, "object")) {
                if (jsTools.isTrue(iparam.bindCompleted, "function")) {
                    var objopt = {
                        dataSource: $("#" + opts.finalSet.originalid).smartgrid("getDatasource"),
                        analyzer: opts.analyzer
                    };
                    iparam.bindCompleted(reportid, objopt, obj, $("#" + opts.finalSet.originalid + "title"));
                }
            }
        },
        getIndex: function (analyzer, colname) {
            var index = -1;
            if (analyzer != null) {
                if (analyzer.RowDimList.length > 0) {
                    for (var i = 0; i < analyzer.RowDimList.length; i++) {
                        if (analyzer.RowDimList[i].LevelName == colname) {
                            index = i;
                            break;
                        }
                    }
                }
                if (analyzer.MeasureList.length > 0) {
                    for (var i = 0; i < analyzer.MeasureList.length; i++) {
                        if (analyzer.MeasureList[i].DisplayName == colname) {
                            index = analyzer.RowDimList.length + i;
                            break;
                        }
                    }
                }
            }
            return index;
        },
        bindchart: function (all, div, source, analyer, reportid, datasource, flagState) {
            var typeY = doChart.getNumByType(source.ChartSetting.ChartAxisYList);
            if (typeY == -2) {
                return;
            }
            var chartSet = {
                Height: all.height(),
                Width: div.width(),
                XDataColIndex: source.ChartSetting.AxisX,
                YFormatType: '1000',
                ChartType: (typeY == -1 ? "Combi1Y" : doChart.ChartType(typeY)),
                SubChartType: [],
                Y2DataColIndex: "",
                analyzer: analyer,
                YDataColIndex: "",
                Y2FormatType: '1000',
                // XLabelStyle: 'Rotate',
                ClickEvent: [],
                DataSource: null,
                IsAutoLimits: true,
                XIsTrim: true,
                XTrimNum: 8, XLabelStep: 1,
                callback: {
                    complete: function (objChart, optChart) {
                        var iparam = all.data("initParam");
                        if (jsTools.isTrue(iparam, "object")) {
                            if (jsTools.isTrue(iparam.bindCompleted, "function")) {
                                var optObj = {
                                    dataSource: optChart.DataSource,
                                    analyzer: optChart.analyzer
                                };
                                iparam.bindCompleted(reportid, optObj, objChart, $("#" + reportid + "title"));
                            }
                        }
                        var dataUrl = all.data("dataUrl");
                        if (dataUrl.length > 0) {
                            $.each(dataUrl, function (ui, ut) {
                                if (ut.t == "2") {
                                    var tarArr = jsTools.anaReq(ut.lu);
                                    if (tarArr.length > 0) {
                                        var param = doChart.getCreateParam(optChart, ut.p, 0);
                                        $.each(tarArr, function (ai, at) {
                                            if ($("#" + at.id).attr("isExe") == "true") {
                                                jsTools.setloopParam(param, at.id);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                }
            };
            if (flagState) {
                chartSet.callback = {};
            }
            if (chartSet.ChartType == "Line") {
                chartSet.XLabelStyle = "Wrap";
                chartSet.XTrimNum = 12;
                if (analyer.PageSetting != null && analyer.PageSetting.PageSize > 12) {
                    chartSet.XLabelStep = parseInt(analyer.PageSetting.PageSize / 12);
                }
            }
            if (doChart.ChartType(typeY) == 'map') {
                if (analyer.RowDimList[source.ChartSetting.AxisX].LevelName == "区县") {
                    $.each(analyer.RowDimList, function (i, item) {
                        if (item.LevelName == "地区") {
                            if (item.Val.length > 0) {
                                chartSet["MapType"] = [item.Val];
                            }
                            else if (item.ValList.length > 0) {
                                chartSet["MapType"] = item.ValList;
                            }
                            chartSet["IsMapExtend"] = true;
                            return false;
                        }
                    });
                    $.each(analyer.SliceDimList, function (i, item) {
                        if (item.LevelName == "地区") {
                            if (item.Val.length > 0) {
                                chartSet["MapType"] = [item.Val];
                            }
                            else if (item.ValList.length > 0) {
                                chartSet["MapType"] = item.ValList;
                            }
                            chartSet["IsMapExtend"] = true;
                            return false;
                        }
                    });
                }
            }
            else if (doChart.ChartType(typeY) == "PieRose") {
                chartSet.ChartType = "Pie";
                chartSet.ChartTypeExtend = "Pie_Rose";
            }
            if (datasource != null) {
                chartSet.DataSource = datasource;
            }
            var Y2DataColIndex = "";
            var yDataColIndex = "";
            chartSet.ClickEvent = doChart.getchart(analyer, source.ChartSetting.ChartAxisYList, all, source.ChartSetting.AxisX);
            $.each(source.ChartSetting.ChartAxisYList, function (index, item) {
                chartSet.SubChartType.push({
                    colindex: item.ColumnIndex,
                    type: doChart.ChartType(item.ChartType)
                });
                if (item.AxisYType == 0) {
                    yDataColIndex += item.ColumnIndex + ",";
                }
                else {
                    Y2DataColIndex += item.ColumnIndex + ",";
                }
            });
            if (yDataColIndex.length > 0) {
                yDataColIndex = yDataColIndex.substr(0, yDataColIndex.length - 1);
            }
            if (Y2DataColIndex.length > 0) {
                Y2DataColIndex = Y2DataColIndex.substr(0, Y2DataColIndex.length - 1);
            }
            chartSet.Y2DataColIndex = Y2DataColIndex;
            chartSet.YDataColIndex = yDataColIndex;
            if (chartSet.ChartType == "Combi1") {
                chartSet.Is2D = false;
            }
            var iparam = $("#" + reportid).data("initParam");
            if (jsTools.isTrue(iparam, 'object')) {
                if (jsTools.isTrue(iparam.beforeBind, 'function')) {
                    chartSet = iparam.beforeBind(reportid, chartSet);
                }
            }
            if (chartSet) {
                div.SampleChart(chartSet);
            }
        }
    };
    var jsTools = {
        init: function () {
            jsTools.setWidth();
            //根据维度名称获取对象
            Array.prototype.getDimByName = function (levelname) {
                if (levelname) {
                    for (var i = 0; i < this.length; i++) {
                        if (this[i].LevelName == levelname) {
                            return this[i];
                        }
                    }
                }
                else {
                    for (var i = 0; i < this.length; i++) {
                        if (layour.time.indexOf(this[i].LevelName) > -1) {
                            return this[i];
                        }
                    }
                }
                return null;
            };
            ///获取除时间维度是否存在
            Array.prototype.getOtherDim = function () {
                var param = [];
                for (var i = 0; i < this.length; i++) {
                    if (layour.timetype.indexOf(this[i].LevelName) < 0 && this[i].isUse != "false") {
                        param.push(this[i]);
                    }
                }
                return param;
            };
            ///设置引擎对象
            Array.prototype.setData = function (reportid, typecol, arrCols) {
                var source = $("#" + reportid).data("dataCondition");
                var isSwitch = $("#" + reportid).data("isswitch");
                var result = jsTools.getTimeType();
                var timeNum = 0;
                for (var i = 0; i < this.length; i++) {
                    if (layour.timetype.indexOf(this[i].LevelName) > -1 && typecol == "row") {
                        switch (this[i].LevelName) {
                            case "日":
                                if (result.weight >= 1) {
                                    if (this.getDimByName(result.ch) == null
                                        && arrCols.getDimByName(result.ch) == null) {
                                        this[i].LevelName = result.ch;
                                    }
                                }
                                var temp = source.getConditionByLevelName(this[i].LevelName);
                                jsTools.setDimensionData(this[i], temp);
                                break;
                            case "小时":
                                if (result.weight > 0) {
                                    this.splice(i, 1);
                                    i--;
                                }
                                else if (result.weight == 0) {
                                    if (arrCols.getDimByName(result.ch) == null) {
                                        this.splice(i, 1);
                                        i--;
                                    }
                                    else {
                                        var temp = source.getConditionByLevelName(this[i].LevelName);
                                        jsTools.setDimensionData(this[i], temp);
                                    }
                                }
                                else {
                                    var temp = source.getConditionByLevelName(this[i].LevelName);
                                    jsTools.setDimensionData(this[i], temp);
                                }
                                break;
                            case "分钟":
                                if (result.weight >= 0) {
                                    this.splice(i, 1);
                                    i--;
                                }
                                else if (result.weight == -1) {
                                    if (arrCols.getDimByName(result.ch) == null) {
                                        this.splice(i, 1);
                                        i--;
                                    }
                                    else {
                                        var temp = source.getConditionByLevelName(this[i].LevelName);
                                        jsTools.setDimensionData(this[i], temp);
                                    }
                                }
                                else {
                                    var temp = source.getConditionByLevelName(this[i].LevelName);
                                    jsTools.setDimensionData(this[i], temp);
                                }
                                break;
                            case "五分钟":
                                if (result.weight >= 0) {
                                    this.splice(i, 1);
                                    i--;
                                }
                                else if (result.weight == -1) {
                                    if (arrCols.getDimByName(result.ch) == null) {
                                        this.splice(i, 1);
                                        i--;
                                    }
                                    else {
                                        var temp = source.getConditionByLevelName(this[i].LevelName);
                                        jsTools.setDimensionData(this[i], temp);
                                    }
                                }
                                else {
                                    var temp = source.getConditionByLevelName(this[i].LevelName);
                                    jsTools.setDimensionData(this[i], temp);
                                }
                                break;
                            case "十五分钟":
                                if (result.weight >= 0) {
                                    this.splice(i, 1);
                                    i--;
                                }
                                else if (result.weight == -1) {
                                    if (arrCols.getDimByName(result.ch) == null) {
                                        this.splice(i, 1);
                                        i--;
                                    }
                                    else {
                                        var temp = source.getConditionByLevelName(this[i].LevelName);
                                        jsTools.setDimensionData(this[i], temp);
                                    }
                                }
                                else {
                                    var temp = source.getConditionByLevelName(this[i].LevelName);
                                    jsTools.setDimensionData(this[i], temp);
                                }
                                break;
                            default:
                                var temp = source.getConditionByLevelName(this[i].LevelName);
                                jsTools.setDimensionData(this[i], temp);
                                break;
                        }
                    }
                    else {
                        var temp = source.getConditionByLevelName(this[i].LevelName);
                        jsTools.setDimensionData(this[i], temp);
                    }
                }
            };
            ///根据粒度名称获取条件
            Array.prototype.getConditionByLevelName = function (levelname) {
                if (this != null) {
                    for (var i = 0; i < this.length; i++) {
                        if (this[i].levelname == levelname) {
                            return this[i];
                        }
                    }
                }
                return null;
            };
            ///查询索引
            Array.prototype.indexOf = function (key) {
                var index = -1;
                if (this != null) {
                    for (var i = 0; i < this.length; i++) {
                        if (this[i] == key) {
                            index = i;
                            break;
                        }
                    }
                }
                return index;
            }
            ///设置条件
            Array.prototype.setCondition = function (levelname, value, ShowType, ValType) {
                if (value.indexOf("****") > -1) {
                    return;
                }
                if (this.length == 0) {
                    this.push({
                        levelname: levelname,
                        value: value,
                        type: ShowType,
                        valtype: ValType
                    });
                }
                else {
                    var flag = true;
                    for (var i = 0; i < this.length; i++) {
                        if (this[i].levelname == levelname) {
                            this[i].value = value;
                            if (ValType != null) {
                                this[i].valtype = ValType;
                            }
                            if (ShowType != null) {
                                this[i].type = ShowType;
                            }
                            flag = false;
                            break;
                        }
                    }
                    if (flag) {
                        this.push({
                            levelname: levelname,
                            value: value,
                            type: ShowType,
                            valtype: ValType
                        });
                    }
                }
            }
            //设置条件为空
            Array.prototype.setConditionIsnull = function () {
                var params = jsTools.getparam();
                for (var i = 0; i < this.length; i++) {
                    for (var j = 0; j < params.length; j++) {
                        if (params[j].levelname == this[i].levelname) {
                            this[i].value = "";
                        }
                        else if (layour.timetype.indexOf(this[i].levelname) > -1) {
                            this[i].value = "";
                        }
                    }
                }
            },
            Array.prototype.clone = function () {
                var p = [];
                for (var i = 0; i < this.length; i++) {
                    var newJson = {};
                    $.extend(true, newJson, this[i]);
                    p.push(newJson);
                }
                return p;
            },
            String.prototype.trim = function () {
                return this.replace(/(^\s*)|(\s*$)/g, "");
            }
        },
        anaReq: function (str) {
            if (str.length > 0) {
                return eval('(' + str + ')');
            }
            return [];
        },
        setDimensionData: function (obj, temp) {
            if (temp != null) {
                if (temp.value.indexOf(",") > -1) {
                    obj.ValList = temp.value.split(",");
                    obj.ValType = 1;
                }
                else if (temp.value.indexOf(":") > -1) {
                    obj.ValList = temp.value.split(":");
                    obj.ValType = 3;
                }
                else {
                    if (temp.value == "全部") {
                        temp.value = "";
                    }
                    if (temp.type == 5) {
                        obj.Val = temp.value;
                        obj.ValType = 9;
                    }
                    else {
                        obj.Val = temp.value;
                        obj.ValType = 0;
                    }
                }
            }
        },
        getTimeType: function () {
            var type = $("#txtTime").timepicker("getTimeType");
            var dateStr = $("#txtTime").timepicker("getDateStr");
            var result = {
                en: type,
                ch: '',
                value: dateStr,
                hour: '',
                day: '',
                month: '',
                week: '',
                weight: 0
            };
            if (type == "Month") {
                result.ch = "月";
                result.month = dateStr;
                result.weight = 1;
            }
            else if (type == "Week") {
                result.ch = "周";
                result.week = dateStr;
                result.weight = 2;
            }
            else if (type == "Day") {
                result.ch = "日";
                result.day = dateStr;
            }
            else if (type == "Hour") {
                result.ch = "小时";
                result.day = dateStr;
                result.hour = $("#txtTime").timepicker("getHourStr");
                result.value = result.hour;
                result.weight = -1;
            }
            else if (type == "Minute") {
                result.ch = "分钟";
                result.day = dateStr;
                result.hour = $("#txtTime").timepicker("getHourStr");
                result.minute = $("#txtTime").timepicker("getMinuteStr");
                result.value = result.minute;
                result.weight = -2;
            }
            else if (type == "Minute5") {
                result.ch = "五分钟";
                result.day = dateStr;
                result.hour = $("#txtTime").timepicker("getHourStr");
                result.minute = $("#txtTime").timepicker("getMinuteStr");
                result.value = result.minute;
                result.weight = -2;
            }
            else if (type == "Minute15") {
                result.ch = "十五分钟";
                result.day = dateStr;
                result.hour = $("#txtTime").timepicker("getHourStr");
                result.minute = $("#txtTime").timepicker("getMinuteStr");
                result.value = result.minute;
                result.weight = -2;
            }
            else if (type == "HalfYear") {
                result.ch = "半年";
                result.weight = 3;
            }
            else if (type == "Quarter") {
                result.ch = "季度";
                result.weight = 2;
            }
            else {
                result.ch = "年";
                result.weight = 4;
            }
            return result;
        },
        getCreateParam: function (arrParam, opts, obj) {
            var str = [];
            if (arrParam.length > 0) {
                var result = jsTools.getTimeType();
                $.each(arrParam, function (i, item) {
                    if (layour.time.indexOf(item.ln) > -1) {
                        var index = evUrl.getIndex(opts.analyzer, item.ln);
                        var lvlname = item.ln;
                        if (index < 0) {
                            index = evUrl.getIndex(opts.analyzer, "日");
                            lvlname = "日";
                        }
                        if (index < 0) {
                            index = evUrl.getIndex(opts.analyzer, "月");
                            lvlname = "月";
                        }
                        if (index < 0) {
                            index = evUrl.getIndex(opts.analyzer, "周");
                            lvlname = "周";
                        }
                        if (index < 0) {
                            if (result.en == "Day") {
                                str.push({
                                    k: '日',
                                    v: result.value
                                });
                            }
                            else if (result.en == "Month") {
                                str.push({
                                    k: '月',
                                    v: result.value
                                });
                            }
                            else if (result.en == "Week") {
                                str.push({
                                    k: '周',
                                    v: result.value
                                });
                            }
                        }
                        else {
                            str.push({
                                k: lvlname,
                                v: obj.find("td").eq(index).text()
                            });
                        }
                    }
                    else if (item.ln == "小时") {
                        var index = evUrl.getIndex(opts.analyzer, item.ln);
                        if (index >= 0) {
                            str.push({
                                k: item.ln,
                                v: obj.find("td").eq(index).text()
                            });
                        }
                        else {
                            if (result.en == "Hour") {
                                str.push({
                                    k: '小时',
                                    v: result.hour
                                });
                            }
                        }
                    }
                    else if (layour.telArr.indexOf(item.ln) > -1) {
                        var index = evUrl.getIndex(opts.analyzer, item.ln + "-加密");
                        var tindex = evUrl.getIndex(opts.analyzer, item.ln);
                        str.push({
                            k: item.ln,
                            v: obj.find("td").eq(index).text(),
                            t: obj.find("td").eq(tindex).text()
                        });
                    }
                    else {
                        var index = evUrl.getIndex(opts.analyzer, item.ln);
                        if (index > -1) {
                            str.push({
                                k: item.ln,
                                v: obj.find("td").eq(index).text()
                            });
                        }
                        else {
                            $.each(opts.analyzer.SliceDimList, function (j, dim) {
                                if (dim.LevelName == item.ln) {
                                    if (dim.Val != null && dim.Val != "") {
                                        str.push({
                                            k: item.ln,
                                            v: dim.Val
                                        });
                                    }
                                }
                                else {
                                    if (dim.ValList != null && dim.ValList.length > 0) {
                                        var vv = dim.ValList.join();
                                        str.push({
                                            k: item.ln,
                                            v: vv
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
            return str;
        },
        setloopParam: function (arrparam, reportid) {
            jsTools.setCondition(reportid, arrparam, 0);
            dataShow.getData(reportid);
        },
        getItemById: function (arrParams, id) {
            if (arrParams.length > 0) {
                for (var i = 0; i < arrParams.length; i++) {
                    if (arrParams[i].divId == id) {
                        return arrParams[i];
                    }
                }
            }
            return null;
        },
        getparam: function () {
            var result = jsTools.getTimeType();
            var params = [];
            if (result.en == "Hour") {
                params.push({
                    levelname: '日',
                    value: result.day
                });
                params.push({
                    levelname: '小时',
                    value: result.hour
                });
            }
            else if (result.en == "Minute") {
                params.push({
                    levelname: '日',
                    value: result.day
                });
                params.push({
                    levelname: '小时',
                    value: result.hour
                });
                params.push({
                    levelname: '分钟',
                    value: result.value
                });
            }
            else if (result.en == "Minute5") {
                params.push({
                    levelname: '日',
                    value: result.day
                });
                params.push({
                    levelname: '小时',
                    value: result.hour
                });
                params.push({
                    levelname: '五分钟',
                    value: result.value
                });
            }
            else if (result.en == "Minute15") {
                params.push({
                    levelname: '日',
                    value: result.day
                });
                params.push({
                    levelname: '小时',
                    value: result.hour
                });
                params.push({
                    levelname: '十五分钟',
                    value: result.value
                });
            }
            else {
                params.push({
                    levelname: result.ch,
                    value: result.value
                });
            }
            var sourceCondition = $("#queryControl").controlmanager("getSelResults");
            if (jsTools.isTrue(sourceCondition, "object")) {
                for (var i = 0; i < sourceCondition.length; i++) {
                    params.push({
                        levelname: sourceCondition[i].levelName,
                        value: sourceCondition[i].value.join(",")
                    });
                }
            }
            return params;
        },
        isTrue: function (option, type) {
            if (option != undefined && typeof option == type) {
                return true;
            }
            return false;
        },
        setWidth: function () {
            var width = $("#" + layour.layour).width();
            $("#" + layour.layour).css("width", width - 10);
        },
        setCondition: function (reportid, arrParam, type) {
            var datacondition = $("#" + reportid).data("dataCondition");
            datacondition = (datacondition != undefined
                ? datacondition
                : []);
            var newCon = datacondition.clone();
            if (type == "1") {
                $.each(arrParam, function (i, item) {
                    newCon.setCondition(item.levelname, item.value, 1, null);
                });
            }
            else {
                $.each(arrParam, function (i, item) {
                    newCon.setCondition(item.k, item.v, null, null);
                });
            }

            $("#" + reportid).data("dataCondition", newCon);
        }
    };
    var doChart = {
        ChartType: function (key) {
            switch (key) {
                case 0: return "Column";
                case 1: return "Line";
                case 2: return "Bar";
                case 3: return "Pie";
                case 4: return "Doughnut";
                case 5: return "Pareto";
                case 6: return "Area";
                case 7: return "ScrollColumn";
                case 8: return "ScrollLine";
                case 9: return "ScrollArea";
                case 10: return "ScrollStackedColumn";
                case 11: return "StackedColumn";
                case 12: return "StackedBar";
                case 13: return "StackedArea";
                case 14: return "Radar";
                case 15: return "Scatter";
                case 16: return "Bubble";
                case 17: return "map";
                case 18: return "PieRose";
                default: return "Column";
            }
        },
        getNumByType: function (ChartAxisYList) {
            if (ChartAxisYList.length > 0) {
                var type = ChartAxisYList[0].ChartType;
                $.each(ChartAxisYList, function (index, item) {
                    if (type != item.ChartType && item.ChartType != ChartAxisYList[0].ChartType) {
                        type = item.ChartType;//		AxisYType	1	Number
                    }
                    if (item.AxisYType != 0) {
                        type = -1;
                    }
                });
                if (type == ChartAxisYList[0].ChartType) {
                    return type;
                }
                else {
                    return -1;
                }
            }
            return -2;
        },
        getchart: function (analyzer, ChartAxisYList, all, x) {
            var condition = all.data("dataUrl");
            var result = [];
            if (condition.length > 0) {
                $.each(condition, function (i, item) {
                    var p = evUrl.getIndex(analyzer, item.n);
                    $.each(ChartAxisYList, function (j, l) {
                        if (l.ColumnIndex == p) {
                            result.push({
                                click: function (x, y, v, xi, yi, divid, echartoption) {
                                    var param = doChart.getCreateParam(echartoption, item.p, xi);
                                    if (item.t == "1") {
                                        if (item.ly == "0") {
                                            var url = item.lu;
                                            if (item.lu.indexOf("?") < 0) {
                                                url += "?";
                                            }
                                            else {
                                                url += "&";
                                            }
                                            if (param.length > 0) {
                                                url += "initvalues=" + encodeURI(dss.jsonToString(param));
                                            }
                                            if (item.o == "0") {
                                                dss.openPageInTab(item.ln, url);
                                            }
                                            else {
                                                if (url.toLocaleLowerCase().indexOf("http://") > -1) {
                                                    window.location.href = url;
                                                }
                                                else {
                                                    window.location.href = dss.rootPath + url;
                                                }
                                            }
                                        }
                                        else {
                                            var url = "plugin/Dashboard/View.html?dashboardid=" + item.lu;
                                            if (param.length > 0) {
                                                url = url + "&initvalues=" + encodeURI(dss.jsonToString(param));
                                            }
                                            if (item.o == "0") {
                                                dss.openPageInTab(item.ln, url);
                                            }
                                            else {
                                                window.location.href = dss.rootPath + url;
                                            }
                                        }
                                    }
                                    else {
                                        var vparam = jsTools.anaReq(item.lu);
                                        $.each(vparam, function (lk, kl) {
                                            if (kl.name != "供二次开发") {
                                                jsTools.setloopParam(param, kl.id);
                                            }
                                            var iparam = all.data("initParam");
                                            if (jsTools.isTrue(iparam, "object")) {
                                                if (jsTools.isTrue(iparam.rowClick, "function")) {
                                                    iparam.rowClick(param, p, analyzer);
                                                }
                                            }
                                        });

                                    }
                                }, colindex: l.ColumnIndex
                            });
                        }
                    });
                });
            }
            if (result.length == 0 && typeof x == 'number') {
                if (condition.length > 0) {
                    $.each(condition, function (i, item) {
                        var p = evUrl.getIndex(analyzer, item.n);
                        if (p == x) {
                            result.push({
                                click: function (x, y, v, xi, yi, divid, echartoption) {
                                    var param = doChart.getCreateParam(echartoption, item.p, xi);
                                    if (item.t == "1") {
                                        if (item.ly == "0") {
                                            var url = item.lu;
                                            if (item.lu.indexOf("?") < 0) {
                                                url += "?";
                                            }
                                            else {
                                                url += "&";
                                            }
                                            if (param.length > 0) {
                                                url += "initvalues=" + encodeURI(dss.jsonToString(param));
                                            }
                                            if (item.o == "0") {
                                                dss.openPageInTab(p.ln, url);
                                            }
                                            else {
                                                if (url.toLocaleLowerCase().indexOf("http://") > -1) {
                                                    window.location.href = url;
                                                }
                                                else {
                                                    window.location.href = dss.rootPath + url;
                                                }
                                            }
                                        }
                                        else {
                                            var url = "plugin/Dashboard/View.html?dashboardid=" + item.lu;
                                            if (param.length > 0) {
                                                url = url + "&initvalues=" + encodeURI(dss.jsonToString(param));
                                            }
                                            if (item.o == "0") {
                                                dss.openPageInTab(item.ln, url);
                                            }
                                            else {
                                                window.location.href = dss.rootPath + url;
                                            }
                                        }
                                    }
                                    else {
                                        var vparam = jsTools.anaReq(item.lu);
                                        $.each(vparam, function (lk, kl) {
                                            if (kl.name != "供二次开发") {
                                                jsTools.setloopParam(param, kl.id);
                                            }
                                            var iparam = all.data("initParam");
                                            if (jsTools.isTrue(iparam, "object")) {
                                                if (jsTools.isTrue(iparam.rowClick, "function")) {
                                                    iparam.rowClick(param, p, analyzer);
                                                }
                                            }
                                        });

                                    }
                                }, colindex: x
                            });
                        }
                    })
                }
            }
            return result;
        },
        getCreateParam: function (opts, arrParam, x) {
            var str = [];
            $.each(arrParam, function (i, item) {
                var index = opts.DataSource.colnames.indexOf(item.ln);
                if (index > -1 && opts.DataSource.rows.length > 0) {
                    str.push({
                        k: item.ln,
                        v: opts.DataSource.rows[x]["col" + index]
                    });
                }
                else {
                    for (var j = 0; j < opts.analyzer.SliceDimList.length; j++) {
                        if (opts.analyzer.SliceDimList[j].LevelName == item.ln) {
                            if (opts.analyzer.SliceDimList[j].Val.length > 0) {
                                str.push({
                                    k: item.ln,
                                    v: opts.analyzer.SliceDimList[j].Val
                                });
                            }
                        }
                    }
                }
            });
            return str;
        }
    }
})(jQuery)