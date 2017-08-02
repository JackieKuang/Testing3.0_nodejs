/********************************************************************************************************************************
 * J104.Input
 */
Constants.J104.Input = {};
J104.Input = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Input',
		extends: 'J104.PeerUIComponent',
		version: '2.0.2',
		lastModify: '2016/08/03'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _error = function(_this, message){
		var D = _this.$D(), P = _this.$P();
		D.wrapper.addClass('fa has-error');
		if(P.tip) P.tip.addAttach(D.wrapper.store('J104.Box.Tip:message', message));
		else D.wrapper.tip(message);
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.PeerUIComponent,
		profile: function(){ return Object.clone(__profile); },
		options: {
			initValue: undefined,
			placeholder: undefined,
			editable: true,
			enable: true,
			tipOptions: {
				theme: 'validate',
				stick: {
					direction: 'ver',
					align: '+'
				}
			},
			_autoNotice: false,
			//onUpdate: function(_this, value, preValue){}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options) {
			this.parent(ele, options);
			this.$D().wrapper.set('j104-tip', this.options.tipOptions)
			var P = this.$P(), F = this.$F();
			P.initValue = P.value = this.options.initValue;
			P.validateRules = Object.clone(this.options.validate);
			F.editable = true;
			this.$build();
			this[this.options.enable ? 'enable' : 'disable']();
			this[this.options.editable ? 'editable' : 'readOnly']();
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$build: function(){	// abstract method ...
		}.protect(),

		$validate: function(value){
			return true;
		}.protect(),

		$setError: function(message){
			_error(this, message);
			this.$P().value = undefined;
			return false;
		}.protect(),

		$clearError: function(){
			var D = this.$D(), P = this.$P();
			D.wrapper.removeClass('has-error');
			if(P.tip) P.tip.removeAttach(D.wrapper);
			else D.wrapper.untip();
		}.protect(),

		$setValidated: function(value){
			var D = this.$D(), P = this.$P();
			D.wrapper.removeClass('has-error');
			if(P.tip) P.tip.removeAttach(D.wrapper);
			else D.wrapper.untip();
			//P.value = value;
			this.$updateValue(value);
			return true;
		}.protect(),

		$updateValue: function(value){
			var P = this.$P();
			var preValue = P.value;
			P.value = value;
			if(typeOf(P.value) === 'array' && typeOf(preValue) === 'array' && JSON.stringify(P.value) == JSON.stringify(preValue)) return;
			if(P.value != preValue) this.fireEvent('update', [this, P.value, preValue]);
		},

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		destroy: function(){
			var P = this.$P();
			if(P && P.tip) P.tip.destroy();
			return this.parent();
		},

		tabEvent: function(evt){
			evt.stop();
			if(this.blur()){
				var P = this.$P();
				if(P.nextSibling) P.nextSibling.focus();
			}
		},
		shiftTabEvent: function(evt){
			evt.stop();
			this.blur();
			var P = this.$P();
			if(P.prevSibling) P.prevSibling.focus();
		},

		setTip: function(tip){
			if(tip && tip.profile() && tip.profile().name === 'J104.Box.Tip'){
				var P = this.$P(), D = this.$D();
				var old = D.wrapper.retrieve('J104.TIP');
				if(old){
					old.removeAllAttach().destroy();
					D.wrapper.eliminate('J104.TIP');
				}
				P.tip = tip;
				D.wrapper.store('J104.Box.Tip:options', Object.merge({}, tip.options, this.options.tipOptions));
			}
			return this;
		},

		getLabel: function(){
			return this.options.placeholder || 	this.id();
		},

		getValue: function(){
			return this.$P().value;
		},
		setValue: function(value){
			if(!this.isEnable() || !this.$validate(value)) return false;
			this.$P().value = value;
			return this;
		},

		setError: function(msg){
			this.$setError(msg);
			return this;
		},

		disable: function(){
			this.parent();
			this.$F().focus = false;
			this.$clearError();
			return this;
		},

		isEditable: function(){ return this.$F().editable; },
		editable: function(){
			if(!this.isEnable()) return false;
			this.$F().editable = true;
			return this;
		},
		readOnly: function(){
			if(!this.isEnable()) return false;
			this.$F().editable = false;
			this.$clearError();
			return this;
		},

		validate: function(){ return !this.isEnable() || !this.isEditable(); },
		reset: function(){
			if(!this.isEnable()) return false;
			var P = this.$P();
			P.value = P.initValue;
			this.$clearError();
			this.$F().focus = false;
			return this;
		},
		clear: function(){
			if(!this.isEnable()) return false;
			this.$P().value = undefined;
			this.$clearError();
			return this;
		},
		clearError: function(){
			this.$clearError();
		},
		invalid: function(message){
			if(!this.isEnable()) return false;
			_error(this, message);
			return this;
		},

		isFocus: function(){ return this.$F().focus; },
		focus: function(){
			if(!this.isEnable() || this.isFocus()) return false;
			this.$clearError();
			this.$F().focus = true;
			return this;
		},
		blur: function(){
			if(!this.isEnable() || !this.isFocus()) return false;
			this.$F().focus = false;
			this.validate();
			this.fireEvent('blur');
			return this;
		},

		setNextSibling: function(input){
			if(instanceOf(input, J104.Input) || (typeOf(input) === 'element' && input.get('tag') === 'button')) this.$P().nextSibling = input;
			return this;
		},
		getNextSibling: function(){ return this.$P().nextSibling; },
		setPrevSibling: function(input){
			if(instanceOf(input, J104.Input) || (typeOf(input) === 'element' && input.get('tag') === 'button')) this.$P().prevSibling = input;
			return this;
		},
		getPrevSibling: function(){ return this.$P().prevSibling; }
	});
})();


/********************************************************************************************************************************
 * J104.Input.Text
 */
