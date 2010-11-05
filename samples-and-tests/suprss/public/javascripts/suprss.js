Strike.onready(function(){
    Strike.Controls.titleClass = ".strike-title";
    suprss.init();
});

var suprss = {
    init : function(){
        // TODO: Should the tabbarview be more "control"y?
         // Show the tabBarView
        $.show( $(".tabBarView")[0] );
        
        //Bind the tab bar();
        Strike.Controls.bindLinkNavList(".tabBarControls li");

        // Load the data
        Manager.show("home");
    },
    updateTitle: function(title){
        $("#barTitle").innerText = title;
    }
};

Manager.addController('home', 'List', {
    label: 'Strike Mobile'
});

Manager.addController('feedlist',{
    label: 'Latest News',
    init: function(){
        var feedlist = this
        Manager.observe('preferences-changed', function(){
            feedlist.updateView();
        })
    },
    load : function(){
        $.ajax('get','/public/rss.xml', function(list){
           var data, html = "", items = list.getElementsByTagName('item')
           for ( var i = 0; i < items.length; i++ ){
                data = {}
                var date = new Date(items.item(i).querySelectorAll('pubDate')[0].firstChild.nodeValue)
                data.id = 'art'+i
                data.date = date.toLocaleDateString()
                data.title = items.item(i).querySelectorAll('title')[0].firstChild.nodeValue
                data.link = items.item(i).querySelectorAll('link')[0].firstChild.nodeValue
                data.description = items.item(i).querySelectorAll('description')[0].firstChild.nodeValue
                html += Strike.tmpl("item_tmpl",data)
            }
            $("#feedlist ul")[0].innerHTML = html
            $('.item').each(function(item){
                item.on('click',function(e){
                    //Manager.message({type : 'load', id: 'feedlist', label:'accueil', transition: 'next'})
                    $("#newsItem article")[0].innerHTML = this.querySelector("article").innerHTML
                    $.show($("#newsItem article")[0])
                    Strike.next("#newsItem");
                })
            });
            Manager.message('loaded');
        })
    },
    loaded: function(){

    }
});

Manager.addController('plus', { label: 'Help' });
