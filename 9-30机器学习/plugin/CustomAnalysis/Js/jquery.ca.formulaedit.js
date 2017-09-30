/*
* jQuery CA Formula 1.0.0
*
* Copyright 2013 BocoDss
* Depends:
*	jquery.ui.core.js
*	jquery.ui.dialog.js
*/
(function ($) {
    var methods = {
        init: function (settings) {
            var paras = $.extend({
                calculators: [],
                analyzer: null,
                measure: null,
                confirm: function (mea) { }
            }, settings);
            if (paras.analyzer != null) {
                paras.calculators = [];
                $(paras.analyzer.MeasureList).each(function () {
                    if (this.MeasureType != 7) {
                        paras.calculators.push(this.DisplayName);
                    }
                });
            }
            var $calDiv = getCalcuColDiv();
            $("#mlForCal", $calDiv).empty();
            $("#meaName", $calDiv).val("");
            $("#inputForCal", $calDiv).empty();
            if (paras.measure != null) {
                $("#meaName", $calDiv).val(paras.measure.DisplayName);
                $("#inputForCal", $calDiv).text(paras.measure.Formula);
            }
            for (i = 0; i < paras.calculators.length; i++) {
                $("#mlForCal", $calDiv).append("<li style='width:100%'><button style='width:100%;text-align:left'>" + "<" + (i + 1) + "> [" + paras.calculators[i] + "]</button></li>");
            }
            $("#mlForCal button", $calDiv).button();
            $("#operatorReg button", $calDiv).button();
            $("#operatorReg button", $calDiv).each(function () {
                $(this).click(function () {
                    $("#inputForCal", $calDiv).focus();
                    $("#inputForCal", $calDiv).insertAtCaret(" " + $.trim($(this).text()) + " ");
                });
            });
            $("#mlForCal button", $calDiv).each(function () {
                $(this).click(function () {
                    $("#inputForCal", $calDiv).focus();
                    var txt = $.trim($(this).text());
                    $("#inputForCal", $calDiv).insertAtCaret(" " + txt.substring(txt.indexOf(" ") + 1) + " ");
                });
            });
            $calDiv.dialog({ minWidth: 800,
                minHeight: 300,
                autoOpen: true,
                modal: true,
                buttons: {
                    "确定": function () {
                        var mea = getCustomMeasure($calDiv);
                        if (mea != null) {
                            $(this).dialog('close'); 
                            paras.confirm(mea);
                        }
                    },
                    "取消": function () {
                        $(this).dialog('close');
                        //                        $("#meaName", $calDiv).val("");
                        //                        $("#inputForCal", $calDiv).text("");
                    }
                }
            });
            $calDiv.dialog('open');
            $("#inputForCal", $calDiv).focus();
            $("#inputForCal", $calDiv).focus(function () {
                $("#errorTipForCal", $calDiv).empty();
            });
        },
        getMeasure: function () {
            var mm = $(">html>body").data("meaobj");
            return mm;
        }
    };
    $.fn.formulaedit = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method' + method + 'does not exist on jQuery.CA.FormulaEdit');
        }
    };

    function getCustomMeasure($calDiv) {
        if ($.trim($("#inputForCal", $calDiv).val()) === "") {
            $("#errorTipForCal").text("请输入公式")
        }
        else if ($("#mlForCal button", $calDiv).length <= 0) {
            $("#errorTipForCal", $calDiv).text("基础指标为空！")
        }
        else {
            if (isCalMatching($("#inputForCal", $calDiv).val())) {
                var displayName = $.trim($("#meaName", $calDiv).val());
                if (displayName === "") {
                    $("#errorTipForCal", $calDiv).text("请输入指标名称！")
                }
                else {
                    var meaobj = { ID: "", DisplayName: displayName, MeasureType: 7,
                        Decimal: parseInt($("#ddlCalcColDecimal").val()), Formula: $("#inputForCal", $calDiv).val(), Unit: ""
                    };
                    $(">html>body").data("meaobj", meaobj);
                    return meaobj;
                }
            }
            else {
                $("#errorTipForCal").text("公式错误！")
            }
        }
        return null;
    }

    //正则匹配计算列配置中的用户输入 
    //创建标识：lyh 20120323
    function isCalMatching(userInput) {
        var ml = $("#mlForCal button");
        var input = userInput;
        for (i = 0; i < ml.length; i++) {
            var temp = '\\' + $(ml[i]).text().substring($(ml[i]).text().indexOf('['), $(ml[i]).text().indexOf(']')) + '\\]';
            mex = eval('/' + temp + '/g');
            if (mex.test(userInput)) {
                input = input.replace(mex, $(ml[i]).text().substring(0, 3));
            }
        }
        var userInput_cg = $.trim(input.replace(/\s/g, ""));
        //初步检验 排除有其他字符出现
        if (/[^\(\)0-9<>\-\+\*\/\.]/.test(userInput_cg))
            return false;
        //初始化正则匹配公式
        var regx;
        var meaCount = $("#mlForCal button").length;
        var firstDigit = meaCount;
        var secondDigit = "";
        if (meaCount > 10) {
            firstDigit = meaCount / 10 + "";
            secondDigit = meaCount % 10 + "";
        }
        var meaFlag = "[0-9]*[1-9][0-9]*";
        regx = eval("/^((~|<" + meaFlag + ">)|([0-9]+\\.[0-9]*)?[1-9][0-9]*)([\\+\\-\\*\\/]((~|<"
            + meaFlag + ">)|([0-9]+\\.[0-9]*)?[1-9][0-9]*))*$/");
        //检验嵌套括号内的内容
        var stack = new Stack();
        var uiArray = userInput_cg.split('');
        for (i = 0; i < uiArray.length; i++) {
            stack.Push(uiArray[i]);
            if (uiArray[i] === ')') {
                var part = new Array();
                var count = stack.GetSize();
                for (m = 0; m < count; m++) {
                    var pop = stack.Pop();
                    part.push(pop);
                    if (pop === "(")
                        break;
                    else {
                        if (stack.GetSize() == 0) {
                            return false;
                        }
                    }
                }
                stack.Push("~");
                part = (part.reverse()).toString().replace(/,/g, "").replace("(", "").replace(")", "");
                if (regx.test(part) == false)
                    return false;
            }
        }
        //检验最终字符串
        var finalStr = stack.toString();
        return regx.test(finalStr);
    }

    function getRootPath() {
        var strFullPath = window.document.location.href;
        var strPath = window.document.location.pathname;
        var pos = strFullPath.indexOf(strPath);
        var prePath = strFullPath.substring(0, pos);
        var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
        return prePath + postPath;
    }

    function jsonToString(obj) {
        var THIS = this;
        switch (typeof (obj)) {
            case 'string':
                return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';
            case 'array':
                return '[' + obj.map(jsonToString).join(',') + ']';
            case 'object':
                if (obj instanceof Array) {
                    var strArr = [];
                    var len = obj.length;
                    for (var i = 0; i < len; i++) {
                        strArr.push(jsonToString(obj[i]));
                    }
                    return '[' + strArr.join(',') + ']';
                } else if (obj == null) {
                    return 'null';

                } else {
                    var string = [];
                    for (var property in obj) string.push(jsonToString(property) + ':' + jsonToString(obj[property]));
                    return '{' + string.join(',') + '}';
                }
            case 'number':
                return obj;
            default:
                return obj;
        }
    }

    function Stack() {
        var aElement = new Array();
        Stack.prototype.Push = function (vElement) {
            if (arguments.length == 0)
                return -1;
            for (var i = 0; i < arguments.length; i++) {
                aElement.push(arguments[i]);
            }
            return aElement.length;
        }
        Stack.prototype.Pop = function () {
            if (aElement.length == 0)
                return null;
            else
                return aElement.pop();
        }
        Stack.prototype.GetSize = function () {
            return aElement.length;
        }
        Stack.prototype.GetTop = function () {
            if (aElement.length == 0)
                return null;
            else
                return aElement[aElement.length - 1];
        }
        Stack.prototype.MakeEmpty = function () {
            aElement.length = 0;
        }
        Stack.prototype.IsEmpty = function () {
            if (aElement.length == 0)
                return true;
            else
                return false;
        }
        Stack.prototype.toString = function () {
            var sResult = aElement.toString();
            return sResult.replace(/,/g, "");
        }
    }

    function getCalcuColDiv() {
        var calDiv = $(">html>body>#meaCalculator");
        if (calDiv.length == 0) {
            calDiv = $("<div id='meaCalculator' title='计算列设置' style='display:none;'></div>");
            calDiv.append($("<table style='width:100%;height:100%'><tr><td rowspan='4' style='width:40%;height:100%' valign='top'><table style='width:100%;text-align:left;height:100%'><tr><td style='width:60px'>指标名：</td><td><input type='text' id='meaName' style='width:160px;'/></td></tr><tr><td>小数位：</td><td><select id='ddlCalcColDecimal'><option value='0'>0</option><option value='1'>1</option><option value='2'>2</option><option value='3' selected='selected'>3</option><option value='4'>4</option><option value='5'>5</option></select></td></tr><tr><td colspan='2'>基础指标（计算因子）：</td></tr><tr><td valign='top'colspan='2'><div style='float:left;width:80%;margin-left:0;' class='jstree-drop'><ul id='mlForCal' style='width:100%;list-style-type:none;margin-left:0;'></ul></div></td></tr></table></td><td><table id='operatorReg' style='width:100%;height:100%'><tr style='height:30%;text-align:center;vertical-align:top'><td style='width:16.6%'><button style='width:100%'>(</button></td><td style='width:16.6%'><button style='width:100%'>)</button></td><td style='width:16.6%'><button style='width:100%'>+</button></td><td style='width:16.6%'><button style='width:100%'>-</button></td><td style='width:16.6%;'><button style='width:100%;'>*</button></td><td style='width:16.6%'><button style='width:100%'>/</button></td></tr></table></td></tr><tr style='height:10%'><td></td></tr><tr style='height:70%'><td colspan='4'><textarea rows='10' style='width:100%;height:100%;overflow:hidden' id='inputForCal'></textarea></td></tr><tr style='height:10%'><td><label id='errorTipForCal' style='color:red'></label></td></tr></table>"));
            $(">html>body").append(calDiv);
        }
        return calDiv;
    }

})(jQuery);


