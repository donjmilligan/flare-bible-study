/**
 *
 * You can write your JS code here, DO NOT touch the default style file
 * because it will make it harder for you to update.
 *
 */

"use strict";

function collapsy() {
    $("#condition").fadeOut(1600); 
    setTimeout(function() {
        showDiv();
    }, 170000); // wait 1 minute and show it
}


$(document).ready(function(){
	
  $("#btna").click(function(){
    $(".collapse").collapse('hide');
    $("#firstc").collapse('toggle');
  });
  $("#btnb").click(function(){
    $(".collapse").collapse('hide');
    $("#secondc").collapse('toggle');
  });
  $("#btnc").click(function(){
    $(".collapse").collapse('hide');
    $("#thirdc").collapse('toggle');
  });
  $("#btnd").click(function(){
    $(".collapse").collapse('hide');
    $("#fourthc").collapse('toggle');
  });
  $('.sidebar-toggle').click(function(){
    if($('.sidebar-toggle').hasClass('fa-chevron-left')){
      $('.sidebar-toggle').removeClass('fa-chevron-left');
      $('.sidebar-toggle').addClass('fa-chevron-right');
    }else{
      $('.sidebar-toggle').removeClass('fa-chevron-right');
      $('.sidebar-toggle').addClass('fa-chevron-left');
    }
  });

});

