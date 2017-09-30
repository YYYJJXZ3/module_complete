<%@ WebHandler Language="C#" Class="Boco.Dss.CustomAnalysis.Web.Tree" %>

using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using System.Linq;
using System.Web;
using System.Web.SessionState;
using Boco.Dss.CustomAnalysis.Entity;
using Boco.Dss.CustomAnalysis.EntityDB;

namespace Boco.Dss.CustomAnalysis.Web
{
    public class Tree : IHttpHandler, IReadOnlySessionState
    {
        string curListID = "";
        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            context.Response.Buffer = true;
            context.Response.ExpiresAbsolute = DateTime.Now.AddDays(-1);
            context.Response.AddHeader("pragma", "no-cache");
            context.Response.AddHeader("cache-control", "");
            context.Response.CacheControl = "no-cache";
            curListID = context.Request["listid"];
            string dataType = context.Request["datatype"];
            string result = "";
            if (dataType == "DelFolder")
            {
                string folderID = context.Request["folderID"];
                DeleteFolder(folderID);
            }
            else if (dataType == "DelTemp")
            {
                string folderID = context.Request["folderID"];
                string templateID = context.Request["templateID"];
                DeleteTemplate(templateID, folderID);
            }
            else if (dataType == "RenameTemp")
            {
                string id = context.Request["reID"];
                string name = context.Request["reName"];
                string desc = context.Request["reDesc"];
                string sNames = context.Request["sName"];
                result = CheckName(sNames, name);
                if (result == "")
                {
                    ReTemplateName(id, name);
                    ReTemplateDesc(id, desc);
                }
            }
            else if (dataType == "RenameFolder")
            {
                string id = context.Request["reID"];
                string name = context.Request["reName"];
                string sNames = context.Request["sName"];
                result = CheckName(sNames, name);
                if (result == "")
                {
                    UpdateFolderName(id, name);
                    //UpdateFolderDesc(id, desc);//Folder的名字和描述是一个字段
                }
            }
            else if (dataType == "CancelShareTemp")
            {
                string id = context.Request["tempID"];
                CancelShareTemplate(id);
            }
            else if (dataType == "ShareTemp")
            {
                string id = context.Request["tempID"];
                string tempShareName = context.Request["tempShareName"];
                result = ShareTemplate(tempShareName, id);
            }
            else if (dataType == "NewFolder")
            {
                string parentID = HttpContext.Current.Request["parentfolder"];
                string folderName = HttpContext.Current.Request["foldername"];
                string folderSName = HttpContext.Current.Request["foldersname"];
                result = AddFolder(parentID, folderName, folderSName);
            }
            else
            {
                result = GetTreeSource();
            }
            context.Response.Write(result);
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }

        private string GetTreeSource()
        {
            string result = TreeBind();
            return result;
        }


        #region 修改自原TemplateTree.ascx
        string newLine = "&#10;";
        string parent = "{ name:\"[$name]\",tooltip:\"[$tooltip]\" , objid:\"[$objid]\", nodetype:\"[$nodetype]\"  [$url] [$target] , children: [[$child]] [$icon]}";
        string parent1 = "{ name:\"[$name]\",tooltip:\"[$tooltip]\" , objid:\"[$objid]\", nodetype:\"[$nodetype]\" [$url] [$target] , isParent:true [$icon]}";
        string leaf = "{ name:\"[$name]\",tooltip:\"[$tooltip]\", objid:\"[$objid]\", nodetype:\"[$nodetype]\" [$url] [$target] [$icon]}";
        string split = ",";
        string imgShare = "../images/contextmenu/share.gif";
        /// <summary>
        /// 左侧模板树列表的绑定(包括文件夹及文件夹下的模板列表)
        /// </summary>
        /// <param name="Folders"></param>
        public string TreeBind()
        {
            List<Template> Templates = TemplateDB.GetTemplateNameListByUserID( Boco.Dss.Framework.Tool.Env.User.UserID);
            List<TempPath> folderList = TempPathDB.GetTempPathByUserID( Boco.Dss.Framework.Tool.Env.User.UserID);

            string strTreeView = "";
            //绑定自定义报表
            string name = "自定义报表";
            string folderId = "-1";
            string childTemplate = GetChildStr(folderId, Templates, folderList);
            strTreeView = GetNodeDesc(strTreeView, childTemplate, true, name, "", folderId, "", "", "1");

            //绑定共享报表
            List<Template> sharedTemplateList = TemplateDB.GetShareTemplate( Boco.Dss.Framework.Tool.Env.User.UserID);
            string childTemplateShare = BindShareTemplate(sharedTemplateList);
            name = "共享报表";
            folderId = "0";
            strTreeView = GetNodeDesc(strTreeView, childTemplateShare, true, name, "其他人共享的报表", folderId, "", "", "0");

            strTreeView = "[" + strTreeView + "]";
            return strTreeView;
        }

