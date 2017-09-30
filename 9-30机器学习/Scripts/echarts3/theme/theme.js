function echartTheme() {
    var commonTheme = {
        // 默认色板
        color: [
            "#7CB5EC",//蓝色
            "#FFD39B",//浅棕色
            "#00FFAA",//绿色
            "#FF83FA",//紫色
            "#C6E2FF",//天蓝色
            "#FF7F50",//橙色
            "#FFE957",//黄色
            "#3FE0D0",//蓝绿色
            "#FFAEB9",//浅红色
            "#CD5D5C",//咖啡色
            "#9932CC",//深紫色
            "#71C671",//深绿色
            "#CCCCCC",//灰色
            "#36648B",//墨蓝色
            "#00FF00",//亮绿色
            "#FF0000"//红色
        ],

        // 图表标题
        title: {
            textStyle: {
                fontWeight: 'normal',
                color: '#008acd'          // 主标题文字颜色
            }
        },

        // 值域
        dataRange: {
            itemWidth: 15,
            color: ['#5ab1ef', '#e0ffff']
        },

        // 工具箱
        toolbox: {
            color: ['#1e90ff', '#1e90ff', '#1e90ff', '#1e90ff'],
            effectiveColor: '#ff4500'
        },

        legend: {
            textStyle: {
                color: "#000000"
            }
        },

        // 提示框
        tooltip: {
            backgroundColor: 'rgba(50,50,50,0.5)',     // 提示背景颜色，默认为透明度为0.7的黑色
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'line',         // 默认为直线，可选为：'line' | 'shadow'
                lineStyle: {          // 直线指示器样式设置
                    color: '#008acd'
                },
                crossStyle: {
                    color: '#008acd'
                },
                shadowStyle: {                     // 阴影指示器样式设置
                    color: 'rgba(200,200,200,0.2)'
                }
            }
        },

        // 区域缩放控制器
        dataZoom: {
            dataBackgroundColor: '#efefff',            // 数据背景颜色
            fillerColor: 'rgba(182,162,222,0.2)',   // 填充颜色
            handleColor: '#008acd'    // 手柄颜色
        },

        // 网格
        grid: {
            borderColor: '#eee'
        },

        // 类目轴
        categoryAxis: {
            axisLabel: {
                textStyle: {
                    color: '#000000'
                }
            },
            axisLine: {            // 坐标轴线
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: '#008acd'
                }
            },
            splitLine: {           // 分隔线
                show: true,
                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                    color: ['#eee']
                }
            }
        },

        // 数值型坐标轴默认参数
        valueAxis: {
            nameTextStyle: {
                color: '#000000'
            },
            axisLabel: {
                textStyle: {
                    color: '#000000'
                }
            },
            axisLine: {            // 坐标轴线
                show: true,
                lineStyle: {       // 属性lineStyle控制线条样式
                    width: 1,
                    color: '#008acd'
                }
            },
            axisTick: {
                show: false
            },
            splitArea: {
                show: true,
                areaStyle: {
                    color: ['rgba(255,255,255,0.1)', 'rgba(200,200,200,0.1)']
                }
            },
            splitLine: {           // 分隔线
                show: true,
                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                    color: ['#eee']
                }
            }
        },

        polar: {
            axisLine: {            // 坐标轴线
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: '#ddd'
                }
            },
            splitArea: {
                show: true,
                areaStyle: {
                    color: ['rgba(250,250,250,0.2)', 'rgba(200,200,200,0.2)']
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#ddd'
                }
            }
        },

        timeline: {
            lineStyle: {
                color: '#008acd'
            },
            controlStyle: {
                normal: { color: '#008acd' },
                emphasis: { color: '#008acd' }
            },
            symbol: 'emptyCircle',
            symbolSize: 3
        },

        // 柱形图默认参数
        //bar: {
        //    itemStyle: {
        //        normal: {
        //            barBorderRadius: 5
        //        },
        //        emphasis: {
        //            barBorderRadius: 5
        //        }
        //    }
        //},

        // 折线图默认参数
        line: {
            smooth: true,
            symbol: 'emptyCircle',  // 拐点图形类型
            symbolSize: 3           // 拐点图形大小
        },

        // K线图默认参数
        k: {
            itemStyle: {
                normal: {
                    color: '#d87a80',       // 阳线填充颜色
                    color0: '#2ec7c9',      // 阴线填充颜色
                    lineStyle: {
                        color: '#d87a80',   // 阳线边框颜色
                        color0: '#2ec7c9'   // 阴线边框颜色
                    }
                }
            }
        },

        // 散点图默认参数
        scatter: {
            symbol: 'circle',    // 图形类型
            symbolSize: 4        // 图形大小，半宽（半径）参数，当图形为方向或菱形则总宽度为symbolSize * 2
        },

        // 雷达图默认参数
        radar: {
            symbol: 'emptyCircle',    // 图形类型
            symbolSize: 3
            //symbol: null,         // 拐点图形类型
            //symbolRotate : null,  // 图形旋转控制
        },

        map: {
            roam: false,
            itemStyle: {
                normal: {
                    areaStyle: {
                        color: '#CCCCCC'//无数据时的颜色
                    },
                    label: {
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    borderColor: 'rgba(255, 255, 255,1)',
                    borderWidth: 0.5
                },
                emphasis: {// 也是选中样式
                    areaColor: '',
                    borderColor: 'rgba(255, 255, 255,1)',
                    borderWidth: 2
                }
            }
        },

        geo: {
            label: {
                normal: {
                    show: true,
                    textStyle: {
                        color: '#fff'
                    }
                },
                emphasis: {
                    show: true,
                    textStyle: {
                        color: '#fff'
                    }
                }
            },
            roam: false,
            itemStyle: {
                normal: {
                    areaColor: 'transparent',
                    borderColor: "rgba(255, 255, 255,1)",
                    borderWidth: 0.5
                },
                emphasis: {
                    areaColor: '',
                    borderColor: "rgba(255, 255, 255,1)",
                    borderWidth: 2
                }
            }
        },

        force: {
            itemStyle: {
                normal: {
                    linkStyle: {
                        color: '#1e90ff'
                    }
                }
            }
        },

        chord: {
            itemStyle: {
                normal: {
                    borderWidth: 1,
                    borderColor: 'rgba(128, 128, 128, 0.5)',
                    chordStyle: {
                        lineStyle: {
                            color: 'rgba(128, 128, 128, 0.5)'
                        }
                    }
                },
                emphasis: {
                    borderWidth: 1,
                    borderColor: 'rgba(128, 128, 128, 0.5)',
                    chordStyle: {
                        lineStyle: {
                            color: 'rgba(128, 128, 128, 0.5)'
                        }
                    }
                }
            }
        },

        gauge: {
            axisLine: {            // 坐标轴线
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: [[0.2, '#2ec7c9'], [0.8, '#5ab1ef'], [1, '#d87a80']],
                    width: 10
                }
            },
            axisTick: {            // 坐标轴小标记
                splitNumber: 10,   // 每份split细分多少段
                length: 15,        // 属性length控制线长
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: 'auto'
                }
            },
            splitLine: {           // 分隔线
                length: 22,         // 属性length控制线长
                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                    color: 'auto'
                }
            },
            pointer: {
                width: 5
            }
        },

        textStyle: {
            fontFamily: '微软雅黑, Arial, Verdana, sans-serif'
        }
    };

    var lightblue = {
        // 默认色板
        color: [
            "#7CB5EC",//蓝色
            '#FFD39B',//浅棕色
            '#00FFAA',//绿色
            '#FF83FA',//紫色
            '#C6E2FF',//天蓝色
            '#FF7F50',//橙色
            '#FFE957',//黄色
            "#3FE0D0",//蓝绿色
            '#FFAEB9',//浅红色
            '#CD5D5C',//咖啡色
            "#9932CC",//深紫色
            "#71C671",//深绿色
            "#CCCCCC",//灰色
            "#36648B",//墨蓝色
            '#00FF00',//亮绿色
            '#FF0000'//红色
        ]
    };

    var custom = {
        color: ["#30BBAD", "#B7A2DD", "#50A6CC", "#FF7651", "#7287CD", "#FF9A55", "#96B454", "#8C97B2", "#F8B514", "#DB69A9"]
    };

    var cmcc_dark = {
        // 默认色板
        color: [
            "#7CB5EC", "#90EC7D", "#F7A35B", "#FF69B3", "#3FE0D0",
            '#dc69aa', '#CD5D5C', '#FF7F50', '#6395EC', '#DA70D5',
            '#32CD33', '#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050',
            '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089'
        ],

        // 图表标题
        title: {
            textStyle: {
                fontWeight: 'normal',
                color: '#008acd'          // 主标题文字颜色
            }
        },

        // 值域
        dataRange: {
            itemWidth: 15,
            color: ['#5ab1ef', '#e0ffff']
        },

        // 工具箱
        toolbox: {
            color: ['#1e90ff', '#1e90ff', '#1e90ff', '#1e90ff'],
            effectiveColor: '#ff4500'
        },

        legend: {
            textStyle: {
                color: "#ffffff"
            }
        },

        visualMap: {
            textStyle: {
                color: '#fff'
            }
        },

        // 提示框
        tooltip: {
            backgroundColor: 'rgba(50,50,50,0.5)',     // 提示背景颜色，默认为透明度为0.7的黑色
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'line',         // 默认为直线，可选为：'line' | 'shadow'
                lineStyle: {          // 直线指示器样式设置
                    color: '#008acd'
                },
                crossStyle: {
                    color: '#008acd'
                },
                shadowStyle: {                     // 阴影指示器样式设置
                    color: 'rgba(200,200,200,0.2)'
                }
            }
        },

        // 区域缩放控制器
        dataZoom: {
            dataBackgroundColor: '#efefff',            // 数据背景颜色
            fillerColor: 'rgba(182,162,222,0.2)',   // 填充颜色
            handleColor: '#008acd'    // 手柄颜色
        },

        // 网格
        grid: {
            borderColor: '#eee'
        },

        // 类目轴
        categoryAxis: {
            axisLabel: {
                textStyle: {
                    color: '#ffffff'
                }
            },
            axisLine: {            // 坐标轴线
                lineStyle: {       // 属性lineStyle控制线条样式
                    width: 1,
                    color: '#76BEFF'
                }
            },
            splitLine: {           // 分隔线
                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                    width: 1,
                    color: ['#76BEFF']
                }
            },
            axisTick: {
                lineStyle: {
                    color: '#76BEFF',
                    width: 1
                }
            }
        },

        // 数值型坐标轴默认参数
        valueAxis: {
            axisLabel: {
                textStyle: {
                    color: '#ffffff'
                }
            },
            axisLine: {            // 坐标轴线
                lineStyle: {       // 属性lineStyle控制线条样式
                    width: 1,
                    color: '#76BEFF'
                }
            },
            splitArea: {
                show: true,
                areaStyle: {
                    color: ['rgba(255,255,255,0.1)', 'rgba(200,200,200,0.1)']
                }
            },
            splitLine: {           // 分隔线
                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                    width: 1,
                    color: '#76BEFF'
                }
            }
        },

        polar: {
            name: {
                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    color: '#ffffff'
                }
            },
            axisLine: {            // 坐标轴线
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: '#ddd'
                }
            },
            splitArea: {
                show: false,
                areaStyle: {
                    color: ['rgba(250,250,250,0.2)', 'rgba(200,200,200,0.2)']
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#ddd'
                }
            }
        },

        timeline: {
            lineStyle: {
                color: '#008acd'
            },
            controlStyle: {
                normal: { color: '#008acd' },
                emphasis: { color: '#008acd' }
            },
            symbol: 'emptyCircle',
            symbolSize: 3
        },

        // 柱形图默认参数
        bar: {
            itemStyle: {
                normal: {
                    barBorderRadius: 0
                },
                emphasis: {
                    barBorderRadius: 0
                }
            }
        },

        // 折线图默认参数
        line: {
            smooth: true,
            symbol: 'emptyCircle',  // 拐点图形类型
            symbolSize: 3           // 拐点图形大小
        },

        // K线图默认参数
        k: {
            itemStyle: {
                normal: {
                    color: '#d87a80',       // 阳线填充颜色
                    color0: '#2ec7c9',      // 阴线填充颜色
                    lineStyle: {
                        color: '#d87a80',   // 阳线边框颜色
                        color0: '#2ec7c9'   // 阴线边框颜色
                    }
                }
            }
        },

        // 散点图默认参数
        scatter: {
            symbol: 'circle',    // 图形类型
            symbolSize: 4        // 图形大小，半宽（半径）参数，当图形为方向或菱形则总宽度为symbolSize * 2
        },

        // 雷达图默认参数
        radar: {
            symbol: 'emptyCircle',    // 图形类型
            symbolSize: 3
            //symbol: null,         // 拐点图形类型
            //symbolRotate : null,  // 图形旋转控制
        },

        map: {
            roam: false,
            itemStyle: {
                normal: {
                    areaColor: 'rgba(0,0,0,0)',
                    label: {
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    borderColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 1
                },
                emphasis: {// 也是选中样式
                    areaColor: '',
                    borderColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 2
                }
            }
        },

        geo: {
            label: {
                normal: {
                    show: true,
                    textStyle: {
                        color: '#fff'
                    }
                },
                emphasis: {
                    show: true,
                    textStyle: {
                        color: '#fff'
                    }
                }
            },
            roam: false,
            itemStyle: {
                normal: {
                    areaColor: 'transparent',
                    borderColor: "rgba(100,149,237,1)",
                    borderWidth: 1
                },
                emphasis: {
                    areaColor: 'transparent',
                    borderColor: "rgba(100,149,237,1)",
                    borderWidth: 2
                }
            }
        },

        force: {
            itemStyle: {
                normal: {
                    linkStyle: {
                        color: '#1e90ff'
                    }
                }
            }
        },

        chord: {
            itemStyle: {
                normal: {
                    borderWidth: 1,
                    borderColor: 'rgba(128, 128, 128, 0.5)',
                    chordStyle: {
                        lineStyle: {
                            color: 'rgba(128, 128, 128, 0.5)'
                        }
                    }
                },
                emphasis: {
                    borderWidth: 1,
                    borderColor: 'rgba(128, 128, 128, 0.5)',
                    chordStyle: {
                        lineStyle: {
                            color: 'rgba(128, 128, 128, 0.5)'
                        }
                    }
                }
            }
        },

        gauge: {
            axisLine: {            // 坐标轴线
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: [[0.2, '#2ec7c9'], [0.8, '#5ab1ef'], [1, '#d87a80']],
                    width: 10
                }
            },
            axisTick: {            // 坐标轴小标记
                splitNumber: 10,   // 每份split细分多少段
                length: 15,        // 属性length控制线长
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: 'auto'
                }
            },
            splitLine: {           // 分隔线
                length: 22,         // 属性length控制线长
                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                    color: 'auto'
                }
            },
            pointer: {
                width: 5
            }
        },

        textStyle: {
            fontFamily: '微软雅黑, Arial, Verdana, sans-serif'
        }
    };
    var infographic = {
        color: [
        '#C1232B', '#B5C334', '#FCCE10', '#E87C25', '#27727B',
        '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
        '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
        ]
    };
    var macarons = {
        color: [
            '#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80',
            '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa',
            '#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050',
            '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089'
        ]
    };
    var cmcc = {
        color: [
            '#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80',
            '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa',
            '#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050',
            '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089'
        ]
    }

    this.getTheme = function (name) {
        if (name == "infographic") {
            infographic = $.extend(true, commonTheme, infographic);
            return infographic;
        }
        else if (name == "macarons") {
            macarons = $.extend(true, commonTheme, macarons);
            return macarons;
        }
        else if (name == "lightblue") {
            lightblue = $.extend(true, commonTheme, lightblue);
            return lightblue;
        }
        else if (name == "cmcc_dark") {
            cmcc_dark = $.extend(true, commonTheme, cmcc_dark);
            return cmcc_dark;
        }
        else if (name == "custom") {
            custom = $.extend(true, commonTheme, custom);
            return custom;
        }
        else if (name == "cmcc") {
            cmcc = $.extend(true, commonTheme, cmcc);
            return cmcc;
        }
        else {
            lightblue = $.extend(true, commonTheme, lightblue);
            return lightblue;
        }
    }
}