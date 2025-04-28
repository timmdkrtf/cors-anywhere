const http = require('http');
const cors_proxy = require('./lib/cors-anywhere');

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8080;

const originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
const originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);

function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}

const checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

// 🚀 Custom server
const server = http.createServer(function(req, res) {
  // ✨ Tambah header CORS manual di sini
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-requested-with');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 🔥 Operkan ke CORS Anywhere
  cors_proxy.createServer({
    originBlacklist: originBlacklist,
    originWhitelist: originWhitelist,
    requireHeader: [],
    checkRateLimit: checkRateLimit,
    removeHeaders: [
      'cookie',
      'cookie2',
      'x-request-start',
      'x-request-id',
      'via',
      'connect-time',
      'total-route-time',
    ],
    redirectSameOrigin: true,
    httpProxyOptions: {
      xfwd: false,
    },
  }).emit('request', req, res);
});

server.listen(port, host, function() {
  console.log('Running CORS Anywhere with custom CORS headers on ' + host + ':' + port);
});
