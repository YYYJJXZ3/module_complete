function excuteTemplate() {
    var tmp = $.extend(true, {}, getCurTemplate());
    if (hasTimeDim(tmp.Analyzer.RowDimList) == false && hasTimeDim(tmp.Analyzer.SliceDimList) == false && hasTimeDim(tmp.Analyzer.ColDimList) == false) {
        var defaultDate = new Date();
        var dimDate = getDimDateFromAnalyzer(tmp.Analyzer, "日");
        if (dimDate != null) {
            defaultDate.setDate(defaultDate.getDate() - 1);
            var defaultDateStr = getDateString(defaultDate);
            dimDate.Val = defaultDateStr;
            dimDate.ValList = [defaultDateStr];
        }
        else {
            dimDate = getDimDateFromAnalyzer(tmp.Analyzer, "月");
            if (dimDate != null) {
                defaultDate.setDate(defaultDate.getDate() - 30);
                var defaultDateStr = getDateString(defaultDate).substr(0, 8);
                dimDate.Val = defaultDateStr;
                dimDate.ValList = [defaultDateStr];
            }
            else {
                dimDate = getDimDateFromAnalyzer(tmp.Analyzer, "周");
                if (dimDate != null) {
                    defaultDate.setDate(defaultDate.getDate() - 7);
                    var week = weekOfYear(defaultDate);
                    if (week < 10) {
                        week = "0" + week;
                    }
                    var defaultDateStr = defaultDate.getFullYear() + "年" + week + "周";
                    dimDate.Val = defaultDateStr;
                    dimDate.ValList = [defaultDateStr];
                }
                else {
                    alertDialog("提示信息", "没有选定日期。");
                    return;
                }
            }
        }
    }
    if (tmp.Analyzer.ColDimList.length > 0) {
        var b = false;
        $(tmp.Analyzer.ColDimList).each(function () {
            if ((this.Val == null || this.Val == "") && (this.ValList.length == 0 || this.ValList[0] == "")) {
                b = true;
            }
        });
        if (b) {
            alertDialog("提示信息", "列维度中没有选择成员。");
            return;
        }
    }
    $("#divShowDataPanel").show();
    if (tmp.ShowGrid) {
        $("#divgrid").show();
    }
    else {
        $("#divgrid").hide();
    }
    var colproperty = [];
    if (tmp.Analyzer.ColDimList.length == 0) {
        for (var c = 0; c <= tmp.GridSetting.LockCol; c++) {
            colproperty.push({ colindex: c, frozen: true });
        }
    }
    var curPageWidth = pageWidth();
    $("#divSmartGrid").css("width", tmp.ShowChart ? (curPageWidth - 18) : curPageWidth);
    //setTimeout("forecastQueryTime();", 1000);
    isgridcompleted = false;
    tmpExecute = tmp;
    $("#divSmartGrid").smartgrid({
        showrownum: true,
        //height: tmp.ShowChart?null:(pageHeight() - 88-22*tmp.Analyzer.ColDimList.length),
        analyzer: tmp.Analyzer,
        paging: {
            rowNum: tmp.Analyzer.PageSetting.PageSize,
            rowList: [10, 15, 20, 30, 50]
        },
        col: { property: colproperty },
        analyzercontextmenu: {
            show: false,
            showRelatedAnalysis: false,
            showDrill: false,
            showDimStatistics: false,
            showCalcCol: false
        },
        toolbar:{defaultShow:false},
        errorfun: function (msg) {
            alertDialog("error", msg);
        },
        callback: {
            gridComplete: function (grid, opts) {
                isgridcompleted = true;
                grid.setGridHeight(pageHeight() - 62 - $("#divgrid").find("div.ui-jqgrid-hdiv:eq(0)").height());
                $("td[id=tdExport]").show();
                $("#divControlPanel").fadeOut(300, function () { $("#divShowDataPanel").fadeIn(300); });
                if (tmp.ShowChart) {
                    $("#chartAreaCustom").show();
                }
                else {
                    $("#chartAreaCustom").hide();
                }
                initChartDia(tmp, grid, opts);
                if ($("#chartAreaCustom").css("display") != "none") {
                    BindChart();
                }
            },
            onSortCol: function (index, iCol, sortorder) {
                //setTimeout("forecastQueryTime();", 1000);
                isgridcompleted = false;
                tmpExecute = tmp;
            },
            onRightClickRow: function (rowid, colid, rowdata, e) {
                setGridContextMenu(tmp, rowid, colid-1, rowdata, e);
            }
        }
    });
    setCurDimInfo();
}

var isgridcompleted = false;
var tmpExecute = null;

function forecastQueryTime()
{
    if (isgridcompleted == false) {
        $.ajax({
            cache: false,
            type: "POST",
            url: "../pages/Handler.ashx?datatype=forecast",
            data: {
                az: jsonToString(tmpExecute.Analyzer)
            },
            datatype: "text",
            success: function (data) {
                if (isgridcompleted == false) {
                    if (parseInt(data) > 0)
                    {
                        if ($("#div_LoadingStatus").length > 0) {
                            if ($("#div_LoadingStatus").find("div[class='img']").length > 0) {
                                var div = $("#div_LoadingStatus").find("div[class='img']").eq(0);
                                if (div.find("a").length > 0) {
                                    div.find("a").eq(0).before("预计查询时间约" + data + "秒。");
                                    isgridcompleted = true;
                                }
                            }
                        }
                    }
                }
            }
        });
    }
}

function getDimDateFromAnalyzer(ana, levelName) {
    var dimDate = null;
    for (var i = 0; i < ana.RowDimList.length; i++) {
        if (ana.RowDimList[i].LevelName==levelName&&(ana.RowDimList[i].DimensionName == "日期维" || ana.RowDimList[i].DimensionName == "月份维")) {
            dimDate = ana.RowDimList[i];break;
        }
    }
    if (dimDate == null) {
        for (var i = 0; i < ana.SliceDimList.length; i++) {
            if (ana.SliceDimList[i].LevelName == levelName && (ana.SliceDimList[i].DimensionName == "日期维" || ana.SliceDimList[i].DimensionName == "月份维")) {
                dimDate = ana.SliceDimList[i]; break;
            }
        }
    }
    return dimDate;
}


function getContextItem(text) {
    var liDrill = $("<li></li>");
    liDrill.append($("<a href='#'>" + text + "</a>"));
    return liDrill;
}

function addChildItem(liParent, liChild) {
    var ul = liParent.find(">ul");
    if (ul.length == 0) {
        ul = $("<ul></ul>");
        liParent.append(ul);
    }
    ul.append(liChild);
}

