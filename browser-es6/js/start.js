
$(async function()
{
  let userid = sessionStorage.getItem('userid')

  if (/^\d{6}$/.test(userid)) {
    gv.user = userid
    gv.isPACS = /10.6./.test(window.location)
    $("#wrapper").show()
    $("#tblwrapper").css("height", window.innerHeight - $("#cssmenu").height())

    let response = await postData(MYSQLIPHP, "start=")
    loading(response)
  } else {
    Alert("Alert!", "Invalid userid")
  }
})

function loading(response)
{
  if (typeof response !== "object") { response = "{}" }
  updateBOOK(response)

  // call sortable before render, otherwise, rendering is very slow
  sortable()

  // rendering
  fillupstart()

  // setting up equipments
  initEquipment()

  // make the document editable
  editcellEvent()
  wrapperEvent()
  documentEvent()
  scrolltoToday()
  setStafflist()
  fillConsults()

  disableOneRowMenu()
  disableExcelLINE()
  overrideJqueryUI()
  resetTimer()

  setTimeout( fillupfinish, 1000)
}

function updateBOOK(response)
{
  if (response.BOOK) { gv.BOOK = response.BOOK }
  if (response.CONSULT) { gv.CONSULT = response.CONSULT }
  if (response.SERVICE) { gv.SERVICE = response.SERVICE }
  if (response.STAFF) { gv.STAFF = response.STAFF }
  if (response.ONCALL) { gv.ONCALL = response.ONCALL }
  if (response.HOLIDAY) { gv.HOLIDAY = response.HOLIDAY }
  if (response.QTIME) { gv.timestamp = response.QTIME }
  // QTIME = datetime of last fetching from server: $mysqli->query ("SELECT now();")
}

function editcellEvent()
{
  let $editcell = $("#editcell")

  $editcell.on("keydown", event => {
    let keyCode = event.which || window.event.keyCode
    let pointing = $editcell.data("pointing")

    if ($('#dialogService').is(':visible')) {
      Skeyin(event, keyCode, pointing)
    } else {
      keyin(event, keyCode, pointing)
    }
    if (!$("#spin").length) {
      resetTimer()
      gv.idleCounter = 0
    }
  })

  // for resizing the editing cell
  $editcell.on("keyup", event => {
    let keyCode = event.which || window.event.keyCode
    $editcell.height($editcell[0].scrollHeight)
  })

  $editcell.on("click", event => {
    event.stopPropagation()
    return
  })
}

function wrapperEvent()
{
  document.getElementById("wrapper").addEventListener("wheel", event => {
    resetTimer();
    gv.idleCounter = 0
    $(".marker").removeClass("marker")
  })
  
  document.getElementById("wrapper").addEventListener("mousemove", event => {
    resetTimer();
    gv.idleCounter = 0
  })

  $("#wrapper").on("click", event => {
    let target = event.target
    let $stafflist = $('#stafflist')

    resetTimer();
    gv.idleCounter = 0
    $(".marker").removeClass("marker")

    if ($(target).closest('#cssmenu').length) {
      return
    }
    if ($stafflist.is(":visible")) {
      if (!$(target).closest('#stafflist').length) {
        $stafflist.hide();
        clearEditcell()
      }
    }
    if (target.nodeName === "P") {
      target = $(target).closest('td')[0]
    }
    if (target.cellIndex === THEATRE) {
	  let $tbl = $("#tbl")
      if ($tbl.find("th").eq(THEATRE).width() < 10) {
        $tbl.addClass("showColumn2")
      }
	  else if (target.nodeName === "TH") {
        $tbl.removeClass("showColumn2")
      }
    }
    if (target.nodeName === "TD") {
      clicktable(event, target)
    } else {
      clearEditcell()
      clearMouseoverTR()
      clearSelection()
    }

    event.stopPropagation()
  })
}

