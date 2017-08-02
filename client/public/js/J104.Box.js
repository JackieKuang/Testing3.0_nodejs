/********************************************************************************************************************************
 * J104.Box
 */
Constants.J104.Box = {};
J104.Box = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Box',
		extends: 'J104.UIComponent',
		version: '2.0.7',
		lastModify: '2017/01/21'
	};
	var __name = __profile.name;
	var _x, _y;

	/* -- private & static methods -------------------------------------------- */
	var _build = function(_this){
		var D = _this.$D();
		var P = _this.$P();
		var options = _this.options;

		// wrapper ...
		if(![100, 250, 500, 750, 1000].contains(options.fxDuration.toInt())) options.fxDuration = 250;
		//var wrapper = D.wrapper = new Element('div.wrapper.an-' + options.fxDuration + 'ms').addClass(options.css + (options.theme ?  ('-' + options.theme) : '')).hide();
		var wrapper = D.wrapper.addClass('wrapper an-' + options.fxDuration + 'ms').hide();
		//if(options.additionClass && typeOf(options.additionClass) === 'string') D.wrapper.addClass(options.additionClass);
		wrapper.setStyle('zIndex', P.level * 1000).inject(P.parent);

		// container & pointer ...
		var container = D.container = new Element('div.-container').inject(wrapper);
		if(options.pointer) D.pointer = new Element('div.-pointer').inject(wrapper);

		// header(optional) ...
		if(options.header) _this.$setHeader(options.header);

		// body ...
		var body = D.body = new Element('div.--body').inject(container);
		_this.$setBody(options.content);

		// footer(optional) ...
		if(options.footer) _this.$setFooter(options.footer);

		return _this;
	};
	var _updateBoxDimension = function(D, P, w, h, style){
		if(!D.wrapper.isVisible()){
			D.wrapper.show();
			var needHide = true;
		}
		var parent = P.parent;
		if(w && w !== 'auto'){
			if(typeOf(w) === 'array' || (typeOf(w) === 'string' && w.lastIndexOf('%') === w.length - 1)){
				var w0, min = -1, max = -1;
				if(typeOf(w) === 'array'){
					w0 = w[0].toInt();
					min = w[1].toInt();
					max = w[2].toInt();
				}
				else w0 = w.toInt();
				w = (parent.getSize().x * w0 / 100).toInt();
				if(min && min > 0 && w < min) w = min;
				if(max && max > 0 && w > max) w = max;
			}
			var cs = D.container.getComputedSize();
			D.body.setStyle(['max', 'min'].contains(style) ? (style + '-width') : 'width', w - cs.computedLeft - cs.computedRight);
		}
		if(h && h !== 'auto'){
			if(typeOf(h) === 'array' || (typeOf(h) === 'string' && h.lastIndexOf('%') === h.length - 1)){
				var h0, min = -1, max = -1;
				if(typeOf(h) === 'array'){
					h0 = h[0].toInt();
					min = h[1].toInt();
					max = h[2].toInt();
				}
				else h0 = h.toInt();
				h = (parent.getSize().y * h0 / 100).toInt();
				if(min && min > 0 && h < min) h = min;
				if(max && max > 0 && h > max) h = max;
			}
			var h1 = D.header ? D.header.getSize().y : 0;
			var h2 = D.footer ? D.footer.getSize().y : 0;
			var cs = D.container.getComputedSize();
			D.body.setStyle(['max', 'min'].contains(style) ? (style + '-height') : 'height', h - h1 - h2 - cs.computedTop - cs.computedBottom);
		}
		P.size = D.wrapper.getSize();
		if(needHide) D.wrapper.hide();
	};
	var _initEvents = function(_this){
		var F = _this.$F();
		var D = _this.$D();
		var P = _this.$P();
		var closeOn = _this.options.closeOn;
		P.events = {};
		P.events.keyUp = function(ev){
			if(closeOn.esc && ev.key === 'esc'){
				ev.preventDefault();
				_this.close();
			}
		};
		P.events.mouseUp = function(ev){
			if(!F.open || ev.rightClick) return;
			if(P.level < J104.Box.topLevel()) return;
			var t = ev.target;
			if(closeOn.click && closeOn.click.exclude && typeOf(closeOn.click.exclude) === 'element')
				if(closeOn.click.exclude.contains(t)) return;
			if(closeOn.click === true && !P.attachments.contains(t)){
				ev.preventDefault();
				return _this.close();
			}
			else{
				var click = closeOn.click;
				if(typeOf(click) !== 'object') return;
				if(click.box && !P.attachments.contains(t) && (t === D.wrapper || D.wrapper.contains(t))){
					ev.preventDefault();
					return _this.close();
				}
				if(click.body && !P.attachments.contains(t) && t !== D.wrapper && !D.wrapper.contains(t)){
					ev.preventDefault();
					return _this.close();
				}
			}
		};
		P.events.mouseMove = function(ev){
			_x = ev.page.x;
			_y = ev.page.y;
			if(P.stickTarget === 'mouse') _this.position();
		};
		P.events.resize = function(ev){
			_this.position.delay(250, _this);
		};

		// events for attachments ...
		P.events.attachmentOpen = function(ev){
			_x = ev.page.x;
			_y = ev.page.y;
			_this.open();
		};
		P.events.attachmentClose = function(evt){
			if(!D.wrapper.contains(evt.event.relatedTarget)) _this.close();
		};
	};
	var _attachEvents = function(P){
		document.addEvent('keyup', P.events.keyUp);
		document.addEvent('mouseup', P.events.mouseUp);
		if(P.stickTarget !== 'mouse') window.addEvent('resize', P.events.resize);
		else document.addEvent('mousemove', P.events.mouseMove);
		if(P.scrollListening) P.scrollListening.addEvent('wheel', P.events.resize);
	};
	var _detachEvents = function(P){
		if(!P.events) return;
		if(P.events.keyUp) document.removeEvent('keyup', P.events.keyUp);
		if(P.events.mouseUp) document.removeEvent('mouseup', P.events.mouseUp);
		if(P.stickTarget !== 'mouse') window.removeEvent('resize', P.events.resize);
		else document.removeEvent('mousemove', P.events.mouseMove);
		if(P.scrollListening) P.scrollListening.removeEvent('wheel', P.events.resize);
	};
	var _setContent = function(_this, part, content){
		var D = _this.$D(), P = _this.$P();
		var part = D[part];
		if(['string', 'number', 'date', 'boolean'].contains(typeOf(content))) part.set('text', content);
		else if(typeOf(content) === 'element'){
			part.destroyChildren();
			content.inject(part);
		}
		else return _this;
		_updateBoxDimension(D, P, _this.options.width, _this.options.height);
		return _this;
	};
	var _normalizePosition = function(str){
		if(typeOf(str) === 'string'){
			str = str.toLowerCase();
			if(str === 'top') return {x:'center', y:'top'};
			else if(str === 'bottom') return {x:'center', y:'bottom'};
			else if(str === 'left') return {x:'left', y:'center'};
			else if(str === 'right') return {x:'right', y:'center'};
			else if(str === 'topleft') return {x:'left', y:'top'};
			else if(str === 'topright') return {x:'right', y:'top'};
			else if(str === 'bottomleft') return {x:'left', y:'bottom'};
			else if(str === 'bottomright') return {x:'right', y:'bottom'};
			else return {x:'center', y:'center'};
		}
		else if(typeOf(str) !== 'object') return {x:'center', y:'bottom'};		// stickTarget === 'mouse'
	};
	var _calPointer = function(pos, edge, pointer){
		var x = pos.x === 'center' || edge.x === 'center' || pos.x === edge.x;
		var y = pos.y === 'center' || edge.y === 'center' || pos.y === edge.y;
		if((x && y) || (!x && !y)) return false;

		var align = pointer === true ? 0 : pointer[0];
		var offset = pointer === true ? 0 : pointer[1];
		return {
			direct: x ? (pos.y === 'top' ? 'bottom' : 'top') : (pos.x === 'left' ? 'right' : 'left'),
			position: x ?
				{x: align === 0 ? 'center' : align === '+' ? 'right' : 'left', y: edge.y} :
				{x: edge.x, y: align == 0 ? 'center' : align === '+' ? 'bottom' : 'top'},
			edge: x ?
				{x: align === 0 ? 'center' : align === '+' ? 'right' : 'left', y: pos.y} :
				{x: pos.x, y: align == 0 ? 'center' : align === '+' ? 'bottom' : 'top'},
			offset: x ? {x: offset} : {y: offset}
		};
	};
	var _transferDirectionToPositionEdge = function(D, P, _this){
		var s = _this.options.stick, space = P.stickTarget.getDirectionSpace();
		if(s.direction === 'center') s.position = s.edge = 'center';
		else if(s.direction === 'top' || (s.direction === 'bottom' && space.top > P.size.y && space.bottom < P.size.y)){
			s.position = {y: 'top', x: s.align === '+' ? 'right' : s.align === '-' ? 'left' : 'center'};
			s.edge = {y: 'bottom', x: s.align === '+' ? 'right' : s.align === '-' ? 'left' : 'center'};
		}
		else if(s.direction === 'bottom' || (s.direction === 'top' && space.bottom > P.size.y && space.top < P.size.y)){
			s.position = {y: 'bottom', x: s.align === '+' ? 'right' : s.align === '-' ? 'left' : 'center'};
			s.edge = {y: 'top', x: s.align === '+' ? 'right' : s.align === '-' ? 'left' : 'center'};
		}
		else if(s.direction === 'left' || (s.direction === 'right' && space.right < P.size.x && space.left > P.size.x)){
			s.position = {x: 'left', y: s.align === '+' ? 'bottom' : s.align === '-' ? 'top' : 'center'};
			s.edge = {x: 'right', y: s.align === '+' ? 'bottom' : s.align === '-' ? 'top' : 'center'};
		}
		else if(s.direction === 'right' || (s.direction === 'left' && space.right > P.size.x && space.left < P.size.x)){
			s.position = {x: 'right', y: s.align === '+' ? 'bottom' : s.align === '-' ? 'top' : 'center'};
			s.edge = {x: 'left', y: s.align === '+' ? 'bottom' : s.align === '-' ? 'top' : 'center'};
		}
		else{
			['top', 'bottom', 'right', 'left'].each(function(css){
				if(D.pointer) D.pointer.removeClass(css);
				D.wrapper.setStyle('margin-' + css, '');
			});
			if(['ver', 'vertical'].contains(s.direction)){
				s.position = {y: space.top > space.bottom ? 'top' : 'bottom', x: s.align === '+' ? 'right' : s.align === '-' ? 'left' : 'center'};
				s.edge = {y: space.top > space.bottom ? 'bottom' : 'top', x: s.align === '+' ? 'right' : s.align === '-' ? 'left' : 'center'};
			}
			else if(['hor', 'horizontal'].contains(s.direction)){
				s.position = {x: space.right > space.left ? 'right' : 'left', y: s.align === '+' ? 'bottom' : s.align === '-' ? 'top' : 'center'};
				s.edge = {x: space.right > space.left ? 'left' : 'right', y: s.align === '+' ? 'bottom' : s.align === '-' ? 'top' : 'center'};
			}
			else{	// 'auto'
				var ver = space.top > space.bottom ? space.top : space.bottom;
				var hor = space.left > space.right ? space.left : space.right;
				if((ver / P.size.y) > (hor / P.size.x)){
					s.position = {y: space.top > space.bottom ? 'top' : 'bottom', x: s.align === '+' ? 'right' : s.align === '-' ? 'left' : 'center'};
					s.edge = {y: space.top > space.bottom ? 'bottom' : 'top', x: s.align === '+' ? 'right' : s.align === '-' ? 'left' : 'center'};
				}
				else{
					s.position = {x: space.right > space.left ? 'right' : 'left', y: s.align === '+' ? 'bottom' : s.align === '-' ? 'top' : 'center'};
					s.edge = {x: space.right > space.left ? 'left' : 'right', y: s.align === '+' ? 'bottom' : s.align === '-' ? 'top' : 'center'};
				}
			}
		}
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.UIComponent,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104Box',
			theme: '',
			additionClass: '',
			inject: document.body,			// Element; the box's parent.
			scrollListening: null,			// Element; (monitor scrolling like handle 'resize' event)
			boundary: true,					// Boolean; limit box display region(parent)
			content: '',					// String or Element;
			header: null,					// null, String or Element;
			footer: null,					// null, String or Element;
			load: {							// false or Object; load content by ajax.
				url: '',					// the url to load the content.
				reload: false				// reloads the content each time the box is opened.
			},
			width: 'auto',					// 'auto'(default), numeric, or array: [percentage, min, max];
			height: 'auto',					// the same as 'width'
			attach: null,
			event: 'click',					// {'click', 'mouseover', 'mouseenter'}
			stick: {						// 'mouse', Element or Object;
				target: window,			    // 'mouse', or Element;
				position: 'center',
				edge: 'center',
				//direction: 'ver',	        // 'auto', 'ver(vertical) (default)', 'hor(horizontal)', 'top', 'bottom', 'left', 'right'
				//align: 0			        // {'-', 0, '+'}
				offset: {
					x: 0,
					y: 0
				}
			},
			closeOn: {
				esc: true,					// true
				click: {					// false or object
					box: false,
					body: true,
					exclude: undefined
				}
			},
			level: 1,						// box layer level, (>=1)
			modal: false,					// if true or string(mask theme: ['light', 'dark', 'gray', 'transparent']), will put a overlay(mask) between Box and it's parent ...
			pointer: false,					// false(default), true, or array: [position, offset] (position:['-', 0, '+'], offset:numeric)
			fx: 'zoom',						// effect of open/close the box, {'zoom'(default), 'fade', 'tada'}
			fxDuration: 250,				// duration of effect (ms), {100, 250, 500, 750, 1000}
			audio: false,					// Boolean or string(...)
			onBeforeOpen: function(){},
			onOpen: function(_this){},
			onBeforeClose: function(){},
			onClose: function(_this){}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(options) {
			this.parent(options);
			var P = this.$P(), D = this.$D();
			P.parent = typeOf(this.options.inject) === 'element' ? this.options.inject : document.body;
			if(this.options.scrollListening && typeOf(this.options.scrollListening) === 'element')
				P.scrollListening = this.options.scrollListening;
			var level = this.options.level.toInt();
			P.level = typeOf(level) === 'number' && level > 0 ? level : 1;
			if(this.options.modal){
				P.mask = new Mask(P.parent, {
					'class': 'J104Mask-' + (this.options.modal === true ? 'light' : this.options.modal),
					inject: {where: 'inside'}
				});
				P.mask.element.setStyle('zIndex', P.level * 1000 - 1);
			}
			if(typeOf(this.options.stick) !== 'object'){
				var s = {target: this.options.stick};
				this.options.stick = s;
			}
			P.stickTarget = this.options.stick.target === 'mouse' ? 'mouse' :
				typeOf(this.options.stick.target) === 'element' ? this.options.stick.target : document.body;
			if(!this.options.stick.direction){
				this.options.stick.position = _normalizePosition(this.options.stick.position);
				this.options.stick.edge = _normalizePosition(this.options.stick.edge);
			}

			_build(this);
			_initEvents(this);

			P.activeEvent = ['click', 'mouseover', 'mouseenter'].contains(this.options.event) ? this.options.event : 'click';
			P.attachments = [];
			if(this.options.attach){
				if(typeOf(this.options.attach) === 'element') this.addAttach(this.options.attach);
				else if(typeOf(this.options.attach) === 'array')
					this.options.attach.each(function(a){ this.addAttach(a); }.bind(this));
			}
			if(this.options.load && this.options.load.url) this.$F().loadContentByAjax = true;
			// FX ....
			if(this.options.fx === 'fade'){
				P.openFX = 'an-fadeInDown';
				P.closeFX = 'an-fadeOutDown';
			}
			else if(this.options.fx === 'tada'){
				P.openFX = 'an-tada';
				P.closeFX = 'an-zoomOutShrink';
			}
			else{
				P.openFX = 'an-zoomInEnlarge';
				P.closeFX = 'an-zoomOutShrink';
			}
			P.audio = {};
			if(this.options.audio){
				P.audio.opening = new Audio('/js/2.x/asset/jump12.mp3');		// TODO: temp ...
				P.audio.opening.volume = .3;
			}
			J104.Box.instances.push(this);
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/
		$setHeader: function(header){
			var D = this.$D();
			if(!D.header) D.header = new Element('div.--header').inject(D.container, 'top');
			return _setContent(this, 'header', header);
		}.protect(),
		$setBody: function(body){ return _setContent(this, 'body', body); }.protect(),
		$setFooter: function(footer){
			var D = this.$D();
			if(!D.footer) D.footer = new Element('div.--footer').inject(D.container, 'bottom');
			return _setContent(this, 'footer', footer);
		}.protect(),

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		setStickTarget: function(ele){
			if(typeOf(ele) != 'element') return false;
			this.$P().stickTarget = ele;
			return this;
		},
		getStickTarget: function(){
			return this.$P().stickTarget;
		},
		inject: function(ele){
			if(typeOf(ele) != 'element') return false;
			this.$D().wrapper.inject(ele);
			return this;
		},

		addAttach: function(ele){
			var P = this.$P();
			if(typeOf(ele) != 'element' || P.attachments.contains(ele)) return false;

			var event = P.activeEvent;
			ele.addEvent(event, P.events.attachmentOpen);
			if(event === 'mouseover' || event === 'mouseenter')
				ele.addEvent(event === 'mouseover' ? 'mouseout' : 'mouseleave', P.events.attachmentClose);
			P.attachments.push(ele);
			return this;
		},
		removeAttach: function(ele){
			var P = this.$P();
			if(!P.attachments.contains(ele)) return this;

			var event = P.activeEvent;
			ele.removeEvent(event, P.events.attachmentOpen);
			if(event === 'mouseover' || event === 'mouseenter')
				ele.removeEvent(event === 'mouseover' ? 'mouseout' : 'mouseleave', P.events.attachmentClose);
			P.attachments.erase(ele);
			return this;
		},
		removeAllAttach: function(){
			var P = this.$P();
			var event = P.activeEvent;
			P.attachments.each(function(ele){
				ele.removeEvent(event, P.events.attachmentOpen);
				if(event === 'mouseover' || event === 'mouseenter')
					ele.removeEvent(event === 'mouseover' ? 'mouseout' : 'mouseleave', P.events.attachmentClose);
			});
			P.attachments = [];
			return this;
		},

		setWidth: function(width, style){
			_updateBoxDimension(this.$D(), this.$P(), width, this.options.height, style);
			return this;
		},

		getDimensions: function(){
			return this.$D().wrapper.getDimensions();
		},
		getLevel: function(){ return this.$P().level; },
		isOpen: function(){ return this.$F().open; },

		setContent: function(content){		// string or element
			var F = this.$F();
			if(F.destroy) return this;
			_setContent(this, 'body', content);
			if(F.open) this.position();
			return this;
		},
		setHtml: function(html){
			if(this.$F().destroy) return this;
			if(html && typeOf(html) === 'string'){
				var D = this.$D(), P = this.$P();
				D.body.set('html', html.stripScripts());
				_updateBoxDimension(D, P, this.options.width, this.options.height);
				this.position();
			}
			return this;
		},
		// load content by ajax
		loadContent: function(url, options){
			var P = this.$P();
			var D = this.$D();
			if(!P.ajax) {
				P.ajax = new Ajax({
					method: 'get',
					link: 'cancel',
					onRequest: function(){
						var loading = D.body.retrieve('J104.LOADING');
						if(loading) loading.element.inject(D.body, 'after');
						D.body.destroyChildren();
						if(loading) loading.element.inject(D.body);
						D.body.loading('loading ...', 'light');
					},
					onComplete: function(){
						_updateBoxDimension(D, P, this.options.width, this.options.height);
						this.position();
						D.body.unloading();
					}.bind(this),
					//onSuccess: function(code, msg, data, xhr){},
					//onError: function(code, msg, data, xhr){}
				});
			}
			P.ajax.send(Object.merge({}, options, {url: url}));
		},

		open: function(options){
			var F = this.$F();
			if(!F.available || F.destroy || F.open) return this;

			this.fireEvent('beforeOpen');

			if(options && typeOf(options.stickTarget) === 'element') this.setStickTarget(options.stickTarget);

			var D = this.$D(), P = this.$P();
			if(P.mask){
				P.mask.show();
				P.parent.addClass('J104BoxLockScroll');
			}

			if(this.options.fx === 'fade'){
				if(P.stickTarget === 'mouse'){
					P.openFX = 'an-zoomInEnlarge';
					P.closeFX = 'an-zoomOutShrink';
				}
				else {
					['Up', 'Down', 'Left', 'Right'].each(function(dir){D.wrapper.removeClass('an-fadeOut' + dir + '-10');});
					var s = this.options.stick;
					var pointer = this.options.pointer;
					if(s.direction === undefined || s.direction === 'top') P.openFX = 'an-fadeIn' + (pointer ? 'Down' : 'Up') + '-10';
					else if(s.direction === 'bottom') P.openFX = 'an-fadeIn' + (pointer ? 'Up' : 'Down') + '-10';
					else if(s.direction === 'left') P.openFX = 'an-fadeIn' + (pointer ? 'Right' : 'Left') + '-10';
					else if(s.direction === 'right') P.openFX = 'an-fadeIn' + (pointer ? 'Left' : 'Right') + '-10';
					else{
						var space = (P.stickTarget).getDirectionSpace();
						if(s.direction === 'vertical' || s.direction === 'ver')
							P.openFX = 'an-fadeIn' + (space.top > space.bottom ? (pointer ? 'Down' : 'Up') : (pointer ? 'Up' : 'Down')) + '-10';
						else if(s.direction === 'horizontal' || s.direction === 'hor')
							P.openFX = 'an-fadeIn' + (space.left > space.right ? (pointer ? 'Right' : 'Left') : (pointer ? 'Left' : 'Right')) + '-10';
						else{
							var ver = space.top > space.bottom ? space.top : space.bottom;
							var hor = space.left > space.right ? space.left : space.right;
							P.openFX = 'an-fadeIn' + ((ver / P.size.y) > (hor / P.size.x) ?
								(space.top > space.bottom ? (pointer ? 'Down' : 'Up') : (pointer ? 'Up' : 'Down')) :
								(space.left > space.right ? (pointer ? 'Right' : 'Left') : (pointer ? 'Left' : 'Right'))) + '-10';
						}
					}
				}
			}
			D.wrapper.removeClass(P.closeFX).show();

			if(P.audio.opening) P.audio.opening.play();
			this.position();
			D.wrapper.addClass(P.openFX);
			F.open = true;
			_attachEvents(P);

			(function(){
				if(!F.open) return;
				if(F.loadContentByAjax && (!F.ajaxLoaded || this.options.load.reload)){
					this.loadContent(this.options.load.url);
					F.ajaxLoaded = true;
				}
				this.fireEvent('open');
			}).delay(this.options.fxDuration, this);
			return this;
		},
		position: function(){
			var F = this.$F(), D = this.$D(), P = this.$P();
			if(F.destroy) return this;

			_updateBoxDimension(D, P, this.options.width, this.options.height);
			if(P.stickTarget === 'mouse'){
				var edge = this.options.stick.edge;
				if(edge.x === 'center' && ['top', 'center', 'bottom'].contains(edge.y)) _x -= P.size.x / 2;
				else if(edge.x === 'right' && ['top', 'center', 'bottom'].contains(edge.y)) _x -= P.size.x;
				if(edge.y === 'center' && ['left', 'center', 'right'].contains(edge.x)) _y -= P.size.y / 2;
				else if(edge.y === 'bottom' && ['left', 'center', 'right'].contains(edge.x)) _y -= P.size.y;
				if(!this.options.stick.offset)
					this.options.stick.offset = {
						x: edge.x === 'left' ? 8 : edge.x === 'right' ? -8 : 0,
						y: edge.y === 'top' ? 8 : edge.y === 'bottom' ? -8 : 0
					}
				if(this.options.stick.offset && this.options.stick.offset.x) _x += this.options.stick.offset.x;
				if(this.options.stick.offset && this.options.stick.offset.y) _y += this.options.stick.offset.y;
				D.wrapper.setStyles({position: 'absolute', top: _y, left: _x});
			}
			else{
				var stick = this.options.stick;
				if(stick.direction) _transferDirectionToPositionEdge(D, P, this);
				var opt = {
					relativeTo: P.stickTarget,
					position: this.options.stick.position,
					edge: this.options.stick.edge,
					allowNegative: false,
					offset: this.options.stick.offset
				};
				if(this.options.boundary){
					var boundary = P.parent.getSize();
					Object.merge(opt, {
						maximum: {
							x: (boundary.x > P.size.x ? boundary.x - P.size.x : boundary.x) + parent.getScroll().x,
							y: (boundary.y > P.size.y ? boundary.y - P.size.y : boundary.y) + parent.getScroll().y
						}
					})
				}
				// pointer handle ...
				if(this.options.pointer){
					var pointer = _calPointer(this.options.stick.position, this.options.stick.edge, this.options.pointer);
					if(pointer){
						D.pointer.removeProperty('class').addClass('-pointer ' + pointer.direct);
						D.wrapper.setStyle('margin-' + pointer.direct, D.pointer.getSize()[['left', 'right'].contains(pointer.direct) ? 'x' : 'y']);
						D.pointer.position({
							relativeTo: D.body,
							position: pointer.position,
							edge: pointer.edge,
							offset: pointer.offset
						});
					}
					else D.pointer.hide();
				}
				D.wrapper.position(opt);
			}
			return this;
		},
		close: function(){
			var F = this.$F();
			if(F.destroy || !F.open) return this;

			this.fireEvent('beforeClose');

			var D = this.$D(), P = this.$P();
			if(this.options.fx === 'fade'){
				['Up', 'Down', 'Left', 'Right'].each(function(dir){D.wrapper.removeClass('an-fadeIn' + dir + '-10');});
				var s = this.options.stick;
				var pointer = this.options.pointer;
				if(s.direction === undefined || s.direction === 'top') P.closeFX = 'an-fadeOut' + (pointer ? 'Up' : 'Down') + '-10';
				else if(s.direction === 'bottom') P.closeFX = 'an-fadeOut' + (pointer ? 'Down' : 'Up') + '-10';
				else if(s.direction === 'left') P.closeFX = 'an-fadeOut' + (pointer ? 'Left' : 'Right') + '-10';
				else if(s.direction === 'right') P.closeFX = 'an-fadeOut' + (pointer ? 'Right' : 'Left') + '-10';
				else{
					var space = P.stickTarget.getDirectionSpace();
					if(s.direction === 'vertical' || s.direction === 'ver')
						P.closeFX = 'an-fadeOut' + (space.top < space.bottom ? (pointer ? 'Down' : 'Up') : (pointer ? 'Up' : 'Down')) + '-10';
					else if(s.direction === 'horizontal' || s.direction === 'hor')
						P.closeFX = 'an-fadeOut' + (space.left < space.right ? (pointer ? 'Right' : 'Left') : (pointer ? 'Left' : 'Right')) + '-10';
					else{
						var ver = space.top > space.bottom ? space.top : space.bottom;
						var hor = space.left > space.right ? space.left : space.right;
						P.closeFX = 'an-fadeOut' + ((ver / P.size.y) > (hor / P.size.x) ?
							(space.top < space.bottom ? (pointer ? 'Down' : 'Up') : (pointer ? 'Up' : 'Down')) :
							(space.left < space.right ? (pointer ? 'Right' : 'Left') : (pointer ? 'Left' : 'Right'))) + '-10';
					}
				}
			}
			D.wrapper.removeClass(P.openFX).addClass(P.closeFX);
			F.open = false;
			_detachEvents(P);

			(function(){
				if(F.open) return;
				D.wrapper.hide();
				if(P.mask){
					P.mask.hide()//.delay(250, P.mask);
					P.parent.removeClass('J104BoxLockScroll');
				}
				this.fireEvent('close');
			}).delay(this.options.fxDuration, this);
			return this;
		},

		disable: function(){
			return this.close().parent();
		},
		destroy: function(){
			var P = this.$P();
			if(P.mask) P.mask.destroy();
			_detachEvents(P);
			J104.Box.instances.erase(this);
			return this.parent();
		}
	});
})();

