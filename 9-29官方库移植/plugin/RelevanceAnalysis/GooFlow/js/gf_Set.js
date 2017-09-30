
$(document).ready(function () {
    initTree();
    initGooFlow();
    bindDDLFact();

    //事实改变事件 
    $("#selFact").change(function () {
        showDimAndMeas();
        nodeObjSelected.NodeInfo.anaExpressInfoSet = [];
        nodeObjSelected.NodeInfo.anaDimInfoSet = [];
        nodeObjSelected.NodeInfo.anaDimSwitchSet = [];
        nodeObjSelected.NodeInfo.anaMeaRelationInfoSet[0].meaRelStr = "";
        nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].dimID = "";
        nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].dimName = "";
        nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].levelRelStrIDs = "";
        nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].levelRelStrNames = "";
        loadDDLExpress();
        loadReultRelStr();
        loadDimStr();
        loadDimSwitchStr();
        loadLevelRelStr();
    });
    //鼠标移上
    $("#tipFact").hover(function () {
        var tip = $("#selFact").find("option:selected").text();
        $("#tipFact").attr("title", tip);
    });
    //维度改变事件
    $("#selDim").change(function () {
        bindHandle();
    });
    //维度改变事件--维度配置
    $("#selDimSet").change(function () {
        setDefaultOption("selDimSet", $(this).val());
        bindDDLLevelDimSet();
    });
    //维度改变事件--关联粒度
    $("#selLevelDimSet").change(function () {
        setDefaultOption("selLevelDimSet", $(this).val());
        var para = {
            type: "getLevel",
            dimID: $("#selLevelDimSet").val()
        };
        tools.getAjaxData(para, function (data) {
            createCheckBox(data, 4, "divLevelsRelSet", nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].levelRelStrIDs.split(','));
        }, null);
    });
    //粒度改变事件--维度配置
    $("#selLevelSet").change(function () {
        setDefaultOption("selLevelSet", $(this).val());
    });
    //分析层次改变事件
    $("#selHier").change(function () {
        bindDDLLevel();
    });
    //维度关系表改变事件
    $("#selDimSwitch").change(function () {
        setDefaultOption("selDimSwitch", $(this).val());
    });
    //属性弹出框 关闭事件
    $(".gl_close").click(function () {
        closeNodeDIV();
    });
    //属性弹出框 移动div
    $('#gl_tit').mousedown(function (event) {
        tools.moveDIV(event, "gl_box");
    });
    $('#divSaveTitle').mousedown(function (event) {
        tools.moveDIV(event, "saveInfo");
    });
    //查询报表事件
    $("#search").click(function () {
        searchNode();
    });
    $("#txtSearch").bind("focus", focusKey).bind("blur", blurKey);
    //隐藏或者显示相应标签
    markHide(["liReturn"]);
    markShow(["expressionDefault", "liMeaRealtion"]);
    //指标和维度表达式下拉框改变事件
    $("#selExpression").change(function () {
        tools.selExpressionVal = $("#selExpression").val()
        swicthDIV(tools.selExpressionVal);
    });
    //添加
    $("#btnAddDiv").click(function () {
        add_edit(tools.selExpressionVal, "");
    });
    //编辑
    $("#btnEditDiv").click(function () { add_edit(tools.selExpressionVal, "edit"); });
    //删除
    $("#btnDelDiv").click(function () { del(tools.selExpressionVal); });
    //返回事件
    $("#liReturn").click(function () { returnPre(tools.selExpressionVal); });
    //关系配置
    $("#btnMeaSetDiv").click(function () { meaRelationSet(); });
    //配置关系表达式所用的指标表达式事件
    $("#selMeaRelation").bind("change", function () {
        var index = getIndexselMeaRelation();//【0】或【1】
        var val = $("#txtAreaMeaRelation").val();
        $("#txtAreaMeaRelation").val(val + index);
    });
    //四个符号的按钮事件
    $(":button[name='oper']").click(function () {
        var valText = $(this).val();
        $("#txtAreaMeaRelation").insertContent(valText);
    });
    //确定
    $("#btnOkDown").click(function () {
        apply(tools.selExpressionVal);
    });
    //取消
    $("#btnCancleDown").click(function () {
        if (stateJudge == "0_default" || stateJudge == "default" || state == "default" || state == "1_default" || state == "2_default") {
            var choice = confirm("您还没有保存数据，\n确认要放弃所有设置吗？", function () { }, null);
            if (choice) {
                closeNodeDIV();
            }
        } else {
            returnPre(tools.selExpressionVal);
        }
    });
    //转换大写
    $("#txtAreaMeaRelation").keypress(function (event) {
        var key = event.which;//event.keyCode
        if (key >= 97 && key <= 122) {//找到输入是小写字母的ascII码的范围
            event.preventDefault();//取消事件的默认行为
            $(this).val($(this).val() + String.fromCharCode(key - 32));//转换
        }
    });
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

    //全屏显示
    $("#btnFullScreen").bind("click", function () {
        toFull();
    });
    //预览显示
    $("#btnView").bind("click", function () {
        //alert("预览功能开发中……");
        showMsg('预览功能开发中…');
    });
    //保存数据到数据库
    $("#btnSaveData").bind("click", function () {
        saveAllNodeAndLine();
    });
    //版本改变事件
    $("#selVersion").change(function () {
        var val = $(this).val();
        var version_desc = $(this).find("option:selected").text();
        if (val != "-1") {
            $("#btnDelData").show();
            $("#txtVersion").hide();
            $("#btnDefaultSet").show();
            loadGFData(tools.reportID, version_desc);
        } else {
            $("#btnDelData").hide();
            $("#txtVersion").show();
            $("#btnDefaultSet").hide();
            $("#txtVersion").val("请输入新建的版本号");

            flag = "new";
            demo.$max = 1;
            demo.clearData();
        }

    });
    //真正删除数据
    $("#btnDelData").bind("click", function () {
        var version_desc = $("#selVersion option:selected").text();
        var choice = confirm("您确认要删除版本号为：【" + version_desc + "】的所有数据吗？\n删除后数据无法恢复");
        if (choice) {
            delVersion(version_desc);
        }
    });
    //设为默认版本号
    $("#btnDefaultSet").bind("click", function () {
        var version_desc = $("#selVersion option:selected").text();
        var choice = confirm("您确认要设置版本号【" + version_desc + "】为默认版本号吗？\n您还可以点击该按钮再次更改其他版本号为默认版本");
        if (choice) {
            setDefaultVersion(version_desc);
        }
    });
    $(".gl_close").hover(function () {
        $(".gl_close a img").attr("src", "codebase/img/gl_clear.jpg");
    }, function () {
        $(".gl_close a img").attr("src", "codebase/img/gl_close.jpg");
    });
    //保存版本关闭事件
    $("#divSave_close").click(function () {
        hideSaveVersionInfo();
    });
    //版本号名称修改
    $("#versionOk").click(function () {
        var oper = $("input[name='versionOper']:checked").val();
        if (oper == '1') {//修改版本
            var selVersionText = $("#selVersion option:selected").text();
            saveVersion(selVersionText);
        } else {//增加版本
            var txtVersion = $.trim($("#txtNewVersion").val());
            if (txtVersion == '') {
                alert("新建版本名称不能为空！");
                return;
            }
            if (isExistOptionByText("selVersion", txtVersion)) {
                alert("该报表下，已存在相同的版本号，请重新输入");
                return;
            }
            if ($("#selVersion option").length > 5) {
                alert("该报表下，已超过最大版本数目(最大是5个)\n请先删除其他版本后进行操作");
                return;
            }
            saveVersion(txtVersion);
        }
    });
    //版本号名称修改
    $("#versionCancle").click(function () {
        hideSaveVersionInfo();
    });
    $("input[name='versionOper']").change(function () {
        if ($(this).val() == "0") {//增加版本new
            $("#trNewVersion").show();
            $("#trVersionName").hide();
        } else {
            $("#trNewVersion").hide();
            $("#trVersionName").show();
        }
    });
});//end
//临时的版本号名称
var tempVersion = "";
//隐藏 保存信息框
function hideSaveVersionInfo() {
    $("#saveInfo").fadeOut();
    $("#mask").fadeOut("slow");
}
//隐藏标签
function markHide(ids) {
    $.each(ids, function (i, element) {
        $("#" + element).hide();
    });
}
//显示标签
function markShow(ids) {
    markHide(["liAdd", "liEdit", "liDel", "liReturn", "liMeaRealtion", "expressionDefault", "expressionSet", "meaRelationSet", "dimDefault", "dimSet", "dimSwitchDefault", "dimSwitchSet", "levelDefault", "levelSet"]);
    $.each(ids, function (i, element) {
        //if (element == "expressionSet") {
        //    var str = $("#expressionSet").find(".yzsz_box").html();
        //    $("#expressionSet").find(".yzsz_box").html(str);//重新加载html
        //}
        $("#" + element).show();
    });
}
//工具类
var tools = {
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
                alert('错误信息：' + textStatus + ' ,错误码：' + XMLHttpRequest.status);
            }
        });
    },
    //显示div
    showDIV: function (divID) {
        var strHtml = '<div id="mask" class="mask"></div>';
        if ($("#mask").length <= 0) {
            $(document.body).append(strHtml);
        }
        $("#mask").css("height", $(window).height());
        $("#mask").css("width", $(window).width() + 1000);
        $("body").css({ "overflow": "hidden", "width": $(window).width() });
        $("#mask").css("overflow", "hidden");
        $("#mask").show();
        var top = ($(window).height() - $("#" + divID).height()) / 2;
        var left = ($(window).width() - $("#" + divID).width()) / 2;
        var scrollTop = $(document).scrollTop();
        var scrollLeft = $(document).scrollLeft();
        $("#" + divID).css({ position: 'absolute', 'top': top + scrollTop, left: left + scrollLeft }).fadeIn(500);
    },
    //移动div
    moveDIV: function (event, divID) {
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
    },
    CRC32: function (str) {
        function Utf8Encode(string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        };
        str = Utf8Encode(str + new Date().getTime());
        var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";

        if (typeof (crc) == "undefined") { crc = 0; }
        var x = 0;
        var y = 0;
        crc = crc ^ (-1);
        for (var i = 0, iTop = str.length; i < iTop; i++) {
            y = (crc ^ str.charCodeAt(i)) & 0xFF;
            x = "0x" + table.substr(y * 9, 8);
            crc = ((crc >> 8) & 0x00FFFFFF) ^ x;
        }
        return crc ^ (-1);
    },
    //是否是数字 含小数 最多4位小数
    isNum: function (num) {
        var reg = /^(-)?(\d+(\.\d{0,4})?)?$/;
        return reg.test(num);
    },
    isIntNum: function (num) {
        var reg = /^(\d+(\.\d{0,0})?)?$/;
        return reg.test(num);
    },
    format: function () {
        if (arguments.length == 0)
            return null;
        var str = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
            str = str.replace(re, arguments[i]);
        }
        return str;
    },
    GetDateTime: function () {
        var dd = new Date();
        var year = dd.getFullYear();
        var month = dd.getMonth() + 1; //获取当前月份的日期 
        month = month < 10 ? "0" + month : month;
        var date = dd.getDate();
        date = date < 10 ? "0" + date : date;
        var h = dd.getHours();
        h = h < 10 ? "0" + h : h;
        var m = dd.getMinutes();
        m = m < 10 ? "0" + m : m;
        var s = dd.getSeconds();
        s = s < 10 ? "0" + s : s;
        return year + month + date + h + m + s;
    }
};
//页面加载完成
//-------------------------------ZTree操作-------------------
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
        onRightClick: OnRightClick
    }
};

