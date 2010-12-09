(function(){
    var application,
        Strike,
        emulator;
        
emulator = {
    orientationIndex: 3,
    init: function(){
        var _this = this;

        // Handle the shift-arrow keys for orientation
        $('body').keyup(function(e){
            if((e.keyCode == 37 || e.keyCode == 39) && e.shiftKey === true){
                _this.changeOrientation( e.keyCode == 37 ? -1 : 1 );
            }
        });

        application = $("#emulatorContent")[0].contentWindow;
        
        //override Strike.locate for using the emulator geopicker
        $( application ).load( function(){
            Strike = this.Strike;
            Strike.locate = function( handler ){
                Strike.handlers['locate'] = handler;
                parent.window.emulator.geoPicker( handler );
            }
        })        
    },

    changeOrientation: function( direction ){
        var degrees = [ 90, 180, -90, 0 ];
        this.orientationIndex = ( this.orientationIndex + direction ) % degrees.length;
        if(this.orientationIndex < 0)this.orientationIndex = degrees.length - 1;
        var orientation = degrees[ this.orientationIndex ];
        
        var elements = $("div.emulator,#emulatorContent");
        elements.removeClass('up down left right');
        switch(orientation){
            case 90:
                elements.addClass('right');
                break;
            case -90:
                elements.addClass('left');
                break;
            case 0:
                elements.addClass('up');
                break;
            case 180:
                elements.addClass('down');
                break;
        }
        
        Strike.orientationChange( orientation );
    },
    
    geoPicker: function( handler ){
          var _this = this;
          // Open the Google Map window... 
          var map = jQuery( '#geopicker' );
          map.attr( "src", "@geopicker" );
          map.bind("load", function(){
              var $this = jQuery( this );
              $this.fadeIn();
              this.contentWindow.geopicker.setCallback( function( pos ){
                  if( pos && handler ){
                      handler( { latitude: pos.wa, longitude: pos.xa } );
                  }
                  // Hide the map
                  setTimeout(function(){
                      $this.fadeOut();
                  },400);
              });
          });

      },
      clearStorage : function(){
          application.localStorage.clear();
      }
};

    // Expose to global scope
    window.emulator = emulator;
})();