J104.Box.instances = [];
J104.Box.topLevel = function(){
	var top = 0;
	J104.Box.instances.each(function(box){
		var level = box.getLevel();
		if(box.isOpen() && level > top) top = level;
	});
	return top;
};

Element.implement({
	makeBox: function(options){
		return new J104.Box(Object.merge({content: this}, options));
	}
});


/********************************************************************************************************************************
 * J104.Box.Tip
 */
//Constants.J104.Box.Tip = {};
J104.Box.Tip = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Box.Tip',
		extends: 'J104.Box',
		version: '2.0.1',
		lastModify: '2016/8/14'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Box,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104BoxTip',
			theme: '',
			additionClass: '',
			event: 'mouseover',
			boundary: false,
			level: 9,
			pointer: true,
			audio: false,
			stick: {
				direction: 'ver',	// 'auto', 'ver(vertical) (default)', 'hor(horizontal)', 'top', 'bottom', 'left', 'right'
				align: 0			// {'-', 0, '+'}
			},
			closeOn: {
				esc: false
			}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, options){
			if(!options) options = {};
			if(!options.attach) options.attach = ele;
			if(!options.stick) options.stick = {};
			if(!options.stick.target) options.stick.target = ele;
			this.parent(options);

			var D = this.$D(), P = this.$P();
			if(['mouseover', 'mouseenter'].contains(this.options.event))
				D.wrapper.addEvent('mouseleave', function(ev){
					if(!P.attachments.contains(ev.event.relatedTarget)) this.close();
				}.bind(this));
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		addAttach: function(ele){
			var P = this.$P();
			if(typeOf(ele) != 'element') return this;

			P.events.attachmentOpen1 = function(evt){
				if(P.stickTarget != 'mouse') P.stickTarget = ele;
				var msg = ele.retrieve('J104.Box.Tip:message') + '';
				if(!['null', 'undefined'].contains(msg) && msg.length > 0) this.setContent(msg);
				var options = ele.retrieve('J104.Box.Tip:options');
				if(options) this.setOptions(options);
			}.bind(this);
			ele.addEvent(P.activeEvent, P.events.attachmentOpen1);
			return this.parent(ele);
		},

		removeAttach: function(ele){
			var P = this.$P();
			if(!P.attachments.contains(ele)) return this;

			ele.removeEvent(P.activeEvent, P.events.attachmentOpen1);
			return this.parent(ele);
		},

		removeAllAttach: function(){
			var P = this.$P();
			P.attachments.each(function(ele){
				ele.removeEvent(P.activeEvent, P.events.attachmentOpen1);
			});
			return this.parent();
		}
	});
})();

