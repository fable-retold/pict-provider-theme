/**
 * pict-section-histogram — bar chart.
 *
 * Per simple_histogram example:
 *   - Bins is the data input — array of { Label, Value } (NOT just numbers).
 *   - Renderables wraps "Histogram-Container" template into our destination.
 */
const libPictSectionHistogram = require('pict-section-histogram');
const { buildSection } = require('./_wrapper.js');

module.exports = buildSection({
	id: 'histogram', name: 'Histogram', group: 'Visualization', module: 'pict-section-histogram',
	WrapperViewId: 'Playground-HistogramWrapper',
	WrapperTargetId: 'Playground-HistogramWrapper-Destination',
	InnerViewId: 'Playground-Histogram',
	InnerTargetId: 'Histogram-Container-Div',
	InnerViewClass: libPictSectionHistogram,
	InnerContainerStyle: 'min-height: 320px;',
	Title: 'pict-section-histogram',
	Blurb: 'Histogram chart. Sample data covers a representative bar palette.',
	InnerViewConfiguration:
	{
		Bins:
		[
			{ Label: 'JavaScript', Value: 65 },
			{ Label: 'Python',     Value: 52 },
			{ Label: 'TypeScript', Value: 38 },
			{ Label: 'Rust',       Value: 22 },
			{ Label: 'Go',         Value: 30 },
			{ Label: 'Java',       Value: 45 }
		],
		Orientation: 'vertical',
		Selectable: false,
		MaxBarSize: 200,
		BarThickness: 32,
		BarGap: 8,
		Renderables:
		[
			{
				RenderableHash: 'Histogram-Wrap',
				TemplateHash: 'Histogram-Container',
				DestinationAddress: '#Histogram-Container-Div'
			}
		]
	}
});
