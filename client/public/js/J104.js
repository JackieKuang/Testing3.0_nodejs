var Constants = {J104: {}};
/********************************************************************************************************************************
 * J104: 104 JavaScript Library, Component and Framework (2.x)
 * Requires:
 * - mootools core/more 1.5.1
 * - mbox0.2.6
 */
var J104 = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104 (104 JavaScript Library, Component and Framework)',
		version: '2.0.0',
		base: 'mootools 1.5.1',
		description: '104 JavaScript Library, Component and Framework'
	};

	window.addEvent('keydown', function(evt){
		if(evt.key == 'backspace' && evt.target === document.body){
			evt.stop();
			if(J104.debug) console.log('press "backspace" on document');
		}
	});

	return {
		debug: true,
		profile: function(){
			return Object.clone(__profile);
		}
	};
}());

/********************************************************************************************************************************
 * J104.Object
 */
J104.Object = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Object',
		version: '2.0.0',
		lastModify: '2016/1/27'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _PROPERTIES = {__proto__: null};
	var _FLAGS = {__proto__: null};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	var obj = {
		Implements: [Options],
		profile: function(){ return Object.clone(__profile); },
		options: {},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(options) {
			this.uid = String.uniqueID();
			_PROPERTIES[this.uid] = {};
			_FLAGS[this.uid] = {};
			this.setOptions(options);
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$P: function(){ return _PROPERTIES[this.uid]; }.protect(),
		$F: function(){ return _FLAGS[this.uid]; }.protect(),

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		destroy: function() {
			_PROPERTIES[this.uid] = {};
			_FLAGS[this.uid] = {};
			return this;
		}
	};

	if(J104.debug){	// for debug, $$ means allow access 'private member' from 'OUTSIDE' in debug mode
		obj.$$P = function(){ return _PROPERTIES[this.uid]; };
		obj.$$F = function(){ return _FLAGS[this.uid]; };
	}
	return new Class(obj);
}());


/********************************************************************************************************************************
 * J104.UIComponent
 */
J104.UIComponent = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.UIComponent',
		version: '2.0.1',
		lastModify: '2016/7/29'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _ID = {__proto__: null};
	var _DOM = {__proto__: null};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	var uicomponent = {
		Extends: J104.Object,
		Implements: [Events],
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104UIComponent',
			theme: '',
			additionClass: '',
			styles: ''
			// onDestroy: function(_this){}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(options){
			this.parent(options);
			_ID[this.uid] = '';
			var D = _DOM[this.uid] = {};
			var F = this.$F();
			F.available = true;
			F.destroy = false;

			var css = this.options.css;
			var theme = this.options.theme;
			D.wrapper = new Element('div.wrapper').addClass(css + (theme ?  (' ' + theme) : ''));
			var aClass = this.options.additionClass;
			if(aClass && typeOf(aClass) === 'string') D.wrapper.addClass(aClass);
			if(this.options.styles) D.wrapper.setStyles(this.options.styles);
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$setId: function(id){
			if(typeOf(id) === 'string' || typeOf(id) === 'number')
				_ID[this.uid] = id + '';
		}.protect(),
		$D: function(){ return _DOM[this.uid]; }.protect(),

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		id: function(){
			return _ID[this.uid];
		},

		DOM: function(key){
			return _DOM[this.uid][key];
		},

		enable: function(){
			this.$F().available = true;
			return this;
		},

		disable: function(){
			this.$F().available = false;
			return this;
		},

		isEnable: function(){
			return this.$F().available;
		},

		destroy: function(){
			Object.each(_DOM[this.uid], function(dom, key){
				if(dom && dom.destroy){
					var tip = dom.retrieve('J104.TIP');
					if(tip) tip.destroy();
					dom.destroy();
				}
			});
			_DOM[this.uid] = {};
			this.$F().destroy = true;
			this.parent();
			this.fireEvent('destroy', [this]);
			return this;
		}
	};

	if(J104.debug){	// for debug, $$ means allow access 'private member' from 'OUTSIDE' in debug mode
		uicomponent.$$D = function(){ return _DOM[this.uid]; };
	}
	return new Class(uicomponent);
}());


/********************************************************************************************************************************
 * J104.PeerUIComponent
 */