function documentEvent()
{
  // Prevent the Backspace key from navigating back.
  // Esc to cancel everything
  $(document).off('keydown').on('keydown', event => {
    if (event.keyCode === 8) {
      let doPrevent = true
      let types = ["text", "password", "file", "number", "date", "time"]
      let d = $(event.srcElement || event.target)
      let disabled = d.prop("readonly") || d.prop("disabled")
      if (!disabled) {
        if (d[0].isContentEditable) {
          doPrevent = false
        } else if (d.is("input")) {
          let type = d.attr("type")
          if (type) {
            type = type.toLowerCase()
          }
          if (types.indexOf(type) > -1) {
            doPrevent = false
          }
        } else if (d.is("textarea")) {
          doPrevent = false
        }
      }
      if (doPrevent) {
        event.preventDefault()
        return false
      }
    }
    else if (event.keyCode === 27) {
      clearAllEditing()
    }
    resetTimer()
    gv.idleCounter = 0
  });

  $(document).contextmenu( event => {
    let target = event.target
    let oncall = /<p[^>]*>.*<\/p>/.test(target.outerHTML)

    if (oncall) {
      if (event.ctrlKey) {
        exchangeOncall(target)
      }
      else if (event.altKey) {
        addStaff(target)
      }
      event.preventDefault()
    }
  })

  window.addEventListener('resize', () => {
    $("#tblwrapper").css("height", window.innerHeight - $("#cssmenu").height())
	$("#queuecontainer").css({
		"height": $("#tblwrapper").height() - $("#titlebar").height()
	})
  })
}

function scrolltoToday()
{
  let today = new Date(),
    todate = today.ISOdate(),
    todateth = todate.thDate()
  $('#tblcontainer').scrollTop(0)
  let thishead = $("#tbl tr:contains(" + todateth + ")")[0]
  $('#tblcontainer').animate({
    scrollTop: thishead.offsetTop
  }, 300);
}

// allow the dialog title to contain HTML
function overrideJqueryUI()
{
  $.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
    _title: function(title) {
        if (!this.options.title ) {
            title.html("&#160;");
        } else {
            title.html(this.options.title);
        }
    }
  }))
}

function clearAllEditing()
{
  $('#stafflist').hide();
  clearEditcell()
  clearMouseoverTR()
  clearSelection()
  if ($("#dialogNotify").hasClass('ui-dialog-content')) {
    $("#dialogNotify").dialog("close")
  }
  $(".marker").removeClass("marker")
}

// stafflist: menu of Staff column
// staffmenu: dropdown menu of Staff
// gv.STAFF[each].staffname: fixed order
function setStafflist()
{
  let stafflist = ''  let staffmenu = ''

  gv.STAFF.forEach(function(each) {
    stafflist += `<li><div>${each.staffname}</div></li>`
    staffmenu += `<li><a onclick="staffqueue('${each.staffname}')"><span>${each.staffname}</span></a></li>`
  })
  staffmenu += `<li><a onclick="staffqueue('Consults')"><span>Consults</span></a></li>`
  document.getElementById("stafflist").innerHTML = stafflist
  document.getElementById("staffmenu").innerHTML = staffmenu
}

// Only on main table
function fillConsults()
{
  let table = document.getElementById("tbl")  let rows = table.rows  let tlen = rows.length  let today = new Date().ISOdate()  let lastopdate = rows[tlen-1].cells[OPDATE].innerHTML.numDate()  let staffoncall = gv.STAFF.filter(staff => (staff.oncall === "1"))  let slen = staffoncall.length  let nextrow = 1  let index = 0  let start = staffoncall.filter(staff => staff.startoncall)
      .reduce((a, b) => a.startoncall > b.startoncall ? a : b, 0)  let dateoncall = start.startoncall  let staffstart = start.staffname  let oncallRow = {}

  // find staff to start using latest startoncall date
  while ((index < slen) && (staffoncall[index].staffname !== staffstart)) {
    index++
  }

  // find first date to write immediately after today
  while (dateoncall <= today) {
    dateoncall = dateoncall.nextdays(7)
    index++
  }

  // write staffoncall if no patient
  index = index % slen
  while (dateoncall <= lastopdate) {
    oncallRow = findOncallRow(rows, nextrow, tlen, dateoncall)
    if (oncallRow && !oncallRow.cells[QN].innerHTML) {
      oncallRow.cells[STAFFNAME].innerHTML = htmlwrap(staffoncall[index].staffname)
    }
    nextrow = oncallRow.rowIndex + 1
    dateoncall = dateoncall.nextdays(7)
    index = (index + 1) % slen
  }

  // write substitute oncall
  nextrow = 1
  gv.ONCALL.forEach(oncall => {
    dateoncall = oncall.dateoncall
    if (dateoncall > today) {
      oncallRow = findOncallRow(rows, nextrow, tlen, dateoncall)
      if (oncallRow && !oncallRow.cells[QN].innerHTML) {
        oncallRow.cells[STAFFNAME].innerHTML = htmlwrap(oncall.staffname)
      }
      nextrow = oncallRow.rowIndex + 1
    }
  })
}

