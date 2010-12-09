// Strike$ - DOM helper
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
                $.each(element, function(item){
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
                if (options.afterTransition) options.afterTransition()
            }, false);
        },
        show: function(page, afterTransition){ transition( 'show', 0.35, 'linear', false, page, null, afterTransition); },
        flip: function(page, afterTransition){ transition( 'flip', 0.65, 'linear', false, page, null,afterTransition ); },
        unflip: function(page, afterTransition){ transition( 'flip', 0.65, 'linear', true, page, null,afterTransition ); },
        next: function(page, afterTransition){ transition( 'push', 0.35, 'ease', false, page, null,afterTransition ); },
        prev: function(page, afterTransition){ transition( 'push', 0.35, 'ease', true, page, null,afterTransition ); },
        rotateRight: function(page, afterTransition){ transition( 'cube', 0.55, 'ease', false, page, null,afterTransition ); },
        rotateLeft: function(page, afterTransition){ transition( 'cube', 0.55, 'ease', true, page, null,afterTransition ); },
        fade: function(page, afterTransition){ transition( 'fade', 0.35, 'linear', false, page, null,afterTransition ); },
        swap: function(page, afterTransition){ transition( 'swap', 0.55, 'linear', false, page, null,afterTransition ); },
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
        transition = function( type, duration, easing, isReverse, toPage, fromPage, afterTransition ){
            cleanPage(toPage);
            
            fromPage = fromPage || Strike.currentPage;
            Strike.previousPage = fromPage;
            var $toPage = $(toPage);
            Strike.Transition( $toPage, $(fromPage), { type: type, reverse: isReverse, afterTransition : afterTransition } );
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
            var node = e.target;
            var it = 0;
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
            var node = e.target;
            var it = 0;
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
*/