function addDrillUpItems(lvlname, itemhiers, liDrillUp, analyzer, colIndex, rowData) {
    var lihierarr = [];
    for (var j = 0; j < itemhiers.length; j++) {
        var lvlIndex = -1;
        for (var i = 0; i < itemhiers[j].Items.length; i++) {
            if (itemhiers[j].Items[i].Name == lvlname) {
                lvlIndex = i;
                break;
            }
        }
        if (lvlIndex > -1) {
            var hiername = itemhiers[j].Name;
            var lihier = getContextItem(hiername);
            for (var n = 0; n < lvlIndex; n++) {
                var lilvl = getContextItem(itemhiers[j].Items[n].Name);
                lilvl.data("hiername", hiername);
                lilvl.click(function () {
                    analyzerDrill(analyzer, colIndex, rowData, lilvl.data("hiername"), $(this).text(), false);
                });
                addChildItem(lihier, lilvl);
            }
            lihierarr.push(lihier);
        }
    }
    if (lihierarr.length > 1) {
        for (var i = 0; i < lihierarr.length; i++) {
            addChildItem(liDrillUp, lihierarr[i]);
        }
    }
    else if (lihierarr.length == 1 && lihierarr[0].find(">ul>li").length > 0) {
        addChildItem(liDrillUp, lihierarr[0].find(">ul>li"));
    }
    else {
        liDrillUp.addClass("ui-state-disabled");
    }
}

function addDrillDownItems(lvlname, itemhiers, liDrillDown, analyzer, colIndex, rowData) {
    var lihierarr = [];
    for (var j = 0; j < itemhiers.length; j++) {
        var lvlIndex = -1;
        for (var i = 0; i < itemhiers[j].Items.length; i++) {
            if (itemhiers[j].Items[i].Name == lvlname) {
                lvlIndex = i;
                break;
            }
        }
        if (lvlIndex > -1) {
            var hiername = itemhiers[j].Name;
            var lihier = getContextItem(hiername);
            for (var n = lvlIndex + 1; n < itemhiers[j].Items.length; n++) {
                var lvlname = itemhiers[j].Items[n].Name;
                var lilvl = getContextItem(lvlname);
                lilvl.data("hiername", hiername);
                lilvl.click(function () {
                    analyzerDrill(analyzer, colIndex, rowData, lilvl.data("hiername"), $(this).text(),true);
                });
                addChildItem(lihier, lilvl);
            }
            if (lihier.find(">ul>li").length > 0) {
                lihierarr.push(lihier);
            }
        }
    }
    if (lihierarr.length > 1) {
        for (var i = 0; i < lihierarr.length; i++) {
            addChildItem(liDrillDown, lihierarr[i]);
        }
    }
    else if (lihierarr.length == 1 && lihierarr[0].find(">ul>li").length > 0) {
        addChildItem(liDrillDown, lihierarr[0].find(">ul>li"));
    }
    else {
        liDrillDown.addClass("ui-state-disabled");
    }
}

function getLevelIndexInHier(levels, lvlName) {
    var index = -1;
    for (var i = 0; i < levels.length; i++) {
        if (levels[i].Name == lvlName) {
            index = i;
            break;
        }
    }
    return index;
}

function analyzerDrill(analyzer, colIndex, rowData, hierName, drilledLvlName, isDrillDown) {
    var sortMeaIndex = -1;
    var dimIndexList = analyzer.StatisticsSetting.DimensionIndexList;
    if (analyzer.SortSetting.SortColIndex > -1) {
        if (analyzer.StatisticsSetting.StatisticsList.length > 0) {
            sortMeaIndex = analyzer.SortSetting.SortColIndex - dimIndexList.length;
        }
        else {
            sortMeaIndex = analyzer.SortSetting.SortColIndex - analyzer.RowDimList.length;
        }
    }
    var preRowDimCount = analyzer.RowDimList.length;
    var dimInfo = curDimInfo;
    var dim = null;
    for (var j = 0; j < dimInfo.length; j++) {
        if (analyzer.RowDimList[colIndex].DimensionName == dimInfo[j].Name) {
            dim = dimInfo[j];
            break;
        }
    }
    var levels = [];
    if (hierName == null) {
        levels = dim.Items[0].Items;
    }
    else {
        for (var i = 0; i < dim.Items.length; i++) {
            if (dim.Items[i].Name == hierName) {
                levels = dim.Items[i].Items;
                break;
            }
        }
    }
    if (isDrillDown) {
        if (analyzer.StatisticsSetting.StatisticsList.length == 0) {
            for (var r = 0; r < analyzer.RowDimList.length; r++) {
                analyzer.RowDimList[r].ValType = 0;
                if (indexOfStrInArr(analyzer.RowDimList[r].LevelName, privatedimdata) > -1) {
                    analyzer.RowDimList[r].Val = rowData[rowData.length - 1];
                }
                else {
                    analyzer.RowDimList[r].Val = rowData[r];
                }
                analyzer.RowDimList[r].ValList = [];
            }
        }
        else {
            for (var k = 0; k < dimIndexList.length; k++) {
                var r = dimIndexList[k];
                analyzer.RowDimList[r].ValType = 0;
                if (indexOfStrInArr(analyzer.RowDimList[r].LevelName, privatedimdata) > -1) {
                    analyzer.RowDimList[r].Val = rowData[rowData.length - 1];
                }
                else {
                    analyzer.RowDimList[r].Val = rowData[k];
                }
                analyzer.RowDimList[r].ValList = [];
            }
        }
    }
    var drillIndexInRow = findLvlIndexInDimList(analyzer.RowDimList[colIndex].DimensionName, drilledLvlName, analyzer.RowDimList);
    if (drillIndexInRow > -1) {
        analyzer.RowDimList[drillIndexInRow].Val = "";
        analyzer.RowDimList[drillIndexInRow].ValList = [];
        if (!isDrillDown && (drilledLvlName == "月" || drilledLvlName == "周")) {
            var drillyear = rowData[drillIndexInRow].substr(0, 4);
            analyzer.RowDimList[drillIndexInRow].ValType = 3;
            if (drilledLvlName == "月") {
                analyzer.RowDimList[drillIndexInRow].ValList = [drillyear + "年01月", drillyear + "年12月"];
            }
            else {
                analyzer.RowDimList[drillIndexInRow].ValList = [drillyear + "年01周", drillyear + "年53周"];
            }
        }
    }
    else {
        var dimDrilled = {
            DimensionID: dim.Value,
            DimensionName: dim.Name,
            LevelName: drilledLvlName,
            Val: "",
            ValList: [],
            ValType: 0
        };
        if (!isDrillDown && (drilledLvlName == "月" || drilledLvlName == "周")) {
            var drillyear = rowData[colIndex].substr(0, 4);
            dimDrilled.ValType = 3;
            if (drilledLvlName == "月") {
                dimDrilled.ValList = [drillyear + "年01月", drillyear + "年12月"];
            }
            else {
                dimDrilled.ValList = [drillyear + "年01周", drillyear + "年53周"];
            }
        }
        analyzer.RowDimList.splice(colIndex + 1, 0, dimDrilled);
        if (analyzer.StatisticsSetting.StatisticsList.length > 0) {
            for (var k = dimIndexList.length - 1; k > -1; k--) {
                if (dimIndexList[k] == colIndex) {
                    dimIndexList.splice(k+1, 0, colIndex + 1);
                    break;
                }
            }
        }
    }
    var drillLvlIndex = getLevelIndexInHier(levels, drilledLvlName);
    for (var i = drillLvlIndex + 1; i < levels.length; i++) {
        for (var r = analyzer.RowDimList.length-1; r > -1; r--) {
            if (analyzer.RowDimList[r].DimensionName == dim.Name && analyzer.RowDimList[r].LevelName == levels[i].Name) {
                if (analyzer.StatisticsSetting.StatisticsList.length > 0) {
                    for (var k = dimIndexList.length - 1; k > -1; k--) {
                        if (dimIndexList[k] == r) {
                            dimIndexList.splice(k, 1);
                            break;
                        }
                    }
                }
                analyzer.RowDimList.splice(r, 1);
            }
        }
    }
    if (analyzer.SortSetting.SortColIndex > -1 && sortMeaIndex > -1) {
        if (analyzer.StatisticsSetting.StatisticsList.length == 0) {
            analyzer.SortSetting.SortColIndex = dimIndexList.length + sortMeaIndex;
        }
        else {
            analyzer.SortSetting.SortColIndex = analyzer.RowDimList.length + sortMeaIndex;
        }
    }
    InitLiRowDims(analyzer.RowDimList);
    analyzer.MeasureFilter = "";
    $("#meaSlice").empty();
    $("#relaSliceTxtArea").empty();
    var tmp = getCurTemplate();
    tmp.Analyzer = analyzer;
    resetAnaChartXYIndex(tmp, preRowDimCount);
    saveTemporary(tmp);
    excuteTemplate();
}

