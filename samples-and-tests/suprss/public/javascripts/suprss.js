Lucky.onready(function(){suprss.init()});
suprss = {
    init : function(){
        // Temporary test for emulator rotation
        Lucky.onorientationchange(function( orientation ){
            console.log( orientation )
        });
        
        Lucky.controls.bindTabBarNav();
        
        $(".tabBarView")[0].style.display = "block"; // Show the tabBarView
        Lucky.fade("#feedlist");
        this.loadItems()
    },
    loadItems : function(){
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
                        /*
                            if ($hasClass(this, 'active')){
                                $removeClass(this, 'active')
                            } else {
                                $('.active').each(function(el){$removeClass(el, 'active')})
                                $addClass(this, 'active')
                            }*/
                        $("#newsItem article")[0].innerHTML = this.querySelector("article").innerHTML
                        $("#newsItem article")[0].style.display = 'block'
                        Lucky.next("#newsItem");
                    })
                })
            })
    }
};