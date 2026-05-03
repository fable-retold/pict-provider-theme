/**
 * pict-section-formeditor — visual editor for form manifests.
 *
 * Heavy section — depends on form, modal, content, code, markdowneditor,
 * objecteditor, flow.  Mounts with default config and lets the editor
 * pick up the manifest already in pict.settings.DefaultFormManifest
 * (set by the form section).
 */
const libPictSectionFormEditor = require('pict-section-formeditor');

const VIEW_ID = 'Playground-FormEditor';
const TARGET_ID = 'FormEditor-Container';

let _mounted = false;

module.exports =
{
	id: 'formeditor',
	name: 'Form Editor',
	group: 'Form',
	status: 'live',
	module: 'pict-section-formeditor',

	register: function () {},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-formeditor</h2>' +
			'<p class="pg-section-blurb">Visual editor for form manifests. Heavy section — pulls in modal, content, code, markdowneditor, objecteditor, flow.</p>' +
			'<div class="gallery-card">' +
			'  <div id="' + TARGET_ID + '" style="min-height: 480px;"></div>' +
			'</div>';

		if (!_mounted)
		{
			try
			{
				let tmpCfg = Object.assign({}, libPictSectionFormEditor.default_configuration,
					{ ViewIdentifier: VIEW_ID, AutoRender: false });
				pPict.addView(VIEW_ID, tmpCfg, libPictSectionFormEditor);
				_mounted = true;
			}
			catch (pErr)
			{
				document.getElementById(TARGET_ID).innerHTML =
					'<p style="color: var(--theme-color-status-warning);">Mount failed: ' + pErr.message + '</p>';
				return;
			}
		}

		let tmpView = pPict.views[VIEW_ID];
		if (tmpView)
		{
			tmpView.initialRenderComplete = false;
			try { tmpView.render(); }
			catch (pErr)
			{
				document.getElementById(TARGET_ID).innerHTML =
					'<p style="color: var(--theme-color-status-warning);">Render failed: ' + pErr.message + '</p>';
			}
		}
	}
};
