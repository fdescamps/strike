(function() {

// Local storage helper
var store = {
    keys: {
        zoom: "emulator.geopicker.zoom.preference",
        latlng: "emulator.geopicker.default.latlng"
    },
    get: function( key ) {
        return window.localStorage.getItem( key );
    },
    set: function( key, value ) {
        window.localStorage.setItem( key, value );
        return value;
    },
    clear: function() {
        window.localStorage.clear();
    }
};

var geopicker = {
    defaultZoom : parseInt( store.get( store.keys.zoom ), 10 ),
    defaultLocation : store.get( store.keys.latlng ),
    onSelect: null,
    clickTimer: null,

    // Nicer property setter for calling page
    setCallback: function( callback ) {
        this.onSelect = callback;
    },

    init: function() {
        var _this = this,
            latlng,
            map;

        // Set zoom and location defaults
        this.defaultZoom = this.defaultZoom || store.set( store.keys.zoom, 12 );
        this.defaultLocation = this.defaultLocation || store.set( store.keys.latlng, "(48.856667,2.350833)" );
        latlng = /\(([\-0-9.]*)\s*,\s*([\-0-9.]*)\)/.exec( this.defaultLocation );
        this.defaultLocation = new google.maps.LatLng( latlng[1] - 0, latlng[2] - 0 );

        // Set up map
        map = new google.maps.Map( $( "#mapCanvas" )[0], {
            zoom: this.defaultZoom,
            center: this.defaultLocation,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        // Attach event handlers
        $( "#mapSearch" ).click( function() { _this.geocodeAddress( map ); });
        $( "#mapCancel" ).click( function() { _this.onSelect && _this.onSelect( null ); });

        // Map clicked
        google.maps.event.addListener( map, "click", function( obj ) {
            _this.handleMapClick( map, obj );
        });

        // Zoom level changed
        google.maps.event.addListener( map, "zoom_changed", function() {
            _this.defaultZoom = this.zoom;
            store.set( store.keys.zoom, this.zoom );
        });
    },

    // "click/double click" handler: one to select, two to zoom
    handleMapClick: function( map, geoObj ){
        var _this = this;

        // Double click
        if( this.clickTimer ) {
            clearTimeout( this.clickTimer );
            this.clickTimer = null;
            return;
        }

        // Single click
        this.clickTimer = setTimeout( function() {
            if ( !( geoObj && geoObj.latLng ) ) {
                return;
            }
            // Save preference
            store.set( store.keys.latlng, geoObj.latLng );

            // Add a marker
            new google.maps.Marker({
                  position: geoObj.latLng,
                  map: map
            });

            // Fire callback
            _this.onSelect && _this.onSelect( geoObj.latLng );
        }, 400 );
    },

    geocodeAddress: function( map ) {
        var address = $( "#mapSearchLocation" ).val(),
            geocoder = new google.maps.Geocoder();

        geocoder && geocoder.geocode( { "address": address }, function( results, status ) {
            if ( status == google.maps.GeocoderStatus.OK ) {
                // Center and store prefrences
                map.setCenter( results[ 0 ].geometry.location );
                store.set( store.keys.latlng, results[ 0 ].geometry.locationlng );
                return;
            }

            // Error getting geocoder details
            alert( status == google.maps.GeocoderStatus.ZERO_RESULTS ?
                "No results found." :
                "Geocode was not successful: " + status );
        });
    }
};

// Expose to global scope
window.geopicker = geopicker;

})();
