function jsonToString(obj) {
    var THIS = this;
    switch (typeof (obj)) {
        case 'string':
            return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';
        case 'array':
            return '[' + obj.map(jsonToString).join(',') + ']';
        case 'object':
            if (obj instanceof Array) {
                var strArr = [];
                var len = obj.length;
                for (var i = 0; i < len; i++) {
                    strArr.push(jsonToString(obj[i]));
                }
                return '[' + strArr.join(',') + ']';
            } else if (obj == null) {
                return 'null';

            } else {
                var string = [];
                for (var property in obj) string.push(jsonToString(property) + ':' + jsonToString(obj[property]));
                return '{' + string.join(',') + '}';
            }
        case 'number':
            return obj;
        default:
            return obj;
    }
}

var Show = {
    alert: function (msg) {
        var id = new Date().getTime();
        var div = $("<div id=\"" + id + "\" style=\"diaplay:none\"></div>");
        $(document.body).append(div);
        $("#" + id).dialog({
            title: "提示信息",
            width: 320,
            modal: true,
            open: function () {
                $("#" + id).html(msg);
            },
            buttons: {
                "确定": function () {
                    $("#" + id).remove();
                }
            }
        })
    },
    confirm: function (msg) {
        var id = new Date().getTime();
        var div = $("<div id=\"" + id + "\" style=\"diaplay:none\"></div>");
        $(document.body).append(div);
        $("#" + id).dialog({
            title: "提示信息",
            width: 320,
            open: function () {
                $("#" + id).html(msg);
            },
            buttons: {
                "确定": function () {
                    $("#" + id).remove();
                    return true;
                },
                "取消": function () {
                    $("#" + id).remove();
                    return false;
                }
            }
        })
    }
};