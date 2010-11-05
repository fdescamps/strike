(function(Strike, Manager){
    Strike.Controls = {
        autoTitles: true,    
        titleClass: '#{view} .strike-title',
        
        setPageTitle: function(view, label){
            var titleSelector = this.titleClass.replace("{view}", view);
            var titleBar = $(titleSelector);
            if(titleBar.length && label){
                titleBar[0].innerHTML = label;
            }
        },
        
        /* 
            Add "auto" transitions to a list of elements containing links 
            The links should have a hash of the id to transition to
            and optionally, a class name of a transition.
        */
        bindLinkNavList: function(selector){
            $(selector).each(function(item){
                $.on(item, "click", function(){
                    var link = this.querySelector("a");
                    Manager.message({
                        type: 'load', 
                        id: link.hash.slice(1), 
                        transition: link.className || 'show'
                    });
                });
            });
        }
    };
    
    // Event bindings
    if(Strike.Controls.autoTitles){
        Manager.observe('strike-page-loaded', function(data){
            Strike.Controls.setPageTitle(data.id, data.label);
        });
    }
    
})(Strike, Manager);