var idObj = {};
var idObjAbbr = {};
var states = {};
var data = [];
var usedStates = [];
var obj = [];
var color = {};
var ddStates = {};

   d3.csv("cities-lived.csv", function(d){
        d.forEach(function(i){
            idObj[i.abbr] = i.place;
            idObjAbbr[i.id] = i.abbr;
        });
    });
    d3.csv("HospInfo.csv", function(d){
        d.forEach(function(datum){
            if(datum.State === undefined || datum.State === "NA"){
                return;
            }
            if(states[datum.State] === undefined){
                states[datum.State] = 0;
            }
            states[datum.State] +=1;
        });
    });

function showMap(){
    //Width and height of map
    var width = 710;
    var height = 390;

    var lowColor = '#f9f9f9'
    var highColor = 'green'

    Object.keys(states).forEach(function(key){
        if(key == "VI" || key == "AS" || key == "GU" || key == "MP" || key == "DC" || key == "PR"){return;}
        data.push({
            state: idObj[key],
            value: states[key]
        });
    });
    
    
    // D3 Projection
    var projection = d3.geoAlbersUsa()
      .translate([width / 2, height / 2]) // translate to center of screen
      .scale([700]); // scale things down so see entire US

    // Define path generator
    var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
      .projection(projection); // tell path generator to use albersUsa projection

    //Create SVG element and append map to the SVG
    var svg = d3.select(".view1")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
        // Load in my states data!
        var dataArray = [];
        for (var d = 0; d < data.length; d++) {
            dataArray.push(parseFloat(data[d].value))
        }
        var minVal = d3.min(dataArray)
        var maxVal = d3.max(dataArray)
        var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor])

      // Load GeoJSON data and merge with states data
      d3.json("us-states.json", function(json) {
          
        // Loop through each state data value in the .csv file
        for (var i = 0; i < data.length; i++) {
            // Grab State Name
          var dataState = data[i].state;

          // Grab data value 
          var dataValue = data[i].value;

          // Find the corresponding state inside the GeoJSON
          for (var j = 0; j < json.features.length; j++) {
            var jsonState = json.features[j].properties.name;

            if (dataState == jsonState) {

              // Copy the data value into the JSON
              json.features[j].properties.value = dataValue;

              // Stop looking through the JSON
              break;
            }
          }
        }

        // Bind the data to the SVG and create one path per GeoJSON feature
        svg.selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", path)
          .style("stroke", "#fff")
          .style("stroke-width", "1")
          .style("fill", function(d) { return ramp(d.properties.value) })
          .on('mouseover', function(d,i,n){
            //console.log(d.id);
            var currentState = d.properties.name;
            var curr = d3.select(n[i]);
            curr.style("fill", "red");
           })
            .on('mousemove', function(d,i,n){
                var currentState = d.properties.name;
                var tooltip = d3.select(".myTooltip")._groups[0];
                tooltip[0].style.display = 'block';
                tooltip[0].style.left =  d3.event.pageX + 'px';
                tooltip[0].style.top = d3.event.pageY +'px';
                tooltip[0].innerHTML = currentState + ': ' + states[idObjAbbr[d.id]]+ " Hospitals";
                var curr = d3.select(n[i]);
                curr.style("fill", "red");
            })
            .on("mouseleave",function(d,i,n){
                var tooltip = d3.select(".myTooltip")._groups[0];
                tooltip[0].style.display = 'none';
                var curr = d3.select(n[i]);
                curr.style("fill", function(d) { return ramp(d.properties.value) });
            })
            .on("click",function(d){
                secondChart(idObjAbbr[d.id]);
                thirdChart(idObjAbbr[d.id]);
            });
   
          
          // add a legend
		var w = 130, h = 150;

		var key = d3.select(".view1")
			.append("svg")
			.attr("width", w-20)
			.attr("height", h)
			.attr("class", "legend");
        var legend = key.append("defs")
			.append("svg:linearGradient")
			.attr("id", "gradient")
			.attr("x1", "100%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "100%")
			.attr("spreadMethod", "pad");

		legend.append("stop")
			.attr("offset", "0%")
			.attr("stop-color", highColor)
			.attr("stop-opacity", 1);
			
		legend.append("stop")
			.attr("offset", "100%")
			.attr("stop-color", lowColor)
			.attr("stop-opacity", 1);

		key.append("rect")
			.attr("width", w - 100)
			.attr("height", h)
			.style("fill", "url(#gradient)")
			.attr("transform", "translate(0,10)");

		var y = d3.scaleLinear()
			.range([h, 0])
			.domain([minVal, maxVal]);

		var yAxis = d3.axisRight(y);

		key.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(41,10)")
			.call(yAxis)
      
    });
}

