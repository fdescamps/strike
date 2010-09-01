module("Lucky$");

test("Lucky$ Basic requirements", function() {
    expect(2)
    ok( Lucky$, "Lucky$" );
    ok( $, "$" );
});

test("Lucky$()", function() {
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
    var div = $("#div1")
    div.className = "class1"
    
    ok( $.hasClass( div, "class1" ), "$.hasClass single class" )
    
    $.addClass( div, "class2" )
    ok( $.hasClass( div, "class2" ), "$.addClass single class" )
    
    $.removeClass( div, "class2" )
    ok( !$.hasClass( div, "class2"), "$.removeClass single class" )
    
    $.addClass( div, "class2 class3")
    ok( $.hasClass( div, "class3" ) && $.hasClass( div, "class2" ), "$.addClass multiple classes")

    $.removeClass( div, "class3 class2" )
    ok( !$.hasClass( div, "class3" ) && !$.hasClass( div, "class2" ), "$.removeClass multiple classes" )
});

test("DOM helpers", function(){
    var div = $("#div1")
    div.style.margin = "3px"
    
    $.css(div, "color", "red");
    equals( div.style.color, "red", "$.css set property")
    equals( $.css(div, "margin-top"), "3px", "$.css get property");
    
    var total = 0;
    $.each([1,2,3],function(item){ total += item})
    equals( total, 6, "$.each looping over an array")
    
    var spans = $("span", $("#qunit-fixture")),
        blnAllNodeTypeOne = true
    spans.each(function(item){
        blnAllNodeTypeOne &= item.nodeType === 1
    })
    ok( blnAllNodeTypeOne, "$.each looping over node list")

    // Events
    var div1 = $("#div1"),
        click = document.createEvent("MouseEvents");
    $.on( div1, "click", function(event){
        ok ( event, "$.on fired for click event on div" );
    })
    click.initEvent("click", true, true)
    div1.dispatchEvent(click);
});
