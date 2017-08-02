/********************************************************************************************************************************
 * J104.Toggle
 */
J104.Toggle = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Toggle',
		extends: 'J104.UIComponent',
		version: '2.0.0',
		lastModify: '2016/6/25'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _select = function(_this, ele){
		var P = _this.$P();
		ele.addClass('selected');
		P.selected = ele;
		return _this.fireEvent('selected', [P.selected]);
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.UIComponent,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104Toggle',
			theme: '',
			selectIndex: 0,				// select none if <0
			selectEvent: 'click'		// 'click' or 'mouseover'
			//onSeleced: function(selected){}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(members, options) {
			this.parent(options);
			var P = this.$P();
			var m = P.members = new Array();
			if(typeOf(members) == 'array' || typeOf(members) == 'elements')
				members.each(this.addMember.bind(this));
			if(m.length === 0) return;
			if(typeof(this.options.selectIndex) === 'number' && this.options.selectIndex >= 0)
				this.selectByIndex(this.options.selectIndex);
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		addMember: function(ele){
			if(typeOf(ele) !== 'element' || this.contains(ele)) return false;

			var P = this.$P();
			P.members.push(ele
				.addClass(this.options.css + (this.options.theme ? ('-' + this.options.theme) : ''))
				.addEvent(this.options.selectEvent, function(evt){
					this.select(ele);
				}.bind(this)));
			return this;
		},

		removeMember: function(ele){
			var P = this.$P();
			if(typeOf(ele) !== 'element' || !this.contains(ele)) return this;
			ele.removeClass(this.options.css + (this.options.theme ? ('-' + this.options.theme) : '')).removeEvents(this.options.selectEvent);
			if(P.selected === ele) this.deselect();
			P.members.erase(ele);
			return this;
		},

		contains: function(ele){
			return this.$P().members.contains(ele);
		},

		getSelected: function(){
			return this.$P().selected;
		},

		indexOfSelected: function(){
			var P = this.$P();
			if(!P.selected) return -1;
			return P.members.indexOf(P.selected);
		},

		select: function(ele){
			var P = this.$P();
			if(!this.contains(ele) || P.selected === ele) return false;
			this.deselect();
			return _select(this, ele);
		},

		selectByIndex: function(idx){
			if(typeOf(idx) !== 'number') return false;
			var P = this.$P();
			if(idx < 0 || P.members.length < idx) idx = 0;
			return this.select(P.members[idx]);
		},

		deselect: function(){
			var selected = this.$P().selected;
			if(selected) selected.removeClass('selected');
			selected = null;
			return this;
		}
	});
})();


/********************************************************************************************************************************
 * J104.Tab
 */
J104.Tab = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Tab',
		extends: 'J104.Toggle',
		version: '2.0.0',
		lastModify: '2016/6/25'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Toggle,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104Tab',
			theme: '',
			additionClass: ''
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(tabs, contents, options){
			if(options && options.selectIndex < 0) options.selectIndex = 0;		// not allow none-selected
			this.parent(tabs, options);
			tabs.each(function(tab, idx){
				this.appendContent(tab, contents[idx]);
			}.bind(this));
			var fn = function(evt){
				this.$P().members.each(function(tab, idx){
					tab.retrieve('J104.Tab:contents').each(function(c){
						c[tab === this.getSelected() ? 'show' : 'hide']();
					}.bind(this));
				}.bind(this));
			}.bind(this);
			fn();
			this.addEvent('selected', fn);
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		addMember: function(ele){
			this.parent(ele);
			if(!this.contains(ele)) return this;

			ele.store('J104.Tab:contents', new Array());
			return this;
		},

		appendContent: function(tab, content){
			if(!this.contains(tab) || typeOf(content) !== 'element') return this;

			var contents = tab.retrieve('J104.Tab:contents');
			if(contents.contains(content)) return this;
			contents.push(content.hide());
			return this;
		},

		removeContent: function(tab, content){
			if(!this.contains(tab) || typeOf(content) !== 'element') return this;
			return tab.retrieve('J104.Tab:contents').erase(content);
		},

		addTab: function(tab, content){
			return this.addMember(tab).appendContent(tab, content);
		},

		removeTab: function(tab){
			if(!this.contains(tab)) return this;

			tab.retrieve('J104.Tab:contents').each(function(c){c.show();});
			tab.eliminate('J104.Tab:contents');
			this.removeMember(tab);
			if(this.getSelected() === tab && this.$P().members.length > 0) this.selectByIndex(0);
			return this;
		}
	});
})();


/********************************************************************************************************************************
 * J104.JumpTab
 */
J104.JumpTab = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.JumpTab',
		extends: 'J104.Toggle',
		version: '2.0.2',
		lastModify: '2016/10/6'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Toggle,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104JumpTab',
			theme: '',
			selectIndex: 0
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(tabs, container, options){
			if(options && options.selectIndex < 0) options.selectIndex = 0;
			this.parent(tabs, options);

			var P = this.$P(), D = this.$D();
			D.container = container = document.id(container);
			if(!container) throw new Error('[' + __name + '] can not find element(container): ' + container);

			var lock = false;
			var _this = this;
			var scrollEvent = function(){
				if(lock) return;

				var containerHeight = container.getSize().y;
				var middleLine = containerHeight / 2;
				var scrollY = container.getScroll().y;
				if(scrollY === 0) return _this.selectByIndex(0);
				var pairs = [];
				for(var i = 0; i < P.members.length; i++){
					var pair = P.members[i].retrieve('J104JumpTab:pair');
					var nextY = (i < P.members.length - 1) ? P.members[i + 1].retrieve('J104JumpTab:pair').getPosition(container).y : container.scrollHeight;
					pairs[i] = {
						y: pair.getPosition(container).y,
						height: nextY - pair.getPosition(container).y
					}
				}
				if(container.scrollHeight - scrollY <= containerHeight)
					return _this.selectByIndex(P.members.length - 1);
				pairs.each(function(p, idx){
					if(p.y < middleLine && (p.y + p.height) > middleLine)　return _this.selectByIndex(idx);
				});
			};
			container.addEvent('scroll', scrollEvent);
			this.scroller = new Fx.Scroll(container, {
				link: 'cancel',
				onStart: function(){
					lock = true;
					container.removeEvents('scroll');
				},
				onComplete: function(){
					container.addEvent('scroll', scrollEvent);
					(function(){lock = false}).delay(10);
				}
			});

			P.members.each(function(tab){
				var pair = container.$(tab.getProperty('data-anchor'));
				if(!pair) return;
				tab.store('J104JumpTab:pair', pair);
			}.bind(this));
		},

		/**	-- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		addMember: function(ele){
			if(!this.parent(ele)) return false;

			ele.addEvent(this.options.selectEvent, function(evt){
				var pair = ele.retrieve('J104JumpTab:pair');
				if(pair) this.scroller.toElement(pair);
			}.bind(this));
			return this;
		},

		refresh: function(){
			this.$D().container.fireEvent('scroll');
			return this;
		},

		reset: function(){
			this.selectByIndex(0);
			this.scroller.toTop();
		}
	});
})();
