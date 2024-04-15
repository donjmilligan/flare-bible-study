// Very modified version of:  
// https://github.com/danielgtaylor/bibviz/blob/master/web/contents/scripts/main.js
// Contributor: Don Milligan
var currentsize;
var originlSize;
var bData = null;
var bookToChapter = {};
var bookToChapterCount = {};
var maxLength = 250;
var flag = true;
var fetched = null;
var para = null;
var paraFilters = {
    source: window._paraSource ? window._paraSource : 'sab', /* Source of data, default SAB */
    book: null,         /* Specific book name */
    chapter: null,      /* Specific absolute chapter */
    type: null,         /* Specific paradiction type */
    search: null,       /* Text to search for via regex */
    refCount: null,     /* Specific range of references */
    crossBook: false,   /* Only show cross-book paradoxes */
    colorize: '1D84B2', /* Colorize the arcs */
    translation: 't_kjv',/* bible translation selection */
    readableT: 'King James Versoin' /* readable. updates @ updateSelect */
};

var searchHashTimer = null;

if (!window.maxArcs) {
    var maxArcs = 20;
}
// Available paradiction types
var paraTypeFilters = {
    'All': null,
    'God': /god/i,
    'Jesus': /jesus/i,
    'Love': /(marry)|(marriage)|(love)|(conceive)|(wife)|(childbearing)|(adulterer)/i,
    'Sabbath': /sabbath/i,
    'What is': /(^\s*what)|(which)/i,
    'State of the Dead': /(dead)|(hell)|(die)|(death)|(sheol)|(the pit)/i,
    'Paradoxes': /paradox/i,
    'Works': /works/i,
    'Faith': /faith/i,
    'Grace': /grace/i,
    'Other': null
};

if(fetched == null){
    var str = "John 14:1-31,1st John 4:1-21";
    bibleFromSQL(str);
    settingsDisplay();
} 

/* 
 *   
 *   Begin Functions
 *   
 *
*/

$(function(){
    $("#text-range").on("change", function() {
        var newVal = $(this).val()+"%";
        $("span.versetext").css({"font-size": newVal });
        $("p").css({"font-size": newVal });
        $("option").css({"font-size": newVal });
        if($(this).val() <= 120){
            $("select").css({"font-size": $(this).val()+"%" });
        }else if($(this).val() > 120){
            $("select").css({"font-size": "140%" });
        }
       // $("text.node.active").css({"font-size": "21px" });
       // $("text.node.node--target").css({"font-size": "21px" });
       // $("text.node.node--target").css({"font": "'Montserrat', sans-serif" });
    });
});

/* MySQL DB Query via AJAX */
function bibleFromSQL(str) {
        //console.log("str "+str);
        //console.log(fetched);
        if (str == "") {
            document.getElementById("txtHint").innerHTML = "";
            return;
        } else {
            fetched = str; 
            if (window.XMLHttpRequest) {
                // code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp = new XMLHttpRequest();
            } else {
                // code for IE6, IE5
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    document.getElementById('showTexts').innerHTML = this.responseText;
            //  console.log(this.responseText);
            //  console.log('status ', this.status);
            //  console.log('readystate ', this.readyState);
                }
            };
           // console.log("string var "+str);
            xmlhttp.open("GET","./database/ajax.php?b="+str+"&t="+paraFilters.translation,true);
            xmlhttp.send();
            setTimeout(function(){
                // call niceScroll after, to continually reapply to new elements. 
                $(".nicescroll-box").niceScroll(".wrap",{
                  cursorwidth: 7,
                   boxzoom:true,
                   cursoropacitymin: .3,
                   cursoropacitymax: .8
                 });
            }, 1000);
            
            // remove the click on a verse note
            //document.getElementById("showSubjects").style.display = "none";
            // open bible tab
            //if(flag){
            //    flag = false;
            //    document.getElementById("bibleTab").click();
            //}
        }
    //}
}

/* for chart processing in renderCompare - define chart arcs */
function getAbsoluteChapter(verse) {
    var parts = /^(\d?\s?[a-z]+)[\s.:]*(\d*):?(\d*)[-]?(\d*)/i.exec(verse);
    //console.log(parts);
    if (parts === null) return;

    var chapter = bookToChapter[parts[1]];
    chapter = (chapter === undefined) ? bookToChapter[parts[1] + 's'] : chapter;

    return chapter + parseInt(parts[2]);
}

