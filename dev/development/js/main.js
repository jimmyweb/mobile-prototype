NodeList.prototype.forEach = Array.prototype.forEach;

HTMLCollection.prototype.forEach = Array.prototype.forEach;

DOMTokenList.prototype.addMany = function(classes) {
    var array = classes.split(' ');
    for (var i = 0, length = array.length; i < length; i++) {
      this.add(array[i]);
    }
}

DOMTokenList.prototype.removeMany = function(classes) {
    var array = classes.split(' ');
    for (var i = 0, length = array.length; i < length; i++) {
      this.remove(array[i]);
    }
}

Handlebars.registerHelper('ifeq', function (a, b, options) {
  if (a == b) { return options.fn(this); }
});

/*
 * dom object with methods for DOM operations
 */

var dom = {
	attachEvent: function(nodes, event, fn) {
		if(nodes.length != undefined) {
			for (var i = 0, l = nodes.length; i < l; i++) {
				nodes[i].addEventListener(event, fn, false);
			}
		}else {
			nodes.addEventListener(event, fn, false);
		}
		
	},

	getEl: function(selector) {
		return document.querySelectorAll(selector);
	},

	addStyle: function(nodes, styles){
		nodes.forEach(function(el, index) {
			for(var style in styles) {
				el.style[style] = styles[style];
			}
		});
	},

	applyToAll: function(nodes, fn) {
		nodes.forEach(function(el, index) {
			fn(el, index);
		});
	},

	translateXY: function(element, x, y){
		if(!element) return false;
        element.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        element.style.OTransform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        element.style.msTransform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        element.style.MozTransform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        element.style.WebkitTransform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
	},

	translateY: function(element, offset){
		if(!element) return false;
        element.style.transform = 'translate3d(0, ' + offset + 'px, 0)';
        element.style.OTransform = 'translate3d(0, ' + offset + 'px, 0)';
        element.style.msTransform = 'translate3d(0, ' + offset + 'px, 0)';
        element.style.MozTransform = 'translate3d(0, ' + offset + 'px, 0)';
        element.style.WebkitTransform = 'translate3d(0, ' + offset + 'px, 0)';
	},

	translateX: function(element, offset){
		if(!element) return false;
        element.style.transform = 'translate3d(' + offset + 'px, 0, 0)';
        element.style.OTransform = 'translate3d(' + offset + 'px, 0, 0)';
        element.style.msTransform = 'translate3d(' + offset + 'px, 0, 0)';
        element.style.MozTransform = 'translate3d(' + offset + 'px, 0, 0)';
        element.style.WebkitTransform = 'translate3d(' + offset + 'px, 0, 0)';
	},

	scale: function(element, scale){
		if(!element) return false;
		scale = (scale === undefined) ? 1 : scale;
        element.style.transform = 'scale(' + scale + ')';
        element.style.OTransform = 'scale(' + scale + ')';
        element.style.msTransform = 'scale(' + scale + ')';
        element.style.MozTransform = 'scale(' + scale + ')';
        element.style.WebkitTransform = 'scale(' + scale + ')';
	},

	translateScale: function(element, offset, scale){
		if(!element) return false;
        element.style.transform = 'translate3d(0, ' + offset + 'px, 0) scale(' + scale + ')';
        element.style.OTransform = 'translate3d(0, ' + offset + 'px, 0) scale(' + scale + ')';
        element.style.msTransform = 'translate3d(0, ' + offset + 'px, 0) scale(' + scale + ')';
        element.style.MozTransform = 'translate3d(0, ' + offset + 'px, 0) scale(' + scale + ')';
        element.style.WebkitTransform = 'translate3d(0, ' + offset + 'px, 0) scale(' + scale + ')';
	},

	changeBgPosX: function(el, x, y){
		if(!el) return false;
		el.style.backgroundPosition = x + 'px ' + y + 'px';
	},

	addTo: function(container, el) {
		container.innerHTML = el;
	},

	clearEl: function(container) {
		container.innerHTML = '';
	},

	getElementCoords: function(el) {
	    var top = 0;
	    var left = 0;

	    while(el.tagName != "BODY") {
	        top += el.offsetTop;
	        left += el.offsetLeft;
	        el = el.offsetParent;
	    }
	    
	    return { top: top, left: left };
	}
};

