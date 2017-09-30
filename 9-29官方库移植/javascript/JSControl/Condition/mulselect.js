(function ($) {
    var methods = {
        init: function (settings) {
            var selectControl = this;
            var paras = $.extend({
                multiple: false,
                datatype: "json",
                datastr: "",
                multiSettings: {
                    selectAllText: "全部",
                    selectedvalues: [],
                    selectChange: function () { }
                },
                selectChange: function () { }
            }, settings);
            paras.multiSettings.selectedvalues = settings.selectedvalues;
            paras.multiSettings.selectChange = settings.selectChange;
            if (paras.multiple == false) {
                this.attr("dx", "1");
            }
            else {
                this.attr("dx", "0");
            }
            if (paras.url == undefined || paras.url == "") {
                var table;
                if (typeof paras.datastr == "string") {
                    if (paras.datastr != "") {
                        table = $.parseJSON(paras.datastr);
                    }
                }
                else {
                    table = paras.datastr;
                }
                selectControl.empty();
                if (table != undefined) {
                    for (var i = 0; i < table.rows.length; i++) {
                        selectControl.append($("<option value='" + table.rows[i].col0 + "'>" + table.rows[i].col1 + "</option>"));
                    }
                }
                setMulSelect(paras, selectControl);
            }
            else {
                $.ajax({
                    cache: true,
                    type: "POST",
                    url: paras.url,
                    datatype: paras.datatype,
                    success: function (data) {
                        var table = eval("(" + data + ")");
                        selectControl.empty();
                        for (var i = 0; i < table.rows.length; i++) {
                            selectControl.append($("<option value='" + table.rows[i].col0 + "'>" + table.rows[i].col1 + "</option>"));
                        }
                        setMulSelect(paras, selectControl);
                    }
                });
            }

        },
        getSelects: function (type) {
            var values = [];
            if (this.css("display") == "none") {
                values = this.multipleSelect("getSelects", type);
            }
            else {
                values.push(type === 'text' ? this.find("option:selected").text() : this.find("option:selected").val());
            }
            return values;
        },
        setSelects: function (values) {
            if (this.attr("dx") == "0") {
                this.multipleSelect("setSelects", values);
            }
            else {
                if (values.length > 0) {
                    this.val(values[0]);
                }
            }
        }
    };

    function setMulSelect(paras, selectControl) {
        if (paras.multiple == false) {
            if (paras.selectedvalues != undefined && paras.selectedvalues.length > 0) {
                selectControl.val(paras.selectedvalues[0]);
            }
            selectControl.bind("change", paras.selectChange);
        }
        else {
            selectControl.multipleSelect(paras.multiSettings);
        }
    }

    $.fn.mulselect = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method' + method + 'does not exist on jQuery.mulselect');
        }
    }
})(jQuery);





/**
* @author zhixin wen <wenzhixin2010@gmail.com>
* @version 1.0.1
* 
* http://wenzhixin.net.cn/p/multiple-select/
*/

