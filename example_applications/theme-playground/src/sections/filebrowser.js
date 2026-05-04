/**
 * pict-section-filebrowser — file/folder navigator.
 *
 * The main view renders the OUTER container with named panes
 * (#Pict-FileBrowser-BrowsePane, #Pict-FileBrowser-ListPane).  Sub-views
 * (BrowseTree + ListDetail) target those panes via their default
 * destination addresses.  Both must be addView-registered AND rendered
 * for the panes to populate.
 */
const libPictView = require('pict-view');
const libPictSectionFileBrowser = require('pict-section-filebrowser');

const SECTION_VIEW_ID = 'Pict-FileBrowser';
const BROWSE_TREE_ID = 'Pict-FileBrowser-BrowseTree';
const LIST_DETAIL_ID = 'Pict-FileBrowser-ListDetail';

const WRAPPER_VIEW_ID = 'Playground-FileBrowserWrapper';
const TARGET_ID = 'Playground-FileBrowserWrapper-Destination';
const FB_TARGET_ID = 'Pict-FileBrowser-Container';

const SAMPLE_FILES =
[
	{ Name: 'Documents',  Type: 'folder', Path: 'Documents',     Modified: '2025-01-15T10:30:00Z' },
	{ Name: 'Images',     Type: 'folder', Path: 'Images',        Modified: '2025-02-20T14:00:00Z' },
	{ Name: 'readme.md',  Type: 'file',   Extension: '.md',  Size: 2048,    Path: 'readme.md',  Modified: '2025-03-01T09:00:00Z' },
	{ Name: 'photo.jpg',  Type: 'file',   Extension: '.jpg', Size: 1536000, Path: 'photo.jpg',  Modified: '2025-01-10T08:15:00Z', MimeType: 'image/jpeg' },
	{ Name: 'app.js',     Type: 'file',   Extension: '.js',  Size: 4096,    Path: 'app.js',     Modified: '2025-04-05T16:45:00Z' },
	{ Name: 'data.csv',   Type: 'file',   Extension: '.csv', Size: 512000,  Path: 'data.csv',   Modified: '2025-02-28T12:00:00Z' },
	{ Name: 'archive.zip',Type: 'file',   Extension: '.zip', Size: 10485760,Path: 'archive.zip',Modified: '2025-01-05T06:30:00Z' }
];

const SAMPLE_TREE =
[
	{ Name: 'Documents', Path: 'Documents', Children: [
		{ Name: 'Work',     Path: 'Documents/Work',     Children: [] },
		{ Name: 'Personal', Path: 'Documents/Personal', Children: [
			{ Name: 'Taxes', Path: 'Documents/Personal/Taxes', Children: [] }
		]}
	]},
	{ Name: 'Images', Path: 'Images', Children: [
		{ Name: 'Photos',     Path: 'Images/Photos',     Children: [] },
		{ Name: 'Screenshots',Path: 'Images/Screenshots',Children: [] }
	]}
];

class PictViewPlaygroundFileBrowserWrapper extends libPictView
{
	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();
		// Render outer container first, then sub-views into the panes.
		let tmpMain = this.pict.views[SECTION_VIEW_ID];
		if (tmpMain)
		{
			tmpMain.initialRenderComplete = false;
			try { tmpMain.render(); } catch (pErr) { /* */ }
		}
		let tmpTree = this.pict.views[BROWSE_TREE_ID];
		if (tmpTree)
		{
			tmpTree.initialRenderComplete = false;
			try { tmpTree.render(); } catch (pErr) { /* */ }
		}
		let tmpList = this.pict.views[LIST_DETAIL_ID];
		if (tmpList)
		{
			tmpList.initialRenderComplete = false;
			try { tmpList.render(); } catch (pErr) { /* */ }
		}
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = {
	id: 'filebrowser', name: 'File Browser', group: 'Navigation', module: 'pict-section-filebrowser',
	ViewIdentifier: WRAPPER_VIEW_ID,
	ViewClass: PictViewPlaygroundFileBrowserWrapper,
	DestinationId: TARGET_ID,
	ViewConfiguration:
	{
		ViewIdentifier: WRAPPER_VIEW_ID,
		DefaultRenderable: 'Playground-FileBrowserWrapper-Content',
		DefaultDestinationAddress: '#' + TARGET_ID,
		AutoRender: false,
		Templates:
		[
			{
				Hash: 'Playground-FileBrowserWrapper-Content',
				Template: /*html*/`
<h2 class="pg-section-title">pict-section-filebrowser</h2>
<p class="pg-section-blurb">Sidebar file/folder navigator pointed at sample data (Documents/, Images/, plus a few files).</p>
<div class="gallery-card" style="padding: 0;">
	<div id="${FB_TARGET_ID}" style="min-height: 360px;"></div>
</div>`
			}
		],
		Renderables:
		[
			{
				RenderableHash: 'Playground-FileBrowserWrapper-Content',
				TemplateHash: 'Playground-FileBrowserWrapper-Content',
				DestinationAddress: '#' + TARGET_ID,
				RenderMethod: 'replace'
			}
		]
	},
	setup: function (pPict)
	{
		// Pre-seed AppData so the section's ensureDefaultState picks them up.
		if (!pPict.AppData.PictFileBrowser) pPict.AppData.PictFileBrowser = {};
		pPict.AppData.PictFileBrowser.Layout          = 'browser-detail';
		pPict.AppData.PictFileBrowser.RootLocation    = '/';
		pPict.AppData.PictFileBrowser.CurrentLocation = '';
		pPict.AppData.PictFileBrowser.CurrentFile     = null;
		pPict.AppData.PictFileBrowser.FileList        = SAMPLE_FILES;
		pPict.AppData.PictFileBrowser.FolderTree      = SAMPLE_TREE;

		try { pPict.addView(SECTION_VIEW_ID, libPictSectionFileBrowser.default_configuration, libPictSectionFileBrowser); }
		catch (pErr) { /* */ }
		try { pPict.addView(BROWSE_TREE_ID, libPictSectionFileBrowser.PictViewBrowseTree.default_configuration, libPictSectionFileBrowser.PictViewBrowseTree); }
		catch (pErr) { /* */ }
		try { pPict.addView(LIST_DETAIL_ID, libPictSectionFileBrowser.PictViewListDetail.default_configuration, libPictSectionFileBrowser.PictViewListDetail); }
		catch (pErr) { /* */ }
	}
};
