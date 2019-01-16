
function editHistory()
{
  var  $selected = $(".selected"),
    $row = $selected.closest('tr'),
    hn = $row.find("td")[HN].innerHTML,
    sql = "sqlReturnData=SELECT * FROM bookhistory "
      + "WHERE qn in (SELECT qn FROM book WHERE hn='" + hn + "') "
      + "ORDER BY editdatetime DESC;"

  Ajax(MYSQLIPHP, sql, callbackeditHistory)

  clearEditcell()

  function callbackeditHistory(response)
  {
    if (typeof response === "object") {
      makehistory($row, hn, response)
    } else {
      Alert("editHistory", response)
    }
  }
}

function makehistory($row, hn, response)
{
  var  $historytbl = $('#historytbl'),
    nam = $row.find("td")[PATIENT].innerHTML,
    name = nam && nam.replace('<br>', ' '),
    $dialogHistory = $("#dialogHistory")
  
  // delete previous table lest it accumulates
  $historytbl.find('tr').slice(1).remove()

  $.each( response, function() {
    $('#historycells tr').clone()
      .appendTo($historytbl.find('tbody'))
        .filldataHistory(this)
  });

  $dialogHistory.dialog({
    title: hn +' '+ name,
    closeOnEscape: true,
    modal: true,
    show: 200,
    hide: 200,
    width: window.innerWidth * 95 / 100,
    height: window.innerHeight * 95 / 100,
    close: function() {
      $(window).off("resize", resizeHistory )
      $(".fixed").remove()
    }
  })

  $historytbl.fixMe($dialogHistory);

  //for resizing dialogs in landscape / portrait view
  $(window).on("resize", resizeHistory )

  function resizeHistory() {
    $dialogHistory.dialog({
      width: window.innerWidth * 95 / 100,
      height: window.innerHeight * 95 / 100
    })
    winResizeFix($historytbl, $dialogHistory)
  }
}

jQuery.fn.extend({
  filldataHistory : function(q) {
    var  cells = this[0].cells,
      data = [
        putThdate(q.opdate) || "",
        q.oproom || "",
        q.casenum || "",
        q.staffname,
        q.diagnosis,
        q.treatment,
        showEquip(q.equipment),
        q.admission,
        q.final,
        q.contact,
        q.editor,
        q.editdatetime
      ]

    // Define colors for deleted and undeleted rows
    q.action === 'delete'
    ? this.addClass("deleted")
    : (q.action === 'undelete') && this.addClass("undelete")

    dataforEachCell(cells, data)
  }
})

function deletedCases()
{
  var sql = "sqlReturnData=SELECT editdatetime, b.* "
          + "FROM book b INNER JOIN bookhistory bh ON b.qn = bh.qn "
          + "WHERE b.deleted > 0 AND b.opdate>DATE_ADD(NOW(), INTERVAL -3 MONTH) AND bh.action = 'delete' "
		  + "GROUP BY b.qn "
          + "ORDER BY a.editdatetime DESC;"

  Ajax(MYSQLIPHP, sql, callbackdeletedCases)

  function callbackdeletedCases(response)
  {
    if (typeof response === "object") {
      makedeletedCases(response)
    } else {
      Alert("deletedCases", response)
    }
  }
}

function makedeletedCases(deleted)
{
  var $deletedtbl = $('#deletedtbl')

  // delete previous table lest it accumulates
  $deletedtbl.find('tr').slice(1).remove()

  $.each( deleted, function() {
    $('#deletedcells tr').clone()
      .appendTo($deletedtbl.find('tbody'))
        .filldataDeleted(this)
  });

  var $dialogDeleted = $("#dialogDeleted")
  $dialogDeleted.dialog({
    title: "All Deleted Cases",
    closeOnEscape: true,
    modal: true,
    hide: 200,
    width: window.innerWidth * 95 / 100,
    height: window.innerHeight * 95 / 100,
    close: function() {
      $(window).off("resize", resizeDeleted )
      $(".fixed").remove()
    }
  })
  $deletedtbl.fixMe($dialogDeleted);

  var $undelete = $("#undelete")
  $undelete.hide()
  $undelete.off("click").on("click", function () { closeUndel() }).hide()
  $(".toUndelete").off("click").on("click", function () {
    toUndelete(this, deleted)
  })

  //for resizing dialogs in landscape / portrait view
  $(window).on("resize", resizeDeleted )

  function resizeDeleted() {
    $dialogDeleted.dialog({
      width: window.innerWidth * 95 / 100,
      height: window.innerHeight * 95 / 100
    })
    winResizeFix($deletedtbl, $dialogDeleted)
  }
}

