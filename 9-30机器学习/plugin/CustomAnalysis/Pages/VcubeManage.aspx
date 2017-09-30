<%@ Page Title="" Language="C#" MasterPageFile="~/framework/MasterPage.master" AutoEventWireup="true"
    CodeFile="VcubeManage.aspx.cs" Inherits="PlugIn_CustomAnalysis_Pages_VcubeManage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="Server">
    <script src="../../../Javascript/common/openTabPage.js" type="text/javascript"></script>
    <link href="../../../App_Themes/LightBlue/css/btnStyle.css" rel="stylesheet" />
    <link href="../../../App_Themes/LightBlue/css/gridStyle.css" rel="stylesheet" />
    <link href="../../../App_Themes/LightBlue/css/main.css" rel="stylesheet" />
    <link href="../../../App_Themes/LightBlue/css/frame.css" rel="stylesheet" />
    <style type="text/css">
        #divFoot {
            height: 20px;
            width: 100%;
            background-color: rgb(215,226,249);
            padding-top: 2px;
            text-align: center;
        }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="Server">
    <table border="0" cellpadding="4">
        <tr>
            <td>选择分类：
            </td>
            <td>
                <asp:DropDownList ID="ddlCubeFolder" runat="server" AutoPostBack="true" OnSelectedIndexChanged="ddlCubeFolder_SelectedIndexChanged">
                </asp:DropDownList>
            </td>
            <td>
                <asp:LinkButton runat="server" ID="lbtnAddFolder" Text="添加分类" OnClick="lbtnAddFolder_Click"></asp:LinkButton>
            </td>
            <td>
                <asp:LinkButton runat="server" ID="lbtnDelFolder" Text="删除分类" OnClientClick="javascript:return confirm('删除后该分类下的Cube将无分类，确认删除？');" OnClick="lbtnDelFolder_Click"></asp:LinkButton>
            </td>
            <td>
                <asp:LinkButton runat="server" ID="lbtnEditFolder" Text="编辑分类" OnClick="lbtnEditFolder_Click"></asp:LinkButton>
            </td>
            <td>
                <asp:TextBox runat="server" ID="txtFolderName" Visible="false"></asp:TextBox>
            </td>
            <td>
                <asp:Button runat="server" ID="btnAddFolder" Visible="false" Text="添加" OnClick="btnAddFolder_Click"  CssClass="btn80" />
            </td>
            <td>
                <asp:Button runat="server" ID="btnUpdateFolder" Visible="false" Text="更新" OnClick="btnUpdateFolder_Click"  CssClass="btn80" />
            </td>
            <td>
                <asp:Label runat="server" ID="lblMsg" ForeColor="Red"></asp:Label>
            </td>
        </tr>
    </table>
    <asp:GridView ID="gridCube" runat="server" Width="100%" DataKeyNames="ID"
        AutoGenerateColumns="false" EmptyDataText="无数据。" AllowPaging="true"
        OnRowCancelingEdit="gridCube_RowCancelingEdit" ShowHeaderWhenEmpty="true"
        OnRowEditing="gridCube_RowEditing" OnRowUpdating="gridCube_RowUpdating" OnRowDataBound="gridCube_RowDataBound"
        OnRowDeleting="gridCube_RowDeleting" PageSize="20"
        OnDataBound="gridCube_DataBound">
        <Columns>
            <asp:BoundField ItemStyle-Width="20%" ItemStyle-HorizontalAlign="Left" DataField="Name"
                HeaderText="名称" ControlStyle-Width="96%" />
            <asp:TemplateField ItemStyle-Width="20%" HeaderText="分类" ControlStyle-Width="96%">
                <ItemTemplate>
                    <asp:DropDownList ID="ddlCubeFolderInGrid" runat="server">
                    </asp:DropDownList>
                </ItemTemplate>
            </asp:TemplateField>
            <asp:BoundField ItemStyle-Width="30%" ItemStyle-HorizontalAlign="Left" DataField="Explain"
                HeaderText="备注" ControlStyle-Width="96%" />
            <asp:CommandField ItemStyle-Width="9%" ButtonType="Link" ShowEditButton="true" EditText="编辑"
                UpdateText="更新" CancelText="取消" />
            <asp:CommandField ItemStyle-Width="6%" ButtonType="Link" ShowDeleteButton="true"
                DeleteText="删除" />
            <asp:TemplateField>
                <ItemTemplate>
                    <a href="#" onclick="openPageInTab('<%# Eval("Name") %>配置','PlugIn/CustomAnalysis/Pages/VcubeMeaDimNew.aspx?cubeid=<%# Eval("ID") %>');void(0);">指标维度配置</a>
                </ItemTemplate>
            </asp:TemplateField>

        </Columns>
        <PagerSettings Visible="false" />
    </asp:GridView>
    <div id="divFoot">
        <asp:LinkButton ID="lnkbtnFrist" runat="server" OnClick="lnkbtnFrist_Click">首页</asp:LinkButton>
        <asp:LinkButton ID="lnkbtnPre" runat="server" OnClick="lnkbtnPre_Click">前页</asp:LinkButton>
        <asp:Label ID="lblCurrentPage" runat="server"></asp:Label>
        <asp:LinkButton ID="lnkbtnNext" runat="server" OnClick="lnkbtnNext_Click">后页</asp:LinkButton>
        <asp:LinkButton ID="lnkbtnLast" runat="server" OnClick="lnkbtnLast_Click">尾页</asp:LinkButton>
    </div>
    <table cellpadding="4" border="0">
        <tr>
            <td>
                <asp:Button ID="btnAddCube" Text="添加Cube" runat="server" OnClick="btnAddCube_Click" CssClass="btn120" />
            </td>
            <td>
                <asp:Label runat="server" ID="lblCubeAddMsg" ForeColor="Red"></asp:Label></td>
        </tr>
        <tr>
            <td colspan="2">
                <table cellpadding="2" border="0" runat="server" id="tableCubeAdd" visible="false" style="border: 1px solid #eeeeee;">
                    <tr>
                        <td style="width: 100px; text-align: right;">Cube名称：
                        </td>
                        <td>
                            <asp:TextBox ID="txtCubeName" runat="server" Width="180"></asp:TextBox>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: right;">Cube分类：
                        </td>
                        <td>
                            <asp:DropDownList ID="ddlCubeToAddFoler" runat="server" Width="186" Height="20">
                            </asp:DropDownList>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: right; vertical-align: top;">备注：
                        </td>
                        <td>
                            <asp:TextBox ID="txtExplain" runat="server" Width="300" TextMode="MultiLine" Height="60"></asp:TextBox>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" style="text-align: center;">
                            <asp:Button runat="server" ID="btnAddCubeConfirm" OnClick="btnAddCubeConfirm_Click" Text="确定" CssClass="btn80" />
                            <asp:Button runat="server" ID="btnAddCubeCancel" OnClick="btnAddCubeCancel_Click" Text="取消" CssClass="btn80" />
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</asp:Content>
