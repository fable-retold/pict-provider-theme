/**
 * pict-section-modal — wrapper view that paints demo buttons + wires them
 * to the modal section's API.
 *
 * The modal section itself is registered by `setup()` so its lifecycle
 * runs at app boot.
 */
const libPictView = require('pict-view');
const libPictSectionModal = require('pict-section-modal');

const SECTION_VIEW_ID = libPictSectionModal.default_configuration.ViewIdentifier; // 'Pict-Section-Modal'
const DEMO_VIEW_ID = 'Playground-ModalDemo';
const TARGET_ID = 'Playground-ModalDemo-Destination';

class PictViewPlaygroundModalDemo extends libPictView
{
	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();
		let tmpModal = this.pict.views[SECTION_VIEW_ID];
		if (tmpModal)
		{
			let tmpToast = document.getElementById('demo-modal-toast');
			let tmpToastErr = document.getElementById('demo-modal-toast-error');
			let tmpConfirm = document.getElementById('demo-modal-confirm');
			let tmpShow = document.getElementById('demo-modal-show');
			if (tmpToast) tmpToast.addEventListener('click', () =>
			{
				tmpModal.toast('Saved successfully', { type: 'success', duration: 2400 });
			});
			if (tmpToastErr) tmpToastErr.addEventListener('click', () =>
			{
				tmpModal.toast('Could not reach server', { type: 'error', duration: 3500 });
			});
			if (tmpConfirm) tmpConfirm.addEventListener('click', () =>
			{
				tmpModal.confirm('This cannot be undone.',
					{ title: 'Delete draft?', confirmLabel: 'Delete', cancelLabel: 'Cancel', dangerous: true })
					.then((pOK) => { if (pOK) tmpModal.toast('Draft deleted', { type: 'info' }); });
			});
			if (tmpShow) tmpShow.addEventListener('click', () =>
			{
				tmpModal.show({
					title: 'Edit Record',
					content: '<p>Themed via the active pict-provider-theme bundle. The modal\'s <code>--pict-modal-*</code> CSS variables are aliased to your tokens.</p>',
					buttons: [
						{ Hash: 'cancel', Label: 'Cancel' },
						{ Hash: 'save', Label: 'Save', Style: 'primary' }
					]
				});
			});
		}
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = {
	id: 'modal',
	name: 'Modal',
	group: 'Notification',
	module: 'pict-section-modal',

	ViewIdentifier: DEMO_VIEW_ID,
	ViewClass: PictViewPlaygroundModalDemo,
	DestinationId: TARGET_ID,
	ViewConfiguration:
	{
		ViewIdentifier: DEMO_VIEW_ID,
		DefaultRenderable: 'Playground-ModalDemo-Content',
		DefaultDestinationAddress: '#' + TARGET_ID,
		AutoRender: false,
		Templates:
		[
			{
				Hash: 'Playground-ModalDemo-Content',
				Template: /*html*/`
<h2 class="pg-section-title">pict-section-modal</h2>
<p class="pg-section-blurb">Real <code>pict-section-modal</code> embedded in this app. Its <code>--pict-modal-*</code> CSS variables are aliased to the active theme's tokens — switch themes above and the modal chrome follows.</p>
<div class="gallery-card">
	<div class="gallery-row" style="margin-bottom:0;">
		<button id="demo-modal-toast" class="demo-btn is-primary">Toast (success)</button>
		<button id="demo-modal-toast-error" class="demo-btn is-danger">Toast (error)</button>
		<button id="demo-modal-confirm" class="demo-btn">Confirm</button>
		<button id="demo-modal-show" class="demo-btn">Modal</button>
	</div>
</div>`
			}
		],
		Renderables:
		[
			{
				RenderableHash: 'Playground-ModalDemo-Content',
				TemplateHash: 'Playground-ModalDemo-Content',
				DestinationAddress: '#' + TARGET_ID,
				RenderMethod: 'replace'
			}
		]
	},

	setup: function (pPict)
	{
		// Register the modal section view so its lifecycle runs at app boot.
		// It manages overlays from document.body itself; no destination needed
		// in our section panel.
		try
		{
			pPict.addView(SECTION_VIEW_ID, libPictSectionModal.default_configuration, libPictSectionModal);
		}
		catch (pErr) { /* already registered */ }
	}
};
