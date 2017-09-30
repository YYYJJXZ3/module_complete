(function ($) {
    var methods = {
        init: function (settings) {
            meaMethod.curSet._this = this;
            $.extend(true, meaMethod.curSet, $.fn.MeasureView.defaults, settings);
            if (settings.items && settings.items.length > 0) {
                meaMethod.curSet.items = settings.items;
            }
            else {
                meaMethod.curSet.items = [];
            }
            if (settings.titleBgColor && settings.titleBgColor.length > 0) {
                meaMethod.curSet.titleBgColor = settings.titleBgColor;
            }
            else {
                meaMethod.curSet.titleBgColor = $.fn.MeasureView.defaults.titleBgColor;
            }

            meaMethod.getData(meaMethod.curSet);
        }
    }

    $.fn.MeasureView = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method' + method + 'does not exist on jQuery.MeasureView');
        }
    }

    $.fn.MeasureView.defaults = {
        frameType: ".net",
        analyzer: null,
        path: dss.rootPath + "javascript/JSControl/MeasureView/Images/",
        icon: dss.rootPath + "javascript/JSControl/MeasureView/Images/success.png",//默认的标题图标
        titleBgColor: ["#6CCAC9", "#57C8F2", "#63ACE5", "#8075C4"],//默认的标题背景色
        shortName: "指标值",//默认的指标名称缩写
        items: [
            //单项个性化，接口样例：
            //{
            //    colindex: 0,
            //    isPositive: true,//是否为正向指标
            //    icon: "",
            //    titleBgColor: "",
            //    shortName: "指标值",
            //    thresholdList: [{ min: null, max: 90, color: 'red' }, { min: 90, max: 100, color: 'green' }]//标色阈值
            //}
        ],
        itemMinWidth: 200,//每块的最小宽度
        itemMargin: 8,//间距
        clickEvent: function (measureId, measureName, unit) {

        }
    };

})(jQuery);