J104.PeerUIComponent = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.PeerUIComponent',
		extends: 'J104.UIComponent',
		version: '2.0.0',
		lastModify: '2016/7/29'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.UIComponent,
		profile: function(){ return Object.clone(__profile); },
		options: {
			_autoNotice: true
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			var src = document.id(ele);
			if(typeOf(src) != 'element') throw new Error('[' + this.profile().name + '] can not find element: ' + ele);
			this.parent(options);
			var D = this.$D();
			D.src = src;
			if(src.id) this.$setId(src.id);
			D.wrapper.inject(src, 'after');
			if(this.options._autoNotice) this.$buildNotice(D.wrapper);
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$buildNotice: function(target){
			this.notice = {};
			this.notice.note = target.notice.bind(target);
			this.notice.success = target.success.bind(target);
			this.notice.info = target.info.bind(target);
			this.notice.warning = target.warning.bind(target);
			this.notice.error = target.error.bind(target);
			this.notice.clear = target.clearNotices.bind(target);
			return this.notice;
		},

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		loading: function(msg){
			var w = this.$D().wrapper;
			if(w && w.isVisible()) w.loading(msg);
			return this;
		},

		unloading: function(){
			var w = this.$D().wrapper;
			if(w && w.isVisible()) w.unloading();
			return this;
		},

		enable: function(){
			this.parent();
			this.$D().wrapper.enable();
		},
		disable: function(){
			this.parent();
			this.$D().wrapper.disable();
		}
	});
}());


/********************************************************************************************************************************
 *J104.ContextMenu
 */
