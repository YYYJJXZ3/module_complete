jQuery.extend({
    /** 
    * 清除当前选择内容 
    */
    unselectContents: function () {
        if (window.getSelection)
            window.getSelection().removeAllRanges();
        else if (document.selection)
            document.selection.empty();
    }
});
jQuery.fn.extend({
    /** 
    * 选中内容 
    */
    selectContents: function () {
        $(this).each(function (i) {
            var node = this;
            var selection, range, doc, win;
            if ((doc = node.ownerDocument) &&
                 (win = doc.defaultView) &&
                typeof win.getSelection != 'undefined' &&
                typeof doc.createRange != 'undefined' &&
                 (selection = window.getSelection()) &&
                typeof selection.removeAllRanges != 'undefined') {
                range = doc.createRange();
                range.selectNode(node);
                if (i == 0) {
                    selection.removeAllRanges();
                }
                selection.addRange(range);
            }
            else if (document.body &&
                     typeof document.body.createTextRange != 'undefined' &&
                      (range = document.body.createTextRange())) {
                range.moveToElementText(node);
                range.select();
            }
        });
    },
    /** 
    * 初始化对象以支持光标处插入内容 
    */
    setCaret: function () {
        if ($.support.cssFloat) return;
        var initSetCaret = function () {
            var textObj = $(this).get(0);
            textObj.caretPos = document.selection.createRange().duplicate();
        };
        $(this)
         .click(initSetCaret)
         .select(initSetCaret)
         .keyup(initSetCaret);
    },
    /** 
    * 在当前对象光标处插入指定的内容 
    */
    insertAtCaret: function (textFeildValue) {
        var textObj = $(this).get(0);
        if (document.all && textObj.createTextRange && textObj.caretPos) {
            var caretPos = textObj.caretPos;
            caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == '' ?
                                textFeildValue + '' : textFeildValue;
        }
        else if (textObj.setSelectionRange) {
            var rangeStart = textObj.selectionStart;
            var rangeEnd = textObj.selectionEnd;
            var tempStr1 = textObj.value.substring(0, rangeStart);
            var tempStr2 = textObj.value.substring(rangeEnd);
            textObj.value = tempStr1 + textFeildValue + tempStr2;
            textObj.focus();
            var len = textFeildValue.length;
            textObj.setSelectionRange(rangeStart + len, rangeStart + len);
            //textObj.blur();
        }
        else {
            textObj.value += textFeildValue;
        }
    }
});
/*
* jQuery clueTip plugin
* Version 1.0.4  (June 28, 2009)
* @requires jQuery v1.2.6+
* download by http://www.jb51.net
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
*/

/*
*
* Full list of options/settings can be found at the bottom of this file and at http://plugins.learningjquery.com/cluetip/
*
* Examples can be found at http://plugins.learningjquery.com/cluetip/demo/
*
*/

