(function () {
    /*
     * create 'share on twitter' popup window with the current url
     */
    function _popupWindow (url, title, w, h) {
        // Borrowed from rrssb
        // Fixes dual-screen position                         Most browsers      Firefox
        var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screen.left
        var dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screen.top

        var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : window.screen.width
        var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : window.screen.height

        var left = ((width / 2) - (w / 2)) + dualScreenLeft
        var top = ((height / 3) - (h / 3)) + dualScreenTop

        var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left)

        // Puts focus on the newWindow
        if (window.focus) {
          newWindow.focus()
        }
    }
    function _onClickTwitter (event) {
        event.preventDefault();
        var link = _buildTwitterLink();
        _popupWindow(link, 'Twitter', 580, 470);
    }

    function _buildTwitterLink () {
        var base = 'https://twitter.com/intent/tweet';
        var url = encodeURIComponent(window.location.href);
        var text;
        var params;
     
        text = encodeURIComponent('Averigua donde están las gasolineras más economicas, via @mappingandco');

        params = '?text=' + text + '&url=' + url;
        return base + params;
    }

    var twitterButton = document.getElementById("twitter");
    twitterButton.addEventListener("click", _onClickTwitter, false);

}());