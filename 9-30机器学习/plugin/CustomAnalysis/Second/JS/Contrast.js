var initConstant = {
    trend: 'ashx/Contrast.ashx',
    analyst: 'ashx/Analyst.ashx',
    rowdDim: '',
    meaId: '',
    conditionManager: null,
    Analyzer: '',
    dataPath: '../../../Javascript/JSControl/SmartGrid/Handler/jqGriddata.ashx'
};
var queryCondition = {
    meaID: '',
    getTimeStr: '',
    getHourStr: '',
    getTimeType: '',
    Condition: '',
    Type: "QueryCsv"
};
$(function () {
    initMethod.init();
});
var initMethod = {
    init: function () {
        initConstant.rowdDim = decodeURI($requestHelper.queryString("rowdim"));
        initConstant.meaId = $requestHelper.queryString("meaid");
        initMethod.initData(initConstant.meaId, initConstant.rowdDim);
        $("#btnQuery").click(function () {
            initMethod.setCondition();
            initMethod.queryData();
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
                $("#divLoadingStatus").hide();
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
            multiple: false,
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
        queryCondition.Type = "Query";
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
                initMethod.bindGrid(data, initMethod.thisonPage, "list");
                initConstant.Analyzer = data;
            },
            error: function () {
            }
        });
    },
    setCondition: function () {
        queryCondition.getHourStr = $("#txtStartDate").timepicker("getHourStr");
        queryCondition.getTimeStr = $("#txtStartDate").timepicker("getDateStr");
        queryCondition.getTimeType = $("#txtStartDate").timepicker("getTimeType");
        queryCondition.meaID = initMethod.getMeaList();
        queryCondition.Condition = JSON.stringify(initConstant.conditionManager.getSelectedCondition());
    },
    getMeaList: function () {
        return $("#ddlMea").mulselect("getSelects", "ID").join(',');
    },
    getInitCondition: function (data) {
        var str = "[";
        $.each(data, function (i, val) {
            $.each(val.levels, function (j, kl) {
                var nstr = '';
                if (kl.selected != null) {
                    $.each(kl.selected, function (k, av) {
                        nstr += av.name;
                        if (k < kl.selected.length - 1) {
                            nstr += ',';
                        }
                    });
                }
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
    thisonPage: function (grid) {
        var a = jQuery("#list").smartgrid("getDatasource");
        var col;
        var row;
        var colNum = a.colnames.length;
        col = [a.colnames[colNum - 2], a.colnames[colNum - 1]];
        row = a.rows;
        var str = "[";
        $.each(a.rows, function (i, val) {
            var temp = '';
            for (var j = 0; j < colNum - 1; j++) {
                temp += a.rows[i]["col" + j];
                if (j < colNum - 2) {
                    temp += "-";
                }
            }
            str += "{\"col0\":\"" + temp + "\",\"col1\":\"" + a.rows[i]["col" + (colNum - 1)] + "\"}";
            if (i < a.rows.length - 1) {
                str += ",";
            }
        })
        str += "]";
        row = initMethod.changeJson(str);


        var opt = { colnames: col, rows: row };
        initMethod.queryChart(opt);
        $("#divLoadingStatus").hide();
    },
    queryChart: function (datasource) {
        var options5 = {
            Width: '100%',
            Height: '300',
            DataSource: datasource,
            Title: "",
            ChartType: 'Column',
            XLabelStyle: 'Rotate',
            YFormatType: '1000',
            IsAutoLimits: true
        };
        var chart = jQuery("#divChart").SampleChart(options5);

    },
    bindGrid: function (datasource, thisonPage, div) {
        opts = {
            captionName: "对比分析详细信息",
            showrownum: false,
            pagingId: "pager",
            analyzer: datasource,
            callback: {
                gridComplete: thisonPage
            }
        };
        jQuery("#" + div).smartgrid(opts);
    }
}