export function BackendURL(page, params)
{
    var url = "http://127.0.0.1:5000/" + page;
    var first = true;
    for (var p in params) {
        url += (first ? "?" : "&") + p + "=" + params[p];
        first = false;
    }
    return url;
}

export function fetchBackend(page, params) {
    return fetch(BackendURL(page, params),
      {credentials: "include", headers: { "Access-Control-Allow-Credentials" : true } } );
}

export function uploadBackend(page, params, file) {
    var form_data = new FormData();
    form_data.append('file', file);
    return fetch(BackendURL(page, params),
                {method: 'POST', body: form_data, credentials: "include",
                 headers: { "Access-Control-Allow-Credentials" : true }});
}

export default fetchBackend;