Constants.J104.Input.Text = {
	required: '必填欄位',
	max: '最多 {max} 個字',
	min: '至少 {min} 個字',
	regexp: '格式不符合',
	'pattern-email': '請輸入正確的e-mail格式',
	'pattern-date': '請輸入日期格式(YYYY/MM/DD)',
	'pattern-time': '請輸入時間格式(hh:mm)',
	'pattern-datetime': '請輸入日期時間格式(YYYY/MM/DD hh:mm)',
	'pattern-cellphone': '請輸手機號碼格式(ex: 0988-888888)',
	'pattern-tel': '請輸入電話號碼格式(ex: 02-88888888)',
	acNotFound: '查無資料'
};
J104.Input.Text = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Input.Text',
		extends: 'J104.Input',
		version: '2.1.1',
		lastModify: '2016/08/29'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _processAutoCompleteKeyin = function(D, P, F, options){
		var now = new Date().getTime();
		var kw = D.field.get('value').trim();
		if(options.queryLength == 0 && kw != '' && P.ac.preKw === kw) return;
		else if(options.queryLength > 0 && (kw === '＿' || P.ac.preKw === kw)) return;

		clearTimeout(P.ac.timer);
		if(kw.length < options.queryLength) return;
		P.ac.timer = (function(){
			if(!F.focus) return;
			if(P.ac.preKeyinTimestamp && (now - P.ac.preKeyinTimestamp <= options.keyinDelay)) return;
			P.ac.preKeyinTimestamp = now;
			P.ac.menu.open().position().loadContent(Object.merge(options, {
				data: Object.merge({}, options.queryData, {kw: kw})
			}));
			P.ac.preKw = kw;
		}).delay(options.keyinDelay);
	};
	var _buildAutocomplete = function(_this){
		var D = _this.$D(), P = _this.$P(), options = _this.options.autoComplete;
		P.ac = {
			preKw: '',
			menu: new J104.Box.Menu({
				theme: 'text-acmenu',
				fx: 'fade',
				stick: {
					target: D.field,
					direction: 'bottom',
					align: '-'
				},
				onBeforeOpen: function(){
					if(!_this.isEnable() || !_this.isEditable()) return P.menu.close();
					P.ac.menu.setWidth(D.field.getSize().x, 'min');
				},
				onClose: function(){
					//_this.blur();
				},
				//rawData: options.url,
				items: {
					onSelect: function(dom, data, idx){
						_this.setValue(options.value(data));
						P.ac.menu.close();
						_this.fireEvent('blur');
						if(typeOf(options.onSelect) === 'function') options.onSelect(data, dom, idx);
					}
				},
				onLoad: function(){
					P.ac.menu.position();
				},
				onLoadSuccess: function(code, message, data){
					if(P.ac.menu.getData().length === 0 && options.notFound === false) P.ac.menu.close();
					else if(P.ac.menu.isOpen()) P.ac.menu.position().refresh();
					else P.ac.menu.open();
				},
				emptyContent: options.notFound
			})
		};
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Input,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104Text',
			line: 1,
			autoResize: false,                  // boolean (only work on line>1)
			//indicator: '{length} / {max}', 	// false or String(variable:{length},{max})
			validate: {
				required: true,
				//requiredMsg: '',
				max: undefined,
				//maxMsg: '',
				min: 0,
				//minMsg: '',
				regexp: undefined,				// regexp(ex: /^\d{4}$/) or string
				//regexpMsg: '',
				pattern: undefined              // 'email', (TODO: add more...)
				//patternMsg: ''
			},
			autoComplete: false /*{
				url: '',
				method: 'get'			// get or post
				queryLength: 1,
				queryData: {},
				keyinDelay: 200,
				value: function(data){return data},
				onSelect: function(data, dom, idx){},
				notFound: ''					// string(message for not match) or false
			}*/
			//mask: ...							// TODO: mask
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			options = Object.merge({initValue: ''}, options);
			this.parent(ele, options);
			if((this.options.line > 1 && this.options.indicator === undefined) || this.options.indicator === true) this.options.indicator = '{length} / {max}';

			if(this.options.autoComplete && this.options.autoComplete.url){
				this.options.autoComplete = Object.merge({
					queryLength: 1,
					keyinDelay: 200,
					value: function(data){ return (data.value || data.name) ? (data.value || data.name) : data; },
					notFound: Constants.J104.Input.Text.acNotFound
				}, this.options.autoComplete);
				_buildAutocomplete(this);
			}
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$build: function(){
			var options = this.options;
			var D = this.$D(), P = this.$P(), F = this.$F();

			// gen Wrapper, Field, Indicator
			var ph = D.src.getProperty('placeholder') || options.placeholder;
			D.field = (options.line > 1 ?
				new Element('textarea.field.form-control', {id: D.src.id, rows: options.line, placeholder: ph}) :
				new Element('input.field.form-control', {id: D.src.id, type: 'text', placeholder: ph})).inject(D.wrapper);
			if(options.styles){
				D.wrapper.removeProperty('style');
				D.field.setStyles(options.styles);
			}
			if(options.initValue && options.initValue.length > 0) D.field.set('value', options.initValue);
			D.indicator = new Element('div.indicator').inject(D.wrapper).hide();
			D.src.destroy();

			// prepare Validate Rules (P.validateRules)
			if(!P.validateRules) P.validateRules = {
				max: undefined,
				min: undefined
			};
			var rules = P.validateRules;

			// handle events ...
			D.field.addEvents({
				focus: function(evt){
					this.focus();
					if(options.autoComplete && options.autoComplete.queryLength == 0)
						_processAutoCompleteKeyin(D, P, F, options.autoComplete);
				}.bind(this),
				blur: function(evt){
					if(this.validate()) this.fireEvent('blur');
				}.bind(this),
				keyup: function(evt){
					if(options.indicator){
						var id = D.indicator;
						var length = D.field.get('value').trim().length;
						id.set('text', rules.max === undefined ? length : options.indicator.substitute({
							length: length,
							max: rules.max
						}));
						if(D.field.get('tag') === 'input'){
							D.field.setStyle('padding-right', id.getSize().x + D.field.getComputedSize()['padding-left'] + 3);
						}
						if(length > rules.max || length < rules.min) id.addClass('fa has-error');
						else id.removeClass('has-error');
					}
					if(options.autoComplete && typeOf(options.autoComplete) === 'object' && options.autoComplete.url){
						if(evt && ['esc', 'tab', 'enter'].contains(evt.key)) return;
						else _processAutoCompleteKeyin(D, P, F, options.autoComplete);
					}
					this.fireEvent('keyup', [D.field.get('value')]);
				}.bind(this),
				keydown: function(evt){
					if(!evt.shift &&
						(evt.key === 'tab' /*|| (evt.key === 'enter' && (!options.line || options.line === 1))*/) &&
						(true /*!options.autoComplete || !P.ac.menu.isOpen()*/)) this.tabEvent(evt);
					else if(evt.shift && evt.key === 'tab') this.shiftTabEvent(evt);
					else if(evt.key === 'enter'){
						if(D.field.get('tag') == 'input'){
							evt.preventDefault();
							if(P.ac && P.ac.menu) P.ac.menu.cancelLoad();
						}
					}
					if(options.autoComplete && P.ac.menu.isOpen())
						_processAutoCompleteKeyin(D, P, F, options.autoComplete);      // fix IME bug: 攔截中文輸入選完字後(enter)的事件
				}.bind(this)
			});
			if(options.line > 1 && options.autoResize){
				var autoEvent = function(evt){
					D.field.style.height = 'auto';
					D.field.style.overflow = 'hidden';
					D.field.style.height = (D.field.scrollHeight + 2) + 'px';
				};
				D.field.addEvents({
					change: autoEvent,
					keyup: autoEvent,
					keydown: autoEvent,
					cut: autoEvent,
					paste: autoEvent,
					drop: autoEvent
				});
			}
		}.protect(),

		$validate: function(value){		// return boolean
			//value = value === undefined || value === null ? '' : value.toString();
			var rules = this.$P().validateRules;
			if(!rules) return this.$setValidated(value);

			if(rules.required && (!value || value.length == 0))
				return this.$setError(this.options.validate.requiredMsg || Constants.J104.Input.Text.required);
			var length = value ? value.toString().trim().length : 0;
			if(rules.max < length) return this.$setError((this.options.validate.maxMsg || Constants.J104.Input.Text.max).substitute({max: rules.max, min: rules.min}));
			if(rules.min > length) return this.$setError((this.options.validate.minMsg || Constants.J104.Input.Text.min).substitute({max: rules.max, min: rules.min}));
			if(length > 0 && rules.regexp && !value.test(rules.regexp)) return this.$setError((this.options.validate.regexpMsg || Constants.J104.Input.Text.regexp));

			var regExps = {
				email: /^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,10}$/i,
				date: /^[0-9]{4}\/([1-9]|0[1-9]|1[0-2])\/([1-9]|0[1-9]|[1-2][0-9]|3[0-1])$/i,
				time: /^(2[0-3]|1[0-9]|[0-9]|[01][0-9]):([0-9]|[0-5][0-9])$/i,
				datetime: /^[0-9]{4}\/([1-9]|0[1-9]|1[0-2])\/([1-9]|0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|1[0-9]|[0-9]|[01][0-9]):([0-9]|[0-5][0-9])$/i,
				cellphone: /^09[0-9]{2}(-| |)[0-9]{6}$/i,
				tel: /^0([2-8]|37|49|82|89|836)(-| |)[0-9]{6,8}$/i,
			};
			if(length > 0 && rules.pattern){
				var p = rules.pattern;
				if(!value.test(regExps[p])) return this.$setError((this.options.validate.patternMsg || Constants.J104.Input.Text['pattern-' + p]));
			}
			return this.$setValidated(value);
		}.protect(),

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		destroy: function(){
			var P = this.$P();
			if(P.ac && P.ac.menu) P.ac.menu.destroy();
			return this.parent();
		},

		setValue: function(value){
			if(!this.parent(value)) return false;
			this.$D().field.set('value', value);
			return this;
		},

		editable: function(){
			if(!this.parent()) return false;
			this.$D().field.removeProperty('readOnly');
			return this;
		},
		readOnly: function(){
			if(!this.parent()) return false;
			this.$D().field.setProperty('readOnly', 'readOnly');
			return this;
		},

		enable: function(){
			this.parent();
			this.$D().field.enable();
			return this;
		},
		disable: function(){
			this.parent();
			this.$D().field.disable();
			return this;
		},

		validate: function(){
			if(this.parent()) return true;
			var v = this.$D().field.get('value').trim();
			return this.$validate(v.length === 0 ? '' : v);
		},
		reset: function(){
			if(!this.parent()) return false;

			this.$D().field.set('value', this.getValue());
			return this;
		},
		clear: function(){
			if(!this.parent()) return false;

			this.$D().field.set('value', '');
			return this;
		},

		focus: function(){
			if(!this.parent()) return false;
			var D = this.$D();
			if(this.options.indicator){
				D.indicator.show();
				D.field.fireEvent('keyup');
			}
			D.field.focus();
			return this;
		},
		blur: function(){
			var P = this.$P();
			if(!this.parent()) return false;
			if(P.ac && P.ac.menu && P.ac.menu.isOpen())
				P.ac.menu.cancelLoad().close();

			var D = this.$D();
			if(this.options.indicator) D.indicator.hide();
			D.field.blur();
			return this;
		},

		isAutoComplete: function(){
			var P = this.$P();
			return P.ac ? true : false;
		},
		isAutoCompleteOpen: function(){
			var P = this.$P();
			return P.ac && P.ac.menu.isOpen();
		}
	});
})();


/********************************************************************************************************************************
 * J104.Input.Number
 */
Constants.J104.Input.Number = {
	required: '必填欄位',
	max: '必需小於 {max}',
	min: '必需大於 {min}',
	numeric: '必需為數字型態'
};
J104.Input.Number = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Input.Number',
		extends: 'J104.Input.Text',
		version: '2.0.0',
		lastModify: '2016/07/15'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Input.Text,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104Number',
			sign: false,
			float: false,
			precision: 2,
			validate: {
				max: Number.MAX_VALUE,
				min: undefined
			}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			this.parent(ele, options);
			var D = this.$D();
			D.field.setProperty('type', 'tel').setStyle('ime-mode', 'disabled').addEvent('keydown', function(evt){
				var char = evt.key, code = evt.code, value = D.field.get('value');
//console.log('KEY DOWN:' + evt.code + ', ' + evt.key + ', ' + evt.shift + ', ' + value)
				return (!evt.shift && ((code >= 96 && code <= 105) ||
						['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'enter', 'tab', 'up', 'down', 'left', 'right', 'backspace', 'delete', 'home', 'end'].contains(char) ||
						((char === '.' || code === 110) && this.options.float && (!value || (value.toString().indexOf('.') < 0))) ||
						(this.options.sign && (char === '-' || code === 109) && D.field.getCaretPosition() === 0))) ||
					(evt.shift && ['left', 'right', 'backspace', 'delete', 'home', 'end'].contains(char));
			}.bind(this));
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$validate: function(value){
			var rules = this.$P().validateRules;
			if(!rules) return this.$setValidated(value);

			if(rules.required && (!value || value.length == 0))
				return this.$setError(this.options.validate.requiredMsg || Constants.J104.Input.Number.required);
			else if(!rules.required && !value) return this.$setValidated(value);

			value = Number.convert(value);
			if(this.options.float && this.options.precision){
				var pr = this.options.precision.toInt().abs();
				value = (value * (10).pow(pr)).round() / (10).pow(pr);
			}
			if(value === null) return this.$setError(Constants.J104.Input.Number.numeric);
			if(rules.max < value) return this.$setError((this.options.validate.maxMsg || Constants.J104.Input.Number.max).substitute({max: rules.max, min: rules.min}));
			if(rules.min > value) return this.$setError((this.options.validate.minMsg || Constants.J104.Input.Number.min).substitute({max: rules.max, min: rules.min}));
			return this.$setValidated(value);
		}.protect(),

		$setValidated: function(value){
			var D = this.$D();
			D.field.set('value', value);
			return this.parent(value);
		}.protect(),
		/** -- public methods ----------------------------------------------------------------------------------------------- **/

	});
})();


/********************************************************************************************************************************
 * J104.Input.Password
 */