J104.ContextMenu = (function(){
	/*-- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.ContextMenu',
		extends: 'J104.UIComponent',
		version: '2.0.0',
		lastModify: '2016/2/14'
	};
	var __name = __profile.name;
	var _x, _y;

	/* -- private & static methods -------------------------------------------- */
	var _buildMenu = function(D, options, content){
		D.wrapper.addClass('an-100ms').hide();
		D.wrapper.inject(options.inject && typeOf(options.inject) === 'element' ? options.inject : document.body);
		if(typeOf(content) === 'element') content.inject(D.wrapper);
	};
	var _initEvents = function(_this, P){
		var F = _this.$F();
		var D = _this.$D();
		P.event = {};
		P.event.mouseDown = function(ev){
			if(ev.rightClick) return;
			if(F.open && ev.target != D.wrapper && !D.wrapper.contains(ev.target) && P.stickTarget != ev.target){
				ev.stop();
				_this.close();
			}
		}.bind(_this);
		P.event.keyDown = function(ev){
			if(ev.key === 'esc'){
				ev.stop();
				_this.close();
			}
		}.bind(_this);
		P.event.resize = function(ev){ _this.position(); }.bind(_this);
	};
	var _attachEvents = function(P){
		document.addEvent('mousedown', P.event.mouseDown);
		document.addEvent('keydown', P.event.keyDown);
		if(P.stickTarget !== 'mouse')
			window.addEvent('resize', P.event.resize);
	};
	var _detachEvents = function(P){
		document.removeEvent('mousedown', P.event.mouseDown);
		document.removeEvent('keydown', P.event.keyDown);
		if(P.stickTarget !== 'mouse') window.removeEvent('resize', P.event.resize);
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.UIComponent,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104ContextMenu',
			theme: '',
			additionClass: '',
			inject: document.body,
			stick: {
				target: 'mouse',			// 'mouse'(default), 'body'(html body) or DOM element
				direction: 'auto',			// 'auto'(default), 'center', 'ver(vertical)', 'hor(horizontal)', 'top', 'bottom', 'left', 'right'
				align: {
					ver: 'center',			// 'center'(default), 'top', 'bottom'
					hor: 'center'			// 'center'(default), 'left', 'right'
				},
				offset: {
					x: 0,
					y: 0
				}
			},
			onBeforeOpen: function(_this){},
			onOpen: function(_this){},
			onBeforeClose: function(_this){},
			onClose: function(_this){}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(content, options){
			content = document.id(content);
			if(typeOf(content) !== 'element') throw new Error('[' + __name + '] can not find element: ' + content);

			this.parent(options);
			var D = this.$D(), P = this.$P(), F = this.$F();
			P.content = content;
			_buildMenu(D, this.options, content);
			_initEvents(this, P);
			P.stickTarget = this.options.stick.target === 'body' ? document.body : typeOf(this.options.stick.target) === 'element' ? this.options.stick.target : 'mouse';
			if(P.stickTarget === 'mouse'){
				document.addEvent('mousemove', function(evt){
					_x = evt.page.x;
					_y = evt.page.y;
				});
			}
			else P.stickTarget.addEvent('click', function(evt){
				if(!F.open) this.open();
			}.bind(this));
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		isOpen: function(){
			return this.$F().open;
		},

		open: function(){
			var F = this.$F();
			if(F.open) return this;

			this.fireEvent('beforeOpen', [this]);
			var D = this.$D(), P = this.$P();
			P.content.inject(D.wrapper);
			D.wrapper.show().addClass('an-zoomInEnlarge');
			F.open = true;

			_attachEvents(P);

			// position ...
			if(P.stickTarget === 'mouse') D.wrapper.setStyles({position: 'absolute', top: _y, left: _x});
			else this.position();

			this.fireEvent('open', [this]);
			return this;
		},

		position: function(){
			var F = this.$F(), D = this.$D(), P = this.$P();
			if(!F.open) return this;

			var position = 'center', edge = 'center';
			var winSize = window.getSize(), wrapperSize = D.wrapper.getSize(), space = P.stickTarget.getDirectionSpace();
			var stick = this.options.stick;
			if(stick.direction === 'center'){
				position = 'center';
				edge = 'center';
			}
			else if(stick.direction === 'top'){
				position = 'top' + stick.align.hor;
				edge = 'bottom' + stick.align.hor;
			}
			else if(stick.direction === 'bottom'){
				position = 'bottom' + stick.align.hor;
				edge = 'top' + stick.align.hor;
			}
			else if(stick.direction === 'left'){
				position = stick.align.ver + 'left';
				edge = stick.align.ver + 'right';
			}
			else if(stick.direction === 'right'){
				position = stick.align.ver + 'right';
				edge = stick.align.ver + 'left';
			}
			else if(stick.direction === 'ver' || stick.direction === 'vertical'){
				position = (space.top > space.bottom ? 'top' : 'bottom') + stick.align.hor;
				edge = (space.top > space.bottom ? 'bottom' : 'top') + stick.align.hor;
			}
			else if(stick.direction === 'hor' || stick.direction === 'horizontal'){
				position = stick.align.ver + (space.right > space.left ? 'right' : 'left');
				edge = stick.align.ver + (space.right > space.left ? 'left' : 'right');
			}
			else if(stick.direction === 'auto'){
				var x = wrapperSize.x, y = wrapperSize.y;
				if(y > space.top && y > space.bottom && x > space.left && x > space.right){
					position = 'center';
					edge = 'center';
				}
				else{
					var ver = space.top > space.bottom ? space.top : space.bottom;
					var hor = space.left > space.right ? space.left : space.right;
					if((ver / y) > (hor / x)){
						position = (space.top > space.bottom ? 'top' : 'bottom') + stick.align.hor;
						edge = (space.top > space.bottom ? 'bottom' : 'top') + stick.align.hor;
					}
					else{
						position = stick.align.ver + (space.right > space.left ? 'right' : 'left');
						edge = stick.align.ver + (space.right > space.left ? 'left' : 'right');
					}
				}
			}
			D.wrapper.position({
				relativeTo: P.stickTarget,
				position: position,
				edge: edge,
				allowNegative: false,
				maximum: {
					x: winSize.x > wrapperSize.x ? winSize.x - wrapperSize.x : winSize.x,
					y: winSize.y > wrapperSize.y ? winSize.y - wrapperSize.y : winSize.y
				},
				offset: this.options.stick.offset
			});

			// fix positions
			/*(function(){
			 w = D.wrapper.getSize();
			 if(w.x !== wrapperSize.x || w.y !== wrapperSize.y)
			 D.wrapper.position({
			 relativeTo: P.stickTarget,
			 position: position,
			 edge: edge,
			 allowNegative: false,
			 maximum: {
			 x: winSize.x > w.x ? winSize.x - w.x : winSize.x,
			 y: winSize.y > w.y ? winSize.y - w.y : winSize.y
			 },
			 offset: this.options.stick.offset
			 });
			 }).delay(251, this); */
			return this;
		},

		close: function(){
			var F = this.$F();
			if(!F.open) return this;

			this.fireEvent('beforeClose', [this]);
			var D = this.$D(), P = this.$P();
			D.wrapper.hide();

			_detachEvents(P);

			F.open = false;
			this.fireEvent('close', [this]);
			return this;
		}
	});
}());

/********************************************************************************************************************************
 * J104.Utils
 */