Element.Properties['J104.Tip'] = {
	set: function(options){
		var tip = this.retrieve('J104.TIP');
		if(tip) tip.destroy();
		return this.eliminate('J104.TIP').store('tip:options', options);
	},

	get: function(){
		var tip = this.retrieve('J104.TIP');
		if(!tip){
			tip = new J104.Box.Tip(this, this.retrieve('tip:options'));
			this.store('J104.TIP', tip);
		}
		return tip;
	}
};
Element.implement({
	tip: function(message, options){
		if(options) this.set('J104.Tip', options);
		var tip = this.get('J104.Tip').enable();
		if(!tip.options.content) tip[options && options.html ? 'setHtml' : 'setContent'](message || this.getProperty('tip'));
		return this;
	},

	untip: function(){
		var tip = this.retrieve('J104.TIP');
		if(tip) tip.disable();
		return this;
	},

	getTip: function(){
		return this.retrieve('J104.TIP');
	}
});


/********************************************************************************************************************************
 * J104.Box.Notice
 */
//Constants.J104.Box.Notice = {};
J104.Box.Notice = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Box.Notice',
		extends: 'J104.Box',
		version: '2.0.0',
		lastModify: '2016/4/15'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _buildCounter = function(_this){
		var D = _this.$D();
		var counterWrapper = new Element('div.counterWrapper');
		var counter = D.counter = new Element('div.counter').inject(counterWrapper);

		return counterWrapper;
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Box,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104BoxNotice',
			theme: '',
			additionClass: '',
			boundary: false,
			stick: {
				position: 'top',
				edge: 'top'
			},
			closeOn: {
				esc: false,
				click: {
					box: true,
					body: false
				}
			},
			delayClose: 5000,			// if > 0, wait n milliseconds and the notice auto close
			countDown: true,
			fx: 'fade'
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(message, options){
			if(!options) options = {};
			options.content = message;
			this.parent(options);
			var P = this.$P(), D = this.$D();
			D.wrapper.set('tween', {duration: 80});
			P.delayClose = this.options.delayClose !== null && typeOf(this.options.delayClose.toInt()) === 'number' ? this.options.delayClose.toInt() : 5000;
			if(P.delayClose > 0){
				D.wrapper.addEvents({
					mouseenter: function(evt){
						if(this.options.countDown) D.counter.get('tween').pause();
						clearInterval(P.timerId);
						P.remain -= (new Date().getTime() - P.timestamp);
					}.bind(this),
					mouseleave: function(evt){
						if(this.options.countDown) D.counter.get('tween').resume();
						P.timerId = this.close.delay(P.remain, this);
						P.timestamp = new Date().getTime();
					}.bind(this)
				});
				if(this.options.countDown) this.$setFooter(_buildCounter(this));
			}
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		move: function(offset){
			var wrapper = this.$D().wrapper;
			wrapper.tween('top', wrapper.getStyle('top').toInt() + offset);
			this.options.stick.offset.y += offset;
			return this;
		},

		open: function(options){
			var P = this.$P(), D = this.$D();
			if(P.delayClose > 0){
				P.remain = P.delayClose + this.options.fxDuration;
				this.addEvent('open', function(){
					P.timerId = this.close.delay(P.remain, this);
				}.bind(this));
				if(this.options.countDown){
					D.counter.set('tween', {duration: P.remain});
					D.counter.tween.delay(P.fxDuration, D.counter, ['width', 0]);
				}
				P.timestamp = new Date().getTime();
			}
			this.addEvent('close', this.destroy.bind(this));

			return this.parent(options);
		}
	});
})();

