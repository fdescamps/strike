module("Strike$");

asyncTest("AJAX", function() {
    expect(3);
    
    stop()
    $.ajax("GET", "/public/unit/resources/testJSON.js", function(items){
        ok(items.length === 2 && items[0].id === 1, "$.ajax GET JSON request")
        start()
    })

    var ajaxOptions = {
        type: "HTML",
        url: "/public/unit/resources/testHTML.html",
        method: "GET",
        success: function( content ){
            ok(content.indexOf("Strike") > -1, "$.ajax GET HTML request - option bundle")
            start()
        },
        complete: function(){
            ok(true, "Complete handler ran.")
        }
    };
    $.ajax(ajaxOptions);
    
    // TODO: XML test
    // TODO: POST test
});
