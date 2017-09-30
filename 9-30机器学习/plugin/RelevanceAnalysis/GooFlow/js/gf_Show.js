var flowData = { title: "111", initNum: "7", nodes: { "1445210904": { id: "1445210904", name: "node_5", left: 223, top: 194, width: 86, height: 24, type: "node", NodeInfo: { anaExpressInfoSet: [], anaMeaRelationInfoSet: [{ meaRelStr: "无" }], anaDimInfoSet: [], anaDimSwitchSet: [], anaLevelRelationInfoSet: [{ dimID: "", dimName: "", levelRelStrIDs: "", levelRelStrNames: "" }] } }, "1722169873": { id: "1722169873", name: "node_7", left: 226, top: 259, width: 86, height: 24, type: "task", NodeInfo: { anaExpressInfoSet: [{ factID: "2044469451", dimID: "-1853030923", hierID: "0", levelID: "-349559517", levelName: "簇", levelDesc: "CLUSTER_DESC", isShowCount: "0", isTrueCondition: "1", meaID: "-1488985376", meaName: "流量占比", andOr: " AND ", signUp: "<", signUpID: "3", txtThreUp: "", signDown: ">", signDownID: "1", txtThreDown: "2", anaTypeID: "3", txtAreaURL: "", txtTopN: "", txtAreaSQL: "", BGColorDown: "Default", orderIndex: "0", anaMeaResultStr: "【0】流量占比>2" }], anaMeaRelationInfoSet: [{ meaRelStr: "【0】 " }], anaDimInfoSet: [], anaDimSwitchSet: [], anaLevelRelationInfoSet: [{ dimID: "", dimName: "", levelRelStrIDs: "", levelRelStrNames: "" }] } }, "1913090128": { id: "1913090128", name: "开始", left: 265, top: 35, width: 86, height: 24, type: "start", NodeInfo: { anaExpressInfoSet: [], anaMeaRelationInfoSet: [{ meaRelStr: "无" }], anaDimInfoSet: [], anaDimSwitchSet: [], anaLevelRelationInfoSet: [{ dimID: "", dimName: "", levelRelStrIDs: "", levelRelStrNames: "" }] } }, "2073414753": { id: "2073414753", name: "node_2", left: 264, top: 80, width: 86, height: 24, type: "node", NodeInfo: { anaExpressInfoSet: [{ factID: "2044469451", dimID: "-1853030923", hierID: "0", levelID: "-349559517", levelName: "簇", levelDesc: "CLUSTER_DESC", isShowCount: "0", isTrueCondition: "1", meaID: "-719735253", meaName: "2G日均流量", andOr: " AND ", signUp: "<", signUpID: "3", txtThreUp: "", signDown: ">", signDownID: "1", txtThreDown: "0", anaTypeID: "3", txtAreaURL: "", txtTopN: "", txtAreaSQL: "", BGColorDown: "Default", orderIndex: "0", anaMeaResultStr: "【0】2G日均流量>0" }], anaMeaRelationInfoSet: [{ meaRelStr: "【0】 " }], anaDimInfoSet: [], anaDimSwitchSet: [], anaLevelRelationInfoSet: [{ dimID: "", dimName: "", levelRelStrIDs: "", levelRelStrNames: "" }] } }, "-1970245105": { id: "-1970245105", name: "node_3", left: 223, top: 141, width: 86, height: 24, type: "task", NodeInfo: { anaExpressInfoSet: [{ factID: "2044469451", dimID: "-1853030923", hierID: "0", levelID: "-349559517", levelName: "簇", levelDesc: "CLUSTER_DESC", isShowCount: "0", isTrueCondition: "1", meaID: "-719735253", meaName: "2G日均流量", andOr: " AND ", signUp: "<", signUpID: "3", txtThreUp: "", signDown: ">", signDownID: "1", txtThreDown: "0", anaTypeID: "3", txtAreaURL: "", txtTopN: "", txtAreaSQL: "", BGColorDown: "Default", orderIndex: "0", anaMeaResultStr: "【0】2G日均流量>0" }], anaMeaRelationInfoSet: [{ meaRelStr: "【0】 " }], anaDimInfoSet: [{ dimStrID: "簇维$片区", dimName: "簇维", levelName: "片区", levelVal: "ww" }], anaDimSwitchSet: [], anaLevelRelationInfoSet: [{ dimID: "-1853030923", dimName: "簇维", levelRelStrIDs: "-1724501826,-1663040500", levelRelStrNames: "簇ID,是否有TDS覆盖" }] } }, "-12603261": { id: "-12603261", name: "node_4", left: 343, top: 142, width: 86, height: 24, type: "task", NodeInfo: { anaExpressInfoSet: [{ factID: "2044469451", dimID: "-1853030923", hierID: "0", levelID: "-349559517", levelName: "簇", levelDesc: "CLUSTER_DESC", isShowCount: "0", isTrueCondition: "1", meaID: "-719735253", meaName: "2G日均流量", andOr: " AND ", signUp: "<", signUpID: "3", txtThreUp: "", signDown: ">", signDownID: "1", txtThreDown: "0", anaTypeID: "3", txtAreaURL: "", txtTopN: "", txtAreaSQL: "", BGColorDown: "Default", orderIndex: "0", anaMeaResultStr: "【0】2G日均流量>0" }], anaMeaRelationInfoSet: [{ meaRelStr: "【0】 " }], anaDimInfoSet: [], anaDimSwitchSet: [], anaLevelRelationInfoSet: [{ dimID: "", dimName: "", levelRelStrIDs: "", levelRelStrNames: "" }] } } }, lines: { "394378908": { id: "394378908", name: "", from: "-1970245105", to: "1445210904", type: "sl", M: null }, "1541336083": { id: "1541336083", name: "", from: "1445210904", to: "1722169873", type: "sl", M: null }, "-1559926392": { id: "-1559926392", name: "", from: "1913090128", to: "2073414753", type: "sl", M: null }, "-887857922": { id: "-887857922", name: "", from: "2073414753", to: "-1970245105", type: "tb", M: 121.5 }, "-615410610": { id: "-615410610", name: "", from: "2073414753", to: "-12603261", type: "tb", M: 121.5 } } };
var nodeObj = { id: "node_id22222", nodeinfo: { raNode: { ReportId: "-1652628111", VersionDesc: "333", DimFiler: "[簇维].[片区1].[ww1];[簇维].[片区2].[ww2]" }, meathreshold: [{ ExprId: "111", MeaName: "2g语音", MeaSign: "1,4", MaxVal: "100", MinVal: "200", MeaAndOr: "AND" }, { ExprId: "222", MeaName: "wlan流量", MeaSign: "3", MaxVal: "", MinVal: "900", MeaAndOr: "AND" }] } }


