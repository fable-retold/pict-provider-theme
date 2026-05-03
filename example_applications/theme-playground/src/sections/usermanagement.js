/**
 * pict-section-usermanagement — user CRUD UI.
 *
 * Uses --pict-um-* CSS variables internally.  Aliases bridge them to
 * playground tokens.
 */
const libPictSectionUserMgmt = require('pict-section-usermanagement');

const VIEW_ID = 'Playground-UserManagement';
const TARGET_ID = 'Playground-UserManagement-Container';

let _mounted = false;

module.exports =
{
	id: 'usermanagement',
	name: 'User Management',
	group: 'Auth',
	status: 'live',
	module: 'pict-section-usermanagement',

	register: function () {},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-usermanagement</h2>' +
			'<p class="pg-section-blurb">User CRUD UI. Uses <code>--pict-um-*</code> CSS variables internally — aliased to playground tokens.</p>' +
			'<div class="gallery-card">' +
			'  <div id="' + TARGET_ID + '" style="min-height: 320px;"></div>' +
			'</div>';

		if (!_mounted)
		{
			try
			{
				pPict.addView(VIEW_ID,
					{
						ViewIdentifier: VIEW_ID,
						DefaultDestinationAddress: '#' + TARGET_ID,
						AutoRender: false
					},
					libPictSectionUserMgmt);
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
