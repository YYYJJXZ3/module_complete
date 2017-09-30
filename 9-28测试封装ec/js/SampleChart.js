/***************************************************************************
* jQuery SampleChart 2.3.0
* Copyright 2016 BocoDss
* UpdateTime 2017-07-25
* Depends:
*      jquery-1.9.1.min.js
*      Echarts 2.2.7
*      Echarts 3.3.2
****************************************************************************/
(function ($) {
    //公共变量
    var cPrm = {
        //“chartPlugin”表示基于的图形插件，比如echarts2、echarts3、hcharts，此处可统一切换；如果设为“ByChartType”，则依据getChartType方法中指定的
        //也可以用options.ChartPlugin在页面上指定用哪个插件
        //注意：同一个页面只能用同一个版本，因为同时加载Echarts2和Echarts3会有冲突
        chartPlugin: "echarts3",
        frameType: "java",//框架类型，.net或java，数据格式不同
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
    $.fn.SampleChart = function (options) {
        var This = $(this);
        This.empty();

        if (!isNullOrEmpty(options) && !isNullOrEmpty(options.ChartPlugin)) {
            cPrm.chartPlugin = options.ChartPlugin;
        }
        if (!isNullOrEmpty(options) && !isNullOrEmpty(options.FrameType)) {
            cPrm.frameType = options.FrameType;
        }

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
            var url = dss.rootPath + "javascript/JSControl/SampleChart/Handler/jqEchart.ashx";
            if (options.Url && typeof options.Url == 'string' && options.Url.length > 0) {
                url = options.Url;
            }

            if (cPrm.frameType == "java") {
                $.ajax({
                    url: url,
                    data: {
                        strAnalyzer: dss.jsonToString(options.analyzer),
                        listid: dss.request("listid")
                    },
                    type: 'post',
                    dataType: 'json',
                    success: function (data) {
                        if (data.status == 0) {
                            options.DataSource = data.data.dataSource;
                            options.analyzer = data.data.returnParam;
                            BindChart(options, This);
                        }
                        dss.load(false);
                    }
                });
            }
            else {
                $.ajax({
                    url: url,
                    data: {
                        one: dss.jsonToString(options.analyzer),
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
                            console.log(data.data);
                        }
                        dss.load(false);
                    }
                });
            }
        }
    }

    //默认的options属性
    $.fn.SampleChart.defaults = {
        ChartPlugin: "",//基于的图形插件，比如echarts2、echarts3、hcharts
        FrameType: "",//框架类型，.net或java，数据格式不同

        Width: "100%",
        Height: "260px",
        Title: "",
        SubTitle: "",
        XTitle: "",
        YTitle: "",
        Y2Title: "",
        analyzer: null,
        ChartType: "Column",
        SubChartType: [],
        XDataColName: "",
        XDataColIndex: "",
        YDataColName: "",
        YDataColIndex: "",
        Y2DataColName: "",
        Y2DataColIndex: "",
        YFormatType: "",
        YNumberPrefix: "",
        YDecimals: 1,
        Y2FormatType: "",
        Y2NumberPrefix: "",
        Y2Decimals: 1,
        BgColor: '',
        BorderColor: '#cccccc',
        XLabelStyle: "Wrap",//“Wrap（换行）”“Stagger（交错）”“Rotate（旋转）”“Vertical（垂直）”或空，空表示不处理
        XLabelStep: 1,
        Is2D: false,
        IsFlash: true,
        IsAutoLimits: false,
        IsShowLimits: false,
        IsShowValue: null,
        IsShowPercentValue: false,
        IsShowLegend: null,
        IsShowLabel: true,//是否显示X轴，饼图中是否显示指标名指示
        IsMarginEnd: false,
        IsLabelInPer: false, //显示百分比数据； 此属性不要再用，换成；IsShowPercentValue
        //ColorArr: new Array("66B3FF", "FFCC00", "458B00", "8968CD", "0372AB", "EEEE00", "9AFF9A", "008B00", "836FFF", "FF3030"),
        ColorArr: [],//可以手动指定图例、指标的颜色，覆盖主题色系
        LegendPosition: "BOTTOM",//比如：RIGHT、BOTTOM，Echarts扩展了后面的LEFT、TOP、LEFTTOP、LEFTBOTTOM、RIGHTTOP、RIGHTBOTTOM
        captionName: '',
        XAxisMinValue: '',
        XAxisMaxValue: '',

        //==========以下为20150330后改用echarts新增的属性==========

        CommonValue: [],//通用的属性，小众的属性就不再增加，直接用这个通用的，样例：[{k:"业务成功率",v:98},{k:"响应成功率",v:90}]

        Pieces: [],//分段信息（通用），等号在max上
        //Pieces: [
        //     { name: '<=80%', min: null, max: 80, color: '#FF7F50' },
        //     { name: '80%-90%', min: 80, max: 90, color: '#DA70D6' },
        //     { name: '90%-100%', min: 90, max: null, color: '#32CD32' }
        //],

        //工具条
        Toolbox: {
            show: false
        },

        IsSaveImg: false,//是否保存成图片
        ImgName: "",
        ImgPath: "",

        TitlePositionX: "center",//'center' | 'left' | 'right' 
        TitlePositionY: "top",//'top' | 'bottom' | 'center' 

        XIsTrim: false,//是否截取x轴坐标过长的值
        XTrimNum: 10,//x轴需要截取的长度
        LegendIsTrim: false,//是否截取图例过长的值
        LegendTrimNum: 10,//图例需要截取的长度

        LegendSelected: "",//需要显示的图例索引，优先级高于LegendNotSelected
        LegendNotSelected: "",//不需要显示的图例索引，用逗号隔开，比如“1,3”，指标过多的情况下，可以将某些指标先隐藏，表现为图例中对应的项为灰色，点击之后可恢复显示，暂不支持饼图

        LegendRowCount: 1,//图例的行数，图例为多行时显示不全，比如为3行时要调整legend的下padding才能显示全

        IsShowX: true,//是否显示X轴
        IsShowY: true,//是否显示Y轴
        IsShowY2: true,//是否显示Y2轴
        IsShowMaxMin: false,//是否用气泡显示最大最小值

        XUnit: "",//X轴的单位
        YUnit: "",//Y轴的单位
        Y2Unit: "",//Y2轴的单位

        YLabelStyle: "Wrap",
        YLabelStep: 1,
        Y2LabelStyle: "Wrap",
        Y2LabelStep: 1,

        YSplitNumber: null,//y轴坐标分割的段数
        Y2SplitNumber: null,//y2轴坐标分割的段数

        //主题
        Theme: 'lightblue',

        FontSize: 12,//字体的大小，包括坐标轴、图例的字体

        DivID: "",//当前div的ID
        DivWidth: 0,//当前div的宽度
        DivHeight: 100,//当前div的高度

        //堆叠柱形图或长条图专用
        IsAlign: false,//每层是否对齐

        //饼图专用
        LabelPosition: "outer",//项名称所在的位置，饼图可选为：'outer'（外部） | 'inner'（内部）


        //“雷达图”专用
        RadarMax: null,//数值型，各个方向上的最大值相同，比如得分100、百分比100，RadarMax、RadarMaxArray都指定则以RadarMaxArray为准
        RadarMaxArray: [],//每个方向上的最大值，样例数据:[{ text: '方向1', max: 80 },{ text: '方向2', max: 90 }]

        //饼图的一些特殊属性
        Pie: {
            radius: '48%',//半径
            center: ['50%', '45%'],//中心位置
            calculable: false//是否包含圆圈
        },

        //嵌套饼图内环
        Pie1: {
            radius: '45%',//半径
            center: ['50%', '50%']//中心位置
        },

        //嵌套饼图外环
        Pie2: {
            radius: ['60%', '85%'],//半径
            center: ['50%', '50%']//中心位置
        },

        //“仪表盘”专用
        GaugeValue: 0,
        GaugeName: '指标',
        GaugeSplitNumber: 10,//大刻度分割的段数
        GaugeColor: [],//分段变色，分隔值为比例值，示例：[[0.2, '#ff4500'], [0.8, '#48b'], [1, '#228b22']]，分隔值也可以为具体的数值，示例：[[20, '#ff4500'], [80, '#48b'], [100, '#228b22']]

        //“地图”专用
        IsMapExtend: false,//是否是地图扩展，比如区县级别的就是扩展的
        MapType: ['china'],
        MapRangeOrLegend: "",//各个区域的颜色是依据“范围”还是“图例”，图例可分段，“范围”用“range”，“图例”用“legend”
        MapRangeColor: ['#026FDD', '#DEFEFF'],//停用，以后改用下面Map中的属性！！！
        MapLegend: [],//图例信息，等号在max上，样例数据如下：
        //MapLegend: [
        //     { name: '<=80%', min: null, max: 80, color: '#FF7F50' },
        //     { name: '80%-90%', min: 80, max: 90, color: '#DA70D6' },
        //     { name: '90%-100%', min: 90, max: null, color: '#32CD32' }
        //],
        MapColor: "auto",//地图本身的颜色，停用，以后改用下面Map中的属性！！！

        Map: {//将地图专用的属性尽量都放到这里
            roam: false,//是否支持漫游，即缩放和拖动
            zoom: 1.1,//放大倍数
            center: [],//中心点的经纬度
            rangeColor: ['#026FDD', '#DEFEFF'],//范围图例的颜色，从大到小，可以是多个，比如：['#ff3333', 'orange', 'yellow', 'lime', 'aqua']，接替上面的MapRangeColor属性
            borderColor: "rgba(100,149,237,1)",//地区分界线的颜色
            areaColor: "auto"//地图本身的颜色，接替上面的MapColor属性
        },

        Line: [],//线，如：最大值、最小值、均值、阈值等，格式：[{colindex:1,type:'custom',name:'阈值',value:60},{colindex:2,type:'average',name:'均值'}]
        Stack: [],//堆叠分组，[{colindex:[1,2,3],name:'堆叠分组1'},{colindex:[4,5],name:'堆叠分组2'}]

        //图表padding
        PaddingLeft: null,//左边距
        PaddingRight: null,//右边距
        PaddingTop: null,//上边距
        PaddingBottom: null,//下边距

        IsScroll: false,//是否增加滚动条及缩放功能
        ScrollNum: 20,//超过多少开始出现滚动条
        ScrollStart: 0,//滚动条的起始值（百分比）
        ScrollEnd: 30,//滚动条的结束值（百分比）

        Event: {
            LegendSelected: null,//图例的点击事件
            MapSelected: null//地图的选择事件
        },

        callback: {
            autoAddData: null,
            complete: null
        },

        //调用插件的原生属性，个别场景用到，非通用，不设置则按默认，不会报错
        OriginalOption: {},//直接和最终的option融合
        Original: {}//无法和最终的option直接融合
    };

    //获取图形类型
    function getChartType(type, options) {
        var cType = "bar";
        var cPlugin = "echarts3";
        switch (type) {
            case "Column": cType = "bar"; cPlugin = "echarts3"; break;
            case "StackedColumn": cType = "bar"; cPlugin = "echarts3"; break;
            case "Bar": cType = "bar"; cPlugin = "echarts3"; break;
            case "StackedBar": cType = "bar"; cPlugin = "echarts3"; break;
            case "Combi1": cType = "bar"; cPlugin = "echarts3"; break;
            case "Combi2": cType = "bar"; cPlugin = "echarts3"; break;
            case "Combi3": cType = "bar"; cPlugin = "echarts3"; break;
            case "Combi1Y": cType = "bar"; cPlugin = "echarts3"; break;
            case "Combi2Y": cType = "bar"; cPlugin = "echarts3"; break;
            case "Combi3Y": cType = "bar"; cPlugin = "echarts3"; break;
            case "Line": cType = "line"; cPlugin = "echarts3"; break;
            case "Area": cType = "line"; cPlugin = "echarts3"; break;
            case "StackedArea": cType = "line"; cPlugin = "echarts3"; break;
            case "Pie": cType = "pie"; cPlugin = "echarts3"; break;
            case "Doughnut": cType = "pie"; cPlugin = "echarts3"; break;

            case "ScrollColumn": cType = "bar"; cPlugin = "echarts3"; break;
            case "ScrollStackedColumn": cType = "bar"; cPlugin = "echarts3"; break;
            case "ScrollLine": cType = "line"; cPlugin = "echarts3"; break;
            case "ScrollArea": cType = "line"; cPlugin = "echarts3"; break;

            case "Radar": cType = "radar"; cPlugin = "echarts2"; break;
            case "radar": cType = "radar"; cPlugin = "echarts2"; break;

                //Echarts新增的类型
            case "ColumnWaterfall": cType = "bar"; cPlugin = "echarts3"; break;//瀑布图
            case "ColumnRainbow": cType = "bar"; cPlugin = "echarts3"; break;//彩虹柱图
            case "PieRose": cType = "pie"; cPlugin = "echarts3"; break;//南丁格尔玫瑰图
            case "PieLayered": cType = "pie"; cPlugin = "echarts3"; break;//分层饼图
            case "PieDoughnut": cType = "PieDoughnut"; cPlugin = "echarts3"; break;//嵌套饼图
            case "PieOne": cType = "pie"; cPlugin = "echarts3"; break;//单指标的圆环图

            case "gauge": cType = "gauge"; cPlugin = "echarts3"; break;
            case "Gauge": cType = "gauge"; cPlugin = "echarts3"; break;
            case "GaugeMore": cType = "GaugeMore"; cPlugin = "echarts3"; break;
            case "Scatter": cType = "scatter"; cPlugin = "echarts3"; break;
            case "Bubble": cType = "scatter"; cPlugin = "echarts3"; break;
            case "RadarArea": cType = "radar"; cPlugin = "echarts2"; break;//雷达面积图

            case "map": cType = "map"; cPlugin = "echarts3"; break;
            case "Map": cType = "map"; cPlugin = "echarts3"; break;
            case "MapFlowOut": cType = "MapFlowOut"; cPlugin = "echarts3"; break;//流出型地图
            case "MapFlowIn": cType = "MapFlowIn"; cPlugin = "echarts3"; break;//流入型地图
            case "MapFlowOneOut": cType = "MapFlowOneOut"; cPlugin = "echarts3"; break;//单点流出型地图，图例表示颜色区间
            case "MapFlowOneIn": cType = "MapFlowOneIn"; cPlugin = "echarts3"; break;//流入单点型地图，图例表示颜色区间
            case "MapScatter": cType = "MapScatter"; cPlugin = "echarts2"; break;//打点地图
            case "MapTrace": cType = "MapTrace"; cPlugin = "echarts2"; break;//打点地图
            case "MapSign": cType = "MapSign"; cPlugin = "echarts3"; break;  //打点地图
            case "HeatMap": cType = "HeatMap"; cPlugin = "echarts3"; break;  //热力图

            default: type == "" ? cType = "bar" : cType = type; cPlugin = "echarts3"; break;
        }

        if (cPrm.chartPlugin == "ByChartType") {//不同图形类型选用不同的插件
            cPrm.chartPlugin = cPlugin;
        }

        return cType;
    }

    //用插件渲染图形
    function BindChart(options, This) {
        //#region ==============处理options============== begin

        //#region ==============健壮性：输入内容的调整============== begin
        //保证索引填写成数字或字符串都可以
        if (!isNullOrEmpty(options.XDataColIndex)) {
            options.XDataColIndex = options.XDataColIndex.toString();
        }
        else {
            options.XDataColIndex = "0";
        }
        if (!isNullOrEmpty(options.YDataColIndex)) {
            options.YDataColIndex = options.YDataColIndex.toString();
        }
        else {
            options.YDataColIndex = "1";
        }
        if (!isNullOrEmpty(options.Y2DataColIndex)) {
            options.Y2DataColIndex = options.Y2DataColIndex.toString();
        }

        //去掉边距中的“px”，转换成数值型
        if (typeof (options.PaddingLeft) == "string") {
            options.PaddingLeft = toFloat(options.PaddingLeft.replace("px", ""));
        }
        if (typeof (options.PaddingRight) == "string") {
            options.PaddingRight = toFloat(options.PaddingRight.replace("px", ""));
        }
        if (typeof (options.PaddingTop) == "string") {
            options.PaddingTop = toFloat(options.PaddingTop.replace("px", ""));
        }
        if (typeof (options.PaddingBottom) == "string") {
            options.PaddingBottom = toFloat(options.PaddingBottom.replace("px", ""));
        }
        //#endregion ==============健壮性：输入内容的调整============== end

        //#region ==============属性兼容性适配，用于用新属性替代老属性的情况============== begin
        if (!isNullOrEmpty(options.MapRangeColor)) {
            $.extend(true, options, { Map: { rangeColor: options.MapRangeColor } });
        }
        if (!isNullOrEmpty(options.MapColor)) {
            $.extend(true, options, { Map: { areaColor: options.MapColor } });
        }

        //java版本要进行数据格式转换
        var dsrc = options.DataSource;
        if (dsrc != null && dsrc.rows != null) {
            if (dsrc.colnames == null) {
                dsrc.colnames = dsrc.colNames;
            }
            for (var r = 0; r < dsrc.rows.length; r++) {
                if (dsrc.rows[r] != null && dsrc.rows[r].cells != null) {
                    for (var c = 0; c < dsrc.rows[r].cells.length; c++) {
                        dsrc.rows[r]["col" + c] = dsrc.rows[r].cells[c];
                    }
                }
            }
        }

        //#endregion ==============属性兼容性适配============== end

        //#region ==============属性初始化============== begin
        var defaultOpt = $.extend(true, {}, $.fn.SampleChart.defaults);

        if (options.ChartType == "PieOne") {
            defaultOpt.Pie.radius = ['55%', '70%'];
        }

        if (isNullOrEmpty(options.LegendPosition)) {
            options.LegendPosition = "BOTTOM";
        }

        //#region ==============边距============== begin
        if (isNullOrEmpty(options.PaddingLeft)) {
            options.PaddingLeft = 50;
        }
        if (isNullOrEmpty(options.PaddingRight)) {
            if (options.LegendPosition.indexOf("RIGHT") >= 0) {
                options.PaddingRight = 120;
            }
            else if (isNullOrEmpty(options.Y2DataColIndex)) {
                options.PaddingRight = 15;
            }
            else {
                options.PaddingRight = 50;
            }
        }
        if (isNullOrEmpty(options.PaddingTop)) {
            if (!isNullOrEmpty(options.Title)) {
                options.PaddingTop = 50;
            }
            else {
                options.PaddingTop = 25;
            }
        }
        //#endregion ==============边距============== end

        //#endregion ==============属性初始化============== end

        //统一属性，设置宽高等
        options = $.extend(true, {}, defaultOpt, options);

        //海南因为三沙的原因，导致地图偏移
        if (options.MapType == "海南") {
            $.extend(true, options.Map, {
                roam: true,
                zoom: 8,//放大倍数
                center: [109.7102330000, 19.1833700000]//中心点的经纬度
            });
        }

        //仪表盘、单指标圆环图不用DataSource时，将DataSource置空
        if (isNullOrEmpty(options.DataSource)) {
            options.DataSource = $.extend(true, options.DataSource, {
                colnames: [],
                rows: []
            });
        }

        //为兼容以前的FusionCharts中div未指定宽度和高度，则用Width、和Height属性
        if (isNullOrEmpty(This[0].offsetWidth) || parseInt(This[0].offsetWidth) < 3) {
            This.css("width", options.Width);
        }
        if (isNullOrEmpty(This[0].offsetHeight) || parseInt(This[0].offsetHeight) < 3) {
            This.css("height", options.Height);
        }
        options.DivWidth = This[0].offsetWidth;//当前div的高度
        options.DivHeight = This[0].offsetHeight;//当前div的高度

        options.DivID = This[0].id;
        options["targetid"] = This[0].id;

        //#endregion ==============处理options============== end


        //#region ==============处理下载============== begin

        var downDataSource = {
            sql: null,
            conn: null,
            source: null,
            analyzer: options.analyzer,
            titleName: "",
            SampleChartOption: {
                ChartType: options.ChartType,
                XDataColIndex: options.XDataColIndex,
                XDataColName: options.XDataColName,
                YDataColIndex: options.YDataColIndex,
                YDataColName: options.YDataColName,
                Y2DataColIndex: options.Y2DataColIndex,
                Y2DataColName: options.Y2DataColName,
                SubChartType: options.SubChartType == "" ? [] : options.SubChartType
            }
        };
        var optionNew = $.extend(true, {}, options); ///复制options，防止原来的options改变后影响
        if (cPrm.frameType == "java") {
            downDataSource.source = { colNames: optionNew.DataSource.colnames, rows: optionNew.DataSource.rows };
        }
        else {
            downDataSource.source = { colnames: optionNew.DataSource.colnames, rows: optionNew.DataSource.rows };
        }
        downDataSource.titleName = options.captionName;
        This.data("downDataSource", downDataSource);
        This.attr("downDataType", "down");
        options["DomID"] = This[0].id; //增加参数为了给外面追踪

        //#endregion ==============处理下载============== end


        //#region ==============渲染图形============== begin

        //未查到数据时显示“无数据”
        if ((isNullOrEmpty(options.DataSource) || isNullOrEmpty(options.DataSource.rows) || options.DataSource.rows.length <= 0) && (options.CommonValue && options.CommonValue.length == 0) && ((options.ChartType != "gauge" && options.ChartType != "GaugeMore") || options.GaugeName == "") && (options.ChartType != "map" && options.ChartType.indexOf("Map") < 0)) {
            This.html("<table><tr><td style='width:" + options.DivWidth + "px;height:" + options.DivHeight + "px;text-align:center;vertical-align:middle;'>无数据</td></tr></table>");
            This.css("background-color", options.BgColor);
            if (options.callback.complete != null && typeof options.callback.complete == 'function') {
                options.callback.complete(null, options);
            }
        }
        else {//按相应插件去渲染
            if (cPrm.chartPlugin == "echarts2") {
                //得到Echarts的options
                var eOptions = $.extend(true, echartDefaults(options), adaptEcharts2(options));
                //eOptions = $.extend(true, eOptions, options.OriginalOption);

                //引入echarts.js文件，以前项目不用在页面增加对echarts.js文件的引入
                $.ajax({
                    url: dss.rootPath + "javascript/JSControl/SampleChart/Scripts/echarts/echarts.js",
                    dataType: "script",
                    cache: true,
                    success: function (content, status) {
                        if (status == "success") {
                            var requireArr = [
                                    'echarts',
                                    'theme',
                                    'echarts/chart/radar'
                            ];

                            var cType = getChartType(options.ChartType, options);

                            // 按需加载所需图表，如需动态类型切换功能，别忘了同时加载相应图表
                            if (cType.indexOf("bar") > -1) {
                                requireArr.push('echarts/chart/bar');
                                requireArr.push('echarts/chart/line');
                            }
                            else if (cType.indexOf("line") > -1) {
                                requireArr.push('echarts/chart/line');
                            }
                            else if (cType.indexOf("pie") > -1 || cType.indexOf("Pie") > -1) {
                                requireArr.push('echarts/chart/pie');
                            }
                            else if ((cType.indexOf("map") > -1 || cType.indexOf("Map") > -1) && cType != "treemap") {
                                requireArr.push('echarts/chart/map');
                            }
                            else if (cType.indexOf("gauge") > -1 || cType.indexOf("Gauge") > -1) {
                                requireArr.push('echarts/chart/gauge');
                            }
                            else if (cType.indexOf("scatter") > -1) {
                                requireArr.push('echarts/chart/scatter');
                            }
                            else if (cType.indexOf("treemap") > -1 || cType.indexOf("Treemap") > -1) {
                                requireArr.push('echarts/chart/treemap');
                            }

                            require.config({
                                paths: {
                                    'echarts': dss.rootPath + "javascript/JSControl/SampleChart/Scripts/echarts",//echarts的核心js
                                    'theme': dss.rootPath + "javascript/JSControl/SampleChart/Scripts/echarts/theme/" + eOptions.theme//主题文件
                                }
                            });
                            require(
                                requireArr,
                                function (ec, theme) {
                                    var myChart = ec.init(This[0], theme);

                                    //============处理各种事件============ begin
                                    if (!isNullOrEmpty(eOptions.clickEvent) && eOptions.clickEvent.length > 0) {
                                        //绑定事件
                                        var ecConfig = require('echarts/config');
                                        var eConsole = function (param, a, b, c, d) {
                                            var echartsPre = {
                                                getindex: function (attData, colname) {
                                                    var ind = -1;
                                                    if (attData.length > 0) {
                                                        for (var lk = 0; lk < attData.length; lk++) {
                                                            if (attData[lk] == colname) {
                                                                ind = lk;
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    return ind;
                                                }
                                            };
                                            //参数依次为：对应的x轴值、对应的指标名、值、x轴的索引、指标对应的索引、div的ID、options对象
                                            $.each(eOptions.clickEvent, function (i, item) {
                                                var it = echartsPre.getindex(options.DataSource.colnames, param.seriesName);
                                                if (it == -1) {
                                                    it = item.colindex;
                                                }
                                                if (item.colindex == it) {
                                                    if (typeof item.click == "function") {
                                                        item.click(param.name, param.seriesName, param.value, param.dataIndex, it, This[0].id, options);
                                                    }

                                                    if (item.url) {
                                                        window.open(item.url);
                                                    }

                                                    //点击不用高亮的图形：地图、饼图、仪表盘
                                                    //if (options.ChartType.indexOf("gauge") < 0 && options.ChartType.indexOf("Gauge") < 0 && options.ChartType.indexOf("Map") < 0 && options.ChartType.indexOf("map") < 0 && options.ChartType.indexOf("pie") < 0 && options.ChartType.indexOf("Pie") < 0 && options.ChartType.indexOf("Doughnut") < 0) {
                                                    //    //自动高亮
                                                    //    $.extend(true, options, {
                                                    //        HighLight: [{ colindex: item.colindex, highvales: param.name, color: getHightlightColor() }]
                                                    //    });
                                                    //    $("#" + options.DivID).SampleChart(options);
                                                    //}
                                                }
                                            });
                                        }
                                        myChart.on(ecConfig.EVENT.CLICK, eConsole);
                                    }

                                    //地图的选择事件
                                    if (!isNullOrEmpty(options.Event) && !isNullOrEmpty(options.Event.MapSelected)) {
                                        //绑定事件
                                        var ecConfig = require('echarts/config');
                                        var eConsole = function (param) {
                                            options.Event.MapSelected(param.target);//传入地区名称
                                        }
                                        myChart.on(ecConfig.EVENT.MAP_SELECTED, eConsole);
                                    }

                                    //图例点击事件
                                    if (!isNullOrEmpty(options.Event) && !isNullOrEmpty(options.Event.LegendSelected)) {
                                        //绑定事件
                                        var ecConfig = require('echarts/config');
                                        var eConsole = function (param) {
                                            var currentIndex = "";
                                            var currentName = "";
                                            var selectedIndex = "";
                                            var selectedName = "";
                                            var notSelectedIndex = "";
                                            var notSelectedName = "";

                                            var colNames = options.DataSource.colnames;
                                            $.each(colNames, function (i, col) {
                                                if (colNames[i] == param.target) {
                                                    currentName = param.target;
                                                    currentIndex = i;
                                                }

                                                if (param.selected[colNames[i]]) {
                                                    selectedIndex += i + ",";
                                                    selectedName += colNames[i] + ",";
                                                }
                                                else if (!isNullOrEmpty(param.selected[colNames[i]])) {
                                                    notSelectedIndex += i + ",";
                                                    notSelectedName += colNames[i] + ",";
                                                }
                                            });

                                            selectedIndex = selectedIndex.substr(0, selectedIndex.length - 1);
                                            selectedName = selectedName.substr(0, selectedName.length - 1);
                                            notSelectedIndex = notSelectedIndex.substr(0, notSelectedIndex.length - 1);
                                            notSelectedName = notSelectedName.substr(0, notSelectedName.length - 1);

                                            options.Event.LegendSelected(currentIndex, currentName, selectedIndex, selectedName, notSelectedIndex, notSelectedName);
                                        }
                                        myChart.on(ecConfig.EVENT.LEGEND_SELECTED, eConsole);
                                    }

                                    //============处理各种事件============ end

                                    //是否为地图扩展的
                                    if (options.IsMapExtend) {
                                        // 自定义扩展图表类型
                                        require('echarts/util/mapData/params').params[eOptions.mapType] = {
                                            getGeoJson: function (callback) {
                                                //mapExtend.json文件中记录着中文地区名称对应的json文件的名称
                                                $.getJSON(dss.rootPath + 'javascript/JSControl/SampleChart/Scripts/echarts/util/mapData/mapExtend.json', function (data) {
                                                    $.getJSON(dss.rootPath + 'javascript/JSControl/SampleChart/Scripts/echarts/util/mapData/geoJson/' + data[eOptions.mapType] + '.json', callback);
                                                });
                                            }
                                        };
                                    }

                                    //var a = dss.jsonToString(eOptions).replaceAll("\\r\\n", " ");
                                    myChart.setOption(eOptions, true);//true表示不合并

                                    //处理保存成图片
                                    if (options.isSaveImg) {
                                        if (isNullOrEmpty(options.ImgPath)) {
                                            options.ImgPath = "~/Temp/ChartImg/";//注意要带后面的斜杠
                                        }

                                        var nowTime = new Date();
                                        nowTime = nowTime.format("yyyyMMddhhmmssS");
                                        if (isNullOrEmpty(options.ImgName)) {
                                            options.ImgName = nowTime + ".png";
                                        }

                                        //延时5秒将图表保存成图片
                                        setTimeout(function () {
                                            $.ajax({
                                                url: dss.rootPath + "javascript/JSControl/SampleChart/Handler/Echart.ashx",
                                                type: "post",
                                                dataType: "text",
                                                data: {
                                                    actionType: "saveImg",
                                                    imgUrl: myChart.getDataURL("png"),
                                                    imgPath: options.ImgPath,
                                                    imgName: options.ImgName
                                                },
                                                cache: false,
                                                success: function (result) {

                                                },
                                                error: function (a, b, c) {
                                                    alert(a + b + c);
                                                }
                                            });
                                        }, 5000);
                                    }

                                    window.addEventListener("resize", function () {
                                        myChart.resize();
                                    });

                                    if (options.callback.autoAddData != null && typeof options.callback.autoAddData == 'function') {
                                        options.callback.autoAddData(myChart, options.DataSource);
                                    }
                                    if (options.callback.complete != null && typeof options.callback.complete == 'function') {
                                        options.callback.complete(myChart, options);
                                    }
                                }
                            );
                        }
                    },
                    error: function (a, b, c) {

                    }
                });
            }
            else if (cPrm.chartPlugin == "echarts3") {
                //得到Echarts的options
                var eOptions = $.extend(true, echartDefaults(options), adaptEcharts2(options));
                //eOptions = $.extend(true, eOptions, options.OriginalOption);

                //引入echarts.js文件及主题文件，以前项目不用在页面增加对echarts.js文件的引入
                $.ajax({
                    url: dss.rootPath + "javascript/JSControl/SampleChart/Scripts/echarts3/echarts.min.js",
                    dataType: "script",
                    cache: true,
                    success: function (content, status) {
                        if (status == "success") {
                            $.ajax({
                                url: dss.rootPath + "javascript/JSControl/SampleChart/Scripts/echarts3/theme/theme.js",
                                dataType: "script",
                                cache: true,
                                success: function (content, status) {
                                    if (status == "success") {
                                        var optJson = dss.jsonToString(eOptions);

                                        var theme = new echartTheme();
                                        echarts.registerTheme(options.Theme, theme.getTheme(options.Theme));

                                        var cType = getChartType(options.ChartType, options);
                                        if ((cType.indexOf("map") > -1 || cType.indexOf("Map") > -1) && cType != "treemap") {
                                            $.ajax({
                                                url: dss.rootPath + 'javascript/JSControl/SampleChart/Scripts/echarts3/data/map/mapNames.json',
                                                dataType: "json",
                                                async: false,
                                                cache: true,
                                                success: function (data) {
                                                    $.ajax({
                                                        url: dss.rootPath + 'javascript/JSControl/SampleChart/Scripts/echarts3/data/map/json/' + data[eOptions.mapType] + '.json',
                                                        dataType: "json",
                                                        async: false,
                                                        cache: true,
                                                        success: function (mapJson) {
                                                            echarts.registerMap(eOptions.mapType, mapJson);
                                                        }
                                                    });
                                                }
                                            });
                                        }

                                        var myChart = echarts.init(This[0], options.Theme);

                                        //#region ============处理各种事件============ begin
                                        if (!isNullOrEmpty(eOptions.clickEvent) && eOptions.clickEvent.length > 0) {
                                            //绑定事件
                                            var eConsole = function (param) {
                                                var echartsPre = {
                                                    getindex: function (attData, colname) {
                                                        var ind = -1;
                                                        if (attData.length > 0) {
                                                            for (var lk = 0; lk < attData.length; lk++) {
                                                                if (attData[lk] == colname) {
                                                                    ind = lk;
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                        return ind;
                                                    }
                                                };
                                                //参数依次为：对应的x轴值、对应的指标名、值、x轴的索引、指标对应的索引、div的ID、options对象
                                                $.each(eOptions.clickEvent, function (i, item) {
                                                    var it = echartsPre.getindex(options.DataSource.colnames, param.seriesName);
                                                    if (it == -1) {
                                                        it = item.colindex;
                                                    }
                                                    if (item.colindex == it) {
                                                        if (typeof item.click == "function") {
                                                            item.click(param.name, param.seriesName, param.value, param.dataIndex, it, This[0].id, options);
                                                        }

                                                        if (item.url) {
                                                            window.open(item.url);
                                                        }
                                                    }
                                                });
                                            }
                                            myChart.on("click", eConsole);
                                        }

                                        //地图的选择事件
                                        if (!isNullOrEmpty(options.Event) && !isNullOrEmpty(options.Event.MapSelected)) {
                                            //绑定事件
                                            var eConsole = function (param) {
                                                options.Event.MapSelected(param.name);//传入地区名称
                                            }
                                            myChart.on("click", eConsole);
                                        }

                                        //图例点击事件
                                        if (!isNullOrEmpty(options.Event) && !isNullOrEmpty(options.Event.LegendSelected)) {
                                            //绑定事件
                                            var eConsole = function (param) {
                                                var currentIndex = "";
                                                var currentName = "";
                                                var selectedIndex = "";
                                                var selectedName = "";
                                                var notSelectedIndex = "";
                                                var notSelectedName = "";

                                                var colNames = options.DataSource.colnames;
                                                $.each(colNames, function (i, col) {
                                                    if (colNames[i] == param.target) {
                                                        currentName = param.target;
                                                        currentIndex = i;
                                                    }

                                                    if (param.selected[colNames[i]]) {
                                                        selectedIndex += i + ",";
                                                        selectedName += colNames[i] + ",";
                                                    }
                                                    else if (!isNullOrEmpty(param.selected[colNames[i]])) {
                                                        notSelectedIndex += i + ",";
                                                        notSelectedName += colNames[i] + ",";
                                                    }
                                                });

                                                selectedIndex = selectedIndex.substr(0, selectedIndex.length - 1);
                                                selectedName = selectedName.substr(0, selectedName.length - 1);
                                                notSelectedIndex = notSelectedIndex.substr(0, notSelectedIndex.length - 1);
                                                notSelectedName = notSelectedName.substr(0, notSelectedName.length - 1);

                                                options.Event.LegendSelected(currentIndex, currentName, selectedIndex, selectedName, notSelectedIndex, notSelectedName);
                                            }
                                            myChart.on("legendselectchanged", eConsole);
                                        }

                                        //#endregion ============处理各种事件============ end

                                        //有背景图片的
                                        var divStyle = This.attr("style");

                                        //var a = dss.jsonToString(eOptions).replaceAll("\\r\\n", " ");
                                        myChart.setOption(eOptions, true);//true表示不合并

                                        //有背景图片的，echarts3会将"background-image"清掉
                                        if (!isNullOrEmpty(divStyle) && divStyle.indexOf("background-image") > -1) {
                                            This.attr("style", divStyle);
                                        }

                                        //处理保存成图片
                                        if (options.isSaveImg) {
                                            if (isNullOrEmpty(options.ImgPath)) {
                                                options.ImgPath = "~/Temp/ChartImg/";//注意要带后面的斜杠
                                            }

                                            var nowTime = new Date();
                                            nowTime = nowTime.format("yyyyMMddhhmmssS");
                                            if (isNullOrEmpty(options.ImgName)) {
                                                options.ImgName = nowTime + ".png";
                                            }

                                            //延时5秒将图表保存成图片
                                            setTimeout(function () {
                                                $.ajax({
                                                    url: dss.rootPath + "javascript/JSControl/SampleChart/Handler/Echart.ashx",
                                                    type: "post",
                                                    dataType: "text",
                                                    data: {
                                                        actionType: "saveImg",
                                                        imgUrl: myChart.getDataURL("png"),
                                                        imgPath: options.ImgPath,
                                                        imgName: options.ImgName
                                                    },
                                                    cache: false,
                                                    success: function (result) {

                                                    },
                                                    error: function (a, b, c) {
                                                        alert(a + b + c);
                                                    }
                                                });
                                            }, 5000);
                                        }

                                        window.addEventListener("resize", function () {
                                            myChart.resize();
                                        });

                                        if (options.callback.autoAddData != null && typeof options.callback.autoAddData == 'function') {
                                            options.callback.autoAddData(myChart, options.DataSource);
                                        }
                                        if (options.callback.complete != null && typeof options.callback.complete == 'function') {
                                            options.callback.complete(myChart, options);
                                        }
                                    }
                                }
                            });
                        }
                    },
                    error: function (a, b, c) {

                    }
                });
            }
        }

        //#endregion ==============渲染图形============== end
    }

    //Echarts的默认options
    function echartDefaults(options) {
        return {
            //背景色
            backgroundColor: "#fff",
            //标题
            title: {
                show: false,
                x: 'center',
                text: '',
                subtext: ''
            },
            //是否为动画效果
            animation: true,
            //工具栏
            toolbox: { show: false },
            //悬浮框
            //tooltip: { trigger: 'axis' },
            //图例
            legend: {
                show: true,
                orient: 'horizontal',
                x: 'center',
                y: 'bottom',
                padding: [0, 5, 8, 5]
            },
            //是否启用拖拽重计算特性，默认关闭
            calculable: false,
            //雷达图用到此属性
            //polar: [],
            //地图中用到
            dataRange: [],
            //所有的序列数据
            series: [],

            //地图中才用到
            mapType: options.MapType,

            //不是echarts的原有属性
            clickEvent: options.ClickEvent
        };
    }

    //将options适配成Echarts2的
    function adaptEcharts2(options) {
        var chartType = getChartType(options.ChartType, options);

        //#region ==============不同图形设置不同的默认值============== begin
        //是否显示图例
        if (isNullOrEmpty(options.IsShowLegend)) {
            if (chartType == "gauge" || options.ChartType == "GaugeMore") {
                options.IsShowLegend = false;
            }
            else {
                options.IsShowLegend = true;
            }
        }
        //是否显示值
        if (isNullOrEmpty(options.IsShowValue)) {
            if (chartType == "gauge" || options.ChartType == "GaugeMore") {
                options.IsShowValue = true;
            }
            else {
                options.IsShowValue = false;
            }
        }
        //#endregion ==============不同图形设置不同的默认值============== end

        //#region ==============得到echartsOptions的元素series的值（seriesData）、legend中的data值（colNames）及其他属性的值============== begin

        var colNames = [];//---为echartsOptions的元素legend中的data值，列名，即图例名，就是指标名        
        var seriesData = [];//---为echartsOptions的元素series的值，y轴值，数组元素为对象类型，也就是指标值，一个数组元素就是datatable中的一列及相关属性
        var indicator = [];//---雷达图中的option-polar-indicator
        var calculable = false;//是否启用拖拽重计算特性，默认关闭，false时就无法拖拽
        var dataRange = null;//---地图中的数据范围
        var visualMap = null;//echarts3中替换掉dataRange
        var dataZoom = null;
        var tooltip = { trigger: 'axis' };//悬浮框内容样式
        var grid = null;//图表的尺寸及边距，除饼图、环形图、地图、仪表盘的图表用
        var legend = null;//---图例
        var title = null;//---标题

        //---为seriesData中的itemStyle属性，为图表的内容样式，可以针对全部数据也可针对一个指标的数据
        var itemStyle = {
            normal: {
                label: {
                    show: options.IsShowValue,
                    position: options.ChartType == "Bar" ? 'right' : 'top'
                    //,
                    //formatter: function (v) {
                    //    return axisFormatter(v.value, options.YFormatType, options.YUnit);
                    //}
                }
                //,
                //barBorderRadius: [5, 5, 5, 5]//是否为圆角，顺序为左上、右上、右下、左下
            }
        };
        //面积图，雷达面积图
        if (options.ChartType == "Area" || options.ChartType == "StackedArea" || options.ChartType == "ScrollArea" || options.ChartType == "RadarArea") {
            $.extend(true, itemStyle, { normal: { areaStyle: { type: 'default' } } });
        }

        //当为彩虹柱形图时
        if (options.ChartType == "ColumnRainbow") {
            $.extend(true, itemStyle, {
                normal: {
                    color: function (params) {
                        var colorList = options.ColorArr.length > 0 ? options.ColorArr : [
                           "#7CB5EC", "#90EC7D", "#F7A35B", "#FF69B3", "#3FE0D0",
                           '#dc69aa', '#CD5D5C', '#FF7F50', '#6395EC', '#DA70D5',
                           '#32CD33', '#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050',
                           '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089'
                        ];
                        return colorList[params.dataIndex % colorList.length]
                    },
                    barBorderRadius: [5, 5, 5, 5]//是否为圆角，顺序为左上、右上、右下、左下 
                }
            });

            //去掉坐标轴的边框
            grid = { borderWidth: 0 };
        }

        //当为瀑布图时
        if (options.ChartType == "ColumnWaterfall") {
            if (options.ColorArr.length > 0) {
                $.extend(true, itemStyle, {
                    normal: {
                        color: function (params) {
                            var colorList = options.ColorArr;
                            return colorList[params.dataIndex % options.ColorArr.length]
                        }
                    }
                });
            }
        }

        var dataSource = options.DataSource;//数据源

        var xData = [];//x轴值，就是维度值
        var xDataColIndex = 0;//x轴的索引值，只有一个x轴
        if (!isNullOrEmpty(options.XDataColIndex)) {
            xDataColIndex = parseInt(options.XDataColIndex);
        }
        else if (!isNullOrEmpty(options.XDataColName)) {
            xDataColIndex = existArr(options.DataSource.colnames, options.XDataColName);
        }

        if (options.ChartType == "Bar" || options.ChartType == "StackedBar") {
            for (var r = options.DataSource.rows.length - 1; r >= 0; r--) {
                var tmp = dataSource.rows[r]["col" + xDataColIndex];
                xData.push(isNullOrEmpty(tmp) ? "" : tmp.toString());//得到x轴的所有值，即所有维度值
            }
        }
        else {
            for (var r = 0; r < options.DataSource.rows.length; r++) {
                var tmp = dataSource.rows[r]["col" + xDataColIndex];

                //X轴交错显示
                //if (options.XLabelStyle == "Stagger" && (chartType == "line" || chartType == "bar") && (r % 2 == 1)) {
                //    tmp = "\n" + tmp;
                //}

                xData.push(isNullOrEmpty(tmp) ? "" : tmp.toString());//得到x轴的所有值，即所有维度值
            }
        }

        var yDataColIndex = "";//y1轴的索引值
        if (!isNullOrEmpty(options.YDataColIndex)) {
            //前后都加上","，是为了可以用字符串的indexOf判断是否包含此列，因为数组的indexOf在IE8（含）以下不支持
            yDataColIndex = "," + options.YDataColIndex + ",";
        }
        else if (!isNullOrEmpty(options.YDataColName)) {
            var tempYColName = options.YDataColName.split(',');
            for (var i = 0; i < tempYColName.length; i++) {
                var tempColIndex = existArr(options.DataSource.colnames, tempYColName[i]);
                if (tempColIndex < 0) {
                    continue;
                }
                if (tempColIndex == xDataColIndex) {
                    continue;
                }
                yDataColIndex += "," + tempColIndex;
            }
            yDataColIndex += ",";
        }

        var y2DataColIndex = "";//y2轴的索引值
        if (!isNullOrEmpty(options.Y2DataColIndex)) {
            y2DataColIndex = "," + options.Y2DataColIndex + ",";
        }
        else if (!isNullOrEmpty(options.Y2DataColName)) {
            var tempYColName = options.Y2DataColName.split(',');
            for (var i = 0; i < tempYColName.length; i++) {
                var tempColIndex = existArr(options.DataSource.colnames, tempYColName[i]);
                if (tempColIndex < 0) {
                    continue;
                }
                if (tempColIndex == xDataColIndex) {
                    continue;
                }
                y2DataColIndex += "," + tempColIndex;
            }
            y2DataColIndex += ",";
        }

        var yIsNull = yDataColIndex == "" ? true : false;
        var y2IsNull = y2DataColIndex == "" ? true : false;

        //#region ==============属性的统一初始化============== end
        //折线图x轴数量超过X个时采用间隔显示的方式
        if (options.XLabelStep != 0 && chartType == "line" && xData.length > 0 && (xData[0].indexOf("日") > -1 || xData[0].indexOf("周") > -1 || xData[0].indexOf("时") > -1)) {
            var xNum = 8;
            var xWidth = 42;
            if (xData[0].length <= 3) {
                xWidth = 28
            }

            if (!isNullOrEmpty(options.DivWidth) && options.DivWidth != 0) {
                xNum = Math.round(options.DivWidth / xWidth);
            }

            if (xData.length > xNum) {
                options.XLabelStep = Math.floor(xData.length / xNum) + 1;
            }
        }
        if (options.XLabelStep == 0) {//设为0则全部显示
            options.XLabelStep = 1;
        }

        //#endregion ==============属性的统一初始化============== end

        //除饼图、矩形树图、雷达图、地图、仪表盘、散点图之外的图表
        if (chartType != "tree" && chartType != "PieDoughnut" && chartType != "pie" && chartType != "treemap" && chartType != "radar" && chartType != "map" && chartType.indexOf("Map") < 0 && chartType != "gauge" && options.ChartType != "GaugeMore" && chartType != "scatter") {
            //根据图的种类，调整一些属性
            if ((options.ChartType == "ScrollColumn" || options.ChartType == "ScrollLine" || options.ChartType == "ScrollArea" || options.ChartType == "ScrollStackedColumn") && options.DataSource.rows.length > options.ScrollNum) {
                options.IsScroll = true;
            }

            if (options.IsScroll && options.DataSource.rows.length > options.ScrollNum) {
                options.ScrollEnd = options.ScrollStart + parseFloat(options.ScrollNum / options.DataSource.rows.length) * 100;
                if (options.ScrollEnd == options.ScrollStart) {
                    options.ScrollEnd += 0.1;
                }
            }
            else {
                options.IsScroll = false;
            }

            //遍历每列，c为列索引
            for (var c = 1; c < dataSource.colnames.length; c++) {
                var isInY = yDataColIndex.indexOf("," + c.toString() + ',') >= 0 ? true : false;
                var isInY2 = y2DataColIndex.indexOf("," + c.toString() + ',') >= 0 ? true : false;

                var yAxisIndex = 0;//用哪条y轴，0为左侧，1为右侧

                //==============获得组合图中各子图的图表类型============== begin
                //单y轴组合图： Combi1：组合(柱,线,面积)，Combi2：组合(柱,线)，Combi3：组合(堆叠,线)
                if (options.ChartType == "Combi1" || options.ChartType == "Combi2" || options.ChartType == "Combi3") {
                    //SubChartType均未指定
                    if (isNullOrEmpty(options.SubChartType)) {
                        chartType = "bar";
                    }
                    else {
                        var i = 0;
                        for (i = 0; i < options.SubChartType.length; i++) {
                            //此列在SubChartType中指定了图表类型
                            if (options.SubChartType[i].colindex == c) {
                                break;
                            }
                        }
                        //此列在SubChartType中未指定图表类型
                        if (i == options.SubChartType.length) {
                            chartType = "bar";
                        }
                        else {
                            chartType = getChartType(options.SubChartType[i].type);
                            //组合图中有面积类型时的样式
                            if (options.SubChartType[i].type == "Area") {
                                $.extend(true, itemStyle, { normal: { areaStyle: { type: 'default' } } });
                            }
                        }
                    }
                }
                else if (options.ChartType == "Combi1Y") {//双y轴，Combi1Y：组合(柱,线,面积)(Y2)
                    //以下情况用右侧y轴
                    if (isInY2) {
                        yAxisIndex = 1;
                    }

                    var i = 0;
                    //SubChartType均未指定
                    if (options.SubChartType == null) {
                        if (isInY2) {
                            chartType = "line";
                        }
                        else {
                            chartType = "bar";
                        }
                    }
                    else {
                        for (i = 0; i < options.SubChartType.length; i++) {
                            if (options.SubChartType[i].colindex == c) {
                                break;//此列指定了SubChartType
                            }
                        }
                        //此列未指定SubChartType，则用默认的，即左侧y1轴用bar，y2轴用line
                        if (i == options.SubChartType.length) {
                            //y2轴即右侧y轴默认为折线图
                            if (isInY2) {
                                chartType = "line";
                            }
                            else {//y1轴即左侧y轴默认为柱形图
                                chartType = "bar";
                            }
                        }
                        else {
                            chartType = getChartType(options.SubChartType[i].type);
                            //组合图中有面积类型时的样式
                            if (options.SubChartType[i].type == "Area") {
                                $.extend(true, itemStyle, { normal: { areaStyle: { type: 'default' } } });
                            }
                        }
                    }
                }     //双y轴，Combi2Y：组合(Y柱,Y2线)(Y2)，Combi3Y：组合(Y堆叠,Y2线)(Y2)
                else if (options.ChartType == "Combi2Y" || options.ChartType == "Combi3Y") {
                    //以下情况用右侧y轴
                    if (isInY2) {
                        yAxisIndex = 1;
                    }

                    //y2轴即右侧y轴用折线图，SubChartType无效
                    if (isInY2) {
                        chartType = "line";
                    }
                    else {//y1轴即左侧y轴用柱形图，SubChartType无效
                        chartType = "bar";
                    }
                }
                //==============获得组合图中各子图的图表类型============== end

                //当前列在y轴或y2轴的索引值内或y轴索引值未指定就全部显示
                if (yIsNull || isInY || isInY2) {
                    var yData = [];//datatable一列的值
                    var tmpValue;
                    //遍历每行，r为行索引
                    for (var r = 0; r < dataSource.rows.length; r++) {
                        tmpValue = dataSource.rows[r]["col" + c];
                        if (isNullOrEmpty(tmpValue)) {
                            tmpValue = undefined;//数据为空时折线会断开
                        }
                        else {
                            tmpValue = toFloat(tmpValue);
                        }
                        //选中的柱图变色
                        if (options.HighLight != null && options.HighLight.length > 0) {
                            var isHighLight = false;
                            for (var i = 0; i < options.HighLight.length; i++) {
                                if (options.HighLight[i].colindex == c && options.HighLight[i].highvales == dataSource.rows[r]["col" + xDataColIndex]) {
                                    //柱图为瀑布样式时值显示到内部
                                    if (options.ChartType == "ColumnWaterfall") {
                                        $.extend(true, itemStyle, {
                                            normal: {
                                                label: { position: 'top' }
                                            }
                                        });
                                    }
                                    var highColor = getHightlightColor();
                                    if (!isNullOrEmpty(options.HighLight[i].color)) {
                                        highColor = options.HighLight[i].color;
                                    }
                                    //此值为对象
                                    yData.push({
                                        value: tmpValue,
                                        itemStyle: $.extend(true, { normal: { color: highColor } }, itemStyle)
                                    });
                                    isHighLight = true;
                                    break;
                                }
                            }

                            if (isHighLight == false) {
                                yData.push(tmpValue);
                            }
                        }
                        else {
                            yData.push(tmpValue);
                        }
                    }

                    colNames.push(dataSource.colnames[c]);//显示的列名，即图例名，就是指标名，在下面的echartsOptions对象的legend中用到

                    //堆叠，如柱图有三部分堆叠
                    var isStacked = "";
                    if (options.ChartType == "ColumnWaterfall" || options.ChartType == "StackedColumn" || options.ChartType == "StackedBar" || options.ChartType == "StackedArea" || options.ChartType == "ScrollStackedColumn" || (options.ChartType == "Combi3" && chartType == "bar") || (options.ChartType == "Combi3Y" && chartType == "bar")) {
                        isStacked = "yes";
                        options.IsAutoLimits = false;
                    }

                    //当柱形图为组合瀑布图的时候
                    if (options.ChartType == "ColumnWaterfall") {
                        var placeHoledStyle = {
                            normal: {
                                barBorderColor: 'rgba(0,0,0,0)',
                                color: 'rgba(0,0,0,0)'
                            },
                            emphasis: {
                                barBorderColor: 'rgba(0,0,0,0)',
                                color: 'rgba(0,0,0,0)'
                            }
                        };

                        var tmpValue = yData[0];//获得“合计”值

                        //有高亮显示的时候，不是数值而是一个对象，所以此处要判断一下，否则会报错
                        if (typeof yData[0] == "object") {
                            tmpValue = yData[0].value;
                        }

                        var yDataCopy = [];
                        for (var i = 0; i < yData.length - 1; i++) {
                            var tmpV = 0;
                            if (typeof yData[i] == "object") {
                                tmpV = yData[i].value;
                            }
                            else {
                                tmpV = yData[i];
                            }
                            yDataCopy.push(tmpValue - tmpV);
                            if (i != 0) {
                                tmpValue -= tmpV;
                            }
                        }
                        yDataCopy.push(0);

                        //生成序列数据
                        seriesData.push({
                            name: "辅助",//列名，即指标名
                            type: chartType,//指定该系列数据所用的图表类型
                            yAxisIndex: yAxisIndex,//指定该系列数据所用的纵坐标轴
                            stack: isStacked,//堆叠，如柱图有三部分堆叠
                            barGap: '10%',//柱间距离，默认为柱形宽度的30%，可设固定值 ，只针对柱形图
                            barCategoryGap: '50%',//类目间柱形距离
                            itemStyle: placeHoledStyle,
                            data: yDataCopy//指定该系列数据值
                        });

                        $.extend(true, itemStyle, { normal: { label: { position: 'top' } } });
                    }
                    var select = {
                        isHave: function (arrparam, indexcol) {
                            if (arrparam != undefined && typeof arrparam == 'object') {
                                for (var ki = 0; ki < arrparam.length; ki++) {
                                    if (arrparam[ki].colindex == indexcol) {
                                        return true
                                    }
                                }
                            }
                            return false;
                        }
                    }

                    //处理Y轴和Y2轴格式不同、单位不同的情况
                    var newItemStyle = null;//没用itemStyle，因为后面的itemStyle会覆盖前面的itemStyle
                    //处理Y轴和Y2轴格式不同、单位不同的情况下悬浮框值的格式化问题
                    var newTooltip = null;
                    if (isInY2) {
                        newItemStyle = $.extend(true, {
                            normal: {
                                label: {
                                    formatter: function (v) {
                                        return axisFormatter(v.value, options.Y2FormatType, options.Y2Unit, options.Y2Decimals);
                                    }
                                }
                            }
                        }, itemStyle);

                        if (!options.IsAlign && isStacked != "yes") {
                            newTooltip = {
                                trigger: 'axis'
                                //,
                                //formatter: function (v) {
                                //    var tmp = "";
                                //    if (Object.prototype.toString.call(v) === '[object Array]') {
                                //        $.each(v, function (vi, vitem) {
                                //            if (vi == 0) {
                                //                tmp += vitem.name;
                                //            }
                                //            tmp += "<br/>" + vitem.seriesName + "：" + axisFormatter(vitem.value, options.Y2FormatType, options.Y2Unit, options.Y2Decimals);
                                //        });
                                //    }
                                //    else {
                                //        tmp = v.seriesName + "<br/>" + v.name + "：" + axisFormatter(v.value, options.Y2FormatType, options.Y2Unit, options.Y2Decimals);
                                //    }
                                //    return tmp;
                                //}
                            };
                        }
                        else {
                            newTooltip = {
                                trigger: 'axis'
                            }
                        }
                    }
                    else {
                        newItemStyle = $.extend(true, {
                            normal: {
                                label: {
                                    formatter: function (v) {
                                        return axisFormatter(v.value, options.YFormatType, options.YUnit, options.YDecimals);
                                    }
                                }
                            }
                        }, itemStyle);

                        if (!options.IsAlign && isStacked != "yes") {
                            newTooltip = {
                                trigger: 'axis'
                                //,
                                //formatter: function (v) {
                                //    var tmp = "";
                                //    if (Object.prototype.toString.call(v) === '[object Array]') {
                                //        $.each(v, function (vi, vitem) {
                                //            if (vi == 0) {
                                //                tmp += vitem.name;
                                //            }
                                //            tmp += "<br/>" + vitem.seriesName + "：" + axisFormatter(vitem.value, options.YFormatType, options.YUnit, options.YDecimals);
                                //        });
                                //    }
                                //    else {
                                //        tmp = v.seriesName + "<br/>" + v.name + ":" + axisFormatter(v.value, options.YFormatType, options.YUnit, options.YDecimals);
                                //    }
                                //    return tmp;
                                //}
                            };
                        }
                        else {
                            newTooltip = {
                                trigger: 'axis'
                            }
                        }
                    }

                    //背景透明的情况下增加折线图的线的粗细
                    if (options.Theme == "dark") {
                        newItemStyle = $.extend(true, newItemStyle, {
                            normal: {
                                lineStyle: {
                                    width: 3
                                }
                            }
                        });
                    }

                    //排序问题
                    if (options.ChartType == "Bar" || options.ChartType == "StackedBar") {
                        var tmpYData = [];
                        for (var j = yData.length - 1; j >= 0; j--) {
                            tmpYData.push(yData[j]);
                        }
                        yData = tmpYData;
                    }

                    //处理分组堆叠的问题
                    if (options.Stack.length > 0) {
                        for (var i = 0; i < options.Stack.length; i++) {
                            for (var j = 0; j < options.Stack[i].colindex.length; j++) {
                                if (options.Stack[i].colindex[j] == c) {
                                    isStacked = options.Stack[i].name;
                                    break;
                                }
                            }
                        }
                    }

                    var tmpSeriesData = {
                        name: dataSource.colnames[c],//列名，即指标名
                        type: chartType,//指定该系列数据所用的图表类型
                        yAxisIndex: yAxisIndex,//指定该系列数据所用的纵坐标轴
                        stack: isStacked,//堆叠，如柱图有三部分堆叠
                        barGap: '10%',//柱间距离，默认为柱形宽度的30%，可设固定值 ，只针对柱形图
                        barCategoryGap: '50%',//类目间柱形距离
                        barMinHeight: options.ChartType == "ColumnWaterfall" ? 0 : 10,//柱条最小高度，可用于防止某item的值过小而影响交互
                        barMaxWidth: 100,//柱条（K线蜡烛）最大宽度
                        //barWidth:20,
                        clickable: select.isHave(options.ClickEvent, c),
                        itemStyle: newItemStyle,
                        tooltip: newTooltip,
                        data: yData//指定该系列数据值
                    };

                    //用气泡显示最大值最小值
                    if (options.IsShowMaxMin) {
                        $.extend(true, tmpSeriesData, {
                            markPoint: {
                                data: [
                                    { type: 'max', name: '最大值' },
                                    { type: 'min', name: '最小值' }
                                ],
                                label: {
                                    normal: {
                                        textStyle: { color: "#000088" },
                                        formatter: function (p) {
                                            return axisFormatter(p.value, options.YFormatType, options.YUnit, options.YDecimals);
                                        }
                                    }
                                }
                            }
                        });
                    }

                    //增加线
                    if (options.Line.length > 0) {
                        var lineData = [];
                        $.each(options.Line, function (l, tmpLine) {
                            if (tmpLine.colindex == c) {
                                if ("max,min,average".indexOf(tmpLine.type) > -1) {
                                    lineData.push(tmpLine);
                                }
                                else {
                                    if (isInY2) {//Y2轴的箭头向左
                                        lineData.push([
                                            { name: tmpLine.name, value: tmpLine.value, x: options.DivWidth - options.PaddingLeft - 30, yAxis: tmpLine.value },
                                            { x: options.PaddingLeft + 30, yAxis: tmpLine.value }
                                        ]);
                                    }
                                    else {//Y1轴的箭头向右
                                        lineData.push([
                                            { x: options.PaddingLeft + 30, yAxis: tmpLine.value },
                                            { name: tmpLine.name, value: tmpLine.value, x: options.DivWidth - options.PaddingLeft - 30, yAxis: tmpLine.value }
                                        ]);
                                    }

                                    //当阈值超过坐标轴最大值的时候
                                    if (tmpLine.value > getMaxMinValue(options, c).max) {
                                        options.IsAutoLimits = false;
                                        if (yIsNull || isInY) {
                                            options.YMaxValue = tmpLine.value * 1.1;
                                        }
                                        else if (isInY2) {
                                            options.Y2MaxValue = tmpLine.value * 1.1;
                                        }
                                    }
                                }
                            }
                        });

                        $.extend(true, tmpSeriesData, {
                            markLine: {
                                tooltip: {
                                    trigger: 'item',
                                    formatter: function (v) {
                                        var tmp = v.seriesName + "<br/>" + v.name.replace(">", "") + "：" + v.value;
                                        return tmp;
                                    }
                                },
                                data: lineData
                            }
                        });
                    }

                    //生成序列数据
                    seriesData.push(tmpSeriesData);

                    if (options.IsAlign == true) {
                        var placeHoledStyle = {
                            normal: {
                                barBorderColor: 'rgba(0,0,0,0)',
                                color: 'rgba(0,0,0,0)'
                            },
                            emphasis: {
                                barBorderColor: 'rgba(0,0,0,0)',
                                color: 'rgba(0,0,0,0)'
                            }
                        };

                        var tmpValue = 0;
                        for (var i = 0; i < yData.length; i++) {
                            if (yData[i] > tmpValue) {
                                tmpValue = yData[i];
                            }
                        }

                        tmpValue = Math.round(tmpValue * 1.2);

                        var yDataCopy = [];
                        for (var i = 0; i < yData.length; i++) {
                            yDataCopy.push(tmpValue - yData[i]);
                        }

                        //生成序列数据
                        seriesData.push({
                            name: dataSource.colnames[c],//列名，即指标名
                            type: chartType,//指定该系列数据所用的图表类型
                            yAxisIndex: yAxisIndex,//指定该系列数据所用的纵坐标轴
                            stack: isStacked,//堆叠，如柱图有三部分堆叠
                            barGap: '10%',//柱间距离，默认为柱形宽度的30%，可设固定值 ，只针对柱形图
                            barCategoryGap: '50%',//类目间柱形距离
                            itemStyle: placeHoledStyle,
                            data: yDataCopy//指定该系列数据值
                        });
                    }
                }
            }

            if (options.IsAlign == true) {
                var fmt = '{b}';
                for (var i = 0; i < seriesData.length / 2; i++) {
                    fmt += "<br/>{a" + i * 2 + "}:{c" + i * 2 + "}";
                }

                tooltip = {
                    trigger: 'axis',
                    axisPointer: {// 坐标轴指示器，坐标轴触发有效
                        type: 'shadow'// 默认为直线，可选为：'line' | 'shadow'
                    },
                    formatter: fmt
                };
            }
            else if (isStacked == "yes" && options.ChartType != "ColumnWaterfall") {
                tooltip = {
                    trigger: 'item',
                    axisPointer: {
                        type: 'shadow'
                    }
                };
            }
            else if (options.ChartType == "ColumnWaterfall") {
                tooltip = {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: function (v) {
                        var tmp = "";
                        $.each(v, function (vi, vv) {
                            if (vv.seriesName != "辅助") {
                                tmp += vv.seriesName + "<br/>" + vv.name + "：" + axisFormatter(vv.value, options.YFormatType) + "<br/>";
                            }
                        });

                        return tmp;
                    }
                };
            }
            else {
                tooltip = {
                    trigger: 'axis',
                    axisPointer: {// 坐标轴指示器，坐标轴触发有效
                        type: 'shadow'// 默认为直线，可选为：'line' | 'shadow'
                    }
                    //,
                    //formatter: '{a}<br/>{b}:{c}'
                    //formatter: function (v) {
                    //    var tmp = v.seriesName + "<br/>" + v.name + ":" + axisFormatter(v.value, options.YFormatType);
                    //    return tmp;
                    //}
                };
            }

            //图表的尺寸及边距
            if (grid == null) {
                grid = {};
            }

            //初始化和计算边距
            if (isNullOrEmpty(options.PaddingBottom)) {
                if (options.XLabelStyle == "Rotate" || options.XLabelStyle == "Vertical") {
                    options.PaddingBottom = 100;
                }
                else if (options.XLabelStyle == "Wrap") {//x轴值折行显示时需要调整下边距
                    //坐标轴的宽度
                    var gridWidth = options.DivWidth - options.PaddingLeft - options.PaddingRight;
                    if (options.IsScroll) {
                        gridWidth = Math.floor(gridWidth * 100 / (options.ScrollEnd - options.ScrollStart));
                    }

                    //自动计算之后的字体大小
                    var tmpFontSize = options.XLabelStep == 1 ? (Math.floor(gridWidth / options.DataSource.rows.length) > 12 ? 12 : Math.floor(gridWidth / options.DataSource.rows.length)) : options.FontSize;

                    var xRowNum = 1;//x轴的最长的值的折行数
                    $.each(xData, function (i, value) {
                        value = value.toString();
                        //月、周将诸如“2016年”去掉，以节省空间
                        if (value.indexOf("年") > -1 && (value.indexOf("月") > -1 || value.indexOf("周") > -1)) {
                            value = value.substr(5);
                        }

                        if (options.XIsTrim && !isNullOrEmpty(value) && value.length > options.XTrimNum) {
                            value = value.substr(0, options.XTrimNum) + "...";
                        }

                        //x轴每格可以放的文字的数量
                        var xFontNum = Math.floor(gridWidth / options.DataSource.rows.length / tmpFontSize);
                        if (parseInt(options.XLabelStep) > 1) {
                            xFontNum = Math.floor(gridWidth / (options.DataSource.rows.length / options.XLabelStep) / tmpFontSize);
                        }

                        if (xFontNum == 0) {
                            xFontNum = 1;
                        }

                        if (value.length > xFontNum) {
                            var num = Math.ceil(value.length / xFontNum);

                            if (num > xRowNum) {
                                xRowNum = num;
                            }
                        }
                    });

                    options.PaddingBottom = 55 + (xRowNum - 1) * tmpFontSize;
                }
                else {
                    options.PaddingBottom = 55;
                }

                //图例过长的时候折行之后，需要增加options.PaddingBottom 
                if (options.IsShowLegend) {
                    var legendLength = 0;
                    var tmpLegend = "";
                    $.each(colNames, function (i, item) {
                        tmpLegend += item;
                        legendLength += 26;
                    });
                    legendLength += tmpLegend.length * 12;

                    if (legendLength > options.DivWidth - options.PaddingLeft - options.PaddingRight) {
                        options.PaddingBottom += 30;
                    }
                }

                if (options.IsScroll) {
                    options.PaddingBottom += 10;
                }

                //if (options.XLabelStyle == "Stagger") {
                //    options.PaddingBottom += 10;
                //}
            }

            $.extend(true, grid, {
                x: options.PaddingLeft,
                x2: options.PaddingRight,
                y: options.PaddingTop,
                y2: options.PaddingBottom,
                borderWidth: 0
            });

            if (options.IsScroll) {
                dataZoom = {
                    orient: "horizontal", //水平显示
                    show: true, //显示滚动条
                    //zoomLock:true,
                    start: options.ScrollStart, //起始值为20%
                    end: options.ScrollEnd  //结束值为60%
                };
            }

            if (chartType == "line") {
                //设为true，折线图时有间隔的点也会显示圆圈，也可以有点击事件，但无数据时会有灰点
                //calculable = true;
            }
        }
        else if (chartType == "scatter") {
            if (options.ChartType == "scatter" || options.ChartType == "Scatter") {
                //散点图x、y轴都是指标，用类似“YDataColIndex: "1,2"”来指定，也可用“YDataColIndex: "1",Y2DataColIndex: "2"”指定
                if (y2IsNull && (!yIsNull)) {
                    y2DataColIndex = "," + yDataColIndex.split(',')[2] + ",";
                    yDataColIndex = "," + yDataColIndex.split(',')[1] + ",";
                }
                else if (yIsNull) {
                    yDataColIndex = ",1,";
                    y2DataColIndex = ",2,";
                }
                y2IsNull = false;//y2轴置为非空，下面的坐标轴处理的地方要用到

                //悬浮框样式
                tooltip = {
                    trigger: 'item',
                    formatter: '{a}<br/>{b}:{c}'
                };

                //去掉坐标轴的边框
                grid = { borderWidth: 0 };

                for (var r = 0; r < dataSource.rows.length; r++) {
                    var curValue = dataSource.rows[r]["col" + xDataColIndex];
                    if (colNames.toString().indexOf(curValue) < 0) {
                        colNames.push(curValue);
                    }
                }

                for (var i = 0; i < colNames.length; i++) {
                    var data = [];
                    for (var r = 0; r < dataSource.rows.length; r++) {
                        if (dataSource.rows[r]["col" + xDataColIndex] == colNames[i]) {
                            data.push([dataSource.rows[r]["col" + yDataColIndex.split(',')[1]], dataSource.rows[r]["col" + y2DataColIndex.split(',')[1]]]);
                        }
                    }
                    seriesData.push({
                        name: colNames[i],
                        type: 'scatter',
                        itemStyle: {
                            normal: {
                                label: {
                                    show: options.IsShowValue
                                }
                            }
                        },
                        data: data
                    });
                }

                //处理坐标轴
                //y2IsNull = true;
            }
            else if (options.ChartType == "Bubble") {
                //气泡图x、y轴和气泡半径都是指标，用类似“YDataColIndex: "1,2,3"”来指定
                y2IsNull = false;//y2轴置为非空，下面的坐标轴处理的地方要用到

                //悬浮框样式
                tooltip = {
                    trigger: 'item',
                    formatter: '{a}<br/>{c}'
                };

                //去掉坐标轴的边框
                grid = { borderWidth: 0 };

                for (var r = 0; r < dataSource.rows.length; r++) {
                    var curValue = dataSource.rows[r]["col" + xDataColIndex];
                    if (colNames.toString().indexOf(curValue) < 0) {
                        colNames.push(curValue);
                    }
                }

                var tmpMax = getMaxMinValue(options, 3).max;
                if (tmpMax <= 0) {
                    tmpMax = 100;
                }

                for (var i = 0; i < colNames.length; i++) {
                    var data = [];
                    for (var r = 0; r < dataSource.rows.length; r++) {
                        if (dataSource.rows[r]["col" + xDataColIndex] == colNames[i]) {
                            data.push([dataSource.rows[r]["col" + yDataColIndex.split(',')[1]], dataSource.rows[r]["col" + yDataColIndex.split(',')[2]], dataSource.rows[r]["col" + yDataColIndex.split(',')[3]]]);
                        }
                    }
                    seriesData.push({
                        name: colNames[i],
                        type: 'scatter',
                        itemStyle: {
                            normal: {
                                label: {
                                    show: options.IsShowValue
                                }
                            }
                        },
                        symbolSize: function (data) {
                            //return Math.sqrt(data[2]) / 10;
                            return data[2] / tmpMax * 50;
                        },
                        data: data
                    });
                }
            }
        }
        else if (chartType == "pie" || chartType == "PieDoughnut") {
            //悬浮框样式
            tooltip = {
                trigger: 'item',
                //formatter: '{b}<br/>{c}<br/>{d}%'
                formatter: function (v) {
                    var tmp = "";
                    if (options.IsShowPercentValue) {
                        tmp = v.name + "<br/>" + v.percent + "%";
                    }
                    else {
                        tmp = v.name + "<br/>" + axisFormatter(v.value, options.YFormatType, options.YUnit, options.YDecimals) + "<br/>" + v.percent + "%";
                    }
                    return tmp;
                }
            };
            calculable = options.Pie.calculable;

            //圆环饼图需要分层
            if (options.ChartType == "PieLayered") {
                calculable = false;
                var dataStyle = {
                    normal: {
                        label: { show: false },
                        labelLine: { show: false }
                    }
                };
                var placeHolderStyle = {
                    normal: {
                        color: 'rgba(0,0,0,0)',
                        label: { show: false },
                        labelLine: { show: false }
                    },
                    emphasis: {
                        color: 'rgba(0,0,0,0)'
                    }
                };
                var tmpTotal = 0;
                for (var r = 0; r < dataSource.rows.length; r++) {
                    tmpTotal += parseFloat(dataSource.rows[r]["col" + (yIsNull ? 1 : yDataColIndex.split(',')[1])]);
                }

                colNames = [];
                var radius1 = toFloat(options.Pie.radius) - 25;
                var radius2 = toFloat(options.Pie.radius);
                for (var r = 0; r < dataSource.rows.length; r++) {
                    var yData = [];
                    var curName = dataSource.rows[r]["col" + xDataColIndex];
                    var curValue = toFloat(dataSource.rows[r]["col" + (yIsNull ? 1 : yDataColIndex.split(',')[1])]);

                    var tmpName = "";
                    if (options.IsShowPercentValue) {
                        tmpName = tmpTotal > 0 ? (curValue / tmpTotal * 100).toFixed(2) + "% " + curName : "0% " + curName;
                    }
                    else {
                        tmpName = tmpTotal > 0 ? curName + " " + axisFormatter(curValue, options.YFormatType, options.YUnit, options.YDecimals) : curName + " 0";
                    }

                    colNames.push(tmpName);
                    yData.push({
                        value: curValue,
                        name: tmpName
                    });
                    yData.push({
                        value: tmpTotal - curValue,
                        name: 'invisible',
                        itemStyle: placeHolderStyle
                    });

                    seriesData.push({
                        name: r.toString(),
                        type: chartType,
                        clockWise: false,
                        radius: [radius1, radius2],
                        itemStyle: dataStyle,
                        data: yData
                    });

                    radius1 -= 25;
                    radius2 -= 25;
                }

                //悬浮框样式
                tooltip = {
                    show: false
                };
            }
            else if (chartType == "PieDoughnut") {//嵌套饼图
                calculable = false;

                var x1Col = options.XDataColIndex.split(',')[0];
                var x2Col = options.XDataColIndex.split(',')[1];
                var x1Str = "";
                var x2Str = "";
                var x1Data = {
                    "colnames": ["内层维度", "内层指标"],
                    "rows": []
                };
                var x2Data = {
                    "colnames": ["外层维度", "外层指标"],
                    "rows": []
                };

                for (var r = 0; r < dataSource.rows.length; r++) {
                    var tmpX1Str = dataSource.rows[r]["col" + x1Col];
                    if (x1Str.indexOf(tmpX1Str) < 0) {
                        x1Str += tmpX1Str + ",";
                    }
                }
                x1Str = x1Str.substr(0, x1Str.length - 1).split(',');

                for (var i = 0; i < x1Str.length; i++) {
                    var tmpX1Value = 0;
                    for (var r = 0; r < dataSource.rows.length; r++) {
                        var tmpX1Str = dataSource.rows[r]["col" + x1Col];
                        if (x1Str[i] == tmpX1Str) {
                            var tmpX2Value = parseFloat(dataSource.rows[r]["col" + (yIsNull ? 2 : yDataColIndex.split(',')[1])]);
                            tmpX1Value += tmpX2Value;
                            x2Data.rows.push({ "col0": dataSource.rows[r]["col" + x2Col], "col1": tmpX2Value });
                        }
                    }
                    x1Data.rows.push({ "col0": x1Str[i], "col1": tmpX1Value });
                }

                var yX1Data = [];
                for (var r = 0; r < x1Data.rows.length; r++) {
                    var curName = x1Data.rows[r]["col0"].toString();
                    colNames.push(curName);
                    var curValue = x1Data.rows[r]["col1"];

                    yX1Data.push({
                        name: curName,
                        value: curValue,
                        itemStyle: {
                            normal: {
                                label: {
                                    show: true,
                                    position: 'inner',
                                    formatter: function (value) {
                                        var tmp = value.name;
                                        if (options.XIsTrim && !isNullOrEmpty(tmp) && tmp.length > options.XTrimNum) {
                                            tmp = tmp.substr(0, options.XTrimNum) + "...";
                                        }

                                        return tmp;
                                    }
                                },
                                labelLine: { show: false }
                            }
                        }
                    });
                }

                var seriesX1Opt = {
                    name: options.Title,
                    type: 'pie',
                    radius: options.Pie1.radius,
                    center: options.Pie1.center,
                    selectedMode: "single",
                    itemStyle: {
                        normal: {
                            label: {
                                textStyle: {
                                    fontSize: options.FontSize
                                }
                            }
                        }
                    },
                    data: yX1Data
                };

                seriesData.push(seriesX1Opt);

                var yX2Data = [];
                for (var r = 0; r < x2Data.rows.length; r++) {
                    var curName = x2Data.rows[r]["col0"].toString();
                    colNames.push(curName);
                    var curValue = x2Data.rows[r]["col1"];

                    yX2Data.push({
                        name: curName,
                        value: curValue,
                        itemStyle: {
                            normal: {
                                label: {
                                    show: true,
                                    position: options.LabelPosition,
                                    formatter: function (value) {
                                        var tmp = value.name;
                                        if (options.XIsTrim && !isNullOrEmpty(tmp) && tmp.length > options.XTrimNum) {
                                            tmp = tmp.substr(0, options.XTrimNum) + "...";
                                        }
                                        if (options.IsShowValue) {
                                            if (options.IsShowPercentValue) {
                                                tmp += "：" + value.percent + "%";
                                            }
                                            else {
                                                tmp += (dss.isNullOrEmpty(tmp) ? "" : "：") + axisFormatter(value.value, options.YFormatType, options.YUnit, options.YDecimals);
                                            }
                                        }

                                        return tmp;
                                    }
                                },
                                labelLine: { show: options.LabelPosition == 'inner' ? false : true, length: 10 }//标签视觉引导线，默认显示
                            }
                        }
                    });
                }

                var seriesX2Opt = {
                    name: options.Title,
                    type: 'pie',
                    radius: options.Pie2.radius,
                    center: options.Pie2.center,
                    selectedMode: "single",
                    itemStyle: {
                        normal: {
                            label: {
                                textStyle: {
                                    fontSize: options.FontSize
                                }
                            }
                        }
                    },
                    data: yX2Data
                };

                seriesData.push(seriesX2Opt);
            }
            else if (chartType == "PieTwo") {//嵌套饼图，内外环数据不同
                calculable = false;

                var x1Col = options.XDataColIndex.split(',')[0];
                var x2Col = options.XDataColIndex.split(',')[1];
                var x1Str = "";
                var x2Str = "";
                var x1Data = {
                    "colnames": ["内层维度", "内层指标"],
                    "rows": []
                };
                var x2Data = {
                    "colnames": ["外层维度", "外层指标"],
                    "rows": []
                };

                for (var r = 0; r < dataSource.rows.length; r++) {
                    var tmpX1Str = dataSource.rows[r]["col" + x1Col];
                    if (x1Str.indexOf(tmpX1Str) < 0) {
                        x1Str += tmpX1Str + ",";
                    }
                }
                x1Str = x1Str.substr(0, x1Str.length - 1).split(',');

                for (var i = 0; i < x1Str.length; i++) {
                    var tmpX1Value = 0;
                    for (var r = 0; r < dataSource.rows.length; r++) {
                        var tmpX1Str = dataSource.rows[r]["col" + x1Col];
                        if (x1Str[i] == tmpX1Str) {
                            var tmpX2Value = parseFloat(dataSource.rows[r]["col" + (yIsNull ? 2 : yDataColIndex.split(',')[1])]);
                            tmpX1Value += tmpX2Value;
                            x2Data.rows.push({ "col0": dataSource.rows[r]["col" + x2Col], "col1": tmpX2Value });
                        }
                    }
                    x1Data.rows.push({ "col0": x1Str[i], "col1": tmpX1Value });
                }

                var yX1Data = [];
                for (var r = 0; r < x1Data.rows.length; r++) {
                    var curName = x1Data.rows[r]["col0"].toString();
                    colNames.push(curName);
                    var curValue = x1Data.rows[r]["col1"];

                    yX1Data.push({
                        name: curName,
                        value: curValue,
                        itemStyle: {
                            normal: {
                                label: {
                                    show: true,
                                    position: 'inner',
                                    formatter: function (value) {
                                        var tmp = value.name;
                                        if (options.XIsTrim && !isNullOrEmpty(tmp) && tmp.length > options.XTrimNum) {
                                            tmp = tmp.substr(0, options.XTrimNum) + "...";
                                        }

                                        return tmp;
                                    }
                                },
                                labelLine: { show: false }
                            }
                        }
                    });
                }

                var seriesX1Opt = {
                    name: options.Title,
                    type: 'pie',
                    radius: options.Pie.radius,
                    center: options.Pie.center,
                    selectedMode: "single",
                    itemStyle: {
                        normal: {
                            label: {
                                textStyle: {
                                    fontSize: options.FontSize
                                }
                            }
                        }
                    },
                    data: yX1Data
                };

                seriesData.push(seriesX1Opt);

                var yX2Data = [];
                for (var r = 0; r < x2Data.rows.length; r++) {
                    var curName = x2Data.rows[r]["col0"].toString();
                    colNames.push(curName);
                    var curValue = x2Data.rows[r]["col1"];

                    yX2Data.push({
                        name: curName,
                        value: curValue,
                        itemStyle: {
                            normal: {
                                label: {
                                    show: true,
                                    position: options.LabelPosition,
                                    formatter: function (value) {
                                        var tmp = value.name;
                                        if (options.XIsTrim && !isNullOrEmpty(tmp) && tmp.length > options.XTrimNum) {
                                            tmp = tmp.substr(0, options.XTrimNum) + "...";
                                        }
                                        if (options.IsShowValue) {
                                            if (options.IsShowPercentValue) {
                                                tmp += "：" + value.percent + "%";
                                            }
                                            else {
                                                tmp += (dss.isNullOrEmpty(tmp) ? "" : "：") + axisFormatter(value.value, options.YFormatType, options.YUnit, options.YDecimals);
                                            }
                                        }

                                        return tmp;
                                    }
                                },
                                labelLine: { show: options.LabelPosition == 'inner' ? false : true, length: 10 }//标签视觉引导线，默认显示
                            }
                        }
                    });
                }

                var seriesX2Opt = {
                    name: options.Title,
                    type: 'pie',
                    radius: options.Pie2.radius,
                    center: options.Pie2.center,
                    selectedMode: "single",
                    itemStyle: {
                        normal: {
                            label: {
                                textStyle: {
                                    fontSize: options.FontSize
                                }
                            }
                        }
                    },
                    data: yX2Data
                };

                seriesData.push(seriesX2Opt);
            }
            else if (options.ChartType == "PieOne") {
                colNames = xData;//饼图时图例名就是维度值
                var yColIndex = yIsNull ? 1 : yDataColIndex.split(',')[1];
                var yData = [];
                var curName = "";
                var curValue = 0;

                if (dataSource && dataSource.rows[0]) {
                    curName = dataSource.colnames[yColIndex];
                    curValue = toFloat(dataSource.rows[0]["col" + yColIndex]);
                }
                else if (options.CommonValue.length > 0) {
                    curName = options.CommonValue[0].k;
                    curValue = options.CommonValue[0].v;
                }

                title = {
                    show: true,
                    text: curName + "：" + curValue + "%",
                    left: "center",
                    top: "bottom",
                    padding: 20
                };

                var color = "";
                if (options.ColorArr.length > 0) {
                    color = options.ColorArr[0];
                }
                else {
                    var tmpMin, tmpMax, tmpColor;
                    for (var i = 0; i < options.Pieces.length; i++) {
                        tmpMin = options.Pieces[i].min;
                        tmpMax = options.Pieces[i].max;
                        tmpColor = options.Pieces[i].color;

                        if (tmpMax == null && curValue > tmpMin) {
                            color = tmpColor;
                        }
                        else if (curValue <= tmpMax && (tmpMin == null || curValue > tmpMin)) {
                            color = tmpColor;
                        }
                    }
                }

                var tmpData = {
                    name: curName,
                    value: curValue,
                    tooltip: { show: false },
                    itemStyle: {
                        normal: {
                            label: {
                                show: false
                            },
                            labelLine: {
                                show: false
                            }
                        },
                        emphasis: {
                            label: {
                                show: false
                            },
                            labelLine: {
                                show: false
                            }
                        }
                    }
                };
                if (!isNullOrEmpty(color)) {
                    $.extend(true, tmpData, {
                        itemStyle: {
                            normal: {
                                color: color
                            },
                            emphasis: {
                            }
                        }
                    });
                }
                yData.push(tmpData);

                yData.push({
                    name: "other",
                    value: 100 - curValue,
                    tooltip: { show: false },
                    itemStyle: {
                        normal: {
                            color: '#E2EAF5',
                            label: {
                                show: false,
                                position: 'center'
                            },
                            labelLine: {
                                show: false
                            }
                        },
                        emphasis: {
                        }
                    }
                });

                var seriesOpt = {
                    name: options.Title,
                    type: chartType,
                    center: ['50%', '50%'],
                    radius: options.Pie.radius,
                    hoverAnimation: false,
                    startAngle: 90,
                    data: yData
                };

                seriesData.push(seriesOpt);

                legend = {
                    x: 'center',
                    y: 'center',
                    itemWidth: 70,
                    itemHeight: 70,
                    formatter: function (params) {
                        return ''
                    },
                    data: [
                      {
                          name: curName,
                          icon: 'image://' + options.ImgName
                      }
                    ]
                };
            }
            else {
                colNames = xData;//饼图时图例名就是维度值
                var yData = [];
                for (var r = 0; r < dataSource.rows.length; r++) {
                    var curName = dataSource.rows[r]["col" + xDataColIndex].toString();
                    //if (options.LegendIsTrim && !isNullOrEmpty(curName) && curName.length > options.LegendTrimNum) {
                    //    curName = curName.substr(0, options.LegendTrimNum) + "...";
                    //}
                    var curValue = toFloat(dataSource.rows[r]["col" + (yIsNull ? 1 : yDataColIndex.split(',')[1])]);
                    //选中的变色
                    if (options.HighLight != null && options.HighLight.length > 0) {
                        var isHighLight = false;
                        for (var i = 0; i < options.HighLight.length; i++) {
                            if (options.HighLight[i].highvales == dataSource.rows[r]["col" + xDataColIndex]) {
                                var highColor = getHightlightColor();
                                if (!isNullOrEmpty(options.HighLight[i].color)) {
                                    highColor = options.HighLight[i].color;
                                }

                                yData.push({
                                    name: curName,
                                    value: curValue,
                                    itemStyle: {
                                        normal: {
                                            color: highColor,
                                            label: {
                                                show: options.IsShowLabel || options.IsShowValue,
                                                position: options.LabelPosition,
                                                //formatter: options.IsShowValue ? (options.IsShowPercentValue ? '{b}:{d}%' : '{b}:{c}') : '{b}'
                                                formatter: function (value) {
                                                    var tmp = "";
                                                    if (options.IsShowLabel) {
                                                        tmp = value.name;
                                                        if (options.XIsTrim && !isNullOrEmpty(tmp) && tmp.length > options.XTrimNum) {
                                                            tmp = tmp.substr(0, options.XTrimNum) + "...";
                                                        }
                                                    }
                                                    if (options.IsShowValue) {
                                                        if (options.IsShowPercentValue) {
                                                            tmp += (dss.isNullOrEmpty(tmp) ? "" : "：") + value.percent + "%";
                                                        }
                                                        else {
                                                            tmp += (dss.isNullOrEmpty(tmp) ? "" : "：") + axisFormatter(value.value, options.YFormatType, options.YUnit, options.YDecimals);
                                                        }
                                                    }

                                                    return tmp;
                                                }
                                            },
                                            labelLine: { show: options.LabelPosition == 'inner' ? false : (options.IsShowLabel || options.IsShowValue), length: 10 }//标签视觉引导线，默认显示
                                        }
                                    }
                                });

                                isHighLight = true;
                                break;
                            }
                        }

                        if (isHighLight == false) {
                            yData.push({
                                name: curName,
                                value: curValue,
                                itemStyle: {
                                    normal: {
                                        label: {
                                            show: options.IsShowLabel || options.IsShowValue,
                                            position: options.LabelPosition,
                                            //formatter: options.IsShowValue ? (options.IsShowPercentValue ? '{b}:{d}%' : '{b}:{c}') : '{b}'
                                            formatter: function (value) {
                                                var tmp = "";
                                                if (options.IsShowLabel) {
                                                    tmp = value.name;
                                                    if (options.XIsTrim && !isNullOrEmpty(tmp) && tmp.length > options.XTrimNum) {
                                                        tmp = tmp.substr(0, options.XTrimNum) + "...";
                                                    }
                                                }
                                                if (options.IsShowValue) {
                                                    if (options.IsShowPercentValue) {
                                                        tmp += (dss.isNullOrEmpty(tmp) ? "" : "：") + value.percent + "%";
                                                    }
                                                    else {
                                                        tmp += (dss.isNullOrEmpty(tmp) ? "" : "：") + axisFormatter(value.value, options.YFormatType, options.YUnit, options.YDecimals);
                                                    }
                                                }

                                                return tmp;
                                            }
                                        },
                                        labelLine: { show: options.LabelPosition == 'inner' ? false : (options.IsShowLabel || options.IsShowValue), length: 10 }//标签视觉引导线，默认显示
                                    }
                                }
                            });
                        }
                    }
                    else {
                        yData.push({
                            name: curName,
                            value: curValue,
                            itemStyle: {
                                normal: {
                                    label: {
                                        show: options.IsShowLabel || options.IsShowValue,
                                        position: options.LabelPosition,
                                        //formatter: options.IsShowValue ? (options.IsShowPercentValue ? '{b}:{d}%' : '{b}:{c}') : '{b}'
                                        formatter: function (value) {
                                            var tmp = "";
                                            if (options.IsShowLabel) {
                                                tmp = value.name;
                                                if (options.XIsTrim && !isNullOrEmpty(tmp) && tmp.length > options.XTrimNum) {
                                                    tmp = tmp.substr(0, options.XTrimNum) + "...";
                                                }
                                                tmp = strWrap(tmp, 12);
                                            }
                                            if (options.IsShowValue) {
                                                if (options.IsShowPercentValue) {
                                                    tmp += (dss.isNullOrEmpty(tmp) ? "" : "\n") + value.percent + "%";
                                                }
                                                else {
                                                    tmp += (dss.isNullOrEmpty(tmp) ? "" : "\n") + axisFormatter(value.value, options.YFormatType, options.YUnit, options.YDecimals);
                                                }
                                            }

                                            return tmp;
                                        }
                                    },
                                    labelLine: { show: options.LabelPosition == 'inner' ? false : (options.IsShowLabel || options.IsShowValue), length: 10 }//标签视觉引导线，默认显示
                                }
                            }
                        });
                    }
                }

                var seriesOpt = {
                    name: options.Title,
                    type: chartType,
                    radius: options.Pie.radius,
                    center: options.Pie.center,
                    selectedMode: "single",
                    itemStyle: {
                        normal: {
                            label: {
                                textStyle: {
                                    fontSize: options.FontSize
                                }
                            }
                        }
                    },
                    data: yData
                };

                //饼图的变种：环形饼图
                if (options.ChartType == "Doughnut") {
                    calculable = options.Pie.calculable;
                    seriesOpt = $.extend(true, seriesOpt, { radius: ['20%', '45%'] });
                }

                //饼图的变种：南丁格尔玫瑰图
                if (options.ChartType == "PieRose") {
                    calculable = true;
                    seriesOpt = $.extend(true, seriesOpt, { radius: [15, '50%'], roseType: "area" });
                }

                seriesData.push(seriesOpt);
            }
        }
        else if (chartType == "treemap") {
            calculable = false;

            colNames = xData;//饼图时图例名就是维度值

            var tmpTotal = 0;//计算总数，用于求百分比
            for (var r = 0; r < dataSource.rows.length; r++) {
                tmpTotal += parseFloat(dataSource.rows[r]["col" + (yIsNull ? 1 : yDataColIndex.split(',')[1])]);
            }

            var yData = [];
            var curTotal = 0;//为避免百分比之和不满100，最后一行的时候用100减去前面之和
            for (var r = 0; r < dataSource.rows.length; r++) {
                var curName = dataSource.rows[r]["col" + xDataColIndex];
                var curValue = parseFloat(dataSource.rows[r]["col" + (yIsNull ? 1 : yDataColIndex.split(',')[1])]);

                var yDataTmp = {
                    name: curName,
                    value: curValue,
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                x: 5,
                                y: 25,
                                textStyle: {
                                    color: "#ffffff",
                                    fontSize: 12
                                },
                                formatter: function (name, value) {
                                    var tmp = name;
                                    if (options.IsShowValue) {
                                        if (options.IsShowPercentValue) {
                                            var percent = 0;
                                            if (tmpTotal > 0) {
                                                percent = parseFloat((value / tmpTotal * 100).toFixed(0));
                                            }

                                            curTotal += percent;
                                            //为避免百分比之和不满100，最后一行的时候用100减去前面之和
                                            if (r == dataSource.rows.length - 1 && tmpTotal > 0) {
                                                tmp += "\n" + value + "\n" + (100 - curTotal) + "%";
                                            }
                                            else {
                                                tmp += "\n" + value + "\n" + percent + "%";
                                            }
                                        }
                                        else {
                                            tmp += "\n" + value;
                                        }
                                    }

                                    return tmp;
                                }
                            },
                            borderWidth: 1
                        },
                        emphasis: {
                            label: {
                                show: true
                            }
                        }
                    }
                };

                if (options.HighLight != null && options.HighLight.length > 0 && options.HighLight[0].highvales == dataSource.rows[r]["col" + xDataColIndex]) {
                    $.extend(true, yDataTmp, {
                        itemStyle: {
                            normal: {
                                color: getHightlightColor()
                            }
                        }
                    });
                }
                yData.push(yDataTmp);
            }

            //悬浮框样式
            //tooltip = null;
            tooltip = {
                trigger: 'item',
                formatter: '{b}<br/>{c}'
                //formatter: function (name, value) {
                //    var tmp = name;
                //    if (options.IsShowValue) {
                //        if (options.IsShowPercentValue) {
                //            var percent = parseFloat((value / tmpTotal * 100).toFixed(0))
                //            //为避免百分比之和不满100，最后一行的时候用100减去前面之和
                //            if (r == dataSource.rows.length - 1) {
                //                tmp += "\n" + value + "\n" + (100 - curTotal) + "%";
                //            }
                //            else {
                //                tmp += "\n" + value + "\n" + percent + "%";
                //            }
                //        }
                //        else {
                //            tmp += "\n" + value;
                //        }
                //    }

                //    return tmp;
                //}
            };

            seriesData.push({
                name: options.Title,
                type: chartType,
                center: ['50%', '50%'],//中心坐标，支持绝对值（px）和百分比
                size: ['99%', '94%'],//大小，支持绝对值（px）和百分比
                data: yData
            });
        }
        else if (chartType == "tree") {

        }
        else if (chartType == "radar") {
            //雷达图指定“最大值”
            if (cPrm.chartPlugin == "echarts2") {
                if (options.RadarMaxArray.length > 0) {//每个方向上的最大值，样例数据:[{ text: '方向1', max: 80 },{ text: '方向2', max: 90 }]
                    for (var r = 0; r < options.RadarMaxArray.length; r++) {
                        indicator.push({ text: options.RadarMaxArray[r].text, max: options.RadarMaxArray[r].max });
                    }
                }
                else if (!isNullOrEmpty(options.RadarMax)) {//各个方向上的最大值相同，比如得分100、百分比100
                    for (var r = 0; r < dataSource.rows.length; r++) {
                        indicator.push({ text: xData[r], max: options.RadarMax });
                    }
                }
                else if (!isNullOrEmpty(y2DataColIndex)) {//此处用y2DataColIndex表示最大值列的索引
                    for (var r = 0; r < dataSource.rows.length; r++) {
                        indicator.push({ text: xData[r], max: dataSource.rows[r]["col" + options.Y2DataColIndex] });
                    }
                }
                else {//未指定最大值就取每行的最大值的1.1倍作为最大值
                    for (var r = 0; r < dataSource.rows.length; r++) {
                        var rowMax = 0;//一行中的最大值
                        var curValue = 0;//当前值
                        for (var c = 1; c < dataSource.colnames.length; c++) {
                            curValue = parseFloat(dataSource.rows[r]["col" + c]);
                            if (curValue > rowMax) {
                                rowMax = curValue;
                            }
                        }
                        if (rowMax == 0) {
                            rowMax = 1;//一个轴上全为0的时候，最大值通过上面计算就是0，但此时的点会不在中心，所以将rowMax改为大于0的某个值
                        }
                        indicator.push({ text: xData[r], max: Math.ceil((rowMax * 1.1)) });
                    }
                }
            }
            else if (cPrm.chartPlugin == "echarts3") {
                if (options.RadarMaxArray.length > 0) {//每个方向上的最大值，样例数据:[{ name: '方向1', max: 80 },{ name: '方向2', max: 90 }]
                    for (var r = 0; r < options.RadarMaxArray.length; r++) {
                        indicator.push({ name: options.RadarMaxArray[r].text, max: options.RadarMaxArray[r].max });
                    }
                }
                else if (!isNullOrEmpty(options.RadarMax)) {//各个方向上的最大值相同，比如得分100、百分比100
                    for (var r = 0; r < dataSource.rows.length; r++) {
                        indicator.push({ name: xData[r], max: options.RadarMax });
                    }
                }
                else if (!isNullOrEmpty(y2DataColIndex)) {//此处用y2DataColIndex表示最大值列的索引
                    for (var r = 0; r < dataSource.rows.length; r++) {
                        indicator.push({ name: xData[r], max: dataSource.rows[r]["col" + options.Y2DataColIndex] });
                    }
                }
                else {//未指定最大值就取每行的最大值的1.1倍作为最大值
                    for (var r = 0; r < dataSource.rows.length; r++) {
                        var rowMax = 0;//一行中的最大值
                        var curValue = 0;//当前值
                        for (var c = 1; c < dataSource.colnames.length; c++) {
                            curValue = parseFloat(dataSource.rows[r]["col" + c]);
                            if (curValue > rowMax) {
                                rowMax = curValue;
                            }
                        }
                        if (rowMax == 0) {
                            rowMax = 1;//一个轴上全为0的时候，最大值通过上面计算就是0，但此时的点会不在中心，所以将rowMax改为大于0的某个值
                        }
                        indicator.push({ name: xData[r], max: Math.ceil((rowMax * 1.1).toFixed(2)) });
                    }
                }
            }

            var yData = [];//此值为对象，表示雷达图的所有指标的值
            //遍历每列，c为列索引
            for (var c = 1; c < dataSource.colnames.length; c++) {
                var isInY = yDataColIndex.indexOf("," + c.toString() + ',') >= 0 ? true : false;
                var isInY2 = y2DataColIndex.indexOf("," + c.toString() + ',') >= 0 ? true : false;

                //雷达图的各指标用yDataColIndex表示
                if ((!isInY2) && (yIsNull || isInY)) {
                    var value = [];//一个指标的所有值
                    //遍历每行，r为行索引
                    for (var r = 0; r < dataSource.rows.length; r++) {
                        value.push(toFloat(dataSource.rows[r]["col" + c]));
                    }
                    //此值为对象，表示雷达图的“所有指标”的值
                    yData.push({
                        value: value,
                        name: dataSource.colnames[c]
                    });
                    colNames.push(dataSource.colnames[c]);//显示的列名，即图例名，就是指标名
                }
            }
            seriesData.push({
                name: options.Title,
                type: chartType,//指定图表类型
                itemStyle: itemStyle,
                data: yData//指定数据值
            });

            legend = {
                orient: 'vertical',
                x: 'right'
            };
        }
        else if (chartType == "map") {
            //根据列名显示单位
            if (!options.YUnit && options.DataSource) {
                var yIdx = parseInt(options.YDataColIndex || 1);
                options.YUnit = getUnit(options.DataSource.colnames[yIdx]);
            }

            if (options.MapRangeOrLegend == "legend") {
                if (cPrm.chartPlugin == "echarts3") {
                    //悬浮框样式
                    if (options.IsShowPercentValue) {
                        tooltip = {
                            trigger: 'item',
                            formatter: '{b}<br/>{c}%'
                        };
                    }
                    else {
                        tooltip = {
                            trigger: 'item',
                            formatter: function (v) {
                                return v.name + "<br/>" + axisFormatter(v.value, options.YFormatType, options.YUnit);
                            }
                        };
                    }

                    var yData = [];//datatable一列的值
                    //用xData表示地图中的各个区域，把区域看成维度，如果未指定就默认为西藏的，为查看实例用
                    if (xData.length == 0) {
                        xData = ["阿里地区", "那曲地区", "日喀则地区", "拉萨市"];
                    }

                    var c = 1;//列索引
                    if (!yIsNull) {
                        c = options.YDataColIndex.split(',')[0];
                    }

                    //遍历每行，r为行索引
                    for (var r = 0; r < dataSource.rows.length; r++) {
                        yData.push({
                            name: xData[r],
                            value: toFloat(dataSource.rows[r]["col" + c])
                        });
                    }

                    var tmpOpt = {
                        type: 'map',
                        mapType: options.MapType[0],
                        selectedMode: 'single',
                        roam: options.Map.roam,
                        zoom: options.Map.zoom,
                        label: {
                            normal: {
                                show: true
                            }
                        },
                        data: yData
                    };

                    if (options.Map.center.length > 0) {
                        $.extend(true, tmpOpt, {
                            center: options.Map.center
                        });
                    }

                    seriesData.push(tmpOpt);

                    var pieces = [];
                    $.each(options.MapLegend, function (i, item) {
                        pieces.push({
                            min: item.min,
                            max: item.max,
                            label: item.name,
                            color: item.color
                        });
                    });

                    visualMap = {
                        show: options.IsShowLegend,
                        type: 'piecewise',
                        left: options.LegendPosition.indexOf("RIGHT") >= 0 ? 'right' : (options.LegendPosition.indexOf("LEFT") >= 0 ? 'left' : 'center'),
                        top: options.LegendPosition.indexOf("TOP") >= 0 ? 'top' : (options.LegendPosition.indexOf("BOTTOM") >= 0 ? 'bottom' : 'center'),
                        pieces: pieces,
                        calculable: true
                    };
                }
                else if (cPrm.chartPlugin == "echarts2") {
                    //悬浮框样式
                    if (options.IsShowPercentValue) {
                        tooltip = {
                            trigger: 'item',
                            formatter: '{b}<br/>{c}%'
                        };
                    }
                    else {
                        tooltip = {
                            trigger: 'item',
                            formatter: function (v) {
                                return v.name + "<br/>" + axisFormatter(v.value, options.YFormatType, options.YUnit);
                            }
                        };
                    }
                    var legendNames = [];

                    //先增加一个序列，设置无数据区块的颜色
                    var tmpSeries = {
                        type: 'map',
                        mapType: options.MapType[0],
                        selectedMode: 'single',
                        itemStyle: {
                            normal: {
                                label: { show: true }
                            },
                            emphasis: { label: { show: true } }
                        },
                        data: []
                    };

                    if (options.Map.areaColor != "auto") {
                        $.extend(true, tmpSeries, {
                            itemStyle: {
                                normal: {
                                    areaStyle: { color: options.Map.areaColor }
                                }
                            }
                        });
                    }

                    seriesData.push(tmpSeries);

                    var yData = [];//datatable一列的值
                    //用xData表示地图中的各个区域，把区域看成维度，如果未指定就默认为西藏的，为查看实例用
                    if (xData.length == 0) {
                        xData = ["阿里地区", "那曲地区", "日喀则地区", "拉萨市"];
                    }

                    var c = 1;//列索引
                    if (!yIsNull) {
                        c = options.YDataColIndex.split(',')[0];
                    }

                    colNames = dataSource.colnames[c];//图例名

                    var tmpColorArray = [];
                    var tmpMax = null;
                    var tmpMin = null;
                    for (var i = 0; i < options.MapLegend.length; i++) {
                        tmpColorArray.push(options.MapLegend[i].color);

                        tmpMax = options.MapLegend[i].max;
                        tmpMin = options.MapLegend[i].min;

                        yData = [];
                        var tmpName = "";
                        var tmpValue = 0;

                        //遍历每行，r为行索引
                        for (var r = 0; r < dataSource.rows.length; r++) {
                            tmpName = xData[r];
                            tmpValue = toFloat(dataSource.rows[r]["col" + c]);

                            if (tmpMax == null) {
                                if (tmpMin == null) {
                                    yData.push({
                                        name: tmpName,
                                        value: tmpValue
                                    });
                                }
                                else if (tmpValue > tmpMin) {
                                    yData.push({
                                        name: tmpName,
                                        value: tmpValue
                                    });
                                }
                            }
                            else if (tmpValue <= tmpMax) {
                                if (tmpMin == null) {
                                    yData.push({
                                        name: tmpName,
                                        value: tmpValue
                                    });
                                }
                                else if (tmpValue > tmpMin) {
                                    yData.push({
                                        name: tmpName,
                                        value: tmpValue
                                    });
                                }
                            }
                        }

                        seriesData.push({
                            name: options.MapLegend[i].name,
                            type: 'map',
                            mapType: options.MapType[0],
                            selectedMode: 'single',
                            roam: options.Map.roam,
                            itemStyle: {
                                normal: {
                                    label: { show: true },
                                    areaStyle: { color: options.MapLegend[i].color }
                                },
                                emphasis: { label: { show: true } }
                            },
                            data: yData
                        });

                        legendNames.push(options.MapLegend[i].name);
                    }

                    //ColorArr的颜色未指定的话，按options.MapLegend的来
                    if (options.ColorArr.length == 0) {
                        options.ColorArr = tmpColorArray;
                    }

                    legend = {
                        show: options.IsShowLegend,
                        orient: (options.LegendPosition.indexOf("RIGHT") >= 0 || options.LegendPosition.indexOf("LEFT") >= 0) ? 'vertical' : 'horizontal',
                        x: options.LegendPosition.indexOf("RIGHT") >= 0 ? 'right' : (options.LegendPosition.indexOf("LEFT") >= 0 ? 'left' : 'center'),
                        y: options.LegendPosition.indexOf("TOP") >= 0 ? 'top' : (options.LegendPosition.indexOf("BOTTOM") >= 0 ? 'bottom' : 'center'),
                        data: legendNames
                    };
                }
            }
            else {
                //悬浮框样式
                tooltip = {
                    trigger: 'item',
                    formatter: function (v) {
                        return v.name + "<br/>" + axisFormatter(v.value, options.YFormatType, options.YUnit);
                    }
                };

                //先增加一个序列，设置无数据区块的颜色
                var tmpSeries = {
                    type: 'map',
                    mapType: options.MapType[0],
                    selectedMode: 'single',
                    zoom: options.Map.zoom,
                    roam: options.Map.roam,
                    itemStyle: {
                        normal: {
                            label: { show: true }
                        },
                        emphasis: { label: { show: true } }
                    },
                    data: []
                };

                if (options.Map.center.length > 0) {
                    $.extend(true, tmpSeries, {
                        center: options.Map.center
                    });
                }

                if (options.Map.areaColor != "auto") {
                    $.extend(true, tmpSeries, {
                        itemStyle: {
                            normal: {
                                areaStyle: { color: options.Map.areaColor }
                            }
                        }
                    });
                }

                seriesData.push(tmpSeries);

                var yData = [];//datatable一列的值
                //用xData表示地图中的各个区域，把区域看成维度，如果未指定就默认为西藏的，为查看实例用
                if (xData.length == 0) {
                    xData = ["阿里地区", "那曲地区", "日喀则地区", "拉萨市"];
                }
                //遍历每列，c为列索引
                for (var c = 1; c < dataSource.colnames.length; c++) {
                    var isInY = yDataColIndex.indexOf("," + c.toString() + ',') >= 0 ? true : false;
                    var isInY2 = y2DataColIndex.indexOf("," + c.toString() + ',') >= 0 ? true : false;
                    if (yIsNull || isInY) {
                        //遍历每行，r为行索引
                        for (var r = 0; r < dataSource.rows.length; r++) {
                            yData.push({
                                name: xData[r],
                                value: toFloat(dataSource.rows[r]["col" + c])
                            });
                        }
                    }
                    colNames = dataSource.colnames[c];//图例名
                }

                if (options.LegendPosition == "BOTTOM") {
                    options.LegendPosition = "LEFTBOTTOM";
                }

                //数值范围，根据此范围各个区域可以显示不同的颜色
                dataRange = {
                    orient: (options.LegendPosition.indexOf("RIGHT") >= 0 || options.LegendPosition.indexOf("LEFT") >= 0) ? 'vertical' : 'horizontal',
                    x: options.LegendPosition.indexOf("RIGHT") >= 0 ? 'right' : (options.LegendPosition.indexOf("LEFT") >= 0 ? 'left' : 'center'),
                    y: options.LegendPosition.indexOf("TOP") >= 0 ? 'top' : (options.LegendPosition.indexOf("BOTTOM") >= 0 ? 'bottom' : 'center'),
                    min: getMaxMinValue(options).min,
                    max: getMaxMinValue(options).max,
                    color: options.Map.rangeColor,
                    text: ['高', '低'],// 文本，默认为数值文本
                    calculable: true,
                    formatter: function (value) {
                        return axisFormatter(value, options.YFormatType, options.YUnit, options.YDecimals);
                    },
                    precision: options.YDecimals//小数位数
                };
                seriesData.push({
                    name: options.Title,
                    type: chartType,//指定图表类型
                    selectedMode: 'single',
                    mapType: options.MapType[0],
                    zoom: options.Map.zoom,
                    roam: options.Map.roam,
                    itemStyle: {
                        normal: {
                            label: { show: true }
                        },
                        emphasis: { label: { show: true } }
                    },
                    data: yData//指定数据值
                });
            }
        }
        else if (chartType == "MapFlowOut" || chartType == "MapFlowIn") {
            if (cPrm.chartPlugin == "echarts3") {
                tooltip = {
                    trigger: 'item'
                };

                //数值范围，根据此范围各个区域可以显示不同的颜色
                visualMap = {
                    show: options.IsShowLegend,
                    left: 'right',
                    top: 'bottom',
                    min: getMaxMinValue(options, options.YDataColIndex).min,
                    max: getMaxMinValue(options, options.YyDataColIndex).max,
                    color: options.Map.rangeColor,
                    calculable: true,
                    formatter: function (value) {
                        return axisFormatter(value, options.YFormatType, options.YUnit, options.YDecimals);
                    },
                    precision: options.YDecimals//小数位数
                };


                //获得legend的数据源
                var x1 = options.XDataColIndex.split(',')[0];//流出
                var x2 = options.XDataColIndex.split(',')[1];//流入
                var xStr = "";
                var x1Str = "";
                var x2Str = "";

                for (var r = 0; r < dataSource.rows.length; r++) {
                    if (options.ChartType == "MapFlowIn") {//流入
                        x2Str = dataSource.rows[r]['col' + x2];
                        if (xStr.indexOf(x2Str) < 0) {
                            xStr += x2Str + ",";
                        }
                    }
                    else {//流出
                        x1Str = dataSource.rows[r]['col' + x1];
                        if (xStr.indexOf(x1Str) < 0) {
                            xStr += x1Str + ",";
                        }
                    }
                }

                xData = xStr.substr(0, xStr.length - 1).split(',');
                colNames = xData;//legend的数据源

                legend = {
                    show: options.IsShowLegend,
                    orient: (options.LegendPosition.indexOf("RIGHT") >= 0 || options.LegendPosition.indexOf("LEFT") >= 0) ? 'vertical' : 'horizontal',
                    x: options.LegendPosition.indexOf("RIGHT") >= 0 ? 'right' : (options.LegendPosition.indexOf("LEFT") >= 0 ? 'left' : 'center'),
                    y: options.LegendPosition.indexOf("TOP") >= 0 ? 'top' : (options.LegendPosition.indexOf("BOTTOM") >= 0 ? 'bottom' : 'center'),
                    data: colNames,
                    //textStyle: {
                    //    color: 'auto'
                    //},
                    padding: [10, 5, options.LegendRowCount == 3 ? 30 : 8, 5]
                };

                var mapType = "";
                if (options.MapType[0] == "world") {
                    mapType = "world";
                }
                else {
                    mapType = "china";
                }

                getGeoCoord(mapType);

                var convertData = function (data) {
                    var res = [];
                    for (var i = 0; i < data.length; i++) {
                        var dataItem = data[i];
                        var fromCoord = cPrm.geoCoord[mapType][dataItem[0].name];
                        var toCoord = cPrm.geoCoord[mapType][dataItem[1].name];
                        if (fromCoord && toCoord) {
                            res.push({
                                fromName: dataItem[0].name,
                                toName: dataItem[1].name,
                                coords: [fromCoord, toCoord],
                                value: dataItem[1].value
                            });
                        }
                    }
                    return res;
                };

                var yColIndex = yIsNull ? 1 : options.YDataColIndex;

                var data = [];

                for (var i = 0; i < xData.length; i++) {
                    var yDataLine = [];

                    for (var r = 0; r < dataSource.rows.length; r++) {
                        if (dataSource.rows[r]['col' + (options.ChartType == "MapFlowIn" ? x2 : x1)] == xData[i]) {
                            yDataLine.push([{ name: dataSource.rows[r]['col' + x1] }, { name: dataSource.rows[r]['col' + x2], value: dataSource.rows[r]['col' + yColIndex] }]);
                        }
                    }

                    data.push([xData[i], yDataLine]);
                }

                var planePath = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z';
                var series = [];

                $.each(data, function (i, item) {
                    series.push({
                        name: item[0],
                        type: 'lines',
                        zlevel: 1,
                        effect: {
                            show: true,
                            period: 10,
                            trailLength: 0.7,
                            color: '#fff',
                            symbolSize: 3
                        },
                        tooltip: {
                            formatter: function (v) {
                                return v.data.fromName + ">" + v.data.toName + "<br/>" + v.data.value;
                            }
                        },
                        lineStyle: {
                            normal: {
                                width: 0.2,
                                curveness: 0.2
                            }
                        },
                        data: convertData(item[1])
                    },
                    {
                        name: item[0],
                        type: 'lines',
                        zlevel: 2,
                        effect: {
                            show: true,
                            period: 10,
                            trailLength: 0,
                            symbol: planePath,
                            symbolSize: 15
                        },
                        tooltip: {
                            formatter: function (v) {
                                return v.data.fromName + ">" + v.data.toName + "<br/>" + v.data.value;
                            }
                        },
                        lineStyle: {
                            normal: {
                                width: 0.5,
                                opacity: 0.4,
                                curveness: 0.2
                            }
                        },
                        data: convertData(item[1])
                    },
                    {
                        name: item[0],
                        type: 'effectScatter',
                        coordinateSystem: 'geo',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'right'
                            }
                        },
                        tooltip: {
                            formatter: function (v) {
                                var str = v.seriesName + ">" + v.name + "<br/>" + v.value[2];
                                if (options.ChartType == "MapFlowIn") {
                                    str = v.name + ">" + v.seriesName + "<br/>" + v.value[2];
                                }
                                return str;
                            }
                        },
                        symbolSize: function (v) {
                            var tmpMax = getMaxMinValue(options, yColIndex).max;
                            var tmpSize = v[2] / tmpMax * 20;//圆圈的最大半径为20
                            if (tmpSize < 10) {
                                tmpSize = 10;
                            }
                            return tmpSize;
                        },
                        data: item[1].map(function (dataItem) {
                            return {
                                name: dataItem[options.ChartType == "MapFlowIn" ? 0 : 1].name,
                                value: cPrm.geoCoord[mapType][dataItem[options.ChartType == "MapFlowIn" ? 0 : 1].name].concat([dataItem[1].value])
                            };
                        })
                    });
                });

                seriesData = series;
            }
            else if (cPrm.chartPlugin == "echarts2") {
                //数值范围，根据此范围各个区域可以显示不同的颜色
                dataRange = {
                    x: "right",
                    y: "bottom",
                    min: getMaxMinValue(options).min,
                    max: getMaxMinValue(options).max,
                    color: options.Map.rangeColor,
                    calculable: true,
                    formatter: function (value) {
                        if (!isNullOrEmpty(options.YUnit)) {
                            return value + '（' + options.YUnit + '）';
                        }
                        else {
                            return value;
                        }
                    },
                    precision: options.YDecimals,//小数位数
                    textStyle: {
                        color: 'auto'
                    }
                };

                //获得legend的数据源
                var x1 = options.XDataColIndex.split(',')[0];//流出
                var x2 = options.XDataColIndex.split(',')[1];//流入
                var xStr = "";
                var x1Str = "";
                var x2Str = "";

                for (var r = 0; r < dataSource.rows.length; r++) {
                    if (options.ChartType == "MapFlowIn") {//流入
                        x2Str = dataSource.rows[r]['col' + x2];
                        if (xStr.indexOf(x2Str) < 0) {
                            xStr += x2Str + ",";
                        }
                    }
                    else {//流出
                        x1Str = dataSource.rows[r]['col' + x1];
                        if (xStr.indexOf(x1Str) < 0) {
                            xStr += x1Str + ",";
                        }
                    }
                }

                xData = xStr.substr(0, xStr.length - 1).split(',');
                colNames = xData;//legend的数据源

                legend = {
                    show: options.IsShowLegend,
                    orient: (options.LegendPosition.indexOf("RIGHT") >= 0 || options.LegendPosition.indexOf("LEFT") >= 0) ? 'vertical' : 'horizontal',
                    x: options.LegendPosition.indexOf("RIGHT") >= 0 ? 'right' : (options.LegendPosition.indexOf("LEFT") >= 0 ? 'left' : 'center'),
                    y: options.LegendPosition.indexOf("TOP") >= 0 ? 'top' : (options.LegendPosition.indexOf("BOTTOM") >= 0 ? 'bottom' : 'center'),
                    data: colNames,
                    //textStyle: {
                    //    color: 'auto'
                    //},
                    padding: [10, 5, options.LegendRowCount == 3 ? 30 : 8, 5]
                };

                var mapType = "";
                if (options.MapType[0] == "world") {
                    mapType = "world";
                }
                else {
                    mapType = "china";
                }

                getGeoCoord(mapType);

                seriesData.push({
                    name: options.MapType[0],
                    type: 'map',
                    roam: options.Map.roam,
                    hoverable: false,
                    mapType: options.MapType[0],
                    itemStyle: {
                        normal: {
                            borderColor: options.Map.borderColor,
                            borderWidth: 1,
                            areaStyle: {
                                color: options.Map.areaColor
                            }
                        }
                    },
                    data: [],
                    markLine: {
                        smooth: true,
                        symbol: ['none', 'circle'],
                        symbolSize: 1,
                        itemStyle: {
                            normal: {
                                borderWidth: 1,
                                borderColor: 'rgba(30,144,255,0.5)'
                            }
                        },
                        data: []
                    },
                    geoCoord: cPrm.geoCoord[mapType]
                });

                var yColIndex = yIsNull ? 1 : options.YDataColIndex;

                for (var i = 0; i < xData.length; i++) {
                    var yDataLine = [];
                    var yDataPoint = [];

                    for (var r = 0; r < dataSource.rows.length; r++) {
                        if (dataSource.rows[r]['col' + (options.ChartType == "MapFlowIn" ? x2 : x1)] == xData[i]) {
                            yDataLine.push([{ name: dataSource.rows[r]['col' + x1] }, { name: dataSource.rows[r]['col' + x2], value: dataSource.rows[r]['col' + yColIndex] }]);
                            yDataPoint.push({ name: dataSource.rows[r]['col' + (options.ChartType == "MapFlowIn" ? x1 : x2)], value: dataSource.rows[r]['col' + yColIndex] });
                        }
                    }

                    var tmpSeries = {
                        name: xData[i],
                        type: 'map',
                        mapType: options.MapType[0],
                        data: [],
                        markLine: {
                            smooth: true,
                            effect: {
                                show: true,
                                scaleSize: 1,
                                period: 30,
                                color: '#fff',
                                shadowBlur: 10
                            },
                            itemStyle: {
                                normal: {
                                    borderWidth: 1,
                                    label: {
                                        show: options.IsShowValue,
                                        position: options.ChartType == "MapFlowIn" ? 'start' : 'end'//流入时显示在起点，流出时显示在终点
                                    },
                                    lineStyle: {
                                        type: 'solid',
                                        shadowBlur: 10
                                    }
                                }
                            },
                            data: yDataLine
                        },
                        markPoint: {
                            symbol: 'emptyCircle',
                            symbolSize: function (v) {
                                var tmpMax = getMaxMinValue(options).max;
                                return v / tmpMax * 20;//圆圈的最大半径为20
                            },
                            effect: {
                                show: true,
                                shadowBlur: 0
                            },
                            itemStyle: {
                                normal: {
                                    label: { show: false }
                                },
                                emphasis: {
                                    label: { position: 'top' }
                                }
                            },
                            data: yDataPoint
                        }
                    };

                    $.extend(true, tmpSeries, options.Original.series);

                    seriesData.push(tmpSeries);
                }
            }
        }
        else if (chartType == "MapFlowOneOut" || chartType == "MapFlowOneIn") {
            if (cPrm.chartPlugin == "echarts3") {
                tooltip = {
                    trigger: 'item'
                };

                var pieces = [];
                $.each(options.MapLegend, function (i, item) {
                    pieces.push({
                        min: item.min,
                        max: item.max,
                        label: item.name,
                        color: item.color
                    });
                });

                visualMap = {
                    show: options.IsShowLegend,
                    type: 'piecewise',
                    left: options.LegendPosition.indexOf("RIGHT") >= 0 ? 'right' : (options.LegendPosition.indexOf("LEFT") >= 0 ? 'left' : 'center'),
                    top: options.LegendPosition.indexOf("TOP") >= 0 ? 'top' : (options.LegendPosition.indexOf("BOTTOM") >= 0 ? 'bottom' : 'center'),
                    pieces: pieces,
                    calculable: true
                };

                //获得legend的数据源
                var x1 = options.XDataColIndex.split(',')[0];//流出
                var x2 = options.XDataColIndex.split(',')[1];//流入
                var xStr = "";
                var x1Str = "";
                var x2Str = "";

                for (var r = 0; r < dataSource.rows.length; r++) {
                    if (options.ChartType == "MapFlowOneIn") {//流入
                        x2Str = dataSource.rows[r]['col' + x2];
                        if (xStr.indexOf(x2Str) < 0) {
                            xStr += x2Str + ",";
                        }
                    }
                    else {//流出
                        x1Str = dataSource.rows[r]['col' + x1];
                        if (xStr.indexOf(x1Str) < 0) {
                            xStr += x1Str + ",";
                        }
                    }
                }

                xData = xStr.substr(0, xStr.length - 1).split(',');

                var mapType = "";
                if (options.MapType[0] == "world") {
                    mapType = "world";
                }
                else {
                    mapType = "china";
                }

                if (dataSource.rows.length > 0) {
                    getGeoCoord(mapType);

                    var convertData = function (data) {
                        var res = [];
                        for (var i = 0; i < data.length; i++) {
                            var dataItem = data[i];
                            var fromCoord = cPrm.geoCoord[mapType][dataItem[0].name];
                            var toCoord = cPrm.geoCoord[mapType][dataItem[1].name];
                            if (fromCoord && toCoord) {
                                res.push({
                                    fromName: dataItem[0].name,
                                    toName: dataItem[1].name,
                                    coords: [fromCoord, toCoord],
                                    value: dataItem[1].value
                                });
                            }
                        }
                        return res;
                    };

                    var yColIndex = yIsNull ? 1 : options.YDataColIndex;

                    var data = [];

                    for (var i = 0; i < xData.length; i++) {
                        var yDataLine = [];

                        for (var r = 0; r < dataSource.rows.length; r++) {
                            if (dataSource.rows[r]['col' + (options.ChartType == "MapFlowOneIn" ? x2 : x1)] == xData[i]) {
                                yDataLine.push([{ name: dataSource.rows[r]['col' + x1] }, { name: dataSource.rows[r]['col' + x2], value: dataSource.rows[r]['col' + yColIndex] }]);
                            }
                        }

                        data.push([xData[i], yDataLine]);
                    }

                    var planePath = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z';

                    var series = [];

                    $.each(data, function (i, item) {
                        series.push({
                            name: item[0],
                            type: 'lines',
                            zlevel: 1,
                            effect: {
                                show: true,
                                period: 10,
                                trailLength: 0.7,
                                color: '#fff',
                                symbolSize: 3
                            },
                            tooltip: {
                                formatter: function (v) {
                                    return v.data.fromName + ">" + v.data.toName + "<br/>" + v.data.value;
                                }
                            },
                            lineStyle: {
                                normal: {
                                    width: 0.2,
                                    curveness: 0.2
                                }
                            },
                            data: convertData(item[1])
                        },
                        {
                            name: item[0],
                            type: 'lines',
                            zlevel: 2,
                            effect: {
                                show: true,
                                period: 10,
                                trailLength: 0,
                                symbol: planePath,
                                symbolSize: 15
                            },
                            tooltip: {
                                formatter: function (v) {
                                    return v.data.fromName + ">" + v.data.toName + "<br/>" + v.data.value;
                                }
                            },
                            lineStyle: {
                                normal: {
                                    width: 1,
                                    opacity: 0.4,
                                    curveness: 0.2
                                }
                            },
                            data: convertData(item[1])
                        },
                        {
                            name: item[0],
                            type: 'effectScatter',
                            coordinateSystem: 'geo',
                            zlevel: 2,
                            rippleEffect: {
                                brushType: 'stroke'
                            },
                            label: {
                                normal: {
                                    show: true,
                                    position: 'right'
                                }
                            },
                            tooltip: {
                                formatter: function (v) {
                                    var str = v.seriesName + ">" + v.name + "<br/>" + v.value[2];
                                    if (options.ChartType == "MapFlowOneIn") {
                                        str = v.name + ">" + v.seriesName + "<br/>" + v.value[2];
                                    }
                                    return str;
                                }
                            },
                            symbolSize: function (v) {
                                var tmpMax = getMaxMinValue(options, yColIndex).max;
                                var tmpSize = v[2] / tmpMax * 20;//圆圈的最大半径为20
                                if (tmpSize < 5) {
                                    tmpSize = 5;
                                }
                                return tmpSize;
                            },
                            data: item[1].map(function (dataItem) {
                                return {
                                    name: dataItem[options.ChartType == "MapFlowOneIn" ? 0 : 1].name,
                                    value: cPrm.geoCoord[mapType][dataItem[options.ChartType == "MapFlowOneIn" ? 0 : 1].name].concat([dataItem[1].value])
                                };
                            })
                        });
                    });

                    seriesData = series;
                }
            }
            else if (cPrm.chartPlugin == "echarts2") {
                //得到地区的经纬度，作为流向图的准确起始地点
                var mapType = "";
                if (options.MapType[0] == "world") {
                    mapType = "world";
                }
                else {
                    mapType = "china";
                }

                getGeoCoord(mapType);

                seriesData.push({
                    name: options.MapType[0],
                    type: 'map',
                    roam: options.Map.roam,
                    hoverable: false,
                    mapType: options.MapType[0],
                    tooltip: {
                        show: false
                    },
                    itemStyle: {
                        normal: {
                            borderColor: options.Map.borderColor,
                            borderWidth: 1,
                            areaStyle: {
                                color: options.Map.areaColor
                            }
                        }
                    },
                    data: [],
                    markLine: {
                        smooth: true,
                        symbol: ['none', 'circle'],
                        symbolSize: 1,
                        itemStyle: {
                            normal: {
                                borderWidth: 1,
                                borderColor: 'rgba(30,144,255,0.5)'
                            }
                        },
                        data: []
                    },
                    geoCoord: cPrm.geoCoord[mapType]
                });

                var x1 = options.XDataColIndex.split(',')[0];//流出
                var x2 = options.XDataColIndex.split(',')[1];//流入

                if (options.MapRangeOrLegend == "legend") {
                    //悬浮框样式
                    if (options.IsShowPercentValue) {
                        tooltip = {
                            trigger: 'item',
                            formatter: '{b}<br/>{c}%'
                        };
                    }
                    else {
                        tooltip = {
                            trigger: 'item',
                            formatter: '{b}<br/>{c}'
                        };
                    }
                    var legendNames = [];

                    var yData = [];//datatable一列的值
                    //用xData表示地图中的各个区域，把区域看成维度，如果未指定就默认为西藏的，为查看实例用
                    if (xData.length == 0) {
                        xData = ["阿里地区", "那曲地区", "日喀则地区", "拉萨市"];
                    }

                    var c = 1;//列索引
                    if (!yIsNull) {
                        c = options.YDataColIndex.split(',')[0];
                    }

                    var tmpColorArray = [];
                    var tmpMax = null;
                    var tmpMin = null;
                    for (var i = 0; i < options.MapLegend.length; i++) {
                        tmpColorArray.push(options.MapLegend[i].color);

                        tmpMax = options.MapLegend[i].max;
                        tmpMin = options.MapLegend[i].min;

                        var tmpValue = 0;

                        var tmpLine = null;
                        var tmpPoint = null;
                        var yDataLine = [];
                        var yDataPoint = [];

                        //遍历每行，r为行索引
                        for (var r = 0; r < dataSource.rows.length; r++) {
                            tmpValue = toFloat(dataSource.rows[r]["col" + c]);
                            tmpLine = [{ name: dataSource.rows[r]['col' + x1] }, { name: dataSource.rows[r]['col' + x2], value: dataSource.rows[r]['col' + c] }];
                            tmpPoint = { name: dataSource.rows[r]['col' + (options.ChartType == "MapFlowOneIn" ? x1 : x2)], value: dataSource.rows[r]['col' + c] };

                            if (tmpMax == null) {
                                if (tmpMin == null) {
                                    yDataLine.push(tmpLine);
                                    yDataPoint.push(tmpPoint);
                                }
                                else if (tmpValue > tmpMin) {
                                    yDataLine.push(tmpLine);
                                    yDataPoint.push(tmpPoint);
                                }
                            }
                            else if (tmpValue <= tmpMax) {
                                if (tmpMin == null) {
                                    yDataLine.push(tmpLine);
                                    yDataPoint.push(tmpPoint);
                                }
                                else if (tmpValue > tmpMin) {
                                    yDataLine.push(tmpLine);
                                    yDataPoint.push(tmpPoint);
                                }
                            }
                        }

                        var tmpSeries = {
                            name: options.MapLegend[i].name,
                            type: 'map',
                            mapType: options.MapType[0],
                            data: [],
                            markLine: {
                                smooth: true,
                                effect: {
                                    show: true,
                                    scaleSize: 1,
                                    period: 30,
                                    color: '#fff',
                                    shadowBlur: 10
                                },
                                itemStyle: {
                                    normal: {
                                        color: options.MapLegend[i].color,
                                        borderWidth: 1,
                                        label: {
                                            show: options.IsShowValue,
                                            position: options.ChartType == "MapFlowOneIn" ? 'start' : 'end'//流入时显示在起点，流出时显示在终点
                                        },
                                        lineStyle: {
                                            type: 'solid',
                                            shadowBlur: 10
                                        }
                                    }
                                },
                                data: yDataLine
                            },
                            markPoint: {
                                symbol: 'emptyCircle',
                                symbolSize: function (v) {
                                    var tmpMax = getMaxMinValue(options).max;
                                    return v / tmpMax * 20;//圆圈的最大半径为20
                                },
                                effect: {
                                    show: true,
                                    shadowBlur: 0
                                },
                                itemStyle: {
                                    normal: {
                                        color: options.MapLegend[i].color,
                                        label: { show: false }
                                    },
                                    emphasis: {
                                        label: { position: 'top' }
                                    }
                                },
                                data: yDataPoint
                            }
                        };

                        $.extend(true, tmpSeries, options.Original.series);

                        seriesData.push(tmpSeries);

                        legendNames.push(options.MapLegend[i].name);
                    }

                    //ColorArr的颜色未指定的话，按options.MapLegend的来
                    if (options.ColorArr.length == 0) {
                        options.ColorArr = tmpColorArray;
                    }

                    legend = {
                        show: options.IsShowLegend,
                        orient: (options.LegendPosition.indexOf("RIGHT") >= 0 || options.LegendPosition.indexOf("LEFT") >= 0) ? 'vertical' : 'horizontal',
                        x: options.LegendPosition.indexOf("RIGHT") >= 0 ? 'right' : (options.LegendPosition.indexOf("LEFT") >= 0 ? 'left' : 'center'),
                        y: options.LegendPosition.indexOf("TOP") >= 0 ? 'top' : (options.LegendPosition.indexOf("BOTTOM") >= 0 ? 'bottom' : 'center'),
                        data: legendNames
                    };
                }
            }
        }
        else if (chartType == "MapScatter") {
            if (cPrm.chartPlugin == "echarts3") {
                //获得legend的数据源
                var x0 = options.XDataColIndex.split(',')[0];
                var xStr = "";
                var x0Str = "";

                for (var r = 0; r < dataSource.rows.length; r++) {
                    x0Str = dataSource.rows[r]['col' + x0];
                    if (xStr.indexOf(x0Str) < 0) {
                        xStr += x0Str + ",";
                    }
                }

                xData = xStr.substr(0, xStr.length - 1).split(',');
                colNames = xData;//legend的数据源

                legend = {
                    show: options.IsShowLegend,
                    orient: (options.LegendPosition.indexOf("RIGHT") >= 0 || options.LegendPosition.indexOf("LEFT") >= 0) ? 'vertical' : 'horizontal',
                    x: options.LegendPosition.indexOf("RIGHT") >= 0 ? 'right' : (options.LegendPosition.indexOf("LEFT") >= 0 ? 'left' : 'center'),
                    y: options.LegendPosition.indexOf("TOP") >= 0 ? 'top' : (options.LegendPosition.indexOf("BOTTOM") >= 0 ? 'bottom' : 'center'),
                    data: colNames,
                    //textStyle: {
                    //    color: 'auto'
                    //},
                    padding: [10, 5, options.LegendRowCount == 3 ? 30 : 8, 5]
                };

                var x1 = options.XDataColIndex.split(',')[1];//markPoint的data的name
                var x2 = options.XDataColIndex.split(',')[2];//经度
                var x3 = options.XDataColIndex.split(',')[3];//纬度

                var yColIndex = yIsNull ? 1 : options.YDataColIndex;

                for (var i = 0; i < xData.length; i++) {
                    var yDataPoint = [];

                    for (var r = 0; r < dataSource.rows.length; r++) {
                        if (dataSource.rows[r]['col' + x0] == xData[i]) {
                            yDataPoint.push([
                                dataSource.rows[r]['col' + x2], dataSource.rows[r]['col' + x3], dataSource.rows[r]['col' + yColIndex]
                            ]);
                        }
                    }

                    var tmpSeries = {
                        name: xData[i],
                        type: 'effectScatter',
                        coordinateSystem: 'geo',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        symbol: 'diamond',
                        symbolSize: 2,
                        data: yDataPoint
                    };

                    $.extend(true, tmpSeries, options.Original.series);

                    seriesData.push(tmpSeries);
                }
            }
            else if (cPrm.chartPlugin == "echarts2") {
                //获得legend的数据源
                var x0 = options.XDataColIndex.split(',')[0];
                var xStr = "";
                var x0Str = "";

                for (var r = 0; r < dataSource.rows.length; r++) {
                    x0Str = dataSource.rows[r]['col' + x0];
                    if (xStr.indexOf(x0Str) < 0) {
                        xStr += x0Str + ",";
                    }
                }

                xData = xStr.substr(0, xStr.length - 1).split(',');
                colNames = xData;//legend的数据源

                legend = {
                    show: options.IsShowLegend,
                    orient: (options.LegendPosition.indexOf("RIGHT") >= 0 || options.LegendPosition.indexOf("LEFT") >= 0) ? 'vertical' : 'horizontal',
                    x: options.LegendPosition.indexOf("RIGHT") >= 0 ? 'right' : (options.LegendPosition.indexOf("LEFT") >= 0 ? 'left' : 'center'),
                    y: options.LegendPosition.indexOf("TOP") >= 0 ? 'top' : (options.LegendPosition.indexOf("BOTTOM") >= 0 ? 'bottom' : 'center'),
                    data: colNames,
                    //textStyle: {
                    //    color: 'auto'
                    //},
                    padding: [10, 5, options.LegendRowCount == 3 ? 30 : 8, 5]
                };

                var x1 = options.XDataColIndex.split(',')[1];//markPoint的data的name
                var x2 = options.XDataColIndex.split(',')[2];//经度
                var x3 = options.XDataColIndex.split(',')[3];//纬度

                var yColIndex = yIsNull ? 1 : options.YDataColIndex;

                for (var i = 0; i < xData.length; i++) {
                    var yDataPoint = [];

                    for (var r = 0; r < dataSource.rows.length; r++) {
                        if (dataSource.rows[r]['col' + x0] == xData[i]) {
                            yDataPoint.push({
                                name: dataSource.rows[r]['col' + x1],
                                value: dataSource.rows[r]['col' + yColIndex],
                                geoCoord: [dataSource.rows[r]['col' + x2], dataSource.rows[r]['col' + x3]]
                            });
                        }
                    }

                    var tmpSeries = {
                        name: xData[i],
                        type: 'map',
                        mapType: options.MapType[0],
                        itemStyle: {
                            normal: {
                                label: {
                                    show: options.IsShowValue
                                },
                                borderColor: options.Map.borderColor,
                                borderWidth: 1.5,
                                areaStyle: {
                                    color: options.Map.areaColor
                                }
                            }
                        },
                        hoverable: false,
                        roam: options.Map.roam,
                        data: [],
                        markPoint: {
                            symbolSize: 1,
                            large: true,
                            effect: {
                                show: true
                            },
                            data: yDataPoint
                        }
                    };

                    $.extend(true, tmpSeries, options.Original.series);

                    seriesData.push(tmpSeries);
                }
            }
        }
        else if (chartType == "MapSign") {
            if (cPrm.chartPlugin == "echarts2") {
                tooltip = {
                    show: false
                };

                var mapType = "";
                if (options.MapType[0] == "world") {
                    mapType = "world";
                }
                else {
                    mapType = "china";
                }

                getGeoCoord(mapType);

                if (options.MapRangeOrLegend == "legend") {
                    //悬浮框样式
                    if (options.IsShowPercentValue) {
                        tooltip = {
                            trigger: 'item',
                            formatter: '{b}<br/>{c}%'
                        };
                    }
                    else {
                        tooltip = {
                            trigger: 'item',
                            formatter: '{b}<br/>{c}'
                        };
                    }
                    var legendNames = [];

                    var yData = [];//datatable一列的值
                    //用xData表示地图中的各个区域，把区域看成维度，如果未指定就默认为西藏的，为查看实例用
                    if (xData.length == 0) {
                        xData = ["北京", "上海"];
                    }

                    var c = 1;//列索引
                    if (!yIsNull) {
                        c = options.YDataColIndex.split(',')[0];
                    }

                    colNames = dataSource.colnames[c];//图例名

                    var tmpColorArray = [];
                    var tmpMax = null;
                    var tmpMin = null;
                    for (var i = 0; i < options.MapLegend.length; i++) {
                        tmpMax = options.MapLegend[i].max;
                        tmpMin = options.MapLegend[i].min;

                        var yData = [];
                        var tmpName = "";
                        var tmpValue = 0;

                        //遍历每行，r为行索引
                        for (var r = 0; r < dataSource.rows.length; r++) {
                            tmpName = xData[r];
                            tmpValue = toFloat(dataSource.rows[r]["col" + c]);

                            if (tmpMax == null) {
                                if (tmpMin == null) {
                                    yData.push({
                                        name: tmpName,
                                        value: tmpValue
                                    });
                                }
                                else if (tmpValue > tmpMin) {
                                    yData.push({
                                        name: tmpName,
                                        value: tmpValue
                                    });
                                }
                            }
                            else if (tmpValue <= tmpMax) {
                                if (tmpMin == null) {
                                    yData.push({
                                        name: tmpName,
                                        value: tmpValue
                                    });
                                }
                                else if (tmpValue > tmpMin) {
                                    yData.push({
                                        name: tmpName,
                                        value: tmpValue
                                    });
                                }
                            }
                        }

                        var tmpSeries = {
                            name: options.MapLegend[i].name,
                            type: 'map',
                            mapType: options.MapType[0],
                            selectedMode: 'single',
                            tooltip: {
                                show: false
                            },
                            itemStyle: {
                                normal: {
                                    label: {
                                        show: options.IsShowValue
                                    },
                                    borderColor: options.Map.borderColor,
                                    borderWidth: 1.5,
                                    areaStyle: {
                                        color: options.Map.areaColor
                                    }
                                },
                                emphasis: { label: { show: false } }
                            },
                            hoverable: false,
                            roam: options.Map.roam,
                            data: [],
                            markPoint: {
                                symbolSize: 1,
                                large: true,
                                effect: {
                                    show: true
                                },
                                tooltip: {
                                    show: true
                                },
                                itemStyle: {
                                    normal: {
                                        label: {
                                            show: options.IsShowValue
                                        },
                                        areaStyle: { color: options.MapLegend[i].color }
                                    },
                                    emphasis: { label: { show: true } }
                                },
                                data: yData
                            },
                            geoCoord: cPrm.geoCoord[mapType]
                        };

                        $.extend(true, tmpSeries, options.Original.series);

                        //图例不显示的时候，如果有区间没有数据，会造成颜色空缺，会依据echartsOptions的color属性标色，所以此处只添加有数据的颜色和序列
                        if (!options.IsShowLegend) {
                            if (yData.length > 0) {
                                tmpColorArray.push(options.MapLegend[i].color);

                                seriesData.push(tmpSeries);
                            }
                        }
                        else {
                            tmpColorArray.push(options.MapLegend[i].color);

                            seriesData.push(tmpSeries);
                        }

                        legendNames.push(options.MapLegend[i].name);
                    }

                    //ColorArr的颜色未指定的话，按options.MapLegend的来
                    if (options.ColorArr.length == 0) {
                        options.ColorArr = tmpColorArray;
                    }

                    legend = {
                        show: options.IsShowLegend,
                        orient: (options.LegendPosition.indexOf("RIGHT") >= 0 || options.LegendPosition.indexOf("LEFT") >= 0) ? 'vertical' : 'horizontal',
                        x: options.LegendPosition.indexOf("RIGHT") >= 0 ? 'right' : (options.LegendPosition.indexOf("LEFT") >= 0 ? 'left' : 'center'),
                        y: options.LegendPosition.indexOf("TOP") >= 0 ? 'top' : (options.LegendPosition.indexOf("BOTTOM") >= 0 ? 'bottom' : 'center'),
                        data: legendNames
                    };
                }
                else {
                    //悬浮框样式
                    tooltip = {
                        trigger: 'item',
                        formatter: '{b}<br/>{c}'
                    };
                    var yData = [];//datatable一列的值
                    //用xData表示地图中的各个区域，把区域看成维度，如果未指定就默认为西藏的，为查看实例用
                    if (xData.length == 0) {
                        xData = ["北京", "上海"];
                    }
                    //遍历每列，c为列索引
                    for (var c = 1; c < dataSource.colnames.length; c++) {
                        var isInY = yDataColIndex.indexOf("," + c.toString() + ',') >= 0 ? true : false;
                        var isInY2 = y2DataColIndex.indexOf("," + c.toString() + ',') >= 0 ? true : false;
                        if (yIsNull || isInY) {
                            //遍历每行，r为行索引
                            for (var r = 0; r < dataSource.rows.length; r++) {
                                yData.push({
                                    name: xData[r],
                                    value: toFloat(dataSource.rows[r]["col" + c])
                                });
                            }
                        }
                        colNames = dataSource.colnames[c];//图例名
                    }
                    //colNames = options.Title;//图例名

                    if (options.LegendPosition == "BOTTOM") {
                        options.LegendPosition = "LEFTBOTTOM";
                    }

                    //数值范围，根据此范围各个区域可以显示不同的颜色
                    dataRange = {
                        orient: (options.LegendPosition.indexOf("RIGHT") >= 0 || options.LegendPosition.indexOf("LEFT") >= 0) ? 'vertical' : 'horizontal',
                        x: options.LegendPosition.indexOf("RIGHT") >= 0 ? 'right' : (options.LegendPosition.indexOf("LEFT") >= 0 ? 'left' : 'center'),
                        y: options.LegendPosition.indexOf("TOP") >= 0 ? 'top' : (options.LegendPosition.indexOf("BOTTOM") >= 0 ? 'bottom' : 'center'),
                        min: getMaxMinValue(options).min,
                        max: getMaxMinValue(options).max,
                        color: options.Map.rangeColor,
                        calculable: true,
                        formatter: function (value) {
                            return axisFormatter(value, options.YFormatType, options.YUnit, options.YDecimals);
                        },
                        precision: options.YDecimals//小数位数
                    };

                    var tmpSeries = {
                        name: options.Title,
                        type: 'map',
                        mapType: options.MapType[0],
                        tooltip: {
                            show: false
                        },
                        itemStyle: {
                            normal: {
                                label: {
                                    show: options.IsShowValue
                                },
                                borderColor: options.Map.borderColor,
                                borderWidth: 1.5,
                                areaStyle: {
                                    color: options.Map.areaColor
                                }
                            }
                        },
                        hoverable: false,
                        roam: options.Map.roam,
                        data: [],
                        markPoint: {
                            symbolSize: 1,
                            large: true,
                            tooltip: {
                                show: true
                            },
                            effect: {
                                show: true
                            },
                            data: yData
                        },
                        geoCoord: cPrm.geoCoord[mapType]
                    };

                    $.extend(true, tmpSeries, options.Original.series);

                    seriesData.push(tmpSeries);
                }
            }
            else if (cPrm.chartPlugin == "echarts3") {
                tooltip = {
                    show: false
                };

                var mapType = "";
                if (options.MapType[0] == "world") {
                    mapType = "world";
                }
                else {
                    mapType = "china";
                }

                getGeoCoord(mapType);

                if (options.MapRangeOrLegend == "legend") {
                    //悬浮框样式
                    if (options.IsShowPercentValue) {
                        tooltip = {
                            trigger: 'item',
                            formatter: '{b}<br/>{c}%'
                        };
                    }
                    else {
                        tooltip = {
                            trigger: 'item',
                            formatter: function (v) {
                                return v.name + "：" + v.value[2]
                            }
                        };
                    }

                    var yData = [];//datatable一列的值
                    //用xData表示地图中的各个区域，把区域看成维度，如果未指定就默认为西藏的，为查看实例用
                    if (xData.length == 0) {
                        xData = ["北京", "上海"];
                    }

                    var c = 1;//列索引
                    if (!yIsNull) {
                        c = options.YDataColIndex.split(',')[0];
                    }

                    //遍历每行，r为行索引
                    for (var r = 0; r < dataSource.rows.length; r++) {
                        if (!isNullOrEmpty(cPrm.geoCoord[mapType][xData[r]])) {
                            yData.push({
                                name: xData[r],
                                value: cPrm.geoCoord[mapType][xData[r]].concat(toFloat(dataSource.rows[r]["col" + c]))
                            });
                        }
                    }

                    var tmpSeries = {
                        type: 'scatter',
                        coordinateSystem: 'geo',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true
                            }
                        },
                        itemStyle: {
                            normal: {
                                areaColor: 'transparent'
                            }
                        },
                        animation: false,
                        symbol: 'pin',
                        symbolSize: 35,
                        data: yData
                    };

                    $.extend(true, tmpSeries, options.Original.series);

                    seriesData.push(tmpSeries);

                    var pieces = [];
                    $.each(options.MapLegend, function (i, item) {
                        pieces.push({
                            min: item.min,
                            max: item.max,
                            label: item.name,
                            color: item.color
                        });
                    });

                    visualMap = {
                        show: options.IsShowLegend,
                        type: 'piecewise',
                        left: options.LegendPosition.indexOf("RIGHT") >= 0 ? 'right' : (options.LegendPosition.indexOf("LEFT") >= 0 ? 'left' : 'center'),
                        top: options.LegendPosition.indexOf("TOP") >= 0 ? 'top' : (options.LegendPosition.indexOf("BOTTOM") >= 0 ? 'bottom' : 'center'),
                        pieces: pieces,
                        calculable: true
                    };
                }
                else {
                    //悬浮框样式
                    tooltip = {
                        trigger: 'item',
                        formatter: function (v) {
                            return v.name + "：" + v.value[2]
                        }
                    };
                    var yData = [];//datatable一列的值
                    //用xData表示地图中的各个区域，把区域看成维度，如果未指定就默认为西藏的，为查看实例用
                    if (xData.length == 0) {
                        xData = ["北京", "上海"];
                    }
                    //遍历每列，c为列索引
                    for (var c = 1; c < dataSource.colnames.length; c++) {
                        var isInY = yDataColIndex.indexOf("," + c.toString() + ',') >= 0 ? true : false;
                        if (yIsNull || isInY) {
                            //遍历每行，r为行索引
                            for (var r = 0; r < dataSource.rows.length; r++) {
                                if (!isNullOrEmpty(cPrm.geoCoord[mapType][xData[r]])) {
                                    yData.push({
                                        name: xData[r],
                                        value: cPrm.geoCoord[mapType][xData[r]].concat(toFloat(dataSource.rows[r]["col" + c]))
                                    });
                                }
                            }
                        }
                        colNames = dataSource.colnames[c];//图例名
                    }

                    if (options.LegendPosition == "BOTTOM") {
                        options.LegendPosition = "LEFTBOTTOM";
                    }

                    //数值范围，根据此范围各个区域可以显示不同的颜色
                    visualMap = {
                        show: options.IsShowLegend,
                        left: options.LegendPosition.indexOf("RIGHT") >= 0 ? 'right' : (options.LegendPosition.indexOf("LEFT") >= 0 ? 'left' : 'center'),
                        top: options.LegendPosition.indexOf("TOP") >= 0 ? 'top' : (options.LegendPosition.indexOf("BOTTOM") >= 0 ? 'bottom' : 'center'),
                        min: getMaxMinValue(options).min,
                        max: getMaxMinValue(options).max,
                        color: options.Map.rangeColor,
                        calculable: true,
                        formatter: function (value) {
                            return axisFormatter(value, options.YFormatType, options.YUnit, options.YDecimals);
                        },
                        precision: options.YDecimals//小数位数
                    };

                    var tmpSeries = {
                        type: 'scatter',
                        coordinateSystem: 'geo',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true
                            }
                        },
                        animation: false,
                        symbol: 'pin',
                        symbolSize: 35,
                        data: yData
                    };

                    $.extend(true, tmpSeries, options.Original.series);

                    seriesData.push(tmpSeries);
                }
            }
        }
        else if (chartType == "MapTrace") {
            //获得legend的数据源
            var x0 = options.XDataColIndex.split(',')[0];
            var xStr = "";
            var x0Str = "";

            for (var r = 0; r < dataSource.rows.length; r++) {
                x0Str = dataSource.rows[r]['col' + x0];
                if (xStr.indexOf(x0Str) < 0) {
                    xStr += x0Str + ",";
                }
            }

            xData = xStr.substr(0, xStr.length - 1).split(',');
            colNames = xData;//legend的数据源

            legend = {
                show: options.IsShowLegend,
                orient: (options.LegendPosition.indexOf("RIGHT") >= 0 || options.LegendPosition.indexOf("LEFT") >= 0) ? 'vertical' : 'horizontal',
                x: options.LegendPosition.indexOf("RIGHT") >= 0 ? 'right' : (options.LegendPosition.indexOf("LEFT") >= 0 ? 'left' : 'center'),
                y: options.LegendPosition.indexOf("TOP") >= 0 ? 'top' : (options.LegendPosition.indexOf("BOTTOM") >= 0 ? 'bottom' : 'center'),
                data: colNames,
                //textStyle: {
                //    color: 'auto'
                //},
                padding: [10, 5, options.LegendRowCount == 3 ? 30 : 8, 5]
            };

            if (options.LegendPosition == "BOTTOM") {
                options.LegendPosition = "LEFTBOTTOM";
            }

            //数值范围，根据此范围各个区域可以显示不同的颜色
            dataRange = {
                orient: (options.LegendPosition.indexOf("RIGHT") >= 0 || options.LegendPosition.indexOf("LEFT") >= 0) ? 'vertical' : 'horizontal',
                x: options.LegendPosition.indexOf("RIGHT") >= 0 ? 'left' : (options.LegendPosition.indexOf("LEFT") >= 0 ? 'right' : 'center'),
                y: options.LegendPosition.indexOf("TOP") >= 0 ? 'bottom' : (options.LegendPosition.indexOf("BOTTOM") >= 0 ? 'top' : 'center'),
                min: getMaxMinValue(options).min,
                max: getMaxMinValue(options).max,
                color: ['#ff3333', 'orange', 'yellow', 'lime', 'aqua'],
                text: ['高', '低'],           // 文本，默认为数值文本
                calculable: true,
                formatter: function (value) {
                    return axisFormatter(value, options.YFormatType, options.YUnit, options.YDecimals);
                },
                precision: options.YDecimals//小数位数
            };

            var x1 = options.XDataColIndex.split(',')[1];//markPoint的data的name
            var x2 = options.XDataColIndex.split(',')[2];//经度
            var x3 = options.XDataColIndex.split(',')[3];//纬度

            var yColIndex = yIsNull ? 1 : options.YDataColIndex;

            for (var i = 0; i < xData.length; i++) {
                var yDataPoint = [];

                for (var r = 0; r < dataSource.rows.length; r++) {
                    if (dataSource.rows[r]['col' + x0] == xData[i]) {
                        yDataPoint.push({
                            name: dataSource.rows[r]['col' + x1],
                            value: dataSource.rows[r]['col' + yColIndex],
                            geoCoord: [dataSource.rows[r]['col' + x2], dataSource.rows[r]['col' + x3]]
                        });
                    }
                }

                var tmpSeries = {
                    name: xData[i],
                    type: 'map',
                    mapType: options.MapType[0],
                    itemStyle: {
                        normal: {
                            label: {
                                show: options.IsShowValue
                            },
                            borderColor: options.Map.borderColor,
                            borderWidth: 1.5,
                            areaStyle: {
                                color: options.Map.areaColor
                            }
                        }
                    },
                    hoverable: false,
                    roam: options.Map.roam,
                    data: [],
                    markPoint: {
                        symbolSize: 1,
                        large: true,
                        effect: {
                            show: false
                        },
                        data: yDataPoint
                    }
                };

                $.extend(true, tmpSeries, options.Original.series);

                seriesData.push(tmpSeries);
            }
        }
        else if (chartType == "HeatMap") {
            if (cPrm.chartPlugin == "echarts3") {
                visualMap = {
                    show: options.IsShowLegend,
                    min: 0,
                    max: 500,
                    splitNumber: 5,
                    inRange: {
                        color: ['#d94e5d', '#eac736', '#50a3ba'].reverse()
                    },
                    textStyle: {
                        color: '#fff'
                    }
                }

                var longitudeIdx = options.XDataColIndex.split(',')[1];//经度
                var latitudeIdx = options.XDataColIndex.split(',')[2];//纬度

                var yColIndex = yIsNull ? 1 : options.YDataColIndex;

                var yDataPoint = [];

                for (var r = 0; r < dataSource.rows.length; r++) {
                    yDataPoint.push([
                        dataSource.rows[r]['col' + longitudeIdx], dataSource.rows[r]['col' + latitudeIdx], dataSource.rows[r]['col' + yColIndex]
                    ]);
                }

                var tmpSeries = {
                    name: xData[i],
                    type: 'heatmap',
                    coordinateSystem: 'geo',
                    data: yDataPoint
                };

                $.extend(true, tmpSeries, options.Original.series);

                seriesData.push(tmpSeries);
            }
            else if (cPrm.chartPlugin == "echarts2") {

            }
        }
        else if (chartType == "gauge") {//仪表盘
            //根据当前div的高度自动改变某些属性
            var axisLine_lineStyle_width = 8;//圆环线的宽度
            var axisTick_splitNumber = 10;//小刻度分割的段数
            var axisTick_length = 12;//小刻度分隔线的长度
            var axisLabel_textStyle_fontSize = 9;//大刻度字体大小
            var splitLine_length = 30;//大刻度分隔线的长度
            var pointer_width = 5;//指针的宽度
            var title_textStyle_fontSize = 12;//标题字体的大小
            var detail_textStyle_fontSize = 14;//值的字体大小

            if (options.DivHeight <= 140) {
                axisLine_lineStyle_width = 2;//圆环线的宽度
                axisTick_splitNumber = 5;//小刻度分割的段数
                axisTick_length = 6;//小刻度分隔线的长度
                axisLabel_textStyle_fontSize = 9;//大刻度字体大小
                splitLine_length = 8;//大刻度分隔线的长度
                pointer_width = 3;//指针的宽度
                title_textStyle_fontSize = 10;//标题字体的大小
                detail_textStyle_fontSize = 12;//值的字体大小
            }
            else if (options.DivHeight > 140 && options.DivHeight <= 220) {
                axisLine_lineStyle_width = 4;//圆环线的宽度
                axisTick_splitNumber = 5;//小刻度分割的段数
                axisTick_length = 8;//小刻度分隔线的长度
                axisLabel_textStyle_fontSize = 9;//大刻度字体大小
                splitLine_length = 10;//大刻度分隔线的长度
                pointer_width = 3;//指针的宽度
                title_textStyle_fontSize = 12;//标题字体的大小
                detail_textStyle_fontSize = 14;//值的字体大小
            }
            else if (options.DivHeight > 220 && options.DivHeight <= 270) {
                axisLine_lineStyle_width = 5;//圆环线的宽度
                axisTick_splitNumber = 10;//小刻度分割的段数
                axisTick_length = 10;//小刻度分隔线的长度
                axisLabel_textStyle_fontSize = 11;//大刻度字体大小
                splitLine_length = 20;//大刻度分隔线的长度
                pointer_width = 5;//指针的宽度
                title_textStyle_fontSize = 16;//标题字体的大小
                detail_textStyle_fontSize = 18;//值的字体大小
            }
            else if (options.DivHeight > 270) {
                axisLine_lineStyle_width = 6;//圆环线的宽度
                axisTick_splitNumber = 10;//小刻度分割的段数
                axisTick_length = 11;//小刻度分隔线的长度
                axisLabel_textStyle_fontSize = 12;//大刻度字体大小
                splitLine_length = 25;//大刻度分隔线的长度
                pointer_width = 5;//指针的宽度
                title_textStyle_fontSize = 16;//标题字体的大小
                detail_textStyle_fontSize = 20;//值的字体大小
            }
            //悬浮框样式
            tooltip = {
                trigger: "item",
                formatter: "{a}<br/>{c}"
            };

            if (options.DataSource && options.DataSource.colnames && options.DataSource.colnames.length > 0) {//用DataSource作为数据源
                options.YDataColIndex = options.YDataColIndex.toString().split(',');
                options.GaugeValue = [];
                options.GaugeName = [];
                if (options.DataSource.rows.length > 0) {
                    $.each(options.YDataColIndex, function (i, c) {
                        options.GaugeValue.push(options.DataSource.rows[0]['col' + c]);
                        options.GaugeName.push(options.DataSource.colnames[c]);
                    });
                }
            }
            else {
                options.GaugeValue = options.GaugeValue.toString().split(',');
                options.GaugeName = options.GaugeName.split(',');
            }

            colNames = options.GaugeName;//图例名

            if (isNullOrEmpty(options.YMaxValue)) {
                options.YMaxValue = Math.ceil(parseFloat(getMaxOfArray(options.GaugeValue)) * 1.2);
            }

            //根据值而非比例来划分区段
            var splitNum = options.GaugeColor.length
            if (splitNum > 0 && options.GaugeColor[0][0] > 1) {
                var tmpSplit = [];
                if (!isNullOrEmpty(options.GaugeColor[splitNum - 1][0])) {
                    options.YMaxValue = options.GaugeColor[splitNum - 1][0];
                }
                else {
                    var tmpSplitValue = parseFloat(options.GaugeColor[splitNum - 2][0]);
                    if (getMaxOfArray(options.GaugeValue) < tmpSplitValue) {
                        options.YMaxValue = parseInt(tmpSplitValue * 1.2);
                    }
                }
                for (var i = 0; i < splitNum; i++) {
                    if (i == splitNum - 1) {
                        tmpSplit.push([1, options.GaugeColor[i][1]]);
                    }
                    else {
                        tmpSplit.push([parseFloat(options.GaugeColor[i][0]) / options.YMaxValue, options.GaugeColor[i][1]]);
                    }
                }
                options.GaugeColor = tmpSplit;
            }

            $.each(options.GaugeValue, function (i) {
                var tmpSeries = {
                    name: options.GaugeName[i],
                    type: chartType,
                    min: isNullOrEmpty(options.YMinValue) ? 0 : options.YMinValue,
                    max: isNullOrEmpty(options.YMaxValue) ? 100 : options.YMaxValue,
                    splitNumber: options.GaugeSplitNumber,// 分割段数，默认为5 大刻度分割的段数
                    axisLine: {// 坐标轴线
                        lineStyle: {// 属性lineStyle控制线条样式
                            color: options.GaugeColor,//样例：[[0.2, '#ff4500'], [0.8, '#48b'], [1, '#228b22']]
                            width: axisLine_lineStyle_width//圆环线的宽度
                        }
                    },
                    axisTick: {// 坐标轴小标记
                        splitNumber: axisTick_splitNumber,// 每份split细分多少段 小刻度分割的段数
                        length: axisTick_length,// 属性length控制线长 小刻度分隔线的长度
                        lineStyle: {// 属性lineStyle控制线条样式
                            color: 'auto'
                        }
                    },
                    axisLabel: {// 坐标轴文本标签，详见axis.axisLabel
                        textStyle: {// 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            color: 'auto',
                            fontSize: axisLabel_textStyle_fontSize//大刻度字体大小
                        },
                        formatter: function (v) {
                            return v.toFixed(0);
                        }
                    },
                    splitLine: {//分隔线
                        show: true,//默认显示，属性show控制显示与否
                        length: splitLine_length,// 属性length控制线长 大刻度分隔线的长度
                        lineStyle: {//属性lineStyle（详见lineStyle）控制线条样式
                            color: 'auto'
                        }
                    },
                    pointer: {
                        width: pointer_width,//指针宽度
                        color: options.ColorArr[i]//指针和图例的颜色保持一致
                    },
                    title: {
                        show: !options.IsShowLegend,
                        offsetCenter: [0, '110%'],// x, y，单位px
                        textStyle: {// 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            fontWeight: 'bolder',
                            fontSize: title_textStyle_fontSize//标题的大小
                        }
                    },
                    detail: {
                        //show: options.GaugeValue.length > 1 ? false : true,
                        show: options.IsShowValue && options.GaugeValue.length == 1 ? true : false,
                        formatter: '{value}',
                        textStyle: {// 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            color: 'auto',
                            fontWeight: 'bolder',
                            fontSize: detail_textStyle_fontSize//值的字体大小
                        }
                    },
                    data: [{ value: options.GaugeValue[i], name: options.GaugeName[i] }]
                };

                if (options.Original && options.Original.series) {
                    $.extend(true, tmpSeries, options.Original.series[i]);
                }

                seriesData.push(tmpSeries);
            });
        }
        else if (chartType == "GaugeMore") {//多仪表盘
            //悬浮框样式
            tooltip = {
                trigger: "item",
                formatter: "{a}<br/>{c}"
            };

            if (!isNullOrEmpty(options.YDataColIndex)) {//用DataSource作为数据源
                options.YDataColIndex = options.YDataColIndex.toString().split('￥');
                $.each(options.YDataColIndex, function (i, c) {
                    options.YDataColIndex[i] = options.YDataColIndex[i].split(',');
                });

                options.GaugeValue = [];
                options.GaugeName = [];
                if (options.DataSource.rows.length > 0) {
                    $.each(options.YDataColIndex, function (i) {
                        options.GaugeValue.push([]);
                        options.GaugeName.push([]);
                        $.each(options.YDataColIndex[i], function (j, c) {
                            options.GaugeValue[i].push(options.DataSource.rows[0]['col' + c]);
                            options.GaugeName[i].push(options.DataSource.colnames[c]);
                        });
                    });
                }
            }
            else {
                options.GaugeValue = options.GaugeValue.toString().split('￥');
                options.GaugeName = options.GaugeName.split('￥');
                $.each(options.GaugeValue, function (i, c) {
                    options.GaugeValue[i] = options.GaugeValue[i].split(',');
                    options.GaugeName[i] = options.GaugeName[i].split(',');
                });
            }

            if (isNullOrEmpty(options.YMaxValue)) {
                options.YMaxValue = [];
                $.each(options.GaugeValue, function (i) {
                    options.YMaxValue.push(Math.ceil(parseFloat(getMaxOfArray(options.GaugeValue[i])) * 1.2));
                });
            }
            else {
                options.YMaxValue = options.YMaxValue.split('￥');
            }

            //根据值而非比例来划分区段
            //var splitNum = options.GaugeColor.length
            //if (splitNum > 0 && options.GaugeColor[0][0] > 1) {
            //    var tmpSplit = [];
            //    if (!isNullOrEmpty(options.GaugeColor[splitNum - 1][0])) {
            //        options.YMaxValue = options.GaugeColor[splitNum - 1][0];
            //    }
            //    else {
            //        var tmpSplitValue = parseFloat(options.GaugeColor[splitNum - 2][0]);
            //        if (getMaxOfArray(options.GaugeValue) < tmpSplitValue) {
            //            options.YMaxValue = parseInt(tmpSplitValue * 1.2);
            //        }
            //    }
            //    for (var i = 0; i < splitNum; i++) {
            //        if (i == splitNum - 1) {
            //            tmpSplit.push([1, options.GaugeColor[i][1]]);
            //        }
            //        else {
            //            tmpSplit.push([parseFloat(options.GaugeColor[i][0]) / options.YMaxValue, options.GaugeColor[i][1]]);
            //        }
            //    }
            //    options.GaugeColor = tmpSplit;
            //}            

            colNames = [];//图例名

            $.each(options.GaugeValue, function (j) {
                //仪表盘的直径
                var diameter = options.DivHeight * (parseFloat(options.Original.series[j].radius.replace("%", "")) / 100);

                //根据当前div的高度自动改变某些属性
                var axisLine_lineStyle_width = 8;//圆环线的宽度
                var axisTick_splitNumber = 10;//小刻度分割的段数
                var axisTick_length = 12;//小刻度分隔线的长度
                var axisLabel_textStyle_fontSize = 9;//大刻度字体大小
                var splitLine_length = 30;//大刻度分隔线的长度
                var pointer_width = 5;//指针的宽度
                var title_textStyle_fontSize = 12;//标题字体的大小
                var detail_textStyle_fontSize = 14;//值的字体大小

                if (diameter <= 140) {
                    axisLine_lineStyle_width = 2;//圆环线的宽度
                    axisTick_splitNumber = 5;//小刻度分割的段数
                    axisTick_length = 6;//小刻度分隔线的长度
                    axisLabel_textStyle_fontSize = 9;//大刻度字体大小
                    splitLine_length = 8;//大刻度分隔线的长度
                    pointer_width = 3;//指针的宽度
                    title_textStyle_fontSize = 10;//标题字体的大小
                    detail_textStyle_fontSize = 12;//值的字体大小
                }
                else if (diameter > 140 && diameter <= 220) {
                    axisLine_lineStyle_width = 4;//圆环线的宽度
                    axisTick_splitNumber = 5;//小刻度分割的段数
                    axisTick_length = 8;//小刻度分隔线的长度
                    axisLabel_textStyle_fontSize = 9;//大刻度字体大小
                    splitLine_length = 10;//大刻度分隔线的长度
                    pointer_width = 3;//指针的宽度
                    title_textStyle_fontSize = 12;//标题字体的大小
                    detail_textStyle_fontSize = 14;//值的字体大小
                }
                else if (diameter > 220 && diameter <= 270) {
                    axisLine_lineStyle_width = 5;//圆环线的宽度
                    axisTick_splitNumber = 10;//小刻度分割的段数
                    axisTick_length = 10;//小刻度分隔线的长度
                    axisLabel_textStyle_fontSize = 11;//大刻度字体大小
                    splitLine_length = 20;//大刻度分隔线的长度
                    pointer_width = 5;//指针的宽度
                    title_textStyle_fontSize = 16;//标题字体的大小
                    detail_textStyle_fontSize = 18;//值的字体大小
                }
                else if (diameter > 270) {
                    axisLine_lineStyle_width = 6;//圆环线的宽度
                    axisTick_splitNumber = 10;//小刻度分割的段数
                    axisTick_length = 11;//小刻度分隔线的长度
                    axisLabel_textStyle_fontSize = 12;//大刻度字体大小
                    splitLine_length = 25;//大刻度分隔线的长度
                    pointer_width = 5;//指针的宽度
                    title_textStyle_fontSize = 16;//标题字体的大小
                    detail_textStyle_fontSize = 20;//值的字体大小
                }

                $.each(options.GaugeValue[j], function (i) {
                    colNames.push(options.GaugeName[j][i]);
                    var tmpSeries = {
                        name: options.GaugeName[j][i],
                        type: "gauge",
                        min: !isNullOrEmpty(options.YMinValue) ? options.YMinValue[j] : 0,
                        max: !isNullOrEmpty(options.YMaxValue) ? options.YMaxValue[j] : 100,
                        splitNumber: options.GaugeSplitNumber,// 分割段数，默认为5 大刻度分割的段数
                        axisLine: {// 坐标轴线
                            lineStyle: {// 属性lineStyle控制线条样式
                                color: options.GaugeColor.length > 0 ? options.GaugeColor[j] : "auto",//样例：[[0.2, '#ff4500'], [0.8, '#48b'], [1, '#228b22']]
                                width: axisLine_lineStyle_width//圆环线的宽度
                            }
                        },
                        axisTick: {// 坐标轴小标记
                            splitNumber: axisTick_splitNumber,// 每份split细分多少段 小刻度分割的段数
                            length: axisTick_length,// 属性length控制线长 小刻度分隔线的长度
                            lineStyle: {// 属性lineStyle控制线条样式
                                color: 'auto'
                            }
                        },
                        axisLabel: {// 坐标轴文本标签，详见axis.axisLabel
                            textStyle: {// 其余属性默认使用全局文本样式，详见TEXTSTYLE
                                color: 'auto',
                                fontSize: axisLabel_textStyle_fontSize//大刻度字体大小
                            },
                            formatter: function (v) {
                                return v.toFixed(0);
                            }
                        },
                        splitLine: {//分隔线
                            show: true,//默认显示，属性show控制显示与否
                            length: splitLine_length,// 属性length控制线长 大刻度分隔线的长度
                            lineStyle: {//属性lineStyle（详见lineStyle）控制线条样式
                                color: 'auto'
                            }
                        },
                        pointer: {
                            width: pointer_width//指针宽度
                        },
                        title: {
                            show: !options.IsShowLegend,
                            offsetCenter: [0, '110%'],// x, y，单位px
                            textStyle: {// 其余属性默认使用全局文本样式，详见TEXTSTYLE
                                fontWeight: 'bolder',
                                fontSize: title_textStyle_fontSize//标题的大小
                            }
                        },
                        detail: {
                            show: options.GaugeValue[j].length > 1 ? false : true,
                            formatter: '{value}',
                            textStyle: {// 其余属性默认使用全局文本样式，详见TEXTSTYLE
                                color: 'auto',
                                fontWeight: 'bolder',
                                fontSize: detail_textStyle_fontSize//值的字体大小
                            }
                        },
                        data: [{ value: options.GaugeValue[j][i], name: options.GaugeName[j][i] }]
                    };

                    if (!isNullOrEmpty(options.Original) && !isNullOrEmpty(options.Original.series)) {
                        $.extend(true, tmpSeries, options.Original.series[j]);
                    }

                    seriesData.push(tmpSeries);
                });
            });
        }

        //#endregion ==============得到echartsOptions的元素series的值（seriesData），及legend中的data值（colNames）============== end


        //#region ==============处理图例legend============== begin
        if (chartType != "map" && chartType != "MapFlowOut" && chartType != "MapFlowIn" && chartType != "MapFlowOneOut" && chartType != "MapFlowOneIn" && chartType != "MapScatter" && chartType != "MapTrace" && chartType != "MapSign" && options.ChartType != "PieOne") {
            if (chartType == "pie" && options.ChartType == "PieLayered") {
                legend = {
                    show: options.IsShowLegend,
                    orient: 'vertical',
                    x: options.DivWidth / 2,
                    y: options.PaddingTop,
                    itemGap: 12,
                    textStyle: {
                        fontSize: 11
                    },
                    formatter: function (value) {
                        if (value.length > 12) {
                            value = value.substr(0, 12) + "\n" + value.substr(12);
                        }
                        return value;
                    },
                    data: colNames
                };
            }
            else if (chartType == "treemap") {
                legend = null;
            }
            else {
                legend = {//---图例
                    show: options.IsShowLegend,
                    orient: (options.LegendPosition.indexOf("RIGHT") >= 0 || options.LegendPosition.indexOf("LEFT") >= 0) ? 'vertical' : 'horizontal',
                    x: options.LegendPosition.indexOf("RIGHT") >= 0 ? 'right' : (options.LegendPosition.indexOf("LEFT") >= 0 ? 'left' : 'center'),
                    y: options.LegendPosition.indexOf("TOP") >= 0 ? 'top' : (options.LegendPosition.indexOf("BOTTOM") >= 0 ? 'bottom' : 'center'),
                    padding: [0, 5, options.LegendRowCount == 3 ? 30 : 8, 5],
                    selectedMode: chartType == "gauge" ? false : true,
                    formatter: function (value) {
                        if (options.LegendIsTrim && !isNullOrEmpty(value) && value.length > options.LegendTrimNum) {
                            value = value.substr(0, options.LegendTrimNum) + "...";
                        }
                        return value;
                    },
                    textStyle: {
                        fontSize: options.FontSize
                    },
                    itemWidth: options.FontSize < 9 ? 10 : 20,
                    itemHeight: options.FontSize < 9 ? 7 : 14,
                    data: colNames
                };

                //指标过多的情况下，可以将某些指标先隐藏，表现为图例中对应的项为灰色，点击之后可恢复显示，饼图暂时不支持
                if (options.LegendSelected.length > 0) {
                    var selIdxs = options.LegendSelected.split(',');

                    var yIdxs = [];

                    if (options.YDataColIndex.toString().length > 0) {
                        yIdxs = options.YDataColIndex.toString().split(',');
                    }
                    if (options.Y2DataColIndex.toString().length > 0) {
                        $.unique(yIdxs.concat(options.Y2DataColIndex.toString().split(',')));
                    }

                    var notSelIdxs = [];
                    $.each(yIdxs, function (i, idx) {
                        if ($.inArray(idx, selIdxs) == -1) {
                            notSelIdxs.push(idx);
                        }
                    });
                    options.LegendNotSelected = notSelIdxs.join(",");
                }

                if (options.LegendNotSelected.length > 0) {
                    var indexs = options.LegendNotSelected.split(',');
                    var selected = "{";
                    for (var i = 0; i < indexs.length; i++) {
                        selected += "'" + options.DataSource.colnames[indexs[i]] + "':false,";
                    }
                    selected = selected.substr(0, selected.length - 1);
                    selected += "}";
                    selected = eval("(" + selected + ")");

                    $.extend(true, legend, { selected: selected });
                }
            }
        }
        //#endregion ==============处理图例legend============== end

        //调整tooltip的位置
        if (cPrm.chartPlugin == "echarts2") {
            tooltip = $.extend(true, tooltip, {
                position: function (pos) {
                    return [pos[0] + 10, pos[1] + 10];
                }
            });
        }

        if (cPrm.chartPlugin == "echarts3") {
            if (chartType == "radar") {
                tooltip = {};
            }
        }

        var echartsOptions = {
            theme: options.Theme,
            //renderAsImage:true,//非IE8-支持渲染为图片
            backgroundColor: options.BgColor == "" ? "transparent" : options.BgColor,
            noDataLoadingOption: {
                text: "无数据",
                effect: 'whirling',//spin空白、bar长条、ring圆环、dynamicLine很多线、bubble气泡、whirling指针旋转
                effectOption: {
                    backgroundColor: '#fff'
                }
            },
            title: {
                show: true,
                x: options.TitlePositionX,
                y: options.TitlePositionY,
                text: options.Title,
                textStyle: {
                    fontSize: 13
                },
                subtext: options.SubTitle
            },
            animation: options.IsFlash,
            //工具栏
            //toolbox: {
            //    show: options.Toolbox.show,
            //    feature: {
            //        saveAsImage: { show: true },
            //        mySecond: {//二次分析
            //            show: true,
            //            title: '二次分析',
            //            icon: 'image://http://echarts.baidu.com/images/favicon.png',
            //            onclick: function () {
            //                $.ajax({
            //                    url: dss.rootPath + 'PlugIn/CustomAnalysis/Pages/Handler.ashx?datatype=tmptstore',
            //                    data: {
            //                        anastr: dss.jsonToString(options.analyzer)
            //                    },
            //                    type: 'post',
            //                    dataType: 'text',
            //                    success: function (data) {
            //                        var url = dss.rootPath + "PlugIn/CustomAnalysis/Pages/Content.aspx?tabtype=Edit&qtype=anaagain&key=" + data;
            //                        dss.openPageInTab("二次分析", url);
            //                    }
            //                });
            //            }
            //        },
            //        myExport: {//导出
            //            show: true,
            //            title: '导出',
            //            icon: 'image://http://echarts.baidu.com/images/favicon.png',
            //            onclick: function () {
            //                dss.require(["export"], function () {
            //                    $.download.exportDiv([$("#" + options.DivID)], {
            //                        fileName: "导出文件",
            //                        colAttr: []
            //                    }, 0);
            //                }, function () { });
            //            }
            //        },
            //        mySet: {//图形设置
            //            show: true,
            //            title: '图形设置',
            //            icon: 'image://http://echarts.baidu.com/images/favicon.png',
            //            onclick: function () {
            //                $("#divSet").dialog({
            //                    width: 480,
            //                    title: '图形设置',
            //                    draggable: false,
            //                    buttons: {
            //                        '确定': function () {

            //                        },
            //                        '取消': function () {
            //                            $("#divSet").dialog("close");
            //                        }
            //                    }
            //                });
            //            }
            //        }
            //    }
            //},
            //悬浮框
            tooltip: tooltip,
            grid: grid,
            //图例
            legend: legend,
            //是否启用拖拽重计算特性，默认关闭，false时就无法拖拽
            calculable: calculable,
            //数据过多时增加滚动条及缩放功能
            dataZoom: dataZoom,
            dataRange: dataRange,
            series: seriesData
        };

        if (cPrm.chartPlugin == "echarts3") {
            if ((chartType.indexOf("map") > -1 || chartType.indexOf("Map") > -1) && chartType.indexOf("treemap") < 0) {
                var tmpOpt = {
                    visualMap: visualMap,
                    geo: {
                        map: options.MapType[0],
                        selectedMode: 'single',
                        label: {
                            normal: {
                                show: options.IsShowValue
                            },
                            emphasis: {
                                show: options.IsShowValue
                            }
                        },
                        roam: options.Map.roam,
                        zoom: options.Map.zoom
                    }
                };

                if (options.Map.center.length > 0) {
                    $.extend(true, tmpOpt, {
                        geo: {
                            center: options.Map.center
                        }
                    });
                }

                if (!isNullOrEmpty(options.Map.borderColor) && options.Map.borderColor != "auto") {
                    $.extend(true, tmpOpt, {
                        geo: {
                            itemStyle: {
                                normal: {
                                    borderColor: options.Map.borderColor
                                },
                                emphasis: {
                                    borderColor: options.Map.borderColor
                                }
                            }
                        }
                    });
                }

                if (!isNullOrEmpty(options.Map.areaColor) && options.Map.areaColor != "auto") {
                    $.extend(true, tmpOpt, {
                        geo: {
                            itemStyle: {
                                normal: {
                                    areaColor: options.Map.areaColor
                                },
                                emphasis: {
                                    areaColor: options.Map.areaColor
                                }
                            }
                        }
                    });
                }

                $.extend(true, echartsOptions, tmpOpt);
            }

            if (options.ChartType == "PieOne") {
                var tmpOpt = {
                    title: title
                };

                $.extend(true, echartsOptions, tmpOpt);
            }

            //雷达图用到此属性
            if (chartType == "radar") {
                $.extend(true, echartsOptions, {
                    radar: {
                        radius: '65%',
                        center: ['50%', '45%'],
                        indicator: indicator
                    }
                });
            }
        }
        else if (cPrm.chartPlugin == "echarts2") {
            //雷达图用到此属性
            if (chartType == "radar") {
                $.extend(true, echartsOptions, {
                    polar: [
                        {
                            radius: '65%',
                            center: ['50%', '45%'],
                            indicator: indicator
                        }
                    ]
                });
            }
        }

        if (options.ColorArr.length > 0) {
            $.extend(true, echartsOptions, {
                color: options.ColorArr//可以手动指定图例、指标的颜色，覆盖主题色系
            });
        }

        //#region ==============处理坐标轴============== begin

        var xAxisItems = [];
        if (chartType != "scatter") {
            //坐标轴的宽度
            var gridWidth = options.DivWidth - options.PaddingLeft - options.PaddingRight;
            if (options.IsScroll) {
                gridWidth = Math.floor(gridWidth * 100 / (options.ScrollEnd - options.ScrollStart));
            }

            var xAxisItems1 = {
                type: 'category',
                show: options.IsShowX,
                name: options.XTitle,
                boundaryGap: options.ChartType == "Line" || options.ChartType == "Area" || options.ChartType == "StackedArea" ? true : true,//类目起始和结束两端空白策略，true留空，false则顶头
                axisLine: {
                    onZero: false,//true表示：有负值时坐标线定位到垂直方向的0值坐标上 
                    lineStyle: {
                        //color: '#48b',
                        width: 1,
                        type: 'solid'
                    }
                },
                //splitLine: {
                //    show: true
                //},
                axisLabel: {
                    show: options.IsShowLabel,//是否显示此坐标轴的值
                    interval: options.XLabelStep - 1,//值间隔，0表示全部显示
                    rotate: options.XLabelStyle == "Rotate" ? 45 : (options.XLabelStyle == "Vertical" ? -90 : 0),//倾斜角度
                    formatter: function (value) {
                        value = value.toString();
                        if (value.indexOf("年") > -1 && (value.indexOf("月") > -1 || value.indexOf("周") > -1)) {
                            value = value.substr(5);
                        }

                        if (options.XIsTrim && !isNullOrEmpty(value) && value.length > options.XTrimNum) {
                            value = value.substr(0, options.XTrimNum) + "...";
                        }


                        //自动计算之后的字体大小
                        var tmpFontSize = options.XLabelStep == 1 ? (Math.floor(gridWidth / options.DataSource.rows.length) > 12 ? 12 : Math.floor(gridWidth / options.DataSource.rows.length)) : options.FontSize;

                        if (options.XLabelStyle == "Wrap") {
                            var xFontNum = Math.floor(gridWidth / options.DataSource.rows.length / tmpFontSize);
                            if (parseInt(options.XLabelStep) > 1) {
                                xFontNum = Math.floor(gridWidth / (options.DataSource.rows.length / options.XLabelStep) / tmpFontSize);
                            }
                            if (xFontNum == 0) {
                                xFontNum = 1;
                            }

                            if (options.ChartType == "Bar") {
                                xFontNum = 4;
                            }

                            //类似“10月05日”如果有折行，要保持整齐
                            if (xData.length > 0 && xData[0].indexOf("日") > -1) {
                                if (xFontNum < 6) {
                                    xFontNum = 3;
                                }
                            }

                            var newValue = "";
                            if (value.length > xFontNum) {
                                var num = Math.ceil(value.length / xFontNum);

                                for (var i = 0; i < num; i++) {
                                    newValue += value.substr(i * xFontNum, xFontNum) + "\n";
                                }
                                value = newValue;
                            }
                        }

                        return value;
                    },
                    textStyle: {
                        fontSize: options.FontSize != 12 ? options.FontSize : (options.XLabelStep == 1 ? (Math.floor(gridWidth / options.DataSource.rows.length) > 12 ? 12 : Math.floor(gridWidth / options.DataSource.rows.length)) : options.FontSize)//自动计算字体大小
                    }
                },
                data: xData
            };

            xAxisItems.push(xAxisItems1);
        }

        //y坐标轴
        var yAxisItems = [];
        if (!y2IsNull) {//双y轴
            var y1AxisItems = {
                type: 'value',
                show: options.IsShowY,
                name: options.YTitle,
                scale: options.IsAutoLimits,//脱离0值比例，放大聚焦到最终_min，_max区间 
                //precision: 2,//小数位数
                //axisLine: {
                //    show: false
                //},
                //splitLine: {
                //    show: options.Theme == "dark" ? false : true,
                //    lineStyle: {       // 属性lineStyle控制线条样式
                //        color: '#C2C2C2'
                //    }
                //},//分隔线，默认显示
                splitArea: {
                    //show: options.Theme == "dark" ? false : true,
                    show: false,
                    areaStyle: {
                        color: ['rgba(255,255,255,0.5)', 'rgba(247,247,247,0.5)']
                    }
                },//分隔区域，默认显示
                axisLabel: {
                    formatter: function (v) {
                        return axisFormatter(v, options.YFormatType, options.YUnit, options.YDecimals);
                    },
                    interval: options.YLabelStep == "" ? 0 : options.YLabelStep - 1,//值间隔，0表示全部显示
                    rotate: options.YLabelStyle == "Rotate" ? 45 : (options.YLabelStyle == "Vertical" ? -90 : 0),//倾斜角度
                    textStyle: {
                        fontSize: options.FontSize//字体大小
                    }
                }
            };

            //IsAutoLimits优先
            if (!options.IsAutoLimits) {
                if (!isNullOrEmpty(options.YMinValue)) {
                    $.extend(true, y1AxisItems, { min: options.YMinValue });
                }
                if (!isNullOrEmpty(options.YMaxValue)) {
                    $.extend(true, y1AxisItems, { max: options.YMaxValue });
                }
            }

            var y2AxisItems = {
                type: 'value',
                show: options.IsShowY2,
                name: options.Y2Title,
                scale: options.IsAutoLimits,//脱离0值比例，放大聚焦到最终_min，_max区间 
                //precision: 2,//小数位数
                //axisLine: {
                //    show: true
                //},
                splitNumber: options.Y2SplitNumber,//分割段数
                splitLine: {
                    show: false,
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: '#C2C2C2'
                    }
                },//分隔线，默认不显示
                splitArea: {
                    show: false,
                    areaStyle: {
                        color: ['rgba(255,255,255,0.5)', 'rgba(247,247,247,0.5)']
                    }
                },//分隔区域，默认不显示
                axisLabel: {
                    formatter: function (v) {
                        return axisFormatter(v, options.Y2FormatType, options.Y2Unit, options.Y2Decimals);
                    },
                    interval: options.Y2LabelStep == "" ? 0 : options.Y2LabelStep - 1,//值间隔，0表示全部显示
                    rotate: options.Y2LabelStyle == "Rotate" ? 45 : (options.Y2LabelStyle == "Vertical" ? -90 : 0),//倾斜角度
                    textStyle: {
                        fontSize: options.FontSize//字体大小
                    }
                }
            };

            //IsAutoLimits优先
            if (!options.IsAutoLimits) {
                if (!isNullOrEmpty(options.Y2MinValue)) {
                    $.extend(true, y2AxisItems, { min: options.Y2MinValue });
                }
                if (!isNullOrEmpty(options.Y2MaxValue)) {
                    $.extend(true, y2AxisItems, { max: options.Y2MaxValue });
                }
            }

            if (chartType == "scatter") {
                if (isNullOrEmpty(options.Y2DataColIndex)) {//如果Y2轴未指定，则全部用Y1轴参数
                    $.extend(true, y1AxisItems, {
                        axisLine: {            // 坐标轴线
                            show: true,
                            lineStyle: {       // 属性lineStyle控制线条样式
                                color: '#008acd',
                                width: 1
                            }
                        },
                        axisTick: {
                            show: true
                        },
                        splitLine: {
                            show: true,
                            lineStyle: {       // 属性lineStyle控制线条样式
                                type: 'dashed',
                                width: 1
                            }
                        }
                    });
                    yAxisItems.push(y1AxisItems);

                    var x1AxisItems = $.extend(true, {}, y1AxisItems, {
                        name: options.XTitle
                    });
                    xAxisItems.push(x1AxisItems);
                }
                else {
                    $.extend(true, y2AxisItems, {
                        splitLine: { show: true },//分隔线
                        splitArea: { show: true }//分隔区域
                    });
                    yAxisItems.push(y2AxisItems);
                    xAxisItems.push(y1AxisItems);
                }
            }
            else {
                yAxisItems.push(y1AxisItems);
                yAxisItems.push(y2AxisItems);
            }
        }
        else {
            var y1AxisItems = {
                type: 'value',
                show: options.IsShowY,
                name: options.YTitle,
                position: 'left',
                scale: options.IsAutoLimits,//脱离0值比例，放大聚焦到最终_min，_max区间 
                //precision: 2,//小数位数
                //axisLine: {
                //    show: false,
                //    lineStyle: {       // 属性lineStyle控制线条样式
                //        width: 1
                //        //,
                //        //color: '#008acd'
                //    }
                //},
                splitNumber: options.YSplitNumber,//分割段数
                //splitLine: {
                //    show: options.Theme == "dark" ? false : (options.IsAlign == true ? false : true),
                //    lineStyle: {       // 属性lineStyle控制线条样式
                //        color: '#C2C2C2'
                //    }
                //},//分隔线，默认显示
                splitArea: {
                    //show: options.Theme == "dark" ? false : (options.IsAlign == true ? false : true),
                    show: false,
                    areaStyle: {
                        color: ['rgba(255,255,255,0.5)', 'rgba(247,247,247,0.5)']
                    }
                },//分隔区域，默认不显示
                axisLabel: {
                    show: options.IsAlign == true ? false : true,
                    formatter: function (v) {
                        return axisFormatter(v, options.YFormatType, options.YUnit, options.YDecimals);
                    },
                    interval: options.YLabelStep == "" ? 0 : options.YLabelStep - 1,//值间隔，0表示全部显示
                    rotate: options.YLabelStyle == "Rotate" ? 45 : (options.YLabelStyle == "Vertical" ? -90 : 0),//倾斜角度
                    textStyle: {
                        fontSize: options.FontSize//字体大小
                    }
                }
            };

            //多维长条图时不显示分割线
            if (options.IsAlign == true) {
                $.extend(true, y1AxisItems, {
                    splitLine: {
                        show: false
                    }
                });
            }

            //IsAutoLimits优先
            if (!options.IsAutoLimits) {
                if (!isNullOrEmpty(options.YMinValue)) {
                    $.extend(true, y1AxisItems, { min: options.YMinValue });
                }
                if (!isNullOrEmpty(options.YMaxValue)) {
                    $.extend(true, y1AxisItems, { max: options.YMaxValue });
                }
            }

            yAxisItems.push(y1AxisItems);
        }

        var echartsOptionsAxis = {
            //---为echartsOptions的元素，x坐标轴
            xAxis: xAxisItems,
            //---为echartsOptions的元素，y坐标轴
            yAxis: yAxisItems
        };

        //长条图或堆叠长条图时x轴与y轴互换
        if (options.ChartType == "Bar" || options.ChartType == "StackedBar") {
            var temp = echartsOptionsAxis.xAxis;
            echartsOptionsAxis.xAxis = echartsOptionsAxis.yAxis;
            echartsOptionsAxis.yAxis = temp;
            //$.extend(true, echartsOptionsAxis.xAxis[0], { position: "top" });
        }

        //图表类型包含柱图、折线图、散点图时才用到坐标轴
        if (chartType == "bar" || chartType == "line" || chartType == "scatter") {
            $.extend(true, echartsOptions, echartsOptionsAxis);
        }

        //#endregion ==============处理坐标轴============== end

        $.extend(true, echartsOptions, {
            toolbox: {}
        });

        return echartsOptions;
    }

    //将options适配成Echarts3的
    function adaptEcharts3(options) {

    }

    //格式化值的样式，可以是坐标轴刻度值、内容(Label)的值、悬浮框(tooltip)的值
    function axisFormatter(value, type, unit, decimal) {//type为1000、1024、%三种，unit为单位，decimal为小数位
        //var formatValue1000 = "10000,100,10,10";
        //var formatUnit1000 = "万,百万,千万,亿";
        //var formatValue1024 = "1024,1024,1024,1024";
        //var formatUnit1024 = "KB,MB,GB,TB";

        value = Number(value);

        if (isNullOrEmpty(unit)) {
            unit = "";
        }

        if (type == "%") {
            return (value * 100).toFixed(decimal) + "%"
        }
        else if (type == "1000") {
            var vLength = Math.round(value).toString().length;
            if (vLength >= 5 && vLength < 7) {
                return (value / 10000).toFixed(decimal) + "万" + unit;
            }
            else if (vLength == 7) {
                return (value / 1000000).toFixed(decimal) + "百万" + unit;
            }
            else if (vLength == 8) {
                return (value / 10000000).toFixed(decimal) + "千万" + unit;
            }
            else if (vLength >= 9) {
                return (value / 100000000).toFixed(decimal) + "亿" + unit;
            }
            else {
                return value + unit;
            }
        }
        else if (type == "1024") {
            switch (unit.toUpperCase()) {
                case "TB": value = value * 1024 * 1024 * 1024 * 1024; break;
                case "GB": value = value * 1024 * 1024 * 1024; break;
                case "MB": value = value * 1024 * 1024; break;
                case "KB": value = value * 1024; break;
                default: break;
            }

            var v = value;

            if ((v = parseFloat((value / 1024 / 1024 / 1024 / 1024))) >= 1) {
                return v.toFixed(decimal) + "TB";
            }
            else if ((v = parseFloat((value / 1024 / 1024 / 1024))) >= 1) {
                return v.toFixed(decimal) + "GB";
            }
            else if ((v = parseFloat((value / 1024 / 1024))) >= 1) {
                return v.toFixed(decimal) + "MB";
            }
            else if ((v = parseFloat((value / 1024))) >= 1) {
                return v.toFixed(decimal) + "KB";
            }
            else {
                return value + " B";
            }
        }
        else {
            return value.toFixed(decimal) + unit;
        }
    }

    //得到地区的经纬度
    function getGeoCoord(mapType) {
        if (mapType != "world") {
            mapType = "china";
        }

        if (!cPrm.geoCoord[mapType]) {
            $.ajax({
                async: false,
                url: dss.rootPath + "javascript/JSControl/SampleChart/Scripts/echarts/data/" + mapType + ".json",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    cPrm.geoCoord[mapType] = data;
                },
                error: function (err) {
                    alert(err);
                }
            });
        }
    }

    //改用echarts后有用到
    function existArr(arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == val) {
                return i;
            }
        }
        return -1;
    }

    //求数组元素的最大值
    function getMaxOfArray(arr) {
        var tmpMax = 0;
        $.each(arr, function (i, item) {
            if (item > tmpMax) {
                tmpMax = item;
            }
        });
        return tmpMax;
    }

    function getColMaxMin(rows, colindex) {
        if (rows.length <= 0) {
            return null;
        }
        var max = rows[0]["col" + colindex];
        var min = rows[0]["col" + colindex];
        var maxRowIndex = 0;
        var minRowIndex = 0;
        for (var i = 1; i < rows.length; i++) {
            var val = rows[i]["col" + colindex];
            if ((val - 0) > (max - 0)) {
                max = val;
                maxRowIndex = i;
            }
            if ((val - 0) < (min - 0)) {
                min = val;
                minRowIndex = i;
            }
        }
        if (maxRowIndex >= 0 && minRowIndex >= 0) {
            return { maxrow: maxRowIndex, minrow: minRowIndex, colindex: colindex };
        }
        else {
            return null;
        }
    }

    function getMaxMinValue(options, colindex) {
        if (isNullOrEmpty(colindex)) {
            colindex = !isNullOrEmpty(options.YDataColIndex) ? options.YDataColIndex : 1;
        }

        var maxMin = getColMaxMin(options.DataSource.rows, colindex);

        return {
            min: isNullOrEmpty(options.YMinValue) ? (!isNullOrEmpty(maxMin) ? Math.floor(options.DataSource.rows[maxMin.minrow]['col' + colindex]) : 0) : options.YMinValue,
            max: isNullOrEmpty(options.YMaxValue) ? (!isNullOrEmpty(maxMin) ? Math.ceil(options.DataSource.rows[maxMin.maxrow]['col' + colindex]) : 100) : options.YMaxValue
        };
    }

    //获取高亮显示用的颜色
    function getHightlightColor(index, isY) {
        return "#008800";//"#83FCD8"
    }

    //判断值是否为空
    function isNullOrEmpty(p) {
        if (p == undefined || p == null || (typeof (p) == "string" && p == "")) {
            return true;
        }
        else {
            return false;
        }
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

    function getUnit(colname) {
        var unit = "";
        if (colname.contains("（")) {
            unit = colname.substr(colname.indexOf("（") + 1).trimEnd("）");
        }
        return unit;
    }

    //将字符串折行，num表示每行多少字符
    function strWrap(str, num) {
        var newStr = "";
        var strLength = str.length;
        var n = Math.ceil(strLength / num);

        for (var i = 0; i < n; i++) {
            newStr += str.substr(i * num, num);
            if (i < n - 1) {
                newStr += "\n";
            }
        }

        return newStr;
    }

})(jQuery);