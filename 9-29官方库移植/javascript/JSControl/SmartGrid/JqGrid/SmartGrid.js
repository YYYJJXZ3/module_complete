/***************************************************************************
SmartGrid
NOTE: Created by JQGrid. 
Copyright 2013, dingjian
Features： 
1.
Update Note：0702-773

Needs：jquery-1.9.1.min.js
grid.locale-en.js
jquery.jqGrid.min.js
jquery-ui.css
ui.jqgrid.css
****************************************************************************/
(function ($) {
    var tools = {
        getAppRootPath: function () {
            var strFullPath = window.document.location.href;
            var strPath = window.document.location.pathname;
            var pos = strFullPath.indexOf(strPath);
            var prePath = strFullPath.substring(0, pos);
            var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
            return prePath + postPath + "/";
        },
        //函数功能：json 排序   filed:(string)排序字段，   reverse: (bool) 是否倒置(是，为倒序)  primer (parse)转换类型  
        sortJsonByFiled: function (filed, reverse, primer) {
            reverse = (reverse ? -1 : 1);
            return function (a, b) {
                a = a[filed];
                b = b[filed];
                var max = 2147483647;
                if (primer == "int") {
                    a = (a == "" ? max : (isNaN(parseInt(a)) ? max : parseInt(a)));
                    b = (b == "" ? max : (isNaN(parseInt(b)) ? max : parseInt(b)));
                } else if (primer == "float") {
                    a = (a == "" ? max : (isNaN(Number(a)) ? max : Number(a)));
                    b = (b == "" ? max : (isNaN(Number(b)) ? max : Number(b)));
                }

                if (a < b) {
                    return (reverse * -1);
                } else if (a > b) {
                    return (reverse * 1);
                } else {
                    return 1;
                }
            };
        },
        // 数组包含  解决IE7、8下面数组Indexof方法出错问题
        isInArray: function (item, objArr) {
            if (tools.indexInArray(item, objArr) > -1) {
                return true;
            }
            return false;
        },
        indexInArray: function (item, objArr) {
            for (var i = 0; i < objArr.length; i++) {
                if (objArr[i] === item) {
                    return i;
                }
            }
            return -1;
        },
        //当前窗口的有效可视宽度和高度
        getDocumentWH: function () {
            var winW, winH; //当前窗口的有效可视宽度和高度
            if (window.innerHeight) { //所有非IE浏览器
                winW = window.innerWidth;
                winH = $(window).height();
            } else if (document.documentElement && document.documentElement.clientHeight) { //IE 6 Strict Mode
                winW = document.documentElement.clientWidth;
                winH = document.documentElement.clientHeight;
            } else if (document.body) { //其他浏览器
                winW = document.body.clientWidth;
                winH = document.body.clientHeight;
            }
            return {
                WinW: winW, //真正反馈的宽度
                WinH: winH //真正反馈的高度
            };
        },
        strFormatFromRow: function (str, rowData) {
            var getColid = /\d+/;
            var reStr = /\{\d+\}/gi;
            var arrMactches = str.match(reStr);
            if ($.fmatter.isObject(arrMactches)) {
                for (var i = 0; i < arrMactches.length; i++) {
                    var colid = getColid.exec(arrMactches[i]);
                    str = str.replace("{" + colid + "}", rowData["col" + colid]);
                }
            }
            return str;
        },
        strFormatFromRow2: function (str, rowData) {
            var getColid = /\d+/;
            var reStr = /\[\d+\]/gi;
            var arrMactches = str.match(reStr);
            if ($.fmatter.isObject(arrMactches)) {
                for (var i = 0; i < arrMactches.length; i++) {
                    var colid = getColid.exec(arrMactches[i]);
                    str = str.replace("[" + colid + "]", rowData["col" + colid]);
                }
            }
            return str;
        },
        jsonToString: function (obj) {
            var THIS = this;
            switch (typeof (obj)) {
                case 'string':
                    return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';
                case 'array':
                    return '[' + obj.map(jsonToString).join(',') + ']';
                case 'object':
                    if (obj instanceof Array) {
                        var strArr = [];
                        var len = obj.length;
                        for (var i = 0; i < len; i++) {
                            strArr.push(tools.jsonToString(obj[i]));
                        }
                        return '[' + strArr.join(',') + ']';
                    } else if (obj == null) {
                        return 'null';

                    } else {
                        var string = [];
                        for (var property in obj) string.push(tools.jsonToString(property) + ':' + tools.jsonToString(obj[property]));
                        return '{' + string.join(',') + '}';
                    }
                case 'number':
                    return obj;
                default:
                    return obj;
            }
        },
        load: function (state) {
            if (typeof (dss) != "undefined" && dss.load != undefined && typeof dss.load == 'function') {
                dss.load(state);
            }
        },
        request: function (key) {
            if (typeof (dss) != "undefined" && dss.request != undefined && typeof dss.request == 'function') {
                return dss.request(key);
            }
            return "";
        },
        isScript: function () {
            var flag = false;
            $("script").each(function (i, item) {
                if (item.src.toLowerCase().indexOf("common/toolbar.js") > -1) {
                    flag = true;
                    return false;
                }
            });
            return flag;
        },
        setGridWidth: function (id, grid) {
            var width = $("#" + id).width() - 2;
            grid.setGridWidth(width, false);
            $("#gbox_" + id + "db").css("z-index", "0");
            $("#gview_" + id + "db")
                .css("width", "100%")
            .find("div").each(function (i, item) {
                if ($(this).hasClass("ui-jqgrid-hdiv") || $(this).hasClass("ui-jqgrid-bdiv")) {
                    $(this).css("width", "100%");
                }
            });
            $("#" + id + "db_pager").css("width", "100%");
        },
        setCalculationWidth: function (colArr, opts) {
            var width = 0;
            var hidNum = 0;
            var result = [];
            var defaultWidth = opts.width;
            if (opts.width > 0) {
                $.each(colArr, function (i, item) {
                    if (!$.fmatter.isBoolean(item.hidden) || item.hidden == false) {
                        if (item.width == 0) {
                            hidNum++;
                        }
                        else {
                            width += item.width;
                        }
                    }
                });
                var avg = parseInt((defaultWidth - width) / hidNum);
                if (avg >= 60) {
                    var rem = (defaultWidth - width) - avg * (hidNum - 1);
                    opts.scroll.showx = false;
                    $.each(colArr, function (i, item) {
                        if (!$.fmatter.isBoolean(item.hidden) || item.hidden == false) {
                            if (item.width == 0) {
                                if (hidNum == 1) {
                                    item.width = rem;
                                }
                                else {
                                    item.width = avg;
                                }
                                hidNum--;
                            }
                        }
                        result.push(item);
                    });
                }
                else {
                    opts.scroll.showx = true;
                    avg = 60;
                    $.each(colArr, function (i, item) {
                        if (!$.fmatter.isBoolean(item.hidden) || item.hidden == false) {
                            if (item.width == 0) {
                                item.width = avg;
                            }
                        }
                        result.push(item);
                    });
                }
                return result;
            }
            else {
                $.each(colArr, function (i, item) {
                    delete item.width;
                    result.push(item);
                });
                return result;
            }
        },
        setAttribute: function (cols, colNames) {
            var result = [];
            $.each(colNames, function (i, item) {
                if (typeof item == 'string') {
                    var _t;
                    $.each(cols, function (j, k) {
                        if (k.colindex == i) {
                            _t = k;
                            return false;
                        }
                    });
                    if (_t) {
                        if (!$.fmatter.isNumber(_t.width)) {
                            _t["width"] = 0;
                        }
                    }
                    else {
                        _t = {
                            colindex: i,
                            width: 0
                        };
                    }

                    if (item.indexOf("-加密") > 0) {
                        _t["hidden"] = true;
                    }

                    _t["name"] = item;
                    result.push(_t);
                }
            });
            return result;
        },
        isEmptyObject: function (e) {
            var t;
            for (t in e)
                return !1;
            return !0
        },
        isNullOrEmpty: function (str) {
            return str == null || str.length == 0;
        }
    }
    var methods = {
        smartgridInit: function (opts) {
            opts = smartgridHelp.optionsInits(opts, this[0].id);
            var downDataSource = {
                sql: null,
                conn: null,
                source: null,
                analyzer: null,
                titleName: ""
            };
            if (opts.islocaldata || opts.dataFrom.Local) {
                if ((!$.fmatter.isObject(opts.localdata.colnames)) || opts.localdata.colnames.length == 0) {
                    alert("错误：您的表格设置是给表格绑定本地数据源，但是您没有给本地数据赋值，或者格式不对！请检查数据源。");
                    return false;
                }

                if (!opts.localdata.records) {
                    opts.localdata["records"] = opts.localdata.rows.length;
                }
                opts.dataFrom.Local = true;
                opts.dataFrom.TSql = false;
                opts.dataFrom.Analyzer = false;
                downDataSource.source = $.extend(true, {}, opts.localdata);
                $("#" + this[0].id + "db").data("count", opts.localdata.rows.length);
            } else if ($.fmatter.isObject(opts.analyzer) && !tools.isEmptyObject(opts.analyzer)) {
                if (opts.analyzerpath != null && opts.analyzerpath.length > 0) {
                    opts.ajax.path = opts.analyzerpath;
                }
                else if (opts.ajax.path == "") { // 生成后台数据访问的url；
                    opts.ajax.path = tools.getAppRootPath();
                    opts.ajax.path += "javascript/jscontrol/smartGrid/handler/jqgridanalyzer.ashx";
                }
                downDataSource.analyzer = opts.analyzer;
                opts.dataFrom.Local = false;
                opts.dataFrom.TSql = false;
                opts.dataFrom.Analyzer = true;
                opts.ajax.sqlstr = opts.analyzer;

            } else if (opts.ajax.sqlstr != "") {
                if (opts.ajax.path == "") { // 生成后台数据访问的url；
                    opts.ajax.path = tools.getAppRootPath();
                    opts.ajax.path += "javascript/jscontrol/smartGrid/handler/jqgriddata.ashx";
                }
                downDataSource.sql = opts.ajax.sqlstr;
                downDataSource.conn = opts.ajax.connstr;
                opts.dataFrom.Local = false;
                opts.dataFrom.TSql = true;
                opts.dataFrom.Analyzer = false;
            } else {
                alert("错误：数据绑定来源不明确！ 无法初始化表格。");
                return false;
            }

            if (this[0].tagName.toUpperCase() != 'DIV') {
                alert("Element（‘#" + this[0].id + "’）is not a Div！");
                return false;
            }
            this.html("");
            downDataSource.titleName = opts.titleName;
            $(this).data("downDataSource", downDataSource);
            $(this).data("downDataType", "down");
            opts.finalSet.originalid = this[0].id;
            opts.finalSet.gridid = opts.finalSet.originalid + "db";
            var appendhtml = "<table id='" + opts.finalSet.gridid + "' class='scroll' cellpadding='0' cellspacing='0'></table>";
            this.html(appendhtml);
            var grid = $("#" + opts.finalSet.gridid);
            if (opts.ispaging) {
                opts.pagingId = opts.finalSet.gridid + "_pager";
                appendhtml = "<div id='" + opts.pagingId + "' class='scroll' style='text-align: center;'></div>";
                if ($("#" + opts.pagingId).length == 0) this.append(appendhtml);
            }
            if (opts.width == 0 || $(this[0]).width() < opts.width) {
                opts.width = $(this[0]).width();
            }

            InitGridData(grid, opts);
            return grid;
        },
        getDatasource: function () {
            return $("#" + this[0].id + "db").data("griddatasource");
        },
        smartgridReset: function (grid, opts) {
            var gridid = opts.finalSet.gridid;
            var originalid = opts.finalSet.originalid;
            opts.finalSet = {
                originalid: "",
                gridid: "",
                bindData: null,
                colHasSet: false,
                colHasSetArr: [],
                colNumbers: 0,
                colModel: [],
                colNotSort: [],
                colSorttype: [],
                colFrozen: [],
                colRowspan: [],
                colDatafromUser: [],
                colName: [],
                colSetWidth: { coltotal: 0, widthSum: 0 }, //
                colSetColor: [],
                colAddDom: [],
                colAddUrl: [],
                colAddClick: [],
                colAddRightClick: [],
                bindDBClick: [],
                bindRightclick: []
            };
            grid.GridDestroy(gridid);
            $("#" + originalid).smartgrid(opts);
            return false;
        }
    };
    var smartgridHelp = {
        optionsInits: function (options, id) {
            options = $.extend(true, {
                captionName: "",
                showrownum: false,
                formatFlowValue: "1",
                rownumwidth: 45,
                width: 0,
                autowidth: true,
                height: -1,
                islocaldata: false,
                localdata: [],
                ispaging: true,
                pagingId: "",
                isresize: true,
                analyzer: {},
                analyzerpath: "",
                errorfun: null,
                analyzercontextmenu: {
                    show: false,
                    showRelatedAnalysis: false,
                    showDrill: false,
                    showDimStatistics: false,
                    showCalcCol: false,
                    items: []
                },
                col: {
                    count: 0,
                    width: 80,
                    sort: true,
                    names: [],
                    poperty: [], // 此属性已经过时  被property代替
                    property: [],
                    clickevent: []  // 此属性已经过时  已经改进到了属性 property里面。主要改进在返回参数方面
                },
                //分页属性
                paging: {
                    num: 1,
                    rowNum: 10,
                    rowList: [],
                    showRowNum: true,
                    pginput: true,
                    pgbuttons: true,
                    showrecords: true
                },
                //默认排序
                sort: {
                    colindex: -1,
                    field: "",
                    order: "",
                    type: "",
                    colindex2: -1,
                    order2: ""
                },
                //Ajax异步属性
                ajax: {
                    path: "",
                    action: "",
                    sqlstr: "",
                    connstr: "",
                    iscache: false
                },
                //表头设置
                header: {
                    isMulHeader: true,
                    useColSpanStyle: false,
                    groups: {},
                    groupstree: {}
                },
                toolbar: {
                    extend: [],
                    notShow: [],
                    defaultShow: true
                },
                //事件
                callback: {
                    params: [],
                    gridComplete: null,
                    beforeSelectRow: null,
                    beforeBindData: null,
                    onClickRow: null,
                    onRightClickRow: null,
                    ondblClickRow: null,
                    onCellSelect: null,
                    onSortCol: null,
                    onPaging: null,
                    onMulCheck: null
                },
                dataFrom: {
                    Local: false,
                    TSql: false,
                    Analyzer: false
                },
                scroll: {
                    showy: false,
                    showywidth: 18,
                    showx: false
                },
                mulCheck: {
                    ismulCheck: false,
                    isBoxOnly: true,
                    width: 30
                },
                tempSet: {
                    colNames: []
                },
                orgData: {
                    colNames: []
                },
                finalSet: {
                    originalid: "",
                    gridid: "",
                    bindData: null,
                    colHasSet: false,
                    colHasSetArr: [],
                    colNumbers: 0,
                    colModel: [],
                    colNotSort: [],
                    colSorttype: [],
                    colFrozen: [],
                    colRowspan: [],
                    colDatafromUser: [],
                    colSetWidth: { coltotal: 0, widthSum: 0 }, //
                    colSetColor: [],
                    colAddDom: [],
                    colAddUrl: [],
                    colAddClick: [],
                    colAddRightClick: [],
                    bindDBClick: [],
                    bindRightclick: []
                },
                displayRules: []
                //displayRules:[{
                //    expression:"",
                //    rowBgColor:"",
                //    rowForeColor:"",
                //    rowClass:"",
                //    cellBgColor:"",
                //    cellForeColor:"",
                //    cellClass:"",
                //    addColumnHeader:"",
                //    addColumnText:""
                //}]
            }, options);
            if (options.showrownum) {
                $.jgrid.defaults.recordtext = "共 {2} 条"; // 共字前是全角空格
            }

            if (options.col.property.length == 0 && options.col.poperty.length > 0) {
                options.col.property = options.col.poperty;
            }
            if (tools.isScript()) {
                if (toolbarmethod.cookie.get(toolbarmethod.getKey(id)) != undefined) {
                    var meaList = toolbarmethod.cookie.get(toolbarmethod.getKey(id)).split(",");
                    if (meaList != undefined && typeof meaList == 'object') {
                        options.analyzer.MeasureList = [];
                        for (var i = 0; i < meaList.length; i++) {
                            options.analyzer.MeasureList.push({
                                MeasureID: meaList[i]
                            });
                        }
                    }
                }
            }
            return options;
        },
        getColAvgWidth: function (opts, hassetcolcount, hassetcolwidth) { },
        getSetColindex: function (opts, userIndex) {
            if (userIndex >= opts.finalSet.bindData.colnames.length) userIndex = opts.finalSet.bindData.colnames.length - 1;
            if (opts.showrownum) {
                userIndex = userIndex + 1; // 如果显示行号，那么用户自定义列数 +1
            }
            if (opts.mulCheck.ismulCheck) {
                userIndex = userIndex + 1;  // 如果显示多选框，那么用户自定义列数 +1
            }
            return userIndex;
        },
        getSetUserColindex: function (opts, colIndex) {
            return colIndex;
        },
        getRowData: function (opts, rowid, grid) {
            var rowData = grid.getRowData(parseInt(rowid));
            var rowDatatext = [];
            for (var i = 0; i < opts.finalSet.bindData.colnames.length; i++) {
                try {
                    obj = $((rowData["col" + i]));
                    rowDatatext.push(typeof (obj[0]) == "undefined" ? rowData["col" + i] : obj.text());
                } catch (e) {
                    rowDatatext.push(rowData["col" + i]);
                }
            }
            return rowDatatext;
        },
        SetGridOrgData: function (opts, grid) {
            for (var i = 0; i < opts.finalSet.bindData.colnames.length; i++) {
                opts.orgData.colNames.push(opts.finalSet.bindData.colnames[i]);
            }
        },
        getGridFinalSet: function (opts, grid) {
            // 先保存原有的设置  以便后面使用；
            smartgridHelp.SetGridOrgData(opts, grid);
            // 中间临时数据
            opts.tempSet.colNames = opts.finalSet.bindData.colnames;
            //得到设置属性的列
            for (var j = 0; j < opts.col.property.length; j++) {
                // 已经设置的属性的列
                if ($.fmatter.isNumber(opts.col.property[j].colindex)) opts.finalSet.colHasSetArr.push(opts.col.property[j].colindex);
                if ($.fmatter.isString(opts.col.property[j].name)) {
                    opts.tempSet.colNames[opts.col.property[j].colindex] = opts.col.property[j].name;
                }
                // 已经设置的 排序 属性的列
                if ($.fmatter.isBoolean(opts.col.property[j].sort)) opts.finalSet.colNotSort.push(opts.col.property[j].colindex);
                // 已经设置的 锁定列 属性的列
                if ($.fmatter.isBoolean(opts.col.property[j].frozen)) opts.finalSet.colFrozen.push(opts.col.property[j].colindex);
                // 已经设置的 列锁定 属性的列
                if ($.fmatter.isBoolean(opts.col.property[j].rowspan) && opts.col.property[j].rowspan)
                    opts.finalSet.colRowspan.push(opts.col.property[j].colindex);
                // 已经设置的 列宽 属性的列
                if ($.fmatter.isNumber(opts.col.property[j].width)) {  // 计算用户已经设置的的宽度 和 列数
                    if (!($.fmatter.isBoolean(opts.col.property[j].hidden) && opts.col.property[j].rowspan)) {
                        opts.finalSet.colSetWidth.widthSum += opts.col.property[j].width;
                        opts.finalSet.colSetWidth.coltotal++;
                    }
                }
                // 已经设置的 列文本 属性的列
                if ($.fmatter.isString(opts.col.property[j].adddom) && !$.fmatter.isEmpty(opts.col.property[j].adddom)) {
                    opts.finalSet.colAddDom.push({
                        colindex: opts.col.property[j].colindex,
                        context: opts.col.property[j].adddom
                    });
                }
                // 已经设置的 列链接 属性的列
                if ($.fmatter.isString(opts.col.property[j].addurl) && !$.fmatter.isEmpty(opts.col.property[j].addurl)) {
                    opts.finalSet.colAddUrl.push({
                        colindex: opts.col.property[j].colindex,
                        url: opts.col.property[j].addurl,
                        ulrtype: opts.col.property[j].ulrtype
                    });
                }
                // 已经设置的 列单击事件 属性的列
                if ($.isFunction(opts.col.property[j].addclick)) {
                    opts.finalSet.colAddClick.push({
                        colindex: opts.col.property[j].colindex,
                        clickevent: opts.col.property[j].addclick
                    });
                }

                // 已经设置的 列字体颜色和背景颜色 属性的列
                if (($.fmatter.isString(opts.col.property[j].fontcolor) && !$.fmatter.isEmpty(opts.col.property[j].fontcolor)) || ($.fmatter.isString(opts.col.property[j].bgcolor) && !$.fmatter.isEmpty(opts.col.property[j].bgcolor))) {
                    opts.finalSet.colSetColor.push({
                        colindex: opts.col.property[j].colindex,
                        fcolor: opts.col.property[j].fontcolor,
                        bgcolor: opts.col.property[j].bgcolor
                    });
                }
                // 已经设置的 数据来源 属性的列
                if ($.fmatter.isString(opts.col.property[j].datafrom) && !$.fmatter.isEmpty(opts.col.property[j].datafrom)) {
                    opts.finalSet.colDatafromUser.push(opts.col.property[j].colindex);
                }
                // 已经设置的 右击事件 属性的列
                if ($.isFunction(opts.col.property[j].addrightclick)) {
                    opts.finalSet.colAddRightClick.push({
                        colindex: opts.col.property[j].colindex,
                        rightclickevent: opts.col.property[j].addrightclick
                    });
                }
            }
            opts.finalSet.bindData["total"] = parseInt(opts.finalSet.bindData.records / opts.paging.rowNum);
            if (opts.finalSet.bindData.records % opts.paging.rowNum > 0)
                opts.finalSet.bindData["total"] = opts.finalSet.bindData["total"] + 1;
            return smartgridHelp.doBindDataName(opts);
        },
        doBindDataName: function (opts) {
            if (opts.finalSet.colDatafromUser.length > 0) {
                var colcount = opts.finalSet.bindData.colnames.length;
                for (var i = 0; i < opts.finalSet.colDatafromUser.length; i++) {
                    var index = opts.finalSet.colDatafromUser[i];
                    if (index >= colcount) index = colcount;
                    opts.finalSet.bindData.colnames.splice(index, 0, ('user' + i));
                }
            }
            return opts;
        },
        doBindData: function (opts, data) {
            if (opts.finalSet.colDatafromUser.length > 0) {
                var temp = [];
                for (var i = 0; i < opts.finalSet.colDatafromUser.length; i++) {
                    var index = opts.finalSet.colDatafromUser[i];
                    for (var j = 0; j < data.length; j++) {
                        var temprow = {};
                        for (var k = 0; k < opts.finalSet.colNumbers; k++) {
                            if (index > k) {
                                temprow["col" + k] = data[j]["col" + k];
                            } else if (index == k) {
                                temprow["col" + k] = "";
                            } else if (index < k) {
                                temprow["col" + k] = data[j]["col" + (k - 1)];
                            }
                        }
                        temp[j] = temprow;
                    }
                }
                return temp;
            } else {
                return data;
            }
        },
        setMulHeader: function (opts) {
            var colnameArr = opts.tempSet.colNames;
            var dbt = [];
            var hasNextDo = false;
            // 多表头名称处理
            $.each(colnameArr, function (i, value) {
                if (typeof value == 'string') {
                    var node = { id: i, pid: -1, name: value, orgName: value, doPid: false };
                    if (value.indexOf("|||") > 0) {
                        hasNextDo = true;
                        var objstr = value.split("|||");
                        node.name = objstr[objstr.length - 1];
                        node.doPid = true;
                        for (var j = 0; j < objstr.length - 1; j++) {
                            var node1 = { id: (i * 10 + j + colnameArr.length), pid: -1, name: objstr[j], orgName: objstr[j], doPid: false };
                            if (j != 0) {
                                node1.doPid = true;
                                node1.orgName = objstr[j - 1] + "|||" + objstr[j];
                            }
                            dbt.push(node1);
                        }

                    }
                    dbt.push(node);
                    opts.finalSet.bindData.colnames[i] = node.name;
                }
            });

            if (hasNextDo) { // 进一步处理多表头
                for (var i = 0; i < dbt.length; i++) {
                    if (dbt[i].doPid) {
                        for (var j = 0; j < dbt.length; j++) {
                            if (dbt[i].orgName == dbt[j].orgName + "|||" + dbt[i].name) {
                                dbt[i].pid = dbt[j].id;
                                break;
                            }
                        }
                    }
                }
            }

            var nextdbt = [];
            for (var i = 0; i < dbt.length; i++) {
                var canadd = true;
                for (var j = 0; j < nextdbt.length; j++) {
                    if (dbt[i].name == nextdbt[j].name && dbt[i].orgName == nextdbt[j].orgName) {
                        canadd = false;
                        break;
                    }
                }
                if (canadd) {
                    nextdbt.push(dbt[i]);
                }
            }
            if (nextdbt.length > opts.orgData.colNames.length) {
                opts.header.isMulHeader = true;
                opts.header.groupstree = nextdbt;
            }
            return opts;
        },
        doMulHeader: function (colnameArr) {
        },
        doError: function (opts, data) {
            if (data.colnames.length == 0) {
                alert("数据库操作异常");
            }
            else {
                var errFun = opts.errorfun;
                if (typeof (errFun) != 'undefined' && errFun instanceof Function) {
                    errFun(data.tip);
                } else {
                    alert("数据库操作异常：" + data.tip);
                }
            }
        }
    }

    $.fn.smartgrid = function (options) {
        if (methods[options]) {
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof options === 'object' || !options) {
            return methods.smartgridInit.apply(this, arguments);
        }
        else {
            $.error('Method' + options + 'does not exist on jQuery.smartgrid');
        }
    }
    //1 初始化数据
    function InitGridData(grid, opts) {
        if (opts.dataFrom.Local) {
            opts.finalSet.bindData = opts.localdata;
            InitGridOptionSet(grid, smartgridHelp.getGridFinalSet(opts, grid))
        }
        else {
            tools.load(true);
            $.ajax({
                cache: true,
                type: "POST",
                url: opts.ajax.path,
                data: {
                    one: (typeof opts.ajax.sqlstr == 'string' ? opts.ajax.sqlstr : tools.jsonToString(opts.ajax.sqlstr)),
                    two: opts.ajax.connstr,
                    pagenum: opts.paging.num,
                    pagerows: opts.paging.rowNum,
                    formatFlowValue: opts.formatFlowValue,
                    sortcol: opts.sort.colindex,
                    sortorder: opts.sort.order,
                    sortcol2: opts.sort.colindex2,
                    sortorder2: opts.sort.order2,
                    iscache: opts.ajax.iscache,
                    timekey: "",
                    listid: tools.request("listid")
                },
                dataType: "json",
                success: function (datasource) {
                    if (datasource.status == "0") {
                        var binddata = eval('(' + datasource.data.Source + ')');

                        var data = datasource.data;
                        var objdata = eval('(' + datasource.data.Source + ')');
                        if (opts.dataFrom.Analyzer) {
                            opts.analyzer = eval('(' + datasource.data.ReturnParam + ')');
                        }
                        $("#" + grid.attr("id").substr(0, grid.attr("id").length - 2)).data("downDataSource").analyzer = opts.analyzer;
                        //grid.parent().data("downDataSource").analyzer = opts.analyzer;

                        opts.finalSet.bindData = objdata;
                        if (opts.sort.colindex > -1) {
                            var sortname = objdata.colnames[opts.sort.colindex];
                            opts.paging.sortname = sortname;
                            var sortorder = opts.sort.order == "asc" ? "asc" : "desc";
                            grid.setGridParam("sortname", sortname);
                            grid.setGridParam("sortorder", sortorder);
                        }
                        InitGridOptionSet(grid, smartgridHelp.getGridFinalSet(opts, grid));
                        grid.setGridParam({ isTotal: objdata.isTotal });
                        if (objdata.isTotal == -1) {
                            grid.setGridParam({ records: 0 });
                            $("#sp_1_" + opts.pagingId).text("");
                            $("#" + opts.pagingId + "_right").find("div").eq(0).html("");


                            ///加载总条数
                            $.ajax({
                                cache: true,
                                type: "POST",
                                url: opts.ajax.path,
                                data: {
                                    one: (typeof opts.ajax.sqlstr == 'string' ? opts.ajax.sqlstr : tools.jsonToString(opts.ajax.sqlstr)),
                                    two: opts.ajax.connstr,
                                    pagerows: opts.paging.rowNum,
                                    iscount: '1',
                                    iscache: opts.ajax.iscache,
                                    listid: tools.request("listid")
                                },
                                dataType: "json",
                                success: function (datasource) {
                                    if (datasource.status == 0) {
                                        $("#sp_1_" + opts.pagingId).text(datasource.data.PageCount);
                                        $("#" + opts.finalSet.gridid).data("count", datasource.data.Count);
                                        grid.setGridParam({ records: datasource.data.Count });
                                        grid.setGridParam({ isCount: 1 });
                                        grid.setGridParam({ total: datasource.data.PageCount });
                                        var rowNum = parseInt(grid.getGridParam("rowNum")); //当前显示数字        
                                        var curInput = $("#sp_1_" + opts.pagingId).parent().find("input").eq(0).val();
                                        if (curInput != grid.getGridParam("page")) {
                                            grid.setGridParam({ page: curInput });
                                        }
                                        var curpage = parseInt(grid.getGridParam("page"));
                                        var str = (curpage - 1) * rowNum + 1 + " - " + curpage * rowNum + "  共 " + datasource.data.Count + " 条";
                                        $("#" + opts.pagingId + "_right").find("div").eq(0).html(str);
                                    }
                                }
                            });

                        }
                        tools.load(false);
                    }
                },
                error: function () {
                    alert("请求数据出错！");
                }
            });
        }
    }
    //2 初始化数据
    function InitGridOptionSet(grid, opts) {
        //设置分页属性
        if (opts.finalSet.bindData.records == 0) {
            opts.paging.rowList = [];
        } else if (opts.finalSet.bindData.records > opts.paging.rowNum) {
            opts.paging.pgbuttons = true;
            //opts.paging.pginput = true;
            if (opts.paging.rowList.length == 0) {
                opts.paging.rowList.push(opts.paging.rowNum);
                opts.paging.rowList.push(opts.paging.rowNum * 2);
                opts.paging.rowList.push(opts.paging.rowNum * 3);
            }
        }

        //得到设置属性的最大值
        if (opts.finalSet.bindData.colnames.length > 0)
            opts.finalSet.colNumbers = opts.finalSet.bindData.colnames.length;
        else if (opts.col.count > 0) {
            opts.finalSet.colNumbers = opts.col.count;
        } else {
            opts.finalSet.colNumbers = 0;
        }
        smartgridHelp.setMulHeader(opts);

        var cols = $.extend(true, {}, opts.col);
        //var s = grid;
        //while (opts.width == 0) {
        //    opts.width = s.width();
        //    s = s.parent();
        //}

        cols.property = tools.setAttribute(cols.property, opts.finalSet.bindData.colnames);
        cols.property = tools.setCalculationWidth(cols.property, opts);
        //多表头处理
        //得到绑定最后显示名称
        for (var i = 0; i < cols.property.length; i++) {
            var amountStr = {
                name: "col" + i,
                label: cols.property[i].name,
                editable: false,
                width: cols.property[i].width
                //index: 0
            };
            amountStr["sortable"] = opts.col.sort;
            if ($.fmatter.isString(cols.property[i].align))
                amountStr["align"] = cols.property[i].align;
            if ($.fmatter.isBoolean(cols.property[i].hidden) && cols.property[i].hidden === true)
                amountStr["hidden"] = true;
            if ($.fmatter.isBoolean(cols.property[i].frozen) && cols.property[i].frozen === true)
                amountStr["frozen"] = true;
            if ($.fmatter.isBoolean(cols.property[i].sort))
                amountStr.sortable = cols.property[i].sort;
            opts.finalSet.colModel.push(amountStr);
        }

        InitGrid(grid, opts);
    }
    //3 初始化表格、绑定表格事件
    function InitGrid(grid, opts) {
        if (opts.paging.rowNum == 1) {
            if (parseInt(opts.height) < 30) {
                opts.height == 30;
            }
        }
        if (tools.isScript()) {
            if (opts.toolbar != undefined && opts.toolbar.defaultShow != undefined && opts.toolbar.defaultShow) {
                var toOpts = {
                    analyzer: opts.analyzer,
                    title: opts.captionName,
                    extend: (opts.toolbar.extend == undefined ? [] : opts.toolbar.extend),
                    callback: {
                        changed: function (analyzer) {
                            opts.analyzer = analyzer;
                            methods.smartgridReset(grid, opts);
                        }
                    },
                    display: {
                        measel: {
                            show: true
                        },
                        filter: {
                            show: true
                        },
                        searcher: {
                            show: false
                        },
                        isexport: {
                            show: true
                        },
                        second: {
                            show: true
                        }
                    }
                };
                if (opts.dataFrom.TSql) {
                    toOpts.display.measel = false;
                    toOpts.display.filter = false;
                    toOpts.display.searcher = false;
                    toOpts.display.second = false;
                }
                if (opts.toolbar.notShow != undefined && typeof opts.toolbar.notShow == 'object') {
                    if (opts.toolbar.notShow.length > 0) {
                        for (var lk = 0; lk < opts.toolbar.notShow.length; lk++) {
                            if (opts.toolbar.notShow[lk] == "measel") {
                                toOpts.display.measel = false;
                            }
                            else if (opts.toolbar.notShow[lk] == "filter") {
                                toOpts.display.filter = false;
                            }
                            else if (opts.toolbar.notShow[lk] == "searcher") {
                                toOpts.display.searcher = false;
                            }
                            else if (opts.toolbar.notShow[lk] == "isexport") {
                                toOpts.display.isexport = false;
                            }
                            else if (opts.toolbar.notShow[lk] == "second") {
                                toOpts.display.second = false;
                            }
                        }
                    }
                }
                $("#" + opts.finalSet.originalid).toolbar(toOpts);
            }
        }
        grid.jqGrid({
            datatype: "",
            colModel: opts.finalSet.colModel, //这里是数据读取到的字段列名           
            rownumbers: opts.showrownum,
            rownumWidth: opts.rownumwidth,
            viewrecords: true,
            caption: "",
            width: opts.width,
            height: parseInt(opts.height) > 0 ? opts.height : "100%",
            rowNum: opts.paging.rowNum,
            rowList: opts.paging.rowList,
            sortname: opts.paging.sortname,
            sortorder: opts.sort.order,
            pgbuttons: opts.paging.pgbuttons,
            pginput: opts.paging.pginput,
            pager: jQuery("#" + opts.pagingId),
            scrollrows: opts.scroll.showy,
            scrollOffset: opts.scroll.showy ? opts.width : 0,
            shrinkToFit: !opts.scroll.showx,
            multiselect: opts.mulCheck.ismulCheck,
            //multikey: "ctrlKey",
            multiboxonly: opts.mulCheck.isBoxOnly,
            multiselectWidth: opts.mulCheck.width,
            forceFit: false,
            autoScroll: true,
            autowidth: true,
            hoverrows: true,
            jsonReader: { repeatitems: false },
            //Begin 点击翻页按钮填充数据之前触发此事件，同样当输入页码跳转页面时也会触发此事件
            onPaging: function (pgButton) {//分页事件
                var oldpage = parseInt(grid.getGridParam("page"));
                var curpage = 1;
                var rowNum = parseInt(grid.getGridParam("rowNum")); //当前显示数字
                var records = parseInt(grid.getGridParam("records"));
                var pageTotal = parseInt(grid.getGridParam("total"));
                var pagingtype = "";
                if (pgButton === "next_" + opts.pagingId) {
                    if (oldpage >= pageTotal) return false;
                    curpage = oldpage + 1;
                } else if (pgButton === "prev_" + opts.pagingId) {
                    curpage = oldpage - 1;
                } else if (pgButton === "first_" + opts.pagingId) {
                    curpage = 1;
                } else if (pgButton === "last_" + opts.pagingId) {

                    if (oldpage === pageTotal) return false;
                    curpage = pageTotal;
                } else if (pgButton === "records") {
                    var obj = jQuery("#" + opts.pagingId + "_center").find("tr:eq(0)>td:last");
                    rowNum = parseInt(obj.find("select").val());

                    oldrownum = parseInt(grid.getGridParam("rowNum"));
                    var start = oldrownum * (oldpage - 1) + 1;
                    curpage = parseInt(start / rowNum) + 1;
                    pagingtype = "records";
                } else if (pgButton === "user") {
                    var obj = jQuery("#" + opts.pagingId + "_center").find("tr:eq(0)>td:eq(3)");
                    curpage = parseInt(obj.find("input").val());
                    totle = parseInt(obj.find("span").text().replace(" ", ""));
                    if (isNaN(curpage) || curpage < 0) curpage = 0;
                    if (curpage > totle) curpage = totle;
                }
                if (curpage < 1) return false;
                else if (curpage > 1 && rowNum * (curpage - 1) > records) return false;

                var userPaging = opts.callback.onPaging;
                if (typeof (userPaging) != 'undefined' && userPaging instanceof Function) {
                    grid.clearGridData();
                    userPaging(curpage, records, rowNum, opts);
                    return false;
                } else {
                    SetGridPagingInfo(grid, records, rowNum, curpage);
                }
                UpdateGridData(grid, opts, pagingtype);
            }, //end 分页
            //Begin 当点击排序列但是数据还未进行变化时触发此事件。index：name在colModel中位置索引；iCol：当前单元格位置索引；sortorder：排序状态：desc或者asc
            onSortCol: function (index, iCol, sortorder) {
                var iColindex = parseInt(index.replace(/\D/g, ""));
                var field = opts.orgData.colNames[iColindex];  //从元数据中获取字段名 
                iColindex = parseInt(smartgridHelp.getSetUserColindex(opts, iColindex));
                // 如果是不可以排序  则返回
                if (opts.finalSet.colNotSort.length > 0 && tools.isInArray(iColindex, opts.finalSet.colNotSort)) {
                    return false;
                } else {
                    opts.sort.type = "text";
                    for (var j = 0; j < opts.col.property.length; j++) {
                        var colset = opts.col.property[j];
                        if (colset.colindex == iColindex && typeof (colset.sorttype) != 'undefined') {
                            opts.sort.type = colset.sorttype;
                            break;
                        }
                    }
                    if (opts.sort.colindex != iColindex) {
                        opts.sort.colindex2 = opts.sort.colindex;
                        opts.sort.order2 = opts.sort.order;
                    }
                    opts.sort.colindex = iColindex;
                    opts.sort.field = field;
                    opts.sort.order = sortorder;

                    SetGridPagingInfo(grid, parseInt(grid.getGridParam("records")), parseInt(grid.getGridParam("rowNum")), 1);
                    UpdateGridData(grid, opts, "sort");
                    if (opts.callback.onSortCol) {
                        opts.callback.onSortCol(index, iCol, sortorder);
                    }
                }
            }, //end 排序
            //Begin 当插入每行时触发。rowid插入当前行的id；rowdata插入行的数据，格式为name: value，name为colModel中的名字
            afterInsertRow: function (rowid, rowdata, rowelem) {
                //颜色 追加
                for (var i = 0; i < opts.finalSet.colSetColor.length; i++) {
                    var colset = opts.finalSet.colSetColor[i];
                    var taga = grid.find("tr:eq(" + rowid + ")>td:eq(" + smartgridHelp.getSetColindex(opts, colset.colindex) + ")");
                    $(taga).css({ color: colset.fcolor, "background-color": colset.bgcolor })
                }

                //内容 追加
                for (var i = 0; i < opts.finalSet.colAddDom.length; i++) {
                    var colset = opts.finalSet.colAddDom[i];
                    var colid = colset.colindex;
                    grid.setCell(rowid, smartgridHelp.getSetColindex(opts, colid), tools.strFormatFromRow(colset.context, rowdata));
                }

                //循环绑定链接跳转事件
                for (var i = 0; i < opts.finalSet.colAddUrl.length; i++) {
                    var colset = opts.finalSet.colAddUrl[i];
                    var colid = colset.colindex;
                    if (colset.ulrtype == 'undefined' || $.fmatter.isEmpty(colset.ulrtype)) {
                        colset.ulrtype = "_blank";
                    }
                    grid.setCell(rowid, smartgridHelp.getSetColindex(opts, colid), "<a href='" + tools.strFormatFromRow(colset.url, rowdata) + "' target='" +

    colset.ulrtype + "'>" + (rowdata["col" + colid]) + "</a>");
                }

                //循环绑定JS click事件单机事件
                for (var i = 0; i < opts.col.clickevent.length; i++) {
                    var colset = opts.col.clickevent[i];
                    var colid = colset.colindex;  // 实际数据行

                    var oldColtext = rowdata["col" + colid];
                    var setlinkColid = smartgridHelp.getSetColindex(opts, colid);

                    var funName = colset.click;
                    grid.setCell(rowid, setlinkColid, "<a href='javascript:void(0);' class=\"myj\"  style=\"color:blue\"  colindex=" + colid + " >" + oldColtext +

    "</a>");
                    var taga = grid.find("tr:eq(" + rowid + ")>td:eq(" + setlinkColid + ") a:eq(0)");
                    taga.bind("click", function () {
                        funName($(this));
                        $(this).parent().parent().siblings("tr").removeClass("ui-state-highlight").attr("aria-selected", "false");
                        $(this).parent().parent().addClass("ui-state-highlight").attr("aria-selected", "true");
                    });
                    if ($.fmatter.isString(colset.clkparams) && !$.fmatter.isEmpty(colset.clkparams)) {
                        taga.attr("clkparams", colset.clkparams);
                        var tagattrid = "postData";
                        if ($.fmatter.isString(colset.clkvalues) && !$.fmatter.isEmpty(colset.clkvalues)) {
                            tagattrid = colset.clkvalues;
                        }
                        taga.attr(tagattrid, tools.strFormatFromRow2(colset.clkparams, rowdata));
                    }
                } //结束绑定
            }, //end 行添加事件
            //Begin  当表格所有数据都加载完成而且其他的处理也都完成时触发此事件，排序，翻页同样也会触发此事件
            gridComplete: function () {
                //去除表格数据列的系统右键事件
                if ($.isFunction(opts.callback.onRightClickRow) || opts.analyzercontextmenu.show) {
                    $("#" + opts.finalSet.gridid).bind('contextmenu', function () { return false; })
                } else if (opts.finalSet.colAddRightClick.length > 0) {
                    $("#" + opts.finalSet.gridid).bind('contextmenu', function () { return false; })
                }

                if (!opts.paging.showRowNum) {
                    $("#" + opts.pagingId).find(".ui-pg-selbox").hide();
                }
                grid.setCell(1, 2, "");

                if (opts.displayRules != null && opts.displayRules.length > 0) {
                    var colnams = grid.getGridParam("colNames");
                    for (var ir = 0; ir < opts.displayRules.length; ir++) {
                        var rule = opts.displayRules[ir];
                        if (!tools.isNullOrEmpty(rule.expression)) {
                            var idxArr = [];
                            var subExps = rule.expression.replace(/>=/g, "$").replace(/<=/g, "#").replace(/!=/g, "@").replace(/[\(|\)]/g, "").split(/(\sand\s|\sor\s)/gi);
                            for (var si = 0; si < subExps.length; si++) {
                                var subexp = $.trim(subExps[si]);
                                if (subexp.match(/(and|or)/gi) != null) {
                                    continue;
                                }
                                if (subexp.length > 0) {
                                    var expItems = subexp.split(/[>|=|<|$|#|@]/g);
                                    if (expItems.length == 2) {
                                        var cn = expItems[0].replace(/[\[|\]|']/g, "");
                                        var idx = tools.indexInArray(cn, colnams);
                                        if (idx < 0) {
                                            for (var ci = 0; ci < colnams.length; ci++) {
                                                if (colnams[ci].substr(0, colnams[ci].indexOf("（")) == ci || ci == cn) {
                                                    idx = ci;
                                                    break;
                                                }
                                            }
                                        }
                                        if (idx > -1) {
                                            idxArr.push(idx);
                                        }
                                        else {
                                            idxArr = [];
                                            break;
                                        }
                                    }
                                    else {
                                        idxArr = [];
                                        break;
                                    }
                                }
                            }
                            if (idxArr.length > 0) {

                                var datarows = grid.getRowData();
                                for (var r = 0; r < datarows.length; r++) {
                                    var expFormat = rule.expression;
                                    for (var k = 0; k < idxArr.length; k++) {
                                        expFormat = expFormat.replace(new RegExp("\\\[" + colnams[idxArr[k]] + "\\\]", "g"), datarows[r]["col" + idxArr[k]]);
                                    }
                                    // try{
                                    if (eval(expFormat.replace(/\sand\s/gi, "&&").replace(/\sor\s/gi, "||").replace(/=/g, "==").replace(/>==/g, ">=").replace(/<==/, "<=").replace(/!==/g, "!="))) {
                                        if (!tools.isNullOrEmpty(rule.cellClass)) {
                                            for (var k = 0; k < idxArr.length; k++) {
                                                grid.find("tr:eq(" + (r + 1) + ")>td:eq(" + idxArr[k] + ")").addClass(rule.cellClass);
                                            }
                                        }
                                        if (!tools.isNullOrEmpty(rule.cellForeColor)) {
                                            for (var k = 0; k < idxArr.length; k++) {
                                                grid.find("tr:eq(" + (r + 1) + ")>td:eq(" + idxArr[k] + ")").css("color", rule.cellForeColor);
                                            }
                                        }
                                        if (!tools.isNullOrEmpty(rule.cellBgColor)) {
                                            for (var k = 0; k < idxArr.length; k++) {
                                                grid.find("tr:eq(" + (r + 1) + ")>td:eq(" + idxArr[k] + ")").css("background-color", rule.cellBgColor);
                                            }
                                        }
                                        if (!tools.isNullOrEmpty(rule.rowClass)) {
                                            grid.find("tr:eq(" + (r + 1) + ")").addClass(rule.rowClass);
                                        }
                                        if (!tools.isNullOrEmpty(rule.rowForeColor)) {
                                            grid.find("tr:eq(" + (r + 1) + ")").css("color", rule.rowForeColor);
                                        }
                                        if (!tools.isNullOrEmpty(rule.rowBgColor)) {
                                            grid.find("tr:eq(" + (r + 1) + ")").css("background-color", rule.rowBgColor);
                                        }
                                    }
                                    // }
                                    //catch (ex) { throw ex; }
                                }
                            }
                        }
                    }
                }
                var userGridComplete = opts.callback.gridComplete;
                if (typeof (userGridComplete) != 'undefined' && userGridComplete instanceof Function) {
                    userGridComplete(grid, opts);
                } else if (userGridComplete != null) {
                    alert("自定义加载完成后返回事件有误！");
                }

                if (opts.finalSet.colRowspan.length > 0) {
                    var rowNum = parseInt(grid.getGridParam("rowNum"));
                    var iscolspan = false;
                    if (grid.find("tr").length > 2) {
                        for (var colid = 0; colid < opts.finalSet.colRowspan.length; colid++) {
                            var arrcol = [[1]];
                            var docolid = smartgridHelp.getSetColindex(opts, opts.finalSet.colRowspan[colid]);
                            for (var rowid = 2; rowid <= rowNum; rowid++) {
                                iscolspan = false;
                                var pretd = grid.find("tr:eq(" + (rowid - 1) + ")>td:eq(" + docolid + ")").text();
                                var thistd = grid.find("tr:eq(" + rowid + ")>td:eq(" + docolid + ")").text();
                                iscolspan = pretd == thistd;
                                var arr = [];
                                if (iscolspan) {
                                    arr = arrcol[arrcol.length - 1];
                                    arr.push(rowid);
                                    if (rowid === rowNum - 1) {
                                        arr.push(rowNum);
                                    }
                                } else {
                                    arr.push(rowid);
                                    arrcol.push(arr);
                                }
                            }
                            for (var i = 0; i < arrcol.length; i++) {
                                var arrr = arrcol[i];
                                if (arrr.length > 1) {
                                    grid.find("tr:eq(" + arrr[0] + ")>td:eq(" + docolid + ")").attr("rowspan", arrr.length);
                                    for (var j = 1; j < arrr.length; j++) {
                                        var td = grid.find("tr:eq(" + arrr[j] + ")>td:eq(" + docolid + ")");
                                        td.hide();
                                    }
                                }
                            }
                        }
                    }
                }


                if (opts.isresize) {
                    $(grid).attr("isresize", "true");
                    tools.setGridWidth(opts.finalSet.originalid, grid);
                }
            }, //end 数据加载完成后
            //当用户点击当前行在未选择此行时触发。rowid：此行id；e：事件对象。
            //返回值为ture或者false。如果返回true则选择完成，如果返回false则不会选择此行也不会触发其他事件
            beforeSelectRow: function (rowid, e) {
                //如果存在单击事件
                if (typeof (opts.callback.onClickRow) != 'undefined') {
                    var callbackEvent = opts.callback.onClickRow;
                    if (callbackEvent instanceof Function) {
                        var callbackEvent = opts.callback.onClickRow;
                        if (callbackEvent instanceof Function) {
                            callbackEvent(rowid, smartgridHelp.getRowData(opts, rowid, grid));
                        }
                        return true;
                    }
                }
                if (opts.mulCheck.ismulCheck) {
                    if (e.target.id === ("jqg_" + opts.finalSet.gridid + "_" + rowid)) {
                        jQuery("#" + opts.finalSet.gridid).jqGrid('setSelection', rowid);
                        if ($.isFunction(opts.callback.onMulCheck)) {
                            opts.callback.onMulCheck(rowid, smartgridHelp.getRowData(opts, rowid, grid), e.target.checked, opts.callback.params);
                        }
                    }
                    return false;
                }
                if (opts.finalSet.colAddClick.length > 0) {
                    return true;
                }
                return true;
            },
            //当选择行时触发此事件。rowid：当前行id；status：选择状态，当multiselect 为true时此参数才可用
            onSelectRow: function (rowid, status) {
                return true;
            },
            //在行上右击鼠标时触发此事件。rowid：当前行id；iRow：当前行位置索引；iCol：当前单元格位置索引；e：event对象
            onRightClickRow: function (rowid, iRow, iCol, e) {
                if (opts.finalSet.colAddRightClick.length > 0) {
                    var event = $.map(opts.finalSet.colAddRightClick, function (item) {
                        if (smartgridHelp.getSetColindex(opts, item.colindex) == iCol) {
                            return item;
                        }
                    });
                    if (event.length > 0) {
                        var ev = event[0];
                        ev.rightclickevent(iRow, ev.colindex, smartgridHelp.getRowData(opts, rowid, grid), e);
                        return;
                    }
                } else {

                }

                if ($.isFunction(opts.callback.onRightClickRow)) {
                    var usercolindex = smartgridHelp.getSetUserColindex(opts, iCol);
                    if (usercolindex >= 0) {
                        opts.callback.onRightClickRow(iRow, usercolindex, smartgridHelp.getRowData(opts, rowid, grid), e);
                    }
                }
                var items = []
                if (opts.dataFrom.Analyzer && opts.analyzercontextmenu.show) {
                    if (opts.analyzercontextmenu.showCalcCol) {
                        items = [{
                            text: "添加计算列", clickFun: function (e) {
                                $(this).formulaedit({
                                    analyzer: opts.analyzer,
                                    confirm: function (mea) {
                                        opts.analyzer.MeasureList.push(mea);
                                        $("#" + opts.finalSet.gridid).smartgrid("smartgridReset", grid, opts);
                                    }
                                });

                            }
                        }];
                        //opts.analyzercontextmenu.items.push(items[0]);
                        Array.prototype.push.apply(items, opts.analyzercontextmenu.items);
                        var meacol = smartgridHelp.getSetUserColindex(opts, iCol) - opts.analyzer.RowDimList.length;
                        if (meacol >= 0 && opts.analyzer.MeasureList[meacol].MeasureType == 7) {
                            items.push({
                                text: "编辑计算列", clickFun: function (e) {
                                    $(this).formulaedit({
                                        analyzer: opts.analyzer,
                                        measure: opts.analyzer.MeasureList[meacol],
                                        confirm: function (mea) {
                                            opts.analyzer.MeasureList[meacol] = mea;
                                            $("#" + opts.finalSet.gridid).smartgrid("smartgridReset", grid, opts);
                                        }
                                    });
                                }
                            });
                            items.push({
                                text: "删除计算列", clickFun: function (e) {
                                    var newmeas = [];
                                    for (var m = 0; m < opts.analyzer.MeasureList.length; m++) {
                                        if (m != e.data.colIndex - opts.analyzer.RowDimList.length) {
                                            newmeas.push(opts.analyzer.MeasureList[m]);
                                        }
                                    }
                                    opts.analyzer.MeasureList = newmeas;
                                    $("#" + opts.finalSet.gridid).smartgrid("smartgridReset", grid, opts);
                                }
                            });
                        }
                    }

                    $(this).contextmenu({
                        showDrill: opts.analyzercontextmenu.showDrill,
                        showRelatedAnalysis: opts.analyzercontextmenu.showRelatedAnalysis,
                        showDimStatistics: opts.analyzercontextmenu.showDimStatistics,
                        topX: e.clientX,
                        topY: e.clientY,
                        analyzer: opts.analyzer,
                        rowData: smartgridHelp.getRowData(opts, rowid, grid),
                        colIndex: smartgridHelp.getSetUserColindex(opts, iCol),
                        items: items
                    });
                }
            },
            //双击行时触发。rowid：当前行id；iRow：当前行索引位置；iCol：当前单元格位置索引；e:event对象
            ondblClickRow: function (rowid, iRow, iCol, e) {
            },
            //当点击单元格时触发。rowid：当前行id；iCol：当前单元格索引；cellContent：当前单元格内容；e：event对象
            onCellSelect: function (rowid, iCol, cellcontent, e) { // 需要onSelectRow 返回true 才有效
                //循环绑定JS click事件单机事件
                for (var i = 0; i < opts.finalSet.colAddClick.length; i++) {
                    var colset = opts.finalSet.colAddClick[i];
                    if (smartgridHelp.getSetColindex(opts, colset.colindex) == iCol) {
                        var funname = colset.clickevent;
                        colset.clickevent(rowid, colset.colindex, smartgridHelp.getRowData(opts, rowid, grid));
                    }
                } //结束绑定
            },
            //当从服务器返回响应时执行，xhr：XMLHttpRequest 对象
            loadComplete: function (xhr) {
                alert("a");
            },
            onSelectAll: function (aRowids, status) {
                if (opts.mulCheck.ismulCheck) {
                    for (var i = 0; i < aRowids.length; i++) {
                        if ($.isFunction(opts.callback.onMulCheck)) {
                            opts.callback.onMulCheck(aRowids[i], smartgridHelp.getRowData(opts, aRowids[i], grid), status, opts.callback.params);
                        }
                    }
                }
                if ($.isFunction(opts.callback.onSelectAll)) {
                    opts.callback.onSelectAll(aRowids, status);
                }
            }
        });

        InitGridOpts(grid, opts);
        return grid;
    }
    //4 根据设置完成其他的配置
    function InitGridOpts(grid, opts) {
        // 合并表头
        if (opts.header.isMulHeader) {
            var headtree = opts.header.groupstree;
            if (headtree.length > 0) {
                var index = 0;
                // 算出基本属性
                for (var i = 0; i < headtree.length; i++) {
                    var mychild = [];
                    var obj1 = headtree[i];
                    for (var j = 0; j < headtree.length; j++) {
                        var obj2 = headtree[j];
                        if (obj1.id == obj2.pid) {
                            mychild.push(obj2.id);
                        }
                    }

                    if (mychild.length > 0) {
                        obj1["children"] = mychild;
                        obj1["isend"] = false;
                    } else {
                        obj1["index"] = index;
                        index++;
                        obj1["isend"] = true;
                    }
                }
                //算出行列层级属性
                var maxTreeDep = 1;
                for (var i = 0; i < headtree.length; i++) {
                    var treeDep = 1;
                    var obj = headtree[i];
                    if (obj.isend == true) {
                        obj["dep"] = treeDep;
                        while (obj.pid > 0) {
                            for (var j = 0; j < headtree.length; j++) {
                                if (headtree[j].id == obj.pid) {
                                    obj = headtree[j];
                                    treeDep++;
                                    break;
                                }
                            }
                            if (typeof (obj.dep) == "undefined") {
                                obj["dep"] = treeDep;
                            }
                            else if (obj.dep < treeDep) {
                                obj.dep = treeDep;
                            }
                            maxTreeDep = maxTreeDep > obj.dep ? maxTreeDep : obj.dep;
                        }
                    }
                }

                for (var i = 2; i <= maxTreeDep; i++) {
                    //计算出一个父级节点的所有最低级叶子
                    for (var j = 0; j < headtree.length; j++) {
                        if (headtree[j].dep == i) {
                            var objend = headtree[j];
                            if (i == 2) {
                                objend["ends"] = objend.children;
                                objend["endindex"] = objend.children[0];
                            } else {
                                var ends = [];
                                for (var k = 0; k < objend.children.length; k++) {
                                    for (var l = 0; l < headtree.length; l++) {
                                        if (headtree[l].id == objend.children[k]) {
                                            var objendchildren = headtree[l];
                                            ends = ends.concat(objendchildren.ends)
                                        }
                                    }
                                }
                                objend["ends"] = ends;
                                objend["endindex"] = ends[0];
                            }
                        }
                    }
                }
                for (var i = maxTreeDep; 1 < i; i--) {
                    var arr = new Array();
                    var endindex
                    for (var j = 0; j < headtree.length; j++) {
                        if (headtree[j].dep == i) {
                            var obj = headtree[j];
                            for (var k = 0; k < headtree.length; k++) {
                                if (headtree[k].id == obj.endindex) {
                                    endindex = headtree[k].index;
                                    break;
                                }
                            }
                            arr.push({
                                startColumnName: "col" + endindex,
                                titleText: obj.name,
                                numberOfColumns: obj.ends.length
                            });
                        }
                    }
                    grid.setGroupHeaders({
                        useColSpanStyle: (i % 2 == 0),
                        groupHeaders: arr
                    });
                }
            } // 树形结构合并表头
            else {
                headset = opts.header.groups;
                headcolspan = true;
                if (($.fmatter.isObject(headset.next) && headset.next.cur.length > 0)) headcolspan = false;
                var doheader = true;
                while (doheader) {
                    if ($.fmatter.isObject(headset.cur) && headset.cur.length > 0) {
                        var objheader = headset.cur;
                        var arr = new Array();

                        for (var i = 0; i < objheader.length; i++) {
                            var obj = objheader[i];
                            arr.push({
                                startColumnName: "col" + obj.colindex,
                                titleText: obj.newtitle,
                                numberOfColumns: obj.columntotle
                            });
                        }

                        grid.setGroupHeaders({
                            useColSpanStyle: headcolspan,
                            groupHeaders: arr
                        });
                        if (typeof (headset.next) == "object") {
                            headset = headset.next;
                            headcolspan = (!headcolspan);
                        } else {
                            doheader = false;
                        }
                    } else {
                        doheader = false;
                    }
                }
            }
        }
        opts.header.isMulHeader == false;
        //锁定列设
        if (opts.finalSet.colFrozen.length > 0) {
            grid.setFrozenColumns();
        }
        SetGridPagingInfo(grid, opts.finalSet.bindData.records, opts.paging.rowNum, opts.finalSet.bindData.page);
        //绑定数据
        BindGridData(grid, opts, opts.finalSet.bindData.rows);
    }
    //数据修改
    function UpdateGridData(grid, opts, actiontype) {
        if (opts.dataFrom.Local) {
            if (actiontype === "sort") {
                UpdateGridDataLocalSort(grid, opts);
            } else {
                UpdateGridDataLocalPaging(grid, opts);
            }
        }
        else {
            UpdateGridDataTSQL(grid, opts);
        }
    }
    function UpdateGridDataLocalSort(grid, opts) {
        var sortfield = "col" + opts.sort.colindex;
        var sortorder = opts.sort.order;
        var sorttype = opts.sort.type;
        var isAsc = sortorder.toLowerCase() === "desc";
        opts.finalSet.bindData.rows.sort(tools.sortJsonByFiled(sortfield, isAsc, opts.sort.type));
        BindGridData(grid, opts, opts.finalSet.bindData.rows);
    }
    function UpdateGridDataLocalPaging(grid, opts) {
        var obj = [];
        var rowNum = parseInt(grid.getGridParam("rowNum")); //当前显示数字        
        var curpage = parseInt(grid.getGridParam("page"));
        var records = parseInt(grid.getGridParam("records")); //当前显示数字  
        for (var i = (curpage - 1) * rowNum; i < records && i < curpage * rowNum; i++) {
            obj.push(opts.finalSet.bindData.rows[i]);
        }
        //绑定数据
        BindGridData(grid, opts, obj);
    }
    function UpdateGridDataTSQL(grid, opts) {
        var rowNum = parseInt(grid.getGridParam("rowNum")); //当前显示数字        
        var curpage = parseInt(grid.getGridParam("page"));
        var record = grid.getGridParam("records");
        tools.load(true);
        $.ajax({
            cache: true,
            type: "post",
            url: opts.ajax.path,
            complete: function () {
                if (opts.finalSet.bindData.colnames.length > 0) {
                    for (var i = 0; i < opts.finalSet.bindData.colnames.length; i++) {
                        $("#" + grid[0].id).jqGrid("setLabel", "col" + i, opts.finalSet.bindData.colnames[i]);
                    }
                }
            },
            data: {
                one: (typeof opts.ajax.sqlstr == 'string' ? opts.ajax.sqlstr : tools.jsonToString(opts.ajax.sqlstr)),
                two: opts.ajax.connstr,
                pagenum: curpage,
                pagerows: rowNum,
                sortfield: opts.sort.field,
                sortorder: opts.sort.order,
                sorttype: opts.sort.type,
                record: record,
                formatFlowValue: opts.formatFlowValue,
                sortcol: opts.sort.colindex,
                sortcol2: opts.sort.colindex2,
                sortorder2: opts.sort.order2,
                iscache: opts.ajax.iscache,
                timekey: "",
                listid: tools.request("listid")
            },
            dataType: "json",
            success: function (datasource) {
                if (datasource.status == "0") {
                    optdata = eval('(' + datasource.data.Source + ')');
                    opts.analyzer = eval('(' + datasource.data.ReturnParam + ')');
                    $("#" + grid.attr("id").substr(0, grid.attr("id").length - 2)).data("downDataSource").analyzer = opts.analyzer;
                    SetGridPagingInfo(grid, optdata.records, rowNum, curpage);
                    opts.finalSet.bindData.colnames = optdata.colnames;
                    //绑定数据
                    BindGridData(grid, opts, optdata.rows);


                }
                tools.load(false);
            },
            error: function () {
                alert("异步查询数据出错！");
            }
        });
    }
    //设定表格的分页信息
    function SetGridPagingInfo(grid, curRecords, curRowNum, curpage) {
        grid.setGridParam({ page: curpage });
        grid.setGridParam({ rowNum: curRowNum });
        grid.setGridParam({ records: curRecords });
        grid.setGridParam({ total: parseInt(curRecords / curRowNum) + (curRecords % curRowNum > 0 ? 1 : 0) });
    }
    //给表格绑定数据
    function BindGridData(grid, opts, data) {
        var objLocal = {
            rowNum: parseInt(grid.getGridParam("rowNum")),
            total: parseInt(grid.getGridParam("total")),
            page: parseInt(grid.getGridParam("page")),
            records: parseInt(grid.getGridParam("records")),
            rows: smartgridHelp.doBindData(opts, data),
            colnames: opts.finalSet.bindData.colnames
        };
        if (opts.islocaldata === true) {
            $("#" + opts.finalSet.gridid).data("griddatasource", opts.finalSet.bindData);
        } else {
            $("#" + opts.finalSet.gridid).data("griddatasource", objLocal);
        }
        grid[0].addJSONData(objLocal);
        objLocal = null;
        return false;
    }
})(jQuery);


/*
* jQuery CA ContextMenu 1.0.0
*
* Copyright 2013 BocoDss
* Depends:
*	jquery.ui.core.js
*	jquery.ui.widget.js
*/
(function ($) {
    var methods = {
        init: function (settings) {
            var paras = $.extend({
                showRelatedAnalysis: false,
                showDrill: false,
                showDimStatistics: false,
                topX: 200,
                topY: 200,
                analyzer: null,
                colIndex: 0,
                rowData: [],
                items: []
            }, settings);
            var $menuDiv = $(">html>body>#secondContextMenu");
            if ($menuDiv.length == 0) {
                $menuDiv = $("<div id='secondContextMenu' style=\"position:fixed;z-index:999;\"></div>");
                $(">html>body").append($menuDiv);
            }
            $menuDiv.hide();
            $menuDiv.css({ left: paras.topX, top: paras.topY });
            $menuDiv.empty();
            var $menu = $("<ul></ul>");
            $menuDiv.append($menu);
            var rootPath = getRootPath();
            var url = rootPath + "/PlugIn/CustomAnalysis/Second/";
            if (paras.showRelatedAnalysis) {
                var meaids = [];
                for (var m = 0; m < paras.analyzer.MeasureList.length; m++) {
                    meaids.push(paras.analyzer.MeasureList[m].MeasureID);
                }
                var meaid = meaids.join(",");
                var dims = [];
                var dimsEmpty = [];
                for (var d = 0; d < paras.analyzer.RowDimList.length; d++) {
                    var dim = paras.analyzer.RowDimList[d];
                    dims.push("[" + dim.DimensionName + "].[" + dim.LevelName + "].[" + paras.rowData[d] + "]");
                    if (dim.DimensionName == "日期维") {
                        dimsEmpty.push("[" + dim.DimensionName + "].[" + dim.LevelName + "].[" + paras.rowData[d] + "]");
                    }
                    else {
                        dimsEmpty.push("[" + dim.DimensionName + "].[" + dim.LevelName + "]");
                    }
                }
                for (var d = 0; d < paras.analyzer.SliceDimList.length; d++) {
                    var dim = paras.analyzer.SliceDimList[d];
                    if (dim.DimensionName == "日期维") {
                        dims.push("[" + dim.DimensionName + "].[" + dim.LevelName + "].[" + dim.Val + "]");
                    }
                }
                var dimstr = dims.join(";");
                var dimstrempty = dimsEmpty.join(";");
                var itemsRa = [{
                    text: "关联分析", items: [{
                        text: "趋势分析", clickFun: function (c, r) {
                            var urltrend = url + "Trend.htm?meaid=" + meaid + "&rowdim=" + encodeURI(dimstr);
                            openPageInTab("趋势分析", urltrend);
                        }
                    },
                    {
                        text: "同环比分析", clickFun: function (c, r) {
                            var urlthb = url + "Analyst.htm?meaid=" + meaid + "&rowdim=" + encodeURI(dimstr);
                            openPageInTab("同环比分析", urlthb);
                        }
                    },
                    {
                        text: "对比分析", clickFun: function (c, r) {
                            var urlcomp = url + "Contrast.htm?meaid=" + meaid + "&rowdim=" + encodeURI(dimstrempty);
                            openPageInTab("对比分析", urlcomp);
                        }
                    }]
                }];
                setCustomMenu(itemsRa, $menu, paras.colIndex, paras.rowData);
            }
            $menuDiv.find("ul").css("width", "100px");

            if (paras.showDrill && paras.analyzer != null && paras.analyzer.RowDimList.length > paras.colIndex) {
                var liDrill = $("<li></li>");
                liDrill.append($("<a href='#'>钻取</a>"));
                $menu.append(liDrill);
                var ulDrill = $("<ul></ul>");
                liDrill.append(ulDrill);
                ulDrill.load(rootPath + "/PlugIn/CustomAnalysis/Handler/Dimension.ashx?type=hier&dimid=" + paras.analyzer.RowDimList[paras.colIndex].DimensionID +
                "&level=" + encodeURI(paras.analyzer.RowDimList[paras.colIndex].LevelName), function () {
                    liDrill.prop("disabled", false);
                    $menu.menu("destroy");
                    $menu.menu();
                    liDrill.find("ul").css("width", "100px");

                    liDrill.find(">ul>li").each(function () {
                        var levels = [];
                        $(this).find(">ul>li").each(function () {
                            levels.push($(this).text());
                        });
                        $(this).find(">ul>li").each(function (j) {
                            $(this).click(function () {
                                var anaDrill = getAnalyzerDrilled(paras, j, levels);
                                var anaDrillStr = jsonToString(anaDrill);
                                var escapeStr = escape(anaDrillStr);
                                document.cookie = "anadrill=" + escapeStr.substr(0, 4000) + "; path=/";
                                document.cookie = "anadrill2=" + escapeStr.substr(4000, 4000) + "; path=/";
                                document.cookie = "anadrill3=" + escapeStr.substr(8000, 4000) + "; path=/";
                                openPageInTab("钻取", rootPath + "/PlugIn/CustomAnalysis/Second/Drill.htm?d=1&rnd=" + (new Date()).getTime() + parseInt(Math.random() * 100000));
                            });
                        });
                    });
                });
            }
            if (paras.showDimStatistics && (paras.analyzer.ColDimList == null || paras.analyzer.ColDimList.length == 0)
            && paras.colIndex < paras.analyzer.RowDimList.length) {
                var itemDs = [{
                    text: "维度汇总", clickFun: function () {
                        var anasta = getAnalyzerStat(paras);
                        var anastaStr = jsonToString(anasta);
                        var escapesta = escape(anastaStr);
                        document.cookie = "ana=" + escapesta.substr(0, 4000) + "; path=/";
                        document.cookie = "ana2=" + escapesta.substr(4000, 4000) + "; path=/";
                        document.cookie = "ana3=" + escapesta.substr(8000, 4000) + "; path=/";
                        openPageInTab("维度汇总", rootPath + "/PlugIn/CustomAnalysis/Second/Gather.htm");
                    }
                }];
                setCustomMenu(itemDs, $menu, paras.colIndex, paras.rowData);
            }
            if (paras.items != null && paras.items.length > 0) {
                setCustomMenu(paras.items, $menu, paras.colIndex, paras.rowData);
            }
            $menu.menu();
            $menuDiv.show();
            $(document).click(function (e) {
                $menuDiv.hide();
            });
        }
    };
    $.fn.contextmenu = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method' + method + 'does not exist on jQuery.CA.ContextMenu');
        }
    };

    function setCustomMenu(items, u, colIndex, rowData) {
        for (var i = 0; i < items.length; i++) {
            var im = items[i];
            var li = $("<li><a href='#'>" + im.text + "</a></li>");
            if (im.items != null && im.items.length > 0) {
                var ul = $("<ul></ul>");
                setCustomMenu(im.items, ul, colIndex, rowData);
                li.append(ul);
            }
            if (im.clickFun != null) {
                li.bind("click", { colIndex: colIndex, rowData: rowData }, im.clickFun);
            }
            u.append(li);
        }
    }

    function getAnalyzerStat(paras) {
        var anasta = $.extend(true, {}, paras.analyzer);
        anasta.StatisticsSetting = {
            DimensionIndexList: [paras.colIndex],
            StatisticsList: [{ MeasureIndex: 0, StatisticsType: 0 }]
        };
        return anasta;
    }

    function getAnalyzerDrilled(paras, drillIndex, levels) {
        var ana = $.extend(true, {}, paras.analyzer);
        var srcIndex = 0;
        for (var i = 0; i < levels.length; i++) {
            if (levels[i] == paras.analyzer.RowDimList[paras.colIndex].LevelName) {
                srcIndex = i;
                break;
            }
        }
        var rowdimlist = [];
        var isDirllLevelInRowDim = isExistsInRowDims(paras, levels[drillIndex]);
        for (var r = 0; r < paras.analyzer.RowDimList.length; r++) {
            var dim = ana.RowDimList[r];
            if (!isExistsInLevels(paras, levels, r, drillIndex + 1)) {
                if (isDrillDown(drillIndex, srcIndex)) {
                    dim.Val = paras.rowData[r];
                    dim.ValList = [];
                    dim.ValType = 0;
                }
                else if (isDrillUp(drillIndex, srcIndex)) {
                    if (paras.analyzer.RowDimList[r].DimensionName == paras.analyzer.RowDimList[paras.colIndex].DimensionName) {
                        dim.Val = "";
                        dim.ValType = 0;
                        dim.ValList = [];
                    }
                    else {
                        dim.Val = paras.rowData[r];
                        dim.ValList = [];
                        dim.ValType = 0;
                    }
                }
                if (!isExistsInDimList(rowdimlist, dim.LevelName)) {
                    rowdimlist.push(dim);
                }
                if (r == paras.colIndex && isDrillDown(drillIndex, srcIndex)) {
                    var d = $.extend({}, paras.analyzer.RowDimList[r]);
                    d.LevelName = levels[drillIndex];
                    d.ValType = 0;
                    d.Val = "";
                    d.ValList = [];
                    rowdimlist.push(d);
                }
            }
            if (r == paras.colIndex && isDrillUp(drillIndex, srcIndex) && !isDirllLevelInRowDim) {
                dim.LevelName = levels[drillIndex];
                dim.Val = "";
                dim.ValType = 0;
                dim.ValList = [];
                rowdimlist.push(dim);
            }
        }
        ana.RowDimList = rowdimlist;
        return ana;
    }

    function isExistsInDimList(rowDimList, levelName) {
        for (var i = 0; i < rowDimList.length; i++) {
            if (rowDimList[i].LevelName == levelName) {
                return true;
            }
        }
        return false;
    }

    function isDrillDown(drillIndex, srcIndex) {
        return drillIndex > srcIndex
    }

    function isDrillUp(drillIndex, srcIndex) {
        return drillIndex < srcIndex
    }

    function isExistsInRowDims(paras, levelname) {
        for (var i = 0; i < paras.analyzer.RowDimList.length; i++) {
            if (paras.analyzer.RowDimList[i].LevelName == levelname &&
                paras.analyzer.RowDimList[i].DimensionName == paras.analyzer.RowDimList[paras.colIndex].DimensionName) {
                return true;
            }
        }
        return false;
    }

    function isExistsInLevels(paras, levels, rowIndex, start) {
        if (paras.analyzer.RowDimList[rowIndex].DimensionName == paras.analyzer.RowDimList[paras.colIndex].DimensionName) {
            for (var i = start; i < levels.length; i++) {
                if (paras.analyzer.RowDimList[rowIndex].LevelName == levels[i]) {
                    return true;
                }
            }
        }
        return false;
    }


    function getRootPath() {
        var strFullPath = window.document.location.href;
        var strPath = window.document.location.pathname;
        var pos = strFullPath.indexOf(strPath);
        var prePath = strFullPath.substring(0, pos);
        var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
        return prePath + postPath;
    }

    function jsonToString(obj) {
        switch (typeof (obj)) {
            case 'string':
                return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';
            case 'array':
                return '[' + obj.map(jsonToString).join(',') + ']';
            case 'object':
                if (obj instanceof Array) {
                    var strArr = [];
                    var len = obj.length;
                    for (var i = 0; i < len; i++) {
                        strArr.push(jsonToString(obj[i]));
                    }
                    return '[' + strArr.join(',') + ']';
                } else if (obj == null) {
                    return 'null';

                } else {
                    var string = [];
                    for (var property in obj) string.push(jsonToString(property) + ':' + jsonToString(obj[property]));
                    return '{' + string.join(',') + '}';
                }
            case 'number':
                return obj;
            default:
                return obj;
        }
    }



})(jQuery);

//计算列
(function ($) {
    var methods = {
        init: function (settings) {
            var paras = $.extend({
                calculators: [],
                analyzer: null,
                measure: null,
                confirm: function (mea) { }
            }, settings);
            if (paras.analyzer != null) {
                paras.calculators = [];
                $(paras.analyzer.MeasureList).each(function () {
                    if (this.MeasureType != 7) {
                        paras.calculators.push(this.DisplayName);
                    }
                });
            }
            var $calDiv = getCalcuColDiv();
            $("#mlForCal", $calDiv).empty();
            $("#meaName", $calDiv).val("");
            $("#inputForCal", $calDiv).empty();
            if (paras.measure != null) {
                $("#meaName", $calDiv).val(paras.measure.DisplayName);
                $("#inputForCal", $calDiv).val(paras.measure.Formula);
            }
            for (i = 0; i < paras.calculators.length; i++) {
                $("#mlForCal", $calDiv).append("<li style='width:100%'><button style='width:100%;text-align:left'>" + "<" + (i + 1) + "> [" + paras.calculators[i] + "]</button></li>");
            }
            $("#mlForCal button", $calDiv).button();
            $("#operatorReg button", $calDiv).button();
            $("#operatorReg button", $calDiv).each(function () {
                $(this).click(function () {
                    $("#inputForCal", $calDiv).focus();
                    $("#inputForCal", $calDiv).insertAtCaret(" " + $.trim($(this).text()) + " ");
                });
            });
            $("#mlForCal button", $calDiv).each(function () {
                $(this).click(function () {
                    $("#inputForCal", $calDiv).focus();
                    var txt = $.trim($(this).text());
                    $("#inputForCal", $calDiv).insertAtCaret(" " + txt.substring(txt.indexOf(" ") + 1) + " ");
                });
            });
            $calDiv.dialog({
                minWidth: 800,
                minHeight: 300,
                autoOpen: true,
                modal: true,
                buttons: {
                    "确定": function () {
                        var mea = getCustomMeasure($calDiv);
                        if (mea != null) {
                            $(this).dialog('close');
                            paras.confirm(mea);
                        }
                    },
                    "取消": function () {
                        $(this).dialog('close');
                        //                        $("#meaName", $calDiv).val("");
                        //                        $("#inputForCal", $calDiv).text("");
                    }
                }
            });
            $calDiv.dialog('open');
            $("#inputForCal", $calDiv).focus();
            $("#inputForCal", $calDiv).focus(function () {
                $("#errorTipForCal", $calDiv).empty();
            });
        },
        getMeasure: function () {
            var mm = $(">html>body").data("meaobj");
            return mm;
        }
    };
    $.fn.formulaedit = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method' + method + 'does not exist on jQuery.CA.FormulaEdit');
        }
    };

    function getCustomMeasure($calDiv) {
        if ($.trim($("#inputForCal", $calDiv).val()) === "") {
            $("#errorTipForCal").text("请输入公式")
        }
        else if ($("#mlForCal button", $calDiv).length <= 0) {
            $("#errorTipForCal", $calDiv).text("基础指标为空！")
        }
        else {
            if (isCalMatching($("#inputForCal", $calDiv).val())) {
                var displayName = $.trim($("#meaName", $calDiv).val());
                if (displayName === "") {
                    $("#errorTipForCal", $calDiv).text("请输入指标名称！")
                }
                else {
                    var meaobj = {
                        ID: "", DisplayName: displayName, MeasureType: 7,
                        Decimal: parseInt($("#ddlCalcColDecimal").val()), Formula: $("#inputForCal", $calDiv).val(), Unit: ""
                    };
                    $(">html>body").data("meaobj", meaobj);
                    return meaobj;
                }
            }
            else {
                $("#errorTipForCal").text("公式错误！")
            }
        }
        return null;
    }

    //正则匹配计算列配置中的用户输入 
    //创建标识：lyh 20120323
    function isCalMatching(userInput) {
        var ml = $("#mlForCal button");
        var input = userInput;
        for (i = 0; i < ml.length; i++) {
            var temp = '\\' + $(ml[i]).text().substring($(ml[i]).text().indexOf('['), $(ml[i]).text().indexOf(']')) + '\\]';
            mex = eval('/' + temp + '/g');
            if (mex.test(userInput)) {
                input = input.replace(mex, $(ml[i]).text().substring(0, 3));
            }
        }
        var userInput_cg = $.trim(input.replace(/\s/g, ""));
        //初步检验 排除有其他字符出现
        if (/[^\(\)0-9<>\-\+\*\/\.]/.test(userInput_cg))
            return false;
        //初始化正则匹配公式
        var regx;
        var meaCount = $("#mlForCal button").length;
        var firstDigit = meaCount;
        var secondDigit = "";
        if (meaCount > 10) {
            firstDigit = meaCount / 10 + "";
            secondDigit = meaCount % 10 + "";
        }
        var meaFlag = "[0-9]*[1-9][0-9]*";
        regx = eval("/^((~|<" + meaFlag + ">)|([0-9]+\\.[0-9]*)?[1-9][0-9]*)([\\+\\-\\*\\/]((~|<"
            + meaFlag + ">)|([0-9]+\\.[0-9]*)?[1-9][0-9]*))*$/");
        //检验嵌套括号内的内容
        var stack = new Stack();
        var uiArray = userInput_cg.split('');
        for (i = 0; i < uiArray.length; i++) {
            stack.Push(uiArray[i]);
            if (uiArray[i] === ')') {
                var part = new Array();
                var count = stack.GetSize();
                for (m = 0; m < count; m++) {
                    var pop = stack.Pop();
                    part.push(pop);
                    if (pop === "(")
                        break;
                    else {
                        if (stack.GetSize() == 0) {
                            return false;
                        }
                    }
                }
                stack.Push("~");
                part = (part.reverse()).toString().replace(/,/g, "").replace("(", "").replace(")", "");
                if (regx.test(part) == false)
                    return false;
            }
        }
        //检验最终字符串
        var finalStr = stack.toString();
        return regx.test(finalStr);
    }

    function getRootPath() {
        var strFullPath = window.document.location.href;
        var strPath = window.document.location.pathname;
        var pos = strFullPath.indexOf(strPath);
        var prePath = strFullPath.substring(0, pos);
        var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
        return prePath + postPath;
    }

    function jsonToString(obj) {
        var THIS = this;
        switch (typeof (obj)) {
            case 'string':
                return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';
            case 'array':
                return '[' + obj.map(jsonToString).join(',') + ']';
            case 'object':
                if (obj instanceof Array) {
                    var strArr = [];
                    var len = obj.length;
                    for (var i = 0; i < len; i++) {
                        strArr.push(jsonToString(obj[i]));
                    }
                    return '[' + strArr.join(',') + ']';
                } else if (obj == null) {
                    return 'null';

                } else {
                    var string = [];
                    for (var property in obj) string.push(jsonToString(property) + ':' + jsonToString(obj[property]));
                    return '{' + string.join(',') + '}';
                }
            case 'number':
                return obj;
            default:
                return obj;
        }
    }

    function Stack() {
        var aElement = new Array();
        Stack.prototype.Push = function (vElement) {
            if (arguments.length == 0)
                return -1;
            for (var i = 0; i < arguments.length; i++) {
                aElement.push(arguments[i]);
            }
            return aElement.length;
        }
        Stack.prototype.Pop = function () {
            if (aElement.length == 0)
                return null;
            else
                return aElement.pop();
        }
        Stack.prototype.GetSize = function () {
            return aElement.length;
        }
        Stack.prototype.GetTop = function () {
            if (aElement.length == 0)
                return null;
            else
                return aElement[aElement.length - 1];
        }
        Stack.prototype.MakeEmpty = function () {
            aElement.length = 0;
        }
        Stack.prototype.IsEmpty = function () {
            if (aElement.length == 0)
                return true;
            else
                return false;
        }
        Stack.prototype.toString = function () {
            var sResult = aElement.toString();
            return sResult.replace(/,/g, "");
        }
    }

    function getCalcuColDiv() {
        var calDiv = $(">html>body>#meaCalculator");
        if (calDiv.length == 0) {
            calDiv = $("<div id='meaCalculator' title='计算列设置' style='display:none;'></div>");
            calDiv.append($("<table style='width:100%;height:100%'><tr><td rowspan='4' style='width:40%;height:100%' valign='top'><table style='width:100%;text-align:left;height:100%'><tr><td style='width:60px'>指标名：</td><td><input type='text' id='meaName' style='width:160px;'/></td></tr><tr><td>小数位：</td><td><select id='ddlCalcColDecimal'><option value='0'>0</option><option value='1'>1</option><option value='2'>2</option><option value='3' selected='selected'>3</option><option value='4'>4</option><option value='5'>5</option></select></td></tr><tr><td colspan='2'>基础指标（计算因子）：</td></tr><tr><td valign='top'colspan='2'><div style='float:left;width:80%;margin-left:0;' class='jstree-drop'><ul id='mlForCal' style='width:100%;list-style-type:none;margin-left:0;'></ul></div></td></tr></table></td><td><table id='operatorReg' style='width:100%;height:100%'><tr style='height:30%;text-align:center;vertical-align:top'><td style='width:16.6%'><button style='width:100%'>(</button></td><td style='width:16.6%'><button style='width:100%'>)</button></td><td style='width:16.6%'><button style='width:100%'>+</button></td><td style='width:16.6%'><button style='width:100%'>-</button></td><td style='width:16.6%;'><button style='width:100%;'>*</button></td><td style='width:16.6%'><button style='width:100%'>/</button></td></tr></table></td></tr><tr style='height:10%'><td></td></tr><tr style='height:70%'><td colspan='4'><textarea rows='10' style='width:100%;height:100%;overflow:hidden' id='inputForCal'></textarea></td></tr><tr style='height:10%'><td><label id='errorTipForCal' style='color:red'></label></td></tr></table>"));
            $(">html>body").append(calDiv);
        }
        return calDiv;
    }

})(jQuery);

