/**
 * pict-section-code — CodeJar editor.  Section now consumes
 * --theme-* tokens directly (with hardcoded fallbacks for non-themed
 * apps), so no playground-side override is needed any more.
 */
const libPictView = require('pict-view');
const libPictSectionCode = require('pict-section-code');

const SECTION_VIEW_ID = 'Playground-CodeEditor';
const WRAPPER_VIEW_ID = 'Playground-CodeWrapper';
const TARGET_ID = 'Playground-CodeWrapper-Destination';
const CODE_TARGET_ID = 'Playground-Code-Container';

class PictViewPlaygroundCodeWrapper extends libPictView
{
	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();
		let tmpInner = this.pict.views[SECTION_VIEW_ID];
		if (tmpInner)
		{
			tmpInner.initialRenderComplete = false;
			try { tmpInner.render(); }
			catch (pErr)
			{
				let tmpDest = document.getElementById(CODE_TARGET_ID);
				if (tmpDest) tmpDest.innerHTML = '<p style="color:var(--theme-color-status-warning);">Inner render failed: ' + pErr.message + '</p>';
			}
		}
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = {
	id: 'code',
	name: 'Code Editor',
	group: 'Editor',
	module: 'pict-section-code',
	ViewIdentifier: WRAPPER_VIEW_ID,
	ViewClass: PictViewPlaygroundCodeWrapper,
	DestinationId: TARGET_ID,
	ViewConfiguration:
	{
		ViewIdentifier: WRAPPER_VIEW_ID,
		DefaultRenderable: 'Playground-CodeWrapper-Content',
		DefaultDestinationAddress: '#' + TARGET_ID,
		AutoRender: false,
		Templates:
		[
			{
				Hash: 'Playground-CodeWrapper-Content',
				Template: /*html*/`
<h2 class="pg-section-title">pict-section-code</h2>
<p class="pg-section-blurb">CodeJar-based code editor with a custom syntax highlighter. The section ships a hardcoded ATOM-One-Light palette; the playground bridges every syntax color to <code>var(--theme-*)</code>.</p>
<div class="gallery-card">
	<div id="${CODE_TARGET_ID}" style="height: 320px; border: 1px solid var(--theme-color-border-default); border-radius: var(--theme-radius-md);"></div>
</div>`
			}
		],
		Renderables:
		[
			{
				RenderableHash: 'Playground-CodeWrapper-Content',
				TemplateHash: 'Playground-CodeWrapper-Content',
				DestinationAddress: '#' + TARGET_ID,
				RenderMethod: 'replace'
			}
		]
	},

	setup: function (pPict)
	{
		try
		{
			pPict.addView(SECTION_VIEW_ID, {
				ViewIdentifier: SECTION_VIEW_ID,
				DefaultDestinationAddress: '#' + CODE_TARGET_ID,
				TargetElementAddress: '#' + CODE_TARGET_ID,
				AutoRender: false,
				Language: 'javascript',
				ReadOnly: false,
				LineNumbers: true,
				DefaultCode: "// pict-section-code embedded in the theme playground.\n// Syntax colors below are themed via var(--theme-*) — switch\n// theme + mode at the top to see them follow.\n\nfunction greet(pName)\n{\n\tlet tmpGreeting = `Hello, ${pName}!`;  // template literal\n\tconsole.log(tmpGreeting);\n\treturn tmpGreeting;\n}\n\nconst NUMBERS = [1, 2, 3, 42];\nconst isReady = true;\n\ngreet('Playground');\n"
			}, libPictSectionCode);
		}
		catch (pErr) { /* already registered */ }
	}
};
