/**
 * pict-section-login — login form.
 */
const libPictSectionLogin = require('pict-section-login');

const VIEW_ID = 'Playground-Login';
const TARGET_ID = 'Pict-Login-Container';

let _mounted = false;

module.exports =
{
	id: 'login',
	name: 'Login',
	group: 'Auth',
	status: 'live',
	module: 'pict-section-login',

	register: function () {},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-login</h2>' +
			'<p class="pg-section-blurb">Reusable login form. Demo only — submit handler is a no-op.</p>' +
			'<div class="gallery-card">' +
			'  <div id="' + TARGET_ID + '" style="min-height: 280px;"></div>' +
			'</div>';

		if (!_mounted)
		{
			try
			{
				pPict.addView(VIEW_ID,
					{
						ViewIdentifier: VIEW_ID,
						DefaultDestinationAddress: '#' + TARGET_ID,
						TargetElementAddress: '#' + TARGET_ID,
						AutoRender: false
					},
					libPictSectionLogin);
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
