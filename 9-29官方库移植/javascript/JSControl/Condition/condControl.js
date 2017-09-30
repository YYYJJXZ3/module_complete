(function ($) {
    "use strict";
    $.condCtrl = $.condCtrl || {};
    $.extend($.condCtrl, {
        defaults: {
        },
        dom: {
            checkTxt: { text: "已选条件", width: 10, css: {} },
            clearBtn: { text: "×", title: "清除", defaultcss: { width: 10, position: "absolute", right: 0, top: "4px", "color": "red", "text-align": "left", "cursor": "pointer", "font-size": "12px", "font-weight": "bolder" }, css: { width: 10 } },
            openBtn: { text: "+", title: "展开", defaultcss: { width: 16, height: "100%", position: "absolute", right: 0, top: 0, "background-color": "#F4F4F4", "color": "#0000ff", "font-size": "16px", "font-weight": "bolder", "cursor": "pointer", "text-align": "center" }, css: { width: 30 } },
            hideBtn: { text: "-", title: "缩起" }
        },
        css: {
            backgroundcolor: "#282828"
        }
    });

})(jQuery);

(function ($) {
    "use strict";
    if (typeof Array.indexOf !== 'function') {
        Array.prototype.indexOf = function (args) {
            var index = -1;
            for (var i = 0, l = this.length; i < l; i++) {
                if (this[i] === args) { index = i; break; }
            }
            return index;
        }
    }
    $.condCtrl = $.condCtrl || {};
    $.extend($.condCtrl, {
        guid: 1,
        version: "1.0.0",
        //执行方法
        getAccessor: function (obj, expr) {
            var ret, p, prm = [], i;
            if (typeof expr === 'function') { return expr(obj); }
            ret = obj[expr];
            if (ret === undefined) {
                try {
                    if (typeof expr === 'string') {
                        prm = expr.split('.');
                    }
                    i = prm.length;
                    if (i) {
                        ret = obj;
                        while (ret && i--) {
                            p = prm.shift();
                            ret = ret[p];
                        }
                    }
                } catch (e) { }
            }
            return ret;
        },
        //执行方法
        getMethod: function (name) {
            return this.getAccessor($.fn.condCtrlect, name);
        },
        //自定义扩展方法
        extend: function (methods) {
            $.extend($.fn.condCtrl, methods);
            if (!this.no_legacy_api) {
                $.fn.extend(methods);
            }
        },
        // 异常处理方法  @message 异常信息   @excLevel  异常级别（枚举值 0【log】,1【】,2,3,4）。
        doException: function (message, excLevel) {
            if (excLevel && parseInt(excLevel) > 0) {
                excLevel = parseInt(excLevel);
            } else {
                excLevel = 0;
            }
            switch (excLevel) {
                case 0:
                    console.info(message);
                    break;
                case 1:
                    console.log(message);
                    break;
                case 2:
                    console.warn(message);
                    break;
                case 3:
                    console.error(message);
                    break;
                default:
                    console.info(message);
                    break;
            }
        },
        getJsonField: function (curJson, fieldName) {
            if (curJson || curJson.length == 0 || fieldName == "") {
                return [];
            }
        }
    });
    var methodsHelp = {
        /// 初始化设置
        initOpt: function (opt) {
            $.condCtrl.dom.clearBtn["showcss"] = $.extend(true, $.condCtrl.dom.clearBtn.defaultcss, $.condCtrl.dom.clearBtn.css);
            $.condCtrl.dom.openBtn["showcss"] = $.extend(true, $.condCtrl.dom.openBtn.defaultcss, $.condCtrl.dom.openBtn.css);
            $.condCtrl.dom.clearBtn.showcss.right = $.condCtrl.dom.openBtn.showcss.width + "px";

            opt = $.extend(true, {
                width: 0,
                height: 25,
                bgColor: "#FFF",
                datasource: [],   //是否是必选项
                float: false
            }, opt);

            return opt;
        },
        initOptItem: function (optItem) {
            optItem = $.extend(true, {
                name: 0,
                orgData: [],
                initData: [],
                chkData: [],
                width: 150,
                type: "",
                pageIndex: 1,
                pageSize: 20,
                multiple: false,     //是否是多选项
                idVerify: true,
                showAct: false,
                showPage: false,
                showSearch: false,
                searchWord: "",
                pName: "",          //上一级的名称
                setting: "",
                callback: {
                    onChoice: null,     //单选有效
                    onCheckbox: null,   //点击checkbox事件  多选时
                    onSelect: null,     //确认选择后事件
                    onSearch: null      //搜索事件
                }
            }, optItem);

            if (optItem.type === "date" && optItem.width === 150) optItem.width = 200;
            return optItem;
        },
        doInlineEvent: function ($clear, $onoff) {
            $onoff.append($.condCtrl.dom.hideBtn.text).prop("title", $.condCtrl.dom.hideBtn.title);
            $onoff.bind("click", function () {
                var $objP = $(this).parents("div.cc-parent");
                var $dropdiv = $objP.find("div.cc-dropdiv");
                var $choice = $objP.find("div.cc-choice");
                if ($objP.hasClass("cc-hideDiv")) {
                    $objP.removeClass("cc-hideDiv").addClass("cc-showDiv");
                    $(this).html($.condCtrl.dom.hideBtn.text).attr("title", $.condCtrl.dom.hideBtn.title);
                    $choice.css({ "border-bottom": "none" });
                    $dropdiv.show()
                } else {
                    $objP.removeClass("cc-showDiv").addClass("cc-hideDiv");
                    $(this).html($.condCtrl.dom.openBtn.text).attr("title", $.condCtrl.dom.openBtn.title);
                    $choice.css({ border: "1px solid #E5e5e5" });
                    $dropdiv.hide()

                }
            });

            $clear.bind("click", function () {
                var $objP = $(this).parents("div.cc-parent");
                $objP.find("div.cc-choicediv").css({ "border-bottom": "none" }).html("");
                $objP.find("div.cc-dropdiv").show();
                $objP.find("div.cc-checkitem").show();
                return false;
            });
        },
        doFloatDom: function ($parent, $choice, $dropDiv) {
            $parent.css({ position: "relative" })
            $dropDiv.css({ position: "absolute", "z-index": "999", "background-color": "#fff" }).offset({ top: 0, left: 0 }).hide();
        },
        doFloatEvent: function ($clear, $onoff) {
            $onoff.append($.condCtrl.dom.openBtn.text).prop("title", $.condCtrl.dom.openBtn.title);
            $onoff.bind("click", function () {
                var $objP = $(this).parents("div.cc-parent");
                var $dropdiv = $objP.find("div.cc-dropdiv");
                if ($objP.hasClass("cc-showDiv")) {
                    $objP.removeClass("cc-showDiv").addClass("cc-hideDiv");
                    $(this).html($.condCtrl.dom.openBtn.text).attr("title", $.condCtrl.dom.openBtn.title);
                    $dropdiv.offset({ top: 0, left: 0 }).hide();
                } else {
                    $objP.removeClass("cc-hideDiv").addClass("cc-showDiv");
                    $(this).html($.condCtrl.dom.hideBtn.text).attr("title", $.condCtrl.dom.hideBtn.title);
                    $dropdiv.show();
                    $dropdiv.offset({ top: $objP.offset().top + $objP.outerHeight() - 1, left: $objP.offset().left });
                }
            });

            $clear.bind("click", function () {
                var $objP = $(this).parents("div.cc-parent");
                $objP.find("div.cc-checkitem").show();
                $objP.find("div.cc-dropdiv").show();
                $objP.find("div.cc-dropdiv").offset({ top: $objP.offset().top + $objP.outerHeight() - 1, left: $objP.offset().left });
                $objP.find("div.cc-choicediv").html("");
                return false;
            });
            /// 绑定在页面的事件
            $('body').click(function (e) {
                if ($(e.target).parents('div.cc-parent').length > 0) {
                    return;
                }
                if ($(".cc-dropdiv").length > 0) {
                    $(".cc-dropdiv").each(function () {
                        if ($(this).data("float")) {
                            var $obj = $(this).parents("div.cc-parent");
                            $obj.removeClass("cc-showDiv").addClass("cc-hideDiv");
                            $(this).offset({ top: 0, left: 0 }).hide();
                            $obj.find("div.on-off").html($.condCtrl.dom.openBtn.text).attr("title", $.condCtrl.dom.openBtn.title);
                        }
                    })
                }
            });
        }
    }
    var methods = {
        init: function (opt) {
            var $obj = $(this);
            if ($obj.length == 0 || $obj[0].tagName.toUpperCase() !== 'DIV') {
                $.condCtrl.doException("Element is not a div", 3);
                return false;
            }
            if ($obj[0].id == '' || $obj[0].id == 'undefind') {
                $.condCtrl.doException("Element  未指定ID", 3);
                return false;
            }
            this.opt = methodsHelp.initOpt(opt);
            if (this.opt.width == 0) {
                this.opt.width = $obj.width() > 0 ? $obj.width() - 2 : 120;
            }
            this.$parent = $('<div class="cc-parent"></div>');
            this.$choice = $('<div class="cc-choice"></div>');
            this.$choiceTitle = $('<div class="cc-choicetitle">已经选择<font>：</font></div>');
            this.$choiceDiv = $('<div class="cc-choicediv"></div>');
            this.$clear = $('<div class="cc-clear" title="' + $.condCtrl.dom.clearBtn.title + '">' + $.condCtrl.dom.clearBtn.text + '</div>');
            this.$onoff = $('<div class="on-off"></div>')
            this.$dropDiv = $('<div class="cc-dropdiv"></div>');
            this.$choice.css({ width: this.opt.width });
            this.$choiceDiv.css({ width: (this.opt.width - 80 - $.condCtrl.dom.openBtn.showcss.width - $.condCtrl.dom.clearBtn.showcss.width) });
            this.$clear.css($.condCtrl.dom.clearBtn.showcss);
            this.$onoff.css($.condCtrl.dom.openBtn.showcss);
            this.$choiceTitle.css({ width: 80, height: 25 });
            this.$choice.append(this.$choiceTitle).append(this.$choiceDiv).append(this.$clear).append(this.$onoff);
            this.$parent.append(this.$choice).append(this.$dropDiv);
            $obj.html(this.$parent);
            this.$dropDiv.css({ width: this.opt.width });
            if (this.opt.float) {  //@  浮动时候样式处理
                methodsHelp.doFloatDom(this.$parent, this.$choice, this.$dropDiv);
            } else {
                this.$choice.css({ "border-bottom": "none" });
            }
            this.opt["domid"] = $obj[0].id;

            $obj.data({ float: this.opt.float, width: this.opt.width, domid: this.opt["domid"] })
            ccOptionDom.init(this.opt, this.$dropDiv);

            if (this.opt.float) { //@  浮动时候事件处理
                methodsHelp.doFloatEvent(this.$clear, this.$onoff);
            } else {//@  
                methodsHelp.doInlineEvent(this.$clear, this.$onoff);
            }
            if (this.opt.datasource.length > 0) {
                for (var i = 0; i < this.opt.datasource.length; i++) {
                    $obj.condControl("setChecked", this.opt.datasource[i].name);
                }//end循环
            }
            return $obj;
        },
        getSelResults: function (checked) {
            var objP = $(this);
            var $choise = objP.find("div.ccsel-item");
            var $chkitem = objP.find("div.cc-checkitem");

            var resArr = [];
            for (var i = 0; i < $chkitem.length; i++) {
                var name = $($chkitem[i]).find("div.cc-title strong").text();
                var orgd = $($chkitem[i]).data();
                var res = { name: name, chked: false, cheId: "", chkName: "", chkItem: [], multiple: orgd.multiple };
                for (var j = 0; j < $choise.length; j++) {
                    var d = $($choise[j]).data();
                    if (d && name == d.name) {
                        res.chkId = d.chkId;
                        res.chkName = d.chkName;
                        res.chkItem = d.chkData;
                        res.chked = true;
                        break;
                    }
                }
                if (checked && checked === true) {
                    if (res.chked) {
                        resArr.push(res);
                    }
                } else {
                    resArr.push(res);
                }
            }
            return resArr;
        },
        getSelNames: function () {

        },
        getSelIds: function () {
        },
        setChecked: function (name) {
            if (typeof name !== "string" || name === "") {
                return false;
            }
            var $obj = $(this);
            var checkitems = $obj.find("div.cc-checkitem");
            for (var i = 0; i < checkitems.length; i++) {
                var $item = $(checkitems[i]);
                var itname = $item.find("div.cc-title strong").text();
                if (itname == name) {
                    switch ($item.data()["chkItemSet"].type) {
                        case "date":
                            ccChoiceDom.doTime($item);
                            break;
                        case "select":
                            if ($item.data()["chkItemSet"].multiple) {
                                ccChoiceDom.doMultiple($item);
                            } else {
                                ccChoiceDom.doSingle($item);
                            }
                            break;
                        case "input":
                            ccChoiceDom.doInput($item);
                            break;
                        default:
                            break;
                    }
                    break;
                }
            }
        },
        delChecked: function (name) {
            if (typeof name !== "string" || name === "") {
                return false;
            }
            var $obj = $(this);
            var checkitems = $obj.find("div.ccsel-item");
            for (var i = 0; i < checkitems.length; i++) {
                var $item = $(checkitems[i]);
                var itname = $item.find("div.ccsel-t").text();
                if (itname == (name + "：")) {
                    $item.find("div.ccs-del").click();
                    break;
                }
            }
        },
        delChoise: function (name) {
            if (typeof name !== "string" || name === "") {
                return false;
            }
            var $obj = $(this);
            $obj.condControl("delChecked", name);
            var $checkitems = $obj.find("div.cc-checkitem");
            var index = ccChoiceDomHelp.getChoiseIndex($obj, name);
            if (index < 0) { return false; }
            $($checkitems[index]).remove();
        },
        replaceChoise: function (optitem) {
            if (typeof optitem !== "object" || typeof optitem.name !== "string" || optitem.name === "") {
                return false;
            }
            var $obj = $(this);
            $obj.condControl("delChecked", optitem.name);
            var $checkitems = $obj.find("div.cc-checkitem");
            var index = ccChoiceDomHelp.getChoiseIndex($obj, optitem.name);
            if (index < 0) { return false; }
            var $curItme = $($checkitems[index]);
            var set = methodsHelp.initOptItem($curItme.data("chkItemSet"));
            set.orgData = optitem.orgData;
            set.initData = optitem.initData;
            ccOptionDom.iniItem(-1, methodsHelp.initOptItem(set), $obj.data(), $obj.find("div.cc-dropdiv"));
            if (set.initData && set.initData.length > 0) {
                $obj.condControl("setChecked", set.name);
            }
        },
        appendChoise: function (optitem) {
            if (typeof optitem !== "object" || typeof optitem.name !== "string" || optitem.name === "") return false;
            var $obj = $(this);
            $obj.condControl("delChecked", optitem.name);
            var $checkitems = $obj.find("div.cc-checkitem");
            var index = ccChoiceDomHelp.getChoiseIndex($obj, optitem.name);
            if (index < 0) { return false; }
            var $curItme = $($checkitems[index]);
            var set = methodsHelp.initOptItem($curItme.data("chkItemSet"));
            set.orgData = set.orgData.concat(optitem.orgData);
            set.initData = set.initData.concat(optitem.initData);
            ccOptionDom.iniItem(-1, methodsHelp.initOptItem(set), $obj.data(), $obj.find("div.cc-dropdiv"));
            if (set.initData && set.initData.length > 0) {
                $obj.condControl("setChecked", set.name);
            }
        },
        resetChoise: function (optitem, afterName) {
            if (typeof optitem !== "object" || typeof optitem.name !== "string" || optitem.name === "") return false;
            var $obj = $(this);
            $obj.condControl("delChecked", optitem.name);
            var checkitems = $obj.find("div.cc-checkitem");
            var aftrindex = ccChoiceDomHelp.getChoiseIndex($obj, afterName);
            ccOptionDom.iniItem(aftrindex, methodsHelp.initOptItem(optitem), $obj.data(), $obj.find("div.cc-dropdiv"));
            if (optitem.initData && optitem.initData.length > 0) {
                $obj.condControl("setChecked", optitem.name);
            }
        }
    };
    // 已选项目
    var ccChoiceDomHelp = {
        getChoiseIndex: function ($obj, name) {
            if (typeof name !== "string" || name === "") {
                return -1;
            }
            var checkitems = $obj.find("div.cc-checkitem");
            for (var i = 0; i < checkitems.length; i++) {
                var $item = $(checkitems[i]);
                var itname = $item.find("div.cc-title strong").text();
                if (itname == name) {
                    return i;
                    break;
                }
            }
            return -1;
        }
    }
    var ccChoiceDom = {
        doTime: function ($objchk) {
            var tilte = $objchk.find("div.cc-title strong").text();

            var domid = $objchk.data("parentDomID");
            var stime = $("#" + $objchk.data("timeDomID")).timepicker("getDateStr").split(":");
            var ttype = $("#" + $objchk.data("timeDomID")).timepicker("getTimeType");
            if (ttype == "Hour") {
                var shour = $("#" + $objchk.data("timeDomID")).timepicker("getHourStr").split(":");
                stime[0] = stime[0] + shour[0];
                stime[1] = stime[1] + shour[1];
            }
            if (stime[1] == undefined || stime[1].toString() === "NaN") stime[1] = "";
            stime[0] = stime[1] == "" ? stime[0] : (stime[0] + "-" + stime[1]);
            ccChoiceDom.initDom(
                $objchk,
                {
                    name: tilte,
                    txt: stime[0],
                    chkName: stime[0],
                    timeType: ttype,
                    chkId: "",
                    chkData: [{ id: "", name: stime[0] }]
                });
        },
        doInput: function ($objchk) {
            var txt = $objchk.find("input").val();
            if (txt && txt != "") {
            } else {
                return false;
            }
            var tilte = $objchk.find("div.cc-title strong").text();
            ccChoiceDom.initDom(
                $objchk,
                {
                    name: tilte,
                    txt: txt,
                    chkName: txt,
                    chkId: "",
                    chkData: [{ id: "", name: txt }]
                });
        },
        doSingle: function ($objchk) {
            var tilte = $objchk.find("div.cc-title strong").text();
            var obj = $objchk.find("div.cc-citemChk");
            if (obj && obj.text() !== "") {
                ccChoiceDom.initDom(
                    $objchk,
                    {
                        name: tilte,
                        txt: obj.text(),
                        chkName: obj.text(),
                        chkId: obj.attr("ccid"),
                        chkData: [{ id: obj.attr("ccid"), name: obj.text() }]
                    });
            }
        },
        doMultiple: function ($objchk) {
            var tilte = $objchk.find("div.cc-title strong").text();
            var txt = [];
            var ids = [];
            var items = [];
            var title = "";

            var opts = $objchk.find("div.cc-citemChk");
            if (opts.length > 0) {
                $.each(opts, function (i, item) {
                    var p = $(item);
                    txt.push(p.text());
                    ids.push(p.attr("ccid"));
                    items.push({ id: p.attr("ccid"), name: p.text() })
                });
                title = txt.toString();
                if (opts.length === $objchk.find("div.cc-citem").length) txt = ["已全选"];
            }

            if (txt.length > 0) {
                ccChoiceDom.initDom(
                    $objchk,
                    {
                        name: tilte,
                        txt: txt.toString(),
                        chkName: title,
                        chkId: ids.toString(),
                        chkData: items
                    });
            }
        },
        initDom: function ($objchk, item) {
            var $choicediv = $objchk.parents("div.cc-parent").find("div.cc-choicediv");
            var divcnt = $choicediv.find("div.ccsel-item");
            for (var i = 0; i < divcnt.length; i++) {
                if ($(divcnt[i]).find("div.ccsel-t").text() === (item.name + "：")) {
                    return false;
                    break;
                }
            }

            var $sel = $('<div class="ccsel-item"></div>');
            var $seltitle = $('<div class="ccsel-t"></div>');
            var $selcontext = $('<div class="ccsel-c"></div>');
            var $selcut = $('<div class="ccsel-s">…</div>');
            var $clear = $('<div class="ccs-del" title="' + $.condCtrl.dom.clearBtn.title + '">' + $.condCtrl.dom.clearBtn.text + '</div>');
            var $act = $('<div class="ccsel-a"></div>');

            $seltitle.append(item.name + "：");
            if (item.txt && item.txt !== "") {
                $selcontext.append(item.txt);
            }
            $selcut.hide();
            $act.append($clear);
            // 首先判断有没有添加过
            $sel.append($seltitle).append($selcontext).append($selcut).append($act).data(item).prop("title", item.chkName);

            var index = ccChoiceDomHelp.getChoiseIndex($objchk.parent(), item.name);  //按顺序插入
            if (index < divcnt.length) {
                for (var i = 0; i < divcnt.length; i++) {
                    if (i == index) {
                        $(divcnt[i]).before($sel);
                        break;
                    }
                }
            } else {
                $choicediv.append($sel);
            }


            var set = $objchk.data("chkItemSet");
            if ($selcontext.width() > set.width) {
                $selcontext.width(set.width);
                $selcut.show();
            }
            if (set.callback.onSelect && set.callback.onSelect instanceof Function) {
                set.callback.onSelect({ type: set.type, name: item.name, value: item.chkName, id: item.chkId, chkData: item.chkData, timeType: item.timeType || "", multiple: set.multiple })
            }
            $objchk.hide();

            $clear.bind("click", function () {
                var obj = $(this);
                var $sel = $(this).parents("div.ccsel-item");
                var objP = $(this).parents("div.cc-parent");
                var curname = $sel.data("name");
                var opts = objP.find("div.cc-checkitem");
                for (var i = 0; i < opts.length; i++) {
                    var name = $(opts[i]).find("div.cc-title strong").text();
                    if (name === curname) {
                        $(opts[i]).show();
                        break;
                    }
                }
                $sel.remove();
                return false;
            });
        }
    };
    // 下拉选择项Dom菜单
    var ccOptionDom = {
        init: function (opt, $dropDiv) {
            if (opt.datasource.length > 0) {
                for (var i = 0; i < opt.datasource.length; i++) {
                    var item = methodsHelp.initOptItem(opt.datasource[i]);
                    ccOptionDom.iniItem(i, item, { width: opt.width, domid: opt.domid, type: opt.type }, $dropDiv);
                }//end循环
            }
        },
        iniItem: function (index, item, opt, $dropDiv) {
            var $itemdom = $('<div class="cc-checkitem"></div>');
            var $itemtitle = $('<div class="cc-title"><div><strong>' + item.name + '</strong>：</div></div>');
            var $itemcontext = $('<div class="cc-context"></div>');
            var $optionsdiv = $('<div class="cc-optionsdiv"></div>');
            var $actsdiv = $('<div class="cc-actsdiv"></div>');
            $itemtitle.css({ width: 80 });
            $itemcontext.css({ width: opt.width - 80 }).append($optionsdiv).append($actsdiv);

            if (item.type === "date") { // 时间特殊处理；
                var timeid = opt.domid + "txt" + new Date().getMilliseconds();
                ccOptionDom.initTime(item, $optionsdiv, timeid);
                $itemdom.data({ "timeDomID": timeid })
            } else if (item.type === "select") {
                ccOptionDom.initCheck(item, $optionsdiv, $actsdiv, opt.width - 85);
            } else {
                ccOptionDom.initInput(item, $optionsdiv);
            }
            //保存初始化属性
            $itemdom.append($itemtitle).append($itemcontext).data({ "chkItemSet": item, "parentDomID": opt.domid });

            var $checkitems = $dropDiv.find("div.cc-checkitem");
            var isAppend = true;
            for (var i = 0; i < $checkitems.length; i++) {
                if ($($checkitems[i]).find("div.cc-title strong").text() === (item.name)) {
                    $($checkitems[i]).replaceWith($itemdom);
                    isAppend = false;
                    break;
                }
            }
            if (isAppend) {
                if (index >= $checkitems.length || index < 0)
                    $dropDiv.append($itemdom);//.append($cleardom)
                else {
                    $($checkitems[index]).after($itemdom);
                }
            }
        },
        initTime: function (item, $optionsdiv, domid) {
            if (item.setting === undefined && typeof item.setting !== "object") {
                $.condCtrl.doException("时间控件配置信息有误", 3);
                return false;
            }
            var $inputdiv = $('<div class="cc-searchdiv"></div>');
            var $time = $('<input class="cc-time" id="' + domid + '"/>');
            var $timebtn = $('<div class="cc-btn cc-btnAct">确定</div>');
            $inputdiv.append($time).append($timebtn);
            $optionsdiv.html($inputdiv).show();
            $time.timepicker(item.setting);
            $inputdiv.find("input").css({ float: "none" }).bind("change", function () { return false; });
            $timebtn.bind("click", function () { //确定时间选择
                ccChoiceDom.doTime($(this).parents("div.cc-checkitem"));
            });
        },
        initCheck: function (item, $optionsdiv, $actsdiv, allwidth) {
            var $searchdiv = $('<div class="cc-searchdiv"></div>');
            var $itemsdiv = $('<div class="cc-itmesdiv"></div>');
            var $muldiv = $('<div class="cc-mulactdiv"></div>');
            var showAct = (item.showSearch || item.showPage);

            $itemsdiv.append(ccOptionDom.getItmesDom(item, item.pageSize));
            $optionsdiv.append($searchdiv).append($itemsdiv).append($muldiv);

            //追加搜索框
            if (showAct) {
                ccOptionDom.initMoreItems($actsdiv);
                ccOptionDom.initSearchItems(item, $optionsdiv, $searchdiv, $actsdiv, allwidth);
            }
            if (item.multiple) {
                ccOptionDom.initMultipleDom($muldiv);
                ccOptionDom.setMultipleEvent($itemsdiv);
            } else {
                ccOptionDom.setSingleEvent($itemsdiv);
            }
        },
        initSearchItems: function (item, $optionsdiv, $searchdiv, $actsdiv, allwidth) {
            var $keyword = $('<input class="cc-input"/>');
            var $keywortbtn = $('<div class="cc-btn">搜索</div>');
            var $backbtn = $('<div class="cc-btn">恢复</div>');
            var $morebtn = $('<div class="cc-btn">显示更多</div>');
            if (typeof item.searchWord === "string" && item.searchWord !== "") {
                $keyword.val(item.searchWord);
            }
            if (item.showSearch) {
                $searchdiv.append($keyword).append($keywortbtn);
                // 绑定搜索事件
                $keywortbtn.bind("click", function () {
                    var obj = $(this);
                    var $objchk = $(this).parents("div.cc-checkitem");
                    var txt = $objchk.find("div.cc-searchdiv input").val();
                    var name = $objchk.find("div.cc-title strong").text();
                    var set = $objchk.data("chkItemSet");
                    if (set.callback.onSearch && set.callback.onSearch instanceof Function) {
                        set.callback.onSearch({ type: set.type, name: name, act: "onsearch", keyword: txt, pageIndex: 1 });
                    } else {
                        $.condCtrl.doException("预留的本数据查询筛选操作处理", 1);
                    }
                });
            }


            if (item.showPage) {
                $searchdiv.append($backbtn).append($morebtn);
                $morebtn.data({ pageIndex: 1 });

                $backbtn.bind("click", function () {
                    var obj = $(this);
                    var $objchk = $(this).parents("div.cc-checkitem");
                    var name = $objchk.find("div.cc-title strong").text();
                    var txt = $objchk.find("div.cc-searchdiv input").val();
                    var set = $objchk.data("chkItemSet");
                    var $morebtn = obj.next("div");
                    var pageIndex = 1;
                    $morebtn.data({ pageIndex: 1 });
                    $morebtn.html("显示更多");
                    if (set.callback.onMore && set.callback.onMore instanceof Function) {
                        set.callback.onMore({ type: set.type, name: name, act: "onmore", keyword: txt, pageIndex: 1 });
                    } else {
                        $.condCtrl.doException("预留的本数据查询更多操作处理", 1);
                    }
                });
                $morebtn.bind("click", function () {
                    var obj = $(this);
                    var $objchk = $(this).parents("div.cc-checkitem");
                    var name = $objchk.find("div.cc-title strong").text();
                    var txt = $objchk.find("div.cc-searchdiv input").val() || "";
                    var set = $objchk.data("chkItemSet");
                    var pageIndex = obj.data("pageIndex") || 1;
                    if (pageIndex < 1) { pageIndex = 1; }
                    obj.data({ pageIndex: parseInt(pageIndex) + 1 });
                    obj.html("显示更多" + (parseInt(pageIndex) + 1));
                    if (set.callback.onMore && set.callback.onMore instanceof Function) {
                        set.callback.onMore({ type: set.type, name: name, act: "onmore", keyword: txt, pageIndex: pageIndex });
                    } else {
                        $.condCtrl.doException("预留的本数据查询更多操作处理", 1);
                    }
                });
            }
            $searchdiv.hide();
            var curwidth = 0;
            if ($actsdiv.width() == 0) {
                curwidth = allwidth - 35;
            } else {
                curwidth = allwidth - $actsdiv.width();
            }
            $optionsdiv.css({ width: curwidth });
            $searchdiv.css({ width: curwidth });
        },
        //更多按钮操作
        initMoreItems: function ($actsdiv) {
            var $morebtn = $('<div class="cc-more">操作+</div>');
            // 绑定更多事件
            $actsdiv.append($morebtn);
            $morebtn.bind("click", function () {
                var obj = $(this);
                $(this).html("收起-");
                var objchk = $(this).parents("div.cc-checkitem");

                if (obj.hasClass("cc-moreopen")) {
                    obj.removeClass("cc-moreopen").addClass("cc-morehide").html("操作+");
                    objchk.find("div.cc-searchdiv").hide();
                } else {
                    obj.removeClass("cc-morehide").addClass("cc-moreopen").html("收起-");
                    objchk.find("div.cc-searchdiv").show();
                }
            });
            $actsdiv.css({ float: "left" });
        },
        //得到选项的Dom
        getItmesDom: function (item, pageSize) {
            var str = "";
            if (typeof item.initData === "object" && item.initData.length > 0) {
                for (var i = 0; i < item.initData.length; i++) {
                    for (var j = 0; j < item.orgData.length; j++) {
                        if (item.idVerify && item.initData[i].id === item.orgData[j].id && item.initData[i].name === item.orgData[j].name) {
                            item.orgData[j]["checked"] = true;
                            break;
                        } else if (item.initData[i].name === item.orgData[j].name) {
                            item.orgData[j]["checked"] = true;
                            break;
                        }
                    }
                }
            }

            for (var j = 0; j < item.orgData.length && j < pageSize; j++) {
                var it = item.orgData[j];
                if (it && it.name && it.name != "") {
                    if (item.multiple) {
                        if (it.checked) {
                            str += '<div class="cc-citem cc-citemChk" ccid="' + it.id + '"><input checked = "checked" type="checkbox">' + it.name + '</div>';
                        } else {
                            str += '<div class="cc-citem" ccid="' + it.id + '"><input type="checkbox">' + it.name + '</div>';
                        }
                    } else {
                        if (it.checked) {
                            str += '<div class="cc-citem cc-citemChk" ccid="' + it.id + '">' + it.name + '</div>';
                        } else {
                            str += '<div class="cc-citem" ccid="' + it.id + '">' + it.name + '</div>';
                        }
                    }
                }
            }
            return str;
        },
        //初始化多选类型dom
        initMultipleDom: function ($muldiv) {
            //多选追加事件
            var $mulAllbtn = $('<div class="cc-btn">全选</div>');
            var $mulOppbtn = $('<div class="cc-btn">反选</div>');
            var $mulOKbtn = $('<div class="cc-btn cc-btnAct">确定</div>');
            var $mulNObtn = $('<div class="cc-btn">重选</div>');
            $muldiv.append($mulAllbtn).append($mulOppbtn).append($mulNObtn).append($mulOKbtn);
            $mulAllbtn.bind("click", function () {
                var $objchk = $(this).parents("div.cc-checkitem");
                $objchk.find('input[type="checkbox"]').prop("checked", true);
                $objchk.find('input[type="checkbox"]').parent().addClass("cc-citemChk");
            })
            $mulOppbtn.bind("click", function () {
                var $objchk = $(this).parents("div.cc-checkitem");
                $.each($objchk.find('input[type="checkbox"]'), function (i, item) {
                    $(item).prop("checked", !$(item).prop("checked"));
                    if ($(item).prop("checked")) {
                        $(item).parent().addClass("cc-citemChk");
                    } else {
                        $(item).parent().removeClass("cc-citemChk");
                    }
                });
            })
            $mulOKbtn.bind("click", function () {
                ccChoiceDom.doMultiple($(this).parents("div.cc-checkitem"));
            })
            $mulNObtn.bind("click", function () {
                var $objchk = $(this).parents("div.cc-checkitem");
                $objchk.find('input[type="checkbox"]').prop("checked", false);
                $objchk.find('input[type="checkbox"]').parent().removeClass("cc-citemChk");
            })
        },
        // 设置多选类型事件
        setMultipleEvent: function ($itemsdiv) {
            // 选中选择项事件
            $itemsdiv.find('input[type="checkbox"]').bind("change", function () {
                var $curObj = $(this).parent();
                if ($(this).prop("checked")) {
                    $curObj.addClass("cc-citemChk");
                } else {
                    $curObj.removeClass("cc-citemChk");
                }
                var $objchk = $(this).parents("div.cc-checkitem");
                var set = $objchk.data("chkItemSet");
                if (set.callback.onChoice && set.callback.onChoice instanceof Function) {
                    set.callback.onChoice({ type: set.type, checked: $(this).prop("checked"), multiple: set.multiple, name: set.name, value: $curObj.text(), id: $curObj.attr("ccid") });
                }
            });
        },
        //设置单选类型事件
        setSingleEvent: function ($itemsdiv) {
            // 选中选择项事件
            $itemsdiv.find(".cc-citem").bind("click", function () {
                var $objchk = $(this).parents("div.cc-checkitem");
                var set = $objchk.data("chkItemSet");
                if (set.callback.onChoice && set.callback.onChoice instanceof Function) {
                    set.callback.onChoice({ type: set.type, checked: true, multiple: set.multiple, name: set.name, value: $(this).text(), id: $(this).attr("ccid") });
                }
                $objchk.find("div.cc-citemChk").removeClass("cc-citemChk");
                $(this).addClass("cc-citemChk");
                ccChoiceDom.doSingle($(this).parents("div.cc-checkitem"));
            });
        },
        initInput: function (item, $optionsdiv) {
            var $inputdiv = $('<div class="cc-searchdiv"></div>');
            var $input = $('<input class="cc-input" />');
            var $inputbtn = $('<div class="cc-btn cc-btnAct">确定</div>');
            if (typeof item.initData === "string" && item.initData !== "") {
                $input.val(item.initData);
            } else if (typeof item.initData === "object" && item.initData.length > 0 && item.initData[0].name !== "") {
                $input.val(item.initData[0].name);
            }
            $inputdiv.append($input).append($inputbtn);
            $optionsdiv.append($inputdiv);
            $inputbtn.bind("click", function () { // 确定输入
                ccChoiceDom.doInput($(this).parents("div.cc-checkitem"));
            });
        }
    }
    $.fn.condControl = function (method) {
        if (typeof method === "string" && methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method：' + method + 'does not exist on jQuery.commonSelect');
        }
    }
})(jQuery);