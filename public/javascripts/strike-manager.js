(function(){
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
                    Strike[currentState.transition]('#' + currentState.id);
                    
                    // Fire loaded method on controller
                    controller = this.controllers[currentState.id];
                    controller && controller.loaded && controller.loaded(message.data);
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
        flip: function(id){ StrikeMan.message({ type:'load', id: id, transition:'flip' }); },
    };
    
    // Expose to global object
    this.StrikeMan = StrikeMan;
})();


// Controller set up and helpers
(function($){
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
})(Strike$);