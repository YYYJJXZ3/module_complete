(function ($) {
    var methods = {
        init: function (settings) {
            $.extend(true, treeMethod.curSettings, $.fn.treeChart.defaults, settings);
            if (settings.levels.length > 0) {
                treeMethod.curSettings.levels = settings.levels;
            }
            if (settings.pieces.length > 0) {
                treeMethod.curSettings.pieces = settings.pieces;
            }
            treeMethod.curSettings.divId = $(this)[0].id;

            treeMethod.makeTree(treeMethod.curSettings);
        }
    }

    $.fn.treeChart = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method' + method + 'does not exist on jQuery.treeChart');
        }
    }

    $.fn.treeChart.defaults = {
        separator: "￥",//分隔符，为防止节点ID重复，节点ID算法：父节点真实名称+分隔符+当前节点名称，注意“真实”二字
        time: "2016年10月16日",
        topN: 10,
        templateId: "2132695447",
        rootName: "黑龙江省",//根节点的名称
        initDeep: 2,//默认展开到第几层，从1开始
        levels: ["省", "地区", "BRAS", "区县", "OLT", "小区", "ONU", "用户", "HOST"],//每层的粒度名称
        measure: { name: "下行速率", sort: 'asc' },
        pieces: [
             { name: '优', min: null, max: 80, color: '#3FB97E' },
             { name: '良', min: 80, max: 90, color: '#198FCD' },
             { name: '差', min: 90, max: null, color: '#E85B79' }
        ]
    };

})(jQuery);

