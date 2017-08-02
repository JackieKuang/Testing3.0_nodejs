/********************************************************************************************************************************
 * J104.Grid
 */
Constants.J104.Grid = {
	loadAjaxError: '讀取資料錯誤',
    ctrlAjaxError: '操作錯誤'
};
J104.Grid = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Grid',
		extends: 'J104.PeerUIComponent',
		version: '2.0.6',
		lastModify: '2017/01/20'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var __filter = function(_this, P){
		var f = P.filterForm;
		if(!f.validate()) return false;
		var values = f.getValues();
		if(JSON.stringify(values) !== JSON.stringify(P.preFilterValues)){
			_this.loadData(Object.merge({}, P.ajax.options, {data: values}));
			P.preFilterValues = values;
		}
		return _this;
	};

	var _buildFilter = function(_this){
		var filter = _this.options.filter;
		if(!filter || typeOf(filter) != 'element') return false;

		var P = _this.$P();
		var f = P.filterForm = new J104.Form(filter, Object.merge({}, _this.options.filterFormOptions, {
			enterBehavior: 'blur'
		}));
		P.preFilterValues = {}; //f.getValues();
		if(_this.options.autoFilter)
            f.getInputs().each(function(input){
                var event = 'blur';
                if(instanceOf(input, J104.Input.Radio) || instanceOf(input, J104.Input.Checkbox)) event = 'check';
                if(instanceOf(input, J104.Input.Picker)) event = 'update';
                input.addEvent(event, function(evt){__filter(_this, P);});
            });
		if(_this.options.filterTrigger && typeOf(_this.options.filterTrigger) === 'element'){
            _this.options.filterTrigger.addEvent('click', function(evt){
                __filter(_this, P);
            });
		}
	};
	var _parseTable = function(_this){
		var D = _this.$D(), P = _this.$P();
		if(D.src.get('tag') !== 'table') throw new Error('[' + __name + '] ' + (D.src.id || D.src) + ' is not <Table>');
		D.wrapper.grab(D.src);
		var table = D.src;
		var loadOptions = Object.merge({auto:false}, _this.options.loadOptions);
		if(table.getProperty('data')){
			var load = table.getProperty('data');
			try{ load = JSON.decode(load); }
			catch(e){ load = {url: load} }
			Object.merge(loadOptions, load);
			table.removeProperty('data');
		}
		var _locks = [];
		P.ajax = new Ajax(Object.merge(loadOptions, {
			onRequest: function(){
				_this.notice.clear();
				_this.loading(loadOptions.text);
				_this.fireEvent('beforeLoad');
				if(_this.options.lockFilter){
                    _locks = P.filterForm.getInputs().filter(function(input){return input.isEnable();});
                    _locks.each(function(lock){lock.readOnly();});
                }
			},
			onComplete: function(){
				_this.unloading();
                if(_this.options.lockFilter){
                    _locks.each(function(lock){lock.editable();});
                }
			},
			onSuccess: function(code, msg, data, xhr){
				_this.setData(typeOf(_this.options.processReceiveData) === 'function' ? _this.options.processReceiveData(data) : data);
				_this.fireEvent('loadSuccess', [code, msg, data, xhr]);
				if(code == 201){
					_footForPaging(_this, D, P);
					P.paging.cursor = msg.cursor || 0;
					P.paging.total = msg.total;
				}
				else P.paging = {};
			},
			onError: function(code, msg, data, xhr){
                console.error('[J104.Grid] load ajax Error: ' + msg);
				if(_this.$events.loadError) _this.fireEvent('loadError', [code, msg, data, xhr]);
                else _this.notice.error(Constants.J104.Grid.loadAjaxError, {inject: D.wrapper});
			},
			defaultErrorHandler: false
		}));
		if(loadOptions.url && loadOptions.auto){
			if(P.preFilterValues) _this.loadData.delay(50, _this, {data:P.preFilterValues});
			else _this.loadData.delay(50, _this);
		}

		var thead = D.thead = table.getChildren('thead')[0];
		if(!thead) throw new Error('[' + __name + '] ' + '<thead> is required.');
		//table.getChildren().each(function(ele){if(ele != thead) ele.destroy();});

		D.tbody = table.getChildren('tbody')[0];
		if(!D.tbody) D.tbody = new Element('tbody').inject(table);
		_empty(_this);
		P.cells = [];
		thead.getChildren('tr')[0].getChildren().each(function(ele){
			if(!['td', 'th'].contains(ele.get('tag'))) return;
			var cell = {td:{}, data:{type:'string'}};
			if(ele.getProperty('td-cssClass') || ele.getProperty('data-td-cssClass')) cell.td.cssClass = ele.getProperty('td-cssClass') || ele.getProperty('data-td-cssClass');
			if(ele.getProperty('td-cssStyle') || ele.getProperty('data-td-cssStyle')) cell.td.cssStyle = JSON.decode(ele.getProperty('td-cssStyle') || ele.getProperty('data-td-cssStyle'));
			if(ele.getProperty('td-onClick') || ele.getProperty('data-td-onClick')) cell.td.click = JSON.decode(ele.getProperty('td-onClick') || ele.getProperty('data-td-onClick'));
			if(ele.getProperty('td-onEnter') || ele.getProperty('data-td-onEnter')) cell.td.enter = JSON.decode(ele.getProperty('td-onEnter') || ele.getProperty('data-td-onEnter'));
			if(ele.getProperty('td-onLeave') || ele.getProperty('data-td-onLeave')) cell.td.leave = JSON.decode(ele.getProperty('td-onLeave') || ele.getProperty('data-td-onLeave'));
			if(ele.getProperty('td') || ele.getProperty('data-td')) cell.td = Object.merge(cell.td, JSON.decode(ele.getProperty('td') || ele.getProperty('data-td')));
			if(ele.getProperty('data-property')) cell.data.property = ele.getProperty('data-property');
			if(ele.getProperty('data-type')) cell.data.type = ele.getProperty('data-type');
			if(ele.getProperty('data-display')) cell.data.display = JSON.decode(ele.getProperty('data-display'));
			if(ele.getProperty('data-control')) cell.data.control = JSON.decode(ele.getProperty('data-control'));
			if(ele.getProperty('data-checkable')) {
				cell.data.checkable = JSON.decode(ele.getProperty('data-checkable'));
				ele.removeProperty('data-checkable');
				var c = D.globalCheckbox = new Element('span.checkbox').inject(ele).addEvent('click', function(evt){
					var isChecked = c.hasClass('checked');
					c[isChecked ? 'removeClass' : 'addClass']('checked');
					P.checkboxs.each(function(cb){
						cb[isChecked ? 'removeClass' : 'addClass']('checked');
						cb.retrieve('data')['__CHECKED__'] = !isChecked;
					});
					_refreshCtrlPanel(_this, P);
					_this.fireEvent('checkGlobal', [_this.getCheckedData()]);
				});
			}
			//if(ele.getProperty('data-html')) cell.data.html = ele.getProperty('data-display') === 'true';
			if(ele.getProperty('data')) cell.data = Object.merge(cell.data, JSON.decode(ele.getProperty('data')));
			P.cells.push(cell);
			ele.removeProperties('td-cssClass', 'td-cssStyle', 'td-onClick', 'td-onEnter', 'td-onLeave',
				'data-td-cssClass', 'data-td-cssStyle', 'data-td-onClick', 'data-td-onEnter', 'data-td-onLeave',
				'td', 'data-td', 'data-property', 'data-type', 'data-display', 'data-control', 'data');
		});
	};
	var _footForPaging = function(_this, D, P){
		if(!D.tfoot){
			P.paging = {};
			var table = D.src;
			var foot = D.tfoot = table.getChildren('tfoot')[0] || new Element('tfoot').inject(table, 'bottom');
			var f = new Element('td', {colspan: P.cells.length, style: 'padding:5px;text-align:center'}).inject(foot);
			var container = _this.options.container || document.body;
			var ajax = new Ajax({
				link: 'ignore',
				url: _this.options.loadOptions.url,
				method: P.ajax.options.method,
				onRequest: function () {
					f.addClass('loading');
				},
				onComplete: function () {
					f.removeClass('loading');
				},
				onSuccess: function (code, message, data) {
					_this.appendData(data);
					P.paging.cursor = message.cursor.toInt();
				}
			});
			P.paging.container = container === document.body ? window : container;
			P.paging.scrollFn = function(evt){
				var offset = container === document.body ?
					(foot.getPosition().y - window.getScroll().y - window.getSize().y) :
					(foot.getPosition(container).y - container.getSize().y);
				if(P.paging.cursor < P.paging.total && offset < 0) {
					ajax.send({
						data: Object.merge({}, P.preFilterValues, {cursor: P.paging.cursor})
					});
				}
			}
			P.paging.container.addEvent('scroll', P.paging.scrollFn);
		}
	}
	var _parseCtrlPanel = function(_this){
		var D = _this.$D(), P = _this.$P(), options = _this.options;
		var panel = D.ctrlPanel = options.ctrlPanel || D.src.getFirst('caption');
		if(!D.ctrlPanel) return;
		P.globalCtrls = [];
		panel.getElements('.ctrl').each(function(btn){
			var opt = Object.merge({
				dom: btn,
				isEnable: function(grid, checked){ return true; },
				isVisible: function(grid, checked){ return true; }
			}, JSON.decode(btn.getProperty('options') || btn.getProperty('data-options')));
			btn.removeProperties('options', 'data-options');
			P.globalCtrls.push(opt);
			if(!opt.isVisible || !opt.isVisible(_this, [])) btn.addClass('hidden');
			btn[!opt.isEnable || !opt.isEnable(_this, []) ? 'disable' : 'enable']();
			_handleCtrlOptions(_this, btn, opt, null);
		});
	};
	var _empty = function(_this){
		var D = _this.$D();
		if(!D.tbody || D.tbody.getChildren().length === 0) return;
		D.tbody.destroyChildren();
		var P = _this.$P();
		if(P.tip) P.tip.removeAllAttach();
	};
	var _renderRow = function(_this, rowData, idx){
		var tr = new Element('tr');
		var P = _this.$P();
		if(P.cells)
			P.cells.each(function(cell){
				var td = new Element('td').inject(tr);
				// 'td' part ...
				if(cell.td.cssClass) td.addClass(typeOf(cell.td.cssClass) === 'function' ? cell.td.cssClass(_this, rowData, idx) : cell.td.cssClass);
				if(cell.td.cssStyle) td.setStyles(cell.td.cssStyle);
				_handleCtrlOptions(_this, td, cell.td, {data: rowData, idx: idx});

				// 'data' part ...
				if(cell.data.checkable){
					if((typeOf(cell.data.checkable) != 'function' && cell.data.checkable) || (typeOf(cell.data.checkable) === 'function' && cell.data.checkable(rowData, idx))){
						var c = new Element('span.checkbox').addEvent('click', function(evt){
							var isChecked = rowData['__CHECKED__'];
							rowData['__CHECKED__'] = !isChecked;
							c[isChecked ? 'removeClass' : 'addClass']('checked');
							_refreshCtrlPanel(_this, P);
							_this.fireEvent('check', [rowData, idx, rowData['__CHECKED__']]);
						})[rowData['__CHECKED__'] ? 'addClass' : 'removeClass']('checked').inject(td);
						P.checkboxs.push(c.store('data', rowData));
					}
				}
				else if(cell.data.control){
					td.addClass('controls');
					var controls = _this.options.controls;
					cell.data.control.each(function(c){
						var opt = Object.merge({
							css: c,
							tip: false,
							confirm: false,
							isVisible: function(grid, data, idx){ return true },
							isEnable: function(grid, data, idx){ return true; }
						}, controls[c]);
						if(!opt.isVisible || !opt.isVisible(_this, rowData, idx)) return;

						var dom = new Element('div.fa.ctrl.' + opt.css).inject(td);
						if(!opt.isEnable || !opt.isEnable(_this, rowData, idx)) return dom.addClass('disable');
						_handleCtrlOptions(_this, dom, opt, {data: rowData, idx: idx});
					});
				}
				else{
					var contentType = cell.data.type;
					var content;
					if(cell.data.display){
						content = cell.data.display(rowData, idx, _this);
						if(typeOf(content) === 'element') return content.inject(td);
					}
					else if(cell.data.property){
						var prop = cell.data.property;
						if(prop === '#') return td.set('text', idx + 1);
						content = rowData[prop];
					}
					if(contentType.substring(0, 7) === 'option.')
						return td.set('text', J104.Utils.findOption(contentType.substring(7), content));
					else if(contentType.substring(0, 7) === 'binary.')
						return td.set('text', J104.Utils.findBinaryOption(contentType.substring(7), content));
					switch(contentType){
						case 'string':
							if(typeOf(content) === 'array'){
								var temp = '';
								content.each(function(v, idx){ temp += v + (idx < content.length - 1 ? ', ' : '')});
								content = temp;
							}
							return td.set('text', content);
						case 'html': return td.set('html', content);
						case 'datetime':
						case 'date':
						case 'time':
							content = content === null ? '' : content;
							var key = {
								datetime: 'db',
								date: '%Y-%m-%d',
								time: '%H:%M:%S'
							}
							content = new Date(content).format(key[contentType]);
							return td.set('text', content === 'invalid date'  ? 'n/a' : content);
						case 'category': return td.set('text', content ? J104.Utils.findCategory(content) : '');
						// TODO more type ...
					}
				}
			});
		return tr;
	};
	var _refreshCtrlPanel = function(_this, P){
		if(!P.globalCtrls) return;
		var checked = _this.getCheckedData();
		P.globalCtrls.each(function(ctrl){
			ctrl.dom[ctrl.isVisible(_this, checked) ? 'removeClass' : 'addClass']('hidden');
			ctrl.dom[ctrl.isEnable(_this, checked) ? 'enable' : 'disable']();
		});
	}
	var _getCheckedData = function(data, prop){
		var checked = [];
		if(data)
			data.each(function(d){
				if(!d['__CHECKED__']) return;
				var d1 = d[prop] ? d[prop] : d;
				//if(typeOf(d1) === 'object') d1 = Object.clone(d1);
				checked.push(d1);
			});
		return checked;
	};

	var _handleCtrlOptions = function(_this, dom, options, row){
		var P = _this.$P(), D = _this.$D(), tip = options.tip, confirm = options.confirm;
		if(tip) P.tip.addAttach(dom.store('J104.Box.Tip:message', row ? tip.substitute(row.data) : tip));

		if(confirm && options.onClick) P.confirm.addAttach(dom.store('J104.Box.Confirm:message', row ? confirm.substitute(row.data) : confirm));
		var nativeEvent = {
			onClick: 'click',
			onEnter: 'mouseenter',
			onLeave: 'mouseleave'
		};
		['onClick', 'onEnter', 'onLeave'].each(function(e){
			if(!options[e]) return;
			var event = options[e];
			if(typeOf(event) === 'function'){
				if(e != 'onClick' || !options.confirm) dom.addEvent(nativeEvent[e], function(evt){
					if(row) event(evt, _this, row.data, row.idx);
					else event(evt, _this, _this.getCheckedData());
				});
				else dom.store('J104.Box.Confirm:yes', row ?
					event.bind(null, null, _this, row.data, row.idx) : event.bind(null, null, _this, _this.getCheckedData()));
			}
			else if(typeOf(event) === 'object'){
				var dataFn = null;
				if(event.data && typeOf(event.data) === 'function'){
					dataFn = event.data;
					event.data = row ? dataFn(_this, row.data, row.idx) : dataFn(_this, _this.getCheckedIds());
				}
				var fn = function(){
					if(!row) event.data = dataFn(_this, _this.getCheckedIds());
					__genSpecficAjax(_this, row, D, event).send(event);
				}
				if(e != 'onClick' || !options.confirm) dom.addEvent(nativeEvent[e], function(evt){fn();});
				else dom.store('J104.Box.Confirm:yes', fn);
			}
		});
	};
	var __genSpecficAjax = function(_this, row, D, ajaxOptions){
		var __makeLoadingOnRequestOptions = function(opt){
			var options = {
				mask: true,
				message: 'loading',
				notice: false
			}
			if(opt === false) options.mask = false;
			else if(typeOf(opt) === 'string') options.message = opt;
			else if(typeOf(opt) === 'object') options = Object.merge(options, opt);
			return options;
		};
		var loadingOptions = __makeLoadingOnRequestOptions(ajaxOptions.loadingOnRequest);
		delete ajaxOptions.onRequest; delete ajaxOptions.onComplete;
		delete ajaxOptions.onError; delete ajaxOptions.onFailure;
		return new Ajax({
			onRequest: function(){
				document.body.clearNotices();
				if(loadingOptions.mask === false) return;
				if(loadingOptions.notice === false) _this.loading(loadingOptions.message);
				else{
					D.src.mask();
					document.body.notice(loadingOptions.message, {delayClose:-1, single:false, inject:D.wrapper})
				}
			},
			onComplete: function(){
				if(loadingOptions.mask === true){
					if(loadingOptions.notice === false) _this.unloading();
					else{
						D.src.unmask();
						document.body.clearNotices();
					}
				}
				if(ajaxOptions.reloadOnComplete === false) return;
				else _this.reload();
			},
			onSuccess: function(code, msg, data, xhr){
				if(ajaxOptions.onSuccess && typeOf(ajaxOptions.onSuccess) === 'function')
					ajaxOptions.onSuccess(_this, row ? row.data : null, row ? row.idx : null, code, msg, data);
			},
			onError: function(code, msg, data, xhr){
				document.body.error(Constants.J104.Grid.ctrlAjaxError, {inject:D.wrapper});
				console.error('[J104.Grid] ajax(ctrl) Error: ' + msg);
				console.error(xhr);
			}
		});
	}

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.PeerUIComponent,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104Grid',
			loadOptions: {
				text: 'loading',
				auto: false
			},
			//container: document.body,				// if loadOptions.fetch > 0
			// processReceiveData: function(data){return data;}
			// onBeforeLoad: function(){},
			// onLoadSuccess: function(code, message, data){},
			// onLoadError: function(response, error){},
			emptyNotice: {
				enable: true,
				message: 'Data not found',
				type: 'info',
				options: {
					delayClose: 3000
				}
			},
			controls: {
				edit: {
					css: 'edit',
					tip: false, //'編輯 {name}',							// boolean or string(replace {xxx} by data.xxx)
					confirm: false,
					isEnable: function(grid, rowData, rowIdx){ return true; },
					isVisible: function(grid, rowData, rowIdx){ return true; }
					//onClick: ...										// function or object(ajax options)
					//function(evt, grid, rowData, rowIdx){},			// function
					//{													// object
					//	url: '',
					//	data: function(grid, rowData, rowIdx){}    		// request payload ...,
					//  loadingOnRequest: false or 'loading' or {
					//		notice: false,
					//		message: 'loading',
					//		mask: true
					//	}
					//	reloadOnComplete: true,							// boolean
					//	onSuccess: function(grid, rowData, rowIdx, code, message, data){}
					//},
					//onEnter: function(evt, grid, rowData, rowIdx){},
					//onLeave: function(evt, grid, rowData, rowIdx){},
				},
				delete: {
					css: 'delete',
					tip: false,
					confirm: '\'{name}\' will be deleted, are you sure?'
				}
			},
			// onCheckGlobal: function(checkedData){},
			// onCheck: function(rowData, idx, isCheck){},
			filter: null,		// element (J104.Form)
			// filterFormOptions: {},
			processFilterValues: function(values){ return values; },
			lockFilter: false,
			autoFilter: true,
			//filterTrigger: null,
			ctrlPanel: null		// default: <caption> of <table>
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			this.parent(ele, options);
			var P = this.$P();
			P.tip = new J104.Box.Tip(null);
			P.confirm = new J104.Box.Confirm('');
			_buildFilter(this);
			_parseTable(this);
			_parseCtrlPanel(this);
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		destroy: function(){
			var P = this.$P();
			if(P.confirm) P.confirm.destroy();
			if(P.filterForm) P.filterForm.destroy();
			if(P.tip) P.tip.destroy();
			if(P.paging && P.paging.container && P.paging.scrollFn)
				P.paging.container.removeEvent('scroll', P.paging.scrollFn);
			return this.parent();
		},

		refresh: function(){
			var P = this.$P(), D = this.$D();
			if(!D.tbody) return this;
			_empty(this);
			var data = P.data, wrapper = D.wrapper;
			if(data && data.length > 0){
				P.checkboxs = [];
				data.each(function(row, idx){
					_renderRow(this, row, idx).inject(D.tbody);
				}.bind(this));
				wrapper.removeClass('empty');
				_refreshCtrlPanel(this, P);
				if(D.globalCheckbox) D.globalCheckbox.removeClass('checked');
				this.fireEvent('checkGlobal', [this.getCheckedData()]);
			}
			else {
				wrapper.addClass('empty');
				if(this.options.emptyNotice && this.options.emptyNotice.enable && wrapper.isVisible()){
					var opt = this.options.emptyNotice;
					(function(){
						wrapper[['success', 'info', 'warning', 'error'].contains(opt.type) ?
							opt.type : 'notice'](opt.message, Object.merge(opt.options, {inject:wrapper, single:true}));
					}).delay(100);
				}
			}
			return this;
		},

		clearData: function(){
			this.$P().data = undefined;
			_empty(this);
			this.$D().src.mask();
			return this;
		},

		getCheckedData: function(){
			return _getCheckedData(this.$P().data);
		},
		getCheckedIds: function(){
			return _getCheckedData(this.$P().data,  'id');
		},
		getChecked: function(prop){
			return _getCheckedData(this.$P().data,  prop);
		},

		getData: function(){
			return this.$P().data;
		},
		setData: function(data){
			if(data === null || data === undefined) data = [];
			else if(typeOf(data) === 'object') data = [data];
			if(typeOf(data) != 'array') return this;
			this.$P().data = data;
			this.refresh();
			return this;
		},

		appendData: function(data){
			var P = this.$P();
			data.each(function(row, idx){
				_renderRow(this, row, idx + P.data.length).inject(this.$D().tbody);
			}.bind(this));
			P.data = P.data.concat(data);
			return this;
		},

		reload: function(){
			return this.loadData();
		},
		loadData: function(options){
			var P = this.$P();
			var ajax = P.ajax;
			if(ajax.isRunning()) ajax.cancel();
			if(P.filterForm) options = Object.merge({}, options, {data: this.options.processFilterValues(P.filterForm.getValues())});
			ajax.send(options);
			return this;
		},
		setLoadOptions: function(options){
			var P = this.$P();
			P.ajax.setOptions(Object.merge(P.ajax.options, options));
			return this;
		},

		setCriteriaValue: function(key, value){
			var P = this.$P();
			if(!P.filterForm) return false;
			P.filterForm.setValue(key, value);
			return this.options.loadOptions.auto ? __filter(this, P) : this;		// fire filter
		},

		getFilterForm: function(){
			return this.$P().filterForm;
		},

		filter: function(){
			return __filter(this, this.$P());
		}
	});
})();