Constants.J104.Input.Password = {
	required: '請輸入密碼',
	max: '密碼長度最多為 {max}',
	min: '密碼長度至少為 {min}',
	alphabet: '至少需要 {a} 個字母',
	numeric: '至少需要 {n} 個數字',
	special: '至少需要 {count} 個特殊字元({char})',
	denySpecial: '不可包含特殊字元'
};
J104.Input.Password = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Input.Password',
		extends: 'J104.Input.Text',
		version: '2.0.0',
		lastModify: '2016/07/25'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Input.Text,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104Password',
			eye: true,
			validate: {
				max: undefined,
				min: 5,
				alphabet: 1,
				// alphabetMsg: '...'
				numeric: 0,
				// numeric: '...'
				special: undefined
				/*special: {
					char: '!@#$%^&/*+-=\\',
					count: 3
				}*/
			}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			this.parent(ele, options);
			var D = this.$D(), P = this.$P();
			D.indicator.destroy();
			delete D.indicator;
			D.field.setProperty('type', 'password');
			if(!this.options.eye) return;
			D.eye = new Element('div.fa.eye.close').inject(D.wrapper).addEvent('click', function(evt){
				evt.stop();
				if(D.eye.hasClass('open')){
					D.eye.removeClass('open').addClass('close');
					D.field.setProperty('type', 'password');
				}
				else{
					D.eye.removeClass('close').addClass('open');
					D.field.setProperty('type', 'text');
				}
			});
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$validate: function(value){
			if(!value || value.length === 0)
				return this.$setError(Constants.J104.Input.Password.required);

			var rules = this.$P().validateRules;
			if(!rules) return this.$setValidated(value);

			var length = value.toString().trim().length;
			var max = rules.max ? rules.max * 1 > 0 ? rules.max * 1 : 0 : 0;
			var min = rules.min ? rules.min * 1 > 0 ? rules.min * 1 : 0 : 0;
			if(max > 0 && max < length) return this.$setError((this.options.validate.maxMsg || Constants.J104.Input.Password.max).substitute({max: rules.max, min: rules.min}));
			if(min > 0 && min > length) return this.$setError((this.options.validate.minMsg || Constants.J104.Input.Password.min).substitute({max: rules.max, min: rules.min}));

			if(rules.alphabet != 0){
				var count = !rules.alphabet || typeOf(rules.alphabet) != 'number' || rules.alphabet < 0 ? 1 : rules.alphabet;
				if(!value.test(new RegExp('[a-zA-Z]{' + count + ',}'))) return this.$setError((this.options.validate.alphabetMsg || Constants.J104.Input.Password.alphabet).substitute({a: count}));
			}
			if(rules.numeric != 0){
				var count = !rules.numeric || typeOf(rules.numeric) != 'number' || rules.numeric < 0 ? 1 : rules.numeric;
				if(!value.test(new RegExp('[0-9]{' + count + ',}'))) return this.$setError((this.options.validate.numericMsg || Constants.J104.Input.Password.numeric).substitute({n: count}));
			}
			if(rules.special){
				var regexp = '[';
				for(var i = 0; i < rules.special.char.length; i++) regexp += '\\' + rules.special.char.charAt(i);
				regexp += (']{' + rules.special.count + ',}');
				if(!value.test(new RegExp(regexp)))
					return this.$setError((this.options.validate.specialMsg || Constants.J104.Input.Password.special).substitute(rules.special));
			}
			else if(value.test(new RegExp(/\W/)))
				return this.$setError(this.options.validate.denySpecialMsg || Constants.J104.Input.Password.denySpecial);
			return this.$setValidated(value);
		}.protect()

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
	});
})();


/********************************************************************************************************************************
 * J104.Input.Date
 */
Constants.J104.Input.Date = {
	required: '必填欄位',
};
J104.Input.Date = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Input.Date',
		extends: 'J104.Input.Text',
		version: '2.0.0',
		lastModify: '2017/02/03'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Input.Text,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104Text',
			additionClass: 'date',
			placeholder: 'YYYY/MM/DD',
			valueType: 'date', 			// 'date'(default), 'timestamp', or 'string'
			validate: {
				pattern: 'date'
			},
			flatOptions: {
				allowInput: true,
				dateFormat: 'Y/m/d'
			}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			if(!options.initValue) options.initValue = undefined;
			this.parent(ele, options);
			this._FORMAT = '%Y/%m/%d';
			var D = this.$D(), P = this.$P(), F = this.$F();
			D.indicator.destroy();
			delete D.indicator;

			D.wrapper.addClass('fa');
			D.field.removeEvents('blur').addEvent('blur', function(evt){
				this.blur.delay(50, this);
			});
			var flat = P.flatpickr = new Flatpickr(D.field, Object.merge(this.options.flatOptions, {
				onOpen: function(){
					if(!F.editable){
						flat.close();
						return false;
					}
					F.flatOpen = true;
				},
				onClose: function(){
					if(!F.editable || !F.flatOpen) return false;
					F.flatOpen = false;
					(function(){
						if(!F.flatSetter) this.blur();
						F.flatSetter = false;
					}).delay(10, this)
				}.bind(this),
				onChange: function(selectedDates, dateStr, instance){
					if(!dateStr){
						P.value = undefined;
						P.flatpickr.close();
					}
					else if(this.setValue(dateStr)) this.fireEvent('blur');
					F.flatSetter = true;
				}.bind(this),
				onValueUpdate: function(selectedDates, dateStr, instance){
					var d = typeOf(selectedDates) == 'array' ? selectedDates[0] : selectedDates;
					if(!Date.isValid(d))
						P.flatpickr.setDate(new Date(), false);
				}.bind(this)
			}));
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$validate: function(value){		// return boolean
			if(!this.parent(value)) return false;

			if(!value || value === '' || value === undefined){
				this.$setValidated(undefined);
				return true;
			}
			value = new Date().parse(value);
			return this.$setValidated(value);
		}.protect(),

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		destroy: function(){
			var P = this.$P();
			if(P.flatpickr) P.flatpickr.destroy();
			return this.parent();
		},

		validate: function(){
			if(!this.isEnable() || !this.isEditable()) return true;
			var v = this.$D().field.get('value').trim();
			var result = this.$validate(v.length == 0 ? undefined : v);
			if(result) this.$P().flatpickr.setDate(this.$P().value, false);
			return result;
		},

		blur: function(){
			var F = this.$F();
			if(!this.parent()) return false;
			var P = this.$P();
			if(typeOf(P.value) === 'string'){
				var d = new Date.parse(P.value);
				this.$updateValue(d);
				P.flatpickr.setDate(d, false);
			}
			if(F.flatOpen) P.flatpickr.close();
			return this;
		},

		getDateString: function(format){
			format = format || this._FORMAT;
			var P = this.$P();
			return P.value ? P.value.format(format) : '';
		},

		getTimestamp: function(){
			var v = this.$P().value;
			return typeOf(v) === 'date' ? v.getTime() : undefined;
		},

		getValue: function(){
			return this.options.valueType === 'timestamp' ? this.getTimestamp() :
				this.options.valueType === 'string' ? this.getDateString() : this.parent();
		},

		setValue: function(value){
			if(!this.isEnable()) return false;
			if(typeOf(value) === 'number') value = new Date(value);
			else if(typeOf(value) === 'string' && value.trim().length > 0) value = new Date().parse(value);
			if(typeOf(value) != 'date') return false;

			this.$D().field.set('value', new Date(value).format(this._FORMAT));
			var P = this.$P();
			P.value = value;
			P.flatpickr.setDate(value, false);
			return this;
		}
	});
})();


/********************************************************************************************************************************
 * J104.Input.DateTime
 */
Constants.J104.Input.DateTime = {
	required: '必填欄位',
};
J104.Input.DateTime = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Input.DateTime',
		extends: 'J104.Input.Date',
		version: '2.0.0',
		lastModify: '2017/02/18'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Input.Date,
		profile: function(){ return Object.clone(__profile); },
		options: {
			placeholder: 'YYYY/MM/DD hh:mm',
			validate: {
				pattern: 'datetime'
			},
			flatOptions: {
				allowInput: true,
				dateFormat: 'Y/m/d H:i',
				enableTime: true,
				time_24hr: true,
                minuteIncrement: 1
			}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			this.parent(ele, options);
			this._FORMAT = '%Y/%m/%d %H:%M';
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
	});
})();


/********************************************************************************************************************************
 * J104.Input.Select
 */