J104.Utils = {
	htmlEncode: function (html) { return typeOf(html) == 'string' ? html.htmlEncode() : html; },
	htmlDecode: function (text) { return typeOf(text) == 'string' ? text.htmlDecode() : text; },

	/** comparator
	 * callback function for native JavaScript array sorting method ([].sort()) to sort object
	 * binds object with 'prop' & 'isAsc' properties, ex: {prop:'xxx', isAsc:true}
	 */
	comparator: function(o1, o2){
		if(typeOf(o1) == 'number' || typeOf(o1) == 'date'){
			var v = this.isAsc ? o1 - o2 : o2 - o1;
			return v == 0 ? 0 : v > 0 ? 1 : -1;
		}
		else if(typeOf(o1) == 'boolean'){
			return o1 == o2 ? 0 : this.isAsc ? (o1 ? 1 : -1) : (!o1 ? 1 : -1);
		}
		else if(typeOf(o1) == 'string'){
			var a = o1.toLowerCase();
			var b = o2.toLowerCase();
			if(!isNaN(Number(a)) && !isNaN(Number(b))){
				var v =  this.isAsc ? (a.toFloat() - b.toFloat()) : (b.toFloat() - a.toFloat());
				return v == 0 ? 0 : v > 0 ? 1 : -1;
			}
			else return this.isAsc ? (a < b ? -1 : a > b ? 1 : 0) : (a < b ? 1 : a > b ? -1 : 0);
		}
		else if(typeOf(o1) == 'array'){
			var value1 = o1[this.prop];
			var value2 = o2[this.prop];
			if(typeOf(value1) == 'number' || typeOf(value1) == 'date'){
				v = this.isAsc ? value1 - value2 : value2 - value1;
				return v == 0 ? 0 : v > 0 ? 1 : -1;
			}
			else if(typeOf(value1) == 'boolean'){
				return value1 == value2 ? 0 : this.isAsc ? (value1 ? 1 : -1) : (!value1 ? 1 : -1);
			}
			else {
				var a = value1 == null ? '' : value1.toLowerCase();
				var b = value2 == null ? '' : value2.toLowerCase();
				if(!isNaN(Number(a)) && !isNaN(Number(b))){
					var v =  this.isAsc ? (a.toFloat() - b.toFloat()) : (b.toFloat() - a.toFloat());
					return v == 0 ? 0 : v > 0 ? 1 : -1;
				}
				else return this.isAsc ? (a < b ? -1 : a > b ? 1 : 0) : (a < b ? 1 : a > b ? -1 : 0);
			}
		}
		else if(typeOf(o1) == 'object'){
			if(!this.prop) return 0;
			var value1 = o1[this.prop];
			var value2 = o2[this.prop];
			if(typeOf(value1) == 'number' || typeOf(value1) == 'date'){
				var v = this.isAsc ? value1 - value2 : value2 - value1;
				return v == 0 ? 0 : v > 0 ? 1 : -1;
			}
			else if(typeOf(value1) == 'boolean'){
				return value1 == value2 ? 0 : this.isAsc ? (value1 ? 1 : -1) : (!value1 ? 1 : -1);
			}
			else {
				var a = value1 == null ? '' : value1.toLowerCase();
				var b = value2 == null ? '' : value2.toLowerCase();
				if(!isNaN(Number(a)) && !isNaN(Number(b))){
					var v =  this.isAsc ? (a.toFloat() - b.toFloat()) : (b.toFloat() - a.toFloat());
					return v == 0 ? 0 : v > 0 ? 1 : -1;
				}
				else return this.isAsc ? (a < b ? -1 : a > b ? 1 : 0) : (a < b ? 1 : a > b ? -1 : 0);
			}
		}
		else return 0;
	},

	/** partialEqual
	 * var a = {x:1, y:2}; var b = {x:1, y:2, z:3}
	 * J104.Utils.partialEqual(a, b) ==> return true!
	 * J104.Utils.partialEqual(b, a) ==> return false!
	 */
	partialEqual: function(a, b, properties){
		if(a === b) return true;
		else if(typeOf(a) != 'object' || typeOf(b) != 'object') return false;

		var compareKeys = Object.keys(a);
		if(typeOf(properties) == 'string') compareKeys = compareKeys.contains(properties) ? [properties] : null;
		else if(typeOf(properties) == 'array') compareKeys = properties.filter(function(prop){ return compareKeys.contains(prop); });

		return compareKeys.every(function(key){ return b[key] != null && J104.Utils.partialEqual(a[key], b[key]); });
	},

	findCategory: function(code){
		var _findChildren = function(children, code, degree){
			var find = '';
			children.each(function(child){
				if(child.value == (code / degree).toInt() * degree)
					find = (code % degree === 0) ? child.text : child.children ? _findChildren(child.children, code, degree/1000) : '';
			});
			return find;
		};

		if(!code) return '';
		if(typeOf(code) === 'array'){
			var cates = '';
			code.each(function(v, idx){ cates += J104.Utils.findCategory(v) + (idx < code.length - 1 ? ', ' : '')});
			return cates;
		}
		code = code.toInt();
		var c = Constants.J104.Categories[(code / 1000000000).toInt() + '000000000'];
		if(!c) return '';
		return _findChildren(c, code, 1000000);
	},

	findOption: function(key, value){
		if(!Constants.J104.Options || value === undefined || value === null) return '';
		var string = '';
		if(typeOf(value) === 'array')
			value.each(function(v, idx){
				Constants.J104.Options[key].each(function(opt){
					if(v == opt.value) string += ((opt.name || opt.label || opt.text) + (idx < value.length - 1 ? ', ' : ''));
				});
			});
		else Constants.J104.Options[key].each(function(opt){ if(opt.value == value) string = (opt.name || opt.label || opt.text); });
		return string;
	},

	findBinaryOption: function(key, value){
		if(!Constants.J104.Options || value === undefined || value === null) return '';
		var values = [];
		var i = 0;
		(value).toString(2).split('').reverse().each(function(c, idx){
			if(c === '0') return;
			values[i++] = (2).pow(idx);
		});
		return J104.Utils.findOption(key, values);
	}
};



