module("Strike core");

test("Strike basic requirements", function() {
    expect(1)
    ok( Strike, "Strike" );
});

test("Templating", function() {
    expect(5);
    
    var data = {
        title: "A test of templating",
        date: "1/1/2049",
        description: "A test. A test of the templating system. Of ours."
    }
    var content = Strike.tmpl("simple_template", data);
    ok( content && content.indexOf("A test of templating") > -1, "Strike.tmpl with object literal" );
    
    Strike.template("#template-container", "simple_template", data);
    
    var result = $("#template-container article span");
    equals( result[0] && result[0].innerText === "A test of templating", true, "Strike.template with object literal" );
    
    var postData = [
        { title: "A looping test 1", date: "1/1/2049", description: "A test. The first in a loop." },
        { title: "A looping test 2", date: "2/1/2049", description: "A test. The second in a loop." },
        { title: "A looping test 3", date: "3/1/2049", description: "A test. The third in a loop." }
    ]
    Strike.template("#template-container", "looping_template", { posts: postData });
    result = $("#template-container article span");
    
    equals( result.length === 3 && result[2].innerText === "A looping test 3", true, "Strike.template with javascript loop" );
    
    // ==== Multiple objects ====
    var containers = Strike.template(".container", "looping_template", { posts: postData });
    equals( containers.length, 3, "Strike.template returns multiple elements");
    var added = 0;
    $.each(containers, function(container){
        result = $("#template-container article span");
        if(result.length === 3 && result[2].innerText === "A looping test 3"){
            added++;
        }
    })
    equals(added, 3, "Strike.template on multiple elements");
    
});