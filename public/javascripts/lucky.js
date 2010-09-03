// Lucky$ - DOM helper
(function(){
    var root = this;
    var previous$ = root.$;
    // ~~~~~~~~~~~~~~~~~~~~ Utils
    var $ = function(selector, context){
        if (selector==null||typeof selector=="object") return selector
        var context = context || document,
            isId = /^[0-9a-zA-Z_\-\s]*\#[0-9a-zA-Z_\-]*$/.test(selector),
            results = isId ? context.querySelector(selector) : context.querySelectorAll(selector);
        return results;
    };

    // Export Lucky$ and $ to global scope.
    root.$ = root.Lucky$ = $;
    $.VERSION = '0.1';
    $.noConflict = function(){
        root.$ = previous$;
        return this;
    };
    $.each = function(items, callback){
        for(var i=0; i<items.length; i++) {
            callback(items[i], i);
        }
    };
    $.hasClass = function(element, className) {
        element = !element ? null :  typeof element == "string" ? $(element) : element;
        if (element) {
            var elementClassName = element.className;
            return (elementClassName.length > 0 && (elementClassName == className ||
                new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
        }
    };
    $.addClass = function(element, className) {
        element = !element ? null :  typeof element == "string" ? $(element) : element;
        if (element) {
            if (!$hasClass(element, className)) element.className += (element.className ? ' ' : '') + className;
            return element;
        }
        return null;
    };
    $.removeClass = function(element, className) {
        element = !element ? null :  typeof element == "string" ? $(element) : element;
        if(element && element.className && className){
           element.className = element.className.replace(new RegExp("\\b(" + className.replace(/\s+/g, "|") + ")\\b", "g"), " ").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
           return element;
        }
        return null;
    };

    // Used in animation - TODO check validity
    $.css = function(element, prop, value){
        if (value){
            element.style.setProperty(prop, value);
        }
        else{
            return window.getComputedStyle(element, null)[prop]
        }
    };
    $.width = function(element){
        return window.getComputedStyle(element,"").getPropertyValue("width").replace('px','');
    }
    $.height = function(element){
        return window.getComputedStyle(element,"").getPropertyValue("height");
    }

    // Events
    $.on = function(element, event, handler, bubble) {
        if( !Lucky.onMobile ){
            event = event == 'touchend' ? 'mouseup' : event;
            event = event == 'touchstart' ? 'mousedown' : event;
        }
        (element||document).addEventListener(event, handler, bubble||false);
    };

    // Ajax
    $.ajax = function(method, url, callback){
        var type = "json",
            error = method.error || function(e){ throw e },
            params = method.params
            async = method.async === undefined ? true : method.async

        if (method.constructor != String){
            type = (method.type || type).toLowerCase();
            url = method.url
            callback = method.success
            error = method.error || error;
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
                        callback(responseContent)
                    }
                } catch (e){
                    console.log('cannot parse json because of '+e)
                    error(e)
                }
            }
            if (this.readyState == 4 && this.status != 200){
                error(this.status)
            }
        }
        req.send(params)
    };
})();

