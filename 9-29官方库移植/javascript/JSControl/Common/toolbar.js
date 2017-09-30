(function ($) {
    var method = {
        content: function (id, option) {
            var obj = $("#" + id);
            if ($("#" + id + "title").length > 0) {
                $("#" + id + "title").remove();
            }
            var contenTitle = $("<div class=\"contenTitle\" id=\"" + id + "title\"></div>");
            var fliename = option.title;
            var title = $("<div class=\"title\">" + fliename + "</div>");
            var right = $("<div class=\"right\"></div>");
            if (option.display.isexport.show == true) {
                var div = $("<div class=\"itemIcon\" title=\"" + option.display.isexport.title + "\"></div>");
                var img = $("<a href=\"javascript:\" class=\"export\">&nbsp;</a>");
                img.click(function () {
                    method.exportdata.content(fliename, obj);
                });
                div.append(img);
                right.append(div);
            }
            if (option.analyzer != null) {
                if (option.display.filter.show == true) {
                    var div = $("<div class=\"itemIcon\" title=\"" + option.display.filter.title + "\"></div>");
                    var img = $("<a href=\"javascript:\" class=\"filter\">&nbsp;</a>");
                    img.click(function (ev) {
                        method.filter.all(id, option.analyzer, function (analyzer) {
                            option.callback.changed(analyzer, "filter");
                        });
                    });
                    div.append(img);
                    right.append(div);
                }
                if (option.display.searcher.show == true) {
                    var div = $("<div class=\"itemIcon\" title=\"" + option.display.searcher.title + "\"></div>");
                    var img = $("<a href=\"javascript:\" class=\"search\">&nbsp;</a>");
                    img.click(function () {

                    });
                    div.append(img);
                    right.append(div);
                }
                if (option.display.measel.show == true) {
                    var div = $("<div class=\"itemIcon\" title=\"" + option.display.measel.title + "\"></div>");
                    var img = $("<a href=\"javascript:\" id=\"img" + id + "\" class=\"measure\">&nbsp;</a>");
                    var all = $.extend(true, {}, option.analyzer.MeasureList);
                    img.click(function (ev) {
                        method.measel.content($(this), option.analyzer, function (analyzer) {
                            option.callback.changed(analyzer, "export");
                        }, ev);
                    });
                    div.append(img);
                    right.append(div);
                }
                if (option.display.second.show == true) {
                    var div = $("<div class=\"itemIcon\" title=\"" + option.display.second.title + "\"></div>");
                    var img = $("<a href=\"javascript:\" class=\"second\">&nbsp;</a>");
                    var all = $.extend(true, {}, option.analyzer.MeasureList);
                    img.click(function (ev) {
                        $.ajax({
                            url: dss.rootPath + 'PlugIn/CustomAnalysis/Pages/Handler.ashx?datatype=tmptstore',
                            data: {
                                anastr: dss.jsonToString(option.analyzer)
                            },
                            type: 'post',
                            dataType: 'text',
                            success: function (data) {
                                var url = dss.rootPath + "PlugIn/CustomAnalysis/Pages/Content.aspx?tabtype=Edit&qtype=anaagain&key=" + data;
                                dss.openPageInTab("二次分析", url);
                            }
                        });
                    });
                    div.append(img);
                    right.append(div);
                }
            }
            if (option.extend.length > 0) {
                $.each(option.extend, function (i, item) {
                    var div = $("<div class=\"itemIcon\" title=\"" + item.title + "\"></div>");
                    var img = $("<a href=\"javascript:\" class=\"" + item.className + "\">&nbsp;</a>");
                    img.click(function () {
                        item.click(option.analyzer);
                    });
                    div.append(img);
                    right.append(div);
                });
            }


            contenTitle.append(title).append(right);
            obj.before(contenTitle);
            option.callback.onLoad(option.analyzer, 1);
        },
        exportdata: {
            content: function (filename, obj) {
                dss.load(true);
                var s;
                var now = new Date();
                var exitTime = now.getTime() + 4000;
                var nk = 0;
                while (true) {
                    if (nk % 100000 == 0) {
                        s = $("#" + obj[0].id + "db").data("count");
                    }
                    now = new Date();
                    if (s != undefined || now.getTime() > exitTime) {
                        break;
                    }
                }
                if (s == undefined) {
                    s = "0";
                }
               
                dss.require(["export"], function () {
                    dss.load(false);
                    $.download.exportDiv([obj], {
                        fileName: filename,
                        colAttr: []
                    }, s)
                }, function () { });
            }
        },
        filter: {
            content: {
                row: "<option value=\"1\">单值</option><option value=\"2\">多值</option><option value=\"3\">模糊</option><option value=\"4\">排除</option>",
                condition: "<option value=\"1\">并且</option><option value=\"0\">或者</option>",
                measure: "<option value=\">\">大于</option><option value=\">=\">大于等于</option><option value=\"=\">等于</option><option value=\"<=\">小于等于</option><option value=\"<\">小于</option>"
            },
            row: function (id, analyzer) {
                var source = $("#" + id).data("filterdatasource");
                if (source == undefined || typeof source != 'object') {
                    var source = [];
                    $.each(analyzer.RowDimList, function (i, item) {
                        var _t = $.extend(true, {}, item);
                        source.push(_t);
                    });
                    $("#" + id).data("filterdatasource", source);
                }
                var all = $("<table></table>");
                if (analyzer.RowDimList.length > 0) {
                    $.each(analyzer.RowDimList, function (i, item) {
                        if (item.DimensionName != "日期维" && item.DimensionName != "小时维") {
                            var tr = $("<tr tid='row'></tr>").appendTo(all);
                            var td1 = $("<td style='width:80px;'></td>").appendTo(tr);
                            $("<select style='width:80px;' disabled=\"disabled\"><option value=\"" + item.LevelName + "\">" + item.LevelName + "</option></select>").appendTo(td1);

                            var td2 = $("<td style='width:50px;'></td>").appendTo(tr);
                            var sel = $("<select></select>").append(method.filter.content.row).appendTo(td2);
                            var td3 = $("<td style='width:160px;'></td>").appendTo(tr);
                            var td4 = $("<td style='width:150px;color:red'></td>").appendTo(tr);
                            var input = $("<input type=\"text\" style=\"width: 160px\" />").appendTo(td3);
                            sel.change(function () {
                                if (sel.val() == "2" || sel.val() == "4") {
                                    td4.html("多个值用分号（;）隔开");
                                }
                                else {
                                    td4.html("");
                                }
                            });
                            
                            //@hfc写的，有问题
                            //if (item.Val.length > 0) {
                            //    if (item.ValType == 0) {
                            //        sel.val("1");
                            //    }
                            //    else if (item.ValType == 1) {
                            //        sel.val("2");
                            //    }
                            //    else if (item.ValType == 2) {
                            //        sel.val("4");
                            //    }
                            //    else {
                            //        sel.val("3");
                            //    }
                            //    input.val(item.Val);
                            //}
                            //else if (item.ValList.length > 0) {
                            //    sel.val("2");
                            //    input.val(item.ValList.join(";"));
                            //}
                            //else {
                            //    sel.val("1");
                            //}

                            //@jyt 完善
                            if (item.ValType == 0) {
                                sel.val("1");//单值
                                input.val(item.Val);
                            }
                            else if (item.ValType == 1) {
                                sel.val("2");//多值
                                input.val(item.ValList.join(";"));
                            }
                            else if (item.ValType == 2) {
                                sel.val("4");//排除
                                if (item.ValList.length > 0) {
                                    input.val(item.ValList.join(";"));
                                }
                                else {
                                    input.val(item.Val);
                                }
                            }
                            else {
                                sel.val("3");//模糊
                                input.val(item.Val);
                            }
                        }
                    });
                }
                var all_tr = $("<tr></tr>").appendTo(all);
                var all_td = $("<td colspan=\"3\"></td>").appendTo(all_tr);
                $("<input type=\"button\" class=\"button\" value=\"重置\" />")
                    .click(function () {
                        method.filter.reTable(id, analyzer.RowDimList);
                        $("#" + id + "p").html("");
                    }).appendTo(all_td);
                $("<input type=\"button\" class=\"button\" value=\"查看\" />")
                    .click(function () {
                        $("#" + id + "p").html(method.filter.getrowdata(id));
                    }).appendTo(all_td);
                $("#" + id + "t").empty().append(all);

            },
            measure: function (id, analyzer) {
                var table = $("<table style='width:550px;height:240px;'></table>");
                var area = $("<textarea style=\"width:380px;height:208px;\" id=\"txtFilter" + id + "\"></textarea>");
                area.val(analyzer.MeasureFilter);
                var trOne = $("<tr style=\"height:20px;\"></tr>").appendTo(table);
                var td_1_1 = $("<td style=\"width:160px;\">指标选择:</td>").appendTo(trOne);
                var td_1_2 = $("<td style=\"width:60px;\">组合条件:</td>").appendTo(trOne);
                var td_1_3 = $("<td></td>").appendTo(trOne);
                $("<input type=\"button\" value=\"且\" class=\"button\" />")
                    .click(function () {
                        area.val(area.val() + " AND ");
                    }).appendTo(td_1_3);
                $("<input type=\"button\" value=\"或\" class=\"button\" />")
                    .click(function () {
                        area.val(area.val() + " OR ");
                    }).appendTo(td_1_3);
                $("<input type=\"button\" value=\"（\" class=\"button\" />")
                    .click(function () {
                        area.val(area.val() + " ( ");
                    }).appendTo(td_1_3);
                $("<input type=\"button\" value=\"）\" class=\"button\" />")
                    .click(function () {
                        area.val(area.val() + " ) ");
                    }).appendTo(td_1_3);
                $("<input type=\"button\" value=\"清空\" class=\"button\" />")
                    .click(function () {
                        area.val("");
                    }).appendTo(td_1_3);
                var trTwo = $("<tr  style=\"height:220px;\"></tr>").appendTo(table);
                var td_2_1 = $("<td></td>").appendTo(trTwo);
                var ul = $("<ul></ul>").appendTo(td_2_1);
                method.filter.getmeasure(analyzer.MeasureList, ul, area, table);
                var td_2_2 = $("<td colspan=\"2\"></td>").appendTo(trTwo);
                area.appendTo(td_2_2);
                $("#" + id + "d").empty().append(table);
            },
            all: function (id, analyzer, callback) {
                dss.dialog({
                    content: method.filter.getcontent(id),
                    open: function () {
                        method.filter.row(id, analyzer);
                        method.filter.measure(id, analyzer);
                        $("#" + id + "Filter").tabs();
                    },
                    title: '过滤设置',
                    width: 610,
                    height: 400,
                    buttons: {
                        "提交": function () {
                            var str = $("#txtFilter" + id).val();
                            var s = str.replace(/\s+/g, ' ');
                            if (s.length > 0) {
                                if (!method.filter.valid.content(str, analyzer.MeasureList)) {
                                    dss.alert("指标表达式不正确，请验证", null, "提示信息", 3);
                                    return;
                                }
                            }
                            analyzer.RowDimList = method.filter.setrowdata(id, analyzer.RowDimList);
                            if (callback != undefined && typeof callback == 'function') {
                                analyzer.MeasureFilter = str;
                                callback(analyzer);
                            }
                        },
                        "取消": function () {
                            $(this).dialog("close");
                        }
                    }
                })
            },
            reTable: function (id, rowdimlist) {
                var source = $("#" + id).data("filterdatasource");
                if (source == undefined || typeof source != 'object') {
                    source = rowdimlist;
                }
                if ($("#" + id + "l").find("table").length > 0) {
                    var table = $("#" + id + "l")
                        .find("table")
                        .eq(0);

                    table.find("tr[tid='row']")
                        .remove();

                    var trs = table.find("tr").eq(0);

                    if (source.length > 0) {
                        $.each(source, function (i, item) {
                            if (item.DimensionName != "日期维" && item.DimensionName != "小时维") {
                                var tr = $("<tr tid='row'></tr>");
                                var td1 = $("<td style='width:80px;'></td>").appendTo(tr);
                                $("<select style='width:80px;' disabled=\"disabled\"><option value=\"" + item.LevelName + "\">" + item.LevelName + "</option></select>").appendTo(td1);

                                var td2 = $("<td style='width:50px;'></td>").appendTo(tr);
                                var sel = $("<select></select>").append(method.filter.content.row).appendTo(td2);

                                var td3 = $("<td style='width:160px;'></td>").appendTo(tr);
                                var td4 = $("<td style='width:150px;color:red'></td>").appendTo(tr);
                                var input = $("<input type=\"text\" style=\"width: 160px\" />").appendTo(td3);
                                sel.change(function () {
                                    if (sel.val() == "2" || sel.val() == "4") {
                                        td4.html("多个值用分号（;）隔开");
                                    }
                                    else {
                                        td4.html("");
                                    }
                                });
                                if (item.Val.length > 0) {
                                    if (item.ValType == 0) {
                                        sel.val("1");
                                    }
                                    else if (item.ValType == 1) {
                                        sel.val("2");
                                    }
                                    else if (item.ValType == 2) {
                                        sel.val("4");
                                    }
                                    else {
                                        sel.val("3");
                                    }
                                    input.val(item.Val);
                                }
                                else if (item.ValList.length > 0) {
                                    sel.val("2");
                                    input.val(item.ValList.join(";"));
                                }
                                else {
                                    sel.val("1");
                                }
                                trs.before(tr);
                            }
                        });
                    }
                }
            },
            getcontent: function (id) {
                var str = "<div id=\"" + id + "Filter\" class=\"dss_table_filter\" style=\"padding:0px;\">";
                str += "<ul style=\"background-color: #ECECEC;border: 0px;\"><li style=\"background-color:transparent;\">";
                str += "<a href=\"#" + id + "k\" style=\"color:black;\">指标</a></li><li style=\"background-color:transparent\">";
                str += "<a href=\"#" + id + "l\" style=\"color:black;\">属性</a></li></ul>";
                str += "<div class=\"content\" id=\"" + id + "l\"><div id=\"" + id + "t\" class=\"rd\"></div><div id=\"" + id + "p\" class=\"ru\"></div>";
                str += "</div><div class=\"content\" id=\"" + id + "k\"><div id=\"" + id + "d\" class=\"rm\"></div></div>";
                return str;
            },
            getmeasure: function (measure, ul, area, gridcondition) {
                $.each(measure, function (i, item) {
                    var li = $("<li>" + item.DisplayName + "</li>");
                    li.attr("unit", item.Unit)
                    .attr("measureid", item.MeasureID)
                    .click(function () {
                        method.filter.create($(this), area, gridcondition);
                    });
                    ul.append(li);
                });
            },
            getrowdata: function (id) {
                var str = "";
                if ($("#" + id + "l").find("table").length > 0) {
                    $("#" + id + "l").find("table").eq(0).find("tr[tid='row']").each(function (i, item) {
                        var sel = $(this).find("select");
                        var input = $(this).find("input");
                        if (input.eq(0).val().length > 0) {
                            if (str.length > 0) {
                                str += " AND ";
                            }
                            str += "[" + sel.eq(0).val() + "]";
                            var filterType = sel.eq(1).val();
                            if (filterType == "1") {
                                str += " = '" + input.eq(0).val() + "'";
                            }
                            else if (filterType == "2") {
                                str += " IN ('" + input.eq(0).val().replace(/;/g, "','") + "')";
                            }
                            else if (filterType == "3") {
                                str += " LIKE '%" + input.eq(0).val() + "%'";
                            }
                            else {
                                str += " NOT IN ('" + input.eq(0).val().replace(/;/g, "','") + "')";
                            }
                        }
                    })
                }
                return str;
            },
            setrowdata: function (id, rowdimlist) {
                var source = $("#" + id).data("filterdatasource");
                if (source != undefined && typeof source != 'object') {
                    rowdimlist = source;
                }
                if ($("#" + id + "l").find("table").length > 0) {
                    $("#" + id + "l")
                        .find("table")
                        .eq(0)
                        .find("tr[tid='row']")
                        .each(function (i, item) {
                            var sel = $(this).find("select");
                            var input = $(this).find("input");
                            for (var j = 0; j < rowdimlist.length; j++) {
                                if (sel.eq(0).val() == rowdimlist[j].LevelName) {
                                    if (sel.eq(1).val() == "1") {
                                        rowdimlist[j].Val = input.eq(0).val();
                                        rowdimlist[j].ValType = 0;
                                    }
                                    else if (sel.eq(1).val() == "2") {
                                        rowdimlist[j].ValList = input.eq(0).val().split(";");
                                        rowdimlist[j].ValType = 1;
                                    }
                                    else if (sel.eq(1).val() == "4") {
                                        rowdimlist[j].ValList = input.eq(0).val().split(";");
                                        rowdimlist[j].ValType = 2;
                                    }
                                    else {
                                        rowdimlist[j].Val = input.eq(0).val();
                                        rowdimlist[j].ValType = 9;
                                    }
                                    break;
                                }
                            }
                        });
                }
                return rowdimlist;
            },
            create: function (obj, tarobj, div) {
                var tcondition = $("<div class=\"dss_condition\"></div>");
                $("<div class=\"tip\">" + obj.text() + "(" + obj.attr("unit") + ")</div>").appendTo(tcondition);
                var first = $("<div class=\"first\"></div>").appendTo(tcondition);
                var firstsel = $("<select>" + method.filter.content.measure + "</select>");
                var firstinput = $("<input type=\"text\" style=\"width: 80px;\" />");
                first.append(firstsel)
                    .append(firstinput);
                var thir = $("<div class=\"thir\"></div>").appendTo(tcondition);
                $("<input type=\"button\" value=\"确定\" class=\"button\" />")
                    .click(function () {
                        if (firstinput.val().length > 0) {
                            var str = tarobj.val() + " [" + obj.text() + "] " + firstsel.val() + " " + firstinput.val();
                            tarobj.val(str);
                        }
                        tcondition.remove();
                    }).appendTo(thir);
                $("<input type=\"button\" value=\"取消\" class=\"button\" />")
                    .click(function () {
                        tcondition.remove();
                    }).appendTo(thir);
                tcondition.css("top", div.offset().top + 60)
                  .css("left", div.offset().left + 160)
                  .css("position", "absolute")
                  .css("z-index", "10000");
                $(document.body).append(tcondition);
            },
            valid: {
                isNum: function (str) {
                    var re = /^[0-9]+.?[0-9]*$/;
                    if (!re.test(str)) {
                        return false;
                    }
                    return true;
                },
                content: function (str, arrMea) {
                    for (var i = 0; i < arrMea.length; i++) {
                        while (str.indexOf("[" + arrMea[i].DisplayName + "]") > -1) {
                            str = str.replace("[" + arrMea[i].DisplayName + "]", "$");
                        }
                    }
                    str = str.toLocaleLowerCase();
                    str = str.replace(/<=/g, " <= ");
                    str = str.replace(/>=/g, " >= ");
                    str = str.replace(/=/g, " = ");
                    str = str.replace(/>/g, " > ");
                    str = str.replace(/</g, " < ");
                    str = str.replace(/<  =/g, " <= ");
                    str = str.replace(/>  =/g, " >= ");

                    str = str.replace(/\(/g, " ( ");
                    str = str.replace(/\)/g, " ) ");
                    str = str.replace(/\s+/g, ' ');
                    str = $.trim(str);
                    var charArr = str.split(" ");
                    var ch = [];
                    var sy = [];
                    var br = [];
                    var nr = [];
                    for (var i = 0; i < charArr.length; i++) {
                        if (charArr[i] == "and" || charArr[i] == "or") {
                            if (i > charArr.length - 3) {
                                return false;
                            }
                            else if (charArr[i + 1] == ")") {
                                return false;
                            }
                            else if (charArr[i - 1] == "and" || charArr[i - 1] == "or") {
                                return false;
                            }
                            continue;
                        }
                        switch (charArr[i]) {
                            case "$":
                                if (i > 0) {
                                    if (charArr[i - 1] != "and" && charArr[i - 1] != "or" && charArr[i - 1] != "(") {
                                        return false;
                                    }
                                }
                                ch.push(charArr[i]);
                                break;
                            case "<":
                                sy.push(charArr[i]);
                                break;
                            case "<=":
                                sy.push(charArr[i]);
                                break;
                            case ">":
                                sy.push(charArr[i]);
                                break;
                            case ">=":
                                sy.push(charArr[i]);
                                break;
                            case "=":
                                sy.push(charArr[i]);
                                break;
                            case ")":
                                if (br.length == 0) {
                                    return false;
                                }
                                br.pop();
                                break;
                            case "(":
                                if (i > 0) {
                                    if (charArr[i - 1] != "and" && charArr[i - 1] != "or" && charArr[i - 1] != "(") {
                                        return false;
                                    }
                                }
                                if (i == charArr.length - 1) {
                                    return false;
                                }
                                if (charArr[i + 1] != "(" && charArr[i + 1] != "$") {
                                    return false;
                                }
                                br.push(charArr[i]);
                                break;
                            default:
                                if (method.filter.valid.isNum(charArr[i])) {
                                    if (sy.length == 0) {
                                        return false;
                                    }
                                    if (ch.length == 0) {
                                        return false;
                                    }
                                    sy.pop();
                                    ch.pop();
                                }
                                else {
                                    return false;
                                }
                                break;
                        }
                    }
                    if (ch.length > 0 || sy.length > 0 || br.length > 0) {
                        return false;
                    }
                    return true;
                }
            }
        },
        measel: {
            content: function (all, analyzer, callback, ev) {
                if (analyzer.MeasureList.length > 0) {
                    var gridcondition = $("<div class=\"dss_grid_filter\" style=\"width: 500px\"></div>");
                    var left = $("<div class=\"left\"></div>");
                    var tip = $("<div></div>");
                    var a = $("<input type=\"text\" id=\"txt\"/>");
                    a.css({
                        width: "144px",
                        height: "23px",
                        margin: "0px",
                        padding: "0px",
                        float: "left"
                    });
                    var ul = $("<ul></ul>");
                    var b = $("<input type=\"button\" class=\"btnsearch\" />");
                    b.click(function () {
                        var datasource = ul.data("datasource");
                        if (datasource != undefined && typeof datasource == 'object') {
                            var p = [];
                            $.each(datasource, function (n, k) {
                                if (k.DisplayName.indexOf(a.val()) > -1) {
                                    p.push(k);
                                }
                            });
                            method.measel.createCon(p, ul);
                        }
                    });
                    tip.append(a).append(b);
                    var content = $("<div class=\"content\"></div>");
                    content.css({
                        "margin-top": "0px",
                        "border-top": "0px"
                    });

                    var tarSub = [];
                    $.each(analyzer.MeasureList, function (i, item) {
                        tarSub.push(item.MeasureID);
                    });
                    $.ajax({
                        url: dss.rootPath + "javascript/JSControl/Common/Hander/Analyzer.ashx",
                        dataType: 'json',
                        data: {
                            strCon: dss.jsonToString(tarSub)
                        },
                        type: 'post',
                        success: function (data) {
                            ul.data("datasource", data);
                            method.measel.createCon(data, ul);
                            content.append(ul);
                            left.append(tip)
                            .append(content);
                        },
                        complete: function () {
                            var right = $("<div class=\"left\"></div>");
                            var righttip = $("<div class=\"tip\">已选指标：</div>");
                            var rightcontent = $("<div class=\"content\"></div>");
                            var rightul = $("<ul></ul>");
                            var lSource = analyzer.MeasureList;
                            var id = all[0].id.replace("img", "");
                            method.measel.createUl(lSource, rightul, ul);
                            rightul.sortable();
                            rightcontent.append(rightul);
                            right.append(righttip)
                            .append(rightcontent);

                            var center = $("<div class=\"center\"></div>");
                            var one = $("<div style=\"margin-top: 80px;\"></div>");
                            var add = $("<input type=\"button\" value=\"\" class=\"add\" />");
                            one.append(add);
                            add.click(function () {
                                ul.find("li[class='selected']").each(function () {
                                    var flag = false;
                                    var newObj = $(this).clone();
                                    rightul.find("li").each(function () {
                                        if ($(this).attr("measureid") == newObj.attr("measureid")) {
                                            flag = true;
                                            return false;
                                        }
                                    });
                                    if (!flag) {
                                        newObj.removeClass("selected")
                                            .click(function () {
                                                if ($(this).hasClass("selected")) {
                                                    $(this).removeClass("selected");
                                                }
                                                else {
                                                    $(this).addClass("selected");
                                                }
                                            });;
                                        rightul.append(newObj);
                                    }
                                });
                            });
                            var two = $("<div></div>");
                            var del = $("<input type=\"button\" value=\"\" class=\"delete\" />");
                            two.append(del);
                            del.click(function () {
                                rightul.find("li[class='selected']").each(function () {
                                    $(this).remove();
                                });
                            });

                            center.append(one)
                            .append(two);

                            gridcondition.append(left)
                                .append(center)
                                .append(right);
                            gridcondition.dialog({
                                width: 480,
                                title: '指标选择',
                                draggable: false,
                                buttons: {
                                    '确定': function () {
                                        if (typeof callback == 'function') {
                                            if (rightul.find("li").length > 0) {
                                                analyzer.MeasureList = [];
                                                var measureArr = [];
                                                rightul.find("li").each(function () {
                                                    analyzer.MeasureList.push(
                                                        {
                                                            "MeasureID": $(this).attr("measureid"),
                                                            "Decimal": $(this).attr("decimal"),
                                                            "Unit": $(this).attr("unit"),
                                                            "DisplayName": $(this).text(),
                                                            "MeasureType": $(this).attr("measureType"),
                                                            "Formula": $(this).attr("formula"),
                                                            "Visible": $(this).attr("visible")
                                                        });
                                                    measureArr.push($(this).attr("measureid"));
                                                });
                                                toolbarmethod.cookie.add(toolbarmethod.getKey(id), measureArr.join(','), 10080);
                                            }
                                            callback(analyzer);
                                            gridcondition.remove();
                                        }
                                    },
                                    '取消': function () {
                                        gridcondition.dialog("close");
                                    }
                                }
                            });
                        }
                    });
                }
            },
            createUl: function (data, objUl, tarul) {
                $.each(data, function (i, item) {
                    var li = $("<li>" + item.DisplayName + "</li>");
                    li.attr("unit", item.Unit)
                    .attr("decimal", item.Decimal)
                    .attr("formula", item.Formula)
                    .attr("visible", item.Visible)
                    .attr("measureType", item.MeasureType)
                    .attr("measureid", item.MeasureID)
                    .click(function () {
                        if ($(this).hasClass("selected")) {
                            $(this).removeClass("selected");
                        }
                        else {
                            $(this).addClass("selected");
                        }
                    });
                    objUl.append(li);
                });
            },
            createCon: function (data, ul) {
                ul.empty();
                $.each(data, function (i, item) {
                    if (typeof item == 'object') {
                        var li = $("<li>" + item.DisplayName + "</li>");
                        li.attr("unit", item.Unit)
                        .attr("decimal", item.Decimal)
                        .attr("formula", item.Formula)
                        .attr("visible", "true")
                        .attr("measureType", "0")
                        .attr("measureid", item.MeasureID)
                        .click(function () {
                            if ($(this).hasClass("selected")) {
                                $(this).removeClass("selected");
                            }
                            else {
                                $(this).addClass("selected");
                            }
                        });
                        ul.append(li);
                    }
                });
            }
        }
    };
    var init = {
        init: function (option) {
            var param = $.extend(true,
                {
                    display: {
                        measel: {
                            show: true,
                            img: '',
                            title: '指标选择'
                        },
                        filter: {
                            show: true,
                            img: '',
                            title: '指标过滤'
                        },
                        searcher: {
                            show: false,
                            img: '',
                            title: '条件过滤'
                        },
                        isexport: {
                            show: true,
                            img: '',
                            title: '数据导出'
                        },
                        second: {
                            show: true,
                            img: '',
                            title: '二次分析'
                        }
                    },
                    extend: [],
                    analyzer: null,
                    title: '',
                    callback: {
                        onLoad: function (analyzer, type) {

                        },
                        changed: function (analyzer, type) {

                        }
                    }

                }, option);
            var obj = $(this);
            var id = obj[0].id;
            method.content(id, param);
        }
    };
    $.fn.toolbar = function (method) {
        if (init[method]) {
            return init[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method == "object" || !init) {
            init.init.apply(this, arguments);
        }
        else {
            $.error('Method ' + method + ' does not exist on jQuery.toolbar');
        }
    }
})(jQuery);

var toolbarmethod = {
    getKey: function (id) {
        var key = id + "-" + location.href;
        key = encodeURI(key);
        return toolbarmethod.crc32(key).toString();
    },
    crc32: function (str, crc) {
        var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 ";
        table += "79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 ";
        table += "84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F ";
        table += "63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD ";
        table += "A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC ";
        table += "51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 ";
        table += "B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 ";
        table += "06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 ";
        table += "E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 ";
        table += "12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 ";
        table += "D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 ";
        table += "33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 ";
        table += "CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 ";
        table += "9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E ";
        table += "7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D ";
        table += "806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 "
        table += "60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA ";
        table += "AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 ";
        table += "5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 ";
        table += "B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 ";
        table += "05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 ";
        table += "F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA ";
        table += "11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 ";
        table += "D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F ";
        table += "30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E ";
        table += "C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
        if (crc == window.undefined) crc = 0;
        var n = 0; //a number between 0 and 255  
        var x = 0; //an hex number  
        crc = crc ^ (-1);
        for (var i = 0, iTop = str.length; i < iTop; i++) {
            n = (crc ^ str.charCodeAt(i)) & 0xFF;
            x = "0x" + table.substr(n * 9, 8);
            crc = (crc >>> 8) ^ x;
        }
        return crc ^ (-1);
    },
    cookie: {
        get: function (key) {
            var cookies = document.cookie.split(";");
            for (var i = 0; i < cookies.length; i++) {
                var arr = cookies[i].split("=");
                if (arr[0].replace(" ", "") == key)
                    return decodeURIComponent(arr[1]);
            }
            return undefined;

        },
        add: function (key, value, expiresMinute) {
            if (typeof key == "string" && typeof value == "string") {
                var cookieString = key + "=" + encodeURIComponent(value);
                if (typeof expiresMinute == "number") {
                    var date = new Date((new Date()).getTime() + expiresMinute * 60000);
                    cookieString += ";expires=" + date.toGMTString();
                }
                document.cookie = cookieString;
            }
        }
    }
};