//初始化ztree
var zTree, rMenu;
function initTree() {
    dss.load(true);
    tools.getAjaxData(
        { type: 'getReportList' },
        function (data) {
            $.fn.zTree.init($('#treeID'), settings, data);
            zTree = $.fn.zTree.getZTreeObj("treeID");
            rMenu = $("#rMenu");
            addBGColor();
            dss.load(false);
        }, clearFlow);
}
//清空流程图数据
function clearFlow() {
    flag = "new";
    demo.setTitle("空流程图");
    demo.clearData();
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
            if (demo.$title != nodes[0].name) {
                tools.reportID = nodes[0].id;
                tools.reportName = nodes[0].name;
                getVersionData();
            }
        }
    }
}
//获得某一版本的数据
var defaultVersion = "";//默认版本号
function getVersionData(versionDesc) {
    var p = {
        type: "getVersion",
        reportID: tools.reportID
    };
    tools.getAjaxData(p, function (data) {
        bindDDL(data, "selVersion");
        defaultVersion = getDefaultVersion(data);
        var desc = defaultVersion;
        var tip = defaultVersion.length > 10 ? defaultVersion.substring(0, 8) + "…" : defaultVersion;
        $("#lblVersion").text(tip).attr("title", desc);
    }, function () {
        //有默认版本就加载默认版本 没有默认版本就加载下拉框第一个版本号
        if (versionDesc == undefined || versionDesc == "") {
            versionDesc = $("#selVersion option:selected").text();
            if (defaultVersion != "无") {//如果存在默认版本号 就加载默认版本
                versionDesc = defaultVersion;
                setDefaultOptionByText("selVersion", defaultVersion);
            }
        } else {
            setDefaultOptionByText("selVersion", versionDesc);
        }
        if ($("#selVersion").val() != "-1") {
            $("#btnDelData").show();
            $("#txtVersion").hide();
            $("#btnDefaultSet").show();
        } else {
            $("#btnDelData").hide();
            $("#txtVersion").show();
            $("#btnDefaultSet").hide();
        }
        loadGFData(tools.reportID, versionDesc)
    });
}
//获得默认的版本号
function getDefaultVersion(data) {
    var version = "无";
    $.each(data, function (i, e) {
        if (e.isdefault == "1") {
            version = e.name
            return false;
        }
    });
    return version;
}
//加载某一版本的数据
function loadGFData(reportID, version_desc) {
    var para = {
        type: "loadFlow",
        reportID: reportID,
        reportName: tools.reportName,
        version_desc: version_desc
    };
    flag = "new";
    tools.getAjaxData(para, function (data) {
        demo.clearData();
        demo.loadData(data);
    }, reLoadNode, function () {
        demo.clearData();
        demo.setTitle(tools.reportName + "_Error");
        demo.loadData({});
    });
}
//重新给节点赋值
function reLoadNode() {
    flag = "";
    for (d in demo.$nodeData) {
        GFNode.Nodes.push(demo.$nodeData[d]);
    }
}
//右键事件
function OnRightClick(event, treeId, treeNode) {
    if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
        zTree.cancelSelectedNode();
        showRMenu("root", event.clientX, event.clientY);
    } else if (treeNode && !treeNode.noR) {
        zTree.selectNode(treeNode);
        if (treeNode.IsReport == '1') {//报表
            showRMenu("IsReportY", event.clientX, (event.clientY + 6));
        } else if (treeNode.IsReport == '0') {//类别
            if (treeNode.isParent == true) {//有子节点
                showRMenu("IsReportN", event.clientX, (event.clientY + 6));
            } else {// 没有子节点
                showRMenu("IsReportNAndDel", event.clientX, (event.clientY + 6));
            }
        }
    }
}
//显示右键列表
function showRMenu(type, x, y) {
    $("#rMenu ul").show();
    if (type == "root") {
        $("#m_addCategory").show();
        $("#m_addReport").hide();
        $("#m_edit").hide();
        $("#m_del").hide();
    } else if (type == "IsReportY") {
        $("#m_addCategory").hide();
        $("#m_addReport").hide();
        $("#m_edit").show();
        $("#m_del").show();
        $("#m_del").text("删除报表");
    } else if (type == "IsReportN") {
        $("#m_addCategory").show();
        $("#m_addReport").show();
        $("#m_edit").show();
        $("#m_del").hide();
    } else if (type == "IsReportNAndDel") {
        $("#m_addCategory").show();
        $("#m_addReport").show();
        $("#m_edit").show();
        $("#m_del").show();
        $("#m_del").text("删除类别");
    }
    rMenu.css({ "top": y + "px", "left": x + "px", "visibility": "visible" });
    $("body").bind("mousedown", onBodyMouseDown);
}
//隐藏右键列表
function hideRMenu() {
    if (rMenu) rMenu.css({ "visibility": "hidden" });
    $("body").unbind("mousedown", onBodyMouseDown);
}
//body右键事件
function onBodyMouseDown(event) {
    if (!(event.target.id == "rMenu" || $(event.target).parents("#rMenu").length > 0)) {
        rMenu.css({ "visibility": "hidden" });
    }
}
//增加节点
function addNode(addType) {
    hideRMenu();
    var p = {
        txtDesc: "类别名称",
        dialogTitle: "增加类别",
        type: "addCaterory",
        isReport: "0"
    };
    if (addType == "category") {
        p.txtDesc = "类别名称";
        p.dialogTitle = "增加类别";
        p.type = "addCaterory";
        p.isReport = "0";
    } else if (addType == "report") {
        p.txtDesc = "报表名称";
        p.dialogTitle = "增加报表";
        p.type = "addReport";
        p.isReport = "1";
    }
    var strHtml = '<div id="addDIV" style="text-align: center; padding-top: 24px; display: none;overflow:hidden;"> ' +
      '<table> <tr><td style="font-size:14px;">' + p.txtDesc + ':</td><td><input type="text" id="txtAdd" style="width:160px;height:20px;" /></td> </tr> ' +
       '<tr> <td colspan="2" style="text-align:left; color:red; font-size:12px;  padding-top:5px;" ><span id="txtDesc"></span></td></tr></table> </div>';
    $("#addDIV").remove();
    $(document.body).append(strHtml);
    //if ($("#addDIV").length <= 0) {
    //    $(document.body).append(strHtml);
    //}
    var obj = $("#addDIV");
    obj.dialog({
        autoOpen: true,   // 是否自动弹出窗口
        modal: true,    // 设置为模态对话框
        resizable: false,
        width: 350,   //弹出框宽度
        height: 100,   //弹出框高度
        title: p.dialogTitle,  //弹出框标题
        position: "center",  //窗口显示的位置
        buttons: {
            '增加': function () {
                //传递参数
                var txtVal = $.trim($("#txtAdd").val());
                if (txtVal != "") {
                    var isExist = isExistChildrenNodeByName(txtVal, p.isReport);
                    var PID;
                    if (zTree.getSelectedNodes()[0] == undefined) {
                        PID = "0";
                    } else {
                        PID = zTree.getSelectedNodes()[0].id;
                    }
                    if (!isExist) {//不存在相同子节点 就添加
                        var para = {
                            type: p.type,
                            name: txtVal,
                            pid: PID,
                            isReport: p.isReport
                        };
                        tools.getAjaxData(para, function (data) {
                            if (data.flag.toLowerCase() == "true") {
                                ShowAlert("添加成功");
                            } else {
                                ShowAlert("添加失败，请重新添加");
                            }
                        }, initTree);
                        $(this).dialog("close");
                        obj.remove();
                    }
                    else {//存在就提示 
                        $("#txtDesc").text("提示信息：已存在该节点,请修改名称后添加");
                        return;
                    }
                }
                else {
                    $("#txtDesc").text("提示信息：内容不能为空！");
                    return;
                }
            },
            '取消': function () {
                $(this).dialog("close");
                obj.remove();
            }
        }
    });
}
//编辑节点
function editNode() {
    nodes = zTree.getSelectedNodes();
    treeNode = nodes[0];
    if (nodes.length == 0) {
        ShowAlert("请先选择一个节点");
        return;
    }
    var p = {
        id: treeNode.id,
        txtDesc: "新类别名称",
        dialogTitle: "编辑名称",
        type: "editCaterory",
        isReport: "0"
    };
    if (treeNode.IsReport == "0") {
        p.txtDesc = "新类别名称";
        p.dialogTitle = "编辑名称";
        p.type = "editCaterory";
        p.isReport = "0";
    } else if (treeNode.IsReport == "1") {
        p.txtDesc = "新报表名称";
        p.dialogTitle = "编辑名称";
        p.type = "editReport";
        p.isReport = "1";
    }
    var strHtml = '<div id="addDIV" style="text-align: center; padding-top: 24px; display: none;overflow:hidden;"> ' +
       '<table> <tr><td style="font-size:14px;">' + p.txtDesc + ':</td><td><input type="text" id="txtAdd" style="width:160px;" value="' + treeNode.name + '" /></td> </tr> ' +
        '<tr> <td colspan="2" style="text-align:left; color:red; font-size:12px;  padding-top:5px;" ><span id="txtDesc"></span></td></tr></table> </div>';
    $("#addDIV").remove();
    $(document.body).append(strHtml);

    var obj = $("#addDIV");
    obj.dialog({
        autoOpen: true,   // 是否自动弹出窗口
        modal: true,    // 设置为模态对话框
        resizable: false,
        width: 350,   //弹出框宽度
        height: 150,   //弹出框高度
        title: p.dialogTitle,  //弹出框标题
        position: "center",  //窗口显示的位置
        buttons: {
            '更新': function () {
                var txtVal = $.trim($("#txtAdd").val());
                if (txtVal != "") {//内容不为空时
                    var isExist = isExistBrothersNodeByName(txtVal, p.isReport);//兄弟节点
                    if (isExist) {
                        $("#txtDesc").text("提示信息：存在相同的节点名称，请重新输入");

                        return;
                    }
                    else {//编辑代码
                        var para = {
                            type: p.type,
                            id: p.id,
                            name: txtVal,
                            isReport: p.isReport
                        };
                        tools.getAjaxData(para, function (data) {
                            if (data.flag.toLowerCase() == "true") {
                                ShowAlert("更新成功");
                            } else {
                                alert("更新失败，请重新更新");
                            }
                        }, initTree);
                        obj.remove();
                    }
                }
                else {
                    $("#txtDesc").text("提示信息：内容不能为空！");
                    return;
                }
            },
            '取消': function () {
                $(this).dialog("close");
                obj.remove();
            }
        }
    });//dialog结束
};
//判断添加时是否存在相同子节点 参数IsReport 0是类别 1是报表
function isExistChildrenNodeByName(childNodeName, IsReport) {
    var isExist = false;
    var nodes = zTree.getSelectedNodes();
    var treeNode = nodes[0];
    if (treeNode == undefined) {//增加大类别(没有父节点的节点)
        if (zTree.getNodes() && zTree.getNodes().length > 0) {
            for (var i = 0; i < zTree.getNodes().length; i++) {
                var childNode = zTree.getNodes()[i];
                if (childNode.name == childNodeName && childNode.IsReport == IsReport) {
                    isExist = true;
                    break;
                }
            }
        }
    } else {
        if (treeNode.children && treeNode.children.length > 0) {
            for (var i = 0; i < treeNode.children.length; i++) {
                var childNode = treeNode.children[i];
                if (childNode.name == $.trim(childNodeName) && childNode.IsReport == IsReport) {
                    isExist = true;
                    break;
                }
            }
        }
    }
    return isExist;
}
//判断添加时是否存在相同兄弟节点 参数IsReport 0是类别 1是报表
function isExistBrothersNodeByName(NodeName, IsReport) {
    var isExist = false;
    var nodes = zTree.getSelectedNodes();
    var treeNode = nodes[0].getParentNode();
    if (treeNode == null) {//没有父节点 即根节点
        if (zTree.getNodes() && zTree.getNodes().length > 0) {
            for (var i = 0; i < zTree.getNodes().length; i++) {
                var childNode = zTree.getNodes()[i];
                if (childNode.name == NodeName && childNode.IsReport == IsReport) {
                    isExist = true;
                    break;
                }
            }
        }
    } else {//有父节点时
        if (treeNode.children && treeNode.children.length > 0) {
            for (var i = 0; i < treeNode.children.length; i++) {
                var childNode = treeNode.children[i];
                if (childNode.name == $.trim(NodeName) && childNode.IsReport == IsReport) {
                    isExist = true;
                    break;
                }
            }
        }
    }
    return isExist;
}
function ShowAlert(msg) {
    var strHtml = '<div id="dialogTip" style="diaplay:none"></div>';
    if ($("#dialogTip").length <= 0) {
        $(document.body).append(strHtml);
    }

    $("#dialogTip").dialog({
        title: "提示信息",
        modal: true,
        width: 350,   //弹出框宽度
        height: 150,   //弹出框高度
        open: function () {
            setTimeout(function () { $("#dialogTip").html(msg); }, 10);
        },
        buttons: {
            "确定": function () {
                $("#dialogTip").dialog("close");
            }
        }
    })
}
//删除节点
function removeTreeNode() {
    hideRMenu();
    var nodes = zTree.getSelectedNodes();
    if (nodes && nodes.length > 0) {
        if (nodes[0].children && nodes[0].children.length > 0) {
            var msg = "要删除的节点是父节点，如果删除将连同子节点一起删掉。\n\n请确认！";
            if (confirm(msg) == true) {
                zTree.removeNode(nodes[0]);
            }
        } else {
            var msg = "确认要删除吗？删除后不可恢复。\n\n请确认！";
            if (confirm(msg) == true) {
                treeNode = nodes[0];
                var p = {
                    id: treeNode.id,
                    type: "delCaterory",
                    isReport: "0"
                };
                if (treeNode.IsReport == "0") {

                } else if (treeNode.IsReport == "1") {
                    p.type = "delReport";
                    p.isReport = "1";
                }
                tools.getAjaxData(p, function (data) {
                    if (data.flag.toLowerCase() == "true") {
                        ShowAlert("删除成功");
                    } else {
                        ShowAlert("删除失败，请重新删除");
                    }
                }, function () {
                    initTree();
                    $("#btnDelData").hide();
                    $("#txtVersion").show();
                    $("#btnDefaultSet").hide();
                    $("#lblVersion").text('无');
                    $("#txtVersion").val("请输入新建的版本号");
                    $("#selVersion").empty();
                    addOptionValue("selVersion", "-1", "新建版本号(操作项)");
                });
            }
        }
    }
}
//增加右键列表的鼠标背景颜色
function addBGColor() {
    $("#rMenu ul li").each(function () {
        $(this).hover(function () {
            $(this).addClass("ztreeBgColor");
        },
    function () {
        $(this).removeClass("ztreeBgColor");
    });
    });
}
//----------------------------GooFlow的操作-------------------------------------
var flag = "";//标示是清空数据还是删除节点
var demo;
var NID;//节点id
var state = "0_default";//哪个界面
var stateJudge = "0_default";//判断节点的状态
var nodeObjSelected = demoNode;//选中的节点对象
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
    $("#btnDelData").hide();
    $("#txtVersion").show();
    $("#btnDefaultSet").hide();
    $("#txtVersion").val("请输入新建的版本号");

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
            getVersionData($("#selVersion option:selected").text());
        } else {
            //alert("没有数据");
            showMsg("没有数据,无需刷新");
        }
    }
    ////节点双击事件
    demo.onNewNodeDBClick = function () {

    }
}
//删除标示
function delFlag() {
    flag = "";
}
function closeNodeDIV() {
    $("#gl_box").fadeOut();
    $("#mask").fadeOut("slow");
}
//总得格式
var GFNode = {
    title: "",
    initNum: "",
    Nodes: [],
    Lines: []
};
//节点数据格式
var demoNode = {
    id: "", name: "", left: "", top: "", type: "task", width: "", height: "",
    NodeInfo: {
        anaExpressInfoSet: [],//指标表达式增加界面结果
        anaMeaRelationInfoSet: [{ "meaRelStr": "" }],   //关系表达式配置界面
        anaDimInfoSet: [],//维度配置配置界面
        anaDimSwitchSet: [],//维度转换配置界面
        anaLevelRelationInfoSet: [{ dimID: "", dimName: "", levelRelStrIDs: "", levelRelStrNames: "" }]//关联粒度配置界面
    }
};
//绑定 节点属性 对话框信息 双击shuangji  sj=-===============================节点双击事件============================================
function nodePropertyInfo(nodeID, oldName, nodeType, left, top) {
    tools.nodeType = nodeType;
    NID = nodeID;
    demoNode.id = nodeID;
    demoNode.name = oldName;
    demoNode.left = left;
    demoNode.top = top;
    demoNode.type = nodeType;
    demoNode.NodeInfo.nodeID = nodeID;
    demoNode.NodeInfo.nodeName = oldName;
    if (nodeType == "node") {
        stateJudge = "0_default";
    }
    state = "0_default";
    //初始化节点对象 
    nodeObjSelected = demo.$nodeData[NID];
    var divTitle = "节点属性设置";
    switch (nodeType) {
        case "node":
            divTitle = "判断节点属性设置"
            break;
        case "task":
            divTitle = "执行节点属性设置"
            break;
        case "chat":
            divTitle = "结论节点属性设置"
            break;
    }
    $("#gl_tit").text(divTitle);
    //显示节点属性弹出框
    showNodeDIV(oldName);
}
//显示节点属性div
function showNodeDIV(oldName) {

    $("#txtNodeName").val(oldName);
    loadDDLExpress();//指标表达式
    loadReultRelStr();//关系表达式
    loadLevelRelStr();//关联粒度表达式
    loadDimStr();//维度表达式
    if (nodeObjSelected.NodeInfo.anaExpressInfoSet.length > 0) {
        initLeftCondition();//初始化已选择的条件
    } else {
        tools.showDIV("gl_box");
    }
    //加载维度转换 如果父节点或者父父节点没有配置指标，则清空该节点anaDimSwitchSet
    if (nodeObjSelected.NodeInfo.anaDimSwitchSet.length > 0) {
        var pNode = getParentNodeObj(NID);
        if (pNode != undefined && pNode.NodeInfo.anaExpressInfoSet.length < 1) {
            nodeObjSelected.NodeInfo.anaDimSwitchSet = [];
            var ppNode = getParentNodeObj(pNode.id);//父节点的父节点
            if (ppNode != undefined && ppNode.NodeInfo.anaExpressInfoSet.length < 1) {
                nodeObjSelected.NodeInfo.anaDimSwitchSet = [];
            }
        }
        loadDimSwitchStr();
    }

    if (tools.nodeType == "node") {//条件节点

        initDivStyle("0");
        $("#selExpression").empty();
        addOptionValue("selExpression", "0", "指标表达式");
        tools.selExpressionVal = $("#selExpression").val();
        markShow(["expressionDefault", "liAdd", "liEdit", "liDel", "liMeaRealtion"]);
    } else {
        $("#selExpression").empty();
        addOptionValue("selExpression", "1", "维度表达式");
        addOptionValue("selExpression", "2", "维度转换");
        addOptionValue("selExpression", "3", "关联粒度");
        initDivStyle("1");
        tools.selExpressionVal = $("#selExpression").val();
        markShow(["dimDefault", "liAdd", "liEdit", "liDel"]);
    }
}