; (function ($) {
    $.cluetip = { version: '1.0.4' };
    var $cluetip, $cluetipInner, $cluetipOuter, $cluetipTitle, $cluetipArrows, $cluetipWait, $dropShadow, imgCount;
    $.fn.cluetip = function (js, options) {
        if (typeof js == 'object') {
            options = js;
            js = null;
        }
        if (js == 'destroy') {
            return this.unbind('.cluetip');
        }
        return this.each(function (index) {
            var link = this, $this = $(this);

            // support metadata plugin (v1.0 and 2.0)
            var opts = $.extend(true, {}, $.fn.cluetip.defaults, options || {}, $.metadata ? $this.metadata() : $.meta ? $this.data() : {});

            // start out with no contents (for ajax activation)
            var cluetipContents = false;
            var cluezIndex = +opts.cluezIndex;
            $this.data('thisInfo', { title: link.title, zIndex: cluezIndex });
            var isActive = false, closeOnDelay = 0;

            // create the cluetip divs
            if (!$('#cluetip').length) {
                $(['<div id="cluetip">',
          '<div id="cluetip-outer">',
            '<h3 id="cluetip-title"></h3>',
            '<div id="cluetip-inner"></div>',
          '</div>',
          '<div id="cluetip-extra"></div>',
          '<div id="cluetip-arrows" class="cluetip-arrows"></div>',
        '</div>'].join(''))
        [insertionType](insertionElement).hide();

                $cluetip = $('#cluetip').css({ position: 'absolute' });
                $cluetipOuter = $('#cluetip-outer').css({ position: 'relative', zIndex: cluezIndex });
                $cluetipInner = $('#cluetip-inner');
                $cluetipTitle = $('#cluetip-title');
                $cluetipArrows = $('#cluetip-arrows');
                $cluetipWait = $('<div id="cluetip-waitimage"></div>')
          .css({ position: 'absolute' }).insertBefore($cluetip).hide();
            }
            var dropShadowSteps = (opts.dropShadow) ? +opts.dropShadowSteps : 0;
            if (!$dropShadow) {
                $dropShadow = $([]);
                for (var i = 0; i < dropShadowSteps; i++) {
                    $dropShadow = $dropShadow.add($('<div></div>').css({ zIndex: cluezIndex - 1, opacity: .1, top: 1 + i, left: 1 + i }));
                };
                $dropShadow.css({ position: 'absolute', backgroundColor: '#000' })
        .prependTo($cluetip);
            }
            var tipAttribute = $this.attr(opts.attribute), ctClass = opts.cluetipClass;
            if (!tipAttribute && !opts.splitTitle && !js) return true;
            // if hideLocal is set to true, on DOM ready hide the local content that will be displayed in the clueTip
            if (opts.local && opts.localPrefix) { tipAttribute = opts.localPrefix + tipAttribute; }
            if (opts.local && opts.hideLocal) { $(tipAttribute + ':first').hide(); }
            var tOffset = parseInt(opts.topOffset, 10), lOffset = parseInt(opts.leftOffset, 10);
            // vertical measurement variables
            var tipHeight, wHeight,
          defHeight = isNaN(parseInt(opts.height, 10)) ? 'auto' : (/\D/g).test(opts.height) ? opts.height : opts.height + 'px';
            var sTop, linkTop, posY, tipY, mouseY, baseline;
            // horizontal measurement variables
            var tipInnerWidth = parseInt(opts.width, 10) || 275,
          tipWidth = tipInnerWidth + (parseInt($cluetip.css('paddingLeft'), 10) || 0) + (parseInt($cluetip.css('paddingRight'), 10) || 0) + dropShadowSteps,
          linkWidth = this.offsetWidth,
          linkLeft, posX, tipX, mouseX, winWidth;

            // parse the title
            var tipParts;
            var tipTitle = (opts.attribute != 'title') ? $this.attr(opts.titleAttribute) : '';
            if (opts.splitTitle) {
                if (tipTitle == undefined) { tipTitle = ''; }
                tipParts = tipTitle.split(opts.splitTitle);
                tipTitle = tipParts.shift();
            }
            if (opts.escapeTitle) {
                tipTitle = tipTitle.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
            }

            var localContent;
            function returnFalse() { return false; }

            /***************************************      
            * ACTIVATION
            ****************************************/

            //activate clueTip
            var activate = function (event) {
                if (!opts.onActivate($this)) {
                    return false;
                }
                isActive = true;
                $cluetip.removeClass().css({ width: tipInnerWidth });
                if (tipAttribute == $this.attr('href')) {
                    $this.css('cursor', opts.cursor);
                }
                if (opts.hoverClass) {
                    $this.addClass(opts.hoverClass);
                }
                linkTop = posY = $this.offset().top;
                linkLeft = $this.offset().left;
                mouseX = event.pageX;
                mouseY = event.pageY;
                if (link.tagName.toLowerCase() != 'area') {
                    sTop = $(document).scrollTop();
                    winWidth = $(window).width();
                }
                // position clueTip horizontally
                if (opts.positionBy == 'fixed') {
                    posX = linkWidth + linkLeft + lOffset;
                    $cluetip.css({ left: posX });
                } else {
                    posX = (linkWidth > linkLeft && linkLeft > tipWidth)
          || linkLeft + linkWidth + tipWidth + lOffset > winWidth
          ? linkLeft - tipWidth - lOffset
          : linkWidth + linkLeft + lOffset;
                    if (link.tagName.toLowerCase() == 'area' || opts.positionBy == 'mouse' || linkWidth + tipWidth > winWidth) { // position by mouse
                        if (mouseX + 20 + tipWidth > winWidth) {
                            $cluetip.addClass(' cluetip-' + ctClass);
                            posX = (mouseX - tipWidth - lOffset) >= 0 ? mouseX - tipWidth - lOffset - parseInt($cluetip.css('marginLeft'), 10) + parseInt($cluetipInner.css('marginRight'), 10) : mouseX - (tipWidth / 2);
                        } else {
                            posX = mouseX + lOffset;
                        }
                    }
                    var pY = posX < 0 ? event.pageY + tOffset : event.pageY;
                    $cluetip.css({
                        left: (posX > 0 && opts.positionBy != 'bottomTop') ? posX : (mouseX + (tipWidth / 2) > winWidth) ? winWidth / 2 - tipWidth / 2 : Math.max(mouseX - (tipWidth / 2), 0),
                        zIndex: $this.data('thisInfo').zIndex
                    });
                    $cluetipArrows.css({ zIndex: $this.data('thisInfo').zIndex + 1 });
                }
                wHeight = $(window).height();

                /***************************************
                * load a string from cluetip method's first argument
                ***************************************/
                if (js) {
                    if (typeof js == 'function') {
                        js = js(link);
                    }
                    $cluetipInner.html(js);
                    cluetipShow(pY);
                }
                /***************************************
                * load the title attribute only (or user-selected attribute). 
                * clueTip title is the string before the first delimiter
                * subsequent delimiters place clueTip body text on separate lines
                ***************************************/

                else if (tipParts) {
                    var tpl = tipParts.length;
                    $cluetipInner.html(tipParts[0]);
                    if (tpl > 1) {
                        for (var i = 1; i < tpl; i++) {
                            $cluetipInner.append('<div class="split-body">' + tipParts[i] + '</div>');
                        }
                    }
                    cluetipShow(pY);
                }
                /***************************************
                * load external file via ajax          
                ***************************************/

                else if (!opts.local && tipAttribute.indexOf('#') != 0) {
                    if (/\.(jpe?g|tiff?|gif|png)$/i.test(tipAttribute)) {
                        $cluetipInner.html('<img src="' + tipAttribute + '" alt="' + tipTitle + '" />');
                        cluetipShow(pY);
                    } else if (cluetipContents && opts.ajaxCache) {
                        $cluetipInner.html(cluetipContents);
                        cluetipShow(pY);
                    } else {
                        var optionBeforeSend = opts.ajaxSettings.beforeSend,
              optionError = opts.ajaxSettings.error,
              optionSuccess = opts.ajaxSettings.success,
              optionComplete = opts.ajaxSettings.complete;
                        var ajaxSettings = {
                            cache: false, // force requested page not to be cached by browser
                            url: tipAttribute,
                            beforeSend: function (xhr) {
                                if (optionBeforeSend) { optionBeforeSend.call(link, xhr, $cluetip, $cluetipInner); }
                                $cluetipOuter.children().empty();
                                if (opts.waitImage) {
                                    $cluetipWait
                .css({ top: mouseY + 20, left: mouseX + 20, zIndex: $this.data('thisInfo').zIndex - 1 })
                .show();
                                }
                            },
                            error: function (xhr, textStatus) {
                                if (isActive) {
                                    if (optionError) {
                                        optionError.call(link, xhr, textStatus, $cluetip, $cluetipInner);
                                    } else {
                                        $cluetipInner.html('<i>sorry, the contents could not be loaded</i>');
                                    }
                                }
                            },
                            success: function (data, textStatus) {
                                cluetipContents = opts.ajaxProcess.call(link, data);
                                if (isActive) {
                                    if (optionSuccess) { optionSuccess.call(link, data, textStatus, $cluetip, $cluetipInner); }
                                    $cluetipInner.html(cluetipContents);
                                }
                            },
                            complete: function (xhr, textStatus) {
                                if (optionComplete) { optionComplete.call(link, xhr, textStatus, $cluetip, $cluetipInner); }
                                imgCount = $('#cluetip-inner img').length;
                                if (imgCount && !$.browser.opera) {
                                    $('#cluetip-inner img').bind('load error', function () {
                                        imgCount--;
                                        if (imgCount < 1) {
                                            $cluetipWait.hide();
                                            if (isActive) cluetipShow(pY);
                                        }
                                    });
                                } else {
                                    $cluetipWait.hide();
                                    if (isActive) { cluetipShow(pY); }
                                }
                            }
                        };
                        var ajaxMergedSettings = $.extend(true, {}, opts.ajaxSettings, ajaxSettings);

                        $.ajax(ajaxMergedSettings);
                    }

                    /***************************************
                    * load an element from the same page
                    ***************************************/
                } else if (opts.local) {

                    var $localContent = $(tipAttribute + (/#\S+$/.test(tipAttribute) ? '' : ':eq(' + index + ')')).clone(true).show();
                    $cluetipInner.html($localContent);
                    cluetipShow(pY);
                }
            };

            // get dimensions and options for cluetip and prepare it to be shown
            var cluetipShow = function (bpY) {
                $cluetip.addClass('cluetip-' + ctClass);
                if (opts.truncate) {
                    var $truncloaded = $cluetipInner.text().slice(0, opts.truncate) + '...';
                    $cluetipInner.html($truncloaded);
                }
                function doNothing() { }; //empty function
                tipTitle ? $cluetipTitle.show().html(tipTitle) : (opts.showTitle) ? $cluetipTitle.show().html('&nbsp;') : $cluetipTitle.hide();
                if (opts.sticky) {
                    var $closeLink = $('<div id="cluetip-close"><a href="#">' + opts.closeText + '</a></div>');
                    (opts.closePosition == 'bottom') ? $closeLink.appendTo($cluetipInner) : (opts.closePosition == 'title') ? $closeLink.prependTo($cluetipTitle) : $closeLink.prependTo($cluetipInner);
                    $closeLink.bind('click.cluetip', function () {
                        cluetipClose();
                        return false;
                    });
                    if (opts.mouseOutClose) {
                        $cluetip.bind('mouseleave.cluetip', function () {
                            cluetipClose();
                        });
                    } else {
                        $cluetip.unbind('mouseleave.cluetip');
                    }
                }
                // now that content is loaded, finish the positioning 
                var direction = '';
                $cluetipOuter.css({ zIndex: $this.data('thisInfo').zIndex, overflow: defHeight == 'auto' ? 'visible' : 'auto', height: defHeight });
                tipHeight = defHeight == 'auto' ? Math.max($cluetip.outerHeight(), $cluetip.height()) : parseInt(defHeight, 10);
                tipY = posY;
                baseline = sTop + wHeight;
                if (opts.positionBy == 'fixed') {
                    tipY = posY - opts.dropShadowSteps + tOffset;
                } else if ((posX < mouseX && Math.max(posX, 0) + tipWidth > mouseX) || opts.positionBy == 'bottomTop') {
                    if (posY + tipHeight + tOffset > baseline && mouseY - sTop > tipHeight + tOffset) {
                        tipY = mouseY - tipHeight - tOffset;
                        direction = 'top';
                    } else {
                        tipY = mouseY + tOffset;
                        direction = 'bottom';
                    }
                } else if (posY + tipHeight + tOffset > baseline) {
                    tipY = (tipHeight >= wHeight) ? sTop : baseline - tipHeight - tOffset;
                } else if ($this.css('display') == 'block' || link.tagName.toLowerCase() == 'area' || opts.positionBy == "mouse") {
                    tipY = bpY - tOffset;
                } else {
                    tipY = posY - opts.dropShadowSteps;
                }
                if (direction == '') {
                    posX < linkLeft ? direction = 'left' : direction = 'right';
                }
                $cluetip.css({ top: tipY + 'px' }).removeClass().addClass('clue-' + direction + '-' + ctClass).addClass(' cluetip-' + ctClass);
                if (opts.arrows) { // set up arrow positioning to align with element
                    var bgY = (posY - tipY - opts.dropShadowSteps);
                    $cluetipArrows.css({ top: (/(left|right)/.test(direction) && posX >= 0 && bgY > 0) ? bgY + 'px' : /(left|right)/.test(direction) ? 0 : '' }).show();
                } else {
                    $cluetipArrows.hide();
                }

                // (first hide, then) ***SHOW THE CLUETIP***
                $dropShadow.hide();
                $cluetip.hide()[opts.fx.open](opts.fx.open != 'show' && opts.fx.openSpeed);
                if (opts.dropShadow) { $dropShadow.css({ height: tipHeight, width: tipInnerWidth, zIndex: $this.data('thisInfo').zIndex - 1 }).show(); }
                if ($.fn.bgiframe) { $cluetip.bgiframe(); }
                // delayed close (not fully tested)
                if (opts.delayedClose > 0) {
                    closeOnDelay = setTimeout(cluetipClose, opts.delayedClose);
                }
                // trigger the optional onShow function
                opts.onShow.call(link, $cluetip, $cluetipInner);
            };

            /***************************************
            =INACTIVATION
            -------------------------------------- */
            var inactivate = function (event) {
                isActive = false;
                $cluetipWait.hide();
                if (!opts.sticky || (/click|toggle/).test(opts.activation)) {
                    cluetipClose();
                    clearTimeout(closeOnDelay);
                };
                if (opts.hoverClass) {
                    $this.removeClass(opts.hoverClass);
                }
            };
            // close cluetip and reset some things
            var cluetipClose = function () {
                $cluetipOuter
      .parent().hide().removeClass();
                opts.onHide.call(link, $cluetip, $cluetipInner);
                $this.removeClass('cluetip-clicked');
                if (tipTitle) {
                    $this.attr(opts.titleAttribute, tipTitle);
                }
                $this.css('cursor', '');
                if (opts.arrows) $cluetipArrows.css({ top: '' });
            };

            $(document).bind('hideCluetip', function (e) {
                cluetipClose();
            });
            /***************************************
            =BIND EVENTS
            -------------------------------------- */
            // activate by click
            if ((/click|toggle/).test(opts.activation)) {
                $this.bind('click.cluetip', function (event) {
                    if ($cluetip.is(':hidden') || !$this.is('.cluetip-clicked')) {
                        activate(event);
                        $('.cluetip-clicked').removeClass('cluetip-clicked');
                        $this.addClass('cluetip-clicked');
                    } else {
                        inactivate(event);
                    }
                    this.blur();
                    return false;
                });
                // activate by focus; inactivate by blur    
            } else if (opts.activation == 'focus') {
                $this.bind('focus.cluetip', function (event) {
                    activate(event);
                });
                $this.bind('blur.cluetip', function (event) {
                    inactivate(event);
                });
                // activate by hover
            } else {
                // clicking is returned false if clickThrough option is set to false
                $this[opts.clickThrough ? 'unbind' : 'bind']('click', returnFalse);
                //set up mouse tracking
                var mouseTracks = function (evt) {
                    if (opts.tracking == true) {
                        var trackX = posX - evt.pageX;
                        var trackY = tipY ? tipY - evt.pageY : posY - evt.pageY;
                        $this.bind('mousemove.cluetip', function (evt) {
                            $cluetip.css({ left: evt.pageX + trackX, top: evt.pageY + trackY });
                        });
                    }
                };
                if ($.fn.hoverIntent && opts.hoverIntent) {
                    $this.hoverIntent({
                        sensitivity: opts.hoverIntent.sensitivity,
                        interval: opts.hoverIntent.interval,
                        over: function (event) {
                            activate(event);
                            mouseTracks(event);
                        },
                        timeout: opts.hoverIntent.timeout,
                        out: function (event) { inactivate(event); $this.unbind('mousemove.cluetip'); }
                    });
                } else {
                    $this.bind('mouseenter.cluetip', function (event) {
                        activate(event);
                        mouseTracks(event);
                    })
          .bind('mouseleave.cluetip', function (event) {
              inactivate(event);
              $this.unbind('mousemove.cluetip');
          });
                }
                // remove default title tooltip on hover
                $this.bind('mouseenter.cluetip', function (event) {
                    $this.attr('title', '');
                })
        .bind('mouseleave.cluetip', function (event) {
            $this.attr('title', $this.data('thisInfo').title);
        });
            }
        });
    };

    /*
    * options for clueTip
    *
    * each one can be explicitly overridden by changing its value. 
    * for example: $.fn.cluetip.defaults.width = 200; 
    * would change the default width for all clueTips to 200. 
    *
    * each one can also be overridden by passing an options map to the cluetip method.
    * for example: $('a.example').cluetip({width: 200}); 
    * would change the default width to 200 for clueTips invoked by a link with class of "example"
    *
    */

    $.fn.cluetip.defaults = {  // set up default options
        width: 275,      // The width of the clueTip
        height: 'auto',   // The height of the clueTip
        cluezIndex: 97,       // Sets the z-index style property of the clueTip
        positionBy: 'auto',   // Sets the type of positioning: 'auto', 'mouse','bottomTop', 'fixed'
        topOffset: 15,       // Number of px to offset clueTip from top of invoking element
        leftOffset: 15,       // Number of px to offset clueTip from left of invoking element
        local: false,    // Whether to use content from the same page for the clueTip's body
        localPrefix: null,       // string to be prepended to the tip attribute if local is true
        hideLocal: true,     // If local option is set to true, this determines whether local content
        // to be shown in clueTip should be hidden at its original location
        attribute: 'rel',    // the attribute to be used for fetching the clueTip's body content
        titleAttribute: 'title',  // the attribute to be used for fetching the clueTip's title
        splitTitle: '',       // A character used to split the title attribute into the clueTip title and divs
        // within the clueTip body. more info below [6]
        escapeTitle: false,    // whether to html escape the title attribute
        showTitle: true,     // show title bar of the clueTip, even if title attribute not set
        cluetipClass: 'default', // class added to outermost clueTip div in the form of 'cluetip-' + clueTipClass.
        hoverClass: '',       // class applied to the invoking element onmouseover and removed onmouseout
        waitImage: true,     // whether to show a "loading" img, which is set in jquery.cluetip.css
        cursor: 'help',
        arrows: false,    // if true, displays arrow on appropriate side of clueTip
        dropShadow: true,     // set to false if you don't want the drop-shadow effect on the clueTip
        dropShadowSteps: 6,        // adjusts the size of the drop shadow
        sticky: false,    // keep visible until manually closed
        mouseOutClose: false,    // close when clueTip is moused out
        activation: 'hover',  // set to 'click' to force user to click to show clueTip
        // set to 'focus' to show on focus of a form element and hide on blur
        clickThrough: false,    // if true, and activation is not 'click', then clicking on link will take user to the link's href,
        // even if href and tipAttribute are equal
        tracking: false,    // if true, clueTip will track mouse movement (experimental)
        delayedClose: 0,        // close clueTip on a timed delay (experimental)
        closePosition: 'top',    // location of close text for sticky cluetips; can be 'top' or 'bottom' or 'title'
        closeText: 'Close',  // text (or HTML) to to be clicked to close sticky clueTips
        truncate: 0,        // number of characters to truncate clueTip's contents. if 0, no truncation occurs

        // effect and speed for opening clueTips
        fx: {
            open: 'show', // can be 'show' or 'slideDown' or 'fadeIn'
            openSpeed: ''
        },

        // settings for when hoverIntent plugin is used             
        hoverIntent: {
            sensitivity: 3,
            interval: 50,
            timeout: 0
        },

        // short-circuit function to run just before clueTip is shown. 
        onActivate: function (e) { return true; },

        // function to run just after clueTip is shown. 
        onShow: function (ct, ci) { },
        // function to run just after clueTip is hidden.
        onHide: function (ct, ci) { },
        // whether to cache results of ajax request to avoid unnecessary hits to server    
        ajaxCache: true,

        // process data retrieved via xhr before it's displayed
        ajaxProcess: function (data) {
            data = data.replace(/<(script|style|title)[^<]+<\/(script|style|title)>/gm, '').replace(/<(link|meta)[^>]+>/g, '');
            return data;
        },

        // can pass in standard $.ajax() parameters. Callback functions, such as beforeSend, 
        // will be queued first within the default callbacks. 
        // The only exception is error, which overrides the default
        ajaxSettings: {
            // error: function(ct, ci) { /* override default error callback */ }
            // beforeSend: function(ct, ci) { /* called first within default beforeSend callback }
            dataType: 'html'
        },
        debug: false
    };


    /*
    * Global defaults for clueTips. Apply to all calls to the clueTip plugin.
    *
    * @example $.cluetip.setup({
    *   insertionType: 'prependTo',
    *   insertionElement: '#container'
    * });
    * 
    * @property
    * @name $.cluetip.setup
    * @type Map
    * @cat Plugins/tooltip
    * @option String insertionType: Default is 'appendTo'. Determines the method to be used for inserting the clueTip into the DOM. Permitted values are 'appendTo', 'prependTo', 'insertBefore', and 'insertAfter'
    * @option String insertionElement: Default is 'body'. Determines which element in the DOM the plugin will reference when inserting the clueTip.
    *
    */

    var insertionType = 'appendTo', insertionElement = 'body';

    $.cluetip.setup = function (options) {
        if (options && options.insertionType && (options.insertionType).match(/appendTo|prependTo|insertBefore|insertAfter/)) {
            insertionType = options.insertionType;
        }
        if (options && options.insertionElement) {
            insertionElement = options.insertionElement;
        }
    };

})(jQuery);


/*
* ContextMenu - jQuery plugin for right-click context menus
*
* Author: Chris Domigan
* Contributors: Dan G. Switzer, II
* Parts of this plugin are inspired by Joern Zaefferer's Tooltip plugin
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
* Version: r2
* Date: 16 July 2007
*
* For documentation visit http://www.trendskitchens.co.nz/jquery/contextmenu/
*
*/

(function ($) {

    var menu, shadow, trigger, content, hash, currentTarget;
    var defaults = {
        menuStyle: {
            listStyle: 'none',
            padding: '1px',
            margin: '0px',
            backgroundColor: '#fff',
            border: '1px solid #999',
            width: '100px'
        },
        itemStyle: {
            margin: '0px',
            color: '#000',
            display: 'block',
            cursor: 'default',
            padding: '3px',
            border: '1px solid #fff',
            backgroundColor: 'transparent'
        },
        itemHoverStyle: {
            border: '1px solid #0a246a',
            backgroundColor: '#b6bdd2'
        },
        eventPosX: 'pageX',
        eventPosY: 'pageY',
        shadow: true,
        onContextMenu: null,
        onShowMenu: null
    };

    $.fn.contextMenu = function (id, options) {
        if (!menu) {                                      // Create singleton menu
            menu = $('<div id="jqContextMenu"></div>')
               .hide()
               .css({ position: 'absolute', zIndex: '500' })
               .appendTo('body')
               .bind('click', function (e) {
                   e.stopPropagation();
               });
        }
        if (!shadow) {
            shadow = $('<div></div>')
                 .css({ backgroundColor: '#000', position: 'absolute', opacity: 0.2, zIndex: 499 })
                 .appendTo('body')
                 .hide();
        }
        hash = hash || [];
        hash.push({
            id: id,
            menuStyle: $.extend({}, defaults.menuStyle, options.menuStyle || {}),
            itemStyle: $.extend({}, defaults.itemStyle, options.itemStyle || {}),
            itemHoverStyle: $.extend({}, defaults.itemHoverStyle, options.itemHoverStyle || {}),
            bindings: options.bindings || {},
            shadow: options.shadow || options.shadow === false ? options.shadow : defaults.shadow,
            onContextMenu: options.onContextMenu || defaults.onContextMenu,
            onShowMenu: options.onShowMenu || defaults.onShowMenu,
            eventPosX: options.eventPosX || defaults.eventPosX,
            eventPosY: options.eventPosY || defaults.eventPosY
        });

        var index = hash.length - 1;
        $(this).bind('contextmenu', function (e) {
            // Check if onContextMenu() defined
            var bShowContext = (!!hash[index].onContextMenu) ? hash[index].onContextMenu(e) : true;
            if (bShowContext) display(index, this, e, options);
            return false;
        });
        return this;
    };

    function display(index, trigger, e, options) {
        var cur = hash[index];
        content = $('#' + cur.id).find('ul:first').clone(true);
        content.css(cur.menuStyle).find('li').css(cur.itemStyle).hover(
      function () {
          $(this).css(cur.itemHoverStyle);
      },
      function () {
          $(this).css(cur.itemStyle);
      }
    ).find('img').css({ verticalAlign: 'middle', paddingRight: '2px' });

        // Send the content to the menu
        menu.html(content);

        // if there's an onShowMenu, run it now -- must run after content has been added
        // if you try to alter the content variable before the menu.html(), IE6 has issues
        // updating the content
        if (!!cur.onShowMenu) menu = cur.onShowMenu(e, menu);

        $.each(cur.bindings, function (id, func) {
            $('#' + id, menu).bind('click', function (e) {
                hide();
                func(trigger, currentTarget);
            });
        });

        menu.css({ 'left': e[cur.eventPosX], 'top': e[cur.eventPosY] }).show();
        if (cur.shadow) shadow.css({ width: menu.width(), height: menu.height(), left: e.pageX + 2, top: e.pageY + 2 }).show();
        $(document).one('click', hide);
    }

    function hide() {
        menu.hide();
        shadow.hide();
    }

    // Apply defaults
    $.contextMenu = {
        defaults: function (userDefaults) {
            $.each(userDefaults, function (i, val) {
                if (typeof val == 'object' && defaults[i]) {
                    $.extend(defaults[i], val);
                }
                else defaults[i] = val;
            });
        }
    };

})(jQuery);

$(function () {
    $('div.contextMenu').hide();
});

/**
* This jQuery plugin displays pagination links inside the selected elements.
*
* @author Gabriel Birke (birke *at* d-scribe *dot* de)
* @version 1.2
* @param {int} maxentries Number of entries to paginate
* @param {Object} opts Several options (see README for documentation)
* @return {Object} jQuery Object
*/
jQuery.fn.pagination = function (maxentries, opts) {
    opts = jQuery.extend({
        items_per_page: 10,
        num_display_entries: 10,
        current_page: 0,
        num_edge_entries: 0,
        link_to: "#",
        prev_text: "Prev",
        next_text: "Next",
        ellipse_text: "...",
        prev_show_always: true,
        next_show_always: true,
        callback: function () { return false; }
    }, opts || {});

    return this.each(function () {
        /**
        * Calculate the maximum number of pages
        */
        function numPages() {
            return Math.ceil(maxentries / opts.items_per_page);
        }

        /**
        * Calculate start and end point of pagination links depending on 
        * current_page and num_display_entries.
        * @return {Array}
        */
        function getInterval() {
            var ne_half = Math.ceil(opts.num_display_entries / 2);
            var np = numPages();
            var upper_limit = np - opts.num_display_entries;
            var start = current_page > ne_half ? Math.max(Math.min(current_page - ne_half, upper_limit), 0) : 0;
            var end = current_page > ne_half ? Math.min(current_page + ne_half, np) : Math.min(opts.num_display_entries, np);
            return [start, end];
        }

        /**
        * This is the event handling function for the pagination links. 
        * @param {int} page_id The new page number
        */
        function pageSelected(page_id, evt) {
            current_page = page_id;
            drawLinks();
            var continuePropagation = opts.callback(page_id, panel);
            if (!continuePropagation) {
                if (evt.stopPropagation) {
                    evt.stopPropagation();
                }
                else {
                    evt.cancelBubble = true;
                }
            }
            return continuePropagation;
        }

        /**
        * This function inserts the pagination links into the container element
        */
        function drawLinks() {
            panel.empty();
            var interval = getInterval();
            var np = numPages();
            // This helper function returns a handler function that calls pageSelected with the right page_id
            var getClickHandler = function (page_id) {
                return function (evt) { return pageSelected(page_id, evt); }
            }
            // Helper function for generating a single link (or a span tag if it's the current page)
            var appendItem = function (page_id, appendopts) {
                page_id = page_id < 0 ? 0 : (page_id < np ? page_id : np - 1); // Normalize page id to sane value
                appendopts = jQuery.extend({ text: page_id + 1, classes: "" }, appendopts || {});
                if (page_id == current_page) {
                    var lnk = jQuery("<span class='current'>" + (appendopts.text) + "</span>");
                }
                else {
                    var lnk = jQuery("<a>" + (appendopts.text) + "</a>")
						.bind("click", getClickHandler(page_id))
						.attr('href', opts.link_to.replace(/__id__/, page_id));


                }
                if (appendopts.classes) { lnk.addClass(appendopts.classes); }
                panel.append(lnk);
            }
            // Generate "Previous"-Link
            if (opts.prev_text && (current_page > 0 || opts.prev_show_always)) {
                appendItem(current_page - 1, { text: opts.prev_text, classes: "prev" });
            }
            // Generate starting points
            if (interval[0] > 0 && opts.num_edge_entries > 0) {
                var end = Math.min(opts.num_edge_entries, interval[0]);
                for (var i = 0; i < end; i++) {
                    appendItem(i);
                }
                if (opts.num_edge_entries < interval[0] && opts.ellipse_text) {
                    jQuery("<span>" + opts.ellipse_text + "</span>").appendTo(panel);
                }
            }
            // Generate interval links
            for (var i = interval[0]; i < interval[1]; i++) {
                appendItem(i);
            }
            // Generate ending points
            if (interval[1] < np && opts.num_edge_entries > 0) {
                if (np - opts.num_edge_entries > interval[1] && opts.ellipse_text) {
                    jQuery("<span>" + opts.ellipse_text + "</span>").appendTo(panel);
                }
                var begin = Math.max(np - opts.num_edge_entries, interval[1]);
                for (var i = begin; i < np; i++) {
                    appendItem(i);
                }

            }
            // Generate "Next"-Link
            if (opts.next_text && (current_page < np - 1 || opts.next_show_always)) {
                appendItem(current_page + 1, { text: opts.next_text, classes: "next" });
            }
        }

        // Extract current_page from options
        var current_page = opts.current_page;
        // Create a sane value for maxentries and items_per_page
        maxentries = (!maxentries || maxentries < 0) ? 1 : maxentries;
        opts.items_per_page = (!opts.items_per_page || opts.items_per_page < 0) ? 1 : opts.items_per_page;
        // Store DOM element for easy access from all inner functions
        var panel = jQuery(this);
        // Attach control functions to the DOM element 
        this.selectPage = function (page_id) { pageSelected(page_id); }
        this.prevPage = function () {
            if (current_page > 0) {
                pageSelected(current_page - 1);
                return true;
            }
            else {
                return false;
            }
        }
        this.nextPage = function () {
            if (current_page < numPages() - 1) {
                pageSelected(current_page + 1);
                return true;
            }
            else {
                return false;
            }
        }
        // When all initialisation is done, draw the links
        drawLinks();
        // call callback function
        opts.callback(current_page, this);
    });
}


// JQuery URL Parser
// Written by Mark Perkins, mark@allmarkedup.com
// License: http://unlicense.org/ (i.e. do what you want with it!)

jQuery.url = function () {
    var segments = {};

    var parsed = {};

    /**
    * Options object. Only the URI and strictMode values can be changed via the setters below.
    */
    var options = {

        url: window.location, // default URI is the page in which the script is running

        strictMode: false, // 'loose' parsing by default

        key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"], // keys available to query 

        q: {
            name: "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },

        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,  //less intuitive, more accurate to the specs
            loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // more intuitive, fails on relative paths and deviates from specs
        }

    };

    /**
    * Deals with the parsing of the URI according to the regex above.
    * Written by Steven Levithan - see credits at top.
    */
    var parseUri = function () {
        str = decodeURI(options.url);

        var m = options.parser[options.strictMode ? "strict" : "loose"].exec(str);
        var uri = {};
        var i = 14;

        while (i--) {
            uri[options.key[i]] = m[i] || "";
        }

        uri[options.q.name] = {};
        uri[options.key[12]].replace(options.q.parser, function ($0, $1, $2) {
            if ($1) {
                uri[options.q.name][$1] = $2;
            }
        });

        return uri;
    };

    /**
    * Returns the value of the passed in key from the parsed URI.
    * 
    * @param string key The key whose value is required
    */
    var key = function (key) {
        if (jQuery.isEmptyObject(parsed)) {
            setUp(); // if the URI has not been parsed yet then do this first...	
        }
        if (key == "base") {
            if (parsed.port !== null && parsed.port !== "") {
                return parsed.protocol + "://" + parsed.host + ":" + parsed.port + "/";
            }
            else {
                return parsed.protocol + "://" + parsed.host + "/";
            }
        }

        return (parsed[key] === "") ? null : parsed[key];
    };

    /**
    * Returns the value of the required query string parameter.
    * 
    * @param string item The parameter whose value is required
    */
    var param = function (item) {
        if (jQuery.isEmptyObject(parsed)) {
            setUp(); // if the URI has not been parsed yet then do this first...	
        }
        return (parsed.queryKey[item] === null) ? null : parsed.queryKey[item];
    };

    /**
    * 'Constructor' (not really!) function.
    *  Called whenever the URI changes to kick off re-parsing of the URI and splitting it up into segments. 
    */
    var setUp = function () {
        parsed = parseUri();

        getSegments();
    };

    /**
    * Splits up the body of the URI into segments (i.e. sections delimited by '/')
    */
    var getSegments = function () {
        var p = parsed.path;
        segments = []; // clear out segments array
        segments = parsed.path.length == 1 ? {} : (p.charAt(p.length - 1) == "/" ? p.substring(1, p.length - 1) : path = p.substring(1)).split("/");
    };

    return {

        /**
        * Sets the parsing mode - either strict or loose. Set to loose by default.
        *
        * @param string mode The mode to set the parser to. Anything apart from a value of 'strict' will set it to loose!
        */
        setMode: function (mode) {
            options.strictMode = mode == "strict" ? true : false;
            return this;
        },

        /**
        * Sets URI to parse if you don't want to to parse the current page's URI.
        * Calling the function with no value for newUri resets it to the current page's URI.
        *
        * @param string newUri The URI to parse.
        */
        setUrl: function (newUri) {
            options.url = newUri === undefined ? window.location : newUri;
            setUp();
            return this;
        },

        /**
        * Returns the value of the specified URI segment. Segments are numbered from 1 to the number of segments.
        * For example the URI http://test.com/about/company/ segment(1) would return 'about'.
        *
        * If no integer is passed into the function it returns the number of segments in the URI.
        *
        * @param int pos The position of the segment to return. Can be empty.
        */
        segment: function (pos) {
            if (jQuery.isEmptyObject(parsed)) {
                setUp(); // if the URI has not been parsed yet then do this first...	
            }
            if (pos === undefined) {
                return segments.length;
            }
            return (segments[pos] === "" || segments[pos] === undefined) ? null : segments[pos];
        },

        attr: key, // provides public access to private 'key' function - see above

        param: param // provides public access to private 'param' function - see above

    };

} ();

/*
* @brief: 定义堆栈类  
* @remark: 实现堆栈基本功能  
*/
function Stack() {
    //存储元素数组     
    var aElement = new Array();
    /*
    * @brief: 元素入栈
    * @param: 入栈元素列表     
    * @return: 堆栈元素个数     
    * @remark: 1.Push方法参数可以多个     
    *    2.参数为空时返回-1     
    */
    Stack.prototype.Push = function (vElement) {
        if (arguments.length == 0)
            return -1;
        //元素入栈         
        for (var i = 0; i < arguments.length; i++) {
            aElement.push(arguments[i]);
        }
        return aElement.length;
    }
    /*     
    * @brief: 元素出栈     
    * @return: vElement     
    * @remark: 当堆栈元素为空时,返回null     
    */
    Stack.prototype.Pop = function () {
        if (aElement.length == 0)
            return null;
        else
            return aElement.pop();
    }
    /*     
    * @brief: 获取堆栈元素个数     
    * @return: 元素个数     
    */
    Stack.prototype.GetSize = function () {
        return aElement.length;
    }
    /*     
    * @brief: 返回栈顶元素值     
    * @return: vElement     
    * @remark: 若堆栈为空则返回null     
    */
    Stack.prototype.GetTop = function () {
        if (aElement.length == 0)
            return null;
        else
            return aElement[aElement.length - 1];
    }
    /*     
    * @brief: 将堆栈置空     
    */
    Stack.prototype.MakeEmpty = function () {
        aElement.length = 0;
    }
    /*     
    * @brief: 判断堆栈是否为空     
    * @return: 堆栈为空返回true,否则返回false     
    */
    Stack.prototype.IsEmpty = function () {
        if (aElement.length == 0)
            return true;
        else
            return false;
    }
    /*     
    * @brief: 将堆栈元素转化为字符串     
    * @return: 堆栈元素字符串     
    */
    Stack.prototype.toString = function () {
        var sResult = aElement.toString();
        //        aElement.reverse()
        return sResult.replace(/,/g, "");
    }
} 