function secondChart(name){
    d3.csv("HospInfo.csv", function(data){
        var stateObj = {};
        data.forEach(function(ith){
            if(ith.State === name){
                if(ith["Hospital Type"] === undefined || ith["Hospital Type"] === "NA"){
                    return;
                }
                if(stateObj[ith["Hospital Type"]] === undefined){
                    stateObj[ith["Hospital Type"]] = 0;
                }
                stateObj[ith["Hospital Type"]] += 1;
            }
        });
        
        var exsists = false;
        for(var i = 0; i < usedStates.length; i++){
            if(name == usedStates[i]){
                exsists = true;
                break;
            }
        }
        
        function random_rgba() {
            var o = Math.round, r = Math.random, s = 255;
            return 'rgb(' + r()*s + ',' + r()*s + ',' + r()*s + ')';
        }
        
        if(exsists == false){
            Object.keys(stateObj).forEach(function(key){
                obj.push({
                    type: key +" State: " + name,
                    count: stateObj[key]
                });
            });
            //console.log(obj);
            usedStates.push(name);
            color[name] = random_rgba();
        }
        
       
        d3.select(".bubbleSvg").remove();
        
        var svg = d3.select('.view2')
            .append('svg')
            .attr('class','bubbleSvg')
            .attr('width', 710)
            .attr('height', 390)
            .append('g')
            .attr('transform', 'translate(0,0)');
        
        var radiusScale = d3.scaleSqrt().domain([1,500]).range([10,50]);
        
        var simulation = d3.forceSimulation()
            .force("forceX", d3.forceX(700/2).strength(0.05))
            .force("forceY", d3.forceY(300/2).strength(0.05))
            .force("collide", d3.forceCollide(function(d){
                return radiusScale(d.count)
            }));
        
        var circles = svg.selectAll("circ")
            .data(obj)
            .enter().append("circle")
            .attr('class', 'circ')
            .style("fill",function(d,i,n){
                var naam = d.type.split(':');
                return color[naam[1].trim()];
            })
            .style("opacity", 1.0)
            .attr("r", function(d){
                return radiusScale(d.count)
            });
        
        simulation.nodes(obj)
            .on('tick', ticked);
        
        function ticked(){
            circles
                .attr("cx", function(d){
                    return d.x
                })
                .attr("cy", function(d){
                    return d.y
                })
        }
    });
}

