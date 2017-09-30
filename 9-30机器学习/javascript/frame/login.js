function defaultOnLoadEx() {
    document.getElementById("height").value = screen.height, document.getElementById("width").value = screen.width;
}
$(function () {
    function t(e) {
        e.focus(function() {
            if ("text" === e.attr("type")) {
                var n = $("<input/>").attr("id", "password").attr("type", "password").appendTo(e.parent());
                t(n), e.remove(), n.focus();
            }

        }).blur(function() {
            if ("" === e.val()) {
                var n = $("<input/>").attr("id", "password").attr("type", "text").val("密码").appendTo(e.parent());
                t(n), e.remove();
            }

        });
    }
    function e(t) {
        return String.fromCharCode(t >= 97 && 122 >= t ? t - 32 : t >= 65 && 90 >= t ? t + 32 : t >= 48 && 57 >= t ? 57 - t + 48 : t)
    }
    var n = !1;
    $("#userName").focus(function() {
        var t = $(this);
        "用户名" === t.val() && t.val("");
    }).blur(function() {
        var t = $(this);
        "" === t.val() && t.val("用户名");
    }), t($("#password")), $("#confirmButton").bind("click", function() {
        var username = $("#userName").val();
        var password = $("#password").val();
        if ((username.length === 0 || username === "用户名") || (password.length === 0 || password === '密码')) {
            $("#message").empty().text("用户名或密码不能为空！");
            return;
        }
        if (!n) {
            n = !0, $("#message").empty().text("...");
            password = hex_md5(password);
            for (var t = username, a = password, o = $("#width").val(), i = $("#height").val(), r = "", u = 0;
                u < a.length;
                u++) r += e(a.charCodeAt(u));
            var d = "Services/frame/login.ashx";
            ajaxHelper.simpleGet(d, function(t) {
                if ("ok" === t.data) {
                    if (t.gotoPage == null || t.gotoPage.id === "-1" || t.gotoPage.url == null) {
                        window.location = "main.html";
                    } else {
                        var data = '{"name":"' + t.gotoPage.name + '", "id":"' + t.gotoPage.id + '", "url":"' + t.gotoPage.url + '"}';
                        dss.cookie.add("main_data", data);
                        window.location = "default2.html";
                    }
                } else {
                    if (t.status && t.status === 2) {
                        $("#message").text(t.data);
                        setInterval(function() {
                            window.location = 'framework/user/modifypassword.html';
                        }, 1000);
                    } else if (t.status && (t.status === 1 || t.status === 5)) {
                        $("#message").html(t.data); // + "<span class='password'>密码恢复</span>");
                        method.setPassword();
                    } else {
                        if (t.status === 6) {
                            $("#message").text("无法连接数据库，请联系管理员。");
                        } else {
                            $("#message").text(t.data);
                        }
                    }
                }
            }, function() {
                $("#message").text("无法连接数据库，请联系管理员。");
            }, {
                u: t,
                p: r,
                w: o,
                h: i
            }), n = !1;
        }

    }), $("#resetButton").bind("click", function() {
        $("#userName").val(""), $("#password").val(""), $("#message").empty();
    }), $(document).bind("keydown", function() {
        13 === event.keyCode && $("#confirmButton").click();
    });
}), window.onload = function () {
    defaultOnLoadEx();
};
