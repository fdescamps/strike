module( "Strike$" );

test( "Events", function() {
    expect(2);
    
    // Events
    var div1 = $( "#div1" ),
        click = document.createEvent( "MouseEvents" ),
        count = 0, countBubble = 0, countAt = 0;
        
    $.once( "#div1", "click", function() {
        count++
    });

    // Click twice
    click.initEvent( "click", true, true );
    div1.dispatchEvent( click );
    div1.dispatchEvent( click );
    
    equals( count, 1, "$.once for click event only fires one time." );
    count = 0;
        
    // Tests if nested divs both get event handlers added
    $.on( "#qunit-fixture div", "click", function( event ) {
        count++
        countAt += event.eventPhase === Event.AT_TARGET ? 1 : 0;
        countBubble += event.eventPhase === Event.BUBBLING_PHASE ? 1 : 0;
    });
    click.initEvent( "click", true, true );
    div1.dispatchEvent( click );

    ok( count===2 && countAt === 1 && countBubble === 1, "$.on fired for click event on nested divs" );
});