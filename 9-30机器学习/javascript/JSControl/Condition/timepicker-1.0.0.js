/*!
* jQuery timepicker 1.0.0
* Copyright 2013 BocoDss
* Depends:
*	jquery.ui.core.js
*   jquery.ui.datepicker.js
*/
(function ($) {
    var methods = {
        init: function (settings) {
            var paras = $.extend({
                showTypeMonth: true,
                showTypeWeek: false,
                showTypeHour: false,
                showTypeDay: true,
                defaultTimeType: undefined,
                defaultDateStart: undefined,
                defaultDate: undefined,
                defaultDateStr: undefined,
                range: false,
                datePickerOptions: {
                    dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"],
                    monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月',
		'七月', '八月', '九月', '十月', '十一月', '十二月'],
                    prevText: '上月',
                    nextText: '下月',
                    dateFormat: "yy年mm月dd日",
                    changeMonth: true,
                    changeYear: true,
                    maxDate: "+0M +0D",
                    showOtherMonths: true,
                    selectOtherMonths: true,
                    firstDay: 1
                }
            }, settings);
            var $txtDate = this;
            $txtDate.data("range", paras.range);
            $txtDate.prop("readonly", true);
            var $div;
            if ($txtDate.parent().is("#divTimeCtrl")) {
                $div = $txtDate.parent();
            }
            else {
                $div = $("<div id='divTimeCtrl'></div>"); $txtDate.after($div);
                $div.append($txtDate);
            }
            var isShowType = isShowTimeType(paras);
            var $ddlType;
            if ($div.find("#ddlTimeType").length > 0) {
                $ddlType = $("#ddlTimeType", $div);
                $ddlType.empty();
            }
            else {
                $ddlType = $("<select id=ddlTimeType></select>");
                $div.prepend($ddlType);
            }
            if (!isShowType) {
                $ddlType.hide();
            }
            else {
                $ddlType.show();
            }
            $ddlType.append(AddDdlTimeType(paras));
            if (paras.defaultTimeType == undefined) {
                paras.defaultTimeType = getTimeTypeFromDateStr(paras.defaultDateStr);
            }
            if (paras.defaultTimeType != undefined) {
                var dateType = paras.defaultTimeType;
                dateType = dateType == "日" ? "Day" : (dateType == "周" ? "Week" : (dateType == "月" ? "Month" : (dateType == "小时" ? "Hour" : dateType)));
                if (dateType == undefined) {
                    dateType = "Day";
                }
                $ddlType.val(dateType);
            }
            $ddlType.change(function () {
                var timetype = $(this).val();
                paras.defaultDate = getDefaultDate(timetype);
                initDate(this, $txtDate, paras);
                if (paras.timeTypeSelectedChange) {
                    paras.timeTypeSelectedChange();
                }
            });
            initDate($ddlType, $txtDate, paras);
        },
        getDate: function ()
        { },
        getDateStr: function () {
            if (this.data("range") == true) {
                return this.siblings(":text").val() + ":" + this.val();
            }
            else {
                return this.val();
            }
        },
        getHourStr: function () {
            if (this.data("range") == true) {
                return this.siblings(":text").next().val() + "时" + ":" + this.next().val() + "时";
            }
            else {
                return this.next().val() + "时";
            }
        },
        getTimeType: function () {
            return this.parent().find("select[id=ddlTimeType]").val();
        }
    };
    $.fn.timepicker = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method' + method + 'does not exist on jQuery.timepicker');
        }
    }

    function dateStringToDate(dateString) {
        var arr = dateString.split(/[年月日时\-:\s]/);
        if ($.trim(arr[arr.length - 1]) == "") {
            arr.pop();
        }
        var date = new Date();
        date.setDate(1);
        if (arr.length > 3) {
            date.setFullYear(arr[0], arr[1] - 1, arr[2]);
            date.setHours(arr[3]);
        }
        else if (arr.length > 2) {
            date.setFullYear(arr[0], arr[1] - 1, arr[2]);
        }
        else if (arr.length > 1) {
            if (contains(dateString, "周", true)) {
                var y = parseInt(arr[0]);
                var w = parseInt(arr[1]);
                var dat = new Date(y, 11, 31);
                var weekArr = getWeekArray(dat);
                date = dateStringToDate(weekArr[w - 1].split("--")[1]);
            }
            else {
                date.setFullYear(arr[0], arr[1] - 1, 1);
            }
        }
        else if (arr.length > 0) {
            date.setFullYear(arr[0]);
        }
        return date;
    }

    function getTimeTypeFromDateStr(dateString) {
        if (dateString == undefined) {
            return undefined;
        }
        var arr = dateString.split(/[年月日时\-:\s]/);
        if ($.trim(arr[arr.length - 1]) == "") {
            arr.pop();
        }
        if (arr.length > 3) {
            return "Hour";
        }
        else if (arr.length > 2) {
            return "Day";
        }
        else if (arr.length > 1) {
            if (contains(dateString, "周", true)) {
                return "Week";
            }
            else {
                return "Month";
            }
        }
        else if (arr.length > 0) {
            return undefined;
        }
        return undefined;
    }

    function contains(string, substr, isIgnoreCase) {
        if (isIgnoreCase) {
            string = string.toLowerCase();
            substr = substr.toLowerCase();
        }
        var startChar = substr.substring(0, 1);
        var strLen = substr.length;
        for (var j = 0; j < string.length - strLen + 1; j++) {
            if (string.charAt(j) == startChar) {
                if (string.substring(j, j + strLen) == substr) {
                    return true;
                }
            }
        }
        return false;
    }


    function dateToString(date, format) {
        var yearstr = date.getFullYear();
        var monthstr = date.getMonth() + 1;
        if (monthstr < 10) {
            monthstr = "0" + monthstr;
        }
        var daystr = date.getDate();
        if (daystr < 10) {
            daystr = "0" + daystr;
        }
        if (format == "yyyymm") {
            return yearstr + "年" + monthstr + "月";
        }
        else if (format == "yyyyww") {
            var week = getWeek(date);
            if (week < 10) {
                week = "0" + week;
            }
            return yearstr + "年" + week + "周";
        }
        else {
            return yearstr + "年" + monthstr + "月" + daystr + "日";
        }
    }

    function initDate(ddlTimeType, $txtDate, paras) {

        var timetype = $(ddlTimeType).val();
        if (paras.defaultDate == undefined) {
            if (paras.defaultDateStr != undefined) {
                var datestr = paras.defaultDateStr.split(':');
                if (datestr.length > 1) {
                    paras.defaultDate = dateStringToDate(datestr[1]);
                    if (paras.defaultDateStart == undefined) {
                        paras.defaultDateStart = dateStringToDate(datestr[0]);
                    }
                }
                else {
                    paras.defaultDate = dateStringToDate(paras.defaultDateStr);
                    if (paras.defaultDateStart == undefined) {
                        paras.defaultDateStart = getDefaultStartDate(timetype, paras.defaultDate);
                    }
                }
            }
            else {
                paras.defaultDate = getDefaultDate(timetype);
                if (paras.defaultDateStart == undefined) {
                    paras.defaultDateStart = getDefaultStartDate(timetype, paras.defaultDate);
                }
            }
        }
        year = paras.defaultDate.getFullYear() - (new Date()).getFullYear();
        $txtDate.unbind("click");
        $txtDate.datepicker("destroy");
        var txt = $txtDate; $("#ddlhour", txt.parent()).remove(); $("#ddlStartHour", txt.parent()).remove();
        var txtStart = txt.clone();
        txtStart.attr("id", "txtStartDate" + $txtDate.attr("id"));
        if (paras.range == true) {
            if (!txt.prev().is("span")) {
                txt.before(txtStart);
                txt.before($("<span> -- </span>"));
            }
            else {
                txtStart = txt.siblings(":text");
                txtStart.unbind("click");
                txtStart.datepicker("destroy");
            }
        }
        else {
            if (txt.prev().is("span")) {
                txt.prev().remove();
                txt.prev().remove();
            }
        }
        $("div[id=divYearMonth]", txt.parent()).remove();
        $("div[id=divYearMonthStart]", txt.parent()).remove();
        var $divYearMonth = $("<div id=divYearMonth></div>");
        var $divYearMonthStart = $("<div id=divYearMonthStart></div>");
        if (timetype == "Month") {
            txt.val(dateToString(paras.defaultDate, "yyyymm"));
            initTimeMonthText(txt, $divYearMonth);
            if (paras.range == true) {
                txtStart.val(dateToString(paras.defaultDateStart, "yyyymm"));
                initTimeMonthText(txtStart, $divYearMonthStart);
            }
        }
        else if (timetype == "Week") {
            txt.val(dateToString(paras.defaultDate, "yyyyww"));
            initTimeWeekText(txt, $divYearMonth);
            if (paras.range == true) {
                txtStart.val(dateToString(paras.defaultDateStart, "yyyyww"));
                initTimeWeekText(txtStart, $divYearMonthStart);
            }
        }
        else {
            txt.val(dateToString(paras.defaultDate, "yyyymmdd"));
            txt.datepicker(paras.datePickerOptions);
            if (paras.range == true) {
                txtStart.val(dateToString(paras.defaultDateStart, "yyyymmdd"));
                txtStart.datepicker(paras.datePickerOptions);
            }
            if (timetype == "Hour") {
                var $hourDdl = $("<select id=ddlhour></select>");
                for (var i = 0; i < 24; i++) {
                    var s = i;
                    if (s < 10) {
                        s = "0" + s;
                    }
                    $hourDdl.append($("<option value=" + s + ">" + s + "时</option>"));
                }
                txt.after($hourDdl);
                if (paras.range == true) {
                    var $startHourDdl = $hourDdl.clone();
                    $startHourDdl.attr("id", "ddlStartHour");
                    $hourDdl.val("23");
                    txtStart.after($startHourDdl);
                }
            }
        }
        if (timetype == "Month" || timetype == "Week") {
            $(document).click(function (e) {
                var len1 = $(e.target)[0] === $txtDate[0] ? 1 : 0;
                var len4 = $(e.target)[0] === txtStart[0] ? 1 : 0;
                var len2 = $(e.target).parents("#divYearMonth").length;
                var len3 = $(e.target).parents("#divYearMonthStart").length;
                var title = $(e.target).attr("title");
                if (len1 == 1 || len2 == 1 || len3 == 1 || len4 == 1 || title == "上一年" || title == "下一年") {
                    return;
                }
                else {
                    $divYearMonth.empty();
                    $divYearMonthStart.empty();
                }
            });
        }
    }

    function changeTimeType(ddlTimeType, $txtDate, paras) {
        initDate(ddlTimeType, $txtDate, paras);
    }

    function getDefaultStartDate(timeType, curDate) {
        var newdate = new Date();
        if (timeType == "Month") {
            var m = curDate.getMonth();
            var y = curDate.getFullYear();
            if (m == 11) {
                m = 0;
            }
            else {
                y = y - 1;
                m = m + 1;
            }
            newdate = new Date(y, m, curDate.getDate());
        }
        else if (timeType == "Week") {
            newdate = curDate;
            newdate.setDate(newdate.getDate() - 91);
        }
        else if (timeType == "Day") {
            newdate = new Date();
            newdate.setDate(newdate.getDate() - 30);
        }
        else {
            newdate = curDate;
            //newdate.setDate(curDate.getDate() - 1);
        }
        return newdate;
    }

    function getDefaultDate(timeType) {
        var curDate = new Date();
        if (timeType == "Month") {
            var month = curDate.getMonth();
            if (month == 0) {
                curDate = new Date(curDate.getFullYear() - 1, 11, 1);
            }
            else {
                curDate = new Date(curDate.getFullYear(), month - 1, 1);
            }
        }
        else if (timeType == "Week") {
            curDate.setDate(curDate.getDate() - 7);
        }
        else {
            curDate.setDate(curDate.getDate() - 1);
        }
        return curDate;
    }

    function getMonthEndYear() {
        var curDate = new Date();
        var curMonth = curDate.getMonth();
        var year = curDate.getFullYear();
        if (curMonth == 0) {
            year = year - 1;
        }
        return year;
    }

    function getEndMonth(year) {
        var curDate = new Date();
        var curMonth = curDate.getMonth();
        var curYear = curDate.getFullYear();
        if (year < curYear || curMonth == 0) {
            curMonth = 11;
        }
        else if (year == curYear) {
            curMonth--;
        }
        return curMonth;
    }

    function getWeekEndYear() {
        var curDate = new Date();
    }


    function initTimeMonthText(txt, $divYearMonth) {
        $divYearMonth.width(txt.outerWidth(true));
        $divYearMonth.css("position", "absolute");
        $divYearMonth.css("z-index", "999");
        txt.parent().append($divYearMonth);
        txt.bind("click", function (event) {
            var top = txt.offset().top;
            top += txt.outerHeight();
            var left = txt.offset().left;
            $divYearMonth.offset({ top: top, left: left });
            $divYearMonth.show();
            bindYearMonth(txt, $divYearMonth);
        });
    }

    function initTimeWeekText(txt, $divYearMonth) {
        $divYearMonth.width(txt.outerWidth(true));
        $divYearMonth.css("position", "absolute");
        $divYearMonth.css("z-index", "999");
        txt.parent().append($divYearMonth);
        txt.bind("click", function (event) {
            var top = txt.offset().top;
            top += txt.outerHeight(); ;
            var left = txt.offset().left;
            $divYearMonth.offset({ top: top, left: left });
            $divYearMonth.show();
            bindYearWeek(txt, $divYearMonth);
        });
    }

    var year = 0;

    //绑定年月
    function bindYearMonth(txt, $divYearMonth) {
        $divYearMonth.empty();

        var $ulYearMonth = $("<ul class='ui-menu ui-widget ui-widget-content'></ul>");
        var date = new Date();
        var yy = date.getFullYear() + year;
        for (var i = 1; i <= 12; i++) {
            if (i < 10) {
                i = "0" + i;
            }
            var option = $("<li class='ui-menu-item'>" + yy + "年" + i + "月</li>");

            option.click(function () {
                txt.val($(this).text());
                $divYearMonth.empty();
            });
            option.css("cursor", "pointer");
            option.mouseover(function () {
                $(this).addClass("ui-state-highlight");
            });
            option.mouseout(function () {
                $(this).removeClass("ui-state-highlight");
            });
            $ulYearMonth.append(option);
            var $div = $("<div></div>");
            $div.append($ulYearMonth);
            $divYearMonth.append($div);
        }
        addPreNextButton(txt, $divYearMonth, bindYearMonth);
    }

    //绑定年周
    function bindYearWeek(txt, $divYearWeek) {
        $divYearWeek.empty();
        var $ulYearMonth = $("<ul class='ui-menu ui-widget ui-widget-content'></ul>");
        var date = new Date();
        var curYear = date.getFullYear();
        date.setFullYear(curYear + year, 11, 31);
        var weekarr = getWeekArray(date);
        var yy = curYear + year;
        for (var i = 1; i <= weekarr.length; i++) {
            if (i < 10) {
                i = "0" + i;
            }
            var option = $("<li class='ui-menu-item' title='" + weekarr[i - 1] + "'>" + yy + "年" + i + "周</li>");
            option.click(function () {
                txt.val($(this).text());
                $divYearWeek.empty();
            });
            option.css("cursor", "pointer");
            option.mouseover(function () {
                $(this).addClass("ui-state-highlight");
            });
            option.mouseout(function () {
                $(this).removeClass("ui-state-highlight");
            });
            $ulYearMonth.append(option);
        }
        var $div = $("<div></div>");
        $div.css("height", "300px");
        $div.css("overflow", "auto");
        $div.append($ulYearMonth);
        $divYearWeek.append($div);
        addPreNextButton(txt, $divYearWeek, bindYearWeek);
    }

    function addPreNextButton(txt, $divYearMonth, func) {
        var $table = $("<table border='0' cellspacing='0' cellpadding='2' width='100%' class='ui-state-default ui-datepicker-header ui-widget-header ui-helper-clearfix'></table>");
        var $div = $("<tr></tr>");
        var $div1 = $("<td class='ui-datepicker-prev'></td>");
        var $div2 = $("<td class='ui-datepicker-next' align='right'></td>");
        var $btnPre = $("<span class='ui-icon ui-icon ui-icon-circle-triangle-w' title='上一年'></span>");
        var $td = $("<td align='center' class='ui-datepicker-title' valign='middle'></td>");
        $btnPre.click(function () {
            year = year - 1;
            func(txt, $divYearMonth);
            $td.text((new Date().getFullYear() + year) + "年");
        });
        $div1.append($btnPre);
        var $btnNext = $("<span class='ui-icon ui-icon ui-icon-circle-triangle-e' title='下一年'></span>");
        $btnNext.click(function () {
            year = year + 1;
            func(txt, $divYearMonth);
            if (year == undefined || year == 0) {
                $(this).attr("disabled", "disabled");
            }
            else {
                $(this).attr("enabled", "enabled");
            }
            $td.text((new Date().getFullYear() + year) + "年");
        });
        $div2.append($btnNext);
        $div.append($div1);

        $td.text((new Date().getFullYear() + year) + "年");
        $div.append($td);
        $div.append($div2);
        $table.append($div);
        $divYearMonth.append($table);
    }


    function getWeekArray(date) {
        var y = date.getFullYear();
        var m = date.getMonth();
        var d = date.getDate();
        var w = date.getDay();
        var num = 1;
        var weekArr = [];
        var dayOfMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        d = d - w;
        if (d < 1) {
            m = m - 1;
            if (m < 0) {
                y = y - 1;
                m = 11;
            }
            d = dayOfMonth[m] + d;
        }
        var lastweek = "";
        if (m == 11 && (d + w) == 31 && w > 0) {
            lastweek = y + "年12月" + (d + 1) + "日--" + y + "年12月31日";
        }
        var isLeaps = isLeapYear(y);
        if (isLeaps) {
            dayOfMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        }

        do {
            var endD = d;
            var endM = m;
            d = d - 6;
            if (d < 1) {
                m = m - 1;
                if (m >= 0) {
                    d = dayOfMonth[m] + d;
                }
                else {
                    m = 0;
                }
            }
            var startD = d;
            var startM = m;
            d = d - 1;
            if (d < 1) {
                m = m - 1;
                if (m >= 0) {
                    d = dayOfMonth[m] + d;
                }
                else {
                    startD = 1;
                }
            }
            weekArr.push(y + "年" + paddingZeroLeft(startM + 1) + "月" + paddingZeroLeft(startD) +
            "日--" + y + "年" + paddingZeroLeft(endM + 1) + "月" + paddingZeroLeft(endD) + "日");
        } while (m >= 0 && d > 0);
        weekArr = weekArr.reverse();
        if (lastweek != "") {
            weekArr.push(lastweek);
        }
        return weekArr;
    }

    function paddingZeroLeft(d) {
        if (d < 10) {
            return "0" + d;
        }
        else {
            return d;
        }
    }

    // Calculating the week number of a given date
    function getWeek(date) {
        var result = null;
        var array = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        var month = date.getMonth();
        var weekday = date.getDay() == 0 ? 7 : date.getDay();
        var year = date.getFullYear();
        var tmp = array[month] + date.getDate() + 10 - weekday;
        if (month > 1 && isLeapYear(year)) {
            tmp++;
        }
        //If the week number thus obtained equals 0, it means that the given 
        //date belongs to the preceding (week-based) year. If a week number 
        //of 53 is obtained, one must check that the date is not actually
        //in week 1 of the following year.
        if (tmp < 7) {
            if (isLeapYear(year - 1)) {
                result = parseInt((tmp + 366) / 7);
            } else {
                result = parseInt((tmp + 365) / 7);
            }
        } else {
            result = parseInt(tmp / 7);
            if (53 == result) {
                result = checkIs53thWeek(date) ? 53 : 1;
            }
        }
        return result;
    }

    /**
    * Number of ISO weeks in an ISO year
    * The 53-week ISO week-numbering years can be described by any of the following equivalent definitions:
    * years with the dominical letter ED, D, or DC;
    * all years starting on Thursday, and leap years starting on Wednesday;
    * all years ending on Thursday, and leap years ending on Friday;
    * years in which either 1 January or 31 December is a Thursday (in leap years), or in which both are Thursdays (in common years).
    * All other week-numbering years have 52 weeks.
    */
    function checkIs53thWeek(date) {
        //Years in which either 1 January or 31 December is a Thursday (in leap years), or in which both are Thursdays (in common years).
        var jan1 = new Date(date.getFullYear(), 0, 1);
        var dec31 = new Date(date.getFullYear(), 11, 31);
        if (jan1.getDay() == 4 || dec31.getDay() == 4) {
            return true;
        }
        return false;
    }
    function isLeapYear(year) {
        return (year % 4 == 0) && ((year % 100 != 0) || (year % 400 == 0));
    }
    function getDayNumber(year) {
        return isLeapYear(year) ? 366 : 365;
    }





    function AddDdlTimeType(paras) {
        var s = "";
        if (paras.showTypeDay) {
            s += "<option value=Day>日</option>";
        }
        if (paras.showTypeMonth) {
            s += "<option value=Month>月</option>";
        }
        if (paras.showTypeWeek) {
            s += "<option value=Week>周</option>";
        }
        if (paras.showTypeHour) {
            s += "<option value=Hour>小时</option>";
        }
        return $(s);
    }

    function isShowTimeType(paras) {
        var count = 0;
        if (paras.showTypeMonth) {
            count++;
        }
        if (paras.showTypeWeek) {
            count++;
        }
        if (paras.showTypeHour) {
            count++;
        }
        if (paras.showTypeDay) {
            count++;
        }
        if (count > 1) {
            return true;
        }
        else {
            return false;
        }
    }


})(jQuery);
