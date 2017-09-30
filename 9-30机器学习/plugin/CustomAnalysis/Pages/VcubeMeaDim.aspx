<%@ Page Title="" Language="C#" MasterPageFile="~/framework/MasterPage.master" AutoEventWireup="true"
    CodeFile="VcubeMeaDim.aspx.cs" Inherits="PlugIn_CustomAnalysis_Pages_VcubeMeaDim" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="Server">
    <link href="../../../App_Themes/LightBlue/css/btnStyle.css" rel="stylesheet" />
    <link href="../../../App_Themes/LightBlue/css/gridStyle.css" rel="stylesheet" />
    <link href="../../../App_Themes/LightBlue/css/main.css" rel="stylesheet" />
    <link href="../../../App_Themes/LightBlue/css/frame.css" rel="stylesheet" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="Server">
    <asp:Label runat="server" ID="lblMsg" Visible="false"></asp:Label><input type="hidden"
        runat="server" id="hiddenCubeID" />
    <table border="0">
        <tr>
            <td style="width: 360px;">
                <table border="0" cellpadding="2" width="100%">
                    <tr>
                        <td style="width:80px; text-align:right;">
                            选择专题：
                        </td>
                        <td>
                            <asp:DropDownList ID="ddlTheme" runat="server" AutoPostBack="true" OnSelectedIndexChanged="ddlTheme_SelectedIndexChanged">
                            </asp:DropDownList>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <div style="height: 480px; overflow: auto; border: 1px solid #dddddd;">
                                <div style="margin-left: 5px; margin-top: 5px;">
                                    <asp:DropDownList ID="ddlFactTable" runat="server" AutoPostBack="true" OnSelectedIndexChanged="ddlFactTable_SelectIndexChanged">
                                    </asp:DropDownList>
                                </div>
                                <div style="margin-left: 5px; margin-top: 5px;">
                                    指标：
                                    <asp:TextBox ID="txtIndex" runat="server"></asp:TextBox>
                                    <asp:Button ID="btnSearch" runat="server" Text="查询" CssClass="btn_search" OnClick="btnSearch_Click" />
                                </div>
                                <div>
                                    <asp:CheckBox runat="server" AutoPostBack="true" ID="chkAllMeasure" Text="全选指标" OnCheckedChanged="chkAllMeasure_CheckedChanged" />
                                    <asp:CheckBox runat="server" AutoPostBack="true" ID="chkAllDimension" Text="全选维度"
                                        OnCheckedChanged="chkAllDimension_CheckedChanged" /></div>
                                <asp:TreeView ID="tvCubeOriginal" runat="server" ShowCheckBoxes="Leaf" Width="300px">
                                </asp:TreeView>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
            <td width="90px" align="center">
                <table width="100%">
                    <tr>
                        <td align="center">
                            <asp:Button ID="btnAdd" runat="server" CssClass="btn80" Text="添加>>" 
                                OnClick="btnAdd_Click" />
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <asp:Button ID="btnDel" runat="server" CssClass="btn80" Text="<<删除" 
                                OnClick="btnDel_Click" />
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <asp:Button ID="btnSave" runat="server" CssClass="btn80" Text="保存"  OnClick="btnSave_Click" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <asp:Label ID="lblMessage" runat="server" ForeColor="Red"></asp:Label>
                        </td>
                    </tr>
                </table>
            </td>
            <td style="width: 360px;">
                <table border="0" cellpadding="2" width="100%">
                    <tr>
                        <td style="width:80px; text-align:right;">
                            Cube名称：
                        </td>
                        <td>
                            <asp:Label runat="server" ID="lblCubeName"></asp:Label>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <div style="height: 480px; overflow: auto; border: 1px solid #dddddd;">
                                <asp:TreeView ID="tvCubeNewly" runat="server" ShowCheckBoxes="Leaf" Width="300px">
                                </asp:TreeView>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</asp:Content>
