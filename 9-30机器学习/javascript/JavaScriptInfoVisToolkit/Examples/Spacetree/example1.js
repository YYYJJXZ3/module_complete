var labelType, useGradients, nativeTextSupport, animate;
 

var Log = {
    elem: false,
    write: function (text) {
        if (!this.elem)
            this.elem = document.getElementById('log');
        this.elem.innerHTML = text;
        this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
    }
};
function nano(template, data) {
    return template.replace(/\{([\w\.]*)\}/g,
        function (str, key) {
            var keys = key.split("."), v = data[keys.shift()];
            for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
            return (typeof v !== "undefined" && v !== null) ? v : "";
        });
}
var tpl = '<span>{name}({unit}): {value}</span><br /><span>环比: {ratio}%</span>';
function init() {
    
    var json = {
        id: "node02",
        name: tpl,
        data: { name: '收入43', unit: '元', value: 2000, ratio: -3.9 },
        children: [{
            id: "node13",
            name: "1.3",
            data: {},
            children: [{
                id: "node24",
                name: "2.4",
                data: {},
                children: [{
                    id: "node35",
                    name: "3.5",
                    data: {},
                    children: [{
                        id: "node46",
                        name: "4.6",
                        data: {},
                        children: []
                    }]
                }, {
                    id: "node37",
                    name: "3.7",
                    data: {},
                    children: [{
                        id: "node48",
                        name: "4.8",
                        data: {},
                        children: []
                    }, {
                        id: "node49",
                        name: "4.9",
                        data: {},
                        children: []
                    }, {
                        id: "node410",
                        name: "4.10",
                        data: {},
                        children: []
                    }, {
                        id: "node411",
                        name: "4.11",
                        data: {},
                        children: []
                    }]
                }, {
                    id: "node312",
                    name: "3.12",
                    data: {},
                    children: [{
                        id: "node413",
                        name: "4.13",
                        data: {},
                        children: []
                    }]
                }, {
                    id: "node314",
                    name: "3.14",
                    data: {},
                    children: [{
                        id: "node415",
                        name: "4.15",
                        data: {},
                        children: []
                    }, {
                        id: "node416",
                        name: "4.16",
                        data: {},
                        children: []
                    }, {
                        id: "node417",
                        name: "4.17",
                        data: {},
                        children: []
                    }, {
                        id: "node418",
                        name: "4.18",
                        data: {},
                        children: []
                    }]
                }, {
                    id: "node319",
                    name: "3.19",
                    data: {},
                    children: [{
                        id: "node420",
                        name: "4.20",
                        data: {},
                        children: []
                    }, {
                        id: "node421",
                        name: "4.21",
                        data: {},
                        children: []
                    }]
                }]
            }, {
                id: "node222",
                name: "2.22",
                data: {},
                children: [{
                    id: "node323",
                    name: "3.23",
                    data: {},
                    children: [{
                        id: "node424",
                        name: "4.24",
                        data: {},
                        children: []
                    }]
                }]
            }]
        }, {
            id: "node125",
            name: "1.25",
            data: {},
            children: [{
                id: "node226",
                name: "2.26",
                data: {},
                children: [ ]
            }, {
                id: "node237",
                name: "2.37",
                data: {},
                children:  []
            }, {
                id: "node258",
                name: "2.58",
                data: {},
                children: [{
                    id: "node359",
                    name: "3.59",
                    data: {},
                    children:  []
                }]
            }]
        }, {
            id: "node165",
            name: "1.65",
            data: {},
            children: [{
                id: "node266",
                name: "2.66",
                data: {},
                children:  []
            }, {
                id: "node283",
                name: "2.83",
                data: {},
                children: [{
                    id: "node384",
                    name: "3.84",
                    data: {},
                    children: [{
                        id: "node485",
                        name: "4.85",
                        data: {},
                        children: []
                    }]
                }, {
                    id: "node386",
                    name: "3.86",
                    data: {},
                    children: []
                }, {
                    id: "node392",
                    name: "3.92",
                    data: {},
                    children: [{
                        id: "node493",
                        name: "4.93",
                        data: {},
                        children: []
                    }, {
                        id: "node494",
                        name: "4.94",
                        data: {},
                        children: []
                    }, {
                        id: "node495",
                        name: "4.95",
                        data: {},
                        children: []
                    }, {
                        id: "node496",
                        name: "4.96",
                        data: {},
                        children: []
                    }]
                }, {
                    id: "node397",
                    name: "3.97",
                    data: {},
                    children: [{
                        id: "node498",
                        name: "4.98",
                        data: {},
                        children: []
                    }]
                }, {
                    id: "node399",
                    name: "3.99",
                    data: {},
                    children:  []
                }]
            }, {
                id: "node2104",
                name: "2.104",
                data: {},
                children:  []
            }, {
                id: "node2109",
                name: "2.109",
                data: {},
                children: [{
                    id: "node3110",
                    name: "3.110",
                    data: {},
                    children: [{
                        id: "node4111",
                        name: "4.111",
                        data: {},
                        children: []
                    }, {
                        id: "node4112",
                        name: "4.112",
                        data: {},
                        children: []
                    }]
                }, {
                    id: "node3113",
                    name: "3.113",
                    data: {},
                    children: [{
                        id: "node4114",
                        name: "4.114",
                        data: {},
                        children: []
                    }, {
                        id: "node4115",
                        name: "4.115",
                        data: {},
                        children: []
                    }, {
                        id: "node4116",
                        name: "4.116",
                        data: {},
                        children: []
                    }]
                }, {
                    id: "node3117",
                    name: "3.117",
                    data: {},
                    children: []
                }, {
                    id: "node3122",
                    name: "3.122",
                    data: {},
                    children: [{
                        id: "node4123",
                        name: "4.123",
                        data: {},
                        children: []
                    }, {
                        id: "node4124",
                        name: "4.124",
                        data: {},
                        children: []
                    }]
                }]
            }, {
                id: "node2125",
                name: "2.125",
                data: {},
                children:  []
            }]
        }, {
            id: "node1130",
            name: "1.130",
            data: {},
            children:  []
        }]
    };
    //end
    //init Spacetree
    //Create a new ST instance
    var st = new $jit.ST({
        //id of viz container element
        injectInto: 'infovis',
        //set duration for the animation
        duration: 800,
        //set animation transition type
        transition: $jit.Trans.Quart.easeInOut,
        //set distance between node and its children
        levelDistance: 50,
        //enable panning
        Navigation: {
            enable: true,
            panning: true
        },
        //set node and edge styles
        //set overridable=true for styling individual
        //nodes or edges
        Node: {
            height: 50,
            width: 80,
            type: 'rectangle',
            color: '#aaa',
            overridable: true
        },

        Edge: {
            type: 'bezier',
            overridable: true
        },

        onBeforeCompute: function (node) {
            Log.write("loading " + node.name);
        },

        onAfterCompute: function () {
            Log.write("done");
        },

        //This method is called on DOM label creation.
        //Use this method to add event handlers and styles to
        //your node.
        onCreateLabel: function (label, node) {
            label.id = node.id;
            label.innerHTML =   nano(node.name, node.data);
            label.onclick = function () {
                if (normal.checked) {
                    st.onClick(node.id);
                } else {
                    st.setRoot(node.id, 'animate');
                }
            };
            //set label styles
            var style = label.style;
            style.width = 60 + 'px';
            style.height = 17 + 'px';
            style.cursor = 'pointer';
            style.color = '#333';
            style.fontSize = '0.8em';
            style.textAlign = 'center';
            style.paddingTop = '3px';
        },

        //This method is called right before plotting
        //a node. It's useful for changing an individual node
        //style properties before plotting it.
        //The data properties prefixed with a dollar
        //sign will override the global node style properties.
        onBeforePlotNode: function (node) {
            //add some color to the nodes in the path between the
            //root node and the selected node.
            if (node.selected) {
                node.data.$color = "#ff7";
            }
            else {
                delete node.data.$color;
                //if the node belongs to the last plotted level
                if (!node.anySubnode("exist")) {
                    //count children number
                    var count = 0;
                    node.eachSubnode(function (n) { count++; });
                    //assign a node color based on
                    //how many children it has
                    node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];
                }
            }
        },

        //This method is called right before plotting
        //an edge. It's useful for changing an individual edge
        //style properties before plotting it.
        //Edge data proprties prefixed with a dollar sign will
        //override the Edge global style properties.
        onBeforePlotLine: function (adj) {
            if (adj.nodeFrom.selected && adj.nodeTo.selected) {
                adj.data.$color = "#eed";
                adj.data.$lineWidth = 3;
            }
            else {
                delete adj.data.$color;
                delete adj.data.$lineWidth;
            }
        }
    });
    //load json data
    st.loadJSON(json);
    //compute node positions and layout
    st.compute();
    //optional: make a translation of the tree
    st.geom.translate(new $jit.Complex(-200, 0), "current");
    //emulate a click on the root node.
    st.onClick(st.root);
    //end
    //Add event handlers to switch spacetree orientation.
    var top = $jit.id('r-top'),
        left = $jit.id('r-left'),
        bottom = $jit.id('r-bottom'),
        right = $jit.id('r-right'),
        normal = $jit.id('s-normal');


    function changeHandler() {
        if (this.checked) {
            top.disabled = bottom.disabled = right.disabled = left.disabled = true;
            st.switchPosition(this.value, "animate", {
                onComplete: function () {
                    top.disabled = bottom.disabled = right.disabled = left.disabled = false;
                }
            });
        }
    };

    top.onchange = left.onchange = bottom.onchange = right.onchange = changeHandler;
    //end

}
