/**
 * Section registry — array of section descriptors consumed by the
 * application (registers their views) and the layout (builds nav).
 */
module.exports =
[
	require('./welcome.js'),
	require('./base-components.js'),
	require('./theme.js'),
	require('./modal.js'),
	require('./code.js'),
	require('./content.js'),
	require('./markdowneditor.js'),
	require('./inlinedocumentation.js'),
	require('./form.js'),
	require('./formeditor.js'),
	require('./objecteditor.js'),
	require('./tuigrid.js'),
	require('./usermanagement.js'),
	require('./login.js'),
	require('./filebrowser.js'),
	require('./flow.js'),
	require('./histogram.js'),
	require('./equation.js'),
	require('./openseadragon.js')
]
.concat(require('./_stubs.js'));
