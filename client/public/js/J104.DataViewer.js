/********************************************************************************************************************************
 * J104.DataViewer
 */
Constants.J104.DataViewer = {
	loadAjaxError: '讀取資料錯誤'
};
J104.DataViewer = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.DataViewer',
		extends: 'J104.PeerUIComponent',
		version: '2.0.3',
		lastModify: '2017/01/20'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var __parseBinding = function(ele){
		var bindOptions = Object.merge({
			id: ele.id,
			property: ele.getProperty('data-property'),
			display: JSON.decode(ele.getProperty('data-display')),
			type: ele.getProperty('data-type') || 'string'
		}, JSON.decode(ele.getProperty('data')));
		if(!bindOptions.display && !bindOptions.property) return;

		return ele.store('J104DataViewer:bindOptions', bindOptions).removeProperties(
			'data-id', 'data-property', 'data-display', 'data-type', 'data');
	};
	var _parse = function(_this){
		var P = _this.$P(), D = _this.$D();
		var loadOptions = _this.options.loadOptions || {};
		if(D.src.getProperty('data')){
			var load = D.src.getProperty('data');
			try{ load = JSON.decode(load); }
			catch(e){ load = {url: load} }
			Object.merge(loadOptions, load);
			D.src.removeProperty('data');
		}
		P.ajax = new Ajax(Object.merge({
			method: 'get',
			onRequest: function(){
				_this.notice.clear();
				D.src.loading(); //mask('transparent');
			},
			onComplete: function(){
				D.src.unloading(); //unmask();
			},
			onSuccess: function(code, msg, data, xhr){
				if((data === null || data === undefined || data.length === 0) && _this.options.emptyWarning)
					_this.notice.warning(this.options.emptyWarning);
				else _this.setRawData(data);
			},
			onError: function(code, msg, data, xhr){
				_this.notice.error(Constants.J104.DataViewer.loadAjaxError);
			},
			defaultErrorHandler: false
		}, loadOptions));

		// parse collections ...
		P.collections = [];
		D.src.getElements('[data-collection]').each(function(dom){
			var region = new Element('div').inject(dom, 'after');
			var collection = {
				property: dom.getAttribute('data-collection'),
				region: region,
				template: dom.clone(),
				bindings: []
			};
			dom.destroy();
			collection.template.getElements('*').each(function(child){
				var bind = __parseBinding(child);
				if(bind) collection.bindings.push(bind);
			});
			P.collections.push(collection);
		});

		// parse normal field ...
		P.bindings = [];
		D.src.getElements('*').each(function(child){
			if(P.collections.some(function(c){return c.region.contains(child)})) return;
			var bind = __parseBinding(child);
			if(bind) P.bindings.push(bind);
		});
	};
	var __refreshBinding = function(dom, raw, idx){
		try{
			var bindOptions = dom.retrieve('J104DataViewer:bindOptions');
			if(!bindOptions) return;
			var value = '';
			if(bindOptions.display && typeOf(bindOptions.display) === 'function') value = bindOptions.display(raw);
			else if(bindOptions.property) value = bindOptions.property === '#' ? (idx || raw['#']) : raw[bindOptions.property];

			if(typeOf(value) === 'element') return value.inject(dom);
			var type = bindOptions.type;
			dom.set(type === 'html' ? 'html' : 'text', _value(type, value));
		}
		catch(e){ console.error(e); }
	};
	var _refresh = function(_this){
		var P = _this.$P();
		var raw = P.raw;
		P.bindings.each(function(dom){
			__refreshBinding(dom, raw);
		});
		P.collections.each(function(collection){
			var rows = raw[collection.property];
			collection.region.destroyChildren();
			//collection.clones.each(function(clone){ clone.destroy(); });

			if(typeOf(rows) != 'array') rows = [rows];
			rows.each(function(row, idx){
				collection.bindings.each(function(dom){
					dom.set('text', '');
					__refreshBinding(dom, row, idx + 1);
				});
				collection.template.clone().setStyle('display', '').inject(collection.region);
				//if(collection.clones.length === 0) clone.inject(collection.region, 'after');
				//else clone.inject(collection.clones.getLast(), 'after');
			});
		});
		return _this;
	};
	var _value = function(type, value){
		if(!type || value === null || value === undefined) return '';
		if(type.substring(0, 7) === 'option.') return J104.Utils.findOption(type.substring(7), value);
		else if(type.substring(0, 7) === 'binary.') return J104.Utils.findBinaryOption(type.substring(7), value);
		switch(type){
			case 'string':
				if(typeOf(value) === 'array'){
					var temp = '';
					value.each(function(v, idx){ temp += v + (idx < value.length - 1 ? ', ' : '')});
					value = temp;
				}
				return value;
			case 'html': return value;
			case 'datetime': return new Date(value).format('db');
			case 'date': return new Date(value).format('%Y-%m-%d');
			case 'time': return new Date(value).format('%H:%M:%S');
			case 'category': return J104.Utils.findCategory(value);
			// TODO more type ...
		}

	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.PeerUIComponent,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104DataViewer',
			//loadOptions: {},
			emptyWarning: 'Data not found!'		// string or false
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			this.parent(ele, options);
			var D = this.$D();
			D.wrapper.destroy();
			this.notice = this.options.notice || this.$buildNotice(D.src);

			this.$P().raw = {};
			_parse(this);
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		getRawData: function(){
			return this.$P().raw;
		},
		setRawData: function(raw){
			if(typeOf(raw) != 'object') return false;
			var P = this.$P();
			P.raw = raw;
			this.clear();
			return _refresh(this);
		},
		updateRawData: function(raw){
			if(typeOf(raw) != 'object') return false;
			var P = this.$P();
			P.raw = Object.merge(P.raw, raw);
			return _refresh(this);
		},

		clear: function(){
			var P = this.$P();
			P.bindings.each(function(b){ b.set('text', ''); });
			P.collections.each(function(c){
				c.region.destroyChildren();
			});
			return this;
		},

		isLoading: function(){
			var ajax = this.$P().ajax;
			return ajax && ajax.isRunning();
		},
		load: function(options){
			var ajax = this.$P().ajax;
			if(this.isLoading()) ajax.cancel();
			ajax.send(options);
			return this;
		},
		setAjaxUrl: function(url){
			var ajax = this.$P().ajax;
			return ajax.setUrl(url) ? this : false;
		},
		setAjaxPayload: function(payload){
			var ajax = this.$P().ajax;
			return ajax.setPayload(payload) ? this : false;
		},
		appendAjaxPayload: function(payload){
			var ajax = this.$P().ajax;
			return ajax.appendPayload(payload) ? this : false;
		},
		setAjaxOptions: function(options){
			if(typeOf(options) != 'object') return false;
			var ajax = this.$P().ajax;
			Object.merge(ajax.options, options);
			return this;
		},

		cloneViewer: function(){
			return this.$D().src.clone();
		}
	});
})();