Constants.J104.Input.Select = {
	required: '請選擇一個選項',
	loadItems: '選項資料載入中...',
	loadFailure: '選項資料載入失敗'
};
J104.Input.Select = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Input.Select',
		extends: 'J104.Input',
		version: '2.0.4',
		lastModify: '2016/09/26'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _select = function(_this, D, P, F, dom, fireEvent){
		var options = _this.options.option;
		var data = dom.setSelect(true).data();
		P.selectValue = options.buildValue(data);
		D.field.set('text', options.buildText(data)).removeClass('placeholder');
		_this.blur();
		if(!F.init && fireEvent) _this.fireEvent('select', [data, dom, dom.idx()]);
		return _this;
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Input,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104Select',
			placeholder: 'select...',
			rawData: [],		// string(url) or object({url:'...', params:{...}}) or array(ex: ['a', 'b', ...] or [{label:'a', value:1}, ...])
			reloadOnOpen: false,
			//j104Options: null,
			option: {
				fitStickWidth: true,
				buildText: function(data){ return (data.text || data.label || data.name) ? (data.text || data.label || data.name) : data; },
				buildCSS: function(data){ return data.css ? data.css : ''; },
				buildValue: function(data){ return (data.value || data.id) ? (data.value || data.id) : data; },
				isVisible: function(dom, data){ return true; },
			},
			validate: {
				required: true
				//requiredMsg: ''
			},
			allowDeselect: false,
			selectIndex: -1,			// selectIndex > initValue
			//onSelect: function(data, dom, idx){},
			//onDeselect: function(data, dom, idx){}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			this.parent(ele, options);

			var P = this.$P(), F = this.$F();
			F.init = true;
			if(this.options.initValue != undefined && !this.setValue(this.options.initValue))
				P.initValue = P.value = undefined;
			if(typeOf(this.options.selectIndex) === 'number' && this.options.selectIndex >= 0){
				if(P.menu.selectByIndex(this.options.selectIndex))
					P.initValue = P.value = P.selectValue; //this.getValue();
			}
			delete F.init;
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$build: function(){
			var D = this.$D(), P = this.$P(), F = this.$F(), options = this.options, _this = this;
			if(D.src.getProperty('placeholder')) options.placeholder = D.src.getProperty('placeholder');
			// retrieve options ...
			var rawData = [];
			if(options.j104Options && Constants.J104.Options && Constants.J104.Options[options.j104Options])
				Constants.J104.Options[options.j104Options].each(function(opt){
					rawData.push({
						text: opt.name,
						value: opt.value
					});
				});
			else{
				var opts = D.src.getChildren('option');
				if(opts && opts.length > 0){
					opts.each(function(opt){
						var model = {
							text: opt.get('text'),
							value: opt.getProperty('value'),
							css: opt.getProperty('class')
						};
						rawData.push(model);
						if(opt.getAttribute('selected') != null) options.initValue = P.initValue = model.value;
					});
				}
			}
			// build: Field
			D.field = new Element('div.field.form-control.fa.placeholder', {id: D.src.id}).set('text', options.placeholder).inject(D.wrapper);
			if(options.styles){
				D.wrapper.removeProperty('style');
				D.field.setStyles(options.styles);
			}
			D.wrapper.addEvent('click', function(evt){ if(_this.isEnable()) _this.focus(); });
			D.src.destroy();
			P.validateRules = Object.clone(options.validate);

			var keyDownEvent = function(evt){
				if(evt.key === 'tab') evt.shift ? _this.shiftTabEvent(evt) : _this.tabEvent(evt);
			};
			P.menu = new J104.Box.Menu({
				theme: 'select-menu',
				fx: 'fade',
				stick: {
					target: D.field,
					direction: 'ver',
					align: '-'
				},
				onBeforeOpen: function(){
					if(!this.isEnable()) return false;
					if(options.option.fitStickWidth) P.menu.setWidth(D.field.getSize().x, 'min');
					document.addEvent('keydown', keyDownEvent);
				}.bind(this),
				onClose: function(){
					document.removeEvent('keydown', keyDownEvent);
					this.blur();
				}.bind(this),
				closeOn: {
					click: { exclude: D.wrapper }
				},
				rawData: rawData.length > 0 ? rawData : options.rawData,
				items: {
					buildText: options.option.buildText,
					buildCSS: options.option.buildCSS,
					isVisible: options.option.isVisible,
					onSelect: function(dom, data){
						if(!this.isEditable()) return;
						if(dom.isSelect() && options.allowDeselect){
							P.menu.clearSelected().close();
							this.clear().fireEvent('deselect', [data, dom, dom.idx()]);
							return false;
						}
						P.menu.clearSelected();
						_select(_this, D, P, F, dom, true);
					}.bind(this)
				},
				onLoad: function(){
					D.field.set('text', Constants.J104.Input.Select.loadItems).addClass('loading');
					_this.disable();
				},
				onLoadComplete: function(){
					D.field.removeClass('loading').set('text', options.placeholder);
					if(typeOf(options.selectIndex) === 'number' && options.selectIndex >= 0){
						if(P.menu.selectByIndex(options.selectIndex))
							P.initValue = P.value = P.selectValue;
					}
				},
				onLoadSuccess: function(code, message, data){
					_this.enable();
					P.menu.selectByIndex(options.selectIndex);
					_this.fireEvent('loadSuccess');
				},
				onLoadError: function(responseText, error){
					D.field.addClass('failure').set('text', '');
					var message = Constants.J104.Input.Select.loadFailure;
					if(P.tip) P.tip.addAttach(D.wrapper.store('J104.Box.Tip:message', message));
					else D.wrapper.tip(message);
				}.bind(this)
			});
		}.protect(),

		$validate: function(value){		// return boolean
			var P = this.$P();
			var rules = P.validateRules;
			if(!rules) return this.$setValidated(value);

			if(rules.required && (value === undefined || value === null))
				return this.$setError(this.options.validate.requiredMsg || Constants.J104.Input.Select.required);

			return this.$setValidated(value);
		}.protect(),

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		destroy: function(){
			var P = this.$P();
			if(P && P.menu) P.menu.destroy();
			return this.parent();
		},

		validate: function(){
			if(this.parent()) return true;
			return this.$validate(this.$P().selectValue);
		},
		reset: function(){
			if(!this.parent()) return false;
			var P = this.$P();
			if(P.initValue === undefined || P.initValue === null) this.clear();
			else this.setValue(P.initValue);
			return this;
		},
		clear: function(){
			if(!this.parent()) return false;
			var D = this.$D(), P = this.$P();
			if(D.field) D.field.set('text', this.options.placeholder).addClass('placeholder').removeClass('focus');
			P.menu.clearSelected().close();
			P.selectValue = undefined;
			return this;
		},

		setValue: function(value){			// DO NOT fire 'select' event
			if(value === undefined || value === null) return false;

			var D = this.$D(), P = this.$P(), F = this.$F();
			var find = P.menu.findItemByData(value, this.options.option.buildValue);
			if(!find) return false;
			if(!this.parent(value)) return false;
			P.menu.clearSelected();
			return _select(this, D, P, F, find, false);
		},
		selectByValue: function(value){		// fire 'select' event
			if(value === undefined || value === null) return false;

			var D = this.$D(), P = this.$P(), F = this.$F();
			var find = P.menu.findItemByData(value, this.options.option.buildValue);
			if(!find) return false;
			if(!this.isEnable() || !this.$validate(value)) return false;
			this.$P().value = value;
			P.menu.clearSelected();
			return _select(this, D, P, F, find, true);
		},
		selectByIndex: function(idx){
			var D = this.$D(), P = this.$P(), F = this.$F();
			var find = P.menu.getItems()[idx];
			if(!find) return false;
			P.value = this.options.option.buildValue(find.data());
			P.menu.clearSelected();
			return _select(this, D, P, F, find, true);
		},

		enable: function(){
			var P = this.$P(), D = this.$D();
			if(P.menu && P.menu.isLoading()) return false;
			this.parent();
			D.field.enable();
			return this;
		},
		disable: function(){
			var D = this.$D(), P = this.$P();
			if(P.menu && P.menu.isLoading()) return false;
			this.parent();
			D.wrapper.removeClass('fa has-error');
			D.field.untip().disable().removeClass('focus');
			if(P.menu && P.menu.isOpen()) P.menu.close();
			return this;
		},

		editable: function(){
			if(!this.parent()) return false;
			var D = this.$D();
			D.field.removeClass('readOnly');
			D.wrapper.removeClass('readOnly');
			return this;
		},
		readOnly: function(){
			if(!this.parent()) return false;
			var D = this.$D(), P = this.$P();
			D.field.addClass('readOnly');
			D.wrapper.addClass('readOnly');
			if(P.menu && P.menu.isOpen()) P.menu.close();
			return this;
		},

		focus: function(){
			if(!this.parent()) return false;
			var D = this.$D(), P = this.$P();
			D.field.addClass('focus');
			if(P.menu){
				if(this.options.reloadOnOpen) this.reloadRowData();
				P.menu.open();
			}
			return this;
		},
		blur: function(){
			if(!this.parent()) return false;
			var D = this.$D(), P = this.$P();
			D.field.removeClass('focus');
			if(P.menu) P.menu.close();
			return this;
		},

		loadOption: function(payload){
			if(!this.isEnable()) return false;
			this.$P().menu.loadContent(payload);
			return this;
		},
		setData: function(rawData){
			if(!this.isEnable()) return false;
			return this.$P().menu.setData(rawData) ? this : false;
		},
		reloadRowData: function(){
			var P = this.$P();
			if(P.menu) P.menu.reloadContent();
			return this;
		}
	});
})();


/********************************************************************************************************************************
 * J104.Input.Picker
 */
