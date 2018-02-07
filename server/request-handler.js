var objectId = require('objectid');
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};
var saveData = {'all': []};
var requestHandler = function(request, response) {
  
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  
  var headers = defaultCorsHeaders;
  if (request.method === 'OPTIONS') {
    var statusCode = 200;
    response.writeHead(statusCode, headers);
    response.end();
  }
  var url = request.url;
  var path = url.substring(0, 9); 
  if ( path !== '/classes/') {
    var statusCode = 404;
    response.writeHead(statusCode, headers);
    response.end();
  }

  headers['Content-Type'] = 'application/json';
  if (request.method === 'GET') {
    let statusCode = 200;
    let room = url.substring(9);
    
    let responseBody;
    if (room === 'messages') {
      responseBody = {
        'results': saveData['all']
      };
    } else {
      responseBody = {
        'results': saveData[room]
      };
    }
    
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(responseBody));
  }
  if (request.method === 'POST') {
    let body = [];
    let statusCode = 201;
    request.on('data', (chunk) => {
      body.push(Buffer.from(chunk));
    });
    request.on('end', () => {
      var obj = JSON.parse(Buffer.concat(body).toString());
      obj['objectId'] = objectId();
      let room = url.substring(9);
      
      if (room !== 'messages') {
        obj['roomname'] = room;
      }
  
      if (saveData[obj['roomname']] === undefined) {
        saveData[obj['roomname']] = [obj];
      } else {
        saveData[obj['roomname']].push(obj);
      }
      saveData['all'].push(obj);

      let responseBody = {
        'objectId': obj['objectId']
      };
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify(responseBody));
    });
  }
  
}; 


exports.requestHandler = requestHandler;