/*** mootools extension ***********************************************************************************************/
JSON.secure = false;

Element.implement({
	$: function(str){
		return this.getElement('[id=' + str + ']') || this.getElements(str)[0];
	},

	$$: function(str){
		return this.getElements(str);
	},

	destroyChildren: function(){
		this.getChildren().each(function(child){ child.destroy(); });
		return this.empty();
	},

	enable: function(){
		if(['button', 'textarea', 'input'].contains(this.get('tag'))) this.disabled = false;
		return this.removeClass('disable');
	},

	disable: function(){
		if(['button', 'textarea', 'input'].contains(this.get('tag'))) this.disabled = true;
		return this.addClass('disable');
	},

	mask: function(theme){
		if(!theme || typeOf(theme) !== 'string' || theme === '') theme = '';
		var mask = this.retrieve('J104.MASK');
		if(!mask){
			mask = new Mask(this, {
				'class': 'J104Mask ' + theme,
				inject: {where: 'inside'}
			});
			this.store('J104.MASK', mask);
		}
		else if(!mask.element.hasClass(['J104Mask', theme])){
			mask.element.removeProperty('class').addClass('J104Mask ' + theme);
		}
		mask.show().position();
		return this;
	},

	unmask: function(){
		var mask = this.retrieve('J104.MASK');
		if(mask) mask.hide();
		return this;
	},

	loading: function(message, theme){
		if(!message || typeOf(message) !== 'string' || message === '') message = 'loading...';
		if(!theme || typeOf(theme) !== 'string' || theme === '') theme = '';
		var loading = this.retrieve('J104.LOADING');
		if(!loading){
			loading = new Spinner(this, {
				'class': 'J104Loading ' + theme,
				content: new Element('div'),
				message: new Element('div.-msg'),
				img: false,
				inject: {where: 'inside'},
				fxOptions: {duration:10},
			});
			this.store('J104.LOADING', loading);
		}
		else if(!loading.element.hasClass(['J104Loading', theme])){
			loading.element.removeProperty('class').addClass('J104Loading ' + theme);
		}
		loading.msg.set('text', message);
		loading.show();
		return this;
	},

	unloading: function(){
		var loading = this.retrieve('J104.LOADING');
		if(loading) loading.hide();
		return this;
	},

	getDirectionSpace: function(){		// return ex:{10, 20, 30, 40}
		var spaces = {};
		var winSize = window.getSize();
		var coor = this.getCoordinates();
		var docScroll = document.getScroll();
		spaces.top = coor.top - docScroll.y;
		spaces.right = docScroll.x + winSize.x - coor.left - coor.width;
		spaces.bottom = docScroll.y + winSize.y - coor.top - coor.height;
		spaces.left = coor.left - docScroll.x;
		return spaces;
	},

	sticky: function(context, options){
		if(typeOf(context) === 'object'){
			options = context;
			context = options.context || document.body;
		}
		options = Object.merge({}, {
			viewport: document.body,
			marginTop: 0
			//onScroll: function(ele, context, viewport){},
			//onStickTop: function(ele, context, viewport){},
			//onNormal: function(ele, context, viewport){},
		}, options);
		context = (context || document.body).setStyle('position', 'relative');
		var viewport = options.viewport;
		var marginTop = options.marginTop;
		var offsetY = this.getPosition(context).y;
		var _this = this;
		var viewportSize, viewportHeight, contextSize, contextHeight, stickySize, stickyHeight, status;
		var preContextTopY = null;
		var calSize = function(){
			var sizeOptions = {
				styles: ['border'],
				mode: 'vertical'
			};
			if(viewport === document.body){
				viewportSize = window.getSize();
				viewportHeight = viewportSize.y;
			}
			else{
				viewportSize = viewport.getComputedSize(sizeOptions);
				viewportHeight = viewportSize.height;
			}
			contextSize = context.getComputedSize(sizeOptions);
			contextHeight = contextSize.height;
			stickySize = _this.getComputedSize(sizeOptions);
			stickyHeight = stickySize.height;
		};
		var handleSticky = function(){
			if(!_this.isVisible()) return;
			/*if(contextHeight === 0 || stickyHeight === 0)*/ calSize();
			var isFixed = _this.getStyle('position') === 'fixed';
			var contextTopY = viewport === document.body ? (context.getPosition().y - viewport.getScroll().y) : context.getPosition(viewport).y;
			var scrollDown = true;
			if(preContextTopY != null) scrollDown = contextTopY < preContextTopY;
			preContextTopY = contextTopY;
			var contextBottomY = contextTopY + contextHeight;
			var stickyTopY = (viewport === document.body && !isFixed) ? (_this.getPosition().y - viewport.getScroll().y) : _this.getPosition(viewport).y;
			var stickyBottomY = stickyTopY + stickyHeight;
			var space;
			if(viewportHeight > contextHeight){
				if(contextTopY > viewportHeight || contextBottomY < marginTop) space = 0;
				else if(contextTopY > marginTop && contextBottomY < viewportHeight) space = contextHeight;
				else if(contextTopY < marginTop) space = contextHeight - (marginTop - contextTopY);
				else space = viewportHeight - contextTopY;
			}
			else{
				if(contextTopY > viewportHeight || contextBottomY < marginTop) space = 0;
				else if(contextTopY < marginTop && contextBottomY > viewportHeight) space = viewportHeight - marginTop;
				else if(contextTopY < marginTop) space = contextHeight - (marginTop - contextTopY);
				else space = viewportHeight - contextTopY;
			}
			var isSpaceEnough = space >= stickyHeight;
			var isViewportEnough = viewportHeight >= stickyHeight;

			var onNormal = function(){
				_this.setStyles({
					position: 'relative',
					top: 'auto',
					bottom: 'auto'
				}).removeClass('stickTop');
				if(status != 'normal' && typeOf(options.onNormal) === 'function') options.onNormal(_this, context, viewport);
				//if(status != 'normal') console.log('on normal');
				status = 'normal';
			};
			_this.addEvent('normal', onNormal);
			var onStickTop = function(){
				_this.setStyles({
					position: 'fixed',
					top: (viewport === document.body ? 0 : (viewport.getPosition().y)) + options.marginTop,
					bottom: 'auto'
				}).addClass('stickTop');
				if(status != 'stickTop' && typeOf(options.onStickTop) === 'function') options.onStickTop(_this, context, viewport);
				//if(status != 'stickTop') console.log('on stick Top');
				status = 'stickTop';
			};
			var onDockTop = function(){
				_this.setStyles({
					position: 'absolute',
					top: -contextTopY + marginTop,
					bottom: 'auto'
				});
				//if(status != 'dockTop') console.log('on dock top');
				status = 'dockTop';
			};
			var onTouchBottom = function(){
				_this.setStyles({
					position: 'absolute',
					top: 'auto',
					bottom: 0
				});
				//if(status != 'touchBottom') console.log('on touch bottom');
				status = 'touchBottom';
			};
			var onDockBottom = function(){
				_this.setStyles({
					position: 'absolute',
					top: viewportHeight - contextTopY - stickyHeight,
					bottom: 'auto'
				});
				//if(status != 'dockBottom') console.log('on Dock Bottom');
				status = 'dockBottom';
			};
			//if((stickyTopY > viewportHeight) || (stickyBottomY < marginTop)) return;
			if(isFixed && isViewportEnough){
				if((contextTopY + offsetY) > marginTop) onNormal();
				else if(stickyBottomY > contextBottomY) onTouchBottom();
			}
			//else if(isFixed && !isViewportEnough){}
			else if(!isFixed && isViewportEnough){
				if((stickyTopY < marginTop) && isSpaceEnough) onStickTop();
				else if(stickyTopY > marginTop && (contextTopY + offsetY) < marginTop) onStickTop();
			}
			else{
				if(stickyBottomY < viewportHeight && contextBottomY >= viewportHeight) onDockBottom();
				else if(contextBottomY < viewportHeight) onTouchBottom();
				else if(!scrollDown && ((contextTopY + offsetY) > marginTop)) onNormal();
				else if(!scrollDown && (stickyTopY > marginTop) && (contextTopY < marginTop)) onDockTop();
			}
			if(typeOf(options.onScroll) === 'function') options.onScroll(_this, context, viewport);
		}
		var preEvent = this.retrieve('J104:sticky');
		if(preEvent){
			window.removeEvent('resize', preEvent);
			(viewport === document.body ? document : viewport).removeEvent('scroll', preEvent);
		}
		window.addEvent('resize', handleSticky);
		(viewport === document.body ? document : viewport).addEvent('scroll', handleSticky);
		return this.store('J104:sticky', handleSticky);
	}
});

