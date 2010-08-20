var widgetManager = {
    init: function(){
        this.bindUI();

        $(".tabBarView")[0].style.display = "block";
        Lucky.next("#actus");
    },
    bindUI: function(){
        // Stop scrolling
        document.addEventListener('touchmove', function(e){ e.preventDefault(); });
    }
}