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
    messages : {},
    
    init: function(){
        Lucky.fakeTouch(document);
        document.body.addEventListener('touchstart', Lucky._touchStart, false);
        document.body.addEventListener('touchend', Lucky._touchEnd, false);
        document.body.addEventListener('blur', function() {
            window.scrollTo(0, 0);
        }, true);
        $(".scrollView").each(function( item ){
            // Attach scroller object to the DOM element
            // TODO: better way to determine contents? (because firstChild is a text node)
            var contents = item.firstChild.nextSibling;
            item.scroller = new iScroll( contents, { desktopCompatibility: !onMobile } );            
        });
        Lucky.ready();
        
    },
    template : function(id, templateId, renderData){
      $('#' + id).innerHTML = tmpl(templateId, renderData)
      this.fakeTouch($('#' + id))
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
        } else {
          console.log('no geolocation in browser')
        }
    },
    stopLocate: function(){
        if (Lucky.watchPosition) navigator.geolocation.clearWatch(Lucky.watchPosition)
    },
    
    lang: function(handler) {
        handler(navigator.language.substring(0,2))
    },
    reverseGeoCode : function(handler){
        this.handlers['reverseGeoCode'] = handler;
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
        Lucky.onReadyHandlers.push(handler);
    },
    ready : function(){
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
        el.style.opacity = 1;
        /*setTimeout(function() {
            el.style.webkitTransition = 'opacity .10s linear';
            el.style.opacity = opacity ? opacity : '1';
        }, 0);*/
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
                        var executable = node.getAttribute('ontouchstart') != null ? node.getAttribute('ontouchstart') + ';': '';
                        if (node.getAttribute('ontouchend') != null) executable += node.getAttribute('ontouchend');
                        if (executable && executable != ''){
                            node.onclick = function(){ console.log('executable : ' + executable); eval(executable)}
                        }
                    }
                })
            }
        }

    }
}

// ~~~~~~~~~~~~~~~~~~~~
window.onload = function() {
    Lucky.init();
}

// ~~~~~~~~~~~~~~~~~~~~~ Thanks to Apple

// Note: Properties and methods beginning with underbar ("_") are considered private and subject to change in future Dashcode releases.

// Currently supported transition types
Transition.NONE_TYPE = 'none';
Transition.PUSH_TYPE = 'push';
Transition.DISSOLVE_TYPE = 'dissolve';
Transition.SLIDE_TYPE = 'slide';
Transition.FADE_TYPE = 'fade';
Transition.FLIP_TYPE = 'flip';
Transition.CUBE_TYPE = 'cube';
Transition.SWAP_TYPE = 'swap';
Transition.REVOLVE_TYPE = 'revolve';

// Transition timing functions that are defined as part of WebKit CSS animation specification. These are made available for your convenience.
Transition.EASE_TIMING = 'ease';
Transition.LINEAR_TIMING = 'linear';
Transition.EASE_IN_TIMING = 'ease-in';
Transition.EASE_OUT_TIMING = 'ease-out';
Transition.EASE_IN_OUT_TIMING = 'ease-in-out';

// Directions are only supported for certain transition types.  
// Push and Slide support all four directions.
// Flip, Cube, Swap and Revolve support only Right-to-left and Left-to-right
Transition.RIGHT_TO_LEFT_DIRECTION = 'right-left';
Transition.LEFT_TO_RIGHT_DIRECTION = 'left-right';
Transition.TOP_TO_BOTTOM_DIRECTION = 'top-bottom';
Transition.BOTTOM_TO_TOP_DIRECTION = 'bottom-top';

//
// Constructor for Transtition object. You can also use the convenience method CreateTransitionWithProperties()
//
// type         - any of the Transition type constants
// duration     - a float in seconds
// timing       - a valid CSS animation timing function value. For example, 'linear' or 'ease-in-out'
//
// After construction, you can also assign one of the direction constants above to the "direction" property 
// to set the transition direction for transition types that support different directions (see comments above.)
//
function Transition(type, duration, timing)
{
    this.type = type;
    this.setDuration(duration);
    this.timing = timing;
    
    this._useTransforms = Transition.areTransformsSupported();
}