var demo;
var $show = function () { };
var property = {
    width: 1080,
    height: 470,
    haveHead: false,
    haveTool: true,
    haveGroup: false,
    isShowPager: true,//是否是呈现界面
    useOperStack: true
};
//工具类
var tools = {
    btnObj: '',//阈值修改按钮对象
    old1: '',//保存第一个阈值
    old2: '',//保存第二个阈值
    showDiv: function (divID) {
        if (divID == undefined) {
            divID = 'gl_box';
        }
        $show.showDiv(divID);
    },
    closeNodeDIV: function () {
        $show.closeNodeDIV();
    },
    moveDiv: function (event, divID) {
        $show.moveDiv(event, divID);
    },
    getAjaxData: function (para, dataType, onSuccess, callback) {
        $.ajax({
            url: 'GooFlowShow.ashx',
            type: 'post',
            dataType: dataType,
            data: para,
            beforeSend: function () { $("#divLoadingStatus").show(); },
            complete: function myfunction() {
                if (callback != null && callback != undefined) {
                    callback();
                }
                setTimeout($("#divLoadingStatus").hide(), 500);
            },
            success: function (data) {
                onSuccess(data);
            },
            error: function (xmlRequest, txtInfo, errorThrow) {
                alert('错误信息：' + txtInfo + ' ,错误码：' + xmlRequest.status);
            }
        });
    }
};