(function ($) {

    'use strict';

    function MultipleSelect($el, options) {
        var that = this;
        this.$el = $el.hide();
        this.options = options;

        this.$parent = $('<div class="ms-parent"></div>');
        this.$choice = $('<div class="ms-choice"><span class="placeholder">' +
			options.placeholder + '</span><div></div></div>');
        this.$drop = $('<div class="ms-drop"></div>');
        this.$el.after(this.$parent);
        this.$parent.append(this.$choice);
        this.$parent.append(this.$drop);

        if (this.$el.prop('disabled')) {
            this.$choice.addClass('disabled');
        }
        this.$choice.css('width', $el.width() + 'px')
			.find('span').css('width', ($el.width() - 20) + 'px');
        this.$drop.css({
            width: $el.width() + 'px'
        });

        $('body').click(function (e) {
            if ($(e.target)[0] === that.$choice[0] ||
					$(e.target).parents('.ms-choice')[0] === that.$choice[0]) {
                return;
            }
            if ($(e.target)[0] === that.$drop[0] ||
					$(e.target).parents('.ms-drop')[0] !== that.$drop[0]) {
                that.close();
            }
        });

        if (this.options.isopen) {
            this.open();
        }
    }

    MultipleSelect.prototype = {
        constructor: MultipleSelect,

        init: function () {
            var that = this,
				html = ['<ul>'];
            if (this.options.selectAll) {
                html.push(
					'<li>',
						'<label>',
							'<input type="checkbox" name="selectAll" /> ',
							'[' + this.options.selectAllText + ']',
						'</label>',
					'</li>'
				);
            }
            $.each(this.$el.children(), function (i, elm) {
                html.push(that.optionToHtml(i, elm));
            });
            html.push('</ul>');
            this.$drop.html(html.join(''));
            this.$drop.find('.multiple').css('width', this.options.multipleWidth + 'px');

            this.$selectAll = this.$drop.find('input[name="selectAll"]');
            this.$selectGroups = this.$drop.find('label.optgroup');
            this.$selectItems = this.$drop.find('input[name="selectItem"]');
            if(this.options.selectedvalues.length>0)
            {
                this.$selectItems.prop('checked', false);
                var that1 = this;
                $.each(this.options.selectedvalues, function (i, value) {
                    that1.$selectItems.filter('[value="' + value + '"]').prop('checked', true);
                });
                this.$selectAll.prop('checked', that.$selectItems.length ===
				this.$selectItems.filter(':checked').length);
                //判断是否默认选择全部；
                if (this.options.selectedvalues.indexOf("全部")!=-1) {
                    this.$selectAll.prop('checked', true);
                    this.$selectItems.prop('checked', true);
                }
                var selects = this.getSelects('text'),
				$span = this.$choice.find('>span');
                if (selects.length) {
                    $span.removeClass('placeholder').html(selects.join(','));
                } 
                else {
                    $span.addClass('placeholder').html(this.options.placeholder);
                }
             }
             this.events();
        },

        optionToHtml: function (i, elm, group) {
            var that = this,
				$elm = $(elm),
				html = [],
				multiple = this.options.multiple;
            if ($elm.is('option')) {
                var value = $elm.val(),
					text = $elm.text();
                html.push(
					'<li' + (multiple ? ' class="multiple"' : '') + '>',
						'<label>',
							'<input type="checkbox" name="selectItem" value="' + value + '"' +
								(group ? ' data-group="' + group + '"' : '') +
								'/> ',
							text,
						'</label>',
					'</li>'
				);
            } else if (!group && $elm.is('optgroup')) {
                var _group = 'group_' + i,
					label = $elm.attr('label');
                html.push(
					'<li>',
						'<label class="optgroup" data-group="' + _group + '">',
							label,
						'</label>',
					'</li>');
                $.each($elm.children(), function (i, elm) {
                    html.push(that.optionToHtml(i, elm, _group));
                });
            }
            return html.join('');
        },

        events: function () {
            var that = this,
				updateSelectAll = function () {
				    that.$selectAll.prop('checked', that.$selectItems.length ===
						that.$selectItems.filter(':checked').length);
				};
            this.$choice.off("click");
            this.$choice.on('click', function () {
                that[that.options.isopen ? 'close' : 'open']();
            });
            this.$selectAll.off('click');
            this.$selectAll.on('click', function () {
                that.$selectItems.prop('checked', $(this).prop('checked'));
                that.update();
            });
            this.$selectGroups.off('click');
            this.$selectGroups.on('click', function () {
                var group = $(this).attr('data-group'),
					$children = that.$selectItems.filter('[data-group="' + group + '"]');
                $children.prop('checked', $children.length !== $children.filter(':checked').length);
                updateSelectAll();
                that.update();
            });
            this.$selectItems.off('click');
            this.$selectItems.on('click', function () {
                updateSelectAll();
                that.update();
            });
        },

        open: function () {
            if (this.$choice.hasClass('disabled')) {
                return;
            }
            this.options.isopen = true;
            this.$choice.find('>div').addClass('open');
            this.$drop.show();
        },

        close: function () {
            this.options.isopen = false;
            this.$choice.find('>div').removeClass('open');
            this.$drop.hide();
        },

        update: function () {
            var selects = this.getSelects('text'),
				$span = this.$choice.find('>span');
            if (selects.length) {
                $span.removeClass('placeholder').html(selects.join(','));
            } else {
                $span.addClass('placeholder').html(this.options.placeholder);
            }
            this.options.selectChange();
        },

        //value or text, default: 'value'
        getSelects: function (type) {
            var values = [];
            //加个判断是否全部选中
            if (this.$selectAll.prop('checked')) {
                values = ["全部"];
                return values;
            }
            this.$selectItems.filter(':checked').each(function () {
                values.push(type === 'text' ? $.trim($(this).parent().text()) : $(this).val());
            });
            return values;
        },

        setSelects: function (values) {
            var that = this;
            this.$selectItems.prop('checked', false);
            //判断是否默认选择全部；
            if (values != undefined && values.length > 0 && values.indexOf("全部")!=-1) {
                this.$selectAll.prop('checked', true);
                this.$selectItems.prop('checked', true);
            }
            else {
                $.each(values, function (i, value) {
                    that.$selectItems.filter('[value="' + value + '"]').prop('checked', true);
                });
            }
            this.$selectAll.prop('checked', that.$selectItems.length ===
				this.$selectItems.filter(':checked').length);
            this.update();
        },

        enable: function () {
            this.$choice.removeClass('disabled');
        },

        disable: function () {
            this.$choice.addClass('disabled');
        }
    };

    $.fn.multipleSelect = function () {
        var option = arguments[0],
			args = arguments,

			value,
			allowedMethods = ['getSelects', 'setSelects', 'enable', 'disable'];

        this.each(function () {
            var $this = $(this),
				data = $this.data('multipleSelect'),
				options = $.extend({}, $.fn.multipleSelect.defaults, typeof option === 'object' && option);
            if (!data) {
                data = new MultipleSelect($this, options);
                $this.data('multipleSelect', data);
            }

            if (typeof option === 'string') {
                if ($.inArray(option, allowedMethods) < 0) {
                    throw "Unknown method: " + option;
                }
                value = data[option](args[1]);
            } else {
                data.init();
            }
        });

        return value ? value : this;
    };

    $.fn.multipleSelect.defaults = {
        isopen: false,
        placeholder: '',
        selectAll: true,
        selectAllText: 'Select all',
        multiple: false,
        multipleWidth: 80,
        selectedvalues:[],
        selectChange:function(){}
    };
})(jQuery);
