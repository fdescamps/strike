Strike.onready( function() {
    Demo.init();
});

var Demo = {
    articles: [],
    init: function(){
        StrikeMan.show( 'suprss' );
    },
    setArticles: function( list ){
        var getNode = function( nodeName, nodeObj ){
            return $( nodeName, nodeObj )[ 0 ].firstChild.nodeValue;
        };
        
        return this.articles = $.map( list, function( item, index ) {
            return {
                id: 'article_' + index,
                date: ( new Date( getNode( 'pubDate', item ) ) ).toLocaleDateString(),
                title: getNode( 'title', item ),
                link: getNode( 'link', item ),
                description: getNode( 'description', item )
            };
        });
    }
};

// === Main tab bar view ===
StrikeMan.add( 'suprss', {
    ready: function() {
        StrikeCon.titleClass = '.strike-title';
        StrikeCon.bindLinkNavList( '.tabBarControls', false );
    },
    loaded: function() {
        StrikeMan.show( 'home' );
    }
});

// === Home page : extends List ===
StrikeMan.add( 'home', 'List', { label: 'Strike Mobile' });

// === Feed list ===
StrikeMan.add( 'feedlist', {
    label: 'Latest News',
    load : function() {
        var feedlist = this;
        $.ajax( 'get', '/public/rss.xml', function( list ) {
            var items = list.getElementsByTagName( 'item' );
            feedlist.renderList( Demo.setArticles( items ) );
        });
    },

    renderList: function( list ) {
        var container = Strike.template( '#feedlist ul', "item_tmpl", { items: list } );
        this.bindClick( container[0] );
        StrikeMan.message( 'loaded' );
    },

    bindClick: function( list ) {
        var items = $( '.item', list );
        $.each( items, function( item ) {
            $.on( item, 'click', function( e ) {
                StrikeMan.message({ 
                    type: 'load', 
                    id: 'newsItem', 
                    transition: 'next',
                    data: { id: this.id }
                });
            });
        });
    }
});

// === News Item ===
StrikeMan.add( 'newsItem', {
    load: function( data ){
        var article = Demo.articles[ data.id.split( "_" )[ 1 ] ];
        Strike.template( '#' + this.id + ' article', "article_tmpl", article );
        StrikeMan.message( 'loaded' );
    }
});

// === Plus page ==
StrikeMan.add('plus', { label: 'Help' });