function thirdChart(name){
    d3.csv("HospInfo.csv", function(data){
        var ownNtype = {};
        data.forEach(function(ith){
            if(ith.State == name){
                if(ith["Hospital Type"] === undefined || ith["Hospital Type"] === "NA" 
                 ||ith["Hospital Ownership"] === undefined || ith["Hospital Ownership"] === "NA"){
                   return;
               }
                if(ownNtype[ith["Hospital Type"] + "," + ith["Hospital Ownership"]] === undefined){
                        ownNtype[ith["Hospital Type"] + "," + ith["Hospital Ownership"]] = 0;
                }
                ownNtype[ith["Hospital Type"] + "," + ith["Hospital Ownership"]] +=1;
            }
        });
        var nodes = [];
        var pNames = {};
        Object.keys(ownNtype).forEach(function(key){
            var names = key.split(',');
            var i = {}, j = {};
            i['name'] = names[0].trim();
            j['name'] = names[1].trim();
            if(pNames[names[0].trim()] == undefined){
                nodes.push(i);
                pNames[names[0].trim()] = 1;
            }
            if(pNames[names[1].trim()] == undefined){
                nodes.push(j);
                pNames[names[1].trim()] = 1;
            }
        });
        var stObj = {};
        var i = 0;
        Object.keys(ownNtype).forEach(function(key){
            var names = key.split(',');
            if(stObj[names[0]] == undefined){
                stObj[names[0]] = i;
                i += 1;
            }
            if(stObj[names[1]] == undefined){
                stObj[names[1]] = i;
                i += 1;
            }
        });
        var links = [];
        Object.keys(ownNtype).forEach(function(key){
            var names = key.split(',');
            var sIndex = stObj[names[0].trim()];
            var tIndex = stObj[names[1].trim()];
            links.push({
                source: sIndex,
                target: tIndex,
                value:  ownNtype[key]
            })
        });
        var tObj = {};
        tObj["nodes"] = nodes;
        tObj["links"] = links;
        
        d3.select(".v3Svg").remove();
        
        var svg = d3.select('.view3')
            .append('svg')
            .attr('class','v3Svg')
            .attr('width', 500)
            .attr('height', 300);
        
        var width = +svg.attr("width");
        var height = +svg.attr("height");

        var formatNumber = d3.format(",.0f"),
            format = function(d) { return formatNumber(d) + " TWh"; },
            color = d3.scaleOrdinal(d3.schemeCategory10);

        var sankey = d3.sankey()
            .nodeWidth(15)
            .nodePadding(10)
            .extent([[1, 1], [width - 1, height - 6]]);

        var link = svg.append("g")
            .attr("class", "links")
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-opacity", 0.2)
            .selectAll("path");
            

        var node = svg.append("g")
            .attr("class", "nodes")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .selectAll("g");
        
        sankey(tObj);
          link = link
                .data(tObj.links)
                .enter().append("path")
                .attr("d", d3.sankeyLinkHorizontal())
                .attr("stroke-width", function(d) { return Math.max(1, d.width); })
                .on("mouseover", function(d,index,nodes){
                    var curr = d3.select(nodes[index]);
                    curr.style("stroke-opacity","0.8");
                })
                .on("mousemove", function(d,index,nodes){
                    var curr = d3.select(nodes[index]);
                    curr.style("stroke-opacity","0.8");
                })
                .on("mouseleave", function(d,index,nodes){
                    var curr = d3.select(nodes[index]);
                    curr.style("stroke-opacity","0.2");
                });

          link.append("title")
              .text(function(d) { return d.source.name + " that are owned by " + d.target.name + "\n Total: " + d.value; });
          link.on("click", function(d){ collapseTree(d.source.name, d.target.name, name) });

          node = node
            .data(tObj.nodes)
            .enter().append("g");

          node.append("rect")
              .attr("x", function(d) { return d.x0; })
              .attr("y", function(d) { return d.y0; })
              .attr("height", function(d) { return d.y1 - d.y0; })
              .attr("width", function(d) { return d.x1 - d.x0; })
              .attr("fill", function(d) { return color(d.name.replace(/ .*/, "")); })
              .attr("stroke", "#000");

          node.append("text")
              .attr("x", function(d) { return d.x0 - 6; })
              .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
              .attr("dy", "0.35em")
              .attr("text-anchor", "end")
              .text(function(d) { return d.name; })
              .filter(function(d) { return d.x0 < width / 2; })
              .attr("x", function(d) { return d.x1 + 6; })
              .attr("text-anchor", "start");

          node.append("title")
              .text(function(d) { return d.name + "\n" + format(d.value); });
        
        dropDownContent();
       
    });
}

function dropDownContent(){
     
    var button = d3.select(".dropdown");
    button.style("display", "inline-block");
    var selected = d3.select(".dropdownContent");
    for(var i =0; i < usedStates.length; i++){
        if(ddStates[usedStates[i]] === undefined){
            selected.append(function() { 
                var pp = document.createElement("a");
                pp.innerHTML = usedStates[i];
                pp.setAttribute("onclick", "newFunc(this)");
                pp.setAttribute("href","#");
                return pp;
            });
            ddStates[usedStates[i]] = 1;
        }
    }
}

function newFunc(curr){
    console.log(curr.text);
    //d3.select(".dropdownContent").style("display", "none");
    thirdChart(curr.text);
    
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
} 