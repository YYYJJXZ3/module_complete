/// <reference path="../JSControl/Condition/mulselect.js" />
(function ($) {
    $.fn.extend
    ({
        createConditionManager: function (options) {
            options = $.extend(
            {
                showTopSelectControl: true,
                defaultControlType: "single",
                theme: '', // 主题I名称
                dependencyOptions: '' //粒度项之间有先后顺序的请用该参数设置
            }, options);

            //
            //  Public APIs
            //
            var controlMethod_Names = [];
            controlMethod_Names.push(getSelectControlNames);
            controlMethod_Names.push(getSelectControlNames);
            controlMethod_Names.push(getTextBoxControlText);
            var controlMethod_Ids = [];
            controlMethod_Ids.push(getSelectControlIds);
            controlMethod_Ids.push(getSelectControlIds);
            controlMethod_Ids.push(getTextBoxControlText);
            this.getSelectedCondition = function () {
                if (!thisControlValid) {
                    return ["无效控件，无法得到相应的数据。"];
                }
                if (selectedTopLevels == undefined || avaliableSelectControls == undefined || selectedTopLevels.length != avaliableSelectControls.length) {
                    return ["无效选择，无法得到相应的数据。"];
                }

                var result = '[';
                var lengthOfSelectedItems = avaliableSelectControls.length;
                for (var i = 0; i < lengthOfSelectedItems; i++) {
                    var data = selectedTopLevels[i].split(delimiterString);
                    var levelName = data[3];
                    var levelControlType = data[0];
                    var methodIndex = $.inArray(levelControlType, supportedControlTypes);
                    var selectedLevelNames = controlMethod_Names[methodIndex](avaliableSelectControls[i]); //avaliableSelectControls[i].commonSelect("getSelNames");
                    var selectedLevelIds = controlMethod_Ids[methodIndex](avaliableSelectControls[i]); //avaliableSelectControls[i].commonSelect("getSelIds");

                    result += '{"key":"' + levelName+'","dimid":"'+ data[4] + '","Ids":"' + selectedLevelIds + '","values":"' + selectedLevelNames + '"}';
                    if (i < lengthOfSelectedItems - 1) {
                        result += ',';
                    }
                }
                result += ']';
                return $.parseJSON(result);
            };

            function getSelectControlNames(control) {
                return control.commonSelect("getSelNames");
            }
            function getSelectControlIds(control) {
                return control.commonSelect("getSelIds");
            }
            function getTextBoxControlText(control) {
                return control.val();
            }
            //
            //  Public APIs end
            //

            //
            // Global variable definition
            //
            var supportedControlTypes = ["single", "multiple", "text"];
            var delimiterString = tools.delimiterString();
            var parseOptionItemsResult = "";
            var parent = $(this);
            var thisControlValid = true;
            var avaliableSelectControls = [];
            // 以下两个变量用来同步处理上次选中的粒度和已经创建好的下拉控件。
            var selectedTopLevels = [];
            var existedSelectControls = [];
            var levelItems = [];
            var defaultLevelItems = [];
            //  依赖关系列表
            var dependencyList = new hashTable();
            var dependentOnList = new hashTable();
            //
            // End of Global variable definition
            //

            //
            // parse all option items
            //
            //if (options.theme == undefined || options.theme == "") {
            //    outputError("主题无效。", this);
            //    thisControlValid = false;
            //    return this;
            //}
            //
            parseLevelItems(levelItems, defaultLevelItems);
            // 解析配置项里面的数据
            function parseLevelItems(levelItems, defaultShowLevelItems) {
                if (options.items == undefined || options.items.length < 1) {
                    outputError("粒度定义无效。", parent);
                    thisControlValid = false;
                    return;
                }

                $.map(options.items, function (item) {
                    if (item != null && item.dimension != undefined && typeof (item.dimension) == "string" && item.levels != undefined) {
                        $.map(item.levels, function (levelItem) {
                            // control type
                            var tempControlType = "undefined";
                            if (levelItem.controlType != undefined && typeof (levelItem.controlType) == "string")
                                tempControlType = levelItem.controlType;
                            else if (options.defaultControlType != undefined && typeof (options.defaultControlType) == "string")
                                tempControlType = options.defaultControlType;
                            var tempId = tempControlType + delimiterString + options.theme + delimiterString + item.dimension + delimiterString + levelItem.level + delimiterString + item.dimid;
                            var tempSelected;
                            if (levelItem.selected != undefined) {
                                tempSelected = $.map(levelItem.selected, function (tempItem) { return { id: tempItem.id, name: tempItem.name, state: true }; });
                            }
                            var tempLevel = {
                                id: tempId,
                                controlType: tempControlType,
                                theme: options.theme,
                                dimension: item.dimension,
                                dimid:item.dimid,
                                level: levelItem.level,
                                selected: tempSelected
                            };
                            var tempLevelStatus = parseLevel(tempLevel);
                            if (tempLevelStatus.length > 0) {
                                if (parseOptionItemsResult.length > 0)
                                    parseOptionItemsResult += "," + tempLevelStatus;
                                else
                                    parseOptionItemsResult = tempLevelStatus;
                            }
                            else {
                                if (levelItem.defaultShow || levelItem.alwaysShow) {
                                    defaultLevelItems.push(tempLevel);
                                }
                                if (!levelItem.alwaysShow) {
                                    levelItems.push(tempLevel);
                                }
                            }
                        });
                    }
                });
            }

            function parseLevel(level) {
                if (!parseControlType(level.controlType)) {
                    return level.level + "控件类型" + level.controlType + "无效";
                }

                return "";
            }

            function parseControlType(controlType) {
                if (controlType == undefined || typeof (controlType) != "string")
                    return false;
                var controlTypeIndex = $.inArray(controlType, supportedControlTypes);

                return controlTypeIndex > -1;
            }

            parseDependency(dependencyList, dependentOnList);

            function parseDependency(dependency, dependentOn) {
                if (options.dependencyOptions == undefined)
                    return;
                var dependencyType = typeof (options.dependencyOptions);
                if (dependencyType.toLowerCase() == "object") {
                    var length = options.dependencyOptions.length;
                    //
                    if (length == undefined) { //单个依赖项对象
                        tools.parseDependencyTree(options.dependencyOptions, dependency, dependentOn);
                    }
                    else { // 数组形式的依赖对象
                        $.each(options.dependencyOptions, function (index, item) {
                            tools.parseDependencyTree(item, dependency, dependentOn);
                        });
                    }
                }
            }

            var endlessLoopMessage = tools.findEndlessLoopItems(dependentOnList);
            if (endlessLoopMessage.length > 0) {
                $('<span style="float:left;">endless loop</span>').appendTo(parent);
            }

            // 添加总容器
            var rootContainer = $('<div></div>').appendTo(parent);

            if (parseOptionItemsResult.length > 0) {
                cancelRenderConditionControl(parseOptionItemsResult, rootContainer);
                return this;
            }

            // 添加左侧下拉列表控件的容器
            var leftPartContainer = $('<div style="float:left;padding-left:0px;padding-right:0px;margin-right:10px;"></div>').appendTo(rootContainer);

            // 添加左侧的下拉列表控件
            if (options.showTopSelectControl && levelItems.length > 0) {
                var selectControl = $('<select style="width:120px;"></select>').appendTo(leftPartContainer);
                var tempLevelItems = $.map(levelItems, function (item) {
                    return { text: item.level, value: item.id };
                });
                makeSelectControlToMultipleSelectControl(selectControl, tempLevelItems, topLevelSelectChange, defaultLevelItems);
            }
            // 添加默认显示的控件
            var controlContainer = parent;
            createDefaultLevelControls(defaultLevelItems, controlContainer);
            //定义 Change事件
            function OnTopSelectControlChanged(newSelectedText) {
                if (null != options.onTopSelectControlChanged && undefined != options.onTopSelectControlChanged) {
                    options.onTopSelectControlChanged(newSelectedText);
                }
            }
            // 创建默认显示的下拉列表
            function createDefaultLevelControls(defaultLevelItems, controlContainer) {
                $.map(defaultLevelItems, function (level) {
                    if (level != undefined) {
                        createConditionControl(level, controlContainer);
                    }
                });
            }

            function createConditionControl(level, controlContainer) {
                var option = createControlOption(level);
                //
                var tempContainer = $('<div style="float:left;margin-right:10px;margin-bottom:4px;"></div>').appendTo(controlContainer);
                $('<span style="margin-right:3px;">' + level.level + '：</span>').appendTo(tempContainer);
                var tempControl = "";
                switch (level.controlType.toLowerCase()) {
                    case "single":
                        tempControl = createSelectBoxControl($.extend({ selectmode: "single" }, option), tempContainer);
                        break;
                    case "multiple":
                        tempControl = createSelectBoxControl($.extend({ selectmode: "multiple" }, option), tempContainer);
                        break;
                    case "text":
                        tempControl = createTextBoxControl(tempContainer);
                        if (option.initValues != undefined && option.initValues.length > 0) {
                            var defaultValue = "";
                            $.map(option.initValues, function (item) { defaultValue += item.name; });
                            tempControl.val(defaultValue);
                        }
                        break;
                }
                selectedTopLevels.push(level.id);
                existedSelectControls.push(tempContainer);
                avaliableSelectControls.push(tempControl);
            }

            function createControlOption(level) {
                var option = {
                    themename: level.theme,
                    dimname: level.dimension,
                    dimid:level.dimid,
                    levelname: level.level,
                    initValues: level.selected,
                    callback: {
                        changed: selectControlChanged
                    }
                };
                return option;
            }

            function createTextBoxControl(container) {
                var tempControlId = 'input_text_' + new Date().getMilliseconds();
                var tempControl = $('<input id="' + tempControlId + '" style="width: 120px;" type="text" />').appendTo(container);
                return tempControl;
            }

            function createSelectBoxControl(option, container) {
                var tempControl = createTextBoxControl(container);
                tempControl.commonSelect(option);
                return tempControl;
            }

            //把普通的Select控件转化成章雄开发的mulselect控件
            function makeSelectControlToMultipleSelectControl(control, data, onBindComplete, selectedItems) {
                if (control != undefined && data != undefined) {
                    var tempData = convertListToString(data);
                    var tempSelectedItems = $.map(selectedItems, function (item) { return item.id; });
                    control.mulselect({ datastr: tempData, multiple: true, selectedvalues: tempSelectedItems, selectChange: onBindComplete });
                }
            }

            //  粒度下拉控件的change事件（核心逻辑1）
            function topLevelSelectChange() {
                var selected = selectControl.mulselect("getSelects", "value");
                var tempSelectedTopLevels = selected.toString().split(',');
                var needRemoveControlIndexes = [];
                var allSelectableItems = $.map(levelItems, function (item) { return item.id; });
                for (var selectedTopLevelIndex = 0; selectedTopLevelIndex < selectedTopLevels.length; selectedTopLevelIndex++) {
                    var selectedTopLevel = selectedTopLevels[selectedTopLevelIndex];
                    if ($.inArray(selectedTopLevel, allSelectableItems) < 0) {
                        continue;
                    }
                    var indexInTempSelectedTopLevels = $.inArray(selectedTopLevel, tempSelectedTopLevels);
                    if (indexInTempSelectedTopLevels > -1) {
                        tempSelectedTopLevels.splice(indexInTempSelectedTopLevels, 1);
                    }
                    else {
                        // remove Control from web page
                        needRemoveControlIndexes.push(selectedTopLevelIndex);
                    }
                }
                removeLevelControls(needRemoveControlIndexes);

                // ---------------------------------------------------------------------------------
                // 其实在现行机制下，每次change事件触发时都只有一个选中/取消项
                // 后期会取消for循环的
                // ---------------------------------------------------------------------------------
                for (var tempSelectedLevelIndex = 0; tempSelectedLevelIndex < tempSelectedTopLevels.length; tempSelectedLevelIndex++) {
                    var tempSelectedLevel = tempSelectedTopLevels[tempSelectedLevelIndex];
                    if (tempSelectedLevel == undefined || tempSelectedLevel == "") {
                        continue;
                    }
                    var mappedLevel = $.map(levelItems, function (level) {
                        if (level.id == tempSelectedLevel)
                            return level;
                    });
                    if (mappedLevel == undefined || mappedLevel.length != 1) {
                        continue;
                    }

                    var tempLevel = mappedLevel[0];
                    var levelName = tempLevel.level;
                    // 后期需要把依赖项的key更新为“维度+粒度”的方式
                    var levelFullName = tempLevel.dimension + "_" + tempLevel.level;
                    //    如果有依赖项且依赖项的控件已经存在，则读取该控件的选中项并作为参数传递给即将要创建的粒度控件
                    var dependentLevelSelected;
                    var dependentOnLevelInfo = tools.findDependentOnWho(levelName, dependentOnList, selectedTopLevels);
                    if (dependentOnLevelInfo != undefined) {
                        var methodIndex = $.inArray(dependentOnLevelInfo.controlType, supportedControlTypes);
                        if (methodIndex > -1) {
                            var selectedValues = controlMethod_Ids[methodIndex](avaliableSelectControls[dependentOnLevelInfo.controlIndex]);
                            dependentLevelSelected = { "dependent": { "levelName": dependentOnLevelInfo.controlName, "selectedIds": selectedValues } };
                            tempLevel = $.extend(tempLevel, dependentLevelSelected);
                            console.log(selectedValues);
                        }
                    }

                    createConditionControl(tempLevel, controlContainer);
                    // 如果父级关联项控件的父级控件没有选定内容，则不会清空新建控件的子级关联项控件的内容
                    // 判断是否有已经创建好的粒度控件依赖即将被创建的控件
                    // 如果有的话，则把已经创建好的控件选择项清空，
                    if (dependentLevelSelected != undefined) {
                        var dependentOnMeList = tools.findWhoDependentOnMe(levelName, dependencyList);
                        notifyDescendantsDependencyChanged(dependentOnMeList, dependentLevelSelected);
                    }
                }
            }

            function removeLevelControls(levelControlIndexes) {
                if (levelControlIndexes != undefined) {
                    for (var i = levelControlIndexes.length - 1; i > -1 ; i--) {
                        var levelControlIndex = levelControlIndexes[i];
                        if (existedSelectControls != undefined && existedSelectControls.length > levelControlIndex) {
                            var ctl = existedSelectControls[levelControlIndex];
                            ctl.remove();
                            existedSelectControls.splice(levelControlIndex, 1);
                            selectedTopLevels.splice(levelControlIndex, 1);
                            avaliableSelectControls.splice(levelControlIndex, 1);
                        }
                    }
                }
            }

            function selectControlChanged(args) {
                if (args != undefined) {
                    var dimensionName = args.dimname;
                    var levelName = args.levelname;
                    var dependencyObject = { "dependent": { "level": levelName, "selectedIds": args.selnames } };
                    var dependentOnMeList = tools.findWhoDependentOnMe(levelName, dependencyList);
                    notifyDescendantsDependencyChanged(dependentOnMeList, dependencyObject);
                }
            }

            function notifyDescendantsDependencyChanged(descendantsLevelList, dependencyObject) {
                if (dependencyObject && descendantsLevelList && typeof (descendantsLevelList) == "object") {
                    $.each(descendantsLevelList, function () {
                        var controlTypeInfo = tools.findControlTypeAndIndex(this, selectedTopLevels);
                        if ((controlTypeInfo != undefined)
                            && (controlTypeInfo.controlType == "single" || controlTypeInfo.controlType == "multiple")) {
                            avaliableSelectControls[controlTypeInfo.controlIndex].commonSelect("resetDependency", dependencyObject);
                        }
                    });
                }
            }

            // 把list转化成multileselect控件格式的数据
            function convertListToString(list) {
                var tempString = '{"rows":[';
                var length = list.length - 1;
                for (var i = 0; i <= length; i++) {
                    // {"col0":"1","col1":"杭州市"}
                    tempString += '{"col0":"' + list[i].value + '","col1":"' + list[i].text + '"}';
                    if (i < length) {
                        tempString += ',';
                    }
                }
                tempString += ']}';
                return eval('(' + tempString + ");");
            }

            function cancelRenderConditionControl(reason, container) {
                if (reason != undefined && typeof (reason) == "string" && container != undefined) {
                    if (reason.length > 100)
                        $('<span style="padding:3px;float:left;color:red;background-color:orange;width:100px;font-size:13px;font-weight:bold;overflow:hidden;text-overflow: ellipsis;" title="' + reason + '">创建控件失败...</span>').appendTo(container);
                    else
                        $('<span style="color:red;">' + reason + '</span>').appendTo(container);
                }
                thisControlValid = false;
            }

            function outputError(error, container) {
                if (error != undefined && error != "" && container != undefined) {
                    $('<span style="color:red;">' + error.toString() + '</span>').appendTo(container);
                }
            }

            return this;
        }
    });
})(jQuery);