jQuery.extend({
    /** 
    * 清除当前选择内容 
    */
    unselectContents: function () {
        if (window.getSelection)
            window.getSelection().removeAllRanges();
        else if (document.selection)
            document.selection.empty();
    }
});
jQuery.fn.extend({
    /** 
    * 选中内容 
    */
    selectContents: function () {
        $(this).each(function (i) {
            var node = this;
            var selection, range, doc, win;
            if ((doc = node.ownerDocument) &&
                 (win = doc.defaultView) &&
                typeof win.getSelection != 'undefined' &&
                typeof doc.createRange != 'undefined' &&
                 (selection = window.getSelection()) &&
                typeof selection.removeAllRanges != 'undefined') {
                range = doc.createRange();
                range.selectNode(node);
                if (i == 0) {
                    selection.removeAllRanges();
                }
                selection.addRange(range);
            }
            else if (document.body &&
                     typeof document.body.createTextRange != 'undefined' &&
                      (range = document.body.createTextRange())) {
                range.moveToElementText(node);
                range.select();
            }
        });
    },
    /** 
    * 初始化对象以支持光标处插入内容 
    */
    setCaret: function () {
        if ($.support.cssFloat) return;
        var initSetCaret = function () {
            var textObj = $(this).get(0);
            textObj.caretPos = document.selection.createRange().duplicate();
        };
        $(this)
         .click(initSetCaret)
         .select(initSetCaret)
         .keyup(initSetCaret);
    },
    /** 
    * 在当前对象光标处插入指定的内容 
    */
    insertAtCaret: function (textFeildValue) {
        var textObj = $(this).get(0);
        if (document.all && textObj.createTextRange && textObj.caretPos) {
            var caretPos = textObj.caretPos;
            caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == '' ?
                                textFeildValue + '' : textFeildValue;
        }
        else if (textObj.setSelectionRange) {
            var rangeStart = textObj.selectionStart;
            var rangeEnd = textObj.selectionEnd;
            var tempStr1 = textObj.value.substring(0, rangeStart);
            var tempStr2 = textObj.value.substring(rangeEnd);
            textObj.value = tempStr1 + textFeildValue + tempStr2;
            textObj.focus();
            var len = textFeildValue.length;
            textObj.setSelectionRange(rangeStart + len, rangeStart + len);
            //textObj.blur();
        }
        else {
            textObj.value += textFeildValue;
        }
    }
});