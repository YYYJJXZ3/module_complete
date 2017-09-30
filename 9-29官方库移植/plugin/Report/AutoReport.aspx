<%@ Page Language="C#" AutoEventWireup="true" CodeFile="AutoReport.aspx.cs" Inherits="_AutoReport" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>自动报告浏览</title>
    <link rel="shortcut icon" href="../../App_Themes/Default/images/report/Report.ico" />
</head>
<body>
    <form id="form1" runat="server">
    <div>
        <asp:ScriptManager ID="ScriptManager1" runat="server" EnablePartialRendering="true">
        </asp:ScriptManager>
        <asp:UpdatePanel runat="server" UpdateMode="conditional" ID="dd">
            <ContentTemplate>
                <table height="100%" cellspacing="0" cellpadding="0" width="99%" border="1">
                    <tbody>
                        <tr>
                            <td valign="top" width="250px">
                                <div style="overflow: auto; width: 240px; height: 500px;" id="divTreeView" s>
                                    <asp:TreeView ID="TreeView1" runat="server" ExpandDepth="2" NodeIndent="20"
                                        OnSelectedNodeChanged="TreeView1_SelectedNodeChanged" ShowLines="false">
                                        <NodeStyle Font-Names="Arial" Font-Size="8pt" HorizontalPadding="5" />
                                        <RootNodeStyle Font-Bold="True" Font-Size="9pt" />
                                        <ParentNodeStyle Font-Bold="true" Font-Size="9pt" />
                                        <HoverNodeStyle Font-Underline="True" />
                                        <SelectedNodeStyle BorderWidth="0" Font-Bold="true" ForeColor="Red" />
                                        <DataBindings>
                                        </DataBindings>
                                    </asp:TreeView>
                                </div>
                            </td>
                            <td valign="top">
                                <asp:GridView ID="GV" runat="server" Width="100%" AllowSorting="True" 
                                    AutoGenerateColumns="False" PageSize="20">
                                    <Columns>
                                        <asp:TemplateField>
                                            <ItemTemplate>
                                                <img src='<%# Eval("image") %>' width="16" border="0" />
                                            </ItemTemplate>
                                            <ItemStyle Width="10px"></ItemStyle>
                                        </asp:TemplateField>
                                        
                                        <asp:TemplateField HeaderText="报告名称">
                                            
                                            <ItemTemplate>
                                                <asp:HyperLink ID="Linkdoc" NavigateUrl='<%# Eval("url") %>' __designer:wfdid="w5"
                                                    CssClass="fakehlink" runat="server" Target="_blank"><%# Eval("name")%></asp:HyperLink>
                                            </ItemTemplate>
                                            <ItemStyle HorizontalAlign="Left"></ItemStyle>
                                        </asp:TemplateField>
                                        <asp:BoundField DataField="createtime" HeaderText="生成时间">
                                            <ItemStyle HorizontalAlign="Center" />
                                        </asp:BoundField>
                                        <asp:BoundField DataField="size" HeaderText="文件大小">
                                            <ItemStyle HorizontalAlign="Right" />
                                        </asp:BoundField>
                                        <asp:TemplateField HeaderText="下载">
                                            <ItemTemplate>
                                                <asp:HyperLink CssClass="fakehlink" Target="_blank" NavigateUrl='<%# Eval("url") %>'
                                                    runat="server" ID="linkDownload">
	    下载
                                                </asp:HyperLink>
                                            </ItemTemplate>
                                            <ItemStyle HorizontalAlign="Center" Width="150px"></ItemStyle>
                                        </asp:TemplateField>
                                    </Columns>
                                </asp:GridView>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </ContentTemplate>
        </asp:UpdatePanel>
    </div>
    </form>
</body>
</html>
