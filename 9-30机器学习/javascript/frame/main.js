var pageOptions = {
    "themeItemTitle": "点击更换主题皮肤"
    , "currentTheme": undefined
    , "settings": { "name": "设置", "url": "settings.html" }
    , "logout": {
        "name": "退出", "click": function () {
            ajaxHelper.simpleGet(dss.rootPath + "services/frame/login.ashx?type=logout", function (d) { if (d.data == "ok") window.location = "login.html"; }, function () { }); return false;
        }
    }
    , "clickMargin": 330
};

(function () {
    var metroTool = {
        css: ["small", "big"]
        , group: function (container, g) {
            var gCtl = $('<div class="metroGroup"></div>')
                .appendTo(container);
            var tileGroups = groupFunc(g.items.length),
                tileIndex = 0, // tile的次序
                themeFromCookie = dss.cookie.get("theme"),
                themeFolder = (themeFromCookie === undefined) ? "lightblue" : themeFromCookie,
                themeFullPath = dss.rootPath + "themes/" + themeFolder + "/images/main/menu/";
            for (var i = 0; i < tileGroups.length; i++) {
                if (i === 0) {
                    gCtl.append($('<span class="metroCategory"></span>').text(g.title));
                }
                var ul = $('<ul class="container"></ul>').appendTo(gCtl);
                var item = tileGroups[i];
                for (var j = 0 ; j < item.length; j++) {
                    var gItem = g.items[tileIndex++];
                    $('<li class="item" title="' + gItem.title + '"></li>')
                        .addClass(metroTool.css[item[j]])
                        .append($('<span class="label"></span>').text(gItem.title))
                        .data("data", gItem)
                        .css({ "background": "url('" + themeFullPath + gItem.icon + "') 50% -5px no-repeat", "background-color": gItem.bgColor })
                        .click(function () {
                            var sender = $(this).data("data"),
                                data = '{"name":"' + sender.full_title + '", "id":"' + sender.id + '", "url":"' + sender.url + '"}';
                            if (sender.url && sender.url.indexOf("sint=yes") > 0) {
                                dss.cookie.add("view_data", data);
                                data = '{"name":"' + sender.full_title + '", "id":"' + sender.id + '", "url":""}';
                                dss.cookie.add("main_data", data);
                                window.location = "view.html";
                            }
                            else if (sender.url && sender.url.indexOf("target=_blank") > 0) {
                                window.open(sender.url);
                            }
                            else {
                                dss.cookie.add("main_data", data);
                                window.location = "default2.html";
                            }
                        })
                        .hover(function () {
                            $(this).css("background-color", "#0cbdfa");
                        }
                            , function () {
                                var t = $(this),
                                    d = t.data("data");
                                t.css("background-color", d.bgColor);
                            }
                        ).appendTo(ul);
                    if (gItem.id == "107960480") {
                        dss.cookie.add("data_app", dss.jsonToString(gItem));
                    }
                }
            }
        }
        , registerScroolEvents: function (container) {
            var leftCtl = $("#toLeft"),
                rightCtl = $("#toRight"),
                w = container.parent().width(),
                lastUl = container.find("ul").last(),
                rightPosition = lastUl.offset().left + lastUl.width(),
                leftPosition = parseInt(container.css("margin-left") || 0);
            //
            leftCtl.hide();
            rightCtl.hide();
            if (w < rightPosition) {
                rightCtl.unbind("click").click(function () {
                    moveTool.moveTo(leftPosition, leftPosition - pageOptions.clickMargin);
                }).show();
            } else {
                rightCtl.hide();
            }
            if (leftPosition < 0) {
                leftCtl.unbind("click").click(function () {
                    var x1 = (leftPosition + pageOptions.clickMargin),
                        x2 = (x1 > 0) ? 0 : x1;
                    moveTool.moveTo(leftPosition, x2);
                }).show();
            } else {
                leftCtl.hide();
            }
            var moveTool = {
                "timer": undefined,
                "timerInterval": 21,
                "step": 10,
                "moveTo": function (from, to) {
                    if (moveTool.timer === undefined) {
                        var toLeft = (from > to),
                            fn = toLeft ? function (x) { return x - moveTool.step; } : function (x) { return x + moveTool.step; },
                            from2 = from;
                        moveTo2();
                    }
                    function moveTo2() {
                        moveTool.timer = setTimeout(moveTo2, moveTool.timerInterval);
                        var p = fn(from2),
                            p = (p > 0) ? 0 : p;
                        if ((toLeft && from2 > to) || (!toLeft && from2 < to)) {
                            container.css("margin-left", p + "px"); from2 = p;
                        }
                        else {
                            moveTool.releaseTimer();
                        }
                    }
                },
                "releaseTimer": function () {
                    if (moveTool.timer != undefined) {
                        clearTimeout(moveTool.timer);
                        moveTool.timer = undefined;
                        metroTool.registerScroolEvents(container);
                    }
                }
            }
        }
    };
    var lis = $(".root .themeSelector li");
    $.each(lis, function (i, item) {
        var me = $(item);
        me.attr("title", pageOptions.themeItemTitle).click(function () {
            var theme = me.attr("class");
            $("body").removeClass(pageOptions.currentTheme).addClass(theme);
            pageOptions.currentTheme = theme;
            dss.cookie.add("themeName", theme);
            lis.removeClass("currentTheme");
            me.addClass("currentTheme");
        });
    });

    var themeName = dss.cookie.get("themeName");
    if (themeName !== undefined) {
        lis.parent().find("." + themeName).click();
    }
    else {
        lis.last().click();
    }

    dss.ajax(
        {
            "url": "services/frame/main.ashx"
            , "pattern": "normal"
            , "success": function (d) {
                data = $.parseJSON(d);
                var userPart = $("#userPart");
                userPart.append($('<span></span>').text(data.user));
                var ul = $("<ul></ul>").css("display", "none").appendTo(userPart);
                var set = $('<li></li>');
                $('<a href="javascript:">' + pageOptions.settings.name + '</a>')
                    .click(function () {
                        var d = dss.cookie.get("data_app");
                        var sender;
                        if (d && d.length > 0) {
                            sender = eval('(' + d + ')');
                        }
                        if (sender != undefined) {
                            jdata = '{"name":"' + sender.full_title + '", "id":"' + sender.id + '", "url":"' + sender.url + '"}';
                            dss.cookie.add("main_data", jdata);
                            window.location = "default2.html";
                        }
                    }).appendTo(set);
                var loginuot = $('<li></li>');
                $('<a href="javascript:">' + pageOptions.logout.name + '</a>')
                    .click(function () {
                        pageOptions.logout.click();
                        return false;
                    })
                    .appendTo(loginuot);
                ul.append(set)
                    .append(loginuot);
                userPart.mouseover(function () { userPart.find("ul").show(); }).mouseout(function () { userPart.find("ul").hide(); });

                var container = $("#metroPart div");
                $.each(data.groups, function (i, item) {
                    if (item.items !== undefined && item.items.length > 0) {
                        metroTool.group(container, item);
                    }
                });

                metroTool.registerScroolEvents(container);
            }
        });
}());