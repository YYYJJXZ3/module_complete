var method = {
    initTree: function () {
        $.ajax({
            url: 'Handler/InitOperation.ashx',
            type: 'post',
            dataType: 'json',
            data: {
                act: 'getthemes',
                id: datasource.id
            },
            beforeSend: function () {
                dss.load(true);
            },
            success: function (data) {
                if (data.status == 0) {
                    if (!dss.isNullOrEmpty(data.data.rulenode)) {
                        datasource.node = data.data.rulenode;
                        datasource.initid = data.data.rulenode.TemplateID;
                        datasource.selectid = data.data.rulenode.TemplateID;
                        if (datasource.node) {
                            var opts = {};
                            if (datasource.node.Levels && datasource.node.Levels.length > 0) {
                                for (var i = 0; i < datasource.node.Levels.length; i++) {
                                    opts[datasource.node.Levels[i].ReplaceChar] = datasource.node.Levels[i];
                                }
                            }
                            datasource.alarm = {
                                level: opts,
                                one: datasource.node.AlarmRuleOne,
                                two: datasource.node.AlarmRuleTwo,
                                three: datasource.node.AlarmRuleThree,
                                four: datasource.node.AlarmRuleFour
                            };
                        }

                    }
                    if (!dss.isNullOrEmpty(data.data.SystemNameList)) {
                        datasource.SystemNameList = data.data.SystemNameList;
                    }
                    if (!dss.isNullOrEmpty(data.data.DepNameList)) {
                        datasource.DepNameList = data.data.DepNameList;
                    }
                    if (!dss.isNullOrEmpty(data.data.analyzer)) {
                        datasource.analyzer = data.data.analyzer;
                        method.bindData();
                    }
                    method.initSendLevel();
                    method.initSendLevelGroup();
                    var datas = {
                        datasource: data.data.Tree,
                        selectmode: "single",
                        initClass: "treedata",
                        initValues: [],
                        zIndex: 10000,
                        callback: {
                            changed: function (opts) {
                                var s = null;
                                if (opts && opts.selnames && opts.selnames.length > 0) {
                                    s = opts.selnames[0];
                                }
                                if (s != null && s.isParent == false) {
                                    datasource.selectid = s.id;
                                    method.initTemplate();
                                }
                                else {
                                    dss.alert("预警名称只能选中子节点");
                                    $("#dvContent").find("dl[role='g']").each(function () {
                                        $(this).hide();
                                    });
                                    $("#ulLevelNuml").find("li").unbind();
                                }
                            }
                        }
                    };

                    if (!dss.isNullOrEmpty(data.data.rulenode)) {
                        if (!dss.isNullOrEmpty(data.data.rulenode)) {
                            datas.initValues.push({
                                id: data.data.rulenode.TemplateID,
                                name: data.data.rulenode.Name
                            });
                        }
                    }

                    $("#txtName").commonSelect(datas);
                }
            },
            complete: function () {
                method.initTrue();
                method.initSystem();
                dss.load(false);
            }
        });
    },
    initSystem: function () {
        var ddl = $("#ddlSystem").empty();
        $("<option value='-1'>请选择</option>").appendTo(ddl);
        if (!dss.isNullOrEmpty(datasource.SystemNameList)) {
            $.each(datasource.SystemNameList, function (i, item) {
                $("<option value='" + item.id + "'>" + item.name + "</option>").appendTo(ddl)
            });
        }
        var ddlp = $("#ddlDept").empty();
        $("<option value='-1'>请选择</option>").appendTo(ddlp);
        if (!dss.isNullOrEmpty(datasource.DepNameList)) {
            $.each(datasource.DepNameList, function (i, item) {
                $("<option value='" + item.id + "'>" + item.name + "</option>").appendTo(ddlp)
            });
        }
        if (!dss.isNullOrEmpty(datasource.node)) {
            if (!dss.isNullOrEmpty(datasource.node)) {
                ddl.val(datasource.node.SystemName);
                ddlp.val(datasource.node.Department);
                $("#txtRemark").val(datasource.node.Remark);
            }
        }
    },
    initTrue: function () {
        var source = [
            { id: 1, name: '有效' },
            { id: 0, name: '无效' }
        ], initV = [{ id: 1, name: '有效' }];
        if (method.isEqual()) {
            if (!dss.isNullOrEmpty(datasource.node)) {
                if (datasource.node.IsTrue == 1) {
                    initV = [{ id: 1, name: '有效' }]
                }
                else {
                    initV = [{ id: 0, name: '无效' }]
                }

            }
        }
        $("#ulTrue").jqChecxbox({
            datasource: source,
            selectmode: 'single',
            initValues: initV
        });
    },
    initTemplate: function () {
        $.ajax({
            url: 'Handler/InitOperation.ashx',
            type: 'post',
            dataType: 'json',
            data: {
                act: 'gettemplate',
                id: datasource.selectid
            },
            beforeSend: function () {
                dss.load(true);
            },
            success: function (data) {
                if (data.status == 0) {
                    if (datasource.levels) {
                        datasource.levels = undefined;
                    }
                    datasource.analyzer = data.data;
                    method.bindData();
                    method.initSendLevelGroup();
                }
            },
            complete: function () {
                dss.load(false);
            }
        });
    },
    bindData: function () {
        var flag = 0;
        for (var i = 0; i < datasource.analyzer.RowDimList.length; i++) {
            if (datasource.analyzer.RowDimList[i].LevelName == "小时") {
                flag = 2;
            }
            if (datasource.analyzer.RowDimList[i].LevelName == "日") {
                if (flag == 0) {
                    flag = 1;
                }
            }
        }
        datasource.type = flag;
        datasource.source = method.getArrByFilter(datasource.analyzer.MeasureFilter);
        method.initEvent();
        method.timeRule();
        method.initTime();
        method.initSendLevel();
        $("#dvContent").find("dl[role='g']").each(function () {
            $(this).show();
        });
    },
    bindTable: function (className, roleNum) {
        $.ajax({
            url: 'Handler/file.html?ran=' + Math.random(),
            type: 'get',
            dataType: 'html',
            success: function (data) {
                dss.dialog({
                    content: data,
                    title: '规则设置',
                    open: function () {
                        var source = null,
                         isid = false,
                         tb = $("#tb").find("tbody").eq(0).empty();
                        $("#tb").show();
                        if (datasource.levels && datasource.levels[className]) {
                            source = datasource.levels[className];
                            if (source.length > 0) {
                                isid = true;
                            }
                            else {
                                source = datasource.source;
                            }
                        }
                        else {
                            if (!dss.isNullOrEmpty(datasource.node)) {
                                if (datasource.node[className]) {
                                    if (datasource.node[className].length > 0) {
                                        source = datasource.node[className];
                                    }
                                }
                            }
                        }
                        if (source == null) {
                            source = datasource.source;
                        }
                        $.each(source, function (i, item) {
                            var tr = $("<tr></tr>").appendTo(tb),
                                td = $("<td></td>"),
                                oper = $("<td></td>"),
                                ddl = $("<select></select>").appendTo(td),
                                input = $("<input type=\"text\" />").attr({
                                    "placeholder": "请输入阈值，参考值：" + item.OrgNum
                                }).css({
                                    width: '180px'
                                }),
                                mItem = method.getMeasureByName((item.MeasureID ? item.MeasureID : item.name), isid);
                            if (mItem != null) {
                                $("<td>" + mItem.DisplayName + "</td>").attr({
                                    mname: mItem.DisplayName,
                                    mid: mItem.MeasureID,
                                    orgstr: item.OrgStr,
                                    orgnum: item.OrgNum,
                                    ReplaceChar: item.ReplaceChar,

                                }).appendTo(tr);
                                $("<td>" + mItem.Unit + "</td>").appendTo(tr).css({
                                    "text-align": "center"
                                });
                                ddl.append($("<option value='1'>固定阈值</option>"));
                                ddl.append($("<option value='0'>自动阈值</option>"));
                                if (method.isEqual() || isid) {
                                    ddl.val(item.IsDefaultData);
                                    input.val((item.Data != null ? item.Data : ""));
                                }
                                ddl.change(function () {
                                    oper.empty();
                                    if ($(this).val() == "1") {
                                        oper.append(input);
                                    }
                                    else {
                                        method.getHtml(oper, item);
                                    }
                                });
                                td.appendTo(tr).css({
                                    "text-align": "center"
                                });
                                oper.appendTo(tr);

                                if (item.IsDefaultData == "1") {
                                    oper.append(input);
                                }
                                else {
                                    method.getHtml(oper, item, isid);
                                }
                            }
                        });
                    },
                    buttons: {
                        "确定": function () {
                            var tb = $("#tb").find("tbody").eq(0),
                                result = [];
                            tb.find("tr").each(function () {
                                var td = $(this).find("td").eq(0),
                                    tdselect = $(this).find("td").eq(2).find("select").eq(0),
                                    level = {
                                        OrgStr: td.attr("orgstr"),
                                        OrgNum: td.attr("orgnum"),
                                        ReplaceChar: td.attr("ReplaceChar"),
                                        MeasureID: td.attr("mid"),
                                        FloatNum: 0,
                                        Data: 0,
                                        RuleType: "0",
                                        IsDefaultData: tdselect.val()
                                    };

                                if (tdselect.val() == "1") {
                                    var ds = $(this).find("td").eq(3).find("input").eq(0).val();
                                    level.Data = ds.length > 0 ? ds : "0";
                                }
                                else {
                                    var t = $(this).find("td").eq(3),
                                        s = t.find("select").eq(0),
                                        p = t.find("input").eq(0);
                                    level.FloatNum = (p.val().length > 0 ? p.val() : 0);
                                    level.RuleType = s.val();
                                }
                                result.push(level);
                            });
                            if (!datasource.levels) {
                                datasource.levels = {};
                            }
                            datasource.levels[className] = result;
                        },
                        "取消": function () { }
                    }
                });
            }
        });
    },
    initEvent: function () {
        var ul = $("#ulLevelNuml");
        ul.find("li").each(function () {
            $(this).unbind().click(function () {
                var role = $(this).attr("role"),
                    content = "",
                    desc = "";
                if (role == "1") {
                    if (datasource.alarm) {
                        if (datasource.alarm.one) {
                            content = datasource.alarm.one;
                        }
                    }
                }
                else if (role == "2") {
                    if (datasource.alarm && datasource.alarm.two)
                        content = datasource.alarm.two;
                }
                else if (role == "3") {
                    if (datasource.alarm && datasource.alarm.three)
                        content = datasource.alarm.three;
                }
                else {
                    if (datasource.alarm && datasource.alarm.four)
                        content = datasource.alarm.four;
                }

                toolbar.filter.init(ul, datasource.analyzer, content, role);
            });
        });


    },
    initTime: function () {
        var week = [
                { id: 1, name: '星期一' },
                { id: 2, name: '星期二' },
                { id: 3, name: '星期三' },
                { id: 4, name: '星期四' },
                { id: 5, name: '星期五' },
                { id: 6, name: '星期六' },
                { id: 0, name: '星期日' },
        ],
        hour = [],
        start = 0,
        hourType = "continuity",
        weekInit = [],
        hourInit = [];
        if (method.isEqual()) {
            if (!dss.isNullOrEmpty(datasource.node)) {
                var _weekInit = datasource.node.Day.split(',');
                var _hourInit = datasource.node.Hour.split(',');
                $.each(_weekInit, function (i, item) {
                    switch (item) {
                        case "1":
                            weekInit.push({ id: 1, name: '星期一' });
                            break;
                        case "2":
                            weekInit.push({ id: 2, name: '星期二' });
                            break;
                        case "3":
                            weekInit.push({ id: 3, name: '星期三' });
                            break;
                        case "4":
                            weekInit.push({ id: 4, name: '星期四' });
                            break;
                        case "5":
                            weekInit.push({ id: 5, name: '星期五' });
                            break;
                        case "6":
                            weekInit.push({ id: 6, name: '星期六' });
                            break;
                        default:
                            weekInit.push({ id: 0, name: '星期日' });
                            break;
                    }
                });
                $.each(_hourInit, function (i, item) {
                    hourInit.push({
                        id: item,
                        name: (item < 10 ? "0" + item : item) + "时"
                    });
                });
            }
        }
        $("#ulDay").jqChecxbox({
            datasource: week,
            selectmode: "continuity",
            initValues: weekInit
        });
        if (datasource.type == 1) {
            start = 8;
            hourType = "single";
        }
        for (var i = start; i < 24; i++) {
            hour.push({
                id: i,
                name: (i < 10 ? "0" + i : i) + "时"
            });
        }
        $("#ulHour").jqChecxbox({
            datasource: hour,
            selectmode: hourType,
            initValues: hourInit
        });
    },
    initSendLevelGroup: function () {
        var groupItems = [];
        var initvals = [];
        if (datasource.node != null && datasource.node.SendGroupLevel.length > 0) {
            var nams = datasource.node.SendGroupLevel.split(",");
            for (var i = 0; i < nams.length; i++) {
                initvals.push({ id: nams[i], name: nams[i] });
            }
        }
        if (datasource.analyzer != null) {
            var rowdims = datasource.analyzer.RowDimList;
            for (var i = 0; i < rowdims.length; i++) {
                if (rowdims[i].LevelName != "日" && rowdims[i].LevelName != "月" && rowdims[i].LevelName != "周" &&
                    rowdims[i].LevelName != "小时") {
                    groupItems.push({ id: rowdims[i].LevelName, name: rowdims[i].LevelName });
                }
            }
        }
        $("#ulGroup").jqChecxbox({
            datasource: groupItems,
            selectmode: "multiple",
            initValues: initvals
        });
    },
    initSendLevel: function () {
        var initvals = [];
        if (datasource.node != null && datasource.node.SendGroupLevel.length > 0) {
            if (datasource.node.SendGroupLevel == "0") { initvals.push({ id: "0", name: "整体派单" }); }
            else
            {
                initvals.push({ id: "2", name: "分组派单" }); $("#dlGroup").show();
            }
            var nams = datasource.node.SendGroupLevel.split(",");
            for (var i = 0; i < nams.length; i++) {
                initvals.push({ id: nams[i], name: nams[i] });
            }
        }
        else {
            initvals.push({ id: "1", name: "逐条派单" });
        }
        $("#ulSendLevel").jqChecxbox({
            datasource: [{ id: "0", name: "整体派单" }, { id: "1", name: "逐条派单" }, { id: "2", name: "分组派单" }],
            selectmode: "single",
            initValues: initvals
        });
        $("#ulSendLevel").find("li").each(function () {
            $(this).click(function () {
                if ($(this).attr("role") == "2") {
                    $("#dlGroup").show();
                }
                else {
                    $("#dlGroup").hide();
                }
            });
        });
    },
    timeRule: function () {
        var dd = $("#ddTime").empty(),
            ddl = $("<select></select>"),
            dc = $("<select></select>"),
            da = $("<select></select>");
        dd.append("向前&nbsp;&nbsp;");
        dd.append(ddl);
        if (datasource.type == 1) {
            for (var i = 1; i < 16; i++) {
                $("<option value='" + i + "'>" + (i < 10 ? "0" + i : i) + "</option>").appendTo(ddl);
            }
            dd.append("&nbsp;&nbsp;天出现&nbsp;&nbsp;");
        }
        else {
            for (var i = 1; i < 25; i++) {
                $("<option value='" + i + "'>" + (i < 10 ? "0" + i : i) + "</option>").appendTo(ddl);
            }
            dd.append("&nbsp;&nbsp;小时出现&nbsp;&nbsp;");
        }

        dd.append(dc);
        if (datasource.type == 1) {
            for (var i = 1; i < 16; i++) {
                $("<option value='" + i + "'>" + (i < 10 ? "0" + i : i) + "</option>").appendTo(dc);
            }
            dd.append("&nbsp;&nbsp;天异常");
        }
        else {
            for (var i = 1; i < 25; i++) {
                $("<option value='" + i + "'>" + (i < 10 ? "0" + i : i) + "</option>").appendTo(dc);
            }
            dd.append("&nbsp;&nbsp;小时异常");
        }
        dd.append("&nbsp;&nbsp;推后&nbsp;&nbsp;");
        dd.append(da);
        dd.append("&nbsp;&nbsp;天执行；");
        for (var i = 1; i < 15; i++) {
            $("<option value='" + i + "'>" + (i < 10 ? "0" + i : i) + "</option>").appendTo(da);
        }
        if (method.isEqual()) {
            if (!dss.isNullOrEmpty(datasource.node)) {

                if (datasource.node.Contiunity > 0) {
                    ddl.val(datasource.node.Contiunity);
                }

            }
            if (!dss.isNullOrEmpty(datasource.node)) {

                if (datasource.node.Abnormal > 0) {
                    dc.val(datasource.node.Abnormal);
                }

            }
            if (!dss.isNullOrEmpty(datasource.node)) {

                if (datasource.node.PushBack > 0) {
                    da.val(datasource.node.PushBack);
                }

            }
        }
        ddl.change(function () {
            var _num = parseInt($(this).val());
            dc.empty();
            for (var i = 1; i <= _num; i++) {
                $("<option value='" + i + "'>" + (i < 10 ? "0" + i : i) + "</option>").appendTo(dc);
            }
        });
    },
    getHtml: function (td, item, isid) {
        var ddl = $("<select></select>").appendTo(td),
         input = $("<input type=\"text\" />");
        if (datasource.type == 1) {
            $("<option value='1'>上周平均</option>").appendTo(ddl);
            $("<option value='2'>上周最大</option>").appendTo(ddl);
            $("<option value='3'>上周最小</option>").appendTo(ddl);
            $("<option value='4'>上月平均</option>").appendTo(ddl);
            $("<option value='5'>上月最大</option>").appendTo(ddl);
            $("<option value='6'>上月最小</option>").appendTo(ddl);
        }
        else {
            $("<option value='7'>上一天平均</option>").appendTo(ddl);
            $("<option value='8'>上一天最大</option>").appendTo(ddl);
            $("<option value='9'>上一天最小</option>").appendTo(ddl);
            $("<option value='10'>上周同一天平均</option>").appendTo(ddl);
            $("<option value='11'>上周同一天最大</option>").appendTo(ddl);
            $("<option value='12'>上周同一天最小</option>").appendTo(ddl);
        }
        if (method.isEqual() || isid) {
            ddl.val(item.RuleType);
            input.val((item.FloatNum != null ? item.FloatNum : ""));
        }
        td.append("&nbsp;&nbsp;上浮：")

        input.appendTo(td);
        td.append("%");
    },
    isPositiveNum: function (input) {//是否为正整数     
        var re = /^[0-9]*[1-9][0-9]*$/;
        return re.test(input)
    },
    getArrByFilter: function (strFilter) {
        var part = strFilter.replace(/\)|\(/g, ""),
            arr = part.split(/and|or|AND|OR/g),
            result = [];
        for (var i = 0; i < arr.length; i++) {
            var str = arr[i],
                r = /\[(.+?)\]/,
                m = r.exec(str),
                n = /[1-9]\d*.\d*|0.\d*[1-9]\d*/,
                num = n.exec(str);
            if (m != null) {
                result.push({
                    OrgStr: str,
                    name: (m.length > 1 ? m[1] : ""),
                    OrgNum: (num != null && num.length > 0 ? num[0] : 0),
                    ReplaceChar: "$" + i,
                    FloatNum: null,
                    Data: null,
                    RuleType: "1",
                    IsDefaultData: "1"
                });
            }
        }
        return result;
    },
    getMeasureByName: function (name, isid) {
        var result = null;
        for (var i = 0; i < datasource.analyzer.MeasureList.length; i++) {

            if (datasource.analyzer.MeasureList[i].DisplayName == name || datasource.analyzer.MeasureList[i].MeasureID == name) {
                result = datasource.analyzer.MeasureList[i];
                break;
            }

        }
        return result;
    },
    isEqual: function () {
        if (datasource.initid == datasource.selectid) {
            return true;
        }
        return false;
    }
}

