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
        
        // TODO: should be replaced with a call to the manager - not
        // a direct transition. Manager.goto('here')
        /* 
            Add "auto" transitions to a list of elements containing links 
            The links should have a hash of the id to transition to
            and optionally, a class name of a transition.
        */
        bindLinkNavList: function(selector, callback){
            // If no callback, do default linking...
            callback = callback || function(link){
                // TODO: check link is legit.
                var link = link.querySelector("a");
                Manager.message({
                    type: 'load',
                    id: link.hash.slice(1),
                    data: {
                        link: link,
                        autoLabel: link.innerHTML
                    },
                    transition: link.className || 'show' /* TODO: search for transition type in class */
                });
            };

            // Add callback to each link item
            $.each(selector + ' li', function(item){
                $.on(item, "click", function(){
                    callback(this);
                });

                // Find child link and prevent default action
                $.on(item.querySelector("a"), "click", function(e){ 
                    e.preventDefault();
                });
            });
        }
    };
    
    // Event bindings
    if(Strike.Controls.autoTitles){
        Manager.observe('strike-page-loaded', function(state){
            var page = Manager.controllers[state.id];
            if(page && (page.autoTitles === undefined || page.autoTitles)){
                Strike.Controls.setPageTitle(state.id, (state.data && state.data.autoLabel) || state.label);
            }
        });
    }
    
})(Strike, Manager);