$(function () {
    var splitter = $("#splitter"),
        lefepane = $("#leftPane"),
        mainPane = $("#main");
    if (splitter.length == 0
        || lefepane.length == 0
        || mainPane.length ==0)
        return;

    var movable = false;
    var x = undefined;

    splitter.mousedown(function(e){
        movable = true;
        x = (e || window.event).offsetX;
    }).mouseup(function (e) {
        movable = false;
    }).mouseout(function () {
        movable = false;
    });

    $(document).mousemove(function (e) {
        if (!movable)
            return;
        splitter.attr("left", e.clientX - x);
    }).mouseup(function () {
        movable = false;
    });
});