        /// <summary>
        ///  用逗号拼接Node
        /// </summary>
        /// <param name="source"></param>
        /// <param name="child"></param>
        /// <param name="isFolder"></param>
        /// <param name="name"></param>
        /// <param name="tooltip"></param>
        /// <param name="objid"></param>
        /// <param name="url"></param>
        /// <param name="target"></param>
        /// <param name="nodeType">0:"共享报表"; 01: "共享报表"下的报表； 1：“自定义报表”； 2：自定义报表下的所有文件夹； 3：自定义报表下的非共享报表  4:自定义报表下的共享报表</param>
        /// <param name="isShare"></param>
        /// <returns></returns>
        private string GetNodeDesc(string source, string child, bool isFolder, string name, string tooltip, string objid, string url, string target, string nodeType, bool isShare = false)
        {
            if (!string.IsNullOrEmpty(source))
            {
                source += split;
            }
            string img = isShare == true ? (" ,icon:\"" + imgShare + "\" ") : "";
            if (isFolder == false)
            {
                source += FormatString(leaf, name, tooltip, objid, url, target, "", img, nodeType);
            }
            else
            {
                if (string.IsNullOrEmpty(child))
                {
                    source += FormatString(parent1, name, tooltip, objid, url, target, "", img, nodeType);
                }
                else
                {
                    source += FormatString(parent, name, tooltip, objid, url, target, child, img, nodeType);
                }
            }
            return source;
        }

        private string GetChildStr(string parentFolderID, List<Template> templates, List<TempPath> folderList)
        {

            string result = ChildFolder(folderList, templates, parentFolderID);
            if (!string.IsNullOrEmpty(result))
            {
                result += split;
            }
            string template = ChildTemplate(templates, parentFolderID);
            result += template;
            return result;
        }

        /// <summary>
        /// 文件夹下的子目录及模板文件
        /// </summary>
        /// <param name="tn"></param>
        /// <param name="Folders"></param>
        /// <param name="folderid"></param>
        private string ChildFolder(List<TempPath> folderList, List<Template> templateList, string parentFolderID)
        {
            string result = "";
            string name = "";
            string objid = "";
            string tooltip = "";
            string target = "";
            string url = "";
            string child = "";

            List<TempPath> folders = folderList.FindAll(p => p.ParentID == parentFolderID);
            foreach (var root in folders)
            {
                name = root.FolderName;
                objid = root.FolderID;
                tooltip = "创建日期:" + newLine + root.CreateDate + newLine + "描述信息:" + newLine + root.FolderDesc;
                child = GetChildStr(objid, templateList, folderList);
                result = GetNodeDesc(result, child, true, name, tooltip, objid, url, target, "2");
            }
            return result;
        }

