/**
 * Created by Blad3 on 2017/8/24.
 */
$(function(){
    $("input[type='radio']").click(function(){
        $("input[type='radio'][name='"+$(this).attr('name')+"']").parent().removeClass("checked");
        $(this).parent().addClass("checked");
    });
});