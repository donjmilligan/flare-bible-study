var currentsize;
var originlSize;
var plot;
var fontsize=8;
var cS=1;
var left;
var timer;
var source;
var flag=true;


$("document").ready(function(){
	// 1. patterns.js: initialize sidebar tab


	// 3. D3.js: set circle diameter
	if (currentsize==null) {
		var diam = 10;
		var windowheight = $(window).height();
		var windowwidth = $(window).width();
		if((windowheight < windowwidth) && (windowheight >= 600)){
			//console.log(windowheight + " 1st windowheight");
		   diam += windowheight - 100;
		   
		}else if((windowheight < windowwidth) && (windowheight < 600)){
			//console.log(windowheight + " 2nd windowheight");
	        diam += 560;
		}else if((windowwidth < windowheight) && (windowwidth >= 600)){
			//console.log(windowwidth + " 1st windowidth");
		   diam += windowwidth - 100;
		}else {
			//console.log(windowwidth + " 2st windowidth");
	        diam += 560;
		}
		//	var radius = diam / 2,
		currentsize = diam;
		originlSize = currentsize;
	}
}); 

$(function(){
	$("#vision-text").on("change", function() {
		var newVal = $(this).val()+"px";
	    $(".bibleStudy").css({"font-size": newVal });
	   // $("text.node.active").css({"font-size": "21px" });
	   // $("text.node.node--target").css({"font-size": "21px" });
	   // $("text.node.node--target").css({"font": "'Montserrat', sans-serif" });
	});
	$("#vision-circle").on("change", function() {
		    	if (timer==null) {
			    	timer=true;
			        currentsize += $(this).val();
					plotHierarchicalEdgeBundling(source);
				}else { return; }
	});

    $('#plus').click(function () {
    	if (timer==null) {
	    	timer=true;
	        currentsize += 70;
			plotHierarchicalEdgeBundling(source);
		}else { return; }
    });
    $('#minus').click(function () {
    	if (timer==null) {
	    	timer=true;
	        currentsize -= 70;
			plotHierarchicalEdgeBundling(source);
		} else { return; }
    });
    $('#tup').click(function () {
      	if(fontsize<=12){
      		fontsize+=1;
			$('.heb').css('font-size', fontsize+'px');
      	}
    });
    $('#tdown').click(function () {
    	if (fontsize>=5) {
    		fontsize-=1;
    		 $('.heb').css('font-size', fontsize+'px');
    	}
    });
    $('#opnctls').click(function () {
    	if ($('i.opnctls.mdi.mdi-settings').hasClass('menu-open')) {
	        $('i.opnctls.mdi.mdi-settings').removeClass('menu-open');
	        $("#ctlsNav").removeClass('open-ctls');
	    }else{
	        $('i.opnctls.mdi.mdi-settings').addClass('menu-open');
	       	$("#ctlsNav").addClass('open-ctls');    
	    }
    });

});

/*
 *
 * plotHierarchicalEdgeBundling -- D3js Hierarchical chart
 * this is called in the php/html - currently thevision.php (Nov 2018)	
 *
 */
function plotHierarchicalEdgeBundling(sourceFile){
        source = sourceFile;
        d3.json(sourceFile, function(data) {
        	if (plot==null) {
        		timer=true;
            	plot = setTimeout(function(){
            		$('.heb').css('font-size', fontsize+'em');
        			new HierarchicalEdgeBundling("chtHierarchicalEdgeBundling", "infoHierarchicalEdgeBundling", data);
        			$('.heb svg').css('width', currentsize);
            		$('.heb svg').css('height', currentsize);
        		}, 300);
        		setTimeout(function(){timer=null;},200);
        		
        	}else{
        		d3.select("g").remove();
        		d3.select("svg.bibleStudy").remove();
        		plot = setTimeout(function(){
        			HierarchicalEdgeBundling("chtHierarchicalEdgeBundling", "infoHierarchicalEdgeBundling", data);
        			$('.heb svg').css('width', currentsize+100);
            		$('.heb svg').css('height', currentsize+100);
        		}, 300);
        		setTimeout(function(){timer=null;},400);
        	}
    });
}

