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
            url += '?' + Object.entries(data).map(
                entry => entry.map(encodeURIComponent).join('=')
            ).join('&');
        } else {
            formData = new FormData();
            Object.entries(options.data).forEach(v =>{
                const key = v[0];
                const value = v[1];
                console.log( `${key}: ${value}` );
                formData.append(key, value);
            } );

            //formData.append( 'mail', 'ivan@biz.pro' );
            //formData.append( 'password', 'odinodin' );

        }
    }

    if (options.callback) {
        xhr.onload = () => {
            let err = null;
            let resp = null;
            try {
                if (xhr.response?.success) {
                    resp = xhr.response;
                } else {
                    err = xhr.response;
                }
            }  catch(e) {
                err = e;
            }
            options.callback(err, resp);
        }
        xhr.open(options.method, url);
        xhr.send(formData);
    }
};