Constants.J104.Input.Picker = {
	required: '必填欄位',
	max: '最多可選 {max} 項',
	min: '最少需選 {min} 項'
};
J104.Input.Picker = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Input.Picker',
		extends: 'J104.Input.Select',
		version: '2.0.2',
		lastModify: '2016/11/30'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _refreshIndicator = function(_this, D, P){
		if(_this.options.indicator){
			var rules = P.validateRules;
			if(rules.max === 1) return;
			var count = P.selectValue ? P.selectValue.length : 0;
			var id = D.indicator.show();
			id.set('text', rules.max === undefined ? count : _this.options.indicator.substitute({
				count: count,
				max: rules.max
			}));
			if(count > rules.max || count < rules.min) id.addClass('fa has-error');
			else id.removeClass('fa has-error');
		}
	};
	var _buildTag = function(_this, D, P, dom){
		var options = _this.options.option;
		var tag = new Element('span.tag').set('text', options.buildText(dom.data()));
		new Element('i.delete.fa').inject(tag).addEvent('click', function(evt){
			evt.stop();
			if(!_this.isEnable() || !_this.isEditable()) return;
			tag.destroy();
			_unpick(_this, D, P, dom);
		});
		if(dom) dom.store('peerTag', tag);
		var tagOptions = _this.options.tag;
		if(typeOf(tagOptions.isBehavior) === 'function' && tagOptions.isBehavior(tag, dom.data()) === true){
			tag.addClass('behavior');
			tag.addEvent('click', function(evt){
				evt.stop();
				if(typeOf(tagOptions.onClick) === 'function')
					tagOptions.onClick(tag, dom.data());
			});
		}
		return tag;
	};
	var _buildCustomizedTag = function(_this, D, P, text){
		var tag = new Element('span.tag').set('text', text);
		new Element('i.delete.fa').inject(tag).addEvent('click', function(evt){
			evt.stop();
			if(!_this.isEnable() || !_this.isEditable()) return;
			tag.destroy();
			P.selectValue.erase(text);
			if(P.menu.isOpen()){
				if(_this.options.typing) D.typingField.focus();
				else if(P.selectValue.length === 0) D.field.addClass('placeholder').set('text', _this.options.placeholder);
			}
			else{
				if(P.selectValue.length === 0) D.field.addClass('placeholder').set('text', _this.options.placeholder);
				_this.validate();
			}
		});
		return tag;
	};
	var _pick = function(_this, D, P, dom){
		if(dom.isSelect()) return _this;
		if(D.field.hasClass('placeholder')) D.field.removeClass('placeholder').set('text', '');
		var options = _this.options.option;
		dom.setSelect(true);
		if(!P.selectValue) P.selectValue = [];
		P.selectValue.include(options.buildValue(dom.data()));
		_buildTag(_this, D, P, dom).inject(D.field);
		_refreshIndicator(_this, D, P);
		P.menu.refresh();
		if(P.menu.getUnselect().length === 0) P.menu.close();
		else P.menu.position();
		if(_this.isFocus() && _this.options.typing){
			D.typingField.set('value', '').setStyle('width', 20).inject(D.field, 'bottom').focus();
			_filterStaticData(_this, P, '');
			P.menu.position();
		}
		return _this;
	};
	var _pickCustomized = function(_this, D, P){
		var v = D.typingField.get('value').trim();
		D.typingField.set('value', '');
		if(v.length > 0){
			if(!P.selectValue) P.selectValue = [];
			var length = P.selectValue.length;
			P.selectValue.include(v);
			if(P.selectValue.length > length){
				_buildCustomizedTag(_this, D, P, v).inject(D.typingField, 'before');
				_refreshIndicator(_this, D, P);
			}
		}
	};
	var _unpick = function(_this, D, P, dom){
		var options = _this.options.option;
		dom.setSelect(false);
		P.selectValue.erase(options.buildValue(dom.data()));
		_refreshIndicator(_this, D, P);
		P.menu.refresh();
		if(P.menu.isOpen()){
			P.menu.position();
			if(_this.options.typing) D.typingField.focus();
			else if(P.selectValue.length === 0) D.field.addClass('placeholder').set('text', _this.options.placeholder);
		}
		else{
			if(P.selectValue.length === 0) D.field.addClass('placeholder').set('text', _this.options.placeholder);
			_this.validate();
		}
		return _this;
	};
	var _filterStaticData = function(_this, P, kw){
		var options = _this.options.option;
		var pattern = new RegExp(kw.escapeRegExp(), "i");
		var matchings = 0;
		P.menu.getItems().each(function(dom){
			if(kw.length === 0 || pattern.test(options.buildText(dom.data()).replace(/(<([^>]+)>)/ig, ''))){
				dom.setMatch(true);
				matchings++;
				P.menu.DOM('wrapper').show();
			}
			else dom.setMatch(false)
		});
		if(matchings > 0){
			var m = P.menu.refresh();
			if(m) m.position();
		}
		else{
			var m = P.menu.clearSelected();
			if(!_this.options.typing.unmatch) m.DOM('wrapper').hide();
		}
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Input.Select,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104Picker',
			placeholder: 'pick something ...',
			typing: false,              // false or object ....
			/*{
				delay: 100,
				dynamic: false,         // boolean, if true, query data from server by ajax call ('rawData' must be {url:'...'})
				unmatch: '無符合項目',
				forceOption: true				// true: only allow option value
			},*/
			indicator: false, //'{count} / {max}', 	// false or String(variable:{count},{max})
			option: {
				fitStickWidth: true,
				//buildDom: function(data){},
				//buildText: function(data){ return (data.text || data.label || data.name) ? (data.text || data.label || data.name) : data; },
				//buildCSS: function(data){ return data.css ? data.css : ''; },
				//buildValue: function(data){ return (data.value || data.id) ? (data.value || data.id) : data; },
				//onSelect: function(dom, data){},
				isVisible: function(dom, data){ return !dom.isSelect() && dom.isMatch(); }
			},
			tag: {
				//isBehavior: function(dom, data){ return false; },
				//onClick: function(tag, data){}
			},
			//onUpdate: function(_this, value, preValue){}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			Object.merge(options, {
				initValue: [],
				selectIndex: undefined
			});
			this.parent(ele, options);
			if(this.options.typing){
				this.options.typing = Object.merge({
					delay: 100,
					unmatch: '無符合項目',
					forceOption: true
				}, this.options.typing)
			}
			this.$P().protected = {
				pick: _pick,
				unpick: _unpick,
				refreshIndicator: _refreshIndicator,
				filterStaticData: _filterStaticData
			};
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$build: function(){
			var D = this.$D(), P = this.$P(), options = this.options, _this = this;
			if(D.src.getProperty('placeholder')) options.placeholder = D.src.getProperty('placeholder');

			// build: Field
			D.field = new Element('div.field.form-control.fa.placeholder', {id: D.src.id}).set('text', options.placeholder).inject(D.wrapper);
			D.wrapper.addEvent('click', function(evt){
				evt.stop();
				if(!_this.isEnable()) return;
				if(P.menu.getUnselect().length === 0) return;
				_this.focus();
				if(options.typing) D.typingField.focus();
			});
			D.indicator = new Element('div.indicator').inject(D.wrapper).hide();
			D.src.destroy();
			P.validateRules = Object.clone(options.validate);

			var keyDownEvent = function(evt){
				if(evt.key === 'tab') evt.shift ? _this.shiftTabEvent(evt) : _this.tabEvent(evt);
			};
			P.menu = new J104.Box.Menu({
				theme: 'picker-menu',
				fx: 'fade',
				stick: {
					target: D.field,
					direction: 'ver',
					align: '-'
				},
				onBeforeOpen: function(){
					if(!this.isEnable()) return false;
					if(options.option.fitStickWidth) P.menu.setWidth(D.field.getSize().x, 'min');
					document.addEvent('keydown', keyDownEvent);
				}.bind(this),
				onClose: function(){
					document.removeEvent('keydown', keyDownEvent);
					this.blur();
				}.bind(this),
				closeOn: {
					click: { exclude: D.wrapper }
				},
				rawData: options.rawData,
				items: {
					buildDom: options.option.buildDom,
					buildText: options.option.buildText,
					buildCSS: options.option.buildCSS,
					isVisible: options.option.isVisible,
					onSelect: function(dom, data){
						if(!this.isEnable() || !this.isEditable()) return false;
						var rules = P.validateRules;
						if(rules && rules.max === 1) this.clear();
						_pick(this, D, P, dom);
						if(typeOf(options.option.onSelect) === 'function') options.option.onSelect(dom, data);
						if(rules && rules.max === 1) this.blur();
					}.bind(this)
				},
				emptyContent: options.typing.unmatch || '',
				onLoad: function(){
					D.field.set('text', Constants.J104.Input.Select.loadItems).addClass('loading');
					_this.disable();
				},
				onLoadComplete: function(){
					D.field.removeClass('loading').set('text', options.placeholder);
				},
				onLoadSuccess: function(code, message, data){
					_this.enable();
					P.menu.selectByIndex(options.selectIndex);
					_this.fireEvent('loadSuccess', [_this]);
				},
				onLoadError: function(responseText, error){
					D.field.addClass('failure').set('text', '');
					var message = Constants.J104.Input.Select.loadFailure;
					if(P.tip) P.tip.addAttach(D.wrapper.store('J104.Box.Tip:message', message));
					else D.wrapper.tip(message);
				}.bind(this)
			});

			if(options.typing){
				var f = D.typingField = new Element('input.typing', {type:'text'}).inject(D.field).hide();
				var autoEvent = function(evt){
					f.style.width = f.get('value').length * 11 + 20;
					P.menu.position();
				};
				P.typing = { preKw: '' };
				f.addEvents({
					change: autoEvent,
					keyup: function(evt){
						if(options.typing && !options.typing.forceOption && evt.key === 'enter')
							return _pickCustomized(_this, D, P);

						f.style.width = f.get('value').length * 8 + 20;
						P.menu.position();
						var now = new Date().getTime();
						var kw = D.typingField.get('value').trim();
						if(kw === '＿' || P.typing.preKw === kw) return;
						clearTimeout(P.typing.timer);
						P.typing.timer = (function(){
							if(P.typing.preKeyinTimestamp && (now - P.typing.preKeyinTimestamp <= options.typing.delay)) return;
							P.typing.preKeyinTimestamp = now;
							if(options.typing.dynamic){
								// TODO: implement later
								/*P.menu.loadContent(Object.merge(options.rawData, {data: {keyword:kw}}));*/
							}
							else{
								_filterStaticData(_this, P, kw);
								P.typing.preKw = kw;
							}
						}).delay(options.typing.delay);
					},
					keydown: autoEvent,
					cut: autoEvent,
					paste: autoEvent,
					drop: autoEvent
				});
			}
		}.protect(),

		$validate: function(value){
			if(typeOf(value) === 'array') value = Array.clone(value);
			var rules = this.$P().validateRules;
			if(!rules) return this.$setValidated(value);

			var isEmpty = (value === null || value === undefined || value.length === 0);
			if(rules.required && isEmpty)
				return this.$setError(this.options.validate.requiredMsg || Constants.J104.Input.Picker.required);
			if(!isEmpty && rules.max < value.length) return this.$setError((this.options.validate.maxMsg || Constants.J104.Input.Picker.max).substitute({max: rules.max, min: rules.min}));
			if(!isEmpty && rules.min > value.length) return this.$setError((this.options.validate.minMsg || Constants.J104.Input.Picker.min).substitute({max: rules.max, min: rules.min}));

			return this.$setValidated(value);
		}.protect(),

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		pick: function(value){
			var P = this.$P();
			if(!P.menu.isOpen()) return false;
			var dom = P.menu.findItemByData(value, this.options.option.buildValue);
			if(!dom) return false;
			return _pick(this, this.$D(), P, dom);
		},
		unpick: function(value){
			var P = this.$P();
			if(!P.menu.isOpen()) return false;
			var dom = P.menu.findItemByData(value, this.options.option.buildValue);
			if(!dom) return false;
			var tag = dom.retrieve('peerTag');
			if(tag) tag.destroy();
			return _unpick(this, this.$D(), P, dom);
		},

		clear: function(){
			if(!this.parent()) return false;
			var P = this.$P(), D = this.$D();
			P.protected.refreshIndicator(this, D, P);
			return this;
		},

		setValue: function(value){
			if(value === undefined || value === null) return false;

			if(typeOf(value) != 'array') value = [value];
			var P = this.$P(), D = this.$D();
			var doms = [];
			value = value.filter(function(v){
				var dom = P.menu.findItemByData(v, this.options.option.buildValue);
				if(dom){
					doms.push(dom);
					return true;
				}
				else return false;
			}.bind(this));
			if(doms.length === 0 || value.length === 0) return false;
			if(!this.isEnable()) return false;

			this.clear();
			doms.each(function(dom){_pick(this, D, P, dom);}.bind(this));
			//P.value = value;
			this.$updateValue(value);

			return this;
		},

		focus: function(){
			if(!this.parent()) return false;
			if(this.options.typing){
				var D = this.$D(), P = this.$P();
				if((!P.value || P.value.length === 0) && (!P.selectValue || P.selectValue.length === 0))
					D.field.set('text', '').removeClass('placeholder');
				D.typingField.inject(D.field).show().set('value', '').focus();
				P.protected.filterStaticData(this, P, '');
				P.menu.position();
			}
			return this;
		},
		blur: function(){
			var D = this.$D(), P = this.$P();
			if(this.options.typing && !this.options.typing.forceOption) _pickCustomized(this, D, P);
			if(!this.parent()) return false;
			if(this.options.typing){
				if((!P.value || P.value.length === 0) && (!P.selectValue || P.selectValue.length === 0))
					D.field.set('text', this.options.placeholder).addClass('placeholder');
				D.typingField.hide();
			}
			return this;
		}
	});
})();
Element.implement({
	makePicker: function(options){
		return new J104.Input.Picker(this, options);
	}
});


/********************************************************************************************************************************
 * J104.Input.TreePicker
 */
