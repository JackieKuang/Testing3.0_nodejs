/********************************************************************************************************************************
 * J104.Pager
 */
J104.Pager = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Pager',
		extends: 'J104.UIComponent',
		version: '2.0.0',
		lastModify: '2016/1/28'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _fixIndex = function(idx, max, P){
		if(isNaN(idx)) idx = P.index;
		return idx < 0 ? 0 : idx > max ? max : idx.toInt();
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.UIComponent,
		profile: function(){ return Object.clone(__profile); },
		options: {
			capacity: 50,		// if < 1, do not paging
			onChange: function(thisObj){}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(data, options) {
			this.parent(options);

			var P = this.$P();
			P.index = 0;
			P.capacity = 0;
			P.data = [];

			this.setCapacity(this.options.capacity);
			this.setData(data);
			this.first();
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		getIndex: function(){ return this.$P().index; },
		setIndex: function(idx){
			var P = this.$P();
			if(isNaN(idx) || idx < 0 || P.index === idx) return this;
			if(this.options.capacity < 1){
				P.index = 1;
				return this;
			}

			//idx = idx.toInt();
			//P.index = idx < 0 ? 0 : idx > P.max ? P.max : idx;
			P.index = _fixIndex(idx, this.getMax(), P);
			this.fireEvent('change', [this]);
			return this;
		},

		getCapacity: function(){ return this.$P().capacity; },
		setCapacity: function(cap){
			var P = this.$P();
			if(isNaN(cap) || P.capacity === cap) return this;

			P.capacity = cap.toInt();
			var max = this.getMax();
			if(P.index > max) P.index = max;
			this.fireEvent('change', [this]);
			return this;
		},

		getData: function(){ return this.$P().data; },
		setData: function(data){
			var P = this.$P();
			if(typeOf(data) != 'array' || P.data === data) return this;

			P.data = data;
			if(P.capacity > 0){
				var max = this.getMax();
				if(P.index >max) P.index = max;
			}
			this.fireEvent('change', [this]);
			return this;
		},

		getMax: function(){
			var P = this.$P();
			return P.data.length == 0 || P.capacity < 1 ? 0 :
				P.data.length % P.capacity == 0 ? P.data.length / P.capacity - 1 : Math.floor(P.data.length / P.capacity);
		},

		first: function(){ return this.setIndex(0); },
		previous: function(){ return this.setIndex(this.$P().index - 1); },
		next: function(){ return this.setIndex(this.$P().index + 1); },
		last: function(){ return this.setIndex(this.getMax()); },

		getSegmentData: function(idx){
			var P = this.$P();
			if(P.capacity < 1) return this.getData();

			var max = this.getMax();
			idx = _fixIndex(idx, max, P);
			var start = idx * P.capacity;
			return P.data.slice(start, idx == max ? P.data.length : start + P.capacity);
		},

		getInfo: function(idx){
			var P = this.$P();
			var max = this.getMax();
			idx = _fixIndex(idx, max, P);
			return {
				length: P.data.length,
				page: {
					current: idx + 1,
					total: max + 1,
					capacity: P.capacity
				},
				sequence: {
					start: idx * P.capacity + 1,
					end: idx === max ? P.data.length : (idx + 1) * P.capacity
				}
			};
		}
	});
})();


/********************************************************************************************************************************
 * J104.Pager.Classic
 */
