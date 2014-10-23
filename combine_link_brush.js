/**
 * Created by Dan on 10/20/14.
 */

var group = ["Acre", "Back_Central", "Centralville", "Downtown", "Lower_Belvidere", "Lower_Highlands", "Pawtucketville", "South_Lowell", "Upper_Belvidere", "Upper_Highlands"];
var tempPoint;
var tempBar;
var tempPath;
var selected_dot = {};


function scatter() {
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    var group_name = "Neighborhood";
    var x_column = "Under 5 years";
    var y_column = "Enrolled in nursery school/preschool";
    var size_column = "Mean family income";


    /*
     * value accessor - returns the value to encode for a given data object.
     * scale - maps value to a visual display encoding, such as a pixel position.
     * map function - maps from data value to display value
     * axis - sets up axis
     */

    // setup x
    var xValue = function (d) {
            return d[x_column];
        }, // data -> value
        xScale = d3.scale.linear().range([0, width]), // value -> display
        xMap = function (d) {
            return xScale(xValue(d));
        }, // data -> display
        xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // setup y
    var yValue = function (d) {
            return d[y_column];
        }, // data -> value
        yScale = d3.scale.linear().range([height, 0]), // value -> display
        yMap = function (d) {
            return yScale(yValue(d));
        }, // data -> display
        yAxis = d3.svg.axis().scale(yScale).orient("left");

    // setup fill color
    var cValue = function (d) {
            return d[group_name];
        },
        color = d3.scale.category10();



    // add the graph canvas to the body of the webpage
    var svg = d3.select("#scatter").append("svg")
        .attr("width", width + margin.left + margin.right+margin.right)
        .attr("height", height + margin.top + margin.bottom+margin.top)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("#scatter").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // load data
    d3.csv("scatter.csv", function (error, data) {

        // change string (from CSV) into number format
        data.forEach(function (d) {
            d[x_column] = +d[x_column];
            d[y_column] = +d[y_column];
            //    console.log(d);
        });

        // don't want dots overlapping axis, so add in buffer to data domain
        xScale.domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1]);
        yScale.domain([d3.min(data, yValue) - 1, d3.max(data, yValue) + 1]);

        var max_size = d3.max(data, function(d) {return parseInt(d[size_column]);});
        var min_size = d3.min(data, function(d) {return parseInt(d[size_column]);});

        // x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text(x_column);

        // y-axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(y_column);



        svg.append("g")
            .attr("class", "brush")
            .call(d3.svg.brush().x(xScale).y(yScale)
                .on("brushstart", brushstart)
                .on("brush", brushmove)
                .on("brushend", brushend))
            .selectAll("rect")
            .attr("height", height);

        function brushstart() {
            clear_selected(false);
            d3.selectAll(".extent").style("opacity", 1);
            svg.classed("selecting", true);
        }

        function brushmove() {
            var s = d3.event.target.extent();


            selected_dot = {}
            symbol.classed("selected", function(d) {
                if (s[0][0] <= d[x_column] && d[x_column] <= s[1][0] && s[0][1] <= d[y_column] && d[y_column] <= s[1][1]) {
//                    console.log(d[x_column]);
                    selected_dot[d[group_name]] = 1;
                }
                return s[0][0] <= d[x_column] && d[x_column] <= s[1][0] && s[0][1] <= d[y_column] && d[y_column] <= s[1][1] ;
            });
        }

        function brushend() {
            console.log(selected_dot);
            svg.classed("selecting", !d3.event.target.empty());

            for (var key in selected_dot) {

                var tempPoint1 = "circle.point-"+key;
                d3.selectAll(tempPoint1).style("stroke", "black");
                d3.selectAll(tempPoint1).style("stroke-width", 3.5);

                var tempBar1 = "rect.bar-" + key;
                d3.selectAll(tempBar1).style("stroke", "black");
                d3.selectAll(tempBar1).style("stroke-width", "3");

                var tempPath1 = "path.line-" + key;
                d3.selectAll(tempPath1).style("stroke-width", 4);
            }
        }


        // draw dots
        index = 0;
        var symbol = svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", function(d) {
//                return "color-" + color(d.name).substring(1);
                return "point-" + group[Math.floor(index++ % 10)];
            })
            .attr("r", function (d){
                return 10 - ((parseInt(max_size-d[size_column]))/(max_size-min_size))*6;
            })
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", function (d) {
                return color(cValue(d));
            })
            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d[group_name] + "<br/> (" + xValue(d)
                    + ", " + yValue(d) + ")")
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function (d) {
                clear_selected(true);

                var name = d3.select(this).attr("class").split("-");
//
//                if (tempPoint != null){
//
//                    d3.selectAll(tempPoint).style("stroke", "black");
//                    d3.selectAll(tempPoint).style("stroke-width", 0) ;
//                }


                tempPoint = "circle.point-"+name[1];
                d3.selectAll(tempPoint).style("stroke", "black");
                d3.selectAll(tempPoint).style("stroke-width", 3.5);

//                if (tempBar != null){
//
//                    d3.selectAll(tempBar).style("stroke", "black");
//                    d3.selectAll(tempBar).style("stroke-width", "0");
//                }

                tempBar = "rect.bar-"+name[1];
                d3.selectAll(tempBar).style("stroke", "black");
                d3.selectAll(tempBar).style("stroke-width", "3");

//
//                if (tempPath != null){
//
//                    d3.selectAll(tempPath).style("stroke-width", 1);
//                }
                tempPath = "path.line-"+name[1];
                d3.selectAll(tempPath).style("stroke-width", 4);


            });



        // draw legend
        var legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return "translate(-750," + i * 20 + ")";
            });

        // draw legend colored rectangles
        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        // draw legend text
        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) {
                return d;
            })
    });
}