String.implement({
	replaceAll: function(find, replace){
		return this.replace(new RegExp(find, 'g'), replace);
	},

	escapeHtml: function(){
		return this.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
	},

	htmlEncode: function(){
		var temp = document.createElement("div");
		(temp.textContent != null) ? (temp.textContent = this) : (temp.innerText = this);
		var output = temp.innerHTML;
		temp.destroy();
		return output;
	},

	htmlDecode: function(){
		var temp = document.createElement("div");
		temp.innerHTML = this;
		var output = temp.innerText || temp.textContent;
		temp.destroy();
		return output;
	},

	toBinaryArray: function(){
		var values = [];
		var i = 0;
		try{
			(this.toInt()).toString(2).split('').reverse().each(function(c, idx){
				if(c === '0') return;
				values[i++] = (2).pow(idx);
			});
		}
		catch(error){}
		return values;
	},

	toFileSize: function(){
		var size = this.toInt();
		if(isNaN(size)) return '';

		if(size / 1024 < 1) return size + 'B';
		else if(size / Math.pow(1024, 2) < 1) return Math.round(size * 10 / 1024) / 10 + 'KB';
		else if(size / Math.pow(1024, 3) < 1) return Math.round(size * 10 / Math.pow(1024, 2)) / 10 + 'MB';
		else if(size / Math.pow(1024, 4) < 1) return Math.round(size * 10 / Math.pow(1024, 3)) / 10 + 'GB';
		else if(size / Math.pow(1024, 5) < 1) return Math.round(size * 10 / Math.pow(1024, 4)) / 10 + 'TB';
		else if(size / Math.pow(1024, 6) < 1) return Math.round(size * 10 / Math.pow(1024, 5)) / 10 + 'PB';
		else if(size / Math.pow(1024, 7) < 1) return Math.round(size * 10 / Math.pow(1024, 6)) / 10 + 'EB';
		else if(size / Math.pow(1024, 8) < 1) return Math.round(size * 10 / Math.pow(1024, 7)) / 10 + 'ZB';
		else return size;
	}
});