jQuery.fn.extend({
  filldataDeleted : function(q) {
    var  cells = this[0].cells,
      data = [
        putThdate(q.opdate),
        q.staffname,
        q.hn,
        q.patient,
        q.diagnosis,
        q.treatment,
        q.contact,
        q.editor,
        q.editdatetime,
        q.qn
      ]

    rowDecoration(this[0], q.opdate)
    dataforEachCell(cells, data)
    cells[0].className += " toUndelete"
  }
})

function toUndelete(thisWhen, deleted) 
{
  var UNDELOPDATE      = 0;
  var UNDELSTAFFNAME    = 1;
//  var UNDELHN        = 2;
//  var UNDELPATIENT    = 3;
//  var UNDELDIAGNOSIS    = 4;
//  var UNDELTREATMENT    = 5;
//  var UNDELCONTACT    = 6;
//  var UNDELEDITOR      = 7;
//  var UNDELEDITDATETIME  = 8;
  var UNDELQN        = 9;
  var $thisWhen      = $(thisWhen)

  reposition($("#undelete"), "left center", "left center", $thisWhen)
  $("#undel").on("click", function() {
    var $thiscase = $thisWhen.closest("tr").children("td"),
      opdateth = $thiscase.eq(UNDELOPDATE).html(),
      opdate = getOpdate(opdateth),
      staffname = $thiscase.eq(UNDELSTAFFNAME).html(),
      qn = $thiscase.eq(UNDELQN).html(),
      sql = "sqlReturnbook=",

      delrow = getBOOKrowByQN(deleted, qn),
      waitnum = delrow.waitnum || 1,
      oproom = delrow.oproom,
      casenum = delrow.casenum,

      book = (waitnum < 0)? gv.CONSULT : gv.BOOK,
      allCases = sameDateRoomBookQN(book, opdate, oproom),
      alllen

    allCases.splice(casenum, 0, qn)
    alllen = allCases.length

    for (var i=0; i<alllen; i++) {
      if (allCases[i] === qn) {
        sql += "UPDATE book SET "
          +  "deleted=0,"
          +  "editor='" + gv.user
          +  "' WHERE qn="+ qn + ";"
      } else {
        sql += sqlCaseNum(i + 1, allCases[i])
      }
    }

    Ajax(MYSQLIPHP, sql, callbacktoUndelete);

    $('#dialogDeleted').dialog("close")

    function callbacktoUndelete(response)
    {
      if (typeof response === "object") {
        updateBOOK(response);
        refillOneDay(opdate)
        //undelete this staff's case or a Consults case
        if (isSplited() && (isStaffname(staffname) || isConsults())) {
          refillstaffqueue()
        }
        scrolltoThisCase(qn)
      } else {
        Alert("toUndelete", response)
      }
    }
    
  })
}

function closeUndel() 
{
  $('#undelete').hide()
}

// All cases (include consult cases, exclude deleted ones)
function allCases()
{
  var sql = "sqlReturnData=SELECT * FROM book WHERE deleted=0 ORDER BY opdate;"

  Ajax(MYSQLIPHP, sql, callbackAllCases)

  function callbackAllCases(response)
  {
    if (typeof response === "object") {
      // Make paginated dialog box containing alltbl
      pagination(
        $("#dialogAll"),
        $("#alltbl"),
        response,
        "All Saved Cases"
      )
    } else {
      Alert("allCases", response)
    }
  }
}

