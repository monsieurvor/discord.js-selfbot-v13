'use strict';
module.exports = class CaptchaSolver {
  constructor(service, key, defaultCaptchaSolver) {
    this.service = 'custom';
    this.solver = undefined;
    this.defaultCaptchaSolver = defaultCaptchaSolver;
    this._setup(service, key);
  }
  _missingModule(name) {
    return new Error(`${name} module not found, please install it with \`npm i ${name}\``);
  }
  _setup(service, key) {
    switch (service) {
      case '2captcha': {
        if (!key || typeof key !== 'string') throw new Error('2captcha key is not provided');
        try {
          const lib = require('2captcha');
          this.service = '2captcha';
          this.solver = new lib.Solver(key);
          this.solve = (data, userAgent) =>
            new Promise((resolve, reject) => {
              const siteKey = data.captcha_sitekey;
              const postD = data.captcha_rqdata
                ? {
                    data: data.captcha_rqdata,
                    userAgent,
                  }
                : undefined;
              this.solver
                .hcaptcha(siteKey, 'https://discord.com/channels/@me', postD)
                .then(res => {
                  resolve(res.data);
                })
                .catch(reject);
            });
          break;
        } catch (e) {
          throw this._missingModule('2captcha');
        }
      case 'custom': {
        if (!key || typeof key !== 'string') throw new Error('anticaptcha key is not provided');
        try {
            const ac = require('@antiadmin/anticaptchaofficial');
            this.service = 'anticaptcha';
            this.solve = (data, userAgent) =>
                new Promise((resolve, reject) => {
                    const siteKey = data.captcha_sitekey;
                    const enterprisePayload = data.captcha_rqdata
                        ? {
                            "rqdata": data.captcha_rqdata,
                        }
                        : undefined;
                    ac.setAPIKey(key);
                    ac.setSoftId(0);
                    ac.solveHCaptchaProxyless('https://discord.com/channels/@me', siteKey, userAgent, enterprisePayload, false)
                        .then(res => {
                            resolve(res);
                        })
                        .catch(reject);
                });
            break;
        } catch (e) {
            throw this._missingModule('anticaptchaofficial');
        }
      }
      default: {
        this.solve = this.defaultCaptchaSolver;
      }
    }
  }
  solve() {}
};
