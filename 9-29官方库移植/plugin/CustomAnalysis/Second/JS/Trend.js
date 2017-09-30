var initConstant = {
    trend: 'ashx/Trend.ashx',
    analyst: 'ashx/Analyst.ashx',
    rowdDim: '',
    meaId: '',
    conditionManager: null,
    Analyzer: ''
};
var queryCondition = {
    meaID: '',
    getTimeStr: '',
    getHourStr: '',
    getTimeType: '',
    Condition: '',
    Type: "QueryCsv"
}
$(function () {
    initMethod.init();
})
var initMethod = {
    init: function () {
        initConstant.rowdDim = decodeURI($requestHelper.queryString("rowdim"));
        initConstant.meaId = $requestHelper.queryString("meaid");
        initMethod.initData(initConstant.meaId, initConstant.rowdDim);
        $("#btnQuery").click(function () {
            if (initMethod.setCondition()) {
                initMethod.queryData();
            }
            else {
                Show.alert("选择指标或者网元不能超过两个！");
            }
        });
        $("#btnExport").click(function () {
            analyzerCsvExport(initConstant.Analyzer);
        });
    },
    initData: function (measureList, rowDimeasion) {
        $.ajax({
            url: initConstant.analyst,
            type: 'post',
            async: false,
            dataType: 'json',
            data: {
                Measure: measureList,
                Dimeasion: rowDimeasion,
                Type: "Init"
            },
            beforeSend: function () {
                $("#divLoadingStatus").show();
            },
            complete: function () {
                initMethod.queryData();
            },
            success: function (data) {
                initMethod.initDate(data.DateInit);
                var obj = initMethod.changeJson(data.ConditionList);
                initMethod.bindDimension(obj);
                initMethod.bindMeasure(data.MeaList, data.MeaID);
                initMethod.setCondition();
                queryCondition.Condition = initMethod.getInitCondition(obj);
            },
            error: function () {
            }
        });

    },
    initDate: function (data) {
        var obj = initMethod.changeJson(data);
        $("#txtStartDate").timepicker(obj);
    },
    bindMeasure: function (data, _default) {
        var arr = [];
        arr.push(_default);
        var obj = {
            colnames: null,
            rows: null
        };
        obj.colnames = ['地区ID', '地区'];
        obj.rows = initMethod.changeJson(data);
        $("#ddlMea").mulselect({
            multiple: true,
            datastr: obj,
            selectedvalues: arr
        });
    },
    changeJson: function (v) {
        if (v == "") {
            return v;
        }
        return eval("(" + v + ")");
    },
    bindDimension: function (data) {
        var options = {
            showTopSelectControl: true,
            items: data,
            dependencyOptions: '',
            onTopSelectControlChanged: ""
        };
        initConstant.conditionManager = $("#multipleSelectControl").createConditionManager(options);
    },
    queryData: function () {
        initMethod.queryList();
    },
    getDate: function () {
        if ($("#txtStartDate").timepicker("getTimeType") == "Hour") {
            return $("#txtStartDate").timepicker("getDateStr") + $("#txtStartDate").timepicker("getHourStr");
        }
        else {
            return $("#txtStartDate").timepicker("getDateStr");
        }
    },
    getMeaList: function () {
        return $("#ddlMea").mulselect("getSelects", "ID").join(',');
    },
    getInitCondition: function (data) {
        var str = "[";
        $.each(data, function (i, val) {
            $.each(val.levels, function (j, kl) {
                var nstr = '';
                $.each(kl.selected, function (k, av) {
                    nstr += av.name;
                    if (k < kl.selected.length - 1) {
                        nstr += ',';
                    }
                });
                str += "{\"key\":\"" + kl.level + "\",\"dimid\":\"\",\"Ids\":\"\",\"values\":\"" + nstr + "\"}";
                if (j < val.levels.length - 1) {
                    str += ",";
                }
            })
            if (i < data.length - 1) {
                str += ",";
            }
        })
        str += "]";
        return str;
    },
    setCondition: function () {
        var obj = initConstant.conditionManager.getSelectedCondition();
        var str = "[";
        var flag = true;
        $.each(obj, function (i, val) {
            if (val.values.split(',').length > 2) {
                flag = false;
                return;
            }
            if (val.values != "全部") {
                str += "{\"key\":\"" + val.key + "\",\"dimid\":\"\",\"Ids\":\"\",\"values\":\"" + val.values + "\"},";
            }
        });
        if (str.length > 1) {
            str = str.substring(0, str.length - 1);
        }
        str += "]";
        queryCondition.getHourStr = $("#txtStartDate").timepicker("getHourStr");
        queryCondition.getTimeStr = $("#txtStartDate").timepicker("getDateStr");
        queryCondition.getTimeType = $("#txtStartDate").timepicker("getTimeType");
        queryCondition.meaID = initMethod.getMeaList();
        if (initMethod.getMeaList().split(',').length > 2) {
            flag = false;
        }
        queryCondition.Condition = str;
        return flag;
    },
    queryChart: function () {
        queryCondition.Type = "Query";
        $.ajax({
            url: initConstant.trend,
            type: 'post',
            dataType: 'json',
            data: queryCondition,
            complete: function () {
                $("#divLoadingStatus").hide();
            },
            beforeSend: function () {
                $("#divLoadingStatus").show();
            },
            success: function (data) {
                //initMethod.setChart(data.ChartList, "divChart");
            }
        });
    },
    queryList: function () {
        queryCondition.Type = "QueryCsv";
        $.ajax({
            url: initConstant.trend,
            type: 'post',
            dataType: 'json',
            data: queryCondition,
            complete: function () {
            },
            beforeSend: function () {
                $("#divLoadingStatus").show();
            },
            success: function (data) {
                initMethod.bindGrid(data, "list");
                initConstant.Analyzer = data;
            }
        });
    },
    bindGrid: function (datasource, div) {
        opts = {
            captionName: "对比分析详细信息",
            showrownum: false,
            pagingId: "pager",
            analyzer: datasource,
            callback: {
                gridComplete: initMethod.gridComplete
            }
        };
        jQuery("#" + div).smartgrid(opts);
    },
    gridComplete: function (obj, opts) {
        var a = jQuery("#list").smartgrid("getDatasource");
        var col;
        var row = [];;
        var colNum = a.colnames.length;
        col = [];
        //[-]		RowDimList	[[object Object],[object Object]]	Object, (Array)
        var meaLenght = initConstant.Analyzer.RowDimList.length;
        for (var i = meaLenght - 1; i < colNum; i++) {
            var y = opts.orgData.colNames[i];
            if (y.indexOf("|||") > 0) {
                y = y.replace("|||", "-");
            }
            col.push(y);
        }
        $.each(a.rows, function (i, val) {
            var temp = '';
            for (var j = 0; j < meaLenght; j++) {
                var t = a.rows[i]["col" + j];
                if (t.indexOf("年") > 0) {
                    t = t.substring(5);
                }
                temp += t;
                if (j < meaLenght - 1) {
                    temp += "-";
                }
            }
            var tempArr = {};
            for (var j = 0; j < col.length; j++) {
                if (j == 0) {
                    tempArr["col" + j] = temp;
                }
                else {
                    var y = a.rows[i]["col" + (meaLenght - 1 + j)];
                    tempArr["col" + j] = y;
                }
            }
            row.push(tempArr);
        });
        var opt = { colnames: col, rows: row };
        initMethod.setChart(opt, "divChart");
    },
    setChart: function (datasource, div) {
        var options5 = {
            Width: '100%',
            Height: '300',
            DataSource: datasource,
            Title: "",
            ChartType: 'Line',
            XLabelStyle: 'Stagger',
            YFormatType: '1000',
            IsAutoLimits: true
        };
        var chart = jQuery("#" + div).SampleChart(options5);
        $("#divLoadingStatus").hide();
    }
};