Element.Properties.notice = {
	set: function(options){
		if(!options.stick) options.stick = {};
		options.stick.target = this;
		return this.store('notice:options', options);
	},

	get: function(){
		var notices = this.retrieve('J104.NOTICE');
		if(!notices){
			notices = new Array();
			this.store('J104.NOTICE', notices);
		}
		return notices;
	}
};
Element.implement({
	notice: function(message, options){
		options = Object.merge({stick:{target:this, offset:{y:10}}}, this.retrieve('notice:options'), options);
		if(options.single) options.fx = 'tada';
		var notice = new J104.Box.Notice(message, options);
		if(this === document.body) notice.setOptions({stick:{
			position: 'center'
		}});
		notice.addEvent('destroy', function(){ this.get('notice').erase(notice); }.bind(this));

		var notices = this.get('notice');
		if(options.single){
			while(notices.length > 0) notices.pop().destroy();
			notices.push(notice.open());
		}
		else{
			var move = notice.getDimensions().height + 10;
			if(notice.options.stick.position.y === 'bottom') move *= -1;
			notices.each(function(n){
				n.move(move);
			}).push(notice.open());
		}
		return this;
	},

	clearNotices: function(){
		var notices = this.get('notice');
		while(notices.length > 0) notices.pop().destroy();
	},

	success: function(message, options){
		options = Object.merge({delayClose: 5000}, options, {theme: 'success'});
		return this.notice(message, options);
	},

	info: function(message, options){
		options = Object.merge({delayClose: 10000}, options, {theme: 'info'});
		return this.notice(message, options);
	},

	warning: function(message, options){
		options = Object.merge({delayClose: 15000}, options, {theme: 'warning'});
		return this.notice(message, options);
	},

	error: function(message, options){
		options = Object.merge({delayClose: 0}, options, {theme: 'error'});
		return this.notice(message, options);
	}
});


