/* 
    Welcome to heart of STRIKE! - and your application.

    We've set up a basic template for you to use - but it is very 
    "delete-key friendly"... just remove anything that you don't 
    want. Below is a description of what is here, and what it does,
    but see the docs for information.

    1. The mobileApp object. It's not required, and not a part of 
       Strike - but keeps things tidy. Just make you sure you show 
       something when your app is ready to go: 
       StrikeMan.show("{div to show}")

    2. The "application managers". you can have 0 or more of 
       them. Typically each controller will map to a div with
       class "strike-page" (like the "home" controller below).

       The internal controller will call methods on your managers
       to let you know when things happen. All methods are 
       optional (delete them if you don't need them!) :

       "ready": Called on DOM ready
       "load": Called when called by the manager. When you are 
       finished loading, call StrikeMan.message('loaded').
       "loaded": Called after the load, and the transition 
       completes.
*/
var mobileApp = {
    init: function() {
        StrikeMan.show("home");
    }
};

StrikeMan.add("home", {
    ready: function() {},
    load: function() {
        // Don't forget to tell Strike when you are ready to transition!
        StrikeMan.message("loaded");
    },
    loaded: function() {}
});