/*
 * HierarchicalEdgeBundling -- 
 * Called by the function above	
 */
var HierarchicalEdgeBundling = function(chartElementId, infoElementId, classes){
	 var diameter = currentsize;
	 var radius = diameter / 2,
	    innerRadius = radius - 120;
	
				/* create circle cluster */
	var cluster = d3.layout.cluster()
		.size([360
			, innerRadius])
		.sort(null)
		.value(function(d) { return d.size; });

	var bundle = d3.layout.bundle();

	var line = d3.svg.line.radial()
		.interpolate("bundle")
		.tension(.9)
		.radius(function(d) { return d.y; })
		.angle(function(d) { return d.x / 180 * Math.PI; });
				/* create svg element */
	var svg = d3.select("#"+chartElementId).append("svg")
		.attr("class", "bibleStudy")
		.attr("id", "g4")
		.append("g")
		.attr("transform", "translate(" + radius + "," + radius + ")");
				/* link node "birth place" */
	var link = svg.append("g").selectAll(".link"),
		node = svg.append("g").selectAll(".node");
				/* classes is each "object" from the json -- */
	var nodes = cluster.nodes(packageHierarchy(classes)),
		links = packageImports(nodes);
		  

		link = link
			.data(bundle(links))
			.enter().append("path")
			.each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
			.attr("class", "link")
			.attr("d", line);
				/* node object */
		node = node
			.data(nodes.filter(function(n) { return !n.children; }))
			.enter().append("text")
			.attr("class", "node")
			.attr("dy", ".31em")
			.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
			.style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
			.text(function(d) { return d.key; })
			.on("mouseover", mouseovered)
			.on("mouseout", mouseouted)
			.on("click", clicked);
          			
	d3.select(self.frameElement).style("height", diameter + "px");

							
	/* Lazily construct the package hierarchy from class names. */
	function packageHierarchy(classes) {
	var map = {};
		/* loops through several layers of objects within objects console.log(node.parent);
		 // key, label, children, all work well. */
	  function find(name, data) {
		var node = map[name], i;
		if (!node) {
		  node = map[name] = data || {name: name, children: []};
		  if (name.length) {
			node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
			node.parent.children.push(node);
			node.key = name.substring(i + 1);
		  }
		}
		return node;
	  }
	  classes.forEach(function(d) {
		find(d.name, d);
	  });

	  return map[""];
	}


	/* Return a list of imports for the given array of nodes. */
	function packageImports(nodes) {
	  var map = {},
		  imports = [];
	  /* Compute a map from name to node. */
	  nodes.forEach(function(d) {
		map[d.name] = d;
	  });
	  /* For each import, construct a link from the source to target node. */
	  nodes.forEach(function(d) {
		if (d.imports) d.imports.forEach(function(i) {
		  imports.push({source: map[d.name], target: map[i]});
		});
	  });
	  return imports;
	}
    /* isClicked */
    var tooltip = d3.select('#showSubjects'); 
    var biblify = d3.select('#showSubjects')
    	.append('span')
    	.style('opacity', '1');
    //.append('div').attr('class', 'tooltip').style("opacity", "0").style("display", "none");               
    //tooltip.append('div').attr('class', 'label'); 
	var isClicked;
	var anotherClicked;
	function sweepoff(d){
		link
		  .classed("link--target", false)
		  .classed("link--source", false);

	  	node
		  .classed("node--target", false)
		  .classed("node--source", false);
	}
	function sweepon(d){
	  node
		  .each(function(n) { n.target = n.source = false; });
	  link
		  .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
		  .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
		  .filter(function(l) { return l.target === d || l.source === d; })
		  .each(function() { this.parentNode.appendChild(this); });

	  node
		  .classed("node--target", function(n) { return n.target; })
		  .classed("node--source", function(n) { return n.source; });
	}
	function sweepReset(d){
		isClicked=null;
		sweepoff(d); 
	}
	function mouseovered(d){
	 	if (isClicked==null){ sweepon(d); }
	}
	function mouseouted(d) {
		if (isClicked==null){ sweepoff(d); } 
	}
	function clicked(d) {
			isClicked=1; 
			sweepon(d);
			showTexts(d);
			$('.node.active').removeClass('active');
			$(this).closest('.node').addClass('active');
			clickedListener(d);
	}
	function clickedListener(d){
		$('div.col-lg-9').on('click', function(e) {
			    //console.log(e.target);

				$('.node.active').removeClass('active');
			    sweepReset(d);
			}).on('click', '.node', function(e) {
			    e.stopPropagation();
			    e.stopPropagation();
			    //console.log('after propagation');
			});;
	}
	function showTexts(d){
			// clear old tooltip
			//console.log('inside showTexts');
			//tooltip.transition().duration(500).style("opacity", "1");  //The tooltip appears
			//console.log("fb-sT " + d.key + "");
			document.getElementById("showSubjects").style.display = "none";
			tooltip.transition().duration(400).style('opacity', '0');  //The tooltip disappears
			biblify.html('' + d.key + '');
			$("#showSubjects").biblify();
			if(flag){
				flag = false;
				document.getElementById("bibleTab").click();
			}
	}
	/* MySQL DB Query via AJAX 
	function showTexts(d) {
	    //Leave, for testing broken links
	    //console.log("dkey "+d.key);
	    if (d == "") {
	        document.getElementById("txtHint").innerHTML = "";
	        return;
	    } else { 
	        if (window.XMLHttpRequest) {
	            // code for IE7+, Firefox, Chrome, Opera, Safari
	            xmlhttp = new XMLHttpRequest();
	        } else {
	            // code for IE6, IE5
	            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	        }
	        xmlhttp.onreadystatechange = function() {
	            if (this.readyState == 4 && this.status == 200) {
	                document.getElementById("showTexts").innerHTML = this.responseText;
	            }
	        };
	        // prepare to query the ajax.php page
	        xmlhttp.open("GET","./vbs-db/index.php?b="+d.key,true);
	        // send query
	        xmlhttp.send();
	        // remove the "click on" prompt
	        document.getElementById("showSubjects").style.display = "none";
	        tooltip.transition().duration(400).style('opacity', '0');  //The tooltip disappears
	        // open bible tab
	        if(flag){
	            flag = false;
	            document.getElementById("bibleTab").click();
	        }
	    }
	} */

}

