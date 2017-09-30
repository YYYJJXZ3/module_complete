/***************************************************************************
* jQuery SampleChart 2.3.0
* Copyright 2016 BocoDss
* UpdateTime 2017-01-23
* Depends:
*      jquery-1.9.1.min.js
*      Echarts 2.2.7
*      Echarts 3.3.2
****************************************************************************/
(function ($) {
    //全局变量用于更改使用参数
    var conParams = {
        arcGisUrl: "http://42.99.16.96:53088/BaseMap/rest/services/China_Community_BaseMap/MapServer"

    };


    $.fn.bocoGis = function (opt) {
        var thisDemo = $(this);
        processOpt(opt, thisDemo);

    }

    $.fn.bocoGis.defaultOpt = {
        //开放参数
        data: {},//数据
        dataType: {},//数据种类
        scaleLine: false,//比例尺
        zoomSilder: false,//缩放工具条
        zoom: true,//缩放按钮
        fullScreen: false,//全屏按钮

        mapServiceType: "arcGis",//地图服务器类型
        mapServiceUrl: "",//地图服务器地址

        //不开放参数
        overLays: false,//是否在地图上贴dom
        overLaysID: ['myButton'],//domid数组
        overLaysPosition: [[116.3972282409668, 39.90960456]],//dom位置数组

        popUp: false,//是否弹出popup

        viewProjection: "",//视图的坐标系统
        viewCenter: [0, 0],//地图中心位置
        viewZoom: 4//地图精细程度数值大于0，数值越大地图越精细
    };

    function processOpt(opt, thisDemo) {
        //输入项正确性验证

        var defaultOpt = $.extend(true, {}, $.fn.bocoGis.defaultOpt);

        opt = $.extend(true, {}, defaultOpt, opt);
        //根据选择得mapservice服务类型来处理地图来源
        if (opt.mapServiceType == "arcGis") {
            opt.mapServiceUrl = conParams.arcGisUrl;
            opt.viewProjection = new ol.proj.Projection({
                code: 'EPSG:4326',//
                units: ol.proj.Units.DEGREES
            });
            // opt.viewCenter = ol.proj.transform(opt.viewCenter, 'EPSG:4326', 'EPSG:3857');//4326是WGS84坐标系即地理坐标系用经纬度表示，3857是墨卡托坐标系
        }
        else if (opt.mapServiceType == "google") { }
        else if (opt.mapServiceType == "baidu") { }
        //将经纬度坐标系转换成墨卡托坐标系

        showGis(opt, thisDemo);
    }

    function showGis(opt, thisDemo) {

        var source = new ol.source.TileArcGISRest({
            url: opt.mapServiceUrl
        })

        var layers = [

                          //new ol.layer.Tile({
                          //    source: new ol.source.OSM()
                          //})
                          ////arcgis
                          new ol.layer.Tile({
                              //extent: [-1,1,1,1],//[left,bottom,right,top],//地图的可见范围
                              source: source
                          })
        ];


        //负责地图中心点，放大，投影等得设置
        var view = new ol.View({
            projection: opt.viewProjection,//设置坐标系
            center: opt.viewCenter,//设置地图中心位置
            //extent:extent,
            zoom: opt.viewZoom//设置放大等级
        });

        var map = new ol.Map({
            layers: layers,
            target: thisDemo[0].id,
            view: view
        });




        //var zoom = new ol.control.Zoom();
        //map.addControl(zoom);


        //对map添加dom，比例尺，缩放工具条
        processControl(opt, map);
    }

    function processControl(opt, map) {
        //去掉默认control
        removeDefaultControls(opt, map);



        ////添加全屏按钮
        if (opt.fullScreen === true) {
            addFullScreen(opt, map)
        }

        ////添加放大缩小按钮
        if (opt.zoom === true) {
            addZoom(opt, map);
        }

        ////在地图上弹出窗口
        if (opt.popUp === true) {
            addPopUp(opt, map);
        }

        ////在地图的某些位置添加dom
        if (opt.overLays === true) { addOverLay(opt, map); }

        ////添加比例尺，单位m  
        if (opt.scaleLine === true) {
            addScaleLine(opt, map);
        }

        ////缩放工具条  
        if (opt.zoomSilder === true) {
            addZoomSilder(opt, map);
        }
    }

    //去掉默认control
    function removeDefaultControls(opt, map) {
        var control = map.getControls();
        if (control.array_.length > 0) {
            for (var i = control.array_.length - 1; i >= 0; i--) {
                map.removeControl(control.array_[i]);
            }
        }
    }

    //在地图上弹出窗口
    function addPopUp(opt, map) {
        var container = document.getElementById('popup');
        var content = document.getElementById('popup-content');
        var title = document.getElementById('popup-title');
        var closer = document.getElementById('popup-closer');
        closer.onclick = function () {
            container.style.display = 'none';
            closer.blur();
            return false;
        };
        var overlay = new ol.Overlay({
            element: container
        });

        map.addOverlay(overlay);
        map.on('click', function (evt) {
            var coordinate = evt.coordinate;
            var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
                    coordinate, 'EPSG:4326', 'EPSG:4326'));
            overlay.setPosition(coordinate);
            content.innerHTML = '<p>You clicked here:</p><code>' + hdms +
            '</code>';
            container.style.display = 'block';
            title.innerHTML = "提示信息";
            title.style.display = 'block';
            // map.getView().setCenter(coordinate);
        });
    }

    //在地图的某些位置添加dom
    function addOverLay(opt, map) {
        if (opt.overLaysID.length > 0) {
            for (var i = 0; i < opt.overLaysID.length; i++) {
                var overLay = new ol.Overlay(
                    {
                        element: document.getElementById(opt.overLaysID[i])
                    });
                overLay.setPosition(opt.overLaysPosition[i]);
                map.addOverlay(overLay);
            }
        }
    }

    //添加比例尺，单位m  
    function addScaleLine(opt, map) {
        map.addControl(new ol.control.ScaleLine());
    }

    //缩放工具条  
    function addZoomSilder(opt, map) {
        map.addControl(new ol.control.ZoomSlider());
    }

    //添加放大缩小按钮
    function addZoom(opt, map) {
        map.addControl(new ol.control.Zoom());
    }

    //添加全屏按钮
    function addFullScreen(opt, map) {
        map.addControl(new ol.control.FullScreen());
    }


})(jQuery)