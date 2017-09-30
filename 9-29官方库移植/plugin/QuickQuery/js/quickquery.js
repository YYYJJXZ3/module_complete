(function ($) {
    var methods = {
        init: function (settings) {
            $.extend(true, curSettings, $.fn.quickQuery.defaults, settings);
            if (settings.arrDrill.length > 0) {
                curSettings.arrDrill = settings.arrDrill;
            }
            if (settings.arrCondName.length > 0) {
                curSettings.arrCondName = settings.arrCondName;
            }
            if (settings.arrMutex.length > 0) {
                curSettings.arrMutex = settings.arrMutex;
            }
            templateInit(settings);
        },
        query: function () {
            query(); setQueryQueue();
        }
    }

    $.fn.quickQuery = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method' + method + 'does not exist on jQuery.quickQuery');
        }
    }

    $.fn.quickQuery.defaults = {
        templateId: "-562951391",
        arrCondName: ["地区"],
        arrDrill: ["地区", "BRAS", "区县", "OLT", "小区", "ONU", "用户", "ICP产品"],
        arrMutex:[],//互斥的维度
        curLevelName: "地区",
        levelIdx:0,
        attachLevels: []//[{display:"业务", levels:["一级业务","二级业务"]},{display:"HOST", levels:["HOST","IP_SERVER"]}]
    };


    var templateArray = [];
    var curTemplate = {};
    var curAnalyzer = {};
    var arrDimData = [];
    var QueryHistory = [];//记录查询类别、条件
    var preNextIndex = -1;
    var privatedimdata = ["MSISDN", "号码", "手机号码","用户","帐号","账号"];
    var curSettings = {};
    var curTemplateName = "";


    function query() {
        curTemplate = findBestTemplate(curSettings.curLevelName, []);
        var ana = curTemplate.Analyzer;
        var colproperty = [];
        for (var c = 0; c <= curTemplate.GridSetting.LockCol; c++) {
            colproperty.push({ colindex: c, frozen: true });
        }
        colproperty.push({ colindex: 0, name: "趋势", width: 40, sort: false, frozen: false, align: "center" });
        colproperty.push({ colindex: 1, width: 120, frozen: false });
        for (var n = curTemplate.Analyzer.RowDimList.length; n < curTemplate.Analyzer.RowDimList.length + curTemplate.Analyzer.MeasureList.length; n++) {
            colproperty.push({ colindex: n + 1, align: "right" });
        }
        setAnalyzerDim(ana);
        var relateColIdx = ana.RowDimList.length + ana.MeasureList.length;
        for (var r = 0; r < ana.RowDimList.length; r++) {
            if (indexOfStrInArr(ana.RowDimList[r].LevelName, privatedimdata) > -1) {
                relateColIdx++;
                break;
            }
        }
        var lastWidth = 12;
        for (var ll = 0; ll < curSettings.arrDrill.length; ll++) {
            lastWidth += curSettings.arrDrill[ll].length * 13;
        }
        colproperty.push({ colindex: relateColIdx + 1, name: "关联分析", width: lastWidth, sort: false, frozen: true });
        if ($("#ddTopN").css("display") !== "none") {
            ana.TopN = $("#ddlTopN").val();
        }
        curAnalyzer = ana;
        $("#divGrid").smartgrid({
            showrownum: true,
            ajax: {
                path: dss.rootPath + "plugin/QuickQuery/Handler/GridHandler.ashx",
                sqlstr: dss.jsonToString(ana)
            },
            formatFlowValue: "0",
            analyzer: ana,
            captionName: curSettings.curLevelName + "分析",
            paging: {
                rowNum: curTemplate.Analyzer.PageSetting.PageSize,
                rowList: [10, 15, 20, 30, 50]
            },
            col: {
                property: colproperty
            },
            sort: {
                colindex: ana.SortSetting.SortColIndex + 1,
                order: ana.SortSetting.SortDirection === 0 ? "Asc" : "Desc",
                colindex2: ana.SortSetting.SecondSortColIndex + 1,
                order2: ana.SortSetting.SecondSortDirection === 0 ? "Asc" : "Desc"

            },
            analyzercontextmenu: {
                show: false,
                showRelatedAnalysis: false,
                showDrill: false,
                showDimStatistics: false,
                showCalcCol: false
            },
            errorfun: function (msg) {
                alertDialog("error", msg);
            },
            callback: {
                gridComplete: function (grid, opts) {
                    if (grid[0].rows.length > 1) {
                        var curLvl = ana.RowDimList[0].LevelName;
                        for (var le = 0;le < curSettings.attachLevels.length;le++) {
                            if (curLvl == curSettings.attachLevels[le].levels[0]) {
                                curLvl = curSettings.attachLevels[le].display;
                                break;
                            }
                        }
                        var lastcol = grid[0].rows[0].cells.length - 1;
                        for (var r = 1; r < grid[0].rows.length; r++) {
                            $(grid[0].rows[r].cells[lastcol]).html("");
                            for (var d = 0; d < curSettings.arrDrill.length; d++) {
                                    if (isMutex(ana, curSettings.arrDrill[d]))
                                    {
                                        continue;
                                    }
                                    if (curSettings.arrDrill[d] != curLvl) {

                                        var cc = $("<span>" + curSettings.arrDrill[d] + "</span>");
                                        cc.css("color", "blue")
                                            .css("margin", "0px 3px 0px 3px")
                                            .css("cursor", "pointer")
                                            .css("float", "left");
                                        cc.click(function () { otherDimClick(this, opts); });
                                        $(grid[0].rows[r].cells[lastcol]).append(cc);
                                    }
                            }
                            var imgtrend = $("<img src='images/trend.png' style='cursor:pointer;' title='点击查看趋势'></img>");
                            $(grid[0].rows[r].cells[1]).append(imgtrend);
                            imgtrend.click(function () {
                                var nestr = "";
                                var dialogTitle = "";
                                for (var m = 0; m < curAnalyzer.RowDimList.length; m++) {
                                    var ss = curAnalyzer.RowDimList[m].LevelName + ":" + $(this).parent().next(":eq(" + m + ")").text();
                                    nestr = nestr + ss + "$";
                                    dialogTitle = dialogTitle + ss + ",";
                                }
                                dialogTitle = dialogTitle.substr(0, dialogTitle.length - 1) + "趋势分析";
                                $("#dlCond").find(">dd").each(function () {
                                    var dim = $(this).data("dimobj");
                                    var vals = "";
                                    $(dim.ValList).each(function () { vals = vals + this + "￥"; });
                                    vals = vals.substr(vals, vals.length - 1);
                                    nestr = nestr + dim.LevelName + ":" + vals + "$";
                                });
                                var timetype = $("#txtDate").timepicker("getTimeType");
                                var datestr = $("#txtDate").timepicker("getDateStr");
                                var meastr = "";
                                $(curAnalyzer.MeasureList).each(function (k) {
                                    meastr = meastr + this.MeasureID + ",";
                                });
                                meastr = meastr.substr(0, meastr.length - 1);
                                dss.load(true);
                                dss.ajax({
                                    url: dss.rootPath + "plugin/QuickQuery/QuickQuery.ashx?qtype=trend",
                                    data: {
                                        ne: nestr,
                                        timetype: timetype,
                                        date: datestr,
                                        mea: meastr
                                    },
                                    success: function (data) {
                                        dss.load(false);
                                        $("#ddlMeasure").empty();
                                        $("#ddlMeasure").unbind("change");
                                        $("#ddlMeasure").data("anasrc", data);
                                        $(curAnalyzer.MeasureList).each(function (k) {
                                            $("#ddlMeasure").append("<option value='" + (k + 1) + "'>" + this.DisplayName + "</option>");
                                        });
                                        $("#ddlMeasure").change(function () {
                                            var chartdata = $("#ddlMeasure").data("anasrc");
                                            var step1 = 1;
                                            if (chartdata.rows.length > 8) {
                                                step1 = parseInt(chartdata.rows.length / 6) + 1;
                                            }
                                            var chartoptions1 = {
                                                DataSource: $("#ddlMeasure").data("anasrc"),
                                                Height: "260",
                                                YFormatType: "1000",
                                                ChartType: "Line",
                                                SubChartType: [],
                                                YDataColIndex: $("#ddlMeasure").val(),
                                                Y2DataColIndex: "",
                                                Y2FormatType: "1000",
                                                YTitle: "",
                                                IsAutoLimits: true,
                                                Is2D: true, XLabelStyle: "Stagger", XLabelStep: step1
                                            };
                                            $("#divChart").SampleChart(chartoptions1);
                                        });
                                        var step = 1;
                                        if (data.rows.length > 8) {
                                            step = parseInt(data.rows.length / 6) + 1;
                                        }
                                        var chartoptions = {
                                            DataSource: data,
                                            Height: "260",
                                            YFormatType: "1000",
                                            ChartType: "Line",
                                            SubChartType: [],
                                            YDataColIndex: $("#ddlMeasure").val(),
                                            Y2DataColIndex: "",
                                            Y2FormatType: "1000",
                                            YTitle: "",
                                            IsAutoLimits: true,
                                            Is2D: true, XLabelStyle: "Stagger", XLabelStep: step
                                        };
                                        $("#divChart").SampleChart(chartoptions);
                                        $("#divChartDialog").attr("title", dialogTitle);
                                        $("#divChartDialog").dialog({
                                            width: 740,
                                            autoOpen: true,
                                            modal: true
                                        });
                                    }
                                });
                            });

                        }
                    }
                }
            }
        });
    }


    function isMutex(ana,lvlname) {
        for (var i = 0; i < ana.RowDimList.length; i++) {
            if (indexOfStrInArr(ana.RowDimList[i].LevelName + "," + lvlname, curSettings.arrMutex) > -1 ||
                indexOfStrInArr(lvlname + "," + ana.RowDimList[i].LevelName, curSettings.arrMutex) > -1)
            {
                return true;
            }
        }
        for (var i = 0; i < ana.SliceDimList.length; i++) {
            if (indexOfStrInArr(ana.SliceDimList[i].LevelName + "," + lvlname, curSettings.arrMutex) > -1 ||
                indexOfStrInArr(lvlname + "," + ana.SliceDimList[i].LevelName, curSettings.arrMutex) > -1) {
                return true;
            }
        }
        return false;
    }

    function otherDimClick(obj, opts) {
        var realLevelNames = getRealDrillLevelNames(curSettings.curLevelName);
        var curLvlsShow = [];
        for (var i = 0; i < curTemplate.Analyzer.RowDimList.length; i++) {
            var dim = {};
            $.extend(true, dim, curTemplate.Analyzer.RowDimList[i]);
            dim.ValType = 1;
            var datacol = i + 2;
            if (indexOfStrInArr(dim.LevelName, privatedimdata) > -1) {
                for (var j = opts.finalSet.bindData.colnames.length - 1; j > -1; j--) {
                    if (opts.finalSet.bindData.colnames[j] == dim.LevelName + "-加密") {
                        datacol = j + 1; break;
                    }
                }
            }
            dim.ValList = [$(obj).parent().parent().find("td:eq(" + datacol + ")").text()];
            curLvlsShow.push(dim);
        }
        if ($(obj).text() == "ENODEB" && curLvlsShow[0].LevelName == "小区") {
            curLvlsShow = [];
        }
        curSettings.curLevelName = $(obj).text();
        var tmp = findBestTemplate(curSettings.curLevelName, curLvlsShow);
        $("#divDimFilter>div").remove();
        $("#divGrid").empty();
        var dimlist = tmp.Analyzer.RowDimList.concat(tmp.Analyzer.SliceDimList);
        $(dimlist).each(function () {
            if (indexOfStrInArr(this.LevelName, curSettings.arrCondName) > -1) {
                loadDimMemberDom(this.DimensionID, this.LevelName);
            }
        });
        $("#dlCond").find(">dd").remove();

        for (var i = 0; i < dimlist.length; i++) {
            if (dimlist[i].LevelName != "日" && dimlist[i].LevelName != "月" && dimlist[i].LevelName != "周" && dimlist[i].ValList != null && dimlist[i].ValList.length > 0) {
                addSelectCond(dimlist[i]);
                $("#divDimFilter").find(">div").each(function () {
                    var $itemdiv = $(this).find(">div.filteritemdiv");
                    if ($itemdiv.data("dimid") == dimlist[i].DimensionID && $itemdiv.data("levelname") == dimlist[i].LevelName) {
                        $(this).hide();
                        return;
                    }
                });
            }
        }
        query();
        setQueryQueue();
    }


    function getRealDrillLevelNames(drillname) {
        var drillRealNames = [];
        for (var le = 0; le < curSettings.attachLevels.length; le++) {
            if (drillname == curSettings.attachLevels[le].display) {
                for (var i = 0; i < curSettings.attachLevels[le].levels.length; i++) {
                    drillRealNames.push(curSettings.attachLevels[le].levels[i]);
                }
                break;
            }
        }
        if (drillRealNames.length === 0) {
            drillRealNames.push(drillname);
        }
        return drillRealNames;
    }


    function reInitCond(curLvlsShow) {
        var tmp = findBestTemplate(curSettings.curLevelName, curLvlsShow);
        $("#divDimFilter>div").remove();
        $("#divGrid").empty();
        var tmpOri = {};
        for (var j = 0; j < templateArray.length; j++) {
            if (templateArray[j].TemplateID == tmp.TemplateID) {
                $.extend(true, tmpOri, templateArray[j]); break;
            }
        }
        var dimlist = tmpOri.Analyzer.RowDimList.concat(tmpOri.Analyzer.SliceDimList);
        $(dimlist).each(function () {
            if (indexOfStrInArr(this.LevelName, curSettings.arrCondName) > -1) {
                loadDimMemberDom(this.DimensionID, this.LevelName);
            }
        });
    }

    function btnPreClick() {
        preNextIndex--;
        if (preNextIndex < 1) {
            $("#btnPre").prop("disabled", true);
        }
        var qhistory = QueryHistory[preNextIndex];
        $("#ddlTopN").val(qhistory.curTopN);
        $("#dlCond").find("dd").remove();
        for (var i = 0; i < qhistory.curCond.length; i++) {
            addSelectCond(qhistory.curCond[i]);
        }
        curSettings.curLevelName = qhistory.curLevelName;
        reInitCond([]);
        $("#divDimFilter").find(">div").each(function () {
            var dimlabel = $(">div.filtertitle", $(this)).text();
            var hasselected = false;
            $("#dlCond").find("dd").each(function () {
                if (dimlabel == $(this).data("dimobj").LevelName + "：") {
                    hasselected = true; return;
                }
            });
            if (hasselected == false) {
                $(this).find("dd").removeClass("selecteditem");
                $(this).show();
            }
            else {
                $(this).hide();
            }
        });
        $("#txtDate").timepicker({ defaultTimeType: qhistory.curTimeType, defaultDateStr: qhistory.curDate });
        query();
    }

    function setQueryQueue() {
        if (QueryHistory.length > preNextIndex + 1) {
            QueryHistory.splice(preNextIndex + 1, QueryHistory.length - preNextIndex - 1);
        }
        var arrfilterlvl = [];
        $("#dlCond").find(">dd").each(function () {
            var dim = $(this).data("dimobj");
            arrfilterlvl.push(dim);
        });
        QueryHistory.push({
            curLevelName: curSettings.curLevelName,
            curCond: arrfilterlvl,
            curDate: $("#txtDate").timepicker("getDateStr"),
            curTimeType: $("#txtDate").timepicker("getTimeType"),
            curTopN: $("#ddlTopN").val()
        });
        if (QueryHistory.length > 1) {
            $("#btnPre").prop("disabled", false);
        }
        if (QueryHistory.length > 10) {
            QueryHistory.splice(0, QueryHistory.length - 10);
        }

        preNextIndex = QueryHistory.length - 1;
    }


    function findBestTemplate(drillname, curLvlsShow) {
        var drillRealNames = getRealDrillLevelNames(drillname);
        var arrfilterlvl = [];
        var arrlvlnam = [];
        //已选条件
        $("#dlCond").find(">dd").each(function () {
            var dim = $(this).data("dimobj");
            arrfilterlvl.push(dim);
            arrlvlnam.push(dim.LevelName);
        });
        for (var i = 0; i < curLvlsShow.length; i++) {
            var isexist = false;
            for (var j = arrfilterlvl.length - 1; j > -1; j--) {
                if (arrfilterlvl[j].LevelName == curLvlsShow[i].LevelName) {
                    arrfilterlvl.splice(j, 1, curLvlsShow[i]);
                    isexist = true;
                    break;
                }
            }
            if (!isexist) {
                arrfilterlvl.push(curLvlsShow[i]);
                arrlvlnam.push(curLvlsShow[i].LevelName);
            }
        }
        var tmp = {};
        for (var n = 0; n < drillRealNames.length; n++) {
            //判断已有维度中有没有下钻维度，没有则加上
            if (indexOfStrInArr(drillRealNames[n], arrlvlnam) == -1) {
                arrlvlnam.push(drillRealNames[n]);
            }
        }
        var properTmpIdx = -1;
        var dimCnt = 30;
        for (var i = 0; i < templateArray.length; i++) {
            var properDimCnt = 0;
            for (var j = 0; j < templateArray[i].Analyzer.RowDimList.length; j++) {
                if (indexOfStrInArr(templateArray[i].Analyzer.RowDimList[j].LevelName, arrlvlnam) > -1) {
                    properDimCnt++;
                }
            }
            if (properDimCnt == arrlvlnam.length) {
                var dc = templateArray[i].Analyzer.RowDimList.length;
                if (dc < dimCnt) {
                    dimCnt = dc;
                    properTmpIdx = i;
                }
            }
        }
        if (properTmpIdx > -1) {
            $.extend(true, tmp, templateArray[properTmpIdx]);
            var rowDimList = [];
            var sliceDimList = [];
            var rowdimcount = tmp.Analyzer.RowDimList.length;
            for (var r = 0; r < tmp.Analyzer.RowDimList.length; r++) {
                var levName = tmp.Analyzer.RowDimList[r].LevelName;
                var idx = indexOfStrInArr(levName, arrlvlnam);
                if (indexOfStrInArr(levName, drillRealNames) > -1) {
                    rowDimList.push(tmp.Analyzer.RowDimList[r]);
                }
                else if (idx > -1) {
                    tmp.Analyzer.RowDimList[r].ValType = arrfilterlvl[idx].ValType;
                    tmp.Analyzer.RowDimList[r].ValList = arrfilterlvl[idx].ValList;
                    sliceDimList.push(tmp.Analyzer.RowDimList[r]);
                }
                else if (levName == "地区" || levName == "分公司") {
                    sliceDimList.push(tmp.Analyzer.RowDimList[r]);
                }
                else if (indexOfStrInArr(levName, curSettings.arrCondName) > -1) {
                    sliceDimList.push(tmp.Analyzer.RowDimList[r]);
                }

                if (levName == "日" || levName == "月" || levName == "周" || levName == "小时") {
                    tmp.Analyzer.RowDimList[r].ValType = 0;
                    tmp.Analyzer.RowDimList[r].Val = "";//$("#txtDate").val();
                    sliceDimList.push(tmp.Analyzer.RowDimList[r]);
                }
            }
            tmp.Analyzer.RowDimList = rowDimList;
            tmp.Analyzer.SliceDimList = sliceDimList;
            if (tmp.Analyzer.SortSetting.SortColIndex >= rowdimcount) {
                tmp.Analyzer.SortSetting.SortColIndex -= rowdimcount - tmp.Analyzer.RowDimList.length;
                if (tmp.Analyzer.SortSetting.SecondSortColIndex >= rowdimcount) {
                    tmp.Analyzer.SortSetting.SecondSortColIndex -= rowdimcount - tmp.Analyzer.RowDimList.length;
                }
            }
            return tmp;
        }
        else {
            return null;
        }
    }

    function setAnalyzerDim(ana) {
        $("#dlCond").find(">dd").each(function () {
            var dim = $(this).data("dimobj");
            for (var i = 0; i < ana.RowDimList.length; i++) {
                if (ana.RowDimList[i].DimensionID == dim.DimensionID && ana.RowDimList[i].LevelName == dim.LevelName) {
                    ana.RowDimList[i].ValType = dim.ValType;
                    ana.RowDimList[i].ValList = dim.ValList;
                }
            }
        });
        var timetype = $("#txtDate").timepicker("getTimeType");
        var hour = $("#txtDate").timepicker("getHourStr");
        var datestr = $("#txtDate").timepicker("getDateStr");
        if (timetype == "Hour") {
            resetDateDim(["周", "月"], ana);
            setAnaDimDateVal(ana, "日", datestr);
            setAnaDimDateVal(ana, "小时", hour);
        }
        else if (timetype == "Day") {
            resetDateDim(["周", "月", "小时"], ana);
            setAnaDimDateVal(ana, "日", datestr);
        }
        else if (timetype == "Month") {
            resetDateDim(["周", "日", "小时"], ana);
            setAnaDimDateVal(ana, "月", datestr);
        }
        else if (timetype == "Week") {
            resetDateDim(["日", "月", "小时"], ana);
            setAnaDimDateVal(ana, "周", datestr);
        }
    }

    function setAnaDimDateVal(ana, levelname, val) {
        for (var i = 0; i < ana.SliceDimList.length; i++) {
            if (ana.SliceDimList[i].LevelName == levelname) {
                ana.SliceDimList[i].ValType = 0;
                ana.SliceDimList[i].Val = val;
            }
        }
    }

    function resetDateDim(dr, ana) {
        for (var i = ana.SliceDimList.length - 1; i > -1; i--) {
            if (indexOfStrInArr(ana.SliceDimList[i].LevelName, dr) > -1) {
                ana.SliceDimList.splice(i, 1);
            }
        }
    }

    function indexOfStrInArr(str, arr) {
        var index = -1;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == str) {
                index = i;
            }
        }
        return index;
    }

    function templateInit() {
        var lvlidx = curSettings.levelIdx;
        if (lvlidx != null && lvlidx != "") {
            var idx = parseInt(lvlidx);
            if (idx < curSettings.arrDrill.length) {
                curSettings.curLevelName = curSettings.arrDrill[idx];
            }
        }
        var url = "QuickQuery.ashx?qtype=tmps&tid=" + curSettings.templateId;
        $.ajax({
            url: url,
            success: function (data) {
                templateArray = $.parseJSON(data);
                var ana = templateArray[0].Analyzer;
                var dateoption = getDateOption(ana);
                if (ana.TopN > 0) {
                    $("#ddlTopN").val(ana.TopN);
                    $("#ddTopN").show();
                    $("#dtTopN").show();
                }
                $("#txtDate").timepicker(dateoption);
                $(ana.RowDimList).each(function () {
                    if (indexOfStrInArr(this.LevelName, curSettings.arrCondName) > -1) {
                        loadDimMember(this.DimensionID, this.LevelName);
                    }
                });
                query(); setQueryQueue();
            }
        });
    }

    function getDateOption(ana) {
        var dateoption = {
            showTypeMonth: false,
            showTypeWeek: false,
            showTypeHour: false,
            showTypeDay: false
        };
        for (var i = 0; i < ana.RowDimList.length; i++) {
            switch (ana.RowDimList[i].LevelName) {
                case "日": dateoption.showTypeDay = true; break;
                case "月": dateoption.showTypeMonth = true; break;
                case "周": dateoption.showTypeWeek = true; break;
                case "小时": dateoption.showTypeHour = true; break;
                default: break;
            }
        }
        dateoption.isMultipleHour = true;
        return dateoption;
    }

    function getDimDataFromCache(dimid, levelname) {
        var data = null;
        for (var i = 0; i < arrDimData.length; i++) {
            if (arrDimData[i].dimid == dimid && arrDimData[i].levelname == levelname) {
                data = arrDimData[i].data;
            }
        }
        return data;
    }

    function loadDimMember(dimid, levelname) {
        dss.ajax({
            url: "QuickQuery.ashx?qtype=dim",
            data: {
                dimid: dimid,
                levelname: levelname
            },
            type: "post",
            success: function (data) {
                arrDimData.push({ dimid: dimid, levelname: levelname, data: data });
                loadDimMemberDom(dimid, levelname);
            }
        });
    }

    function loadDimMemberDom(dimid, levelname) {
        var $div = $("<div style='clear:left; border-top:1px solid #eeeeee;padding-top:3px;padding-bottom:3px'></div>");
        var $dl = $("<dl class='filter'></dl>");
        $div.append("<div class='filtertitle'>" + levelname + "：<div>");
        var data = getDimDataFromCache(dimid, levelname);
        var $dldiv = $("<div class='filteritemdiv' style='float:left;max-height:88px;overflow:auto;'></div>");
        $dldiv.css("width", document.body.clientWidth - 190);
        $dldiv.data("dimid", dimid);
        $dldiv.data("levelname", levelname);
        var btnMulti = $("<input type='button' class='button' style='margin:3px;' value='+ 多选'/>");
        $dldiv.append($dl);
        $div.append($dldiv).append(btnMulti);
        $("#divDimFilter").append($div);
        $(data.rows).each(function () {
            $dl.append("<dd class='filteritem'>" + this.col0 + "</dd>");
        });
        btnMulti.click(function () {
            multiBtnClick(this);
        });
        $dl.find("dd").click(function () {
            var $thisdd = $(this);
            var dim = { DimensionID: dimid, LevelName: levelname, ValType: 1, ValList: [$(this).text()] };
            filterItemClick($thisdd, $dl, dim);
        });
    }


    function multiBtnClick(obj) {
        var $btn = $(obj);
        var $dldiv = $btn.prev("div");
        var $div = $btn.parent();
        var $multiDiv = $("<div style='padding:3px;float:left; max-height:100px;overflow:auto'></div>");
        $multiDiv.css("width", document.body.clientWidth - 150);
        $div.find("dd").each(function () {
            $multiDiv.append("<div style='float:left;'><input type='checkbox' class='checkbox' value='" + $(this).text() + "'/><span class='checkboxtext'>" + $(this).text() + "  </span><div>");
        });
        var $btnOK = $("<input type='button' class='button' value='确定'/>")
        $btnOK.prop("disabled", true);
        $btnOK.click(function () {
            var vallist = [];
            $multiDiv.find(":checkbox:checked").each(function () { vallist.push($(this).val()); });
            var dim = { DimensionID: $dldiv.data("dimid"), LevelName: $dldiv.data("levelname"), ValType: 1, ValList: vallist };
            addSelectCond(dim); $multiDiv.remove();
            $btn.show();
            $dldiv.show();
            $div.hide();
        });
        var $btnCansel = $("<input type='button' class='button' value='取消'/>")
        $btnCansel.click(function () {
            $multiDiv.remove();
            $btn.show();
            $dldiv.show();
        });
        $("<div style='text-align:center;clear:both;padding-top:3px;'></div>").append($btnOK).append("&nbsp;").append($btnCansel).appendTo($multiDiv);
        $multiDiv.find(":checkbox").click(function () {
            if ($div.find(":checkbox:checked").length > 0) {
                $btnOK.prop("disabled", false);
            }
            else {
                $btnOK.prop("disabled", true);
            }
        });
        $div.append($multiDiv);
        $btn.hide(); $dldiv.hide();
    }


    function filterItemClick($thisdd, $thisdl, dim) {
        addSelectCond(dim);
        $thisdd.parent().children().removeClass("selecteditem");
        $thisdd.addClass("selecteditem");
        $thisdl.parent().parent().hide();
        $thisdl.parent().parent().siblings("div").each(function () {
            var $dldiv = $(this).find("div.filteritemdiv");
            if ($dldiv.data("dimid") == dim.DimensionID) {
                var index = indexOfStrInArr(dim.LevelName, getDimDataFromCache(dim.DimensionID, $dldiv.data("levelname")).colnames);
                var lvlnam = $dldiv.data("levelname");
                if (index > -1) {
                    var $thatdl = $dldiv.find("dl");
                    $thatdl.find("dd").remove();
                    $(getDimDataFromCache($dldiv.data("dimid"), $dldiv.data("levelname")).rows).each(function () {
                        if (this["col" + index] == $thisdd.text()) {
                            $thatdl.append("<dd class='filteritem'>" + this.col0 + "</dd>");
                        }
                    });
                    $thatdl.find("dd").click(function () {
                        var dimension = { DimensionID: dim.DimensionID, LevelName: lvlnam, ValType: 1, ValList: [$(this).text()] };
                        filterItemClick($(this), $thatdl, dimension);
                    });
                }
            }
        });
    }


    function addSelectCond(dim) {
        var drilldispname = dim.LevelName;
        for (var d = 0; d < curSettings.attachLevels.length; d++) {
            for (var a = 0; a < curSettings.attachLevels[d].levels.length; a++) {
                if (curSettings.attachLevels[d].levels[a] == drilldispname) {
                    drilldispname = curSettings.attachLevels[d].display;
                    break;
                }
            }
        }
        if (indexOfStrInArr(curSettings.curLevelName, curSettings.arrDrill) < indexOfStrInArr(drilldispname, curSettings.arrDrill)) {
            return;
        }
        var text = dim.ValList.join(',');
        var title = dim.LevelName + "：" + text;
        if (text.length > 10) {
            text = text.substr(0, 10) + "...";
        }
        var $dd = $("<dd class='conditem' title='" + title + "'>" + text + "</dd>");
        $dd.data("dimobj", dim);
        $dd.click(function () {
            $(this).remove();
            $("#divDimFilter").find(">div").each(function () {
                if ($(">div.filtertitle", $(this)).text() == dim.LevelName + "：") {
                    $(this).find("dd").removeClass("selecteditem");
                    $(this).show();
                }
            });
        });
        //$("#dlCond").find("dd").remove();
        $("#dlCond").append($dd);
    }
    $(function () {
        $("#btnPre").click(function () { btnPreClick();});
    });

})(jQuery);





