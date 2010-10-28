(function(){

this.Manager = {
    autotitles: true,
    breadcrumb: [],
    observers: {},
    controllers: {},
    rtransitions: {
        'rotateRight': 'rotateLeft',
        'rotateLeft': 'rotateRight',
        'prev': 'next',
        'next': 'prev',
        'show': 'show',
        'fade': 'fade'
    },
    reset: function() {
        this.add({
            id: 'home',
            label: 'accueil'
        })
    },
    observe: function(type, handler) {
        if (this.observers[type] == null) {
            this.observers[type] = []
        }
        this.observers[type].push(handler)
    },
    register: function(id, controller) {
        this.controllers[id] = controller
    },
    message: function(message) {
        var type = typeof(message) == 'string' ? message: message.type
        switch (type) {
            case 'event':
                var handlers = this.observers[message.eventType]
                handlers = handlers ? handlers: []
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
                var controller = this.controllers[message.id];
                // TODO: allow for controller-less views.
                this.current = {
                    transition: message.transition ? message.transition: 'next',
                    id: message.id,
                    label: controller.label
                }
                this.startLoading(message.loadingMessage)
                this.controllers[message.id].load(message.data)
                break;
            case 'startLoading':
                this.startLoading(message.loadingMessage)
                break;
            case 'stopLoading':
                this.stopLoading()
                break;
            case 'loadingMessage':
                this.loadingText(message.loadingMessage)
                break;
            case 'loaded':
                this.add(this.current)
                if(this.autotitles){
                    this.setPageTitle(this.current.id, this.current.label);
                }
                Strike[this.current.transition]('#' + this.current.id)
                this.current == null
                this.stopLoading()
                break;
            case 'error':
                alert(Strike.message(message.message))
                this.stopLoading()
                break;
            case 'back':
                if (this.controllers[this.breadcrumb[this.breadcrumb.length - 2].id]) {
                    var precController = this.controllers[this.breadcrumb[this.breadcrumb.length - 2].id]
                    if (precController && precController.reload) precController.reload()

                }
                this.precedent()
                break;
            default:
                console.log("no handler for message : " + message)
        }

    },
    setPageTitle: function(view, label){
        var titleBar = $("#" +  view + " .strike-title");
        if(titleBar.length && label){
            titleBar[0].innerHTML = label;
        }
    },
    startLoading: function(message) {
        this.loadingText(message)
        return;
        Strike.showOverlay('#loading');
    },
    stopLoading: function(message) {
        return;
        Strike.hideOverlay(true);
    },
    loadingText: function(text) {
        var loadingText = $('#loadingText');
        if(!loadingText)return
        loadingText.innerHTML = Strike.message(text) ? Strike.message(text) : '';
    },
    add: function(state) {
        this.breadcrumb.push(state)
    },
    precedent: function() {
        var current = this.breadcrumb.pop()
        var reverseTransition = this.rtransitions[current.transition]
        Strike[reverseTransition]('#' + this.breadcrumb[this.breadcrumb.length - 1].id)
    },
    precedentLabel: function() {
        // TODO: try/catch for this is excessive!
        try {
            var label;
            if (this.current) label = Strike.message(this.breadcrumb[this.breadcrumb.length - 1].label)
            else label = Strike.message(this.breadcrumb[this.breadcrumb.length - 2].label)
        } catch(error) {}
        return label ? label: '';
    }
};

Manager.Controller = Base.extend({
    constructor : function(id, label){
        Manager.register(id, this)
        this.id = id;
        if(label){
            this.label = label;
        }
    },
    load : function(data){
        Manager.message('loaded')
    }
});

// Router helper
Manager.controller = function(id, defn){
    defn.constructor = function(id){
        //if(this.init)this.init();
        this.base(id);
    };
    return new (Manager.Controller.extend(defn))(id);
};

})();