var meaMethod = {
    curSet: {
        _this: null,//当前div对象
        items: []
    },
    makeMeaView: function (data) {
        meaMethod.curSet._this.empty();

        var item = null;
        var itemCount = meaMethod.curSet.analyzer.MeasureList.length / 3;
        var itemWidth = meaMethod.curSet.itemMinWidth;
        var itemIdx = 0;

        var divWidth = meaMethod.curSet._this[0].offsetWidth;
        var columnCnt = meaMethod.getColumnCnt(divWidth, itemCount);
        itemWidth = Math.floor((divWidth + meaMethod.curSet.itemMargin - 2 * columnCnt) / columnCnt) - meaMethod.curSet.itemMargin;

        var title = null;
        var value = null;
        var table = null;
        var contrast = 0;//同比、环比值
        var tr = null;
        var td = null;
        var shortName = "指标";
        var meaIdx = 0;//指标索引
        var measureId = "";//指标ID
        var measureName = "";//指标名称
        var measureDesc = "";//指标描述
        var measureUnit = "";//指标单位
        var measureThd = [];//指标阈值，用于标色

        $.each(data.colnames, function (i, colname) {
            if (i >= meaMethod.curSet.analyzer.RowDimList.length) {
                meaIdx = i - meaMethod.curSet.analyzer.RowDimList.length;
                itemIdx = Math.floor(meaIdx / 3);

                if (meaIdx % 3 == 0) {//当前
                    measureId = meaMethod.curSet.analyzer.MeasureList[meaIdx].MeasureID;
                    measureName = meaMethod.curSet.analyzer.MeasureList[meaIdx].DisplayName;
                    measureDesc = meaMethod.curSet.analyzer.MeasureList[meaIdx].DisplayName;
                    measureUnit = meaMethod.getUnit(colname) || meaMethod.curSet.analyzer.MeasureList[meaIdx].Unit;
                    measureThd = [];

                    item = $("<div id=\"" + measureId + "_meaview\" class=\"meaItem\" style=\"width:" + itemWidth + "px;\"></div>");
                    if ((itemIdx + 1) % columnCnt == 0) {
                        item.css("margin-right", 0);
                    }
                    else {
                        item.css("margin-right", meaMethod.curSet.itemMargin);
                    }

                    var imgSrc = $.fn.MeasureView.defaults.icon;
                    var titleBgColor = meaMethod.curSet.titleBgColor[itemIdx % meaMethod.curSet.titleBgColor.length];
                    $.each(meaMethod.curSet.items, function (j, tmp) {
                        if (itemIdx == tmp.colindex) {
                            if (tmp.icon) {
                                imgSrc = tmp.icon;
                            }
                            if (tmp.titleBgColor) {
                                titleBgColor = tmp.titleBgColor;
                            }
                            if (tmp.shortName) {
                                shortName = tmp.shortName;
                            }
                            else {
                                shortName = "指标值";
                            }
                            if (tmp.thresholdList) {
                                measureThd = tmp.thresholdList;
                            }
                        }
                    });

                    title = $("<div class=\"title\" style=\"background-color:" + titleBgColor + ";\"></div>")
                        .append("<div class=\"titleIcon\"><img src=\"" + imgSrc + "\" /></div>")
                        .append("<div title='" + measureDesc + "' class=\"titleName\">" + meaMethod.dropUnit(colname) + "</div>");

                    item.append(title);
                }
                else {//同比和环比
                    if (meaIdx % 3 == 1) {//同比
                        table = $("<table><tr class=\"meaName\"><td>" + shortName + "</td><td>同比</td><td>环比</td></tr></table>");
                        shortName = "指标";
                        tr = $("<tr></tr>");
                        if (data.rows.length > 0) {
                            var color = meaMethod.getColorByPieces(measureThd, data.rows[0]["col" + (i - 1)]);
                            tr.append("<td class=\"meaValue\" style='color:" + color + ";'>" + data.rows[0]["col" + (i - 1)] + "<span style='color:" + color + ";'>" + measureUnit + "</span></td>");
                        }
                        else {
                            tr.append("<td class=\"meaValue\">--</td>");
                        }
                    }

                    contrast = data.rows.length > 0 ? data.rows[0]["col" + i] : "--";
                    if (contrast > 0) {
                        td = $("<td class=\"meaContrastUp\">" + contrast + "<span>%</span><img src=\"" + $.fn.MeasureView.defaults.path + "up.png\" /></td>");
                    }
                    else if (contrast < 0) {
                        td = $("<td class=\"meaContrastDown\">" + Math.abs(contrast) + "<span>%</span><img src=\"" + $.fn.MeasureView.defaults.path + "down.png\" /></td>");
                    }
                    else if (contrast === 0) {
                        td = $("<td class=\"meaContrastUp\">" + contrast + "<span>%</span>--</td>");
                    }
                    else {
                        td = $("<td class=\"meaContrastUp\">--</td>");
                    }

                    tr.append(td);

                    if (meaIdx % 3 == 2) {//环比
                        table.append(tr);
                        value = $("<div class=\"value\"></div>");
                        value.append(table);
                        item.append(value);

                        meaMethod.curSet._this.append(item);

                        item.data("measureId", measureId);
                        item.data("measureName", measureName);
                        item.data("measureUnit", measureUnit);

                        item.click(function () {
                            var _This = $(this);
                            _This.siblings().removeClass("selected");
                            _This.addClass("selected");
                            meaMethod.curSet.clickEvent(_This.data("measureId"), _This.data("measureName"), _This.data("measureUnit"));
                        });
                    }
                }
            }
        });
    },
    getData: function (opt) {
        if (meaMethod.curSet.frameType == "java") {
            var url = dss.rootPath + "plugin/common/commonhelp/get_data_by_analyzer";

            $.ajax({
                type: "post",
                url: url,
                data: {
                    analyzer: dss.jsonToString(opt.analyzer)
                },
                dataType: "json",
                beforeSend: function () {
                    dss.load(true);
                },
                complete: function () {
                    dss.load(false);
                },
                success: function (data) {
                    var dsrc = data.data;
                    if (dsrc != null && dsrc.rows != null) {
                        if (dsrc.colnames == null) {
                            dsrc.colnames = dsrc.colNames;
                        }
                        for (var r = 0; r < dsrc.rows.length; r++) {
                            if (dsrc.rows[r].cells != null) {
                                for (var c = 0; c < dsrc.rows[r].cells.length; c++) {
                                    dsrc.rows[r]["col" + c] = dsrc.rows[r].cells[c];
                                }
                            }
                        }
                    }

                    meaMethod.makeMeaView(dsrc);

                    $(window).resize(function () {
                        meaMethod.makeMeaView(dsrc);
                    });
                }
            });
        }
        else {
            $.ajax({
                type: "POST",
                url: dss.rootPath + "javascript/JSControl/SampleChart/Handler/Echart.ashx",
                data: {
                    actionType: "getDataByAnalyzer",
                    property1: dss.jsonToString(opt.analyzer)
                },
                beforeSend: function () {
                    dss.load(true);
                },
                complete: function () {
                    dss.load(false);
                },
                dataType: "json",
                success: function (data) {
                    meaMethod.makeMeaView(data);

                    $(window).resize(function () {
                        meaMethod.makeMeaView(data);
                    });
                },
                error: function (a) {
                    alert(a);
                }
            });
        }
    },
    getUnit: function (colname) {
        return colname.substr(colname.indexOf("（") + 1, colname.indexOf("）") - colname.indexOf("（") - 1);
    },
    dropUnit: function (colname) {
        if (colname.contains("（")) {
            colname = colname.substr(0, colname.indexOf("（"));
        }
        return colname;
    },
    findInObjArr: function (arr, k, v) {
        var cur = null;

        for (var i = 0; i < arr.length; i++) {
            if (arr[i][k] == v) {
                cur = {
                    index: i,
                    item: arr[i]
                };
            }
        }

        return cur;
    },
    getArrIdx: function (arr, v) {
        var idx = 0;

        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == v) {
                idx = i;
            }
        }

        return idx;
    },
    getColumnCnt: function (width, totalCnt) {//计算每列应该放几个
        var colCnt = 0;
        var marginRight = 8;
        var itemMinWidth = meaMethod.curSet.itemMinWidth;
        var itemWidth = (width - (marginRight * (totalCnt - 1))) / totalCnt;
        if (itemWidth >= itemMinWidth) {//一行显示
            colCnt = totalCnt;
        }
        else {
            itemWidth = (width - (marginRight * (Math.ceil(totalCnt / 2) - 1))) / Math.ceil(totalCnt / 2);
            if (itemWidth >= itemMinWidth) {//分两行
                colCnt = Math.ceil(totalCnt / 2);
            }
            else {//按最小宽度
                colCnt = Math.ceil((width + marginRight) / (itemMinWidth + marginRight));
            }
        }

        return colCnt;
    },
    getColorByPieces: function (pieces, value) {
        var color = "green";

        if (pieces.length > 0 && !dss.isNullOrEmpty(value)) {
            value = parseFloat(value);
            var tmpMin, tmpMax, tmpColor;
            for (var i = 0; i < pieces.length; i++) {
                tmpMin = pieces[i].min;
                tmpMax = pieces[i].max;
                tmpColor = pieces[i].color;

                if (tmpMax == null && value > tmpMin) {
                    color = tmpColor;
                }
                else if (value <= tmpMax && (tmpMin == null || value > tmpMin)) {
                    color = tmpColor;
                }
            }
        }

        return color;
    }
};