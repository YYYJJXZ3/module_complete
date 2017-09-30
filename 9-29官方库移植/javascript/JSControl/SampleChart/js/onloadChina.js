// 排序
function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}


function appendD1() {
    $.getJSON("js/dataChina.json", function (data) {
        var $jsontip = $("#jsonTip1");

        var newdata = $.extend({}, data.data);
        newdata.rows = [];

        $.each(data.data.rows, function (i, r) {
            var item = {};
            $.each(r.cells, function (j, c) {
                item["col" + j] = c;
            })
            newdata.rows.push(item);
        })

        newdata = sortByKey(newdata.rows, 'col1');


        // 绘制
        var strHtml = "";//存储数据的变量
        $jsontip.empty();//清空内容
        $.each(newdata, function (infoIndex, info) {
            strHtml += `
            <tr>
              <td><b class="roleNum">${infoIndex + 1}</b></td>
              <td>${info["col0"]}</td>
              <td>${info["col1"]}</td>
                      </tr>
          `;
        })
        $jsontip.html(strHtml);//显示处理后的数据


        // 前十个tr中，第一个td中的b，设置背景样式。
        $.each($('#div1 tr').slice(1, 11), function (i, item) {
            $(item).children('td').eq(0).children('b').css("background-color", "#3590de");
        });

        $.each($('#div1 tr').slice(1, 7), function (i, item) {
            $(item).children('td').eq(1).css("color", "#0002c0");
        });
    })
}

function appendD2() {

    $.getJSON("js/dataChina.json", function (data) {
        var $jsontip = $("#jsonTip2");

         var newdata = $.extend({}, data.data);
        newdata.rows = [];

        $.each(data.data.rows, function (i, r) {
            var item = {};
            $.each(r.cells, function (j, c) {
                item["col" + j] = c;
            })
            newdata.rows.push(item);
        })

        newdata = sortByKey(newdata.rows, 'col2');


        // 绘制
        var strHtml = "";//存储数据的变量
        $jsontip.empty();//清空内容
        $.each(newdata, function (infoIndex, info) {
            strHtml += `
            <tr>
              <td><b class="roleNum">${infoIndex + 1}</b></td>
              <td>${info["col0"]}</td>
              <td>${info["col2"]}</td>
                      </tr>
          `;
        })
        $jsontip.html(strHtml);//显示处理后的数据


        $.each($('#div2 tr').slice(1, 5), function (i, item) {
            $(item).children('td').eq(0).children('b').css("background-color", "#3590de");
        });

        $.each($('#div2 tr').slice(1, 3), function (i, item) {
            $(item).children('td').eq(1).css("color", "#0002c0");
        });
    })
}

function appendD3() {
    $.getJSON("js/dataChina.json", function (data) {
        var $jsontip = $("#jsonTip3");

        var newdata = $.extend({}, data.data);
        newdata.rows = [];

        $.each(data.data.rows, function (i, r) {
            var item = {};
            $.each(r.cells, function (j, c) {
                item["col" + j] = c;
            })
            newdata.rows.push(item);
        })

        newdata = sortByKey(newdata.rows, 'col3');


        // 绘制
        var strHtml = "";//存储数据的变量
        $jsontip.empty();//清空内容
        $.each(newdata, function (infoIndex, info) {
            strHtml += `
            <tr>
              <td><b class="roleNum">${infoIndex + 1}</b></td>
              <td>${info["col0"]}</td>
              <td>${info["col3"]}</td>
                      </tr>
          `;
        })
        $jsontip.html(strHtml);//显示处理后的数据


        $.each($('#div3 tr').slice(1, 8), function (i, item) {
            $(item).children('td').eq(0).children('b').css("background-color", "#3590de");
        });

        $.each($('#div3 tr').slice(1, 5), function (i, item) {
            $(item).children('td').eq(1).css("color", "#0002c0");
        });
    })
}

function appendD4() {
    $.getJSON("js/dataChina.json", function (data) {
        var $jsontip = $("#jsonTip4");

        var newdata = $.extend({}, data.data);
        newdata.rows = [];

        $.each(data.data.rows, function (i, r) {
            var item = {};
            $.each(r.cells, function (j, c) {
                item["col" + j] = c;
            })
            newdata.rows.push(item);
        })

        newdata = sortByKey(newdata.rows, 'col4');


        // 绘制
        var strHtml = "";//存储数据的变量
        $jsontip.empty();//清空内容
        $.each(newdata, function (infoIndex, info) {
            strHtml += `
            <tr>
              <td><b class="roleNum">${infoIndex + 1}</b></td>
              <td>${info["col0"]}</td>
              <td>${info["col4"]}</td>
                      </tr>
          `;
        })
        $jsontip.html(strHtml);//显示处理后的数据


        $.each($('#div4 tr').slice(1, 9), function (i, item) {
            $(item).children('td').eq(0).children('b').css("background-color", "#3590de");
        });

        $.each($('#div4 tr').slice(1, 6), function (i, item) {
            $(item).children('td').eq(1).css("color", "#0002c0");
        });
    })
}