/*
    keeps array, or makes an object into an array
*/
function flatRefs(refs) {
    var i, j, keys;

    if (refs instanceof Array) {
        refList = refs;
    } else {
        // This is an object with more info, so let's pull
        // out all the refs.
        refList = [];

        keys = Object.keys(refs);
        for (i = 0; i < keys.length; i++) {
            for (j = 0; j < refs[keys[i]].length; j++) {
                refList.push(refs[keys[i]][j]);
            }
        }
    }
    return refList;
}




/* Clip a value between min and max, inclusive */
function clip(min, value, max) {
    return Math.max(min, Math.min(value, max));
}

/* Chooses a color for an arc from start to end */
function colorize(start, end) {
    var color = '1D84B2'; // blue
    var distance;

    if(paraFilters.colorize == 'Blue'){
        color = '1D84B2';
    }
    if(paraFilters.colorize == 'Purple'){
        color = '6e4b91';
    }
    if(paraFilters.colorize == 'Black'){
        color = '444';
    }
    if (paraFilters.colorize == 'Rainbow') {
        distance = Math.abs(end - start);
        color = d3.hsl(distance / 1189 * 360, 0.7, 0.35);
    }
    return color;
}

function translation(){
    // console.log("in translation: "+fetched);
    if(fetched !== null){
        var str = "John 14:1-31,Ecclesiastes 12:1-14";
        bibleFromSQL(str);
    } 
}



function test(config) {
    var aspectRatio = 10 / 3;
    var margin = { top: 0, right: 0, bottom: 30, left: 0 };
    var current = new Date();
    var xScale = d3.time.scale().domain([d3.time.year.offset(current, -1), current]);
    var isZoomControllingScale = false;
    var xAxis = d3.svg.axis().scale(xScale).ticks(5);
    var currentScale = 1;
    var currentTranslate = [0, 0];
    var zoom = d3.behavior.zoom().on('zoom', function() {
        currentScale = d3.event.scale;
        currentTranslate = d3.event.translate;
        d3.select(this.parentNode.parentNode.parentNode).call(result);
    });
    var result = function(selection) {
        selection.each(function(data) {
            var outerWidth = $(this).width();
            var outerHeight = outerWidth / aspectRatio;
            var width = outerWidth - margin.left - margin.right;
            var height = outerHeight - margin.top - margin.bottom;
            xScale.range([0, width]);
            if(!isZoomControllingScale) {
                isZoomControllingScale = true;
                zoom.x(xScale).scale(currentScale).translate(currentTranslate);
            }

            var svg = d3.select(this).selectAll('svg').data([data]);
            var svgEnter = svg.enter().append('svg');
            svg.attr('width', outerWidth).attr('height', outerHeight);
                var gEnter = svgEnter.append('g');
                var g = svg.select('g').attr('transform', 'translate(' + margin.left + ' ' + margin.top + ')');
                    gEnter.append('rect').attr('class', 'background').style('fill', '#F4F4F4').call(zoom);
                    g.select('rect.background').attr('width', width).attr('height', height);

                    var rectItem = g.selectAll('rect.item').data(function(d) {
                        return d;
                    });
                    rectItem.enter().append('rect').attr('class', 'item').style('fill', '#00F');
                    rectItem.attr('x', function(d) {
                        return xScale(d);
                    }).attr('width', xScale(d3.time.day.offset(xScale.invert(0), 7))).attr('height', height);

                    gEnter.append('g');
                    g.select('g').attr('transform', 'translate(0 ' + height + ')').call(xAxis);
        });
    };
    return result;
}

/*
    Shows current settings, called from bellow setFiltersFromHash
*/
function settingsDisplay(){
    var t = paraFilters.readableT,
        subject = paraFilters.type, 
        b = paraFilters.book;
    //console.log("subject book"+ subject + " " + b);
    if(subject == null){
        subject="All Subjects";
    }
    if(b == null){
        b = "All books";
    }
    d3.select('#settings-stats')
        .html('<span class="badge badge-primary">' + t + '</span>' + '<span class="badge badge-secondary">' + subject + '</span>'  + '<span class="badge badge-info">' + b + '</span>' );
} 

/*  
 *    
 *   BEGIN D3 RENDER 
 *
 *
 */

