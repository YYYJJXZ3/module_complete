<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Subscribe.aspx.cs" Inherits="PlugIn_CustomAnalysis_Pages_Subscribe" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
    <div>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
                <td>
                    <table cellpadding="0" cellspacing="0" border="0" id="stable">
                        <tr>
                            <td class="stable_left">
                            </td>
                            <td class="stable_mid_02" style="width: 70px;">
                                已订阅报表
                            </td>
                            <td class="stable_mid_02" style="text-align: left;" align="left">
                            </td>
                            <td class="stable_right">
                            </td>
                        </tr>
                    </table>
                    <asp:GridView ID="gridSubscribe" Width="100%" runat="server" DataKeyNames="TemplateID"
                        AutoGenerateColumns="false" OnRowCommand="gridSubscribe_RowCommand" OnRowDataBound="gridSubscribe_RowDataBound">
                        <Columns>
                            <asp:BoundField DataField="TemplateName" HeaderText="报表名" />
                            <asp:BoundField DataField="DateType" HeaderText="生成周期" />
                            <asp:BoundField DataField="SendTimeString" HeaderText="生成时间" />
                            <asp:BoundField DataField="SendType" HeaderText="发送方式" />
                            <asp:ButtonField ButtonType="Image" ImageUrl="../../../App_Themes/LightBlue/images/ico/document_letter_edit.png"
                                CommandName="Setting" HeaderText="编辑" Text="编辑" CausesValidation="false" />
                            <asp:ButtonField ButtonType="Image" ImageUrl="../../../App_Themes/LightBlue/images/ico/cross.png"
                                CommandName="DelRss" HeaderText="删除" Text="删除" CausesValidation="false" />
                            <asp:TemplateField HeaderText="下载">
                                <ItemTemplate>
                                    <a href="CsvList.aspx?userid=<%#Eval("UserID") %>&reportid=<%#Eval("TemplateID") %>">
                                        <img style="border: 0;" alt="下载" src="../../../App_Themes/LightBlue/images/ico/document-table.png"
                                            title="有新文件" id="Img1" runat="server" visible='<%#Eval("HasRead").ToString()=="False"?true:false %>' /><img
                                                id="Img2" style="border: 0;" alt="下载" src="../../../App_Themes/LightBlue/images/ico/document-text.png"
                                                runat="server" visible='<%#Eval("HasRead").ToString()=="False"?false:true %>' /></a>
                                </ItemTemplate>
                            </asp:TemplateField>
                        </Columns>
                    </asp:GridView>
                </td>
            </tr>
        </table>
        <div runat="server" id="divSetting">
            <table cellpadding="0" cellspacing="0" border="0" id="stable">
                <tr>
                    <td class="stable_left">
                    </td>
                    <td class="stable_mid_02" style="width: 70px;">
                        订阅编辑：
                    </td>
                    <td class="stable_mid_02" style="text-align: left;" align="left">
                        <asp:Label runat="server" ID="lblTempName" Text=""></asp:Label>
                        <asp:HiddenField ID="hideTempID" runat="server" />
                    </td>
                    <td class="stable_right">
                    </td>
                </tr>
            </table>
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                    <td>
                        <table class="table" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td style="width: 100px" align="right">
                                    周期：
                                </td>
                                <td>
                                    <asp:DropDownList ID="ddlDateType" runat="server" Width="100px" OnSelectedIndexChanged="ddlDateType_SelectedIndexChanged"
                                        AutoPostBack="true">
                                        <asp:ListItem Text="月" Value="Month"></asp:ListItem>
                                        <asp:ListItem Text="周" Value="Week"></asp:ListItem>
                                        <asp:ListItem Text="日" Value="Day"></asp:ListItem>
                                        <asp:ListItem Text="立即" Value="Now"></asp:ListItem>
                                    </asp:DropDownList>
                                </td>
                                <td align="right">
                                    日期：
                                </td>
                                <td>
                                    <asp:DropDownList ID="ddlDate" runat="server" Width="100px">
                                    </asp:DropDownList>
                                </td>
                            </tr>
                            <tr>
                                <td align="right">
                                    时间：
                                </td>
                                <td>
                                    <asp:DropDownList ID="ddlTime" runat="server" Width="100px">
                                    </asp:DropDownList>
                                </td>
                                <td align="right">
                                    类型：
                                </td>
                                <td>
                                    <asp:DropDownList ID="ddlSendType" runat="server" Width="100px">
                                        <asp:ListItem Text="不发送" Value="NotSend"></asp:ListItem>
                                        <asp:ListItem Text="HTML" Value="Html"></asp:ListItem>
                                        <asp:ListItem Text="CSV" Value="Csv"></asp:ListItem>
                                    </asp:DropDownList>
                                </td>
                            </tr>
                            <tr>
                                <td valign="top" align="right">
                                    抄送：
                                </td>
                                <td colspan="3" valign="top">
                                    <asp:TextBox ID="txtCC" runat="server" Width="300px"></asp:TextBox><br />
                                    抄送多人以“;”分隔
                                </td>
                            </tr>
                        </table>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td align="center" style="padding-top: 2px;">
                                    <asp:Button ID="btnOK" runat="server" Text="确认" CssClass="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"
                                        OnClick="btnOK_Click" />
                                    &nbsp;<asp:Label runat="server" ID="lblError" Text="" Visible="false"></asp:Label>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
        <div style="text-align: right;">
            <asp:LinkButton ID="lbtnAddCurReport" runat="server" OnClick="lbtnAddCurReport_Click"
                Text="添加当前报表"></asp:LinkButton></div>
    </div>
    </form>
</body>
</html>