Constants.J104.Input.TreePicker = {
	required: '必填欄位',
	max: '最多可選 {max} 項',
	min: '最少需選 {min} 項'
};
J104.Input.TreePicker = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Input.TreePicker',
		extends: 'J104.Input.Picker',
		version: '2.0.0',
		lastModify: '2016/11/04'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _buildSubMenu = function(_this, D, P, level){
		var options = _this.options;
		var m = new J104.Box.Menu({
			theme: 'treePicker-menu',
			fx: 'fade',
			boundary: true,
			level: level * 10,
			pointer: [0, 0],
			stick: {
				direction: 'right',
				align: 0,
				offset: {x: 0, y: 0}
			},
			closeOn: {
				click: false
			},
			items: {
				buildText: options.option.buildText,
				buildCSS: function(data){
					return 'fa' + (data.children ? ' hasChildren' : '') +
						(options.checkMode === 'all' ? ' checkable' : (data.children ? '' : ' checkable'));
				},
				isVisible: options.option.isVisible,
				onEnter: function(dom, data){
					var children = data.children;
					if(!children) return;
					var lv = level + 1;
					P.subMenus.each(function(m, idx){ if(lv - 1 < idx) m.close(); });
					var subMenu = P.subMenus[lv - 1];
					if(!subMenu){
						subMenu = _buildSubMenu(_this, D, P, lv);
						P.subMenus.push(subMenu);
					}
					subMenu.getStickTarget().removeClass('extend');
					subMenu.setStickTarget(dom.addClass('extend')).setData(children)[subMenu.isOpen() ? 'position' : 'open']();
					_refreshSelectStatus(_this, P, subMenu);
				},
				onSelect: function(dom, data){
					if(!_this.isEnable() || !_this.isEditable()) return false;
					if(options.checkMode === 'leaf' && data.children) return false;
					if(dom.isSelect()) _unpick(_this, D, P, dom, data, dom.retrieve('peerTag'));
					else{
						var rules = P.validateRules;
						if(rules && rules.max === 1){
							P.value = undefined;
							P.menu.clearSelected().close();
							P.subMenus.each(function(m){m.clearSelected().close();});
							P.selectValue = undefined;
							D.field.getChildren().each(function(c){
								if(c.hasClass('tag')) c.destroy();
							});
						}
						_pick(_this, D, P, dom);
						if(rules && rules.max === 1) _this.blur();
					}
				}.bind(this)
			}
		});
		return m;
	};
	var _refreshSelectStatus = function(_this, P, menu){
		var options = _this.options.option;
		menu.getItems().each(function(dom){
			var data = dom.data();
			if(P.selectValue && P.selectValue.contains(options.buildValue(data))){
				dom.setSelect(true);
				var text = options.buildText(data);
				P.selectTags.each(function(tag){
					if(tag.get('text') == text){
						dom.store('peerTag', tag);
						tag.store('peerDom', dom);
					}
				});
			}
		});
	};
	var _buildTag = function(_this, D, P, dom, data){
		var options = _this.options.option;
		var tag = new Element('span.tag').set('text', options.buildText(data || dom.data())).store('peerDom', dom);
		new Element('i.delete.fa').inject(tag).addEvent('click', function(evt){
			evt.stop();
			if(!_this.isEnable() || !_this.isEditable()) return;
			_unpick(_this, D, P, tag.retrieve('peerDom'), data, tag);
		});
		if(dom) dom.store('peerTag', tag);
		return tag;
	};
	var _pick = function(_this, D, P, dom, data){
		if(dom && dom.isSelect()) return _this;

		if(D.field.hasClass('placeholder')) D.field.removeClass('placeholder').set('text', '');
		var options = _this.options.option;
		if(dom) dom.setSelect(true);
		if(!P.selectValue) P.selectValue = [];
		P.selectValue.include(options.buildValue(data || dom.data()));
		if(!P.selectTags) P.selectTags = [];

		var tag = _buildTag(_this, D, P, dom, data);
		if(D.typingField){
			D.typingField.inject(D.field);
			tag.inject(D.typingField, 'before');
			D.typingField.set('value', '');
		}
		else tag.inject(D.field);
		P.selectTags.push(tag);
		P.protected.refreshIndicator(_this, D, P);
		P.menu.position();
		P.subMenus.each(function(m){m.position();});
		return _this;
	};
	var _unpick = function(_this, D, P, dom, data, tag){
		tag.destroy();
		var options = _this.options.option;
		if(dom) dom.setSelect(false);
		P.selectValue.erase(options.buildValue(data || dom.data()));
		P.protected.refreshIndicator(_this, D, P);
		if(P.menu.isOpen()){
			P.menu.position();
			P.subMenus.each(function(m){m.position();});
			if(_this.options.typing) D.typingField.focus();
			else if(P.selectValue.length === 0) D.field.addClass('placeholder').set('text', _this.options.placeholder);
		}
		else{
			if(P.selectValue.length === 0) D.field.addClass('placeholder').set('text', _this.options.placeholder);
			_this.validate();
		}
		return _this;
	};
	var _filterStaticData = function(_this, P, kw){
		P.subMenus.each(function(m){m.close();});
		kw = kw.trim();
		if(kw.length === 0){
			P.menu.setData(_this.options.rawData).open();
			return;
		}
		var match = [];
		_seekLeaf([], _this.options.rawData).each(function(d){
			var pattern = new RegExp(kw.escapeRegExp(), "i");
			if(pattern.test(_this.options.option.buildText(d).replace(/(<([^>]+)>)/ig, '')))
				match.push(d);
		});
		if(match.length > 0) P.menu.setData(match).open();
		else P.menu.close();
	};
	var _seekLeaf = function(leaf, raw){
		if(typeOf(raw) === 'array')
			raw.each(function(d){
				_seekLeaf(leaf, d);
			});
		else if(raw.children) _seekLeaf(leaf, raw.children)
		else leaf.push(raw);
		return leaf;
	}

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Input.Picker,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104Picker',
			checkMode: 'leaf',	// 'all' or 'leaf'(default)
			option: {
				fitStickWidth: false,
				//buildText: function(data){ return (data.text || data.label || data.name) ? (data.text || data.label || data.name) : data; },
				buildCSS: function(data){ return 'fa ' + (data.children ? 'hasChildren' : 'checkable'); },
				//buildValue: function(data){ return (data.value || data.id) ? (data.value || data.id) : data; },
				isVisible: function(dom, data){ return true; }
			},
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			this.parent(ele, options);
			var P = this.$P(), D = this.$D();
			P.events = {};
			P.events.mouseUp = function(evt){
				var t = evt.target;
				if(D.wrapper.contains(t)) return;
				if(P.menu.DOM('wrapper').contains(t)) return;
				if(P.subMenus.some(function(m){
					return m.DOM('wrapper').contains(t);
				})) return;
				this.blur();
			}.bind(this)
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$build: function(){
			var D = this.$D(), P = this.$P(), options = this.options, _this = this;
			if(D.src.getProperty('placeholder')) options.placeholder = D.src.getProperty('placeholder');

			// build: Field
			D.field = new Element('div.field.form-control.fa.placeholder', {id: D.src.id}).set('text', options.placeholder).inject(D.wrapper);
			D.wrapper.addEvent('click', function(evt){
				evt.stop();
				if(!_this.isEnable()) return;
				if(P.menu.getUnselect().length === 0) return;
				_this.focus();
				if(options.typing) D.typingField.focus();
			});
			D.indicator = new Element('div.indicator').inject(D.wrapper).hide();
			D.src.destroy();
			P.validateRules = Object.clone(options.validate);

			var keyDownEvent = function(evt){
				if(evt.key === 'tab') evt.shift ? _this.shiftTabEvent(evt) : _this.tabEvent(evt);
			};
			P.subMenus = [];
			P.menu = new J104.Box.Menu({
				theme: 'treePicker-menu',
				fx: 'fade',
				stick: {
					target: D.field,
					direction: 'ver',
					align: '-'
				},
				onBeforeOpen: function(){
					if(!this.isEnable()) return false;
					if(options.option.fitStickWidth) P.menu.setWidth(D.field.getSize().x, 'min');
					document.addEvent('keydown', keyDownEvent);
				}.bind(this),
				onClose: function(){
					document.removeEvent('keydown', keyDownEvent);
					P.menu.setData(options.rawData);
					if(D.typingField) return;
					this.blur();
				}.bind(this),
				closeOn: {
					click: { exclude: D.wrapper }
				},
				rawData: options.rawData,
				items: {
					buildText: options.option.buildText,
					buildCSS: function(data){
						return 'fa' + (data.children ? ' hasChildren' : '') +
							(options.checkMode === 'all' ? ' checkable' : (data.children ? '' : ' checkable'));
					},
					isVisible: options.option.isVisible,
					onEnter: function(dom, data){
						var children = data.children;
						if(!children) return;
						var level = 1;
						P.subMenus.each(function(m, idx){ if(level - 1 < idx) m.close(); });
						var subMenu = P.subMenus[level - 1];
						if(!subMenu){
							subMenu = _buildSubMenu(_this, D, P, level);
							P.subMenus.push(subMenu);
						}
						subMenu.getStickTarget().removeClass('extend');
						subMenu.setStickTarget(dom.addClass('extend')).setData(children)[subMenu.isOpen() ? 'position' : 'open']();
						_refreshSelectStatus(_this, P, subMenu);
					},
					onSelect: function(dom, data){
						if(!this.isEnable() || !this.isEditable()) return false;
						if(options.checkMode === 'leaf' && data.children) return false;
						if(dom.isSelect()) _unpick(_this, D, P, dom, data, dom.retrieve('peerTag'));
						else{
							var rules = P.validateRules;
							if(rules && rules.max === 1){
								P.value = undefined;
								P.menu.clearSelected().close();
								P.selectValue = undefined;
								D.field.getChildren().each(function(c){if(c.hasClass('tag')) c.destroy();});
							}
							_pick(this, D, P, dom);
							if(rules && rules.max === 1) _this.blur();
						}
					}.bind(this)
				},
				emptyContent: _this.options.typing.unmatch || '',
				onLoad: function(){
					D.field.set('text', Constants.J104.Input.Select.loadItems).addClass('loading');
					_this.disable();
				},
				onLoadComplete: function(){
					D.field.removeClass('loading').set('text', options.placeholder);
				},
				onLoadSuccess: function(code, message, data){
					_this.enable();
					P.menu.selectByIndex(options.selectIndex);
				},
				onLoadError: function(responseText, error){
					D.field.addClass('failure').set('text', '');
					var message = Constants.J104.Input.Select.loadFailure;
					if(P.tip) P.tip.addAttach(D.wrapper.store('J104.Box.Tip:message', message));
					else D.wrapper.tip(message);
				}.bind(this)
			});

			if(options.typing){
				var f = D.typingField = new Element('input.typing', {type:'text'}).inject(D.field).hide();
				var autoEvent = function(evt){
					f.style.width = f.get('value').length * 8 + 20;
					P.menu.position();
				};
				P.typing = { preKw: '' };
				f.addEvents({
					change: autoEvent,
					keyup: function(evt){
						f.style.width = f.get('value').length * 8 + 20;
						P.menu.position();
						var now = new Date().getTime();
						var kw = D.typingField.get('value').trim();
						if(kw === '＿' || P.typing.preKw === kw) return;
						clearTimeout(P.typing.timer);
						P.typing.timer = (function(){
							if(P.typing.preKeyinTimestamp && (now - P.typing.preKeyinTimestamp <= options.typing.delay)) return;
							P.typing.preKeyinTimestamp = now;
							// TODO: options.typing.dynamic = true
							/*P.menu.loadContent({
							 url: options.rawData,
							 params: Object.merge({}, {kw: kw})
							 });*/
							_filterStaticData(_this, P, kw);
							P.typing.preKw = kw;
						}).delay(options.typing.delay);
					},
					keydown: autoEvent,
					cut: autoEvent,
					paste: autoEvent,
					drop: autoEvent
				});
			}
		}.protect(),

		$findData: function(code){
			// TODO:
			// P.menu.getData().
			return false;
		}.protect(),

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		destroy: function(){
			var P = this.$P();
			if(P && P.subMenus) P.subMenus.each(function(m){m.destroy();});
			return this.parent();
		},

		setValue: function(value){
			if(value === undefined || value === null) return false;
			if(typeOf(value) != 'array') value = [value];
			var P = this.$P(), D = this.$D();
			var data = [];

			value = value.filter(function(v){
				var d = this.$findData(v);
				if(d){
					data.push(d);
					return true;
				}
				else return false;
			}.bind(this));
			if(data.length === 0 || value.length === 0) return false;
			if(!this.isEnable()) return false;

			this.clear();
			data.each(function(d){_pick(this, D, P, null, d);}.bind(this));
			//P.value = value;
			this.$updateValue(value);
			return this;
		},

		focus: function(){
			if(!this.parent()) return false;
			document.addEvent('mouseup', this.$P().events.mouseUp);
		},
		blur: function(){
			if(!this.parent()) return false;
			var P = this.$P();
			document.removeEvent('mouseup', P.events.mouseUp);
			P.subMenus.each(function(m){m.close();});
		}
	});
})();
Element.implement({
	makeTreePicker: function(options){
		return new J104.Input.TreePicker(this, options);
	}
});


