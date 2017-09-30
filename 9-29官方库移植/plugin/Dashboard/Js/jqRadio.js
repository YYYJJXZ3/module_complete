/*
  *Version:2.1215.1.1
  *Author:胡峰超
  *Date:2015-12-15
  *Description:主要实现单选功能
*/
(function ($) {
    var method = {
        createPanel: function (obj, option) {
            var orig = obj[0].id;
            var div = $("<div class=\"boxwrap\" id=\"rdJqRadio" + orig + "\"></div>");
            $.each(option.datasource, function (i, val) {
                var a = $("<a href=\"javascript:;\">" + val.name + "</a>")
                .data("initName", val.name)
                .data("initValue", val.id)
                .click(function () {
                    obj.find("a").each(function () {
                        $(this).removeClass("selected");
                    });
                    a.addClass("selected");
                    obj.data("initData", val);
                    if (typeof option.callback.change == 'function') {
                        option.callback.change(obj.data("initData"));
                    }
                });
                if (option.initValues != null) {
                    if (typeof option.initValues == 'object') {
                        if (val.name == option.initValues.name) {
                            a.addClass("selected");
                        }
                    }
                }
                else {
                    if (option.isDefault) {
                        if (i == 0) {
                            a.addClass("selected");
                            obj.data("initData", val);
                        }
                    }
                }
                div.append(a);
            });
            obj.append(div);
        }
    };
    var init = {
        init: function (options) {
            var page = $.extend(true, {
                initValues: null,       //初始化默认值
                isDefault: false,
                datasource: [],       //默认下拉值
                callback: {
                    change: null
                }
            }, options);
            var obj = $(this);
            obj.empty();
            obj.data("initData", page.initValues);
            obj.data("initSource", page.datasource);
            if (!obj.hasClass("rule-multi-radio")) {
                obj.addClass("rule-multi-radio");
            }
            if (!obj.hasClass("multi-radio")) {
                obj.addClass("multi-radio");
            }
            method.createPanel(obj, page);
        },
        getSelect: function () {
            var obj = $(this);
            var initVl = obj.data("initData");
            return initVl;
        },
        setSelOption: function (datasource, isKey) {
            var obj = $(this);
            var orig = obj[0].id;
            obj.data("initData", datasource);
            $("#rdJqRadio" + orig).find("a").each(function () {
                $(this).removeClass("selected");
                if (isKey) {
                    if (datasource.id == $(this).data("initValue")) {
                        $(this).addClass("selected");
                    }
                }
                else {
                    if (datasource.name == $(this).data("initName")) {
                        $(this).addClass("selected");
                    }
                }
            });
        }
    };
    $.fn.jqRadio = function (method) {
        if (init[method]) {
            return init[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method == "object" || !init) {
            init.init.apply(this, arguments);
        }
        else {
            $.error('Method' + method + 'does not exist on jQuery.jqCheckBox');
        }
    }
})(jQuery)