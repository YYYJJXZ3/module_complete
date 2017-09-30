<%@ Page Language="C#" AutoEventWireup="true" CodeFile="CsvList.aspx.cs" Inherits="PlugIn_CustomAnalysis_Pages_CsvList" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
    <div>
    <a  runat="server" id="linkBack">返回</a>
        <asp:GridView ID="gridCsv" runat="server" onrowcommand="gridCsv_RowCommand" Width="100%"></asp:GridView>
    </div>
    </form>
</body>
</html>
