(function ($) {

    var defaultData = {
    }
    var initTools = {
        init: function (settings) {
            var option = $.extend({
                showTypeMonth: false,
                showTypeWeek: false,
                showTypeDay: false,
                showTypeHour: false,
                showTypeMinute: false,
                showTypeQuarter: false,
                defaultTimeType: undefined,
                defaultDateStr: undefined,
                defaultHourStr: undefined,
                defaultMinuteStr: undefined,
                defaultSecondStr: undefined,
                range: false,
                isTile: true,
                datePickerOptions: {
                    maxDate: "+0M +0D",
                    minDate: "",
                    firstDay: 1
                }
            }, settings);
            if (!defaultData["0"]) {
                defaultData["0"] = {};
            }
            defaultData["0"].maxDate = startTools.getMaxMinDate(option.datePickerOptions.maxDate, true);
            defaultData["0"].minDate = startTools.getMaxMinDate(option.datePickerOptions.maxDate, false);
            defaultData["0"].showType = startTools.getShowType(option.defaultTimeType).type;
            option.defaultTimeType = startTools.getShowType(option.defaultTimeType).key;
            var _defaultTime = startTools.getDefaultTime(option.defaultDateStr, option.defaultHourStr, option.defaultMinuteStr, option.defaultSecondStr);
            defaultData["0"].showDate = _defaultTime.start;
            if (option.range) {
                if (!defaultData["1"]) {
                    defaultData["1"] = {};
                }
                if (!option.defaultDateStr) {
                    if (defaultData["0"].showType > 3) {
                        defaultData["0"].showDate = tools.addMonths(defaultData["0"].showDate, -12);
                    }
                    else {
                        defaultData["0"].showDate = tools.addMonths(defaultData["0"].showDate, -1);
                    }
                }
                defaultData["1"].maxDate = defaultData["0"].maxDate;
                defaultData["1"].showType = defaultData["0"].showType;
                defaultData["1"].showDate = _defaultTime.end;
                defaultData["1"].minDate = defaultData["0"].showDate;
            }

            var $txtDate = this;
            method.createTime(option, $txtDate);
        }
    };
    var startTools = {
        getMaxMinDate: function (date, isMax) {
            var _return;
            if (date.length == 0) {
                var _n = 480;
                if (!isMax) {
                    _n = 0 - _n;
                }
                _return = tools.addMonths(new Date(), _n)
            }
            else if (typeof date == 'Date') {
                _return = date;
            }
            else {
                var str = date.toLocaleLowerCase().split(' ');
                var strOpt = {
                    y: 0,
                    m: 0,
                    w: 0,
                    d: 0
                };
                for (var i = 0; i < str.length; i++) {
                    if (str[i].length > 0) {
                        if (str[i].indexOf('y') > 0) {
                            strOpt.y = tools.getNumByStr(str[i].replace("y", ""));
                        }
                        else if (str[i].indexOf('m') > 0) {
                            strOpt.m = tools.getNumByStr(str[i].replace("m", ""));
                        }
                        else if (str[i].indexOf('w') > 0) {
                            strOpt.w = tools.getNumByStr(str[i].replace("w", ""));
                        }
                        else if (str[i].indexOf('d') > 0) {
                            strOpt.d = tools.getNumByStr(str[i].replace("d", ""));
                        }
                    }
                }
                var _now = new Date();
                if (strOpt.y != 0) {
                    var _y = _now.getFullYear();
                    _y = _y + strOpt.y;
                    _now.setFullYear(_y);
                }
                if (strOpt.m != 0) {
                    _now = tools.addMonths(_now, str.m);
                }
                if (strOpt.w != 0) {
                    var _d = strOpt.w * 7;
                    _now = tools.addDays(_now, _d);
                }
                if (strOpt.d != 0) {
                    _now = tools.addDays(_now, strOpt.d);
                }
                _return = _now;
            }
            return _return;
        },
        getShowType: function (str) {
            var _return = {
                key: '日',
                type: 3
            };
            if (str) {
                switch (str.toLocaleLowerCase()) {
                    case "month": _return = {
                        key: '月',
                        type: 5
                    }; break;
                    case "week": _return = {
                        key: '周',
                        type: 4
                    }; break;
                    case "second": _return = {
                        key: '秒',
                        type: 0
                    }; break;
                    case "hour": _return = {
                        key: '小时',
                        type: 2
                    }; break;
                    case "minute": _return = {
                        key: '分钟',
                        type: 1
                    }; break;
                    case "月": _return = {
                        key: '月',
                        type: 5
                    }; break;
                    case "周": _return = {
                        key: '周',
                        type: 4
                    }; break;
                    case "小时": _return = {
                        key: '小时',
                        type: 2
                    }; break;
                    case "分钟": _return = {
                        key: '分钟',
                        type: 1
                    }; break;
                    case "秒": _return = {
                        key: '秒',
                        type: 0
                    }; break;
                }
            }
            return _return;
        },
        getDefaultTime: function (dateStr, hourStr, minStr, secStr) {
            var _return = {
                start: new Date(),
                end: new Date()
            };
            if (dateStr == undefined) {
                return _return;
            }
            var _start, _end;
            if (dateStr.indexOf(":") > 0) {
                var arrStr = dateStr.split(':');
                _start = startTools.formatDefaultDateStr(dateStr[0]);
                _end = startTools.formatDefaultDateStr(dateStr[1]);
            }
            else {
                _start = startTools.formatDefaultDateStr(dateStr);
                _end = "";
            }
            if (_start.length == 0) {
                _start = tools.format(_return.start, "yyyy-MM-dd");
            }
            if (_end.length == 0) {
                _end = tools.format(_return.end, "yyyy-MM-dd");
            }
            if (hourStr) {
                if (hourStr == "全天") {
                    _start += " 0";
                    _end += " 23";
                }
                else if (hourStr.length > 0) {
                    _start += " " + hourStr.replace("时", "");
                    _end += " " + hourStr.replace("时", "");
                }
                else {
                    _start += " 0";
                    _end += " 23";
                }
            }
            else {
                _start += " 0";
                _end += " 23";
            }

            if (minStr) {
                _start += ":" + minStr;
                _end += ":" + minStr;
            }
            else {
                _start += ":0";
                _end += ":59";
            }

            if (secStr) {
                _start += ":" + secStr;
                _end += ":" + secStr;
            }
            else {
                _start += ":0";
                _end += ":59";
            }
            _return.start = tools.parse(_start);
            _return.end = tools.parse(_end);
            return _return;
        },
        formatDefaultDateStr: function (str) {
            var _rStr = "";
            if (str.length > 0) {
                var newdate = new Date();
                switch (str) {
                    case "昨天": _rStr = tools.format(tools.addDays(newdate, -1), "yyyy-MM-dd"); break;
                    case "前天": _rStr = tools.format(tools.addDays(newdate, -2), "yyyy-MM-dd"); break;
                    case "上月同一天": _rStr = tools.format(tools.addMonths(newdate, -1), "yyyy-MM-dd"); break;
                    case "上周同一天": _rStr = tools.format(tools.addDays(newdate, -7), "yyyy-MM-dd"); break;
                    case "上月": _rStr = tools.format(tools.addMonths(newdate, -1), "yyyy-MM-dd"); break;
                    case "上上月": _rStr = tools.format(tools.addMonths(newdate, -2), "yyyy-MM-dd"); break;
                    case "上周": _rStr = tools.format(tools.addDays(newdate, -7), "yyyy-MM-dd"); break;
                    case "上上周": _rStr = tools.format(tools.addDays(newdate, -14), "yyyy-MM-dd"); break;
                    case "上年同月": _rStr = tools.format(tools.addMonths(newdate, -12), "yyyy-MM-dd"); break;
                    case "上年同周": _rStr = tools.format(tools.addMonths(newdate, -12), "yyyy-MM-dd"); break;
                    default: _rStr = str; break;
                }
            }
            return _rStr;
        },
        getDefaultTimeStr: function (isTrue, showType) {
            var str = "s";
            if (isTrue) {
                switch (showType) {
                    case 0: str = tools.format(defaultData["0"].showDate, "yyyy年MM月dd日hh时mm分ss秒") + "-" + tools.format(defaultData["1"].showDate, "yyyy年MM月dd日hh时mm分ss秒");
                        break;
                    case 1: str = tools.format(defaultData["0"].showDate, "yyyy年MM月dd日hh时mm分") + "-" + tools.format(defaultData["1"].showDate, "yyyy年MM月dd日hh时mm分");
                        break;
                    case 2: str = tools.format(defaultData["0"].showDate, "yyyy年MM月dd日hh时") + "-" + tools.format(defaultData["1"].showDate, "yyyy年MM月dd日hh时");
                        break;
                    case 3: str = tools.format(defaultData["0"].showDate, "yyyy年MM月dd日") + "-" + tools.format(defaultData["1"].showDate, "yyyy年MM月dd日");
                        break;
                    case 4: str = tools.format(defaultData["0"].showDate, "yyyy年ww周") + "-" + tools.format(defaultData["1"].showDate, "yyyy年ww周");
                        break;
                    case 5: str = tools.format(defaultData["0"].showDate, "yyyy年MM月") + "-" + tools.format(defaultData["1"].showDate, "yyyy年MM月");
                        break;
                    case 6: str = tools.format(defaultData["0"].showDate, "yyyy年qq季度") + "-" + tools.format(defaultData["1"].showDate, "yyyy年qq季度");
                        break;
                }
            }
            else {
                switch (showType) {
                    case 0: str = tools.format(defaultData["0"].showDate, "yyyy年MM月dd日hh时mm分ss秒");
                        break;
                    case 1: str = tools.format(defaultData["0"].showDate, "yyyy年MM月dd日hh时mm分");
                        break;
                    case 2: str = tools.format(defaultData["0"].showDate, "yyyy年MM月dd日hh时");
                        break;
                    case 3: str = tools.format(defaultData["0"].showDate, "yyyy年MM月dd日");
                        break;
                    case 4: str = tools.format(defaultData["0"].showDate, "yyyy年ww周");
                        break;
                    case 5: str = tools.format(defaultData["0"].showDate, "yyyy年MM月");
                        break;
                    case 6: str = tools.format(defaultData["0"].showDate, "yyyy年qq季度");
                        break;
                }
            }
            return str;
        }
    };
    var method = {
        createTime: function (option, obj) {
            var divControl = $("<div></div>")
                .appendTo(obj.parent());
            obj.appendTo(divControl);
            var ttControl = [];//秒：0，分钟：1，小时：2，日：3，周：4，月：5，季度：6
            if (option.showTypeDay) {
                ttControl.push("日");
            }
            if (option.showTypeMonth) {
                ttControl.push("月");
            }
            if (option.showTypeWeek) {
                ttControl.push("周");
            }
            if (option.showTypeQuarter) {
                ttControl.push("季度");
            }
            if (option.showTypeHour) {
                ttControl.push("小时");
            }
            if (option.showTypeMinute) {
                ttControl.push("分钟");
            }
            if (option.showTypeSecond) {
                ttControl.push("秒");
            }
            if (ttControl.length == 0) {
                ttControl.push("日");
            }
            if (ttControl.length > 1) {
                var ulControl = $("<ul></ul>")
                    .addClass("tabControl").appendTo(divControl);
                $.each(ttControl, function (i, item) {
                    var li = $("<li></li>").text(item).appendTo(ulControl);
                    if (option.defaultTimeType == item) {
                        li.addClass("selected");
                    }
                    if (li) {
                        li.click(function () {
                            $(this).parent().find("li").removeClass("selected");
                            $(this).addClass("selected");
                            defaultData["0"].showType = tools.getTypeNum($(this).text());
                            if (defaultData["1"].showType) {
                                defaultData["1"].showType = defaultData["0"].showType;
                            }
                            obj.val(startTools.getDefaultTimeStr(option.range, defaultData["0"].showType));
                        });
                    }
                });
            }
            var strData = startTools.getDefaultTimeStr(option.range, defaultData["0"].showType);
            obj.unbind("click").val(strData).click(function () {
                method.time(ulControl, obj, option);
            });
        },
        time: function (ul, obj, option) {
            var timeControl;
            if ($("#" + obj[0].id + "-timepicker").length > 0) {
                timeControl = $("#" + obj[0].id + "-timepicker");
            }
            else {
                timeControl = $('<div class="timeControl"></div>')
                .attr("id", obj[0].id + "-timepicker");
            }
            tools.setPosition(timeControl, obj);
            if (option.range) {
                timeControl.css("width", "487px");
                timeControl.append(method.createPanel(option, "0"));
                timeControl.append(method.createPanel(option, "1"));
            }
            else {
                timeControl.css("width", "230px");
                timeControl.append(method.createPanel(option, "0"));
            }
            var mouse = {
                move: function (event) {
                    var mintop = obj.offset().top;
                    var minleft = obj.offset().left;
                    var maxtop = mintop + obj.outerHeight() + timeControl.height();
                    var maxleft = minleft + timeControl.width() + 20;
                    var point = mouse.getMousePos(event);
                    if (point.x < minleft) {
                        return false;
                    }
                    if (point.x > maxleft) {
                        return false;
                    }
                    if (point.y < mintop) {
                        return false;
                    }
                    if (point.y > maxtop) {
                        return false;
                    }
                    return true;
                },
                getMousePos: function (event) {
                    var e = event || window.event;
                    var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
                    var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
                    var x = e.pageX || e.clientX + scrollX;
                    var y = e.pageY || e.clientY + scrollY;
                    return { 'x': x, 'y': y };
                }
            };

            $(document.body).bind("click", function () {
                if (!mouse.move(event)) {
                    timeControl.remove();
                }
            });
        },
        //showtype 0:日1:月2:周3:时4:分5:秒
        createPanel: function (option, index) {
            var div;
            if ($("#txtTime-" + index).length > 0) {
                div = $("#txtTime-" + index).empty();
            }
            else {
                if (index == 0) {
                    div = $('<div style="float: left; width: 230px;" id="txtTime-' + index + '"></div>');
                }
                else {
                    div = $('<div style="float: right; width: 230px;" id="txtTime-' + index + '"></div>');
                }
            }
            var divTitle = $('<div class="title"></div>').appendTo(div);
            var title = {
                prev: function () {
                    var sp = $('<span class="left"></span>');
                    var monNum = 1;
                    if (defaultData[index].showType < 4) {
                        sp.attr("title", "上月");
                    }
                    else {
                        sp.attr("title", "上年");
                        monNum = 12;
                    }
                    sp.click(function () {
                        defaultData[index].showDate = tools.addMonths(defaultData[index].showDate, (0 - monNum));
                        method.createPanel(option, index);
                    });
                    return sp;
                },
                year: function () {
                    var _showName = tools.format(defaultData[index].showDate, "yyyy年");
                    var _class = defaultData[index].showType < 4 ? "y" : "yl";
                    var sp = $("<span class=\"" + _class + "\">" + _showName + "</span>");
                    sp.click(function () {
                        var showYear = defaultData[index].showDate.getFullYear();
                        var divsys = $('<div class="year"></div>');
                        tools.setPosition(divsys, sp);
                        tools.setTitle.year(showYear - 5, showYear + 5, divsys, option, index);
                    });
                    return sp;
                },
                month: function () {
                    if (tools.isShowWeek(index) == false) {
                        return null;
                    }
                    var _showName = tools.format(defaultData[index].showDate, "MM月");
                    var sp = $("<span class=\"m\">" + _showName + "</span>");
                    sp.click(function () {
                        var showYear = defaultData[index].showDate.getFullYear();
                        var divsys = $('<div class="month"></div>');
                        tools.setPosition(divsys, sp);
                        tools.setTitle.month(divsys, option, index);
                    });
                    sp.click(function () {

                    });
                    return sp;
                },
                next: function () {
                    var sp = $('<span class="right"></span>');
                    var monNum = 1;
                    if (defaultData[index].showType < 4) {
                        sp.attr("title", "下月");
                    }
                    else {
                        sp.attr("title", "下年");
                        monNum = 12;
                    }
                    sp.click(function () {
                        defaultData[index].showDate = tools.addMonths(defaultData[index].showDate, monNum);
                        method.createPanel(option, index);
                    });

                    return sp;
                }
            };
            divTitle.append(title.prev()).append(title.year());
            if (title.month() != null) {
                divTitle.append(title.month());
            }
            divTitle.append(title.next());
            var clear = $('<div class="clear"></div>').appendTo(div);
            var ul = $("<ul></ul>");
            if (tools.isShowWeek(index)) {
                ul.addClass("day");
                var ol = $("<ol></ol>").appendTo(div);
                $.each(tools.weekType, function (i, item) {
                    $("<li></li>").text(item).appendTo(ol);
                });
                $.each(tools.getDay(index), function (i, item) {
                    var li = $("<li i='" + item.key + "'>" + item.value + "</li>").appendTo(ul);
                    if (item.show) {
                        li.addClass("t");
                    }
                    li.click(function () {

                    });
                });
            }
            else if (defaultData[index].showType == 4) {
                ul.addClass("uw");
                var warr = tools.getWeekList(index);
                $.each(warr, function (i, item) {
                    var li = $("<li i='" + item + "' title='" + item.title + "'>" + item.key + "</li>").appendTo(ul);
                    if (item.show) {
                        li.addClass("t");
                    }
                    li.click(function () {

                    });
                });
            }
            else if (defaultData[index].showType == 5) {
                ul.addClass("mon");
                var warr = tools.getMonth(index);
                $.each(warr, function (i, item) {
                    var li = $("<li i='" + item.key + "'>" + item.value + "</li>").appendTo(ul);
                    if (item.show) {
                        li.addClass("t");
                    }
                    li.click(function () {

                    });
                });
            }
            else {
                ul.addClass("uq");
                var warr = tools.getQuarter(index);
                $.each(warr, function (i, item) {
                    var li = $("<li i='" + item.key + "'>" + item.value + "</li>").appendTo(ul);
                    if (item.show) {
                        li.addClass("t");
                    }
                    li.click(function () {

                    });
                });
            }
            div.append(ul).append(clear);

            tools.setBottom(option, index).appendTo(div);
            return div;
        }
    };
    var tools = {
        format: function (date, format) {
            if (format.indexOf("ww") > -1) {
                format = format.replace("yyyy", date.getFullYear());
                var w = tools.getWeek(date);
                if (w < 10) {
                    w = "0" + w;
                }
                format = format.replace("ww", w);
                return format;
            }
            var o = {
                "M+": date.getMonth() + 1,                    //月份 
                "d+": date.getDate(),                         //日
                "h+": date.getHours(),                        //小时 
                "m+": date.getMinutes(),                      //分 
                "s+": date.getSeconds(),                      //秒 
                "q+": Math.floor((date.getMonth() + 3) / 3),  //季度 
                "S": date.getMilliseconds(),                 //毫秒 
                "b": "00:00:00",                              //当天最早时间
                "e": "23:59:59"                               //当天最晚时间
            };
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
            return format;
        },
        //增加多少天
        addDays: function (date, num) {
            var _date = new Date(date.getTime());
            if (!num || typeof num != 'number') {
                num = 0;
            }
            var setnum = _date.getDate() + num;
            _date.setDate(setnum);
            return _date;
        },
        //增加月
        addMonths: function (date, num) {
            var _date = new Date(date.getTime());
            if (!num || typeof num != 'number') {
                num = 0;
            }
            var setnum = _date.getMonth() + num;
            _date.setMonth(setnum);
            return _date;
        },
        //增加小时
        addHours: function (date, num) {
            var _date = new Date(date.getTime());
            if (!num || typeof num != 'number') {
                num = 0;
            }
            var setnum = _date.getHours() + num;
            _date.setHours(setnum);
            return _date;
        },
        //转化时间
        parse: function (time) {
            try {
                if (time.indexOf("年") > -1) {
                    time = time.replace("年", "/");
                }
                if (time.indexOf("月") > -1) {
                    time = time.replace("月", "/");
                }
                if (time.indexOf("日") > -1) {
                    time = time.replace("日", "");
                }
                if (time.indexOf("时") > -1) {
                    time = time.replace("时", "/");
                }
                if (time.indexOf("分") > -1) {
                    time = time.replace("分", "/");
                }
                if (time.indexOf("秒") > -1) {
                    time = time.replace("秒", "/");
                }
                if (time.indexOf("-") > -1) {
                    time = time.replace(/\//g, "/");
                }
                if (time.length <= 8) {
                    time = time + "/01";
                }
                return new Date(time);
            }
            catch (e) {
                return new Date();
            }
        },
        //获取第几周
        getWeek: function (date) {
            var result = null;
            var array = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
            var month = date.getMonth();
            var weekday = date.getDay() == 0 ? 7 : date.getDay();
            var year = date.getFullYear();
            var tmp = array[month] + date.getDate();
            if (month > 1 && tools.isLeapYear(year)) {
                tmp++;
            }
            result = parseInt(tmp / 7) + 1;
            if (53 == result) {
                var jan1 = new Date(date.getFullYear(), 0, 1);
                var dec31 = new Date(date.getFullYear(), 11, 31);
                if (jan1.getDay() == 0 && dec31.getDay() == 1) {
                    result = 54;
                }
            }
            return result;
        },
        //判断是否是闰年
        isLeapYear: function (year) {
            return (year % 4 == 0) && ((year % 100 != 0) || (year % 400 == 0));
        },
        isShowWeek: function (index) {
            if (defaultData[index].showType == 4) {
                return false;
            }
            if (defaultData[index].showType == 5) {
                return false;
            }
            if (defaultData[index].showType == 6) {
                return false;
            }
            return true;
        },
        getDay: function (index) {
            var num = [];
            var dayIndex = defaultData[index].showDate.getDate();
            var one = tools.addDays(defaultData[index].showDate, (1 - dayIndex));
            var last = tools.addDays(tools.addMonths(one, 1), -1);
            var oneNum = one.getDay() == 0 ? 7 : one.getDay();
            for (var i = 1; i < oneNum; i++) {
                num.push({
                    key: tools.addDays(one, i - oneNum).getDate(),
                    show: false,
                    value: tools.addDays(one, i - oneNum).getDate()
                });
            }
            for (var i = one.getDate() ; i <= last.getDate() ; i++) {
                num.push({
                    key: tools.addDays(one, i - 1).getDate(),
                    show: true,
                    value: tools.addDays(one, (i - 1)).getDate() < 10 ? "0" + tools.addDays(one, (i - 1)).getDate() : tools.addDays(one, (i - 1)).getDate()
                });
            }
            for (var i = 1 ; i < 15 && num.length < 42; i++) {
                num.push({
                    key: tools.addDays(last, i).getDate(),
                    show: false,
                    value: "0" + tools.addDays(last, i).getDate()
                });
            }
            return num;
        },
        getMonth: function (index) {
            var arrMon = [];
            for (var i = 1; i < 13; i++) {
                var str = "一月";
                switch (i) {
                    case 1: str = "一月"; break;
                    case 2: str = "二月"; break;
                    case 3: str = "三月"; break;
                    case 4: str = "四月"; break;
                    case 5: str = "五月"; break;
                    case 6: str = "六月"; break;
                    case 7: str = "七月"; break;
                    case 8: str = "八月"; break;
                    case 9: str = "九月"; break;
                    case 10: str = "十月"; break;
                    case 11: str = "十一"; break;
                    default: str = "十二"; break;
                }
                arrMon.push({
                    key: i,
                    show: (defaultData[index].showDate.getMonth() + 1) >= i ? true : false,
                    value: str
                });
            }
            return arrMon;
        },
        getWeekList: function (index) {
            var year = defaultData[index].showDate.getFullYear();
            var startdate = tools.parse(year + "年01月01日");
            var enddate = tools.addDays(tools.parse((year + 1) + "年01月01日"), -1);
            var arrWeek = [];
            var num = 1;
            var flag = false;
            var start = startdate;
            var end = null;
            var nowdate = new Date();
            while (startdate <= enddate) {
                if (flag) {
                    arrWeek.push({
                        key: tools.format(end, "ww周"),
                        title: tools.format(start, "yyyy年MM月dd日") + "-" + tools.format(end, "yyyy年MM月dd日"),
                        show: (nowdate > start) ? true : false
                    });
                    flag = false;
                    start = startdate;
                }
                if (startdate.getDay() == 0) {
                    flag = true;
                    end = startdate;
                }
                startdate = tools.addDays(startdate, 1);
            }
            if (end < start && start <= enddate) {
                arrWeek.push({
                    key: tools.format(enddate, "ww周"),
                    title: tools.format(start, "yyyy年MM月dd日") + "-" + tools.format(enddate, "yyyy年MM月dd日"),
                    show: (nowdate > start) ? true : false
                });
            }
            return arrWeek;
        },
        getQuarter: function (index) {
            var arrMon = [];
            var n = Math.floor((defaultData[index].showDate.getMonth() + 3) / 3);
            for (var i = 1; i < 5; i++) {
                var str = "第一季度";
                switch (i) {
                    case 1: str = "第一季度"; break;
                    case 2: str = "第二季度"; break;
                    case 3: str = "第三季度"; break;
                    default: str = "第四季度"; break;
                }
                arrMon.push({
                    key: i,
                    show: i <= n ? true : false,
                    value: str
                });
            }
            return arrMon;
        },
        getTypeNum: function (strDate) {
            var num = 0;
            switch (strDate) {
                case "日": num = 3; break;
                case "月": num = 5; break;
                case "周": num = 4; break;
                case "小时": num = 2; break;
                case "分钟": num = 1; break;
                case "秒": num = 0; break;
                case "季度": num = 6; break;
            }
            return num;
        },
        setPosition: function (tar, obj) {
            tar.css({
                top: obj.offset().top + obj.outerHeight(),
                left: obj.offset().left
            }).appendTo($(document.body))
        },
        weekType: ["一", "二", "三", "四", "五", "六", "日"],
        //处理时间头部
        setTitle: {
            month: function (divsys, option, index) {
                divsys.empty();
                var ul = $("<ul></ul>").appendTo(divsys);
                var _mon = tools.getMonth(index);
                $.each(_mon, function (i, item) {
                    $("<li>" + item.value + "</li>").click(function () {
                        defaultData[index].showDate.setMonth(item.key - 1);
                        method.createPanel(option, index);
                        divsys.remove();
                    }).appendTo(ul);
                });
            },
            year: function (start, end, divsys, option, index) {
                divsys.empty();
                var ul = $("<ul></ul>").appendTo(divsys);
                for (var i = start; i < end; i++) {
                    $("<li i='" + i + "'>" + i + "</li>").click(function () {
                        var _year = parseInt($(this).attr('i'));
                        defaultData[index].showDate.setFullYear(_year);
                        method.createPanel(option, index);
                        divsys.remove();
                    }).appendTo(ul);
                }
                var xp = $("<li>←&nbsp;&nbsp;</li>").appendTo(ul),
                    x = $("<li>×</li>").appendTo(ul),
                    xn = $("<li>&nbsp;&nbsp;→</li>").appendTo(ul);
                x.click(function () {
                    divsys.remove();
                })
                xp.click(function () {
                    var s = start - 10;
                    var e = start;
                    tools.setTitle.year(s, e, divsys);
                });
                xn.click(function () {
                    var s = end;
                    var e = end + 10;
                    tools.setTitle.year(s, e, divsys);
                });
            }
        },
        setBottom: function (option, index) {
            var bottom = $("<div class=\"bottom\"></div>");
            var hour;
            var min;
            if (defaultData[index].showType < 3) {
                hour = $("<span>" + tools.format(defaultData[index].showDate, "hh") + "</span>");
                min = $("<span>00</span>");
                if (defaultData[index].showType < 2) {
                    min.text(tools.format(defaultData[index].showDate, "mm"));
                }
                sec = $("<span>00</span>");
                if (defaultData[index].showType < 1) {
                    sec.text(tools.format(defaultData[index].showDate, "ss"));
                }
            }
            else {
                hour = $("<span class='s'>&nbsp;&nbsp;&nbsp;&nbsp;</span>");
                min = $("<span  class='s'>&nbsp;&nbsp;&nbsp;&nbsp;</span>");
                sec = $("<span  class='s'>&nbsp;&nbsp;&nbsp;&nbsp;</span>");
            }
            bottom
                .append(hour)
                .append($("<span class=\"t s\">:</span>"))
                .append(min)
                .append($("<span class=\"t s\">:</span>"))
                .append(sec);

            $("<span class=\"btn\">重置</span>")
                .click(function () {

                }).appendTo(bottom);
            var str = "今天";
            if (defaultData[index].showType == 5) {
                str = "本月";
            }
            else if (defaultData[index].showType == 4) {
                str = "本周";
            }
            $("<span class=\"btn\">" + str + "</span>")
                .click(function () {

                }).appendTo(bottom);
            $("<span class=\"btn\">确认</span>")
                .click(function () {

                }).appendTo(bottom);
            return bottom;
        },
        getNumByStr: function (str) {
            var temp = /^\d+(\.\d+)?$/;
            if (temp.test(str) == false) {
                return 0;
            }
            return parseInt(str);
        }
    };
    $.fn.timepickernew = function (option) {
        if (initTools[option]) {
            return initTools[option].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof option === 'object' || !option) {
            return initTools.init.apply(this, arguments);
        }
        else {
            $.error('Method ' + option + ' does not exist on $.timepicker');
        }
    }
})($);

