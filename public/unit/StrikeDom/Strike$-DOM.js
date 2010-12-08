module("Strike$");

test("DOM helpers", function(){
    expect(11);
    
    // ====== CSS =======
    
    var div = $("#div1")
    div.style.margin = "3px"
    
    $.css(div, "color", "red");
    equals( div.style.color, "red", "$.css set property")
    equals( $.css(div, "margin-top"), "3px", "$.css get property");
        
    $.css("#div1", "color", "blue");
    equals( div.style.color, "blue", "$.css set property - string selector")
    
    $.css("#qunit-fixture span", "color", "blue");
    var blueSpans = 0;
    $.each( $("#qunit-fixture span"), function(item){
        if(item.style.color === "blue"){
            blueSpans++;
        }
    })
    equals(blueSpans, 3, "$.css set on multiple elements")
    
    equals( $.css("#div1", "margin-top"), "3px", "$.css get property");
    
    // ===== Hide & Show =====
    
    var isDisplayed,
        wasDisplayed = $.css("#div1", "display") == "block";
        
    $.hide("#div1");
    isDisplayed = $.css("#div1", "display") == "block";
    ok(wasDisplayed && !isDisplayed, "$.hide div element");

    wasDisplayed = isDisplayed;
    $.show("#div1");
    isDisplayed = $.css("#div1", "display") == "block";
    ok(!wasDisplayed && isDisplayed, "$.show div element");
    
    
    // ===== Each operations =====
    var total = 0;
    $.each([1,2,3],function(item){ total += item})
    equals( total, 6, "$.each looping over an array")

    total = 0
    $.each( $("#qunit-fixture span"), function(item){
        if(item.nodeType === 1){
            total++;
        }
    })
    equals( total, 3, "$.each looping over DOM nodes")
    
    total = 0
    $.each("#qunit-fixture span", function(item){
        if(item.nodeType === 1){
            total++;
        }
    })
    equals( total, 3, "$.each looping via string selector")
    
    /*
    // HTMLElement.each deprecated
    var spans = $("span", $("#qunit-fixture")),
        blnAllNodeTypeOne = true
    spans.each(function(item){
        blnAllNodeTypeOne &= item.nodeType === 1
    })
    ok( blnAllNodeTypeOne, "HTMLElement.each prototype looping over node list")
    */
    
    // Map over an array
    var inMap = [ 1, 2, 3, 4 ],
        outMap = $.map( inMap, function( item ){
            return item * 2;
        });

    var mapped = true;
    $.each( inMap, function( item, i ) {
        if( item * 2 !== outMap[ i ] ) {
            mapped = false;
        }
    });
    ok( mapped, "$.map over an array");

    // TODO: 
    $.map( "#qunit-fixture span", function( item, i ) {
        
    });
});