Element.implement({
	makeDataViewer: function(options){
		return new J104.DataViewer(this, options);
	}
});

/********************************************************************************************************************************
 * J104.DataDialog
 */
J104.DataDialog = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.DataDialog',
		extends: 'J104.Box.Dialog',
		version: '2.0.0',
		lastModify: '2017/01/13'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Box.Dialog,
		profile: function(){ return Object.clone(__profile); },
		options: {
			//css: 'J104BoxDialog',
			theme: '',
			additionClass: '',
			footer: {					// object or false
				okButton: 'OK',			// string or false
				cancelButton: false	// string or false
			},
			loadOptions: {}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			this.parent(ele, options);

			var D = this.$D(), P = this.$P();
			D.okButton.addEvent('click', function(e){
				this.close();
			}.bind(this));
			P.viewer = new J104.DataViewer(D.body, {
				loadOptions: this.options.loadOptions
			});
			this.addEvent('close', function(evt){
				P.viewer.clear();
			}.bind(this))
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		open: function(ajaxOptions){
			this.parent();
			var viewer = this.$P().viewer;
			if(ajaxOptions) viewer.setAjaxOptions(ajaxOptions);
			viewer.load();
			return this;
		},

		clear: function(){
			this.$P().viewer.clear();
			return this;
		}
	});
})();

Element.implement({
	makeDataDialog: function(options){
		return new J104.DataDialog(this, options);
	}
});
