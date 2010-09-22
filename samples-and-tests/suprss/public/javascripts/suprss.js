Lucky.onready(function(){
    suprss.init()
});

var suprss = {
    init : function(){
         // Show the tabBarView
        $.show( $(".tabBarView")[0] );
             
        //Bind the tab bar();
        $(".tabBarControls li").each(function(item){
            $.on(item, "click", function(){
                Manager.message({
                    type: 'load', 
                    id: this.querySelector("a").hash.slice(1), 
                    transition: 'show'
                });
            })
        })
        
        // Load the data
        Manager.message({type:'load', id:'feedlist', transition:'fade'});
    }
};

Manager.controller('feedlist',{
    label: 'feed list',
    init: function(){
        var home = this
        Manager.observe('preferences-changed', function(){
            home.updateView()
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
                html += Lucky.tmpl("item_tmpl",data)
            }
            $("li")[0].innerHTML = html
            $('.item').each(function(item){
                item.on('click',function(e){
                    //Manager.message({type : 'load', id: 'feedlist', label:'accueil', transition: 'next'})
                    $("#newsItem article")[0].innerHTML = this.querySelector("article").innerHTML
                    $.show($("#newsItem article")[0])
                    Lucky.next("#newsItem");
                })
            });
            Manager.message('loaded');
        })
    },
    reload : function(){
        this.updateView()
    },
    updateView : function(){

    }
});

var Plus = Manager.controller('plus',{
    label: 'plus label',
    init: function(){
        var home = this
        Manager.observe('preferences-changed', function(){
            home.updateView()
        })
    },
    load : function(){
        Manager.message('loaded')
    },
    reload : function(){
        this.updateView()
    },
    updateView : function(){

    }
});

/*
var home = new (Lucky.Controller.extend({
        constructor : function(id, label){
            var home = this
            Manager.observe('preferences-changed', function(){
                home.updateView()
            })
            this.base(id, label)
        },
        load : function(){
            suprss.loadItems();
        },
        reload : function(){
            this.updateView()
        },
        updateView : function(){

        },
        /* 3 steps synchron * /
        firstStart : function(){
            Manager.message({type : 'startLoading', loadingMessage : 'Recherche.velopartage'})
            $('#help').style.display = 'block'
            // geoloc citie near
            Manager.message('loaded')
        }
    }))('feedlist','feedlist');
*/