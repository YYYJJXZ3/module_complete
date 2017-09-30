//部门复选框级联效果
var onChanging = false;
function tree_onNodeCheckChange(sender, eventArgs) {
    var ckNode = eventArgs.get_node(); //得到选中的节点   
    if (ckNode.Checked) {
        ckNode.CheckAll();
        ckNode.ExpandAll();

    }
    else {
        ckNode.UnCheckAll();
        ckNode.ExpandAll();
    }
    CheckParentNode(ckNode);
}
//选中子节点的时候,选中父节点   
function CheckParentNode(node) {
    var pNode = node.GetParentNode()
    if (pNode != null) {
        var hasNoChecked = false;
        for (var i = 0; i < pNode.Nodes().length; i++) {
            if (!pNode.Nodes()[i].Checked) { //如果同级节点 且全部选中 则选中节点
                hasNoChecked = true;
                break;
            }
        }
        if (hasNoChecked) {
            pNode.set_checked(false);
        } else {
            pNode.set_checked(true);
        }
        CheckParentNode(pNode);
    }
}
 