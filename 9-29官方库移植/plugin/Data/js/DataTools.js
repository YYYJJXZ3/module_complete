var dataMethods = {
    //获取页面权限
    getPagePower: function (listid, fun) {
        var strSql = "select list_id ID,is_query 查询权限,is_edit 修改权限,is_export 导出权限 from app_page_power where list_id=" + listid;

        var opt = {
            Type: "0",
            ConnStr: "SQL_ConnStr",
            SQL: strSql
        };
        $.ajax({
            url: "../ashx/Data.ashx",
            data: {
                strCon: dss.jsonToString(opt)
            },
            dataType: "json",
            success: function (data) {
                fun(data);
            }
        });
    },
    //判断值是否为空
    isNullProperty: function (p) {
        if (p == undefined || p == null || (typeof (p) == "string" && (p == "" || p == "全部"))) {
            return true;
        }
        else {
            return false;
        }
    }
}