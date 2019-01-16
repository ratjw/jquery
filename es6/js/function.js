// fixed header of tables, not scroll out of sight
$.fn.fixMe = function($container) {
  let $this = $(this),
      $t_fixed,
      pad = $container.css("paddingLeft")

  init();
  $container.off("scroll").on("scroll", scrollFixed);

  function init() {
    $t_fixed = $this.clone();
    $t_fixed.removeAttr("id")
    $t_fixed.find("tbody").remove().end()
              .addClass("fixed")
                .insertBefore($this);
    $container.scrollTop(0)
    resizeFixed($t_fixed, $this);
    reposition($t_fixed, "left top", "left+" + pad + " top", $container)
    $t_fixed.hide()
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
//    resizeFixed($t_fixed, $this);
//    reposition($t_fixed, "left top", "left+" + pad + " top", $container)
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

function winResizeFix($this, $container)
{
  let $fix = $container.find(".fixed"),
      hide = $fix.css("display") === "none",
      pad = $container.css("paddingLeft")

  resizeFixed($fix, $this)
  reposition($fix, "left top", "left+" + pad + " top", $container)
  hide && $fix.hide()
}

String.prototype.thDate = function () 
{  //MySQL date (2014-05-11) to Thai date (11 พค. 2557) 
  let date = this.split("-")
  if ((date.length === 1) || (date[0] < "1900")) {
    return false
  }

  return [
    date[2],
    THAIMONTH[Number(date[1]) - 1],
    Number(date[0]) + 543
  ].join(" ")
} 

String.prototype.numDate = function () 
{  //Thai date (11 พค. 2557) to MySQL date (2014-05-11)
  let date = this.split(" ")
  if ((date.length === 1) || parseInt(date[1])) {
    return ""
  }
  let mm = THAIMONTH.indexOf(date[1]) + 1

    return [
    Number(date[2]) - 543,
    (mm < 10 ? '0' : '') + mm,
    date[0]
  ].join("-")
} 
 
Date.prototype.ISOdate = function () 
{  // Javascript Date Object to MySQL date (2014-05-11)
    let yyyy = this.getFullYear();
    let mm = this.getMonth()+1;
  mm = (mm < 10)? "0"+mm : ""+mm;
    let dd = this.getDate();
  dd = (dd < 10)? "0"+dd : ""+dd;
    return yyyy + "-" + mm + "-" + dd;
} 

String.prototype.nextdays = function (days)
{  // ISOdate to be added or substract by days
  let morrow = new Date(this);
  morrow.setDate(morrow.getDate()+days);
  return morrow.ISOdate();
}

String.prototype.getAge = function (toDate)
{  //Calculate age at (toDate) (iso format) from birth date
  //with LARGESTDATE as today
  if (!toDate || this <= '1900-01-01') {
    return this
  }

  let birth = new Date(this);
  let today = (toDate === LARGESTDATE) ? new Date() : new Date(toDate);

  if (today.getTime() - birth.getTime() < 0)
    return "wrong date"

  let ayear = today.getFullYear();
  let amonth = today.getMonth();
  let adate = today.getDate();
  let byear = birth.getFullYear();
  let bmonth = birth.getMonth();
  let bdate = birth.getDate();

  let days = adate - bdate;
  let months = amonth - bmonth;
  let years = ayear - byear;
  if (days < 0)
  {
    months -= 1
    days = new Date(byear, bmonth+1, 0).getDate() + days;
  }
  if (months < 0)
  {
    years -= 1
    months += 12
  }

  let ageyears = years? years + Math.floor(months / 6)  + " ปี " : "";
  let agemonths = months? months + Math.floor(days / 15)  + " ด." : "";
  let agedays = days? days + " ว." : "";

  return years? ageyears : months? agemonths : agedays;
}

//get 1st date of last month
function getStart()
{
  let start = new Date()

  return new Date(start.getFullYear(), start.getMonth()-1, 1).ISOdate()
}

//change Thai date from table to ISO date
function getOpdate(date)
{
  if ((date === undefined) || (parseInt(date) === NaN)) {
    return ""
  }
  if (date === "") {
    return LARGESTDATE
  }
  return date.numDate()
}

//change date in book to show on table
function putThdate(date)
{
  if (!date) { return date }
  if (date === LARGESTDATE) {
    return ""
  } else {
    return date.thDate()
  }
}

function putAgeOpdate(dob, date)
{
  if (!date || !dob) {
    return ""
  } else {
    return dob.getAge(date)
  }
}

async function postData(url = ``, data) {
    const response = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
		body: data
    })
    const text = await response.text()
    try {
        const result = JSON.parse(text)
        return result
    } catch(e) {
        return text
    }
}

