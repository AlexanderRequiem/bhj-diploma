/**
 * Основная функция для совершения запросов
 * на сервер.
 * */
const createRequest = (options = {}) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    let formData = null;

    let url = options.url;
    if (options.data) {
        if (options.method === 'GET') {
            url += '?' + Object.entries(options.data).map(
                entry => entry.map(encodeURIComponent).join('='))
                    .join('&');
        } else {
            formData = new FormData();
            Object.entries(options.data).forEach(v => formData.append(v[0], v[1]));
        }
    }

    if (options.callback) {
        xhr.onload = () => {
            let err = null;
            let resp = null;
            if (xhr.response?.success) {
                resp = xhr.response;
            } else {
                err = xhr.response;
            }
            options.callback(err, resp);
        }
        
        try {
        xhr.open(options.method, url);
        xhr.send(formData);
        }  catch(e) {
            console.log('An error occurred while executing the request:' + e );
        }
    }
};
