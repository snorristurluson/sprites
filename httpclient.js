var HttpClient = function() {
    this.get = function(url, on_success, on_error) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onload = function() {
            if(anHttpRequest.status == 200) {
                console.debug(url, "finished")
                on_success(url, anHttpRequest.responseText);
            } else {
                console.debug(url, "failed", anHttpRequest.status)
                on_error(url, anHttpRequest.status);
            }
        }

        anHttpRequest.open( "GET", url, true );
        anHttpRequest.send( null );
    }
};
