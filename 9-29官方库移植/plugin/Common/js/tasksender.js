/*!
* jQuery tasksender 1.1.0
* Copyright 2016 BocoDss
* Depends:
*	jquery.ui.core.js
*   jquery.ui.datepicker.js
*   tools.js
*/
(function (window) {
    var work = window.work || {};
    var sendTask = work.sendTask;
    if (typeof sendTask != 'function') {
        sendTask = function (task, completed) {
            var divTask;
            if ($("#divTaskSend").length == 0) {
                divTask = $("<div id='divTaskSend' style='display: none'></div>");
                $(document.body).append(divTask);
            }
            else {
                divTask = $("#divTaskSend");
            }
            divTask.empty();
            divTask.append("<table style='padding:2px;width:600px;'><tr style='padding:2px; height:26px;'><td>工单标题：</td>" +
                "<td colspan='3'><input type='text' id='txtTaskSendTitle' style='width:500px' value='" + task["title"] + "'/></td></tr><tr style='padding:2px;padding-top:4px;'><td style='vertical-align:top;'>工单内容：</td><td colspan='3' id='tdTaskContent'></td></tr><tr style='padding:2px; height:26px;'><td style=''>受理时限：</td><td><input type='text' id='txtTaskAcceptTime' style='width:110px'/></td><td style='width:100px;text-align:right'>处理时限：</td><td><input type='text' id='txtTaskCompleteTime' style='width:110px'/>" +
                "</td></tr><tr style='padding:2px; height:28px;'><td>派往部门：</td><td colspan='3'><select id='ddlSendDept'></select></td></tr></table>");
            var acceptdate = new Date();
            acceptdate.setDate(acceptdate.getDate() + 3);
            var completedate = new Date();
            completedate.setDate(completedate.getDate() + 7);
            var datePickOpt = {
                dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"],
                monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月',
            '七月', '八月', '九月', '十月', '十一月', '十二月'],
                prevText: '上月',
                nextText: '下月',
                dateFormat: "yy年mm月dd日",
                changeMonth: true,
                changeYear: true,
                maxDate: "+2M +0D",
                showOtherMonths: true,
                selectOtherMonths: true,
                firstDay: 1
            };
            
            $("#ddlSendDept").load(dss.rootPath + "plugin/Common/ashx/Task.ashx?qtype=dept");
            if (task["iswrite"] != "0") {
                $("#tdTaskContent", divTask).append($("<div  id='divTaskContent' contenteditable='true' style='width: 510px;overflow:auto; height: 220px;padding:2px;border:1px solid #aaaaaa;'>" + task["content"] + "</div>"));
            } else {
                $("#txtTaskSendTitle", divTask).prop("disabled", true);
                $("#tdTaskContent", divTask).append($("<div id='divTaskContent' style='width: 510px; height: 220px;overflow:auto;'>" + task["content"] + "</div>"));
            }
            
            divTask.dialog({
                height: 406,
                width: 640,
                modal: true, //蒙层（弹出会影响页面大小
                title: "派单",
                open:function(event, ui){  
                    $(this).parent().focus();  
                },//取消获取焦点
                buttons: {
                    "确定": function () {
                        
                        task["content"] = $("#divTaskContent").html();
                        var taskStr = {
                            systemName: "QOS",
                            status: 0,
                            title: $("#txtTaskSendTitle", divTask).val(),
                            content: "",
                            networktype: "",
                            alarmEvent: "1",
                            eventTime: "",
                            interfaceType: "",
                            neType: "",
                            neLabel: "",
                            region: "",
                            is_success: "0",
                            is_execute: "0",
                            levels: "2",
                            create_time: "",
                            acceptTime: $("#txtTaskAcceptTime", divTask).timepicker("getDateStr") + $("#txtTaskAcceptTime", divTask).timepicker("getHourStr"),
                            comepeteTime: $("#txtTaskCompleteTime", divTask).timepicker("getDateStr") + $("#txtTaskCompleteTime", divTask).timepicker("getHourStr"),
                            dept: $("#ddlSendDept").val()
                        }
                        $.extend(taskStr, task);
                        var defaultTask = dss.jsonToString(taskStr);
                        $.ajax({
                            url: dss.rootPath + "plugin/Common/ashx/Task.ashx?qtype=save",
                            type: 'post',
                            data: { Task: defaultTask },
                            dataType: 'text',
                            success: function (data) {
                                if (data != null) {
                                    completed(data);
                                } else {
                                    alert("返回数据为空");
                                }
                            }
                        });
                        if (typeof yes == 'function') {

                        }
                        divTask.dialog("close");
                    },
                    "取消": function () {
                        divTask.dialog("close");
                        if (typeof no == 'function') {
                            no();
                        }
                    }
                }
            });
            $("#txtTaskAcceptTime", divTask).timepicker({
                showTypeMonth: false,
                showTypeDay: false,
                showTypeHour: true,
                defaultTimeType: "Hour",
                defaultDateStr: acceptdate.format("yyyy年MM月dd日"),
                defaultHourStr: "12时",
                datePickerOptions: datePickOpt
            });
            $("#txtTaskCompleteTime", divTask).timepicker({
                showTypeMonth: false, showTypeDay: false,
                showTypeHour: true,
                defaultTimeType: "Hour",
                defaultDateStr: completedate.format("yyyy年MM月dd日"),
                defaultHourStr: "12时",
                datePickerOptions: datePickOpt
            });
        }
        work.sendTask = sendTask;
    }
    window.work = work;
})(window);
