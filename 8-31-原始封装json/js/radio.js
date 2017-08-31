$(function () {
    $("input[type='radio']").click(function () {
        $("input[type='radio'][name='" + $(this).attr('name') + "']").parent().removeClass("checked");
        $(this).parent().addClass("checked");
    });

    $("#c1").click(function () {
        $("#div2").hide();
        $("#div3").hide();
        $("#div4").hide();
        $("#div1").show();
    })

    $("#c2").click(function () {
        $("#div1").hide();
        $("#div4").hide();
        $("#div3").hide();
        $("#div2").show();
    })

    $("#c3").click(function () {
        $("#div1").hide();
        $("#div2").hide();
        $("#div4").hide();
        $("#div3").show();
    })

    $("#c4").click(function () {
        $("#div1").hide();
        $("#div2").hide();
        $("#div3").hide();
        $("#div4").show();
    })
});