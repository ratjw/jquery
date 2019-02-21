
import { LARGESTDATE } from "../model/const.js"

// necessary when passing to http, not when export to excel
export function URIcomponent(content) {
  if (/\W/.test(content)) {
    content = content.replace(/\s+$/,'')
    content = content.replace(/\"/g, "&#34;")  // double quotes
    content = content.replace(/\'/g, "&#39;")  // single quotes
    content = content.replace(/%/g, "&#37;")   // per cent, mysql: like "%...%"
    content = content.replace(/\\/g, "\\\\")
    content = encodeURIComponent(content)
  }
  return content
}

export function isSplit()
{  
  return queuewrapper.style.display === "block"
}

export function isStaffname(staffname)
{  
  return $('#titlename').html() === staffname
}

export function isOnStaffnameTbl(tableID)
{  
  return (tableID === "queuetbl") && !isConsults()
}

// The Consults table is beeing shown
export function isConsults()
{  
  return $('#titlename').html() === "Consults"
}

// This is on the split table and is Consults table
export function isOnConsultsTbl(tableID)
{  
  return (tableID === "queuetbl") && isConsults()
}

export function getTitlename(tableID)
{
  if (isSplit() && !isOnConsultsTbl(tableID)) {
    return document.getElementById('titlename').innerHTML
  }
  return ""
}

export function getMaxQN(book)
{
  var qn = Math.max.apply(Math, $.map(book, function(q, i) {
      return q.qn
    }))
  return String(qn)
}

export function winWidth(percent) {
  return window.innerWidth * percent / 100
}

export function winHeight(percent) {
  return window.innerHeight * percent / 100
}

export function reposition($me, mypos, atpos, target, within) {
  $me.show()
  $me.position({
    my: mypos,
    at: atpos,
    of: target,
    within: within
  })
}

// Shadow down when menu is below target row (high on screen)
// Shadow up when menu is higher than target row (low on screen)
export function menustyle($me, target)
{
  let shadow = ($me.offset().top > $(target).offset().top)
          ? '10px 20px 30px slategray'
          : '10px -20px 30px slategray'
  $me.css({
    boxShadow: shadow
  })
}

$.fn.fixMe = function($container) {
  let $this = $(this),
    $t_fixed,
    pad = $container.css("paddingLeft")
  init();
  $container.off("scroll").on("scroll", scrollFixed);

  function init() {
    $t_fixed = $this.clone();
    $t_fixed.attr("id", "fixed")
    $t_fixed.find("tbody").remove().end()
        .addClass("fixed").insertBefore($this);
    $container.scrollTop(0)
    resizeFix();
    reposition($t_fixed, "left top", "left+" + pad + " top", $container)
    $t_fixed.hide()
  }
  function resizeFix() {
    $t_fixed.find("th").each(function(index) {
      $(this).css("width",$this.find("th").eq(index).width() + "px");
    });
  }
  function scrollFixed() {
    let offset = $(this).scrollTop(),
    tableTop = $this[0].offsetTop,
    tableBottom = tableTop + $this.height() - $this.find("thead").height();
    if(offset < tableTop || offset > tableBottom) {
      $t_fixed.hide();
    }
    else if (offset >= tableTop && offset <= tableBottom && $t_fixed.is(":hidden")) {
      $t_fixed.show();
    }
  }
};

$.fn.refixMe = function($original) {
  let $fix = $original.find("thead tr").clone();

  resizeFixed($fix, $original);
  $(this).html($fix)
}

function resizeFixed($fix, $this)
{
  $fix.find("th").each(function(index) {
    let wide = $this.find("th").eq(index).width()

    $(this).css("width", wide + "px")
  });
}

export function winResizeFix($this, $container) {
  let $fix = $("#fixed"),
    hide = $fix.css("display") === "none",
    pad = $container.css("paddingLeft")

  $fix.find("th").each(function(index) {
    $(this).css("width",$this.find("th").eq(index).width() + "px");
  });
  reposition($fix, "left top", "left+" + pad + " top", $container)
  hide && $fix.hide()
}

export function inPicArea(evt, pointing) {
  let $pointing = $(pointing),
    x = evt.pageX,
    y = evt.pageY,
    square = picArea(pointing),
    top = square.top,
    right = square.right,
    bottom = square.bottom,
    left = square.left,
    inX = (left < x) && (x < right),
    inY = (top < y) && (y < bottom)

  return inX && inY
}

function picArea(pointing) {
  let $pointing = $(pointing),
    right = $pointing.offset().left + $pointing.width(),
    bottom = $pointing.offset().top + $pointing.height(),
    left = right - 25,
    top = bottom - 25

  return {
    top: top,
    bottom: bottom,
    left: left,
    right: right
  }
}

// Simulate hover on icon by changing background pics
export function hoverPicArea()
{
  let  tdClass = "td.pacs",
    pale = ["pacs"],
    bold = ["pacs2"]

  $(tdClass)
    .mousemove(function(event) {
      if (inPicArea(event, this)) {
        this.classList.replace(pale, bold)
      } else {
        this.classList.replace(bold, pale)
      }
    })
    .mouseout(function (event) {
      this.classList.replace(bold, pale)
    })
}

// Make dialog box dialogAlert containing error message
export function Alert(title, message) {
  let $dialogAlert = $("#dialogAlert")

  $dialogAlert.css({
    "fontSize":" 14px",
    "textAlign" : "center"
  })
  $dialogAlert.html(message)
  $dialogAlert.dialog({
    title: title,
    closeOnEscape: true,
    modal: true,
    hide: 200,
    minWidth: 400,
    height: 230
  }).fadeIn();
}

export function clearMouseoverTR()
{
  $("#maintbl tr:has('td'), #queuetbl tr:has('td')")
    .off("mouseover")
    .off("mouseout")
    .off("click")
  $(".pasteDate").removeClass("pasteDate")
  $(".moveCase").removeClass("moveCase")
  $(".copyCase").removeClass("copyCase")
}

// The second parameter (, 0) ensure a default value if arrayAfter .map is empty
export function getLargestWaitnum(book, staffname)
{
  let dateStaff = book.filter(function(q) {
    return (q.staffname === staffname) && (q.opdate === LARGESTDATE)
  })

  return Math.max(...dateStaff.map(q => q.waitnum), 0)
}
