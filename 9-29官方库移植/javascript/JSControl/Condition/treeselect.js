(function ($) {
    "use strict";
    $.treeSel = $.treeSel || {};
    $.extend($.treeSel, {
        defaults: {},
        dom: {
            checkTxt: { text: "已选条件", width: 10, css: {} },
            clearBtn: { text: "×", title: "清除", defaultcss: { width: 10, position: "absolute", right: 0, top: "3px", "color": "red", "text-align": "left", "cursor": "pointer", "font-size": "12px", "font-weight": "bolder" }, css: { width: 10 } },
            openBtn: { text: "+", title: "展开", defaultcss: { width: 16, height: "100%", position: "absolute", right: 0, top: 0, "background-color": "#F4F4F4", "color": "#0000ff", "font-size": "16px", "font-weight": "bolder", "cursor": "pointer", "text-align": "center" }, css: {} },
            hideBtn: { text: "-", title: "缩起" },
        },
        css: {
            backgroundcolor: "#fff",
            treeul: { margin: "0px", padding: "2px 0px", border: "1px solid #AED0EA", "border-top": "0px", background: "#f0f6e4", height: "280px", "overflow-y": "scroll", "overflow-x": "auto" }
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

    $.treeSel = $.treeSel || {};
    $.extend($.treeSel, {
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
            return this.getAccessor($.fn.treeSelect, name);
        },
        //自定义扩展方法
        extend: function (methods) {
            $.extend($.fn.treeSel, methods);
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
            $.treeSel.dom.clearBtn["showcss"] = $.extend(true, $.treeSel.dom.clearBtn.defaultcss, $.treeSel.dom.clearBtn.css);
            $.treeSel.dom.openBtn["showcss"] = $.extend(true, $.treeSel.dom.openBtn.defaultcss, $.treeSel.dom.openBtn.css);
            $.treeSel.dom.clearBtn.showcss.right = $.treeSel.dom.openBtn.showcss.width + "px";

            opt = $.extend(true, $.treeSel, {
                width: 0,
                height: 20,
                bgColor: "#FFF",
                multiple: false,
                showLine: true,
                orgNode: [],
                initNode: [],
                mustSel: false   //是否是必选项
            }, opt);

            return opt;
        }
    }

    var methods = {
        init: function (opt) {
            var $obj = $(this);
            if ($obj.length == 0 || $obj[0].tagName.toUpperCase() !== 'DIV') {
                $.treeSel.doException("Element is not a div", 3);
                return false;
            }
            if ($obj[0].id == '' || $obj[0].id == 'undefind') {
                $.treeSel.doException("Element  未指定ID", 3);
                return false;
            }

            this.opt = methodsHelp.initOpt(opt);

            if (this.opt.width == 0) {
                this.opt.width = $obj.width() > 0 ? $obj.width() - 2 : 120;
            }
            /// 初始化设置
            this.opt["id"] = $obj[0].id;
            this.opt["treeid"] = "treeul" + $obj[0].id + "";

            this.$parent = $('<div class="ms-treeparent"></div>');
            this.$choice = $('<div class="ms-treechoice"></div>');
            this.$seltext = $('<span></span>');
            this.$clear = $('<div class="del-treeSel" title="' + $.treeSel.dom.clearBtn.title + '">' + $.treeSel.dom.clearBtn.text + '</div>');
            this.$onoff = $('<div class="on-off" title="' + $.treeSel.dom.openBtn.title + '">' + $.treeSel.dom.openBtn.text + '</div>')
            this.$dropDiv = $('<div class="ms-droptreediv" style="float:left;"></div>');
            //this.$droptreeAct = $('<div class="ztree">全选  关闭</div>');
            this.$droptree = $('<ul class="ztree" id="' + this.opt["treeid"] + '"></ul>');

            this.$parent.css({ float: "left", height: "100%", position: "relative" });
            this.$choice.css({ width: this.opt.width, height: "100%", position: "relative" });
            this.$seltext.css({ width: (this.opt.width - $.treeSel.dom.openBtn.showcss.width), height: "100%", overflow: "hidden", display: "block", "text-indent": "5px", "font-size": "12px", "line-height": "20px" });
            this.$clear.css($.treeSel.dom.clearBtn.showcss).hide();
            this.$onoff.css($.treeSel.dom.openBtn.showcss);
            this.$droptree.css($.treeSel.css.treeul).width(this.opt.width);

            this.$choice.append(this.$seltext).append(this.$clear).append(this.$onoff);
            this.$dropDiv.append(this.$droptree);
            this.$parent.append(this.$choice).append(this.$dropDiv);
            $obj.html(this.$parent);
            $obj.css({ width: this.opt.width, height: this.opt.height, border: "1px solid #E5e5e5", "background-color": this.opt.bgColor })
            this.$dropDiv.css({ "z-index": "999" }).offset({ top: 0, left: 0 }).hide();
            // 存放以后操作可能用到的属性。
            $obj.data({ selectMul: this.opt.multiple, mustSel: this.opt.mustSel, treeid: this.opt["treeid"] });
            var $objTree = $.fn.zTree.init(this.$droptree, {
                view: {
                    selectedMulti: false,
                    showLine: true,
                    showIcon: function (treeId, treeNode) {
                        return treeNode.isParent;
                    }
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                callback: {
                    onClick: treeEvent.onClick,
                    onCheck: treeEvent.onCheck
                },
                check: {
                    enable: this.opt.multiple
                }
            }, this.opt.orgNode);
            if (this.opt.orgNode.length < 50) $objTree.expandAll(true);

            if (this.opt.mustSel && this.opt.initNode.length == 0 && this.opt.orgNode.length > 0) {
                this.opt.initNode.push(opt.orgNode[0]);
            }
            if (this.opt.initNode.length > 0) {
                $obj.treeSelect("setSelResults", opt.initNode);
            }
            this.$choice.bind("click", function () {
                var $obj = $(this).parent().parent();
                var treediv = $obj.find("div.ms-droptreediv");
                if ($obj.hasClass("ms-showtreeDiv")) {
                    $obj.removeClass("ms-showtreeDiv").addClass("ms-hidetreeDiv");
                    $obj.find(".ms-treechoice").find("div.on-off").html($.treeSel.dom.openBtn.text).attr("title", $.treeSel.dom.openBtn.title);
                    treediv.offset({ top: 0, left: 0 }).hide();
                } else {
                    $obj.removeClass("ms-hidetreeDiv").addClass("ms-showtreeDiv");
                    $obj.find(".ms-treechoice").find("div.on-off").html($.treeSel.dom.hideBtn.text).attr("title", $.treeSel.dom.hideBtn.title);
                    var xy = $(this).parent("div.ms-treeparent");
                    treediv.offset({ top: xy.offset().top + xy.outerHeight() - 1, left: xy.offset().left - 1 }).show();
                }
            });

            this.$choice.hover(function () {
                var $obj = $(this).parent().parent();
                var $span = $(this).find("span").eq(0);
                $obj.css({ border: "1px solid #AED0EA" });
                $span.width($span.width() - $.treeSel.dom.clearBtn.showcss.width - 1);
                $(this).find("div.on-off").css({ "text-shadow": "1px 1px 1px #e5e5e5" });
                if ($span.text() != "") {
                    $(this).find("div.del-treeSel").show();
                }
            },
            function () {
                var $obj = $(this).parent().parent();
                var $span = $(this).find("span").eq(0);
                $span.width($span.width() + $.treeSel.dom.clearBtn.showcss.width + 1);
                $obj.css({ border: "1px solid #ccc" });
                $(this).find("div.on-off").css({ "text-shadow": "0px 0px 0px #F4F4F4" });
                $(this).find("div.del-treeSel").hide();

            });

            this.$clear.bind("click", function () {
                var $obj = $(this).parent().parent().parent();
                $obj.treeSelect("setSelResults", []);
                return false;
            });

            $('body').click(function (e) {
                if ($(e.target).parents('div.ms-treeparent').length > 0) {
                    var tsCnt = $('div.ms-showtreeDiv').length;
                    if (tsCnt > 1) {
                        var targetid = $(e.target).parents('div.ms-treeparent').parent()[0].id;
                        $("div.ms-showtreeDiv").each(function (i, item) {
                            if ($(this)[0].id && $(this)[0].id == targetid) {
                            } else {
                                $(this).removeClass("ms-showtreeDiv").addClass("ms-hidetreeDiv");
                                $(this).find("div.ms-droptreediv").offset({ top: 0, left: 0 }).hide();
                                $(this).parent().find("div.ms-treechoice").find("div.on-off").html($.treeSel.dom.openBtn.text).attr("title", $.treeSel.dom.openBtn.title);
                            }
                        })
                    }
                    return;
                }
                if ($(".ms-showtreeDiv").length > 0) {
                    $(".ms-showtreeDiv").each(function () {
                        $(this).removeClass("ms-showtreeDiv").addClass("ms-hidetreeDiv");
                        $(this).find("div.ms-droptreediv").offset({ top: 0, left: 0 }).hide();
                        $(this).parent().find("div.ms-treechoice").find("div.on-off").html($.treeSel.dom.openBtn.text).attr("title", $.treeSel.dom.openBtn.title);
                    })
                }
            });
            return $obj;
        },
        getSelResults: function () {
            return $(this).data("chkNode") || [];
        },
        getSelNames: function () {
            var nodes = $(this).data("chkNode") || [];
            var chkNodeName = [];
            $.each(nodes, function (i, item) {
                if (item.name && item.name != "")
                    chkNodeName.push(item.name);
            });
            return chkNodeName;
        },
        getSelIds: function () {
            var nodes = $(this).data("chkNode") || [];
            var chkNodeId = [];
            $.each(nodes, function (i, item) {
                if (item.name && item.name != "")
                    chkNodeId.push(item.id);
            });
            return chkNodeId;
        },
        setSelResults: function (curData) {
            var initName = "";
            var isMul = $(this).data("selectMul");
            if (curData && curData.length > 0) {
                if (isMul) {
                    var initNode = [];
                    $.each(curData, function (i, item) {
                        var ischk = (item.isParent == undefined || item.isParent == false) && item.name && item.name != "";
                        if (ischk) {
                            if (initName != "") {
                                initName += ",";
                            }
                            initName += item.name;
                            initNode.push(item)
                        }
                    });
                    $(this).data("chkNode", initNode);
                } else {
                    initName = curData[0].name || "";
                    $(this).data("chkNode", [curData[0]]);
                }
                $(this).find("span").eq(0).html(initName).prop("title", initName);
            } else {
                $(this).find("span").eq(0).html("").prop("title", "");
                $(this).data("chkNode", []);
                var treeid = $(this).data("treeid");
                if (treeid && treeid !== "") {
                    var treeObj = $.fn.zTree.getZTreeObj(treeid);
                    if (isMul) {
                        treeObj.checkAllNodes(false);
                    }
                    treeObj.cancelSelectedNode();
                }
            }
        }
    };
    var treeDom = {
        open: function () {
        },
        close: function () {
        }
    }
    var treeEvent = {
        onClick: function (event, treeId, treeNode) {
            var $obj = $("#" + treeId).parent().parent().parent();
            var isMul = $obj.data("selectMul");
            if (isMul) {
            } else {
                $obj.data("chkNode", [treeNode])
                $obj.find("span").eq(0).html(treeNode.name).prop("title", treeNode.name);
                //$obj.removeClass("ms-showtreeDiv").addClass("ms-hidetreeDiv").find("div.ms-droptreediv").offset({ top: 0, left: 0 }).hide();
            }
        },
        onCheck: function (event, treeId, treeNode) {
            var $obj = $("#" + treeId).parent().parent().parent();
            var isMul = $obj.data("selectMul");
            if (isMul) {
                var treeObj = $.fn.zTree.getZTreeObj(treeId);
                var nodes = treeObj.getCheckedNodes(true);
                var chkNode = [];
                var names = "";
                $.each(nodes, function (i, item) {
                    if (!item.isParent) {
                        chkNode.push(item);
                        if (names != "") { names += ","; }
                        names += item.name;
                    }
                });
                $obj.data("chkNode", chkNode)
                $obj.find("span").eq(0).html(names).prop("title", names);
            }
        }
    }

    $.fn.treeSelect = function (method) {
        if (typeof method === "string" && methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method' + method + 'does not exist on jQuery.commonSelect');
        }
    }
})(jQuery);