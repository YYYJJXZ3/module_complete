(function ($, undefined) {
    $.fn.jqChecxbox = function (option) {
        if (method[option]) {
            return method[option].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof option === 'object' || !option) {
            return method.init.apply(this, arguments);
        }
        else {
            $.error('Method' + option + 'does not exist on jQuery.jqChecxbox');
        }
    }

    var method = {
        init: function (option) {
            option = p_method.getOption(option);
            var _this = this.empty();
            $.each(option.datasource, function (i, item) {
                var li = $('<li>' + item.name + '</li>').appendTo(_this);
                li.click(function () {
                    if (option.selectmode == "single") {
                        _this.find("li").removeClass("selected");
                        $(this).addClass("selected");
                    }
                    else if (option.selectmode == "multiple") {
                        if ($(this).hasClass("selected")) {
                            $(this).removeClass("selected");
                        }
                        else {
                            $(this).addClass("selected");
                        }
                    }
                    else {
                        if (_this.find("li[class='selected']").length > 0) {
                            var flag = 0,
                              cl = $(this).index()// parseInt(.attr("role"));
                            _this.find("li").each(function () {
                                if ($(this).hasClass("selected")) {
                                    flag = $(this).index();//parseInt($(this).attr("role"));
                                    return false;
                                }
                            });
                            _this.find("li").removeClass("selected");
                            if (cl != flag) {
                                if (cl > flag) {
                                    for (var i = flag; i <= cl; i++) {
                                        _this.find("li").eq(i).addClass("selected");
                                    }
                                }
                                else {
                                    for (var i = cl; i <= flag; i++) {
                                        _this.find("li").eq(i).addClass("selected");
                                    }
                                }
                            }
                        }
                        else {
                            $(this).addClass("selected");
                        }
                    }
                }).attr({
                    role: item.id,
                    rolename: item.name
                });
            });
            $.each(option.initValues, function (i, item) {
                if (!p_method.isNullOrEmpty(item.id)) {
                    _this.find("li[role='" + item.id + "']").addClass("selected");
                }
                else if (!p_method.isNullOrEmpty(item.name)) {
                    _this.find("li[rolename='" + item.name + "']").addClass("selected");
                }
            });
        },
        getSelResults: function () {
            var result = [];
            this.find("li").each(function () {
                if ($(this).hasClass("selected")) {
                    result.push({
                        id: $(this).attr("role"),
                        name: $(this).attr("rolename")
                    });
                }
            });
            return result;
        },
        getSelIds: function () {
            var result = [];
            this.find("li").each(function () {
                if ($(this).hasClass("selected")) {
                    result.push($(this).attr("role"));
                }
            });
            return result;
        }
    };
    var p_method = {
        getOption: function (options) {
            options = $.extend(true, {
                datasource: [],
                selectmode: "single", //single multiple continuity
                initValues: []
            }, options);


            return options;
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
        }
    };
})(jQuery);