/**
 * pict-section-code — CodeJar-based code editor with a custom syntax
 * highlighter (NOT CodeMirror — pict-section-code uses CodeJar).
 *
 * The section ships a hardcoded ATOM-One-Light syntax color palette baked
 * into its default CSS string.  We bridge it to the playground theme by
 * registering a higher-priority CSS override block that re-declares every
 * syntax color using `var(--theme-*)` references.
 */
const libPictSectionCode = require('pict-section-code');

const VIEW_ID = 'Playground-CodeEditor';
const TARGET_ID = 'Playground-Code-Container';
const OVERRIDE_HASH = 'Playground-Code-Theme-Override';

// !important is required because pict-view's auto-CSS registers view CSS
// under a string-typed Priority (the view hash) which corrupts the
// numeric priority sort in pict.CSSMap.generateCSS — leaving the section's
// own defaults unpredictable in cascade order.
const _ThemeOverrideCSS = `
.pict-code-editor-wrap
{
	border-color: var(--theme-color-border-default) !important;
	font-family: var(--theme-typography-family-mono) !important;
	background: var(--theme-color-background-panel) !important;
}
.pict-code-editor-wrap .pict-code-line-numbers
{
	background: var(--theme-color-background-secondary) !important;
	border-right-color: var(--theme-color-border-default) !important;
	color: var(--theme-color-text-muted) !important;
}
.pict-code-editor-wrap .pict-code-editor
{
	background: var(--theme-color-background-panel) !important;
	color: var(--theme-color-text-primary) !important;
	caret-color: var(--theme-color-brand-primary) !important;
}
.pict-code-editor-wrap .pict-code-editor .keyword       { color: var(--theme-color-brand-primary) !important; }
.pict-code-editor-wrap .pict-code-editor .string        { color: var(--theme-color-status-success) !important; }
.pict-code-editor-wrap .pict-code-editor .number        { color: var(--theme-color-brand-accent) !important; }
.pict-code-editor-wrap .pict-code-editor .comment       { color: var(--theme-color-text-muted) !important; font-style: italic !important; }
.pict-code-editor-wrap .pict-code-editor .operator      { color: var(--theme-color-status-info) !important; }
.pict-code-editor-wrap .pict-code-editor .punctuation   { color: var(--theme-color-text-secondary) !important; }
.pict-code-editor-wrap .pict-code-editor .function-name { color: var(--theme-color-brand-primary) !important; }
.pict-code-editor-wrap .pict-code-editor .property      { color: var(--theme-color-status-error) !important; }
.pict-code-editor-wrap .pict-code-editor .tag           { color: var(--theme-color-status-error) !important; }
.pict-code-editor-wrap .pict-code-editor .attr-name     { color: var(--theme-color-brand-accent) !important; }
.pict-code-editor-wrap .pict-code-editor .attr-value    { color: var(--theme-color-status-success) !important; }
`;

let _mounted = false;
let _overrideRegistered = false;

module.exports =
{
	id: 'code',
	name: 'Code Editor',
	group: 'Editor',
	status: 'live',
	module: 'pict-section-code',

	register: function (pPict)
	{
		// Higher priority than pict-section-code's default CSS so our
		// var(--theme-*) declarations win the cascade.  The section's own
		// CSS registers via pict-view auto-CSS at priority ~500; this lands
		// at 700, after it.
		if (!_overrideRegistered && pPict && pPict.CSSMap && typeof pPict.CSSMap.addCSS === 'function')
		{
			pPict.CSSMap.addCSS(OVERRIDE_HASH, _ThemeOverrideCSS, 700);
			_overrideRegistered = true;
		}
	},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-code</h2>' +
			'<p class="pg-section-blurb">CodeJar-based code editor with a custom syntax highlighter. The section ships a hardcoded ATOM-One-Light palette; the playground bridges it via a higher-priority CSS override that maps every syntax color to <code>var(--theme-*)</code>.</p>' +
			'<div class="gallery-card">' +
			'  <div id="' + TARGET_ID + '" style="height: 320px; border: 1px solid var(--theme-color-border-default); border-radius: var(--theme-radius-md);"></div>' +
			'</div>';

		if (!_mounted)
		{
			pPict.addView(VIEW_ID,
				{
					ViewIdentifier: VIEW_ID,
					DefaultDestinationAddress: '#' + TARGET_ID,
					TargetElementAddress: '#' + TARGET_ID,
					AutoRender: false,
					Language: 'javascript',
					ReadOnly: false,
					LineNumbers: true,
					DefaultCode: "// pict-section-code embedded in the theme playground.\n" +
						"// Syntax colors below are themed via var(--theme-*) — switch\n" +
						"// theme + mode at the top to see them follow.\n" +
						"\n" +
						"function greet(pName)\n" +
						"{\n" +
						"\tlet tmpGreeting = `Hello, ${pName}!`;  // template literal\n" +
						"\tconsole.log(tmpGreeting);\n" +
						"\treturn tmpGreeting;\n" +
						"}\n" +
						"\n" +
						"const NUMBERS = [1, 2, 3, 42];\n" +
						"const isReady = true;\n" +
						"\n" +
						"greet('Playground');\n"
				},
				libPictSectionCode);
			_mounted = true;
		}

		let tmpView = pPict.views[VIEW_ID];
		if (tmpView)
		{
			// Without a full pict-application init cycle, onBeforeInitialize
			// never fires and _highlightFunction stays null.  Force-build it.
			if (typeof tmpView._highlightFunction !== 'function' && typeof tmpView.setLanguage === 'function')
			{
				try { tmpView.setLanguage('javascript'); }
				catch (pErr) { /* swallow — render will surface any issue */ }
			}
			tmpView.initialRenderComplete = false;
			try { tmpView.render(); }
			catch (pErr)
			{
				let tmpEl = document.getElementById(TARGET_ID);
				if (tmpEl)
				{
					tmpEl.innerHTML =
						'<p style="color: var(--theme-color-status-warning);">Render failed: ' + pErr.message + '</p>';
				}
			}
		}
	}
};
