// set the dimensions and margins of the graph
// var margin = {top: 20, right: 20, bottom: 30, left: 50},
//     width = 800 - margin.left - margin.right,
//     height = 400 - margin.top - margin.bottom;


var margin = {top: 40, right: 40, bottom: 60, left: 60};

var width = 1400 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;


// append SVG
var svg = d3.select("#vis1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Date parser
var formatDate = d3.timeFormat("%Y");
var parseDate = d3.timeParse("%Y");


var commas = d3.format(",");

// Initialize data
loadData();

var bisectDate = d3.bisector(function(d) { return d.date; }).left;

var wage_data;

// Load CSV file
function loadData() {
    d3.csv("data/wagedata.csv", function(error, csv) {

        csv.forEach(function(d){

            // Convert numeric values to 'numbers'
            d.date = parseDate(d.date);
            d.men_full = +d.men_full;
            d.women_full = +d.women_full;
            d.percent_full = +d.percent_full;
            d.diff_full = +d.diff_full;
            d.men_assistant = +d.men_assistant;
            d.women_assistant = +d.women_assistant;
            d.percent_assistant = +d.percent_assistant;
            d.diff_assistant = +d.diff_assistant;
            d.men_associate = +d.men_associate;
            d.women_associate = +d.women_associate;
            d.percent_associate = +d.percent_associate;
            d.diff_associate = +d.diff_associate;
        });

        // Store csv data in global variable
        wage_data = csv;
        // Draw the visualization for the first time
        updateWagegap();
    });
}


d3.select("#ranking-type").on("change", function() {
    // drawSlider();
    updateWagegap();
});


function updateWagegap(){
    svg.selectAll(".axis").remove();
    svg.selectAll(".line").remove();
    svg.selectAll(".circle").remove();

    var category = d3.select("#ranking-type").property("value");


    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // Scale the range of the data
    x.domain(d3.extent(wage_data, function(d) { return d.date; }));

    var min_category = d3.min(wage_data, function (d) {
        // if(d[men]<d[women]){
        //     return d[women]
        // }
        // else{
        //     return d[men];
        // }
        return d["women_"+category]
    });
    var max_category = d3.max(wage_data, function (d) {
        return d["men_"+category]
    });

    y.domain([min_category-2000, max_category]);

    // Add the X Axis
    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0,"+350+")")
        .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append("g")
        .transition()
        .duration(800)
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(y));

    // define the globalfund line
    var Men_line = d3.line()
        .x(function (d) {
            return x(d.date);
        })
        .y(function (d) {
            console.log(d["men_" + category]);
            return y(d["men_" + category]);
        });

    console.log(wage_data);

    // define the us line
    var Women_line = d3.line()
        .x(function (d) {
            return x(d.date);
        })
        .y(function (d) {
            return y(d["women_" + category]);
        });

    var diff_line = d3.line()
        .x(function (d) {
            return x(d.date);
        })
        .y(function (d) {
            return y(d["diff_" + category]);
        });


    var g = svg.append("g")
        .attr("transform", "translate(0, 0)")
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.bottom)

    // Add the valueline path.
    var men_path = g.append("path")
        .data(wage_data)
        .attr("fill", "none")
        .attr("stroke", "#58adf2")
        .attr("stroke-width", 2)
        .attr("class", "line")
        .attr("d", Men_line(wage_data));

    var men_totalLength=men_path.node().getTotalLength();

    men_path
        .attr("stroke-dasharray", men_totalLength + " " + men_totalLength)
        .attr("stroke-dashoffset", men_totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    var women_path = g.append("path")
        .data(wage_data)
        .attr("fill", "none")
        .attr("stroke", "#e25488")
        .attr("stroke-width", 2)
        .attr("class", "line")
        .attr("d", Women_line(wage_data));

    var women_totalLength=women_path.node().getTotalLength();

    women_path
        .attr("stroke-dasharray", women_totalLength + " " + women_totalLength)
        .attr("stroke-dashoffset", women_totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("stroke-width", 2)
        .attr("stroke", "grey");

    focus.append("text")
        .attr("id", "text1")
        .attr("x", 15)
        .attr("dy", "5em");

    focus.append("text")
        .attr("id", "text2")
        .attr("x", 15)
        .attr("dy", "6em");

    focus.append("text")
        .attr("id", "text3")
        .attr("x", 15)
        .attr("dy", "3em");

    focus.append("text")
        .attr("id", "text4")
        .attr("x", 15)
        .attr("dy", "1em");

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        const x0 = x.invert(d3.mouse(this)[0]);
        const i = bisectDate(wage_data, x0, 1);
        d0 = wage_data[i - 1];
        d1 = wage_data[i];
        const d = (x0 - d0.date) > (d1.date - x0) ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.date) + "," + y(d["men_" + category]) + ")");
        focus.select('#text1').text(function() {return "Men's Wage: $" + commas(d["men_" + category]) });
        focus.select('#text2').text(function() {return "Women's Wage: $" + commas(d["women_" + category]) });
        focus.select('#text3').text(function() {return "Wage difference: $" + commas(d["diff_" + category]) });
        focus.select('#text4').text(function() {return "Female earns " + Math.round(d["percent_" + category]*100) + "% of their male counterparts"});

        var cdate = (formatDate(d.date));

        focus.select("#text1")
            .data(wage_data)
            .attr("x", function(wage_data) {
                if (cdate > 2010){return -10}
                else {return 15}
            })
            .attr("y",  - y(d["men_" + category]) + 30);

        focus.select("#text2")
            .data(wage_data)
            .attr("x", function(wage_data) {
                if (cdate > 2010){return -180}
                else {return 15}
            })
            .attr("y",  - y(d["men_" + category]) + 30);

        focus.select("#text3")
            .data(wage_data)
            .attr("x", function(wage_data) {
                if (cdate > 2010){return -150}
                else {return 15}
            })
            .attr("y",  - y(d["men_" + category]) + 10);

        focus.select("#text4")
            .data(wage_data)
            .attr("x", function(wage_data) {
                if (cdate > 2010){return -150}
                else {return 15}
            })
            .attr("y",  - y(d["men_" + category]) + 10);




        focus.select("line")
            .attr("class", "x-hover-line hover-line")
            .attr("y1", -(y(d["men_" + category])))
            .attr("y2", height - y(d["men_" + category]));

    }

// text label for the x axis
    svg.append("text")
        .attr("class", "axis x-axis")
        .attr("text-anchor","left")
        .attr("x",width-350)
        .attr("y",height)
        .attr("dy","-0.3em")
        .style("font-size", "12px")
        .text("Time(yr)");

    svg.append("text")
        .attr("class", "axis y-axis")
        .attr("text-anchor","end")
        // how do these work
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy","1.2em")
        .attr("transform", function(d) {
            return "rotate(-90)"
        })
        .style("font-size", "12px")
        .text("Wage($)");

// add label (Men: #8dd3c7 Women: fc8d62
    var ordinal = d3.scaleOrdinal()
        .domain(["Average Male Faculty Wage","Average Female Faculty Wage"])
        .range(["#58adf2","#e25488"])

    svg.append("g")
        .attr("class","legendOrdinal")
        .attr("transform","translate(550,280)")

    var legendOrdinal =d3.legendColor()
        .shape("path",d3.symbol().type(d3.symbolSquare).size(100))
        .cellFilter(function(d){return d.label !=="e"})
        .scale(ordinal);

    svg.select(".legendOrdinal").call(legendOrdinal);
}
