(function ($) {
    $.fn.timeControl = function (method) {
        if (content[method]) {
            return content[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            content.create.apply(this, arguments);
        }
        else {
            $.error('Method ' + method + ' does not exist on jQuery.timeControl');
        }
    }

    var content =
            {
                create: function (option) {
                    var obj = $(this);
                    var span = $("<div></div>");
                    span.css("margin-bottom", "4px")
                        .css("float", "left");
                    var item = $("<div></div>");
                    item.css("margin-bottom", "4px")
                        .css("float", "left");
                    var seltype = $("<select></select>");
                    if (!option.isOnlyShowHour) {
                        seltype.append("<option value=\"Day\">天</option>")
                    }
                    seltype.append("<option value=\"Hour\">小时</option>");
                    seltype.val(option.defaultTimeType);
                    item.append(seltype);
                    seltype.css("height", "22px");
                    var time = $("<div></div>");
                    time.css("margin-bottom", "4px")
                        .css("float", "left");
                    var input = $("<input type=\"text\" id=\"txtTime\" style=\"width: 100px\" />");
                    input.css("height", "17px");
                    option.data.range = false;
                    option.data.showTypeMonth = false;
                    option.data.showTypeWeek = false;
                    option.data.showTypeHour = false;
                    option.data.showTypeMinute = false;
                    input.timepicker(option.data);
                    time.append(input);

                    var hour = $("<div></div>");
                    hour.css("margin-bottom", "4px")
                        .css("float", "left");
                    var start = $("<select></select>");
                    var end = $("<select></select>");
                    start.css("height", "22px");
                    end.css("height", "22px");
                    for (var i = 0; i < 24; i++) {
                        var id = i;
                        if (i < 10) {
                            id = "0" + id;
                        }
                        var one = $("<option value=\"" + i + "\">" + id + "时</option>");
                        if (option.startHour.length > 0) {
                            if (option.startHour == (id + "时")) {
                                one.attr("selected", "selected");
                            }
                        }
                        var two = $("<option value=\"" + i + "\">" + id + "时</option>");
                        if (option.endHour.length > 0) {
                            if (option.endHour == (id + "时")) {
                                two.attr("selected", "selected");
                            }
                        }
                        start.append(one);
                        end.append(two)
                    }
                    hour.append(start)
                    .append("-")
                    .append(end);
                    if (option.defaultTimeType == "Day") {
                        hour.hide();
                    }
                    seltype.change(function () {
                        if (seltype.val() == "Day") {
                            hour.hide();
                        }
                        else {
                            hour.show();
                        }
                    });
                    start.change(function () {
                        var index = parseInt(start.val());
                        end.empty();
                        for (var i = index; i < 24; i++) {
                            var id = i;
                            if (i < 10) {
                                id = "0" + id;
                            }
                            end.append("<option value=\"" + i + "\">" + id + "时</option>");
                        }
                    });
                    obj.empty()
                    .append(span)
                    .append(item)
                    .append(time)
                    .append(hour);
                },
                getResult: function () {
                    var obj = $(this);
                    var sel = obj.find("select");
                    var input = obj.find("input");
                    var result = {
                        type: sel.eq(0).val(),
                        time: input.eq(0).timepicker("getDateStr"),//").find("option:selected").
                        hour: ''
                    };
                    if (sel.eq(0).val() == "Hour") {
                        result.hour = sel.eq(1).find("option:selected").text() + ":" + sel.eq(2).find("option:selected").text();
                    }
                    return result;
                }
            };
})(jQuery);
var method = {
    filter: {
        content: function (MeasureList, defaultStr, callback) {
            if (MeasureList.length > 0) {
                var gridcondition = $("<div class=\"gridcondition\"></div>");
                var left = $("<div class=\"left\"></div>");
                var tip = $("<div class=\"tip\">指标选择：</div>");
                var content = $("<div class=\"content\"></div>");
                var ul = $("<ul></ul>");
                var area = $("<textarea rows=\"13\" cols=\"50\"></textarea>");
                area.val(defaultStr)
                $.each(MeasureList, function (i, item) {
                    var li = $("<li>" + item.DisplayName + "</li>");
                    li.attr("unit", item.Unit)
                    .attr("measureid", item.MeasureID)
                    .click(function () {
                        method.filter.create($(this), area, gridcondition);
                    });
                    ul.append(li);
                });
                content.append(ul);
                left.append(tip)
                .append(content);
                var right = $("<div class=\"right\"></div>");
                var condition = $("<div class=\"condition\"><span>组合条件:</span></div>");
                var and = $("<input type=\"button\" value=\"且\" class=\"button\" />");
                and.click(function () {
                    area.val(area.val() + " and ");
                });
                var or = $("<input type=\"button\" value=\"或\" class=\"button\" />");
                or.click(function () {
                    area.val(area.val() + " or ");
                });
                var gt = $("<input type=\"button\" value=\"（\" class=\"button\" />");
                gt.click(function () {
                    area.val(area.val() + " ( ");
                });
                var lt = $("<input type=\"button\" value=\"）\" class=\"button\" />");
                lt.click(function () {
                    area.val(area.val() + " ) ");
                });
                var c = $("<input type=\"button\" value=\"清空\" class=\"button\" />");
                c.click(function () {
                    area.val("");
                });
                condition.append(and)
                .append(or)
                .append(gt)
                .append(lt)
                .append(c);
                var contentdata = $("<div class=\"content\"></div>");
                contentdata.append(area);
                var config = $("<div class=\"config\"></div>");

                var ok = $("<input type=\"button\" value=\"确定\" class=\"button\" />");
                var can = $("<input type=\"button\" value=\"取消\" class=\"button\" />");
                config.append(ok).append(can);
                right.append(condition).append(contentdata).append(config);
                can.click(function () {
                    gridcondition.remove();
                    $(".tcondition").eq(0).remove();
                });
                ok.click(function () {
                    if (typeof callback == 'function') {
                        callback(area.val());
                    }
                    gridcondition.remove();
                    $(".tcondition").eq(0).remove();
                })
                gridcondition.append(left)
                .append(right);
                var point = method.getMousePos();
                var x = (point.x - 700) > (window.innerWidth / 2 - 350) ? point.x - 700 : (window.innerWidth / 2 - 350);
                var y = (point.y - 300) > (window.innerHeight / 2 - 150) ? (point.y - 300) : (window.innerHeight / 2 - 150);
                gridcondition.css("top", y + "px")
                .css("left", x + "px")
                .css("position", "absolute")
                .css("z-index", "9999");;
                $(document.body).append(gridcondition);
            }
        },
        create: function (obj, tarobj, div) {
            var tcondition = $("<div class=\"tcondition\"></div>");
            var tip = $("<div class=\"tip\">" + obj.text() + "</div>");
            var p = ["<option value=\">\">大于</option>",
                    "<option value=\"<\">小于</option>",
                    "<option value=\"=\">等于</option>",
                    "<option value=\">=\">大于等于</option>",
                    "<option value=\"<=\">小于等于</option>"
            ];
            var first = $("<div class=\"first\"></div>");
            var firstsel = $("<select></select>");
            $.each(p, function (i, item) {
                firstsel.append(item);
            });
            var firstinput = $("<input type=\"text\" style=\"width: 80px;\" />");
            var firstspan = $("<span>" + obj.attr("unit") + "</span>");
            first.append(firstsel)
                .append(firstinput)
                .append(firstspan);
            var second = $("<div class=\"second\"></div>");
            var secondsel = $("<select disabled=\"disabled\"></select>");
            $.each(p, function (i, item) {
                secondsel.append(item);
            });
            var rd = $("<input type=\"radio\" />");
            var secondinput = $("<input type=\"text\" style=\"width: 80px;\" disabled=\"disabled\"/>");
            var secondspan = $("<span>" + obj.attr("unit") + "</span>");
            second.append(rd)
            .append(secondsel)
            .append(secondinput)
            .append(secondspan);
            rd.change(function () {
                if (rd.is(':checked')) {
                    secondinput.removeAttr("disabled");
                    secondsel.removeAttr("disabled");
                }
                else {
                    secondinput.attr("disabled", "disabled");
                    secondsel.attr("disabled", "disabled");
                }
            });
            var thir = $("<div class=\"thir\"></div>");
            var ok = $("<input type=\"button\" value=\"确定\" class=\"button\" />");
            var can = $("<input type=\"button\" value=\"取消\" class=\"button\" />");
            can.click(function () {
                tcondition.remove();
            });
            ok.click(function () {
                if (firstinput.val().length > 0) {
                    var str = tarobj.val() + " [" + obj.text() + "] " + firstsel.val() + " " + firstinput.val();
                    if (rd.is(':checked')) {
                        if (secondinput.val().length > 0) {
                            str += " and " + "[" + obj.text() + "] " + secondsel.val() + " " + secondinput.val();
                        }
                    }
                    tarobj.val(str);
                }
                tcondition.remove();
            });
            thir.append(ok)
            .append(can);
            tcondition.append(tip)
            .append(first)
            .append(second)
            .append(thir);
            tcondition.css("top", div.offset().top + 60)
              .css("left", div.offset().left + 20)
              .css("position", "absolute")
              .css("z-index", "10000");
            $(document.body).append(tcondition);
        }
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
    }
}