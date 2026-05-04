/**
 * pict-section-usermanagement — user CRUD UI.
 *
 * The UserList view's renderable hardcodes #PictUM-UserList as its
 * destination — so the wrapper template uses that ID directly rather
 * than re-targeting the view.  Sample users are seeded into
 * AppData.UserManagement.AllUsers since we have no backend.
 */
const libPictView = require('pict-view');
const libPictSectionUserMgmt = require('pict-section-usermanagement');

const SECTION_VIEW_ID = 'PictUM-UserList';
const WRAPPER_VIEW_ID = 'Playground-UserMgmtWrapper';
const TARGET_ID = 'Playground-UserMgmtWrapper-Destination';

const SAMPLE_USERS =
[
	{ Username: 'admin', Roles: ['admin'], FullName: 'Admin User',    Email: 'admin@example.com' },
	{ Username: 'alice', Roles: ['user'],  FullName: 'Alice Liddell', Email: 'alice@example.com' },
	{ Username: 'bob',   Roles: ['user'],  FullName: 'Bob Builder',   Email: 'bob@example.com' },
	{ Username: 'carol', Roles: ['user', 'admin'], FullName: 'Carol Danvers', Email: 'carol@example.com' }
];

class PictViewPlaygroundUserMgmtWrapper extends libPictView
{
	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();
		let tmpView = this.pict.views[SECTION_VIEW_ID];
		if (tmpView)
		{
			tmpView.initialRenderComplete = false;
			try { tmpView.render(); }
			catch (pErr)
			{
				let tmpDest = document.getElementById('PictUM-UserList');
				if (tmpDest) tmpDest.innerHTML = '<p style="color:var(--theme-color-status-warning);">Inner render failed: ' + pErr.message + '</p>';
			}
		}
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = {
	id: 'usermanagement', name: 'User Management', group: 'Auth', module: 'pict-section-usermanagement',
	ViewIdentifier: WRAPPER_VIEW_ID,
	ViewClass: PictViewPlaygroundUserMgmtWrapper,
	DestinationId: TARGET_ID,
	ViewConfiguration:
	{
		ViewIdentifier: WRAPPER_VIEW_ID,
		DefaultRenderable: 'Playground-UserMgmtWrapper-Content',
		DefaultDestinationAddress: '#' + TARGET_ID,
		AutoRender: false,
		Templates:
		[
			{
				Hash: 'Playground-UserMgmtWrapper-Content',
				Template: /*html*/`
<h2 class="pg-section-title">pict-section-usermanagement</h2>
<p class="pg-section-blurb">User CRUD UI. Uses <code>--pict-um-*</code> CSS variables internally — aliased to playground tokens. Sample users pre-seeded into <code>AppData.UserManagement.AllUsers</code>.</p>
<div class="gallery-card">
	<div id="PictUM-UserList" style="min-height: 320px;"></div>
</div>`
			}
		],
		Renderables:
		[
			{
				RenderableHash: 'Playground-UserMgmtWrapper-Content',
				TemplateHash: 'Playground-UserMgmtWrapper-Content',
				DestinationAddress: '#' + TARGET_ID,
				RenderMethod: 'replace'
			}
		]
	},
	setup: function (pPict)
	{
		// Seed users into AppData (the view reads from AppData.UserManagement.AllUsers).
		if (!pPict.AppData.UserManagement) pPict.AppData.UserManagement = {};
		pPict.AppData.UserManagement.AllUsers = SAMPLE_USERS;

		// install() registers Pict-UserManagement-Provider + 5 views under
		// their default hashes.  No Fetcher → the provider falls back to
		// reading AllUsers from AppData.
		try { libPictSectionUserMgmt.install(pPict); }
		catch (pErr) { /* */ }
	}
};
