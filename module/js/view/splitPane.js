
export let splitPane = function () {
  let scrolledTop = document.getElementById("maincontainer").scrollTop,
    tohead = findVisibleHead('#maintbl'),
    menuHeight = $("#cssmenu").height(),
    titleHeight = $("#titlebar").height()

  $("#mainwrapper").css({
    "height": "100%" - menuHeight,
    "width": "50%"
  })
  $("#queuewrapper").show().css({
    "height": "100%" - menuHeight,
    "width": "50%"
  })
  $("#queuecontainer").css({
    "height": $("#maincontainer").height() - titleHeight
  })

  initResize($("#mainwrapper"))
  $('.ui-resizable-e').css('height', $("#maintbl").css("height"))

  document.getElementById("clickclosequeue").onclick = closequeue
}

let initResize = function ($wrapper) {
  $wrapper.resizable(
  {
    autoHide: true,
    handles: 'e',
    resize: function(e, ui) 
    {
      let parent = ui.element.parent();
      let remainSpace = parent.width() - ui.element.outerWidth()
      let divTwo = ui.element.next()
      let margin = divTwo.outerWidth() - divTwo.innerWidth()
      let divTwoWidth = (remainSpace-margin)/parent.width()*100+"%";
      divTwo.css("width", divTwoWidth);
    },
    stop: function(e, ui) 
    {
      let parent = ui.element.parent();
      let remainSpace = parent.width() - ui.element.outerWidth()
      let divTwo = ui.element.next()
      let margin = divTwo.outerWidth() - divTwo.innerWidth()
      ui.element.css(
      {
        width: ui.element.outerWidth()/parent.width()*100+"%",
      });
      ui.element.next().css(
      {
        width: (remainSpace-margin)/parent.width()*100+"%",
      });
    }
  });
}

function closequeue() {
  let scrolledTop = document.getElementById("maincontainer").scrollTop,
    tohead = findVisibleHead('#maintbl')
  
  $("#queuewrapper").hide()
  $("#mainwrapper").css({
    "height": "100%" - $("#cssmenu").height(),
    "width": "100%"
  })
}

// Find first row on screen to be the target position
let findVisibleHead = function (table) {
  let tohead

  $.each($(table + ' tr'), function(i, tr) {
    tohead = tr
    return ($(tohead).offset().top < 0)
  })
  return tohead
}
