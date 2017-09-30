var initConstant = {
    analyst: 'ashx/Analyst.ashx',
    rowdDim: '',
    meaId: '',
    conditionManager: null,
    Analyzer: ''
};
var queryCondition = {
    Measure: '',
    getTimeStr: '',
    getHourStr: '',
    getTimeType: '',
    Condition: '',
    Type: "QueryCsv",
    DateInterval: '',
    Chart: ''
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
        $("input[type='checkbox']").change(function () {
            initMethod.setCondition();
            initMethod.queryChart();
        });
        $("input[type='radio']").change(function () {
            initMethod.setCondition();
            initMethod.queryChart();
        })
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
        obj["timeTypeSelectedChange"] = function () {
            initMethod.initCheck();
        }
        $("#txtStartDate").timepicker(obj);
        initMethod.initCheck();
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
        initMethod.queryList();
    },
    setCondition: function () {
        queryCondition.getHourStr = $("#txtStartDate").timepicker("getHourStr");
        queryCondition.getTimeStr = $("#txtStartDate").timepicker("getDateStr");
        queryCondition.getTimeType = $("#txtStartDate").timepicker("getTimeType");
        queryCondition.Measure = initMethod.getMeaList();
        queryCondition.Condition = JSON.stringify(initConstant.conditionManager.getSelectedCondition());
        queryCondition.DateInterval = initMethod.getInterval();
        queryCondition.Chart = initMethod.getSize();
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
    queryList: function () {
        queryCondition.Type = "QueryCsv";
        $.ajax({
            url: initConstant.analyst,
            data: queryCondition,
            beforeSend: function () {
                $("#divLoadingStatus").show();
            },
            complete: function () {
            },
            type: "post",
            dataType: "json",

            success: function (data) {
                initMethod.bindGrid(data, "gridDrill");
                initConstant.Analyzer = data;
            }
        })
    },
    queryChart: function () {
        queryCondition.Type = "Chart";
        $.ajax({
            url: initConstant.analyst,
            data: queryCondition,
            beforeSend: function () { },
            type: "post",
            dataType: "json",
            beforeSend: function () {
                $("#divLoadingStatus").show();
            },
            complete: function () {
                $("#divLoadingStatus").hide();
            },
            success: function (data) {
                initMethod.setChart(data);
            }

        })
    },
    getInterval: function () {
        var str = "";
        var $txt = $("#txtStartDate");
        if ($txt.timepicker("getTimeType") == "Day") {
            var val = $('input:radio[name="Day"]:checked').val();
            str += "日:" + val;
        }
        else if ($txt.timepicker("getTimeType") == "Week") {
            str += "月:12";
        }
        else if ($txt.timepicker("getTimeType") == "Month") {
            str += "月:12";
        }
        else {
            str += "时:24";
        }
        return str;
    },
    getSize: function () {
        var str = "";
        if ($("#txtStartDate").timepicker("getTimeType") == "Day") {
            $('input:checkbox:checked[name="cbDay"]').each(function () {
                str += $(this).val() + ",";
            })
        }
        else if ($("#txtStartDate").timepicker("getTimeType") == "Month") {
            $('input:checkbox:checked[name="cbMonth"]').each(function () {
                str += $(this).val() + ",";
            })
        }
        else if ($("#txtStartDate").timepicker("getTimeType") == "Week") {
            $('input:checkbox:checked[name="cbWeek"]').each(function () {
                str += $(this).val() + ",";
            })
        }
        else {
            $('input:checkbox:checked[name="cbHour"]').each(function () {
                str += $(this).val() + ",";
            })
        }
        if (str.indexOf(',') > 0) {
            str = str.substr(0, str.length - 1);
        }
        return str;
    },
    initCheck: function () {
        if ($("#txtStartDate").timepicker("getTimeType") == "Day") {
            $("#tdWeek").css("display", "block");
            $("#tdMonth").css("display", "block");
        }
        else {
            $("#tdWeek").css("display", "none");
            $("#tdMonth").css("display", "none");
        }
        $("#divWeek").css("display", $("#txtStartDate").timepicker("getTimeType") == "Week" ? "block" : "none");
        $("#divMonth").css("display", $("#txtStartDate").timepicker("getTimeType") == "Month" ? "block" : "none");
        $("#divDay").css("display", $("#txtStartDate").timepicker("getTimeType") == "Day" ? "block" : "none");
        $("#divHour").css("display", $("#txtStartDate").timepicker("getTimeType") == "Hour" ? "block" : "none");
    },
    bindGrid: function (datasource, div) {
        opts = {
            captionName: "同环比分析详细信息",
            showrownum: false,
            pagingId: "pager",
            analyzer: datasource,
            callback: {
                gridComplete: initMethod.gridComplete,
                onClickRow: initMethod.onSelectRow
            }
        };
        jQuery("#" + div).smartgrid(opts);
    },
    gridComplete: function (objGrid) {
        var str = "[";
        if (initConstant.Analyzer.RowDimList != null && initConstant.Analyzer.RowDimList.length > 0) {
            for (var i = 0; i < initConstant.Analyzer.RowDimList.length; i++) {
                str += "{\"key\":\"" + initConstant.Analyzer.RowDimList[i].LevelName + "\",\"dimid\":\"\",\"Ids\":\"\",\"values\":\"" + objGrid.getCell(1, i) + "\"}";
                if (i < initConstant.Analyzer.RowDimList.length - 1) {
                    str += ",";
                }
            }
        }
        str += "]";
        initMethod.setCondition();
        queryCondition.Condition = str;
        initMethod.queryChart();
    },
    onSelectRow: function (rowid, rowData) {
        var str = "[";
        if (initConstant.Analyzer.RowDimList != null && initConstant.Analyzer.RowDimList.length > 0) {
            for (var i = 0; i < initConstant.Analyzer.RowDimList.length; i++) {
                str += "{\"key\":\"" + initConstant.Analyzer.RowDimList[i].LevelName + "\",\"dimid\":\"\",\"Ids\":\"\",\"values\":\"" + rowData[i] + "\"}";
                if (i < initConstant.Analyzer.RowDimList.length - 1) {
                    str += ",";
                }
            }
        }
        str += "]";
        initMethod.setCondition();
        queryCondition.Condition = str;
        initMethod.queryChart();
        return false;
    },
    setChart: function (obj) {
        var n = 0;
        var type = $("#txtStartDate").timepicker("getTimeType");
        if (type == "Month" || type == "Day" || type == "Week") {
            n = 1;
        }
        else if (type == "Hour") {
            n = 2;
        }
        else {
            n = 3;
        }
        var y = '';
        for (var i = n; i < obj.colnames.length; i++) {
            y += i;
            if (i < obj.colnames.length - 1) {
                y += ",";
            }
        }
        for (var i = 0; i < obj.rows.length; i++) {
            if (obj.rows[i]["col0"].indexOf("年") > 0) {
                obj.rows[i]["col0"] = obj.rows[i]["col0"].substring(5);
            }
        }
        var options5 = {
            Width: '100%',
            Height: '300',
            DataSource: obj,
            Title: "",
            ChartType: 'Line',
            XLabelStyle: 'Stagger',
            YFormatType: '1000',
            XLabelStep: 2,
            IsAutoLimits: true,
            YDataColIndex: y
        };
        var chart = jQuery("#divChart").SampleChart(options5);
    }
}