//得到连线的json
function getLineStr(ld) {
    var lineStr = "";
    for (l in ld) {
        lineStr += ld[l].from + ";" + ld[l].to + ";" + ld[l].name + ";" + ld[l].type + ";" + ld[l].M + ";" + ld[l].id + "@"
    }
    lineStr = lineStr.substring(0, lineStr.length - 1);
    return lineStr;
}
//获取节点的json
function getNodeStr(nd) {
    var nodeStr = "";
    for (n in nd) {
        nodeStr += nd[n].id + ";" + nd[n].name + ";" + nd[n].left + ";" + nd[n].top + ";" + nd[n].width + ";" + nd[n].height + ";" + nd[n].type + "@";
    }
    nodeStr = nodeStr.substring(0, nodeStr.length - 1);
    return nodeStr;
}
//绑定下拉框
function bindDDL(data, selID, defaultid) {
    var str = "";
    if (selID == "selLevel") {
        $.each(data, function (i, element) {
            if (defaultid != undefined && element.id == defaultid) {
                str += "<option  selected=\"selected\" value=\"" + element.id + "\" descCol=\"" + element.descCol + "\" title=\"" + element.name + "\">" + element.name + "</option>";
            } else {
                str += "<option  value=\"" + element.id + "\" descCol=\"" + element.descCol + "\" title=\"" + element.name + "\">" + element.name + "</option>";
            }
        });
    } else if (selID == "selVersion") {
        $.each(data, function (i, element) {
            if (element.isdefault == '1') {
                str += "<option title='背景颜色为红色的版本号为默认版本'  style='color: white; background-color: red;'  value=\"" + element.id + "\" isdefault=\"" + element.isdefault + "\" >" + element.name + "</option>";
            } else {
                str += "<option  title='背景颜色为红色的版本号为默认版本' value=\"" + element.id + "\" isdefault=\"" + element.isdefault + "\" >" + element.name + "</option>";
            }
        });
    } else {
        $.each(data, function (i, element) {
            if (defaultid != undefined && element.id == defaultid) {
                str += "<option   selected=\"selected\"  value=\"" + element.id + "\" title=\"" + element.name + "\">" + element.name + "</option>";
            } else {
                str += "<option  value=\"" + element.id + "\" title=\"" + element.name + "\">" + element.name + "</option>";
            }
        });
    }
    $("#" + selID).empty();
    $("#" + selID).append(str);
    //$("#" + selID + " option:first").attr("selected", true);   //设置Select索引值为0的项选中
}
//绑定下拉框--事实名称 指标表达式
function bindDDLFact() {
    tools.getAjaxData({ type: "getFactList" }, function (data) {
        bindDDL(data, "selFact");
    }, showDimAndMeas);
}
//绑定下拉框--维度
function bindDDLSelDimExpress() {
    var factID = $("#selFact").val();
    bindDDLselDim(factID, "selDim");
}
//绑定下拉框--维度
function bindDDLselDim(factID, selID) {
    var para = {
        type: "getDim",
        factID: factID
    };
    tools.getAjaxData(para, function (data) {
        bindDDL(data, selID);
        bindDDL(data, "selDimSet");//绑定维度设置
        bindDDL(data, "selLevelDimSet");//关联粒度配置
    }, bindHandle);
}
//在维度事件改变时，如果层次下拉框是"无"时，就执行绑定粒度事件，否则就不执行。只有点击层次事件改变时才会执行
function bindHandle() {
    bindDDLHierarchie();
    //var hierValue = $("#selHier option:selected").text();
    //if (hierValue != "无") {
    //    bindDDLLevelExpress();
    //}
}
//绑定下拉框--分析层次
function bindDDLHierarchie() {
    var dimID = $("#selDim").val();
    var para = {
        type: "getHierarchie",
        dimID: dimID
    };
    tools.getAjaxData(para, function (data) {
        bindDDL(data, "selHier");
    }, function () {
        bindDDLLevelExpress();
    });
}
//绑定下拉框--分析粒度--表达式
function bindDDLLevelExpress() {
    var dimID = $("#selDim").val();
    bindDDLLevel(dimID, "selLevel");
    bindDDLLevel($("#selDimSet").val(), "selLevelSet");//绑定粒度配置
}
//绑定下拉框--分析粒度--维度配置
function bindDDLLevelDimSet() {
    var dimID = $("#selDimSet").val();
    bindDDLLevel(dimID, "selLevelSet");
}
//绑定下拉框--分析粒度
function bindDDLLevel(dimID, selID) {
    var para = {
        type: "getLevel",
        dimID: dimID
    };
    tools.getAjaxData(para, function (data) {
        bindDDL(data, selID);
    }, null);

}
//绑定下拉框--某一事实下所有指标
function bindDDLMeas() {
    var factID = $("#selFact").val();
    var para = {
        type: "getMeas",
        factID: factID
    };
    tools.getAjaxData(para, function (data) {
        tools.measData = data;
        $.selectSuggest('txtInputSection', tools.measData, itemSelectFuntion);
        $.selectSuggest('divAllMea', tools.measData, itemSelectFuntion);
        if (data.length > 0) {
            $("#txtInputSection").val(data[0].name);
            $("#txtSectionID").val(data[0].id);
        }
    });
}
//模糊查询指标的返回函数
var itemSelectFuntion = function () {
    $("#txtInputSection").val(this.innerHTML);
    $("#txtSectionID").val(this.id);
};
//事实名称改变时显示维度和指标
function showDimAndMeas() {
    bindDDLSelDimExpress();
    bindDDLMeas();
}
//更改节点名称
function updateNodeName(newName) {
    demo.setName(NID, newName, "node");
}
//根据选择不同的表达式类型 显示不同的div 参数：0:指标表达式 1：维度表达式 2：维度转换

