Strike.onready(function(){
    suprss.init()
});

var suprss = {
    init : function(){
        
        this.initViews();
        
         // Show the tabBarView
        $.show( $(".tabBarView")[0] );
             
        //Bind the tab bar();
        this.bindLinkList(".tabBarControls li");
                
        // Load the data
        Manager.message({ type:'load', id:'home', transition:'fade' });
    },
    updateTitle: function(title){
        $("#barTitle").innerText = title;
    },
    bindLinkList: function(selector){
        $(selector).each(function(item){
            $.on(item, "click", function(){
                var link = this.querySelector("a")
                Manager.message({
                    type: 'load', 
                    id: link.hash.slice(1), 
                    transition: link.className || 'show'
                })
            })
        })
    }
};

suprss.initViews = function(){
Manager.controller('home', {
    label: 'Strike Mobile',
    init: function(){
        var home = this
        Manager.observe('preferences-changed', function(){
            home.updateView()
        })
        suprss.bindLinkList('.tabBarPages #home')
        
    },
    load : function(){
        suprss.updateTitle(this.label);
        Manager.message('loaded')
    },
    reload : function(){
        this.updateView()
    },
    updateView : function(){

    }
});

Manager.controller('feedlist',{
    label: 'Latest News',
    init: function(){
        var feedlist = this
        Manager.observe('preferences-changed', function(){
            feedlist.updateView()
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
        alert('here');
         suprss.updateTitle(this.label);
    },
    reload : function(){
        this.updateView()
    },
    updateView : function(){

    }
});

Manager.controller('plus', {
    label: 'Help',
    init: function(){
        var home = this
        Manager.observe('preferences-changed', function(){
            home.updateView()
        })
    },
    load : function(){
        Manager.message('loaded')
        suprss.updateTitle(this.label);
    },
    reload : function(){
        this.updateView()
    },
    updateView : function(){
       
    }
});
};