function findOncallRow(rows, nextrow, tlen, dateoncall)
{
  let opdateth = dateoncall && dateoncall.thDate()

  for (let i = nextrow; i < tlen; i++) {
    if (rows[i].cells[OPDATE].innerHTML === opdateth) {
      return rows[i]
    }
  }
}

function htmlwrap(staffname)
{
  return '<p style="color:#999999;font-size:12px">Consult<br>' + staffname + '</p>'
}

// refill after deleted or written over
function showStaffOnCall(opdate)
{
  if (new Date(opdate).getDay() === 6) {
    fillConsults()
  }
}

function exchangeOncall(pointing)
{
  let $stafflist = $("#stafflist")  let $pointing = $(pointing)

  $stafflist.menu({
    select: ( event, ui ) => {
      let staffname = ui.item.text()      let opdateth = $pointing.closest('tr').find("td")[OPDATE].innerHTML      let opdate = getOpdate(opdateth)

      changeOncall(pointing, opdate, staffname)
      $stafflist.hide()
    }
  })

  $stafflist.show()
  reposition($stafflist, "left top", "left bottom", $pointing)
  menustyle($stafflist, $pointing)
  clearEditcell()
}

async function changeOncall(pointing, opdate, staffname)
{
  let sql = "sqlReturnStaff=INSERT INTO oncall "
      + "(dateoncall, staffname, edittime) "
      + "VALUES ('" + opdate
      + "','" + staffname
      + "',NOW());"

  let response = await postData(MYSQLIPHP, sql)
  if (typeof response === "object") {
    pointing.innerHTML = htmlwrap(staffname)
    gv.ONCALL = response
  } else {
    Alert("changeOncall", response)
  }
}

function initEquipment()
{
  let equip = "", type = "", width = "", name = "", id = "", label = ""

  EQUIPSHEET.forEach(function(item) {
    type = item[0]
    width = item[1]
    name = item[2]
    id = item[3]
    label = item[4]
    if (type === "divbegin") {
	  equip += `<div title="${name}">`
    } else if (type === "divend") {
	  equip += `</div>`
    } else if (type === "span") {
	  equip += `<span class="${width}" id="${id}">${label}</span>`
    } else if (type === "spanInSpan") {
	  equip += `<span class="${width}">${label}<span id="${id}"></span></span>`
	} else if (type === "br") {
	  equip += `<br>`
	} else if (type === "radio" || type === "checkbox") {
	  equip += `<span class="${width}">
                  <input type="${type}" name="${name}" id="${id}">
                  <label for="${id}">${label}</label>
                </span>`
	} else if (type === "text") {
	  equip += `<span>
                  <input type="${type}" class="${name}" id="${id}" placeholder="${label}">
                </span>`
	} else if (type === "textarea") {
	  equip += `<span>
                  <textarea id="${id}" placeholder="${label}"></textarea>
                </span>`
	}
  })

  document.getElementById("dialogEquip").innerHTML = equip
}

function resetTimer()
{
  // gv.timer is just an id, not the clock
  // poke server every 10 sec.
  clearTimeout(gv.timer)
  gv.timer = setTimeout( updating, 10000)
}

