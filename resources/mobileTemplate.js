/* 
    Welcome to heart of STRIKE! - and your application.

    the mobileApp object -  - not required, and not part of Strike - but keeps things tidy
    zero or more "application controllers"
    // Called on DOM ready
    // Called when called by the manager
    // Called after the load & transition
*/
var mobileApp = {
    init: function(){
        StrikeMan.show("home");
    }
};

StrikeMan.add( 'home', {
    ready: function(){},
    load: function(){
        // Don't forget to tell Strike whe you are ready to transition!
        StrikeMan.message('loaded');
    },
    loaded: function(){}
});

