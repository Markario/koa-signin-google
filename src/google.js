'use strict';

const Provider    = require('koa-signin').Provider;
const axios       = require('axios');
const querystring = require('querystring');

class Google extends Provider {
	constructor(params, userMapping){
		super("google", params, userMapping);

		if(!params.clientId) throw new Error("Google Provider requires clientId");
		if(!params.callbackUrl) throw new Error("Google Provider requires callbackUrl");
		if(!params.clientSecret) throw new Error("Google Provider requires clientSecret");
	}
	
	getHelpers(){
		return {
      login: ({clientId, callbackUrl}) => () => `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${callbackUrl}&response_type=code&scope=profile%20email&prompt=select_account`,
      tokenURL: () => () => 'https://www.googleapis.com/oauth2/v4/token',
      token: ({clientId, callbackUrl, clientSecret}) => (code) => querystring.stringify({
          code: code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code'
        }),
      profile: () => (access_token) => `https://www.googleapis.com/plus/v1/people/me?access_token=${access_token}`,
    }
	}

	async login(){
		return this.login();
	}

	async token(code){
		return axios.post(this.tokenURL(), this.token(code)).then(res => res.data);
	}

	async profile(access_token){
		return axios.get(this.profile(access_token)).then(res => res.data);
	}
}

module.exports = Google;