//在双击节点时已经给下列字段赋值========================node类型数据=============================================


function swicthDIV(selExpressionVal) {
    switch (selExpressionVal) {
        case "1":
            initDivStyle(selExpressionVal);
            loadDimStr();//重新加载
            markShow(["dimDefault", "liAdd", "liEdit", "liDel"]);
            break;
        case "2":
            initDivStyle(selExpressionVal);
            loadDimSwitchStr();//加载默认维度转换
            markShow(["dimSwitchDefault", "liAdd", "liEdit", "liDel"]);
            break;
        case "3":
            initDivStyle(selExpressionVal);
            loadLevelRelStr();//加载关系粒度
            markShow(["levelDefault", "liAdd", "liEdit", "liDel"]);
            break;
    }
}
//初始化css样式
function initDivStyle(selExpressionVal) {
    if (selExpressionVal == "0") {
        $("#liShowCount").hide();
        $("#txtNodeName").css({ "height": "100px" });
        $(".gl_box").css({ "height": "330px" });
        $(".gl_cont").css({ "height": "290px" });
        $("#divShowMeas").hide();
        $(".gl_cont_R_main_zb").css({ "width": "305px" });
        $(".gl_cont_L li").each(function (i, element) {
            $(this).attr("disabled", false);
        });
    } else {
        $("#liShowCount").show();
        $("#txtNodeName").css({ "height": "70px" });
        $(".gl_box").css({ "height": "393px" });
        $(".gl_cont").css({ "height": "353px" });
        $("#divShowMeas").show();
        $(".gl_cont_R_main_zb").css({ "width": "460px" });
        $(".gl_cont_L li:lt(4)").each(function (i, element) {
            $(this).attr("disabled", "disabled");
        });
    }
}
//应用 参数selExpressionVal：0:指标表达式 1：维度表达式 2：维度转换
function apply(selExpressionVal) {
    selExpressionVal = tools.nodeType == "node" ? "0" : selExpressionVal;
    switch (selExpressionVal) {
        case "0":
            if (stateJudge == "0_default") {
                if (nodeObjSelected.NodeInfo.anaExpressInfoSet.length == 0) {
                    //var choice = confirm("您没有配置指标表达式\n真的要退出吗？");
                    //if (choice) {
                    //    saveSingleNodeObj();
                    //}
                    alert("必须配置指标表达式");
                    return false;
                } else {
                    var choice = confirm("您确认要保存并退出吗？\n请再次检查下配置指标表达式的所有信息\n确认无误后点击\"确定\"");
                    if (choice) {
                        saveSingleNodeObj(function () {
                            //showMsg("保存成功！");
                        });
                    }
                }
            } else if (stateJudge == "0_add" || stateJudge == "0_edit") {//指标表达式 增加界面
                if (initMeaExpressCondition(stateJudge)) {
                    loadDDLExpress();//加载表达式下拉框
                    loadMeaRelExpress(); //默认关系表达式
                    stateJudge = "0_default";//返回到default界面
                    markShow(["expressionDefault", "liAdd", "liEdit", "liDel", "liMeaRealtion"]);
                }
            }
            else if (stateJudge == "0_meaRelSet") {//关系配置
                var val = $("#txtAreaMeaRelation").val();//预览结果
                var result = {
                    meaRelStr: val//关系表达式字符串
                };
                nodeObjSelected.NodeInfo.anaMeaRelationInfoSet[0].meaRelStr = val;//保存到变量中
                if (tools.nodeType == "node") {
                    var childNodes = getChildNodeObj(NID);
                    $.each(childNodes, function (i, element) {//加到子节点
                        element.NodeInfo.anaMeaRelationInfoSet[0].meaRelStr = nodeObjSelected.NodeInfo.anaMeaRelationInfoSet[0].meaRelStr
                    });
                }
                loadReultRelStr();//加载关系
                stateJudge = "0_default";//返回到default界面
                markShow(["expressionDefault", "liAdd", "liEdit", "liDel", "liMeaRealtion"]);
            }
            break;
        case "1":
            if (state == "0_default" || state == "1_default" || state == "2_default" || state == "3_default") {
                if (confirm(getSaveTip())) {
                    saveSingleNodeObj(function () {
                        //showMsg('保存成功！');
                    });
                }
            } else if (state == "1_add" || state == "1_edit") {
                if (initDimCondition(state)) {
                    loadDimStr();//加载维度表达式
                    state = "1_default";//返回到default界面
                    markShow(["dimDefault", "liAdd", "liEdit", "liDel"]);
                }
            }
            break;
        case "2":
            if (state == "0_default" || state == "1_default" || state == "2_default" || state == "3_default") {
                if (confirm(getSaveTip())) {
                    saveSingleNodeObj(function () {
                        // showMsg('保存成功！');
                    });
                }

            } else if (state == "2_add") {
                if (addDimSwitchStr()) {
                    loadDimSwitchStr();
                    state = "2_default";
                    markShow(["dimSwitchDefault", "liAdd", "liEdit", "liDel"]);
                }
            } else if (state == "2_edit") {
                addDimSwitchStr();//没有写错就是这个方法
                loadDimSwitchStr();
                state = "2_default";
                markShow(["dimSwitchDefault", "liAdd", "liEdit", "liDel"]);
            }
            break;
        case "3":
            if (state == "0_default" || state == "1_default" || state == "2_default" || state == "3_default") {
                if (confirm(getSaveTip())) {
                    saveSingleNodeObj(function () {
                        // showMsg('保存成功！');
                    });
                }
            } else if (state == "3_add" || state == "3_edit") {
                var levelRelStrIDs = "";
                var levelRelStrNames = "";
                $("#divLevelsRelSet input[type='checkbox']:checked").each(function (i, element) {
                    levelRelStrIDs += $(this).attr("id") + ",";
                    levelRelStrNames += $(this).val() + ",";
                });
                levelRelStrIDs = levelRelStrIDs.substring(0, levelRelStrIDs.length - 1);
                levelRelStrNames = levelRelStrNames.substring(0, levelRelStrNames.length - 1);
                var obj = $.extend(true, {}, demo.$nodeData[NID]);
                obj.NodeInfo.anaLevelRelationInfoSet[0].dimID = $("#selLevelDimSet").find("option:selected").val();
                obj.NodeInfo.anaLevelRelationInfoSet[0].dimName = $("#selLevelDimSet").find("option:selected").text();
                obj.NodeInfo.anaLevelRelationInfoSet[0].levelRelStrIDs = levelRelStrIDs
                obj.NodeInfo.anaLevelRelationInfoSet[0].levelRelStrNames = levelRelStrNames
                demo.$nodeData[NID] = obj;
                nodeObjSelected = obj;

                loadLevelRelStr();//加载关系粒度
                state = "3_default";
                markShow(["levelDefault", "liAdd", "liEdit", "liDel"]);
            }
            break;
    }
}
//获取保存提示
function getSaveTip() {
    var switchTipYes = [];// "已经配置的条件："
    var switchTipNo = [];// "没有配置的条件："
    if (nodeObjSelected.NodeInfo.anaDimInfoSet.length == 0) {
        switchTipNo.push("【维度配置】");
    } else {
        switchTipYes.push("【维度配置】");
    }
    if (nodeObjSelected.NodeInfo.anaDimSwitchSet.length == 0) {
        switchTipNo.push("【维度转换】");
    } else {
        switchTipYes.push("【维度转换】");
    }
    if (nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].levelRelStrIDs == "") {
        switchTipNo.push("【关联粒度】");
    } else {
        switchTipYes.push("【关联粒度】");
    }
    var yesTip = switchTipYes.join(";") == "" ? "无" : switchTipYes.join(";");
    var noTip = switchTipNo.join(";") == "" ? "无" : switchTipNo.join(";");
    var switchTip = "该节点配置信息如下(请核实)\n已经配置的条件：" + yesTip + "\n没有配置的条件：" + noTip;
    return "您确认要保存并退出吗？\n" + switchTip;
}
//点击增加或者编辑时：参数selExpressionVal：0:指标表达式 1：维度表达式 2：维度转换
function add_edit(selExpressionVal, type) {
    selExpressionVal = tools.nodeType == "node" ? "0" : selExpressionVal;
    switch (selExpressionVal) {
        case "0":
            if (type == "edit") {
                if ($("#selMeaResult").val() != null) {
                    //取值
                    var mID = $("#selMeaResult").val();//获取选中要编辑的指标ID
                    var curObj = getMeaExpressObj(mID);//单个指标表达式对象
                    reSetValue("0", curObj);
                    markShow(["expressionSet", "liReturn"]);
                    stateJudge = "0_edit";
                } else {
                    alert("请选中要编辑的项\n若配置结果为空，请点击\"增加\"进行添加");
                    return;
                }
            } else {//增加
                markShow(["expressionSet", "liReturn"]);
                clearExpressInput();
                stateJudge = "0_add";
            }
            break;
        case "1":
            if (type == "edit") {
                if ($("#selDimResult").val() != null) {
                    state = "1_edit";
                    var curObj = getDimObj($("#selDimResult").val());
                    reSetValue("1", curObj);
                } else {
                    alert("请选中要编辑的项\n若配置结果为空，请点击\"增加\"进行添加");
                    return;
                }
            } else {//增加
                //bindDDLSelDimSet();
                $("#txtLevelVal").val("");
                state = "1_add";
                markShow(["dimSet", "liReturn"]);
            }
            break;
        case "2":
            if (type == "edit") {
                if (nodeObjSelected.NodeInfo.anaDimSwitchSet.length > 0) {
                    //取值
                    reSetValue("2", null);
                    state = "2_edit";

                } else {
                    alert("维度转换条件配置结果为空，不可编辑！");
                    return;
                }
            } else {//增加
                if (addDimSwitchCondition()) {
                    state = "2_add";
                    markShow(["dimSwitchSet", "liReturn"]);
                }
            }
            break;
        case "3":
            if (type == "edit") {
                if (nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].levelRelStrIDs != "") {
                    reSetValue("3", null);
                    state = "3_edit";
                    markShow(["levelSet", "liReturn"]);
                } else {
                    alert("关联粒度配置结果为空，不可编辑！");
                }
            } else {
                if (nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].levelRelStrIDs != "") {
                    reSetValue("3", null);
                }
                state = "3_add";
                markShow(["levelSet", "liReturn"]);
            }
            break;
    }
}
//删除
function del(selExpressionVal) {
    selExpressionVal = tools.nodeType == "node" ? "0" : selExpressionVal;
    switch (selExpressionVal) {
        case "0":
            var val = $("#selMeaResult").val();
            if (val != null) {
                //取值
                var choice = confirm("您确认要删除吗？");
                if (choice) {
                    delMeaAndMeaRelExpress(val);
                    loadDDLExpress();
                    //alert("删除成功！");
                    showMsg('删除成功！');
                }
            } else {
                alert("请选中要删除的项\n若配置结果为空，请点击\"增加\"进行添加");
                return;
            }
            break;
        case "1":
            if ($("#selDimResult").val() != null) {
                //取值
                var choice = confirm("您确认要删除吗？");
                if (choice) {
                    delDimStr($("#selDimResult").val());
                    loadDimStr();
                    //alert("删除成功！");
                    showMsg('删除成功！');
                }
            } else {
                alert("请选中要删除的项\n若配置结果为空，请点击\"增加\"进行添加");
                return;
            }
            break;
        case "2":
            if (nodeObjSelected.NodeInfo.anaDimSwitchSet.length > 0) {
                var choice = confirm("您确认要删除吗？");
                if (choice) {
                    nodeObjSelected.NodeInfo.anaDimSwitchSet = [];//清空
                    loadDimSwitchStr();
                    //alert("删除成功！");
                    showMsg('删除成功！');
                }
            } else {
                alert("维度转换条件配置结果为空，不可删除！");
                return;
            }
            break;
        case "3":
            if (nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].levelRelStrIDs != "") {
                var choice = confirm("您确认要删除吗？");
                if (choice) {
                    nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].dimID = "";
                    nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].dimName = "";
                    nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].levelRelStrIDs = "";
                    nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].levelRelStrNames = "";
                    loadLevelRelStr();
                    //alert("删除成功！");
                    showMsg('删除成功！');
                }
            } else {
                alert("关联粒度配置结果为空，不可删除！");
            }
            break;
    }
}
//返回上一级
function returnPre(selExpressionVal) {
    selExpressionVal = tools.nodeType == "node" ? "0" : selExpressionVal;
    switch (selExpressionVal) {
        case "0":
            markShow(["liAdd", "liEdit", "liDel", "liMeaRealtion", "expressionDefault"]);
            stateJudge = "0_default";
            break;
        case "1":
            markShow(["liAdd", "liEdit", "liDel", "dimDefault"]);
            state = "1_default";
            break;
        case "2":
            markShow(["liAdd", "liEdit", "liDel", "dimSwitchDefault"]);
            state = "2_default";
            break;
        case "3":
            markShow(["liAdd", "liEdit", "liDel", "levelDefault"]);
            state = "3_default";
            break;
    }
}
//指标表达式配置
function meaRelationSet() {
    if (nodeObjSelected.NodeInfo.anaExpressInfoSet.length == 0) {
        alert("您还没有配置指标表达式！\n请先配置指标表达式后进行该项操作！");
        return;
    }
    var val = nodeObjSelected.NodeInfo.anaMeaRelationInfoSet[0].meaRelStr;//获取变量中的值
    $("#txtAreaRelResult").val(val);//呈现
    markShow(["liReturn", "meaRelationSet"]);
    stateJudge = "0_meaRelSet";//关系配置
}
//判断是否存在option的 value
function isExistOption(id, value) {
    var isExist = false;
    var count = $('#' + id).find('option').length;
    for (var i = 0; i < count; i++) {
        if ($('#' + id).get(0).options[i].value == value) {
            isExist = true;
            break;
        }
    }
    return isExist;
}
//判断是否存在option文本
function isExistOptionByText(id, text) {
    var isExist = false;
    var count = $('#' + id).find('option').length;
    for (var i = 0; i < count; i++) {
        if ($('#' + id).get(0).options[i].text == text) {
            isExist = true;
            break;
        }
    }
    return isExist;
}
//增加option
function addOptionValue(id, value, text) {
    if (!isExistOption(id, value)) {
        $('#' + id).append("<option title='" + text + "' value=" + value + ">" + text + "</option>");
    }
}
//获取选中的指标表达式
function getMeaStr(meaName, signUp, txtThreUp, andOr, signDown, txtThreDown) {
    var anaExpResult;
    if (txtThreUp != "" && txtThreDown == "") {
        anaExpResult = meaName + signUp + txtThreUp;
    } else if (txtThreUp == "" && txtThreDown != "") {
        anaExpResult = meaName + signDown + txtThreDown;
    } else if (txtThreUp != "" && txtThreDown != "") {
        anaExpResult = meaName + signUp + txtThreUp + andOr + meaName + signDown + txtThreDown;
    }
    return anaExpResult;
}
//清空 指标表达式 文本框
function clearExpressInput() {
    //cancleDefaultOption("selMeas");
    //cancleDefaultOption("selAnaType");
    $("#RadioGroup2_0").attr("checked", "checked");
    //cancleDefaultOption("selSignUp");
    // cancleDefaultOption("selSignDown");
    $("#txtTopN").val("");
    $("#txtThreUp").val("");
    $("#txtThreDown").val("");
    $("#txtAreaURL").val("");
    $("#txtAreaSQL").val("需要的SQL格式：∵SQL∵sql语句◆").css({ "color": "gray" });
}