function updating()
{
  // If there is some changes, reset idle time
  // If not, continue counting idle time
  // Both ways get update from server
  if (onChange()) {
    gv.idleCounter = 0
  } else {
    doUpdate()
  }

  resetTimer()
}

function onChange()
{
  // When editcell is not pointing, there must be no change by this editor
  if (!$("#editcell").data("pointing")) {
    return false
  }

  let $editcell = $("#editcell"),
      $divEditcell = $editcell.parent("div")
      oldcontent = $editcell.data("oldcontent"),
      newcontent = getText($editcell),
      pointed = $editcell.data("pointing"),
      index = pointed.cellIndex,
      whereisEditcell = $divEditcell.attr("id"),
	  qn = $(pointed).siblings(":last").html()

  if (oldcontent === newcontent) {
    return false
  }

  if (whereisEditcell === "dialogService") {
    return saveOnChangeService(pointed, index, newcontent, qn)
  } else {
    return saveOnChange(pointed, index, newcontent, qn)
  }
}

async function doUpdate()
{
  let sql = "sqlReturnData=SELECT MAX(editdatetime) as timestamp from bookhistory;"

  let response = await postData(MYSQLIPHP, sql)

  // gv.timestamp is this client last edit
  // timestamp is from server
  if (typeof response === "object") {
    if (gv.timestamp < response[0].timestamp) {
      getUpdate()
    } else {
      onIdling()
	}
  }
}

// There is some changes in database from other users
async function getUpdate()
{
  let fromDate = $('#monthstart').val()
  let toDate = $('#monthpicker').val()
  let sql = "sqlReturnService=" + sqlOneMonth(fromDate, toDate)

  let response = await postData(MYSQLIPHP, sql)
  if (typeof response === "object") {
    updateBOOK(response)
    if (dialogServiceShowing()) {
      gv.SERVE = calcSERVE()
      refillService(fromDate, toDate)
    }
    refillall()
    fillConsults()
    if (isSplit()) {
      refillstaffqueue()
    }
    renewEditcell()
  } else {
    Alert ("getUpdate", response)
  }
}

function dialogServiceShowing()
{
  let $dialogService = $("#dialogService")

  return $dialogService.hasClass('ui-dialog-content') && $dialogService.dialog('isOpen')
}

// after refillall, pointing remains in its row but parent is null
function renewEditcell()
{
  let $editcell = $("#editcell")
  let whereisEditcell = $editcell.parent("div").attr("id")
  let id = (whereisEditcell === "tblcontainer")
         ? "tbl"
		 : (whereisEditcell === "queuecontainer")
		 ? "queuetbl"
		 : (whereisEditcell === "dialogService")
		 ? "servicetbl"
		 : ""
  let pointing = $editcell.data("pointing")
  let qn = $(pointing).siblings(":last").html()
  let row = id && getTableRowByQN(id, qn)
  let cell = pointing.cellIndex

  if (row) {
    pointing = row.cells[cell]
    createEditcell(pointing)
  }
}

// idling every 6*10 = 1 minute, refillall
// idling (59+1)*10 = 10 minutes, logout
function onIdling()
{
    if (gv.idleCounter && !(gv.idleCounter % 6)) {
      clearAllEditing()
      refillstaffqueue()
      refillall()
      fillConsults()
    } else if (gv.idleCounter > 59) {
      history.back()
    }

    gv.idleCounter += 1
}

function saveOnChange(pointed, index, content, qn)
{
  let column = index === DIAGNOSIS
                ? "diagnosis"
                : index === TREATMENT
                ? "treatment"
                : index === CONTACT
                ? "contact"
                : ""

  if (!column) { return false }

  let sql = "sqlReturnbook=UPDATE book SET "
          + column + "='" + URIcomponent(content)
          + "',editor='"+ gv.user
          + "' WHERE qn="+ qn +";"

  updateOnChange(sql)
  pointed.innerHTML = content
  return true
}

