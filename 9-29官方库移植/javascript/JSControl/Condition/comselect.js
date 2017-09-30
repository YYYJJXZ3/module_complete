(function ($) {
    $.fn.commonSelect = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            methods.init.apply(this, arguments);
        }
        else {
            $.error('Method ' + method + ' does not exist on jQuery.commonSelect');
        }
    }
    var methods = {
        init: function (option) {
            var obj = $(this);
            var param = $.extend(true, {
                themename: "",  //无用
                displayname: '',//表格和查询条件显示值
                dimname: "",   //维度名称
                levelname: '', //层次名称
                hierarchiename: '',// 层次名称
                dimid: "",     //维度ID
                selectmode: "single", //single    multiple
                hascheckall: false,   //是否有全选控件
                initClass: "commdata",//commdata bigdata   treedata
                initValues: [],       //初始化默认值
                datasource: [],       //默认下拉值
                filterValue: [],      //过滤值
                fuzzyValue: "",      //模糊查询
                zIndex: 12,          //把控件放到弹出层上面，防止弹出层z-index过大而被隐藏
                url: toolCommon.getAppRootPath() + "javascript/JSControl/Condition/Hander/bigdata.ashx",
                callback: {
                    changed: null,     //改变发生事件
                    beforeBindData: null
                },
                depandency: {         //联动依赖值
                    levelname: "",    //依赖层次名称
                    selnames: []      //依赖值
                },
                depandencys: []      //多个依赖项
            }, option);
            if (param.depandencys.length == 0) {
                if (param.depandency.levelname != "") {
                    param.depandencys.push(param.depandency);
                }
            }
            obj.data("bdDependLevelValues", param.depandencys);
            obj.data("dataCondition", param);
            obj.data("dataStrConditon", param.fuzzyValue);
            obj.data("initValues", param.initValues);
            if (param.initClass == "treedata") {
                param.url = toolCommon.getAppRootPath() + "javascript/JSControl/Condition/Hander/treedata.ashx",
                tree.init(obj, param);
            }
            else {
                ajax.setInit(obj, param);
            }
        },
        getSelResults: function () {
            if ($(this).data("initValues") != undefined) {
                return $(this).data("initValues");
            }
        },
        getSelNames: function () {
            var initvalue = $(this).data("initValues");
            var names = [];
            if (initvalue != null) {
                if (initvalue.length > 0) {
                    $.each(initvalue, function (i, val) {
                        names.push(val.name);
                    });
                }
            }
            if (names.length <= 0) {
                names.push("");
            }
            return names;
        },
        getSelIds: function () {
            var initvalue = $(this).data("initValues");
            var names = [];
            if (initvalue != null && initvalue != undefined) {
                if (initvalue.length > 0) {
                    $.each(initvalue, function (i, val) {
                        if (val.id != undefined) {
                            names.push(val.id);
                        }
                        else {
                            names.push("");
                        }
                    });
                }
            }
            if (names.length <= 0) {
                names.push("");
            }
            return names;
        },
        setSelResults: function () {
            if ($(this) != undefined || $(this) != null) {
                var obj = $(this);
                obj.data("initValues", []);
                var option = obj.data("dataCondition");
                if (option != null && option != undefined) {
                    if (option.selectmode == "single") {
                        comm.getInitValues(obj);
                    }
                    else {
                        bigdata.getSelNames(obj);
                    }
                }
            }
        },
        resetSelResults: function (data) {
            var obj = $(this);
            obj.data("initValues", data);
            var option = obj.data("dataCondition");
            if (option != undefined) {
                if (option.selectmode == "single") {
                    comm.getInitValues(obj);
                }
                else {
                    bigdata.getSelNames(obj);
                }
            }
        },
        destroySelf: function () {
            $(this).removeData();
            $(this).val("");
            $(this).unbind("click"); //移除click
        },
        resetDependency: function (objjosn) {
            var obj = $(this),
                data = obj.data("bdDependLevelValues"),
                option = obj.data("dataCondition");
            if (data == null || data == undefined) {
                return;
            }
            var flag = false;
            for (var i = 0; i < data.length; i++) {
                if (data[i].levelname == objjosn.levelname) {
                    if (objjosn.selnames[0] == "全部") {
                        data[i].selnames = [];
                    }
                    else {
                        data[i].selnames = objjosn.selnames;
                    }
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                if (objjosn.selnames[0] == "全部") {
                    objjosn.selnames = [];
                }
                data.push(objjosn);
            }
            obj.data("bdDependLevelValues", data);

            $.ajax({
                url: option.url,
                type: 'post',
                dataType: 'json',
                data: {
                    pagenum: 1,
                    pagerows: '80',
                    one: toolCommon.jsonToString(ajax.getParamOption(option, "first", obj))
                },
                success: function (data) {
                    if (data.status == 0) {
                        var binddata = eval('(' + data.data.Source + ')');
                        if (binddata.rows.length > 0) {
                            obj.data("initValues", [
                                {
                                    id: binddata.rows[0]["col" + (binddata.colnames.length - 2)],
                                    name: binddata.rows[0]["col" + (binddata.colnames.length - 1)]
                                }
                            ]);

                        }
                        else {
                            obj.data("initValues", []);
                        }
                        comm.getInitValues(obj);
                        comm.bindChange(obj);
                    }
                }
            });
        },
        deleteDependency: function (levelname) {
            var obj = $(this);
            var data = obj.data("bdDependLevelValues");
            if (data == null || data == undefined) {
                return;
            }
            var datasource = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].levelname != levelname) {
                    datasource.push(data[i]);
                }
            }
            obj.data("bdDependLevelValues", datasource);
        },
        resetSource: function (data, initData) {
            var obj = $(this);
            if (data != null && typeof data == 'object') {
                obj.data("dataInit", data);
            }
            if (initData == null || typeof initData != 'object' || initData == undefined) {
                initData = data.length > 0 ? [data[0]] : [];
            }
            obj.data("initValues", initData);
            comm.getInitValues(obj);
        }
    };
    var jstools = {
        gridTodata: function (data) {
            var option = $.extend(true, {}, data);
            var source = [];
            $.each(option.rows, function (i, item) {
                source.push({
                    name: item.col1,
                    id: item.col0
                });
            });
            return source;
        },
        dataTogrid: function (data, name) {
            var option = $.extend(true, {}, data);
            if (name.length == 0) {
                name = "未命名";
            }
            var source = {
                page: 1,
                records: data.length,
                colnames: ["主键", name],
                rows: []
            };
            $.each(option, function (i, item) {
                source.rows.push({
                    col0: item.id,
                    col1: item.name
                });
            });
            return source;
        },
        dataTogridFilter: function (data, name, key) {
            var option = $.extend(true, {}, data);
            if (name.length == 0) {
                name = "未命名";
            }
            var source = {
                page: 1,
                records: data.length,
                colnames: ["主键", name],
                rows: []
            };
            $.each(option, function (i, item) {
                if (item.name.indexOf(key) > -1) {
                    source.rows.push({
                        col0: item.id,
                        col1: item.name
                    });
                }
            });
            return source;
        },
        bindMove: function ($div, obj) {
            var tarclick = function (e) {
                if ($div.length > 0) {
                    if (e.target.id != obj[0].id) {
                        e = arguments[0] || window.event;
                        var x = e.clientX;
                        var scroll = $(document).scrollTop();
                        var y = e.clientY + scroll;
                        var top = $div.offset().top;
                        var left = $div.offset().left;
                        var width = obj.width();
                        var height = obj.height();
                        if (x < left || x > left + $div.width()) {
                            $div.remove();
                            $(document).unbind("click", tarclick);
                            return;
                        };
                        if (y < top) {
                            if (y < top - height) {
                                $div.remove();
                                $(document).unbind("click", tarclick);
                                return;
                            }
                            else {
                                if (x > left + width) {
                                    $div.remove();
                                    $(document).unbind("click", tarclick);
                                    return;
                                }
                            }
                        }
                        else if (y > top + $div.height() + 30) {
                            $div.remove();
                            $(document).unbind("click", tarclick);
                            return;
                        }
                    }
                }
            }
            $(document).bind("click", tarclick)
        },
        setPosition: function (tar, obj) {
            tar.css({
                top: obj.offset().top + obj.outerHeight(),
                left: obj.offset().left
            }).appendTo($(document.body));
        }
    };
    var ajax = {
        setInit: function (obj, option) {
            comm.getInitValues(obj);
            obj.click(function () {
                obj.data("dataStrConditon", "");
                if (option.datasource.length > 0) {
                    if (option.initClass == "bigdata") {
                        obj.data("dataInit", jstools.dataTogrid(option.datasource, option.displayname));
                    }
                    else {
                        obj.data("dataInit", option.datasource);
                    }
                    ajax.showdata(obj, option);
                    return;
                }
                ajax.getdata(obj, option);
            }).attr("readonly", "true");
        },
        getdata: function (obj, option) {
            $.ajax({
                url: option.url,
                type: 'post',
                dataType: 'json',
                data: {
                    pagenum: 1,
                    pagerows: '80',
                    one: toolCommon.jsonToString(ajax.getParamOption(option, "first", obj))
                },
                success: function (data) {
                    if (data.status == 0) {
                        var binddata = eval('(' + data.data.Source + ')');
                        if (binddata.records < 80) {
                            var source = jstools.gridTodata(binddata);
                            obj.data("dataInit", source);
                        }
                        else {
                            obj.removeData("dataInit");
                        }
                    }
                },
                beforeSend: function () {
                    obj.addClass("commdataloading");
                },
                complete: function () {
                    obj.removeClass("commdataloading");
                    ajax.showdata(obj, option);
                }
            });
        },
        showdata: function (obj, option) {
            var data = obj.data("dataInit");
            if (option.callback != null && option.callback != undefined) {
                if (option.callback.beforeBindData != null
                    && typeof option.callback.beforeBindData == 'function') {
                    option.callback.beforeBindData(data, obj, option);
                }
            }
            if (data && data.page == undefined) {
                comm.showcomm(obj, option, data);
            }
            else {
                bigdata.init(obj, option);
            }
        },
        getParamOption: function (option, commtype, obj) {
            var deps = obj.data("bdDependLevelValues");
            var depvalue = [];
            $.each(deps, function (i, val) {
                depvalue.push({
                    levelName: val.levelname,
                    values: val.selnames.join(',')
                });
            });
            var param = {
                themeName: option.themename,
                dimName: option.dimname,
                dimId: option.dimid,
                levelName: option.levelname,
                keyword: obj.data("dataStrConditon"),
                parentValue: depvalue,
                filterValue: option.filterValue.join(','),
                commType: commtype,
                isAll: (option.hascheckall ? 1 : 0)
            };
            return param;
        }
    };
    var bigdata = {
        init: function (obj, option) {
            bigdata.createPanel(obj, option);
        },
        createPanel: function (obj, option) {
            var divid = obj[0].id + "_big";
            var objDiv;
            if ($("#" + divid).length > 0) {
                $("#" + divid).remove();
            }
            if (option.displayname == '') {
                option.displayname = option.levelname;
            }
            objDiv = $("<div class=\"dss_comm_big\" id=\"" + divid + "\"></div>");
            objDiv.attr("style", "z-index:" + option.zIndex).empty();
            var queryDiv = $("<div class=\"search\"></div>").appendTo(objDiv),
                gridDiv = $("<div class=\"data\"></div>").appendTo(objDiv),
              grid = $("<div id=\"" + divid + "grid\"></div>").appendTo(gridDiv),
              resultCon = $("<div class='bottom'></div>").appendTo(objDiv),
             conditionDiv = $("<ul class=\"selectbig\" id=\"" + divid + "Con\"></ul>").appendTo(resultCon),
             span = $("<span>" + option.displayname + ":</span>").appendTo(queryDiv),
             input = $("<input id=\"txt_" + divid + "\"  type=\"text\" />").appendTo(queryDiv),
             btn = $("<input class=\"button\" type=\"button\" value=\"查询\" />")
                .click(function () {
                    obj.data("dataPageIndex", 1);
                    obj.data("dataStrConditon", input.val());
                    bigdata.bindGrid(obj, option, grid);
                }).appendTo(queryDiv);
            var btnClear = $("<input class=\"button\" type=\"button\" value=\"清空\" />")
                .click(function () {
                    obj.data("initValues", []);
                    bigdata.getSelNames(obj);
                    bigdata.setGrid(obj);
                    comm.bindChange(obj);
                }).appendTo(queryDiv);
            obj.data("dataStrConditon", input.val());

            $(document.body).append(objDiv);
            bigdata.getSelNames(obj);
            bigdata.bindGrid(obj, option, grid);
            jstools.setPosition(objDiv, obj);
            setTimeout(function () {
                jstools.bindMove(objDiv, obj);
            }, 100);

        },
        bindGrid: function (obj, option, grid) {
            var opts = {
                captionName: "",
                showrownum: true,
                analyzerpath: option.url,
                modal: false,
                isresize: false,
                analyzer: ajax.getParamOption(option, "grid", obj),
                //单元格属性
                paging: {
                    rowNum: 8,
                    rowList: [8]
                },
                col: {
                    sort: false,
                    property: [
                        { colindex: 0, hidden: true }
                    ]
                },
                mulCheck: {
                    ismulCheck: true,
                    isBoxOnly: false
                },
                toolbar: {
                    defaultShow: false
                },
                //绑定加载完成后事件
                callback: {
                    onMulCheck: function (rowid, rowdata, state) {
                        if (rowdata[0] == "" || rowdata[0] == undefined) {
                            return;
                        }
                        if (state) {
                            var index = -1;
                            if (option.hascheckall) {
                                index = comm.isExist("全部", obj);
                            }
                            if (index > -1) {
                                obj.data("initValues", [{ id: rowdata[0], name: rowdata[1] }]);
                            }
                            else {
                                if (option.selectmode == "single") {
                                    obj.data("initValues", [{ id: rowdata[0], name: rowdata[1] }]);
                                }
                                else {
                                    index = comm.isExist(rowdata[0], obj);
                                    if (index < 0) {
                                        obj.data("initValues").push({ id: rowdata[0], name: rowdata[1] });
                                    }
                                }
                            }
                        }
                        else {
                            var index = comm.isExist(rowdata[0], obj);
                            var source = obj.data("initValues");
                            if (source.length == 1) {
                                if (option.hascheckall) {
                                    source = [{
                                        id: "",
                                        name: "全部"
                                    }];
                                }
                            }
                            else {
                                source.splice(index, 1);
                            }
                            obj.data("initValues", source);
                        }
                        bigdata.getSelNames(obj);
                        comm.bindChange(obj);
                        bigdata.setGrid(obj);
                    },
                    gridComplete: function (objGrid, opts) {
                        obj.data("datasourcegrid", objGrid);
                        bigdata.setGrid(obj);
                    }
                }
            };
            // 初始化表格
            grid.smartgrid(opts);

        },
        setGrid: function (obj) {
            var objGrid = obj.data("datasourcegrid"),
            $ul = $("#" + obj[0].id + "_bigCon");
            objGrid.find("tr").each(function (i, item) {
                if (i > 0) {
                    var id = $(this).find("td").eq(2).text();
                    if ($ul.find("li[role='" + id + "']").length > 0) {
                        $(this).find("td").eq(1).find("input").eq(0).prop("checked", "checked");
                    }
                    else {
                        $(this).find("td").eq(1).find("input").eq(0).removeAttr("checked");
                    }
                }
            });
        },
        getSelNames: function (obj) {
            var source = obj.data("initValues"),
             str = "",
             divid = obj[0].id + "_bigCon",
             $ul = $("#" + divid).empty();
            $.each(source, function (i, val) {
                str += val.name + ",";
                var $li = $("<li>" + val.name + "</li>").attr({
                    "title": val.name,
                    role: val.id
                }).appendTo($ul);
                $("<i>&nbsp;</i>").click(function () {
                    var index = comm.isExist(val.id, obj);
                    var source = obj.data("initValues");
                    if (source.length > 1) {
                        source.splice(index, 1);
                    }
                    obj.data("initValues", source);
                    bigdata.getSelNames(obj);
                    comm.bindChange(obj);
                    bigdata.setGrid(obj);

                }).appendTo($li);
            });
            if (str.length > 0) {
                str = str.substr(0, str.length - 1);
            }
            obj.val(str);
        }
    };
    var comm = {
        showcomm: function (obj, option, data) {
            var divid = obj[0].id + "_comm";
            var $div;
            if ($("#" + divid).length > 0) {
                $("#" + divid).remove();
            }
            $div = $("<div class=\"dss_comm_small\" id=\"" + divid + "\"></div>");
            $div.css("width", obj.outerWidth())
                .addClass(option.selectmode == "multiple" ? "dss_comm_small_ck" : "dss_comm_small")
                .empty();
            var $ul = $("<ul></ul>");
            var isCk = option.selectmode == "multiple" ? true : false;
            $.each(data, function (i, val) {
                var $li = comm.createLi(val, obj, $ul, option, $div);
            });
            $div.append($ul);
            $(document.body).append($div);
            if ($div.height() > 300) {
                $div.css("height", "300px");
            }
            jstools.setPosition($div, obj);
            $div.css("z-index", option.zIndex);
            setTimeout(function () {
                jstools.bindMove($div, obj);
            }, 100);

        },
        createLi: function (item, obj, ul, option, div) {
            var li = $("<li></li>").appendTo(ul),
                span = $("<span>" + item.name + "</span>").appendTo(li),
                ischeck = (option.selectmode == "multiple");
            li.click(function () {
                if (ischeck) {
                    var ckTrue = $(this).hasClass("select");
                    if (item.name == "全部") {
                        if (ckTrue) {
                            ul.find("li").removeClass("select");
                            obj.data("initValues", []);
                        }
                        else {
                            ul.find("li").addClass("select");
                            obj.data("initValues", [item]);
                        }
                    }
                    else {
                        var source = obj.data("initValues"),
                         index = comm.isExist(item.name, obj),
                            tarsource = [];

                        if (index == -1) {
                            var datasource = obj.data("dataInit");
                            $.each(datasource, function (ii, it) {
                                if (it.name != item.name && it.name != "全部") {
                                    tarsource.push(it);
                                }
                            });
                            ul.find("li").eq(0).removeClass("select");
                            $(this).removeClass("select");
                            obj.data("initValues", tarsource);
                        }
                        else if (index > -1) {
                            source.splice(index, 1);
                            obj.data("initValues", source);
                            $(this).removeClass("select");
                        }
                        else {
                            source.push(item);
                            obj.data("initValues", source);
                            $(this).addClass("select");
                        }
                    }
                }
                else {
                    ul.find("li").removeClass("select");
                    obj.data("initValues", [item]);
                    $(this).addClass("select");
                }

                if (!ischeck) {
                    div.remove();
                }
                comm.getInitValues(obj);
                comm.bindChange(obj);
            });
            var intFlag = comm.isExist(item.name, obj);
            if (intFlag > -2) {
                if (ischeck) {
                    li.addClass("select");
                }
                else {
                    if (intFlag > -1) {
                        li.addClass("select");
                    }
                }
            } 
        },
        arrayClone: function (arrOld) {
            var clone = [];
            $.each(arrOld, function (i, val) {
                clone.push({ id: val.id, name: val.name });
            });
            return clone;
        },
        isExist: function (name, obj) {
            var flag = -2;
            var initvalues = obj.data("initValues");
            if (initvalues == null) {
                return -2;
            }
            if (initvalues.length > 0) {
                $.each(initvalues, function (i, val) {
                    if (val.id && name == val.id) {
                        flag = i;
                        return false;
                    }
                    else if (val.name == name) {
                        flag = i;
                        return false;
                    }
                    else if (val.name == "全部") {
                        flag = -1;
                        return false;
                    }
                });
            }
            return flag;
        },
        getInitValues: function (obj) {
            var initvalue = obj.data("initValues");
            var str = "";
            var id = "";
            $.each(initvalue, function (i, val) {
                str += val.name + ",";
                if (val.id != undefined) {
                    id += val.id + ",";
                }
            });
            if (str.length > 0) {
                str = str.substr(0, str.length - 1);
            }
            if (id.length > 0) {
                id = id.substr(0, id.length - 1);
            }
            if (str.length == 0) {
                str = "全部";
            }
            obj.val(str);
            return { selNames: str, selIds: id };
        },
        bindChange: function (obj) {
            var initvalue = obj.data("initValues");
            var otpion = obj.data("dataCondition");
            if (otpion.callback != null && otpion.callback != undefined) {
                if (typeof otpion.callback.changed == 'function') {
                    var names = [];
                    $.each(initvalue, function (i, val) {
                        names.push(val);
                    });
                    otpion.callback.changed({
                        dimname: otpion.dimname,
                        levelname: otpion.levelname,
                        selnames: names,
                        origKey: obj[0].id
                    });
                }
            }
        }
    };
    var tree = {
        init: function (obj, option) {
            comm.getInitValues(obj);
            obj.click(function () {
                tree.createPanel(obj, option);
            }).attr("readonly", "true");
        },
        createPanel: function (obj, option) {
            var divid = obj[0].id + "_tree";
            var $div;
            if ($("#" + divid).length > 0) {
                $("#" + divid).remove();
            }
            var width = obj.outerWidth() > 120 ? obj.outerWidth() : 120;
            $div = $("<div id=\"" + divid + "\" class='commselect'></div>");
            $div.css("width", width).empty();
            if (option.datasource.length == 0) {
                var div = $("<div></div>");
                var text = $("<input type=\"text\" style=\"height: 20px;\" />");
                text.css("width", width - 32);
                var button = $("<input type=\"button\" class=\"search\" value=\"\" />");
                button.click(function () {
                    tree.ajax(obj, option, $ul, text.val());
                });
                div.append(text).append(button);
                $div.append(div);
            }
            var treediv = $("<div style=\"overflow-x: scroll; overflow-y: auto; background-color: rgb(255, 255, 255);\"></div>")
            var $ul = $("<ul class=\"ztree\" id=\"" + divid + "_ul\"></ul>")
            .css("list-style", "none")
            .css("margin", "0px")
            .css("padding", "0px")
            .css("border-color", "urrentColor")
            .css("border-width", "0px")
            .css("border-style", "none;")
            .css("max-height", "400px")
            .css("min-height", "60px");
            treediv.append($ul);
            $div.append(treediv);
            obj.after($div);
            jstools.setPosition($div, obj);
            if (option.datasource.length > 0) {
                obj.data("dataInit", option.datasource);
                tree.bindTree(obj, option, $ul, "");
            }
            else {
                tree.ajax(obj, option, $ul, "");
            }

            $div.css("z-index", option.zIndex);
            jstools.bindMove($div, obj);
        },
        ajax: function (obj, option, ul, keyword) {
            var source = obj.data("dataInit");
            if (source != undefined && source.length > 0) {
                tree.bindTree(obj, option, ul, keyword);
                return;
            }
            $.ajax({
                url: dss.rootPath + 'javascript/JSControl/Condition/Hander/treedata.ashx',
                dataType: 'json',
                data: {
                    dimid: option.dimid,
                    hirename: option.hierarchiename,
                    filterValue: option.filterValue.join(','),
                    keyword: keyword
                },
                success: function (data) {
                    obj.data("dataInit", data);
                    tree.bindTree(obj, option, ul, keyword);
                },
                beforeSend: function () {
                    obj.addClass("commdataloading");
                },
                complete: function () {
                    obj.removeClass("commdataloading");
                }
            })
        },
        bindTree: function (obj, option, ul, keyword) {
            var setting = {
                check: {
                    enable: true,
                    chkStyle: "radio"
                },
                view: {
                    expandSpeed: ""
                },
                data: {
                    simpleData: {
                        enable: true
                    },
                    keep: {
                        parent: true
                    }
                },
                callback: {
                    onCheck: function (event, treeid, treeNode) {
                        var initdata = obj.data("initValues");
                        if (option.selectmode == "single" || initdata == undefined) {
                            initdata = [];
                        }
                        initdata.push(treeNode);
                        obj.data("initValues", initdata);
                        tree.getNodes(obj);
                        comm.bindChange(obj);

                    },
                    onCollapse: function (event, treeId, treeNode) {
                        if (option.datasource.length == 0) {
                            var treeObj = $.fn.zTree.getZTreeObj(obj[0].id + "_tree_ul");
                            treeObj.removeChildNodes(treeNode);
                            treeObj.refresh();
                        }
                    },
                    onClick: function (event, treeId, treeNode) {
                        var treeObj = $.fn.zTree.getZTreeObj(treeId);
                        treeObj.checkNode(treeNode, true, true, true);
                    }
                }
            };
            if (keyword.length == 0) {
                setting["async"] = {
                    enable: true,
                    url: dss.rootPath + "javascript/JSControl/Condition/Hander/treedata.ashx",
                    autoParam: ["name", "levelname", "dimid", "hirename", "name"]
                };
            }
            if (option.selectmode == "single") {
                setting.check.chkStyle = "radio";
                setting.check["radioType"] = "all";
            }
            else {
                setting.check.chkStyle = "checkbox";
            }
            var source = obj.data("dataInit");
            $.each(source, function (index, item) {
                item["checked"] = tree.isCheck(item, obj);
            });
            var objtree = $.fn.zTree.init(ul, setting, source);
            if (keyword.length > 0) {
                objtree.expandAll(true);
            }
            else if (option.datasource.length > 0) {
                objtree.expandAll(true);
            }
        },
        getNodes: function (obj) {
            var datasource = obj.data("initValues");
            var str = "";
            $.each(datasource, function (index, item) {
                str += item.name + ",";
            });
            if (str.length > 0) {
                str = str.substr(0, str.length - 1);
            }
            obj.val(str);
        },
        isCheck: function (node, obj) {
            var datasource = obj.data("initValues");
            var ischeck = false;
            $.each(datasource, function (index, item) {
                if (item.id) {
                    if (item.id == node.id) {
                        ischeck = true;
                    }
                    return false
                }
                else if (item.name == node.name) {
                    ischeck = true;
                    return false;
                }
            });
            return ischeck;
        }
    };
    var toolCommon = {
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
                            strArr.push(toolCommon.jsonToString(obj[i]));
                        }
                        return '[' + strArr.join(',') + ']';
                    } else if (obj == null) {
                        return 'null';

                    } else {
                        var string = [];
                        for (var property in obj) string.push(toolCommon.jsonToString(property) + ':' + toolCommon.jsonToString(obj[property]));
                        return '{' + string.join(',') + '}';
                    }
                case 'number':
                    return obj;
                default:
                    return obj;
            }
        },
        getAppRootPath: function () {
            var strFullPath = window.document.location.href;
            var strPath = window.document.location.pathname;
            var pos = strFullPath.indexOf(strPath);
            var prePath = strFullPath.substring(0, pos);
            var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
            return prePath + postPath + "/";
        }
    }
})(jQuery);