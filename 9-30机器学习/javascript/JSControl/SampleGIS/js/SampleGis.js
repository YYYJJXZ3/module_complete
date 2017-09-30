/***************************************************************************
* jQuery SampleGis 1.1.0
* Copyright 2016 BocoDss
* UpdateTime 2017-02-12
* Depends:
*      jquery-1.9.1.min.js
*      

****************************************************************************/
(function ($) {
    //公共变量
    var cPrm = {
        //“usedPlugin”表示基于的图形插件，比如ArcGis，此处可统一切换；如果设为“ByChartType”，则依据getChartType方法中指定的
        usedPlugin: "ArcGis",
        chartType: "bar",
        geoCoord: {}
    };

    //防止报“console未定义”的错误
    window.console = window.console || (function () {
        var c = {}; c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile
        = c.clear = c.exception = c.trace = c.assert = function () { };
        return c;
    })();

    extendString();

    //入口
    $.fn.SampleGis = function (options) {
        var This = $(this);

        //数据源类型
        var dataSourceType = "";
        if ((options.DataSource != undefined && typeof options.DataSource == 'object') || ((options.ChartType == 'gauge' || options.ChartType == 'GaugeMore') && !isNullOrEmpty(options.GaugeValue))) {
            dataSourceType = "DataSource";//数据源为DataSource（仪表盘除外）
        }
        else if (options.CommonValue && options.CommonValue.length > 0) {
            dataSourceType = "CommonValue";
        }
        else {
            dataSourceType = "Analyzer";//数据源为analyzer
        }

        if (dataSourceType == "DataSource" || dataSourceType == "CommonValue") {
            BindChart(options, This);
        }
        else if (dataSourceType == "Analyzer") {
            var url = dss.rootPath + "javascript/JSControl/SampleGis/Handler/jqEchart.ashx";
            if (options.Url && typeof options.Url == 'string' && options.Url.length > 0) {
                url = options.Url;
            }

            $.ajax({
                url: url,
                data: {
                    strAnalyzer: dss.jsonToString(options.analyzer),
                    timekey: "",
                    listid: dss.request("listid")
                },
                beforeSend: function () {
                    dss.load(true);
                },
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    if (data.status == 0) {
                        var binddata = eval('(' + data.data.Source + ')');
                        options.DataSource = binddata;
                        options.analyzer = eval('(' + data.data.ReturnParam + ')');
                        BindChart(options, This);
                    }
                    else {
                        console.log(datasource.data);
                    }
                    dss.load(false);
                }
            });
        }
    }

    //默认的options属性
    $.fn.SampleGis.defaults = {
        Event: {
            LegendSelected: null,//图例的点击事件
            MapSelected: null//地图的选择事件
        },

        callback: {
            autoAddData: null,
            complete: null
        },

        //调用插件的原生属性，个别场景用到，非通用，不设置则按默认，不会报错
        Original: {}
    };

    //用插件渲染图形
    function BindChart(options, This) {
        options = $.extend(true, {}, defaultOpt, options);

        //为兼容以前的FusionCharts中div未指定宽度和高度，则用Width、和Height属性
        if (isNullOrEmpty(This[0].offsetWidth) || parseInt(This[0].offsetWidth) < 3) {
            $("#" + This[0].id).css("width", options.Width);
        }
        if (isNullOrEmpty(This[0].offsetHeight) || parseInt(This[0].offsetHeight) < 3) {
            $("#" + This[0].id).css("height", options.Height);
        }
        options.DivWidth = This[0].offsetWidth;//当前div的高度
        options.DivHeight = This[0].offsetHeight;//当前div的高度
        

        //#region ==============渲染图形============== begin

        if (cPrm.usedPlugin == "echarts2") {
            //得到Echarts的options
            var eOptions = $.extend(true, echartDefaults(options), adaptEcharts2(options));

            //引入echarts.js文件，以前项目不用在页面增加对echarts.js文件的引入
            $.ajax({
                url: dss.rootPath + "javascript/JSControl/SampleGis/Scripts/echarts/echarts.js",
                dataType: "script",
                cache: true,
                success: function (content, status) {
                    if (status == "success") {

                    }
                },
                error: function (a, b, c) {

                }
            });
        }

        //#endregion ==============渲染图形============== end
    }

    //Echarts的默认options
    function echartDefaults(options) {
        return {

        };
    }

    //将字符串转化成数值
    function toFloat(p) {
        if (p == undefined || p == "" || p == null) {
            return 0;
        }
        else {
            return parseFloat(p);
        }
    }

    //扩展String的方法
    function extendString() {
        String.prototype.replaceAll = function (s1, s2) {
            return this.replace(new RegExp(s1, "gm"), s2);
        }
        String.prototype.contains = function (str) {
            return this.indexOf(str) > -1;
        }
        String.prototype.trimEnd = function (str) {
            return this.substr(0, this.length - str.length);
        }
    }

})(jQuery);