var tools = {

    delimiterString:function(){
        return "%$^&"; // 请勿修改本变量的内容
    },

    parseDependencyTree: function (item, dependency, dependentOn) {
        var levelName = item.level;
        var children = item.items;
        if (levelName == undefined || typeof (levelName) != "string"
            || children == undefined || typeof (children) != "object")
            return;
        if (children.length != undefined) {
            $.each(children, function (index, tempItem) {
                var tempLeveName = tempItem.level;
                if (tempLeveName != undefined && tempLeveName != "") {
                    dependency.add(levelName, tempLeveName);
                    dependentOn.add(tempLeveName, levelName);
                    //
                    tools.parseDependencyTree(tempItem, dependency, dependentOn);
                }
            });
        }
        else {
            if (children.level != undefined && children.level != "") {
                dependency.add(levelName, children.level);
                dependentOn.add(children.level, levelName);
            }
        }
    },

    findEndlessLoopItems: function (hashtable) {
        var endlessLoopMessage = "";
        if (hashtable == undefined || typeof (hashtable) != "object" || hashtable.length < 1)
            return endlessLoopMessage;
        //
        var keys = hashtable.keys();
        var length = keys.length;
        for (var index = 0; index < length; index++) {
            var tempItem = hashtable.items(keys[index]);
            var tempList = new Object();
            tempList[keys[index]] = "";
            while (tempItem != undefined) {
                if (tempItem in tempList) {
                    if (endlessLoopMessage.length > 0)
                        endlessLoopMessage += ",";
                    var temp = "";
                    for (var key in tempList) {
                        temp += key + "->";
                    }
                    temp += tempItem;
                    endlessLoopMessage += temp;
                    break;
                }
                tempList[tempItem] = "wtr";
                tempItem = hashtable.items(tempItem);
            }
        }
        // wertwer 
        return endlessLoopMessage;
    },
    
    findControlTypeAndIndex: function (levelKey, levelList) {
        var notFound = undefined;
        if (!(levelKey && levelList)) {
            return notFound;
        }

        for (var index = 0; index < levelList.length; index++) {
            var tempLevelData = levelList[index].split(tools.delimiterString());
            if(levelKey == tempLevelData[3]){
                return {
                    "controlType": tempLevelData[0],
                    "controlIndex": index
                };
            };
        }

        return notFound;
    },

    findDependentOnWho: function (levelKey, dependentOnList, levelList) {
        var notFound = undefined;
        if (!(levelKey && dependentOnList && levelList)) {
            return notFound;
        }

        var tempLevelListContainer = new hashTable();
        for (var index = 0; index < levelList.length; index++) {
            var tempLevelData = levelList[index].split(tools.delimiterString());
            tempLevelListContainer.add(
                tempLevelData[3],
                {
                    "controlType": tempLevelData[0],
                    "controlName": tempLevelData[3],
                    "controlIndex": index
                }
            );
        }

        while (levelKey != undefined) {
            levelKey = dependentOnList.items(levelKey);
            if (levelKey != notFound) {
                if (tempLevelListContainer.contains(levelKey)) {
                    return tempLevelListContainer.items(levelKey);
                }
            }
            else {
                break;
            }
        }

        return notFound;
    },

    findWhoDependentOnMe: function (levelName, dependentOnHashtable) {        
        var notFound = undefined;
        var dependentOnMe = dependentOnHashtable.items(levelName);
        if (dependentOnMe == notFound) {
            return [];
        }

        var dependentOnMeType = typeof (dependentOnMe);
        var dependentOnMeList = [];
        if (dependentOnMeType == "string") {
            dependentOnMeList.push(dependentOnMe);
        }
        else if (dependentOnMeType == "object") {
            $.each(dependentOnMe, function () {
                dependentOnMeList.push($(this));
            });
        }
        else {
            return dependentOnMeList;
        }

        //
        var index = 0;
        while (index < dependentOnMeList.length) {
            var level = dependentOnHashtable.items(dependentOnMeList[index++]);
            if (level != notFound) {
                var tempType = typeof (level);
                if (tempType == "string") {
                    dependentOnMeList.push(level);
                }
                else if (tempType == "object") {
                    $.each(level, function () {
                        dependentOnMeList.push($(this));
                    });
                }
            }
        }

        return dependentOnMeList;
    }
};

function hashTable() {
    var entries = new Object();

    this.add = function (key, value) {
        var existingValue = entries[key];
        if (!this.contains(key)) {
            entries[key] = value;
        }
        else {
            var temp = entries[key];
            var entryType = typeof (temp);
            if (entryType.toLowerCase() == "object") {
                temp.push(value);
            }
            else {
                var arr = [];
                arr.push(temp);
                arr.push(value);
                entries[key] = arr;
            }
        }
    }

    this.remove = function (key) {
        delete entries[key];
    }

    this.contains = function (key) {
        return (key in entries);
    }

    this.keys = function () {
        var keys = [];
        for (var key in entries) {
            keys.push(key);
        }

        return keys;
    }

    this.items = function (key) {
        return entries[key];
    }
};