!function(){
	'use strict';
	var streamWrapper = dom.getEl('#stream-wrapper')[0],
		detailsWrapper = dom.getEl('.details-wrapper')[0],
		homeWrapper = dom.getEl('#home-wrapper')[0],
		searchResults = dom.getEl('#search-results')[0],
		searchBox = dom.getEl('#search-box')[0],
		searchBar = dom.getEl('#searchbar')[0],
		books = null,
		viewportHeight = streamWrapper.offsetHeight,
		viewportWidth = streamWrapper.offsetWidth,
		windowHeight = document.documentElement.offsetHeight,
		MIN_OFFSET = 40,
		templates = {},
		cachedResults = {},
		currentInterest = '',
		detailsSlider = null,
		inDetails = false;

	/*
	 * context variables for homescreen view
	 */
	
	var homeContext = {
		name: 'home',
		wrapper: homeWrapper,
		currentIndex : 0,
		prevIndex : 0,
		nextIndex : 0,
		direction : '',
		currentItem : null,
		prevItem : null,
		nextItem : null,
		cards: null,
		cardsLength : 0
	};

	/*
	 * context variables for stream view
	 */

	var streamContext = {
		name: 'stream',
		wrapper: streamWrapper,
		currentIndex : 0,
		prevIndex : 0,
		nextIndex : 0,
		direction : '',
		currentItem : null,
		prevItem : null,
		nextItem : null,
		cards: null,
		cardsLength : 0
	};

	/*
	 * context variables for details view
	 */

	var detailsContext = {
		name: 'details',
		wrapper: detailsWrapper,
		currentIndex : 0,
		prevIndex : 0,
		nextIndex : 0,
		direction : '',
		currentItem : null,
		prevItem : null,
		nextItem : null,
		cards: null,
		cardsLength : 0
	};

	/*
	 * currentContext is responsible for pointing to current context;
	 * if view changes from one to another then currentContext should be updated 
	 * and point to current context (in that case: homeContext, streamContext or detailsContext);
	 * initial state of currentContext is homeContext
	 */

	var currentContext = homeContext;

	/*
	 * options for Hammer 
	 */
	
	var opts = {
		prevent_default: true,
		hold_threshold: 3,
		hold_timeout: 400
	};

	/*
	 * templates id names; if you add any new template in index.html 
	 * you should also add its id here
	 */

	var templateIds = [
		'cards-nav',
		'result-template',
		'card',
		'globe-card',
		'city-card',
		'home-shelf',
		'double-interest-card',
		'interest-list-card',
		'interest-card',
		'details-card',
		'facebook-card',
		'plain-card'
	];

	// get all templates and put them into templates object
	
	harvestTemplates();

	/*
	 * EVENTS LISTENERS
	 */
	
	document.addEventListener('DOMContentLoaded', function(){
		prepareHomescreen();
		dom.addStyle(dom.getEl('.cover'), {'display' : 'none'});
		setTimeout(function(){
			currentContext.currentItem.classList.add('animatedBook');
		},1000);
		setTimeout(function(){
			currentContext.currentItem.classList.remove('animatedBook');
		},2500);
	});

	/*
	 * event listeners for wrapper
	 */
	
	Hammer(streamWrapper, opts).on('dragdown', onDragDown);

	Hammer(streamWrapper, opts).on('dragup', onDragUp);

	Hammer(streamWrapper, opts).on('tap', onTap);

	Hammer(streamWrapper, opts).on('dragright', onDragRight);

	Hammer(streamWrapper, opts).on('release', onRelease);

	/*
	 * event listeners for details wrapper
	 */

	Hammer(detailsWrapper, opts).on('dragup', onDragUp);

	Hammer(detailsWrapper, opts).on('dragdown', onDragDown);

	Hammer(detailsWrapper, opts).on('dragright', onDragRight);

	Hammer(detailsWrapper, opts).on('release', onRelease);

	/*
	 * event listeners for homescreen
	 */

	Hammer(homeWrapper, opts).on('dragdown', onDragDown);

	Hammer(homeWrapper, opts).on('dragup', onDragUp);

	Hammer(homeWrapper, opts).on('release', onRelease);

	dom.attachEvent(searchBar, 'keyup', processSearch);

	/*
	 * custom events subscribers
	 */

	// cardChange event subscriber; fires when card on the homescreen is flipped
	// and updates the current section name in the header
	
	XyoPipe.subscribe('cardChanged', function(){
		if(currentContext.name == 'home'){
			var holder = homeWrapper.querySelectorAll('nav h1')[0];
			holder.innerHTML = currentContext.currentItem.getAttribute('data-section-name');
		}
	});

	// sliderMove event subscriber; fires when user swipe screenshot slider in details view
	// to the next screenshot and updates counter 

	XyoPipe.subscribe('sliderMove', function(evName){
		var container = detailsWrapper.querySelectorAll('.bullets div')[0];
		container.innerHTML = detailsSlider.getPos() + 1 + '/' + detailsSlider.getNumSlides();
	});

	/*
	functions attached to event listener
	 */

	function bookOnClick(e) {
		e.preventDefault();
		var target = this.getAttribute('data-target'),
			that = this;
		if(target) {
			this.classList.add('loading');
			currentInterest = this.getAttribute('data-interestname');
			setTimeout(function(){
				if(cachedResults[target]){
					dom.addTo(streamWrapper, cachedResults[target]);
				}else{
					insertItems(getArrayOfObjects('target', target), {target: target, container: streamWrapper});
				}
				switchToStream();
				currentContext = streamContext;
				updateContext();
				setMoviesHeight(streamWrapper);
				that.classList.remove('loading');
			}, 100);
		}
	}

	function onDragRight(e) {
		if(e.gesture.deltaX > MIN_OFFSET) {
			currentContext.direction = e.gesture.direction;
		}
	}

	function onDragDown(e){
		e.preventDefault();
		if(currentContext.currentIndex != currentContext.prevIndex){
			currentContext.currentItem.classList.removeMany('animatedCard');
			currentContext.prevItem.classList.remove('animatedCard');
			currentContext.direction = e.gesture.direction;
			currentContext.currentItem.classList.add('shadow');
			currentContext.prevItem.classList.add('shadow');
			goBackToFront(currentContext.prevItem, e.gesture.deltaY, 0.5, 1, viewportHeight);
			goBack(currentContext.currentItem, e.gesture.deltaY, 0.7, 1, viewportHeight);
			currentContext.offset = Math.abs(e.gesture.deltaY);
		}
	}

	function onDragUp(e){
		e.preventDefault();
		if(currentContext.currentIndex != currentContext.nextIndex){
			currentContext.nextItem.classList.add('shadow');
			currentContext.nextItem.classList.remove('animatedCard');
			currentContext.currentItem.classList.removeMany('animatedCard');
			currentContext.currentItem.classList.addMany('shadow');
			currentContext.direction = e.gesture.direction;
			goFront(currentContext.nextItem, (viewportHeight + e.gesture.deltaY), 0.9, 1, viewportHeight);
			goBack(currentContext.currentItem, e.gesture.deltaY, 0.5, 1, viewportHeight);
			currentContext.offset = Math.abs(e.gesture.deltaY);
		}
	}

	function onRelease(e){
		e.preventDefault();
		//up means next
		if(currentContext.direction == 'up'){
			currentContext.direction = '';
			if(currentContext.currentIndex != currentContext.nextIndex){
				currentContext.currentItem.classList.add('animatedCard')
				currentContext.currentItem.classList.remove('shadow');
				currentContext.nextItem.classList.add('animatedCard');
				currentContext.nextItem.classList.remove('shadow');
				if(currentContext.offset > MIN_OFFSET) {
					dom.translateScale(currentContext.nextItem, 0, 1);
					dom.translateScale(currentContext.currentItem, -viewportHeight, 0.8);
					changeIndex(1);
					XyoPipe.publish('cardChanged');
				}else{
					dom.translateY(currentContext.nextItem, viewportHeight);
					dom.translateScale(currentContext.currentItem, 0, 1);
					dom.translateScale(currentContext.nextItem, viewportHeight, 0.8);
				}
				currentContext.offset = 0;
			}
		}else if(currentContext.direction == 'down'){
			currentContext.direction = '';
			if(currentContext.currentIndex != currentContext.prevIndex){
				currentContext.currentItem.classList.add('animatedCard');
				currentContext.currentItem.classList.remove('shadow');
				currentContext.prevItem.classList.add('animatedCard');
				currentContext.prevItem.classList.remove('shadow');
				if(currentContext.offset > MIN_OFFSET) {
					dom.translateScale(currentContext.prevItem, 0, 1);
					dom.translateScale(currentContext.currentItem, viewportHeight, 0.8);
					changeIndex(-1);
					XyoPipe.publish('cardChanged');
					
				}else{
					dom.translateScale(currentContext.currentItem, 0, 1);
					dom.translateScale(currentContext.prevItem, viewportHeight, 0.8);
				}
				currentContext.offset = 0;
			}
		}else if(currentContext.direction == 'right') {
			currentContext.direction = '';
			goViewBack();
		}else if(currentContext.direction == 'left') {

		}else if(currentContext.direction == 'hold') {

		}

	}

	function onTap(e){
		if(!currentContext.currentItem.classList.contains('not-draggable')) {
			currentContext.direction = e.type;
			var target = currentContext.currentItem.getAttribute('data-app-name'),
			that = this;
			if(target) {
				if(cachedResults[target]){
					dom.addTo(detailsWrapper, cachedResults[target]);
				}else{
					insertItems(getArrayOfObjects('appName', target), {target: target, container: detailsWrapper, title: target, type: 'details-card'});
				}
				currentContext = detailsContext;
				updateContext();
				detailsScreenOn();
				handleSliders(detailsWrapper.querySelectorAll('.screenshot-slider'), true);
				Hammer(detailsWrapper.querySelectorAll('.go-back-button')[0], opts).on('tap', goViewBack);
			}
		}
	}

	function onOrientationChange(event){
		var alpha = event.alpha,
	    	beta = event.beta/2,
	    	gamma = event.gamma/2,
	    	globe = dom.getEl('.globe')[0],
	    	marker1 = dom.getEl('.marker')[0],
	    	marker2 = dom.getEl('.marker')[1],
	    	star1 = dom.getEl('.star-sky.first')[0],
	    	star2 = dom.getEl('.star-sky.second')[0];

	    dom.changeBgPosX(globe, -120 - gamma, -115 + beta);
	    dom.translateXY(marker1, -gamma, beta);
	    dom.translateXY(marker2, -gamma, beta);
	    dom.translateXY(star1, gamma/2, beta);
	    dom.translateXY(star2, gamma/2, beta);
	}

	function targetAppAnchorOnClick(e) {
		e.preventDefault();
		e.stopPropagation();
		var target = this.getAttribute('data-target-app'),
			that = this;
		if(target) {
			if(cachedResults[target]){
				dom.addTo(detailsWrapper, cachedResults[target]);
			}else{
				insertItems(getArrayOfObjects('appName', target), {target: target, container: detailsWrapper, title: target});
			}
			detailsScreenOn();
			handleSliders(detailsWrapper.querySelectorAll('.screenshot-slider'), true);
			Hammer(detailsWrapper.querySelectorAll('.go-back-button')[0], opts).on('tap', goViewBack);
		}
	}

	function targetAnchorOnClick(e) {
		e.preventDefault();
		e.stopPropagation();
		var target = this.getAttribute('data-target'),
			interest = this.getAttribute('data-interestname'),
			that = this;
		if(target) {
			streamOff();
			setTimeout(function(){
				that.classList.add('loading');
				currentInterest = interest ? interest : currentInterest;

				if(cachedResults[target]){
					dom.addTo(streamWrapper, cachedResults[target]);
				}else{
					insertItems(getArrayOfObjects('target', target), {target: target, container: streamWrapper});
				}
				
				updateContext();
				streamOn();
				that.classList.remove('loading');

			}, 550);
		}
	}

	/*
	functions responsible for updating variables and listeners
	 */

	function updateContext() {
		currentContext.cards = currentContext.wrapper.querySelectorAll('.card');
		currentContext.sliders = currentContext.wrapper.querySelectorAll('.screenshot-slider');
		currentContext.bullets = currentContext.wrapper.querySelectorAll('.bullets');
		currentContext.cardsLength = currentContext.cards.length;
		currentContext.offset = 0;
		currentContext.currentIndex = 0;
		currentContext.prevIndex = 0;
		currentContext.nextIndex = 0,
		currentContext.slidersCollection = [];
		calculateCards();
		currentContext.cards[0].classList.add('animatedCard');
		arrangeCards();
		prepareTargetAnchors();
		prepareTargetAppAnchors();

		window.addEventListener('deviceorientation', onOrientationChange, false);

		dom.applyToAll(dom.getEl('.go-back-button'), function(el){
			Hammer(el, opts).on('tap', goViewBack);
		});
	}

	function prepareHomescreen() {
		dom.addTo(homeWrapper, prepareTemplate('home-shelf', homeContent));
		books = homeWrapper.querySelectorAll('.book');
		updateContext();
		calculateCards();
		arrangeCards();

		dom.applyToAll(books, function(el) {
			Hammer(el, opts).on('tap', bookOnClick);
		});

		Hammer(dom.getEl('#search-button')[0], opts).on('tap', showSearchPanel);
		Hammer(dom.getEl('#cancel-search')[0], opts).on('tap', closeSearchPanel);
	}

	function prepareTargetAnchors() {
		var targetAnchors = streamWrapper.querySelectorAll('[data-target]');

		dom.applyToAll(targetAnchors, function(el) {
			Hammer(el, opts).on('tap', targetAnchorOnClick);
		});
	}

	function prepareTargetAppAnchors() {
		var targetAnchors = streamWrapper.querySelectorAll('[data-target-app]');

		dom.applyToAll(targetAnchors, function(el) {
			Hammer(el, opts).on('tap', targetAppAnchorOnClick);
		});
	}
	
	/*
	functions responsible for transitioning between streams/views
	 */

	function switchToStream() {
		streamWrapper.style.display = 'block';

		setTimeout(function(){
			document.body.classList.add('stream-on');
		}, 1);

		setTimeout(function(){
			homeWrapper.style.display = 'none';
		}, 510);

		setTimeout(function(){
			document.body.classList.add('backAnimation');
		}, 620);
	}

	function streamOff(callback) {
		document.body.classList.add('stream-off');

		setTimeout(function(){
			streamWrapper.style.display = 'none';
			if(callback) callback();
			document.body.classList.removeMany('stream-on stream-off');
		},550);
	}

	function streamOn(callback) {
		streamWrapper.style.display = 'block';

		setTimeout(function(){
			document.body.classList.add('stream-on');
		},1);

		setTimeout(function(){
			document.body.classList.add('backAnimation');
			if(callback) callback();
		},550);
	}

	function detailsScreenOn() {
		detailsWrapper.style.display = 'block';

		setTimeout(function(){
			document.body.classList.add('detailsOn');
		}, 1);

		setTimeout(function(){
			streamWrapper.style.display = 'none';
		}, 550);

		inDetails = true;
	}

	function detailsScreenOff() {
		streamWrapper.style.display = 'block';

		setTimeout(function(){
			document.body.classList.add('detailsOff');
		}, 1);

		setTimeout(function(){
			detailsWrapper.style.display = 'none';
			document.body.classList.removeMany('detailsOn detailsOff');
		}, 550);
		
		inDetails = false;
	}

	function switchToHome() {

		homeWrapper.style.display = 'block';

		setTimeout(function(){
			document.body.classList.remove('stream-on');
		},1);

		setTimeout(function(){
			streamWrapper.style.display = 'none';
		}, 510);

		setTimeout(function(){
			document.body.classList.remove('backAnimation');
			dom.clearEl(streamWrapper);
		}, 620);
	}

	function goViewBack() {
		//e.stopPropagation();

		if(inDetails){
			detailsScreenOff();
			currentContext = streamContext;
		}else{
			switchToHome();
			currentContext = homeContext;
		}
	}

	/*
	functions responsible for operations on templates
	 */

	function getArrayOfObjects(key, value) {
		var arr = [];

		protoContent.forEach(function(item, index) {
			if(item[key] === value) arr.push(item);
		});

		return arr;
	}

	function insertItems(collection, opts) {
		var defaults = {
				target: '',
				title: currentInterest,
				container: streamWrapper,
				type: ''
			},
			content = '';

		opts = extend(defaults, opts);
		dom.clearEl(opts.container);
		content += prepareTemplate('cards-nav', {title: opts.title});

		collection.forEach(function(item, index) {
			var type = opts.type != '' ? opts.type : item.type;
			content += prepareTemplate(type, item);
		});

		if(opts.target) cachedResults[opts.target] = content;
		dom.addTo(opts.container, content);
	}

	function insert(collection, target, container) {
		var content = '';

		collection.forEach(function(item, index) {
			content += prepareTemplate('details-card', item);
		});

		if(target) cachedResults[target] = content;
		dom.addTo(container, content);
	}

	function harvestTemplates() {	
		templateIds.forEach(function(item, index) {
			templates[item] = dom.getEl('#' + item)[0].innerHTML;
		});
	}

	function getTemplate(name) {
		return templates[name];
	}

	function prepareTemplate(name, item) {
		var template = Handlebars.compile(getTemplate(name));
		return template(item);
	}

	function arrangeCards(){
		currentContext.cards.forEach(function(item, index){
			if(index > 0) dom.translateY(item, viewportHeight);
		});
	}

	function changeIndex(val) {
		var calculated = currentContext.currentIndex + val;
		if(calculated < 0) {
			currentContext.currentIndex = 0;
		}else if(calculated > currentContext.cardsLength - 1){
			currentContext.currentIndex = cardsLength - 1;
		}else{
			currentContext.currentIndex = calculated;
		}
		calculateCards();
	}

	function calculateCards () {
		currentContext.prevIndex = (currentContext.currentIndex > 0) ? currentContext.currentIndex - 1 : 0;
		currentContext.nextIndex = (currentContext.currentIndex < currentContext.cardsLength - 1 ) ? currentContext.currentIndex + 1 : currentContext.cardsLength - 1;
		currentContext.currentItem = currentContext.cards[currentContext.currentIndex];
		currentContext.prevItem = currentContext.cards[currentContext.prevIndex];
		currentContext.nextItem = currentContext.cards[currentContext.nextIndex];
	}

	function extend(a, b){
	    for(var key in b)
	        if(b.hasOwnProperty(key))
	            a[key] = b[key];
	    return a;
	}

	function changeOpacity(element, offset, min, max, viewportHeight) {
		var range = max - min,
			opacity = min - (range/viewportHeight * offset);
		setOpacity(element, opacity);
	}

	function setOpacity(el, val) {
		el.style.opacity = val.toString();
	}

	function goFront(element, offset, minScale, maxScale, viewportSize){
		var range = maxScale - minScale,
			step = maxScale - (range/viewportSize * offset);
		dom.translateScale(element, offset, step);
	}

	function goBack(element, offset, minScale, maxScale, viewportSize){
		var range = maxScale - minScale,
			step = maxScale + (range/viewportSize * offset),
			calculatedOffset = offset/3;
		dom.translateScale(element, calculatedOffset, step);
	}

	function goBackToFront(element, offset, minScale, maxScale, viewportSize){
		var range = maxScale - minScale,
			step = minScale + (range/viewportSize * offset),
			calculatedOffset = -viewportSize + offset/3;
		dom.translateScale(element, calculatedOffset, step);
	}

	function handleSliders(collection){
		collection.forEach(function(el, index){
			var slider;
			detailsSlider = new Swipe(el, {
				continuous: false,
				disableScroll: false,
				stopPropagation: true,
				callback: function(index, elem) {
					XyoPipe.publish('sliderMove');
				}
			});
			XyoPipe.publish('sliderMove');
		});
	}

	function setMoviesHeight(container) {
		var movies = container.querySelectorAll('.movie');

		movies.forEach(function(el, index){
			var parentH = el.parentNode.offsetHeight,
				descH = el.parentNode.querySelectorAll('.description')[0].offsetHeight;
			el.style.height = parentH - descH + 'px';
		});
	}

	function showSearchPanel() {
		searchBox.style.display = 'block';
		dom.clearEl(searchResult);
		searchBar.value = '';

		setTimeout(function(){
			document.body.classList.add('search-on');
		}, 100);

		setTimeout(function(){
			document.body.classList.add('blurry');
		}, 700);
	}

	function closeSearchPanel() {
		document.body.classList.remove('blurry');
		searchBar.blur();

		setTimeout(function(){
			document.body.classList.remove('search-on');
		}, 30);

		setTimeout(function(){
			searchBox.style.display = 'none';
		}, 650);
	}

	function searchApps(val) {
		var results = [];
		val = val.toLowerCase();

		searchContent.forEach(function(el, index) {
			if((el.name.toLowerCase()).indexOf(val) > -1) {
				results.push(el);
			}
		});

		return {results: results};
	}

	function processSearch(e) {
		var result = null;

		if(this.value != '') {
			result = searchApps(this.value);
			if(result.results.length) {
				searchResults.innerHTML = prepareTemplate('result-template', result);
				addListenersToResults();
			}else{
				dom.clearEl(searchResults);
			}
		}else {
			dom.clearEl(searchResults);
		}
	}

	function addListenersToResults(){
		var results = searchResults.children;

		results.forEach(function(el, index){
			Hammer(el, opts).on('tap', function(e){
				e.preventDefault();
				var target = this.getAttribute('data-target');
				if(target) {
					currentInterest = this.getAttribute('data-interestname');
					insertItems(getArrayOfObjects('target', {target: target, container: streamWrapper}));
					closeSearchPanel();

					setTimeout(function(){
						switchToStream();
						updateContext();
					}, 500);
				}
			});
		});
	}
	
}();