$show.Init = function (UrlParameter) {
    demo = $.createGooFlow($("#flow"), property);
    $show.initFlow(UrlParameter);
    $show.initBtnClick();
}


function deCode(s) {//解码
    return unescape(s);
}

//=============================================界面和按钮的初始化(如下)=============================================
$show.initFlow = function (urlParameter) {


    var urlP = urlParameter.ReportId + "," +
        urlParameter.Version_Desc + "," +
        urlParameter.DateType + "," +
        urlParameter.Date + "," +
        urlParameter.NeType + "," +
        urlParameter.NeStr + "," +
        urlParameter.Hour + "," +
        urlParameter.UserId + "," +
        urlParameter.isResult + "," +
        urlParameter.IsCache + "," +
        urlParameter.isPassval;

    $.ajax({
        cache: true,
        type: "POST",
        url: 'GooFlowShow.ashx',
        beforeSend: function () { $("#divLoadingStatus").show(); },
        complete: function () { $("#divLoadingStatus").hide(); },
        data: { type: "flownodeLoad", urlPara: urlP },
        dataType: "json",
        success: function (datasource) {
            demo.clearData();
            demo.loadData(datasource);
        },
        error: function () {
            alert("请求数据出错！");
        }
    });



    //  demo.loadData(flowData);
    //节点双击事件  ====sj===========
    demo.onNewNodeDBClick = function (id, nodeName, nodeType) {
        //alert(id + "|" + nodeName + "|" + nodeType);
        var clickNode = demo.$nodeData[id];
        nodeObj = clickNode;
        if (nodeObj.type == "node") {
            tools.showDiv();
        }
        else if (clickNode.nodeinfo.raNode.Sql != "") {
            tools.showDiv();
            BindGrid(clickNode);
        }
    };
}
function BindGrid(raNode) {
    var gridOptions = {
        ispaging: true,
        islocaldata: false,
        analyzer: raNode.nodeinfo.raNode.ana,
        col: {
            sort: false
        }
    };
    if (raNode.nodeinfo.raNode.isSql) {
        gridOptions = {
            captionName: "",
            pagingId: "pager",

            //数据来源
            ajax: {
                path: "../../../javascript/JSControl/SmartGrid/Handler/JqGridData.ashx",
                sqlstr: raNode.nodeinfo.raNode.Sql.split(':')[1],
                connstr: raNode.nodeinfo.raNode.Sql.split(':')[0]
            },
            col: {
                sort: false
            }
        }
    }
    // 初始化表格
    $("#grid").smartgrid(gridOptions);
}

$show.initBtnClick = function () {

    $(document.body).on("click", "#liMeas table tr td input[type='button']", function (e) {
        $show.btnOperation($(this), $(this).val());
    });
    $(document.body).on("click", "#liDims table tr td input[type='button']", function (e) {
        $show.btnOperation($(this), $(this).val());
    });
    $(document.body).on("click", ".gl_close", function (e) {
        tools.closeNodeDIV();
    });
    $(document.body).on("mousedown", "#gl_tit", function (e) {
        tools.moveDiv(event, "gl_box");
    });
    $(document.body).on("mouseenter", ".gl_close", function (e) {
        $(".gl_close a img").attr("src", "codebase/img/gl_clear.jpg");
    });
    $(document.body).on("mouseleave", ".gl_close", function (e) {
        $(".gl_close a img").attr("src", "codebase/img/gl_close.jpg");
    });
    $(document.body).on("click", "#btnExport", function (e) {
        if (nodeObj.nodeinfo.raNode.ana != null && nodeObj.nodeinfo.raNode.ana != "") {
            analyzerCsvExport(nodeObj.nodeinfo.raNode.ana);
        }
        else {
            csvExport(raNode.nodeinfo.raNode.Sql.split(':')[1], raNode.nodeinfo.raNode.Sql.split(':')[0])

        }


    });
    $(document.body).on("click", "#btnAnalysis", function (e) {
        alert('跳转到二次分析界面');
    });
}

//=============================================弹出框的操作集合(如下)=============================================

