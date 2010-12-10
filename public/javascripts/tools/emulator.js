(function() {
    var application /* a reference to the app inside the iframe */,
        Strike /* a reference to the Strike instance that is inside the app */,
        emulator,
        keyCodes = {
            LEFT: 37,
            RIGHT: 39
        };

emulator = {
    orientationIndex: 3 /* default to portrait */,

    init: function() {
        var _this = this;
        
        // Grab a handle to the application inside the iframe
        application = $( "#emulatorContent" )[ 0 ].contentWindow;

        $( application ).load( function() {
            // Grab a handle to Strike inside the app
            Strike = this.Strike;
            
            //override Strike.locate for using the emulator geopicker
            Strike.locate = function( handler ) {
                Strike.handlers["locate"] = handler;
                parent.window.emulator.geoPicker( handler );
            };
        });

        // Handle the shift-arrow keys for orientation
        $( "body" ).keyup( function( e ) {
            if( e.shiftKey && ( e.keyCode == keyCodes.LEFT || e.keyCode == keyCodes.RIGHT ) ) {
                _this.changeOrientation( e.keyCode == keyCodes.LEFT ? -1 : 1 );
            }
        });
    },

    changeOrientation: function( direction ) {
        var rotation = [ 90, 180, -90, 0 ] /* based on the w3c orientation api */,
            classNames = [ "right", "down", "left", "up" ];

        this.orientationIndex = ( this.orientationIndex + direction ) % degrees.length;
        if( this.orientationIndex < 0 ) {
            this.orientationIndex = degrees.length - 1;
        }
        
        // Set the correct class
        $( "div.emulator,#emulatorContent" )
            .removeClass( "up down left right" )
            .addClass( classNames[ this.orientationIndex ] );

        // Fire the orientation change event
        Strike && Strike.orientationChange( rotation[ this.orientationIndex ] );
    },
    
    // Open the Google Map window... 
    geoPicker: function( handler ) {
        jQuery( "#geopicker" )
            .attr( "src", "@geopicker" )
            .bind( "load", function() {
                var $this = jQuery( this );
                $this.fadeIn();
                this.contentWindow.geopicker.setCallback( function( pos ) {
                    // Fire the geo event
                    if( pos && handler ) {
                        handler( { latitude: pos.wa, longitude: pos.xa } );
                    }
                    // Hide the map
                    setTimeout( function() {
                        $this.fadeOut();
                    }, 400 );
                });
            });
    }
};

    // Expose to global scope
    window.emulator = emulator;
})();