d3.json('data/kjv.json', function (err, json) {
    if (err) { console.log(err); }
    bData = json;
    var bookSelect = d3.select('#book-select');
    var chapters = [];
    var chapterCount = 0;
    // Decipher book and chapter lengths, word count etc
    for (var x = 0; x < json.sections.length; x++) {
        for (var y = 0; y < json.sections[x].books.length; y++) {
            bookSelect.append('option')
                .text(json.sections[x].books[y].shortName);
            bookToChapter[json.sections[x].books[y].shortName] = chapterCount;
            bookToChapterCount[json.sections[x].books[y].shortName] = 0;
            for (var z = 0; z < json.sections[x].books[y].chapters.length; z++) {
                chapterCount++;
                chapters.push({
                    section: json.sections[x].name,
                    book: json.sections[x].books[y].shortName,
                    chapter: json.sections[x].books[y].chapters[z]
                });
                bookToChapterCount[json.sections[x].books[y].shortName]++;
            }
        }
    }
    
    var $container = $('#arc-chart'),
            width = $container.width(),
            height = $container.height(),
            scale = (width / 1300),
            fontSize = (Math.min(width,height)/4);
    
    /* SVG  SVG  */
    var svg = d3.select('#arc-chart').append("svg")
        .attr("width", '100%')
        .attr("height", '100%')
        .attr('viewBox','0 0 '+Math.min(width,height) +' '+Math.min(width,height) )
        .attr('preserveAspectRatio','xMinYMin');

    /* G Tier 1  */
    var g = svg.append("g");


   /* SVG Pan Zoom + Tool Tip */    
       //sets zoom functionality
       svg.call(d3.zoom()
           .scaleExtent([1 / 7, 12])
           .on("zoom", zoomed));
       // implements above via transform
       function zoomed() {
         g.attr("transform", d3.event.transform);
       }
       // Book hover tooltip
       var div = d3.select("body").append("div")   
           .attr("class", "tooltip")               
           .style("opacity", 0);
       //    cal
       var zoom = d3.zoom()
           .on("zoom", zoomed);
       //
       if ($(window).width() < 1024){
           g.transition()
             .call(zoom.transform, transform(0.02));
       }else if(($(window).width() < 1700) && ($(window).width() >= 1024)) {
           g.transition()
             .call(zoom.transform, transform(0.12));
       }

       function transform(e) {
           e = scale + e;
         return d3.zoomIdentity
             .translate(25, 0)
             .scale(e);
       }
    // Select chapters, place them in rect' within Tier 1 G with href to bible hub
    g.selectAll('rect')
        .data(chapters)
        .enter().append('rect')
            .attr('class', function (d, i) {
                var testament = d.section == 'New Testament' ? 'nt' : '';
                var book = 'b' + d.book.replace(/\s+/g, '').toLowerCase();
               // console.log("book: "+d.book);
                return testament + ' ' + book;
            })
            .attr('x', function (d, i) {return i;})
            .attr('y', 400)
            .attr('width', 1)
            .attr('height', function (d, i) {return d.chapter.relativeLength * 100;})
            .on('click', function (d) {
                var chapterNum = parseInt(d.chapter.name.split(' ')[1]);
                console.log('chapterNum: '+chapterNum);
                var str = d.book +' '+ chapterNum+':1-'+d.chapter.verseCount ;
                console.log('str: '+str);
                bibleFromSQL(str);
                //var bhBook = d.book.replace(/\s+/g, '_').toLowerCase(); // ie: 1_samuel for bible hub url
                //v
                //window.open('http://www.biblehub.com/kjv/' + bhBook + '/' + chapterNum + '.htm');
            })
            .on('mouseover', function (d) {
                $(this).attr('y', 396)
                .attr('width', 2);
                //tooltip display  
               div.transition()     
                        .duration(200)       
                        .style("opacity", .9);       
                    div.html(d.section + ' - ' + d.book + ' - ' + d.chapter.name + '<br/><span class="subdued">' + d.chapter.verseCount + ' verses, ' + d.chapter.wordCount + ' words, ' + d.chapter.charCount + ' characters</span>')
                        .style("left", (d3.event.pageX) + "px")      
                        .style("top", (d3.event.pageY - 120) + "px");
            })                  
            .on("mouseout", function(d) {   
                $(this).attr('y', 400)
                .attr('width', 1);  
                // for tooltip 
                div.transition()        
                    .duration(500)      
                    .style("opacity", 0);   
            });

    /* CALL  renderCompare */      
    // Get bible study link input from page
    if (window._paradoxes !== undefined) {
        para = _paradoxes;

        renderCompare();
    } else {
        // else get scripture input from file
        d3.json('./data/para.json', function (err, json) {
            para = json;

            var sourceSelect = d3.select('#source-select');

            sourceSelect.selectAll('option')
                .data(Object.keys(para))
                .enter().append('option')
                    .attr('value', function (d) { return d; })
                    .text(function (d) { return d; });

            sourceSelect.on('change', function () {
                updateHash({source: this.value});
            });

            // implemented for dropdown controllers
            setFiltersFromHash();

            renderCompare();
        });
    }

    /* DROPDOWN list controllers 
    */ 
    // books drowpdown
    bookSelect.on('change', function() {
        updateHash({book: this.value != 'All' ? this.value : null});
    });
    // subject dropdown
    var typeSelect = d3.select('#type-select');
    typeSelect.selectAll('option').data(Object.keys(paraTypeFilters)).enter().append('option')
        .text(function (d) {return d; });
    typeSelect.on('change', function () {
        updateHash({type: this.value != 'All' ? this.value : null});
    });
    // color dropdown
    d3.select('#color-select')
        .on('change', function () {
            // Clear all current arcs so they get recreated
            d3.select('#arc-chart').selectAll('.arc').remove();
            // Set the filter
            updateHash({colorize: this.value});
            
        });
    // translation dropdown
    d3.select('#translation-select')
        .on('change', function () {
            updateHash({translation: this.value});
            if(fetched){
                bibleFromSQL(fetched);
            }
        });
    // March 20, 2019, not using?
    d3.select('#text-search')
        .on('keyup', function () {
            var text = this.value;

            if (text.length) {
                paraFilters.search = text;
            } else {
                paraFilters.search = null;
            }

            renderCompare();

            if (searchHashTimer) {
                clearTimeout(searchHashTimer);
            }

            searchHashTimer = setTimeout(function () {
                updateHash({search: text.length ? text : null});
            }, 500);
        });
    
    
});
/* END RENDER 
*/