// Find the right fullscreen method, call on correct element
function launchFullscreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}
// EXIT fullscreen
function exitFullscreen() {
  if(document.exitFullscreen) {
    document.exitFullscreen();
  } else if(document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if(document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

// bible study menu

$("document").ready(function(){
    $('text.node').click(function () {
      //console.log('node clicked');
      $(this).addClass('active');
            
    });
    $('.heb .node').click(function () {
      //console.log('.heb .node clicked');
            
    });
    $('text').click(function () {
      //console.log('text clicked');
            
    });
 
});

/* Bible Study Navigation */
function overlayNav() {
    if ($('i.menu.mdi.mdi-close').hasClass('menu-open')) {
        $('i.menu.mdi.mdi-close').removeClass('menu-open');
        $('i.menu.mdi.mdi-close').addClass('mdi-menu');
        $('i.menu.mdi.mdi-close.mdi-menu').removeClass('mdi-close');
        document.getElementById("studyNav").style.width = "0";
    }else{
        $('i.menu.mdi.mdi-menu').addClass('menu-open');
        $('i.menu.mdi.mdi-menu').addClass('mdi-close');
        $('i.menu.mdi.mdi-menu').removeClass('mdi-menu');
        document.getElementById("studyNav").style.width = "100%";
        
    }
}

function switchContent(id,obj){
    $('.link-current').removeClass('link-current');
    $('section.content-current').removeClass('content-current');
    $(id).addClass('content-current');
    $(obj).addClass('link-current');
}



/*
 * there is no better scripture regex. This will snag a verse out of any string, even abbreviated.
 * jquery biblify -- MIT License
 * https://github.com/nathankitchen/jquery.biblify/blob/master/jquery.biblify.js
 *
 */


 (function($) {

     $.fn.biblify = function(options) {

     	function showTexts(str) {
     	    if (str == "") {
     	        document.getElementById("txtHint").innerHTML = "";
     	        return;
     	    } else { 
     	        if (window.XMLHttpRequest) {
     	            // code for IE7+, Firefox, Chrome, Opera, Safari
     	            xmlhttp = new XMLHttpRequest();
     	        } else {
     	            // code for IE6, IE5
     	            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
     	        }
     	        xmlhttp.onreadystatechange = function() {
     	            if (this.readyState == 4 && this.status == 200) {
     	                document.getElementById("showTexts").innerHTML = this.responseText;
     	         //       console.log(this.responseText);
     	        //	console.log('status ', this.status);
     	        //	console.log('readystate ', this.readyState);
     	            }
     	        };
     	       // console.log("string var "+str);
     	        xmlhttp.open("GET","./database/ajax.php?b="+str,true);
     	        xmlhttp.send();
     	    }
     	}



 		options = options || {};
 		options.content = options.content || '{url} {display} {tooltip}'
 		// '<a class="bible" href="http://www.biblegateway.com/passage/?version=AKJV&search={url}" title="Read {tooltip} on BibleGateway.com" target="_blank">{display}</a>';
 		
 		options.url = options.url || {};
 		options.url.href = options.url.href || '';
 		options.url.chapter = options.url.chapter || '';
 		options.url.verse = options.url.verse || ':';
 		options.url.range = options.url.range || '-';
 		
 		options.display = options.display || {};
 		options.display.chapter = options.display.chapter || '+';
 		options.display.verse = options.display.verse || '%3A';
 		options.display.verseplural = options.display.verseplural || '%3A';
 		options.display.range = options.display.range || '-';
 		
 		options.tooltip = options.tooltip || {};
 		options.tooltip.chapter = options.tooltip.chapter || ' chapter ';
 		options.tooltip.verse = options.tooltip.verse || ' verse ';
 		options.tooltip.verseplural = options.tooltip.verseplural || ' verses ';
 		options.tooltip.range = options.tooltip.range || ' to ';
 		
 		var regex = /(<=^|[ ]*)((1[ ]*[cjkpst]|2[ ]*[cjkpst]|3[ ]*j|a[cm]|co|d[ae]|e[cpsxz]|g[ae]|h[aeo]|is|j[aeou]|l[aekuv]|m[ai]|n[aeu]|ob|p[hrs]|r[eou]|song[ ]*[o]?[f]?[ ]*|ti|z[ae])[a-z]{0,12})([ ]*)([0-9]+)([,v\.\-: ]*)([0-9]+)([,\- ]*)([0-9]*)|([0-9])/ig;
 		
 		function fixup(text) {
 			var m = regex.exec(text);
 			//console.log("jqb-fup "+m);
 			if (m !== null) {
 				return text.replace(regex,
 						function ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) {
 							var spacer = ($2 === undefined) ? '': $2;
 							var book = $3;
 							var chapter = $6;
 							var versestart = $8;
 							var verseend = $10;
 							var endspacer = '';
 							
 							if (book !== undefined && chapter !== undefined && versestart !== undefined)
 							{
 								var urlref, textref, displayref = '';
 								
 								urlref = book + options.url.chapter + chapter;
 								displayref = book + options.display.chapter + chapter;
 								textref = book + options.tooltip.chapter + chapter;
 								
 								if (versestart && verseend) {
 									urlref += options.url.verse + versestart + options.url.range + verseend;
 									displayref += options.display.verseplural + versestart + options.display.range + verseend;
 									textref += options.tooltip.verseplural + versestart + options.tooltip.range + verseend;
 								}
 								else if (versestart)
 								{
 									urlref += options.url.verse + versestart;
 									displayref += options.display.verse + versestart;
 									textref += options.tooltip.verse + versestart;
 									endspacer = $9;
 								}
 							/*	console.log('FIXUP');
 								console.log(urlref); 
 								console.log('content');
 								console.log(content);
 								console.log(urlref);
 								console.log(textref);
 							    console.log(urlref); */
 								
 								urlref = encodeURI(urlref);

 							// console.log(displayref);
 							
 							showTexts(displayref);
 								var content = options.content.replace('{url}', urlref).replace('{tooltip}', textref).replace('{display}', displayref) + endspacer;
 								
 								return spacer + content;
 							}
 							
 							return $1;
 						}
 					);
 			}
 			
 			return false;
 			
 		}
 		
 		function removeNode(node) {
 			if (node.remove) {
 				node.remove();
 			}
 			else if (node.removeNode) {
 				node.removeNode();
 			}
 		}
 		
 		function getTextNodesIn(node, includeWhitespaceNodes) {
 			var textNodes = [], nonWhitespaceMatcher = /\S/;

 			function getTextNodes(node) {
 				
 				// If the node is a link, skip it. We don't wan to start creating links
 				// within links. TODO: should be able to pass an array of tags to ignore.
 				if (node.tagName === 'A' || node.tagName === 'a') {
 					return;
 				}
 					
 				if (node.nodeType === 3) {
 					if (node.length > 0 && nonWhitespaceMatcher.test(node.nodeValue)) {
 						
 						var html = fixup(node.nodeValue);
 						
 						if (html !== undefined && html)

 						{
 							// get it from databasee
 							
 							
 							// If it's a text node with a Bible reference, return the node and the markup
 							// we intend to replace it with. This will later be appended with data about
 							// how to insert the HTML (complicated, because we're in a text node, not a
 							// DOM element).

 							return { node: node, markup: html };
 						}
 					}
 				} else {
 					
 					var replacements = [];
 					for (var i = 0, len = node.childNodes.length; i < len; ++i) {
 						
 						var replacement = getTextNodes(node.childNodes[i]);
 						if (replacement) {
 							
 							// If we were returned a replacement operation, we need to figure out
 							// how to switch out the text node for HTML.
 							if (node.childNodes.length === 1)
 							{
 								// We're swapping the whole element content (easy!)
 								replacement.type = 'all';
 								replacement.editNode = node;
 								replacements.push(replacement);
 							}
 							else if (i > 0)
 							{
 								// There's a previous sibling element, so we can use it with
 								// an insert-after operation, then clear the original text node.
 								replacement.type = 'after';
 								replacement.editNode = node.childNodes[i-1];
 								replacements.push(replacement);
 							}
 							else if (i < node.childNodes.length - 1)
 							{
 								// There's a subsequent sibling element which we can use with an
 								// insert-before operation and clearing the original node.
 								replacement.type = 'before';
 								replacement.editNode = node.childNodes[i+1];
 								replacements.push(replacement);
 							}
 							
 						}
 					}
 					
 					// Loop through the cached operations. These couldn't have been done 
 					// inline because we'd be changing the DOM elements that we were recursing
 					// through. Switch on the appropriate operation, and update markup.
 					if (replacements.length > 0) {
 						for (var j = 0; j<replacements.length; j++) {
 							switch (replacements[j].type)
 							{
 								case 'all':
 									replacements[j].editNode.insertAdjacentHTML('afterbegin', replacements[j].markup);
 									removeNode(replacements[j].node);
 									break;
 								case 'after':
 									replacements[j].editNode.insertAdjacentHTML('afterend', replacements[j].markup);
 									removeNode(replacements[j].node);
 									break;
 								case 'before':
 									replacements[j].editNode.insertAdjacentHTML('beforebegin', replacements[j].markup);
 									removeNode(replacements[j].node);
 									break;
 							}
 						}
 					}
 				}
 			}
 			
 			getTextNodes(node);
 		}
 		
 		return this.each( function() {
 				getTextNodesIn(this);
 			});
 		if (true) {}
 	};

 }(jQuery));