function pagination($dialog, $tbl, book, search)
{
  var  beginday = book[0].opdate,
    lastday = findLastDateInBOOK(book),
    width = window.innerWidth * 95 / 100,
    height = window.innerHeight * 95 / 100,
    firstday = getPrevMonday()

  $dialog.dialog({
    title: search,
    closeOnEscape: true,
    modal: true,
    show: 200,
    hide: 200,
    width: width,
    height: height,
    close: function() {
      $(window).off("resize", resizeDialog )
      $(".fixed").remove()
    },
    buttons: [
      {
        text: "<<< Year",
        class: "Aqua",
        click: function () {
          showOneWeek(book, firstday, -364)
        }
      },
      {
        text: "<< Month",
        class: "lightAqua",
        click: function () {
          offset = firstday.slice(-2) > 28 ? -35 : -28
          showOneWeek(book, firstday, offset)
        }
      },
      {
        text: "< Week",
        class: "marginright",
        click: function () {
          showOneWeek(book, firstday, -7)
        }
      },
      {
        click: function () { return }
      },
      {
        text: "Week >",
        click: function () {
          showOneWeek(book, firstday, 7)
        }
      },
      {
        text: "Month >>",
        class: "lightAqua",
        click: function () {
          offset = firstday.slice(-2) > 28 ? 35 : 28
          showOneWeek(book, firstday, offset)
        }
      },
      {
        text: "Year >>>",
        class: "Aqua",
        click: function () {
          showOneWeek(book, firstday, 364)
        }
      }
    ]
  })

  showOneWeek(book, firstday, 0)
  $tbl.fixMe($dialog)

  //for resizing dialogs in landscape / portrait view
  $(window).on("resize", resizeDialog )

  $dialog.find('.pacs').on("click", function() {
    if (gv.isPACS) {
      PACS(this.innerHTML)
    }
  })
  $dialog.find('.camera').on("click", function() {
    var hn = this.previousElementSibling.innerHTML
    var patient = this.innerHTML

    showUpload(hn, patient)
  })

  function showOneWeek(book, Monday, offset)
  {
    var  bookOneWeek, Sunday

    firstday = Monday.nextdays(offset)
    if (firstday < beginday) { firstday = getPrevMonday(beginday) }
    if (firstday > lastday) {
      firstday = getPrevMonday(lastday).nextdays(7)
      bookOneWeek = getBookNoDate(book)
      showAllCases(bookOneWeek)
    } else {
      Sunday = getNextSunday(firstday)
      bookOneWeek = getBookOneWeek(book, firstday, Sunday)
      showAllCases(bookOneWeek, firstday, Sunday)
    }
  }

  function getPrevMonday(date)
  {
    var today = date
          ? new Date(date.replace(/-/g, "/"))
          : new Date();
    today.setDate(today.getDate() - today.getDay() + 1);
    return today.ISOdate();
  }

  function getNextSunday(date)
  {
    var today = new Date(date);
    today.setDate(today.getDate() - today.getDay() + 7);
    return today.ISOdate();
  }

  function getBookOneWeek(book, Monday, Sunday)
  {
    return $.grep(book, function(bookq) {
      return bookq.opdate >= Monday && bookq.opdate <= Sunday
    })
  }

  function getBookNoDate(book)
  {
    return $.grep(book, function(bookq) {
      return bookq.opdate === LARGESTDATE
    })
  }

  function showAllCases(bookOneWeek, Monday, Sunday)
  {
    var  Mon = Monday && Monday.thDate() || "",
      Sun = Sunday && Sunday.thDate() || ""

    $dialog.dialog({
      title: search + " : " + Mon + " - " + Sun
    })
    // delete previous table lest it accumulates
    $tbl.find('tr').slice(1).remove()

    if (Monday) {
      var  $row, rowi, cells,
        date = Monday,
        nocase = true

      $.each( bookOneWeek, function() {
        while (this.opdate > date) {
          if (nocase) {
            $row = $('#allcells tr').clone().appendTo($tbl.find('tbody'))
            rowi = $row[0]
            cells = rowi.cells
            rowDecoration(rowi, date)
          }
          date = date.nextdays(1)
          nocase = true
        }
        $('#allcells tr').clone()
          .appendTo($tbl.find('tbody'))
            .filldataAllcases(this)
        nocase = false
      })
      date = date.nextdays(1)
      while (date <= Sunday) {
        $row = $('#allcells tr').clone().appendTo($tbl.find('tbody'))
        rowi = $row[0]
        cells = rowi.cells
        rowDecoration(rowi, date)
        date = date.nextdays(1)
      }
    } else {
      $.each( bookOneWeek, function() {
        $('#allcells tr').clone()
          .appendTo($tbl.find('tbody'))
            .filldataAllcases(this)
      });
    }
  }

  function resizeDialog() {
    $dialog.dialog({
      width: window.innerWidth * 95 / 100,
      height: window.innerHeight * 95 / 100
    })
    winResizeFix($tbl, $dialog)
  }
}

