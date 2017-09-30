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
            var obj = $(this);
            content.content(obj, option);
        },
        getSelResults: function () {
            var obj = $(this);
            var results = [];
            obj.find("div[manage=\"condition\"]")
                .each(function (i, item) {
                    var input = $(this).find("input").eq(0);
                    var option = {
                        key: $(this).attr("key"),
                        value: [],
                        lableName: $(this).attr("labelname"),
                        levelName: $(this).attr("levelname"),
                        hierarchieName: $(this).attr("hierarchiename"),
                        dimid: $(this).attr("dimid"),
                        dimname: $(this).attr("dimname")
                    };
                    if ($(this).attr("type") == "text") {
                        option.value.push(input.val());
                    }
                    else {
                        option.value = input.commonSelect("getSelNames");
                    }
                    results.push(option);
                });
            return results;
        }
    };

    var content = {
        content: function (obj, option) {
            $.each(option, function (i, param) {
                var item = $.extend(true, {
                    labelname: '维度',
                    width: 80,
                    key: i,
                    defaultShow: '',
                    type: 'text'
                }, param);
                var $div = $("<div></div>");
                $div.css("margin-right", "10px")
                .css("margin-bottom", "4px")
                .css("float", "left")
                .attr("key", item.key)
                .attr("manage", "condition")
                .attr("type", item.type)
                .attr("labelname", item.labelname);
                var $span = $("<span style=\"margin-right: 3px;\">" + item.labelname + "：</span>");
                var inputid = obj[0].id + "_con_" + i;
                var $input = $("<input id=\"" + inputid + "\" readonly=\"readonly\" type=\"text\" />");
                $input.css("width", item.width)
                .attr("readonly", "readonly");
                $div.append($span);
                if (item.type != "text") {
                    var tarItem = content.getobjbylevelname(item.defaultShow, item.items);
                    $input.commonSelect(tarItem);
                    content.setSelect($div,
                        tarItem.dimid,
                        tarItem.levelname,
                        tarItem.hierarchieName,
                        tarItem.dimname);
                    if (item.items.length > 1) {
                        var $sel = $("<select></select>");
                        $sel.css("height", "22px");
                        $input.css("height", "16px");
                        for (var j = 0; j < item.items.length; j++) {
                            var opt = $("<option value=\"" + item.items[j].levelname + "\">" + item.items[j].levelname + "</option>");
                            if (item.items[j].levelname == item.defaultShow) {
                                opt.attr("selected", "selected");
                            }
                            $sel.append(opt);
                        }
                        $sel.change(function () {
                            $input.commonSelect("destroySelf");
                            var keyitem = content.getobjbylevelname($(this).val(), item.items);
                            content.setSelect($div,
                                keyitem.dimid,
                                keyitem.levelname,
                                keyitem.hierarchieName,
                                keyitem.dimname);
                            keyitem.initValues = [];
                            $input.commonSelect(keyitem);
                        });
                        $div.append($sel);
                    }
                }
                else {
                    $input.val(item.items.length > 0
                        && item.items[0].initValues != undefined
                        ? item.items[0].initValues.join(",")
                        : "")
                        .removeAttr("readonly");
                }
                $div.append($input);
                obj.append($div);
            });
        },
        getobjbylevelname: function (levelname, arrList) {
            var result = null;
            $.each(arrList, function (i, item) {
                if (item.levelname == levelname) {
                    result = item;
                    return false;
                }
            });
            return result;
        },
        setSelect: function (obj, dimid, levelname, hierarchieName, dimname) {
            obj.attr("dimid", (dimid != undefined
                ? dimid
                : ""))
            .attr("levelname", (levelname != undefined
                ? levelname
                : ""))
            .attr("hierarchieName", (hierarchieName != undefined
                ? hierarchieName
                : ""))
            .attr("dimname", (dimname != undefined
                ? dimname
                : ""));
        }
    };
})(jQuery);