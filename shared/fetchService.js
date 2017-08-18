class FetchService {

    static fetch(url, payload, method, options) {

        let newOptions = Object.assign({}, options, {
            method: method,
            headers: Object.assign({}, (options && options.headers) || {}, {
                accept: 'application/json'
            })
        });

        if (payload) {
            newOptions.body = JSON.stringify(payload);
            newOptions.headers['Content-Type']  = 'application/json';
        }

        return fetch(url, newOptions).then(function(response) {
            if (response.status !== 200) {
                return Promise.reject(response.statusText);
            }
            if (response.headers.get('content-type') === 'application/json' && response.headers.get('content-length') > 0) {
                return response.json();
            }
            return Promise.resolve({});
        });
    }

    static get(url, options) {
        return this.fetch(url, null, 'GET', options);
    }

    static post(url, payload, options) {
        return this.fetch(url, payload, 'POST', options);
    }

    static put(url, payload, options) {
        return this.fetch(url, payload, 'PUT', options);
    }

    static delete(url, payload, options) {
        return this.fetch(url, payload, 'DELETE', options);
    }
}

export default FetchService;