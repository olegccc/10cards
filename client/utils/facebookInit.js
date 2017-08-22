export default class FacebookInit {

    static init() {

        return new Promise((resolve, reject) => {

            window.fbAsyncInit = function() {

                FB.init({
                    appId: '161901184376578',
                    cookie: true,
                    xfbml: true,
                    version: 'v2.8'
                });

                FB.AppEvents.logPageView();

                FB.getLoginStatus(function(response) {
                    resolve(response);
                }.bind(this));
            }.bind(this);

            // Load the SDK asynchronously
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = "//connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));

        });
    }

    static login() {

        return new Promise(resolve => {

            FB.login(function(response) {

                resolve(response);
            });
        });
    }
}