var toolbar = {
    filter: {
        init: function (obj, analyzer, content, levelNum) {
            var id = obj[0].id;
            if (!datasource.alarm) {
                datasource.alarm = {
                    temp: {},
                    level: {}
                };
            }
            if (!datasource.alarm.level) {
                datasource.alarm.level = {};
            }
            datasource.alarm.temp = $.extend(true, {}, datasource.alarm.level);
            $.ajax({
                url: dss.rootPath + "plugin/Alarm/js/filte.html?ran=" + Math.random(),
                type: 'get',
                dataType: 'html',
                success: function (data) {
                    data = data.replace(/\[-id-\]/g, id);
                    dss.dialog({
                        content: data,
                        title: '过滤设置',
                        open: function () {
                            toolbar.filter.setDesc(id, levelNum);
                            toolbar.filter.filterContent(analyzer, id, content, levelNum);
                        },
                        close: function () {
                            toolbar.filter.removeFildata(id);
                        },
                        buttons: {
                            "确定": function () {
                                var retStr = $("#" + id + "_filter_db").find("textarea").eq(0).val(),
                                    resStr = retStr.replace(/\s+/g, ' ');
                                if (resStr.length > 0) {
                                    if (!toolbar.filter.valid.content(retStr, analyzer.MeasureList)) {
                                        dss.alert("指标表达式不正确，请验证");
                                        return false;
                                    }
                                }
                                datasource.alarm.level = datasource.alarm.temp;
                                if (levelNum == "1") {
                                    datasource.alarm.one = retStr;
                                }
                                else if (levelNum == "2") {
                                    datasource.alarm.two = retStr;
                                }
                                else if (levelNum == "3") {
                                    datasource.alarm.three = retStr;
                                }
                                else {
                                    datasource.alarm.four = retStr;
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
        filterContent: function (analyzer, id, content, levelNum) {
            var $_content = $("#" + id + "_filter_db"),
                      $_ul = $("#" + id + "_filter_con"),
                      textarea = $_content.find("textarea").eq(0);
            if (analyzer && analyzer.MeasureList && analyzer.MeasureList.length > 0) {
                $.each(analyzer.MeasureList, function (i, item) {
                    $("<li></li>").attr({
                        "measureid": item.MeasureID,
                        "unit": item.Unit
                    }).click(function () {
                        toolbar.filter.filterData($(this), id, textarea, levelNum);
                    }).text(item.DisplayName).appendTo($_ul);
                });
            }
            if (content && content.length > 0) {
                textarea.val(content);
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
        filterData: function (obj, id, text, levelNum) {
            $.ajax({
                url: dss.rootPath + "plugin/Alarm/js/setdate.html?ran=" + Math.random(),
                type: 'get',
                dataType: 'html',
                success: function (data) {
                    data = data.replace(/\[-id-\]/g, id);
                    toolbar.filter.removeFildata(id);
                    $(document.body).append(data);
                    var $_content = $("#" + id + "_set_data").css({
                        "z-index": 10000,
                        top: text.offset().top - 30,
                        left: text.offset().left - 100
                    }),
                        title = obj.text(),
                         select = $("#" + id + "_set_select"),
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
                    btns.eq(0).click(function () {
                        var ddl = $_content.find("select").eq(0),
                               type = $_content.find("select").eq(1),
                               txtData = text.val(),
                               rChar = "$0",
                               dataValue = input.val();
                        if (type.val() == "0" && dataValue.length == 0) {
                            toolbar.filter.removeFildata(id);
                            return;
                        }
                        if (type.val() == "1") {
                            if (datasource.alarm) {
                                if (datasource.alarm.temp) {
                                    for (var i = 0; i < 1000; i++) {
                                        rChar = "$" + i;
                                        if (!datasource.alarm.temp[rChar]) {
                                            break;
                                        }
                                    }
                                }
                                else {
                                    datasource.alarm.temp = {};
                                }
                            }
                            else {
                                datasource.alarm = {
                                    level: {}
                                };
                            }
                            datasource.alarm.temp[rChar] = {
                                Level: levelNum,
                                ReplaceChar: rChar,
                                RuleType: $_content.find("select").eq(2).val(),
                                MeasureID: obj.attr("measureid"),
                                FloatNum: (dataValue.length == 0 ? 0 : dataValue)
                            };
                            dataValue = rChar;
                        }
                        switch (ddl.val()) {
                            case "0":
                                txtData += " [" + obj.text() + "] > " + dataValue;
                                break;
                            case "1":
                                txtData += " [" + obj.text() + "] >= " + dataValue;
                                break;
                            case "2":
                                txtData += " [" + obj.text() + "] = " + dataValue;
                                break;
                            case "3":
                                txtData += " [" + obj.text() + "] <= " + dataValue;
                                break;
                            default:
                                txtData += " [" + obj.text() + "] < " + dataValue;
                                break;
                        }
                        text.val(txtData);
                        toolbar.filter.setDesc(id, levelNum);
                        toolbar.filter.removeFildata(id);
                    });

                    select.find("select").eq(1).change(function () {
                        if ($(this).val() == "1") {
                            var ddl = select.find("select").eq(2).show().empty();
                            if (datasource.type == 1) {
                                $("<option value='1'>上周平均</option>").appendTo(ddl);
                                $("<option value='2'>上周最大</option>").appendTo(ddl);
                                $("<option value='3'>上周最小</option>").appendTo(ddl);
                                $("<option value='4'>上月平均</option>").appendTo(ddl);
                                $("<option value='5'>上月最大</option>").appendTo(ddl);
                                $("<option value='6'>上月最小</option>").appendTo(ddl);
                            }
                            else {
                                $("<option value='7'>上一天平均</option>").appendTo(ddl);
                                $("<option value='8'>上一天最大</option>").appendTo(ddl);
                                $("<option value='9'>上一天最小</option>").appendTo(ddl);
                                $("<option value='10'>上周同一天平均</option>").appendTo(ddl);
                                $("<option value='11'>上周同一天最大</option>").appendTo(ddl);
                                $("<option value='12'>上周同一天最小</option>").appendTo(ddl);
                            }
                            select.find("input").eq(0).attr("placeholder", "请输入浮动值");
                        }
                        else {
                            select.find("select").eq(2).hide();
                            select.find("input").eq(0).attr("placeholder", "请输入阈值");
                        }
                    })
                }
            });
        },
        removeFildata: function (id) {
            if ($("#" + id + "_set_data").length > 0) {
                $("#" + id + "_set_data").remove();
            }
        },
        valid: {
            isNum: function (str) {
                if (str.indexOf('$') > -1) {
                    return true;
                }
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
        },
        setDesc: function (id, levelNum) {
            var desc = $("#" + id + "_filter_desc").empty();
            if (datasource.alarm && datasource.alarm.temp) {
                $.each(datasource.alarm.temp, function (i, item) {
                    if (item.Level == levelNum) {
                        var te = "上周平均";
                        switch (item.RuleType) {
                            case "2":
                                te = "上周最大";
                                break;
                            case "3":
                                te = "上周最小";
                                break;
                            case "4":
                                te = "上月平均";
                                break;
                            case "5":
                                te = "上月最大";
                                break;
                            case "6":
                                te = "上月最小";
                                break;
                            case "7":
                                te = "上一天平均";
                                break;
                            case "8":
                                te = "上一天最大";
                                break;
                            case "9":
                                te = "上一天最小";
                                break;
                            case "10":
                                te = "上周同一天平均";
                                break;
                            case "11":
                                te = "上周同一天最大";
                                break;
                            case "12":
                                te = "上周同一天最小";
                                break;
                            default:
                                te = "上周平均";
                                break;
                        }
                        $("<span></span>").text(i + ":" + te + "浮动" + item.FloatNum + "%;").appendTo(desc);
                    }
                });
            }
        }
    },
};