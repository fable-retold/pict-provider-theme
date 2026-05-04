/**
 * Welcome — first-page intro panel.  Plain pict-view with a static template.
 */
const libPictView = require('pict-view');

const VIEW_ID = 'Playground-Welcome';
const TARGET_ID = 'Playground-Welcome-Destination';

class PictViewPlaygroundWelcome extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = {
	id: 'welcome',
	name: 'Welcome',
	group: 'Overview',
	module: null,
	ViewIdentifier: VIEW_ID,
	ViewClass: PictViewPlaygroundWelcome,
	DestinationId: TARGET_ID,
	ViewConfiguration:
	{
		ViewIdentifier: VIEW_ID,
		DefaultRenderable: 'Playground-Welcome-Content',
		DefaultDestinationAddress: '#' + TARGET_ID,
		AutoRender: false,
		Templates:
		[
			{
				Hash: 'Playground-Welcome-Content',
				Template: /*html*/`
<div class="pg-welcome">
	<h2>pict-provider-theme Playground</h2>
	<p>Edit tokens, CSS, or imagery on the right. Pick a theme + mode at the top. Browse component sections on the left.</p>
	<p>Every <code>pict-section-*</code> module is wired through the proper PictApplication init lifecycle, so each section's <code>onBeforeInitialize</code> / <code>onAfterInitializeAsync</code> / <code>onAfterInitialize</code> fires at app boot.</p>
	<p>The <strong>Base Components</strong> page is a hand-rendered kitchen-sink that uses only <code>--theme-*</code> custom properties.</p>
</div>`
			}
		],
		Renderables:
		[
			{
				RenderableHash: 'Playground-Welcome-Content',
				TemplateHash: 'Playground-Welcome-Content',
				DestinationAddress: '#' + TARGET_ID,
				RenderMethod: 'replace'
			}
		]
	}
};
