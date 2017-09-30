/*
* jQuery CA ContextMenu 1.0.1
*
* Copyright 2013 BocoDss
* Depends:
*	jquery.ui.core.js
*	jquery.ui.widget.js
*/
(function ($) {
    var methods = {
        init: function (settings) {
            var paras = $.extend({
                showRelatedAnalysis: false,
                showDrill: false,
                showDimStatistics: false,
                showDetailDrill: true,
                topX: 200,
                topY: 200,
                analyzer: null,
                colIndex: 0,
                rowData: [],
                items: []
            }, settings);
            var $menuDiv = $(">html>body>#secondContextMenu");
            if ($menuDiv.length == 0) {
                $menuDiv = $("<div id='secondContextMenu' style=\"position:fixed;z-index:999;\"></div>");
                $(">html>body").append($menuDiv);
            }
            $menuDiv.hide();
            $menuDiv.css({ left: paras.topX, top: paras.topY });
            $menuDiv.empty();
            var $menu = $("<ul></ul>");
            $menuDiv.append($menu);
            var rootPath = getRootPath();
            var url = rootPath + "/PlugIn/CustomAnalysis/Second/";
            if (paras.showRelatedAnalysis) {
                var meaids = [];
                for (var m = 0; m < paras.analyzer.MeasureList.length; m++) {
                    meaids.push(paras.analyzer.MeasureList[m].MeasureID);
                }
                var meaid = meaids.join(",");
                var dims = [];
                var dimsEmpty = [];
                for (var d = 0; d < paras.analyzer.RowDimList.length; d++) {
                    var dim = paras.analyzer.RowDimList[d];
                    dims.push("[" + dim.DimensionName + "].[" + dim.LevelName + "].[" + paras.rowData[d] + "]");
                    if (dim.DimensionName == "日期维") {
                        dimsEmpty.push("[" + dim.DimensionName + "].[" + dim.LevelName + "].[" + paras.rowData[d] + "]");
                    }
                    else {
                        dimsEmpty.push("[" + dim.DimensionName + "].[" + dim.LevelName + "]");
                    }
                }
                for (var d = 0; d < paras.analyzer.SliceDimList.length; d++) {
                    var dim = paras.analyzer.SliceDimList[d];
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
                setCustomMenu(itemsRa, $menu, paras.colIndex, paras.rowData);
            }
            $menuDiv.find("ul").css("width", "100px");

            if (paras.showDrill && paras.analyzer != null && paras.analyzer.RowDimList.length > paras.colIndex) {
                var liDrill = $("<li></li>");
                liDrill.append($("<a href='#'>钻取</a>"));
                $menu.append(liDrill);
                var ulDrill = $("<ul></ul>");
                liDrill.append(ulDrill);
                ulDrill.load(rootPath + "/PlugIn/CustomAnalysis/Handler/Dimension.ashx?type=hier&dimid=" + paras.analyzer.RowDimList[paras.colIndex].DimensionID +
                "&level=" + encodeURI(paras.analyzer.RowDimList[paras.colIndex].LevelName), function () {
                    liDrill.prop("disabled", false);
                    $menu.menu("destroy");
                    $menu.menu();
                    liDrill.find("ul").css("width", "100px");

                    liDrill.find(">ul>li").each(function () {
                        var levels = [];
                        $(this).find(">ul>li").each(function () {
                            levels.push($(this).text());
                        });
                        $(this).find(">ul>li").each(function (j) {
                            $(this).click(function () {
                                var anaDrill = getAnalyzerDrilled(paras, j, levels);
                                var anaDrillStr = jsonToString(anaDrill);
                                document.cookie = "anadrill=" + escape(anaDrillStr) + ";path=/";
                                openPageInTab("钻取", rootPath + "/PlugIn/CustomAnalysis/Second/Drill.htm?d=1&rnd=" + (new Date()).getTime() + parseInt(Math.random() * 100000));
                            });
                        });
                    });
                });
            }
            if (paras.showDimStatistics && (paras.analyzer.ColDimList == null || paras.analyzer.ColDimList.length == 0)
            && paras.colIndex < paras.analyzer.RowDimList.length) {
                var itemDs = [{ text: "维度汇总", clickFun: function () {
                    var anasta = getAnalyzerStat(paras);
                    var anastaStr = jsonToString(anasta);
                    document.cookie = "ana=" + escape(anastaStr);
                    openPageInTab("维度汇总", rootPath + "/PlugIn/CustomAnalysis/Second/Gather.htm");
                }
                }];
                setCustomMenu(itemDs, $menu, paras.colIndex, paras.rowData);
            }

            if (paras.showDetailDrill) {

                $.ajax({
                    cache: true,
                    type: "POST",
                    url: rootPath + "/PlugIn/CustomAnalysis/Handler/DetailDrillHandler.ashx?qtype=candrill",
                    data: {
                        ana: jsonToString(getDetailDrilled(paras))
                    },
                    datatype: "json",
                    success: function (data) {
                        if (data == "1") {
                            var liDrill = $("<li></li>");
                            liDrill.append($("<a href='#'>钻透</a>"));
                            liDrill.click(function () {
                                DrillDetail(rootPath, paras);
                            });
                            $menu.append(liDrill);
                            $menu.menu("destroy");
                            $menu.menu();
                        }
                    }
                });
            }
            if (paras.items != null && paras.items.length > 0) {
                setCustomMenu(paras.items, $menu, paras.colIndex, paras.rowData);
            }
            $menu.menu();
            $menuDiv.show();
            $(document).click(function (e) {
                $menuDiv.hide();
            });
        }
    };

    function DrillDetail(rootPath, paras) {
        $.ajax({
            cache: true,
            type: "POST",
            url: rootPath + "/PlugIn/CustomAnalysis/Handler/DetailDrillHandler.ashx?qtype=sql",
            data: {
                ana: jsonToString(getDetailDrilled(paras))
            },
            datatype: "text",
            success: function (data) {
                document.cookie = "detailsql=" + escape(data) + ";path=/";
                openPageInTab("详单", rootPath + "/PlugIn/CustomAnalysis/Second/Detail.htm?rnd=" + (new Date()).getTime() + parseInt(Math.random() * 100000));
            }
        });
    }

    $.fn.contextmenu = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method' + method + 'does not exist on jQuery.CA.ContextMenu');
        }
    };

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




    function getAnalyzerStat(paras) {
        var anasta = $.extend(true, {}, paras.analyzer);
        anasta.StatisticsSetting = {
            DimensionIndexList: [paras.colIndex],
            StatisticsList: [{ MeasureIndex: 0, StatisticsType: 0}]
        };
        return anasta;
    }

    function getDetailDrilled(paras) {
        var ana = $.extend(true, {}, paras.analyzer);
        for (var i = 0; i < ana.RowDimList.length; i++) {
            ana.RowDimList[i].ValType = 0;
            ana.RowDimList[i].Val = paras.rowData[i];
        }
        return ana;
    }

    function getAnalyzerDrilled(paras, drillIndex, levels) {
        var ana = $.extend(true, {}, paras.analyzer);
        var srcIndex = 0;
        for (var i = 0; i < levels.length; i++) {
            if (levels[i] == paras.analyzer.RowDimList[paras.colIndex].LevelName) {
                srcIndex = i;
                break;
            }
        }
        var rowdimlist = [];
        var isDirllLevelInRowDim = isExistsInRowDims(paras, levels[drillIndex]);
        for (var r = 0; r < paras.analyzer.RowDimList.length; r++) {
            var dim = ana.RowDimList[r];
            if (!isExistsInLevels(paras, levels, r, drillIndex + 1)) {
                if (isDrillDown(drillIndex, srcIndex)) {
                    dim.Val = paras.rowData[r];
                    dim.ValList = [];
                    dim.ValType = 0;
                }
                else if (isDrillUp(drillIndex, srcIndex)) {
                    if (paras.analyzer.RowDimList[r].DimensionName == paras.analyzer.RowDimList[paras.colIndex].DimensionName) {
                        dim.Val = "";
                        dim.ValType = 0;
                        dim.ValList = [];
                    }
                    else {
                        dim.Val = paras.rowData[r];
                        dim.ValList = [];
                        dim.ValType = 0;
                    }
                }
                rowdimlist.push(dim);
                if (r == paras.colIndex && isDrillDown(drillIndex, srcIndex)) {
                    var d = $.extend({}, paras.analyzer.RowDimList[r]);
                    d.LevelName = levels[drillIndex];
                    d.ValType = 0;
                    d.Val = "";
                    d.ValList = [];
                    rowdimlist.push(d);
                }
            }
            if (r == paras.colIndex && isDrillUp(drillIndex, srcIndex) && !isDirllLevelInRowDim) {
                dim.LevelName = levels[drillIndex];
                dim.Val = "";
                dim.ValType = 0;
                dim.ValList = [];
                rowdimlist.push(dim);
            }
        }
        ana.RowDimList = rowdimlist;
        return ana;
    }

    function isDrillDown(drillIndex, srcIndex) {
        return drillIndex > srcIndex
    }

    function isDrillUp(drillIndex, srcIndex) {
        return drillIndex < srcIndex
    }

    function isExistsInRowDims(paras, levelname) {
        for (var i = 0; i < paras.analyzer.RowDimList.length; i++) {
            if (paras.analyzer.RowDimList[i].LevelName == levelname &&
                paras.analyzer.RowDimList[i].DimensionName == paras.analyzer.RowDimList[paras.colIndex].DimensionName) {
                return true;
            }
        }
        return false;
    }

    function isExistsInLevels(paras, levels, rowIndex, start) {
        if (paras.analyzer.RowDimList[rowIndex].DimensionName == paras.analyzer.RowDimList[paras.colIndex].DimensionName) {
            for (var i = start; i < levels.length; i++) {
                if (paras.analyzer.RowDimList[rowIndex].LevelName == levels[i]) {
                    return true;
                }
            }
        }
        return false;
    }


    function getRootPath() {
        var strFullPath = window.document.location.href;
        var strPath = window.document.location.pathname;
        var pos = strFullPath.indexOf(strPath);
        var prePath = strFullPath.substring(0, pos);
        var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
        return prePath + postPath;
    }

    function jsonToString(obj) {
        switch (typeof (obj)) {
            case 'string':
                return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';
            case 'array':
                return '[' + obj.map(jsonToString).join(',') + ']';
            case 'object':
                if (obj instanceof Array) {
                    var strArr = [];
                    var len = obj.length;
                    for (var i = 0; i < len; i++) {
                        strArr.push(jsonToString(obj[i]));
                    }
                    return '[' + strArr.join(',') + ']';
                } else if (obj == null) {
                    return 'null';

                } else {
                    var string = [];
                    for (var property in obj) string.push(jsonToString(property) + ':' + jsonToString(obj[property]));
                    return '{' + string.join(',') + '}';
                }
            case 'number':
                return obj;
            default:
                return obj;
        }
    }



})(jQuery);