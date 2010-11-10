(function(){
    // Private variables
    var observers = {},
        breadcrumbs = [],
        currentState = {};
    
    // Manager object
    var Manager = {
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
                    console.log("message id: %s", message.id)
                    controller = this.controllers[message.id];
                    currentState = {
                        transition: message.transition ? message.transition: 'show',
                        id: message.id,
                        label: controller ? controller.label : message.id
                    }
                    
                    Manager.trigger('strike-page-loading', message.data);
                    if(controller){
                        controller.load(message.data);
                    }
                    else{
                        Manager.message({type:'loaded', data:{}});
                    }
                    break;

                case 'loaded':
                    breadcrumbs.push(currentState);
                    Manager.trigger('strike-page-loaded', currentState);
                    
                    // Do transition.
                    Strike[currentState.transition]('#' + currentState.id);
                    
                    // Fire loaded method on controller
                    controller = this.controllers[currentState.id];
                    controller && controller.loaded && controller.loaded(message.data);
                    break;
                    
                case 'error':
                    Manager.trigger('strike-page-error', message);
                    alert(message.message);
                    break;
                    
                case 'back':
                    Manager.trigger('strike-page-back', {});
                    if (this.controllers[breadcrumbs[breadcrumbs.length - 2].id]) {
                        var precController = this.controllers[breadcrumbs[breadcrumbs.length - 2].id]
                        if (precController && precController.reload) precController.reload()
                    }
                    this.precedent()
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
        trigger: function(eventType, data){ Manager.message({ type: 'event', eventType: eventType, data: data }); },
        show: function(id){ Manager.message({ type:'load', id: id, transition:'show' }); },
        fade: function(id){ Manager.message({ type:'load', id: id, transition:'fade' }); },
        next: function(id){ Manager.message({ type:'load', id: id, transition:'next' }); },
    };
    
    // Expose to global object
    this.Manager = Manager;
})();


// Controller set up and helpers
(function(){
    // Private variables and methods
    var controllerDefs = [];
    
    var Controllers = {};
    Controllers.Base = Base.extend({
        constructor : function(id){
            this.id = id;
            Manager.register(id, this);
        },
        init: function(){},
        load : function(data){
            Manager.message('loaded');
        }
    });
    Controllers.List = Controllers.Base.extend({
        constructor: function(id){
            this.base(id);
        },
        loaded: function(){
            Strike.Controls.bindLinkNavList("#" + this.id + " ul li");
        }
    });

    // Router helper
    Manager.addController = function(id, extend, defn){
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
            controller.init && controller.init();
        });
    });
    
    // Expose to global object
    this.Manager.Controllers = Controllers;
})();