//设置下拉框的默认选中项
setDefaultOption = function (id, value) {
    cancleDefaultOption(id);//先取消所有选中的项
    $("#" + id).find("option[value = '" + value + "']").attr("selected", true)//设置选中项
}
//设置下拉框的默认选中项
setDefaultOptionByText = function (id, text) {
    cancleDefaultOption(id);//先取消所有选中的项
    $("#" + id + " option").each(function (i, element) {
        if (element.text == text) {
            setDefaultOption(id, element.value);
            return false;
        }
    });
}
//取消下拉框的默认选中项
cancleDefaultOption = function (id) {
    $("#" + id + " option").each(function () {
        if ($(this).attr("selected") == true || $(this).attr("selected") == "selected") {
            $(this).removeAttr("selected");
            return false;
        }
    });
}

//点编辑时给文本框重新赋值 参数：selExpressionVal：是哪个下拉框值；value:绑定的指标、维度id； singleObj：选定的下拉框的单个对象
function reSetValue(selExpressionVal, singleObj) {
    if (selExpressionVal == "0") {
        //txtInputSection用默认选中的指标赋值
        $("#txtInputSection").attr("value", singleObj.meaName);
        $("#txtSectionID").attr("value", singleObj.meaID);

        $("input[name='RadioGroup2'][value='" + singleObj.andOr + "']").attr('checked', true);
        // $("#txtThreUp").val(singleObj.txtThreUp);//不好使
        $("#txtThreUp").attr("value", singleObj.txtThreUp);
        //$("#txtThreDown").val(singleObj.txtThreDown);//不好使
        $("#txtThreDown").attr("value", singleObj.txtThreDown);
        $("#txtAreaURL").val(singleObj.txtAreaURL);
        $("#txtAreaSQL").val(singleObj.txtAreaSQL);
        setDefaultOption("selAnaType", singleObj.anaTypeID);
        setDefaultOption("selSignUp", singleObj.signUpID);
        setDefaultOption("selSignDown", singleObj.signDownID);
        $("#txtTopN").attr("value", singleObj.txtTopN);
        setDefaultOption("selColorDown", singleObj.BGColorDown);
        var str = $("#expressionSet").html();
        $("#expressionSet").html(str);//重新加载html
        $.selectSuggest('txtInputSection', tools.measData, itemSelectFuntion);//重新绑定事件
        $.selectSuggest('divAllMea', tools.measData, itemSelectFuntion);//重新绑定事件
    }
    else if (selExpressionVal == "1") {
        setDefaultOptionByText("selDimSet", singleObj.dimName)

        // bindDDLLevel($("#selDimSet").val(), "selLevelSet");//绑定粒度配置s
        var para = {
            type: "getLevelByName",
            factID: $("#selFact").val(),
            dimName: singleObj.dimName
        };
        tools.getAjaxData(para, function (data) {
            bindDDL(data, "selLevelSet");
            setDefaultOptionByText("selLevelSet", singleObj.levelName);
        }, function () {
            $("#txtLevelVal").attr("value", singleObj.levelVal);
            var str = $(".gl_weidu").html();
            $(".gl_weidu").html(str);
            //重新注册事件
            $("#selDimSet").bind("change", function () {
                setDefaultOption("selDimSet", $(this).val());
                bindDDLLevelDimSet();
            });
            markShow(["dimSet", "liReturn"]);
        });
    } else if (selExpressionVal == "2") {
        $.each(nodeObjSelected.NodeInfo.anaDimSwitchSet, function (i, element) {
            $("#txtPDisplayName").val(element.PDisplayName);
            $("#txtPColName").val(element.PColName);
            $("#txtCDisplayName").val(element.CDisplayName);
            $("#txtCColName").val(element.CColName);
            addOptionValue("selDimSwitch", "0", nodeObjSelected.NodeInfo.anaDimSwitchSet[0].switchTableName);
        });
        $(".gl_cont_R_main_zb .gl_zhuanhuan li:eq(4)").attr("disabled", false);
        markShow(["dimSwitchSet", "liReturn"]);
    } else if (selExpressionVal == "3") {
        setDefaultOption("selLevelDimSet", nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].dimID);
        var para = {
            type: "getLevel",
            dimID: nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].dimID
        };
        tools.getAjaxData(para, function (data) {
            createCheckBox(data, 4, "divLevelsRelSet", nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].levelRelStrIDs.split(','));
        }, null);
    }
}
//获取节点的对象
function getNodeObj(nodeID) {
    var nodeObj = demo.$nodeData[nodeID];//node对象
    return nodeObj;
}
//选中节点的父节点对象
function getParentNodeObj(curID) {
    var obj = null;
    var line = getLineObj(curID);
    if (line != undefined) {
        obj = getNodeObj(line.from);
    }
    return obj;
}
//得到连线的对象
function getLineObj(nodeID) {
    var obj;
    $.each(demo.$lineData, function (i, element) {
        if (this.to == nodeID) {
            obj = this;
            return false;
        }
    });
    return obj;
}
//获取该节点所有子节点的id
function getChildNodeIDs(curID) {
    var obj = [];
    $.each(demo.$lineData, function (i, element) {
        if (element.from == curID) {
            obj.push(element.to);
        }
    });
    return obj;
}
//获取子节点的对象数组
function getChildNodeObj(curID) {
    var childNodes = [];
    var nodes = getChildNodeIDs(curID);
    $.each(nodes, function (i, element) {
        childNodes.push(getNodeObj(element));
    });
    return childNodes;
}
//获取指标表达式对象
function getMeaExpressObj(meaID) {
    var curObj;//当前对象
    $.each(nodeObjSelected.NodeInfo.anaExpressInfoSet, function (i, element) {
        if (element.meaID == meaID) {
            curObj = element;
            return false;
        }
    });
    return curObj;
}
//获取维度表达式对象
function getDimObj(dimStrID) {
    var curObj;//当前对象
    $.each(nodeObjSelected.NodeInfo.anaDimInfoSet, function (i, element) {
        if (element.dimStrID == dimStrID) {
            curObj = element;
            return false;
        }
    });
    return curObj;
}
//保存单个节点对象 点击确定按钮时执行的操作
function saveSingleNodeObj(fun) {
    var factID = $("#selFact").val();
    var dimID = $("#selDim").val();
    var hierID = $("#selHier").val();
    var levelID = $("#selLevel").val();
    var levelName = $("#selLevel").find("option:selected").text();
    var levelDesc = $("#selLevel").find("option:selected").attr("descCol");
    var nodeName = removeHTMLTag($("#txtNodeName").val());
    var isShowCount = $("input[name='RadioGroup1']:checked").val();
    var isTrueCondition = $("input[name='meaCondition']:checked").val();

    demo.$nodeData[NID] = nodeObjSelected;//重要 必须重新赋值 否则保存还是原来的数据
    if (nodeObjSelected.NodeInfo.anaExpressInfoSet.length > 0) {
        for (var i = 0; i < nodeObjSelected.NodeInfo.anaExpressInfoSet.length; i++) {
            var obj = $.extend(true, {}, demo.$nodeData[NID]);
            if (obj != undefined) {
                obj.NodeInfo.anaExpressInfoSet[i].factID = factID;
                obj.NodeInfo.anaExpressInfoSet[i].dimID = dimID;
                obj.NodeInfo.anaExpressInfoSet[i].hierID = hierID;
                obj.NodeInfo.anaExpressInfoSet[i].levelName = levelName;
                obj.NodeInfo.anaExpressInfoSet[i].levelID = levelID;
                obj.NodeInfo.anaExpressInfoSet[i].levelDesc = levelDesc;
                obj.NodeInfo.anaExpressInfoSet[i].nodeName = nodeName;
                obj.NodeInfo.anaExpressInfoSet[i].isShowCount = isShowCount;
                obj.NodeInfo.anaExpressInfoSet[i].isTrueCondition = isTrueCondition;
                demo.$nodeData[NID] = obj;
            }
        };
    }
    else {
        var obj = $.extend(true, {}, demo.$nodeData[NID]);
        if (obj != undefined) {
            obj.NodeInfo.anaExpressInfoSet.push(
                {
                    "factID": "",
                    "dimID": "",
                    "hierID": "",
                    "levelID": "",
                    "levelName": "",
                    "levelDesc": "",
                    "nodeName": "",
                    "isShowCount": "",
                    "isTrueCondition": "",
                    "meaID": "",
                    "meaName": "",
                    "andOr": "",
                    "signUp": "",
                    "signUpID": "",
                    "txtThreUp": "",
                    "signDown": "",
                    "signDownID": "",
                    "txtThreDown": "",
                    "anaTypeID": "",
                    "txtAreaURL": "",
                    "txtTopN": "",
                    "txtAreaSQL": "",
                    "BGColorDown": "Default",
                    "orderIndex": "",
                    "anaMeaResultStr": ""
                });
            obj.NodeInfo.anaExpressInfoSet[0].factID = factID;
            obj.NodeInfo.anaExpressInfoSet[0].dimID = dimID;
            obj.NodeInfo.anaExpressInfoSet[0].hierID = hierID;
            obj.NodeInfo.anaExpressInfoSet[0].levelName = levelName;
            obj.NodeInfo.anaExpressInfoSet[0].levelID = levelID;
            obj.NodeInfo.anaExpressInfoSet[0].levelDesc = levelDesc;
            obj.NodeInfo.anaExpressInfoSet[0].nodeName = nodeName;
            obj.NodeInfo.anaExpressInfoSet[0].isShowCount = isShowCount;
            obj.NodeInfo.anaExpressInfoSet[0].isTrueCondition = isTrueCondition;
            demo.$nodeData[NID] = obj;
        }
    }



    if (tools.nodeType == "node") {
        var childNodes = getChildNodeObj(NID);
        $.each(childNodes, function (i, element) {//加到子节点
            var objExpress = $.extend(true, {}, demo.$nodeData[element.id]);
            objExpress.NodeInfo.anaExpressInfoSet = demo.$nodeData[NID].NodeInfo.anaExpressInfoSet;
            demo.$nodeData[element.id] = objExpress;
            var objMeaRelation = $.extend(true, {}, demo.$nodeData[element.id]);
            objMeaRelation.NodeInfo.anaMeaRelationInfoSet = demo.$nodeData[NID].NodeInfo.anaMeaRelationInfoSet;
            demo.$nodeData[element.id] = objMeaRelation;
        });
    }
    updateNodeName(nodeName);
    closeNodeDIV();
    if (fun) {
        setTimeout(function () { fun(); }, 100)
    }
}
//加载指标表达式下拉框 同时添加到子节点
function loadDDLExpress() {
    $("#selMeaResult").empty();//先清空selMeaResult
    $("#selMeaRelation").empty();//先清空selMeaRelation
    if (tools.nodeType == "node") {
        var childNodes = getChildNodeObj(NID);
        $.each(childNodes, function (i, element) {//加到子节点
            var objExpress = $.extend(true, {}, demo.$nodeData[element.id]);
            objExpress.NodeInfo.anaExpressInfoSet = demo.$nodeData[NID].NodeInfo.anaExpressInfoSet;
            demo.$nodeData[element.id] = objExpress;
            var objMeaRelation = $.extend(true, {}, demo.$nodeData[[element.id]]);
            objMeaRelation.NodeInfo.anaMeaRelationInfoSet = demo.$nodeData[NID].NodeInfo.anaMeaRelationInfoSet;
            demo.$nodeData[element.id] = objMeaRelation;
        });
    } else {
        var pNode = getParentNodeObj(NID);
        if (pNode != null && pNode != undefined) {
            var objExpress = $.extend(true, {}, demo.$nodeData[NID]);
            objExpress.NodeInfo.anaExpressInfoSet = pNode.NodeInfo.anaExpressInfoSet;
            demo.$nodeData[NID] = objExpress;
            var objMeaRelation = $.extend(true, {}, demo.$nodeData[NID]);
            objMeaRelation.NodeInfo.anaMeaRelationInfoSet = pNode.NodeInfo.anaMeaRelationInfoSet;
            demo.$nodeData[NID] = objMeaRelation;
        }
    }
    var meaShowStr = nodeObjSelected.NodeInfo.anaMeaRelationInfoSet[0].meaRelStr;//指标关系表达式【0】OR 【1】
    $.each(nodeObjSelected.NodeInfo.anaExpressInfoSet, function (i, element) {
        var index = "【" + i + "】";
        var meaStr = getMeaStr(element.meaName, element.signUp, element.txtThreUp, element.andOr, element.signDown, element.txtThreDown);
        var meaStrResult = index + meaStr;
        addOptionValue("selMeaResult", element.meaID, meaStrResult);
        addOptionValue("selMeaRelation", element.meaID, meaStrResult);
        element.orderIndex = i;//指标顺序
        element.anaMeaResultStr = meaStrResult;//[0] 2g语音>2
        $("input[name='RadioGroup1']").removeAttr("checked");
        $("input[name='meaCondition']").removeAttr("checked");
        $("input[name='RadioGroup1'][value='" + element.isShowCount + "']").attr('checked', "checked");
        $("input[name='meaCondition'][value='" + element.isTrueCondition + "']").attr('checked', "checked");
        $("#isShowCount").html($("#isShowCount").html());//重新初始化
        $("#lblCondition").html($("#lblCondition").html());//重新初始化
        meaShowStr = meaShowStr.replace(index, meaStr);
    });
    //在下面显示完整真正的指标关系 如：(双语音业务量<0 OR WLAN流量<4) AND 双语音业务量<555
    $("#meaShowStr").empty().append(meaShowStr);
}
//初始化判断节点配置的左边的条件 第一次配置后直接初始化第一次的结果 若没有配置就按默认重新加载
function initLeftCondition() {
    if (nodeObjSelected.NodeInfo.anaExpressInfoSet.length > 0) {
        var element = nodeObjSelected.NodeInfo.anaExpressInfoSet[0];
        $.ajax({
            url: "GooFlow.ashx",
            type: "post",
            dataType: "text",
            data: {
                type: "getAllCondition",
                factID: element.factID,
                dimID: element.dimID,
                hierID: element.hierID
            },
            beforeSend: function () {
                dss.load(true);
                var para = {
                    type: "getMeas",
                    factID: element.factID
                };
                tools.getAjaxData(para, function (data) {
                    tools.measData = data;
                    $.selectSuggest('txtInputSection', tools.measData, itemSelectFuntion);
                    $.selectSuggest('divAllMea', tools.measData, itemSelectFuntion);
                    if (data.length > 0) {
                        $("#txtInputSection").val(data[0].name);
                        $("#txtSectionID").val(data[0].id);
                    }
                });
            },
            complete: function () {
                tools.showDIV("gl_box");
                dss.load(false);
            },
            success: function (datasource) {
                var arr = datasource.split("#");
                bindDDL(eval("(" + arr[0] + ")"), "selFact", element.factID);
                //bindDDL(eval("(" + arr[0] + ")"), "selFact");
                //setDefaultOption("selFact", element.factID);

                bindDDL(eval("(" + arr[1] + ")"), "selDim", element.dimID);
                bindDDL(eval("(" + arr[1] + ")"), "selDimSet", element.dimID);
                bindDDL(eval("(" + arr[1] + ")"), "selLevelDimSet", element.dimID);
                //setDefaultOption("selDim", element.dimID);
                //setDefaultOption("selDimSet", element.dimID);
                //setDefaultOption("selLevelDimSet", element.dimID);

                bindDDL(eval("(" + arr[2] + ")"), "selHier", element.hierID);
                //setDefaultOption("selHier", element.hierID);

                bindDDL(eval("(" + arr[3] + ")"), "selLevel", element.levelID);
                bindDDL(eval("(" + arr[3] + ")"), "selLevelSet", element.levelID);
                //setDefaultOption("selLevel", element.levelID);
                //setDefaultOption("selLevelSet", element.levelID);

                //创建复选框
                var ids = nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].levelRelStrIDs.split(',');
                createCheckBox(eval("(" + arr[3] + ")"), 4, "divLevelsRelSet", ids);

                var factStr = $("#selFact").html();
                var dimStr = $("#selDim").html();
                var dimSetStr = $("#selDimSet").html();
                var hierStr = $("#selHier").html();
                var levelStr = $("#selLevel").html();
                var levelSetStr = $("#selLevelSet").html();

                $("#selFact").html(factStr);
                $("#selDim").html(dimStr);
                $("#selDimSet").html(dimSetStr);

                $("#selHier").html(hierStr);

                $("#selLevel").html(levelStr);
                $("#selLevelSet").html(levelSetStr);
            }
            , error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('错误信息：' + textStatus + ' ,错误码：' + XMLHttpRequest.status);
            }
        });
    }
}
//加载默认关系表达式(删除某一指标后，指标之间的关系表达式需要重新设置，默认是and关系)
function loadMeaRelExpress() {
    var meaRelStr = "";
    $.each(nodeObjSelected.NodeInfo.anaExpressInfoSet, function (i, element) {
        meaRelStr += "【" + i + "】" + " AND ";
    });
    if (meaRelStr.length > 3) {
        meaRelStr = meaRelStr.substring(0, meaRelStr.length - 4);
    }
    nodeObjSelected.NodeInfo.anaMeaRelationInfoSet[0].meaRelStr = meaRelStr;
    if (tools.nodeType == "node") {
        var childNodes = getChildNodeObj(NID);
        $.each(childNodes, function (i, element) {//添加到子节点 关系表达式
            element.NodeInfo.anaMeaRelationInfoSet[0].meaRelStr = nodeObjSelected.NodeInfo.anaMeaRelationInfoSet[0].meaRelStr
        });
    }
    loadReultRelStr();
}
//关系表达式真正结果
function loadReultRelStr() {
    $("#txtAreaRelResult").val(nodeObjSelected.NodeInfo.anaMeaRelationInfoSet[0].meaRelStr);//呈现
    $("#txtAreaMeaRelation").val(nodeObjSelected.NodeInfo.anaMeaRelationInfoSet[0].meaRelStr);//重新赋值 默认是and条件 预览结果
}
//获取关系表达式的索引
function getIndexselMeaRelation() {
    var str = $("#selMeaRelation").find("option:selected").text();
    str = str.substring(0, 3);
    return str;
}
//获取关联粒度的表达式
function loadLevelRelStr() {
    if (nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].levelRelStrIDs != "") {
        $("#lblDimName").text(nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].dimName);
        $("#lblLevelRelStr").text(nodeObjSelected.NodeInfo.anaLevelRelationInfoSet[0].levelRelStrNames);
    } else {
        $("#lblDimName").text("无");
        $("#lblLevelRelStr").text("无");
    }
}
//删除指标表达式和与其有关的关系表达式
function delMeaAndMeaRelExpress(meaID) {
    var arr = nodeObjSelected.NodeInfo.anaExpressInfoSet;
    nodeObjSelected.NodeInfo.anaExpressInfoSet = removeMeaStr(arr, meaID);
    loadMeaRelExpress();
}
//删除数组中指定的指标表达式
function removeMeaStr(arr, meaID) {
    return $.grep(arr, function (cur, i) {
        return (cur.meaID != meaID);
    });
}
//初始化指标表达式所有条件
function initMeaExpressCondition(state) {
    var factID = $("#selFact").val();
    var dimID = $("#selDim").val();
    var hierID = $("#selHier").val();
    var levelID = $("#selLevel").val();
    var levelName = $("#selLevel").find("option:selected").text();//小区 名字
    var levelDesc = $("#selLevel").find("option:selected").attr("descCol");//cell_desc字段
    var nodeName = $("#txtNodeName").val();
    var isShowCount = $("input[name='RadioGroup1']:checked").val();

    var anaTypeID = $("#selAnaType").val();//分析类型：指标预警 环比预警 同比预警 3种
    var meaID = $("#txtSectionID").val();
    var meaName = $.trim($("#txtInputSection").val());
    var andOr = $("input[name='RadioGroup2']:checked").val();// and or
    var signUp = $("#selSignUp").find("option:selected").attr("sign");
    var signUpID = $("#selSignUp").val();//入数据库的使用 比如：大于号">"代表id为1 小于号"<"代表id为3
    var signDown = $("#selSignDown").find("option:selected").attr("sign");
    var signDownID = $("#selSignDown").val();//入数据库的使用 比如：大于号">"代表id为1 小于号"<"代表id为3
    var txtThreUp = $.trim($("#txtThreUp").val());
    var txtThreDown = $.trim($("#txtThreDown").val());
    var txtAreaURL = $.trim($("#txtAreaURL").val());
    var txtTopN = $("#txtTopN").val();
    //-----------------下面SQL配置-----------------
    var txtAreaSQL = $.trim($("#txtAreaSQL").val()) == "需要的SQL格式：∵SQL∵sql语句◆" ? "" : $.trim($("#txtAreaSQL").val());
    var BGColorDown = $("#selColorDown").val();//下边背景颜色
    var isTrueCondition = $("input[name='meaCondition']:checked").val();
    var result = {
        factID: factID,
        dimID: dimID,
        hierID: hierID,
        levelID: levelID,
        levelName: levelName,
        levelDesc: levelDesc,//转换维度使用
        isShowCount: isShowCount,//是否显示数目
        isTrueCondition: isTrueCondition,//true和false的条件
        meaID: meaID,
        meaName: meaName,
        andOr: andOr,
        signUp: signUp,
        signUpID: signUpID,
        txtThreUp: txtThreUp,
        signDown: signDown,
        signDownID: signDownID,
        txtThreDown: txtThreDown,
        anaTypeID: anaTypeID,
        txtAreaURL: txtAreaURL,
        txtTopN: txtTopN,
        txtAreaSQL: txtAreaSQL,
        BGColorDown: BGColorDown,
        orderIndex: "",
        anaMeaResultStr: ""//该指标的最终表达式：如：2g语音>3;
    };
    var a = tools.isNum(txtThreDown);
    var b = tools.isNum(txtThreUp);
    var c = tools.isIntNum(txtTopN);
    if (!a) {
        alert("阈值条件必须是数字！");
        return false;
    } if (!b) {
        alert("阈值条件必须是数字！");
        return false;
    } if (txtThreUp + txtThreDown == "") {
        alert("阈值条件不能同时为空！");
        return false;
    }
    if (!c) {
        alert("TOPN的值必须是整数");
        return false;
    }
    if ($.trim($("#txtAreaSQL").val()) != '' && ($.trim($("#txtAreaSQL").val()).indexOf('∵') < 0 || $.trim($("#txtAreaSQL").val()).indexOf('◆') < 0)) {
        alert("SQL配置的格式有误\n正确格式：∵SQL∵sql语句◆");
        return false;
    }
    if (!isExistMea(tools.measData, meaName)) {
        alert("你输入的指标有误，请核实！");
        return false;
    }
    if (stateJudge == "0_add") {
        var isExistMeaID = isExistOption("selMeaResult", meaID);
        //var isExistMeaID = isExistOptionByText("selMeaResult", meaName);
        if (!isExistMeaID) {
            var obj = $.extend(true, {}, demo.$nodeData[NID]);
            if (obj != undefined) {
                obj.NodeInfo.anaExpressInfoSet.push(result);
                demo.$nodeData[NID] = obj;
                nodeObjSelected = obj;
            }
            return true;
        }
        else {
            alert("已存在该指标！");
            return false;
        }
    } else if (stateJudge == "0_edit") {
        var oldMeaID = $("#selMeaResult").val();
        if (oldMeaID == meaID) {//指标没有改变时
            var obj = getMeaExpressObj(meaID);
            obj.andOr = andOr;
            obj.signUp = signUp;
            obj.signUpID = signUpID;
            obj.txtThreUp = txtThreUp;
            obj.signDown = signDown;
            obj.signDownID = signDownID;
            obj.txtThreDown = txtThreDown;
            obj.anaTypeID = anaTypeID;
            obj.txtAreaURL = txtAreaURL;
            obj.txtTopN = txtTopN;
            obj.txtAreaSQL = txtAreaSQL;
            obj.BGColorDown = BGColorDown;
        } else {//指标改变时
            //删除旧的指标
            var arr = nodeObjSelected.NodeInfo.anaExpressInfoSet;
            nodeObjSelected.NodeInfo.anaExpressInfoSet = removeMeaStr(arr, oldMeaID);
            //添加新的指标
            var isExistMeaID = isExistOption("selMeaResult", meaID);
            if (!isExistMeaID) {
                nodeObjSelected.NodeInfo.anaExpressInfoSet.push(result);
                return true;
            }
            else {
                alert("已存在该指标！");
                return false;
            }
        }
        return true;
    }
}