function findLvlIndexInDimList(dimName, lvlName,dimList) {
    var index = -1;
    for (var i = 0; i < dimList.length; i++) {
        if (dimList[i].LevelName == lvlName && dimList[i].DimensionName == dimName) {
            index = i;
            break;
        }
    }
    return index;
}

function isExistsInLevels(analyzer,colIndex, levels, rowIndex, start) {
    if (analyzer.RowDimList[rowIndex].DimensionName == analyzer.RowDimList[colIndex].DimensionName) {
        for (var i = start; i < levels.length; i++) {
            if (analyzer.RowDimList[rowIndex].LevelName == levels[i]) {
                return true;
            }
        }
    }
    return false;
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
var privatedimdata = ["MSISDN", "号码", "手机号码"];
function setGridContextMenu(tmp, rowid, colindex, rowdata, e) {
    var ana = tmp.Analyzer;
    var rootPath = getRootPath();
    var $menuDiv = $(">html>body>#secondContextMenu");
    if ($menuDiv.length == 0) {
        $menuDiv = $("<div id='secondContextMenu' style=\"position:fixed;z-index:999;\"></div>");
        $(">html>body").append($menuDiv);
    }
    $menuDiv.hide();
    $menuDiv.css({ left: e.clientX, top: e.clientY });
    $menuDiv.empty();
    var $menu = $("<ul></ul>");
    $menuDiv.append($menu);

    if (((ana.StatisticsSetting.StatisticsList.length==0&&colindex < ana.RowDimList.length)||
        (ana.StatisticsSetting.StatisticsList.length > 0 && colindex < ana.StatisticsSetting.DimensionIndexList.length)) &&
         ana.ColDimList.length == 0) {
        var liDrill = getContextItem("钻取");
        var liDrillUp = getContextItem("上钻");
        var liDrillDown = getContextItem("下钻");
        if (ana.StatisticsSetting.StatisticsList.length > 0) {
            colindex = ana.StatisticsSetting.DimensionIndexList[colindex];
        }
        for (var i = 0; i < curDimInfo.length; i++) {
            if (curDimInfo[i].Name == ana.RowDimList[colindex].DimensionName) {
                var itemHiers = [];
                for (var j = 0; j < curDimInfo[i].Items.length; j++) {
                    if (curDimInfo[i].Items[j].Items.length > 0) {
                        itemHiers.push(curDimInfo[i].Items[j]);
                    }
                }
                addDrillUpItems(ana.RowDimList[colindex].LevelName, itemHiers, liDrillUp,ana,colindex,rowdata);
                addDrillDownItems(ana.RowDimList[colindex].LevelName, itemHiers, liDrillDown,ana,colindex,rowdata);
                break;
            }
        }
        addChildItem(liDrill, liDrillUp);
        addChildItem(liDrill, liDrillDown);


        var liDrillDetail = getContextItem("钻透");
        liDrillDetail.addClass("ui-state-disabled");
        addChildItem(liDrill, liDrillDetail);
        $.ajax({
            cache: true,
            type: "POST",
            url: rootPath + "/PlugIn/CustomAnalysis/Handler/DetailDrillHandler.ashx?qtype=candrill",
            data: {
                ana: jsonToString(getDetailDrilled(ana,rowdata))
            },
            datatype: "json",
            success: function (data) {
                if (data == "1") {
                    liDrillDetail.removeClass("ui-state-disabled");
                    liDrillDetail.click(function () {
                        DrillDetail(rootPath, ana, rowdata);
                    });
                }
            }
        });


        var liDrillAdd = getContextItem("添加维度");
        liDrillAdd.click(function () {
            var diaDimAdd = $("#diaDrillDimAdd");
            diaDimAdd.empty();
            for (var i = 0; i < curDimInfo.length; i++) {
                var dim = curDimInfo[i]; var lvlsToAdd = [];
                var lvlnames = [];
                for (var j = 0; j < dim.Items.length; j++) {
                    if (dim.Items[j].Items.length == 0) {

                        var rdIndex = findLvlIndexInDimList(dim.Name, dim.Items[j].Name, ana.RowDimList);
                        var sdIndex = findLvlIndexInDimList(dim.Name, dim.Items[j].Name, ana.SliceDimList);
                        if (rdIndex < 0 && sdIndex < 0) {
                            var liLvlToAdd = $("<input style='padding-left:20px;' type='checkbox' value='" + dim.Items[j].Name + "'/>");
                            liLvlToAdd.data("dimobj", {
                                DimensionID: dim.Value,
                                DimensionName: dim.Name,
                                LevelName: dim.Items[j].Name,
                                ValType: 0,
                                Val: "",
                                ValList: []
                            });
                            lvlsToAdd.push(liLvlToAdd);
                            lvlnames.push(dim.Items[j].Name);
                        }
                    }
                }
                if (lvlsToAdd.length > 0) {
                    diaDimAdd.append("<span>" + dim.Name + "</span>");
                    diaDimAdd.append("<br />");
                    for (var l = 0; l < lvlsToAdd.length; l++) {
                        diaDimAdd.append(lvlsToAdd[l]);
                        diaDimAdd.append("<span>" + lvlnames[l] + "</span>");
                        diaDimAdd.append("<br/>");
                    }
                }
            }
            diaDimAdd.dialog({ autoOpen: true, modal: true, maxHeight: 480,
                buttons: {
                    "确定": function () {
                        if (diaDimAdd.find(":checked").length > 0) {
                            var preRowDimCount = ana.RowDimList.length;
                            if (ana.StatisticsSetting.StatisticsList.length == 0) {
                                for (var r = 0; r < ana.RowDimList.length; r++) {
                                    ana.RowDimList[r].ValType = 0;
                                    if (indexOfStrInArr(ana.RowDimList[r].LevelName, privatedimdata) > -1) {
                                        ana.RowDimList[r].Val = rowdata[rowdata.length - 1];
                                    }
                                    else {
                                        ana.RowDimList[r].Val = rowdata[r];
                                    }
                                    ana.RowDimList[r].ValList = [];
                                }
                            }
                            else {
                                for (var k = 0; k < ana.StatisticsSetting.DimensionIndexList.length; k++) {
                                    var r = ana.StatisticsSetting.DimensionIndexList[k];
                                    ana.RowDimList[r].ValType = 0;
                                    if (indexOfStrInArr(ana.RowDimList[r].LevelName, privatedimdata) > -1) {
                                        ana.RowDimList[r].Val = rowdata[rowdata.length - 1];
                                    }
                                    else {
                                        ana.RowDimList[r].Val = rowdata[k];
                                    }
                                    ana.RowDimList[r].ValList = [];
                                }
                            }
                            diaDimAdd.find(":checked").each(function () {
                                if (ana.StatisticsSetting.StatisticsList.length == 0) {
                                    if (ana.SortSetting.SortColIndex >= ana.RowDimList.length) {
                                        ana.SortSetting.SortColIndex++;
                                    }
                                }
                                else {
                                    if (ana.SortSetting.SortColIndex >= ana.StatisticsSetting.DimensionIndexList.length) {
                                        ana.SortSetting.SortColIndex++;
                                    }
                                }
                                if (ana.StatisticsSetting.StatisticsList.length > 0) {
                                    ana.StatisticsSetting.DimensionIndexList.push(ana.RowDimList.length);
                                }
                                ana.RowDimList.push($(this).data("dimobj"));
                                InitLiRowDims(ana.RowDimList);
                                diaDimAdd.dialog("close");
                            });
                            resetAnaChartXYIndex(tmp, preRowDimCount);
                            tmp.Analyzer.MeasureFilter = "";
                            $("#meaSlice").empty();
                            $("#relaSliceTxtArea").empty();
                            saveTemporary(tmp);
                            excuteTemplate();
                        }
                        else {
                            diaDimAdd.dialog("close");
                        }
                    },
                    "取消": function () {
                        diaDimAdd.dialog("close");
                    }
                }
            });

        });
        addChildItem(liDrill, liDrillAdd);

        $menu.append(liDrill);
    }

    addContextRelaAna(ana, rowid, colindex, rowdata, e, $menu);

    if ((ana.ColDimList == null || ana.ColDimList.length == 0)
            && colindex < ana.RowDimList.length) {
        var itemDs = [{ text: "维度汇总", clickFun: function () {
            var anasta = getAnalyzerStat(ana,colindex);
            var anastaStr = jsonToString(anasta);
            var escapesta = escape(anastaStr);
            document.cookie = "ana=" + escapesta.substr(0, 4000) + ";path=/";
            document.cookie = "ana2=" + escapesta.substr(4000, 4000) + ";path=/";
            document.cookie = "ana3=" + escapesta.substr(8000, 4000) + ";path=/";
            openPageInTab("维度汇总", rootPath + "/PlugIn/CustomAnalysis/Second/Gather.htm");
        }
        }];
        setCustomMenu(itemDs, $menu, colindex, rowdata);
    }

    var liCalMea = getContextItem("添加计算列");
    liCalMea.click(function () {
        showDiaCalMea(null,"1");
    });
    $menu.append(liCalMea);

    $menuDiv.find("ul").css("width", "100px");
    $menu.menu();
    $menuDiv.show();
    $(document).click(function (e) {
        $menuDiv.hide();
    });
}

function resetAnaChartXYIndex(tmp, preRowDimCount) {
    for (var i = 0; i < tmp.ChartSetting.ChartAxisYList.length; i++) {
        tmp.ChartSetting.ChartAxisYList[i].ColumnIndex += tmp.Analyzer.RowDimList.length - preRowDimCount;
    }
}

function DrillDetail(rootPath, analyzer, rowData) {
    $.ajax({
        cache: true,
        type: "POST",
        url: rootPath + "/PlugIn/CustomAnalysis/Handler/DetailDrillHandler.ashx?qtype=sql",
        data: {
            ana: jsonToString(getDetailDrilled(analyzer,rowData))
        },
        datatype: "text",
        success: function (data) {
            document.cookie = "detailsql=" + escape(data) + ";path=/";
            openPageInTab("详单", rootPath + "/PlugIn/CustomAnalysis/Second/Detail.htm?rnd=" + (new Date()).getTime() + parseInt(Math.random() * 100000));
        }
    });
}

function getAnalyzerStat(ana,colIndex) {
    var anasta = $.extend(true, {}, ana);
    anasta.StatisticsSetting = {
        DimensionIndexList: [colIndex],
        StatisticsList: [{ MeasureIndex: 0, StatisticsType: 0}]
    };
    return anasta;
}

function getDetailDrilled(analyzer,rowData) {
    var ana = $.extend(true, {}, analyzer);
    for (var i = 0; i < ana.RowDimList.length; i++) {
        ana.RowDimList[i].ValType = 0;
        ana.RowDimList[i].Val = rowData[i];
    }
    return ana;
}


function addContextRelaAna(ana, rowid, colIndex, rowData, e, $menu) {
    var meaids = [];
    for (var m = 0; m < ana.MeasureList.length; m++) {
        meaids.push(ana.MeasureList[m].MeasureID);
    }
    var meaid = meaids.join(",");
    var dims = [];
    var dimsEmpty = [];
    var rootPath = getRootPath();
    var url = rootPath + "/PlugIn/CustomAnalysis/Second/";
    for (var d = 0; d < ana.RowDimList.length; d++) {
        var dim = ana.RowDimList[d];
        dims.push("[" + dim.DimensionName + "].[" + dim.LevelName + "].[" + rowData[d] + "]");
        if (dim.DimensionName == "日期维") {
            dimsEmpty.push("[" + dim.DimensionName + "].[" + dim.LevelName + "].[" + rowData[d] + "]");
        }
        else {
            dimsEmpty.push("[" + dim.DimensionName + "].[" + dim.LevelName + "]");
        }
    }
    for (var d = 0; d < ana.SliceDimList.length; d++) {
        var dim = ana.SliceDimList[d];
        if (dim.DimensionName == "日期维") {
            dims.push("[" + dim.DimensionName + "].[" + dim.LevelName + "].[" + dim.Val + "]");
        }
    }
    var dimstr = dims.join(";");
    var dimstrempty = dimsEmpty.join(";");
    var itemsRa = [{ text: "关联分析", items: [{ text: "趋势分析", clickFun: function (c, r) {
        var urltrend = url + "Trend.htm?meaid=" + meaid + "&rowdim=" + encodeURI(dimstr);
        openPageInTab("趋势分析", urltrend);
    }
    },
                { text: "同环比分析", clickFun: function (c, r) {
                    var urlthb = url + "Analyst.htm?meaid=" + meaid + "&rowdim=" + encodeURI(dimstr);
                    openPageInTab("同环比分析", urlthb);
                }
                },
                { text: "对比分析", clickFun: function (c, r) {
                    var urlcomp = url + "Contrast.htm?meaid=" + meaid + "&rowdim=" + encodeURI(dimstrempty);
                    openPageInTab("对比分析", urlcomp);
                }
                }]
    }];
    setCustomMenu(itemsRa, $menu, colIndex, rowData);
}

function setCustomMenu(items, u, colIndex, rowData) {
    for (var i = 0; i < items.length; i++) {
        var im = items[i];
        var li = $("<li><a href='#'>" + im.text + "</a></li>");
        if (im.items != null && im.items.length > 0) {
            var ul = $("<ul></ul>");
            setCustomMenu(im.items, ul, colIndex, rowData);
            li.append(ul);
        }
        if (im.clickFun != null) {
            li.bind("click", { colIndex: colIndex, rowData: rowData }, im.clickFun);
        }
        u.append(li);
    }
}

function hasTimeDim(dimList) {
    var b = false;
    $(dimList).each(function () {
        if ((this.DimensionName == "日期维" || this.DimensionName == "月份维") &&
        (this.LevelName == "日" || this.LevelName == "周" || this.LevelName == "月" || this.LevelName == "年") &&
        ((this.Val!=null&&this.Val!="")||(this.ValList.length>0&&this.ValList[0]!=""))) {
            b = true;
            return;
        }
    });
    return b;
}

//功能描述：为Jquery对象扩展方法，在页面上点击某区域的非该对象本身时隐藏该对象
//参数描述：context 表示被点击区域的Jquery对象
//创建标示：lyh 20120420
$.fn.clickHide = function (context,brother) {
    var target = $(this);
    context.click(function (e) {
        if ($(this).css("display") != "none") {
            var src = $(e.target);
            var stopP = function () {
                if (e && e.stopPropagation) {
                    e.stopPropagation();
                }
                else {
                    window.event.cancelBubble = true;
                }
            };
            if (src.attr("id") != target.attr("id") && src.attr("id") != brother.attr("id")) {
                target.slideUp("200");
                stopP();
                $("#hiddenIsYtextShown").val("0");
                $("#hiddenIsY2textShown").val("0");
                $("#hiddenIsXtextShown").val("0");
                $("#hiddenIsSharptextShown").val("0");
            }
        }
    });
}

function BindChart() {
    var charttype = "Column";
    var tmp = getCurTemplate();
    if (tmp.ChartSetting.ChartAxisYList.length > 0) {
        charttype = getChartType(tmp.ChartSetting.ChartAxisYList[0].ChartType);
    }
    var legendpos = "BOTTOM";
    //    if (charttype == "Pie" || charttype == "Doughnut") {
    //        legendpos = "RIGHT";
    //    }
    var src = getChartSrc();
    var chartoptions = { DataSource: src,
        Height: "260",
        YFormatType: "1000",
        ChartType: charttype,
        LegendPosition: legendpos,
        SubChartType: [],
        Y2DataColIndex: "",
        Y2FormatType:"1000",
        Title: tmp.TemplateName,
        YTitle: "",
        IsAutoLimits: true,
        Is2D: true
    };
    setChartAsixYOption(chartoptions, tmp);
    $("#chartCustom").SampleChart(chartoptions);
}

function setChartOptionYTitle(chartoptions, tmp) {
    var xcount = tmp.Analyzer.RowDimList.length;
    var chartAxisYList = tmp.ChartSetting.ChartAxisYList;
    if (chartAxisYList.length == 1) {
        var ytitle = tmp.Analyzer.MeasureList[chartAxisYList[0].ColumnIndex - xcount].Unit;
    }
}

function setChartAsixYOption(chartoptions,tmp) {
    var chartAxisYList = tmp.ChartSetting.ChartAxisYList;
    if (chartAxisYList.length > 0) {
        var charttype0 = chartAxisYList[0].ChartType;
        var axisytype0 = chartAxisYList[0].AxisYType;
        var isCombo = false;
        var isMultipleY = false;
        for (var i = 1; i < chartAxisYList.length; i++) {
            if (chartAxisYList[i].ChartType != charttype0) {
                isCombo = true;
            }
            if (chartAxisYList[i].AxisYType != axisytype0) {
                isCombo = true;
                isMultipleY = true;
            }
        }
        if (isCombo) {
            var subChartType = [];
            var y2DataColIndex = "";
            for (var i = 0; i < chartAxisYList.length; i++) {
                var ct = { colindex: i+1, type: getChartType(chartAxisYList[i].ChartType) };
                subChartType.push(ct);
                if (chartAxisYList[i].AxisYType == 1) {
                    y2DataColIndex += (i+1).toString()+",";
                }
            }
            y2DataColIndex = removeLastComma(y2DataColIndex);
            if (isMultipleY) {
                chartoptions.ChartType = "Combi1Y";
            }
            else {
                chartoptions.ChartType = "Combi1";
                
            }chartoptions.Is2D = true;
            chartoptions.SubChartType = subChartType;
            chartoptions.Y2DataColIndex = y2DataColIndex;
        }
    }
}

function getChartType(charttype) {
    switch (charttype) {
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
}

function getChartSrc() {
    var arr = new Array();
    var src = '{"colnames":[';
    $("#XOption input").each(function (i) {
        if ($(this).prop("checked") == true) {
            arr.push(i);
            src += '"' + $(this).val() + '",';
        }
    });
    var xcount = $("#XOption input").length;
    $("#YOption input").each(function (j) {
        if ($(this).prop("checked") == true) {
            arr.push(j + xcount);
            src += '"' + $(this).val() + '",';
        }
    });
    src = removeLastComma(src);
    src += '],"rows":[';
    $($("#divSmartGrid").smartgrid("getDatasource").rows).each(function (n) {
        src += '{';
        for (var i = 0; i < arr.length; i++) {
            src += '"col' + i + '":"' + this["col"+i] + '",';
        }
        src = removeLastComma(src);
        src += '},';
    });
    src = removeLastComma(src);
    src += ']}';
    return $.parseJSON(src);
}

function removeLastComma(str) {
    if (str.lastIndexOf(',') == str.length - 1) {
        str = str.substring(0, str.length - 1);
    }
    return str;
}

//功能描述：初始化图形配置信息
//输入参数：xml：xml字符串，内含模板对象和模板运行结果
//创建标识：lyh 20120417
function initChartDia(tmp,grid,opts) {
    var xStr = "";
    var colNames = opts.orgData.colNames;
    $(colNames).each(function (i) {
        if (i < tmp.Analyzer.RowDimList.length) {
            var colname = this;
            xStr += "<tr><td style='border:0px;'><input type='radio' name='xasix'" + (i == 0 ? " checked='checked'" : "") + " value='" +
         colname + "' />" + colname + "</td></tr>";
        }
    });
    var xcount = tmp.Analyzer.RowDimList.length;
    var staDimList = $(tmp.Analyzer.StatisticsSetting.DimensionIndexList);
    if (staDimList.length > 0) {
        xStr = "";
        staDimList.each(function (i) {
            var colname = colNames[i];
            xStr += "<tr><td style='border:0px;'><input type='radio' name='xasix'" + (i == 0 ? " checked='checked'" : "") + " value='" +
         colname + "' />" + colname + "</td></tr>";
        });
        xcount = staDimList.length;
    }
    $("#XOption").empty();
    $("#XOption").append(xStr);
    $("input[name=xasix]", $("#XOption")).each(function (i) {
        if (i == tmp.ChartSetting.AxisX) {
            $(this).prop("checked", true);
        }
    });
    $("#XOption td").each(function () {
        $(this).hover(function () {
            $(this).addClass("ui-widget-content ui-state-hover");
        }, function () {
            $(this).removeClass("ui-widget-content ui-state-hover");
        });
        $(this).find("input").change(function (e) {
            BindChart();
//            $('#XDiv').slideUp('200');
            e.stopPropagation();
        });
    });
    var yStr = "";
    for (i = xcount; i < colNames.length; i++) {
        yStr += "<tr><td style='border:0px;' class='ui-widget-content'><input type=\"checkbox\" value='" + colNames[i].replace(/\|\|\|/g, "  ") + "' />" + colNames[i].replace(/\|\|\|/g, "  ") + "</td></tr>"
    }
    if (colNames.length - xcount > 13) {
        $("#YDiv").css("height", "300px");
    }
    $("#YOption").empty();
    $("#YOption").append(yStr);
    $("#Y2Option").empty();
    $("#Y2Option").append(yStr);
    $("#YOption input").each(function (i) {
        $(this).parent().hover(function () {
            $(this).addClass("ui-state-hover");
        }, function () {
            $(this).removeClass("ui-state-hover");
        });
        $(this).unbind("change");
        for (var j = 0; j < tmp.ChartSetting.ChartAxisYList.length; j++) {
            if ((i + xcount) == tmp.ChartSetting.ChartAxisYList[j].ColumnIndex) {
                $(this).prop("checked", true);
            }
        }
        $(this).change(function (e) {
            BindChart();
            e.stopPropagation();
        })
    });

    if (tmp.ChartSetting.ChartAxisYList.length == 0) {
        $("#YOption").find("input[type=checkbox]:eq(0)").attr("checked", "checked");
    }
}


function bindSliceForChart() {
    $("#sharpDiv").hide();
    $("#sharpText").click(function (e) {
        if ($("#hiddenIsSharptextShown").val() == "0") {
            $("#sharpDiv").slideDown("200");
            $("#hiddenIsSharptextShown").val("1");
        }
        else {
            $("#sharpDiv").slideUp("200");
            $("#hiddenIsSharptextShown").val("0");
        }
        e.stopPropagation();
    });
    $("#sharpDiv").clickHide($("#divShowDataPanel"), $("#sharpText"));
    //初始化X轴
    $("#XDiv").hide();
    $("#xText").click(function (e) {
        if ($("#hiddenIsXtextShown").val() == "0") {
            $("#XDiv").slideDown("200");
            $("#hiddenIsXtextShown").val("1");
        }
        else {
            $("#XDiv").slideUp("200");
            $("#hiddenIsXtextShown").val("0");
        }
        e.stopPropagation();
    });
    $("#XDiv").clickHide($("#divShowDataPanel"), $("#xText"));
    //初始化Y轴
    $("#YDiv").hide();
    $("#yText").click(function (e) {
        if ($("#hiddenIsYtextShown").val() == "0") {
            $("#hiddenIsYtextShown").val("1");
            $("#YDiv").slideDown("200");
        }
        else {
            $("#hiddenIsYtextShown").val("0");
            $("#YDiv").slideUp("200");
        }
        e.stopPropagation();
    });
    $("#YDiv").clickHide($("#divShowDataPanel"), $("#yText"));
    //初始化Y2轴
    $("#Y2Div").hide();
    $("#y2Text").click(function (e) {
        if ($("#hiddenIsY2textShown").val() == "0") {
            $("#Y2Div").slideDown("200");
            $("#hiddenIsY2textShown").val("1");
        }
        else {
            $("#Y2Div").slideUp("200");
            $("#hiddenIsY2textShown").val("0");
        }
        e.stopPropagation();
    });
    $("#Y2Div").clickHide($("#divShowDataPanel"), $("#y2Text"));
}
//功能描述：图形变化事件
//创建标识：lyh 20120419
function axisChanged(context) {
    if (context.attr("id") == "zhuImg") {
        $("#y2Axis").hide();
        $("#YOption input").unbind("change");
        $("#YOption input").change(function () { BindChart(); });
        $("#YOption input").removeAttr("checked");
        $("#YOption input").removeAttr("disabled");
        $("#YOption").find("input[type=checkbox]:eq(0)").attr("checked", "checked");
        $("#YOption").find("input[type=checkbox]:eq(1)").attr("checked", "checked");
    }
    else if (context.attr("id") == "xianImg") {
        $("#y2Axis").hide();
        for (var i = 0; i < $("#YOption input").length; i++) {
            $("#YOption input").removeAttr("checked")
            $("#YOption input").removeAttr("disabled")
            $("#Y2Option input").removeAttr("checked")
            $("#Y2Option input").removeAttr("disabled")
            $("#YOption input:eq(" + i + ")").unbind("change");
            $("#YOption input:eq(" + i + ")").change(function () {
                if ($(this).attr("checked") == true) {
                    $("#Y2Option input[value=" + $(this).attr("value") + "]").attr("disabled", "disabled");
                }
                else {
                    $("#Y2Option input[value=" + $(this).attr("value") + "]").removeAttr("disabled");
                }
                BindChart();
            })
        }
        $("#YOption").find("input[type=checkbox]:eq(0)").attr("checked", "checked");
    }
    else if (context.attr("id") == "bingImg") {
        $("#y2Axis").hide();
        $("#YOption input").each(function () {
            $(this).removeAttr("checked")
            $(this).removeAttr("disabled")
            $(this).unbind("change");
            $(this).change(function () {
                $("#YOption input[value!=" + $(this).attr("value") + "]").removeAttr("checked");
                BindChart();
            });
        });
        $("#YOption input:eq(0)").attr("checked", "checked");
    }
    BindChart();
}

//功能描述：生成复杂表头
//创建标识：zzx 20101122
function MultiTableHeader() {
    var headtabletr = $("#gridCustom").parent().parent().prev().find("table thead tr:first");
    headtabletr.parent().parent().parent().parent().css("overflow", "hidden");
    var maxRowSpan = $.trim($("th:last", headtabletr).text()).split("|||").length;
    for (var i = 0; i < maxRowSpan; i++) {
        var topheadtable = headtabletr.clone(true);
        var preth = $("th:eq(1)", topheadtable);
        var prethname = "";
        var colspan = 1;
        topheadtable.find("th:gt(0)").each(function (col) {
            var colname = $.trim($(this).text());
            var strs = colname.split("|||");
            if (strs.length == 1) {
                if (i == 0) {
                    $(this).attr("rowspan", maxRowSpan);
                }
                else {
                    $(this).hide();
                }
            }
            if (i == strs.length - 1) {
                var sortspan = $("span:eq(0)", $(this)).clone(true);
                $(this).append(sortspan);
            }
            if (strs[i] == prethname) {
                $(this).hide();
                colspan++;
            }
            else {
                preth.attr("colspan", colspan);
                preth = $(this);
                colspan = 1;
                prethname = strs[i];
                $("div:first", $(this)).text(prethname);
                $(this).css("border-bottom", "1px solid #77D5F7");
            }
            $("div:first", preth).append(sortspan);
        });
        preth.attr("colspan", colspan);
        topheadtable.appendTo(headtabletr.parent());

    }
    var firsttr = headtabletr.clone();
    firsttr.find("th").empty().css("height", "0px");
    firsttr.css("height", "0px");
    firsttr.prependTo(headtabletr.parent());
    headtabletr.remove();
}

function getDefaultSortSetting() {
    var tmp = $("#dialogOptions").data("tmpobj");
    var sortsetting = "{\"SortColIndex\": \"-1\",\"SecondSortColIndex\": \"-1\",\"SortDirection\": \"0\",\"SecondSortDirection\": \"0\"}";
    if (tmp != undefined) {
        sortsetting = "{\"SortColIndex\":\"" + tmp.Analyzer.SortSetting.SortColIndex;
        sortsetting += "\",\"SortDirection\":\"" + tmp.Analyzer.SortSetting.SortDirection;
        sortsetting += "\",\"SecondSortColIndex\":\"" + tmp.Analyzer.SortSetting.SecondSortColIndex;
        sortsetting += "\",\"SecondSortDirection\":\"" + tmp.Analyzer.SortSetting.SecondSortDirection;
        sortsetting += "\"}";
    }
    return sortsetting;
}

function getDefaultChartSetting() {
    var tmp = $("#dialogOptions").data("tmpobj");
    var chartSetting = "{\"AsixX\":\"0\"}";
    return chartSetting;
}


function SaveTemplate() {
    var tmpName = $.trim($("#txtTmptName").val());
    if (templatetabtype == "New" && tmpName == "") {
        $("#dialogSave").find("span").remove();
        $("#dialogSave").append("<span>模板名为空</span>");
        return;
    }
    var tmp = getCurTemplate();
    if (templatetabtype == "New") {
        tmp.TemplateName = tmpName;
        tmp.FolderID = $("#hideTmpFolderID").val();
        tmp.Desc = $("#txtTmptDesc").text();
        var tmpstr = jsonToString(tmp);
        saveTemporary(tmp);
        $.ajax({
            url: "../pages/Handler.ashx?type=add&cube=" + $("[id$=selectCube]").val(),
            type: "POST",
            datatype: "xml",
            data: {
                tmp: tmpstr,
                filterexp: $.getCondMeasureExp()
            },
            success: function (data) {
                var flag = $(data).find("stat").attr("value");
                if (flag == "0") {
                    $("#dialogSave").find("span").remove();
                    $("#dialogSave").append("<span>已存在相同名称的模板，请重新命名</span>");
                }
                else if (flag == "-1") {
                    $("#dialogSave").find("span").remove();
                    $("#dialogSave").append("<span>增加失败:" + $(data).find("stat").text() + "</span>");
                }
                else {
                    $("#dialogSave").dialog("close");
                    tmp.TemplateID = flag;
                    saveTemporary(tmp);
                    var frameMain = window.parent;
                    frameMain.frames[0].addTemp(flag, tmpName, tmp.FolderID, tmp.Desc);
                    currentTemplateId = flag;
                    templatetabtype = "Edit";
                }
            }
        });
    }
    else {
        var tmpstr = jsonToString(tmp);
        saveTemporary(tmp);
        $.ajax({
            url: "../pages/Handler.ashx?type=save&cube=" + $("[id$=selectCube]").val(),
            type: "POST",
            datatype: "xml",
            data: {
                tmp: tmpstr,
                filterexp: $.getCondMeasureExp()
            },
            success: function (data) {
                var flag = $(data).find("stat").attr("value");
                if (flag == "-1") {
                    alertDialog("更新失败", $(data).find("stat").text());
                }
                else {
                    alertDialog('保存成功', '保存成功');
                    setTimeout("$('#alertinfo').dialog('close')", 1000);
                }
            },
            error: function () {
                alertDialog("提示信息", "加载失败");
            }
        });
    }

}

//功能描述：模板初始化
function TemplateInit(templateid) {
    
    var qtype = $.url.param("qtype");
    
    var templateUrl = "";
    var templatefile = $.url.param("filename");
    var anaMeaID = $.url.param("anameaid");
    if (qtype == "anaagain")
    {
        templateUrl = "../pages/Handler.ashx?datatype=anaagain&key=" + $.url.param("key");
    }
    else if (anaMeaID != undefined && anaMeaID != "") {
        templateUrl = "../pages/Handler.ashx?datatype=singlemea&anameaid=" + anaMeaID;
        $("td[id=tdShowReportList]").hide();
    }
    else if (templatefile != undefined && templatefile != "") {
        templateUrl = "../pages/Handler.ashx?datatype=templatefile&filename=" + templatefile;
        $("td[id=tdShowReportList]").hide();
    }
    else {
        templateUrl = "../pages/Handler.ashx?datatype=template&templateid=" + templateid;
        CheckSubscribeNotRead();
        $("td[id=tdExport]").show();
    }
    $.ajax({ url: templateUrl,
        success: function (data) {
            var $tmp = $.parseJSON(data);
            if ($tmp.Analyzer.PageSetting.PageSize == 0) {
                $tmp.Analyzer.PageSetting.PageSize = 20;
            }
            $("#colmealist").empty();
            if ($tmp.stat != undefined && $tmp.value == "-1") {
                alertDialog("提示信息", $tmp.stat.text);
                return;
            }
            $("#txtTmptName").val($tmp.TemplateName);
            $("#txtTmptDesc").val($tmp.Desc);
            var $measures = $($tmp.Analyzer.MeasureList);
            $measures.each(function () {
                if (this.MeasureType == 7) {
                    var $meacalcol = $("<li class=\"NewMea\" title=\"计算公式|" + this.Formula + "\"><div id=\"" + this.DisplayName + "\">" + this.DisplayName + "</div></li>");
                    $meacalcol.data("meaobj", this);
                    $("#colmealist").append($meacalcol);
                    $(".NewMea").cluetip({ local: true, splitTitle: '|', tracking: true, cursor: 'pointer', cluetipClass: 'default', arrows: true });
                    $("#mlForCal").empty();
                    $("#meaName").attr("value", "");
                    $("#inputForCal").empty();
                    var mes = $("#colmealist div");
                    for (i = 0; i < mes.length; i++) {
                        if ($(mes[i]).parent().attr("class") != "NewMea") {
                            $("#mlForCal").append("<li style='width:100%'><button style='width:100%;text-align:left'>" + "<" + (i + 1) + "> [" + $.trim($(mes[i]).text()) + "]</button></li>");
                        }
                    }
                    $("#mlForCal button").button();
                    $("#operatorReg button").button();
                    //                    $("#inputForCal").setCaret();
                    setNewMeaMenu();
                }
                else {
                    var newcolli = $("<li class=\"ui-state-default ui-button-text-only\">");
                    var dispmesname = this.DisplayName + getMeasureTypeDescription(this.MeasureType);
                    newcolli.append($("<div>" + dispmesname + "</div>"));
                    newcolli.data("meaobj", this);
                    $("#colmealist").append(newcolli);
                    SetMeasureMenu();
                }
            });
            if ($measures.length > 0) {
                SetCustomMeaMenu();
            }
            if ($tmp.Analyzer.MeasureFilter != undefined && $tmp.Analyzer.MeasureFilter.length > 0) {
                var reg = /\[[\w|%|$|#|&|!|@|^|\u4e00-\u9faf|\(|\)|（|）]+\](\s*)([>=<]+)(\s*)([\d\w-.]+)/g;
                var filterstr = $tmp.Analyzer.MeasureFilter;
                var filterarr = filterstr.match(reg);
                var txtarea = $tmp.Analyzer.MeasureFilter;
                for (i = 0; i < filterarr.length; i++) {
                    var $condli = $("<li class=\"ui-state-default ui-button-text-only\"><span>" + "<" + (i + 1) + "></span>&nbsp;<span>" +
                        filterarr[i] + "</span></li>");
                    for (var j = 0; j < $measures.length; j++) {
                        if (contains(filterarr[i], "[" + $measures[j].DisplayName + "]", false)) {
                            $condli.data("meaobj", $measures[j]);
                        }
                    }
                    $("#meaSlice").append($condli);
                }
                SetMeaSliceMenu();

                $("#sliceRelaBtn").button();
                $("#sliceRelaBtn").show(1);
                if (txtarea != undefined) {
                    txtarea = $.trim(txtarea);
                    $("#relaSliceTxtArea").text(txtarea);
                    if (txtarea != "") {
                        $("#sliceRelaBtn").show();
                    }
                }
                $("#btnExpend1").click();
            }
            $("#coldimlist").empty();
            $($tmp.Analyzer.ColDimList).each(function () {
                var ele = this;
                var newcolli = $("<li class=\"ui-state-default ui-button-text-only\">");
                newcolli.text(ele.LevelName);
                newcolli.data("dimobj", ele);
                $("#coldimlist").append(newcolli);
            });
            InitLiRowDims($tmp.Analyzer.RowDimList);
            var cubeid = $tmp.CubeID;
            if (cubeid != undefined && cubeid != "") {
                $.ajax({
                    cache: false,
                    type: "POST",
                    url: "../pages/Handler.ashx?datatype=folderid",
                    data: {
                        cubeid: cubeid,
                        userid: $("input[id$=hiddenUserID]").val()
                    },
                    datatype: "text",
                    success: function (data) {
                        if (data = "-1") data = "";
                        $("select[id$=selectCubeFolder]").val(data);
                        InitSelectCube(cubeid);
                    }
                });
                $("select[id$=selectCube]").val(cubeid);
                //InitTreeMeasure();
            }
            else {
                if (qtype == "anaagain")
                {
                    var mid = $tmp.Analyzer.MeasureList[0].MeasureID;
                    InitTreeMeasure("", mid);
                }
                else if (anaMeaID != undefined && anaMeaID != "") {
                    InitTreeMeasure("", anaMeaID);
                }
                else {
                    InitTreeMeasure(templatefile);
                }
                //$("select[id$=selectCube]").hide();
                //$("select[id$=selectCubeFolder]").hide();
                $(".ca_select_container").hide();
                $("#tdShowReportList").hide();
                var curPageHeight = pageHeight();
                $("#meaTree").css("height", curPageHeight - 59 + "px");
            }
            SetSliceDim($tmp);
            SetChoiceMenu();
            SetColDimensionMenu();
            saveTemporary($tmp);
        }
    });
}



//function initTemplateSwapCol(tmp){
//    if(tmp.Analyzer.RowColSwapSetting)
//}

function saveTemporary(tmp) {
    $("#dialogOptions").data("tmpobj", tmp);
}

function InitLiRowDims(RowDimList) {
    $("#rowdimlist").empty();
    $(RowDimList).each(function (i) {
        var ele = this;
        var newcolli = $("<li class=\"ui-state-default ui-button-text-only\">");
        newcolli.text(ele.LevelName);
        newcolli.data("dimobj", ele);
        $("#rowdimlist").append(newcolli);
    });
    SetRowDimensionMenu();
    
}