/********************************************************************************************************************************
 * J104.Box.Dialog
 */
Constants.J104.Box.Dialog = {
	okButton: '確定',
	cancelButton: '取消'
}
J104.Box.Dialog = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Box.Dialog',
		extends: 'J104.Box',
		version: '2.0.2',
		lastModify: '2016/09/16'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _buildHeader = function(_this){
		var P = _this.$P(), D = _this.$D();
		var options = _this.options;
		if(options.draggable){
			D.header.addClass('draggable');
			new Drag.Move(D.wrapper, {handle: D.header, container: P.parent});
		}

		_this.$setHeader('');
		if(options.header.title){
			var title = D.title = new Element('div.title.fa').addClass(options.header.titleCss).inject(D.header);
			if(typeOf(options.title) === 'string') title.set('text', options.title);
			else if(typeOf(options.title) === 'element') options.title.inject(title);
		}
		if(options.header.close) new Element('div.close').addEvent('click', _this.close.bind(_this)).inject(D.header);
	};
	var _buildFooter = function(_this){
		var options = _this.options;
		var D = _this.$D();
		var buttons = new Element('div');
		if(typeOf(options.footer.okButton) === 'string' || options.footer.okButton === true)
			D.okButton = new Element('button.btn.btn-primary.okBtn', {type: 'button'})
				.set('text', options.footer.okButton || Constants.J104.Box.Dialog.okButton).addEvent('click', function(evt){
					_this.fireEvent('ok');
				}).inject(buttons);
		if(typeOf(options.footer.cancelButton) === 'string' || options.footer.cancelButton === true)
			D.cancelButton = new Element('button.btn.btn-default.cancelBtn', {type: 'button'})
				.set('text', options.footer.cancelButton || Constants.J104.Box.Dialog.cancelButton).addEvent('click', function(evt){
					_this.close();
					_this.fireEvent('cancel');
				}).inject(buttons);
		_this.$setFooter(buttons);
	};
	var _buildNotice = function(_this, target){
		var nOptions = _this.options.noticeOptions;
		nOptions.level = _this.getLevel() + 1;
		_this.notice = {};
		_this.notice.note = function(msg, options){
			target.notice(msg, Object.merge(nOptions, options));
			return _this;
		};;
		_this.notice.success = function(msg, options){
			target.success(msg, Object.merge(nOptions, options));
			return _this;
		};
		_this.notice.info = function(msg, options){
			target.info(msg, Object.merge(nOptions, options));
			return _this;
		};
		_this.notice.warning = function(msg, options){
			target.warning(msg, Object.merge(nOptions, options));
			return _this;
		};
		_this.notice.error = function(msg, options){
			target.error(msg, Object.merge(nOptions, options));
			return _this;
		};
		_this.notice.clear = target.clearNotices.bind(target);
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Box,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104BoxDialog',
			theme: '',
			additionClass: '',
			modal: 'gray',
			closeOn: {
				esc: false,
				click: false
			},
			title: 'J104 Dialog',				// string or element
			draggable: true,
			header: {
				title: true,					// boolean
				titleCss: '',
				close: true						// boolean
			},
			footer: {							// object or false
				okButton: '',			// string or false
				cancelButton: ''	// string or false
			},
			onOk: function(_this){},
			onCancel: function(_this){},
			noticeOptions: {
				stick: {
					offset: {y: 10}
				}
			}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(src, options){
			if(!['element', 'string'].contains(typeOf(src))) throw new Error('[' + __name + '] can not find element: ' + src);
			options = Object.merge({}, options, {content: src});
			this.parent(options);
			var D = this.$D();
			D.src = src;
			if(this.options.header) _buildHeader(this);
			if(this.options.footer) _buildFooter(this);
			_buildNotice(this, D.body);
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		close: function(){
			this.parent();
			this.notice.clear();
		},

		setTitle: function(title){
			if(typeOf(title) != 'string') return this;
			this.$D().title.set('text', title);
			return this;
		}
	});
})();
Element.implement({
	makeDialog: function(options){
		return new J104.Box.Dialog(this, options);
	}
});