jQuery.fn.extend({
  filldataAllcases : function(q) {
    var rowi = this[0],
      cells = rowi.cells,
      date = q.opdate,
      data = [
        putThdate(date),
        q.staffname,
        q.hn,
        q.patient,
        q.diagnosis,
        q.treatment,
        showEquip(q.equipment),
        q.admission,
        q.final,
        q.contact
      ]

    rowDecoration(rowi, date)
    dataforEachCell(cells, data)
  }
})

function searchCases()
{
  var $dialogInput = $("#dialogInput"),
    $stafflist = $('#stafflist')

  $dialogInput.dialog({
    title: "Search",
    closeOnEscape: true,
    modal: true,
    width: 500,
    height: 250,
    close: function() {
      $stafflist.hide()
    }
  })

  $dialogInput.off("click").on("click", function(event) {
    var target = event.target

    if ($stafflist.is(":visible")) {
      $stafflist.hide();
    } else {
      if ($(target).closest('input[name="staffname"]').length) {
        getSaffName(target)
      }
    }
  })
  .off("keydown").on("keydown", function(event) {
    var keycode = event.which || window.event.keyCode
    if (keycode === 13) { searchDB() }
  })
}

function getSaffName(pointing)
{
  var $stafflist = $("#stafflist"),
    $pointing = $(pointing)

  $stafflist.appendTo($pointing.closest('div'))
  $stafflist.menu({
    select: function( event, ui ) {
      pointing.value = ui.item.text()
      $stafflist.hide()
      event.stopPropagation()
    }
  })

  reposition($stafflist, "left top", "left bottom", $pointing)
  menustyle($stafflist, $pointing)
}

function searchDB()
{
  var hn = $('input[name="hn"]').val(),
    staffname = $('input[name="staffname"]').val(),
    others = $('input[name="others"]').val(),
    sql = "", search = ""

  // for dialog title
  search += hn
  search += (search && staffname ? ", " : "") + staffname
  search += (search && others ? ", " : "") + others
  if (search) {
    sql = "hn=" + hn
      + "&staffname=" + staffname
      + "&others=" + others

    Ajax(SEARCH, sql, callbackfind)

  } else {
    Alert("Search: ''", "<br><br>No Result")
  }
  $("#dialogInput").dialog("close")

  function callbackfind(response)
  {
    if (typeof response === "object") {
      makeFind(response, search)
    } else {
      Alert("Search: " + search, response)
    }
  }
}

function makeFind(found, search)
{
  var flen = found.length,
    $dialogFind = $("#dialogFind"),
    $findtbl = $("#findtbl"),
    show = scrolltoThisCase(found[flen-1].qn)

  if (!show || (flen > 1)) {
    if (flen > 100) {
      pagination($dialogFind, $findtbl, found, search)
    } else {
      makeDialogFound($dialogFind, $findtbl, found, search)
    }
  }
}

