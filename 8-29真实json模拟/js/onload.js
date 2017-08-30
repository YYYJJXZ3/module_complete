function append() {
    $.getJSON("js/data.json", function (data) {
        var $jsontip = $("#jsonTip");

        // 排序测试
        function sortByKey(array, key) {
            return array.sort(function (a, b) {
                var x = a[key];
                var y = b[key];
                return ((x > y) ? -1 : ((x < y) ? 1 : 0));
            });
        }

        console.dir(data);
        var newdata = $.extend({}, data.data);
        newdata.rows = [];
        $.each(data.data.rows, function (i, r) {
            var item = {};
            $.each(r.cells, function (j, c) {
                item["col" + j] = c;
            })
            newdata.rows.push(item);
        })


        console.dir(newdata.rows);
        newdata = sortByKey(newdata.rows, 'col1');
        // console.log(cells[1]);


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
        $.each($('tr').slice(1, 11), function (i, item) {
            $(item).children('td').eq(0).children('b').css("background-color", "#3590de");
        });

        $.each($('tr').slice(1, 7), function (i, item) {
            $(item).children('td').eq(1).css("color", "#0002c0");
        });
    })
}


