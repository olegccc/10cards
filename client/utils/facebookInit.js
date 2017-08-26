export default class FacebookInit {

    static init() {

        return new Promise((resolve, reject) => {

            window.fbAsyncInit = function() {

                try {
                    FB.init({
                        appId: '161901184376578',
                        cookie: true,
                        xfbml: true,
                        version: 'v2.8'
                    });

                    FB.AppEvents.logPageView();

                    FB.getLoginStatus(resolve);

                } catch (error) {
                    reject(error);
                }

            };

            let scriptElement = document.createElement('script');
            scriptElement.src = "//connect.facebook.net/en_US/sdk.js";

            let fjs = document.getElementsByTagName('script')[0];
            fjs.parentNode.insertBefore(scriptElement, fjs);
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