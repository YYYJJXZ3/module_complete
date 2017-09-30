(function ($) {
    $.fn.extend
    ({
        CreateTabControl: function (options, defaultUrl) {
            options = $.extend({
                className: '',
                showCloseTabButton: false,
                closeTabButton1: '',
                closeTabButton2: '',
                moveLeftButton1: '',
                moveLeftButton2: '',
                moveRightButton1: '',
                moveRightButton2: '',
                closeAllButton1: '',
                closeAllButton2: '',
                complexMode: false,
                onShowOrHideButtonClick: '',
                maxTabs: 100
            }, options);
            if ($(document).data("tabControl") != null) {
                return $(document).data("tabControl");
            }

            this.titles = new Array(); // 存放各个tab的title
            this.pages = new Array();  // 存放各个tab的url

            // 存放各个tab对应的流水号，该流水号将被用于tab定位， 
            // 例如第5个tab的流水号是this.visibleTabs[4], 流水号为5的tab顺序为$.inArray(5, this.visibleTabs
            this.visibleTabs = new Array();
            this.number = 0; //流水号变量
            this.currentPageIndex = null;
            var _self = $(this);

            if (_self[0].nodeName != "DIV") {
                _self.html('Only <span style="color:red;font-weight:bold;">div</span> can be used as Tab control.');
                return;
            }

            // register methods
            this.addTab = addTab;
            this.activateTabPage = activateTabPage;
            this.closeAllTabPages = closeAllTabPages;
            this.closeTabPage = closeTabPage;
            this.closeTab = closeTab;
            this.moveLeft = moveLeft;
            this.moveRight = moveRight;
            this.moveTo = moveTo;
            this.stopScroll = releaseTimer;
            this.adjustTabHeight = adjustTabHeight;
            this.adjustTabWidth = adjustTabWidth;
            // 此数值与tab.css文件.tabControl .tabTitle中一致: width + border-left-width + border-right-width + margin-left + margin-right
            var tabTitleControlWidth = 130 + 1 + 1 + 1 + 1 + 5;

            // set CSS
            var oldClassName = _self.attr('class')
            if (oldClassName != null) {
                _self.removeClass(oldClassName);
            }
            _self.addClass(options.className);

            // set root id, just for children controls
            var date = new Date();
            var rootId = '_' + date.getMilliseconds();
            var tabIndexForAdjustHeight = -1;
            this.showOrHideSidePanelButtonId = rootId + '_showOrHideSidePanel';
            this.tabTitleContainerId = rootId + '_TabTitleContainer';
            this.tabPageContainerId = rootId + '_TabPageContainer';
            //
            _self.empty()
            var titleControl = '<div id="' + rootId + '_TitlePart" class="tabTitlePart">';
            if (options.complexMode && options.onShowOrHideButtonClick != '') {
                titleControl += '<div id="' + this.showOrHideSidePanelButtonId + '" class="showSidePanel"';
                titleControl += ' onclick="' + options.onShowOrHideButtonClick + '">';
                titleControl += '</div>';
            }
            titleControl += '<div style="float: left; overflow: hidden;width:600px;height:100%;" id="' + this.tabTitleContainerId + 'Root">';
            titleControl += '<div class="tabTitleContainer" id="' + this.tabTitleContainerId + '">';
            titleControl += '</div>';
            titleControl += '</div>';
            if (options.complexMode) {
                titleControl += '<div id="' + rootId + '_ClosePane" style="margin-right:10px;float:right;vertical-align:middle;">';
                titleControl += generateButton('tabMoveLeftButton', options.moveLeftButton1, options.moveLeftButton2, 10, 10, '$(document).data(\'tabControl\').moveLeft()', '前一个页');
                titleControl += generateButton('tabMoveRightButton', options.moveRightButton1, options.moveRightButton2, 10, 10, '$(document).data(\'tabControl\').moveRight()', '后一个页');
                titleControl += generateButton('tabCloseAllButton', options.closeAllButton1, options.closeAllButton2, 16, 15, '$(document).data(\'tabControl\').closeAllTabPages()', '关闭所有页');
                //
                titleControl += '</div>';
            }
            _self.append(titleControl);
            var pageControl = '<div style="width: 100%;" id="' + this.tabPageContainerId + '"></div>';
            _self.append(pageControl);
            this.adjustTabWidth();
            this.adjustTabHeight();
            if (defaultUrl == 'welcome.htm') {
                addWelcomePage();
            }
            else {
                $("#" + this.tabPageContainerId).append('<iframe src="' + defaultUrl + '" frameborder="0" style="width:100%;height:100%;">');
            }

            function addTab(title, url, inIFrame) {
                //
                if (url == '') {
                    alert("无内容可显示。");
                    return;
                }

                // 我们假设所有的url没有“完全相同”的：如果有完全相同的URL则为一个页面
                var urlIndex = $.inArray(url, this.pages);
                if (urlIndex >= 0 && this.titles[urlIndex] == title) {
                    var index = this.visibleTabs[urlIndex];
                    var tempTitle = '#' + this.tabTitleContainerId + '_Title' + index;
                    this.activateTabPage(tempTitle, index);
                    return;
                }

                if (this.titles.length >= options.maxTabs) {
                    alert("仅能显示" + options.maxTabs + "个页面。");
                    return;
                }

                var tabPageId = '#' + this.tabPageContainerId;
                if (this.titles.length == 0) {
                    $(tabPageId).empty();
                }

                var tabTitleCss = '.' + options.className + ' .activeTabTitle';
                $(tabTitleCss).removeClass("activeTabTitle").addClass("tabTitle");

                var length = $('#' + this.tabPageContainerId + ' .tabPage').length;
                var titleId = this.tabTitleContainerId + '_Title' + this.number;
                var tabTitle = '<div id="' + titleId + '" class="activeTabTitle">';
                tabTitle += '<span onclick="$(document).data(\'tabControl\').activateTabPage(\'#' + titleId + '\', ' + this.number + ')"';
                tabTitle += ' style="width:85%;font-size:13px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;display:block;float:left;"'
                tabTitle += ' title="' + title + '">' + title + '</span>';
                if (options.complexMode && options.showCloseTabButton) {
                    tabTitle += '<div title="关闭本页" onclick="$(document).data(\'tabControl\').closeTabPage(' + this.number + ', event)"';
                    tabTitle += ' style="width:15px;height:100%;float:right;"></div>';
                }
                tabTitle += '</div>';

                var tabTitleId = '#' + this.tabTitleContainerId;
                $(tabTitleId).append(tabTitle);
                this.titles[this.titles.length] = title;
                //
                var totalWidth = $("#" + this.tabTitleContainerId + "Root").width();
                var avaiable = totalWidth - this.titles.length * tabTitleControlWidth;
                if (avaiable < 0) {
                    $("#" + this.tabTitleContainerId).css("margin-left", avaiable);
                }
                //
                var tabPageCss = '.' + options.className + ' .tabPage';
                //$(tabPageCss).hide();
                $(tabPageCss).css("visibility", "hidden");

                var pageId = this.tabPageContainerId + '_Page' + this.number;
                var tabPage = '<div id="' + pageId + '" class="tabPage">'
                if (inIFrame) {
                    tabPage += '<iframe src="' + url + '" frameborder="0" style="position:absolute;width:100%;height:100%;margin-bottom:-20px;"></iframe>';
                }
                else {
                    tabPage += '[Title]: ' + title + ';<br/>[Url]:' + url;
                }
                tabPage += '</div>';
                $(tabPageId).append(tabPage);
                this.pages[this.pages.length] = url;
                this.currentPageIndex = this.number;
                tabIndexForAdjustHeight = this.currentPageIndex;
                this.visibleTabs[this.visibleTabs.length] = this.number;
                this.number++;
            }

            function activateTabPage(tabTitle, index) {
                if (this.currentPageIndex == index) {
                    return;
                }
                var tabTitleCss = '.' + options.className + ' .activeTabTitle';
                $(tabTitleCss).removeClass("activeTabTitle").addClass("tabTitle");
                $(tabTitle).removeClass("tabTitle").addClass("activeTabTitle");
                $(tabTitle).show();
                this.currentPageIndex = index;
                tabIndexForAdjustHeight = this.currentPageIndex;
                //
                var tempIndex = $.inArray(index, this.visibleTabs);
                var width2 = (tempIndex + 1) * tabTitleControlWidth;
                var totalWidth = $("#" + this.tabTitleContainerId + "Root").width();
                var currentPosition = parseInt($("#" + this.tabTitleContainerId).css("margin-left"));
                var avaiable = (width2 <= totalWidth) ? 0 : (totalWidth - width2);
                $("#" + this.tabTitleContainerId).css("margin-left", avaiable);
                //
                var pageId = this.tabPageContainerId + '_Page' + index;
                var tabPageCss = '.' + options.className + ' .tabPage';
                //$(tabPageCss).hide();
                $(tabPageCss).css("visibility", "hidden");
                $("#" + pageId).css("visibility", "visible");
                //$("#" + pageId).show();
                //解决自定义分析切换TAB时不显示的临时解决办法
                if ($("#" + pageId)[0].childNodes[0].style.width == "100%")
                { $("#" + pageId)[0].childNodes[0].style.width = "99.9%"; }
                else
                { $("#" + pageId)[0].childNodes[0].style.width = "100%"; }
            }

            function closeAllTabPages() {
                var tabTitleId = '#' + this.tabTitleContainerId;
                $(tabTitleId).empty();
                var tabPageId = '#' + this.tabPageContainerId;
                $(tabPageId).empty();
                this.currentPageIndex = 0;
                this.titles = new Array();
                this.pages = new Array();
                this.visibleTabs = new Array();
                this.number = 0;
                $("#" + $(document).data("tabControl").tabTitleContainerId).css("margin-left", 0);
                if (tools.currentTile && (tools.currentTile.index > -1)) {
                    tools.currentTile.index = -1;
                }
                addWelcomePage();
            }

            function closeTabPage(tabIndex, e) {
                this.closeTab(tabIndex);
                if (this.currentPageIndex == tabIndex) {
                    this.currentPageIndex = -1;
                    var tempIndex = $.inArray(tabIndex, this.visibleTabs);
                    var nextTabIndex = tempIndex - 1;
                    if (nextTabIndex >= 0) {
                        this.moveTo(this.visibleTabs[nextTabIndex]);
                    }
                    else {
                        nextTabIndex = tempIndex + 1;
                        if (nextTabIndex < this.visibleTabs.length) {
                            this.moveTo(this.visibleTabs[nextTabIndex]);
                        }
                    }
                }
                var temp = $.inArray(tabIndex, this.visibleTabs);
                if (temp >= 0) {
                    this.visibleTabs.splice(temp, 1);
                }
                if (e && e.stopPropagation) {
                    e.stopPropagation()
                }
                else {
                    if (window.event) {
                        window.event.cancelBubble = true
                    }
                }
            }

            // 从dom中移除该tab
            function closeTab(tabIndex) {
                if (tools.currentTile && (tools.currentTile.index > -1)) {
                    tools.currentTile.index = -1;
                }
                var tempIndex = $.inArray(tabIndex, this.visibleTabs);
                if (tempIndex >= 0) {
                    var titleId = this.tabTitleContainerId + '_Title' + tabIndex;
                    $("#" + titleId).remove();
                    var pageId = this.tabPageContainerId + '_Page' + tabIndex;
                    var pageControl = $("#" + pageId);
                    var iframe = $("#" + pageId + " iframe")[0];
                    //iframe.contentWindow.document.write("");
                    iframe.parentNode.removeChild(iframe);
                    pageControl.empty();
                    pageControl.remove();
                    this.titles.splice(tempIndex, 1);
                    this.pages.splice(tempIndex, 1);
                }
                if (this.titles.length == 0) {
                    addWelcomePage();
                }
            }

            function adjustTabWidth() {
                var totalWidth = $("#" + rootId + "_TitlePart").width();
                var width1 = $("#" + rootId + "_showOrHideSidePanel").width();
                var width2 = 110;
                var myLeft = $("#" + rootId + "_TabTitleContainerRoot").offset().left;
                var closeZoneLeft = $("#" + rootId + "_ClosePane").offset().left;
                $("#" + rootId + "_TabTitleContainerRoot").width(closeZoneLeft - myLeft - 42);
            }

            function adjustTabHeight() {
                var total = this.height();//$("#rightPanel").height();
                var h1 = $("#" + rootId + "_TitlePart").height();
                $("#" + rootId + '_TabPageContainer').height(total - h1 - 1);
                //$("#" + rootId + '_TabPageContainer iframe').height(total - h1 - 1);
            }

            function addWelcomePage() { $("#" + rootId + '_TabPageContainer').html('<div id="welcome"></div>'); }

            var timer = null;
            var timerInterval = 100;

            function moveLeft() {
                if (timer == null) {
                    moveLeft2();
                }
            }

            function moveLeft2() {
                timer = setTimeout(moveLeft2, timerInterval);
                scroolTo(true);
            }

            function moveRight() {
                if (timer == null) {
                    moveRight2();
                }
            }

            function moveRight2() {
                timer = setTimeout(moveRight2, timerInterval);
                scroolTo(false);
            }

            function scroolTo(left) {
                var currentPosition = parseInt($("#" + $(document).data("tabControl").tabTitleContainerId).css("margin-left"));
                if (left) {
                    if (currentPosition < 0) {
                        var newPosition = (currentPosition + tabTitleControlWidth) > 0 ? 0 : currentPosition + tabTitleControlWidth;
                        $("#" + $(document).data("tabControl").tabTitleContainerId).css("margin-left", newPosition);
                    }
                    else {
                        releaseTimer();
                    }
                }
                else {
                    var avaiable = $(document).data("tabControl").titles.length * tabTitleControlWidth + currentPosition - $("#" + $(document).data("tabControl").tabTitleContainerId + "Root").width();
                    if (avaiable <= 0) {
                        releaseTimer();
                        return;
                    }
                    var newPosition2 = currentPosition - tabTitleControlWidth;
                    $("#" + $(document).data("tabControl").tabTitleContainerId).css("margin-left", newPosition2);
                }
            }

            function releaseTimer() {
                if (timer != null) {
                    clearTimeout(timer);
                    timer = null;
                }
            }

            function moveTo(newIndex) {
                var currentTitle = $('#' + this.tabTitleContainerId + '_Title' + newIndex);
                this.activateTabPage(currentTitle, newIndex);
            }
            // 升级代码到此结束
            function generateButton(id, img1, img2, width, height, event, title) {
                if (img1 == '')
                    return '';
                var img = '<img id="' + id + '" title="' + title + '" ';
                img += ' style="margin:10px 5px auto 2px;border:0px;width:' + width + 'px;height:' + height + 'px;"';
                img += ' src="' + img1 + '"';
                if (img2 != '') {
                    img += ' onmouseover="this.src=\'' + img2 + '\'" onmouseout="this.src=\'' + img1 + '\'"';
                }
                if (event != '') {
                    //img += ' onclick="' + event + '"';
                    img += 'onmousedown="' + event + '"';
                    img += 'onmouseup="$(document).data(\'tabControl\').stopScroll();"';
                }
                img += '/>';
                return img;
            }
            $(document).data("tabControl", this);
            this.tabControl = this;
            return this;
        }
    })
})(jQuery);