/********************************************************************************************************************************
 * J104.Box.Confirm
 */
Constants.J104.Box.Confirm = {
	yesButton: 'Yes',
	noButton: 'No'
};
J104.Box.Confirm = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Box.Confirm',
		extends: 'J104.Box',
		version: '2.0.1',
		lastModify: '2016/8/14'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _build = function(_this){
		var options = _this.options;

		var D = _this.$D();
		var buttons = new Element('div');
		D.yesButton = new Element('button.btn.btn-primary.yesBtn')
			.set('text', (typeOf(options.yesButton) === 'string' && options.yesButton) || Constants.J104.Box.Confirm.yesButton)
			.addEvent('click', function(evt){
				_this.close();
				_this.fireEvent('yes', [_this]);
			}).inject(buttons);
		D.noButton = new Element('button.btn.btn-default.noBtn')
			.set('text', (typeOf(options.noButton) === 'string' && options.noButton) || Constants.J104.Box.Confirm.noButton)
			.addEvent('click', function(evt){
				_this.close();
				_this.fireEvent('no', [_this]);
			}).inject(buttons);

		_this.$setFooter(buttons);
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Box,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104BoxConfirm',
			theme: '',
			additionClass: '',
			closeOn: {
				esc: false,
				click: false
			},
			yesButton: '',
			noButton: ''
			//onYes: function(_this){},
			//onNo: function(_this){}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(message, options){
			if(typeOf(message) !== 'string') throw new Error('[' + __name + '] argument #0(message) required a \'String\' type');
			if(!options) options = {};
			options.content = message;
			options.modal = 'transparent';
			this.parent(options);
			_build(this);
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		addAttach: function(ele){
			if(typeOf(ele) != 'element') return this;

			var P = this.$P();
			ele.addEvent(P.activeEvent, function(evt){
				this.setContent(ele.retrieve('J104.Box.Confirm:message'));
				var yes = ele.retrieve('J104.Box.Confirm:yes');
				if(yes) this.removeEvents('yes').addEvent('yes', yes);
				var no = ele.retrieve('J104.Box.Confirm:no');
				if(no) this.removeEvents('no').addEvent('no', no);
			}.bind(this));
			return this.parent(ele);
		}
	});
})();


