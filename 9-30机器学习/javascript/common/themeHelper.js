$themeHelper = function () {
    var themeFolder = "themes/";

    this.getAppRootPath = function () {
        var strFullPath = window.document.location.href;
        var strPath = window.document.location.pathname;
        var pos = strFullPath.indexOf(strPath);
        var prePath = strFullPath.substring(0, pos);
        var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
        return prePath + postPath + "/";
    }

    this.getThemeFolder = function () { return themeFolder; }

    this.getCurrentTheme = function () {
        var currentThemeName = "lightblue";
        var strcookie = document.cookie;
        var arrcookie = strcookie.split(";");
        var userId;
        //遍历cookie数组，处理每个cookie对
        for (var i = 0; i < arrcookie.length; i++) {
            var arr = arrcookie[i].split("=");
            //找到名称为theme的cookie，并返回它的值
            if ("theme" == arr[0]) {
                currentThemeName = arr[1];
                break;
            }
        }
        return currentThemeName;
    }
};

$themeHelper.getCurrentThemeName = function () { return new $themeHelper().getCurrentTheme(); }

$themeHelper.getCurrentThemePath = function () {
    var _self = new $themeHelper();
    return _self.getAppRootPath() + _self.getThemeFolder() + _self.getCurrentTheme();
}

$themeHelper.registerThemeFiles = function (files) {    
    var themeRootPath = $themeHelper.getCurrentThemePath() + "/";
    var list = files.split(',');
    for (var i = 0; i < list.length; i++) {
        var pair = list[i].split(':');
        if (pair.length == 2) {
            $("#" + pair[0]).attr("href", themeRootPath + pair[1]);
        }
    }
}