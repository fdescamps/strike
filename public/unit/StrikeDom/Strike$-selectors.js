module("Strike$");

test("Strike$ Basic requirements", function() {
    expect(2)
    ok( Strike$, "Strike$" );
    ok( $, "$" );
});

test("Strike$()", function() {
    expect(7);
    
    var div = $("#div1");
    equals( div.id, "div1", "#id Selector" )
    
    var div2 = $("body div#div1")
    equals( div2, div, "body el#id Selector" )

    var els = $(".class1");
    equals( els.length, 3, ".class Selector" )
    
    equals( div, $("#div1"), "object selector")
    
    equals( $("#div2 div").length, 1, "#id div: id with element child");
    equals( $("#div2 #div1").length, 1, "#id #id2: id with id child");
    
    var p = $("p.class1")[0];
    var spans = $("span", p);
    equals( spans.length, 2, "Context Selector")
});