function bar(){
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var group_name = "Neighborhood";
    var x_column = "Under 5 years";
    var y_column = "Enrolled in nursery school/preschool";

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    var svg = d3.select("#bar").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select("#bar").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    d3.csv("bar.csv", function(error, data) {
        var ageNames = d3.keys(data[0]).filter(function(key) { return key !== group_name; });

        data.forEach(function(d) {
            d.ages = ageNames.map(function(name) { return {name: name, value: +d[name]}; });
        });

        x0.domain(data.map(function(d) { return d[group_name]; }));
        x1.domain(ageNames).rangeRoundBands([0, x0.rangeBand()]);
        y.domain([0, d3.max(data, function(d) { return d3.max(d.ages, function(d) { return d.value; }); })]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Population");

        var state = svg.selectAll("."+group_name)
            .data(data)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform", function(d) { return "translate(" + x0(d[group_name]) + ",0)"; });

//        var tempBar;
        var index = 0;
        state.selectAll("rect")
            .data(function(d) { return d.ages; })
            .enter().append("rect")
            .attr("class", function(d) {
//                return "color-" + color(d.name).substring(1);
                return "bar-" + group[Math.floor(index++ % 10)];
            })
            .attr("width", x1.rangeBand())
            .attr("x", function(d) { return x1(d.name); })
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })
            .style("fill", function(d) { return color(d.name); })
            .on("mouseover", function (d) {
//                d3.select(this).style("stroke-width", 5);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.name+","+ d.value)
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            }).on("click", function(d) {              // when the mouse goes over a circle, do the following
                clear_selected(true);
               var name = d3.select(this).attr("class").split("-");

//                if (tempPoint != null){
//
//                    d3.selectAll(tempPoint).style("stroke", "black");
//                    d3.selectAll(tempPoint).style("stroke-width", 0) ;
//                }


                tempPoint = "circle.point-"+name[1];
                d3.selectAll(tempPoint).style("stroke", "black");
                d3.selectAll(tempPoint).style("stroke-width", 3.5);

//                if (tempBar != null){
//
//                    d3.selectAll(tempBar).style("stroke", "black");
//                    d3.selectAll(tempBar).style("stroke-width", "0");
//                }

                tempBar = "rect.bar-"+name[1];
                d3.selectAll(tempBar).style("stroke", "black");
                d3.selectAll(tempBar).style("stroke-width", "3");


//                if (tempPath != null){
//
//                    d3.selectAll(tempPath).style("stroke-width", 1);
//                }
                tempPath = "path.line-"+name[1];
                d3.selectAll(tempPath).style("stroke-width", 4);

            });


        var legend = svg.selectAll(".legend")
            .data(ageNames.slice())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });

    });

}

