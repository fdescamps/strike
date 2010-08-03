var widgetManager = {
    data: null,
    init: function( widgetData ){
        this.data = widgetData;
        this.bindUI();

        $(".tabBarView")[0].style.display = "block";
        
        Lucky.show("#actus");
    },
    bindUI: function(){
        // Stop scrolling
        document.addEventListener('touchmove', function(e){ e.preventDefault(); });
        
        var _this = this;
        var toggle = widgetManager.togglePlusBox;
        $("#btnActus").on("click", function(){ toggle(false);  _this.loadWidget("actus"); });
        $("#btnPractique").on("click", function(){ toggle(false); Lucky.show("#practique") });
        $("#btnEmploi").on("click", function(){ toggle(false); _this.loadWidget("emploi");  });
        $("#btnTransport").on("click", function(){ toggle(false); _this.loadWidget("transport");  });

        $("#btnPlus").on("click", function(){ widgetManager.togglePlusBox(); });
        $("#plus").on("click", function(){ this.style.display = "none"; });
    },
    togglePlusBox : function( blnShow ){
        var plusBox = $("#plus"),
            doShow;
        doShow = blnShow || blnShow === false ? blnShow : plusBox.style.display == "block" ? false : true;
        plusBox.style.display = doShow ? "block" : "none";
    },
    
    loadWidget: function( name ){
        // TODO: get real data!
        var widget = this.data[ name ];
        
        // Show Overlay
        
        // Do Ajax to fetch feed
        $ajax( "GET", widget.url, function( widgetData ){
            // TODO: get real data!
            widgetData = tmpPageData[ name ];
            
            // Fill the templates
            if(widgetData){
                $("#" + name + "_content").innerHTML = tmpl( name + "_tmpl", widgetData );
                bindListNavLinks( "#" + name + "_content .listNavView li" );
            }
            // Hide overlay
            
            // Show the page
            Lucky.show("#" + name);
        });
    }
}