module("Lucky$");

test("Lucky$ Basic requirements", function() {
    expect(2)
    ok( Lucky$, "Lucky$" );
    ok( $, "$" );
});

test("Lucky$()", function() {
    expect(5);
    
    var div = $("#div1");
    equals( div.id, "div1", "#id Selector" );
    
    var div2 = $("body div#div1");
    equals( div2, div, "body el#id Selector" );

    var els = $(".class1");
    equals( els.length, 3, ".class Selector" );
    
    equals( div, $("#div1"), "object selector")
    
    var p = $("p.class1")[0];
    var spans = $("span", p);
    equals( spans.length, 2, "Context Selector")
});

test("Class manipulation", function(){
    expect(11);
    
    var div = $("#div1")
    div.className = "class1"
    
    ok( $.hasClass( div, "class1" ), "$.hasClass single class" )
    
    ok( $.hasClass( "#div1", "class1" ), "$.hasClass single class - string selector")
    
    /*div.className = "class1 class1b"
    ok( $.hasClass( "#div1", "class1b class1" ), "$.hasClass multiple classes")*/
    
    $.addClass( div, "class2" )
    ok( $.hasClass( div, "class2" ), "$.addClass single class" )
    
    $.addClass( div, "class2")
    ok( !$.hasClass( div, "class2 class2" ), "$.addClass doesn't add same class twice")
    
    $.addClass( div, "class3 class4")
    ok( $.hasClass( div, "class3" ) && $.hasClass( div, "class4" ), "$.addClass multiple classes")
    
    $.addClass( "#div1", "class5")
    ok( $.hasClass( div, "class5" ), "$.addClass single class - string selector" )
    
    $.addClass( "#qunit-fixture span", "addToMultiple");
    var hasClassCount = 0;
    $.each( "#qunit-fixture span", function(item){
        if( $.hasClass( item, "addToMultiple" )){
            hasClassCount++;
        }
    });
    equals( hasClassCount, 3, "$.addClass - multiple DOM elements" );
    
    $.removeClass( div, "class2" )
    ok( !$.hasClass( div, "class2"), "$.removeClass single class" )
    
    $.removeClass( div, "class3 class1" )
    ok( !$.hasClass( div, "class1" ) && !$.hasClass( div, "class3" ), "$.removeClass multiple classes" )
    
    $.removeClass( "#div1", "class5" )
    ok( !$.hasClass( div, "class5" ), "$.removeClass single class - string selector (one DOM element)" )
    
    var prevCount = $(".class1").length
    $.removeClass( ".class1", "class1" )
    ok( $(".class1").length === 0 && prevCount > 0, "$.removeClass - string selector (many DOM elements)" )
});

test("DOM helpers", function(){
    expect(10);
    
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
    
    var spans = $("span", $("#qunit-fixture")),
        blnAllNodeTypeOne = true
    spans.each(function(item){
        blnAllNodeTypeOne &= item.nodeType === 1
    })
    ok( blnAllNodeTypeOne, "HTMLElement.each prototype looping over node list")

    // Events
    var div1 = $("#div1"),
        click = document.createEvent("MouseEvents"),
        count = 0, countBubble = 0, countAt = 0;
        
    // Tests if nested divs both get event handlers added
    $.on("#qunit-fixture div", "click", function(event){
        console.log(event, event.eventPhase, event.target.getAttribute("id"))
        count++
        countAt += event.eventPhase === Event.AT_TARGET ? 1 : 0;
        countBubble += event.eventPhase === Event.BUBBLING_PHASE ? 1 : 0;
    })
    click.initEvent("click", true, true)
    div1.dispatchEvent(click);

    ok (count===2 && countAt === 1 && countBubble === 1, "$.on fired for click event on nested divs");
});

asyncTest("AJAX", function() {
    expect(2);
    
    stop()
    $.ajax("GET", "resources/testJSON.js", function(items){
        ok(items.length === 2 && items[0].id === 1, "$.ajax GET JSON request")
        start()
    })

    var ajaxOptions = {
        type: "HTML",
        url: "resources/testHTML.html",
        method: "GET",
        success: function( content ){
            ok(content.indexOf("Lucky") > -1, "$.ajax GET HTML request - option bundle")
            start()
        }
    };
    $.ajax(ajaxOptions);
    
    // TODO: XML test
    // TODO: POST test
});
