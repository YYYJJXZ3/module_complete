/***************************************************************************
* dssHelp
* Copyright 2016 BocoDss
* UpdateTime 2017-02-14
* Depends:
*      jquery-1.9.1.min.js
****************************************************************************/

(function (window) {
    var dssHelp = window.dssHelp || {};

    //防止报“console未定义”的错误
    window.console = window.console || (function () {
        var c = {}; c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile
        = c.clear = c.exception = c.trace = c.assert = function () { };
        return c;
    })();

    String.prototype.replaceAll = function (s1, s2) {
        return this.replace(new RegExp(s1, "gm"), s2);
    }

    String.prototype.contains = function (str) {
        return this.indexOf(str) > -1;
    }

    String.prototype.trimEnd = function (str) {
        return this.substr(0, this.length - str.length);
    }

    //初始化下拉条件
    var initSelects = dssHelp.initSelects;
    if (typeof initSelects != 'function') {
        initSelects = function (id, type, filterValue) {
            if (!filterValue) {
                filterValue = "";
            }

            var url = dss.rootPath + "plugin/HealthDegreeGuest/Handler/GuestHelp.ashx";
            var conOpt = {
                Type: "initSelects",
                Flag: type,
                FilterValue: filterValue
            };
            $.ajax({
                type: "post",
                url: url,
                data: {
                    strCon: dss.jsonToString(conOpt)
                },
                dataType: "json",
                success: function (data) {
                    $("#" + id).empty();

                    $("#" + id).append("<option value=\"\">全部</option>");
                    for (var i = 0; i < data.rows.length; i++) {
                        $("#" + id).append("<option value=\"" + data.rows[i].col0 + "\">" + data.rows[i].col0 + "</option>");
                    }
                }
            });
        }
        dssHelp.initSelects = initSelects;
    }

    //记录日志
    var addLog = dssHelp.addLog;
    if (typeof addLog != 'function') {
        addLog = function (opt) {
            var url = dss.rootPath + "plugin/xxx.ashx";
            var conOpt = {
                Type: "addLog",
                ListID: dss.request("listid")
            };

            $.extend(true, conOpt, opt);

            if (conOpt.Flag == "CsLog") {
                url = dss.rootPath + "plugin/CustomerVip/handler/VipCommon.ashx";
            }

            $.ajax({
                type: "post",
                url: url,
                data: {
                    strCon: dss.jsonToString(conOpt)
                },
                dataType: "json",
                success: function (data) {
                    //alert("日志记录成功");
                }
            });
        }
        dssHelp.addLog = addLog;
    }

    //将日期格式化
    var formatDate = dssHelp.formatDate;
    if (typeof formatDate != 'function') {
        formatDate = function (date, type) {
            var time = date;

            var yearIdx = date.indexOf("年");
            if (yearIdx > -1) { year = date.substr(yearIdx - 4, 4); } else { year = time.substr(0, 4); }

            var monthIdx = date.indexOf("月");
            if (monthIdx > -1) { month = date.substr(monthIdx - 2, 2); } else { month = time.substr(4, 2); }

            var weekIdx = date.indexOf("周");
            if (weekIdx > -1) { week = date.substr(weekIdx - 2, 2); } else { week = time.substr(4, 2); }

            var dayIdx = date.indexOf("日");
            if (dayIdx > -1) { day = date.substr(dayIdx - 2, 2); } else { day = time.substr(6, 2); }

            var hourIdx = date.indexOf("时");
            if (hourIdx > -1) { hour = date.substr(hourIdx - 2, 2); } else { hour = time; }

            var minuteIdx = date.indexOf("时");//分钟后面没有“分”的字样
            if (minuteIdx > -1) { minute = date.substr(minuteIdx + 1, 2); } else { minute = time; }

            var secondIdx = date.indexOf("秒");
            if (secondIdx > -1) { hour = date.substr(secondIdx - 2, 2); } else { second = time; }

            switch (type) {
                case "yyyyMMdd": time = year + month + day; break;
                case "yyyy-MM-dd": time = year + "-" + month + "-" + day; break;
                case "yyyyMM": time = year + month; break;
                case "MMdd": time = month + day; break;
                case "MM-dd": time = month + "-" + day; break;
                case "dd日": time = day + "日"; break;
                case "yyyy/M/d": month = parseInt(month); day = parseInt(day); time = year + "/" + month + "/" + day; break;
                case "yyyyww": time = year + week; break;
                case "yyyy-ww": time = year + "-" + week; break;
                case "ww周": time = week + "周"; break;
                case "hh24:mi:ss": time = hour + ":00:00"; break;
                case "yyyy-MM-dd hh24:mi": time = year + "-" + month + "-" + day + " " + hour + ":" + minute; break;
                case "yyyy-MM-dd hh24:mi:ss": time = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second; break;
                default: break;
            }

            return time;
        }
        dssHelp.formatDate = formatDate;
    }

    //判断手机号码是否符合要求
    var checkPhone = dssHelp.checkPhone;
    if (typeof checkPhone != 'function') {
        checkPhone = function (p) {
            if (p == undefined || p == null || (typeof (p) == "string" && p == "")) {
                alert("手机号码不能为空！");
                return false;
            }
            else {
                if (p.length != 11) {
                    alert("请您输入标准的11位手机号码");
                    return false;
                }
                else {
                    for (var i = 0; i < p.length; i++) {
                        if (i == 0 && p.split('')[i] != '1') {
                            alert("请您输入标准的11位手机号码");
                            return false;
                        }
                        if ("0123456789".indexOf(p.split('')[i]) < 0) {
                            alert("手机号码中含非数字字符");
                            return false;
                        }
                    }
                    return true;
                }

                return true;
            }
        }

        dssHelp.checkPhone = checkPhone;
    }

    //从前台获取analyzer的sql
    var getAnalyzerSql = dssHelp.getAnalyzerSql;
    if (typeof getAnalyzerSql != 'function') {
        getAnalyzerSql = function (analyzer) {
            var url = dss.rootPath + "plugin/Common/ashx/ComHandler.ashx";
            var conOpt = {
                Type: "getAnalyzerSql",
                Ana: analyzer
            };

            $.ajax({
                type: "post",
                url: url,
                data: {
                    strCon: dss.jsonToString(conOpt)
                },
                async: false,
                cache: false,
                dataType: "text",
                success: function (data) {
                    dss.alert(data, function () {
                    }, "查询的sql", 1);
                }
            });
        }
        dssHelp.getAnalyzerSql = getAnalyzerSql;
    }

    //对字符串进行CRC32编码
    var getCRC32 = dssHelp.getCRC32;
    if (typeof getCRC32 != 'function') {
        getCRC32 = function (str) {
            var url = dss.rootPath + "plugin/Common/ashx/ComHandler.ashx";
            var opt = {
                Type: "getCRC32",
                Property1: str
            };
            $.ajax({
                url: url,
                data: {
                    strCon: dss.jsonToString(opt)
                },
                dataType: "text",
                cache: false,
                success: function (data) {
                    dss.alert("CRC32：" + data, function () {
                    }, "CRC32", 1);
                }
            });
        }
        dssHelp.getCRC32 = getCRC32;
    }

    //对字符串进行CRC64编码
    var getCRC64 = dssHelp.getCRC64;
    if (typeof getCRC64 != 'function') {
        getCRC64 = function (str) {
            var url = dss.rootPath + "plugin/Common/ashx/ComHandler.ashx";
            var opt = {
                Type: "getCRC64",
                Property1: str
            };
            $.ajax({
                url: url,
                data: {
                    strCon: dss.jsonToString(opt)
                },
                dataType: "text",
                cache: false,
                success: function (data) {
                    dss.alert("CRC64：" + data, function () {
                    }, "CRC64", 1);
                }
            });
        }
        dssHelp.getCRC64 = getCRC64;
    }

    //对号码或其他隐藏中间4位
    var encryptStr = dssHelp.encryptStr;
    if (typeof encryptStr != 'function') {
        encryptStr = function (str) {
            if (str.length > 7) {
                return str.substr(0, str.length - 8) + "****" + str.substr(str.length - 4, 4);
            }
        }
        dssHelp.encryptStr = encryptStr;
    }

    //复制到剪贴板
    var copyToClipBoard = dssHelp.copyToClipBoard;
    if (typeof copyToClipBoard != 'function') {
        copyToClipBoard = function (txt) {
            if (window.clipboardData) {
                //window.clipboardData.clearData();
                window.clipboardData.setData("Text", txt);
                dss.alert("复制成功！", function () { }, "", 1);
            }
            else if (navigator.userAgent.indexOf("Opera") != -1) {
                window.location = txt;
            }
            else if (window.netscape) {
                try {
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                }
                catch (e) {
                    alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将'signed.applets.codebase_principal_support'设置为'true'");
                }
                var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
                if (!clip)
                    return; var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
                if (!trans)
                    return;
                trans.addDataFlavor('text/unicode');
                var str = new Object();
                var len = new Object();
                var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
                var copytext = txt; str.data = copytext; trans.setTransferData("text/unicode", str, copytext.length * 2);
                var clipid = Components.interfaces.nsIClipboard;
                if (!clip)
                    return false;
                clip.setData(trans, null, clipid.kGlobalClipboard);
            }
        }
        dssHelp.copyToClipBoard = copyToClipBoard;
    }

    //根据列名从Datasource中获取列的索引
    var getIndexByName = dssHelp.getIndexByName;
    if (typeof getIndexByName != 'function') {
        getIndexByName = function (datasource, colname) {
            for (var i = 0; i < datasource.colnames.length; i++) {
                if (dssHelp.dropUnit(datasource.colnames[i]) == colname) {
                    return i;
                    break;
                }
            }
            return 0;//不用“-1”，因为-1可能会报错
        }
        dssHelp.getIndexByName = getIndexByName;
    }

    //去掉列名中的单位
    var dropUnit = dssHelp.dropUnit;
    if (typeof dropUnit != 'function') {
        dropUnit = function (colname) {
            if (colname.contains("（")) {
                colname = colname.substr(0, colname.indexOf("（"));
            }
            return colname;
        }
        dssHelp.dropUnit = dropUnit;
    }

    //获取列名中的单位
    var getUnit = dssHelp.getUnit;
    if (typeof getUnit != 'function') {
        getUnit = function (colname) {
            var unit = "";
            if (colname.contains("（")) {
                unit = colname.substr(colname.indexOf("（") + 1).trimEnd("）");
            }
            return unit;
        }
        dssHelp.getUnit = getUnit;
    }

    //获取传来的参数，会decodeURI
    var request = dssHelp.request;
    if (typeof request != 'function') {
        request = function (str) {
            return decodeURI(dss.request(str));
        }
        dssHelp.request = request;
    }

    //从对象数组中获取某个属性等于某个值的项及索引，返回{index:1,item:item}
    var findInObjArr = dssHelp.findInObjArr;
    if (typeof findInObjArr != 'function') {
        findInObjArr = function (arr, k, v) {
            var cur = null;

            for (var i = 1; i < arr.length; i++) {
                if (arr[i][k] == v) {
                    cur = {
                        index: i,
                        item: arr[i]
                    };
                }
            }

            return cur;
        }
        dssHelp.findInObjArr = findInObjArr;
    }

    //获取某个值在数组中的索引
    var getArrIdx = dssHelp.getArrIdx;
    if (typeof getArrIdx != 'function') {
        getArrIdx = function (arr, v) {
            var idx = 0;

            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == v) {
                    idx = i;
                    break;
                }
            }

            return idx;
        }
        dssHelp.getArrIdx = getArrIdx;
    }

    //设置缓存
    var setCache = dssHelp.setCache;
    if (typeof setCache != 'function') {
        setCache = function (str, fun) {
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
        dssHelp.setCache = setCache;
    }

    //根据analyzer获取数据
    var getDataByAnalyzer = dssHelp.getDataByAnalyzer;
    if (typeof getDataByAnalyzer != 'function') {
        getDataByAnalyzer = function (analyzer, fun, opts) {//opts用于传递Dashboard中的beforeBind里的opts
            var url = dss.rootPath + "plugin/Common/ashx/ComHandler.ashx";
            var opt = {
                GridChart: "AnalyzerGrid",
                Ana: analyzer
            };
            $.ajax({
                type: "post",
                url: url,
                data: {
                    strCon: dss.jsonToString(opt)
                },
                dataType: "json",
                beforeSend: function () {
                    dss.load(true);
                },
                complete: function () {
                    dss.load(false);
                },
                success: function (data) {
                    if (typeof fun == "function") {
                        fun(data, opts);
                    }
                }
            });
        }
        dssHelp.getDataByAnalyzer = getDataByAnalyzer;
    }

    //页面的默认值
    var defaultSet = dssHelp.defaultSet;
    if (typeof defaultSet != "function") {
        var listId = decodeURI(dss.request("listid"));
        if (listId) {
            switch (listId) {
                case "-1444386880"://XXX页面
                    defaultSet = {
                        region: "全部",
                        MSISDN: ""
                    };
                    break;
                case "1926569174"://XXX页面
                    defaultSet = {
                        Time: "2016年09月",
                        MSISDN: ""
                    };
                    break;
                default:
                    defaultSet = {
                        MSISDN: ""
                    };
            }
        }

        dssHelp.defaultSet = defaultSet;
    }

    window.dssHelp = dssHelp;
})(window);