/* 
 *   
 *   renderCompare
 *   
 *
*/
function renderCompare() {
    var textSearch = null;
    if (paraFilters.search) {
        textSearch = new RegExp(paraFilters.search, 'gi');
    }
    // Book hover tooltip
    var div = d3.select("body").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);
    // Select Tier 1 G
    var chart = d3.select('svg g')
        .selectAll('.arc')
        .data(para[paraFilters.source].paradoxes.filter(function (d) {
            var i, found, match, refList;
            // TODO: also process Tier 2 notes (keys) from JSON
            refList = flatRefs(d.refs);

            // Filter out items that don't touch this chapter
            if (paraFilters.chapter !== null) {
                found = false;
                for (i = 0; i <= Math.min(refList.length - 1, 10); i++) {
                    if (getAbsoluteChapter(refList[i]) == paraFilters.chapter) {
                     //   console.log(paraFilters.chapter + "renderCompare");
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return false;
                }
            }

            // Filter out items that don't touch this book
            if (paraFilters.book !== null) {
                found = false;
                for (i = 0; i < Math.min(refList.length - 1, 10); i++) {
                    match = /(\d?\s*\w+)/.exec(refList[i]);
                 //   console.log(paraFilters.book + "renderCompare book");
                    if (match && (match[1] == paraFilters.book || match[1] + 's' == paraFilters.book)) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return false;
                }
            }

            // Filter out the wrong type of item
            var regex;
            if (paraFilters.type !== null) {
                if (paraFilters.type == 'Other') {
                    // Exclude any of the listed types except 'All' and 'Other'
                    var keys = Object.keys(paraTypeFilters);
                    for (i = 0; i < keys.length; i++) {
                        regex = paraTypeFilters[keys[i]];
                        if (regex && regex.test(d.desc)) {
                            return false;
                        }
                    }
                } else {
                    // Include only this type
                    regex = paraTypeFilters[paraFilters.type];
                    if (regex && !regex.test(d.desc)) {
                        return false;
                    }
                }
            }

            // Not used Mar 20, 2019
            if (textSearch !== null) {
                if (!textSearch.test(d.desc)) {
                    return false;
                }
            }
            return true;
        }),
        // Key function to compare values on insert/update/remove
        function (d) {
            return d.desc;
        });
         /* END define chart */

    /* Define chart arcs, placed in Tier 2 G's */
    chart.enter().append('g')
        .attr('class', 'arc')
        .on('mouseover', function (d) {
            var refList = flatRefs(d.refs);

            // sort out what subject is hovered
            d3.select('#arc-chart')
                .selectAll('.arc')
                .sort(function (a, b) {
                    return (a == d) ? 1 : -1;
                });
            div.transition()    //tooltip display   
                     .duration(200)       
                     .style("opacity", .9);       
            div.html(d.desc)
                     .style("left", (d3.event.pageX) + "px")      
                     .style("top", (d3.event.pageY - 120) + "px");    
            // post subject and its bible verse list to #selected div element(s)
              
            d3.select('#thread-content')
                .html('<span class="subdued">' + refList.join(', ').substr(0, maxLength) + '</span>');
        })
        .on("mouseout", function(d) {   // for tooltip   

                div.transition()        
                    .duration(500)      
                    .style("opacity", 0);   
            })
        .each(function (d, i) {
            var group = d3.select(this);
            var refList = flatRefs(d.refs);

            if (refList.length > 1) {
                // Only show up to 10 refs, some have over 100...
                for (x = 0; x <= Math.min(maxArcs, refList.length - 2); x++) {
                    
                    var start = getAbsoluteChapter(refList[x]);
                    var end = getAbsoluteChapter(refList[x + 1]);
                    if (start > end) {
                        // then re-order them
                        var tmp = end;
                        end = start;
                        start = tmp;
                    }

                    // get the scripture human readable names
                    var startVerse = refList[x];
                    var endVerse = refList[x +1];
                    // vars for arc
                    var r = (end - start) * 0.51;
                    var ry = Math.min(r, 490);
                    // render arc paths as a group, with attributes containing start and end verses (retrieved for display on click)
                    if (!isNaN(start) && !isNaN(end) && !isNaN(r) && !isNaN(ry)) {
                        var path = 'M ' + start + ',399 A ' + r + ',' + ry + ' 0 0,1 ' + end + ',399 ';
                        group.append('path')
                            .attr('d', path)
                            .attr('start', startVerse)
                            .attr('end', endVerse)
                            .attr('class', 'paths')
                            .on('click', function (d) {
                                var str = d3.select(this).attr("start")+","+d3.select(this).attr("end");
                                bibleFromSQL(str);
                            })
                            .style('stroke', function (start, end) {
                                return colorize(start, end);
                            }(start, end));
                    }
                }
            }
        })
        chart.exit()
    .transition()
    .duration(350)
    .style('opacity', 0)
    .remove();
    /* end define chart arcs */

    /* Update any highlighting from filter controllers */
    d3.select('#arc-chart g')
        .selectAll('rect')
        .classed('selected', false);

    if (paraFilters.book !== null) {
        d3.select('#arc-chart g')
            .selectAll('.b' + paraFilters.book.replace(/\s+/g, '').toLowerCase())
            .classed('selected', true);
    }

}
/* END renderCompare 
*/