function nTabs(thisObj, Num) {
    if (thisObj.className == "active") return;
    var tabObj = thisObj.parentNode.id;
    var tabList = document.getElementById(tabObj).getElementsByTagName("li");
    for (i = 0; i < tabList.length; i++) {
        if (i == Num) {
            thisObj.className = "active";
            document.getElementById(tabObj + "_Content" + i).style.display = "block";
        } else {
            tabList[i].className = "normal";
            document.getElementById(tabObj + "_Content" + i).style.display = "none";
        }
    }
}
$show.showDiv = function (divID) {
    var strHtml = '<div id="mask" class="mask"></div>';
    if ($("#mask").length <= 0) {
        $(document.body).append(strHtml);
    }
    $("#mask").css("height", $(window).height());
    $("#mask").css("width", $(window).width() + 1000);
    $("body").css({ "overflow": "hidden", "width": $(window).width() });
    $("#mask").css("overflow", "hidden");
    $("#mask").show();
    //创建nodediv
    $show.createNodeDiv("grid", nodeObj);
}
$show.moveDiv = function (event, divID) {
    var isMove = true;
    var abs_x = event.pageX - $('#' + divID).offset().left;
    var abs_y = event.pageY - $('#' + divID).offset().top;
    $(document).mousemove(function (event) {
        if (isMove) {
            var obj = $('#' + divID);
            var left = (event.pageX - abs_x) <= 0 ? 1 : (event.pageX - abs_x);
            var top = (event.pageY - abs_y) <= 0 ? 1 : (event.pageY - abs_y);
            var leftMax = 1100 //$(window).width() - obj.width() - 5;//离最左边的距离
            var topMax = $(window).height() - obj.height() - 25;//离最上边的距离
            if (left >= leftMax) {
                left = leftMax;
            }
            if (top >= topMax) {
                top = topMax;
            }
            obj.css({ 'left': left, 'top': top });
        }
    }).mouseup(
        function () {
            isMove = false;
        });
};
//关闭弹出框
$show.closeNodeDIV = function () {
    $("#gl_box").fadeOut();
    $("#mask").fadeOut("slow");
}
//obj 按钮对象 operText：操作类型 （取消 确定 修改）
$show.btnOperation = function (obj, operText) {
    tools.btnObj = obj.parent().parent().find('td:eq(0) input');
    var expressID = obj.parent().parent().find('td:eq(0)').attr("id");

    switch (operText) {
        case "修改":
            obj.parent().find("input[value='修改']").hide();
            obj.parent().find("input[value='取消']").show();
            obj.parent().find("input[value='确定']").show();
            obj.parent().parent().find('td:eq(0) input').attr('disabled', false);
            if (tools.btnObj.length == 1) {
                tools.old1 = tools.btnObj[0].value;
            } else if (tools.btnObj.length == 2) {
                tools.old1 = tools.btnObj[0].value;
                tools.old2 = tools.btnObj[1].value;
            }
            break;
        case "取消":
            obj.parent().find("input[value='取消']").hide();
            obj.parent().find("input[value='确定']").hide();
            obj.parent().find("input[value='修改']").show();
            obj.parent().parent().find('td:eq(0) input').attr('disabled', true);
            if (tools.btnObj.length == 1) {
                tools.btnObj[0].value = tools.old1;
            } else if (tools.btnObj.length == 2) {
                tools.btnObj[0].value = tools.old1;
                tools.btnObj[1].value = tools.old2;
            }
            break;
        case "确定":
            obj.parent().find("input[value='确定']").hide();
            obj.parent().find("input[value='取消']").hide();
            obj.parent().find("input[value='修改']").show();
            obj.parent().parent().find('td:eq(0) input').attr('disabled', true);
            var newValue = '';
            //if (tools.btnObj.length == 1) {
            //    newValue = 'express_id:' + expressID + "--文本框值：" + tools.btnObj[0].value;
            //} else if (tools.btnObj.length == 2) {
            //    newValue = 'express_id:' + expressID + "--第一个文本框值：" + tools.btnObj[0].value + '---第二个文本框值：' + tools.btnObj[1].value;

            //}
            var txtval = obj.parent().parent().find('td:eq(0)').text();
            //alert(txtval);
            var requestJonStr = {};


            if (nodeObj.type == "node") {
                requestJonStr.type = "updateMea";
                requestJonStr.reportid = nodeObj.nodeinfo.raNode.ReportId;
                requestJonStr.nodeid = nodeObj.nodeinfo.raNode.NodeId;
                requestJonStr.versiondesc = nodeObj.nodeinfo.raNode.VersionDesc;
                requestJonStr.meaid = obj.parent().parent().find('td:eq(0)').attr("measureID")
                requestJonStr.MaxVal = tools.btnObj[0].value;
                requestJonStr.MinVal = tools.btnObj[1] == undefined ? "" : tools.btnObj[1].value;


                if (tools.btnObj.length == 1) {
                    requestJonStr.expr_desc = txtval + tools.btnObj[0].value;
                }
                else if (tools.btnObj.length == 2) {
                    requestJonStr.expr_desc = txtval.replace("AND", tools.btnObj[0].value + " AND ").replace("OR", tools.btnObj[0].value + " OR ") + tools.btnObj[1].value;
                }
            }
            else {

                var dimfiler = nodeObj.nodeinfo.raNode.DimFiler;
                var dimupdate = "[" + txtval.replace(/\./g, "].[") + tools.btnObj[0].value + "]";
                var dimval = dimfiler.replace(dimfiler.split(';')[obj.parent().parent().find('td:eq(0)').attr("dimindex")], dimupdate);
                requestJonStr.type = "updateDim";
                requestJonStr.dimfiler = dimval;
                requestJonStr.reportid = nodeObj.nodeinfo.raNode.ReportId;
                requestJonStr.nodeid = nodeObj.nodeinfo.raNode.NodeId;
                requestJonStr.versiondesc = nodeObj.nodeinfo.raNode.VersionDesc;
            }
            $.ajax({
                cache: true,
                type: "POST",
                url: 'GooFlowShow.ashx',
                beforeSend: function () { $("#divLoadingStatus").show(); },
                complete: function () { $("#divLoadingStatus").hide(); },
                data: requestJonStr,
                dataType: "text",
                success: function (datasource) {
                    alert(datasource);
                },
                error: function () {
                    alert("请求数据出错！");
                }
            });


            break;
    }
}