function scrolltoThisCase(qn)
{
  var showtbl, showqueuetbl

  showtbl = showFind("tblcontainer", "tbl", qn)
  if (isSplited()) {
    showqueuetbl = showFind("queuecontainer", "queuetbl", qn)
  }
  return showtbl || showqueuetbl
}

function showFind(containerID, tableID, qn)
{
  var container = document.getElementById(containerID),
    row = getTableRowByQN(tableID, qn),
    scrolledTop = container.scrollTop,
    offset = row && row.offsetTop,
    rowHeight = row && row.offsetHeight,
    height = container.clientHeight - rowHeight,
    bottom = scrolledTop + height,
    $container = $("#" + containerID)

  $("#" + tableID + " tr.marker").removeClass("marker")
  if (row) {
    $(row).addClass("marker")
    if (offset < scrolledTop) {
      $container.animate({
        scrollTop: offset
      }, 500);
    }
    else if (offset > bottom) {
      $container.animate({
        scrollTop: offset - height
      }, 500);
    }
    return true
  }
}

function makeDialogFound($dialogFind, $findtbl, found, search)
{
  $dialogFind.dialog({
    title: "Search: " + search,
    closeOnEscape: true,
    modal: true,
    width: window.innerWidth*95/100,
    height: window.innerHeight*95/100,
    buttons: [
      {
        text: "Export to xls",
        click: function() {
          exportFindToExcel(search)
        }
      }
    ],
    close: function() {
      $(window).off("resize", resizeFind )
      $(".fixed").remove()
      $("#dialogInput").dialog("close")
      $(".marker").removeClass("marker")
    }
  })

  // delete previous table lest it accumulates
  $findtbl.find('tr').slice(1).remove()

  $.each( found, function() {  // each === this
    $('#findcells tr').clone()
      .appendTo($findtbl.find('tbody'))
        .filldataFind(this)
  });
  $findtbl.fixMe($dialogFind);

  //for resizing dialogs in landscape / portrait view
  $(window).on("resize", resizeFind )

  function resizeFind() {
    $dialogFind.dialog({
      width: window.innerWidth,
      height: window.innerHeight
    })
    winResizeFix($findtbl, $dialogFind)
  }

  $dialogFind.find('.pacs').on("click", function() {
    if (gv.isPACS) {
      PACS(this.innerHTML)
    }
  })
  $dialogFind.find('.camera').on("click", function() {
    var patient = this.innerHTML
    var hn = this.previousElementSibling.innerHTML

    showUpload(hn)
  })

  //scroll to todate when there many cases
  var today = new Date(),
    todate = today.ISOdate(),
    thishead

  $findtbl.find("tr").each(function() {
    thishead = this
    return this.cells[OPDATE].innerHTML.numDate() < todate
  })
  $dialogFind.animate({
    scrollTop: $(thishead).offset().top - $dialogFind.height()
  }, 300);
}

jQuery.fn.extend({
  filldataFind : function(q) {
    var  row = this[0],
      cells = row.cells,
      data = [
        putThdate(q.opdate),
        q.staffname,
        q.hn,
        q.patient,
        q.diagnosis,
        q.treatment,
        showEquip(q.equipment),
        q.admission,
        q.final,
        q.contact
      ]

    if (Number(q.deleted)) {
      this.addClass("deleted")
    } else {
      rowDecoration(row, q.opdate)
    }
    q.hn && gv.isPACS && (cells[2].className = "pacs")
    q.patient && gv.isMobile && (cells[3].className = "camera")

    dataforEachCell(cells, data)
  }
})

