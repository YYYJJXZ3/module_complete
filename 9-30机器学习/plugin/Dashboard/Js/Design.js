ajaxPath = {
    design: "handler/DashBoart.ashx",
    tree: {
        create: 'Js/help/create.txt',
        evaluate: "Js/help/evaluate.txt",
        treeSelect: "Js/help/treeSelect.txt",
        url: "Js/help/url.txt",
        report: "Js/help/report.txt",
        levelname: "Js/help/levelname.txt",
        addurl: "Js/help/addurl.txt"
    }
};
var layout = {
    query: 'dashboard-query',
    layout: 'dashboard-layout',
    all: 'dashboard_all',
    time: ["日", "月", "周", "季度", "半年", "年"],
    hour: ["小时"]
};

var initDom =
{
    init: function () {
        $("#" + layout.query).data("datasource", {});
        jsTools.event();
        initDom.openclose("treeD");
        initDom.openclose("treeR");
        initDom.RefreshBody();
        initDom.getReportTree();
        initDom.getDashboard();
        $("#btnShowPageSetting").click(function () {
            save.preview();
        });
        $("#btnReportTreeSearch").click(function () {
            initDom.getReportTree();
        });
        $("#btnDDTreeSearch").click(function () {
            initDom.getDashboard();
        });
        $("#txtLayout").click(function () {
            initDom.newRpt();
        });
        $(window).resize(function () {
            initDom.RefreshBody();
        });
        $("#btnSavaAct").click(function () {
            save.init();
        });
        $("#btnSaveOne").click(function () {
            save.init("a");
        });
    },
    openclose: function (div) {
        $("#" + div).find("input.btn_close").eq(0).click(function () {
            initDom.close(div);
            initDom.RefreshBody();
        });
        $("#" + div).find("input.btn_open").eq(0).click(function () {
            initDom.open(div);
            initDom.RefreshBody();
        });
    },
    open: function (div) {
        $("#" + div).find("div.treebody").eq(0).show();
        $("#" + div).find("div.treeact1").eq(0).hide();
    },
    close: function (div) {
        $("#" + div).find("div.treeact1").eq(0).show();
        $("#" + div).find("div.treebody").eq(0).hide();
    },
    RefreshBody: function () {
        var docwh = jsTools.getDocumentWH();
        var layoutwidth = docwh.WinW - $(".dashboard_body_left").width() - 10;
        var bheight = docwh.WinH - $(".dashboard_head").height() - 4;
        var layouHeight = bheight - 160;
        $(".dashboard_body").css({
            height: bheight
        });
        $(".treebody").css({
            height: bheight
        });
        $(".dashboard-query").css({
            width: layoutwidth,
            height: 150
        });
        $(".dashboard-layout").css({
            width: layoutwidth,
            height: layouHeight
        });
    },
    //得到报表
    getReportTree: function () {
        dss.ajax({
            url: ajaxPath.design,
            data: {
                act: 'getreporttree',
                key: $("#txtReportTreeSearch").val()
            },
            success: function (data) {
                DataTree.Init(data);
            }
        });
    },
    //得到目录
    getDashboard: function () {
        dss.ajax({
            url: ajaxPath.design,
            data: {
                act: 'getdashboardtree',
                key: $("#txtDDTreeSearch").val()
            },
            success: function (data) {
                DashboradTree.Init(data);
            }
        });
    },
    newfolder: function (id, nodetype) {
        dss.ajax({
            url: ajaxPath.tree.create,
            dataType: 'text',
            success: function (data) {
                dss.dialog({
                    content: data,
                    title: '创建文件夹',
                    open: function () {
                        $("#txtFileName").val("");
                    },
                    buttons: {
                        '确定': function () {
                            var obj = $(this);
                            dss.ajax({
                                url: ajaxPath.design,
                                data: {
                                    act: 'createfile',
                                    desc: $("#txtFileName").val(),
                                    parent: id
                                },
                                success: function (data) {
                                    dss.alert(data.message, function (type) {
                                        if (type == "1") {
                                            initDom.getDashboard();
                                        }
                                    }, "提示信息", data.result, "", 1500);
                                }
                            })
                        },
                        '取消': function () {
                            $(this).dialog("close");
                        }
                    }
                })
            }
        })
    },
    reName: function (id, nodetype, name, pid) {
        dss.ajax({
            url: ajaxPath.tree.create,
            type: 'get',
            dataType: 'text',
            success: function (data) {
                dss.dialog({
                    content: data,
                    title: '重命名',
                    open: function () {
                        $("#txtFileName").val(name);
                    },
                    buttons: {
                        '确定': function () {
                            var obj = $(this);
                            dss.ajax({
                                url: ajaxPath.design,
                                data: {
                                    act: 'rename',
                                    name: $("#txtFileName").val(),
                                    pid: id,
                                    id: id,
                                    type: nodetype
                                },
                                success: function (data) {
                                    dss.alert(data.message, function (type) {
                                        if (type == "1") {
                                            initDom.getDashboard();
                                        }
                                    }, "提示信息", data.result, "", 1500);
                                }
                            })
                        },
                        '取消': function () {
                            $(this).dialog("close");
                        }
                    }
                })
            }
        })
    },
    newRpt: function () {
        dss.ajax({
            url: ajaxPath.design + "?act=getlayout",
            cache: true,
            success: function (data) {
                var dom = "<div style=\"width: 470px; height: 300px; overflow-y: scroll\" id=\"divlayor\">";
                var layName = $("#txtLayout").val();
                var actRecords = {};
                $.each(data, function (i, item) {
                    dom += "<div class=\"layimg\" contorlurl=\"" + item.ContorlUrl + "\" contorlname=\"" + item.Desc + "\">";
                    dom += "<ul><li><img src=\"" + item.ImgUrl + "\" width=\"173\" height=\"100\"></li>";
                    var c = "btn_notcheck";
                    if (layName.length > 0) {
                        if (layName == item.Desc) {
                            c = "btn_check";
                            actRecords["LayoutDesc"] = item.Desc;
                            actRecords["LayoutUrl"] = item.ContorlUrl;
                        }
                    }
                    else {
                        if (i == data.length - 1) {
                            c = "btn_check";
                            actRecords["LayoutDesc"] = item.Desc;
                            actRecords["LayoutUrl"] = item.ContorlUrl;
                        }
                    }
                    dom += "<li><span>" + item.Desc + "</span><input class=\"" + c + "\"></li></ul></div>";
                });
                dom += "</div>";
                $("#" + layout.all).data("datasource", actRecords);
                dss.dialog({
                    content: dom,
                    title: '选择布局',
                    width: 490,
                    height: 320,
                    buttons: {
                        '确定': function () {
                            $("#" + layout.query).data("datasource", {}).empty();
                            $("#txtLayout").data("dashboardid", "");
                            initDom.getLayoutDom(actRecords);
                        }
                    },
                    open: function () {
                        $("#divlayor").find("div.layimg").each(function () {
                            $(this).click(function () {
                                initDom.CheckLayout($(this));
                            })
                        });
                    }
                })
            }
        });
    },
    editRpt: function (id, nodetype) {
        DashboradTree.DashboradEdit(id);
    },
    del: function (id, nodetype) {
        dss.confirm("您确认要删除文件？", function () {
            dss.ajax({
                url: ajaxPath.design,
                data: {
                    act: 'deletedashboard',
                    nodetype: nodetype,
                    key: id
                },
                success: function (data) {
                    if (data.result == "1") {
                        initDom.getDashboard();
                    }
                }
            })
        }, null, "提示信息");
    },
    CheckLayout: function (obj) {
        var objcheck = $("#divlayor .btn_check");
        if (objcheck.length > 0) {
            objcheck.removeClass("btn_check");
            objcheck.addClass("btn_notcheck");
        }
        obj.find("input").removeClass("btn_notcheck");
        obj.find("input").addClass("btn_check");
        var actRecords = $("#" + layout.all).data("datasource");
        actRecords["LayoutUrl"] = obj.attr("contorlurl");
        actRecords["LayoutDesc"] = obj.attr("contorlname");
        $("#" + layout.all).data("datasource", actRecords);
    },
    getLayoutDom: function (actRecords, isEdit) {
        $("#txtLayout").val(actRecords.LayoutDesc);
        $.ajax({
            url: dss.rootPath + "plugin/Dashboard/" + actRecords.LayoutUrl,
            dataType: 'html',
            success: function (data) {
                $("#" + layout.layout).html(data).css({
                    border: "0px"
                });
                $("#" + layout.layout + " .report").css(
                    {
                        border: "1px solid #cccccc",
                        "overflow-y": 'auto'
                    });
            },
            complete: function () {
                if (isEdit) {
                    var data = $("#" + layout.all).data("datasource");
                    if (data.DashboardRelations.length > 0) {
                        $.each(data.DashboardRelations, function (i, item) {
                            var treeNode = {
                                id: item.ReportID,
                                name: item.DivDesc,
                                showGrid: false,
                                showChart: false
                            };
                            if (item.DivID == "grid") {
                                treeNode.showGrid = true;
                            }
                            else if (item.DivID == "chart") {
                                treeNode.showChart = true;
                            }
                            else {
                                treeNode.showChart = true;
                                treeNode.showGrid = true;
                            }
                            var obj = $("#" + item.LayoutDivID);
                            obj.data("datacondition", item.JumpUrlSet);
                            ActLayout.Data2Layout(obj, treeNode, data.Conditions);
                        });
                    }
                }
            }
        })
    }
}
var DataTree = {
    errorMsg: "放错了...请选择正确的类别！",
    curTarget: null,
    curTmpTarget: null,
    Init: function (data) {
        var setting = {
            edit: {
                enable: true,
                showRemoveBtn: false,
                showRenameBtn: false,
                drag: {
                    prev: false,
                    next: false,
                    inner: false
                }
            },
            data: {
                keep: {
                    parent: true,
                    leaf: true
                },
                simpleData: {
                    enable: true
                }
            },
            callback: {
                beforeDrag: function (treeId, treeNodes) {
                    return !treeNodes[0].isParent;
                },
                onDrop: DataTree.dropTree2Dom
            },
            view: {
                selectedMulti: false
            }
        };
        $.fn.zTree.init($("#treeReport"), setting, data);
    },
    dropTree2Dom: function (e, treeId, treeNodes, targetNode, moveType) {
        var obj = $(e.target);
        if (moveType == null) {
            if (obj.parents(".report").attr("isreport") === "true") {
                obj = obj.parents(".report");
            }

            if (obj.attr("isreport") == "true") {
                var oldDom = $("div[domId=" + treeNodes[0].id + "]");
                if (oldDom.length > 0) {
                    dss.alert("已经使用过的报表数据！");
                    return false;
                }
                ActLayout.Data2Layout(obj, treeNodes[0], null);
            }
            else {
                dss.alert(DataTree.errorMsg);
            }
        }
    }
};
var DashboradTree = {
    Init: function (data) {
        //@报表树 设置和初始化  begin
        var setting1 = {
            view: {
                selectedMulti: false
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                onRightClick: DashboradTree.RightClick,
                onClick: DashboradTree.NodeClick
            }
        };
        DBzTree = $.fn.zTree.init($("#treeDD"), setting1, data);
        DBzTree.expandAll(true);
        $("#treeDD").data("treeSource", data);
    },
    DashMenu: function (top, left, menuArr) {
        var $div;
        if ($("#rMenu").length > 0) {
            $("#rMenu").remove();
        }
        $div = $("<div id=\"rMenu\" class=\"ca_menu\"></div>");
        $div.attr("style", "visibility: visible; top: " + top + "px; left: " + left + "px;");
        var $ul = $("<ul style=\"padding: 2px;\"></ul>")
        if (typeof menuArr == 'object' && menuArr.length > 0) {
            $.each(menuArr, function (index, item) {
                var $li = $("<li></li>");
                var $input = $("<input type=\"button\" class=\"" + item.className + "\" />");
                var click = item.clickName;
                $li.append($input).append(" " + item.name);
                $li.click(function () {
                    click();
                });
                $ul.append($li)
            });
        }
        $div.append($ul);
        $(document.body).append($div);
        $(document.body).click(function () {
            $div.remove();
        })
    },
    RightClick: function (event, treeId, treeNode) {
        if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
            DBzTree.cancelSelectedNode();
            DashboradTree.MenuShow("0", event.clientX, event.clientY);
        } else if (treeNode && !treeNode.noR) {
            DBzTree.selectNode(treeNode);
            var rMenuWidth = 95;
            var rMenuHeight = 330;
            var treeMaxWidth = 220;
            var treeMaxHeight = screen.height;
            var x = event.clientX;
            var y = event.clientY;
            if (x + rMenuWidth > treeMaxWidth) {
                x = treeMaxWidth - rMenuWidth;
            }
            if (y + rMenuHeight > treeMaxHeight) {
                y = treeMaxHeight - rMenuHeight;
            }
            DashboradTree.MenuShow(treeNode, x, y, treeNode.id);
        }
    },
    NodeClick: function (event, treeId, treeNode) {
        if (treeNode.nodetype == 3) {
            DashboradTree.DashboradEdit(treeNode.id);
            $("#txtLayout").data("dashboardid", treeNode.id);
        }
    },
    DashboradEdit: function (id) {
        $("#" + layout.query).data("datasource", {});
        dss.ajax({
            url: ajaxPath.design,
            data: {
                act: 'getdashboard',
                key: id
            },
            success: function (data) {
                $("#" + layout.all).data("datasource", data);
                initDom.getLayoutDom(data, true);
            }
        });
    },
    MenuShow: function (treeNode, x, y, treeid) {
        var arr = [];
        var rename = {
            name: '重命名',
            className: 'ca_menu_rename',
            clickName: function () {
                initDom.reName(treeNode.id, nodetype, treeNode.name, treeNode.pId);
            }
        }, del =
         {
             name: '删除',
             className: 'ca_menu_del',
             clickName: function () {
                 initDom.del(treeNode.id, nodetype);
             }
         }, newfile = {
             name: '新建文件',
             className: 'ca_menu_folder',
             clickName: function () {
                 initDom.newfolder(treeNode.id, nodetype);
             }
         }, create = {
             name: '新建报表',
             className: 'ca_menu_rpt',
             clickName: function () {
                 initDom.newRpt();
             }
         }, edit = {
             name: '编辑报表',
             className: 'ca_menu_modify',
             clickName: function () {
                 initDom.editRpt(treeNode.id, nodetype);
             }
         }, preview = {
             name: '预览报表',
             className: 'ca_menu_modify',
             clickName: function () {
                 var url = dss.rootPath + "PlugIn/Dashboard/View.html?dashboardId=" + treeNode.id;
                 dss.openPageInTab(treeNode.name, url);
             }
         }, createView = {
             name: '生成代码',
             className: 'ca_menu_modify',
             clickName: function () {
                 $.ajax({
                     url: 'Js/help/module.txt',
                     type: 'get',
                     dataType: 'text',
                     success: function (data) {
                         $.ajax({
                             url: dss.rootPath + 'plugin/Dashboard/' + treeNode.urlType,
                             type: 'get',
                             dataType: 'text',
                             success: function (dataSource) {
                                 data = data.replace("[$id$]", treeNode.id);
                                 data = data.replace("[$html$]", dataSource);
                                 dss.dialog({
                                     width: 600,
                                     height: 380,
                                     title: '生成代码',
                                     content: "<pre id=\"txtHtml\" style='height:380px;width:600px;overflow:scroll'></pre>",
                                     open: function () {
                                         $("#txtHtml").text(data);
                                     },
                                     buttons: {
                                         "复制": function () {
                                             jsTools.copyToClipboard(data);
                                             return false;
                                         },
                                         "关闭": function () {
                                             $(this).dialog("close");
                                         }
                                     }
                                 });
                             }
                         })
                     }
                 })
             }
         };
        var nodetype = treeNode.nodetype;
        if (nodetype == "1") {
            arr.push(newfile);
            arr.push(create);
        }
        else if (nodetype == "2") {
            arr.push(newfile);
            arr.push(create);
            arr.push(rename);
            if (treeNode.children == undefined || treeNode.children.length <= 0) {
                arr.push(del);
            }
        }
        else {
            arr.push(edit);
            arr.push(preview);
            arr.push(createView);
            if (!treeNode.isPub) {
                arr.push(rename);
                arr.push(del);
            }
        }
        DashboradTree.DashMenu(y, x, arr);
    }
};
var ActLayout = {
    Data2Layout: function (obj, treeNode, conditions) {
        if (obj.attr("isHave") == "1") {
            dss.alert("已经拥有报表数据！");
            return false;
        }
        else {
            obj.attr("isHave", "1")
        }
        ActLayout.addDom(obj, treeNode);
        ActLayout.setCondition(obj, treeNode, conditions);
    },
    addDom: function (obj, treeNode) {
        var showtype = ""; imgsrc = "";
        if (treeNode.showGrid === true && !treeNode.showChart) {
            showtype = "grid";
            imgsrc = "layout/img/r_grid.jpg"
        } else if (!treeNode.showGrid && treeNode.showChart) {
            showtype = "chart";
            imgsrc = "layout/img/r_chart.jpg"
        }
        else {
            showtype = "chartgrid";
            imgsrc = "layout/img/cg.jpg"
        }
        var $dom = $("<div class='domBtn'></div>");
        $dom.attr("domId", treeNode.id)
        .attr("reportid", treeNode.id)
        .attr("showtype", showtype)
        .attr("reportname", treeNode.name);
        var $ul = $("<ul></ul>");
        var $liOne = $("<li><lable>" + treeNode.name + "</lable></li>");
        var $pan = $("<span></span>")
        var $set = $("<input type='button' class='btn_set'/>");
        $set.click(function () {
            setJump.init(treeNode.id, obj, treeNode.name);
        });
        var $del = $("<input type='button' class='btn_delete'/>");
        $del.click(function () {
            obj.attr("isHave", "0");
            obj.empty();
            var source = $("#" + layout.query).data("datasource");
            if (source != undefined) {
                if (source[treeNode.id] != undefined) {
                    delete source[treeNode.id];
                    $("#" + layout.query).data("datasource", source);
                }
            }
            ActLayout.createCondition(null);
        });
        var $liTwo = $("<li><img src='" + imgsrc + "'  /></li>");
        $pan.append($set).append($del);
        $liOne.append($pan);
        $ul.append($liOne).append($liTwo);
        $dom.append($ul);
        obj.append($dom);
    },
    setCondition: function (obj, treeNode, conditions) {
        var divObj = $("#" + layout.query);
        var source = divObj.data("datasource");
        dss.ajax({
            url: ajaxPath.design,
            data: {
                act: 'GetReportDim',
                rid: treeNode.id
            },
            success: function (data) {
                if (source[treeNode.id] == undefined) {
                    source[treeNode.id] = data;
                }
                divObj.data("datasource", source);
                ActLayout.createCondition(conditions);
            }
        })
    },
    createCondition: function (conditions) {
        var arrCross = [];
        var allObj = $("#" + layout.query);
        allObj.empty();
        if (conditions != null && conditions.length > 0) {
            arrCross = conditions;
        }
        else {
            var source = allObj.data("datasource");
            var arrAll = [];
            $.each(source, function (i, item) {
                if (item != undefined) {
                    arrAll.push(item);
                }
            });
            if (arrAll.length > 0) {
                arrCross = arrAll[0];
                if (arrAll.length > 1) {
                    for (var i = 1; i < arrAll.length; i++) {
                        arrCross = arrCross.cross(arrAll[i]);
                    }
                }
            }
        }
        $.each(arrCross, function (i, item) {
            if (item.IsMeasure != 1) {
                var obj = allObj.find("ul[dimid='" + item.DimensionID + "']");
                if (obj.length <= 0) {
                    var all = ActLayout.createobj(item);
                    allObj.append(all);
                }
                else {
                    if (layout.time.indexOf(item.LevelName) < 0) {
                        if (obj.attr("levlename") != item.LevelName) {
                            var all = ActLayout.createobj(item);
                            allObj.append(all);
                        }
                    }
                }
            }
        });
        allObj.sortable();
    },
    createobj: function (option) {
        var showType = {
            date: "<option value='0'>时间点</option><option value='1'>时间段</option>",
            hour: "<option value='2'>单选</option><option value='3'>多选</option>",
            ne: "<option value='2'>单选</option><option value='3'>多选</option><option value='5'>手动输入</option>"
        };
        var valType = {
            single: "<option value='0'>等于</option>",
            multip: "<option value='1'>包括</option>",
            range: "<option value='2'>包括</option>"
        };
        var $div = $("<div class=\"listdim\"></div>");
        var $ul = $("<ul></ul>");
        $ul.attr("dimtype", option.DimensionType)
        .attr("dimid", option.DimensionID)
        .attr("dimname", option.DimensionName)
        .attr("levlename", option.LevelName)
        .attr("isuse", option.IsUse)
        .attr("showname", option.ShowName)
        .attr("hierarchie", option.HierarchieName);
        var $liOne = $("<li><input class=\"btn_check\" title=\"点击禁用&#10目前状态：启用\" type=\"button\"></li>");
        if (option.IsUse == false) {
            $liOne = $("<li><input class=\"btn_notcheck\" title=\"点击启用&#10目前状态：禁用\" type=\"button\"></li>");
        }
        if (layout.time.indexOf(option.LevelName) == -1) {
            $liOne.click(function () {
                var objinput = $(this).find("input").eq(0);
                if (objinput.hasClass("btn_check")) {
                    objinput.removeClass("btn_check")
                    .addClass("btn_notcheck")
                    .attr("title", "点击启用\r目前状态：禁用");
                    $ul.attr("isuse", false);
                }
                else {
                    objinput.removeClass("btn_notcheck")
                    .addClass("btn_check")
                    .attr("title", "点击禁用\r目前状态：启用");
                    $ul.attr("isuse", true);
                }
            });
        }
        var $liTwo = $("<li>标签名：<input style=\"width: 40px;\" value=\"" + option.LableName + "\"></li>");
        var $liThree = $("<li><span>过滤方式：</span></li>");
        var $selOne = $("<select style=\"width: 80px;\"></select>");
        $liThree.append($selOne);
        var $liFour = $("<li><span>值类型：</span></li>");
        var $selTwo = $("<select style=\"width: 60px;\">" + valType.single + "</select>");
        $liFour.append($selTwo);
        var $liFive = $("<li><span>默认值：</span></li>");
        var $input = $("<input style=\"width: 60px;\" readonly=\"readonly\" />");
        $liFive.append($input);
        if (option.DimensionType == "0") {
            $selOne.append(showType.date);
        }
        else if (option.DimensionType == "1") {
            $selOne.append(showType.hour);
        }
        else {
            $selOne.append(showType.ne);
        }
        $selOne.change(function () {
            var value = $(this).val();
            $selTwo.empty();
            if (value == "0" || value == "2") {
                $selTwo.append(valType.single);
            }
            else if (value == "1") {
                $selTwo.append(valType.range);
            }
            else {
                $selTwo.append(valType.multip);
            }
        });
        $selOne.val(option.ShowType);
        $selTwo.val(option.ValType);
        $input.val(option.DefaultValue)
        .data("getSelect", {
            data: option.DefaultValue,
            type: option.PresentType
        });

        var $liSex = $("<li><span>合并维度：</span></li>");
        var $inputThree = $("<input style=\"width: 60px;\" readonly=\"readonly\" value=\"" + option.DimGroup.join(",") + "\" />");
        $liSex.append($inputThree);
        $ul.append($liOne)
            .append($liTwo)
            .append($liThree)
            .append($liFour)
            .append($liSex)
            .append($liFive);
        $input.click(function () {
            if (layout.time.indexOf(option.LevelName) == -1) {
                getdata.createPanel($selOne, option, $(this), $ul);
            }
            else {
                date.content($selOne, option, $(this), $ul, $inputThree);
            }
        });
        if (layout.time.indexOf(option.LevelName) == -1) {
            if (layout.hour.indexOf(option.LevelName) == -1) {
                var node = getdata.getNode(option.DimensionID, option.LevelName);
                if (node && node.Hierarchies.length > 0) {
                    var $liSeven = $("<li><input class=\"btn_setCom\" title=\"点击合并维度\" type=\"button\"></li>");
                    $ul.append($liSeven);
                    var lput = $liSeven.find("input").eq(0);
                    lput.click(function () {
                        dss.ajax({
                            url: ajaxPath.tree.levelname,
                            dataType: 'text',
                            success: function (data) {
                                dss.dialog({
                                    content: data,
                                    title: '层次结构',
                                    open: function () {
                                        var datas = {
                                            datasource: [],
                                            selectmode: "single",
                                            initClass: "commdata",
                                            initValues: [],
                                            zIndex: 10000
                                        };
                                        datas.datasource.push({
                                            id: "",
                                            name: ""
                                        });
                                        $.each(node.Hierarchies, function (b, c) {
                                            datas.datasource.push({
                                                id: c.Name,
                                                name: c.Name
                                            });
                                        });

                                        if ($ul.attr("hierarchie") != undefined) {
                                            datas.initValues.push({
                                                id: $ul.attr("hierarchie"),
                                                name: $ul.attr("hierarchie")
                                            });
                                        }
                                        dss.commonSelect("txtLevelName", datas);
                                    },
                                    buttons: {
                                        '确定': function () {
                                            var levelname = $("#txtLevelName").commonSelect("getSelNames");
                                            if (levelname != null && levelname.length > 0) {
                                                if (levelname[0].length > 0) {
                                                    $ul.attr("hierarchie", levelname[0]);
                                                    $.each(node.Hierarchies, function (index, item) {
                                                        if (item.Name == levelname[0]) {
                                                            $.each(item.Levels, function (i, j) {
                                                                if (j.Name != node.LevelName) {
                                                                    var $obj =
                                                                    $("#" + layout.query)
                                                                        .find("ul[dimid='" + node.DimensionID + "'][levlename='" + j.Name + "']");
                                                                    if ($obj.length > 0) {
                                                                        $inputThree.val($inputThree.val() + "," + j.Name);
                                                                        $obj.parent().remove();
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                                else {
                                                    $ul.attr("hierarchie", "");
                                                    var arrLevelname = $inputThree.val().split(",");
                                                    for (var q = 0; q < arrLevelname.length; q++) {
                                                        if (arrLevelname[q] != node.LevelName) {
                                                            var knode = getdata.getNode(option.DimensionID, arrLevelname[q]);
                                                            if (knode != null) {
                                                                var kdiv = ActLayout.createobj(knode);
                                                                $("#" + layout.query).append(kdiv);
                                                            }
                                                        }
                                                    }
                                                    $inputThree.val(node.LevelName);
                                                }
                                            }
                                        },
                                        "取消": function () {
                                            $(this).dialog("close");
                                        }
                                    }
                                })
                            }
                        });
                    });
                }
            }
            else {
                var $liSeven = $("<li><input title=\"是否默认显示小时\" type=\"checkbox\" " + (option.HasAll ? "checked=\"checked\"" : "") + " /></li>");
                $ul.append($liSeven);
            }
        }
        $div.append($ul);
        $liFour.hide();
        return $div;
    }
};
var date = {
    content: function (objSel, node, obj, ulObj, tarObj) {
        dss.ajax({
            url: 'Js/help/date.txt',
            dataType: 'html',
            success: function (data) {
                dss.dialog({
                    content: data,
                    title: '赋值',
                    buttons: {
                        "确定": function () {
                            var result = $("#tableDate").jqCheckBox("getSelect");
                            var str = "";
                            $.each(result, function (i, item) {
                                if (i == 0) {
                                    ulObj.attr("levlename", item.name);
                                }
                                str += item.name + ",";
                            });
                            if (str.length > 0) {
                                str = str.substr(0, str.length - 1);
                            }
                            tarObj.val(str);
                            var str = "";
                            if (objSel.val() == "0") {
                                var source = $("#txtTime").commonSelect("getSelResults");
                                str = (source.length > 0 ? source[0].name : "");
                            }
                            else {
                                var sourceStart = $("#txtStart").commonSelect("getSelResults");
                                var sourceEnd = $("#txtEnd").commonSelect("getSelResults");
                                if (sourceStart.length > 0 && sourceEnd.length > 0) {
                                    str = sourceStart[0].name + ":" + sourceEnd[0].name;
                                }
                            }
                            obj.data("getSelect", {
                                type: "3",
                                data: str
                            }).val(str);
                        },
                        "取消": function () {
                            $(this).dialog("close");
                        }
                    },
                    open: function () {
                        date.create(objSel, node, obj, tarObj);
                    }
                })
            }
        });
    },
    create: function (objSel, node, obj, tarObj) {
        var defaultSel = obj.data("getSelect");
        var source;
        var dateoption = {
            isSort: true,
            initValues: [],       //初始化默认值
            datasource: [
                { id: '日', name: '日' },
                { id: '月', name: '月' },
                { id: '周', name: '周' },
                { id: '季度', name: '季度' },
                { id: '半年', name: '半年' },
                { id: '年', name: '年' }
            ],
            callback: {
                change: function (option) {
                    if (option.length > 0) {
                        date.set(objSel.val(), option[0].id, "");
                    }
                },
                stop: function (option, seloption) {
                    if (option.length > 0) {
                        date.set(objSel.val(), option[0].id, "");
                    }
                }
            }
        };
        var valueArr = tarObj.val().split(",");
        $.each(valueArr, function (i, item) {
            dateoption.initValues.push({
                name: item
            });
        });
        $("#tableDate").jqCheckBox(dateoption);
        date.set(objSel.val(), node.LevelName, obj.val());
    },
    set: function (type, levelname, defaultvalue) {
        if (levelname == "日") {
            source = [
                { id: "今天", name: "今天" },
                { id: "昨天", name: "昨天" },
                { id: "前天", name: "前天" },
                { id: "上周同一天", name: "上周同一天" },
                { id: "上月同一天", name: "上月同一天" }
            ]
        }
        else if (levelname == "月") {
            source = [
                { id: "本月", name: "本月" },
                { id: "上月", name: "上月" },
                { id: "上上月", name: "上上月" },
                { id: "上年同月", name: "上年同月" }
            ]
        }
        else {
            source = [
                { id: "本周", name: "本周" },
                { id: "上周", name: "上周" },
                { id: "上上周", name: "上上周" },
                { id: "上年同周", name: "上年同周" }
            ]
        }
        if (type == "0") {
            $("#datedltime").show();
            $("#timeRang").hide();
            $("#txtTime").commonSelect("destroySelf");
            var datarang = {
                selectmode: "single",   //single  multiple
                initClass: "commdata", //commdata bigdata
                datasource: source,
                initValues: [],
                zIndex: 10000
            };
            if (defaultvalue.length > 0 && defaultvalue.indexOf(":") < 0) {
                datarang.initValues.push({
                    name: defaultvalue
                })
            }
            $("#txtTime").commonSelect(datarang);
        }
        else {
            $("#datedltime").hide();
            $("#timeRang").show();
            var datastart = {
                selectmode: "single",   //single  multiple
                initClass: "commdata", //commdata bigdata
                datasource: source,
                initValues: [],
                zIndex: 10000
            };
            var dataend = {
                selectmode: "single",   //single  multiple
                initClass: "commdata", //commdata bigdata
                datasource: source,
                initValues: [],
                zIndex: 10000
            };
            if (defaultvalue.length > 0 && defaultvalue.indexOf(":") > -1) {
                datastart.initValues.push({
                    name: defaultvalue.split(":")[0]
                });
                dataend.initValues.push({
                    name: defaultvalue.split(":")[1]
                });
            }
            $("#txtStart").commonSelect("destroySelf");
            $("#txtEnd").commonSelect("destroySelf");

            $("#txtStart").commonSelect(datastart);
            $("#txtEnd").commonSelect(dataend);
        }
    }
}
var getdata = {
    getNode: function (dimid, levelname) {
        var source = $("#" + layout.query).data("datasource");
        var tar = null;
        var flag = true;
        if (source != undefined) {
            $.each(source, function (i, item) {
                if (flag == false) {
                    return false;
                }
                if (item.length > 0) {
                    $.each(item, function (j, k) {
                        if (k.DimensionID == dimid && k.LevelName == levelname) {
                            tar = k;
                            flag = false;
                            return false;
                        }
                    });
                }
            });
        }
        return tar;
    },
    createPanel: function (objSel, node, obj, ulObj) {
        dss.ajax({
            url: ajaxPath.tree.evaluate,
            dataType: 'text',
            success: function (data) {
                dss.dialog({
                    content: data,
                    title: '赋值',
                    open: function () {
                        var defaultSel = obj.data("getSelect");
                        var four = {
                            datasource: [
                            { id: 0, name: '下拉列表' }
                            ],
                            isDefault: true
                        };
                        if (ulObj.attr("hierarchie") != undefined
                            && ulObj.attr("hierarchie").length > 0) {
                            four.datasource.push({ id: 1, name: '树形结构' });
                        }
                        if (defaultSel != undefined) {
                            if (defaultSel.type != undefined) {
                                if (defaultSel.type == "0") {
                                    four["initValues"] = { id: 0, name: '下拉列表' };
                                }
                                else {
                                    four["initValues"] = { id: 1, name: '树形结构' };
                                }
                            }
                        }
                        $("#five").jqRadio(four);
                        if (objSel.val() != "5") {
                            var data = {
                                dimid: node.DimensionID,
                                levelname: node.LevelName,
                                selectmode: "single",   //single  multiple
                                initClass: "bigdata", //commdata bigdata
                                initValues: [],
                                zIndex: 10000,
                                hascheckall: true
                            };
                            if (objSel.val() == "3") {
                                data.selectmode = "multiple";
                            }
                            if (obj.val().length > 0) {
                                var arrData = obj.val().split(",");
                                $.each(arrData, function (l, m) {
                                    data.initValues.push({
                                        name: m
                                    });
                                });
                            }
                            dss.commonSelect("txtDimDefault", data);
                        }
                    },
                    buttons: {
                        "确定": function () {
                            var data = {
                                type: $("#five").jqRadio("getSelect").id,
                                data: $("#txtDimDefault").val()
                            };
                            obj.val($("#txtDimDefault").val()).data("getSelect", data);
                        },
                        "取消": function () {
                            $(this).dialog("close");
                        }
                    }
                })
            }
        })
    },
    getDefault: function (source, levelname) {
        var _default = "";
        $.each(source, function (i, item) {
            if (item.key == levelname) {
                _default = item.name;
                return false;
            }
        });
        return _default;
    }
};
var setJump = {
    init: function (id, obj, name) {
        var source = $("#" + layout.query).data("datasource");
        if (source[id] != undefined) {
            setJump.createPanel(source[id], obj, name);
        }
    },
    createPanel: function (datasource, obj, reportname) {
        dss.ajax({
            url: ajaxPath.tree.url,
            dataType: 'html',
            success: function (data) {
                var opt_ = {
                    content: data,
                    title: '设置属性',
                    open: function () {
                        $("#tableJump tbody").empty();
                        var parmaArr = setJump.anaStr(
                            obj.data("datacondition") == undefined
                            ? ""
                            : obj.data("datacondition"));
                        $.each(datasource, function (i, item) {
                            if (item.IsMeasure < 2) {
                                var node = setJump.getNode(item.LevelName, parmaArr);
                                var $tr = $("<tr></tr>");
                                $tr.attr("dimName", item.DimensionName);
                                var $tdOne = $("<td>" + item.LevelName + "</td>");
                                var $tdTwo = $("<td></td>");
                                var $tdThree = $("<td></td>");
                                var $tdFour = $("<td></td>");
                                var $tdFive = $("<td></td>");
                                var input = $("<input type=\"text\" style=\"width: 80px\" readonly=\"readonly\" disabled=\"disabled\" id=\"txt_" + item.DimensionID + "_" + i + "\" />");
                                var $selOne;
                                var optionInit = {
                                    loop: '<select><option value=\"0\">选择</option><option value=\"1\">跳转</option></select>',
                                    all: '<select><option value=\"0\">选择</option><option value=\"1\">跳转</option><option value=\"2\">联动</option></select>'
                                };
                                $selOne = $(optionInit.all);
                                $tdTwo.append($selOne);
                                $selOne.change(function () {
                                    input.commonSelect("destroySelf");
                                    if ($(this).val() == "0") {
                                        input.attr("disabled", "disabled");
                                        $tdFive.find("input[type=\"checkbox\"]")
                                            .each(function () {
                                                $(this).removeAttr("checked");
                                            });
                                    }
                                    else {
                                        input.removeAttr("disabled");
                                        if ($(this).val() == "1") {
                                            input.click(function () {
                                                setJump.getUrl(input);
                                            });
                                        }
                                        else {
                                            setJump.loop(input, reportname);
                                        }

                                    }
                                });
                                $tdThree.append(input);
                                var $selTwo = $("<select><option value=\"0\">新页</option><option value=\"1\">本页</option></select>");
                                if (node != null) {
                                    input.attr("urltype", node.ly)
                                         .attr("urlhttp", node.lu)
                                         .val(node.ln);
                                    $selOne.val(node.t);
                                    $selTwo.val(node.o);
                                    if (node.type == "0") {
                                        input.attr("disabled", "disabled").val("");
                                        $tdFive.find("input[type=\"checkbox\"]").each(function () {
                                            $(this).removeAttr("checked");
                                        });
                                    }
                                    else if (node.t == "1") {
                                        input.removeAttr("disabled")
                                        .click(function () {
                                            setJump.getUrl(input);
                                        });
                                    }
                                    else {
                                        input.removeAttr("disabled");
                                        setJump.loop(input, reportname);
                                    }
                                }
                                else {
                                    input.attr("urltype", "1")
                                         .attr("urlhttp", "");
                                }

                                $tdFour.append($selTwo);
                                $tdFive.append(setJump.getAllDim(datasource,
                                    (node == null ? [] : node.p)));
                                $tr.append($tdOne).append($tdTwo)
                                    .append($tdThree)
                                    .append($tdFour)
                                    .append($tdFive);
                                $("#tableJump tbody").append($tr);
                            }
                        });
                    },
                    buttons: {
                        "确定": function () {
                            var str = setJump.getResult();
                            obj.data("datacondition", str);
                        },
                        "取消": function () {
                        }
                    }
                };
                if (datasource.length > 8) {
                    opt_.height = 240;
                }
                dss.dialog(opt_);
            }
        });
    },
    anaStr: function (str) {
        try {
            if (str.length > 0) {
                return eval('(' + str + ')');
            }
            else {
                return [];
            }
        }
        catch (e) {
            return [];
        }
    },
    getNode: function (colname, param) {
        for (var i = 0; i < param.length; i++) {
            if (param[i].n == colname) {
                return param[i];
            }
        }
        return null;
    },
    getResult: function () {
        var result = [];
        $("#tableJump tbody").find("tr").each(function (i, item) {
            var $tr = $(this);
            var sel = $tr.find("select");
            if (sel.eq(0).val() != "0") {
                var input = $tr.find("input[type='text']");
                var item = {
                    n: $tr.find("td").eq(0).text(),//索引
                    ln: input.eq(0).val(),//连接名称
                    ly: input.eq(0).attr("urltype"),//连接类型 1代表本身，0代表其他
                    lu: input.eq(0).attr("urlhttp"),//连接地址
                    t: sel.eq(0).val(),//操作方式0：选择，1：跳转，2：联动
                    o: sel.eq(1).val(),//打开方式0：新页，1：本页
                    p: []
                };
                $tr.find("input[type='checkbox']").each(function (j, p) {
                    if ($(this).is(':checked')) {
                        item.p.push({
                            id: j,
                            dn: $(this).attr("dimname"),
                            ln: $(this).attr("name")
                        });
                    }
                });
                result.push(item);
            }
        });
        return dss.jsonToString(result);
    },
    getAllDim: function (datasource, arr) {
        var str = "";
        $.each(datasource, function (i, item) {
            if (item.IsMeasure == 0 || item.IsMeasure == 2) {
                if (setJump.isHave(arr, item.LevelName, item.DimensionName)) {
                    str += "<input type=\"checkbox\" name=\"" + item.LevelName + "\" dimname=\"" + item.DimensionName + "\" checked=\"checked\" />" + item.LevelName;
                }
                else {
                    str += "<input type=\"checkbox\" name=\"" + item.LevelName + "\" dimname=\"" + item.DimensionName + "\" />" + item.LevelName;
                }
            }
        });
        return str;
    },
    isHave: function (arr, levelname, dimname) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].dn == dimname && arr[i].ln == levelname) {
                return true;
            }
        }
        return false;
    },
    getUrl: function (obj, type) {
        dss.ajax({
            url: ajaxPath.tree.addurl,
            dataType: 'html',
            success: function (data) {
                dss.dialog({
                    content: data,
                    title: '添加链接',
                    width: 400,
                    id: "dialog-1-show",
                    open: function () {
                        var four = {
                            datasource: [
                            { id: 1, name: '自动选择' },
                            { id: 0, name: '手工输入' }
                            ],
                            callback: {
                                change: function (optsi) {
                                    $("#txtUrlName").val("");
                                    $("#txtUrlHttp").val("");
                                    if (optsi.id == "1") {
                                        $("#sexfive").show();
                                        $("#allhttpurl").hide();
                                    }
                                    else {
                                        $("#sexfive").hide();
                                        $("#allhttpurl").show();
                                    }
                                }
                            },
                            isDefault: true
                        };
                        var datass = {
                            datasource: $("#treeDD").data("treeSource"),
                            selectmode: "single",   //single  multiple
                            initClass: "treedata", //commdata bigdata
                            initValues: [],
                            zIndex: 100000
                        };
                        if (obj.attr("urltype") == "1") {
                            four["initValues"] = { id: 1, name: '自动选择' };
                            $("#sexfive").show();
                            $("#allhttpurl").hide();
                            $("#txtAutoUrlHttp").val(obj.val());
                            datass.initValues.push({
                                name: obj.val(),
                                id: obj.attr("urlhttp")
                            });
                        }
                        else {
                            four["initValues"] = { id: 0, name: '手工输入' };
                            $("#sexfive").hide();
                            $("#allhttpurl").show();
                            $("#txtUrlName").val(obj.val());
                            $("#txtUrlHttp").val(obj.attr("urlhttp"));
                        }
                        $("#ten").jqRadio(four);

                        dss.commonSelect("txtAutoUrlHttp", datass);

                    },
                    buttons: {
                        "确定": function () {
                            if ($("#ten").jqRadio("getSelect").id == "1") {
                                var checkdata = $("#txtAutoUrlHttp").commonSelect("getSelResults");
                                if (checkdata.length > 0) {
                                    obj.attr("urlhttp", checkdata[0].id);
                                    obj.attr("urltype", "1");
                                    obj.val(checkdata[0].name);
                                }
                            }
                            else {
                                obj.attr("urlhttp", $("#txtUrlHttp").val());
                                obj.attr("urltype", "0");
                                obj.val($("#txtUrlName").val());
                            }
                        },
                        "取消": function () {
                        }
                    }
                })
            }
        });
    },
    loop: function (obj, name) {
        var arr = [{
            id: '0',
            name: '供二次开发'
        }];
        $("#" + layout.layout).find("div[class=\"domBtn\"]")
            .each(function (i, item) {
                if ($(this).attr("reportname") != name) {
                    arr.push({
                        id: $(this).parent()[0].id,
                        name: $(this).attr("reportname")
                    });
                }
            });
        var datass = {
            datasource: arr,
            selectmode: "multiple",   //single  multiple
            initClass: "commdata", //commdata bigdata
            initValues: [],
            zIndex: 100000,
            callback: {
                changed: function (opts) {
                    var str = [];
                    $.each(opts.selnames, function (i, item) {
                        if (item.name.length > 0) {
                            str.push({
                                id: item.id,
                                name: item.name
                            });
                        }
                    });
                    obj.attr("urlhttp", dss.jsonToString(str));
                    obj.attr("urltype", "2");
                }
            }
        };
        if (obj.attr("urlhttp").length > 0) {
            var p = setJump.anaStr(obj.attr("urlhttp"));
            if (typeof p == 'object') {
                datass.initValues = p;
            }
        }
        obj.commonSelect(datass);
    }
};
var save = {
    init: function (type) {
        var actRecords = $("#" + layout.all).data("datasource");
        if (!save.check()) {
            dss.alert("请重新选择报表，或者重新布局报表", null, "信息提示", 3, "", 1000);
            return;
        }
        var param = save.getParam(actRecords);

        //另存为
        if (type == "a") {
            $("#txtLayout").data("dashboardid", "");
        }

        var isSave = $("#txtLayout").data("dashboardid");
        if (isSave) {
            param.DashboardID = $("#txtLayout").data("dashboardid");
            save.save(param);
        }
        else {
            $("#" + layout.all).data("datasource", param);
            save.Saveas(param);
        }
    },
    getParam: function (actRecords) {
        var param = {
            "DashboardID": actRecords.DashboardID,
            "FolderID": actRecords.FolderID,
            "UserID": (actRecords.UserID != undefined
                ? actRecords.UserID
                : ""),
            "Desc": (actRecords.Desc != undefined && actRecords.Desc.length > 0
                ? actRecords.Desc
                : $("#" + layout.layout).find("div[class=\"domBtn\"]")
                .eq(0)
                .attr("reportname")),
            "Url": (actRecords.Url != undefined
                ? actRecords.Url
                : ""),
            "LayoutDesc": actRecords.LayoutDesc,
            "LayoutUrl": actRecords.LayoutUrl,
            "IsPub": false,
            "LoadTime": "",
            "Conditions": [],
            "DashboardRelations": []
        };
        $("#" + layout.query).find("ul")
            .each(function (i, item) {
                var $ul = $(this);
                var input = $ul.find("input");
                var sel = $ul.find("select");
                var defaultdata = input.eq(3).data("getSelect");
                var _opt = {
                    "DashboardID": "",
                    "DimensionID": ($ul.attr("dimid") != undefined
                        ? $ul.attr("dimid")
                        : ""),
                    "ThemeName": "",
                    "DimensionName": ($ul.attr("dimname") != undefined
                        ? $ul.attr("dimname")
                        : ""),
                    "LevelName": ($ul.attr("levlename") != undefined
                        ? $ul.attr("levlename")
                        : ""),
                    "DefaultValue": (defaultdata != undefined
                        ? defaultdata.data
                        : ""),
                    "ShowType": sel.eq(0).val(),
                    "OrderIndex": i,
                    "HasAll": false,
                    "RelationLevelName": null,
                    "DimGroup": input.eq(2).val().split(","),
                    "LableName": input.eq(1).val(),
                    "LableID": "txt-" + $ul.attr("dimid") + "-" + i,
                    isUse: $ul.attr("isuse"),
                    "ValType": ($ul.attr("dimtype") != undefined
                        ? $ul.attr("dimtype")
                        : ""),
                    "HierarchieName": ($ul.attr("hierarchie") != undefined
                        ? $ul.attr("hierarchie")
                        : ""),
                    "PresentType": (defaultdata != undefined
                        ? defaultdata.type
                        : 0)
                };
                if ($ul.find("input[type='checkbox']").length > 0) {
                    if ($ul.find("input[type='checkbox']").eq(0).is(":checked")) {
                        _opt.HasAll = true;
                    }
                    else {
                        _opt.HasAll = false;
                    }
                }
                param.Conditions.push(_opt);

            });
        $("#" + layout.layout)
            .find("div[class=\"report\"]")
            .each(function (i, item) {
                var $div = $(this);
                var tar = $div.find("div");
                param.DashboardRelations.push({
                    "DashboardID": "",
                    "ReportID": tar.eq(0).attr("reportid"),
                    "LayoutDivID": $div.attr("id"),
                    "OrderIndex": i,
                    "DivID": tar.eq(0).attr("showtype"),
                    "DivDesc": tar.eq(0).attr("reportname"),
                    "LoadTime": "",
                    "JumpUrlSet": ($div.data("datacondition") != undefined
                        ? $div.data("datacondition")
                        : "")
                });
            });
        return param;
    },
    Saveas: function (param) {
        param.DashboardID = "";
        dss.ajax({
            url: ajaxPath.tree.report,
            dataType: 'html',
            success: function (data) {
                dss.dialog({
                    content: data,
                    title: '生成报表',
                    width: 400,
                    open: function () {
                        $("#txtReportName").val(param.Desc == undefined
                            ? ""
                            : param.Desc);
                        var obj = $("#txtReportUrl");
                        var datasource = [];
                        var source = $("#treeDD").data("treeSource");
                        param.FolderID = param.FolderID == undefined
                            ? ""
                            : param.FolderID
                        $("#txtReportUrl").attr("targetUrl", param.FolderID == undefined
                            ? ""
                            : param.FolderID);
                        var datass = {
                            datasource: [],
                            selectmode: "single",   //single  multiple
                            initClass: "treedata", //commdata bigdata
                            initValues: [],
                            zIndex: 100000,
                            callback: {
                                changed: function (opts) {
                                    if (opts.selnames.length > 0) {
                                        $("#txtReportUrl")
                                            .attr("targetUrl", opts.selnames[0].id);
                                    }
                                }
                            }
                        };
                        $.each(source, function (i, item) {
                            if (item.isParent) {
                                datass.datasource.push(item);
                                if (param.FolderID == item.id) {
                                    datass.initValues.push(item);
                                    obj.val(item.name);
                                }
                            };
                        });
                        dss.commonSelect("txtReportUrl", datass);
                    },
                    buttons: {
                        "确定": function () {
                            var obj = $(this);
                            if ($("#txtReportName").val().length == 0) {
                                $("#txtReportTip").text("报表名称不能为空");
                                return false;
                            }
                            if ($("#txtReportUrl").attr("targetUrl").length == 0) {
                                $("#txtReportTip").text("报表路径必须选择");
                                return false;
                            }
                            param.Desc = $("#txtReportName").val();
                            param.FolderID = $("#txtReportUrl").attr("targetUrl");
                            if (save.isHaveNode(param.FolderID, param.Desc)) {
                                $("#txtReportTip").text("该节点下，已存在，请重新命名！");
                                return false;
                            }
                            save.save(param);
                        },
                        "取消": function () {
                        }
                    }
                })
            }
        });
    },
    save: function (param) {
        dss.ajax({
            url: ajaxPath.design,
            type: 'post',
            data: {
                act: 'savedashboard',
                strCon: dss.jsonToString(param)
            },
            success: function (data) {
                if (data.status == 0) {
                    if (data.data != 0) {
                        dss.alert("发布成功！", function () {
                            $("#txtLayout").data("dashboardid", data.data);
                            initDom.getDashboard();
                        });
                    }
                    else {
                        dss.alert("保存过程中出现意外，请重试！");
                    }
                };
            }
        })
    },
    check: function () {
        var flag = true;
        $("#" + layout.layout)
          .find("div[class=\"report\"]")
          .each(function (i, item) {
              if ($(this).find("div").length == 0) {
                  flag = false;
                  return false;
              }
          });
        return flag;
    },
    preview: function () {
        var actRecords = $("#" + layout.all).data("datasource");
        if (actRecords == undefined) {
            dss.alert("请重新选择报表，或者重新布局报表", null, "信息提示", 3, "", 1000);
            return;
        }
        dss.cookie.add("preview", dss.jsonToString(save.getParam(actRecords)), 1);
        var url = "plugin/Dashboard/Preview.html";
        dss.openPageInTab("报表预览", url);
    },
    isHaveNode: function (id, name) {
        var treeObj = $.fn.zTree.getZTreeObj("treeDD");
        var node = treeObj.getNodeByParam("id", id, null);
        if (node.children != undefined && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
                if (node.children[i].name == name) {
                    return true;
                }
            }
        }
        return false;
    }
};
var jsTools = {
    event: function () {
        Array.prototype.sourceArr = function (e) {
            for (i = 0; i < this.length; i++) {
                if (this[i] == e)
                    return i;
            }
            return -1;
        }
        Array.prototype.remove = function (val) {
            var index = this.sourceArr(val);
            if (index > -1) {
                this.splice(index, 1);
            }
        };
        Array.prototype.cross = function (arrSecond) {
            var arrCross = [];
            $.each(this, function (i, item) {
                for (var j = 0; j < arrSecond.length; j++) {
                    if (item.LevelName == arrSecond[j].LevelName) {
                        arrCross.push(item);
                        break;
                    }
                }
            });
            return arrCross;
        };
        Array.prototype.indexOf = function (key) {
            var index = -1;
            for (var i = 0; i < this.length; i++) {
                if (this[i] == key) {
                    index = i;
                    break;
                }
            }
            return index;
        }
    },
    //当前窗口的有效可视宽度和高度
    getDocumentWH: function () {
        var winW, winH;//当前窗口的有效可视宽度和高度
        if (window.innerHeight) { //所有非IE浏览器
            winW = window.innerWidth;
            winH = $(window).height();
        } else if (document.documentElement
            && document.documentElement.clientHeight) { //IE 6 Strict Mode
            winW = document.documentElement.clientWidth;
            winH = document.documentElement.clientHeight;
        } else if (document.body) { //其他浏览器
            winW = document.body.clientWidth;
            winH = document.body.clientHeight;
        }
        return {
            WinW: winW, //真正反馈的宽度
            WinH: winH //真正反馈的高度
        };
    },
    // 获取页面的高度、宽度
    getPageSize: function () {
        var xScroll, yScroll;
        if (window.innerHeight && window.scrollMaxY) {
            xScroll = window.innerWidth + window.scrollMaxX;
            yScroll = window.innerHeight + window.scrollMaxY;
        } else {
            if (document.body.scrollHeight > document.body.offsetHeight) { // all but Explorer Mac 
                xScroll = document.body.scrollWidth;
                yScroll = document.body.scrollHeight;
            } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari  
                xScroll = document.body.offsetWidth;
                yScroll = document.body.offsetHeight;
            }
        }

        var windowWidth, windowHeight;
        if (self.innerHeight) { // all except Explorer 
            if (document.documentElement.clientWidth) {
                windowWidth = document.documentElement.clientWidth;
            } else {
                windowWidth = self.innerWidth;
            }
            windowHeight = self.innerHeight;
        } else {
            if (document.documentElement
                && document.documentElement.clientHeight) { // Explorer 6 Strict Mode  
                windowWidth = document.documentElement.clientWidth;
                windowHeight = document.documentElement.clientHeight;
            } else {
                if (document.body) { // other Explorers    
                    windowWidth = document.body.clientWidth;
                    windowHeight = document.body.clientHeight;
                }
            }
        }

        if (yScroll < windowHeight) {
            pageHeight = windowHeight;
        } else {
            pageHeight = yScroll;
        }
        if (xScroll < windowWidth) {
            pageWidth = xScroll;
        } else {
            pageWidth = windowWidth;
        }
        return {
            pageW: pageWidth,
            pageH: pageHeight,
            windW: windowWidth, //真正反馈的宽度
            windH: windowHeight //真正反馈的高度
        };
    },
    getMousePos: function (event) {
        var e = event || window.event;
        var scrollX = document.documentElement.scrollLeft
            || document.body.scrollLeft;
        var scrollY = document.documentElement.scrollTop
            || document.body.scrollTop;
        var x = e.pageX || e.clientX + scrollX;
        var y = e.pageY || e.clientY + scrollY;
        return { 'x': x, 'y': y };
    },
    copyToClipboard: function (txt) {
        if (window.clipboardData) {
            window.clipboardData.clearData();
            window.clipboardData.setData("Text", txt);
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
};