//
// Create a new Transition object and fill its internal properties from the dictionary parameter
//
function CreateTransitionWithProperties(properties)
{
    var transition = new Transition();
    for (var property in properties) {
        if (property == 'duration') {
            transition.setDuration(properties[property]);
        } else {
            transition[property] = properties[property];
        }
    }
    return transition;
}

//
// Both newView and oldView must share the same common parent container element. The transition is
// constrained by the dimensions of the parent container. In particular, the container has
// 'overflow: hidden'. This is especially important when the container edges are not lined with the
// edge of the device viewport.
//
// Be careful that this method actually makes use of these inline CSS properties to make sure that
// all transitions can be performed correctly:
//  - display
//  - zIndex
//  - position
//  - top
//  - width
// If you also make use of these CSS properties out of this transition method, you have to make
// copies of them restore them appropriately.
//
//
// newView - the new view to be shown. Nothing will change if newView is null.
// oldView - the old view to be replaced
// isReverse - if flag is true, it will perform the transition in reverse. Some transitions, for example, the push transition has a reverse.
//
Transition.prototype.perform = function(newView, oldView, isReverse)
{
    if (!newView || !newView.parentNode) return;
    var containerElement = newView.parentNode;
    if (oldView) {
        // Got to execute in the same container
        if (oldView.parentNode != containerElement) return;
        if (oldView == newView) return;
        
        containerElement = oldView.parentNode; // In case there is a push container
        if (containerElement.getAttribute('apple-transition-flip-push-container')) {
            this._pushContainer = containerElement;
            containerElement = this._pushContainer.parentNode;
        }
        else {
            // Clear any residue push container for flip
            this._pushContainer = null;            
        }
        
        var oldStyle = oldView.style;
        // Reset some settings
        oldStyle.zIndex = 0;
        // Since oldView is just taken out of the document flow, make sure its width still looks good just in case width is 'auto' and its children doesn't make up all the width
        this._containerWidth = containerElement.offsetWidth + 'px';
        oldStyle.width = this._containerWidth;
        // This is especially important for reverse since the original value of 'top' is 'auto', which for a view lower in the document flow means that it will come after the newly restored view. Hence, let's set it to a right value before newView is put to 'relative' again.
        oldStyle.top = oldView.offsetTop + 'px';

        if (this._useTransforms) {
            oldStyle.webkitTransitionProperty = 'none'; // disable
            // This also makes sure that we start with an identity matrix to avoid initial performance problem
            oldStyle.webkitTransform = this._translateOp(0, 0);
            oldStyle.webkitBackfaceVisibility = '';
        }
        
        if (!this.type || this.type == Transition.NONE_TYPE || !this._useTransforms) {
            if ((this.type != Transition.FADE_TYPE) && (this.type != Transition.SLIDE_TYPE) || isReverse) {
                oldStyle.display = 'none';
            }
        }
    }
    
    // Make sure that container is constraining the transitions for overflow content
    containerElement.style.overflow = 'hidden';
    var computedStyle = document.defaultView.getComputedStyle(containerElement, null);
    if ((computedStyle.getPropertyValue('position') != 'absolute') && (computedStyle.getPropertyValue('position') != 'relative')) {
        // Assume 'static' since we don't support 'fixed'. 'relative' is less obtrusive then.
        containerElement.style.position = 'relative';
    }
    
    var newStyle = newView.style;
    if (this._useTransforms) {
        // Reset
        newStyle.webkitTransitionProperty = 'none'; // disable
        // This also makes sure that we start with an identity matrix to avoid initial performance problem
        newStyle.webkitTransform = this._translateOp(0, 0);
        newStyle.webkitBackfaceVisibility = '';
        
        // This overcomes a clipping problem
        containerElement.parentNode.style.zIndex = 0;
    }
    
    // Before the new view comes in, remove any previously hard-coded inline value that would have crept in when it was transited out. Because the transition is happening in a container and we are reinstating the position to be 'relative', the new view will resize itself to react to orientation changes (if any).
    newStyle.width = null;
    newStyle.position = 'relative';
    newStyle.display = 'block';

    // Perform the transition
    if (this.type && this.type != Transition.NONE_TYPE && this._useTransforms) {
        this._checkedForEnded = false;
        this._containerElement = containerElement;
        this._newView = newView;
        this._oldView = oldView;
        // Make sure that we make a copy of the newView's inline opacity because we are going to make use of it in various ways, for example, for the fade or revolve transition
        this._previousNewStyleOpacity = newStyle.opacity;
        // Normally, the old view disappears as part of transition. Some transitions like slide/fade requires the old view to be there though.
        this._shouldHideOldView = true;
        
        if (oldView) {                        
            // If the new view is too short to fit the whole view port height, this will even show the Safari toolbar before the transition happens, 
            oldStyle.position = 'absolute';
            
            this._preventEventsInContainer();
            
            this._originalContainerElementHeight = containerElement.style.height;
            containerElement.style.height = Math.max(oldView.offsetHeight, newView.offsetHeight) + 'px';
        }
        
        if (this._pushContainer && (this.type != Transition.FLIP_TYPE)) {
            this._clearPushContainer();
        }
        
        if (this.type == Transition.DISSOLVE_TYPE || this.type == Transition.FADE_TYPE) {
            this._performFadeTransition(isReverse);
        }
        else if (this.type == Transition.PUSH_TYPE || this.type == Transition.SLIDE_TYPE) {
            this._performPushOrSlideTransition(isReverse);
        }
        else if (this.type == Transition.FLIP_TYPE) {
            this._performFlipTransition(isReverse);
        }
        else if (this.type == Transition.CUBE_TYPE) {
            this._performCubeTransition(isReverse);
        }
        else if (this.type == Transition.SWAP_TYPE) {
            this._performSwapTransition(isReverse);
        }
        else if (this.type == Transition.REVOLVE_TYPE) {
            this._performRevolveTransition(isReverse);
        }
    }
    //Lucky.fakeTouch(document);
}

