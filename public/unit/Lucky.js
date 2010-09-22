module("Lucky core");

test("Lucky basic requirements", function() {
    expect(1)
    ok( Lucky, "Lucky" );
});

test("Templating", function() {
    expect(3);
    
    var data = {
        title: "A test of templating",
        date: "1/1/2049",
        description: "A test. A test of the templating system. Of ours."
    }
    var content = Lucky.tmpl("simple_template", data);
    ok( content && content.indexOf("A test of templating") > -1, "Lucky.tmpl with object literal" );
    
    Lucky.template("template-container", "simple_template", data);
    var result = $("#template-container article span");
    equals( result[0] && result[0].innerText === "A test of templating", true, "Lucky.template with object literal" );
    
    var postData = [
        { title: "A looping test 1", date: "1/1/2049", description: "A test. The first in a loop." },
        { title: "A looping test 2", date: "2/1/2049", description: "A test. The second in a loop." },
        { title: "A looping test 3", date: "3/1/2049", description: "A test. The third in a loop." }
    ]
    Lucky.template("template-container", "looping_template", { posts: postData });
    var result = $("#template-container article span");
    equals( result.length === 3 && result[2].innerText === "A looping test 3", true, "Lucky.template with javascript loop" );
});