        /// <summary>
        /// 绑定模板文件 
        /// </summary>
        /// <param name="tn"></param>
        /// <param name="TemplateFiles"></param>
        /// <param name="folderid"></param>
        private string ChildTemplate(List<Template> templateList, string folderid)
        {
            string strTemplate = "";
            string name = "";
            string objid = "";
            string tooltip = "";
            string target = "";
            string url = "";
            bool isShare = false;
            string nodetype = "";
            List<Template> childTemplateList = templateList.FindAll(p => p.FolderID == folderid);
            foreach (var templateInfo in childTemplateList)
            {
                name = templateInfo.TemplateName;
                objid = templateInfo.TemplateID;
                if (templateInfo.IsShare == "1")
                {
                    tooltip = "共享日期:" + newLine + templateInfo.ShareDate + newLine + "创建日期:" + newLine + templateInfo.CreateDate + newLine + "描述信息:" + newLine + templateInfo.Desc;
                    url = "content.aspx?tabtype=Edit&folderid=" + templateInfo.FolderID + "&templateid=" + templateInfo.TemplateID+"&listid="+curListID;
                    target = "fraMain";
                    isShare = true;
                    nodetype = "4";
                }
                else
                {
                    tooltip = "创建日期:" + newLine + templateInfo.CreateDate + newLine + "描述信息:" + newLine + templateInfo.Desc;
                    url = "content.aspx?tabtype=Edit&folderid=" + templateInfo.FolderID + "&templateid=" + templateInfo.TemplateID+"&listid="+curListID;
                    target = "fraMain";
                    isShare = false;
                    nodetype = "3";
                }
                strTemplate = GetNodeDesc(strTemplate, "", false, name, tooltip, objid, url, target, nodetype, isShare);
            }
            return strTemplate;
        }
        /// <summary>
        /// 绑定共享模板到共享文件夹下
        /// </summary>
        private string BindShareTemplate(List<Template> TemplateFiles)
        {
            string strTemplate = "";
            string name = "";
            string objid = "";
            string tooltip = "";
            string target = "";
            string url = "";

            foreach (var templateInfo in TemplateFiles)
            {
                name = templateInfo.ShareName;
                objid = templateInfo.TemplateID;
                tooltip = "共享用户:" + newLine + templateInfo.UserID + newLine + "共享日期:" + newLine + templateInfo.ShareDate + newLine + "描述信息:" + newLine + templateInfo.Desc;
                url = "content.aspx?tabtype=Edit&folderid=" + templateInfo.FolderID + "&isshare=1&templateid=" + templateInfo.TemplateID;
                target = "fraMain";
                strTemplate = GetNodeDesc(strTemplate, "", false, name, tooltip, objid, url, target, "01");
            }
            return strTemplate;
        }

        private string FormatString(string source, string name, string tooltip, string objid, string url, string target, string child, string icon, string nodeType)
        {
            string tempUrl = "content.aspx?tabtype=New&folderid=" + objid + "&templateid=-1";
            string tempTarget = target == "" ? target : (" ,target:\"" + target + "\" ");
            return source.Replace("[$name]", name)
                         .Replace("[$tooltip]", tooltip)
                         .Replace("[$objid]", objid)
                         .Replace("[$url]", " ,url:\"" + (url == "" ? tempUrl : url) + "\" ")
                         .Replace("[$target]", " ,target:\"fraMain\" ")
                         .Replace("[$icon]", icon)
                         .Replace("[$nodetype]", nodeType)
                         .Replace("[$child]", child); ;
        }
        #endregion

