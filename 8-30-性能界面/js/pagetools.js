﻿(function (window) {
    var dss = window.dss || {};
    //绑定导航条
    var pageheader = dss.pageheader;
    if (typeof pageheader != 'function') {
        pageheader = function (divName, option) {
            dss.require(["pageheader"], function () {
                $("#" + divName).pageheader(option);
            });

        }
        dss.pageheader = pageheader;
    }
    //加载权限
    var authority = dss.authority;
    if (typeof authority != 'function') {
        authority = function (funName) {
            if (funName && typeof funName == 'function') {
                $.ajax({
                    url: dss.rootPath + "Services/frame/frame2.ashx?action=authority",
                    type: 'post',
                    dataType: 'json',
                    success: function (data) {
                        if (data.status == 0) {
                            var opts = data.data;
                            opts.checkUserOperation = function (keycode) {
                                if (opts.Role && opts.Role.OperationItemList && opts.Role.OperationItemList.length > 0) {
                                    for (var i = 0; i < opts.Role.OperationItemList.length; i++) {
                                        var item = opts.Role.OperationItemList[i];
                                        if (item.ItemCode == keycode) {
                                            return true;
                                        }
                                    }
                                }
                                return false;
                            }
                            opts.checkUserData = function (levelname, data) {
                                if (opts.DataRole) {
                                    if (opts.DataRole.Id == -1) {
                                        return true;
                                    }
                                    if (opts.DataRole.ItemList) {
                                        var flag = true;
                                        for (var i = 0; i < opts.DataRole.ItemList.length; i++) {
                                            if (opts.DataRole.ItemList[i].LevelName == levelname) {
                                                flag = false;
                                                var item = opts.DataRole.ItemList[i];
                                                for (var j = 0; j < item.MemberList.length; j++) {
                                                    if (item.MemberList[j].MemberDesc == data) {
                                                        return true;
                                                    }
                                                }
                                            }
                                        }
                                        return flag;
                                    }
                                }
                                return false;
                            }
                            funName(opts);
                        }
                        else {
                            var opts = {
                                checkUserOperation: function (keycode) {
                                    return false;
                                },
                                checkUserData: function (data) {
                                    return false;
                                }
                            };
                            funName(opts);
                        }
                    },
                    error: function () {
                        var opts = {
                            checkUserOperation: function (keycode) {
                                return false;
                            },
                            checkUserData: function (data) {
                                return false;
                            }
                        };
                        funName(opts);
                    }
                });
            }
        }
        dss.authority = authority;
    }
    //smartgrid处理
    var smartgrid = dss.smartgrid;
    if (typeof smartgrid != 'function') {
        smartgrid = function (divName, option) {
            dss.require(["grid"],
                function () {
                    return $("#" + divName).smartgrid(option);
                });
        }
        dss.smartgrid = smartgrid;
    }

    //SampleChart处理
    var samplechart = dss.samplechart;
    if (typeof samplechart != 'function') {
        samplechart = function (divName, option) {
            dss.require(["chart"],
                function () {
                    return $("#" + divName).SampleChart(option);
                })
        }
        dss.samplechart = samplechart;
    }

    //commonSelect处理
    var commonSelect = dss.commonSelect;
    if (typeof commonSelect != 'function') {
        commonSelect = function (divName, option) {
            dss.require(["jquery.ui", "comselect"], function () {
                return $("#" + divName).commonSelect(option);
            });
        }
        dss.commonSelect = commonSelect;
    }

    //timepicker处理
    var timepicker = dss.timepicker;
    if (typeof timepicker != 'function') {
        timepicker = function (divName, option) {
            dss.require(["jquery.ui", "timepicker"],
                function () {
                    return $("#" + divName).timepicker(option);
                });
        }
        dss.timepicker = timepicker;
    }

    var alertdialog = dss.alert;
    if (typeof alertdialog != 'function') {
        alertdialog = function (content, callback, title, time) {
            var opt = {
                title: title == null ? "" : title,
                content: content,
                okValue: '确定',
                ok: null
            };

            var timeParam = 0;
            var typeParam = -1;
            if (arguments.length == 4 && typeof arguments[3] == 'number') {
                if (arguments[3] > 500) {
                    timeParam = arguments[3];
                }
                else {
                    typeParam = arguments[3];
                }
            }
            else if (arguments.length > 5 && typeof arguments[5] == 'number') {
                timeParam = arguments[5];
                typeParam = arguments[3];
            }

            if (timeParam == 0 && opt.title.length == 0) {
                timeParam = 2000;
            }
            if (typeof callback == 'function') {
                opt.ok = function () {
                    callback(typeParam);
                }
            }
            dss.require(["dialog"], function () {
                var callfun = null;
                if (timeParam > 0) {
                    if (typeof opt.ok == 'function') {
                        callfun = opt.ok;
                        delete opt.ok;
                    }
                }
                var d = dialog(opt).showModal();
                if (timeParam > 0) {
                    if (callfun != null) {
                        callfun();
                    }
                    setTimeout(function () {
                        d.close();
                    }, timeParam);
                }
            });

        }
        dss.alert = alertdialog;
    }

    var confirmdialog = dss.confirm;
    if (typeof confirmdialog != 'function') {
        confirmdialog = function (content, yes, no) {
            dss.require(["dialog"], function () {
                var d = dialog({
                    title: "提示信息",
                    content: content,
                    button: [
                        {
                            id: '确定',
                            value: '确定',
                            callback: function () {
                                if (typeof yes == 'function') {
                                    yes();
                                }
                            }, autofocus: true
                        },
                        {
                            id: '取消',
                            value: '取消',
                            callback: function () {
                                if (typeof no == 'function') {
                                    no();
                                }
                            }
                        }
                    ]
                }).showModal();
            });
        }
        dss.confirm = confirmdialog;
    }

    var dialogs = dss.dialog;
    if (typeof dialogs != 'function') {
        dialogs = function (option) {
            var opt = {
                button: [],
                cancelValue: "关闭",
                cancelDisplay: false
            };
            opt = $.extend(true, opt, option);
            if (typeof option.buttons == 'object') {
                $.each(option.buttons, function (i, item) {
                    if (i == "关闭" || i == "取消") {
                        opt.button.push({
                            id: i,
                            callback: function () {
                                option.buttons[i]();
                                if (opt.isDelete && opt.isDelete == 1) {
                                    this.close();
                                    opt.content.hide();
                                    return false;
                                }
                            },
                            autofocus: false,
                            value: i
                        });
                    }
                    else {
                        opt.button.push({
                            id: i,
                            callback: function () {
                                var result = option.buttons[i]();
                                if (result == undefined) {
                                    result = true;
                                }
                                if (opt.isDelete && opt.isDelete == 1) {
                                    if (result) {
                                        this.close();
                                        opt.content.hide();
                                    }
                                    return false;
                                }
                                else {
                                    return result;
                                }
                            },
                            autofocus: false,
                            value: i
                        });
                    }

                });
            }
            opt.onshow = function () {
                if (option.open && typeof option.open == 'function') {
                    option.open();
                }
                if (typeof opt.content == 'object' && opt.content.length > 0&&(opt.isDelete!=0)) {
                    opt.content.show();
                    opt.isDelete=1;
                }
            }
            opt.onclose = function () {
                if (opt.close && typeof opt.close == 'function') {
                    opt.close();
                }
            }
            opt.cancel = function () {
                if (opt.isDelete && opt.isDelete == 1) {
                    this.close();
                    opt.content.hide();
                    return false;
                }
                return true;
            };
            dss.require(["dialog"], function () {

                var d = dialog(opt).showModal();
            })
        }
        dss.dialog = dialogs;
    }

    var table = dss.table;
    if (typeof table != 'function') {
        table = function (id, data) {
            var method = {
                create: function (param, id) {
                    var option = $.extend(true, {
                        datasource: null,
                        col: {
                            property: [
                                {

                                }
                            ]
                        },
                        width: '100%'
                    }, param);
                    if (option.datasource == null) {
                        alert("数据源不存在");
                        return;
                    }
                    var div = $("<div class='dss_auto'></div>");
                    div.css("width", option.width)
                    .css("height", option.height)
                    .css("overflow", "auto");
                    var tab = $("<table class='dss_auto_table'></table>");
                    tab.css("width", "100%");
                    var thead = $("<thead></thead>");
                    var trhead = $("<tr></tr>");
                    trhead.css("height", "22px");
                    $.each(option.datasource.colnames, function (i, item) {
                        var th = $("<th>" + item + "</th>");
                        th.css("text-align", "center");
                        trhead.append(th);
                    });
                    thead.append(trhead);
                    var tbody = $("<tbody></tbody>");
                    $.each(option.datasource.rows, function (i, item) {
                        var tr = $("<tr></tr>");
                        $.each(item, function (j, it) {
                            var td = $("<td></td>");
                            var condition = $.map(option.col.property,
                                function (k, l) {
                                    if (("col" + k.colindex) == j) {
                                        return k;
                                    }
                                });
                            if (condition.length > 0) {
                                var s = condition[0];
                                if (s.width != undefined) {
                                    td.css("width", s.width);
                                }
                                if (s.align != undefined) {
                                    td.css(" text-align", s.align);
                                }
                                if (s.bgcolor != undefined) {
                                    td.css("background-color", s.bgcolor);
                                }
                                if (s.fontcolor != undefined) {
                                    td.css("color", s.fontcolor);
                                }
                                if (typeof s.click == 'function') {
                                    td.click(function () {
                                        s.click(it, j, tab);
                                    }).css("cursor", "pointer");
                                }
                            }
                            td.append(it);
                            tr.append(td);
                        });
                        tbody.append(tr);
                    });
                    tab.append(thead).append(tbody);
                    div.append(tab);
                    $("#" + id).append(div);
                }
            };
            method.create(data, id);
        }
        dss.table = table;
    }
})(window)