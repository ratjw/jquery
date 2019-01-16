
async function editHistory()
{
  let  $selected = $(".selected"),
    $row = $selected.closest('tr'),
    hn = $row.find("td")[HN].innerHTML,
    sql = "sqlReturnData=SELECT * FROM bookhistory "
      + "WHERE qn in (SELECT qn FROM book WHERE hn='" + hn + "') "
      + "ORDER BY editdatetime DESC;"

  clearEditcell()

  let response = await postData(MYSQLIPHP, sql)
  if (typeof response === "object") {
    makehistory($row, hn, response)
  } else {
    Alert("editHistory", response)
  }
}

function makehistory($row, hn, response)
{
  let  $historytbl = $('#historytbl'),
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
    width: winWidth(95),
    height: winHeight(95),
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
      width: winWidth(95),
      height: winHeight(95)
    })
    winResizeFix($historytbl, $dialogHistory)
  }
}

jQuery.fn.extend({
  filldataHistory : function(q) {
    let  cells = this[0].cells,
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

async function deletedCases()
{
  let sql = `sqlReturnData=SELECT editdatetime, b.* 
                             FROM book b 
							   LEFT JOIN bookhistory bh ON b.qn = bh.qn 
                             WHERE editdatetime>DATE_ADD(NOW(), INTERVAL -3 MONTH) 
							   AND b.deleted>0 
							   AND bh.action='delete' 
							 GROUP BY b.qn 
                             ORDER BY editdatetime DESC;`

  let response = await postData(MYSQLIPHP, sql)
  if (typeof response === "object") {
    makedeletedCases(response)
  } else {
    Alert("deletedCases", response)
  }
}

function makedeletedCases(deleted)
{
  let $deletedtbl = $('#deletedtbl')
    $deletedtr = $('#deletedcells tr')

  // delete previous table lest it accumulates
  $deletedtbl.find('tr').slice(1).remove()

  // display the first 20
  $.each( deleted, function(i) {
    $deletedtr.clone()
      .appendTo($deletedtbl.find('tbody'))
        .filldataDeleted(this)
    return i < 20;
  });

  let $dialogDeleted = $("#dialogDeleted")
  $dialogDeleted.dialog({
    title: "All Deleted Cases",
    closeOnEscape: true,
    modal: true,
    hide: 200,
    width: winWidth(95),
    height: winHeight(95),
    close: function() {
      $(window).off("resize", resizeDeleted )
      $(".fixed").remove()
    }
  })
  $deletedtbl.fixMe($dialogDeleted);

  let $undelete = $("#undelete")
  $undelete.hide()
  $undelete.off("click").on("click", function () { closeUndel() })
  $(".toUndelete").off("click").on("click", function () {
    toUndelete(this, deleted)
  })

  //for resizing dialogs in landscape / portrait view
  $(window).on("resize", resizeDeleted )

  function resizeDeleted() {
    $dialogDeleted.dialog({
      width: winWidth(95),
      height: winHeight(95)
    })
    winResizeFix($deletedtbl, $dialogDeleted)
  }

  // display the rest
  setTimeout(function() {
    $.each( deleted, function(i) {
      if (i < 21) return
      $deletedtr.clone()
        .appendTo($deletedtbl.find('tbody'))
          .filldataDeleted(this)
    });
  }, 100)
}

jQuery.fn.extend({
  filldataDeleted : function(q) {
    let  cells = this[0].cells,
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
    cells[0].classList.add("toUndelete")
  }
})

function toUndelete(thisDate, deleted) 
{
  let UNDELOPDATE      = 0;
  let UNDELSTAFFNAME    = 1;
//  let UNDELHN        = 2;
//  let UNDELPATIENT    = 3;
//  let UNDELDIAGNOSIS    = 4;
//  let UNDELTREATMENT    = 5;
//  let UNDELCONTACT    = 6;
//  let UNDELEDITOR      = 7;
//  let UNDELEDITDATETIME  = 8;
  let UNDELQN        = 9;
  let $thisDate      = $(thisDate)
  let $undelete = $("#undelete")

  // jquery position not work in hidden elements
  $undelete.show()
  reposition($undelete, "left center", "left center", $thisDate)

  $("#undel").off().on("click", async function() {
    let $thiscase = $thisDate.closest("tr").children("td"),
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

    for (let i=0; i<alllen; i++) {
      if (allCases[i] === qn) {
        sql += "UPDATE book SET "
            +  "deleted=0,"
            +  "editor='" + gv.user
            +  "' WHERE qn="+ qn + ";"
      } else {
        sql += sqlCaseNum(i + 1, allCases[i])
      }
    }

    $('#dialogDeleted').dialog("close")

    let response = await postData(MYSQLIPHP, sql)
    if (typeof response === "object") {
      updateBOOK(response);
      refillOneDay(opdate)
      //undelete this staff's case or a Consults case
      if (isSplit() && (isStaffname(staffname) || isConsults())) {
        refillstaffqueue()
      }
      scrolltoThisCase(qn)
    } else {
      Alert("toUndelete", response)
    }
  })
}

function closeUndel() 
{
  $('#undelete').hide()
}

// All cases (include consult cases, exclude deleted ones)
async function allCases()
{
  let sql = "sqlReturnData=SELECT * FROM book WHERE deleted=0 ORDER BY opdate;"

  let response = await postData(MYSQLIPHP, sql)
  if (typeof response === "object") {
    // Make paginated dialog box containing alltbl
    pagination($("#dialogAll"), $("#alltbl"), response, "All Saved Cases")
  } else {
    Alert("allCases", response)
  }
}

function pagination($dialog, $tbl, book, search)
{
  let  beginday = book[0].opdate,
    lastday = findLastDateInBOOK(book),
    firstday = getPrevMonday(),
	offset = 0

  $dialog.dialog({
    title: search,
    closeOnEscape: true,
    modal: true,
    show: 200,
    hide: 200,
    width: winWidth(95),
    height: winHeight(95),
    close: function() {
      $(window).off("resize", resizeDialog )
      $(".fixed").remove()
    },
    buttons: [
      {
        text: "<<< Year",
        class: "yearbut",
        click: function () {
          showOneWeek(book, firstday, -364)
        }
      },
      {
        text: "<< Month",
        class: "monthbut",
        click: function () {
          offset = firstday.slice(-2) > 28 ? -35 : -28
          showOneWeek(book, firstday, offset)
        }
      },
      {
        text: "< Week",
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
        class: "monthbut",
        click: function () {
          offset = firstday.slice(-2) > 28 ? 35 : 28
          showOneWeek(book, firstday, offset)
        }
      },
      {
        text: "Year >>>",
        class: "yearbut",
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
  $dialog.find('.upload').on("click", function() {
    let hn = this.previousElementSibling.innerHTML
    let patient = this.innerHTML

    showUpload(hn, patient)
  })

  function showOneWeek(book, Monday, offset)
  {
    let  bookOneWeek, Sunday

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
    let today = date
          ? new Date(date.replace(/-/g, "/"))
          : new Date();
    today.setDate(today.getDate() - today.getDay() + 1);
    return today.ISOdate();
  }

  function getNextSunday(date)
  {
    let today = new Date(date);
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
    let  Mon = Monday && Monday.thDate() || "",
      Sun = Sunday && Sunday.thDate() || ""

    $dialog.dialog({
      title: search + " : " + Mon + " - " + Sun
    })
    // delete previous table lest it accumulates
    $tbl.find('tr').slice(1).remove()

    if (Monday) {
      let  $row, row, cells,
        date = Monday,
        nocase = true

      $.each( bookOneWeek, function() {
        while (this.opdate > date) {
          if (nocase) {
            $row = $('#allcells tr').clone().appendTo($tbl.find('tbody'))
            row = $row[0]
            cells = row.cells
            rowDecoration(row, date)
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
        row = $row[0]
        cells = row.cells
        rowDecoration(row, date)
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
      width: winWidth(95),
      height: winHeight(95)
    })
    winResizeFix($tbl, $dialog)
  }
}

jQuery.fn.extend({
  filldataAllcases : function(q) {
    let row = this[0],
      cells = row.cells,
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

    rowDecoration(row, date)
    dataforEachCell(cells, data)
  }
})

function searchCases()
{
  let $dialogInput = $("#dialogInput"),
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
    let target = event.target

    if ($stafflist.is(":visible")) {
      $stafflist.hide();
    } else {
      if ($(target).closest('input[name="staffname"]').length) {
        getSaffName(target)
      }
    }
  })
  .off("keydown").on("keydown", function(event) {
    let keycode = event.which || window.event.keyCode
    if (keycode === 13) { searchDB() }
  })
}

function getSaffName(pointing)
{
  let $stafflist = $("#stafflist"),
    $pointing = $(pointing)

  $stafflist.appendTo($pointing.closest('div')).show()
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

async function searchDB()
{
  let hn = $('input[name="hn"]').val(),
    staffname = $('input[name="staffname"]').val(),
    others = $('input[name="others"]').val(),
    sql = "", search = ""

  // Close before open another dialog
  $("#dialogInput").dialog("close")

  // for dialog title
  search += hn
  search += (search && staffname ? ", " : "") + staffname
  search += (search && others ? ", " : "") + others
  if (search) {
    sql = "hn=" + hn
      + "&staffname=" + staffname
      + "&others=" + others

    let response = await postData(SEARCH, sql)
    if (typeof response === "object") {
      makeFind(response, search)
    } else {
      Alert("Search: " + search, response)
    }
  } else {
    Alert("Search: ''", "<br><br>No Result")
  }
}

function makeFind(found, search)
{
  let flen = found.length,
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
  let showtbl, showqueuetbl

  showtbl = locateFound("tblcontainer", "tbl", qn)
  if (isSplit()) {
    showqueuetbl = locateFound("queuecontainer", "queuetbl", qn)
  }
  return showtbl || showqueuetbl
}

function locateFound(containerID, tableID, qn)
{
  let container = document.getElementById(containerID),
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
    width: winWidth(95),
    height: winHeight(95),
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
  $dialogFind.find('.upload').on("click", function() {
    let patient = this.innerHTML
    let hn = this.previousElementSibling.innerHTML

    showUpload(hn)
  })

  //scroll to todate when there many cases
  let today = new Date(),
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
    let  row = this[0],
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
    q.patient && (cells[3].className = "upload")

    dataforEachCell(cells, data)
  }
})

function winWidth(percent)
{
  return window.innerWidth * percent / 100
}

function winHeight(percent)
{
  return window.innerHeight * percent / 100
}

function PACS(hn)
{ 
  let pacs = 'http://synapse/explore.asp?path=/All Patients/InternalPatientUID='+hn
  let sql = 'PAC=http://synapse/explore.asp'
  let ua = window.navigator.userAgent;
  let msie = ua.indexOf("MSIE")
  let edge = ua.indexOf("Edge")
  let IE = !!navigator.userAgent.match(/Trident.*rv\:11\./)
  let data_type = 'data:application/vnd.ms-internet explorer'

  if (msie > 0 || edge > 0 || IE) { // If Internet Explorer
    open(pacs);
  } else {
    let html = '<!DOCTYPE html><HTML><HEAD><script>function opener(){window.open("'
    html += pacs + '", "_self")}</script><body onload="opener()"></body></HEAD></HTML>'
    let a = document.createElement('a');
    document.body.appendChild(a);  // You need to add this line in FF
    a.href = data_type + ', ' + encodeURIComponent(html);
    a.download = "index.html"
    a.click();    //to test with Chrome and FF
  }
}

function showUpload(hn, patient)
{
  let win = gv.showUpload
  if (hn) {
    if (win && !win.closed) {
      win.close();
    }
    gv.showUpload = win = window.open("../Upload", "_blank")
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
  let capture = document.querySelector("#capture")
  let $capture = $("#capture")
  let $captureTRs = $capture.find('tr')
  let $selected = $(".selected")
  let row = ""
  let hide = [1, 3, 4, 12]
  let $dialogNotify = $('#dialogNotify')
  let message


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
  let capture = document.querySelector("#capture")
  let $capture = $("#capture")
  let $captureTRs = $capture.find('tr')
  let $selected = $(".selected")
  let row = ""
  let hide = [1, 3, 4, 12]

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
  let $dialogReadme = $('#dialogReadme'),
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
    minWidth: 400,
    height: 230
  }).fadeIn();
}
