$(document).ready(function () {
    //初始化树
    initTree();
    //查询报表事件
    $("#search").click(function () {
        searchNode();
    });
    $("#txtSearch").bind("focus", focusKey).bind("blur", blurKey);
    //防止退格键 网页后退
    $(document).keydown(function (e) {
        var doPrevent;
        if (e.keyCode == 8) {
            var d = e.srcElement || e.target;
            if (d.tagName.toUpperCase() == 'INPUT' || d.tagName.toUpperCase() == 'TEXTAREA') {
                doPrevent = d.readOnly || d.disabled;
            }
            else
                doPrevent = true;
        }
        else
            doPrevent = false;
        if (doPrevent)
            e.preventDefault();
    });
});
//工具类
var tools11 = {
    reportID: "",
    reportName: "空流程图",
    nodeType: "",
    measData: [],
    selExpressionVal: "0",
    getAjaxData: function (para, onsucess, callbackEvent, errFun) {
        request = $.ajax({
            url: "GooFlow.ashx",
            type: "post",
            dataType: "json",
            data: para,
            beforeSend: function () {
                dss.load(true);
            },
            complete: function () {
                if (callbackEvent != null) {
                    callbackEvent();
                }
                dss.load(false);
            },
            success: function (datasource) {
                onsucess(datasource);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (errFun != undefined && typeof errFun == 'function') {
                    errFun();
                }
                else {
                    alert('错误信息：' + textStatus + ' ,错误码：' + XMLHttpRequest.status);
                }
            }
        });
    }
};
//-------------------------------ZTree测试数据-------------------
//var zNodes = [{ "id": "1028589269", "pId": "1809075287", "name": "aaa" },
//    { "id": "1207879776", "pId": "-583653819", "name": "网络评估-HP关联" },
//    { "id": "1149756629", "pId": "-583653819", "name": "网络评估-无HP、TD关联" },
//    { "id": "466455057", "pId": "-583653819", "name": "网络评估分析" },
//    { "id": "968552768", "pId": "-583653819", "name": "网络分析" },
//    { "id": "314094237", "pId": "-583653819", "name": "市区网络分析" },
//    { "id": "-231383165", "pId": "-583653819", "name": "网络用户分析" },
//    { "id": "-715378220", "pId": "-583653819", "name": "dsdf" },
//    { "id": "1087346245", "pId": "2123975285", "name": "红ihio ", "open": "true" },
//    { "id": "-1138880733", "pId": "0", "name": "uuuuun", "open": "true" },
//    { "id": "-583653819", "pId": "0", "name": "四网协同", "open": "true" },
//    { "id": "1809075287", "pId": "0", "name": "test", "open": "true" },
//    { "id": "2123975285", "pId": "-1138880733", "name": "回去", "open": "true" }];

var settings = {
    data: {
        simpleData: {
            enable: true,
            idKey: "id",
            pIdKey: "pId",
            rootPId: null
        }
    },
    view: {
        dblClickExpand: true,
        fontCss: getFontCss
    },
    edit: {
        enable: true,
        showRemoveBtn: false,
        showRenameBtn: false
    },
    callback: {
        onClick: onClikLoadFlow,
        onRightClick: null
    }
};

//初始化ztree
var zTree, rMenu;
function initTree() {
    dss.load(true);
    tools11.getAjaxData(
        { type: 'getReportList' },
        function (data) {
            $.fn.zTree.init($('#treeID'), settings, data);
            zTree = $.fn.zTree.getZTreeObj("treeID");
            rMenu = $("#rMenu");
            dss.load(false);
        }, initGooFlow);
}

