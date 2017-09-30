<%@ WebHandler Language="C#" Class="DimensionHandler" %>

using System;
using System.Web;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Boco.Semantic.Entity;
using Boco.Semantic.EntityDB;
using Boco.CommonToolLibrary;

public class DimensionHandler : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        string queryType = context.Request.QueryString["type"];
        if (queryType == "hier")
        {
            context.Response.Write(GetHierarchy(context.Request.QueryString["dimid"],context.Request.QueryString["level"]));
        }
        else if (queryType == "dim")
        {
            context.Response.Write(GetHierarchiesFromMeasusre(context.Request["meaid"]));
        }
        else
        {
            context.Response.Write("Hello World");
        }
    }

    private string GetHierarchiesFromMeasusre(string meaID)
    {
        Sem_Measure sm = MeasureDB.GetMeasureByID(meaID);
        if (sm == null)
        {
            return "";
        }
        else
        {
            List<Item> itemList = new List<Item>();
            foreach (Sem_Dimension sd in sm.RelatedDimensionList)
            {
                Item itemDim = new Item(sd.Name, sd.ID);
                foreach (Hierarchie hier in sd.Hierarchies)
                {
                    Item itemHier = new Item(hier.Name, hier.ID);
                    foreach (Level lvl in hier.Levels)
                    {
                        Item itemLvl = new Item(lvl.Name, lvl.ID);
                        itemHier.Items.Add(itemLvl);
                    }
                    itemDim.Items.Add(itemHier);
                }
                foreach (Level lvl in sd.Levels)
                {
                    Item itemLvl = new Item(lvl.Name, lvl.ID);
                    itemDim.Items.Add(itemLvl);
                }
                itemList.Add(itemDim);
            }
            return new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(itemList);
        }
    }


    private string GetHierarchy(string dimensionID)
    {
        List<Item> itemList = new List<Item>();
        List<Sem_Dimension> sdList = DimensionDB.GetDimensionByListID(dimensionID.Split(',').ToList<string>());
        foreach (Sem_Dimension sd in sdList)
        {
            if (sd.Hierarchies.Count > 0)
            {
                Item itemDim = new Item(sd.Name, sd.ID);
                foreach (Hierarchie hier in sd.Hierarchies)
                {
                    Item itemHier = new Item(hier.Name, hier.ID);
                    foreach (Level lvl in hier.Levels)
                    {
                        Item itemLvl = new Item(lvl.Name, lvl.ID);
                        itemHier.Items.Add(itemLvl);
                    }
                    itemDim.Items.Add(itemHier);
                }
                itemList.Add(itemDim);
            }
        }
        return new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(itemList);
    }

    private string GetHierarchy(string dimensionID,string levelName)
    {
        Sem_Dimension sd = DimensionDB.GetDimensionByID(dimensionID);
        List<Item> itemList = new List<Item>();
        if (sd != null && sd.Hierarchies.Count > 0)
        {
            foreach (Hierarchie hier in sd.Hierarchies)
            {
                if (hier.Levels.FindIndex(p => p.Name == levelName) >= 0)
                {
                    Item itemHier = new Item(hier.Name, hier.ID);
                    foreach (Level lvl in hier.Levels)
                    {
                        Item itemLvl = new Item(lvl.Name, lvl.ID);
                        itemHier.Items.Add(itemLvl);
                    }
                    itemList.Add(itemHier);
                }
            }
        }
        return Item2Li(itemList);
    }

    private string Item2Li(List<Item> itemList)
    {
        StringBuilder sb = new StringBuilder();
        foreach (Item item in itemList)
        {
            sb.Append("<li><a href='#'>");
            sb.Append(item.Name);
            sb.Append("</a>");
            if (item.Items.Count > 0)
            {
                sb.Append("<ul>");
                sb.Append(Item2Li(item.Items));
                sb.Append("</ul>"); 
            }
            sb.Append("</li>");
        }
        return sb.ToString();
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

    public class Item
    {
        public Item()
        {
            Items = new List<Item>();
        }

        public Item(string name, string value)
        {
            Name = name;
            Value = value;
            Items = new List<Item>();
        }
        
        public string Name
        {
            get;
            set;
        }

        public string Value
        {
            get;
            set;
        }

        public List<Item> Items
        {
            get;
            set;
        }
    }

}