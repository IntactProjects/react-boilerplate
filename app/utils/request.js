import 'whatwg-fetch';
import isPlainObject from 'lodash/isPlainObject';
import isArray from 'lodash/isArray';

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response) {
  return response.text().then(text => {
    try {
      const jsonResponse = JSON.parse(text);
      return { response, jsonResponse };
    } catch (err) {
      return { response, jsonResponse: text };
    }
  });
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */
function checkStatus(response, jsonResponse) {
  if (response.status >= 200 && response.status < 300) {
    return jsonResponse;
  }
  const error = new Error(response.statusText);
  error.response = response;
  error.responseJSON = jsonResponse || {};
  error.responseJSON.statusCode = response.status;
  throw error;
}

/**
 * Requests a URL, returning a promise
 * @param  {string} url         The URL we want to request
 * @param  {object} callOptions The options we want to pass to "fetch"
 * @return {object}             The response data
 */
export default function request(url, callOptions = null) {
  const prefix =
    process.env.NODE_ENV === 'development' && url.startsWith('/')
      ? process.env.API_URL
      : '';
  let pUrl = prefix + url;
  const options = Object.assign(
    {
      headers: {},
      mode: 'cors',
      // credentials: 'include',
    },
    callOptions,
  );
  // method is GET
  if (
    typeof options.method !== 'string' ||
    options.method.toUpperCase() === 'GET'
  ) {
    // IE browsers: fix XHR cache
    if (
      typeof navigator !== 'undefined' &&
      /msie|trident|edge/i.test(navigator.userAgent)
    ) {
      if (!isPlainObject(options.params)) {
        options.params = {};
      }
      // options.params = Object.assign(options.params, { nocache: Date.now() });
    }
    // handle possible params
    if (isPlainObject(options.params)) {
      if (Object.keys(options.params).length) {
        const query = Object.keys(options.params)
          .map(
            key =>
              `${encodeURIComponent(key)}=${encodeURIComponent(
                options.params[key],
              )}`,
          )
          .join('&');

        pUrl += `?${query}`;
      }

      delete options.params;
    }
  }

  if (!options.bypassBodyControls) {
    if (isPlainObject(options.body)) {
      if (options.type === 'formUrlEncoded') {
        let data = '';
        Object.keys(options.body).forEach(key => {
          data += `${key}=${options.body[key]}&`;
        });
        data = data.slice(0, -1);
        options.headers['Content-Type'] =
          'application/x-www-form-urlencoded; charset=utf-8';
        options.body = data;
      } else {
        options.body = JSON.stringify(options.body);
        options.headers['Content-Type'] = 'application/json';
      }
    } else if (isArray(options.body)) {
      options.body = JSON.stringify(options.body);
      options.headers['Content-Type'] = 'application/json';
    } else if (options.method === 'POST') {
      options.body = {};
      options.headers['Content-Type'] = 'application/json';
    }
  } else {
    delete options.bypassBodyControls;
  }

  options.headers['Accept-Language'] = 'fr-FR';

  return fetch(pUrl, options)
    .then(parseJSON)
    .then(({ response, jsonResponse }) => checkStatus(response, jsonResponse));
}