//zTree的搜索 开始
var lastValue = "", nodeList = [];
//样式
function getFontCss(treeId, treeNode) {
    return (!!treeNode.highlight) ? { color: "red", "font-weight": "bold" } : { color: "#333", "font-weight": "normal" };
}
//查找节点
function searchNode() {
    var txtVal = $.trim($("#txtSearch").val());
    updateNodes(false);
    nodeList = zTree.getNodesByParamFuzzy("name", txtVal);
    if (txtVal != "" || txtVal != "输入报表名字查询") {
        if (nodeList && nodeList.length > 0) {
            $("#tip").css({ display: "none" });
            updateNodes(true);
        } else {
            $("#tip").css({ display: "block" });
        }
    }
}
//更新节点
function updateNodes(highlight) {
    for (var i = 0; i < nodeList.length; i++) {
        if (nodeList[i].IsReport == "1") {
            nodeList[i].highlight = highlight;
            zTree.updateNode(nodeList[i]);
            zTree.expandNode(nodeList[i].getParentNode(), true, null, null);
        }
    }
}
//搜索框获得焦点
function focusKey(e) {
    zTree.expandAll(false);
    if ($("#txtSearch").get(0).value === "输入报表名字查询") {
        $("#txtSearch").val("");
    }
    if ($("#txtSearch").hasClass("empty")) {
        $("#txtSearch").removeClass("empty");
    }
}
//搜索框失去焦点
function blurKey(e) {
    $("#tip").css({ display: "none" });
    zTree.expandAll(true);
    if ($("#txtSearch").get(0).value === "") {
        $("#txtSearch").addClass("empty");
        $("#txtSearch").val("输入报表名字查询");
    }
}
//zTree的搜索 结束
//=========================================================点击事件 !!!!!=================
function onClikLoadFlow() {
    var nodes = zTree.getSelectedNodes(true);
    if (nodes.length > 0) {
        $("#tip").css({ display: "none" });
        $("#txtSearch").addClass("empty").val("输入报表名字查询");
        if (!nodes[0].isParent && nodes[0].IsReport == "1") {
            tools.reportID = nodes[0].id;
            tools.reportName = nodes[0].name;
            var UrlParameter = {
                ReportId: tools.reportID,//注意：其实流程的id 不是报表的id
                Version_Desc: "流程2.0",//默认版本名称
                DateType: "月",//时间类型
                Date: "2015年07月",//2014年12月12日
                NeType: "",//
                NeStr: "",
                Hour: "",
                UserId: "1394",
                isResult: "0",// 0 代表 false 1 true
                IsCache: "1", // 为空是使用缓存
                isPassval: "0"//
            };
            $show.Init(UrlParameter);
           // alert("流程id：" + tools.reportID + "--------流程名称：" + tools.reportName);
        }
    }
}

//----------------------------GooFlow的操作-------------------------------------
var flag = "";//标示是清空数据还是删除节点
var demo;
var NID;//节点id
var property = {
    width: 880,//gooflow的宽度
    height: 482,
    toolBtns: ["start", "node", "task", "chat", "end"],
    haveHead: true,
    headBtns: ["reload"], //如果haveHead=true，则定义HEAD区的按钮
    headBtnsText: ["刷新"], //HEADE区的提示文本 必须和headBtns一一对应
    haveTool: true,
    haveGroup: false,
    useOperStack: true
};
var remark = {
    cursor: "选择指针",
    direct: "转换连线",
    start: "开始结点_start",
    end: "结束结点_end",
    task: "执行节点_task",//任务结点
    node: "判断节点_node",//自动结点
    chat: "结论结点_chat",//决策结点
    state: "状态结点",
    plug: "标记结点_plug",//附加插件
    fork: "分支结点",
    "join": "联合结点",
    complex: "复合结点",
    group: "组织划分框编辑开关"
};
//初始化gooflow
function initGooFlow() {
    demo = $.createGooFlow($("#demo"), property);
    demo.setNodeRemarks(remark);
    demo.loadData({});
    //删除
    demo.onItemDel = function (id, type) {
        if (flag == "new") {
            return true;
        }
        return confirm("确定要删除该单元吗?");
    }
    //刷新数据
    demo.onFreshClick = function () {
        if (demo.$title != "空流程图") {
            alert("刷新");
        } else {
            showMsg("没有数据,无需刷新");
        }
    }
    ////节点双击事件
    demo.onNewNodeDBClick = function () {

    }
}