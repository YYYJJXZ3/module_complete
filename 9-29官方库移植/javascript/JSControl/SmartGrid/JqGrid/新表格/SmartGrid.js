(function ($, undefined) {
    $.fn.extend({
        drag: function () {
            var $_this = this,
                lenth = this.find("div[role='w']").length,
                $_height = this.find("div[role='w']").eq(lenth > 1 ? length - 2 : 0).height(),
                $_top = this.find("div[role='w']").eq(lenth > 1 ? length - 2 : 0).position().top
            this.find("div[role='drag']")
                .each(function (i, item) {
                    var th_width = $(this).parent().width(), $_left = 0;
                    $(this).mousedown(function (de) {
                        var $_obj = $(this);
                        var _p = toolsSmart.getMousePos(de);
                        $_left = _p.x;
                        $_obj.css({
                            height: $_height,
                            top: $_top,
                            left: _p.x
                        }).removeClass("drag").addClass("drag_d");

                        $_this.mousemove(function (em) {
                            $_obj.css({
                                left: toolsSmart.getMousePos(em).x
                            });
                            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                        });
                    }).mouseup(function (em) {
                        $_this.unbind();
                        var _p = toolsSmart.getMousePos(em),
                             $_width = $_this.find("table").eq(0).width();
                        var _width = _p.x - $_left;
                        if (th_width + _width < 30) {
                            _width = th_width - 30;
                            th_width = 30;
                        }
                        else {
                            th_width = th_width + _width;
                        }
                        $(this).
                           removeClass("drag_d").
                           addClass("drag")
                           .css({
                               height: "100%",
                               top: "",
                               left: ""
                           });
                        var rowindex = $(this).parent().attr("colindex");
                        $_this.find("table").each(function () {
                            if ($(this).find("colgroup col").length > rowindex) {
                                $(this).find("colgroup col").eq(rowindex).css({
                                    width: th_width
                                });
                            }
                        });
                        $_this.find("table").css({
                            width: $_width + _width
                        });
                        if ($_this.find("table").length > 1) {
                            $_this.find("table").eq(1).parent().css({
                                width: $_width + _width
                            });
                        }
                    });
                });
        }
    });
    var toolsSmart = {
        getMousePos: function (event) {
            var e = event || window.event;
            var scrollX = document.documentElement.scrollLeft
                || document.body.scrollLeft;
            var scrollY = document.documentElement.scrollTop
                || document.body.scrollTop;
            var x = e.pageX || e.clientX + scrollX;
            var y = e.pageY || e.clientY + scrollY;
            return { 'x': x, 'y': y };
        }
    };
})(jQuery);
(function ($, undefined) {
    $.fn.smartgrid = function (option) {
        if (init[option]) {
            return init[option].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof option === 'object' || !option) {
            return init.smartgridInit.apply(this, arguments);
        }
        else {
            $.error('Method' + option + 'does not exist on jQuery.smartgrid');
        }
    }
    $.fn.extend({
        getCell: function (rowindex, cokindex) {
            if (this.find("tr").length > rowindex) {
                if (this.find("tr").eq(rowindex).find("td").length > cokindex) {
                    return this.find("tr").eq(rowindex).find("td").eq(cokindex).text();
                }
            }
            return "";
        },
        setCell: function (rowindex, cokindex, html) {
            if (this.find("tr").length > rowindex) {
                if (this.find("tr").eq(rowindex).find("td").length > cokindex) {
                    this.find("tr").eq(rowindex).find("td").eq(cokindex).html(html);
                }
            }
        },
        setGridParam: function (option) {
            if (option && typeof option == 'object') {
                if (!this.p) {
                    this.p = option;
                }
                else {
                    $.extend(true, this.p, option)
                }
            }
        },
        getGridParam: function (keyName) {
            if (!keyName) {
                return "";
            }
            if (!this.p) {
                return;
            }
            if (!this.p[keyName]) {
                return "";
            }
            return this.p[keyName];
        },
        setGridHeight: function () { }
    });
    var init = {
        smartgridInit: function (option) {
            var _This = this;
            option = p_method.getOption(option);//初始化参数
            this.addClass(option.className).attr({
                "downDataType": "down"
            });
            var _width = toolsSmart.getWidth(_This);
            this.css({
                width: _width
            });
            if (option.width == 0) {
                option.width = _width;
            }
            if (option.dataFrom.Local != true) {
                p_method.initData(option, _This); //初始化数据
            }
            else {
                p_method.initGrid(option, _This);
            }
        },
        getDatasource: function () {
            var _obj = this.data("datalocalsource");
            if (_obj && _obj.localdata) {
                return _obj.localdata;
            }
            return {};
        },
        reLoad: function () {
            var _obj = this.data("datalocalsource");
            if (_obj) {
                p_method.initGrid(_obj, this);
            }
        }
    };
    var p_method = {
        getOption: function (option) {
            options = $.extend(true, {
                captionName: "",
                showrownum: false,
                formatFlowValue: "1",
                rownumwidth: 35,
                width: 0,
                height: -1,
                islocaldata: false,
                localdata: {},
                ispaging: true,
                isresize: true,
                analyzer: null,
                analyzerpath: "",
                isAutoFill: false,
                modal: true,
                className: 'dsstable',
                col: {
                    sort: true,
                    names: [],
                    poperty: [],
                    property: []
                },
                //分页属性
                paging: {
                    num: 1,
                    rowNum: 10,
                    rowList: [10, 15, 20, 30, 50],
                    showRowNum: true,
                    pginput: true,
                    pgbuttons: true,
                    showrecords: true,
                    pagEvent: 0
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
                    param1:null,
                    param2:null,
                    iscache: false,
                    cache: false
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
                    defaultShow: false
                },
                //事件
                callback: {
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
                    width: 40
                },
                orgData: {
                    colNames: []
                },
                displayRules: []
            }, option);
            if (toolsSmart.isFunction(options.callback.onPaging)) {
                options.paging.pagEvent = 1;
                if (options.localdata.page && options.localdata.page > 0) {
                    options.paging.num = options.localdata.page;
                }
            }
            if (!toolsSmart.isNullOrEmpty(option.paging)) {
                if (!toolsSmart.isNullOrEmpty(option.paging.rowList) && option.paging.rowList.length > 0) {
                    options.paging.rowList = option.paging.rowList;
                }
            }
            if (options.col.poperty.length > 0) {
                if (options.col.property.length == 0) {
                    options.col.property = options.col.poperty;
                }
            }
            if (options.sort.colindex > -1) {
                options.sort.order = (options.sort.order == "asc" ? 1 : 2);
            }
            if (options.sort.colindex2 > -1) {
                options.sort.order2 = (options.sort.order2 == "asc" ? 1 : 2);
            }

            //判断数据来源
            if (!toolsSmart.isNullOrEmpty(options.analyzer) &&
               typeof options.analyzer == 'object') {
                options.dataFrom.Analyzer = true;
                options.dataFrom.TSql = false;
                options.dataFrom.Local = false;
                options.ajax.sqlstr = options.analyzer;
                if (!toolsSmart.isNullOrEmpty(options.analyzerpath)) {
                    options.ajax.path = options.analyzerpath;
                }
                else {
                    options.ajax.path = toolsSmart.getAppRootPath() + "javascript/JSControl/SmartGrid/Handler/JqGridAnalyzer.ashx";
                }
            }
            else if (!toolsSmart.isNullOrEmpty(options.ajax.sqlstr)) {
                options.dataFrom.Analyzer = false;
                options.dataFrom.TSql = true;
                options.dataFrom.Local = false;
                if (toolsSmart.isNullOrEmpty(options.ajax.path)) {
                    options.ajax.path = toolsSmart.getAppRootPath() + "javascript/JSControl/SmartGrid/Handler/JqGridData.ashx";
                }
            }
            else {
                options.localdata["isTotal"] = 0;
                options.dataFrom.Analyzer = false;
                options.dataFrom.TSql = false;
                options.dataFrom.Local = true;
                if (!options.localdata.records) {
                    options.localdata.records = options.localdata.rows.length;
                }
                else if (options.localdata.records < options.localdata.rows.length) {
                    options.localdata.records = options.localdata.rows.length;
                }
            }

            if (!options.toolbar.defaultShow) {
                if (!toolsSmart.isNullOrEmpty(options.captionName)) {
                    options.toolbar.defaultShow = true;
                    if (options.dataFrom.Analyzer) {
                        if (toolsSmart.isNullOrEmpty(options.analyzer.MeasureList)) {
                            options.toolbar.notShow.push("measel");
                            options.toolbar.notShow.push("filter");
                        }
                    }
                    else {
                        options.toolbar.notShow.push("measel");
                        options.toolbar.notShow.push("filter");
                    }
                }
            }
            return options;
        },
        initData: function (option, obj) {
            var one = option.dataFrom.TSql ? option.ajax.sqlstr : toolsSmart.jsonToString(option.ajax.sqlstr),
                 count = 0;
            if (option.finalSet) {
                if (option.finalSet.bindData) {
                    if (option.finalSet.bindData.records) {
                        count = option.finalSet.bindData.records;
                    }
                }
            }
            $.ajax({
                url: option.ajax.path,
                cache: option.ajax.cache,
                type: "post",
                dataType: "json",
                data: {
                    one: one,
                    two: option.ajax.connstr,
                    pagenum: option.paging.num,
                    pagerows: option.paging.rowNum,
                    formatFlowValue: option.formatFlowValue,
                    sortcol: option.sort.colindex,
                    sortorder: (option.sort.order == 1 ? "asc" : "desc"),
                    sortcol2: option.sort.colindex2,
                    iscache: option.ajax.iscache,
                    listid: toolsSmart.request("listid"),
                    record: count
                },
                beforeSend: function () {
                    if (option.modal) {
                        toolsSmart.load(true);
                    }
                },
                complete: function () {
                    if (option.modal) {
                        toolsSmart.load(false);
                    }
                },
                success: function (datasource) {
                    if (datasource.status == "0") {
                    	var binddata;
                    	if(datasource.data.dataSource!=null){
                    		var newBindData = datasource.data.dataSource;
                    		binddata = {colnames:newBindData.colNames,rows:[],isTotal:-1,records:0};
                    		for(var i=0;i<newBindData.rows.length;i++){
                    			var row = {};
                    			for(var j=0;j<newBindData.rows[i].cells.length;j++){
                    				row["col"+j] = newBindData.rows[i].cells[j];
                    			}
                    			binddata.rows.push(row);
                    		}
                    		if(newBindData.totalCount>0){
                    			binddata.isTotal = 0;
                    			binddata.records = newBindData.totalCount;
                    		}
                    	}
                    	else{
                    		binddata = eval('(' + datasource.data.Source + ')');
                    	}
                        option.localdata = binddata;
                        if (option.dataFrom.Analyzer) {
                        	if(datasource.data.ReturnParam!=null){
                        		option.analyzer = eval('(' + datasource.data.ReturnParam + ')');
                        		option.ajax.sqlstr = option.analyzer;
                        	}
                        }
                        else if (option.dataFrom.TSql) {
                            option.ajax.retSql = datasource.data.ReturnParam;
                        }
                        p_method.initGrid(option, obj);
                        if (binddata.isTotal == -1) {
                            p_method.initCount(option, one, obj);
                        }
                    }
                    else {
                        console.log(datasource.data);
                    }
                }
            });
        },
        initCount: function (option, one, obj) {
            $.ajax({
                cache: option.ajax.cache,
                type: "post",
                url: option.ajax.path,
                dataType: "json",
                data: {
                    one: one,
                    two: option.ajax.connstr,
                    pagerows: option.paging.rowNum,
                    iscount: '1',
                    iscache: option.ajax.iscache
                },
                success: function (datasource) {
                    if (datasource.status == 0) {
                        option.localdata.records = datasource.data.Count;
                        option.localdata.isTotal = 0;
                        pageHandler.init(option, $("#" + option.finalSet.pageid), obj);
                    }
                    else {
                        console.log(datasource.data);
                    }
                }
            });
        },
        initGrid: function (option, obj) {
            if (!option.localdata ||
                typeof option.localdata != 'object' ||
                !option.localdata.colnames) {
                console.log("数据源有问题，请检查数据源，数据源为" + option.localdata);
                return;
            }
            p_method.setDownLoad(option, obj);
            option.orgData.colNames = option.localdata.colnames;
            p_method.createFinalSet(option, obj);
            toolsSmart.getAvgWidth(option);//求平均宽度
            p_method.initShow(option, obj);
        },
        initShow: function (option, obj) {
            obj.empty().unbind().data("datalocalsource", option);;
            var toolPage = $("<div></div>").appendTo(obj).css({
                width: option.width - 1
            }).attr({
                id: option.finalSet.headid,
                "class": 'dss_tb_title',
                role: 'w'
            }),
            _width = toolsSmart.getSumWidth(option),
            tbPage = $("<div></div>").appendTo(obj).css({
                width: (toolsSmart.isIE() ? option.width + 4 : option.width + 12),
                "overflow-x": "auto"
            }).attr({
                "id": option.finalSet.gridid,
                role: 'w'
            }),
            tbfoot = $("<div></div>").appendTo(obj).css({
                width: option.width - 1
            }).attr({
                "id": option.finalSet.pageid,
                role: 'w'
            });
            if (option.toolbar.defaultShow) {
                toolbar.init(option, toolPage, obj);
            }
            else {
                toolPage.remove();
            }
            if (option.height != "-1") {
                tableHandler.initHeight(option, tbPage, obj, _width);

            } else {
                tableHandler.init(option, tbPage, obj, _width);
            }
            if (option.ispaging) {
                pageHandler.init(option, tbfoot, obj);
            }
            else {
                tbfoot.remove();
            }
        },
        createFinalSet: function (option, obj) {
            var result = {};
            result["originalid"] = obj[0].id;
            result["gridid"] = result.originalid + "db";
            result["headid"] = result.originalid + "th";
            result["pageid"] = result.originalid + "tp";
            result["bindData"] = option.localdata;
            var level = 1;
            result["colHeaderSet"] = [];
            var colindex = 0, isSort = option.col.sort;
            if (option.showrownum) {
                var _opt = toolsSmart.getColPro(option.col.property,
                    option.localdata.colnames,
                    colindex,
                    true,
                    false,
                    colindex,
                    isSort,
                    option.sort);
                _opt.width = _opt.width <= 0 ? option.rownumwidth : _opt.width;
                _opt.showrownum = true;
                result.colHeaderSet.push(_opt);
                colindex++;
            }
            if (option.mulCheck.ismulCheck) {
                var _opt = toolsSmart.getColPro(option.col.property,
                    option.localdata.colnames,
                    colindex,
                    false,
                    true,
                    colindex,
                    isSort,
                    option.sort);
                _opt.width = _opt.width <= 0 ? option.mulCheck.width : _opt.width;
                _opt.check = true;
                result.colHeaderSet.push(_opt);
                colindex++;
            }
            for (var i = 0; i < option.localdata.colnames.length; i++) {
                var _opt = toolsSmart.getColPro(option.col.property,
                    option.localdata.colnames,
                    i + colindex,
                    false,
                    false,
                    colindex,
                    isSort,
                    option.sort);
                if (_opt.names.length > level) {
                    level = _opt.names.length;
                }
                result.colHeaderSet.push(_opt);
            }
            if (level > 1) {
                for (var i = 0; i < result.colHeaderSet.length; i++) {
                    var _l = result.colHeaderSet[i].names.length
                    if (_l < level) {
                        for (var j = _l; j < level; j++) {
                            result.colHeaderSet[i].names.push(result.colHeaderSet[i].names[_l - 1]);
                        }
                    }
                }
            }
            result["level"] = level;
            option.finalSet = result;
        },
        setDownLoad: function (option, obj) {
            var downDataSource = {
                sql: null,
                conn: null,
                source: null,
                analyzer: null,
                titleName: ""
            };

            if (option.dataFrom.Analyzer) {
                downDataSource.analyzer = option.analyzer;
            }
            else if (option.dataFrom.TSql) {
                downDataSource.sql = option.ajax.retSql;
                downDataSource.conn = option.ajax.connstr;
            }
            else {
                downDataSource.source = option.localdata;
            }
            downDataSource.titleName = option.captionName;
            obj.data("downDataSource", downDataSource);
        }
    };


    var tableHandler = {
        init: function (option, tbpage, obj, _width) {
            var table = $("<table></table>").appendTo(tbpage)
                .css({
                    width: (_width < option.width + 2 ? option.width + 2 : _width)
                }),
                colgroup = $("<colgroup></colgroup>").appendTo(table);
            thead = $("<thead></thead>").appendTo(table),
            tbody = $("<tbody></tbody>").appendTo(table);
            if (!option.toolbar.defaultShow) {
                table.css({
                    "margin-top": "-1px"
                });
            }
            tableHandler.createHeader(option.finalSet, thead, obj, option);
            tableHandler.createCol(colgroup, option.finalSet.colHeaderSet);
            tableHandler.createTable(thead, option, obj, tbody);
        },
        initHeight: function (option, tbpage, obj, _width) {
            var tableH = $("<table></table>")
                .appendTo(tbpage)
                .css({
                    width: (_width < option.width + 2 ? option.width + 2 : _width)
                }),
                pageCon = $("<div class='tbpage'></div>").css({
                    width: (_width < option.width + 2 ? option.width + 2 : _width + option.finalSet.colHeaderSet.length)
                }).appendTo(tbpage),
                table = $("<table></table>")
                .appendTo(pageCon)
                .css({
                    width: (_width < option.width + 2 ? option.width + 2 : _width),
                    "margin-top": "-1px"
                }),
                colgroup = $("<colgroup></colgroup>").appendTo(table),
                colSgroup = null,
                thead = $("<thead></thead>").appendTo(tableH),
                tbody = $("<tbody></tbody>").appendTo(table);
            if (!option.toolbar.defaultShow) {
                table.css({
                    "margin-top": "-1px"
                });
            }
            tableHandler.createCol(colgroup, option.finalSet.colHeaderSet);
            colSgroup = colgroup.clone();
            thead.before(colSgroup);
            tableHandler.createHeader(option.finalSet, thead, obj, option);
            tableHandler.createTable(thead, option, obj, tbody);
            if (option.height > 0) {
                if (option.height > (tableH.height() + 30)) {
                    pageCon.css({
                        height: (option.height - 30 - tableH.height())
                    });
                }
            }
        },
        createTable: function (thead, option, obj, tbody) {
            var start = (option.paging.num - 1) * option.paging.rowNum,
               end = option.paging.num * option.paging.rowNum;
            if (option.dataFrom.Local) {
                if (end > option.finalSet.bindData.records) {
                    end = option.finalSet.bindData.records;
                }
            }
            else {
                end = start + option.finalSet.bindData.rows.length;
            }
            if (option.paging.pagEvent == 1) {
                start = 0;
                end = option.finalSet.bindData.rows.length > option.paging.rowNum ? option.paging.rowNum : option.finalSet.bindData.rows.length;
            }
            for (var i = start; i <= end; i++) {
                var tr, rowindex = i;
                if (!option.dataFrom.Local) {
                    rowindex = i - start;
                }
                if (i == start) {
                    tr = tableHandler.createRow(option.finalSet,
                        i,
                        null,
                        true,
                        i, option);
                }
                else {
                    var rowData = option.finalSet.bindData.rows.length > (rowindex - 1) ? option.finalSet.bindData.rows[rowindex - 1] : {};
                    tr = tableHandler.createRow(option.finalSet,
                        rowindex,
                        rowData,
                        false,
                        i, option);
                    if (toolsSmart.isFunction(option.callback.onClickRow)) {
                        (function (rindex) {
                            tr.bind("click", function () {
                                option.callback.onClickRow(rindex, toolsSmart.getRows(option.finalSet.bindData.rows[rindex - 1]));
                            });
                        })(rowindex);
                    }
                    else {
                        if (toolsSmart.isFunction(option.callback.beforeSelectRow)) {
                            (function (rindex) {
                                tr.bind("click", function () {
                                    option.callback.beforeSelectRow(rindex, toolsSmart.getRows(option.finalSet.bindData.rows[rindex - 1]));
                                });
                            })(rowindex)
                        }
                    }

                    if (toolsSmart.isFunction(option.callback.onRightClickRow)) {
                        (function (rindex) {
                            tr.bind("contextmenu", function (e) {
                                if (3 == e.which) {
                                    e.preventDefault();
                                    setTimeout(function () {
                                        var pindex = parseInt($(e.target).attr("colindex"));
                                        pindex = pindex - toolsSmart.getCountCol(option);
                                        option.callback.onRightClickRow(rindex, pindex,
                                            toolsSmart.getRows(option.finalSet.bindData.rows[rindex - 1]), e);
                                    }, 100);
                                }
                                return false;
                            });

                        })(rowindex);
                    }
                }

                tbody.append(tr);
            }
            if (toolsSmart.getWidth(obj) < option.width) {
                var _border = parseInt(obj.css('border-left-width')) * 2 || 4;
                toolsSmart.setSecondWidth(obj, toolsSmart.getWidth(obj) - _border, option);
            }
            if (option.isresize) {
                setTimeout(function () { obj.drag(); }, 500);
            }

            if (option.finalSet) {
                tbody.setGridParam({
                    "colNames": option.finalSet.colNames,
                    page: option.paging.num,
                    rowNum: option.paging.rowNum,
                    records: option.localdata.records,
                });
            }
            if (toolsSmart.isFunction(option.callback.gridComplete)) {
                option.callback.gridComplete(tbody, option);
            }
        },
        createRow: function (option, index, rows, flag, realIndex, objOpt) {
            var tr = $("<tr></tr>"), rowdata = [];
            if (!toolsSmart.isEmptyObject(rows)) {
                for (var i in rows) {
                    rowdata.push(rows[i]);
                }
            }
            if (flag) {
                tr.hide();
                $.each(option.colHeaderSet, function (i, item) {
                    var td = $("<td></td>").attr({
                        colindex: i
                    }).appendTo(tr);
                    if (item.hidden) {
                        td.css("display", "none");
                    }
                });
            }
            else {
                var colindex = 0;
                $.each(option.colHeaderSet, function (i, item) {
                    var td = $("<td></td>").attr({
                        colindex: i
                    }).appendTo(tr);
                    if (!toolsSmart.isEmptyObject(rows)) {
                        if (item.showrownum) {
                            td.text(realIndex).attr({
                                align: item.align
                            });
                            if (!toolsSmart.isNullOrEmpty(item.fontcolor)) {
                                td.css("color", item.fontcolor);
                            }

                            if (typeof item.addclick == 'function') {
                                (function (rowindex) {
                                    td.click(function () {
                                        item.addclick(index, rowindex, rowdata);
                                    });
                                })(i);
                            }
                            colindex++;
                        }
                        else if (item.check) {
                            td.attr({
                                align: item.align
                            });
                            $("<input type='checkbox'/>").change(function () {
                                var _objck = $(this);
                                if (typeof objOpt.callback.onMulCheck == 'function') {
                                    (function (rowindex) {
                                        objOpt.callback.onMulCheck(rowindex, rowdata, _objck.is(":checked"));
                                    })(i);
                                }
                            }).appendTo(td);
                            if (typeof item.addclick == 'function') {
                                (function (rowindex) {
                                    td.click(function () {
                                        item.addclick(index, rowindex, rowdata);
                                    });
                                })(i);
                            }
                            colindex++;
                        }
                        else {
                            var data = rows["col" + (i - colindex)] == undefined ? "" : rows["col" + (i - colindex)];
                            if (typeof item.rowDataBind == 'function') {
                                rows["col" + (i - colindex)] = data;
                                data = item.rowDataBind(tr, td, data, rows);
                            }
                            td.attr({
                                align: item.align
                            });

                            if (item.hidden) {
                                td.css("display", "none");
                            }
                            if (!toolsSmart.isNullOrEmpty(item.fontcolor)) {
                                td.css("color", item.fontcolor);
                            }
                            if (typeof item.addclick == 'function') {
                                (function (rowindex) {
                                    td.click(function () {
                                        item.addclick(index, rowindex, rowdata);
                                    }).css("cursor", "pointer");
                                })(i);
                            }
                            td.html(data).attr("title", data);
                        }
                    }
                    else {
                        if (item.hidden) {
                            td.css("display", "none");
                        }
                    }
                });
            }
            if ((index - 1) % 2 == 1) {
                tr.addClass("a");
            }
            else {
                tr.addClass("b");
            }
            return tr;
        },
        createCol: function (cols, colHeadSet) {
            for (var i = 0; i < colHeadSet.length; i++) {
                if (!colHeadSet[i].hidden) {
                    $("<col/></col>").css("width", colHeadSet[i].width).appendTo(cols);
                }
            }
        },
        //生成表头
        createHeader: function (option, thead, obj, sumOption) {
            if (option.level == 1) {
                var tr = $("<tr></tr>").appendTo(thead), colindex = 0;
                for (var j = 0; j < option.colHeaderSet.length; j++) {
                    var th = $("<th></th>")
                        .attr({
                            "role": "w",
                            "rowindex": j
                        }).appendTo(tr),
                        span = $("<span>" + option.colHeaderSet[j].names[0] + "</span>").appendTo(th),
                        i = $("<i>&nbsp;</i>").appendTo(span);
                    $("<div class=\"drag\" role=\"drag\">&nbsp;</div>").appendTo(th);

                    if (option.colHeaderSet[j].sort > -1) {
                        tableHandler.setSort(option.colHeaderSet,
                            j, span, i, option, obj, sumOption);
                    }
                    if (option.colHeaderSet[j].hidden) {
                        th.hide();
                    }
                    else {
                        th.attr("colindex", colindex);
                        colindex++;
                    }
                }
            }
            else {
                for (var i = 0; i < option.level; i++) {
                    var tr = $("<tr></tr>"), colindex = 0;
                    for (var j = 0; j < option.colHeaderSet.length; j++) {
                        var col = tableHandler.isColSpan(option.colHeaderSet[j].names[i],
                            option.colHeaderSet, j, i),
                            row = tableHandler.isRowSpan(option.colHeaderSet[j].names[i],
                            option.colHeaderSet, j, i);
                        if (col > 0 && row > 0) {
                            var th = $("<th></th>").appendTo(tr),
                                span = $("<span>" + option.colHeaderSet[j].names[i] + "</span>").appendTo(th),
                                ihtml = $("<i>&nbsp;</i>").appendTo(span);
                            var str = "<th "
                            if (col > 1) {
                                str += "colspan=\"" + col + "\" ";
                                th.attr("colspan", col);
                            }
                            if (row > 1) {
                                str += "rowspan=\"" + row + "\" ";
                                th.attr("rowspan", row);
                            }
                            str += ">" + option.colHeaderSet[j].names[i];

                            str += "</th>";
                            if (row + i == option.colHeaderSet[j].names.length) {
                                $("<div class=\"drag\" role=\"drag\">&nbsp;</div>").appendTo(th);
                                th.attr({
                                    "role": "w",
                                    "rowindex": j
                                });
                                if (option.colHeaderSet[j].hidden) {
                                    th.hide();
                                }
                                else {
                                    th.attr("colindex", colindex);
                                    colindex++;
                                }
                                if (option.colHeaderSet[j].sort > -1) {
                                    tableHandler.setSort(option.colHeaderSet,
                                        j, span, ihtml, option, obj, sumOption);
                                }
                            }
                        }
                    }
                    thead.append(tr);
                }
            }
        },
        setSort: function (colHeaderSet, j, span, i, option, obj, sumOption) {
            //1 向上  2 向下
            if (colHeaderSet[j].sort == 1) {
                i.addClass("up");
            }
            else if (colHeaderSet[j].sort == 2) {
                i.addClass("down");
            }
            (function (coli) {
                span.click(function () {
                    if (sumOption.dataFrom.Local) {
                        for (var k = 0; k < colHeaderSet.length; k++) {
                            if (coli != k) {
                                if (colHeaderSet[k].sort != -1) {
                                    colHeaderSet[k].sort = 0;
                                }
                            }
                        }
                        if (colHeaderSet[coli].sort == 0) {
                            colHeaderSet[coli].sort = 1;
                        }
                        else if (colHeaderSet[coli].sort == 1) {
                            colHeaderSet[coli].sort = 2;
                        }
                        else {
                            colHeaderSet[coli].sort = 1;
                        }

                        toolsSmart.Sort(option,
                            colHeaderSet[coli].sorttype,
                            colHeaderSet[coli].sort,
                            colHeaderSet[coli].realIndex);
                        p_method.initShow(sumOption, obj);
                    }
                    else {
                        if (sumOption.sort.colindex != -1 && colHeaderSet[coli].realIndex != sumOption.sort.colindex) {
                            sumOption.sort.colindex2 = sumOption.sort.colindex;
                            sumOption.sort.order2 = sumOption.sort.order;
                        }
                        sumOption.sort.colindex = colHeaderSet[coli].realIndex;
                        sumOption.sort.order = (colHeaderSet[coli].sort == 1 ? 2 : 1);
                        p_method.initData(sumOption, obj);
                    }
                });
            })(j);
        },
        isRowSpan: function (name, colHeaderSet, colIndex, rowIndex) {
            if (colHeaderSet.length > colIndex) {
                if (colHeaderSet[colIndex].names.length > rowIndex) {
                    if (rowIndex > 0) {
                        if (colHeaderSet[colIndex].names[rowIndex - 1] == name) {
                            return 0;
                        }
                    }
                    var r = 1;
                    for (var i = rowIndex + 1; i < colHeaderSet[colIndex].names.length; i++) {
                        if (colHeaderSet[colIndex].names[i] == name) {
                            r++;
                        }
                        else {
                            break;
                        }
                    }
                    return r;
                }
            }
            return 1;
        },
        isColSpan: function (name, colHeaderSet, colIndex, rowIndex) {
            if (colHeaderSet.length > colIndex) {
                if (colIndex > 0) {
                    if (colHeaderSet[colIndex - 1].names.length > rowIndex) {
                        if (colHeaderSet[colIndex - 1].names[rowIndex] == name) {
                            return 0;
                        }
                    }
                }
                var r = 1;
                for (var i = colIndex + 1; i < colHeaderSet.length; i++) {

                    if (colHeaderSet[i].names.length > rowIndex) {
                        if (colHeaderSet[i].names[rowIndex] == name) {
                            r++;
                        }
                        else {
                            break;
                        }
                    }
                }
                return r;
            }
            return 1;
        },
    };
    var pageHandler = {
        init: function (option, tbfoot, obj) {
            tbfoot.empty();
            if (option.localdata.isTotal == -1) {
                return;
            }
            option.finalSet.bindData.records = option.localdata.records;
            tbfoot.addClass("dss_table_page");
            var control = $("<div class=\"dss_table_page_oper\"></div>").appendTo(tbfoot),
                sum = Math.ceil(option.finalSet.bindData.records / option.paging.rowNum);
            $("<span class=\"" + pageHandler.getClass(option, "first", sum) + "\">&nbsp;</span>")
                .click(function () {
                    if ($(this).hasClass("first")) {
                        if (option.paging.num > 1) {
                            option.paging.num = 1;
                            if (option.paging.pagEvent == 1) {
                                option.callback.onPaging(option.paging.num, option.finalSet.bindData.records, option.paging.rowNum, option);
                            }
                            else {
                                pageHandler.initData(option, obj);
                            }
                        }
                    }
                }).appendTo(control);
            $("<span class=\"" + pageHandler.getClass(option, "prev", sum) + "\">&nbsp;</span>")
                .click(function () {
                    if ($(this).hasClass("prev")) {
                        if (option.paging.num > 1) {
                            option.paging.num--;
                            if (option.paging.pagEvent == 1) {
                                option.callback.onPaging(option.paging.num, option.finalSet.bindData.records, option.paging.rowNum, option);
                            }
                            else {
                                pageHandler.initData(option, obj);
                            }
                        }
                    }
                }).appendTo(control);

            var input = $("<span class=\"none\"></span>").appendTo(control);
            $("<input type=\"text\"/>").val(option.paging.num)
                .keypress(function (e) {
                    var keycode = e.keyCode || e.which;
                    if (keycode == 13) {
                        var text = $(this).val(), numIndex = 1;
                        if (text.length == 0) {
                            return false;
                        }
                        if (toolsSmart.isPositiveNum(text)) {
                            numIndex = parseInt(text);
                        }
                        if (numIndex < 1) {
                            numIndex = 1;
                        }
                        if (numIndex > sum) {
                            numIndex = sum;
                        }
                        option.paging.num = numIndex;
                        if (option.paging.pagEvent == 1) {
                            option.callback.onPaging(option.paging.num, option.finalSet.bindData.records, option.paging.rowNum, option);
                        }
                        else {
                            pageHandler.initData(option, obj);
                        }
                    }
                    else {
                        if (keycode == 8) {
                            return true;
                        }
                        if (keycode > 57) {
                            return false;
                        }
                        if (keycode < 48) {
                            return false;
                        }
                        var text = $(this).val();

                        if (text.length == 0) {
                            if (keycode == 48) {
                                return false;
                            }
                        }
                    }
                }).appendTo(input);

            input.append(" 共" + sum + "页");

            $("<span class=\"" + pageHandler.getClass(option, "next", sum) + "\">&nbsp;</span>")
                .click(function () {
                    if ($(this).hasClass("next")) {
                        if (option.paging.num < sum) {
                            option.paging.num++;
                            if (option.paging.pagEvent == 1) {
                                option.callback.onPaging(option.paging.num, option.finalSet.bindData.records, option.paging.rowNum, option);
                            }
                            else {
                                pageHandler.initData(option, obj);
                            }
                        }
                    }
                }).appendTo(control);
            $("<span class=\"" + pageHandler.getClass(option, "last", sum) + "\">&nbsp;</span>")
                .click(function () {
                    if ($(this).hasClass("last")) {
                        if (option.paging.num < sum) {
                            option.paging.num = sum;
                            if (option.paging.pagEvent == 1) {
                                option.callback.onPaging(option.paging.num, option.finalSet.bindData.records, option.paging.rowNum, option);
                            }
                            else {
                                pageHandler.initData(option, obj);
                            }
                        }
                    }
                }).appendTo(control);
            if (option.paging.rowList.length > 1) {
                var select = $("<span class=\"none\"></span>").appendTo(control),
                ddl = $("<select></select>").val(option.paging.num).appendTo(select);
                for (var i = 0; i < option.paging.rowList.length; i++) {
                    if (option.paging.rowNum == option.paging.rowList[i]) {
                        $("<option value=\"" + option.paging.rowList[i] + "\" selected=\"selected\">" + option.paging.rowList[i] + "</option>").appendTo(ddl);
                    }
                    else {
                        $("<option value=\"" + option.paging.rowList[i] + "\">" + option.paging.rowList[i] + "</option>").appendTo(ddl);
                    }
                }
                ddl.change(function () {
                    var numStr = parseInt($(this).val());
                    option.paging.num = 1;
                    option.paging.rowNum = numStr;
                    if (option.paging.pagEvent == 1) {
                        option.callback.onPaging(option.paging.num, option.finalSet.bindData.records, option.paging.rowNum, option);
                    }
                    else {
                        pageHandler.initData(option, obj);
                    }
                });
            }
            if (option.width > 400) {
                var strHtml = pageHandler.getSumStr(option);
                $("<span class=\"sum\">" + strHtml + "</span>").appendTo(tbfoot);
            }

            if (obj.find("table tbody").length > 0) {
                var parit = {
                    page: option.paging.num,
                    rowNum: option.paging.rowNum,
                    records: option.localdata.records,
                    total: sum
                }
                obj.find("table tbody").eq(0).setGridParam(parit);
            }

        },
        getClass: function (option, className, sum) {
            if (className == "first") {
                if (option.paging.num == 1) {
                    return "first_1";
                }
                else {
                    return "first";
                }
            }
            else if (className == "prev") {
                if (option.paging.num == 1) {
                    return "prev_1";
                }
                else {
                    return "prev";
                }
            }
            else if (className == "next") {
                if (option.paging.num >= sum) {
                    return "next_1";
                }
                else {
                    return "next";
                }
            }
            else {
                if (option.paging.num >= sum) {
                    return "last_1";
                }
                else {
                    return "last";
                }
            }
        },
        getSumStr: function (option) {
            var start = (option.paging.num - 1) * option.paging.rowNum + 1,
                end = option.paging.num * option.paging.rowNum;
            if (end > option.finalSet.bindData.records) {
                end = option.finalSet.bindData.records;
            }
            return "共" + option.finalSet.bindData.records + "条";//"当前页是第" + start + "条到第" + end + "条，"当前页是第" + start + "条到第" + end + "条，
        },
        initData: function (option, obj) {
            if (option.dataFrom.Local) {
                p_method.initGrid(option, obj);
            }
            else {
                p_method.initData(option, obj);
            }
        }
    };
    var toolsSmart = {
        getColPro: function (cols, colnames, colIndex, isrownum, ischek, coli, isSort, sortColObj) {
            var opt = {
                names: [],
                width: -1,
                align: 'left',
                frozen: false,
                sort: 0,
                sorttype: 'string',
                hidden: false,
                fontcolor: '',
                adddom: '',//
                addurl: '',//
                urltype: '',//
                addclick: null,
                rowDataBind: null,
                realIndex: -1
            };
            for (var i = 0; i < cols.length; i++) {
                if (cols[i].colindex == colIndex) {
                    var _pc = cols[i];
                    if (_pc.name && typeof _pc.name == 'string' && _pc.name.length > 0) {
                        opt.names = _pc.name.split('|||');
                    }
                    if (_pc.addclick && typeof _pc.addclick == 'function') {
                        opt.addclick = _pc.addclick;
                    }
                    if (_pc.rowDataBind && typeof _pc.rowDataBind == 'function') {
                        opt.rowDataBind = _pc.rowDataBind;
                    }

                    if (_pc.urltype && typeof _pc.urltype == 'string') {
                        opt.urltype = _pc.urltype;
                    }

                    if (_pc.addurl && typeof _pc.addurl == 'string') {
                        opt.addurl = _pc.addurl;
                    }
                    if (_pc.adddom && typeof _pc.adddom == 'string') {
                        opt.adddom = _pc.adddom;
                    }
                    if (_pc.fontcolor && typeof _pc.fontcolor == 'string') {
                        opt.fontcolor = _pc.fontcolor;
                    }
                    if (_pc.sorttype && typeof _pc.sorttype == 'string') {
                        opt.sorttype = _pc.sorttype;
                    }
                    if (_pc.align && typeof _pc.align == 'string') {
                        opt.align = _pc.align;
                    }
                    else if (opt.sorttype == "int") {
                        opt.align = "right";
                    }
                    if (_pc.hidden && typeof _pc.hidden == 'boolean') {
                        opt.hidden = _pc.hidden;
                    }
                    if (_pc.sort && typeof _pc.sort == 'boolean') {
                        if (_pc.sort) {
                            opt.sort = 0;
                        }
                    }
                    if (_pc.frozen && typeof _pc.frozen == 'boolean') {
                        opt.frozen = _pc.frozen;
                    }
                    if (_pc.width && typeof _pc.width == 'number') {
                        opt.width = _pc.width;
                    }
                    break;
                }
            }
            if (opt.names.length == 0) {
                if (isrownum) {
                    opt.names.push("序号");
                    opt.align = "center";
                    opt.sort = -1;
                }
                if (ischek) {
                    opt.names.push("选择");
                    opt.align = "center";
                    opt.sort = -1;
                }
            }
            if (opt.names.length == 0) {
                opt.names = colnames[colIndex - coli].split('|||');
            }
            for (var i = 0; i < opt.names.length; i++) {
                if (opt.names[i].indexOf("-加密") > 0) {
                    opt.hidden = true;
                    break;
                }
            }

            opt.realIndex = colIndex - coli;
            if (opt.realIndex == sortColObj.colindex) {
                opt.sort = sortColObj.order;
            }
            if (opt.realIndex == sortColObj.colindex2) {
                opt.sort = sortColObj.order2;
            }
            if (!isSort) {
                opt.sort = -1;
            }
            return opt;
        },
        getAvgWidth: function (option) {
            var sumwidth = 0, num = 0, hidNum = 0;
            for (var i = 0; i < option.finalSet.colHeaderSet.length; i++) {
                if (option.finalSet.colHeaderSet[i].width > 0) {
                    if (!option.finalSet.colHeaderSet[i].hidden) {
                        sumwidth += option.finalSet.colHeaderSet[i].width;
                        num++;
                    }
                }
                if (option.finalSet.colHeaderSet[i].hidden) {
                    hidNum++;
                    option.finalSet.colHeaderSet[i].width = 0;
                }
            }
            sumwidth += ((option.finalSet.colHeaderSet.length - hidNum) + 1);
            var avg = (option.width - sumwidth + 2) / (option.finalSet.colHeaderSet.length - num - hidNum);
            if (avg < 75) {
                avg = 75;
            }
            for (var i = 0; i < option.finalSet.colHeaderSet.length; i++) {
                if (option.finalSet.colHeaderSet[i].width <= 0) {
                    if (!option.finalSet.colHeaderSet[i].hidden) {
                        option.finalSet.colHeaderSet[i].width = avg;
                    }
                }
            }
        },
        isNullOrEmpty: function (obj) {
            if (!obj) {
                return true;
            }
            var flag = false;
            if (obj == null || obj == undefined || typeof (obj) == 'undefined' || obj == '') {
                flag = true;
            } else if (typeof (obj) == 'string') {
                obj = obj.trim();
                if (obj == '') {//为空  
                    flag = true;
                } else {//不为空  
                    obj = obj.toUpperCase();
                    if (obj == 'NULL' || obj == 'UNDEFINED' || obj == '{}') {
                        flag = true;
                    }
                }
            }
            else {
                flag = false;
            }
            return flag;
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
                            strArr.push(toolsSmart.jsonToString(obj[i]));
                        }
                        return '[' + strArr.join(',') + ']';
                    } else if (obj == null) {
                        return 'null';

                    } else {
                        var string = [];
                        for (var property in obj) string.push(toolsSmart.jsonToString(property) + ':' + toolsSmart.jsonToString(obj[property]));
                        return '{' + string.join(',') + '}';
                    }
                case 'number':
                    return obj;
                default:
                    return obj;
            }
        },
        isFunction: function (obj) {
            if (obj == undefined) {
                return false;
            }
            if (obj == null) {
                return false;
            }
            if (typeof obj != 'function') {
                return false;
            }
            return true;
        },
        getRows: function (row) {
            var result = [];
            $.each(row, function (i, item) {
                result.push(item);
            });
            return result;
        },
        isPositiveNum: function (input) {//是否为正整数     
            var re = /^[0-9]*[1-9][0-9]*$/;
            return re.test(input)
        },
        Sort: function (option, dataType, sortType, rIndex) {
            if (dataType == "int" || dataType == "float") {
                option.bindData.rows = option.bindData.rows.sort(function (a, b) {
                    if (toolsSmart.isNullOrEmpty(a["col" + rIndex])) {
                        return -1;
                    }
                    if (toolsSmart.isNullOrEmpty(b["col" + rIndex])) {
                        return -1;
                    }

                    var _a = parseFloat(a["col" + rIndex]), _b = parseFloat(b["col" + rIndex]);
                    if (sortType == 1) {
                        if (_a >= _b) {
                            return 1;
                        }
                        else {
                            return -1;
                        }
                    }
                    else {
                        if (_a <= _b) {
                            return 1;
                        }
                        else {
                            return -1;
                        }
                    }
                });
            }
            else {
                option.bindData.rows = option.bindData.rows.sort(function (a, b) {
                    if (toolsSmart.isNullOrEmpty(a["col" + rIndex])) {
                        return -1;
                    }
                    if (toolsSmart.isNullOrEmpty(b["col" + rIndex])) {
                        return -1;
                    }
                    if (sortType == 1) {
                        if (a["col" + rIndex] >= b["col" + rIndex]) {
                            return 1;
                        }
                        else {
                            return -1;
                        }
                    }
                    else {
                        if (a["col" + rIndex] <= b["col" + rIndex]) {
                            return 1;
                        }
                        else {
                            return -1;
                        }
                    }
                });
            }
        },
        getCountCol: function (option) {
            var colIndex = 0;
            if (option.showrownum) {
                colIndex++;
            }
            if (option.mulCheck.ismulCheck) {
                colIndex++;
            }
            return colIndex;
        },
        request: function (key) {
            if (typeof (dss) != "undefined" && dss.request != undefined && typeof dss.request == 'function') {
                return dss.request(key);
            }
            return "";
        },
        getAppRootPath: function () {
            var strFullPath = window.document.location.href;
            var strPath = window.document.location.pathname;
            var pos = strFullPath.indexOf(strPath);
            var prePath = strFullPath.substring(0, pos);
            var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
            return prePath + postPath + "/";
        },
        getMousePos: function (event) {
            var e = event || window.event;
            var scrollX = document.documentElement.scrollLeft
                || document.body.scrollLeft;
            var scrollY = document.documentElement.scrollTop
                || document.body.scrollTop;
            var x = e.pageX || e.clientX + scrollX;
            var y = e.pageY || e.clientY + scrollY;
            return { 'x': x, 'y': y };
        },
        load: function (state) {
            if (toolbar.isScript()) {
                dss.load(state);
            }
        },
        isEmptyObject: function (e) {
            var t;
            for (t in e)
                return !1;
            return !0
        },
        getWidth: function (obj) {
            var width = 0,
             n = 0,
             _obj = obj,
             _border = parseInt(obj.css('border-left-width')) * 2 || 2;
            while (width == 0) {
                if (n > 6) {
                    break;
                }
                switch (n) {
                    case 0:
                        width = obj.parent()
                            .width();
                        break;
                    case 1:
                        width = obj.parent()
                            .parent()
                            .width();
                        break;
                    case 2:
                        width = obj.parent()
                            .parent()
                            .parent()
                            .width();
                        break;
                    case 3:
                        width = obj.parent()
                            .parent()
                            .parent()
                            .parent()
                            .width();
                        break;
                    case 4:
                        width = obj.parent()
                            .parent()
                            .parent()
                            .parent()
                            .parent()
                            .width();
                        break;
                    case 5:
                        width = obj.parent()
                            .parent()
                            .parent()
                            .parent()
                            .parent()
                            .parent()
                            .width();
                        break;
                    default:
                        width = obj.parent()
                            .parent()
                            .parent()
                            .parent()
                            .parent()
                            .parent()
                            .parent()
                            .width();
                        break;
                }
                n++;
            }

            if (width > _obj.width() + _border) {
                width = _obj.width() + _border;
            }
            return width;
        },
        getSumWidth: function (option) {
            var sum = 0;
            for (var i = 0; i < option.finalSet.colHeaderSet.length; i++) {
                sum += option.finalSet.colHeaderSet[i].width;
            }
            return sum;
        },
        setSecondWidth: function (obj, width, option) {
            if (width < (option.width - 10)) {
                $("#" + option.finalSet.pageid).css("width", width - 3);
                $("#" + option.finalSet.headid).css("width", width - 3)
                obj.css("width", width - 2);
                if (obj.find("table").length > 0) {
                    var lengthCol = obj.find("table").eq(0).find("col").length,
                        sumwidth = option.width - width + 2,
                        sw = Math.ceil(sumwidth / lengthCol);
                    obj.find("table").each(function (i, item) {
                        var sumTb = $(this).width() - sumwidth;
                        sumwid = sumwidth;
                        for (var j = lengthCol - 1; j >= 0 && sumwid > 0 ; j--) {
                            var _obj = $(this).find("col").eq(j),
                                _w = _obj.width(),
                                _t = ((sumwid > 0) ? _w - sw : _w);
                            _obj.css("width", _t);
                            if (obj.find("table").length > 1) {
                                $(this).find("col").eq(j).css("width", _t);
                            }
                            sumwid -= sw;
                        }

                        $(this).css("width", sumTb);
                    });
                }
                if (toolsSmart.isIE()) {
                    $("#" + option.finalSet.gridid).css("width", width + 4);
                }
                else {
                    $("#" + option.finalSet.gridid).css("width", width + 12);
                }
            }
        },
        isIE: function () { //ie?
            if (!!window.ActiveXObject || "ActiveXObject" in window)
                return true;
            else if (navigator.userAgent.toLocaleLowerCase().indexOf("edge") > -1) {
                return true;
            }
            else
                return false;
        }
    };
    var toolbar = {
        init: function (option, titleTool, obj) {
            var left = $("<div class=\"title\"></div>"),
                right = $("<div class=\"right\"></div>"),
                display = [];
            if (!toolsSmart.isNullOrEmpty(option.captionName)) {
                left.text(option.captionName).appendTo(titleTool);
            }
            if (option.toolbar.extend.length > 0) {
                for (var i = 0; i < option.toolbar.extend.length; i++) {
                    display.push(option.toolbar.extend[i]);
                }
            }
            if (toolbar.isScript()) {
                if (option.toolbar.notShow.indexOf("isexport") < 0) {
                    display.push({
                        className: 'export',
                        title: '数据导出',
                        click: function () {
                            dss.require(["export"], function () {
                                $.download.exportDiv([obj], {
                                    colAttr: []
                                }, option.localdata.records)
                            }, function () { });
                        }
                    });
                }
                if (option.toolbar.notShow.indexOf("filter") < 0) {
                    if (option.dataFrom.Analyzer) {
                        display.push({
                            className: 'filter',
                            title: '指标过滤',
                            click: function (analyzer) {
                                toolbar.filter.init(obj, analyzer, option);
                            }
                        });
                    }
                }
                if (option.toolbar.notShow.indexOf("measel") < 0) {
                    if (option.dataFrom.Analyzer) {
                        display.push({
                            className: 'measure',
                            title: '指标选择',
                            click: function (analyzer) {
                                toolbar.select.init(obj, analyzer, option);
                            }
                        });
                    }
                }
                if (option.toolbar.notShow.indexOf("second") < 0) {
                    if (option.dataFrom.Analyzer) {
                        display.push({
                            className: 'second',
                            title: '二次分析',
                            click: function (analyzer) {
                                $.ajax({
                                    url: toolsSmart.getAppRootPath() + 'PlugIn/CustomAnalysis/Pages/Handler.ashx?datatype=tmptstore',
                                    data: {
                                        anastr: dss.jsonToString(analyzer)
                                    },
                                    type: 'post',
                                    dataType: 'text',
                                    success: function (data) {
                                        var url = toolsSmart.getAppRootPath() + "PlugIn/CustomAnalysis/Pages/Content.aspx?tabtype=Edit&qtype=anaagain&key=" + data;
                                        dss.openPageInTab("二次分析", url);
                                    }
                                });
                            }
                        });
                    }
                }
            }
            if (display.length == 0) {
                return;
            }
            right.appendTo(titleTool);

            for (var i = 0; i < display.length; i++) {
                (function (coli) {
                    var div = $("<div title=\"" + display[coli].title + "\" class=\"" + display[coli].className + "\">&nbsp;</div>");
                    if (display[coli].className == "export") {
                        div.removeClass("export").addClass("none");
                        var $_export = setInterval(function () {
                            if (option.localdata.isTotal == 0) {
                                div.removeClass("none").addClass("export");
                                div.click(function () {
                                    if (display[coli].click && toolsSmart.isFunction(display[coli].click)) {
                                        display[coli].click(option.analyzer);
                                    }
                                });
                                clearInterval($_export);
                            }
                        }, 100);
                    }
                    else {
                        div.click(function () {
                            if (display[coli].click && toolsSmart.isFunction(display[coli].click)) {
                                display[coli].click(option.analyzer);
                            }
                        });
                    }
                    right.append(div);
                })(i);
            }
        },
        isScript: function () {
            var flag = false;
            $("script").each(function (i, item) {
                if (item.src.toLowerCase().indexOf("common/tools.js") > -1) {
                    flag = true;
                    return false;
                }
            });
            return flag;
        },
        filter: {
            init: function (obj, analyzer, option) {
                var id = obj[0].id;
                $.ajax({
                    url: toolsSmart.getAppRootPath() + "javascript/JSControl/SmartGrid/JqGrid/layout/filte.html",
                    type: 'get',
                    dataType: 'html',
                    success: function (data) {
                        data = data.replace(/\[-id-\]/g, id);
                        dss.dialog({
                            content: data,
                            title: '过滤设置',
                            open: function () {
                                toolbar.filter.filterContent(analyzer, id);
                                toolbar.filter.bindRowDim(analyzer, id);
                            },
                            close: function () {
                                toolbar.filter.removeFildata(id);
                            },
                            buttons: {
                                "确定": function () {
                                    var retStr = $("#" + id + "_filter_db").find("textarea").eq(0).val(),
                                        resStr = retStr.replace(/\s+/g, ' '),
                                        flag = false, flagRow = false;
                                    if (resStr.length > 0) {
                                        if (!toolbar.filter.valid.content(retStr, analyzer.MeasureList)) {
                                            dss.alert("指标表达式不正确，请验证");
                                            return;
                                        }
                                        flag = true;
                                        analyzer.MeasureFilter = retStr;
                                    }

                                    flagRow = toolbar.filter.valid.setRowDim(analyzer, id);
                                    if (flag || flagRow) {
                                        p_method.initData(option, obj);
                                    }

                                    toolbar.filter.removeFildata(id);
                                },
                                "取消": function () {
                                    toolbar.filter.removeFildata(id);
                                }
                            }
                        })
                    }
                });
            },
            filterContent: function (analyzer, id) {
                var $_content = $("#" + id + "_filter_db"),
                          ul = $_content.find("ul"),
                          $_ul = $("#" + id + "_filter_con"),
                          textarea = $_content.find("textarea").eq(0);
                ul.find("li").each(function () {
                    $(this).click(function () {
                        if (!$(this).hasClass("select")) {
                            $(this).parent().find("li").removeClass("select");
                            if ($(this).index() == 0) {
                                $_content.find("div[class='measure']").eq(0).show();
                                $_content.find("div[class='attr']").eq(0).hide();
                            }
                            else {
                                $_content.find("div[class='attr']").eq(0).show();
                                $_content.find("div[class='measure']").eq(0).hide();
                            }
                            $(this).addClass("select");
                            toolbar.filter.removeFildata(id);
                        }
                    })
                });
                if (analyzer && analyzer.MeasureList && analyzer.MeasureList.length > 0) {
                    $.each(analyzer.MeasureList, function (i, item) {
                        $("<li></li>").attr({
                            "measureid": item.MeasureID,
                            "unit": item.Unit
                        }).click(function () {
                            toolbar.filter.filterData($(this), id, textarea);
                        }).text(item.DisplayName).appendTo($_ul);
                    });
                }

                toolbar.filter.filterButton($_content.find("div[class='but']").eq(0).find("input"), id, textarea);
            },
            filterButton: function (btns, id, text) {
                btns.eq(0).click(function () {
                    var txtData = text.val();
                    text.val(txtData + " OR");
                    toolbar.filter.removeFildata(id);
                });
                btns.eq(1).click(function () {
                    var txtData = text.val();
                    text.val(txtData + " AND");
                    toolbar.filter.removeFildata(id);
                });
                btns.eq(2).click(function () {
                    var txtData = text.val();
                    text.val(txtData + " (");
                    toolbar.filter.removeFildata(id);
                });
                btns.eq(3).click(function () {
                    var txtData = text.val();
                    text.val(txtData + " )");
                    toolbar.filter.removeFildata(id);
                });
                btns.eq(4).click(function () {
                    var txtData = text.val();
                    text.val("");
                    toolbar.filter.removeFildata(id);
                });
            },
            filterData: function (obj, id, text) {
                $.ajax({
                    url: toolsSmart.getAppRootPath() + "javascript/JSControl/SmartGrid/JqGrid/layout/setdate.html",
                    type: 'get',
                    dataType: 'html',
                    success: function (data) {
                        data = data.replace(/\[-id-\]/g, id);
                        toolbar.filter.removeFildata(id);
                        $(document.body).append(data);
                        var $_content = $("#" + id + "_set_data").css({
                            "z-index": 10000,
                            top: text.offset().top - 30,
                            left: text.offset().left
                        }),
                            title = obj.text(),
                            $_title = $("#" + id + "_set_name"),
                            btns = $_content.find("input[type='button']"),
                            input = $_content.find("input[type='text']").eq(0);
                        if (obj.attr("unit").length > 0) {
                            title += "(" + obj.attr("unit") + ")";
                        }
                        if (title.length > 17) {
                            $_title.css({
                                "line-height": "25px"
                            });
                        }
                        else {
                            $_title.css({
                                "line-height": "50px"
                            });
                        }
                        $_title.text(title);
                        btns.eq(1).click(function () {
                            toolbar.filter.removeFildata(id);
                        });
                        input.keypress(function (e) {
                            var char = e.char,
                                txtNum = $(this).val();
                            if (char == '.') {
                                if (txtNum.length == 0) {
                                    return false;
                                }
                                if (txtNum.indexOf(".") > -1) {
                                    return false;
                                }
                            }
                            if (char == '0') {
                                if (txtNum == "0") {
                                    return false;
                                }
                            }
                            else
                                if (!toolsSmart.isPositiveNum(char) && char != '.') {
                                    return false;
                                }
                        });
                        btns.eq(0).click(function () {
                            if (input.val().length > 0) {
                                var ddl = $_content.find("select").eq(0),
                                    txtData = text.val()
                                switch (ddl.val()) {
                                    case "0":
                                        txtData += " [" + obj.text() + "] > " + input.val();
                                        break;
                                    case "1":
                                        txtData += " [" + obj.text() + "] > " + input.val();
                                        break;
                                    case "2":
                                        txtData += " [" + obj.text() + "] > " + input.val();
                                        break;
                                    case "3":
                                        txtData += " [" + obj.text() + "] > " + input.val();
                                        break;
                                    default:
                                        txtData += " [" + obj.text() + "] > " + input.val();
                                        break;
                                }
                                text.val(txtData);
                            }
                            toolbar.filter.removeFildata(id);
                        });
                    }
                });
            },
            bindRowDim: function (analyzer, id) {
                var dim = $("#" + id + "_filter_row"),
                    desc = $("#" + id + "_filter_desc"),
                    dataArr = [
                        {
                            id: 0,
                            name: '请选择'
                        },
                        {
                            id: 1,
                            name: '单值'
                        },
                        {
                            id: 2,
                            name: '多值'
                        },
                        {
                            id: 3,
                            name: '模糊'
                        },
                        {
                            id: 4,
                            name: '排除'
                        }
                    ];
                if (analyzer.RowDimList.length > 0) {
                    for (var i = 0; i < analyzer.RowDimList.length; i++) {
                        if (analyzer.RowDimList[i].DimensionName == "日期维" ||
                            analyzer.RowDimList[i].DimensionName == "小时维") {
                            continue;
                        }
                        var dl = $("<dl></dl>"),
                            dt = $("<dt><input type=\"text\" readonly=\"readonly\" value=\"" + analyzer.RowDimList[i].LevelName + "\" /></dt>").appendTo(dl),
                            dd = $("<dd></dd>").appendTo(dl),
                            sel = $("<select></select>").appendTo(dd),
                            input = $("<input type=\"text\"/>").appendTo(dd);
                        $.each(dataArr, function (j, item) {
                            $("<option value=\"" + item.id + "\">" + item.name + "</option>").appendTo(sel);
                        });
                        sel.change(function () {
                            toolbar.filter.setRowDim(desc, dim);
                        });
                        input.attr({
                            "placeholder": '多个值(多值、排除)用分号（;）隔开'
                        }).blur(function () {
                            toolbar.filter.setRowDim(desc, dim);
                        });
                        dim.append(dl);
                    }
                }
            },
            setRowDim: function (desc, dim) {
                var str = "";
                dim.find("dl").each(function () {
                    var val = $(this).find("select").eq(0).val(),
                        name = $(this).find("input").eq(0).val(),
                        data = $(this).find("input").eq(1).val();
                    if (val != "0" && data.length > 0) {
                        if (str.length > 0) {
                            str += " AND ";
                        }
                        if (val == "1") {
                            str += "[" + name + "]='" + data + "'";
                        }
                        else if (val == "2") {
                            str += "[" + name + "] IN ('" + data.replace(";", "','") + "')";
                        }
                        else if (val == "3") {
                            str += "[" + name + "] LIKE '%" + data + "%'";
                        }
                        else {
                            str += "[" + name + "] NOT IN ('" + data.replace(";", "','") + "')";
                        }
                    }
                    else {
                        $(this).find("input").eq(1).val("");
                    }
                });
                desc.html(str);
            },
            removeFildata: function (id) {
                if ($("#" + id + "_set_data").length > 0) {
                    $("#" + id + "_set_data").remove();
                }
            },
            valid: {
                isNum: function (str) {
                    var re = /^[0-9]+.?[0-9]*$/;
                    if (!re.test(str)) {
                        return false;
                    }
                    return true;
                },
                content: function (str, arrMea) {
                    for (var i = 0; i < arrMea.length; i++) {
                        while (str.indexOf("[" + arrMea[i].DisplayName + "]") > -1) {
                            str = str.replace("[" + arrMea[i].DisplayName + "]", "$");
                        }
                    }
                    str = str.toLocaleLowerCase();
                    str = str.replace(/<=/g, " <= ");
                    str = str.replace(/>=/g, " >= ");
                    str = str.replace(/=/g, " = ");
                    str = str.replace(/>/g, " > ");
                    str = str.replace(/</g, " < ");
                    str = str.replace(/<  =/g, " <= ");
                    str = str.replace(/>  =/g, " >= ");

                    str = str.replace(/\(/g, " ( ");
                    str = str.replace(/\)/g, " ) ");
                    str = str.replace(/\s+/g, ' ');
                    str = $.trim(str);
                    var charArr = str.split(" ");
                    var ch = [];
                    var sy = [];
                    var br = [];
                    var nr = [];
                    for (var i = 0; i < charArr.length; i++) {
                        if (charArr[i] == "and" || charArr[i] == "or") {
                            if (i > charArr.length - 3) {
                                return false;
                            }
                            else if (charArr[i + 1] == ")") {
                                return false;
                            }
                            else if (charArr[i - 1] == "and" || charArr[i - 1] == "or") {
                                return false;
                            }
                            continue;
                        }
                        switch (charArr[i]) {
                            case "$":
                                if (i > 0) {
                                    if (charArr[i - 1] != "and" && charArr[i - 1] != "or" && charArr[i - 1] != "(") {
                                        return false;
                                    }
                                }
                                ch.push(charArr[i]);
                                break;
                            case "<":
                                sy.push(charArr[i]);
                                break;
                            case "<=":
                                sy.push(charArr[i]);
                                break;
                            case ">":
                                sy.push(charArr[i]);
                                break;
                            case ">=":
                                sy.push(charArr[i]);
                                break;
                            case "=":
                                sy.push(charArr[i]);
                                break;
                            case ")":
                                if (br.length == 0) {
                                    return false;
                                }
                                br.pop();
                                break;
                            case "(":
                                if (i > 0) {
                                    if (charArr[i - 1] != "and" && charArr[i - 1] != "or" && charArr[i - 1] != "(") {
                                        return false;
                                    }
                                }
                                if (i == charArr.length - 1) {
                                    return false;
                                }
                                if (charArr[i + 1] != "(" && charArr[i + 1] != "$") {
                                    return false;
                                }
                                br.push(charArr[i]);
                                break;
                            default:
                                if (toolbar.filter.valid.isNum(charArr[i])) {
                                    if (sy.length == 0) {
                                        return false;
                                    }
                                    if (ch.length == 0) {
                                        return false;
                                    }
                                    sy.pop();
                                    ch.pop();
                                }
                                else {
                                    return false;
                                }
                                break;
                        }
                    }
                    if (ch.length > 0 || sy.length > 0 || br.length > 0) {
                        return false;
                    }
                    return true;
                },
                setRowDim: function (analyzer, id) {
                    var dim = $("#" + id + "_filter_row"),
                        flag = false;
                    dim.find("dl").each(function () {
                        var val = $(this).find("select").eq(0).val(),
                            name = $(this).find("input").eq(0).val(),
                            data = $(this).find("input").eq(1).val();
                        if (val != "0" && data.length > 0) {
                            for (var i = 0; i < analyzer.RowDimList.length; i++) {
                                if (analyzer.RowDimList[i].LevelName == name) {
                                    switch (val) {
                                        case "1":
                                            analyzer.RowDimList[i].Val = data;
                                            analyzer.RowDimList[i].ValList = [];
                                            analyzer.RowDimList[i].ValType = 0;
                                            break;
                                        case "2":
                                            analyzer.RowDimList[i].Val = "";
                                            analyzer.RowDimList[i].ValList = data.split(";");
                                            analyzer.RowDimList[i].ValType = 1;
                                            break;
                                        case "3":
                                            analyzer.RowDimList[i].Val = data;
                                            analyzer.RowDimList[i].ValList = [];
                                            analyzer.RowDimList[i].ValType = 9;
                                            break;
                                        case "4":
                                            analyzer.RowDimList[i].Val = "";
                                            analyzer.RowDimList[i].ValList = data.split(";");
                                            analyzer.RowDimList[i].ValType = 2;
                                            break;
                                    }
                                    flag = true;
                                    break;
                                }
                            }
                        }
                    });
                    return flag;
                }
            }
        },
        select: {
            init: function (obj, analyzer, option) {
                var id = obj[0].id;
                $.ajax({
                    url: toolsSmart.getAppRootPath() + "javascript/JSControl/SmartGrid/JqGrid/layout/select.html",
                    type: 'get',
                    dataType: 'html',
                    success: function (data) {
                        data = data.replace(/\[-id-\]/g, id);
                        dss.dialog({
                            content: data,
                            title: '指标选择',
                            open: function () {
                                toolbar.select.setSel(analyzer.MeasureList, id, analyzer.MeasureFilter);
                                toolbar.select.initBtn(analyzer, id);
                            },
                            close: function () {

                            },
                            buttons: {
                                "确定": function () {
                                    var flag = toolbar.select.setAnalyzer(id, analyzer);
                                    if (!flag) {
                                        option.analyzer = analyzer;
                                        p_method.initData(option, obj);
                                    }
                                },
                                "取消": function () {
                                }
                            }
                        })
                    }
                });
            },
            setSel: function (MeasureList, id, filter) {
                var ul = $("#" + id + "_select_db_ul").empty(),
                    btnSearch = $("#" + id + "_select_db_search"),
                    txtKey = $("#" + id + "_select_db_txt"),
                    m_Event = null,
                    m_over = null,
                    tar_li = null;

                if (MeasureList != null) {
                    for (var i = 0; i < MeasureList.length; i++) {
                        var item = MeasureList[i],
                            li = $("<li>" + item.DisplayName + "</li>").appendTo(ul),
                            il = $("<i></i>").appendTo(li);
                        li.attr({
                            rid: item.MeasureID,
                            role: 'drag',
                            rname: item.DisplayName,
                            rindex: i
                        });

                        (function (rowindex) {
                            il.click(function () {
                                ul.find("li[rid=" + MeasureList[rowindex].MeasureID + "]").remove();
                            });
                        })(i)
                    }
                }

                ul.find("li").each(function (i, item) {
                    $(this).mousedown(function () {
                        _obj = $(this);
                        m_Event = function (es) {
                            var point = toolsSmart.getMousePos(es),
                                _temp = $(es.target);
                            setTimeout(function () {
                                if (_obj != null) {
                                    _obj.css({
                                        "position": "fixed",
                                        "z-index": 9999,
                                        top: point.y - 20,
                                        left: point.x - 40
                                    }).show();
                                }
                            }, 50);
                            if (_obj != null) {
                                if (_temp.attr("role") == "drag" &&
                                    _temp.attr("rindex") != _obj.attr("rindex")) {
                                    tar_li = _temp
                                }
                            }
                            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                        };
                        m_over = function () {
                            setTimeout(function () {
                                if (m_Event != null) {
                                    $(document.body).unbind("mousemove", m_Event);
                                    m_Event = null;
                                }
                                if (m_over != null) {
                                    $(document.body).unbind("mouseup", m_over);
                                    m_over = null;
                                }
                            }, 50);
                            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                            if (tar_li != null) {
                                tar_li.before(_obj);
                            }
                            else {
                                if (ul.find("li[delete='1']").length > 0) {
                                    ul.find("li[delete='1']").eq(0).before(_obj);
                                }
                                else {
                                    ul.append(_obj);
                                }
                            }
                            if (_obj != null) {
                                _obj.css({
                                    "position": "relative",
                                    "z-index": "",
                                    top: "",
                                    left: "",
                                    "background-color": "#fff"
                                }).removeClass("move").show();
                            }

                            ul.find("li[delete='1']").remove();
                            tar_li = null;
                            _obj = null;

                        }
                        $(document.body)
                            .bind("mousemove", m_Event)
                            .bind("mouseup", m_over);
                        var colne = _obj.clone(true).empty().html("&nbsp;").attr("delete", "1");
                        _obj.before(colne).appendTo($(document.body)).addClass("move").hide();
                        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                    });
                })
            },
            initBtn: function (analyzer, id) {
                var left = $("#" + id + "_select_db_left"),
                    rigth = $("#" + id + "_select_db_right"),
                    search = $("#" + id + "_select_db_search"),
                    txt = $("#" + id + "_select_db_txt"),
                    search_a = $("#" + id + "_select_tb_search"),
                    txt_a = $("#" + id + "_select_tb_txt"),
                    div = $("#" + id + "_select_div_show"),
                    table = $("#" + id + "_select_db_table"),
                    ul = $("#" + id + "_select_db_ul");


                search.click(function () {
                    ul.find("li").each(function () {
                        if (txt.val().length == 0) {
                            $(this).show();
                        }
                        else {
                            if ($(this).attr("rname") &&
                                $(this).attr("rname").indexOf(txt.val()) > -1) {
                                $(this).show();
                            }
                            else {
                                $(this).hide();
                            }
                        }
                    });
                });
                search_a.click(function () {
                    table.find("tbody").eq(0).find("tr").each(function () {
                        var t = txt_a.val(),
                            name = $(this).find("td").eq(1).text();
                        if (t.length == 0) {
                            $(this).show();
                        }
                        else {
                            if (name && name.indexOf(t) > -1) {
                                $(this).show();
                            }
                            else {
                                $(this).hide();
                            }
                        }
                    });
                });

                rigth.click(function () {
                    txt.val("");
                    txt_a.val("");
                    div.hide(1000);
                });

                left.click(function () {
                    txt.val("");
                    txt_a.val("");
                    toolbar.select.initMeasure(ul, table, left, div, id, analyzer.MeasureFilter);
                    div.show(1000);
                });
            },
            initMeasure: function (ul, table, left, div, divid, filter) {
                var tarSub = [];
                table.find("tbody").empty();
                ul.find("li").each(function (i, item) {
                    var id = $(this).attr("rid"),
                        name = $(this).attr("rname");
                    tarSub.push(id);
                    toolbar.select.showTable(id, name, true, table, divid, filter);
                });
                $.ajax({
                    url: toolsSmart.getAppRootPath() + "javascript/JSControl/Common/Hander/Analyzer.ashx",
                    dataType: 'json',
                    data: {
                        strCon: toolsSmart.jsonToString(tarSub)
                    },
                    type: 'post',
                    success: function (data) {
                        if (data.length > 0) {
                            $.each(data, function (i, item) {
                                if (tarSub.indexOf(item.MeasureID) < 0) {
                                    toolbar.select.showTable(item.MeasureID, item.DisplayName, false, table, divid, filter);
                                }
                            });
                        }
                    },
                    complete: function () {
                    }
                });
            },
            showTable: function (id, name, flag, table, divid, filter) {
                var tr = $("<tr></tr>").appendTo(table.find("tbody").eq(0)),
                         tdcheck = $("<td></td>").appendTo(tr),
                         chk = $("<input type=\"checkbox\"/>").appendTo(tdcheck),
                         tdname = $("<td>" + name + "</td>").appendTo(tr);
                tdcheck.css({
                    "text-align": "center"
                });
                if (flag) {
                    chk.attr({
                        "checked": "checked"
                    });
                }
                chk.attr({
                    measureid: id,
                    dispalyname: name
                }).change(function () {
                    var tarArr = toolbar.select.getMeasureList(table);
                    toolbar.select.setSel(tarArr, divid, filter);
                });
            },
            getMeasureList: function (table) {
                var trs = table.find("tbody").eq(0).find("tr");
                var tarSub = [];
                $.each(trs, function () {
                    var chk = $(this).find("input").eq(0);
                    if (chk.is(":checked")) {
                        tarSub.push({
                            MeasureID: chk.attr("measureid"),
                            DisplayName: chk.attr("dispalyname")
                        });
                    }
                });
                return tarSub;
            },
            setAnalyzer: function (id, analyzer) {
                var tarSub = [];
                $("#" + id + "_select_db_ul").find("li").each(function () {
                    tarSub.push({
                        MeasureID: $(this).attr("rid"),
                        DisplayName: $(this).attr("rname")
                    });
                });
                if (analyzer.MeasureList.length != tarSub.length) {
                    analyzer.MeasureList = tarSub;
                    return false;
                }
                for (var i = 0; i < analyzer.MeasureList.length; i++) {
                    if (analyzer.MeasureList[i].DisplayName != tarSub[i].DisplayName) {
                        analyzer.MeasureList = tarSub;
                        return false;
                    }
                }
                return true;
            }
        }

    };
})(jQuery);