/********************************************************************************************************************************
 * J104.Input.CategoryPicker
 */
Constants.J104.Input.CategoryPicker = {
	required: '必填欄位',
	max: '最多可選 {max} 項',
	min: '最少需選 {min} 項'
};
J104.Input.CategoryPicker = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Input.CategoryPicker',
		extends: 'J104.Input.TreePicker',
		version: '2.0.0',
		lastModify: '2016/11/04'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	/*var _type6EnableAll = function(data){
		data.each(function(d){
			if(d.value === 6001000000){		//台灣地區
				d.children.each(function(c){
					c.children.splice(0, 0, {text: c.text + '(全)', value: c.value})
				});
			}
		});
		return data;
	};*/
	var _findChildren = function(children, code, degree){
		var find = false;
		children.each(function(child){
			if(child.value == (code / degree).toInt() * degree)
				find = (code % degree === 0) ? child : child.children ? _findChildren(child.children, code, degree/1000) : false;
		});
		return find;
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Input.TreePicker,
		profile: function(){ return Object.clone(__profile); },
		options: {
			type: 1,     // 1: 產業別, 2: 全職職務分類, 3: 科系別, 4: 證照別, 5: 學校, 6: 地區, 7: 留學國家, 8: 工業區, 9: 高階職務分類, 10: 兼職職務分類, 11: 技能, 12: 工具
			type6_enableAll: false,
			typing: {
			}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			options = options || {};
			var type = (options.type || this.options.type || 1).toInt();
			if(type < 1) type = 1;
			if(!Constants.J104.Categories) throw new Error('[' + this.profile().name + '] need constant: "Constants.J104.Categories".');
			options.rawData = Constants.J104.Categories[type + '000000000'];
			/*if(type == 6 && options.type6_enableAll)
				options.rawData = _type6EnableAll(options.rawData.clone());*/
			if(type === 3 || type === 6) options.checkMode = 'all';
			this.parent(ele, options);
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$findData: function(code){
			code = code * 1;
			var c = Constants.J104.Categories[(code / 1000000000).toInt() + '000000000'];
			if(!c) return false;
			return _findChildren(c, code, 1000000);
		}.protect()

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
	});
})();
Element.implement({
	makeCategoryPicker: function(options){
		return new J104.Input.CategoryPicker(this, options);
	}
});


/********************************************************************************************************************************
 * J104.Input.Radio
 */
Constants.J104.Input.Radio = {
	required: '必填欄位'
};
J104.Input.Radio = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Input.Radio',
		extends: 'J104.Input',
		version: '2.0.1',
		lastModify: '2017/02/26'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _buildRadio = function(_this, name, label, value, inline){
		var D = _this.$D(), P = _this.$P();
		var labelDom = new Element('label' + (inline ? '.inline' : '')).set('html', label).inject(D.wrapper);
		var radio = new Element('input', {type:'radio', name:name}).removeProperty('value')
			.store('J104Radio:value', value)
			.store('J104Radio:label', label).inject(labelDom, 'top')
			.addEvent('change', function(evt){
				D.wrapper.removeClass('fa has-error');
				if(P.tip) P.tip.removeAttach(D.wrapper);
				else D.wrapper.untip();
				P.value = value;
				_this.fireEvent('check', [_this, value, label, radio, D.radios]);
			})
			.addEvent('click', function(evt){
				if(_this.options.allowEmpty && value === P.value){
					P.value = undefined;
					radio.removeProperty('checked');
				}
			});
		D.radios.push(radio);
		new Element('span.radio-peer').inject(radio, 'after');
	};
	var _checkValue = function(_this, value){
		var bingo = _this.$D().radios.filter(function(r){ return r.retrieve('J104Radio:value') == value; });
		return bingo.length === 0 ? false : bingo[0];
	}
	var _select = function(_this, D, P, index){
		var r = D.radios[index];
		if(!r) return false;
		var value = r.retrieve('J104Radio:value');
		P.value = value;
		r.checked = 'checked';
		return r;
	}

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Input,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104Radio',
			inline: true,
			data: {
				label: function(data){ return (data.label || data.name) ? (data.label || data.name) : data; },
				value: function(data){ return (data.value || data.id) ? (data.value || data.id) : data; }
			},
			validate: {
				required: true
			},
			allowEmpty: false,
			selectIndex: 0,
			//onCheck: function(_this, value, label, radio, radios){}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, data, options){
			if(!data) throw new Error('[' + this.profile().name + '] need data to build content.');
			this.data = data;
			this.parent(ele, options);
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$build: function(){
			var P = this.$P(), D = this.$D(), options = this.options;
			D.src.destroy();
			D.radios = [];
			var name = String.uniqueID();
			this.data.each(function(d){
				_buildRadio(this, name, options.data.label(d), options.data.value(d), options.inline);
			}.bind(this));
			this.data = undefined;
			delete this.data;
			if(P.value || P.initValue){
				var r = _checkValue(this, P.initValue);
				if(!r) P.value = P.initValue = undefined;
				else r.checked = 'checked';
			}

			if(this.options.selectIndex){
				var result = _select(this, D, P, this.options.selectIndex);
				if(result) P.value = P.initValue = D.radios[this.options.selectIndex].retrieve('J104Radio:value');
			}
			if(!this.options.allowEmpty && !P.value && !P.initValue){
				_select(this, D, P, 0);
				P.initValue = P.value;
			}
		},

		$validate: function(value){
			if(!this.isEnable()) return true;

			var rules = this.$P().validateRules;
			if(!rules) return this.$setValidated(value);

			if(rules.required && (value === undefined || value === null))
				return this.$setError(this.options.validate.requiredMsg || Constants.J104.Input.Radio.required);

			return this.$setValidated(value);
		}.protect(),

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		select: function(index){
			var D = this.$D(), P = this.$P();
			var r = _select(this, D, P, index);
			this.fireEvent('check', [this, value, r.retrieve('J104Radio:label'), r, D.radios]);
			return this;
		},

		validate: function(){
			if(!this.isEnable()) return true;
			return this.$validate(this.$P().value);
		},
		reset: function(){
			if(!this.parent()) return false;
			var P = this.$P();
			var radio;
			if(P.initValue) radio = _checkValue(this, P.initValue); //this.setValue(P.initValue);
			else if(!this.options.allowEmpty) radio = this.$D().radios[0];
			else this.clear();
			if(radio) radio.checked = 'checked';
			return this;
		},
		clear: function(){
			if(!this.parent()) return false;
			var P = this.$P(), D = this.$D();
			if(this.options.allowEmpty) D.radios.each(function(r){r.removeProperty('checked')});
			else this.select(0);
			return this;
		},

		setValue: function(value){
			if(value === this.getValue()) return value;
			var radio;
			if(!(radio = _checkValue(this, value)) || !this.parent(value)) return false;
			radio.checked = 'checked';
			this.fireEvent('check', [this, value, radio.retrieve('J104Radio:label'), radio, this.$D().radios]);
			return this;
		},

		disable: function(){
			this.parent();
			var D = this.$D();
			D.radios.each(function(r){ r.disable(); });
			return this;
		},
		enable: function(){
			this.parent();
			var D = this.$D();
			if(this.isEditable()) D.radios.each(function(r){ r.enable(); });
			return this;
		},

		editable: function(){
			if(!this.parent()) return false;
			var D = this.$D();
			D.radios.each(function(r){ r.enable(); });
			D.wrapper.removeClass('readOnly');
			return this;
		},
		readOnly: function(){
			if(!this.parent()) return false;
			var D = this.$D();
			D.radios.each(function(r){ r.disable(); });
			D.wrapper.addClass('readOnly');
			return this;
		}
	});
})();


/********************************************************************************************************************************
 * J104.Input.Checkbox
 */
