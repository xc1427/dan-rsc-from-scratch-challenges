/**
 *
 * @param {IncomingMessage} req
 * @returns {Promise}
 */
export function retrieveFormValue(req) {
  return new Promise((res, rej) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      console.info('request body is:', body);
      const formValues = new URLSearchParams(decodeEntities(body).trim());
      const formData = {};
      for (const [key, value] of formValues) {
        formData[key] = value;
      }
      console.info('submitted formData:', formData);
      res(formData);
    })
  });

}

function decodeEntities(encodedString) {
  var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
  var translate = {
      "nbsp":" ",
      "amp" : "&",
      "quot": "\"",
      "lt"  : "<",
      "gt"  : ">"
  };
  return encodedString.replace(translate_re, function(match, entity) {
      return translate[entity];
  }).replace(/&#(\d+);/gi, function(match, numStr) {
      var num = parseInt(numStr, 10);
      return String.fromCharCode(num);
  });
}