var treeMethod = {
    _jm: null,
    mind: null,
    curSettings: {
        divId: "",
        data: []
    },
    makeTree: function () {
        treeMethod._jm = null;
        $("#" + treeMethod.curSettings.divId).html("");

        treeMethod.curSettings.data = [];
        $.each(treeMethod.curSettings.levels, function (i, item) {
            treeMethod.curSettings.data.push({
                name: item,
                initedItem: "",//已经初始化过的项，用逗号隔开，已初始化过的就不用再生成下级
                dataSource: {}
            });
        });

        treeMethod.load_jsmind();
    },
    load_jsmind: function () {
        treeMethod.mind = {
            meta: {
                version: '0.2'
            },
            format: 'node_array',
            data: [
                //{ "id": "root", "isroot": true, "topic": "jsMind" },

                //{ "id": "sub1", "parentid": "root", expanded: true, "topic": "<img onclick='treeMethod.addChild(\"sub1\")' style='width:18px;height:18px;' src='http://www.viastreaming.com/images/apple_logo2.png'/>河北：123", "data": 123 },

                //{ "id": "sub2", "parentid": "root", "topic": "sub2" },

                //{ "id": "1", "parentid": "root", "topic": "<span onclick='treeMethod.addChild(\"1\",\"region\")'>sub3</span>" }
            ]
        };

        treeMethod.addRoot();
    },
    //添加根节点
    addRoot: function () {
        treeMethod.getData("", treeMethod.curSettings.levels[0]);
        treeMethod.curSettings.data[0].initedItem = "";//下一级也需要重新加载

        var rootName = treeMethod.curSettings.rootName;
        var dataSource = treeMethod.curSettings.data[0].dataSource;

        var meaIdx = 1;
        var unit = "";
        $.each(dataSource.colnames, function (c, colname) {
            if (colname.indexOf(treeMethod.curSettings.measure.name) > -1) {
                meaIdx = c;
                unit = treeMethod.getUnit(colname);
            }
        });

        if (dataSource.rows.length > 0) {
            var tmpColor = treeMethod.getColorInPieces(treeMethod.curSettings.pieces, dataSource.rows[0]["col" + meaIdx]);

            var tmpTooltip = "";
            for (var j = 0; j < dataSource.colnames.length; j++) {
                tmpTooltip += (dataSource.colnames[j] + "：" + dataSource.rows[0]["col" + j] + "<br/>");
            }

            treeMethod.mind.data.push({ "id": rootName, "isroot": true, "topic": "<span id='" + rootName + "' title='" + tmpTooltip + "' style='cursor:pointer;color:#ffffff;' onclick='treeMethod.addChild(\"" + rootName + "\",\"" + treeMethod.curSettings.data[1].name + "\")'>" + rootName + "：" + dataSource.rows[0]["col" + meaIdx] + " " + unit + "</span>" });

            var options = {
                container: treeMethod.curSettings.divId,
                editable: true,
                theme: 'clouds',
                mode: 'side',
                layout: {
                    hspace: 30// 节点之间的水平间距
                }
            }
            treeMethod._jm = jsMind.show(options, treeMethod.mind);

            $(document.getElementById(rootName)).parent().attr("style", $(document.getElementById(rootName)).parent().attr("style") + "background-color:" + tmpColor + ";");

            if (treeMethod.curSettings.initDeep == 2) {
                treeMethod.addChild(rootName, treeMethod.curSettings.data[1].name);
            }
        }
        else {
            alert("当前时间数据为空");
            return;
        }
    },
    //添加子节点
    addChild: function (parentID, level) {
        var tmpTooltip = "";
        var tmpColor = "";

        var cur = treeMethod.findInObjArr(treeMethod.curSettings.data, "name", level);
        var curIdx = cur.index;
        var curItem = cur.item;

        //防止名称有重复的
        var realParentID = parentID;
        if (parentID.indexOf(treeMethod.curSettings.separator) > -1) {
            realParentID = parentID.substr(parentID.indexOf(treeMethod.curSettings.separator) + 1);
        }
        treeMethod.getData(realParentID, level);

        if (curItem.dataSource.rows <= 0) {
            alert('此结点无下级数据！');
        }
        else {
            var meaIdx = 1;
            var unit = "";
            $.each(curItem.dataSource.colnames, function (c, colname) {
                if (colname.indexOf(treeMethod.curSettings.measure.name) > -1) {
                    meaIdx = c;
                    unit = treeMethod.getUnit(colname);
                }
            });

            var emptyNum = 0;//名称为空的子节点的个数

            var isLast = (curIdx == treeMethod.curSettings.data.length - 1);
            var clickStr = "";
            var childID = "";
            $.each(curItem.dataSource.rows, function (i, item) {
                if (dss.isNullOrEmpty(item.col0)) {
                    emptyNum++;
                }

                if (!dss.isNullOrEmpty(item.col0)) {
                    tmpColor = treeMethod.getColorInPieces(treeMethod.curSettings.pieces, item["col" + meaIdx]);

                    tmpTooltip = "";
                    for (var j = 0; j < curItem.dataSource.colnames.length; j++) {
                        tmpTooltip += (curItem.dataSource.colnames[j] + "：" + item["col" + j] + "<br/>");
                    }

                    childID = realParentID + treeMethod.curSettings.separator + item.col0;

                    if (isLast) {
                        clickStr = "alert(\"已是末级结点！\")";
                    }
                    else {
                        clickStr = "treeMethod.addChild(\"" + childID + "\",\"" + treeMethod.curSettings.data[curIdx + 1].name + "\")";
                    }

                    treeMethod._jm.add_node(parentID, childID, "<span id='" + childID + "' title='" + tmpTooltip + "' style='cursor:pointer;color:#ffffff;' onclick='" + clickStr + "'>" + item.col0 + "：" + item["col" + meaIdx] + " " + unit + "</span>");

                    $(document.getElementById(childID)).parent().attr("style", $(document.getElementById(childID)).parent().attr("style") + "background-color:" + tmpColor + ";");
                }
            });

            if (emptyNum > 0) {
                alert(emptyNum + " 个子节点的名称为空值！");
            }
        }
    },
    getData: function (parentID, levelName) {
        var parentLevel = treeMethod.getArrIdx(treeMethod.curSettings.levels, levelName) > 0 ? treeMethod.curSettings.levels[treeMethod.getArrIdx(treeMethod.curSettings.levels, levelName) - 1] : "";//父节点的粒度名称

        var conOpt = {
            Type: "getSource",
            Flag: "JiaKuan",//家宽
            Time: treeMethod.curSettings.time,
            LevelName: levelName,
            TemplateID: treeMethod.curSettings.templateId,
            Property1: parentLevel,
            Property2: parentID,//父节点的值
            SortName: treeMethod.curSettings.measure.name,
            Sort: treeMethod.curSettings.measure.sort,
            TopN: treeMethod.curSettings.topN
        };

        $.ajax({
            url: dss.rootPath + "javascript/JSControl/SampleChart/Handler/TreeChart.ashx",
            data: {
                strCon: dss.jsonToString(conOpt)
            },
            cache: false,
            async: false,
            beforeSend: function () {
                dss.load(true);
            },
            complete: function () {
                dss.load(false);
            },
            dataType: "json",
            success: function (data) {
                var curIdx = treeMethod.findInObjArr(treeMethod.curSettings.data, "name", levelName).index;

                if (curIdx > 0) {
                    treeMethod.curSettings.data[curIdx - 1].initedItem += ("," + parentID);
                }
                treeMethod.curSettings.data[curIdx].dataSource = data;
            },
            error: function (a, b) {
                alert(a + b);
            }
        });
    },
    //判断当前值在哪个区间，返回对应的颜色
    getColorInPieces: function (pieces, value) {
        var color = "";

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

        return color;
    },
    getUnit: function (colname) {
        return colname.substr(colname.indexOf("（") + 1, colname.indexOf("）") - colname.indexOf("（") - 1);
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
    }
};