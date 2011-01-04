/*!
 * Strike Mobile v1.1
 * http://www.zenexity.com/
 *
 * Date: Tue Dec 28 17:01:02 2010 +0100
 */
(function( window, undefined ) {

// Use the correct document accordingly with window argument (sandbox)
var document = window.document;

/*
	Base.js, version 1.1a
	Copyright 2006-2009, Dean Edwards
	License: http://www.opensource.org/licenses/mit-license.php
*/

var Base=function(){};Base.extend=function(b,e){var f=Base.prototype.extend;Base._prototyping=true;var d=new this;f.call(d,b);d.base=function(){};delete Base._prototyping;var c=d.constructor;var a=d.constructor=function(){if(!Base._prototyping){if(this._constructing||this.constructor==a){this._constructing=true;c.apply(this,arguments);delete this._constructing}else{if(arguments[0]!=null){return(arguments[0].extend||f).call(arguments[0],d)}}}};a.ancestor=this;a.extend=this.extend;a.forEach=this.forEach;a.implement=this.implement;a.prototype=d;a.toString=this.toString;a.valueOf=function(g){return(g=="object")?a:c.valueOf()};f.call(a,e);if(typeof a.init=="function"){a.init()}return a};Base.prototype={extend:function(b,h){if(arguments.length>1){var e=this[b];if(e&&(typeof h=="function")&&(!e.valueOf||e.valueOf()!=h.valueOf())&&/\bbase\b/.test(h)){var a=h.valueOf();h=function(){var k=this.base||Base.prototype.base;this.base=e;var i=a.apply(this,arguments);this.base=k;return i};h.valueOf=function(i){return(i=="object")?h:a};h.toString=Base.toString}this[b]=h}else{if(b){var g=Base.prototype.extend;if(!Base._prototyping&&typeof this!="function"){g=this.extend||g}var d={toSource:null};var f=["constructor","toString","valueOf"];var c=Base._prototyping?0:1;while(j=f[c++]){if(b[j]!=d[j]){g.call(this,j,b[j])}}for(var j in b){if(!d[j]){g.call(this,j,b[j])}}}}return this}};Base=Base.extend({constructor:function(){this.extend(arguments[0])}},{ancestor:Object,version:"1.1",forEach:function(a,d,c){for(var b in a){if(this.prototype[b]===undefined){d.call(c,a[b],b,a)}}},implement:function(){for(var a=0;a<arguments.length;a++){if(typeof arguments[a]=="function"){arguments[a](this.prototype)}else{this.prototype.extend(arguments[a])}}return this},toString:function(){return String(this.valueOf())}});/**
 * 
 * Find more about the scrolling function at
 * http://cubiq.org/iscroll
 *
 * Copyright (c) 2009 Matteo Spinelli, http://cubiq.org/
 * Released under MIT license
 * http://cubiq.org/dropbox/mit-license.txt
 * 
 * Version 3.5.1 - Last updated: 2010.07.30
 * 
 */

(function(){
function iScroll (el, options) {
	var that = this;
	that.element = typeof el == 'object' ? el : document.getElementById(el);
	that.wrapper = that.element.parentNode;

	that.element.style.webkitTransitionProperty = '-webkit-transform';
	that.element.style.webkitTransitionTimingFunction = 'cubic-bezier(0,0,0.25,1)';
	that.element.style.webkitTransitionDuration = '0';
	that.element.style.webkitTransform = translateOpen + '0,0' + translateClose;

	// Default options
	that.options = {
		bounce: has3d,
		momentum: has3d,
		checkDOMChanges: true,
		topOnDOMChanges: false,
		hScrollbar: has3d,
		vScrollbar: has3d,
		fadeScrollbar: isIphone || isIpad || !isTouch,
		shrinkScrollbar: isIphone || isIpad,
		desktopCompatibility: false,
		overflow: 'auto'
	};
	
	// User defined options
	if (typeof options == 'object') {
		for (var i in options) {
			that.options[i] = options[i];
		}
	}
	
	if (that.options.desktopCompatibility) {
		that.options.overflow = 'hidden';
	}
	
	that.wrapper.style.overflow = that.options.overflow;
	
	that.refresh();

	window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', that, false);

	if (isTouch || that.options.desktopCompatibility) {
		that.element.addEventListener(START_EVENT, that, false);
		that.element.addEventListener(MOVE_EVENT, that, false);
		that.element.addEventListener(END_EVENT, that, false);
	}
	
	if (that.options.checkDOMChanges) {
		that.element.addEventListener('DOMSubtreeModified', that, false);
	}
	
	if (!isTouch) {
		that.element.addEventListener('click', that, true);
	}
}

iScroll.prototype = {
	x: 0,
	y: 0,
	dist: 0,

	handleEvent: function (e) {
		var that = this;
		
		switch (e.type) {
			case 'click':
				if (!e._fake) {
					e.stopPropagation();
				}
				break;
			case START_EVENT:
				that.touchStart(e);
				break;
			case MOVE_EVENT:
				that.touchMove(e);
				break;
			case END_EVENT:
				that.touchEnd(e);
				break;
			case 'webkitTransitionEnd':
				that.transitionEnd(e);
				break;
			case 'orientationchange':
			case 'resize':
				that.refresh();
				break;
			case 'DOMSubtreeModified':
				that.onDOMModified(e);
				break;
		}
	},
	
	onDOMModified: function (e) {
		var that = this;
		
		that.refresh();
		
		if (that.options.topOnDOMChanges && (that.x!=0 || that.y!=0)) {
			that.scrollTo(0,0,'0');
		}
	},

	refresh: function () {
		var that = this,
			resetX = this.x, resetY = this.y;
		
		that.scrollWidth = that.wrapper.clientWidth;
		that.scrollHeight = that.wrapper.clientHeight;
		that.scrollerWidth = that.element.offsetWidth;
		that.scrollerHeight = that.element.offsetHeight;
		that.maxScrollX = that.scrollWidth - that.scrollerWidth;
		that.maxScrollY = that.scrollHeight - that.scrollerHeight;

		if (that.scrollX) {
			if (that.maxScrollX >= 0) {
				resetX = 0;
			} else if (that.x < that.maxScrollX) {
				resetX = that.maxScrollX;
			}
		}
		if (that.scrollY) {
			if (that.maxScrollY >= 0) {
				resetY = 0;
			} else if (that.y < that.maxScrollY) {
				resetY = that.maxScrollY;
			}
		}
		if (resetX!=that.x || resetY!=that.y) {
			that.setTransitionTime('0');
			that.setPosition(resetX, resetY, true);
		}

		that.scrollX = that.scrollerWidth > that.scrollWidth;
		that.scrollY = !that.scrollX || that.scrollerHeight > that.scrollHeight;

		// Update horizontal scrollbar
		if (that.options.hScrollbar && that.scrollX) {
			that.scrollBarX = that.scrollBarX || new scrollbar('horizontal', that.wrapper, that.options.fadeScrollbar, that.options.shrinkScrollbar);
			that.scrollBarX.init(that.scrollWidth, that.scrollerWidth);
		} else if (that.scrollBarX) {
			that.scrollBarX = that.scrollBarX.remove();
		}

		// Update vertical scrollbar
		if (that.options.vScrollbar && that.scrollY && that.scrollerHeight > that.scrollHeight) {
			that.scrollBarY = that.scrollBarY || new scrollbar('vertical', that.wrapper, that.options.fadeScrollbar, that.options.shrinkScrollbar);
			that.scrollBarY.init(that.scrollHeight, that.scrollerHeight);
		} else if (that.scrollBarY) {
			that.scrollBarY = that.scrollBarY.remove();
		}
	},

	setPosition: function (x, y, hideScrollBars) {
		var that = this;
		
		that.x = x;
		that.y = y;

		that.element.style.webkitTransform = translateOpen + that.x + 'px,' + that.y + 'px' + translateClose;

		// Move the scrollbars
		if (!hideScrollBars) {
			if (that.scrollBarX) {
				that.scrollBarX.setPosition(that.x);
			}
			if (that.scrollBarY) {
				that.scrollBarY.setPosition(that.y);
			}
		}
	},
	
	setTransitionTime: function(time) {
		var that = this;
		
		time = time || '0';
		that.element.style.webkitTransitionDuration = time;
		
		if (that.scrollBarX) {
			that.scrollBarX.bar.style.webkitTransitionDuration = time;
			that.scrollBarX.wrapper.style.webkitTransitionDuration = has3d && that.options.fadeScrollbar ? '300ms' : '0';
		}
		if (that.scrollBarY) {
			that.scrollBarY.bar.style.webkitTransitionDuration = time;
			that.scrollBarY.wrapper.style.webkitTransitionDuration = has3d && that.options.fadeScrollbar ? '300ms' : '0';
		}
	},
		
	touchStart: function(e) {
		var that = this,
			matrix;

		that.scrolling = true;		// This is probably not needed, but may be useful if iScroll is used in conjuction with other frameworks
		
		e.preventDefault();
		e.stopPropagation();

		that.moved = false;
		that.dist = 0;

		that.setTransitionTime('0');

		// Check if the scroller is really where it should be
		if (that.options.momentum) {
			matrix = new WebKitCSSMatrix(window.getComputedStyle(that.element).webkitTransform);
			if (matrix.e != that.x || matrix.f != that.y) {
				that.element.removeEventListener('webkitTransitionEnd', that, false);
				that.setPosition(matrix.e, matrix.f);
				that.moved = true;
			}
		}

		that.touchStartX = isTouch ? e.changedTouches[0].pageX : e.pageX;
		that.scrollStartX = that.x;

		that.touchStartY = isTouch ? e.changedTouches[0].pageY : e.pageY;
		that.scrollStartY = that.y;

		that.scrollStartTime = e.timeStamp;
	},
	
	touchMove: function(e) {
		var that = this,
			pageX = isTouch ? e.changedTouches[0].pageX : e.pageX,
			pageY = isTouch ? e.changedTouches[0].pageY : e.pageY,
			leftDelta = that.scrollX ? pageX - that.touchStartX : 0,
			topDelta = that.scrollY ? pageY - that.touchStartY : 0,
			newX = that.x + leftDelta,
			newY = that.y + topDelta;

		if (!that.scrolling) {
			return;
		}

//		e.preventDefault();
//		e.stopPropagation();

		that.dist+= Math.abs(that.touchStartX - pageX) + Math.abs(that.touchStartY - pageY);

		that.touchStartX = pageX;
		that.touchStartY = pageY;

		// Slow down if outside of the boundaries
		if (newX > 0 || newX < that.maxScrollX) { 
			newX = that.options.bounce ? Math.round(that.x + leftDelta / 3) : newX >= 0 ? 0 : that.maxScrollX;
		}
		if (newY > 0 || newY < that.maxScrollY) { 
			newY = that.options.bounce ? Math.round(that.y + topDelta / 3) : newY >= 0 ? 0 : that.maxScrollY;
		}

		if (that.dist > 5) {			// 5 pixels threshold is needed on Android, but also on iPhone looks more natural
			that.setPosition(newX, newY);
			that.moved = true;
		}
	},
	
	touchEnd: function(e) {
		var that = this,
			time = e.timeStamp - that.scrollStartTime,
			target, ev,
			momentumX, momentumY, newDuration, newPositionX, newPositionY;

		if (!that.scrolling) {
			return;
		}

		that.scrolling = false;
		
		if (!that.moved) {
			that.resetPosition();

			// Find the last touched element
			target = isTouch ? e.changedTouches[0].target : e.target;
			while (target.nodeType != 1) {
				target = target.parentNode;
			}

			// Create the fake event
			ev = document.createEvent('Event');
			ev.initEvent('focus', true, true);
			target.dispatchEvent(ev);
	
			ev = document.createEvent('MouseEvents');
			ev.initMouseEvent("click", true, true, e.view, 1,
				target.screenX, target.screenY, target.clientX, target.clientY,
				e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
				0, null);
			ev._fake = true;
			target.dispatchEvent(ev);
			
			return;
		}

		if (!that.options.momentum || time > 250) {			// Prevent slingshot effetct
			that.resetPosition();
			return;
		}

		momentumX = that.scrollX === true
			? that.momentum(that.x - that.scrollStartX,
							time,
							that.options.bounce ? -that.x + that.scrollWidth/5 : -that.x,
							that.options.bounce ? that.x + that.scrollerWidth - that.scrollWidth + that.scrollWidth/5 : that.x + that.scrollerWidth - that.scrollWidth)
			: { dist: 0, time: 0 };

		momentumY = that.scrollY === true
			? that.momentum(that.y - that.scrollStartY,
							time,
							that.options.bounce ? -that.y + that.scrollHeight/5 : -that.y,
							that.options.bounce ? (that.maxScrollY < 0 ? that.y + that.scrollerHeight - that.scrollHeight : 0) + that.scrollHeight/5 : that.y + that.scrollerHeight - that.scrollHeight)
			: { dist: 0, time: 0 };

		if (!momentumX.dist && !momentumY.dist) {
			that.resetPosition();
			return;
		}

		newDuration = Math.max(Math.max(momentumX.time, momentumY.time), 1);		// The minimum animation length must be 1ms
		newPositionX = that.x + momentumX.dist;
		newPositionY = that.y + momentumY.dist;

		that.scrollTo(newPositionX, newPositionY, newDuration + 'ms');
	},
	
	transitionEnd: function () {
		this.element.removeEventListener('webkitTransitionEnd', this, false);
		this.resetPosition();
	},

	resetPosition: function (time) {
		var that = this,
			resetX = that.x,
		 	resetY = that.y,
			that = that,
			time = time || '500ms';

		if (that.x >= 0) {
			resetX = 0;
		} else if (that.x < that.maxScrollX) {
			resetX = that.maxScrollX;
		}

		if (that.y >= 0 || that.maxScrollY > 0) {
			resetY = 0;
		} else if (that.y < that.maxScrollY) {
			resetY = that.maxScrollY;
		}

		if (resetX != that.x || resetY != that.y) {
			that.scrollTo(resetX, resetY, time);
		} else if (that.scrollBarX || that.scrollBarY) {
			// Hide the scrollbars
			if (that.scrollBarX) {
				that.scrollBarX.hide();
			}
			if (that.scrollBarY) {
				that.scrollBarY.hide();
			}
		}
	},

	scrollTo: function (destX, destY, runtime) {
		var that = this;
		
		that.setTransitionTime(runtime || '450ms');
		that.setPosition(destX, destY);

		if (runtime==='0' || runtime=='0s' || runtime=='0ms') {
			that.resetPosition();
		} else {
			that.element.addEventListener('webkitTransitionEnd', that, false);	// At the end of the transition check if we are still inside of the boundaries
		}
	},
	
	scrollToElement: function (el, runtime) {
		el = typeof el == 'object' ? el : this.element.querySelector(el);

		if (!el) {
			return;
		}

		var that = this,
			x = that.scrollX ? -el.offsetLeft : 0,
			y = that.scrollY ? -el.offsetTop : 0;

		if (x >= 0) {
			x = 0;
		} else if (x < that.maxScrollX) {
			x = that.maxScrollX;
		}

		if (y >= 0) {
			y = 0;
		} else if (y < that.maxScrollY) {
			y = that.maxScrollY;
		}

		that.scrollTo(x, y, runtime);
	},

	momentum: function (dist, time, maxDistUpper, maxDistLower) {
		var friction = 2.5,
			deceleration = 1.2,
			speed = Math.abs(dist) / time * 1000,
			newDist = speed * speed / friction / 1000,
			newTime = 0;

		// Proportinally reduce speed if we are outside of the boundaries 
		if (dist > 0 && newDist > maxDistUpper) {
			speed = speed * maxDistUpper / newDist / friction;
			newDist = maxDistUpper;
		} else if (dist < 0 && newDist > maxDistLower) {
			speed = speed * maxDistLower / newDist / friction;
			newDist = maxDistLower;
		}
		
		newDist = newDist * (dist < 0 ? -1 : 1);
		newTime = speed / deceleration;

		return { dist: Math.round(newDist), time: Math.round(newTime) };
	},
	
	destroy: function (full) {
		var that = this;
		
		window.removeEventListener('orientationchange', that, false);
		window.removeEventListener('resize', that, false);
		that.element.removeEventListener(START_EVENT, that, false);
		that.element.removeEventListener(MOVE_EVENT, that, false);
		that.element.removeEventListener(END_EVENT, that, false);
		that.element.removeEventListener('DOMSubtreeModified', that, false);
		that.element.removeEventListener('click', that, true);
		that.element.removeEventListener('webkitTransitionEnd', that, false);

		if (that.scrollBarX) {
			that.scrollBarX = that.scrollBarX.remove();
		}

		if (that.scrollBarY) {
			that.scrollBarY = that.scrollBarY.remove();
		}
		
		if (full) {
			that.wrapper.parentNode.removeChild(that.wrapper);
		}
		
		return null;
	}
};

var scrollbar = function (dir, wrapper, fade, shrink) {
	var that = this;
	
	that.dir = dir;
	that.fade = fade;
	that.shrink = shrink;
	that.uid = ++uid;

	// Create main scrollbar
	that.bar = document.createElement('div');

	var style = 'position:absolute;top:0;left:0;-webkit-transition-timing-function:cubic-bezier(0,0,0.25,1);pointer-events:none;-webkit-transition-duration:0;-webkit-transition-delay:0;-webkit-transition-property:-webkit-transform;z-index:10;background:rgba(0,0,0,0.5);' +
		'-webkit-transform:' + translateOpen + '0,0' + translateClose + ';' +
		(dir == 'horizontal' ? '-webkit-border-radius:3px 2px;min-width:6px;min-height:5px' : '-webkit-border-radius:2px 3px;min-width:5px;min-height:6px'),
		size, ctx;

	that.bar.setAttribute('style', style);

	// Create scrollbar wrapper
	that.wrapper = document.createElement('div');
	style = '-webkit-mask:-webkit-canvas(scrollbar' + that.uid + that.dir + ');position:absolute;z-index:10;pointer-events:none;overflow:hidden;opacity:0;-webkit-transition-duration:' + (fade ? '300ms' : '0') + ';-webkit-transition-delay:0;-webkit-transition-property:opacity;' +
		(that.dir == 'horizontal' ? 'bottom:2px;left:1px;right:7px;height:5px' : 'top:1px;right:2px;bottom:7px;width:5px;');
	that.wrapper.setAttribute('style', style);

	// Add scrollbar to the DOM
	that.wrapper.appendChild(that.bar);
	wrapper.appendChild(that.wrapper);
}

scrollbar.prototype = {
	init: function (scroll, size) {
		var that = this,
			ctx, sbSize;

		// Create scrollbar mask
		if (that.dir == 'horizontal') {
			sbSize = that.wrapper.offsetWidth;
			ctx = document.getCSSCanvasContext("2d", "scrollbar" + that.uid + that.dir, sbSize, 5);
			ctx.fillStyle = "rgb(0,0,0)";
			ctx.beginPath();
			ctx.arc(2.5, 2.5, 2.5, Math.PI/2, -Math.PI/2, false);
			ctx.lineTo(sbSize-2.5, 0);
			ctx.arc(sbSize-2.5, 2.5, 2.5, -Math.PI/2, Math.PI/2, false);
			ctx.closePath();
			ctx.fill();
		} else {
			sbSize = that.wrapper.offsetHeight;
			ctx = document.getCSSCanvasContext("2d", "scrollbar" + that.uid + that.dir, 5, sbSize);
			ctx.fillStyle = "rgb(0,0,0)";
			ctx.beginPath();
			ctx.arc(2.5, 2.5, 2.5, Math.PI, 0, false);
			ctx.lineTo(5, sbSize-2.5);
			ctx.arc(2.5, sbSize-2.5, 2.5, 0, Math.PI, false);
			ctx.closePath();
			ctx.fill();
		}

		that.maxSize = that.dir == 'horizontal' ? that.wrapper.clientWidth : that.wrapper.clientHeight;
		that.size = Math.round(that.maxSize * that.maxSize / size);
		that.maxScroll = that.maxSize - that.size;
		that.toWrapperProp = that.maxScroll / (scroll - size);
		that.bar.style[that.dir == 'horizontal' ? 'width' : 'height'] = that.size + 'px';
	},
	
	setPosition: function (pos, hidden) {
		var that = this;
		
		if (!hidden && that.wrapper.style.opacity != '1') {
			that.show();
		}

		pos = that.toWrapperProp * pos;
		
		if (pos < 0) {
			pos = that.shrink ? pos + pos*3 : 0;
			if (that.size + pos < 5) {
				pos = -that.size+5;
			}
		} else if (pos > that.maxScroll) {
			pos = that.shrink ? pos + (pos-that.maxScroll)*3 : that.maxScroll;
			if (that.size + that.maxScroll - pos < 5) {
				pos = that.size + that.maxScroll - 5;
			}
		}

		pos = that.dir == 'horizontal'
			? translateOpen + Math.round(pos) + 'px,0' + translateClose
			: translateOpen + '0,' + Math.round(pos) + 'px' + translateClose;

		that.bar.style.webkitTransform = pos;
	},

	show: function () {
		if (has3d) {
			this.wrapper.style.webkitTransitionDelay = '0';
		}
		this.wrapper.style.opacity = '1';
	},

	hide: function () {
		if (has3d) {
			this.wrapper.style.webkitTransitionDelay = '200ms';
		}
		this.wrapper.style.opacity = '0';
	},
	
	remove: function () {
		this.wrapper.parentNode.removeChild(this.wrapper);
		return null;
	}
};

// Is translate3d compatible?
var has3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()),
	// Device sniffing
	isIphone = (/iphone/gi).test(navigator.appVersion),
	isIpad = (/ipad/gi).test(navigator.appVersion),
	isAndroid = (/android/gi).test(navigator.appVersion),
	isTouch = isIphone || isIpad || isAndroid,
	// Event sniffing
	START_EVENT = isTouch ? 'touchstart' : 'mousedown',
	MOVE_EVENT = isTouch ? 'touchmove' : 'mousemove',
	END_EVENT = isTouch ? 'touchend' : 'mouseup',
	// Translate3d helper
	translateOpen = 'translate' + (has3d ? '3d(' : '('),
	translateClose = has3d ? ',0)' : ')',
	// Unique ID
	uid = 0;

// Expose iScroll to the world
window.iScroll = iScroll;
})();// Strike$ - DOM helper
(function(){
    var root = this,
        previous$ = root.$,

        // ~~~~~~~~~~~~~~~~~~~~ Utils
        $ = function(selector, context){
            if (! $.is(selector, "string")){
                return selector;
            }
            var context = context || document,
                isId = /^[0-9a-zA-Z_\-\s]*\#[0-9a-zA-Z_\-]*$/.test(selector);

            return isId ? context.querySelector(selector) : context.querySelectorAll(selector);
        },

        // Runs a function over a selector - to encapsulate element selection rules.
        // First param in args array should be the selector (string or DOM node/s), 
        // followed by required arguments.
        mapElements = function(func, args){
            var element = $(args[0]),
                restOfArgs = Array().slice.call(args,1);
            if(!element) return null;
            // Grumble... window has a "length" property = # of iframes. Have to check for window
            if(!element.length || element === window ){
                return func.apply(this, [element].concat(restOfArgs));
            }
            else {
                return $.each(element, function(item){
                    mapElements(func, [item].concat(restOfArgs));
                });
            }
        };

    // Export Strike$ and $ to global scope.
    root.$ = root.Strike$ = $;
    $.VERSION = '0.2';
    $.noConflict = function(){
        root.$ = previous$;
        return this;
    };
    $.each = function(items, callback){
        items = $(items);
        for( var i = 0; i < items.length; i++){
            callback(items[i], i);
        }
    };
    $.map = function(items, func){
        var mapped = [];
        $.each( items, function(item, i){
            mapped.push(func(item,i));
        });
        return mapped;
    }
    $.is = function(o, type){
        type = String(type).toLowerCase();
        return  (type == "null" && o === null) ||
                (type == typeof o) ||
                (type == "object" && o === Object(o)) ||
                (type == "array" && Array.isArray && Array.isArray(o)) ||
                Object.prototype.toString.call(o).slice(8, -1).toLowerCase() == type;
    };
    
    // Class and styles
    $.hasClass = function(element, className){
        element = $(element);
        if(!element) return null;
        if(element.length) element = element[0];
        var elementClassName = element.className;
        return (elementClassName.length > 0 && (elementClassName == className ||
            new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
    };
    $.addClass = function(element, className) {
        var addClass = function(element, className){
            if (!$.hasClass(element, className)) element.className += (element.className ? ' ' : '') + className;
            return element;
        }
        return mapElements(addClass, arguments);
    };
    $.removeClass = function(element, className) {
        var removeClass = function(element, className){
            if(element.className && className){
               element.className = element.className.replace(new RegExp("\\b(" + className.replace(/\s+/g, "|") + ")\\b", "g"), " ").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
               return element;
            }
        }
        return mapElements(removeClass, arguments);
    };
    $.css = function(element, prop, value){
        var css = function(element, prop, value){
            if(value)
                element.style.setProperty(prop, value);
            else{
                return window.getComputedStyle(element, null)[prop];
            }
        }
        return mapElements(css, arguments);
    };
    $.show = function(element){
        return mapElements(function(element){
            element.style.display = "block";
        }, arguments);
    }
    $.hide = function(element){
        return mapElements(function(element){
            element.style.display = "none";
        }, arguments);        
    }
    // TODO: are these used, and why does width replace px but height does not?
    $.width = function(element){ return $.css(element,"width").replace('px',''); }
    $.height = function(element){ return $.css(element,"height"); }

    // Events
    $.on = function(element, event, handler, bubble) {
        if( !Strike.onMobile ){
            event = event == 'touchend' ? 'mouseup' : event;
            event = event == 'touchstart' ? 'mousedown' : event;
        }
        var eventAdd = function(element, event, handler, bubble){
            element.addEventListener(event, handler, bubble);
        }
        mapElements(eventAdd, arguments);
    };
    $.once = function(element, event, handler, bubble){
        var eventAdd = function(element, event, handler, bubble){
            $.on(element, event, function runOnceFunc(){
                this.removeEventListener(event, runOnceFunc, bubble)
                handler();                
            }, bubble);
        }
        mapElements(eventAdd, arguments);
    }

    // Ajax
    $.ajax = function(method, url, callback){
        var type = "json",
            error = function(e){ throw e },
            complete = function(){},
            params = method.params,
            async = method.async === undefined ? true : method.async

        if (method.constructor != String){
            type = (method.type || type).toLowerCase();
            url = method.url
            callback = method.success || callback;
            error = method.error || error;
            complete = method.complete || complete
            method = method.method || "GET";
        }

        var req = new XMLHttpRequest()
        req.open(method, url, async)
        req.setRequestHeader('Accept', type == "html" ? 'text/html' : 'text/json')
        req.onreadystatechange = function(){
            if (this.readyState == 4 && this.status == 200){
                try{
                    if (this.responseXML) callback(this.responseXML)
                    else {
                        var responseContent = type == "html" ? this.responseText : eval('('+this.responseText+')');
                        callback(responseContent);
                        complete();
                    }
                } catch (e){
                    console.log('cannot parse json because of '+e)
                    error(e)
                    complete();
                }
            }
            if (this.readyState == 4 && this.status != 200){
                error(this.status);
                complete();
            }
        }
        req.send(params)
    };
})();

// ~~~~~~~~~~~~~~~~~~~~ Strike
(function($){
    Strike = {
        commandQueue:[], /*TODO: used in native? */
        currentPage: null, /*TODO: how does this work in relation to the MVC breadcrumbs*/
        previousPage: null,

        currentPanel: null,
        currentOverlay: null,

        serverURL : document.location.protocol+'//'+document.location.host,
        onMobile : (/iphone|ipad|android/gi).test(navigator.userAgent),
        storage: window.localStorage,

        handlers : {}, /*TODO: used in native? */

        // Internationalisation 
        fallbackLanguage : 'en',
        browserLanguage : navigator.language.substring(0,2),
        
        messages : {},

        init: function(){
            cacheLog();
            // TODO: need to encapsulate as control
            this.bindScrollers();
        },
        template : function(selector, templateId, renderData){
            var elements = $(selector),
                htmlContent = Strike.tmpl(templateId, renderData);

            $.each( elements.length ? elements : [elements], function(item){
                item.innerHTML = htmlContent;
                fakeTouch(item);
            });
            return elements;
        },
        maps : function(query){
            window.open('http://maps.google.com?'+query)
        },
        locate: function(handler){
            Strike.handlers['locate'] = handler; /* TODO: used in native? */
            if (navigator.geolocation) {
                Strike.stopLocate()
                Strike.watchPosition = navigator.geolocation.watchPosition(function(position){
                    handler(position.coords)
                })
            }
        },
        stopLocate: function(){
            if (Strike.watchPosition) navigator.geolocation.clearWatch(Strike.watchPosition)
        },
        open : function(url){
            window.open(url);
        },

        reverseGeoCode : function(handler){
            this.handlers['reverseGeoCode'] = handler; /*TODO: used in native? */
        },
        lang: function(handler){
            // TODO: deprecate? - it just calls a function with a static string.
            handler(Strike.browserLanguage);
        },
        setMessages: function(messages, lang) {
            if(!messages[lang]) lang = Strike.fallbackLanguage;
            Strike.messages = messages[lang];
            $each('.i18n', function(el) {
                var id = el.id;
                var message = Strike.message(id);
                if(message) {
                    el.innerHTML = message;
                }
            });
        },
        message: function(key) {
            return Strike.messages[key];
        },
        onready :function(handler){
            onReadyHandlers.push(handler);
        },
        ready : function(){
            this.init();
            $.each(onReadyHandlers, function(handler){
                handler();
            });
        },
        onorientationchange: function(handler){
            onOrientationChangeHandlers.push(handler);
        },
        orientationChange : function( orientation ){
            $.each(onOrientationChangeHandlers, function(handler){
                handler( orientation );
            });
        },
        //~~~~~~~ UI ~~~~~~~//
        Transition : function( toPage, fromPage, options ){
            toPage = $(toPage);
            fromPage = $(fromPage);

            // Don't do a new transition if it's in progress
            if( $.hasClass( toPage, "current" ) ){ return; }

            options = options || {};
            options.type = options.type || "push";
            options.reverse = options.reverse || false;
            
            
            $.addClass( toPage, options.type + " in current" + ( options.reverse ? " reverse" : "" ) );
            $.addClass( fromPage, options.type + " out" + ( options.reverse ? " reverse" : "" ) );

            toPage.addEventListener("webkitAnimationEnd", function webAnimEnd(){
                $.removeClass(fromPage, "current " + options.type + " out");
                $.removeClass(toPage, options.type + " in" );
                if(options.reverse){
                    $.removeClass(toPage, "reverse");
                    $.removeClass(fromPage, "reverse");
                }
                this.removeEventListener("webkitAnimationEnd", webAnimEnd, false);
                if (options.callback) options.callback();
            }, false);
        },
        show: function(page, callback){ transition( 'show', 0.35, 'linear', false, page, null, callback ); },
        flip: function(page, callback){ transition( 'flip', 0.65, 'linear', false, page, null, callback ); },
        unflip: function(page, callback){ transition( 'flip', 0.65, 'linear', true, page, null, callback ); },
        next: function(page, callback){ transition( 'push', 0.35, 'ease', false, page, null, callback ); },
        prev: function(page, callback){ transition( 'push', 0.35, 'ease', true, page, null, callback ); },
        rotateRight: function(page, callback){ transition( 'cube', 0.55, 'ease', false, page, null, callback ); },
        rotateLeft: function(page, callback){ transition( 'cube', 0.55, 'ease', true, page, null, callback ); },
        fade: function(page, callback){ transition( 'fade', 0.35, 'linear', false, page, null, callback ); },
        swap: function(page, callback){ transition( 'swap', 0.55, 'linear', false, page, null, callback ); },

        reverseTransitions : {
            'rotateRight': 'rotateLeft',
            'rotateLeft': 'rotateRight',
            'prev': 'next',
            'next': 'prev',
            'show': 'show',
            'fade': 'fade',
            'flip': 'unflip'
        },
        // TODO: slideUp, slideDown
        back: function(){
            if(Strike.previousPage){
                Strike.prev(Strike.previousPage);
            }
        },
        rebindScroller: function(){
            var scroll = $(Strike.currentPage + " .scrollView");
            scroll.length && scroll[ 0 ].scroller && scroll[ 0 ].scroller.refresh();
        },
        bindScrollers: function(context){
            context = context ? context + " " : "";
            $.each(context + ".scrollView", function(item){
                // Attach scroller object to the DOM element
                // TODO: better way to determine contents? (because firstChild is a text node)
                var contents = item.firstChild.nextSibling;
                item.scroller = new iScroll( contents, { desktopCompatibility: !this.onMobile } );
            });
        },
        openPanel: function(page) {
            var transition = new Transition('slide', 0.35, 'ease');
            transition.direction = 'bottom-top';
            transition.perform($(page), $(Strike.currentPage), false);
            Strike.currentPanel = page;
        },
        closePanel: function() {
            var transition = new Transition('slide', 0.35, 'ease');
            transition.direction = 'bottom-top';
            transition.perform($(Strike.currentPage), $(Strike.currentPanel), true);
            setTimeout(function() {
                $(Strike.currentPanel).style.display = '';
                Strike.currentPanel = null;
            }, 500);
        },
        showOverlay: function(page, opacity) {
            var el = $(page);
            el.style.position = 'absolute';
            el.style.top = '0';
            el.style.left = '0';
            el.style.opacity = '0';
            el.style.zIndex = '1000';
            el.style.display = 'block';
            setTimeout(function() {
                el.style.webkitTransition = 'opacity .25s linear';
                el.style.opacity = opacity ? opacity : '1';
            }, 0);
            Strike.currentOverlay = page;
        },
        hideOverlay: function(now) {
            var el = $(Strike.currentOverlay);
            var onend = function() {
                el.style.webkitTransition = '';
                el.style.display = 'none';
                el.removeEventListener('webkitTransitionEnd', onend, false);
            };
            if(now) {
                el.style.display = 'none';
            } else {
                el.addEventListener('webkitTransitionEnd', onend, false);
            }
            el.style.opacity = '0';
        }
    }

    // Private properties and methods
    var root = this,
        onReadyHandlers = [],
        onOrientationChangeHandlers = [],
        cacheLog = function(){
            if (!Strike.onMobile){
                var cacheStatusValues = ['uncached','idle','checking', 'downloading', 'updateready', 'obsolete'],
                    cacheEvents = ['cached','checking','downloading','error','noupdate','obsolete','progress','updateready'];

                for(var i = 0; i < cacheEvents.length; i++){
                    window.applicationCache.addEventListener(cacheEvents[i], function(e){
                        var message = 'online: ' + (navigator.onLine) ? 'yes' : 'no';
                        message+= ', event: ' + e.type;
                        message+= ', status: ' + cacheStatusValues[cache.status];
                        if (e.type == 'error' && navigator.onLine) {
                            message+= ' (probably a syntax error in manifest)';
                        }
                        console.log(message);
                    }, false);
                }
            }
        },
        // Standard transitions
        transition = function( type, duration, easing, isReverse, toPage, fromPage, callback ){
            cleanPage(toPage);
            
            fromPage = fromPage || Strike.currentPage;
            Strike.previousPage = fromPage;
            var $toPage = $(toPage);
            Strike.Transition( $toPage, $(fromPage), { type: type, reverse: isReverse, callback : callback } );
            Strike.currentPage = toPage;

            // Rebind scrollers
            Strike.rebindScroller();
        },
        cleanPage = function(page) {
            // Clean lists
            $.each( $(page).querySelectorAll('.list li'), function(it) {
                $.removeClass(it, 'selected');
            });
        },
        touchStart = function(e) {
            var node = e.target,
		it = 0;
            // TODO: what?! it < 10??
            while(node != null && it < 10) {
                if(node.tagName) {
                    if($.hasClass(node, 'button') || $.hasClass(node, 'submit-button')) {
                        $.addClass(node, 'selected')
                        break;
                    }
                    if(node.tagName == 'LI' && $.hasClass(node.parentNode, 'list')) {
                        $.each(node.parentNode.querySelectorAll('li'), function(it) {
                            $.removeClass(it, 'selected');
                        });
                        $.addClass(node, 'selected')
                        e.preventDefault();
                        break;
                    }
                }
                it++;
                node = node.parentNode;
            }
        },
        touchEnd = function(e) {
            var node = e.target,
		it = 0;
            // TODO: what?! it < 10??
            while(node != null && it < 10) {
                if(node.className) {
                    if($.hasClass(node, 'button') || $.hasClass(node, 'submit-button')) {
                        $.removeClass(node, 'selected')
                        break;
                    }
                }
                it++;
                node = node.parentNode;
            }
        },
        fakeTouch = function(nodeElement){
            if ( Strike.onMobile || !nodeElement.hasChildNodes )return;
            $.each(nodeElement.childNodes, function(node){
                if (node.hasChildNodes()) fakeTouch(node)
                if (node.getAttribute){
                    var executable = node.getAttribute('ontouchstart');
                    if (node.getAttribute('ontouchend') != null) executable += ';'+node.getAttribute('ontouchend');
                    if (executable){
                        node.onclick = function(){eval(executable)}
                    }
                }
            })
        };

    // Page event setup
    $.on(window, "load", function(){
        fakeTouch(document);
        $.on(document.body, 'touchstart', touchStart);
        $.on(document.body, 'touchend', touchEnd);
        $.on(document.body, 'blur', function() { window.scrollTo(0, 0); }, true);
        Strike.ready();
    });

    $.on(window.applicationCache, 'updateready', function(){
        window.applicationCache.swapCache();
        console.log('swap cache has been called');
    });

    // Export Strike to global scope.
    root.Strike = Strike;

})( Strike$ );

(function(){
    // Simple JavaScript Templating
    // John Resig - http://ejohn.org/ - MIT Licensed
    
    // BUG: template name can not contain "-"s
    var cache = {};
    Strike.tmpl = function tmpl(str, data) {
        // Figure out if we're getting a template, or if we need to
        // _controllerDefs the template - and be sure to cache the result.
        var fn
        if (!/\W/.test(str)){
          try{
            if (!cache[str]){
              cache[str] = tmpl(document.getElementById(str).innerHTML)
            }
          }catch (error){console.log('error when rendering #'+str+' :: '+error.message)}
          fn = cache[str]
        } else {
          fn =
          // Generate a reusable function that will serve as a template
          // generator (and which will be cached).
        new Function("obj",
          "var p=[],print=function(){p.push.apply(p,arguments);};" +
          // Introduce the data as local variables using with(){}
          "with(obj){p.push('" +
          // Convert the template into pure JavaScript
        str.replace(/[\r\t\n]/g, " ")
        .replace(/'(?=[^%]*%>)/g,"\t")
        .split("'").join("\\'")
        .split("\t").join("'")
        .replace(/<%=(.+?)%>/g, "',$1,'")
        .split("<%").join("');")
        .split("%>").join("p.push('")
        + "');}return p.join('');");
        }
        // Provide some basic currying to the user
        return data ? fn(data) : fn;
    };
})();

// Aliases and extensions - DEPRECATED - TODO: DELETE!!!
/*
(function($){
    // Aliases (deprecated: will be deleted)
    var Lucky = Strike,
        $hasClass = $.hasClass
        $addClass = $.addClass
        $removeClass = $.removeClass
        $ajax = $.ajax
        onMobile = Strike.onMobile
        tmpl = Strike.tmpl;

    // Prototype extensions - probably shouldn't touch objects we don't own: will be deleted
    Array.prototype.each = NodeList.prototype.each = function(c) { $.each(this,c); };
    Element.prototype.width = function(){ $.width(this) };
    Element.prototype.height = function(){ $.height(this) };
    HTMLElement.prototype.css = function( prop, value ){ $.css(this, prop, value) };
    HTMLElement.prototype.on = function(e,handler){ $.on(this, e, handler) };
    HTMLElement.prototype.$ = $;
})(Strike$);
*/(function(){
    // Private variables
    var observers = {},
        breadcrumbs = [],
        currentState = {};
    
    // StrikeMan object
    var StrikeMan = {
        controllers: {},
        register: function(id, controller) {
            this.controllers[id] = controller
        },
        observe: function(type, handler) {
            if (observers[type] == null) {
                observers[type] = [];
            };
            observers[type].push(handler);
        },
        message: function(message) {
            var type = typeof(message) == 'string' ? message: message.type,
                controller,
                handlers;
                
            switch (type) {
                case 'event':
                    handlers = observers[message.eventType] || [];
                    for (var i = 0; i < handlers.length; i++) {
                        try {
                            handlers[i](message.data)
                        }
                        catch(error) {
                            console.log('error when executing handler for event ' + message.eventType, error)
                        }
                    }
                    break;

                case 'load':
                    controller = this.controllers[message.id];
                    currentState = {
                        transition: message.transition ? message.transition: 'show',
                        id: message.id,
                        label: controller ? controller.label : message.id,
                        data: message.data
                    }
                    
                    StrikeMan.trigger('strike-page-loading', message.data);
                    if(controller && controller.load){
                        controller.load(message.data);
                    }
                    else{
                        StrikeMan.message({type:'loaded', data:{}});
                    }
                    break;

                case 'loaded':
                    breadcrumbs.push(currentState);
                    StrikeMan.trigger('strike-page-loaded', currentState);
                    
                    // Do transition.
                    Strike[currentState.transition]('#' + currentState.id, function(){
                        // Fire loaded method on controller
                        controller = StrikeMan.controllers[currentState.id];
                        controller && controller.loaded && controller.loaded(message.data);
                    });
                    break;
                    
                case 'error':
                    StrikeMan.trigger('strike-page-error', message);
                    alert(message.message);
                    break;
                    
                case 'back':
                    StrikeMan.trigger('strike-page-back', {});
                    // Fire reload method on previous controller
                    if (this.controllers[breadcrumbs[breadcrumbs.length - 2].id]) {
                        var prevController = this.controllers[breadcrumbs[breadcrumbs.length - 2].id]
                        if (prevController && prevController.reload) prevController.reload()
                    }
                    this.precedent();
                    break;

                default:
                    console.log("no handler for message : " + message)
            }        
        },
        precedent: function() {
            var current = breadcrumbs.pop()
            var reverseTransition = Strike.reverseTransitions[current.transition]
            Strike[reverseTransition]('#' + breadcrumbs[breadcrumbs.length - 1].id)
        },
        precedentLabel: function() {
            // TODO: try/catch for this is excessive!
            try {
                var label;
                if (currentState) label = Strike.message(breadcrumbs[breadcrumbs.length - 1].label)
                else label = Strike.message(breadcrumbs[breadcrumbs.length - 2].label)
            } catch(error) {}
            return label ? label: '';
        },
        /* Some event helper methods */
        trigger: function(eventType, data){ StrikeMan.message({ type: 'event', eventType: eventType, data: data }); },
        show: function(id){ StrikeMan.message({ type:'load', id: id, transition:'show' }); },
        fade: function(id){ StrikeMan.message({ type:'load', id: id, transition:'fade' }); },
        next: function(id){ StrikeMan.message({ type:'load', id: id, transition:'next' }); },
        flip: function(id){ StrikeMan.message({ type:'load', id: id, transition:'flip' }); }
    };
    
    // Expose to global object
    this.StrikeMan = StrikeMan;
})();


// Controller set up and helpers
(function($, Base){
    // Private variables and methods
    var controllerDefs = [],
        Controllers = {};

    // Base controller
    Controllers.Base = Base.extend({
        constructor : function(id){
            this.id = id;
            StrikeMan.register(id, this);
        },
        ready: function(){},
        load : function(data){
            StrikeMan.message('loaded');
        }
    });
    
    // List controller 
    Controllers.List = Controllers.Base.extend({
        constructor: function(id){
            this.base(id);
        },
        loaded: function(){
            StrikeCon.bindLinkNavList("#" + this.id + " ul");
        }
    });

    // Router helper
    StrikeMan.add = function(id, extend, defn){
        if(typeof extend !== "string"){
            defn = extend;
            extend = "Base";
        }
        controllerDefs.push({
            id: id,
            extend: extend,
            defn: defn
        });
    };

    // Set up controllers on load
    Strike.onready(function(){
        $.each(controllerDefs, function(controller){
            controller = new (Controllers[controller.extend].extend(controller.defn))(controller.id);            
            controller.ready && controller.ready();
        });
    });
    
    // Expose to global object
    this.StrikeMan.Controllers = Controllers;
})(Strike$, Base);(function( $, StrikeMan ) {
    var StrikeCon = {
        autoTitles: true,
        titleClass: '#{view} .strike-title',
        
        setPageTitle: function( view, label ) {
            var titleSelector = this.titleClass.replace( "{view}", view );
            var titleBar = $( titleSelector );
            if( titleBar.length && label ){
                titleBar[0].innerHTML = label;
            }
        },

        // Auto transition UL->LI->A based on A.className for effect, and A.hash for controller
        bindLinkNavList: function( selector, autoLabel, callback ) {
            // Shuffle args if no autolabel supplied
            if( $.is( autoLabel, "function" ) ) {
                callback = autoLabel;
                autoLabel = true;
            }
            if( ! $.is( autoLabel, "boolean" ) ){
                autoLabel = true;
            }
            
            // If no callback, do default linking...
            callback = callback || function( el ) {
                // TODO: check link is legit.
                var link = el.querySelector( "a" );
                StrikeMan.message({
                    type: 'load',
                    id: link.hash.slice(1),
                    data: {
                        link: link,
                        autoLabel: autoLabel ? link.innerHTML : null
                    },
                    transition: link.className || 'show' /* TODO: search for transition type in class */
                });
            };

            // Add callback to each link item
            $.each( selector + ' li', function( el ) {
                $.on( el, "click", function() {
                    callback( this );
                });

                // Find child link and prevent default action
                $.on( el.querySelector( "a" ), "click", function( e ) { 
                    e.preventDefault();
                });
            });
        }
    };
    
    // Event bindings for auto titles
    if( StrikeCon.autoTitles ){
        StrikeMan.observe( 'strike-page-loaded', function( state ) {
            var page = StrikeMan.controllers[ state.id ];
            if( page && ( page.autoTitles === undefined || page.autoTitles ) ) {
                StrikeCon.setPageTitle( state.id, ( state.data && state.data.autoLabel ) || state.label );
            }
        });
    }
    
    // Expose to global object
    this.StrikeCon = StrikeCon;

})( Strike$, StrikeMan );

})(window);