Request.File = new Class({
	Extends: Request,
	options: {
		emulation: false,
		urlEncoded: false
	},

	initialize: function(options){
		this.xhr = new Browser.Request();
		this.formData = new FormData();
		this.setOptions(options);
		this.headers = this.options.headers;
	},

	append: function(key, value){
		this.formData.append(key, value);
		return this;
	},

	reset: function(){
		this.formData = new FormData();
		return this;
	},

	send: function(options){
		if(!this.check(options)) return this;

		this.options.isSuccess = this.options.isSuccess || this.isSuccess;
		this.running = true;

		var xhr = this.xhr;
		if('onprogress' in new Browser.Request){
			xhr.onloadstart = this.loadstart.bind(this);
			xhr.onprogress = this.progress.bind(this);
			xhr.upload.onprogress = this.progress.bind(this);
		}

		xhr.open('POST', this.options.url, true);
		xhr.onreadystatechange = this.onStateChange.bind(this);

		Object.each(this.headers, function(value, key){
			try{
				xhr.setRequestHeader(key, value);
			}
			catch(e){
				this.fireEvent('exception', [key, value]);
			}
		}, this);

		this.fireEvent('request');
		xhr.send(this.formData);

		if(!this.options.async) this.onStateChange();
		if(this.options.timeout) this.timer = this.timeout.delay(this.options.timeout, this);
		return this;
	},

	success: function(text){
		var json = this.response.json = JSON.decode(text, this.options.secure);
		var code = json.code.toInt();
		if(code >= 400){
			var n = this.options.notice;
			if(n) n.target.error(json.message);
			this.fireEvent('complete').fireEvent('error', [code, json.message, json.data])
		}
		else if(code >= 300){
			var n = this.options.notice;
			if(n) n.target[n.type](json.message);
			this.fireEvent('complete').fireEvent('success', [code, json.message, json.data]);
		}
		else this.onSuccess(code, json.message, json.data);
	}
});