Constants.J104.Input.Checkbox = {
	required: '必填欄位'
};
J104.Input.Checkbox = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Input.Checkbox',
		extends: 'J104.Input',
		version: '2.0.0',
		lastModify: '2016/09/06'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _buildCheckbox = function(_this, name, label, value, inline){
		var D = _this.$D(), P = _this.$P(), F = _this.$F();
		var labelDom = new Element('label' + (inline ? '.inline' : '')).set('html', label).inject(D.wrapper);
		var cbox = new Element('input', {type:'checkbox', name:name}).removeProperty('value')
			.store('J104Checkbox:value', value).inject(labelDom, 'top')
			.addEvent('change', function(evt){
				if(cbox.checked){
					if(D.wrapper.hasClass('has-error')){
						D.wrapper.removeClass('fa has-error');
						if(P.tip) P.tip.removeAttach(D.wrapper);
						else D.wrapper.untip();
					}
					if(F.binary){
						if(P.value === undefined) P.value = 0;
						P.value += value;
					}
					else{
						if(P.value === undefined) P.value = [];
						P.value.include(value);
					}
				}
				else{
					if(F.binary) P.value -= value;
					else P.value.erase(value);
				}
				_this.fireEvent('check', [_this, value, label]);
			});
		D.checkboxs.push(cbox);
		new Element('span.checkbox-peer').inject(cbox, 'after');
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Input,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104Checkbox',
			inline: true,
			binary: false,
			data: {
				label: function(data){ return (data.label || data.name) ? (data.label || data.name) : data; },
				value: function(data){ return (data.value || data.id) ? (data.value || data.id) : data; }
			},
			validate: {
				required: true
			}
			//onCheck: function(_this, value, label){}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, data, options){
			if(!data) throw new Error('[' + this.profile().name + '] need data to build content.');
			this.data = data;
			this.parent(ele, options);
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$build: function(){
			var P = this.$P(), D = this.$D(), F = this.$F(), options = this.options;
			F.binary = this.options.binary;
			if(F.binary) P.value = 0;

			D.src.destroy();
			D.checkboxs = [];
			var name = String.uniqueID();
			this.data.each(function(d){
				var value = options.binary ? options.data.value(d).toInt() : options.data.value(d);
				_buildCheckbox(this, name, options.data.label(d), value, options.inline);
			}.bind(this));
			this.data = undefined;
			delete this.data;

			if((P.value || P.initValue) && !this.setValue(P.initValue))
				P.value = P.initValue = this.$F().binary ? 0 : undefined;
		},

		$validate: function(value){
			if(!this.isEnable()) return true;

			var rules = this.$P().validateRules;
			if(!rules) return this.$setValidated(value);

			if(rules.required && (!value || value.length == 0))
				return this.$setError(this.options.validate.requiredMsg || Constants.J104.Input.Checkbox.required);

			return this.$setValidated(value);
		}.protect(),

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		select: function(index){
			var D = this.$D(), P = this.$P();
			var c = D.checkboxs[index];
			if(!c) return false;
			var value = c.retrieve('J104Checkbox:value');
			this.$updateValue(value);
			c.checked = 'checked';
			this.fireEvent('check', [this, value, c.retrieve('J104Checkbox:label')]);
			return this;
		},

		validate: function(){
			if(!this.isEnable()) return true;
			return this.$validate(this.$P().value);
		},
		reset: function(){
			if(!this.parent()) return false;
			var P = this.$P();
			if(P.initValue) this.setValue(P.initValue);
			else this.clear();
			return this;
		},
		clear: function(){
			if(!this.parent()) return false;
			this.$D().checkboxs.each(function(r){r.removeProperty('checked')});
			return this;
		},

		getValue: function(){
			var v = this.parent();
			return v ? (this.options.binary ? v : Array.clone(v)) : v;
		},
		setValue: function(value){		// do not fire 'update' or 'check' event
			if(!this.isEnable() || value === undefined || value === null) return false;

			var D = this.$D();
			var cboxs = [];
			if(this.$F().binary){
				value = value.toInt();
				if(typeOf(value) != 'number') return false;
				var bin = (value).toString(2).split('').reverse();
				var values = 0;
				bin.each(function(c, idx){
					if(c === '0') return;
					var v = (2).pow(idx);
					D.checkboxs.each(function(cbox){
						if(cbox.retrieve('J104Checkbox:value') === v){
							values += v;
							cboxs.push(cbox);
						}
					});
				});
			}
			else{
				if(typeOf(value) != 'array') value = [].push(value);
				var values = [];
				value.each(function(v){
					D.checkboxs.each(function(cbox){
						if(cbox.retrieve('J104Checkbox:value') == v){
							values.include(v);
							cboxs.push(cbox);
						}
					});
				});
				if(values.length === 0) return false;
			}
			this.$P().value = values;
			D.checkboxs.each(function(cbox){
				if(cboxs.contains(cbox)) cbox.checked = 'checked';
				else cbox.removeProperty('checked');
			});
			return this;
		},

		disable: function(){
			this.parent();
			var D = this.$D();
			D.checkboxs.each(function(c){ c.disable(); });
			return this;
		},
		enable: function(){
			this.parent();
			var D = this.$D();
			if(this.isEditable()) D.checkboxs.each(function(c){ c.enable(); });
			return this;
		},

		editable: function(){
			if(!this.parent()) return false;
			var D = this.$D();
			D.checkboxs.each(function(c){ c.enable(); });
			D.wrapper.removeClass('readOnly');
			return this;
		},
		readOnly: function(){
			if(!this.parent()) return false;
			var D = this.$D();
			D.checkboxs.each(function(c){ c.disable(); });
			D.wrapper.addClass('readOnly');
			return this;
		}
	});
})();


/********************************************************************************************************************************
 * J104.Input.File
 */
Constants.J104.Input.File = {
	required: '至少需要1個檔案',
	size: '檔案太大({actualSize})，必須小於 {size}'
};
J104.Input.File = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Input.File',
		extends: 'J104.Input',
		version: '2.0.0',
		lastModify: '2017/04/10'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _buildUploadingFile = function(_this, D, P, fileData){
		if(P.value.length === 0) D.container.set('text', '');
		var wrapper = new Element('div.fileWrapper.loading').inject(D.container);
		var f = new Element('div.-file').set('text', fileData.name).inject(wrapper);
		if(fileData.size)
			new Element('span.--size').set('text', '(' + (fileData.size + '').toFileSize() + ')').inject(f);
		new Element('span.--delete.fa').inject(f).addEvent('click', function(evt){
			if(P.remover.isRunning()) return;
			P.activeFile = wrapper;
			P.remover.send({
				data: Object.merge({}, P.removeParams, {t: wrapper.retrieve('token')})
			})
		});
		return wrapper;
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Input,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104File',
			validate: {
				required: false,
				max: -1,
				fileSize: 20 * 1024 * 1024
			},
			placeholder: 'upload file',
			uploadToken: function(data){ return data; }
			/*upload: {
				url: '',
				data: ''
			},
			remove: {
				url: '',
				data: ''
			} */
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			this.parent(ele, options);
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$build: function(){
			var P = this.$P(), D = this.$D(), F = this.$F(), options = this.options, _this = this;
			D.src.destroy();
			P.value = [];
			P.valueMeta = {};
			D.files = [];
			var f;
			var uploader = P.uploader = new Request.File(Object.merge({
				onRequest: function(){
					_this.clearError();
					D.files.push(f = _buildUploadingFile(_this, D, P, this.formData.get('f')));
					D.addBtn.hide();
				},
				onComplete: function(){
					f.removeClass('loading');
					D.addBtn.show();
					uploader.reset();
				},
				onSuccess: function(code, message, data){
					var token = options.uploadToken(data);
					f.store('token', token);
					P.value.push(token);
					P.valueMeta[token] = data;
					var max = P.validateRules.max;
					if(max > 0 && P.value.length >= max) D.addBtn.hide();
					else D.addBtn.show();
				},
				onFailure: function(xhr){
					_this.setError('upload fail');
					D.wrapper.error(xhr.status + ': ' + xhr.statusText);
					console.log(xhr);
				}
			}, options.upload));
			P.remover = new Ajax(Object.merge({
				onRequest: function(){
					P.activeFile.getElement('.-file').loading(' ');
				},
				onComplete: function(){
					P.activeFile.getElement('.-file').unloading();
				},
				onSuccess: function(code, message, data){
					var f = P.activeFile;
					var token = f.retrieve('token');
					P.value.erase(token);
					delete (P.valueMeta)[token];
					f.destroy();
					var max = P.validateRules.max;
					if(max > 0 && P.value.length >= max) D.addBtn.hide();
					else D.addBtn.show();
					if(P.value && P.value.length == 0) D.container.set('text', options.placeholder);
				}
			}, options.remove));

			var size = P.validateRules.fileSize || -1;
			D.file = new Element('input[type=file]').addEvent('change', function(evt) {
				var file = evt.target.files[0];
				if(!file) return;
				if(size > 0 && size < file.size){
					D.wrapper.error(Constants.J104.Input.File.size.substitute({
						actualSize: (file.size + '').toFileSize(),
						size: (size + '').toFileSize()
					}));
					return;
				}
				uploader.append('f', file);
				if(P.uploadParams)
					Object.map(P.uploadParams, function(value, key){
						uploader.append(key, value);
					});
				uploader.send();
			}.bind(this));

			D.container = new Element('div.-files').set('text', this.options.placeholder).inject(D.wrapper);
			D.addBtn = new Element('button.-addBtn.btn.fa', {type:'button'}).inject(D.wrapper).addEvent('click', function(evt){
				D.file.click();
			});
		},

		$validate: function(value){
			if(!this.isEnable()) return true;

			var rules = this.$P().validateRules;
			if(!rules) return this.$setValidated(value);

			if(rules.required && (!value || value.length == 0))
				return this.$setError(this.options.validate.requiredMsg || Constants.J104.Input.File.required);

			return this.$setValidated(value);
		}.protect(),

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		validate: function(){
			if(!this.isEnable()) return true;
			return this.$validate(this.$P().value);
		},
		reset: function(){
			return this.clear();
		},
		clear: function(){
			if(!this.parent()) return false;
			this.$P().value = [];
			this.$P().valueMeta = {};
			this.$D().container.destroyChildren().set('text', this.options.placeholder);
			return this;
		},

		setValue: function(files){
			if(!files || !this.clear()) return false;
			if(typeOf(files) != 'array') files = [files];
			files = files.filter(function(f){
				return f.token && f.name;
			});
			if(files.length === 0) return false;

			var P = this.$P(), D = this.$D();
			var max = P.validateRules.max;
			if(max > 0) files = files.slice(0, max);
			var _this = this;
			files.each(function(f){
				_buildUploadingFile(_this, D, P, f).removeClass('loading').store('token', f.token);
				P.value.push(f.token);
				P.valueMeta[f.token] = f;
			});
			if(max > 0 && P.value.length >= max) D.addBtn.hide();
			else D.addBtn.show();
			return this;
		},
		getValueMeta: function(){
			return this.$P().valueMeta;
		},

		disable: function(){
			this.parent();
			var D = this.$D();
			D.addBtn.disable();
			return this;
		},
		enable: function(){
			this.parent();
			var D = this.$D();
			D.addBtn.enable();
			return this;
		},

		setUploadParams: function(params){
			if(typeOf(params) != 'object') return false;
			this.$P().uploadParams = params;
			return this;
		},
		setRemoveParams: function(params){
			if(typeOf(params) != 'object') return false;
			this.$P().removeParams = params;
			return this;
		}
	});
})();
