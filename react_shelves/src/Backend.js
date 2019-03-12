export function BackendURL(page, params)
{
    var url = process.env.REACT_APP_BACKEND_URL + page;
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

export function postBackend(page, params, form) {
    return fetch(BackendURL(page, params),
                 {method: 'POST', credentials: "include",
                  body: JSON.stringify(form),
                  headers: { "Access-Control-Allow-Credentials" : true,
                             "Content-Type": "application/json" } } );
}

export function uploadBackend(page, params, file) {
    var form_data = new FormData();
    form_data.append('file', file);
    return fetch(BackendURL(page, params),
                {method: 'POST', body: form_data, credentials: "include",
                 headers: { "Access-Control-Allow-Credentials" : true }});
}

export default fetchBackend;
