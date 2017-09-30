$requestHelper = function () { }

$requestHelper.queryString = function (key) {
    if (key == undefined || key == null)
        return "";
    var data = location.search.match(new RegExp("[\?\&]" + key + "=([^\&]+)", "i"));

    if (data == null || data.length != 2) {
        return "";
    }
    else {
        return data[1];
    }
}