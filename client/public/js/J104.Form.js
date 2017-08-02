/********************************************************************************************************************************
 * J104.Form
 */
Constants.J104.Form = {
	loadAjaxError: '讀取資料錯誤',
	submitAjaxError: '發送資料錯誤'
};
J104.Form = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Form',
		extends: 'J104.PeerUIComponent',
		version: '2.0.4',
		lastModify: '2017/1/4'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var __parseAjaxOptions = function(dom, prop){
		if(dom.getProperty(prop)){
			var load = dom.getProperty(prop);
			try{ load = JSON.decode(load); }
			catch(e){ load = {url: load} }
			dom.removeProperty(prop);
			return Object.merge({}, load);
		}
		return null;
	};
	var _parseForm = function(_this){
		var P = _this.$P(), D = _this.$D();
		P.ajax = {};
		P.ajax.load = new Ajax(Object.merge({}, _this.options.loadOptions, __parseAjaxOptions(D.src, 'data'), {
			onRequest: function(){
				_this.notice.clear();
				if(D.submit) D.submit.disable().addClass('loading');
				D.wrapper.mask('transparent');
				P.locks = _this.$getInputs().filter(function(input){return input.isEnable();});
				P.locks.each(function(lock){lock.readOnly();});
				_this.fireEvent('load');
			},
			onComplete: function(){
				if(D.submit) D.submit.enable().removeClass('loading');
				D.wrapper.unmask();
				P.locks.each(function(lock){lock.editable();});
				_this.fireEvent('loadComplete');
			},
			onSuccess: function(code, message, data, xhr){
				_this.setValues(typeOf(_this.options.processReceiveData) === 'function' ? _this.options.processReceiveData(data) : data);
				_this.fireEvent('loadSuccess', [code, message, data]);
			},
			onError: function(code, message, data, xhr){
				if(_this.$events.loadError) _this.fireEvent('loadError', [code, message, data, xhr]);
				else _this.notice.error('[J104.Form] ' + Constants.J104.Form.loadAjaxError, {inject:D.wrapper});
			},
			defaultErrorHandler: false
		}));

		P.ajax.submit = new Ajax(Object.merge({}, _this.options.submitOptions,
			(__parseAjaxOptions(D.src, 'action') || __parseAjaxOptions(D.src, 'data-action')), {
			onRequest: function(){
				_this.notice.clear();
				if(D.submit) D.submit.disable().addClass('loading');
				D.wrapper.mask('transparent');
				P.locks = _this.getInputs().filter(function(input){return input.isEnable();});
				P.locks.each(function(lock){lock.readOnly();});
				_this.fireEvent('submit', [_this.getValues()]);
			},
			onComplete: function(){
				if(D.submit) D.submit.enable().removeClass('loading');
				D.wrapper.unmask();
				P.locks.each(function(lock){lock.editable();});
			},
			onSuccess: function(code, message, data, xhr){
				_this.fireEvent('submitSuccess', [code, message, data, xhr]);
			},
			onError: function(code, message, data, xhr){
				if(_this.$events.submitError) _this.fireEvent('submitError', [code, message, data, xhr]);
				else _this.notice.error('[J104.Form] ' + Constants.J104.Form.submitAjaxError, {inject:D.wrapper});
			},
			defaultErrorHandler: false
		}));

		D.src.inject(D.wrapper);
		D.wrapper.getElements('button').each(function(dom, idx){
			var type = dom.getProperty('type');
			if(type === 'submit' && !D.submit)
				D.submit = dom.addClass('submit').addEvent('click', function(evt){
					if(evt) evt.stop();
					_this.submit();
				}).addEvent('keydown', function(evt){
					evt.stop();
					if(evt.key === 'tab') evt.target.retrieve(!evt.shift ? 'nextSibling' : 'prevSibling').focus();
					else if(evt.key === 'enter') _this.submit();
				});
			else if(type === 'reset' && !D.reset)
				D.reset = dom.addClass('reset').addEvent('click', function(evt){
					if(evt) evt.stop();
					_this.reset();
				}).addEvent('keydown', function (evt) {
					evt.stop();
					if(evt.key === 'tab') evt.target.retrieve(!evt.shift ? 'nextSibling' : 'prevSibling').focus();
					else if(evt.key === 'enter') _this.reset();
				});
		});
	};
	var _parseInputs = function(_this){
		var P = _this.$P(), D = _this.$D();
		var inputs = P.inputs = {};
		var first = undefined, pre = undefined;
		var tip = new J104.Box.Tip(null, {theme:'validate'});
		D.wrapper.getElements('input, textarea, select').each(function(dom, idx){
			var tag = dom.get('tag'), type = dom.getAttribute('type');
			var object;
			var options = Object.merge(
				(JSON.decode(dom.getProperty('data-options') || dom.getProperty('options')) || {}),
				{validate: JSON.decode(dom.getProperty('data-validate') || dom.getProperty('validate')) || {}}
			);
			if((tag === 'input' && ['text', 'number', 'password'].contains(type)) || tag === 'textarea'){
				var initValue = dom.get('value');
				if(initValue != undefined && initValue != null && initValue != '') options.initValue = initValue;
			}
			if(tag === 'input' && ['text', 'number', 'password', 'date', 'datetime', 'file'].contains(type)){
				if(type === 'text') object = new J104.Input.Text(dom, options);
				else if(type === 'number') object = new J104.Input.Number(dom, options);
				else if(type === 'password') object = new J104.Input.Password(dom, options);
				else if(type === 'date') object = new J104.Input.Date(dom, options);
				else if(type === 'datetime') object = new J104.Input.DateTime(dom, options);
				else if(type === 'file') object = new J104.Input.File(dom, options);
				if(_this.options.enterBehavior && (['number', 'password', 'date', 'datetime'].contains(type) || (type === 'text' && object.DOM('field').get('tag') == 'input'))){
					object.DOM('field').addEvent('keydown', function(evt){
						if(!evt || evt.key != 'enter') return;
						if((object instanceof J104.Input.Text) && object.isAutoCompleteOpen()) return;

						if(_this.options.enterBehavior === 'submit'){
							object.blur();
							_this.submit();
						}
						else if(_this.options.enterBehavior === 'blur') object.blur();
					});
				}
			}
			else if(tag === 'textarea') object = new J104.Input.Text(dom, Object.merge({line: dom.getProperty('rows') || 5}, options));
			else if(tag === 'select'){
				var d = dom.getProperty('data'), data;
				if(d && Constants.J104.Options && Constants.J104.Options[d]) data = Constants.J104.Options[d];
				else data = JSON.decode(d)
				object = new J104.Input.Select(dom, Object.merge({}, {rawData:data}, options));
			}
			else if(tag === 'input' && type === 'picker'){
				var instance = dom.getProperty('data-instance') || dom.getProperty('instance') || 'J104.Input.Picker';
				object = new (eval(instance))(dom, options);
			}
			else if(tag === 'input' && type === '104Picker'){
				var instance = dom.getProperty('data-instance') || dom.getProperty('instance') || 'J104.Input.CategoryPicker';
				object = new (eval(instance))(dom, options);
			}
			else if(tag === 'input' && type === 'radio'){
				var d = dom.getProperty('data'), data;
				if(Constants.J104.Options && Constants.J104.Options[d]) data = Constants.J104.Options[d];
				else data = JSON.decode(d);
				var instance = dom.getProperty('data-instance') || dom.getProperty('instance') || 'J104.Input.Radio';
				object = new (eval(instance))(dom, data, options);
			}
			else if(tag === 'input' && type === 'checkbox'){
				var d = dom.getProperty('data'), data;
				if(Constants.J104.Options && Constants.J104.Options[d]) data = Constants.J104.Options[d];
				else data = JSON.decode(d);
				var instance = dom.getProperty('data-instance') || dom.getProperty('instance') || 'J104.Input.Checkbox';
				object = new (eval(instance))(dom, data, options);
			}
			if(!object) return;
			object.setTip(tip);
			inputs[dom.id] = object;
			if(options && options.ignoreTab) return;
			if(!first) first = object;
			else if(idx > 0 && pre){
				pre.setNextSibling(object);
				object.setPrevSibling(pre);
			}
			pre = object;
		});
		if(pre && first){
			if(!D.submit && !D.reset){
				pre.setNextSibling(first);
				first.setPrevSibling(pre);
			}
			else if(D.submit && D.reset)
				pre.setNextSibling(D.submit
					.store('nextSibling', D.reset.store('nextSibling', first.setPrevSibling(D.reset)).store('prevSibling', D.submit))
					.store('prevSibling', pre));
			else{
				var btn = D.submit || D.reset;
				pre.setNextSibling(btn.store('nextSibling', first.setPrevSibling(btn)).store('prevSibling', pre));
			}
		}
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.PeerUIComponent,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104Form',
			theme: '',
			additionClass: '',
			//loadOptions: {},
			//processReceiveData: function(data){return data;}
			//onLoad: function(){},
			//onLoadSuccess: function(code, message, data){},
			//onLoadError: function(response, error){}
			//onLoadFailure: function(xhr){}
			validate: function(values){ return true; },
			processValues: function(values){ return values; },
			submit: 'ajax',						// 'ajax' or false
			submitConfirm: false,				// string or false
			//submitOptions: {},				// ajax options
			//onSubmit: function(values){},
			//onSubmitSuccess: function(code, msg, data, xhr){},
			//onSubmitError: function(code, msg, data, xhr){}
			//onValidated: function(){},
			//onInvalidate: function(invalidInputs){},
			enterBehavior: 'submit'				// 'submit', 'blur' or false
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			if(options && options.onSuccess && !options.onSubmitSuccess) options.onSubmitSuccess = options.onSuccess;
			if(options && options.onFailure && !options.onSubmitFailure) options.onSubmitFailure = options.onFailure;
			this.parent(ele, options);

			_parseForm(this);
			_parseInputs(this);
			this.$P().extraValues = {};

			if(this.options.submitConfirm) this.$P().confirm = new J104.Box.Confirm(this.options.submitConfirm);
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$getInputs: function(){
			return Object.values(this.$P().inputs);
		}.protect(),

		$getInput: function(id){
			return this.$P().inputs[id];
		}.protect(),

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		destroy: function(){
			var P = this.$P();
			if(P && P.inputs) Object.each(P.inputs, function(value, key){value.destroy();});
			return this.parent();
		},

		getInput: function(id){
			return this.$getInput(id);
		},
		getInputs: function(){
			return this.$getInputs();
		},

		getValues: function(){
			var P = this.$P();
			var values = {};
			Object.each(P.inputs, function(input, key){
				if(input.isEnable() && input.getValue() != undefined) values[key] = input.getValue();
			});
			return Object.merge(values, P.extraValues);
		},
		getValue: function(id){
			var P = this.$P();
			return P.inputs[id] ? P.inputs[id].getValue() : P.extraValues[id];
		},
		setValues: function(values){
			if(this.isAjaxing()) return this;
			Object.each(values, function(value, id){
				this.setValue(id, value);
			}.bind(this));
			return this;
		},
		setValue: function(id, value){
			if(this.isAjaxing()) return this;
			var input = this.$getInput(id);
			if(input) input.setValue(value);
			else this.$P().extraValues[id] = value;
			return this;
		},
		removeExtraValues: function(props){
			props.each(function(prop){
				this.removeExtraValue(prop);
			}.bind(this));
			return this;
		},
		removeExtraValue: function(prop){
			delete this.$P().extraValues[prop];
			return this;
		},

		disableInput: function(id){
			if(this.isAjaxing()) return this;
			var input = this.$getInput(id);
			if(input) input.disable();
			return this;
		},
		enableInput: function(id){
			if(this.isAjaxing()) return this;
			var input = this.$getInput(id);
			if(input) input.enable();
			return this;
		},
		readOnlyInputs: function(ids){
			if(typeOf(ids) != 'array') ids = [ids];
			var _this = this;
			ids.each(function(id){
				var input = _this.getInput(id);
				if(input) input.readOnly();
			});
			return this;
		},

		reset: function(id){
			if(this.isAjaxing()) return this;
			if(id){
				var input = this.$getInput(id);
				if(input) input.reset();
			}
			else this.$getInputs().each(function(input){
				input.reset();
			});
			this.notice.clear();
			return this;
		},
		invalid: function(id, message){
			var input = this.$getInput(id);
			if(input) input.invalid(message);
			return this;
		},
		validate: function(){
			var invalidInputs = [];
			this.$getInputs().each(function(input){
				if(input.isEnable() && !input.validate()) invalidInputs.push(input);
			});
			if(invalidInputs.length > 0){
				var submit = this.$D().submit;
				if(submit) submit.addClass('invalid').removeClass.delay(200, submit, 'invalid');
				this.fireEvent('invalidate', [invalidInputs]);
			}
			else this.fireEvent('validated');
			return invalidInputs.length === 0;
		},

		isSubmitting: function(){ return this.$P().ajax.submit.isRunning(); },
		submit: function(options){
			if(!this.validate()) return false;

			var P = this.$P();
			var values = this.getValues();
			if(typeOf(this.options.validate) === 'function' && !this.options.validate(values)) return false;

			values = this.options.processValues ? this.options.processValues(values) : values;
			if(values === false) return this;

			if(this.options.submit){
				if(P.ajax.submit.isRunning()) P.ajax.submit.cancel();
				var fn = function(){
					P.ajax.submit.send(Object.merge({}, options, {data: values}));
				};
				if(P.confirm && this.options.submitConfirm)
					P.confirm.setContent(this.options.submitConfirm).removeEvents('yes').addEvent('yes', fn).open();
				else fn();
			}
			else this.fireEvent('submit', [values]);
			return this;
		},
		setSubmitConfirmMessage: function(msg){
			if(typeOf(msg) === 'string'){
				this.options.submitConfirm = msg;
				var P = this.$P();
				if(!P.confirm) P.confirm = new J104.Box.Confirm(this.options.submitConfirm)
			}
			return this;
		},

		isLoading: function(){ return this.$P().ajax.load.isRunning(); },
		load: function(options){
			var P = this.$P();
			if(P.ajax.load.isRunning()) P.ajax.load.cancel();
			P.ajax.load.send(options);
			return this;
		},

		isAjaxing: function(){
			var a = this.$P().ajax;
			return a && (a.submit.isRunning() || a.load.isRunning());
		}
	});
})();

Element.implement({
	makeForm: function(options){
		return new J104.Form(this, options);
	}
});

/********************************************************************************************************************************
 * J104.FormDialog
 */
J104.FormDialog = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.FormDialog',
		extends: 'J104.Box.Dialog',
		version: '2.0.1',
		lastModify: '2017/01/04'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Box.Dialog,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104BoxDialog',
			theme: '',
			additionClass: '',
			formOptions: {
			}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			this.parent(ele, options);

			var D = this.$D(), P = this.$P();
			D.okButton.setProperty('type', 'submit');
			if(D.src.getProperty('data')) D.container.setProperty('data', D.src.getProperty('data'));
			var action = D.src.getProperty('action') || D.src.getProperty('data-action');
			if(action) D.container.setProperty('data-action', action);
			this.form = new J104.Form(D.container, Object.merge({
				onSubmit: function(values){
					this.notice.clear();
				}.bind(this)
			}, this.options.formOptions));
			this.addEvent('close', function(evt){
				this.form.reset();
			}.bind(this))
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		destroy: function(){
			if(this.form) this.form.destroy();
			return this.parent();
		}
	});
})();

Element.implement({
	makeFormDialog: function(options){
		return new J104.FormDialog(this, options);
	}
});
