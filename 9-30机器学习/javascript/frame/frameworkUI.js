(function ($) {
    var FrameworkUI = {
        createUI: function () {
            var bannerMenuItems = [
            //{ "name": "个人信息", "click": "" }
                {"name": "退出", "click": logout }
            //, { "name": "帮助", "click": "" }
                , { "name": "版本 3.0.1", "click": "" }
            ];

            ajaxHelper.get("services/frame/menu.ashx"
                , function (data) {
                    var helper = $.uiHelper;
                    helper.createBannerUI(bannerMenuItems)
                        .createSearchUI()
                        .createMenuUI($.parseJSON(data))
                    //.createMessageUI()
                    ;
                }
                , function () {
                });
            function logout() {
                ajaxHelper.simpleGet("services/frame/login.ashx?type=logout"
                    , function (d) {
                        if (d.data == "ok")
                            window.location = "login.html";
                    }
                    , function () { })
            };
        }
        ,
        updateLayout: function () {
            $.uiHelper.updateLayout();
        }
    }
    $.extend(true, { frameworkUI: FrameworkUI });

    var FramewrokUIHelper = {
        createBannerUI: function (menuItems) {
            var bannerControl = $("#banner");
            bannerControl.empty();
            var ulControl = $("<ul></ul>").appendTo(bannerControl);
            $.each(menuItems, function (index) {
                var item = this;
                var linkItem = undefined;
                if (item.click != undefined) {
                    linkItem = $.linkTool.createLiLink("banner" + index, item.name, "#", item.click);
                }
                else if (typeof item.href == "string") {
                    linkItem = $.linkTool.createALink(item.name, item.href).wrap("<li></li>").parent();
                }
                if (linkItem != undefined) {
                    linkItem.appendTo(ulControl);
                }
            });
            return this;
        }
        ,
        createMenuUI: function (menuItems) {
            var menuControl = $("#menuPane");
            menuControl.empty();
            var ulControl = $("<ul></ul>").css("width", "20000px").appendTo(menuControl);
            var maxItemPerPart = 7; //最多显示7个菜单项，多于7个时自动分块
            $.each(menuItems, function (index) {
                var item = this;
                $.linkTool.createLiLink("sys" + index, item.name, item, menu_Click).appendTo(ulControl);
            });

            var first = menuControl.find("li:first");
            if (typeof first == "object") {
                var data = first.data("data");
                if (typeof data == "object") {
                    menu_Click(first, data);
                }
            }
            var last = menuControl.find("li:last");
            if ((last.offset().left + last.width() - first.offset().left) > menuControl.width()) {
                ulControl.wrap('<div id="menuItemWrapper" style="float:left;overflow:hidden;width:' + (menuControl.width() - 50) + 'px;"></div>');
                menuControl
                    .append($("<div></div>").addClass("previous").text("<").attr("title", "前一个菜单").bind("click", function () { menu_Move(true); }))
                    .append($("<div></div>").addClass("next").text(">").attr("title", "后一个菜单").bind("click", function () { menu_Move(false); }));
            }

            function menu_Move(toLeft) {
                var currentMenuItem = $(document.body).data("currentMenuItem") || first;
                if (currentMenuItem == undefined) {
                    return;
                }
                var tmp = (toLeft === true) ? currentMenuItem.prev() : currentMenuItem.next();
                if (tmp.length == 0) {
                    return;
                }

                var currentPosition = ulControl.css("margin-left").replace("px", ""),
                    expectedPosition = (currentPosition - tmp.offset().left + currentMenuItem.offset().left),
                    actualPosition = (expectedPosition > 0) ? 0 : expectedPosition;
                var wrapper = $("#menuItemWrapper"),
                    canSeeLastItem = (last.offset().left + last.width() - wrapper.offset().left) <= wrapper.width();
                if (toLeft || !canSeeLastItem) {
                    ulControl.css("margin-left", actualPosition + "px");
                    $(document.body).data("currentMenuItem", tmp);
                }
            }

            function menu_Click(sender, data) {
                if ($(document).data("activeSystemMenuItemId") == sender.attr("id"))
                    return;

                menuControl.find("li").removeClass("activeMenu");
                sender.addClass("activeMenu");
                var hasUrl = (typeof data.command == "string"
                                && data.command != ""
                                && !data.command.startWith("?"));
                var hasItems = (typeof data.children == "object")
                                && (data.children.length != undefined)
                                && (data.children.length > 0);
                if (hasUrl && !hasItems) {
                    FramewrokUIHelper.updateLeftPane(false);
                    if (data.command == "main.html") {
                        FramewrokUIHelper.openTabPage(data.name, "framework/management/welcome.html");
                    }
                    else {
                        FramewrokUIHelper.openTabPage(data.name, data.command);
                    }
                }
                else if (!hasUrl && !hasItems) {
                    // 无效菜单项，暂不处理
                    return;
                }
                else {
                    var options = {
                        "title": data.name
                        , "items": data.children
                        , "openFirstMenuPage": !hasUrl
                    };
                    FramewrokUIHelper.updateLeftPane(true);
                    FramewrokUIHelper.createLeftPane(options);
                    if (hasUrl) {
                        FramewrokUIHelper.openTabPage(data.name, data.command);
                    }
                }
                $(document).data("tabControl").adjustTabWidth();
                $(document).data("activeSystemMenuItemId", sender.attr("id"));
            }

            return this;
        }
        ,
        createSearchUI: function () {
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
                                                .attr("value", "搜索")
                                                .bind("click", function () { searchButton_Click(); return false; })
                                            )
                )
            .appendTo(rootContainer);
            var ulContainer = $("#searchCategory");
            $.each(searchCategories, function (index) {
                var category = this;
                $.linkTool.createLiLink("searchType" + index, category.name, category, setCurrentCategory).appendTo(ulContainer);
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
                    FramewrokUIHelper.openTabPage("搜索结果", url);
                }
            }
            return this;
        }
        ,
        createMessageUI: function () {
            var messageControl = $("<div></div>").attr("id", "messagePane").appendTo($("#header"));
            messageControl
                .append(
                    $("<div></div>").attr("id", "myFocus").text("我的关注")
                )
                .append(
                    $("<div></div>").text("未派单数量（7）")
                );
            return this;
        }
        ,
        createLeftPane: function (options) {
            var root = $("#leftPane");
            if ($("#title").length == 0 || $("#menuDetail").length == 0 || $("#menuItems").length == 0) {
                root.empty()
                    .append($("<div></div>").attr("id", "title").append($("<span></span>")))
                    .append($("<div></div>").attr("id", "menuDetail"))
                    .append($("<div></div>").attr("id", "menuItems"));
            }
            $("#title span").text(options.title);
            var menuItem = $("#menuItems").empty();
            var toggleflag = 1;
            $("<div><div>").attr("id", "menuItemToggle").append("<div id='menuItemToggle2'></div>")
                            .click(function () {
                                if (toggleflag == 1) {
                                    $("#menuItems ul").hide(); updateMenuZTreeHeight(false); toggleflag = 0;
                                }
                                else {
                                    $("#menuItems ul").show(); updateMenuZTreeHeight(true); toggleflag = 1;
                                }
                            }).appendTo(menuItem);
            var ulControl = $("<ul></ul>").appendTo(menuItem)
            if (options.items != undefined && options.items.length != undefined) {
                $.each(options.items, function (index) {
                    var item = this;
                    $.linkTool.createLiLink("menuItem" + index, item.name, item, menuItem_click).appendTo(ulControl);
                });
            }
            //
            if ($("#menuDetail ul").length == 0) {
                $("<ul></ul>").attr("id", "menuZTree").addClass("ztree").appendTo($("#menuDetail"));
            }
            else {
                $("#menuDetail ul").empty();
            }

            var delta = 1;
            var firstMenuItem = options.items[0];
            menuItem_click(undefined, firstMenuItem);

            function menuItem_click(sender, data) {
                var setting = {
                    view: { showLine: true, selectedMulti: false },
                    data: { simpleData: { enable: true} },
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
                            FramewrokUIHelper.openTabPage(menuItem.name, menuItem.command);
                        }
                    }
                };
                var zTree = $("#menuZTree");
                zTree = $.fn.zTree.init(zTree, setting, data);
                zTree.expandAll(true);
                //  注意：这里不是写错了，只调用一次会导致横向滚动条被遮挡，调用两次完全正常显示
                //               初步分析原因是菜单生成有延时导致， 具体原因有待进一步分析
                updateMenuZTreeHeight(true);
                updateMenuZTreeHeight(true);
            }
            function updateMenuZTreeHeight(expand) {
                var toggle = $("#menuItemToggle2"),
                    menuDetail = $("#menuDetail"),
                    bottom = $("#menuItems").offset().top;
                menuDetail.css("height", bottom - menuDetail.offset().top - delta).css("overflow", "auto");
                if (expand) {
                    toggle.attr("class", "expanded").text("收起");
                }
                else {
                    toggle.attr("class", "collapsed").text("展开");
                }
            }

            return this;
        }
        ,
        updateLeftPane: function (visiable) {
            if (visiable == undefined) {
                visiable = !$(document).data("leftPaneVisiable");
            }
            if (visiable) {
                $("#leftPane").show();
                $("#splitter").show();
            }
            else {
                $("#leftPane").hide();
                $("#splitter").hide();
            }
            $(document).data("leftPaneVisiable", visiable);
            FramewrokUIHelper.updateLayout();
        }
        ,
        openTabPage: function (title, url) {
            tabControl = $(document).data("tabControl");
            if (tabControl == undefined) {
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
                    onShowOrHideButtonClick: '$.uiHelper.updateLeftPane(undefined)'
                };
                var temp = $("<div></div>").attr("id", "tabControl").appendTo(main);
                tabControl = temp.CreateTabControl(options, "welcome.htm");
                $(document).data("tabControl", tabControl);
            }
            tabControl.addTab(title, url, true);
            return this;
        }
        ,
        updateLayout: function () {
            var header = $("#header");
            var container = $("#container");
            var splitter = $("#splitter");
            var mainPane = $("#mainPane");
            var top = header.offset().top + header.height();
            var screenInfo = $.screenInfo.getPageViewInfo(); //.getPageInfo();
            var totalHeight = screenInfo.height,
                h = totalHeight - top;
            var left = splitter.offset().left + splitter.width();
            var temp2 = container.width();
            mainPane.width(temp2 - left);
            container.height(h);
        }
    }
    $.extend(true, { uiHelper: FramewrokUIHelper });
})(jQuery);

