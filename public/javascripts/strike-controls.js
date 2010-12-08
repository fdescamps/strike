(function( $, StrikeMan ) {
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