const libPictSectionOSD = require('pict-section-openseadragon');
const { buildSection } = require('./_wrapper.js');

const SAMPLE_TILE_SOURCE =
{
	type: 'image',
	url: 'data:image/svg+xml;utf8,' + encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">' +
		'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3357c7"/><stop offset="1" stop-color="#c75033"/></linearGradient></defs>' +
		'<rect width="800" height="600" fill="url(#g)"/>' +
		'<text x="400" y="290" font-family="sans-serif" font-size="42" fill="#fff" text-anchor="middle">OpenSeadragon</text>' +
		'<text x="400" y="340" font-family="sans-serif" font-size="22" fill="#ffffffcc" text-anchor="middle">scroll to zoom &middot; drag to pan</text>' +
		'</svg>')
};

module.exports = buildSection({
	id: 'openseadragon', name: 'OpenSeadragon Viewer', group: 'Visualization', module: 'pict-section-openseadragon',
	WrapperViewId: 'Playground-OSDWrapper',
	WrapperTargetId: 'Playground-OSDWrapper-Destination',
	InnerViewId: 'Playground-OSD',
	InnerTargetId: 'OpenSeaDragon-Container-Div',
	InnerViewClass: libPictSectionOSD,
	InnerContainerStyle: 'min-height: 360px; background: var(--theme-color-background-primary);',
	Title: 'pict-section-openseadragon',
	Blurb: 'High-resolution / deep-zoom image viewer. <code>OpenSeadragon</code> + the Annotorious plugin family are loaded via <code>&lt;script&gt;</code> tags in <code>index.html</code>.',
	InnerViewConfiguration: { TileSources: SAMPLE_TILE_SOURCE }
});
