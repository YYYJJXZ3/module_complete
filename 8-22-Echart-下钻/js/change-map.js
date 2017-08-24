$(function(){
    changeMap();

    $('[js-tab=1]').tab({
        curDisplay: 1,
        changeMethod: 'horizontal'
    });

    $("input[type='radio']").click(function(){
        $("input[type='radio'][name='"+$(this).attr('name')+"']").parent().removeClass("checked");
        $(this).parent().addClass("checked");
    });
})


function changeMap(){
    var myChart= echarts.init(document.getElementById('map'));
    option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}'
        },
        series: [
            {
                name: '中国',
                type: 'map',
                mapType: 'china',
                selectedMode : 'single',
                label: {
                    normal: {
                        show: true
                    },
                    emphasis: {
                        show: true
                    }
                },
                data:[

                ]
            }
        ]
    };
    var Province = "";

    myChart.on('click', function (params){
        var myChart= echarts.init(document.getElementById('map'));
        Province = params.name;
        option = {
            tooltip: {
                trigger: 'item',
                formatter: '{b}'
            },
            series: [
                {
                    name: '中国',
                    type: 'map',
                    mapType: Province,
                    selectedMode : 'single',
                    label: {
                        normal: {
                            show: true
                        },
                        emphasis: {
                            show: true
                        }
                    },
                    data:[

                    ]
                }
            ]
        };

        myChart.on('click', function (params){
            changeMap();
        });

        //绘制省级
        myChart.setOption(option);
        window.addEventListener("resize",function(){
            myChart.resize();
        });
    });

    // 绘制全国
    myChart.setOption(option);
    window.addEventListener("resize",function(){
        myChart.resize();
    });
}
