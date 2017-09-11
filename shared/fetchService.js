class FetchService {

    static async fetch(url, payload, method, options) {

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

        const response = await fetch(url, newOptions);

        if (response.status !== 200) {
            const json = await response.json();
            throw json;
        }
        if (response.headers.get('content-type') === 'application/json' && response.headers.get('content-length') > 0) {
            return await response.json();
        }
        return {};
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