// ~~~~~~~~~~~~~~~~~~~~ Lucky
(function($){
    Lucky = {
        commandQueue:[], /*TODO: used in native? */
        currentPage: null,
        previousPage: null,

        currentPanel: null,
        currentOverlay: null,

        serverURL : document.location.protocol+'//'+document.location.host,
        onMobile : (/iphone|ipad|android/gi).test(navigator.userAgent),
        storage: window.localStorage,

        handlers : {}, /*TODO: used in native? */
        messages : {},

        message: function(msg){ return msg; },

        init: function(){
            cacheLog();
            this.bindScrollers();
        },
        template : function(id, templateId, renderData){
          $('#' + id).innerHTML = tmpl(templateId, renderData)
          fakeTouch($('#' + id))
        },
        maps : function(query){
            window.open('http://maps.google.com?'+query)
        },
        locate: function(handler){
            Lucky.handlers['locate'] = handler; /* TODO: used in native? */
            if (navigator.geolocation) {
                Lucky.stopLocate()
                Lucky.watchPosition = navigator.geolocation.watchPosition(function(position){
                    handler(position.coords)
                })
            }
        },
        stopLocate: function(){
            if (Lucky.watchPosition) navigator.geolocation.clearWatch(Lucky.watchPosition)
        },

        lang: function(handler) {
            handler(navigator.language.substring(0,2))
        },
        reverseGeoCode : function(handler){
            this.handlers['reverseGeoCode'] = handler; /*TODO: used in native? */
        },
        setMessages: function(messages, lang) {
            if(!messages[lang]) lang = 'en';
            Lucky.messages = messages[lang];
            $('.i18n').each(function(el) {
                var id = el.id;
                var message = Lucky.message(id);
                if(message) {
                    el.innerHTML = message;
                }
            });
        },
        message: function(key) {
            return Lucky.messages[key];
        },
        onready :function(handler){
            onReadyHandlers.push(handler);
        },
        ready : function(){
            this.init();
            onReadyHandlers.each(function(handler){
                handler();
            });
        },
        onorientationchange: function(handler){
            onOrientationChangeHandlers.push(handler);
        },
        orientationChange : function( orientation ){
            onOrientationChangeHandlers.each(function(handler){
                handler( orientation );
            });
        },
        //~~~~~~~ UI ~~~~~~~//
        Transition : function( toPage, fromPage, options ){
            // Don't do a new transition if it's in progress
            if( $.hasClass( toPage, "current" ) ){ return; }

            options = options || {};
            options.type = options.type || "push;";
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
            }, false);
        },
        show: function(page){ transition( 'show', 0.35, 'linear', false, page ); },
        flip: function(page){ transition( 'flip', 0.65, 'linear', false, page ); },
        unflip: function(page){ transition( 'flip', 0.65, 'linear', true, page ); },
        next: function(page){ transition( 'push', 0.35, 'ease', false, page ); },
        prev: function(page){ transition( 'push', 0.35, 'ease', true, page ); },
        rotateRight: function(page){ transition( 'cube', 0.55, 'ease', false, page ); },
        rotateLeft: function(page){ transition( 'cube', 0.55, 'ease', true, page ); },
        fade: function(page){ transition( 'fade', 0.35, 'linear', false, page ); },
        swap: function(page){ transition( 'swap', 0.55, 'linear', false, page ); },
        back: function(){
            if(Lucky.previousPage){
                Lucky.prev(Lucky.previousPage);
            }
        },
        rebindScroller: function(){
            var scroll = $(Lucky.currentPage + " .scrollView");
            scroll.length && scroll[ 0 ].scroller && scroll[ 0 ].scroller.refresh();
        },
        bindScrollers: function(context){
            context = context ? context + " " : "";
            $(context + ".scrollView").each(function( item ){
                // Attach scroller object to the DOM element
                // TODO: better way to determine contents? (because firstChild is a text node)
                var contents = item.firstChild.nextSibling;
                item.scroller = new iScroll( contents, { desktopCompatibility: !this.onMobile } );
            });
        },
        openPanel: function(page) {
            var transition = new Transition('slide', 0.35, 'ease');
            transition.direction = 'bottom-top';
            transition.perform($(page), $(Lucky.currentPage), false);
            Lucky.currentPanel = page;
        },
        closePanel: function() {
            var transition = new Transition('slide', 0.35, 'ease');
            transition.direction = 'bottom-top';
            transition.perform($(Lucky.currentPage), $(Lucky.currentPanel), true);
            setTimeout(function() {
                $(Lucky.currentPanel).style.display = '';
                Lucky.currentPanel = null;
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
            Lucky.currentOverlay = page;
        },
        hideOverlay: function(now) {
            var el = $(Lucky.currentOverlay);
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
            if (!Lucky.onMobile){
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
        transition = function( type, duration, easing, isReverse, toPage, fromPage ){
            _cleanPage(toPage);
            fromPage = fromPage || Lucky.currentPage;
            Lucky.previousPage = fromPage;
            var $toPage = $(toPage);
            Lucky.Transition( $toPage, $(fromPage), { type: type, reverse: isReverse } );
            Lucky.currentPage = toPage;

            // Rebind scrollers
            Lucky.rebindScroller();
        },
        _cleanPage = function(page) {
            // Clean lists
            $(page).querySelectorAll('.list li').each(function(it) {
                $.removeClass(it, 'selected');
            });
        },
        _touchStart = function(e) {
            var node = e.target;
            var it = 0;
            while(node != null && it < 10) {
                if(node.tagName) {
                    if($.hasClass(node, 'button') || $.hasClass(node, 'submit-button')) {
                        $.addClass(node, 'selected')
                        break;
                    }
                    if(node.tagName == 'LI' && $.hasClass(node.parentNode, 'list')) {
                        node.parentNode.querySelectorAll('li').each(function(it) {
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
        _touchEnd = function(e) {
            var node = e.target;
            var it = 0;
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
            if ( Lucky.onMobile || !nodeElement.hasChildNodes )return;
            nodeElement.childNodes.each(function(node){
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
        $.on(document.body, 'touchstart', _touchStart);
        $.on(document.body, 'touchend', _touchEnd);
        $.on(document.body, 'blur', function() { window.scrollTo(0, 0); }, true);
        Lucky.ready();
    });

    $.on(window.applicationCache, 'updateready', function(){
        window.applicationCache.swapCache();
        console.log('swap cache has been called');
    });

    // Export Lucky to global scope.
    root.Lucky = Lucky;
})(Lucky$);

(function(){
    // Simple JavaScript Templating
    // John Resig - http://ejohn.org/ - MIT Licensed
    var cache = {};
    Lucky.tmpl = function tmpl(str, data) {
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
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

(function($){
    // TODO: controls to become modules.
    Lucky.controls = {
        bindTabBarNav: function(selector){
            $(selector||".tabBarControls li").each(function(item){
                $.on(item, "click", function(){
                    var link = this.querySelector("a");
                    Lucky.show(link.hash);
                })
            })
        }
    }
})(Lucky$);

//~~~~~~~ Aliases and extensions
(function($){
    // Aliases (TODO: should be deprecated)
    $hasClass = $.hasClass
    $addClass = $.addClass
    $removeClass = $.removeClass
    $ajax = $.ajax
    onMobile = Lucky.onMobile
    tmpl = Lucky.tmpl

    // Prototype extensions - probably shouldn't touch objects we don't own.
    Array.prototype.each = NodeList.prototype.each = function(c) { $.each(this,c); };
    Element.prototype.width = function(){ $.width(this) };
    Element.prototype.height = function(){ $.height(this) };
    HTMLElement.prototype.css = function( prop, value ){ $.css(this, prop, value) };
    HTMLElement.prototype.on = function(e,handler){ $.on(this, e, handler) };
})(Lucky$);
