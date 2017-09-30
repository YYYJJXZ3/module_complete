var ajaxHelper = {
    simpleGet: function (url, onSuccess, onFail, data) {
        ajaxHelper.baseGet(url, data, onSuccess, onFail);
    },
    request:function (key) {
        if (typeof key == "string") {
            var data = location.search.match(new RegExp("[\?\&]" + key + "=([^\&]+)", "i"));
            if (data != null && data.length == 2) {
                return data[1];
            }
        }
        return "";
    },
    get: function (url, onSuccess, onFail, data) {
        ajaxHelper.baseGet(url, data
            , function (d, status, reason) {
                var s = d.status.toString().toLocaleLowerCase();
                if (s == "true" || s == "0") {
                    onSuccess(d.data);
                }
                else if (s == "false" || s == "1") {
                    var strFullPath = window.document.location.href,
                        strPath = window.document.location.pathname,
                        pos = strFullPath.indexOf(strPath),
                        rootPath = strFullPath.substring(0, pos) + strPath.substring(0, strPath.substr(1).indexOf('/') + 1) + "/";
                    var parent = document;
                    while (parent.parentWindow != undefined) {
                        parent = parent.parentWindow.parent;
                    }
                    parent.location = rootPath + "login.html";
                }
                else if (s == "2") {
                    alert("访问被拒绝");// 后续用其他形式呈现
                }
                else if (s == "3") {
                    if (typeof onFail == "function") {
                        onFail(d.data);
                    }
                    else {
                        alert("ajax 异常: " + d.data);// 后续用其他形式呈现
                    }
                }
            }
            , function (d, status, reason) {
                if (typeof onFail == "function") {
                    onFail(reason);
                }
                else {
                    alert(reason);
                }
            });
    }
    ,
    baseGet: function (url, data, onSuccess, onFail) {
        if (data == null) {
            data = { listid: ajaxHelper.request("listid") };
        }
        else {
            data["listid"] = ajaxHelper.request("listid");
        }
        $.ajax({
            type: 'get',
            cache: false,
            contentType: 'json',
            url: url,
            dataType: 'json',
            data: data,
            success: function (d, status, reason) {
                onSuccess(d);
            },
            error: function (d, status, reason) {
                onFail(reason);
            }
        });
    },

    baseGets: function (option) {
        var param = $.extend(true,
            {
                type: 'get',
                cache: false,
                dataType: 'json',
                success: null,
                error: null,
                beforeSend: null,
                complete: null,
                dataFilter: null,
                mask: null,
                pattern: 'simple'   //normal,depth,simple
            }
            , option);
        var dataType = ["xml", "html", "script", "json", "jsonp", "text"];
        if ($.inArray(param.dataType, dataType) == -1) {
            alert("dataType类型错误，请检查");
            return;
        }
        if (param.type != "get" && param.type != "post") {
            alert("type类型错误，请检查");
            return;
        }
        var ajax = $.extend(true, {}, param);
        if (ajax.data == null) {
            ajax.data = { listid: ajaxHelper.request("listid") };
        }
        else {
            ajax.data["listid"] = ajaxHelper.request("listid");
        }
        if (param.mask == null || (param.mask.shadow == false)) {
            ajax["error"] = function (reason) {
                if (typeof param.error == "function") {
                    param.error(reason);
                }
                setTimeout(function () {
                    dss.load(false);
                }, 200);
            }

            ajax["beforeSend"] = function (XHR) {
                if (typeof param.beforeSend == 'function') {
                    param.beforeSend(XHR);
                } 
            }

            ajax["complete"] = function (XHR, TS) {
                if (typeof param.complete == 'function') {
                    param.complete(XHR, TS);
                }
                setTimeout(function () {
                    dss.load(false);
                }, 200);
            }
        }

        if (param.dataFilter != null) {
            ajax["dataFilter"] = function (data, type) {
                if (typeof param.dataFilter == 'function') {
                    param.dataFilter(data, type);
                }
            }
        }

        if (param.success != null) {
            if (param.pattern == "simple") {
                ajax["success"] = function (data, s, reason) {
                    param.success(data, s, reason);
                }
            }
            else if (param.pattern == "normal") {
                ajax["success"] = function (d, status, reason) {
                    var s = d.status.toString().toLocaleLowerCase();
                    if (s == "true" || s == "0") {
                        param.success(d.data);
                    }
                    else if (s == "false" || s == "1") {
                        var parent = document;
                        while (parent.parentWindow != undefined) {
                            parent = parent.parentWindow.parent;
                        }
                        parent.location = dss.rootPath + "login.html";
                    }
                    else if (s == "2") {
                        alert("访问被拒绝");// 后续用其他形式呈现
                    }
                    else if (s == "3") {
                        if (typeof onFail == "function") {
                            param.error(d.data);
                        }
                        else {
                            alert("ajax 异常: " + d.data);// 后续用其他形式呈现
                        }
                    }
                }
            }
        }

        $.ajax(ajax);
    }
}