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

export default fetchBackend;