// take care of white space, double qoute, single qoute, and back slash
// necessary when post in http, not when export to excel
function URIcomponent(content)
{
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

function menustyle($me, $target)
{
  let shadow = '10px -20px 30px slategray'
  if ($me.offset().top > $target.offset().top) {
    shadow = '10px 20px 30px slategray'
  }

  $me.css({
    boxShadow: shadow
  })
}

function getMaxQN(book)
{
  let qn = Math.max.apply(Math, $.map(book, function(row, i) {
      return row.qn
    }))
  return String(qn)
}

function getBOOKrowByQN(book, qn)
{  
  let bookq
  $.each(book, function() {
    bookq = this
    return (this.qn !== qn);
  })
  if (bookq.qn !== qn) {
    return null
  }
  return bookq
}

function getTableRowByQN(tableID, qn)
{
  return $("#" + tableID + " tr:has(td)").toArray().find(row => row.cells[QN].innerHTML === qn)
}

function getWaitingBOOKrowByHN(hn)
{  
  let  todate = new Date().ISOdate()

  return gv.BOOK.find(bookq => bookq.opdate > todate && bookq.hn === hn)
}

// main table (#tbl) only
function getTableRowsByDate(opdateth)
{
  if (!opdateth) { return [] }
  return $("#tbl tr").filter(function() {
    return this.cells[OPDATE].innerHTML === opdateth;
  })
}

function getBOOKrowsByDate(book, opdate)
{
  return book.filter(function(row) {
    return (row.opdate === opdate);
  })
}

function findStartRowInBOOK(book, opdate)
{
  let q = 0
  while ((q < book.length) && (book[q].opdate < opdate)) {
    q++
  }
  return (q < book.length)? q : -1
}

function findLastDateInBOOK(book)
{
  let q = 0
  while ((q < book.length) && (book[q].opdate < LARGESTDATE)) {
    q++
  }
  return book[q-1].opdate
}

// main table (#tbl) only
function sameDateRoomTableQN(opdateth, room, theatre)
{
  if (!room) { return [] }

  let sameRoom = $('#tbl tr').filter(function() {
    return this.cells[OPDATE].innerHTML === opdateth
      && this.cells[THEATRE].innerHTML === theatre
      && this.cells[OPROOM].innerHTML === room
  })
  $.each(sameRoom, function(i) {
    sameRoom[i] = this.cells[QN].innerHTML
  })
  return $.makeArray(sameRoom)
}

function sameDateRoomBookQN(book, opdate, room)
{
  if (!room) { return [] }

  let sameRoom = book.filter(function(row) {
    return row.opdate === opdate && Number(row.oproom) === Number(room);
  })
  $.each(sameRoom, function(i) {
    sameRoom[i] = this.qn
  })
  return sameRoom
}

// for main table (#tbl) only
function createThisdateTableRow(opdate, opdateth)
{
  if (opdate === LARGESTDATE) { return null }
  let rows = getTableRowsByDate(opdate.nextdays(-1).thDate()),
    $row = $(rows[rows.length-1]),
    $thisrow = $row && $row.clone().insertAfter($row)

  $thisrow && $thisrow.find("td").eq(OPDATE).html(opdateth)

  return $thisrow
}

function isSplit()
{  
  return $("#queuewrapper").css("display") === "block"
}

function isStaffname(staffname)
{  
  return $('#titlename').html() === staffname
}

function isConsults()
{  
  return $('#titlename').html() === "Consults"
}

function isConsultsTbl(tableID)
{  
  let queuetbl = tableID === "queuetbl"
  let consult = $("#titlename").html() === "Consults"

  return queuetbl && consult
}

function returnFalse()
{
  return false
}

// waitnum is for ordering where there is no oproom, casenum
function calcWaitnum(thisOpdate, $prevrow, $nextrow)
{
  let prevWaitNum = Number($prevrow.prop("title")),
    nextWaitNum = Number($nextrow.prop("title")),

    $prevRowCell = $prevrow.children("td"),
    $nextRowCell = $nextrow.children("td"),
    prevOpdate = $prevRowCell.eq(OPDATE).html(),
    nextOpdate = $nextRowCell.eq(OPDATE).html(),
    tableID = $prevrow.closest("table").attr("id")
    defaultWaitnum = (isConsultsTbl(tableID))? -1 : 1
  //Consults cases have negative waitnum

  if (prevOpdate !== thisOpdate && thisOpdate !== nextOpdate) {
    return defaultWaitnum
  }
  else if (prevOpdate === thisOpdate && thisOpdate !== nextOpdate) {
    return prevWaitNum + defaultWaitnum
  }
  else if (prevOpdate !== thisOpdate && thisOpdate === nextOpdate) {
    return nextWaitNum? (nextWaitNum / 2) : defaultWaitnum
  }
  else if (prevOpdate === thisOpdate && thisOpdate === nextOpdate) {
    return nextWaitNum? ((prevWaitNum + nextWaitNum) / 2) : (prevWaitNum + defaultWaitnum)
  }  // nextWaitNum is undefined in case of new blank row
}

function decimalToTime(dec)
{
  if (dec === 0) { return "" }

  let  integer = Math.floor(dec),
    decimal = dec - integer

  return [
    (integer < 10) ? "0" + integer : "" + integer,
    decimal ? String(decimal * 60) : "00"
  ].join(".")
}

function inPicArea(evt, pointing) {
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

function dataforEachCell(cells, data)
{
  data.forEach(function(item, i) {
    cells[i].innerHTML = item
  })
}

function rowDecoration(row, date)
{
  let  cells = row.cells

  row.className = dayName(NAMEOFDAYFULL, date) || "nodate"
  cells[OPDATE].innerHTML = putThdate(date)
  cells[OPDATE].className = dayName(NAMEOFDAYABBR, date)
  cells[DIAGNOSIS].style.backgroundImage = holiday(date)
}

function showEquip(equipString)
{
  return equipString ? makeEquip(JSON.parse(equipString)) : ""
}

function makeEquip(equipJSON)
{
  let equip = [],
    monitor = [],
	equipPics = []

  $.each(equipJSON, function(key, value) {
    if (value === "checked") {
      if (key in EQUIPICONS) {
        equipPics.push(EQUIPICONS[key])
        if (EQUIPICONS[key] === "Monitor") {
          monitor.push(key)
        } else {
          equip.push(key)
		}
      } else {
        equip.push(key)
	  }
    } else {
      if (key === "Monitor") {
        monitor.push(value)
      } else {
        equip.push(key + ":" + value)
      }
    }
  })
  // remove duplicated pics
  equipPics = equipPics.filter(function(pic, pos) {
    return equipPics.indexOf(pic) === pos;
  })
  // convert to string
  equip = equip.length ? equip.join('; ') : ''
  monitor = monitor.length ? "; Monitor:" + monitor.toString() : ''
  
  return equip + monitor + "<br>" + equipImg(equipPics)
}

function equipImg(equipPics)
{
  let img = ""

  $.each(equipPics, function() {
    img += '<img src="css/pic/equip/' + this + '.jpg"> '
  })

  return img
}

function findPrevcell(editable, pointing) 
{
  let $prevcell = $(pointing)
  let column = $prevcell.index()

  if ((column = editable[($.inArray(column, editable) - 1)]))
  {
    $prevcell = $prevcell.parent().children("td").eq(column)
  }
  else
  {
    do {
      if ($prevcell.parent().index() > 1)
      {  //go to prev row last editable
        $prevcell = $prevcell.parent().prev("tr")
                    .children().eq(editable[editable.length-1])
      }
      else
      {  //#tbl tr:1 td:1
        return false
      }
    }
    while (($prevcell.get(0).nodeName === "TH")
      || (!$prevcell.is(':visible')))
        //invisible due to colspan in servicetbl
  }

  return $prevcell.get(0)
}

function findNextcell(editable, pointing) 
{
  let $nextcell = $(pointing)
  let column = $nextcell.index()

  if ((column = editable[($.inArray(column, editable) + 1)]))
  {
    $nextcell = $nextcell.parent().children("td").eq(column)
  }
  else
  {
    do {
      $nextcell = $nextcell.parent().next("tr")
                    .children().eq(editable[0])
      if (!($nextcell.length)) {
        return false
      }
    }
    //invisible due to colspan in servicetbl
    while ((!$nextcell.is(':visible'))
      || ($nextcell.get(0).nodeName === "TH"))  //TH row
  }

  return $nextcell.get(0)
}

function findNextRow(editable, pointing) 
{
  let $nextcell = $(pointing)

  //go to next row first editable
  do {
    $nextcell = $nextcell.parent().next("tr").children().eq(editable[0])
    if (!($nextcell.length)) {
      return false  
    }
  }
  while ((!$nextcell.is(':visible'))  //invisible due to colspan
    || ($nextcell.get(0).nodeName === "TH"))  //TH row

  return $nextcell.get(0)
}

function exportQbookToExcel()
{
  //getting data from our table
  let data_type = 'data:application/vnd.ms-excel';  //Chrome, FF, not IE
  let title = 'Qbook Selected '
  let style = '\
    <style type="text/css">\
      #exceltbl {\
        border-right: solid 1px gray;\
        border-collapse: collapse;\
      }\
      #exceltbl th {\
        font-size: 16px;\
        font-weight: bold;\
        height: 40px;\
        background-color: #7799AA;\
        color: white;\
        border: solid 1px silver;\
      }\
      #exceltbl td {\
        font-size: 14px;\
        vertical-align: middle;\
        padding-left: 3px;\
        border-left: solid 1px silver;\
        border-bottom: solid 1px silver;\
      }\
      #exceltbl tr.Sunday { background-color: #FFDDEE; }\
      #exceltbl tr.Monday { background-color: #FFFFE0; }\
      #exceltbl tr.Tuesday { background-color: #FFF0F9; }\
      #exceltbl tr.Wednesday { background-color: #EEFFEE; }\
      #exceltbl tr.Thursday { background-color: #FFF7EE; }\
      #exceltbl tr.Friday { background-color: #E7F7FF; }\
      #exceltbl tr.Saturday { background-color: #E7E7FF; }\
\
      #exceltbl td.Sun { background-color: #F099BB; }\
      #exceltbl td.Mon { background-color: #F0F0BB; }\
      #exceltbl td.Tue { background-color: #F0CCEE; }\
      #exceltbl td.Wed { background-color: #CCF0CC; }\
      #exceltbl td.Thu { background-color: #F0DDBB; }\
      #exceltbl td.Fri { background-color: #BBDDF0; }\
      #exceltbl td.Sat { background-color: #CCBBF0; }\
\
    </style>'
  let head = '\
      <table id="excelhead">\
      <tr></tr>\
      <tr>\
        <td></td>\
        <td></td>\
        <td colspan="4" style="font-weight:bold;font-size:24px">' + title + '</td>\
      </tr>\
      <tr></tr>\
      </table>'
  let filename = title + Date.now() + '.xls'

  exportToExcel("capture", data_type, title, style, head, filename)    
}

function exportServiceToExcel()
{
  //getting data from our table
  let data_type = 'data:application/vnd.ms-excel';  //Chrome, FF, not IE
  let title = $('#dialogService').dialog( "option", "title" )
  let style = '\
    <style type="text/css">\
      #exceltbl {\
        border-right: solid 1px gray;\
        border-collapse: collapse;\
      }\
      #exceltbl tr:nth-child(odd) {\
        background-color: #E0FFE0;\
      }\
      #exceltbl th {\
        font-size: 16px;\
        font-weight: bold;\
        height: 40px;\
        background-color: #7799AA;\
        color: white;\
        border: solid 1px silver;\
      }\
      #exceltbl td {\
        font-size: 14px;\
        vertical-align: middle;\
        padding-left: 3px;\
        border-left: solid 1px silver;\
        border-bottom: solid 1px silver;\
      }\
      #excelhead td {\
        height: 30px; \
        vertical-align: middle;\
        font-size: 22px;\
        text-align: center;\
      }\
      #excelhead td.Readmission,\
      #exceltbl tr.Readmission,\
      #exceltbl td.Readmission { background-color: #AACCCC; }\
      #excelhead td.Reoperation,\
      #exceltbl tr.Reoperation,\
      #exceltbl td.Reoperation { background-color: #CCCCAA; }\
      #excelhead td.Infection,\
      #exceltbl tr.Infection,\
      #exceltbl td.Infection { background-color: #CCAAAA; }\
      #excelhead td.Morbidity,\
      #exceltbl tr.Morbidity,\
      #exceltbl td.Morbidity { background-color: #AAAACC; }\
      #excelhead td.Dead,\
      #exceltbl tr.Dead,\
      #exceltbl td.Dead { background-color: #AAAAAA; }\
    </style>'
  let head = '\
      <table id="excelhead">\
      <tr>\
        <td></td>\
        <td></td>\
        <td colspan="4" style="font-weight:bold;font-size:24px">' + title + '</td>\
      </tr>\
      <tr></tr>\
      <tr></tr>\
      <tr>\
        <td></td>\
        <td></td>\
        <td>Admission : ' + $("#Admission").html() + '</td>\
        <td>Discharge : ' + $("#Discharge").html() + '</td>\
        <td>Operation : ' + $("#Operation").html() + '</td>\
        <td class="Morbidity">Morbidity : ' + $("#Morbidity").html() + '</td>\
      </tr>\
      <tr>\
        <td></td>\
        <td></td>\
        <td class="Readmission">Re-admission : ' + $("#Readmission").html() + '</td>\
        <td class="Infection">Infection SSI : ' + $("#Infection").html() + '</td>\
        <td class="Reoperation">Re-operation : ' + $("#Reoperation").html() + '</td>\
        <td class="Dead">Dead : ' + $("#Dead").html() + '</td>\
      </tr>\
      <tr></tr>\
      <tr></tr>\
      </table>'
  let month = $("#monthstart").val()
  month = month.substring(0, month.lastIndexOf("-"))  //use yyyy-mm for filename
  let filename = 'Service Neurosurgery ' + month + '.xls'

  exportToExcel("servicetbl", data_type, title, style, head, filename)    
}

function exportFindToExcel(search)
{
  // getting data from our table
  // data_type is for Chrome, FF
  // IE uses "txt/html", "replace" with blob
  let data_type = 'data:application/vnd.ms-excel'
  let title = $('#dialogFind').dialog( "option", "title" )
  let style = '\
    <style type="text/css">\
      #exceltbl {\
        border-right: solid 1px gray;\
        border-collapse: collapse;\
      }\
      #exceltbl tr:nth-child(odd) {\
        background-color: #E0FFE0;\
      }\
      #exceltbl th {\
        font-size: 16px;\
        font-weight: bold;\
        height: 40px;\
        background-color: #7799AA;\
        color: white;\
        border: solid 1px silver;\
      }\
      #exceltbl td {\
        font-size: 14px;\
        vertical-align: middle;\
        padding-left: 3px;\
        border-left: solid 1px silver;\
        border-bottom: solid 1px silver;\
      }\
      #excelhead td {\
        height: 30px; \
        vertical-align: middle;\
        font-size: 22px;\
        text-align: center;\
      }\
    </style>'
  let head = '\
      <table id="excelhead">\
      <tr></tr>\
      <tr>\
        <td></td>\
        <td></td>\
        <td colspan="4" style="font-weight:bold;font-size:24px">' + title + '</td>\
      </tr>\
      <tr></tr>\
      </table>'
  let filename = 'Search ' + search + '.xls'

  exportToExcel("findtbl", data_type, title, style, head, filename)    
}

function exportReportToExcel(title)
{
  // getting data from our table
  // data_type is for Chrome, FF
  // IE uses "txt/html", "replace" with blob
  let data_type = 'data:application/vnd.ms-excel'
  let style = '\
    <style type="text/css">\
      #exceltbl {\
        border-right: solid 1px gray;\
        border-collapse: collapse;\
      }\
      #exceltbl tr:nth-child(odd) {\
        background-color: #E0FFE0;\
      }\
      #exceltbl th {\
        font-size: 16px;\
        font-weight: bold;\
        height: 40px;\
        background-color: #7799AA;\
        color: white;\
        border: solid 1px silver;\
      }\
      #exceltbl td {\
        font-size: 14px;\
        text-align: center;\
        vertical-align: middle;\
        padding-left: 3px;\
        border-left: solid 1px silver;\
        border-bottom: solid 1px silver;\
      }\
      #exceltbl td:first-child {\
        text-align: left;\
      }\
      #exceltbl tr.nonsurgical {\
        background-color: LightGrey;\
      }\
      #exceltbl tr#total {\
        background-color: BurlyWood;\
      }\
      #exceltbl tr#grand {\
        background-color: Turquoise;\
      }\
      #excelhead td {\
        height: 30px; \
        vertical-align: middle;\
        font-size: 22px;\
        text-align: center;\
      }\
    </style>'
  let head = '\
      <table id="excelhead">\
      <tr></tr>\
      <tr>\
        <td colspan="9" style="font-weight:bold;font-size:24px">' + title + '</td>\
      </tr>\
      <tr></tr>\
      </table>'
  let filename = 'Report ' + title + '.xls'

  exportToExcel("reviewtbl", data_type, title, style, head, filename)    
}

function exportToExcel(id, data_type, title, style, head, filename)
{
  if ($("#exceltbl").length) {
    $("#exceltbl").remove()
  }

  $("#" + id).clone(true).attr("id", "exceltbl").appendTo("body")

  // use only the last class because Excel does not accept multiple classes
  $.each( $("#exceltbl tr"), function() {
    let multiclass = this.className.split(" ")
    if (multiclass.length > 1) {
      this.className = multiclass[multiclass.length-1]
    }
  })

  // remove blank cells in Excel caused by hidden cells
  $.each( $("#exceltbl tr td, #exceltbl tr th"), function() {
    if ($(this).css("display") === "none") {
      $(this).remove()
    }
  })

  let $exceltbl = $("#exceltbl")

  // make line breaks show in single cell
  $exceltbl.find('br').attr('style', "mso-data-placement:same-cell");

  //remove img in equipment
  $exceltbl.find('img').remove();

  let table = $exceltbl[0].outerHTML
  let tableToExcel = '<!DOCTYPE html><HTML><HEAD><meta charset="utf-8"/>'
                    + style + '</HEAD><BODY>'
      tableToExcel += head + table
      tableToExcel += '</BODY></HTML>'

  let ua = window.navigator.userAgent;
  let msie = ua.indexOf("MSIE")
  let edge = ua.indexOf("Edge"); 

  if (msie > 0 || edge > 0 || navigator.userAgent.match(/Trident.*rv\:11\./)) // If Internet Explorer
  {
    if (typeof Blob !== "undefined") {
    //use blobs if we can
    tableToExcel = [tableToExcel];
    //convert to array
    let blob1 = new Blob(tableToExcel, {
      type: "text/html"
    });
    window.navigator.msSaveBlob(blob1, filename);
    } else {
    txtArea1.document.open("txt/html", "replace");
    txtArea1.document.write(tableToExcel);
    txtArea1.document.close();
    txtArea1.focus();
    sa = txtArea1.document.execCommand("SaveAs", true, filename);
    return (sa);  //not tested
    }
  } else {
    let a = document.createElement('a');
    document.body.appendChild(a);  // You need to add this line in FF
    a.href = data_type + ', ' + encodeURIComponent(tableToExcel);
    a.download = filename
    a.click();    //tested with Chrome and FF
  }
}