/* 
    Notices (ie: #selected)

*/
d3.select('#thread-content').transition().delay(7000).duration(1000).style('opacity', 1.0);

d3.select('#filter-notice')
    .transition()
        .delay(1000)
        .duration(1000)
        .style('opacity', 1.0)
    .transition()
        .delay(4000)
        .duration(1000)
        .style('opacity', 0)
    .transition()
        .style('display', 'none');

d3.select('#para-notice')
    .transition()
        .delay(4000)
        .duration(1000)
        .style('opacity', 1.0)
    .transition()
        .delay(7000)
        .duration(1000)
        .style('opacity', 0)
    .transition()
        .style('display', 'none');



    /* 
        URL HASH FUNCTIONS

    */

    // Get the URL hash as an object of key:value pairs
    function getParsedHash() {
        var hash = {};

        var parts = window.location.hash.substr(1).split(',');
        for (var i = 0; i < parts.length; i++) {
            var kv = parts[i].split(':');

            if (kv && kv.length > 1) {
                hash[kv[0]] = kv[1].replace('+', ' ');
            }
        }
       // console.log("my hash: %o", hash);
        return hash;
    }

    // Set the URL hash from an object of key:value pairs
    // Tries to replace history state rather than adding onto the stack
    function setHash(values) {
        var hashArray = [];

        var keys = Object.keys(values);
        for (var i = 0; i < keys.length; i++) {
            if (values[keys[i]] !== undefined && values[keys[i]] !== null) {
                hashArray.push(keys[i] + ':' + values[keys[i]].replace(' ', '+'));
            }
        }

        hashArray.sort();

        // PARSING hashArray 
        // key:value for setting dropdown colors
        const dropdowns = {book:'yellow', type:'Salmon'};
        // loop over values
        for (let value of Object.values(hashArray)) {
            value = value.split(":");
         //   console.log("my value: %o", value);
            // values from value
            const vals = Object.values(value);
          //      console.log("my vals: %o", vals);
            for (const v of vals) {
              //  console.log("my v: %o", v);
                let key = Object.keys(dropdowns)[0];
                let color = Object.values(dropdowns)[0];
              //  console.log("R1 v k color: " + v + " " + key + " " + color);
                if(v === key){
                    backgroundColor(v, key, color);
                    break;
                }else {
                    key = Object.keys(dropdowns)[1];
                    color = Object.values(dropdowns)[1];
                  //  console.log("R2 v k color: " + v + " " + key + " " + color);
                    if(v === key){
                        backgroundColor(v, key, color);
                        break;                   
                    }
                }
            }       
        }
        if (window.history && window.history.replaceState) {
            var base = window.location.href.split('#')[0];
            

            window.history.replaceState(null, null, base + '#' + hashArray.join(','));
            
            setFiltersFromHash();
            renderCompare();
        } else {
            window.location.hash = hashArray.join(',');
        }
    }

    // Conditional changes for dropdown backgrounds. 
    function backgroundColor(val, str, bg){
            $('.form-control.'+str+'-select').css('background-color', bg);
        //    console.log("backgroundColor val str bg: " + val + str + bg);

            //$('.form-control.book-select').css('background-color', ''); 

    }

    // Update one or more key:value pairs in the URL hash
    // Set a value to null or undefined to remove it completely.
    function updateHash(values) {
        var updated = getParsedHash();

        var keys = Object.keys(values);
        for (var i = 0; i < keys.length; i++) {
            updated[keys[i]] = values[keys[i]];
        }          
    //    console.log("my updated: %o", updated);
        const dropdowns = {book:'', type:''};
        b = Object.keys(dropdowns)[0];
        t = Object.keys(dropdowns)[1];
    //    console.log( "b t a s d: " + b+" "+ t);
        for (let value of Object.keys(updated)) {
            a = value;
            s = Object.values(updated)[0];
            d = Object.values(updated)[2];
            e = Object.values(updated)[3];
       //     console.log( "b t a s d e: " + b+" "+ t+" "+a+" "+s+" "+d+" "+e);
            if(b===a && s===null){
                backgroundColor(b, a, "");
            }else if(t===a && (d===null || e===null)){
                backgroundColor(t, a, "");
            }


        }
        let color = Object.values(dropdowns)[0];
        setHash(updated);
    }


    // Set the selected <option> on a <select> element by
    // selector id and value
    function updateSelect(id, value) {
       
        var selector = document.getElementById(id);
        
        for (var i = 0; i < selector.options.length; i++) {
            var option = selector.options[i];

            if (option.value == value) {
                selector.selectedIndex = i;
                settingsDisplay();
                break;
            }
        }
    }

    function setFiltersFromHash() {
        var _parsedHash = getParsedHash();

        if (_parsedHash.source) {
            paraFilters.source = _parsedHash.source;
            updateSelect('source-select', paraFilters.source);
        }

        if (_parsedHash.book) {
            paraFilters.book = _parsedHash.book;
            updateSelect('book-select', paraFilters.book);
     //       console.log("parabook: "+paraFilters.book);
        } else {
            paraFilters.book = null;
        }

        if (_parsedHash.type) {
            paraFilters.type = _parsedHash.type;
            updateSelect('type-select', paraFilters.type);
       //     console.log("paratype: "+paraFilters.type);
        } else {
            paraFilters.type = null;
        }

        if (_parsedHash.colorize) {
            paraFilters.colorize = _parsedHash.colorize;
            updateSelect('color-select', paraFilters.colorize);
        }

        if (_parsedHash.translation) {
            paraFilters.translation = _parsedHash.translation;
            updateSelect('translation-select', paraFilters.translation);
        }

        if (_parsedHash.search) {
            paraFilters.search = _parsedHash.search;
            document.getElementById('text-search').value = paraFilters.search;
        }
    }

    window.onhashchange = function () {
        setFiltersFromHash();
        renderCompare();
    };

    // Returns true if a new tab should be opened from a click
    function newTab() {
        return (window.event && ((event.which == 1 && (event.ctrlKey === true || event.metaKey === true) || (event.which == 2))));
    }

