/* scatterplot.js
 * Handles the creation of scatterplots.
 */
var DEBUG = true;

/* createScatterplot(csvFile)
 * Creates a SVG image that will contain the scatterplot.
 *
 * Parameters:
 *	csvFile - String of the csv filename.
 *	xField - Data that will be plotted on the x-axis.
 *	yField - Data that will be plotted on the y-axis.
 *	radius - Optional argument that corresponds to what value should be
 *		plotted as the diameter of the radius of each point.
 */
var createScatterplot = function(csvFile, fullWidth, fullHeight, xField, yField, radius, continuous) {
	radius = radius || 0; // Option argument
	continous = continuous || 0; // Optional argument


	if (radius) {
		if (continuous) {
			var color = d3.scaleLinear()
				.range(['#fde0dd','#fa9fb5','#c51b8a']);
		}
		else { // If not continuous, it is categorical.
			var color = d3.scaleOrdinal(d3.schemeCategory10); // Caps at 10 different possible categories.
		}
	}

	var margin = {top: 20, right: 20, bottom: 30, left: 55},
		width = fullWidth - margin.left - margin.right,
		height = fullHeight - margin.top - margin.bottom;

	var xScale = d3.scaleLinear().range([0, width]);
	var yScale = d3.scaleLinear().range([height, 0]);

	var xAxis = d3.axisBottom(xScale);
	var yAxis = d3.axisLeft(yScale);

	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.csv(csvFile, function(error, data) {
		if (error) throw error;

		data.forEach(function(d) {
			d[xField] = +d[xField]; // Goddammit.
			d[yField] = +d[yField];
			if (radius && continuous) { d[radius] = +d[radius]; };
		});

		if (radius && continuous) {
			color.domain(d3.extent(data, function(d) { return d[radius]; }));
		}

		xExtent = d3.extent(data, function(d) { return d[yField]; });
		yExtent = d3.extent(data, function(d) { return d[xField]; });

		yScale.domain(d3.extent(data, function(d) { return d[yField]; })).nice();
		xScale.domain(d3.extent(data, function(d) { return d[xField]; })).nice();

		svg.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
		svg.append("text")
			.attr("class", "label")
			.attr("x", width)
			.attr("y", height + margin.bottom)
			.style("text-anchor", "middle")
			.text(xField);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
		svg.append("text")
			.attr("class", "label")
			.attr("transform", "rotate(-90)")
			.attr("y", margin.right - margin.left)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text(yField)

		svg.selectAll(".dot")
			.data(data)
			.enter().append("circle")
				.attr("class", "dot")
				.attr("r", (fullWidth * fullHeight) * 0.00001)
				.attr("cx", function(d) { return xScale(d[xField]); })
				.attr("cy", function(d) { return yScale(d[yField]); })
				.style("fill", function(d) {
					if (radius) {
						return color(d[radius]);
					}
					else {
						return "black";
					}
				});

		if (radius && !continuous) {
			var legend = svg.selectAll(".legend")
				.data(color.domain())
				.enter().append("g")
					.attr("class", "legend")
					.attr("transform", function(d, i) {
						return "translate(0," + i * 20 + ")";
					});

			legend.append("rect")
				.attr("x", width - 18)
				.attr("width", 18)
				.attr("height", 18)
				.style("fill", color);

			legend.append("text")
				.attr("x", width - 45)
				.attr("y", 8)
				.attr("dy", ".35em")
				.style("text-anchor", "middle")
				.text(function(d) { return d; });
		}

	});
};

if (DEBUG) {
	createScatterplot("rice03a.csv", 750, 750, "CE", "MF"/*, "Sex", false*/);
}
