/***************************************************************************
Jquery FolatMenu 
NOTE: Created by FolatMenu. 
Copyright 2013, liubailing
Features： 弹出菜单层    样式有待修改
1.
Update Note：

Needs：jquery-1.9.1.min.js    jquery-ui.css
****************************************************************************/
$(document).ready(function () {
    $(this).click(function (event) {
        var objMenu = $(".div_PopWindowsMenu");
        if (objMenu.size() > 0) objMenu.hide();
    })
});

//@在页面生成弹出层dom
function popFloaMenuDom(options) {
    if ($("." + options.popid).size() == 0) {
        if (options.menuList.length > 0) {
            var divMenuList = "<div  class=\"" + options.popid + " div_PopWindowsMenu\" params=\"未定\" >";
            divMenuList += "<ul class='floatmenu'>"
            for (var i = 0; i < options.menuList.length; i++) {
                divMenuList += "<li><a class=\"divMenuItem\"  onclick=\"" + options.menuList[i].clickEvent + "\" onmouseover=\"" + options.menuList[i].mouseoverEvent + "\" onmouseout=\"" + options.menuList[i].mouseoutEvent + "\">" + options.menuList[i].menuName + "</a></li>";
            }
            divMenuList += "</ul>"
            divMenuList += "</div>";
            $(document.body).append(divMenuList);
            $("." + options.popid).hide();
            var objM = $(".divMenuItem");
            objM.bind("mouseover", function (e) {
                $(this).addClass("hover");
            });
            objM.bind("mouseout", function (e) {
                $(this).removeClass("hover");
            });
        }
    } else {
        $("." + options.popid).attr("params", options.params);
    }
}

//@计算出弹出层的显示位置  绑定数据
function thisShowFloaMenu(event, options, objMenu) {
    if (objMenu.size() > 0) {
        objMenu.hide();
        var clientX = event.clientX;
        var clientY = event.clientY;
        var redge = document.body.clientWidth - clientX;
        var bedge = document.body.clientHeight - clientY;
        var menu = objMenu.get(0);
        var menuLeft = 0;
        var menuTop = 0;
        if (redge < menu.offsetWidth)
            menuLeft = document.body.scrollLeft + clientX - menu.offsetWidth;
        else
            menuLeft = document.body.scrollLeft + clientX;
        if (bedge < menu.offsetHeight)
            menuTop = document.body.scrollTop + clientY - menu.offsetHeight;
        else
            menuTop = document.body.scrollTop + clientY;
        objMenu.css({
            top: menuTop + "px", left: menuLeft + "px", position: "absolute", "z-index": 99999
        });

        objMenu.attr("id", options.popid);
        objMenu.attr("name", options.popid);
        objMenu.show();

    }
    objMenu.attr("params", options.params);
    return false;
}

jQuery.fn.extend({
    jeContextMenu: function (opts) {
        var defaults = {
            popid: "div_ContextMenu",
            param: "",
            menuList: []
        };
        var options = $.extend(true, defaults, opts);
        if (options.popid == "") {
            options.popid = "div_ContextMenu";
        }

        return this.each(function () {
            if ($(".div_ContextMenu").size() == 0) {
                popFloaMenuDom(options);
            }
            this.oncontextmenu = function () {
                var objMenu = $(".div_ContextMenu");
                var event = arguments[0] || window.event;
                thisShowFloaMenu(event, options, objMenu);
            }
        });
    },
    jeDbClickMenu: function (opts) {
        var defaults = {
            popid: "div_dbClickMenu",
            param: "",
            menuList: []
        };
        var options = $.extend(true, defaults, opts);
        if (options.popid == "") {
            options.popid = "div_dbClickMenu";
        }
        return this.each(function () {
            if ($(".div_dbClickMenu").size() == 0) {
                popFloaMenuDom(options);
            }
            this.ondblclick = function () {
                var objMenu = $(".div_dbClickMenu");
                var event = arguments[0] || window.event;
                thisShowFloaMenu(event, options, objMenu);
            }
        });
    },
    jeMouseoverMenu: function (opts) {
        var defaults = {
            popid: "div_MouseoverMenu",
            param: "",
            menuList: []
        };
        var options = $.extend(true, defaults, opts);

        if (options.popid == "") {
            options.popid = "div_MouseoverMenu";
        }
        return this.each(function () {

            popFloaMenuDom(options);

            this.onmouseover = function () {
                var objMenu = $(".div_MouseoverMenu");
                var event = arguments[0] || window.event;
                thisShowFloaMenu(event, options, objMenu);
            }
        });
    }
});