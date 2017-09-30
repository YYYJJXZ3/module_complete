/*!
* jQuery timepicker 1.1.7
* Copyright 2013 BocoDss
* Depends:
*	jquery.ui.core.js
*   jquery.ui.datepicker.js
*/
(function ($) {
    var methods = {
        init: function (settings) {
            var paras = $.extend(true, {}, $.fn.timepicker.defaults, settings);
            formatDefaultDateStr(paras);
            var $txtDate = this;
            $txtDate.data("range", paras.range);
            $txtDate.data("ismultiplehour", paras.isMultipleHour);
            $txtDate.prop("readonly", true);
            var $div;
            if ($txtDate.parent().is("#divTimeCtrl")) {
                $div = $txtDate.parent();
            }
            else {
                $div = $("<div id='divTimeCtrl'></div>"); $div.css("display", "table"); $txtDate.after($div);
                $div.append($txtDate);
            }
            var isShowType = isShowTimeType(paras);
            var $ddlType;

            if ($div.find("#ddlTimeType").length > 0) {
                $ddlType = $("#ddlTimeType", $div);
                $ddlType.empty();
            }
            else {
                if (paras.isTile) {
                    $ddlType = $("<ul id=ddlTimeType></ul>");
                    $ddlType.addClass("tabControl");
                    $div.prepend($ddlType);
                }
                else {
                    $ddlType = $("<select id=ddlTimeType></select>");
                    $div.prepend($ddlType);
                }
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
                dateType = dateType == "日" ? "Day" : (dateType == "周" ? "Week" : (dateType == "月" ? "Month" : (dateType == "小时" ? "Hour" : (dateType == "分钟" ? "Minute" : (dateType=="半年"?"HalfYear":(dateType=="年"?"Year":(dateType=="季度"?"Quarter":dateType)))))));
                if (dateType == undefined) {
                    dateType = "Day";
                }
                if (paras.isTile) {
                    $ddlType.find("li[valueli='" + dateType + "']").eq(0).addClass("selected");
                }
                else {
                    $ddlType.val(dateType);
                }
                initDate(dateType, $txtDate, paras);
            }
            else {
                if (paras.isTile) {
                    $ddlType.find("li").eq(0).addClass("selected");
                    initDate($ddlType.find("li").eq(0).attr("valueli"), $txtDate, paras);
                }
                else {
                    initDate($ddlType.val(), $txtDate, paras);
                }
            }
            if (paras.isTile) {
                $ddlType.find("li").each(function () {
                    $(this).click(function () {
                        $(this).parent().find("li").removeClass("selected");
                        $(this).addClass("selected");
                        var timetype = $(this).attr("valueli")
                        paras.defaultDate = getDefaultDate(timetype);
                        $("#tp_divHour", $(this).parent()).find(":checkbox").prop("checked", false);
                        initDate(timetype, $txtDate, paras);
                        if (paras.timeTypeSelectedChange) {
                            paras.timeTypeSelectedChange(timetype);
                        }
                        var ulSelect;
                        if ($("#ddlSelectTime").length > 0) {
                            ulSelect = $("#ddlSelectTime");
                            ulSelect.empty();
                        }
                        else {
                            ulSelect = $("<ul id='ddlSelectTime'></ul>");
                            ulSelect.addClass("tabtimeControl");
                        }
                        var types = $ddlType.find("li[class='selected']").eq(0).attr("valueli");
                        ulSelect.append(AddQuick(types));
                        $ddlType.after(ulSelect);
                        ulSelect.find("li").each(function () {
                            $(this).click(function () {
                                var sStr = {
                                    defaultDateStr: $(this).attr("valueli")
                                };
                                formatDefaultDateStr(sStr);
                                ulSelect.parent().find("input[type='text']").eq(0).val(sStr.defaultDateStr);
                            });

                        });
                    });

                });
            }
            else {
                $ddlType.change(function () {
                    var timetype = $(this).val();
                    paras.defaultDate = getDefaultDate(timetype);
                    $("#tp_divHour", $(this).parent()).find(":checkbox").prop("checked", false);
                    initDate($ddlType.val(), $txtDate, paras);
                    if (paras.timeTypeSelectedChange) {
                        paras.timeTypeSelectedChange(timetype);
                    }
                });
            }
            if (paras.isTile) {
                var ulSelect;
                if ($("#ddlSelectTime").length > 0) {
                    ulSelect = $("#ddlSelectTime");
                    ulSelect.empty();
                }
                else {
                    ulSelect = $("<ul id='ddlSelectTime'></ul>");
                    ulSelect.addClass("tabtimeControl");
                }
                var types = $ddlType.find("li[class='selected']").eq(0).attr("valueli");
                ulSelect.append(AddQuick(types));
                $ddlType.after(ulSelect);
                ulSelect.find("li").each(function () {
                    $(this).click(function () {
                        var sStr = {
                            defaultDateStr: $(this).attr("valueli")
                        };
                        formatDefaultDateStr(sStr);
                        ulSelect.parent().find("input[type='text']").eq(0).val(sStr.defaultDateStr);
                    });

                });
            }
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
            var tmtp;
            if (this.parent().find("select[id=ddlTimeType]").length > 0) {
                tmtp = this.parent().find("select[id=ddlTimeType]").val();
            }
            else {
                tmtp = this.parent().find("li[class='selected']").eq(0).attr("valueli");
            }
            if (tmtp == "Hour" || tmtp == "Minute") {
                if (this.data("ismultiplehour") == true) {
                    var h = $("#tp_txtHour", this.parent()).val();
                    if (h == "全天") {
                        h = "";
                    }
                    return h;
                }
                else {
                    if (this.data("range") == true) {
                        return this.siblings(":text").next().val() + "时" + ":" + this.next().val() + "时";
                    }
                    else {
                        return this.next().val() + "时";
                    }
                }
            }
            else {
                return "";
            }
        },
        getMinuteStr: function () {
            return "";
        },
        getTimeType: function () {
            if (this.parent().find("select[id=ddlTimeType]").length > 0) {
                return this.parent().find("select[id=ddlTimeType]").val();
            }
            else {
                return this.parent().find("ul[id=ddlTimeType]").find("li[class=selected]").eq(0).attr("valueli");
            }
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

    $.fn.timepicker.defaults = {
        showTypeMonth: true,
        showTypeWeek: false,
        showTypeHour: false,
        showTypeDay: true,
        showTypeMinute: false,
        showTypeQuarter: false,
        showTypeHalfYear: false,
        showTypeYear:false,
        isMultipleHour: false,
        defaultTimeType: undefined,
        defaultDateStart: undefined,
        defaultDate: undefined,
        defaultDateStr: undefined,
        defaultHourStr: undefined,
        isTile: false,
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
    };

    function formatDefaultDateStr(paras) {
        if (paras.defaultDateStr != null) {
            var newdate = new Date();
            if (paras.defaultDateStr == "昨天") {
                newdate.setDate(newdate.getDate() - 1);
                paras.defaultDateStr = dateToString(newdate, "yyyymmdd");
            }
            else if (paras.defaultDateStr == "前天") {
                newdate.setDate(newdate.getDate() - 2);
                paras.defaultDateStr = dateToString(newdate, "yyyymmdd");
            }
            else if (paras.defaultDateStr == "上月同一天") {
                newdate.setDate(newdate.getDate() - 30);
                paras.defaultDateStr = dateToString(newdate, "yyyymmdd");
            }
            else if (paras.defaultDateStr == "上周同一天") {
                newdate.setDate(newdate.getDate() - 7);
                paras.defaultDateStr = dateToString(newdate, "yyyymmdd");
            }
            else if (paras.defaultDateStr == "上月") {
                newdate.setDate(newdate.getDate() - 30);
                paras.defaultDateStr = dateToString(newdate, "yyyymm");
            }
            else if (paras.defaultDateStr == "上上月") {
                newdate.setDate(newdate.getDate() - 61);
                paras.defaultDateStr = dateToString(newdate, "yyyymm");
            }
            else if (paras.defaultDateStr == "上周") {
                newdate.setDate(newdate.getDate() - 7);
                paras.defaultDateStr = dateToString(newdate, "yyyyww");
            }
            else if (paras.defaultDateStr == "上上周") {
                newdate.setDate(newdate.getDate() - 14);
                paras.defaultDateStr = dateToString(newdate, "yyyyww");
            }
            else if (paras.defaultDateStr == "上年同月") {
                newdate.setDate(newdate.getDate() - 366);
                paras.defaultDateStr = dateToString(newdate, "yyyymm");
            }
            else if (paras.defaultDateStr == "上年同周") {
                newdate.setDate(newdate.getDate() - 366);
                paras.defaultDateStr = dateToString(newdate, "yyyyww");
            }
        }
    }

    function dateStringToDate(dateString) {
        var date = new Date();
        date.setDate(1);
        if (dateString.indexOf("季度") > -1) {
            var jd = dateString.replace("年", "").replace("季度", "");
            var y = parseInt(jd.substr(0, 4));
            var q = parseInt(jd.substr(4, 1));
            date = new Date(y, (q - 1) * 3, 1);
        }
        else if (dateString.indexOf("半") > -1) {
            var y = parseInt(dateString.substr(0, 4));
            if (dateString.indexOf("上")>-1) {
                date = new Date(y, 5, 30);
            }
            else {
                date = new Date(y, 11, 31);
            }
        }
        else if (dateString.indexOf("年") > -1 && dateString.indexOf("月") < 0 && dateString.indexOf("周") < 0) {
            var y = parseInt(dateString.substr(0, 4));
            date = new Date(y, 11, 31);
        }
        else {
            var arr = dateString.split(/[年月周日时\-:\s]/);
            if ($.trim(arr[arr.length - 1]) == "") {
                arr.pop();
            }
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
                    if (arr[1].indexOf("0") == 0) {
                        w = parseInt(arr[1].substr(1));
                    }
                    var dat = new Date(y, 11, 31);
                    var weekArr = getWeekArray(dat);
                    if (w > weekArr.length) {
                        w = weekArr.length;
                    }
                    date = dateStringToDate(weekArr[w - 1].split("--")[1]);
                }
                else {
                    date.setFullYear(arr[0], arr[1] - 1, 1);
                }
            }
            else if (arr.length > 0) {
                date.setFullYear(arr[0]);
            }
        }
        return date;
    }

    function getTimeTypeFromDateStr(dateString) {
        if (dateString == undefined) {
            return undefined;
        }
        if (dateString.indexOf(":") > -1) {
            dateString = dateString.split(":")[0];
        }
        if (dateString.indexOf("半") > -1) {
            return "HalfYear";
        }
        if (dateString.indexOf("季度") > -1) {
            return "Quarter";
        }
        if (dateString.indexOf("年") > -1 && dateString.indexOf("月") < 0 && dateString.indexOf("周") < 0) {
            return "Year";
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
        if (string == null) {
            return false;
        }
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
        var imonth = date.getMonth() + 1;
        var monthstr = imonth + "";
        if (imonth < 10) {
            monthstr = "0" + monthstr;
        }
        var daystr = date.getDate();
        if (daystr < 10) {
            daystr = "0" + daystr;
        }
        if (format == "yyyymm") {
            return yearstr + "年" + monthstr + "月";
        }
        else if (format == "yyyyss") {
            return yearstr + "年" + parseInt(imonth / 3 + 1) + "季度";
        }
        else if (format == "yyyy") {
            return yearstr + "年";
        }
        else if (format == "yyyyhh") {
            return yearstr + "年" + (imonth > 6 ? "下半年" : "上半年");
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
        var timetype = ddlTimeType;
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
        var txt = $txtDate; $("#ddlhour", txt.parent()).remove(); $("#tp_txtHour", txt.parent()).hide();
        $("#ddlStartHour", txt.parent()).remove();
        var txtStart = txt.clone();
        txtStart.attr("id", "txtStartDate" + $txtDate.attr("id"));
        if (paras.range == true) {
            if (!txt.prev().is("span")) {
                txt.before(txtStart);
                txt.before($("<span> -- </span>"));
            }
            else {
                txtStart = txt.prevAll(":text:eq(0)");
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
        var $divYearMonth = $("<div id='divYearMonth' class='ui-datepicker ui-widget ui-widget-content' style='overflow:hidden'></div>");
        var $divYearMonthStart = $("<div id='divYearMonthStart' class='ui-datepicker ui-widget ui-widget-content' style='overflow:hidden'></div>");
        if (timetype == "Month") {
            txt.val(dateToString(paras.defaultDate, "yyyymm"));
            initTimeMonthText(txt, $divYearMonth);
            if (paras.range == true) {
                txtStart.val(dateToString(paras.defaultDateStart, "yyyymm"));
                initTimeMonthText(txtStart, $divYearMonthStart);
            }
        }
        else if (timetype == "Quarter") {
            txt.val(dateToString(paras.defaultDate, "yyyyss"));
            initTimeQuarterText(txt, $divYearMonth);
            if (paras.range == true) {
                txtStart.val(dateToString(paras.defaultDateStart, "yyyyss"));
                initTimeQuarterText(txtStart, $divYearMonthStart);
            }
        }
        else if (timetype == "HalfYear") {
            txt.val(dateToString(paras.defaultDate, "yyyyhh"));
            initTimeHalfYearText(txt, $divYearMonth);
            if (paras.range == true) {
                txtStart.val(dateToString(paras.defaultDateStart, "yyyyhh"));
                initTimeHalfYearText(txtStart, $divYearMonthStart);
            }
        }
        else if (timetype == "Year") {
            txt.val(dateToString(paras.defaultDate, "yyyy"));
            initTimeYearText(txt, $divYearMonth);
            if (paras.range == true) {
                txtStart.val(dateToString(paras.defaultDateStart, "yyyy"));
                initTimeYearText(txtStart, $divYearMonthStart);
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
            if (timetype == "Hour" || timetype == "Minute") {
                if (paras.isMultipleHour == true) {
                    showTxtHour(txt, paras.defaultHourStr);
                }
                else {
                    var $hourDdl = $("<select id=ddlhour></select>");
                    for (var i = 0; i < 24; i++) {
                        var s = i;
                        if (s < 10) {
                            s = "0" + s;
                        }
                        $hourDdl.append($("<option value=" + s + ">" + s + "时</option>"));
                    }
                    if (paras.defaultHourStr != null && paras.defaultHourStr != "") {
                        $hourDdl.val(paras.defaultHourStr.substr(0, 2));
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
        }
        if (timetype == "Month" || timetype == "Week" || timetype == "Quarter" || timetype == "Year" || timetype == "HalfYear") {
            $(document).click(function (e) {
                var len1 = $(e.target)[0] === $txtDate[0] ? 1 : 0;
                var len4 = $(e.target)[0] === txtStart[0] ? 1 : 0;
                var len2 = $(e.target).parents("#divYearMonth").length;
                var len3 = $(e.target).parents("#divYearMonthStart").length;
                var title = $(e.target).attr("title");
                if (len1 == 1 || len2 == 1 || len3 == 1 || len4 == 1 || title == "上一年" || title == "下一年") {
                    if (len1 == 1) {
                        $divYearMonthStart.empty().removeClass("ui-datepicker").removeClass("ui-widget-content");
                    }
                    else if (len4 == 1) {
                        $divYearMonth.empty().removeClass("ui-datepicker").removeClass("ui-widget-content");
                    }
                    return;
                }
                else {
                    $divYearMonth.empty().removeClass("ui-datepicker").removeClass("ui-widget-content");
                    $divYearMonthStart.empty().removeClass("ui-datepicker").removeClass("ui-widget-content");
                }
            });
        }
    }

    function showTxtHour(txt, defaultHourStr) {
        var $txthour = txt.parent().find("#tp_txtHour");
        if ($txthour.length == 0) {
            var $txthour = $("<input type='text' id='tp_txtHour' readonly='readonly' value='全天' style='width:60px;' />");
            if (defaultHourStr != null) {
                $txthour.val(defaultHourStr);
            }
            txt.after($txthour);
            $txthour.click(function (e) {
                var $divhour = $("#tp_divHour", txt.parent());
                if ($divhour.length == 0) {
                    $divhour = addDivHour($txthour);
                }

                $divhour.css("position", "absolute"); $divhour.css("z-index", "999");
                if ($(this).data("isshow") == null || $(this).data("isshow") == "0") {
                    $divhour.show();
                    $(this).data("isshow", "1");
                }
                else {
                    $divhour.hide();
                    $(this).data("isshow", "0");
                } e.stopPropagation();
            });
        }
        else {
            $txthour.val("全天"); txt.parent().find("#tp_divHour>:checkbox").prop("checked", false);
            txt.parent().find("#tp_divHour>:checkbox:eq(0)").prop("checked", true);
        }
        $txthour.show();
        return $txthour;
    }

    function addDivHour($txtHour) {
        var $divhour = $("<div id='tp_divHour' style='position:absolute;z-index:999;display:none;height:420px; overflow:auto; background-color:#f4f4f4;border:1px solid #666666;'></div>");
        $divhour.width($txtHour.outerWidth(true));
        var top = $txtHour.offset().top;
        top += $txtHour.outerHeight();
        var left = $txtHour.offset().left;
        $divhour.offset({ top: top, left: left });
        var $chkallhour = $("<input name='chkHour' type='checkbox' value=''/>");
        defaultHourStr = $txtHour.val();
        if (defaultHourStr == "全天" || defaultHourStr == "") {
            $chkallhour.prop("checked", true);
        }
        $divhour.append($chkallhour);
        $divhour.append("<span>全天</span><br/>");
        for (var i = 0; i < 24; i++) {
            var s = i;
            if (s < 10) {
                s = "0" + s;
            } else { s = s + ""; }
            var $chkhour = $("<input name='chkHour' type='checkbox' value='" + s + "'/>");

            if (contains(defaultHourStr, s, true) || contains(defaultHourStr, s + "时", true)) {
                $chkhour.prop("checked", true);
            }
            $divhour.append($chkhour);
            $divhour.append("<span>" + s + "时</span><br/>");
        }
        $divhour.find(":checkbox").click(function () {
            if ($(this).val() == "") {
                $divhour.find(":checkbox[value!='']").prop("checked", $(this).prop("checked"));
            }
            else {
                $divhour.find(":checkbox:eq(0)").prop("checked", $divhour.find(":checkbox[value!='']:checked").length == 24);
            }
            var hourstr = "";
            if ($divhour.find(":checkbox[value='']").prop("checked")) {
                hourstr = "全天";
            }
            else {
                $divhour.find(":checkbox[value!='']:checked").each(function () {
                    hourstr += $(this).val() + "时,"
                });
                hourstr = hourstr.substr(0, hourstr.length - 1);
            }
            $divhour.parent().find("#tp_txtHour").val(hourstr);

        });
        $divhour.click(function (ee) { ee.stopPropagation(); });
        $txtHour.after($divhour);
        $(">html>body").click(function () { $("#tp_divHour").hide(); $("#tp_txtHour").data("isshow", "0"); });
        return $divhour;
    }

    function changeTimeType(ddlTimeType, $txtDate, paras) {
        initDate(ddlTimeType, $txtDate, paras);
    }

    function getDefaultStartDate(timeType, curDate) {
        var m = curDate.getMonth();
        var y = curDate.getFullYear();
        var d = curDate.getDate();
        var newdate = new Date(y, m, d);
        if (timeType == "Month") {
            if (m == 11) {
                m = 0;
            }
            else {
                y = y - 1;
                m = m + 1;
            }
            newdate = new Date(y, m, d);
        }
        else if (timeType == "Week") {
            newdate.setDate(newdate.getDate() - 91);
        }
        else if (timeType == "Day") {
            newdate = new Date();
            newdate.setDate(newdate.getDate() - 30);
        }
        else {
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
        else if (timeType == "Quarter") {
            var month = curDate.getMonth();
            if (month < 3) {
                curDate = new Date(curDate.getFullYear() - 1, 9, 1);
            }
            else {
                curDate = new Date(curDate.getFullYear(), month - 3, 1);
            }
        }
        else if (timeType == "Year") {
            curDate = new Date(curDate.getFullYear() - 1, 11, 31);
        }
        else if (timeType == "HalfYear") {
            var month = curDate.getMonth();
            if (month > 5) {
                curDate = new Date(curDate.getFullYear(), 5, 30);
            }
            else {
                curDate = new Date(curDate.getFullYear() - 1, 11, 31);
            }
        }
        else {
            //curDate.setDate(curDate.getDate() - 1);
            curDate = new Date(2016, 10, 15);
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

    function initTimeQuarterText(txt, $divYearMonth) {
        $divYearMonth.width(200);
        $divYearMonth.css("position", "absolute");
        $divYearMonth.css("z-index", "999");
        txt.parent().append($divYearMonth);
        txt.bind("click", function (event) {
            $divYearMonth.addClass("ui-datepicker").addClass("ui-widget-content");
            var top = txt.offset().top;
            top += txt.outerHeight();
            var left = txt.offset().left;
            $divYearMonth.offset({ top: top, left: left });
            $divYearMonth.show();
            bindYearQuarter(txt, $divYearMonth);
        });
    }

    function initTimeHalfYearText(txt, $divYearMonth) {
        $divYearMonth.width(200);
        $divYearMonth.css("position", "absolute");
        $divYearMonth.css("z-index", "999");
        txt.parent().append($divYearMonth);
        txt.bind("click", function (event) {
            $divYearMonth.addClass("ui-datepicker").addClass("ui-widget-content");
            var top = txt.offset().top;
            top += txt.outerHeight();
            var left = txt.offset().left;
            $divYearMonth.offset({ top: top, left: left });
            $divYearMonth.show();
            bindHalfYear(txt, $divYearMonth);
        });
    }

    function initTimeYearText(txt, $divYearMonth) {
        $divYearMonth.css({width:$(txt).css("width"),"height":"220px",overflow:"auto"});
        $divYearMonth.css("position", "absolute");
        $divYearMonth.css("z-index", "999");
        txt.parent().append($divYearMonth);
        txt.bind("click", function (event) {
            $divYearMonth.addClass("ui-datepicker").addClass("ui-widget-content");
            var top = txt.offset().top;
            top += txt.outerHeight();
            var left = txt.offset().left;
            $divYearMonth.offset({ top: top, left: left });
            $divYearMonth.show();
            bindYear(txt, $divYearMonth);
        });
    }


    function initTimeMonthText(txt, $divYearMonth) {
        $divYearMonth.width(200);
        $divYearMonth.css("position", "absolute");
        $divYearMonth.css("z-index", "999");
        txt.parent().append($divYearMonth);
        txt.bind("click", function (event) {
            $divYearMonth.addClass("ui-datepicker").addClass("ui-widget-content");
            var top = txt.offset().top;
            top += txt.outerHeight();
            var left = txt.offset().left;
            $divYearMonth.offset({ top: top, left: left });
            $divYearMonth.show();
            bindYearMonth(txt, $divYearMonth);
        });
    }

    function initTimeWeekText(txt, $divYearMonth) {
        $divYearMonth.width(300);
        $divYearMonth.css("position", "absolute");
        $divYearMonth.css("z-index", "999");
        txt.parent().append($divYearMonth);
        txt.bind("click", function (event) {
            $divYearMonth.addClass("ui-datepicker").addClass("ui-widget-content");
            var top = txt.offset().top;
            top += txt.outerHeight();;
            var left = txt.offset().left;
            $divYearMonth.offset({ top: top, left: left });
            $divYearMonth.show();
            bindYearWeek(txt, $divYearMonth);
        });
    }

    var year = 0;

    function bindYearQuarter(txt, $divYearMonth) {
        $divYearMonth.empty();
        addPreNextButton(txt, $divYearMonth, bindYearQuarter);
        var $ulYearMonth = $("<table class='ui-datepicker-calendar' style='width:200px;'></table>");
        var date = new Date();
        var curMonth = date.getMonth() + 1;
        var yy = date.getFullYear() + year;
        for (var r = 0; r < 2; r++) {
            var $tr = $("<tr></tr>");
            for (var i = 1; i <= 2; i++) {
                var iquarter = r * 2 + i;
                var option = $("<td class='ui-state-default' style='border: 2px solid #fff;'>" + iquarter + "季度</td>").css("text-align", "center");
                if (year > 0 || (year == 0 && iquarter > parseInt(curMonth / 3))) {
                    option.prop("disabled", true).css("background-color", "#e3e3e3");
                }
                if (year == 0 && (iquarter == parseInt(curMonth / 3) + 1)) {
                    option.addClass("ui-state-highlight1");
                }
                option.click(function () {
                    txt.val(yy + "年" + $(this).text());
                    $divYearMonth.empty();
                });
                option.css("cursor", "pointer");
                option.mouseover(function () {
                    $(this).addClass("ui-state-highlight");
                });
                option.mouseout(function () {
                    $(this).removeClass("ui-state-highlight");
                });
                $tr.append(option);

            }
            $ulYearMonth.append($tr);
            $divYearMonth.append($ulYearMonth);
        }

    }

    function bindYear(txt, $divYearMonth) {
        $divYearMonth.empty();
        var $ulYearMonth = $("<table class='ui-datepicker-calendar' style='width:100%;'></table>");
        var date = new Date();
        var yy = date.getFullYear() + year;
        var curYear = new Date().getFullYear();
        for (var i = curYear ; i > 2000; i--) {
            var $tr = $("<tr></tr>");
            var option = $("<td class='ui-state-default' style='border: 2px solid #fff;'>" + i + "年</td>").css("text-align", "center");
            if (i > curYear) {
                option.prop("disabled", true).css("background-color", "#e3e3e3");
            }
            if (year == 0 && (i == curYear)) {
                option.addClass("ui-state-highlight1");
            }
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
            $tr.append(option);
            $ulYearMonth.append($tr);
        }
        $divYearMonth.append($ulYearMonth);
    }

    function bindHalfYear(txt, $divYearMonth) {
        $divYearMonth.empty();
        addPreNextButton(txt, $divYearMonth, bindHalfYear);
        var $ulYearMonth = $("<table class='ui-datepicker-calendar' style='width:200px;'></table>");
        var date = new Date();
        var curMonth = date.getMonth();
        var yy = date.getFullYear() + year;
        var $tr = $("<tr></tr>");
        for (var i = 1; i <= 2; i++) {
            var option = $("<td class='ui-state-default' style='border: 2px solid #fff;'>"+(i==1?"上":"下")+"半年</td>").css("text-align", "center");
            if (year > 0 || (year == 0 && parseInt(curMonth / 6)+1<i)) {
                option.prop("disabled", true).css("background-color", "#e3e3e3");
            }
            if (year == 0 && (i == parseInt(curMonth / 6) + 1)) {
                option.addClass("ui-state-highlight1");
            }
            option.click(function () {
                txt.val(yy + "年" + $(this).text());
                $divYearMonth.empty();
            });
            option.css("cursor", "pointer");
            option.mouseover(function () {
                $(this).addClass("ui-state-highlight");
            });
            option.mouseout(function () {
                $(this).removeClass("ui-state-highlight");
            });
            $tr.append(option);

        }
        $ulYearMonth.append($tr);
        $divYearMonth.append($ulYearMonth);
    }


    //绑定年月
    function bindYearMonth(txt, $divYearMonth) {
        $divYearMonth.empty();
        addPreNextButton(txt, $divYearMonth, bindYearMonth);
        var $ulYearMonth = $("<table class='ui-datepicker-calendar' style='width:200px;'></table>");
        var date = new Date();
        var curMonth = date.getMonth();
        var yy = date.getFullYear() + year;
        for (var r = 0; r < 4; r++) {
            var $tr = $("<tr></tr>");
            for (var i = 1; i <= 3; i++) {
                var m = i + 3 * r;
                var midx = m - 1;
                if (m < 10) {
                    m = "0" + m;
                }
                var option = $("<td class='ui-state-default' style='border: 2px solid #fff;'>" + m + "月</td>").css("text-align", "center");
                if (year > 0 || (year == 0 && midx > curMonth)) {
                    option.prop("disabled", true).css("background-color", "#e3e3e3");
                }
                if (year == 0 && midx == curMonth) {
                    option.addClass("ui-state-highlight1");
                }
                option.click(function () {
                    txt.val(yy + "年" + $(this).text());
                    $divYearMonth.empty();
                });
                option.css("cursor", "pointer");
                option.mouseover(function () {
                    $(this).addClass("ui-state-highlight");
                });
                option.mouseout(function () {
                    $(this).removeClass("ui-state-highlight");
                });
                $tr.append(option);

            }
            $ulYearMonth.append($tr);
            $divYearMonth.append($ulYearMonth);
        }

    }

    //绑定年周
    function bindYearWeek(txt, $divYearWeek) {
        $divYearWeek.empty();
        addPreNextButton(txt, $divYearWeek, bindYearWeek);
        var $ulYearMonth = $("<table class='ui-datepicker-calendar' style='width:300px;'></table>");
        var date = new Date();
        var curWeek = getWeek(date);
        var curYear = date.getFullYear();
        date.setFullYear(curYear + year, 11, 31);
        var weekarr = getWeekArray(date);
        var yy = curYear + year;
        for (var r = 0; r < 16; r++) {
            var $tr = $("<tr></tr>");
            for (var i = 1; i <= 6; i++) {
                var w = i + 6 * r;
                if (w > weekarr.length) break;
                var widx = w;
                if (w < 10) {
                    w = "0" + w;
                }
                var option = $("<td class='ui-state-default' title='" + weekarr[widx - 1] + "' style='border: 2px solid #fff;'>" + w + "周</td>").css("text-align", "center").tooltip();
                if (year > 0 || (year == 0 && widx > curWeek)) {
                    option.prop("disabled", true).css("background-color", "#e3e3e3");
                }
                if (year == 0 && widx == curWeek) {
                    option.addClass("ui-state-highlight1");
                }
                option.click(function () {
                    txt.val(yy + "年" + $(this).text());
                    $divYearWeek.empty();
                });
                option.css("cursor", "pointer");
                option.mouseover(function () {
                    $(this).addClass("ui-state-highlight");
                });
                option.mouseout(function () {
                    $(this).removeClass("ui-state-highlight");
                });
                $tr.append(option);
            }
            $ulYearMonth.append($tr);
        }
        $divYearWeek.append($ulYearMonth);
    }

    function addPreNextButton(txt, $divYearMonth, func) {
        var $table = $("<table border='0' cellspacing='0' cellpadding='2' width='100%' class='ui-state-default ui-datepicker-header ui-widget-header ui-helper-clearfix' style='margin-bottom:2px;'></table>");
        var $div = $("<tr></tr>");
        var $div1 = $("<td class='ui-datepicker-prev'></td>");
        var $div2 = $("<td class='ui-datepicker-next' align='right'></td>");
        var $btnPre = $("<span class='ui-icon ui-icon-circle-triangle-w' title='上一年' style='width:12px;'></span>");
        var $td = $("<td align='center' class='ui-datepicker-title' valign='middle'></td>");
        $btnPre.click(function () {
            year = year - 1;
            func(txt, $divYearMonth);
            $divYearMonth.find(">table:last").css("margin-left", "200px").animate({ marginLeft: 0 }, 'slow');
            $td.text((new Date().getFullYear() + year) + "年");
        });
        $div1.append($btnPre);
        var $btnNext = $("<span class='ui-icon ui-icon ui-icon-circle-triangle-e' title='下一年' style='width:12px;'></span>");
        $btnNext.click(function () {
            year = year + 1;
            func(txt, $divYearMonth);
            $divYearMonth.find(">table:last").css("margin-left", "-200px").animate({ marginLeft: 0 }, 'slow');
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

    function getWeek(date) {
        var result = null;
        var array = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        var month = date.getMonth();
        var weekday = date.getDay() == 0 ? 7 : date.getDay();
        var year = date.getFullYear();
        var tmp = array[month] + date.getDate();
        if (month > 1 && isLeapYear(year)) {
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



    function AddQuick(type) {
        var s = '';
        if (type == "Month") {
            s += "<li valueli='上月'>上月</li>";
            s += '<li valueli="上上月">前月</li>';
            s += '<li valueli="上年同月">上年同月</li>';
        }
        else if (type == "Week") {
            s += "<li valueli='上周'>上周</li>";
            s += '<li valueli="上上周">前周</li>';
            s += '<li valueli="上年同周">上年同周</li>';
        }
        else if (type != "Quarter" && type != "HalfYear" && type != "Year") {
            s += "<li valueli='昨天'>昨天</li>";
            s += '<li valueli="前天">前天</li>';
            s += '<li valueli="上周同一天">上周同天</li>';
        }
        return s;
    }
    function AddDdlTimeType(paras) {
        var s = "";
        if (paras.isTile) {
            if (paras.showTypeDay) {
                s += "<li valueli=Day>日</li>";
            }
            if (paras.showTypeMonth) {
                s += "<li valueli=Month>月</li>";
            }
            if (paras.showTypeWeek) {
                s += "<li valueli=Week>周</li>";
            }
            if (paras.showTypeQuarter) {
                s += "<li valueli=Quarter>季度</li>";
            }
            if (paras.showTypeHalfYear) {
                s += "<li valueli=HalfYear>半年</li>";
            }
            if (paras.showTypeYear) {
                s += "<li valueli=Year>年</li>";
            }
            if (paras.showTypeHour) {
                s += "<li valueli=Hour>小时</li>";
            }
            if (paras.showTypeMinute) {
                s += "<li valueli=Minute>分钟</li>";
            }
        }
        else {
            if (paras.showTypeDay) {
                s += "<option value=Day>日</option>";
            }
            if (paras.showTypeMonth) {
                s += "<option value=Month>月</option>";
            }
            if (paras.showTypeWeek) {
                s += "<option value=Week>周</option>";
            }
            if (paras.showTypeQuarter) {
                s += "<option value=Quarter>季度</option>";
            }
            if (paras.showTypeHalfYear) {
                s += "<option value=HalfYear>半年</option>";
            }
            if (paras.showTypeYear) {
                s += "<option value=Year>年</option>";
            }
            if (paras.showTypeHour) {
                s += "<option value=Hour>小时</option>";
            }
            if (paras.showTypeMinute) {
                s += "<option value=Minute>分钟</option>";
            }
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
        if (paras.showTypeQuarter) {
            count++;
        }
        if (paras.showTypeHalfYear) {
            count++;
        }
        if (paras.showTypeYear) {
            count++;
        }
        if (paras.showTypeMinute) {
            count++;
        }
        if (paras.isTile) {
            return true;
        }
        else {
            if (count > 1) {
                return true;
            }
            else {
                return false;
            }
        }
    }


})(jQuery);
