import axios from 'react-native-axios';
const API_URL = 'https://79f7-180-190-29-69.ngrok-free.app/api/';

export class Request {
	constructor(bearer = null) {
		this.axios = axios.create({
			baseURL: API_URL
		});

		if (bearer) {
			this.axios.defaults.headers.common['Authorization'] = `Bearer ${bearer}`;
		}

		this.axios.defaults.headers.common['Content-Type'] = `application/json`;
		this.axios.defaults.headers.common['Accept'] = `application/json`;
    this.axios.defaults.headers.common['Access-Control-Allow-Origin'] = `*`;
    // this.axios.defaults.headers.common['LEIM-SECRET-KEY'] = `09ba420c84eae09e049fcd932eeb09899cd0452c`;
	}
  
	get(url, opts) {
		return this.res('get', url, opts);
	}

	post(url, data, opts) {
		return this.res('post', url, data, opts);
	}

	put(url, data, opts) {
		return this.res('put', url, data, opts);
	}

	del(url, opts) {
		return this.res('delete', url, opts);
	}

	async res(method, url, payload, config) {
		url = `${API_URL}${url}`;
    console.log(`Request: ${url}`);
		var data, error, resp;
		try {
			resp = await this.axios[method](url, payload, config);
      // console.log(resp)
			if (resp && resp.data) {
				data = resp.data.data;
				error = (config && config.errorData) ?  resp.data : resp.data.error;
			}
		} catch (e) {
			if (e && e.response) {
				error = (config && config.errorData) ?  e.response.data : e.response.data.error;
				if (!error) {
					error = e.response.data.message;
				}
			} else {
				console.log(e);
			}
		}
		return [data, error];
	}
}
