// ~~~~~~~~~~~~~~~~~~~~ Utils
// mini jquery
window.$ = HTMLElement.prototype.$ = function(selector) {
    if (selector == null) return null
    var context=this==window?document:this,results=context.querySelectorAll(selector),isId=/^\#[0-9a-zA-Z_\-]*$/;
    if (isId.test(selector) && results) return results[0]
    else return results
}
var each = function(c) {
    for(var i=0; i<this.length; i++) {
        c(this[i], i);
    }
}
Array.prototype.each = each;
NodeList.prototype.each = each;
$hasClass = function(element, className) {
    if (element) {
        var elementClassName = element.className;
        return (elementClassName.length > 0 && (elementClassName == className || 
            new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
    }
}
$addClass = function(element, className) {
    if (element) {
        if (!$hasClass(element, className)) element.className += (element.className ? ' ' : '') + className;
        return element;
    }
    return null;
}
$removeClass = function(element, className) {
    /*if (element) {
        element.className = element.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ');
        element.className = element.className.replace(/^\s+|\s+$/g, ""); // strip whitespace
        return element;
    }*/
    if(element && element.className && className){
       element.className = element.className.replace(new RegExp("\\b(" + className.replace(/\s+/g, "|") + ")\\b", "g"), " ").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
       return element;
    }
    return null;
}
Element.prototype.width = function(){return window.getComputedStyle(this,"").getPropertyValue("width").replace('px','');}
Element.prototype.height = function(){return window.getComputedStyle(this,"").getPropertyValue("height");}
/* -----------------------------------------------
 * Used in animation // TODO check validity
 * -----------------------------------------------
 */
function css(prop, value)
{
    if (value)
        this.style.setProperty(prop, value);
    else
        return window.getComputedStyle(this, null)[prop]
}
HTMLElement.prototype.css = css;

$ajax = function(method, url, callback){
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
}

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

var cache = {};

this.tmpl = function tmpl(str, data) {
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

HTMLElement.prototype.on = function(event, handler) {
    if (event=='touchend' && !onMobile) event = 'mouseup';
    if (event=='touchstart' && !onMobile) event = 'mousedown';
    this.addEventListener(event, handler, false);
}

/**
* DEV &  TOOLS
**/
onMobile = navigator.userAgent.indexOf('Android') + navigator.userAgent.indexOf('iPhone') > 0

if (!onMobile){
    var cacheStatusValues = [];
    cacheStatusValues[0] = 'uncached';
    cacheStatusValues[1] = 'idle';
    cacheStatusValues[2] = 'checking';
    cacheStatusValues[3] = 'downloading';
    cacheStatusValues[4] = 'updateready';
    cacheStatusValues[5] = 'obsolete';

    var cache = window.applicationCache;
    cache.addEventListener('cached', logEvent, false);
    cache.addEventListener('checking', logEvent, false);
    cache.addEventListener('downloading', logEvent, false);
    cache.addEventListener('error', logEvent, false);
    cache.addEventListener('noupdate', logEvent, false);
    cache.addEventListener('obsolete', logEvent, false);
    cache.addEventListener('progress', logEvent, false);
    cache.addEventListener('updateready', logEvent, false);

    function logEvent(e) {
        var online, status, type, message;
        online = (navigator.onLine) ? 'yes' : 'no';
        status = cacheStatusValues[cache.status];
        type = e.type;
        message = 'online: ' + online;
        message+= ', event: ' + type;
        message+= ', status: ' + status;
        if (type == 'error' && navigator.onLine) {
            message+= ' (prolly a syntax error in manifest)';
        }
        console.log(message);
    }
}
window.applicationCache.addEventListener(
    'updateready',
    function(){
        window.applicationCache.swapCache();
        console.log('swap cache has been called');
    },
    false
);

// ~~~~~~~~~~~~~~~~~~~~ Lucky
Lucky = {
    commandQueue:[],
    currentPage: null,
    previousPage: null,
    onReadyHandlers: [],
    onOrientationChangeHandlers: [],
    handlers : {},
    currentSlide: null,
    onMobile : onMobile,
    serverURL : document.location.protocol+'//'+document.location.host,
    storage: window.localStorage,

    init: function(){
        this.bindScrollers();
    },
    maps : function(query){
        window.open('http://maps.google.com?'+query)
    },
    
    locate: function(handler){
        Lucky.handlers['locate'] = handler;
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
        handler()
        this.handlers['lang'] = handler;
        if (onMobile){
            this.pushCommand('lang://dummy');
        } else {
            this.commandResult('lang', 'en');
        }
    },
    reverseGeoCode : function(handler){
        this.handlers['reverseGeoCode'] = handler;
    },
    setMessages: function(messages, lang) {
        if(!messages[lang]) lang = 'en';
        window.lucky_messages = messages[lang];
        $('.i18n').each(function(el) {
            var id = el.id;
            var message = lucky_messages[id];
            if(message) {
                el.innerHTML = message;
            }
        });
    },
    
    getMessage: function(key) {
        return lucky_messages[key];
    },
    onready :function(handler){
        Lucky.onReadyHandlers.push(handler);
    },
    ready : function(){
        this.init();
        this.onReadyHandlers.each(function(handler){
            handler();
        });
    },
    onorientationchange: function(handler){
        Lucky.onOrientationChangeHandlers.push(handler);
    },
    orientationChange : function( orientation ){
        this.onOrientationChangeHandlers.each(function(handler){
            handler( orientation );
        });
    },
    //~~~~~~~ UI ~~~~~~~//
    
    transition: function( type, duration, easing, isReverse, toPage, fromPage ){
        Lucky._cleanPage(toPage);
        fromPage = fromPage || Lucky.currentPage;
        Lucky.previousPage = fromPage;
        var $toPage = $(toPage);
        Lucky.Transition( $toPage, $(fromPage), { type: type, reverse: isReverse } );
        Lucky.currentPage = toPage;
        
        // Rebind scrollers
        this.rebindScroller();
    },
    
    show: function(page) {
        this.transition( 'show', 0.35, 'linear', false, page );
    },
    
    flip: function(page) {
        this.transition( 'flip', 0.65, 'linear', false, page );
    },
    
    unflip: function(page) {
        this.transition( 'flip', 0.65, 'linear', true, page );
    },
    
    next: function(page) {
        this.transition( 'push', 0.35, 'ease', false, page );
    },
    
    prev: function(page) {
        this.transition( 'push', 0.35, 'ease', true, page );
    },
    
    rotateRight: function(page) {
        this.transition( 'cube', 0.55, 'ease', false, page );
    },
    
    rotateLeft: function(page) {
        this.transition( 'cube', 0.55, 'ease', true, page );
    },
    
    fade: function(page) {
        this.transition( 'fade', 0.35, 'linear', false, page );
    },
    
    swap: function(page) {
        this.transition( 'swap', 0.55, 'linear', false, page );
    },

    back: function(){
        if(Lucky.previousPage){
            Lucky.prev(Lucky.previousPage);
        }
    },

    _cleanPage: function(page) {
        // Clean lists
        $(page).querySelectorAll('.list li').each(function(it) {
            $removeClass(it, 'selected');
        });
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
            item.scroller = new iScroll( contents, { desktopCompatibility: !onMobile } );            
        });
    },
    currentPanel: null,
    
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
    
    currentOverlay: null,
    
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
    },
    _touchStart: function(e) {
        var node = e.target;
        var it = 0;
        while(node != null && it < 10) {
            if(node.tagName) {
                if($hasClass(node, 'button') || $hasClass(node, 'submit-button')) {
                    $addClass(node, 'selected')
                    break;
                }
                if(node.tagName == 'LI' && $hasClass(node.parentNode, 'list')) {
                    node.parentNode.querySelectorAll('li').each(function(it) {
                        $removeClass(it, 'selected');                       
                    });
                    $addClass(node, 'selected')
                    e.preventDefault();
                    break;
                }   
            }
            it++;
            node = node.parentNode;
        }   
    },
    
    _touchEnd: function(e) {    
        var node = e.target;
        var it = 0;
        while(node != null && it < 10) {
            if(node.className) {
                if($hasClass(node, 'button') || $hasClass(node, 'submit-button')) {
                    $removeClass(node, 'selected')
                    break;
                }   
            }
            it++;
            node = node.parentNode;
        }   
    },
    fakeTouch : function(nodeElement){
        if (!onMobile){
            if (nodeElement.hasChildNodes){
                nodeElement.childNodes.each(function(node){
                    if (node.hasChildNodes()) Lucky.fakeTouch(node)
                    if (node.getAttribute){
                        var executable = node.getAttribute('ontouchstart');
                        if (node.getAttribute('ontouchend') != null) executable += ';'+node.getAttribute('ontouchend');
                        if (executable){
                            node.onclick = function(){eval(executable)}
                        }
                    }
                })
            }
        }

    }
}