var Ajax = new Class({
	Extends: Request.JSON,

	options:{
		attach: null,										// element who bind ajax call
		disableElements: [],
		loading:{
			target: null,
			text: ' ',
			theme: ''
		},
		//onRequest: function(){}							// before send request
		//onComplete: function(){}							// event flow: request -> complete -> success or error
		//onSuccess: function(code, message, data, xhr){}, 		// biz logic success
		//onError: function(code, message, data, xhr){},
	},

	initialize: function(url, options){
		if(!options) options = {};
		if(typeOf(url) === 'string') options.url = url;
		else if(typeOf(url) === 'object') options = Object.merge(url, options);
		this.parent(options);
		if(typeOf(this.options.attach) === 'element')
			this.options.attach.addEvent('click', function(evt){
				this.fireEvent('send');
				if(!this.isRunning()) this.send();
			}.bind(this));

		var d = this.options.disableElements;
		if(d && d.length > 0)
			this.addEvents({
				'request': function(){ d.each(function(ele){ele.disable();});},
				'complete': function(){ d.each(function(ele){ele.enable();});}
			});

		var loading = this.options.loading;
		if(loading && loading.target)
			this.addEvents({
				'request': function(){loading.target.loading(loading.text, loading.theme)},
				'complete': function(){loading.target.unloading()}
			});
	},

	onSuccess: function(json){
		this.fireEvent('complete');
		var code = json.code * 1;
		if(code >= 400) this.fireEvent('error', [code, json.message, json.data, this.xhr]);
		else this.fireEvent('success', [code, json.message, json.data, this.xhr]);
	},

	onFailure: function(){
		this.fireEvent('complete');
		try{
			var json = JSON.decode(this.xhr.responseText);
			if(this.$events.error) this.fireEvent('error', [json.code, json.message, json.data, this.xhr]);
			else this._defaultErrorHandler();
		}
		catch(error){
			if(this.$events.error) this.fireEvent('error', [0, '', {}, this.xhr]);
			else this._defaultErrorHandler();
		}
	},

	_defaultErrorHandler: function(){
		var xhr = this.xhr;
		console.error('J104.Ajax error:');
		console.error(xhr);
		var msg = new Element('div');
		new Element('div').set('text', 'AJAX ERROR: ' + xhr.status).inject(msg);
		switch (xhr.status){
			case 400:
				new Element('div').set('text', 'Bad Request').inject(msg);
				break;
			case 401:
				new Element('div').set('text', 'Unauthorized').inject(msg);
				break;
			case 404:
				new Element('div').set('text', '"' + xhr.responseURL + '" not found!').inject(msg);
				break;
			default:
				new Element('div').set('text', 'Internal Error').inject(msg);
		}
		document.body.error(msg);
	},

	setUrl: function(url){
		if(!url) return false;
		this.options.url = url;
		return this;
	},

	setPayload: function(payload){
		if(!['object', 'string', 'element'].contains(typeOf(payload))) return false;
		this.options.data = payload;
		return this;
	},

	appendPayload: function(payload){
		if(typeOf(payload) === 'object') return false;
		Object.merge(this.options.data, payload);
		return this;
	}
});


// others ...................................................................
var ScrollSpy = new Class({
	Implements: [Options,Events],

	options: {
		container: window,
		max: 0,
		min: 0,
		mode: 'vertical'/*,
		 onEnter: $empty,
		 onLeave: $empty,
		 onScroll: $empty,
		 onTick: $empty
		 */
	},

	initialize: function(options) {
		this.setOptions(options);
		this.container = document.id(this.options.container);
		this.enters = this.leaves = 0;
		this.inside = false;

		this.listener = function(e) {
			var position = this.container.getScroll(), xy = position[this.options.mode == 'vertical' ? 'y' : 'x'];
			if(xy >= this.options.min && (this.options.max == 0 || xy <= this.options.max)) {
				if(!this.inside) {
					this.inside = true;
					this.enters++;
					this.fireEvent('enter', [position, this.enters, e]);
				}
				this.fireEvent('tick', [position, this.inside, this.enters, this.leaves, e]);
			}
			else if(this.inside){
				this.inside = false;
				this.leaves++;
				this.fireEvent('leave', [position, this.leaves, e]);
			}
			this.fireEvent('scroll', [position, this.inside, this.enters, this.leaves, e]);
		}.bind(this);

		this.start();
	},

	start: function() {
		this.container.addEvent('scroll', this.listener);
	},

	stop: function() {
		this.container.removeEvent('scroll', this.listener);
	}
});

/*
var a = {
	getChldren: function(){
		arguments = Array.from(arguments);
		if(arguments.length === 0) return false;
		if(arguments.length > 3) arguments = arguments.splice(0, 3);
		var base = 0, length = arguments.length;
		arguments.each(function(arg, idx){
			base += arg.toInt() * Math.pow(1000, 3 - idx);
		});
		return Object.filter(Constants.J104.Categories, function(value, key){
			key = key.toInt();
			return (key >= base) && (key - base) < Math.pow(1000, 4 - length) && key % Math.pow(1000, 3 - length) === 0;
		});
	}
}
*/