$show.createNodeDiv = function (gridID, nodeObj) {
    //先删除div
    $(".gl_box").remove();
    var strHtml = ' <div class="gl_box" id="gl_box"><div class="gl_close" title="关闭当前窗口"><a href="#">';
    strHtml += '<img src="codebase/img/gl_close.jpg" width="16" height="16" alt="" /></a></div>';
    strHtml += '<div class="gl_tit" id="gl_tit">节点详情和阈值配置</div><div class="gl_cont"><div class="nTab">';
    strHtml += '<div class="TabTitle"><ul id="myTab1"><li class="active" onclick="nTabs(this,0);">节点详情</li>';
    strHtml += '<li class="normal" id ="222"  onclick="nTabs(this,1);">阈值配置</li></ul></div><div class="TabContent">';
    strHtml += '<div id="myTab1_Content0"><div class="oper_top"><input type="button" id="btnExport" value="导出Excel" /> ';
    strHtml += '<input type="button" id="btnAnalysis" value="自定义分析" /><div id="dialogCsvExport" style="z-index:9999;position:absolute;"></div></div>';
    strHtml += '<div id="grid"></div></div><div id="myTab1_Content1" class="none">';
    strHtml += '<div id="threValueSet"><ul>';
    var tableMea = ""
    var tableDim = "";
    if (nodeObj.type == "node") {
        tableMea = '<li id="liMeas"><fieldset><legend><span class="roundSpan">指标条件阈值设置</span></legend><div><table>';
        $.each(nodeObj.nodeinfo.meathreshold, function (i, element) {
            var arrSign = element.MeaSign.split(',');
            var len = arrSign.length;
            if (len == 1) {
                var meaValue = element.MaxVal == '' ? (element.MinVal) : element.MaxVal;
                tableMea += '<tr><td id="' + element.ExprId + '"  measureID="' + element.MeaId + '">' + element.MeaName + arrSign[0] + '<input type="text" value="' + meaValue + '" disabled="disabled" /></td><td><input type="button" value="修改" /><input style="display: none;" type="button" value="取消" /><input style="display: none;" type="button" value="确定" /></td></tr>';
            } else {
                var sign1 = arrSign[0];
                var sign2 = arrSign[1];
                var andor = element.MeaAndOr == "0" ? " AND " : " OR ";
                tableMea += '<tr><td id="' + element.ExprId + '"  measureID="' + element.MeaId + '">' + element.MeaName + sign1 + '<input type="text" value="' + element.MaxVal + '" disabled="disabled" />' + andor + ' ' + element.MeaName + sign2 + '<input type="text" value="' + element.MinVal + '" disabled="disabled" /></td><td><input type="button" value="修改" /><input style="display: none;" type="button" value="取消" /><input style="display: none;" type="button" value="确定" /></td></tr>';
            }
        });
        tableMea += '</table></div></fieldset></li>';
    }

    else {
        tableDim = '<li id="liDims"><fieldset><legend><span class="roundSpan">维度过滤阈值设置</span></legend><div><table>';
        if (nodeObj.nodeinfo.raNode.DimFiler != "") {
            var arrDimstr = nodeObj.nodeinfo.raNode.DimFiler.split(';');
            for (var j = 0; j < arrDimstr.length; j++) {
                var dimstr = arrDimstr[j];
                var dimDesc = dimstr.split('.')[0].replace('[', '').replace(']', '');
                var levelDesc = dimstr.split('.')[1].replace('[', '').replace(']', '');
                var levelValue = dimstr.split('.')[2].replace('[', '').replace(']', '');
                tableDim += '<tr><td id="' + nodeObj.nodeinfo.raNode.ReportId + '_' + nodeObj.nodeinfo.raNode.VersionDesc + '_' + nodeObj.id + '" dimindex="' + j + '">' + dimDesc + '.' + levelDesc + '.<input type="text" value="' + levelValue + '" disabled="disabled" /></td><td><input type="button" value="修改" /><input style="display: none;" type="button" value="取消" /><input style="display: none;" type="button" value="确定" /></td></tr>';
            }
        }
        tableDim += '</table></div></fieldset></li>';
    }

    strHtml += tableMea + tableDim + '</ul></div></div></div></div><div class="clear">&nbsp;</div></div></div> ';
    //添加到body中
    $(document.body).append(strHtml);
    if (nodeObj.type == "node") {

        $("#myTab1").hide();
        $("#myTab1_Content0").hide();
        $("#myTab1_Content1").show();
    }
    else {
        $("#myTab1").show();
        $("#myTab1_Content0").show();
        $("#myTab1_Content1").show();
    }
    var top = ($(window).height() - $("#gl_box").height()) / 2;
    var left = ($(window).width() - $("#gl_box").width()) / 2;
    var scrollTop = $(document).scrollTop();
    var scrollLeft = $(document).scrollLeft();
    $("#gl_box").css({ position: 'absolute', 'top': top + scrollTop, left: left + scrollLeft }).fadeIn(500);
    $("#btnAnalysis").hide();

}
//获取操作符号
$show.getSingById = function (singID) {
    var sign = '>';
    switch (singID) {
        case "1":
            sign = '>';
            break;
        case "2":
            sign = '>=';
            break;
        case "3":
            sign = '<';
            break;
        case "4":
            sign = '<=';
            break;
        case "5":
            sign = '=';
            break;
    }
    return sign;
}

//生成缓存文件操作
$show.createCacheFile = function (reportID, version, date, ne, content) {
    var p = {
        type: "createText",
        reportID: reportID,
        version: version,
        date: date,
        ne: ne,
        content: content
    };
    tools.getAjaxData(p, 'json', function (data) {
        alert(data.result);
    })
};
//读取缓存文件操作
$show.readCacheFile = function (reportID, version, date, ne) {
    var p = {
        type: "readText",
        reportID: reportID,
        version: version,
        date: date,
        ne: ne
    };
    tools.getAjaxData(p, 'json', function (data) {
        alert(data.result);
    })
};