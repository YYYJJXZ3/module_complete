(function ($) {
    $.fn.controlmanager = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            methods.init.apply(this, arguments);
        }
        else {
            $.error('Method ' + method + ' does not exist on jQuery.controlmanager');
        }
    }
    var methods = {
        init: function (option) {
            var obj = $(this), opts = {};
            if (!option.conditions) {
                opts.conditions = option;
                opts.compatible = 1;
            }
            else {
                opts = $.extend(true, {
                    compatible: 0
                }, option);
            }
            if (!content.initOption) {
                content.initOption = opts;
            }
            content.init(opts, obj);
        },
        getSelResults: function () {
            if (content.initOption) {
                var result = [];
                var source = content.initOption.conditions;
                if (source.length > 0) {
                    for (var i = 0; i < source.length; i++) {
                        if (!source[i].defaultShow || source[i].defaultShow.length == 0) {
                            if (source[i].items.length > 0) {
                                var _ret = {
                                    dimid: source[i].items[0].dimid,
                                    dimname: source[i].items[0].dimname,
                                    hierarchieName: source[i].items[0].hierarchiename,
                                    key: source[i].key,
                                    lableName: source[i].labelname,
                                    levelName: source[i].items[0].levelname,
                                    value: [],
                                    valueIds: []
                                };
                                for (var j = 0; j < source[i].items[0].initValues.length; j++) {
                                    if (source[i].items[0].initValues[j].name == "全部") {
                                        _ret.value.push("");
                                        _ret.valueIds.push("");
                                    }
                                    else {
                                        _ret.value.push(source[i].items[0].initValues[j].name);
                                        if (source[i].items[0].initValues[j].id) {
                                            _ret.valueIds.push(source[i].items[0].initValues[j].id);
                                        }
                                        else {
                                            _ret.valueIds.push(source[i].items[0].initValues[j].name);
                                        }
                                    }
                                }
                                result.push(_ret);
                            }
                        }
                        else {
                            var flag = true;
                            for (var j = 0; j < source[i].items.length; j++) {
                                if (source[i].defaultShow == source[i].items[j].levelname) {
                                    var _ret = {
                                        dimid: source[i].items[j].dimid,
                                        dimname: source[i].items[j].dimname,
                                        hierarchieName: source[i].items[0].hierarchiename,
                                        key: source[i].key,
                                        lableName: source[i].labelname,
                                        levelName: source[i].items[j].levelname,
                                        value: [],
                                        valueIds: []
                                    };
                                    for (var k = 0; k < source[i].items[j].initValues.length; k++) {
                                        if (source[i].items[j].initValues[k].name == "全部") {
                                            _ret.value.push("");
                                            _ret.valueIds.push("");
                                        }
                                        else {
                                            _ret.value.push(source[i].items[j].initValues[k].name);
                                            if (source[i].items[j].initValues[k].id) {
                                                _ret.valueIds.push(source[i].items[j].initValues[k].id);
                                            }
                                            else {
                                                _ret.valueIds.push(source[i].items[j].initValues[k].name);
                                            }
                                        }
                                    }
                                    flag = false;
                                    result.push(_ret);
                                }
                            }
                            if (flag) {
                                if (source[i].items.length > 0) {
                                    var _ret = {
                                        dimid: source[i].items[0].dimid,
                                        dimname: source[i].items[0].dimname,
                                        hierarchieName: source[i].items[0].hierarchiename,
                                        key: source[i].key,
                                        lableName: source[i].labelname,
                                        levelName: source[i].items[0].levelname,
                                        value: [],
                                        valueIds: []
                                    };
                                    for (var j = 0; j < source[i].items[0].initValues.length; j++) {
                                        if (source[i].items[0].initValues[j].name == "全部") {
                                            _ret.value.push("");
                                            _ret.valueIds.push("");
                                        }
                                        else {
                                            _ret.value.push(source[i].items[0].initValues[j].name);
                                            if (source[i].items[0].initValues[j].id) {
                                                _ret.valueIds.push(source[i].items[0].initValues[j].id);
                                            }
                                            else {
                                                _ret.valueIds.push(source[i].items[0].initValues[j].name);
                                            }
                                        }
                                    }
                                    result.push(_ret);
                                }
                            }
                        }
                    }
                }
                return result;
            }
            var obj = $(this);
            return content.getResult(obj);
        },
        setSelLevelName: function (key, levelname, arrDefault) {
            var obj = $(this).find("div[key=\"" + key + "\"]");
            if (obj.length > 0) {
                var content = obj.eq(0).find("li[levelname=\"" + levelname + "\"]");
                if (content.length > 0) {
                    content.eq(0).click();
                }
            }
        },
        removeItemBylevelname: function (key, levelname, flag) {
            var obj = $("div[key=\"" + key + "\"]").eq(0).find("li[levelname=\"" + levelname + "\"]").eq(0);
            if (!flag) {
                obj.hide();
                if (obj.hasClass("selected")) {
                    var o = $("div[key=\"" + key + "\"]").eq(0).find("li");
                    if (o.eq(0).css("display") == "none") {
                        o.eq(1).addClass("selected")
                    }
                    else {
                        o.eq(0).addClass("selected");
                    }
                }
            }
            else {
                obj.show();
            }
        }
    };

    var content = {
        init: function (option, obj) {
            var opts = {
                isFirstInit: [],
                sum: 0
            },
            result = [],
            isSend = true;
            for (var i = 0; i < option.conditions.length; i++) {
                var item = $.extend(true, {
                    labelname: '维度',
                    width: 80,
                    key: i,
                    id: ("txt-" + obj[0].id + "-" + i),
                    defaultShow: '',
                    isShow: true,
                    type: 'text'
                }, option.conditions[i]);

                for (var j = 0; j < item.items.length; j++) {
                    var _item = $.extend(true, {
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
                        child: [],
                        url: dss.rootPath + "javascript/JSControl/Condition/Hander/bigdata.ashx",
                        depandencys: []
                    }, item.items[j]);


                    if (option.compatible == 1) {
                        if (_item.initValues.length == 0) {
                            _item.hascheckall = true;
                        }
                        else if (_item.initValues[0].name == "全部") {
                            _item.hascheckall = true;
                        }
                    }

                    item.items[j] = _item;

                    if (_item.child && _item.child.length > 0) {
                        for (var k = 0; k < _item.child.length; k++) {
                            if (_item.child[k] < option.conditions.length) {
                                opts.isFirstInit.push(_item.child[k]);
                            }
                        }
                    }
                }
                var defaultIndex = 0;
                if (item.defaultShow.length == 0) {
                    item.defaultShow = item.items[0].levelname;
                }
                else {
                    var flag = false;
                    for (var j = 0; j < item.items.length; j++) {
                        if (item.items[j].levelname == item.defaultShow) {
                            flag = true;
                            defaultIndex = j;
                            break;
                        }
                    }
                    if (!flag) {
                        item.defaultShow = item.items[0].levelname;
                    }
                }
                item.defaultIndex = defaultIndex;
                if (item.type == "dropdown" && (!item.items[item.defaultIndex].datasource || item.items[item.defaultIndex].datasource.length == 0)) {
                    if (opts.isFirstInit.indexOf(i) < 0) {
                        item.ischild = 0;
                        (function (rowIndex) {
                            isSend = false;
                            content.ajax(item, opts, option, obj, true);
                        })(i);
                    }
                    else {
                        item.ischild = 1;
                    }
                }
                else {
                    if (item.items.length > defaultIndex) {
                        if (item.items[defaultIndex]) {
                            var _tm = item.items[defaultIndex];
                            if (!_tm.hascheckall) {
                                if (_tm.initValues.length == 0) {
                                    if (_tm.datasource.length > 0) {
                                        item.items[defaultIndex].initValues = [item.items[defaultIndex].datasource[0]];
                                    }
                                }
                            }
                        }
                    }
                }
                result.push(item);
            }
            option.conditions = result;
            if (isSend) {
                content.content(obj, option);
            }
        },
        ajax: function (item, opts, option, obj, isfirst) {
            var _item = item.items[item.defaultIndex];
            $.ajax({
                url: _item.url,
                type: 'post',
                dataType: 'json',
                data: {
                    pagenum: 1,
                    pagerows: '80',
                    one: dss.jsonToString(tools.getParamOption(_item))
                },
                beforeSend: function () {
                    dss.load(true);
                    opts.sum = opts.sum + 1;
                },
                success: function (data) {
                    if (data.status == 0) {
                        var binddata = eval('(' + data.data.Source + ')');
                        if (binddata.records == 0) {
                            if (isfirst) {
                                item.type = "text";
                            }
                        }
                        else {
                            var flag = true, _source = tools.gridTodata(binddata);
                            if (isfirst && item.ischild == 0 && binddata.records < 80) {
                                _item.datasource = _source;
                            }
                            else {
                                _item.isAjax = 1;
                            }
                            if (binddata.records < 80) {
                                _item.initValues = tools.compare(_item.initValues, _source, _item, flag);
                            }
                        }
                    }
                },
                complete: function () {
                    if (_item.child.length > 0) {
                        for (var i = 0; i < _item.child.length; i++) {
                            var index = opts.isFirstInit.indexOf(_item.child[i]);
                            if (index > -1) {
                                opts.isFirstInit.splice(index, 1);
                            }
                            index = opts.isFirstInit.indexOf(_item.child[i]);
                            if (index < 0) {
                                if (_item.child[i] < option.conditions.length) {
                                    var tarItem = option.conditions[_item.child[i]];
                                    if (_item.initValues.length > 0) {
                                        tools.merge(_item, tarItem.items[tarItem.defaultIndex]);
                                    }
                                    content.ajax(tarItem, opts, option, obj, false);
                                }
                            }
                        }
                    }
                    opts.sum = opts.sum - 1;
                    if (opts.sum == 0) {
                        content.content(obj, option);
                    }
                    dss.load(false);
                }
            });
        },
        content: function (obj, option) {
            $.each(option.conditions, function (i, item) {
                var $div = $("<div></div>").css({
                    "margin-right": "10px",
                    "margin-bottom": "4px",
                    "float": "left"
                }).attr({
                    "key": item.key,
                    "manage": "condition",
                    "type": item.type,
                    "labelname": item.labelname,
                    "tarid": item.id
                }).appendTo(obj);
                if (item.items.length > 0) {
                    var ul = $("<ul></ul>").addClass("tabControl").appendTo($div);
                    $.each(item.items, function (l, k) {
                        var li = $("<li>" + k.levelname + "</li>").attr({
                            levelname: k.levelname
                        }).appendTo(ul);
                        if (item.defaultIndex == l) {
                            li.addClass("selected");
                        }
                        if (item.items.length > 1) {
                            (function (rowindex) {
                                li.click(function () {
                                    if (item.click && typeof item.click == 'function') {
                                        item.click(k.levelname, rowindex);
                                    }
                                    if (item.type == "dropdown") {
                                        content.setSelect($("#" + item.id), item.items[rowindex], option, 1, $div);
                                    }
                                    else {
                                        content.setSelect(null, item.items[rowindex], option, 2, $div);
                                    }
                                    li.parent().find("li").removeClass("selected");
                                    li.addClass("selected");
                                });
                            })(l);
                        }

                    });
                    if (!item.isShow) {
                        ul.hide();
                    }
                }
                if (item.type != "none") {
                    var inputid = $("<input />").attr({
                        id: item.id,
                        type: 'text'
                    }).css({
                        width: item.width,
                        "margin-left": "5px"
                    }).appendTo($div);
                    if (item.type == "dropdown") {
                        content.setSelect(inputid, item.items[item.defaultIndex], option, 0, $div);
                    }
                    else {
                        if (item.items[item.defaultIndex].initValues.length > 0) {
                            inputid.val(item.items[item.defaultIndex].initValues.join(','));
                        }
                        content.setSelect(null, item.items[item.defaultIndex], option, 2, $div);
                    }
                }
                else {
                    content.setSelect(inputid, item.items[item.defaultIndex], option, 3, $div);
                }

            });
            delete content.initOption;
            if (option.callback && typeof option.callback.completed == 'function') {

                option.callback.completed(content.getResult(obj));
            }
        },
        setSelect: function (txt, item, opts, flag, div) {
            div.attr({
                dimid: item.dimid,
                dimname: item.dimname,
                hierarchiename: item.hierarchiename,
                levelname: item.levelname
            });
            if (flag == 1) {
                txt.commonSelect("destroySelf");
            }
            else if (flag > 1) {
                return;
            }
            if (item.child && item.child.length > 0) {
                var callback = null;
                if (!item.callback) {
                    item.callback = {};
                }
                else {
                    if (item.callback.changed && typeof item.callback.changed == 'function') {
                        callback = item.callback.changed;
                    }
                }
                var changed = function (retOpts) {
                    for (var i = 0; i < item.child.length; i++) {
                        var id = null;
                        if (opts.conditions.length > item.child[i]) {
                            id = opts.conditions[item.child[i]].id;
                        }
                        if (id != null) {
                            var _p = [];
                            $.each(retOpts.selnames, function (k, l) {
                                if (l.name != "全部") {
                                    _p.push(l.name);
                                }
                            });
                            $("#" + id).commonSelect("resetDependency", {
                                levelname: retOpts.levelname,
                                selnames: _p
                            });
                        }
                    }

                    if (callback != null) {
                        callback(retOpts);
                    }
                }
                item.callback.changed = changed;
            }

            txt.commonSelect(item);
        },
        getResult: function (obj) {
            var result = [];
            if (obj.find("div[manage='condition']").length > 0) {
                obj.find("div[manage='condition']").each(function () {
                    var opts = {
                        dimid: $(this).attr("dimid"),
                        dimname: $(this).attr("dimname"),
                        hierarchieName: $(this).attr("hierarchiename"),
                        key: $(this).attr("key"),
                        lableName: $(this).attr("labelname"),
                        levelName: $(this).attr("levelname"),
                        value: [],
                        valueIds: []
                    };
                    var tarid = $(this).attr("tarid"),
                        type = $(this).attr("type"),
                        txt = $("#" + tarid);
                    if (type == 'text') {
                        opts.value.push(txt.val());
                        opts.valueIds.push(txt.val());
                    }
                    else if (type == 'dropdown') {
                        var source = txt.commonSelect("getSelResults");
                        if (source.length > 0) {
                            for (var i = 0; i < source.length; i++) {
                                if (source[i].name == "全部") {
                                    opts.value.push("");
                                    opts.valueIds.push("");
                                }
                                else {
                                    opts.value.push(source[i].name);
                                    if (source[i].id) {
                                        opts.valueIds.push(source[i].id);
                                    }
                                    else {
                                        opts.valueIds.push(source[i].name);
                                    }
                                }
                            }
                        }
                        else {
                            opts.value.push("");
                            opts.valueIds.push("");
                        }
                    }
                    result.push(opts);
                });
            }
            return result;
        }
    };
    var tools = {
        getParamOption: function (option) {
            var deps = option.depandencys,
                 depvalue = [];
            $.each(deps, function (i, val) {
                var _ret = {
                    levelName: val.levelname,
                    values: ""
                };
                for (var j = 0; j < val.selnames.length; j++) {
                    if (val.selnames[j] == "全部") {
                        _ret.values += "";
                    }
                    else {
                        _ret.values += val.selnames[j];
                    }
                    if (j < val.selnames.length - 1) {
                        _ret += ",";
                    }
                }
                depvalue.push(_ret);
            });
            var param = {
                themeName: option.themename,
                dimName: option.dimname,
                dimId: option.dimid,
                levelName: option.levelname,
                keyword: "",
                parentValue: depvalue,
                filterValue: option.filterValue.join(','),
                commType: "first",
                isAll: (option.hascheckall ? 1 : 0)
            };
            return param;
        },
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
        compare: function (initv, source, item, flag) {
            var result = [];
            if (initv && initv.length > 0) {
                if (flag) {
                    for (var i = 0; i < initv.length; i++) {
                        var data = "";
                        if (initv[i].id) {
                            data = initv[i].id;
                        }
                        else if (initv[i].name) {
                            data = initv[i].name;
                        }
                        for (var j = 0; j < source.length; j++) {
                            if (source[j].id && source[j].id == data) {
                                result.push(source[j]);
                                break;
                            }
                            else if (source[j].name && source[j].name == data) {
                                result.push(source[j]);
                                break;
                            }
                        }
                    }
                    if (result.length == 0) {
                        if (source.length > 0) {
                            result.push(source[0]);
                        }
                    }
                }
                else {

                }
            }
            else {
                if (source.length > 0) {
                    result.push(source[0]);
                }
            }
            return result;
        },
        merge: function (item, tarItem) {
            if (!tarItem.depandencys) {
                tarItem.depandencys = [];
            }
            var initValues = item.initValues;
            for (var i = 0; i < initValues.length; i++) {
                var flag = false;
                for (var j = 0; j < tarItem.depandencys.length; j++) {
                    if (tarItem.depandencys[j].levelname == item.levelname) {
                        if (tarItem.depandencys[j].selnames.indexOf(initValues[i].name) < 0) {
                            tarItem.depandencys[j].selnames.push(initValues[i].name);
                        }
                        flag = true;
                    }
                }
                if (!flag) {
                    tarItem.depandencys.push({
                        levelname: item.levelname,
                        selnames: [initValues[i].name]
                    });
                }
            }
        }
    };
})(jQuery);