function line(){
    var first_column = "Neighborhood";

//    data = d3.csv.parse(test_data);
    var margin = {
            top: 20,
            right: 80,
            bottom: 30,
            left: 50
        },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .x(function (d) {
            return x(d.day);
        })
        .y(function (d) {
            return y(d.value);
        })
        .interpolate("linear");

    var svg = d3.select("#line").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select("#line").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    d3.csv("line.csv", function(error, data) {
        color.domain(d3.keys(data[0]).filter(function (key) {
            return key !== first_column;
        }));


        var cities = color.domain().map(function (name) {
            return {
                label: name,
                values: data.map(function (d) {
                    return {day: d[first_column], value: +d[name]};
                })
            };
        });



        cities.forEach(function (kv) {
            kv.values.forEach(function (d) {
                d.value = +d.value;
            });
        });


        var maxY = d3.max(cities, function (kv) {
            return d3.max(kv.values, function (d) {
                return d.value;
            })
        });

        var padding = width/(cities[0].values.length + 1)/2;

        x.domain(cities[0].values.map(function (d) {
            return d.day;
        })).rangePoints([0, width-padding]);

        y.domain([0, 1 * (maxY)]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end");

        var city = svg.selectAll(".dot")
            .data(cities)
            .enter().append("g")
            .attr("class", "branch");

//        var tempPath;
        var index = 0;
        city.append("path")
            .attr("class", function(d) {
//                return "color-" + color(d.name).substring(1);
                return "line-" + group[Math.floor(index++ % 10)];
            })
            .attr("d", function (d) {
                return line(d.values);
            })
            .style("stroke", function (d) {
                return color(d.label);
            })
            .style("fill", "none")
            .on("mouseover", function(d) {              // when the mouse goes over a circle, do the following
                if (d3.select(this).style("stroke-width") != "4px")
                    d3.select(this).style("stroke-width", 2);
            })                          //
            .on("mouseout", function(d) {
//                alert(d3.select(this).style("stroke-width"));
                if (d3.select(this).style("stroke-width") == "2px")
                    d3.select(this).style("stroke-width", 1);
            })
            .on("click", function(d) {              // when the mouse goes over a circle, do the following
                clear_selected(true);
                var name = d3.select(this).attr("class").split("-");

//                if (tempPoint != null){
//
//                    d3.selectAll(tempPoint).style("stroke", "black");
//                    d3.selectAll(tempPoint).style("stroke-width", 0) ;
//                }


                tempPoint = "circle.point-"+name[1];
                d3.selectAll(tempPoint).style("stroke", "black");
                d3.selectAll(tempPoint).style("stroke-width", 3.5);

//                if (tempBar != null){
//
//                    d3.selectAll(tempBar).style("stroke", "black");
//                    d3.selectAll(tempBar).style("stroke-width", "0");
//                }

                tempBar = "rect.bar-"+name[1];
                d3.selectAll(tempBar).style("stroke", "black");
                d3.selectAll(tempBar).style("stroke-width", "3");


//                if (tempPath != null){
//
//                    d3.selectAll(tempPath).style("stroke-width", 1);
//                }
                tempPath = "path.line-"+name[1];
                d3.selectAll(tempPath).style("stroke-width", 4);
            });

        var index = 1;

        svg.selectAll("g.dot")
            .data(cities)
            .enter().append("g")
            .attr("class", "dot")
            .selectAll("circle")
            .data(function(d) { return d.values; })
            .enter().append("circle")
            .attr("r", 5)
            .attr("cx", function(d,i) {  return x(d.day); })
            .attr("cy", function(d,i) { return y(d.value); })
            .style("stroke",function(d,i) {   return color(Math.floor(index++ / 8)); })
            .style("fill", "white")

// Tooltip stuff after this
            .on("mouseover", function(d) {              // when the mouse goes over a circle, do the following
//                d3.select(this).style("fill","red");
                tooltip.transition()                  // declare the transition properties to bring fade-in div
                    .duration(200)                  // it shall take 200ms
                    .style("opacity", .9);              // and go all the way to an opacity of .9
                tooltip .html( "<br/>" + d.day + "<br/>"  + d.value)  // add the text of the tooltip as html
                    .style("left", (d3.event.pageX) + "px")     // move it in the x direction
                    .style("top", (d3.event.pageY - 28) + "px");  // move it in the y direction
            })                          //
            .on("mouseout", function(d) {
                tooltip.transition()                  // declare the transition properties to fade-out the div
                    .duration(500)                  // it shall take 500ms
                    .style("opacity", 0);             // and go all the way to an opacity of nil
            })
        ;


        var legend = svg.selectAll()
            .data(cities)
            .enter().append('g')
            .attr('class', 'legend');

        legend.append('rect')
            .attr('x', width - 20)
            .attr('y', function(d, i){ return i *  20;})
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', function(d) {
                return color(d.label);
            });

        legend.append('text')
            .attr('x', width - 8)
            .attr('y', function(d, i){ return (i *  20) + 9;})
            .text(function(d){ return d.label; });
    });
}

function clear_selected(flag) {
    if (tempPoint != null){

        d3.selectAll(tempPoint).style("stroke", "black");
        d3.selectAll(tempPoint).style("stroke-width", 0) ;
    }


    if (tempBar != null){

        d3.selectAll(tempBar).style("stroke", "black");
        d3.selectAll(tempBar).style("stroke-width", "0");
    }


    if (tempPath != null){

        d3.selectAll(tempPath).style("stroke-width", 1);
    }

    for (var key in selected_dot) {



            var tempPoint1 = "circle.point-" + key;

            d3.selectAll(tempPoint1).style("stroke", "black");
            d3.selectAll(tempPoint1).style("stroke-width", 0);
            d3.selectAll(".extent").style("opacity",0);
            console.log("clear");


        var tempBar1 = "rect.bar-" + key;
        d3.selectAll(tempBar1).style("stroke", "black");
        d3.selectAll(tempBar1).style("stroke-width", "0");

        var tempPath1 = "path.line-" + key;
        d3.selectAll(tempPath1).style("stroke-width", 1);
    }

}