// linkTool的定义，后期考虑迁移出去
(function ($) {
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

    $.extend(true, { linkTool: linkTool });

    var browserInfo = {
        getName: function () {
            var x = window.navigator;
            if (x != null) {
                return x.appVersion;
            }
            return "Unknown Browser";
        },
        isIE: function () {
            var x = window.navigator;
            if (x != null) {
                return (x.appName == "Microsoft Internet Explorer");
            }
            return false;
        },
        getVersion: function () {
            var x = navigator;
            if (x != undefined && x.appName == "Microsoft Internet Explorer") {
                var version = x.appVersion;
                var data = version.split(";");
                for (var i = 0; i < data.length; i++) {
                    if (data[i].startWith(" MSIE")) {
                        result = data[i].replace(" MSIE", "");
                        return parseInt(result, 10);
                    }
                }
            }
            return -1;
        }
    };
    $.extend(true, { browserInfo: browserInfo });

    var screenInfo = {
        // 页面宽度
        getPageInfo: function () {
            //var g = document,
            //    a = g.body,
            //    f = g.documentElement,
            //    d = (g.compatMode == "BackCompat") ? a : g.documentElement;
            return { "width": $(document.body).width(), "height": $(document.body).height() };
        },
        // 页面可视宽度
        getPageViewInfo: function () {
            var d = document,
                a = (d.compatMode == "BackCompat") ? d.body : d.documentElement;
            return { "width": a.clientWidth, "height": a.clientHeight };
        },
        getScreenInfo: function () {
            var resolutions = [1024, 1280, 1360, 1366, 1440];
            var ie7 = [1003, 1259, 1339, 1345, 1420];
            var ie8 = [1020, 1276, 1356, 1362, 1436];
            // IE9及其以上版本渲染效果和分辨率一样大，故不再特殊处理

            var screenWidth = screen.width
            var workPlaceWidth = $(window).width();
            // 如果可见宽度比分辨率大，则说明此时用的是扩展扩展显示器且扩展显示器的分辨率比主显示器的分辨率大，直接使用扩展显示器的宽度
            //if (workPlaceWidth > screenWidth) {
            //    return workPlaceWidth;
            //}
            //else {
            //    var result = 0;
            //    var ieVersion = browserInfo.getVersion();
            //    // 非IE浏览器或IE版本高于8.0
            //    if (ieVersion < 0 || ieVersion > 8) {
            //        return screenWidth;
            //    }
            //    // IE6或者IE5（总之低于IE7）
            //    if (ieVersion <= 7) {
            //        ieVersion = 7;
            //    }
            //    var resolutionIndex = $.inArray(screenWidth, resolutions);
            //    if (resolutionIndex < 0)
            //        return screenWidth;
            //    if (ieVersion == 7)
            //        return ie7[resolutionIndex];
            //    else
            //        return ie8[resolutionIndex];
            //}
            var p = screenInfo.getPageInfo();
            return p;
        }

    }
    $.extend(true, { screenInfo: screenInfo });
})(jQuery);