/********************************************************************************************************************************
 * J104.Box.Menu
 */
Constants.J104.Box.Menu = {
	emptyContent: '無資料'
};
J104.Box.Menu = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Box.Menu',
		extends: 'J104.Box',
		version: '2.0.3',
		lastModify: '2017/01/20'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _initEvents = function(_this){
		var P = _this.$P(), D = _this.$D(), options = _this.options.items;
		P.events.keyDown = function(evt){
			if(evt.key === 'up' || evt.key === 'down') {
				evt.stop();
				var items =  D.items.filter(function(item){
					return options.isVisible(item, item.data());
				});
				if(items.length == 0) return;
				var idx = !D.hoverItem ? -1 : items.indexOf(D.hoverItem);
				if((evt.key === 'up' && idx <= 0) || (evt.key === 'down' && idx >= (items.length - 1))) return;
				if(D.hoverItem) D.hoverItem.removeClass('hover');
				D.hoverItem = items[evt.key === 'up' ? --idx : ++idx].addClass('hover');
				var coor = D.hoverItem.getCoordinates(D.container);
				if(coor.top < 0 || coor.bottom > D.container.getSize().y) P.scrollFx.toElement(D.hoverItem, 'y');
				_this.fireEvent('hover', [D.hoverItem, D.hoverItem.data()]);
			}
			else if(evt.key === 'enter'){
				evt.stop();
				if(!D.hoverItem) return;
				_this.fireEvent('select', [D.hoverItem, D.hoverItem.data()]);
			}
		};
		P.scrollFx = new Fx.Scroll(D.container, {duration:50});
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Box,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104BoxMenu',
			event: 'click',         // 'click', 'contextmenu'
			boundary: false,
			level: 8,
			pointer: false,
			audio: false,
			fxDuration: 100,
			stick: {
				direction: 'ver',	// 'auto', 'ver(vertical) (default)', 'hor(horizontal)', 'top', 'bottom', 'left', 'right'
				align: 0			// {'-', 0, '+'}
			},
			closeOn: {
				esc: true
			},
			rawData: [],	// string(url) or object({url:'...', data:{...}}) or array(ex: ['a', 'b', ...] or [{label:'a', value:1}, ...])
			items: {
				//buildDom: function(data){},
				buildText: function(data){ return (data.text || data.label || data.name) ? (data.text || data.label || data.name) : data; },
				buildCSS: function(data){ return data.css ? data.css : ''; },
				isVisible: function(dom, data){ return true; },
				onSelect: function(dom, data){
					this.clearSelected();
					dom.setSelect(true);
				}
				//onEnter: function(dom, data){},
				//onLeave: function(dom, data){}
			},
			emptyContent: Constants.J104.Box.Menu.emptyContent
			//onLoad: function(){},
			//onLoadComplete: function(){},
			//onLoadSuccess: function(code, message, data){},
			//onLoadError: function(responseText, error){}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(options){
			this.parent(options);

			var D = this.$D(), P = this.$P();
			D.menuContent = new Element('div').inject(D.body);
			D.emptyContent = new Element('div.empty.fa').set('text', this.options.emptyContent || Constants.J104.Box.Menu.emptyContent).inject(D.body).hide();
			if(['mouseover', 'mouseenter'].contains(this.options.event))
				D.wrapper.addEvent('mouseleave', function(ev){
					if(!P.attachments.contains(ev.event.relatedTarget)) this.close();
				}.bind(this));


			this.addEvent('select', function(dom, data){
				if(this.options.items.onSelect) this.options.items.onSelect.pass([dom, data], this)();
			}.bind(this));
			this.addEvent('hover', function(dom, data){
				if(this.options.items.onHover) this.options.items.onHover.pass([dom, data], this)();
			}.bind(this));

			_initEvents(this);
			if(['string', 'object'].contains(typeOf(this.options.rawData))) this.loadContent(this.options.rawData);
			else this.setData(this.options.rawData);

			P.scrollFx = new Fx.Scroll(D.body, {duration:100});
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		refresh: function(){
			var D = this.$D();
			var visible = this.options.items.isVisible;
			var count = 0;
			if(visible && typeOf(visible) === 'function' && D.items)
				D.items.each(function(item){
					var show = visible(item, item.data());
					item[show ? 'show' : 'hide']();
					count += show ? 1 : 0;
				}.bind(this));
			D.menuContent[count === 0 ? 'hide' : 'show']();
			D.emptyContent[count === 0 ? 'show' : 'hide']();
			return count === 0 ? false : this;
		},
		open: function(options){
			this.parent(options);
			var P = this.$P();
			if(this.$F().open) document.addEvent('keydown', P.events.keyDown);
			this.refresh();
			var s = this.getSelected();
			if(s && s.length > 0) P.scrollFx.toElement(s[0]);
			return this;
		},
		close: function(){
			this.parent();
			if(!this.$F().open) document.removeEvent('keydown', this.$P().events.keyDown);
			return this;
		},

		isLoading: function(){
			var P = this.$P();
			return P.ajax && P.ajax.isRunning();
		},
		reloadContent: function(){
			this.loadContent(this.options.rawData);
		},
		loadContent: function(ajaxOptions){
			if(!ajaxOptions || !['string', 'object'].contains(typeOf(ajaxOptions))) return false;
			if(typeOf(ajaxOptions) === 'string') ajaxOptions = {url: ajaxOptions};

			var P = this.$P(), D = this.$D();
			if(!P.ajax)
				P.ajax = new Ajax({
					onRequest: function(){
						D.menuContent.hide();
						D.emptyContent.hide();
						D.body.addClass('loading');
						this.fireEvent('load');
					}.bind(this),
					onComplete: function(){
						D.body.removeClass('loading');
						this.fireEvent('loadComplete');
					}.bind(this),
					onSuccess: function(code, msg, data, xhr){
						this.setData(data);
						this.fireEvent('loadSuccess', [code, msg, data, xhr]);
					}.bind(this),
					onError: function(code, msg, data, xhr){
						this.setData([]);
						this.close();
						console.error('J104.Box.Menu load content error:' + xhr.responseText)
						this.fireEvent('loadError', [code, msg, data, xhr]);
					}.bind(this),
					defaultErrorHandler: false
				});
			if(P.ajax.isRunning()) P.ajax.cancel();
			P.ajax.send(ajaxOptions);
			return this;
		},
		cancelLoad: function(){
			if(!this.isLoading()) return this;
			var P = this.$P();
			P.ajax.cancel();
			return this.close();
		},
		setData: function(rawData){
			var D = this.$D(), P = this.$P(), options = this.options.items;
			if(!rawData || typeOf(rawData) !== 'array' || !D.menuContent) return false;

			P.rawData = [];
			D.menuContent.empty().show();
			D.items = [];
			D.hoverItem = undefined;
			var idx = 0;
			rawData.each(function(data){
				var dom = new Element('div').inject(D.menuContent);
				if(typeOf(options.buildDom) === 'function') options.buildDom(data).inject(dom);
				else{
					var text = options.buildText(data);
					if(text === '$HR') return dom.addClass('hr');
					dom.set('text', text)
				}
				dom.addClass('item ' + options.buildCSS(data))
					.store('J104.Box.Menu:model', data)
					.store('J104.Box.Menu:item', {selected: false, match:true, idx: idx++});
				dom.setSelect = function(s){
					dom.retrieve('J104.Box.Menu:item').select = s;
					return dom[s ? 'addClass' : 'removeClass']('selected');
				};
				dom.isSelect = function(){
					return dom.retrieve('J104.Box.Menu:item').select;
				};
				dom.setMatch = function(m){
					dom.retrieve('J104.Box.Menu:item').match = m;
					return dom;
				};
				dom.isMatch = function(){ return dom.retrieve('J104.Box.Menu:item').match; };
				dom.idx = function(){ return dom.retrieve('J104.Box.Menu:item').idx; };
				dom.data = function(){ return dom.retrieve('J104.Box.Menu:model'); };
				D.items.push(dom.addEvents({
					click: function(evt){
						evt.stop();
						this.fireEvent('select', [dom, data]);
					}.bind(this),
					mouseenter: function(evt){
						evt.stop();
						D.items.each(function(item){item.removeClass('hover');});
						D.hoverItem = dom.addClass('hover');
						if(options.onEnter) options.onEnter(dom, data);
					},
					mouseleave: function(evt){
						evt.stop();
						dom.removeClass('hover');
						if(D.hoverItem === dom) D.hoverItem = undefined;
						if(options.onLeave) options.onLeave(dom, data);
					}
				}));
				P.rawData.push(data);
			}.bind(this));
			return this;
		},
		getData: function(){
			return this.$P().rawData;
		},
		getItems: function(){
			return this.$D().items;
		},

		clearSelected: function(){
			var D = this.$D();
			if(D.items) D.items.each(function(item){item.setSelect(false);});
			if(D.hoverItem){
				D.hoverItem.removeClass('hover');
				D.hoverItem = undefined;
			}
			this.refresh();
			return this;
		},
		selectByIndex: function(idx){
			var D = this.$D();
			if(!D.items) return false;
			var items = D.items.filter(function(item){
				return this.options.items.isVisible(item, item.data());
			}.bind(this));
			if(!items || items.length === 0) return false;
			var item = items[idx];
			if(!item) return false;
			item.setSelect(true);
			this.fireEvent('select', [item, item.data()]);
			return this;
		},
		findItemByData: function(data, transfer){
			if(!this.$D().items) return false;
			var finds = this.$D().items.filter(function(item){
				var d = item.data();
				return (!transfer && d == data) || (transfer && transfer(d) == data)
			});
			return finds.length == 0 ? false : finds[0];
		},
		selectByData: function(data, transfer){
			var D = this.$D();
			if(!D.items || D.items.length === 0) return false;

			var find = this.findItemByData(data, transfer);
			if(find){
				find.setSelect(true);
				this.fireEvent('select', [find, find.data()]);
			}
			return find ? this : false;
		},
		getSelected: function(){
			return this.$D().items.filter(function(item){
				return item.isSelect();
			});
		},
		getUnselect: function(){
			return this.$D().items.filter(function(item){
				return !item.isSelect();
			});
		},
		getSelectedCount: function(){
			return this.getSelected().length;
		}
	});
})();
