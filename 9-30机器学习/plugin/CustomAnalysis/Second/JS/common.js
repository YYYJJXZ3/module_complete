Array.prototype.indexOf = function (key) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == key) {
            return i;
        }
    }
    return -1;
}
var init = {
    init: function (callback) {
        var s = decodeURI(dss.request("rowdim"));
        var measureList = dss.request("meaid");
        var levelname = decodeURI(dss.request("levelname"));
        dss.ajax({
            url: "ashx/Analyst.ashx",
            type: 'post',
            data: {
                Measure: measureList,
                Dimeasion: s
            },
            success: function (data) {
                $("#txtTime").timepicker(data.DateInit);
                init.bindDimension(data.ConditionList);
                init.bindMeasure(data.MeaList, data.MeaID);
                init.getDimension(data.ConditionList);
            },
            complete: function () {
                if (callback != null && typeof callback == 'function') {
                    callback(levelname);
                }
            },
            error: function () {
            }
        });
    },
    bindDimension: function (data) {
        var options = {
            showTopSelectControl: true,
            items: data,
            dependencyOptions: '',
            onTopSelectControlChanged: ""
        };
        queryCondition.conditionManager = $("#multipleSelectControl").createConditionManager(options);
    },
    bindMeasure: function (data, id) {
        var sel;
        if (data.length > 0) {
            sel = data[0];
            $.each(data, function (i, item) {
                if (item.id == id) {
                    sel = item;
                }
            });
        }
        $("#txtMeasure").commonSelect({
            initClass: "commdata",
            initValues: [sel],
            datasource: data,
            selectmode: "multiple", //single    multiple
            filterValue: [],
            fuzzyValue: "",
            zIndex: 12
        });
    },
    getDimension: function (data) {
        var result = [];
        if (data != undefined) {
            $.each(data, function (i, item) {
                $.each(item.levels, function (index, target) {
                    var list = [];
                    if (target.selected != undefined) {
                        for (var j = 0; j < target.selected.length; j++) {
                            list.push(target.selected[j].name);
                        }
                    }
                    result.push({
                        "DimensionID": item.dimid,
                        "DimensionName": item.dimension,
                        "HierarchyName": "",
                        "LevelName": target.level,
                        "DimensionType": 0,
                        "ValType": 1,
                        "Val": "",
                        "ValList": list
                    });
                });
            });
        }
        else {
            data = queryCondition.conditionManager.getSelectedCondition();
            if (data.length > 0) {
                $.each(data, function (i, item) {
                    result.push({
                        "DimensionID": item.dimid,
                        "DimensionName": "",
                        "HierarchyName": "",
                        "LevelName": item.key,
                        "DimensionType": 0,
                        "ValType": 1,
                        "Val": "",
                        "ValList": item.values.split(',')
                    });
                });
            }
        }
        $("#btnQuery").data("dataCondition", result);
    },
    bindGrid: function (datasource, div, funback) {
        opts = {
            captionName: "",
            showrownum: false,
            pagingId: "pager",
            analyzer: datasource,
            callback: {
                gridComplete: function (obj, opts) {
                    if (funback != null && typeof funback == 'function') {
                        funback(obj, opts);
                    }
                }
            }
        }
        dss.smartgrid(div, opts);
    }
};