module("Strike$");

test("Class manipulation", function(){
    expect(11);
    
    var div = $("#div1")
    div.className = "class1"
    
    ok( $.hasClass( div, "class1" ), "$.hasClass single class" )
    
    ok( $.hasClass( "#div1", "class1" ), "$.hasClass single class - string selector")
    
    /*div.className = "class1 class1b"
    ok( $.hasClass( "#div1", "class1b class1" ), "$.hasClass multiple classes")*/
    
    var hadClass = $.hasClass( div, "class2" );
    $.addClass( div, "class2" )
    ok( $.hasClass( div, "class2" ) && !hadClass, "$.addClass single class" )

    $.addClass( div, "class2")
    ok( !$.hasClass( div, "class2 class2" ), "$.addClass doesn't add same class twice")
    
    $.addClass( div, "class3 class4")
    ok( $.hasClass( div, "class3" ) && $.hasClass( div, "class4" ), "$.addClass multiple classes")
    
    $.addClass( "#div1", "class5")
    ok( $.hasClass( div, "class5" ), "$.addClass single class - string selector" )
    
    $.addClass( "#qunit-fixture span", "addToMultiple");
    var hasClassCount = 0;
    $.each( "#qunit-fixture span", function(item){
        console.log(item)
        if( $.hasClass( item, "addToMultiple" )){
            hasClassCount++;
        }
    });
    equals( hasClassCount, 3, "$.addClass - multiple DOM elements" );
    
    $.removeClass( div, "class2" )
    ok( !$.hasClass( div, "class2"), "$.removeClass single class" )
    
    $.removeClass( div, "class3 class1" )
    ok( !$.hasClass( div, "class1" ) && !$.hasClass( div, "class3" ), "$.removeClass multiple classes" )
    
    var hadClass = $.hasClass( div, "class5" );
    $.removeClass( "#div1", "class5" )
    ok( hadClass && !$.hasClass( div, "class5" ), "$.removeClass single class - string selector (one DOM element)" )
    
    var prevCount = $(".class1").length
    $.removeClass( ".class1", "class1" )
    ok( $(".class1").length === 0 && prevCount > 0, "$.removeClass - string selector (many DOM elements)" )
});