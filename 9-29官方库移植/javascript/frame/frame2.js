var tools = {
    say: function (ctl, text) {
        ctl.text(text);
        return this;
    },
    sayHi: function (name) {
        tools.say($("#logo"), name + "，你好！ 欢迎登录");
        return this;
    },
    saySubName: function (subName) {
        tools.say($("#productSubName"), subName);
        return this;
    },
    render: function (menuCtl, menus) {
        $.each(menus, function (index, item) {
            /*
               { "name": "home", "className": "home", "title": "我的应用", "url": "main.html" }
               , { "name": "me", "className": "me", "title": "应用库", "url": "http://sohu.com" }
               , { "name": "settings", "className": "settings", "title": "设置", "url": "http://163.com" }//点击退出登录
            */
            var li = $('<li class="' + item.className + '" title="' + item.title + '"></li>');
            if (item.name == "settings") {
                li.click(function () {
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
                });
            }
            else if (item.name == "news") {
                tools.currentNewsInterval = setInterval('tools.getcount("news")', 15000);
                li.click(function () {
                    tools.openPageInTab("消息中心", dss.rootPath + "framework/message/list.html");
                });
            }
            else if (typeof item.onclick === "function") {
                li.click(function () {
                    item.onclick(li.data("data"));
                });
            }
            else if (typeof item.url === "string" && item.url !== "") {
                li.click(function () { window.location = item.url; });
            }
            li.appendTo(menuCtl);
        });
        //{ "name": "logoff", "className": "logoff", "title": "点击退出登录", "onclick": function () { alert("out"); } }
        var li = $('<li class="logoff" title="点击退出登录"></li>').click(function () {
            ajaxHelper.simpleGet("services/frame/login.ashx?type=logout", function (d) { if (d.data == "ok") window.location = "login.html?t=logout"; }, function () { }); return false;
        });
        li.appendTo(menuCtl);
        return this;
    },
    createSearchUI: function () {
        var linkTool = {
            createALink: function (text, href) {
                return $("<a></a>").text(text).attr("href", href);
            },
            createLiLink: function (id, text, data, click) {
                var item = $("<li></li>")
                            .attr("id", id)
                            .text(text);

                if (typeof click == "function") {
                    if (typeof data == "object") {
                        item.data("data", data);
                    }
                    item.bind("click", function () {
                        click($(this), data);
                        return false;
                    });
                }
                else {
                }
                return item;
            }
        };
        var rootContainer = $("#searchPane");
        rootContainer.empty();
        rootContainer.css("clear", "both");
        var activeSearchCategory = undefined;
        var searchCategories = [
            { name: "指标", tag: "m", tip: "请输入指标关键字" }
        // , { name: "资源", tag: "r", tip: "请输入资源关键字" }
            , { name: "功能", tag: "f", tip: "请输入功能关键字" }
        ];
        $("<ul></ul>").attr("id", "searchCategory")
                        .attr("float", "left")
                        .appendTo(rootContainer);
        var wrapper = $("<div></div>").attr("class", "inputPanel")
            .append(
                $("<span></span>").css({ "clear": "both", "display": "block", "float": "left", "height": "100%" }) //该样式定义不允许修改，所以放在这里
                    .append(
                        $("<input/>")
                        .attr("id", "txtSearch")
                        .attr("type", "text")
                        .attr("autocomplete", "off")
                        .keypress(function (e) {
                            e = e || event || window.event;
                            if (e != undefined) {
                                var keyCode = e.keyCode || e.which || e.charCode;
                                if (keyCode == 13) { searchButton_Click(); return false; }
                            }
                        })
                        .bind("blur", function () { searchInput_OnBlur(); return false; })
                        .bind("focus", function () { searchInput_OnFocus(); })
                    )
            )
            .append(
                $("<span></span>").css({ "display": "block", "float": "right", "height": "100%" }) //该样式定义不允许修改，所以放在这里
                                    .append(
                                        $("<input/>")
                                            .attr("type", "button")
                                            //.attr("value", "搜索")
                                            .bind("click", function () { searchButton_Click(); return false; })
                                        )
            )
        .appendTo(rootContainer);
        var ulContainer = $("#searchCategory");
        $.each(searchCategories, function (index) {
            var category = this;
            linkTool.createLiLink("searchType" + index, category.name, category, setCurrentCategory).appendTo(ulContainer);
        });

        var first = ulContainer.find("li:first");
        if (typeof first == "object") {
            var data = first.data("data");
            if (typeof data == "object") {
                setCurrentCategory(first, data);
            }
        }
        function setCurrentCategory(sender, category) {
            if (typeof category == "object") {
                var txtControl = $("#txtSearch");
                txtControl
                    .addClass("searchControlTip")
                    .removeClass("searchControlError");
                if (txtControl.val().length == 0 || (activeSearchCategory !== undefined && txtControl.val() == activeSearchCategory.tip)) {
                    txtControl.val(category.tip);
                }
                activeSearchCategory = category;
                if (sender != undefined) {
                    ulContainer.find("li").removeClass("activeSearchCategory");
                    sender.addClass("activeSearchCategory");
                }
                txtControl.attr("dataType", category.tag);
            }
        }

        function searchInput_OnFocus() {
            if ($("#txtSearch").val() == activeSearchCategory.tip) {
                $("#txtSearch")
                    .val("");
                dss.require(["jquery.ui.autocomplete"]
                            , function () {
                                $.ui.autocomplete.prototype._renderItem = function (ul, item) {
                                    if (item.Desc == null || item.MeasureDesc == null) {
                                        return $("<li></li>")
                                              .data("item.autocomplete", item)
                                              .append("<a>" + item.label + "</a>")
                                              .appendTo(ul);
                                    }
                                    else {
                                        return $("<li></li>")
                                                .data("item.autocomplete", item)
                                                .append("<a title=\"来自:" + item.MeasureDesc + "&#10分类:" + item.Desc + "\">" + item.label + "</a>")
                                                .appendTo(ul);
                                    }
                                };
                                $("#txtSearch").autocomplete({
                                    source: function (request, response) {
                                        $.ajax({
                                            url: "framework/search/ashx/Search.ashx",
                                            dataType: "json",
                                            type: 'post',
                                            data: {
                                                top: 10,
                                                key: request.term,
                                                type: $("#txtSearch").attr("dataType")
                                            },
                                            success: function (data) {
                                                response(data);
                                                $(".ui-autocomplete")
                                                    .css("width", 250);
                                                $(".ui-autocomplete")
                                                    .find("li")
                                                    .css("text-overflow ", "clip")
                                                    .css("overflow", "hidden");
                                            }
                                        });
                                    },
                                    select: function (event, ui) {
                                        searchButton_Click(ui.item.label);
                                        return false;
                                    },
                                    minLength: 1,
                                    autoFocus: false,
                                    delay: 50
                                });
                            });
            }

        }

        function searchInput_OnBlur() {
            if ($("#txtSearch").val() == "") {
                $("#txtSearch")
                    .val(activeSearchCategory.tip);
            }
        }

        function searchButton_Click(name) {
            var searchWord = $("#txtSearch").val();
            if (searchWord != activeSearchCategory.tip) {
                var url = "framework/search/searchresult.html";
                url += "?t=" + activeSearchCategory.tag;
                url += "&td=" + encodeURI(activeSearchCategory.name);
                if (name != undefined) {
                    url += "&wd=" + encodeURI(name);
                } else {
                    url += "&wd=" + encodeURI(searchWord);
                }
                $("#txtSearch").autocomplete("close").val("");
                setCurrentCategory(undefined, activeSearchCategory);
                tools.openPageInTab("搜索结果", url);
            }
        }
        return this;
    },
    createTileItem: function (ctl, data, subControl) {
        var className = "",
            classNamePrefix = "t",
            classNameIndex = 0,
            numberOfClassName = 6,
            tiles = data.children,
            defaultIcon = "ty_yewu.png",
            themeFromCookie = dss.cookie.get("theme"),
            themeFolder = (themeFromCookie === undefined) ? "lightblue" : themeFromCookie,
            themeFullPath = dss.rootPath + "themes/" + themeFolder + "/images/frame2/menu/"
        $.each(tiles, function (index, item) {
            if (item !== undefined // 菜单项本身有效
                    && (typeof item.name === "string" && item.name !== "") // 菜单名称有效
                    && (item.url !== "" || item.child != undefined) /* 菜单是叶子节点或还有子级菜单*/) {
                classIndex = index % numberOfClassName + 1;
                className = classNamePrefix + classIndex;
                var imageName = themeFullPath + ((item.icon.length > 0) ? item.icon : defaultIcon);
                var li = $('<li class="' + className + '"></li>')
                            .css("background-image", "url('" + imageName + "')")
                            .append($("<span>" + item.name + "</span>"))
                            .data("data", index)
                            .click(function () {
                                var me = $(this),
                                    myIndex = me.data("data");
                                if (tools.currentTile != undefined) {
                                    if (tools.currentTile.index === myIndex) {
                                        return;
                                    }
                                    else {
                                        tools.currentTile.item.removeClass("activeMenu");
                                    }
                                }

                                tools.currentTile = {
                                    index: myIndex
                                    , item: me
                                };
                                me.addClass("activeMenu");
                                if (item.command !== undefined && !item.command.startWith("?")) {
                                    tools.openPageInTab(item.name, item.command);
                                }
                                if (item.children != undefined && item.children.length > 0) {
                                    tools.updateMenuTree(item.children);
                                    subControl.show();
                                } else {
                                    subControl.hide();
                                }
                            })
                            .appendTo(ctl);
            }
        });

        subControl.css("max-height", $("#functionBar").height() - ctl.height() - 35).attr("title", "当功能较多时请滚动鼠标查看更多项。");

        var url = data.me.command,
            firstMenu = ctl.find("li").first(),
            firstMenuData = firstMenu.data("data");
        if (url != undefined && url !== "" && !url.startWith("?") && url.indexOf("sint=yes") == -1) {
            tools.openPageInTab(data.me.name, data.me.command);
        }
        else {
            $("#mainPane").html('<div id="welcome"></div>');
        }
        if (!(tiles != undefined && tiles.length > 0)) {
            tools.hideOrShowFunctionBar(false);
            $("#showFunctionBar").hide();
        }
        return this;
    },
    updateMenuTree: function (subMenus) {
        var setting = {
            view: { showLine: false, selectedMulti: false, showIcon: false },
            data: { simpleData: { enable: true } },
            callback: {
                beforeClick: function (treeId, treeNode) {
                    if (treeNode.command == "" || treeNode.command.startWith("welcome.htm") || treeNode.command.startWith("?")) {
                        var zTree = $.fn.zTree.getZTreeObj("menuZTree");
                        zTree.expandNode(treeNode);
                        return false;
                    }
                    return true;
                },
                onClick: function (event, id, menuItem) {
                    tools.openPageInTab(menuItem.name, menuItem.command);
                }
            }
        };
        var zTree = $("#menuZTree");
        zTree = $.fn.zTree.init(zTree, setting, subMenus);
        zTree.expandAll(true);
        return this;
    },
    openPageInTab: function (title, url) {
        tools.say($("#test"), title + "::" + url);
        var tabControl = window.tabControl;
        if (tabControl === undefined) {
            var main = $("#mainPane").empty();
            var currentThemePath = $themeHelper.getCurrentThemePath();
            var options = {
                className: 'tabControl',
                complexMode: true,
                showCloseTabButton: true,
                moveLeftButton1: currentThemePath + '/images/frame/tab_left.png',
                moveLeftButton2: currentThemePath + '/images/frame/tab_left_over.png',
                moveRightButton1: currentThemePath + '/images/frame/tab_right.png',
                moveRightButton2: currentThemePath + '/images/frame/tab_right_over.png',
                closeAllButton1: currentThemePath + '/images/frame/tab_close_all.png',
                closeAllButton2: currentThemePath + '/images/frame/tab_close_all.png',
                onShowOrHideButtonClick: ''
            };
            var temp = $("<div></div>").attr("id", "tabControl").appendTo(main);
            tabControl = temp.CreateTabControl(options, "welcome.htm");
            $(document).data("tabControl", tabControl);
            window.tabControl = tabControl;
        }
        tabControl.addTab(title, url, true);
        return this;
    },
    functionBarSettings: undefined,
    hideOrShowFunctionBar: function (show) {
        var logoCtl = $("#logo"),
            headCtl = $("#head"),
            functionBarCtl = $("#functionBar"),
            mainCtl = $("#main");
        if (show === false && tools.functionBarSettings === undefined) {
            tools.functionBarSettings = {
                "head": headCtl.offset().left
                , "main": mainCtl.offset().left
            };
        }
        if (show === false) {
            logoCtl.hide();
            functionBarCtl.hide();
            var toLeft = { "left": "0" };
            headCtl.css(toLeft);
            mainCtl.css(toLeft);
            $("#main .showFunctionBar").show();
        } else {
            logoCtl.show();
            functionBarCtl.show();
            var toRight = { "left": tools.functionBarSettings.head };
            headCtl.css(toRight);
            mainCtl.css(toRight);
            $("#main .showFunctionBar").hide();
        }
        return this;
    },
    getcount: function (name) {
        $.ajax({
            url: dss.rootPath + "framework/message/ashx/servicemessage.ashx?type=getcount&ran=" + Math.random(),
            type: 'get',
            success: function (data) {
                var num = parseInt(data);
                if (num == -1) {
                    clearInterval(tools.currentNewsInterval);
                }
                else {
                    var li = $("." + name).eq(0);
                    li.empty();
                    if (num > 0) {
                        var span = $("<span></span>");
                        if (num > 9) {
                            span.text("N");
                        }
                        else {
                            span.text(num);
                        }
                        li.append(span);
                    }
                }
            }
        })
    },
    currentTile: undefined,
    currentNewsInterval: undefined
};
(function () {
    v = dss.cookie.get("main_data");
    var cookieData = undefined;
    try {
        cookieData = $.parseJSON(v);
    } catch (e) {
        window.location = "main.html";
        return;
    }
    tools.saySubName(cookieData.name).createSearchUI();

    dss.ajax({
        "url": "services/frame/frame2.ashx",
        "pattern": "normal",
        "data": { "menu_id": cookieData.id },
        "success": function (d) {
            var data = $.parseJSON(d);
            //
            tools.sayHi(data.user)
                 .render($(".menu"), data.menus)
                 .createTileItem($("#functionBar ul.tiles"), data, $("#menuTree"));
        }
    });
    $("#hideFunctionBar").click(function () { tools.hideOrShowFunctionBar(false); });
    $("#showFunctionBar").click(function () { tools.hideOrShowFunctionBar(true); });
}());