// ------------------------------------------

var defaultSeparator = '-';

function slugg(string, separator, toStrip) {

  // Separator is optional
  if (typeof separator === 'undefined') separator = defaultSeparator;

  // Separator might be omitted and toStrip in its place
  if (separator instanceof RegExp) {
    toStrip = separator;
    separator = defaultSeparator;
  }

  // Only a separator was passed
  if (typeof toStrip === 'undefined') toStrip = new RegExp('');

  // Swap out non-english characters for their english equivalent
  for (var i = 0, len = string.length; i < len; i++) {
    if (chars[string.charAt(i)]) {
      string = string.replace(string.charAt(i), chars[string.charAt(i)]);
    }
  }

  string = string
    // Make lower-case
    .toLowerCase()
    // Strip chars that shouldn't be replaced with separator
    .replace(toStrip, '')
    // Replace non-word characters with separator
    .replace(/[\W|_]+/g, separator)
    // Strip dashes from the beginning
    .replace(new RegExp('^' + separator + '+'), '')
    // Strip dashes from the end
    .replace(new RegExp(separator + '+$'), '');

  return string;

}


// Conversion table. Modified version of:
// https://github.com/dodo/node-slug/blob/master/src/slug.coffee
var chars = slugg.chars = {
  // Latin
  'Ã€': 'A', 'Ã': 'A', 'Ã‚': 'A', 'Ãƒ': 'A', 'Ã„': 'A', 'Ã…': 'A', 'Ã†': 'AE',
  'Ã‡': 'C', 'Ãˆ': 'E', 'Ã‰': 'E', 'ÃŠ': 'E', 'Ã‹': 'E', 'ÃŒ': 'I', 'Ã': 'I',
  'ÃŽ': 'I', 'Ã': 'I', 'Ã': 'D', 'Ã‘': 'N', 'Ã’': 'O', 'Ã“': 'O', 'Ã”': 'O',
  'Ã•': 'O', 'Ã–': 'O', 'Å': 'O', 'Ã˜': 'O', 'Ã™': 'U', 'Ãš': 'U', 'Ã›': 'U',
  'Ãœ': 'U', 'Å°': 'U', 'Ã': 'Y', 'Ãž': 'TH', 'ÃŸ': 'ss', 'Ã ': 'a', 'Ã¡': 'a',
  'Ã¢': 'a', 'Ã£': 'a', 'Ã¤': 'a', 'Ã¥': 'a', 'Ã¦': 'ae', 'Ã§': 'c', 'Ã¨': 'e',
  'Ã©': 'e', 'Ãª': 'e', 'Ã«': 'e', 'Ã¬': 'i', 'Ã­': 'i', 'Ã®': 'i', 'Ã¯': 'i',
  'Ã°': 'd', 'Ã±': 'n', 'Ã²': 'o', 'Ã³': 'o', 'Ã´': 'o', 'Ãµ': 'o', 'Ã¶': 'o',
  'Å‘': 'o', 'Ã¸': 'o', 'Ã¹': 'u', 'Ãº': 'u', 'Ã»': 'u', 'Ã¼': 'u', 'Å±': 'u',
  'Ã½': 'y', 'Ã¾': 'th', 'Ã¿': 'y', 'áºž': 'SS', 'Å“': 'oe', 'Å’': 'OE',
  // Greek
  'Î±': 'a', 'Î²': 'b', 'Î³': 'g', 'Î´': 'd', 'Îµ': 'e', 'Î¶': 'z', 'Î·': 'h',
  'Î¸': '8', 'Î¹': 'i', 'Îº': 'k', 'Î»': 'l', 'Î¼': 'm', 'Î½': 'n', 'Î¾': '3',
  'Î¿': 'o', 'Ï€': 'p', 'Ï': 'r', 'Ïƒ': 's', 'Ï„': 't', 'Ï…': 'y', 'Ï†': 'f',
  'Ï‡': 'x', 'Ïˆ': 'ps', 'Ï‰': 'w', 'Î¬': 'a', 'Î­': 'e', 'Î¯': 'i', 'ÏŒ': 'o',
  'Ï': 'y', 'Î®': 'h', 'ÏŽ': 'w', 'Ï‚': 's', 'ÏŠ': 'i', 'Î°': 'y', 'Ï‹': 'y',
  'Î': 'i', 'Î‘': 'A', 'Î’': 'B', 'Î“': 'G', 'Î”': 'D', 'Î•': 'E', 'Î–': 'Z',
  'Î—': 'H', 'Î˜': '8', 'Î™': 'I', 'Îš': 'K', 'Î›': 'L', 'Îœ': 'M', 'Î': 'N',
  'Îž': '3', 'ÎŸ': 'O', 'Î ': 'P', 'Î¡': 'R', 'Î£': 'S', 'Î¤': 'T', 'Î¥': 'Y',
  'Î¦': 'F', 'Î§': 'X', 'Î¨': 'PS', 'Î©': 'W', 'Î†': 'A', 'Îˆ': 'E', 'ÎŠ': 'I',
  'ÎŒ': 'O', 'ÎŽ': 'Y', 'Î‰': 'H', 'Î': 'W', 'Îª': 'I', 'Î«': 'Y',
  // Turkish
  'ÅŸ': 's', 'Åž': 'S', 'Ä±': 'i', 'Ä°': 'I', 'ÄŸ': 'g', 'Äž': 'G',
  // Russian
  'Ð°': 'a', 'Ð±': 'b', 'Ð²': 'v', 'Ð³': 'g', 'Ð´': 'd', 'Ðµ': 'e', 'Ñ‘': 'yo',
  'Ð¶': 'zh', 'Ð·': 'z', 'Ð¸': 'i', 'Ð¹': 'j', 'Ðº': 'k', 'Ð»': 'l', 'Ð¼': 'm',
  'Ð½': 'n', 'Ð¾': 'o', 'Ð¿': 'p', 'Ñ€': 'r', 'Ñ': 's', 'Ñ‚': 't', 'Ñƒ': 'u',
  'Ñ„': 'f', 'Ñ…': 'h', 'Ñ†': 'c', 'Ñ‡': 'ch', 'Ñˆ': 'sh', 'Ñ‰': 'sh', 'ÑŠ': 'u',
  'Ñ‹': 'y', 'Ñ': 'e', 'ÑŽ': 'yu', 'Ñ': 'ya', 'Ð': 'A', 'Ð‘': 'B',
  'Ð’': 'V', 'Ð“': 'G', 'Ð”': 'D', 'Ð•': 'E', 'Ð': 'Yo', 'Ð–': 'Zh', 'Ð—': 'Z',
  'Ð˜': 'I', 'Ð™': 'J', 'Ðš': 'K', 'Ð›': 'L', 'Ðœ': 'M', 'Ð': 'N', 'Ðž': 'O',
  'ÐŸ': 'P', 'Ð ': 'R', 'Ð¡': 'S', 'Ð¢': 'T', 'Ð£': 'U', 'Ð¤': 'F', 'Ð¥': 'H',
  'Ð¦': 'C', 'Ð§': 'Ch', 'Ð¨': 'Sh', 'Ð©': 'Sh', 'Ðª': 'U', 'Ð«': 'Y',
  'Ð­': 'E', 'Ð®': 'Yu', 'Ð¯': 'Ya',
  // Ukranian
  'Ð„': 'Ye', 'Ð†': 'I', 'Ð‡': 'Yi', 'Ò': 'G',
  'Ñ”': 'ye', 'Ñ–': 'i', 'Ñ—': 'yi', 'Ò‘': 'g',
  // Czech
  'Ä': 'c', 'Ä': 'd', 'Ä›': 'e', 'Åˆ': 'n', 'Å™': 'r', 'Å¡': 's',
  'Å¥': 't', 'Å¯': 'u', 'Å¾': 'z', 'ÄŒ': 'C', 'ÄŽ': 'D', 'Äš': 'E',
  'Å‡': 'N', 'Å˜': 'R', 'Å ': 'S', 'Å¤': 'T', 'Å®': 'U', 'Å½': 'Z',
  // Polish
  'Ä…': 'a', 'Ä‡': 'c', 'Ä™': 'e', 'Å‚': 'l', 'Å„': 'n', 'Å›': 's',
  'Åº': 'z', 'Å¼': 'z', 'Ä„': 'A', 'Ä†': 'C', 'Ä˜': 'e', 'Å': 'L',
  'Åƒ': 'N', 'Åš': 'S', 'Å¹': 'Z', 'Å»': 'Z',
  // Latvian
  'Ä': 'a', 'Ä“': 'e', 'Ä£': 'g', 'Ä«': 'i', 'Ä·': 'k', 'Ä¼': 'l',
  'Å†': 'n', 'Å«': 'u', 'Ä€': 'A', 'Ä’': 'E', 'Ä¢': 'G', 'Äª': 'i',
  'Ä¶': 'k', 'Ä»': 'L', 'Å…': 'N', 'Åª': 'u'
}