Transition.areTransformsSupported = function () {
    if (!Transition._areTransformsSupported) {
        // Our use of transforms and transitions is only officially supported for the iPhone and does not work correctly in desktop WebKit.
        // The commented out test would be more correct if desktop WebKit were also supported.
        /*
        var testElem = document.createElement('div');
        var style = testElem.style;
        style.setProperty('-webkit-transform', 'inherit');
        Transition._areTransformsSupported = style.getPropertyValue('-webkit-transform') == 'inherit';
         */
        
        // But currently, we are using the following test which succeeds on the iPhone but not on the desktop.
        Transition._areTransformsSupported = (window.WebKitCSSMatrix ? true : false);
    }
    return Transition._areTransformsSupported;
}

// Default duration for each transition type, if it is not specified
Transition._DEFAULT_DURATION = {
    'none'      : '0.35',
    'push'      : '0.35',
    'dissolve'  : '0.35',
    'slide'     : '0.35',
    'fade'      : '0.35',
    'flip'      : '0.65',
    'cube'      : '0.55',
    'swap'      : '0.55',
    'revolve'   : '0.35'
}

//
// Returns the duration for the transition.
//
Transition.prototype.getDuration = function()
{
    var duration = this._duration;
    if (duration == '') {
        duration = Transition._DEFAULT_DURATION[this.type];
        if (!duration) duration = '0.3';
    }
    return duration;
}

//
// Sets the duration for the transition.
//
// value - new duration
//
Transition.prototype.setDuration = function(value)
{
    this._duration = value;
}

/////////////////////////////////////////////////////////////////////////////
//
// Start Private methods
//
/////////////////////////////////////////////////////////////////////////////

Transition.prototype._getDurationString = function()
{
    var value = parseFloat(this.getDuration());
    if (!isNaN(value)) {
        value += 's';
    }
    else {
        value = '0s';
    }
    return value;
}

Transition.prototype._getDurationStringForFadingEffect = function()
{
    var value = parseFloat(this.getDuration());
    if (!isNaN(value)) {
        // looks better with slightly longer timing
        value = value * (1+ ((value < 0.25) ? 0.5 : Math.pow(4, -0.25-value))) + 's';
    }
    else {
        value = '0s';
    }
    return value;
}

Transition.prototype._translateOp = function(xPixels, yPixels)
{
    return 'translate(' + xPixels + 'px, ' + yPixels + 'px)';
}

Transition.prototype._rotateOp = function(axis, degree)
{
    return 'rotate' + axis + '(' + degree + 'deg)';
}

