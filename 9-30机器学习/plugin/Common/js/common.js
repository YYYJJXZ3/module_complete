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
var methods = {
    filter: {
        content: function (MeasureList, defaultStr, callback, itemname, app, ev) {
            if (MeasureList.length > 0) {
                var gridcondition = $("<div class=\"dss_grid_filter\"></div>");
                var left = $("<div class=\"left\"></div>");
                var tip = $("<div class=\"tip\">指标选择：</div>");
                var content = $("<div class=\"content\"></div>");
                var ul = $("<ul></ul>");
                var area = $("<textarea style=\"width:380px;height:230px;\"></textarea>");
                area.val(defaultStr)
                $.each(MeasureList, function (i, item) {
                    var li = $("<li>" + item.DisplayName + "</li>");
                    li.attr("unit", item.Unit)
                    .attr("measureid", item.MeasureID)
                    .click(function () {
                        methods.filter.create($(this), area, gridcondition);
                    });
                    ul.append(li);
                });
                content.append(ul);
                left.append(tip)
                .append(content);
                var right = $("<div class=\"right\" style='width:400px;'></div>");
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
                var r = $("<input type=\"button\" value=\"默认\" class=\"button\" />");
                r.click(function () {
                    $.ajax({
                        url: dss.rootPath + 'plugin/Common/ashx/tool.ashx',
                        data: {
                            item: itemname,
                            app: app,
                            act: 'defaultdata', listid: dss.request("listid")
                        },
                        success: function (data) {
                            area.val(data);
                        }
                    })
                });
                condition.append(and)
                .append(or)
                .append(gt)
                .append(lt)
                .append(c)
                .append(r);
                var contentdata = $("<div class=\"content\"></div>");
                contentdata.append(area);
                right.append(condition).append(contentdata);

                gridcondition.append(left)
                .append(right);
                gridcondition.dialog({
                    width: 650,
                    title: '指标过滤',
                    buttons: {
                        '确定': function () {
                            if (typeof callback == 'function') {
                                callback(area.val());
                            }
                            gridcondition.dialog("close");
                            $(".tcondition").eq(0).remove();
                        },
                        '取消': function () {
                            gridcondition.dialog("close");
                            $(".tcondition").eq(0).remove();
                        }
                    }
                })
            }
        },
        create: function (obj, tarobj, div) {
            var tcondition = $("<div class=\"dss_condition\"></div>");
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
            var rd = $("<input type=\"checkbox\" />");
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
    init: function (option, id) {
        var tools = {
            getWidth: function (obj, len) {
                var itemwidth = (100 - (len + 1) * 100 / obj.width()) / len;
                return itemwidth + "%";
            },
            create: function (obj, data) {
                obj.empty();
                var tarid = [];
                $.each(data, function (i, item) {
                    var div = $("<div class=\"table\"></div>");
                    div.attr("id", item.id)
                    .css("width", tools.getWidth(obj, option.List.length));
                    var desc = $("<div class=\"desc\"></div>");
                    var spancontent = $("<div title=\"" + item.name + "\">" + item.name + "</div>");
                    var spannum = $("<div class='font'>0</div>");
                    desc.append(spancontent)
                    .append(spannum)
                    .appendTo(div);
                    obj.append(div);
                    var chart = $("<div class=\"chart\"></div>");
                    chart.append("<div class=\"desc\" title=\"" + item.desc + "\">&nbsp;</div>")
                    .append("<div class=\"flow\">&nbsp;</div>")
                    .append("<div class=\"data\">&nbsp;</div>")
                    .appendTo(div);

                    tarid.push(item.id);
                });
                $(window).resize(function () {
                    obj.find("div[class='table']").css("width", tools.getWidth(obj, data.length));
                });
                return tarid;
            },
            content: function (obj, data) {
                obj.empty();
                $.each(data.colnames, function (i, item) {
                    var div = $("<div class=\"table\"></div>");
                    div.attr("id", item.id)
                    .css("width", tools.getWidth(obj, data.colnames.length));
                    var desc = $("<div class=\"desc\"></div>");
                    var spancontent = $("<div title=\"" + item + "\">" + item + "</div>");
                    var spannum = $("<div class='font'>0</div>");
                    if (data.rows.length > 0) {
                        if (!dss.isNullOrEmpty(data.rows[0]["col" + i])) {
                            spannum.text(tools.number(data.rows[0]["col" + i].toString()));
                        }
                        else {
                            spannum.text(tools.number("0"));
                        }
                    }
                    desc.append(spancontent)
                    .append(spannum)
                    .appendTo(div);
                    obj.append(div);
                    var chart = $("<div class=\"chart\"></div>");
                    chart.append("<div class=\"desc\" title=\"" + (data.desc[i] == "" ? "无指标描述" : data.desc[i]) + "\">&nbsp;</div>")
                    .append($("<div class=\"flow\" mid=\"" + data.meaids[i] + "\" title=\"点击可以查看指标趋势\">&nbsp;</div>").click(function () {
                        try {
                            methods.setCache(dss.jsonToString(data.analyzer), function (key) {
                                //@jyt 给指标趋势页面传递本页面的analyzer过滤条件
                                dss.openPageInTab("指标趋势", dss.rootPath + "plugin/common/html/singlemea.html?cachekey=" + key + "&meaid=" + data.meaids[i]);
                            });
                        }
                        catch (e) {
                            dss.openPageInTab("指标趋势", dss.rootPath + "plugin/common/html/singlemea.html?meaid=" + $(this).attr("mid"));
                        }
                    }))
                    .append("<div class=\"data\" title=\"<strong>数据质量情况：</strong>当日数据质量情况优，数据可用；标记颜色<br/><strong>数据采集：</strong>采集量**，增幅**<br/><strong>填写率：</strong>终端、用户号码、业务<br/><strong>数据处理：</strong>扔掉数据*条，完整率**<br/><strong>关联：</strong>关联数据*条，关联率**<br/>\">&nbsp;</div>")
                    .appendTo(div);

                });
                $(window).resize(function () {
                    obj.find("div[class='table']").css("width", tools.getWidth(obj, data.colnames.length));
                });
            },
            number: function (str) {
                var n = (str.indexOf('.') > -1 ? str.indexOf('.') : str.length) - 3;
                var arr = str.split('');
                while (true) {
                    if (n < 1) {
                        break;
                    }
                    arr.splice(n, 0, ',');
                    n = n - 3;
                }
                return arr.join('');
            }
        };
        var obj = $("#" + (id == undefined ? "divMeaTotal" : id)).empty();
        if (obj.hasClass("dss_ov_all") == false) {
            obj.addClass("dss_ov_all");
        }
        obj.tooltip();
        var tarid = tools.create(obj, option.List);
        $.ajax({
            url: dss.rootPath + 'plugin/Common/ashx/tool.ashx',
            type: 'post',
            dataType: 'json',
            data: {
                act: 'getdata',
                slice: dss.jsonToString(option.Slice),
                rowdim: dss.jsonToString(option.RowDim),
                list: dss.jsonToString(tarid),
                Templateid: option.Templateid, listid: dss.request("listid")
            },
            beforeSend: function () {
                dss.load(true);
            },
            complete: function () {
                dss.load(false);
            },
            success: function (data) {
                if (data.colnames.length > 0) {
                    tools.content(obj, data);
                }

                //让指标概览也支持导出
                var downDataSource = {
                    sql: null,
                    conn: null,
                    source: null,
                    analyzer: null,
                    titleName: ""
                };
                downDataSource.source = $.extend(true, {}, data);
                downDataSource.titleName = "指标概览";

                var thisDiv = $("#" + (id == undefined ? "divMeaTotal" : id));
                thisDiv.data("downDataSource", downDataSource);
                thisDiv.data("downDataType", "down");
            }
        });
    },
    setCache: function (str, fun) {
        var url = dss.rootPath + "plugin/Common/ashx/ComHandler.ashx";
        var opt = {
            Type: "setCache",
            Property1: str
        };
        $.ajax({
            type: "post",
            url: url,
            data: {
                strCon: dss.jsonToString(opt)
            },
            dataType: "json",
            success: function (key) {
                if (typeof fun == "function") {
                    fun(key);
                }
            }
        });
    }
}