        #region 原Default2.aspx，Default3.aspx中方法
        /// <summary>
        /// 模板更名业务层接口
        /// </summary>
        private void ReTemplateName(string templateID, string templateName)
        {
            TemplateDB.UpdateName(templateID, templateName);
        }
        /// <summary>
        /// 更改模板描述信息接口
        /// </summary>
        private void ReTemplateDesc(string templateID, string templateDesc)
        {
            TemplateDB.UpdateTemplateDesc(templateID, templateDesc);
        }
        /// <summary>
        /// 删除模板表业务层接口
        /// </summary>
        /// <param name="folderID"></param>
        /// <param name="templateID"></param>
        private void DeleteTemplate(string templateID, string folderID)
        {
            TemplateDB.DeleteTemplate(templateID, folderID);
        }
        /// <summary>
        /// 删除Folder表业务层接口
        /// </summary>
        /// <param name="folderID"></param>
        private void DeleteFolder(string folderID)
        {
            TempPathDB.DeleteFolder(folderID);
        }
        /// <summary>
        /// 新建Folder文件夹业务层接口
        /// </summary>
        /// <param name="tempath"></param>
        private void InsertFolder(string folderId, string parentId, string folderName)
        {
            bool bl = IsExistsFolderName(folderName, parentId);
            TempPath tempath = new TempPath();
            tempath.FolderID = folderId;
            tempath.ParentID = parentId;
            tempath.FolderName = folderName;
            tempath.FolderDesc = folderName;
            tempath.IsSys = "1";
            tempath.UserID =  Boco.Dss.Framework.Tool.Env.User.UserID;
            tempath.CreateDate = DateTime.Now.ToString("yyyy-MM-dd hh:mm:ss");
            tempath.IsDelete = "0";

            TempPathDB.InsertFolder(tempath);
        }

        private bool IsExistsFolderName(string folderName, string parentID)
        {
            bool bl = TempPathDB.IsExistsByFolderName(folderName, parentID);
            return bl;

        }

        /// <summary>
        /// 更新文件夹名称
        /// </summary>
        /// <param name="folderID"></param>
        /// <param name="folderName"></param>
        private void UpdateFolderName(string folderID, string folderName)
        {
            TempPathDB.UpdateFolderName(folderID, folderName);
        }
        /// <summary>
        /// 更改文件夹描述信息
        /// </summary>
        /// <param name="folderID"></param>
        /// <param name="folderDesc"></param>
        private void UpdateFolderDesc(string folderID, string folderDesc)
        {
            TempPathDB.UpdateFolderDesc(folderID, folderDesc);
        }

        private void CancelShareTemplate(string templateID)
        {
            TemplateDB.CancelShare(templateID);
        }

        /// <summary>
        /// 共享模板更新模板表相关标识
        /// </summary>
        /// <param name="shareName"></param>
        /// <param name="templateId"></param>
        private string ShareTemplate(string shareName, string templateId)
        {
            string result = "";
            if (IsExistsShareName(shareName))
            {
                result = "共享名称已存在,请重新输入.";
            }
            else
            {
                TemplateDB.Share(shareName, templateId);
            }
            return result;
        }

        /// <summary>
        /// 判断模板名称是否存在
        /// </summary>
        /// <param name="shareName"></param>
        private bool IsExistsShareName(string shareName)
        {
            bool bl = TemplateDB.IsExistByShareName(shareName);
            return bl;
        }

        #endregion

        #region 修改自原ContextMenuHander.ashx
        private string AddFolder(string parentID, string folderName, string folderSName)
        {
            if (string.IsNullOrEmpty(parentID) || string.IsNullOrEmpty(folderName))
            {
                return "名称为空或未选择父目录";
            }
            string check = CheckName(folderSName, folderName);
            if (!string.IsNullOrEmpty(check))
            {
                return check;
            }
            try
            {
                TempPath tp = new TempPath();
                tp.FolderName = folderName;
                tp.ParentID = parentID;
                tp.CreateDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                tp.FolderDesc = folderName;
                tp.UserID = HttpContext.Current.Request["username"];
                tp.FolderID = Boco.CommonToolLibrary.CRC32.GetCRC32(folderName + tp.CreateDate).ToString();
                TempPathDB.InsertFolder(tp);
                return "￥" + tp.FolderID;
            }
            catch (Exception ex)
            {
                return "添加失败:" + ex.Message;
            }
        }
        #endregion

        private string CheckName(string sNames, string name)
        {
            List<string> list = sNames.Split('~').ToList();
            if (list.Contains(name) == true)
            {
                return "同文件夹的报表或文件夹不能重名";
            }
            return "";
        }
    }
}