Transition.prototype._setupTransition = function(style, property, duration, timing, propertyString, propertyValue)
{
    style.webkitTransitionProperty = property;
    style.webkitTransitionDuration = duration;
    style.webkitTransitionTimingFunction = timing;
    style[propertyString] = propertyValue;
}

Transition.prototype.handleEvent = function(event)
{
    switch (event.type) {
    case 'webkitTransitionEnd' :
        this._transitionEnded(event);
        break;
    case 'webkitAnimationEnd' :
        this._animationEnded(event);
        break;
    }
}

// Prevent user events from interfering from happening during transition
Transition.prototype._preventEventsInContainer = function()
{
    if (!this._maskContainerElement) return;
    
    if (this._mask) this._maskContainerElement.removeChild(this._mask);
    
    this._mask = document.createElement("div");
    this._mask.setAttribute('style', 'position: absolute; top: 0; left: 0; z-index: 1000;');
    this._mask.style.width = this._maskContainerElement.offsetWidth + 'px';
    this._mask.style.height = this._maskContainerElement.offsetHeight + 'px';
    this._maskContainerElement.appendChild(this._mask);
}

// Re-parent children of _pushContainer back to _containerElement whenever the transition is not a flip.
Transition.prototype._clearPushContainer = function()
{
    if (this._pushContainer) {
        this._containerElement.removeChild(this._pushContainer);
    
        var children = this._pushContainer.childNodes;
        for (var i=children.length-1; i>=0; i--) {
            if (children[i] != this._mask) {
                this._containerElement.appendChild(children[i]);
            }
        }
        
        delete this._pushContainer;
    }
}

Transition.prototype._transitionEndedHelper = function()
{
    if (this._shouldHideOldView) {
        this._oldView.style.display = 'none';
    }
    this._newView.style.zIndex = 1;
    this._newView.style.opacity = this._previousNewStyleOpacity;
    
    if (this._maskContainerElement && this._mask) {
        this._maskContainerElement.removeChild(this._mask);
        this._mask = null;
    }
    
    this._containerElement.style.height = this._originalContainerElementHeight;
}

// Callback for end of transition
Transition.prototype._transitionEnded = function(event)
{
    if (!this._checkedForEnded) {
        this._transitionEndedHelper();
        
        if (this.type == Transition.CUBE_TYPE) {
            this._containerElement.style.webkitPerspective = '';
            this._oldView.style.webkitTransformOrigin = '50% 50%';
            this._newView.style.webkitTransformOrigin = '50% 50%';
        }

        this._oldView.style.opacity = '1';
        this._newView.style.opacity = '1';
        
        this._checkedForEnded = true;
    }
}

// A handy method to find the style rule of a CSS animation rule (the one that starts with '@');
Transition._findAnimationRule = function(animationRuleName)
{
    var foundRule = null;
    var styleSheets = document.styleSheets;
    var re = /Parts\/Transitions.css$/;
    for (var i=0; i < styleSheets.length; i++) {
        var styleSheet = styleSheets[i];
        if (re.test(styleSheet.href)) {
            for (var j=0; j < styleSheet.cssRules.length; j++) {
                var rule = styleSheet.cssRules[j];
                // 7 means the keyframe rule
                if (rule.type == 7 && rule.name == animationRuleName) {
                    foundRule = rule;
                    break;
                }
            }
        }
    }
    return foundRule;
}

Transition.prototype._animationEndedHelper = function()
{
    this._transitionEndedHelper();

    Transition._removeClassName(this._oldView, this._oldViewAnimationName);
    Transition._removeClassName(this._newView, this._newViewAnimationName);
}

// Callback for end of animation
Transition.prototype._animationEnded = function(event)
{
    if (!this._checkedForEnded) {
        this._animationEndedHelper();
        
        if (this.type == Transition.FLIP_TYPE) {
            Transition._removeClassName(this._containerElement, 'dashcode-transition-flip-container');
            Transition._removeClassName(this._flipContainer, 'dashcode-transition-flip-container-pushback');
        }
        
        this._checkedForEnded = true;
    }
}

Transition.prototype._performFadeTransition = function(isReverse)
{
    if (this._oldView) {
        var _self = this;
        var newStyle = this._newView.style;
        var oldStyle = this._oldView.style;
        var isDissolve = this.type == Transition.DISSOLVE_TYPE;
        var isSimpleFade = this.type == Transition.FADE_TYPE;

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
