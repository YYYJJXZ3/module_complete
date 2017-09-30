var uiHelper = {
    showMessage: function (message,option) {
        var maskControl = $("<div></div>")
            //.css("background-color","pink")
            .css("width", "100%")
            .css("height", "100%")
            .css("position", "absolute")
            .css("left", "0")
            .css("top", "0")
            .appendTo($(document.body));
        option = $.extend({
            width: 320,
            height: 180,
            title:"信息提示"
        }, option);

        var left = (maskControl.width() - option.width) / 2 - 50;
        var top = (maskControl.height() - option.height) / 2 -50;

        $("<div></div>")
            .css("position", "absolute")
            .css("left", left)
            .css("top", top)
            .css("border","5px solid #ccc")
            .css("width", option.width)
            .css("height", option.height)
            .append(
                $("<div></div>")
                .text(option.title)
            )
            .text(message)
            .appendTo(maskControl);
    }

}