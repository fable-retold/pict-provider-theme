/**
 * Helper: build a wrapper PictView class for a section.
 *
 * Each playground section is two views:
 *   - The wrapper (this) — paints title/blurb/container into the section
 *     panel.  Owns the per-section CSS/HTML chrome.
 *   - The inner section view (pict-section-* module) — registered by the
 *     section's setup() and configured to target the wrapper's container.
 *
 * The wrapper's onAfterRender invokes the inner view's render() so the
 * section paints its own content inside the chrome.
 */
const libPictView = require('pict-view');

function buildWrapperClass(pInnerViewId, pInnerTargetId)
{
	return class PlaygroundWrapper extends libPictView
	{
		onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
		{
			this.pict.CSSMap.injectCSS();
			let tmpInner = this.pict.views[pInnerViewId];
			if (tmpInner)
			{
				tmpInner.initialRenderComplete = false;
				try { tmpInner.render(); }
				catch (pErr)
				{
					let tmpDest = document.getElementById(pInnerTargetId);
					if (tmpDest)
					{
						tmpDest.innerHTML = '<p style="color:var(--theme-color-status-warning);">Inner render failed: ' + pErr.message + '</p>';
					}
					if (this.log) this.log.warn('Wrapper for [' + pInnerViewId + '] render error: ' + pErr.message);
				}
			}
			return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
		}
	};
}

/**
 * Build a complete section descriptor (id/name/group + wrapper view + setup
 * that registers the inner section view).
 *
 * @param {object} pSpec
 *   id, name, group, module                     — nav metadata
 *   InnerViewId, InnerTargetId                  — IDs for the section view + container
 *   WrapperViewId, WrapperTargetId              — IDs for the wrapper view + its destination
 *   InnerViewClass                              — the pict-section-* class
 *   InnerViewConfiguration (optional)           — extra options for the inner view's addView
 *   Title, Blurb                                — wrapper template chrome
 *   InnerContainerStyle (optional)              — style attribute for the inner container div
 *   AdditionalSetup (optional)                  — function(pict) called from setup() before addView
 *   ServiceTypes (optional)                     — { name: ClassRef } registered before addView
 */
function buildSection(pSpec)
{
	let tmpWrapperId = pSpec.WrapperViewId;
	let tmpWrapperTarget = pSpec.WrapperTargetId;
	let tmpInnerTarget = pSpec.InnerTargetId;
	let tmpInnerStyle = pSpec.InnerContainerStyle || 'min-height: 320px;';
	let tmpRenderableHash = tmpWrapperId + '-Content';

	let WrapperClass = buildWrapperClass(pSpec.InnerViewId, tmpInnerTarget);

	return {
		id: pSpec.id,
		name: pSpec.name,
		group: pSpec.group,
		module: pSpec.module,
		ViewIdentifier: tmpWrapperId,
		ViewClass: WrapperClass,
		DestinationId: tmpWrapperTarget,
		ViewConfiguration:
		{
			ViewIdentifier: tmpWrapperId,
			DefaultRenderable: tmpRenderableHash,
			DefaultDestinationAddress: '#' + tmpWrapperTarget,
			AutoRender: false,
			Templates:
			[
				{
					Hash: tmpRenderableHash,
					Template:
						'<h2 class="pg-section-title">' + pSpec.Title + '</h2>' +
						'<p class="pg-section-blurb">' + pSpec.Blurb + '</p>' +
						'<div class="gallery-card">' +
						'  <div id="' + tmpInnerTarget + '" style="' + tmpInnerStyle + '"></div>' +
						'</div>'
				}
			],
			Renderables:
			[
				{
					RenderableHash: tmpRenderableHash,
					TemplateHash: tmpRenderableHash,
					DestinationAddress: '#' + tmpWrapperTarget,
					RenderMethod: 'replace'
				}
			]
		},

		setup: function (pPict)
		{
			if (pSpec.ServiceTypes)
			{
				Object.keys(pSpec.ServiceTypes).forEach((pName) =>
				{
					try { pPict.addServiceType(pName, pSpec.ServiceTypes[pName]); }
					catch (pErr) { /* already registered */ }
				});
			}
			if (typeof pSpec.AdditionalSetup === 'function')
			{
				try { pSpec.AdditionalSetup(pPict); }
				catch (pErr) { /* tolerate */ }
			}
			let tmpInnerCfg = Object.assign(
				{
					ViewIdentifier: pSpec.InnerViewId,
					DefaultDestinationAddress: '#' + tmpInnerTarget,
					TargetElementAddress: '#' + tmpInnerTarget,
					AutoRender: false
				},
				pSpec.InnerViewConfiguration || {});
			try
			{
				pPict.addView(pSpec.InnerViewId, tmpInnerCfg, pSpec.InnerViewClass);
			}
			catch (pErr) { /* already registered */ }
		},

		onShow: pSpec.onShow
	};
}

module.exports = {
	buildSection: buildSection,
	buildWrapperClass: buildWrapperClass
};
