(function (window) {
    var demoHelp = window.demoHelp || {};

    //判断值是否为空
    var isNullOrEmpty = demoHelp.isNullOrEmpty;
    if (typeof isNullOrEmpty != 'function') {
        isNullOrEmpty = function (p) {
            if (p == undefined || p == null || (typeof (p) == "string" && p == "")) {
                return true;
            }
            else {
                return false;
            }
        }
        demoHelp.isNullOrEmpty = isNullOrEmpty;
    }

    window.demoHelp = demoHelp;
})(window);