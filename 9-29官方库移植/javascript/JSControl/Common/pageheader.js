(function ($) {
    var methods = {
        init: function (settings) {
            var paras = $.extend({
                sitemap: "",
                showSql: true,
                showHelp: true,
                showCollect: true,
                showWorkFlow: false,
                extendHtml: "",
                otherButton: {}
            }, settings);
            var $topTable = $("<table cellspacing='0' cellpadding='0' border='0'></table>");
            var $tr = $("<tr class='main_top_bg'></tr>");
            var $tdleft = $("<td class='main_top_bg_left'></td>");
            $tr.append($tdleft);
            var $tdMid = $("<td></td>");
            $tdMid.css("width", "100%");
            var rootPath = getRootPath();
            var listid = request("listid");
            if (paras.sitemap != undefined && paras.sitemap != "") {
                if (paras.extendHtml != undefined && paras.extendHtml != "") {
                    $tdMid.text(paras.sitemap + paras.extendHtml);
                }
                else {
                    $tdMid.text(paras.sitemap);
                }

            }
            else {
                if (paras.extendHtml != undefined && paras.extendHtml != "") {
                    $tdMid.load(rootPath + "/Javascript/JSControl/Common/Hander/SiteMap.ashx?listid=" + listid,
                        function () {
                            //$tdMid.append(paras.extendHtml);
                            //var str = "&nbsp;&gt;&gt;&nbsp;"
                            var text = $tdMid.text();
                            var str = ">>"
                            text = text.substring(text.indexOf(str) + str.length);
                            $tdMid.html(text + paras.extendHtml);

                        }
                        );
                }
                else {
                    $tdMid.load(rootPath + "/Javascript/JSControl/Common/Hander/SiteMap.ashx?listid=" + listid);
                }
            }
            $tr.append($tdMid);
            var themePath = "themes/" + getCurrentTheme() + "/";
            if (paras.showWorkFlow) {
                var collectUrl = rootPath + "/framework/management/CustomMenu.aspx";
                var urlCollected = window.document.location.href;
                var $imgCollect = $("<img title='流程' border='0'/>");
                $imgCollect.css("cursor", "pointer");
                $imgCollect.attr("src", rootPath + "/" + themePath + "images/toolbar/main_top_tu_4.png");
                $imgCollect.click(function () {
                    if (ShowWorkFlow != undefined) { ShowWorkFlow.show(); }
                });
                var $tdCollect = $("<td></td>");
                $tdCollect.append($imgCollect);
                $tr.append($tdCollect);
            }
            if (paras.showCollect) {
                var collectUrl = rootPath + "/framework/management/CustomMenu.aspx";
                var urlCollected = window.document.location.href;
                var $imgCollect = $("<img title='收藏' border='0'/>");
                $imgCollect.css("cursor", "pointer");
                $imgCollect.attr("src", rootPath + "/" + themePath + "images/toolbar/main_top_tu_2.gif");
                $imgCollect.click(function () {
                    var urlstr = rootPath + "/framework/management/AddCustomMenu.aspx?listid=" + listid + "&addtitle=" + encodeURI($("title").html()) +
                             "&addurl=" + encodeURI(urlCollected) + "&time=" + (new Date()).getTime() + parseInt(Math.random() * 100000);
                    var str = window.showModalDialog(urlstr, window, "dialogHeight=450px;dialogWidth=400px;status=no");
                    if (str != null) window.open(collectUrl, 'frmTree', '');
                });
                var $tdCollect = $("<td></td>");
                $tdCollect.append($imgCollect);
                $tr.append($tdCollect);
            }
            if (paras.showHelp) {
                var helpUrl = rootPath + "/framework/help/HelpInfo.html?liid=" + listid + "&showTitle=0&time=" + (new Date()).getTime() + parseInt(Math.random() * 100000);
                var $imgHelp = $("<img title='帮助信息' border='0'/>");
                $imgHelp.css("cursor", "pointer");
                $imgHelp.attr("src", rootPath + "/" + themePath + "images/toolbar/main_top_tu_3.gif");
                $imgHelp.click(function () {
                    var content = $('<iframe name="test" align="MIDDLE" width="655" height="400" marginwidth="1" marginheight="1" frameborder="0" scrolling="Yes" border="0"> ');
                    dss.dialog({
                        content: content,
                        height: 445,
                        width: 680,
                        title: '帮助信息',
                        open: function () {
                            content.attr("src", helpUrl);
                        }
                    });
                });
                var $tdHelp = $("<td></td>");
                $tdHelp.append($imgHelp);
                $tr.append($tdHelp);
            }
            if (paras.showSql) {
                var sqlUrl = rootPath + "/framework/SQLPage.aspx?listid=" + listid + "&time=" + (new Date()).getTime() + parseInt(Math.random() * 100000);
                var $imgSql = $("<img title='查看SQL' border='0'/>");
                $imgSql.css("cursor", "pointer");
                $imgSql.attr("src", rootPath + "/" + themePath + "images/toolbar/monitor.gif");
                $imgSql.click(function () {
                    window.open(sqlUrl, '', 'scrollbars=1,resizable=1');
                });
                var $tdSql = $("<td></td>");
                $tdSql.append($imgSql);
                $tr.append($tdSql);
            }
            $topTable.append($tr);
            this.append($topTable);
        }
    };

    $.fn.pageheader = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method' + method + 'does not exist on jQuery.pageheader');
        }
    }

    function getRootPath() {
        var strFullPath = window.document.location.href;
        var strPath = window.document.location.pathname;
        var pos = strFullPath.indexOf(strPath);
        var prePath = strFullPath.substring(0, pos);
        var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
        return prePath + postPath; 
    }

    function enCode(s) {//编码
        return escape(s);
    }

    function deCode(s) {//解码
        return unescape(s);
    }

    function request(strParame) {
        var args = new Object();
        var query = location.search.substring(1);

        var pairs = query.split("&"); // Break at ampersand 
        for (var i = 0; i < pairs.length; i++) {
            var pos = pairs[i].indexOf('=');
            if (pos == -1) continue;
            var argname = pairs[i].substring(0, pos);
            var value = pairs[i].substring(pos + 1);
            value = deCode(value);
            args[argname] = value;
        }
        return args[strParame];
    }

    function getCurrentTheme() {
        var currentThemeName = "lightblue";
        var strcookie = document.cookie;
        var arrcookie = strcookie.split(";");
        var userId;
        //遍历cookie数组，处理每个cookie对
        for (var i = 0; i < arrcookie.length; i++) {
            var arr = arrcookie[i].split("=");
            //找到名称为theme的cookie，并返回它的值
            if ("theme" == arr[0]) {
                currentThemeName = arr[1];
                break;
            }
        }
        return currentThemeName;
    }

})(jQuery);