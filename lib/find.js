const request = require('request');
const {parseString} = require('xml2js');
const {get, forEach} = require('lodash');

module.exports = (filePath = '') => {
  return new Promise((resolve, reject) => {
    request(Object.assign({}, global.argv.request, {
      headers: {
        Depth: 1
      },
      uri: `/${filePath}`,
      method: 'PROPFIND'
    }), (err, res, body) => {
      if (err) {
        return reject(err);
      }

      if (res.statusCode >= 400) {
        return reject(new Error(res.statusMessage));
      }

      parseString(body, (err, res) => {
        if (err) {
          return reject(err);
        }

        resolve(res.multistatus.response.map(file => {
          const info = get(file, 'propstat.0.prop.0');
          forEach(info, (value, name) => {
            info[name] = get(value, '0');
          });
          return info;
        }));
      });
    });
  });
};