Element.implement({
	makeGrid: function(options){
		return new J104.Grid(this, options);
	}
});


/********************************************************************************************************************************
 * J104.DataRenderer
 */
Constants.J104.DataRenderer = {
	loadAjaxError: '讀取資料錯誤'
};
J104.DataRenderer = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.DataRenderer',
		extends: 'J104.PeerUIComponent',
		version: '2.0.1',
		lastModify: '2016/11/30'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	/*var _buildFilter = function(_this){
		var filter = _this.options.filter;
		if(!filter || typeOf(filter) != 'element') return false;

		var P = _this.$P();
		var f = P.filterForm = new J104.Form(filter);
		P.preFilterValues = f.getValues();
		f.getInputs().each(function(input){
			var event = 'blur';
			if(instanceOf(input, J104.Input.Radio) || instanceOf(input, J104.Input.Checkbox)) event = 'check';
			input.addEvent(event, function(evt){
				var values = f.getValues();
				if(JSON.stringify(values) != JSON.stringify(P.preFilterValues)){
					_this.loadData(null, { data: values });
					P.preFilterValues = values;
				}
			});
		});
	};*/
	var _parse = function(_this){
		var D = _this.$D(), P = _this.$P();
		P.loadOptions = Object.merge({auto:false}, _this.options.loadOptions);
		if(D.src.getProperty('data')){
			var load = D.src.getProperty('data');
			try{ load = JSON.decode(load); }
			catch(e){ load = {url: load} }
			Object.merge(P.loadOptions, load);
			D.src.removeProperty('data');
		}
		P.ajax = new Ajax(Object.merge(P.loadOptions, {
			onRequest: function(){
				_this.notice.clear();
				_this.clear();
				D.container.loading();
				_this.fireEvent('beforeLoad');
			},
			onComplete: function(){
				D.container.unloading();
			},
			onSuccess: function(code, message, data){
				_this.setData(data);
				_this.fireEvent('loadSuccess', [code, message, data]);
			},
            onError: function(code, msg, data, xhr){
                console.error('[J104.DataRenderer] load ajax Error: ' + msg);
                if(_this.$events.loadError) _this.fireEvent('loadError', [code, msg, data, xhr]);
                else _this.notice.error(Constants.J104.DataRenderer.loadAjaxError, {inject: D.wrapper});
            },
            defaultErrorHandler: false
        }));
		if(P.loadOptions.url && P.loadOptions.auto) _this.loadData.delay(50, _this);

		D.src.inject(new Element('div'));
		D.container = D.wrapper.getParent();
		if(typeOf(_this.options.container) === 'element')
			D.container = _this.options.container;

		P.dataViwer = new J104.DataViewer(D.src);
	};
	var _getCheckedData = function(data, prop){
		var checked = [];
		data.each(function(d){
			if(!d['__CHECKED__']) return;
			var d1 = d[prop] ? d[prop] : d;
			if(typeOf(d1) === 'object') d1 = Object.clone(d1);
			checked.push(d1);
		});
		return checked;
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.PeerUIComponent,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104DataRenderer',
			loadOptions: {
				auto: false
			},
			// container: null,
			controls: {
				edit: {
					css: 'edit',
					tip: false, //'編輯 {name}',
					//click: function(data, evt){},
					//enter: function(data, evt){},
					//leave: function(data, evt){},
					enable: function(data, idx){ return true; },
					confirm: false
				},
				delete: {
					css: 'delete',
					tip: false,
					//click: function(data, evt){},
					//enter: function(data, evt){},
					//leave: function(data, evt){},
					enable: function(data, idx){ return true; },
					confirm: '\'{name}\' will be deleted, are you sure?'
				}
			},
			// onCheck: function(data, idx, check){},
			filter: null    // element (J104.Form)
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			this.parent(ele, options);
			//_buildFilter(this);
			_parse(this);

			//var P = this.$P(), D = this.$D();

			//P.tip = new J104.Box.Tip(null);
			//P.confirm = new J104.Box.Confirm('');
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		clear: function(){
			var P = this.$P();
			//D.container.destroyChildren();
			if(P.clones){
				P.clones.each(function(clone){ clone.destroy(); })
				P.clones = [];
			}
		},

		refresh: function(){
			var D = this.$D(), P = this.$P();
			this.clear();

			var data = P.data || [];
			if(!P.clones) P.clones = [];
			data.each(function(row, idx){
				row['#'] = idx + 1;
				var render = P.dataViwer.setRawData(row).cloneViewer();
				P.clones.push(render.inject(D.container));
				if(typeOf(P.loadOptions.click) === 'function')
					render.addEvent('click', function(evt){
						evt.stop();
						P.loadOptions.click(render, row, idx);
					});
				if(typeOf(P.loadOptions.enter) === 'function')
					render.addEvent('mouseenter', function(evt){
						evt.stop();
						P.loadOptions.enter(render, row, idx);
					});
				if(typeOf(P.loadOptions.leave) === 'function')
					render.addEvent('mouseleave', function(evt){
						evt.stop();
						P.loadOptions.leave(render, row, idx);
					});
			}.bind(this));
			return this;
		},

		/*clearData: function(){
			this.$P().data = undefined;
			_empty(this);
			this.$D().src.mask();
			return this;
		},

		getCheckedData: function(){
			return _getCheckedData(this.$P().data);
		},
		getCheckedIds: function(){
			return _getCheckedData(this.$P().data,  'id');
		},
		getChecked: function(prop){
			return _getCheckedData(this.$P().data,  prop);
		},*/

		getData: function(){
			return this.$P().data;
		},
		setData: function(data){
			if(data === null || data === undefined) data = [];
			else if(typeOf(data) === 'object') data = [data];
			if(typeOf(data) != 'array') return this;
			this.$P().data = data;
			this.refresh();
			return this;
		},

		/*appendData: function(data){
			var P = this.$P();
			data.each(function(row, idx){
				_renderRow(this, row, idx + P.data.length).inject(this.$D().tbody);
			}.bind(this));
			P.data = P.data.concat(data);
			return this;
		},*/

		reload: function(options){
			return this.loadData(options);
		},
		loadData: function(options){
			var ajax = this.$P().ajax;
			if(ajax.isRunning()) ajax.cancel();
			ajax.send(options);
			return this;
		}
	});
})();

Element.implement({
	makeDataRenderer: function(options){
		return new J104.DataRenderer(this, options);
	}
});