jQuery.extend({
    /** 
    * 清除当前选择内容 
    */
    unselectContents: function () {
        if (window.getSelection)
            window.getSelection().removeAllRanges();
        else if (document.selection)
            document.selection.empty();
    }
});
jQuery.fn.extend({
    /** 
    * 选中内容 
    */
    selectContents: function () {
        $(this).each(function (i) {
            var node = this;
            var selection, range, doc, win;
            if ((doc = node.ownerDocument) &&
                 (win = doc.defaultView) &&
                typeof win.getSelection != 'undefined' &&
                typeof doc.createRange != 'undefined' &&
                 (selection = window.getSelection()) &&
                typeof selection.removeAllRanges != 'undefined') {
                range = doc.createRange();
                range.selectNode(node);
                if (i == 0) {
                    selection.removeAllRanges();
                }
                selection.addRange(range);
            }
            else if (document.body &&
                     typeof document.body.createTextRange != 'undefined' &&
                      (range = document.body.createTextRange())) {
                range.moveToElementText(node);
                range.select();
            }
        });
    },
    /** 
    * 初始化对象以支持光标处插入内容 
    */
    setCaret: function () {
        if ($.support.cssFloat) return;
        var initSetCaret = function () {
            var textObj = $(this).get(0);
            textObj.caretPos = document.selection.createRange().duplicate();
        };
        $(this)
         .click(initSetCaret)
         .select(initSetCaret)
         .keyup(initSetCaret);
    },
    /** 
    * 在当前对象光标处插入指定的内容 
    */
    insertAtCaret: function (textFeildValue) {
        var textObj = $(this).get(0);
        if (document.all && textObj.createTextRange && textObj.caretPos) {
            var caretPos = textObj.caretPos;
            caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == '' ?
                                textFeildValue + '' : textFeildValue;
        }
        else if (textObj.setSelectionRange) {
            var rangeStart = textObj.selectionStart;
            var rangeEnd = textObj.selectionEnd;
            var tempStr1 = textObj.value.substring(0, rangeStart);
            var tempStr2 = textObj.value.substring(rangeEnd);
            textObj.value = tempStr1 + textFeildValue + tempStr2;
            textObj.focus();
            var len = textFeildValue.length;
            textObj.setSelectionRange(rangeStart + len, rangeStart + len);
            //textObj.blur();
        }
        else {
            textObj.value += textFeildValue;
        }
    }
});
