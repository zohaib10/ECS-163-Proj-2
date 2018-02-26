var idObj = {};
var idObjAbbr = {};
var states = {};
var data = [];
var usedStates = [];
var obj = [];
var color = {};
var ddStates = {};
var bubCounter = 0;

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
			.attr("width", 70)
			.attr("height", 170)
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
    if(bubCounter >= 1){
        var btn = d3.select(".btn");
        btn.style("display","inline");
        var btn1 = d3.select(".btn1");
        btn1.style("display","inline");
    }
    bubCounter++;
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
        
        var forceX = d3.forceX(function(d){
            if(d.type.split(":")[0] === "Critical Access Hospitals State"){
              return 100;  
            }else if(d.type.split(":")[0] === "Childrens State"){
                return 400;
            }else{
                return 650;
            }
            return 700/2;
        }).strength(0.25);
        var forceCollide = d3.forceCollide(function(d){ return radiusScale(d.count) + 5});
        
        var simulation = d3.forceSimulation()
            .force("forceX", d3.forceX(700/2).strength(0.05))
            .force("forceY", d3.forceY(300/2).strength(0.05))
            .force("collide", forceCollide); 
        
        var pObj = {};
        for(var i = 0; i < obj.length; i++){
                if(pObj[obj[i].type.split(":")[0]] === undefined){
                    pObj[obj[i].type.split(":")[0]] = 0;
                }
                pObj[obj[i].type.split(":")[0]] += obj[i].count;
        }
        
        var circles = svg.selectAll("circ")
            .data(obj)
            .enter()
            .append("circle")
            .attr('class', 'circ')
            .style("fill","white")
            .style("stroke",function(d,i,n){
                var naam = d.type.split(':');
                return color[naam[1].trim()];
            })
            .style("stroke-width", '5px')
            .style("opacity", 1.0)
            .attr("r", function(d){
                return radiusScale(d.count)
            })
            .on('mousemove', function(d,i,n){
                var currentState = idObj[d.type.split(":")[1].trim()];
                var tooltip = d3.select(".myTooltip")._groups[0];
                tooltip[0].style.display = 'block';
                tooltip[0].style.left =  d3.event.pageX + 'px';
                tooltip[0].style.top = d3.event.pageY +'px';
                tooltip[0].innerHTML = currentState + ': ' + states[d.type.split(":")[1].trim()]+ " Hospitals";
            })
            .on("mouseleave",function(d,i,n){
                var tooltip = d3.select(".myTooltip")._groups[0];
                tooltip[0].style.display = 'none';
            })
            .on("click",function(d){
               
            });
            
        
        d3.select("#types").on("click",function(){
            simulation
                .force("x", forceX)
                .alphaTarget(0.5)
                .restart();
            
            var paras = d3.select('.paras');
            
            var paragraph = d3.select('.p1')._groups[0];
            
            console.log(paragraph[0]);
            
            if(paragraph[0] === null){
            
                paras.append(function() { 
                    var p1 = document.createElement('p');
                    p1.setAttribute("class", "p1");
                    p1.innerHTML = "Critical Access: " + pObj["Critical Access Hospitals State"];
                    p1.style.display = "inline";
                    return p1;
                });

                paras.append(function() { 
                    var p1 = document.createElement('p');
                    p1.setAttribute("class", "p2");
                    p1.innerHTML = "Childrens: " + pObj["Childrens State"];
                    p1.style.display = "inline";
                    return p1;
                });

                paras.append(function() { 
                    var p1 = document.createElement('p');
                    p1.setAttribute("class", "p3");
                    p1.innerHTML = "Acute Care: " + pObj["Acute Care Hospitals State"];
                    p1.style.display = "inline";
                    return p1;
                });
            }else{
                var p1 = d3.select(".p1");
                p1.style('display', "inline");
                var p2 = d3.select(".p2");
                p2.style('display', "inline");
                var p3 = d3.select(".p3");
                p3.style('display', "inline");
            }
  
        });
        
        d3.select("#combine").on("click",function(){
            simulation
                .force("x", d3.forceX(600/2).strength(0.16))
                .alphaTarget(0.3)
                .restart();
            var p1 = d3.select(".p1");
            p1.style("display","none");
            var p2 = d3.select(".p2");
            p2.style("display","none");
            var p3 = d3.select(".p3");
            p3.style("display","none");
        });
        
        simulation.nodes(obj)
            .on('tick', ticked);
        
        function ticked(){
            circles
                .attr("cx", function(d){
                    return d.x
                })
                .attr("cy", function(d){
                    //console.log(d);
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

function collapseTree(source,target,name){
    var statesT = {};
    var cArray = [];
    var countyObj = {};
    var tObject = {};
    d3.csv("HospInfo.csv", function(data){
        data.forEach(function(datum){
            if(datum.State === name){
                if(datum["County Name"] == undefined){
                    return;
                }
                if(statesT[datum["County Name"]] == undefined){
                    statesT[datum["County Name"]] = 1;
                }
            }
        });
        var stateObj = [];
        Object.keys(statesT).forEach(function(county){
            data.forEach(function(datum){
                if(datum.State === name && datum["County Name"] === county){
                    if(datum["Hospital Type"] === source || datum["Hospital Ownership"] === target){
                        if(countyObj[county] === undefined){
                            countyObj[county] = 0;
                        }
                        countyObj[county] += 1;
                    }
                }
            });
        });
        Object.keys(countyObj).forEach(function(key){
           if(key.length > 1){
               cArray.push({
                   id: key,
                   score: countyObj[key],
                   label: key,
                   weight: 0.5,
                   width:0.5 * key.length,
                   color: rand_color()
               });
           } 
        });
        
        function rand_color() {
            var o = Math.round, r = Math.random, s = 255;
            return 'rgb(' + r()*s + ',' + r()*s + ',' + r()*s + ')';
        }
        
        plotTree(cArray);
    });
}

function plotTree(nData){
    var data = [];
    if(nData.length > 25){
        for(var i = 0; i < 25; i++){
            data.push(nData[i]);
        }
    }else{
         for(var i = 0; i < nData.length; i++){
             data.push(nData[i]);
        }
    }
    
    var width = 300,
        height = 300,
        radius = Math.min(width, height) / 2,
        innerRadius = 0.3 * radius;

    var pie = d3.pie()
        .sort(null)
        .value(function(d) { return d.width; });

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([0, 0])
      .html(function(d) {
        return d.data.label + ": <span style='color:orangered'>" + d.data.score + "</span>";
      });
    
    var lengthScale = d3.scaleSqrt().domain([0,30]).range([0,20]);

    var arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(function (d) {
          var rad = radius - innerRadius;
          rad = rad - 40/d.data.score; 
          return rad + lengthScale(d.data.score);
      });
    

    var outlineArc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius);
    d3.select(".spinSvg").remove();

    var svg = d3.select(".view4").append("svg")
        .attr("class","spinSvg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svg.call(tip);
    var score = 0;

        //console.log(data);
          data.forEach(function(d) {
            d.color  =  d.color;
            d.score  = +d.score;
            score   = score + d.score;
            d.width  = +d.weight;
            d.label  =  d.label;
          });
          // for (var i = 0; i < data.score; i++) { console.log(data[i].id) }
    
          var path = svg.selectAll(".solidArc")
            .data(pie(data))
            .enter()
            .append("path")
            .attr("fill", function(d) { return d.data.color; })
            .attr("class", "solidArc")
            .attr("stroke", "gray")
            .attr("d", arc)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

          var outerPath = svg.selectAll(".outlineArc")
              .data(pie(data))
            .enter().append("path")
              .attr("fill", "none")
              .attr("stroke", "gray")
              .attr("class", "outlineArc")
              .attr("d", outlineArc);

          svg.append("svg:text")
            .attr("class", "aster-score")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle") // text-align: right
            .text(Math.round(score))
            .attr("fill", "white");
}