//加载默认维度表达式
function loadDimStr() {
    $("#selDimResult").empty();
    $.each(nodeObjSelected.NodeInfo.anaDimInfoSet, function (i, element) {
        var index = "【" + i + "】";
        var meaStr = "[" + element.dimName + "]." + "[" + element.levelName + "]." + "[" + element.levelVal + "]";
        var meaStrResult = index + meaStr;
        addOptionValue("selDimResult", element.dimStrID, meaStrResult);
    });
}
//删除维度表达式
function delDimStr(dimStrID) {
    var arr = nodeObjSelected.NodeInfo.anaDimInfoSet;
    nodeObjSelected.NodeInfo.anaDimInfoSet = removeDimStr(arr, dimStrID);
    demo.$nodeData[NID] = nodeObjSelected;
}

//删除 数组中 指定的维度表达式
function removeDimStr(arr, dimStrID) {
    return $.grep(arr, function (element, i) {
        return (element.dimStrID != dimStrID)
    });
}
//初始化维度表达式的所有条件
function initDimCondition(state) {
    var dimName = $("#selDimSet option:selected").text();
    var levelName = $("#selLevelSet option:selected").text();
    var txtLevelVal = $.trim($("#txtLevelVal").val());
    //维度名称+粒度名称作为维度表达式的唯一id
    var dimStrID = dimName + "$" + levelName;
    var result = {
        dimStrID: dimStrID,//自定义维度串表达式id
        dimName: dimName,
        levelName: levelName,
        levelVal: txtLevelVal
    };
    if (txtLevelVal == '') {
        alert("粒度值不能为空！");
        return false;
    }
    if (state == "1_add") {
        var isExistDimID = isExistOption("selDimResult", dimStrID);
        if (!isExistDimID) {
            var objDim = $.extend(true, {}, demo.$nodeData[NID]);
            if (objDim != undefined) {
                objDim.NodeInfo.anaDimInfoSet.push(result);
                demo.$nodeData[NID] = objDim;
                nodeObjSelected = objDim;
            }
            return true;
        }
        else {
            alert("已存在相同的事实+维度+粒度！");
            return false;
        }
    } else if (state == "1_edit") {

        //重新赋值
        var obj = getDimObj($("#selDimResult").val());
        $.each(demo.$nodeData[NID].NodeInfo.anaDimInfoSet, function (i, element) {
            if (element.dimStrID == obj.dimStrID) {
                element.dimName = dimName;
                element.levelName = levelName;
                element.levelVal = txtLevelVal;
            }
        });
        nodeObjSelected = demo.$nodeData[NID];
        return true;
    }
}
//初始化 转换维度 的所有条件
function initDimSwitchCondition(state) {
    if (state == "2_add") {
        p = {
            type: "getSwitchTable",
            pLevelDesc: ppNode.NodeInfo.LevelDesc,
            levelDesc: nodeObjSelected.NodeInfo.levelDesc
        };
        tools.getAjaxData(p, function (data) {
            bindDDL(data, "selDimSwitch");
        }, addDimSwitchStr);

    } else if (state == "2_edit") {
        $(".gl_zhuanhuan li:gt(3)").each(function () {
            $(this).attr("disabled", false);
        });
        $.each(nodeObjSelected.NodeInfo.anaDimSwitchSet, function (i, element) {
            element.switchTableName = $("#selDimSwitch").find("option:selected").text();
        });
    }
}
//增加维度转换前的判断条件
function addDimSwitchCondition() {
    if (nodeObjSelected.NodeInfo.anaExpressInfoSet.length == 0) {
        alert("请配置【当前节点】的指标表达式");
        return false;
    }
    var pNode = getParentNodeObj(NID);
    if (pNode != undefined) {
        var ppNode = getParentNodeObj(pNode.id);//父节点的父节点
        if (ppNode != undefined) {
            if (ppNode.NodeInfo.anaExpressInfoSet.length == 0) {
                alert("请配置【父节点的父节点】的指标表达式");
                return false;
            }
            $("#txtPDisplayName").val(ppNode.NodeInfo.anaExpressInfoSet[0].levelName);
            $("#txtPColName").val(ppNode.NodeInfo.anaExpressInfoSet[0].levelDesc);
            $("#txtCDisplayName").val(nodeObjSelected.NodeInfo.anaExpressInfoSet[0].levelName);
            $("#txtCColName").val(nodeObjSelected.NodeInfo.anaExpressInfoSet[0].levelDesc);
            p = {
                type: "getSwitchTable",
                pLevelDesc: $("#txtPColName").val(),
                levelDesc: $("#txtCColName").val()
            };
            if (nodeObjSelected.NodeInfo.anaDimSwitchSet.length > 0) {
                addOptionValue("selDimSwitch", "0", nodeObjSelected.NodeInfo.anaDimSwitchSet[0].switchTableName);
            } else {
                tools.getAjaxData(p, function (data) {
                    bindDDL(data, "selDimSwitch");
                }, null);
            }

            $(".gl_zhuanhuan li:lt(4)").each(function () {
                $(this).attr("disabled", "disabled");
            });
            return true;
        } else {
            alert("不能在当前节点配置维度转换条件!");
            return false;
        }
    } else {
        alert("不能在当前节点配置维度转换条件!");
        return false;
    }
}
//增加维度转换信息
function addDimSwitchStr() {
    var result = {
        PDisplayName: $("#txtPDisplayName").val(),
        PColName: $("#txtPColName").val(),
        CDisplayName: $("#txtCDisplayName").val(),
        CColName: $("#txtCColName").val(),
        switchTableName: $("#selDimSwitch").find("option:selected").text()
    };
    if ($("#selDimSwitch").val() != "-1") {
        //添加
        var obj = $.extend(true, {}, demo.$nodeData[NID]);
        obj.NodeInfo.anaDimSwitchSet = [];//清空
        obj.NodeInfo.anaDimSwitchSet.push(result);
        demo.$nodeData[NID] = obj;
        nodeObjSelected = obj;
        return true;
    } else {
        alert("不存在转换关系表，不能保存！");
        return false;
    }
}
////加载维度转换信息
function loadDimSwitchStr() {
    if (nodeObjSelected.NodeInfo.anaDimSwitchSet.length > 0) {
        $.each(nodeObjSelected.NodeInfo.anaDimSwitchSet, function (i, element) {
            $("#txtPDisplayNameResult").val(element.PDisplayName);
            $("#txtPColNameResult").val(element.PColName);
            $("#txtCDisplayNameResult").val(element.CDisplayName);
            $("#txtCColNameResult").val(element.CColName);
            addOptionValue("selDimSwitchResult", "0", nodeObjSelected.NodeInfo.anaDimSwitchSet[0].switchTableName);
        });
    } else {
        $("#txtPDisplayNameResult").val("");
        $("#txtPColNameResult").val("");
        $("#txtCDisplayNameResult").val("");
        $("#txtCColNameResult").val("");
        $("#selDimSwitchResult").html("");
    }
}
//保存报表中所有节点和连线的数据 new
function saveAllNodeAndLine() {
    if (demo.$nodeCount == 0) {
        alert("没有结点,不能保存!");
        return;
    }
    var selVersionVal = $("#selVersion").val();
    var selVersionText = $("#selVersion option:selected").text();
    var txtVersion = $.trim($("#txtVersion").val());
    if (selVersionVal == "-1") {//新建
        if (txtVersion == "" || txtVersion == "请输入新建的版本号") {
            alert("请输入新建的版本号\n建议用报表名字+版本号，如：用户分析1.0");
            return;
        }
        if (isExistOptionByText("selVersion", txtVersion)) {
            alert("该报表下，已存在相同的版本号，请重新输入");
            return;
        }
        if ($("#selVersion option").length > 5) {
            alert("该报表下，已超过最大版本数目(最大是5个)\n请先删除其他版本后进行操作");
            return;
        }
        saveVersion(txtVersion);

    } else {//编辑
        $("#lblReportName").text(tools.reportName);
        $("#lblVName").text(selVersionText);
        $("#trNewVersion").hide();
        $("input[name='versionOper'][value='1']").prop('checked', true);
        $("#trVersionName").show();
        $("#txtNewVersion").val('');
        tools.showDIV("saveInfo");
    }
}
//保存版本号
function saveVersion(version_desc) {
    $("#saveInfo").fadeOut();//隐藏保存框
    var nd = demo.$nodeData;
    var ld = demo.$lineData;
    GFNode.Nodes = [];//清空
    GFNode.Lines = [];//清空
    //遍历节点
    for (n in nd) {
        GFNode.Nodes.push(nd[n]);
    }
    //遍历连线
    for (l in ld) {
        var m = ld[l].M == undefined ? "" : ld[l].M;
        pLine = {
            id: ld[l].id,
            from: ld[l].from,
            to: ld[l].to,
            name: ld[l].name,
            type: ld[l].type,
            M: m,
            reportID: tools.reportID,
            version_desc: version_desc
        }
        GFNode.Lines.push(pLine);
    }
    var strGFNode = JSONstringify(GFNode);
    var p = {
        type: "saveAll",
        reportID: tools.reportID,
        version_desc: version_desc,
        strGFNode: strGFNode
        // ,oper: oper//判断是 新增 new  操作还是 修改 update 操作
    };
    tools.getAjaxData(p, function (data) {
        if (data.flag.toLowerCase() == "true") {
            dss.load(false);
            $("#mask").fadeOut("slow");
            setTimeout(function () { showMsg("保存成功"); }, 500);
        }
    }, function () {
        getVersionData(version_desc);
    });
}
//删除相应版本号
function delVersion(version_desc) {
    var p = {
        type: "delVersion",
        reportID: tools.reportID,
        version_desc: version_desc
    };
    tools.getAjaxData(p, function (data) {
        if (data.flag.toLowerCase() == "true") {
            //alert("删除成功");
            showMsg("删除成功");
        }
    }, getVersionData);
}
//设置默认版本号
function setDefaultVersion(version_desc) {
    var p = {
        type: "setDefalutVersion",
        reportID: tools.reportID,
        version_desc: version_desc
    };
    tools.getAjaxData(p, function (data) {
        if (data.flag.toLowerCase() == "true") {
            //alert("设置成功");
            showMsg("设置成功");
        }
    }, function () {
        getVersionData(version_desc);
    });
}
//是否存在该指标 防止用户误输入导致指标名称错误
function isExistMea(data, text) {
    var flag = false;
    $.each(data, function (i, element) {
        if (this.name == text) {
            flag = true;
            return;
        }
    });
    return flag;
}
////动态生成复选框 data是所有数据  num是每隔几个换行 在哪个divid中创建复选框 ids是需要选中元素的数组 可为空
function createCheckBox(data, num, divID, ids) {
    var str = "";
    if (ids == undefined || ids == null) {
        ids = [];
    }
    $.each(data, function (i, element) {
        if ($.inArray(element.id, ids) > -1) {
            str += '<input type="checkbox" checked="checked" style="margin:0px; padding:10px;" value="' + element.name + '"  id="' + element.id + '" />' + element.name + '&nbsp;&nbsp;';
        }
        else {
            str += '<input type="checkbox" style="margin:0px; padding:10px;" value="' + element.name + '"  id="' + element.id + '" />' + element.name + '&nbsp;&nbsp;';
        }
        if ((i + 1) % num == 0) {
            str += "<br/>";
        }
    });
    $("#" + divID).empty();
    if (str == "") {
        str = "提示：该维度下没有配置粒度。";
    }
    $("#" + divID).append(str);
}
function toFull() {
    //if (window.name == "fullscreen") return;
    //var a = window.open("", "fullscreen", "fullscreen=yes")
    //a.location = window.location.href
    //window.opener = null
    //window.close()
    //alert($(window).height()); //浏览器当前窗口可视区域高度
    //alert($(window).width()); //浏览器当前窗口可视区域高度
    // alert('全屏功能开发中……');
    showMsg("全屏功能开发中…");
}
// JSON转换为字符串
function JSONstringify(obj) {
    if (typeof JSON == 'object') {
        return JSON.stringify(obj);
    }
    else {
        var THIS = this;
        switch (typeof (obj)) {
            case 'string':
                return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';
            case 'array':
                return '[' + obj.map(THIS.JSONstringify).join(',') + ']';
            case 'object':
                if (obj instanceof Array) {
                    var strArr = [];
                    var len = obj.length;
                    for (var i = 0; i < len; i++) {
                        strArr.push(THIS.JSONstringify(obj[i]));
                    }
                    return '[' + strArr.join(',') + ']';
                } else if (obj == null) {
                    return 'null';
                } else {
                    var string = [];
                    for (var property in obj) string.push(THIS.JSONstringify(property) + ':' + THIS.JSONstringify(obj[property]));
                    return '{' + string.join(',') + '}';
                }
            case 'number':
                return obj;
            default:
                return obj;
        }
    }
}
function showMsg(msg, seconds) {
    var strHtml = '<div class="showMsg" style="display: none;"></div>';
    if ($(".showMsg").length <= 0) {
        $(document.body).append(strHtml);
    }
    if (seconds == undefined || seconds == '') {
        seconds = 2;
    }
    var msgBoxObj = $(".showMsg");
    msgBoxObj.css({ "color": "white", "width": "auto", "height": "26px", "line-height": "26px", "margin": " 0 auto", "padding-left": "5px", "padding-right": "5px", "backgroundColor": "green", "text-align": "center", 'position': 'absolute', 'border-radius': '3px' });
    if (msg.indexOf("失败") > -1) {
        msgBoxObj.css({ "backgroundColor": "red" });
    }
    msgBoxObj.html(msg + "【还剩(" + seconds + ")秒】");
    var top = ($(window).height() - msgBoxObj.height()) / 2;
    var left = ($(window).width() - msgBoxObj.width()) / 2;
    var scrollTop = $(document).scrollTop();
    var scrollLeft = $(document).scrollLeft();
    // msgBoxObj.css({ "z-index": "3200", 'top': top + scrollTop, left: left + scrollLeft }).fadeIn(1000);
    msgBoxObj.css({ "z-index": "3200", 'top': '3px', left: '700px' }).fadeIn(500);
    setTimeout(function () {
        seconds--;
        var a = msg + "【还剩(" + seconds + ")秒】";
        if (seconds > 0) {
            msgBoxObj.fadeIn().html(a);
            showMsg(msg, seconds);
        } else {
            msgBoxObj.fadeOut(1000);
        }
    }, 1000);
}
//去除html标签
function removeHTMLTag(str) {
    str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
    str = str.replace(/[\r\n]/g, "")//去掉回车换行
    str = str.replace(/[ | ]*\n/g, ''); //去除行尾空白
    //str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
    str = str.replace(/ /ig, '');//去掉 
    return $.trim(str);
}