// ~~~~~~~~~~~~~~~~~~~~
window.onload = function() {
    Lucky.fakeTouch(document);
    document.body.addEventListener('touchstart', Lucky._touchStart, false);
    document.body.addEventListener('touchend', Lucky._touchEnd, false);
    document.body.addEventListener('touchmove', function(e) {
        //e.preventDefault();
    }, false);
    document.body.addEventListener('blur', function() {
        window.scrollTo(0, 0);
    }, true);
    Lucky.ready();
}

Lucky.Transition = function( toPage, fromPage, options ){
    // Don't so a new transition if it's in progress
    if( $hasClass( toPage, "current" ) ){ return; }

    options = options || {};
    options.type = options.type || "push;";
    options.reverse = options.reverse || false;

    $addClass( toPage, options.type + " in current" + ( options.reverse ? " reverse" : "" ) );
    $addClass( fromPage, options.type + " out" + ( options.reverse ? " reverse" : "" ) );

    toPage.addEventListener("webkitAnimationEnd", function webAnimEnd(){
        $removeClass(fromPage, "current " + options.type + " out");
        $removeClass(toPage, options.type + " in" );
        if(options.reverse){
            $removeClass(toPage, "reverse");
            $removeClass(fromPage, "reverse");
        }
        this.removeEventListener("webkitAnimationEnd", webAnimEnd, false);
    }, false);
};