J104.Pager.Classic = (function(){
	/* -- private & static properties ----------------------------------------- */
	var __profile = {
		name: 'J104.Pager.Classic',
		extends: 'J104.Pager',
		version: '2.0.1',
		lastModify: '2016/8/28'
	};
	var __name = __profile.name;

	/* -- private & static methods -------------------------------------------- */
	var _buildControls = function(_this, wrapper){
		var P = _this.$P(), D = _this.$D(), options = _this.options;

		// 1. pageControl ...
		var pageCtrl = D.pageControl = wrapper.addClass(options.css + (options.theme ?  ('-' + options.theme) : '')).addClass('pageControl');
		if(options.additionClass && typeOf(options.additionClass) === 'string') D.pageControl.addClass(options.additionClass);
		if(options.pageControl.first) D.firstBtn = new Element('span.fa.firstBtn').addEvent('click', _this.first.bind(_this)).inject(pageCtrl);
		if(options.pageControl.prev) D.prevBtn = new Element('span.fa.prevBtn').addEvent('click', _this.previous.bind(_this)).inject(pageCtrl);
		D.pageIndex = new Element('span.pageIndex.fa').inject(pageCtrl);
		P.pageCMenu = new J104.Box.Menu({
			css: 'J104PagerClassic-menu',
			attach: D.pageIndex,
			stick: {
				target: D.pageIndex,
				direction: 'center'
			},
			onOpen: function(){D.pageIndex.addClass('press');},
			onClose: function(){D.pageIndex.removeClass('press');},
			items:{
				onSelect: function(dom, data){
					P.pageCMenu.close();
					_this.setIndex(data.toInt() - 1);
				}
			}
		});
		if(options.pageControl.next) D.nextBtn = new Element('span.fa.nextBtn').addEvent('click', _this.next.bind(_this)).inject(pageCtrl);
		if(options.pageControl.last) D.lastBtn = new Element('span.fa.lastBtn').addEvent('click', _this.last.bind(_this)).inject(pageCtrl);

		// 2. lengthControl ...
		var lengthCtrl = document.id(options.lengthControl.ele);
		if(lengthCtrl && typeOf(lengthCtrl) === 'element'){
			D.lengthCtrl = lengthCtrl.addClass(options.css + (options.theme ? ('-' + options.theme) : '')).addClass('lengthControl');
			options.lengthControl.text = options.lengthControl.text.replaceAll('{length}', '<span class="length"></span>')
			D.lengthCtrl.set('html', options.lengthControl.text);
			D.length = D.lengthCtrl.$('.length');
		}

		// 3. capacityControl ...
		var capCtrl = document.id(options.capacityControl.ele);
		if(capCtrl && typeOf(capCtrl) === 'element'){
			D.capCtrl = capCtrl.addClass(options.css + (options.theme ? ('-' + options.theme) : '')).addClass('capacityControl');
			options.capacityControl.text = options.capacityControl.text.replaceAll('{capacity}', '<span class="capacity fa"></span>')
			D.capCtrl.set('html', options.capacityControl.text);
			D.capacity = D.capCtrl.$('.capacity');
			P.capacityCMenu = new J104.Box.Menu({
				css: 'J104PagerClassic-menu',
				attach: D.capacity,
				fx: 'fade',
				stick: {
					target: D.capacity,
					direction: 'ver'
				},
				onOpen: function(obj){D.capacity.addClass('press');},
				onClose: function(obj){D.capacity.removeClass('press');},
				rawData: options.capacityControl.options,
				items:{
					selected: P.capacity,
					onSelect: function(dom, data){
						P.capacityCMenu.close();
						_this.setCapacity(data);
						return true;
					}
				}
			});
		}
		return _render(_this);
	};
	var _render = function(_this){
		var info = _this.getInfo();
		var P = _this.$P(), D = _this.$D(), options = _this.options;
		if(D.pageControl) D.pageControl[info.page.total === 1 ? 'hide' : 'show']();
		if(D.pageIndex){
			D.pageIndex.set('text', options.pageControl.text.substitute(info.page));
			var pages = [];
			for(var i = 0; i < info.page.total; i++) pages[i] = i + 1;
			P.pageCMenu.setData(pages);
		}
		if(D.length) D.length.set('text', info.length);
		if(D.capacity) D.capacity.set('text', info.page.capacity);
		return _this;
	};

	/*** -- Class ---------------------------------------------------------------------------------------------------------- ***/
	return new Class({
		Extends: J104.Pager,
		profile: function(){ return Object.clone(__profile); },
		options: {
			css: 'J104PagerClassic',
			theme: '',
			additionClass: '',
			pageControl: {
				first: false,
				prev: true,
				next: true,
				last: false,
				text: '{current} / {total}'
			},
			lengthControl: {
				ele: null,
				text: '共 {length} 筆'
			},
			capacityControl: {
				ele: null,
				text: '每頁 {capacity} 筆',
				options: [5, 10, 20, 50, 100]
			}
		},

		/** -- constructor -------------------------------------------------------------------------------------------------- **/
		initialize: function(ele, data, options){
			ele = document.id(ele);
			if(typeOf(ele) !== 'element') throw new Error('[' + __name + '] can not find element: ' + ele);

			this.parent(data, options);
			_buildControls(this, ele);
		},

		/** -- protected methods -------------------------------------------------------------------------------------------- **/

		/** -- public methods ----------------------------------------------------------------------------------------------- **/
		setIndex: function(idx){
			this.parent(idx);
			return _render(this);
		},

		setCapacity: function(cap){
			this.parent(cap);
			return _render(this);
		},

		setData: function(data){
			this.parent(data);
			return _render(this);
		}
	});
})();