function saveOnChangeService(pointed, index, content, qn)
{
  let column = index === DIAGNOSISSV
                ? "diagnosis"
                : index === TREATMENTSV
                ? "treatment"
                : index === ADMISSIONSV
                ? "admission"
                : index === FINALSV
                ? "final"
                : ""

  if (index === PROFILESV) { saveProfileService(pointed) }
  if (!column) { return false }

  let sql = sqlColumn(pointed, column, URIcomponent(content)),
      fromDate = $("#monthstart").val(),
      toDate = $("#monthpicker").val()

  sql  += sqlOneMonth(fromDate, toDate)

  updateOnChange(sql)
  pointed.innerHTML = content
  return true
}

async function updateOnChange(sql)
{
  let response = await postData(MYSQLIPHP, sql)
  if (typeof response === "object") {
    updateBOOK(response)
  }
}

function addStaff()
{
  let scbb = document.getElementById("scbb")  let $dialogStaff = $("#dialogStaff")  let $stafftbl = $("#stafftbl")

  for (let each=0; each<SPECIALTY.length; each++) {
    scbb.innerHTML += "<option value=" + SPECIALTY[each]+ ">"
            + SPECIALTY[each] + "</option>"
  }

  clearval()
  $stafftbl.find('tr').slice(3).remove()

  $.each( gv.STAFF, (i, item) => {
    $('#staffcells tr').clone()
      .appendTo($stafftbl.find('tbody'))
        .filldataStaff(i, item)
  });

  $dialogStaff.dialog({
    title: "Subspecialty Staff",
    closeOnEscape: true,
    modal: true,
    show: 200,
    hide: 200,
    width: 600,
    height: 400
  })
}

jQuery.fn.extend({
  filldataStaff : function (i, q) {
    let cells = this[0].cells    let data = [
        "<a href=\"javascript:getval('" + i + "')\">"
        + q.staffname + "</a>",
        q.specialty,
        q.startoncall
      ]

    dataforEachCell(cells, data)
  }
})

function getval(each)
{  
  document.getElementById("sname").value = gv.STAFF[each].staffname;
  document.getElementById("scbb").value = gv.STAFF[each].specialty;
  document.getElementById("sdate").value = gv.STAFF[each].startoncall; 
  document.getElementById("shidden").value = gv.STAFF[each].number;
}

function clearval()
{  
  document.getElementById("sname").value = ""
  document.getElementById("scbb").value = ""
  document.getElementById("sdate").value = ""
  document.getElementById("shidden").value = ""
}

function doadddata()
{
  let vname = document.getElementById("sname").value  let vspecialty = document.getElementById("scbb").value  let vdate = document.getElementById("sdate").value  let vnum = Math.max.apply(Math, gv.STAFF.map(staff => staff.number)) + 1  let sql = "sqlReturnStaff="
      + "INSERT INTO staff (number,staffname,specialty) VALUES("
      + vnum + ",'"+ vname  +"','"+ vspecialty
      + "');"

  dodata(sql)
}

function doupdatedata()
{
  if (confirm("ต้องการแก้ไขข้อมูลนี้หรือไม่")) {
    let vname = document.getElementById("sname").value    let vspecialty = document.getElementById("scbb").value    let vdate = document.getElementById("sdate").value    let vshidden = document.getElementById("shidden").value    let sql = "sqlReturnStaff=UPDATE staff SET "
        + "staffname='" + vname
        + "', specialty='" + vspecialty
        + "' WHERE number=" + vshidden
        + ";"

    dodata(sql)
  }
} // end of function doupdatedata

function dodeletedata()
{
  if (confirm("ต้องการลบข้อมูลนี้หรือไม่")) {
    let vshidden = document.getElementById("shidden").value    let sql = "sqlReturnStaff=DELETE FROM staff WHERE number=" + vshidden + ";"

    dodata(sql)
  }
}

async function dodata(sql)
{
  let response = await postData(MYSQLIPHP, sql)
  if (typeof response === "object") {
    showAddStaff(response)
  } else {
    alert(response)
  }
}

function showAddStaff(response)
{
  gv.STAFF = response.STAFF
  setStafflist()
  fillConsults()
  addStaff()
}
