/*
  *Version:2.1215.1.1
  *Author:胡峰超
  *Date:2015-12-15
  *Description:主要实现复选功能
*/
(function ($) {
    var method = {
        createPanel: function (obj, option) {
            var orig = obj[0].id;
            var ul = $("<ul></ul>");
            if (option.datasource.length > 0) {
                $.each(option.datasource, function (i, item) {
                    var li = $("<li><a href=\"javascript:;\">" + item.name + "</a><i></i></li>");
                    li.attr("tarid", item.id)
                    .attr("tarname", item.name);
                    if (option.initValues.length > 0) {
                        var flag = method.getIndexOf(option.initValues, item.name);
                        if (flag > -1) {
                            li.addClass("selected");
                        }
                    }
                    li.click(function () {
                        if (li.hasClass("selected")) {
                            li.removeClass("selected");
                        }
                        else {
                            li.addClass("selected");
                        }
                        if (typeof option.callback.change == 'function') {
                            option.callback.change(method.getResult(obj));
                        }
                    });
                    ul.append(li);
                });
            }
            if (option.isSort) {
                if (typeof option.callback.stop == 'function') {
                    ul.sortable({
                        stop: function () {
                            var paramresult = [];
                            var paramresultsel = [];
                            obj.find("li").each(function () {
                                if ($(this).hasClass("selected")) {
                                    paramresultsel.push({
                                        id: $(this).attr("tarid"),
                                        name: $(this).attr("tarname")
                                    });
                                }
                                paramresult.push({
                                    id: $(this).attr("tarid"),
                                    name: $(this).attr("tarname")
                                });
                            });
                            option.callback.stop(paramresultsel, paramresult);
                        }
                    });
                }
                else {
                    ul.sortable();
                }
            }
            obj.append(ul);
        },
        getResult: function (obj) {
            var result = [];
            obj.find("li[class='selected']").each(function () {
                result.push({
                    id: $(this).attr("tarid"),
                    name: $(this).attr("tarname")
                });
            });
            return result;
        },
        getIndexOf: function (arrdata, name) {
            if (arrdata == null) {
                return -1;
            }
            for (var i = 0; i < arrdata.length; i++) {
                if (arrdata[i].name == name) {
                    return i;
                }
            }
            return -1;
        }
    };
    var init = {
        init: function (options) {
            var page = $.extend(true, {
                isSort: false,   //是否有全选控件
                initValues: [],       //初始化默认值
                datasource: [],       //默认下拉值
                callback: {
                    change: null,
                    stop: null
                }
            }, options);
            var obj = $(this);
            obj.empty();
            if (!obj.hasClass("multi-porp")) {
                obj.addClass("multi-porp");
            }
            method.createPanel(obj, page);
        },
        getSelect: function () {
            var obj = $(this);
            return method.getResult(obj);
        }
    };
    $.fn.jqCheckBox = function (method) {
        if (init[method]) {
            return init[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method == "object" || !init) {
            init.init.apply(this, arguments);
        }
        else {
            $.error('Method ' + method + ' does not exist on jQuery.jqCheckBox');
        }
    }
})(jQuery)