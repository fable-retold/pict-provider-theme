/**
 * Tiny static server for the playground's dist/ directory.
 *
 * Default port 8080.  Override with PLAYGROUND_PORT env var or first arg.
 */
const libPath = require('path');
const libHTTPServer = require('http-server');

const DIST = libPath.join(__dirname, 'dist');
const PORT = parseInt(process.argv[2] || process.env.PLAYGROUND_PORT || '8080', 10);

let tmpServer = libHTTPServer.createServer(
{
	root: DIST,
	cache: -1,
	cors: true
});

tmpServer.listen(PORT, '0.0.0.0', () =>
{
	process.stdout.write('Theme playground serving from ' + DIST + '\n');
	process.stdout.write('Open http://localhost:' + PORT + '/\n');
});
