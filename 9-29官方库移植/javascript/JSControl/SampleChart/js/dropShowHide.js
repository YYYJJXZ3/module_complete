 $(document).ready(function(){
        $("#hide").click(function(){
            $("p").fadeOut("normal");
            $("#show").fadeIn("normal").animate({top:"2px"});
        });

        $("#show").click(function(){
            $("#show").animate({top:"-12px"},666).fadeOut("normal");
            $("p").fadeIn("normal");
         });
    });