function PACS(hn)
{ 
  var pacs = 'http://synapse/explore.asp?path=/All Patients/InternalPatientUID='+hn
  var sql = 'PAC=http://synapse/explore.asp'
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf("MSIE")
  var edge = ua.indexOf("Edge")
  var IE = !!navigator.userAgent.match(/Trident.*rv\:11\./)
  var data_type = 'data:application/vnd.ms-internet explorer'

  if (msie > 0 || edge > 0 || IE) { // If Internet Explorer
    open(pacs);
  } else {
    var html = '<!DOCTYPE html><HTML><HEAD><script>function opener(){window.open("'
    html += pacs + '", "_self")}</script><body onload="opener()"></body></HEAD></HTML>'
    var a = document.createElement('a');
    document.body.appendChild(a);  // You need to add this line in FF
    a.href = data_type + ', ' + encodeURIComponent(html);
    a.download = "index.html"
    a.click();    //to test with Chrome and FF
  }
}

function showUpload(hn, patient)
{
  var win = gv.uploadWindow
  if (hn) {
    if (win && !win.closed) {
      win.close();
    }
    gv.uploadWindow = win = window.open("Upload", "_blank")
    win.hnName = {"hn": hn, "patient": patient}
    //hnName is a pre-defined variable in child window (Upload)
  }
}

function sendtoLINE()
{
  $('#dialogNotify').dialog({
    title: '<img src="css/pic/general/linenotify.png" width="40" style="float:left">'
         + '<span style="font-size:20px">Qbook: ' + gv.user + '</span>',
    closeOnEscape: true,
    modal: true,
    show: 200,
    hide: 200,
    width: 270,
    height: 300
  })
}

function toLINE()
{
  var capture = document.querySelector("#capture")
  var $capture = $("#capture")
  var $captureTRs = $capture.find('tr')
  var $selected = $(".selected")
  var row = ""
  var hide = [1, 3, 4, 12]
  var $dialogNotify = $('#dialogNotify')
  var message


  message = $dialogNotify.find('textarea').val()
  $dialogNotify.dialog('close')

  $captureTRs.slice(1).remove()
  $capture.show()
  $.each($selected, function() {
    $capture.find("tbody").append($(this).clone())
  })
  $captureTRs = $capture.find('tr')
  $captureTRs.removeClass('selected lastselected')

  hide.forEach(function(i) {
    $.each($captureTRs, function() {
      this.cells[i].style.display = 'none'
    })
  })

  html2canvas(capture).then(function(canvas) {
    $.post(LINENOTIFY, {
      'user': gv.user,
      'message': message,
      'image': canvas.toDataURL('image/png', 1.0)
    })
    $capture.hide()
  })
}

function sendtoExcel()
{
  var capture = document.querySelector("#capture")
  var $capture = $("#capture")
  var $captureTRs = $capture.find('tr')
  var $selected = $(".selected")
  var row = ""
  var hide = [1, 3, 4, 12]

  $captureTRs.slice(1).remove()

  $.each($selected, function() {
    $capture.find("tbody").append($(this).clone())
  })
  $captureTRs = $capture.find('tr')
  $captureTRs.removeClass('selected lastselected')

  hide.forEach(function(i) {
    $.each($captureTRs, function() {
      this.cells[i].style.display = 'none'
    })
  })

  exportQbookToExcel()
}

function readme()
{
  var $dialogReadme = $('#dialogReadme'),
    object = "<object data='.\\readme.pdf' type='application/pdf' "
           + "width='400px' height='500px'>"
           + "</object>"
  $dialogReadme.show()
  $dialogReadme.dialog({
    title: "ReadMe",
    closeOnEscape: true,
    modal: true,
    width: 430,
    height: 570,
    open: function () {
      $dialogReadme.html(object)
    }
  }).fadeIn();
}

function Alert(title, message)
{
  var $dialogAlert = $("#dialogAlert")
  $dialogAlert.css({
    "fontSize":" 14px",
    "textAlign" : "center"
  })
  $dialogAlert.html(message)
  $dialogAlert.dialog({
    title: title,
    closeOnEscape: true,
    modal: true,
    minWidth: 400,
    height: 230
  }).fadeIn();
}
