import { PACS } from "../control/click.js"
import { OPDATE, PATIENT, EQUIPMENT, LARGESTDATE, EQUIPICONS } from "../model/const.js"
import {
	isPACS, ISOdate, thDate, nextdays, numDate, putThdate, winWidth, winHeight,
	getTableRowByQN, showUpload, rowDecoration, winResizeFix,
	isSplit, isStaffname, isConsults
} from "../model/util.js"
import { reViewStaffqueue, reViewOneDay } from "./view.js"

export function viewPostponeCase(opdate, thisdate, staffname, qn)
{
	if (opdate !== LARGESTDATE) { reViewOneDay(opdate) }
	if (thisdate !== LARGESTDATE) { reViewOneDay(thisdate) }

	// changeDate of this staffname's case, re-render
	isSplit() && isStaffname(staffname) && reViewStaffqueue()

	scrolltoThisCase(qn)
}

export function viewChangeDate(movedateth, movedate, thisdate, staffname, qn)
{
	if (movedateth) {
		reViewOneDay(movedate)
	}
	if (movedate !== thisdate) {
		reViewOneDay(thisdate)
	}
	if (isSplit()) {
		let titlename = $('#titlename').html()
		if ((titlename === staffname) || (titlename === "Consults")) {
			// changeDate of this staffname's case
			reViewStaffqueue()
		}
	} 

	// changeDate of this staffname's case, re-render
	isSplit() && isStaffname(staffname) && reViewStaffqueue()

	scrolltoThisCase(qn)
}

export function viewDeleteCase(tableID, $row, opdate, staffname) {
	reViewOneDay(opdate)
	tableID === "tbl"
	? isSplit() && isStaffname(staffname) && reViewStaffqueue()
	: isConsults()
	? deleteRow($row, opdate)
	: $row.remove()
}

// Make box dialog dialogAll containing alltbl
export function viewAllCases(response) {
    // Make paginated dialog box containing alltbl
    pagination($("#dialogAll"), $("#alltbl"), response, "All Saved Cases")
}

export function pagination($dialog, $tbl, book, search)
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
    if (isPACS) {
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

    firstday = nextdays(Monday, offset)
    if (firstday < beginday) { firstday = getPrevMonday(beginday) }
    if (firstday > lastday) {
      firstday = nextdays(getPrevMonday(lastday), 7)
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
    return ISOdate(today);
  }

  function getNextSunday(date)
  {
    let today = new Date(date);
    today.setDate(today.getDate() - today.getDay() + 7);
    return ISOdate(today);
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
    let  Mon = Monday && thDate(Monday) || "",
      Sun = Sunday && thDate(Sunday) || ""

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
          date = nextdays(date, 1)
          nocase = true
        }
        $('#allcells tr').clone()
          .appendTo($tbl.find('tbody'))
            .filldataAllcases(this)
        nocase = false
      })
      date = nextdays(date, 1)
      while (date <= Sunday) {
        $row = $('#allcells tr').clone().appendTo($tbl.find('tbody'))
        row = $row[0]
        cells = row.cells
        rowDecoration(row, date)
        date = nextdays(date, 1)
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
      date = q.opdate

;	[	putThdate(date),
		q.staffname,
		q.hn,
		q.patient,
		q.diagnosis,
		q.treatment,
		viewEquip(q.equipment),
		q.admission,
		q.final,
		q.contact
	].forEach((item, i) => { cells[i].innerHTML = item })

    rowDecoration(row, date)
  }
})

function findLastDateInBOOK(book)
{
	var q = 0
	while ((q < book.length) && (book[q].opdate < LARGESTDATE)) {
		q++
	}
	return book[q-1].opdate
}

// Make box dialog dialogHistory containing historytbl
export function viewCaseHistory(row, hn, tracing)
{
	let  $historytbl = $('#historytbl'),
		nam = row.cells[PATIENT].innerHTML,
		name = nam && nam.replace('<br>', ' '),
		$dialogHistory = $("#dialogHistory")
	
	// delete previous table lest it accumulates
	$('#historytbl tr').slice(1).remove()

	tracing.forEach(function(item) {
		$('#historycells tr').clone()
			.appendTo($('#historytbl tbody'))
				.filldataHistory(item)
	});

	$dialogHistory.dialog({
		title: `${hn} ${name}`,
		closeOnEscape: true,
		modal: true,
		show: 200,
		hide: 200,
		width: winWidth(95),
		height: winHeight(95),
		close: function() {
			$(window).off("resize", resizeHistory )
			$("#fixed").remove()
		}
	})
	$("#historytbl").fixMe($("#dialogHistory"));

	// for resizing dialogs in landscape / portrait view
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
		let cells = this[0].cells

		// Define colors for deleted and undeleted rows
		q.action === 'delete'
		? this.addClass("deleted")
		: (q.action === 'undelete') && this.addClass("undelete")

;		[	putThdate(q.opdate) || "",
			q.oproom || "",
			q.casenum || "",
			q.staffname,
			q.diagnosis,
			q.treatment,
			viewEquip(q.equipment),
			q.admission,
			q.final,
			q.contact,
			q.editor,
			q.editdatetime
		].forEach((item, i) => { cells[i].innerHTML = item })
	}
})

// Add all equipments in one string to show in 1 cell
export function viewEquip(equipString)
{
  return equipString ? makeEquip(JSON.parse(equipString)) : ""
}

export function makeEquip(equipJSON)
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

export function viewCancelAllEquip(qn)
{
	let $row = getTableRowByQN("tbl", qn)

	$row.find("td").eq(EQUIPMENT).html('')
	$("#dialogEquip").dialog('close')
}

export function viewRestoreAllEquip(response, bookqEquip, JsonEquip)
{
	// Error update server
	// Roll back. If old form has equips, fill checked & texts
	// prop("checked", true) : radio and checkbox
	// .val(val) : <input text> && <textarea>
	Alert("cancelAllEquip", response)
	$('#dialogEquip input').val('')
	$('#dialogEquip textarea').val('')
	if ( bookqEquip ) {
		$.each(JsonEquip, function(key, val) {
			if (val === 'checked') {
				$("#"+ key).prop("checked", true)
			} else {
				$("#"+ key).val(val)
			}
		})
	}
}

// Make dialog box dialogDeleted containing historytbl
export function viewDeletedCases(deleted) {
  let $deletedtbl = $('#deletedtbl'),
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
  $undelete.off("click").on("click", closeUndel )

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
		let cells = this[0].cells

		rowDecoration(this[0], q.opdate)
		cells[0].classList.add("toUndelete")

;		[	putThdate(q.opdate),
			q.staffname,
			q.hn,
			q.patient,
			q.diagnosis,
			q.treatment,
			q.contact,
			q.editor,
			q.editdatetime,
			q.qn
		].forEach((item, i) => { cells[i].innerHTML = item })
	}
})

export function viewUndelete(opdate, staffname, qn) {
	reViewOneDay(opdate)
	if (isSplit() && (isStaffname(staffname) || isConsults())) {
		reViewStaffqueue()
	}
	scrolltoThisCase(qn)
}

let closeUndel = function () {
	$('#undelete').hide()
}

export function viewSearchDB(found, search)
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

// Both main and staff tables
function scrolltoThisCase(qn)
{
  let showtbl, showqueuetbl

  showtbl = locateFound("tblcontainer", "tbl", qn)
  if (isSplit()) {
    showqueuetbl = locateFound("queuecontainer", "queuetbl", qn)
  }
  return showtbl || showqueuetbl
}

// Scroll to specified qn case and add a border
let locateFound = function (containerID, tableID, qn) {
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

  $dialogFind.find('.pacs').click(function() {
    if (isPACS) {
      PACS(this.innerHTML)
    }
  })
  $dialogFind.find('.upload').click(function() {
    let patient = this.innerHTML
    let hn = this.previousElementSibling.innerHTML

    hn && showUpload(hn, patient)
  })

  //scroll to todate when there many cases
  let today = new Date(),
    todate = ISOdate(today),
    thishead

  $findtbl.find("tr").each(function() {
    thishead = this
    return numDate(this.cells[OPDATE].innerHTML) < todate
  })
  $dialogFind.animate({
    scrollTop: $(thishead).offset().top - $dialogFind.height()
  }, 300);
}

jQuery.fn.extend({
	filldataFind : function(q) {
		let cells = this[0].cells


		if (Number(q.deleted)) {
		  this.addClass("deleted")
		} else {
		  rowDecoration(this[0], q.opdate)
		}
		q.hn && isPACS && (cells[2].className = "pacs")
		q.patient && (cells[3].className = "upload")

;		[	putThdate(q.opdate),
			q.staffname,
			q.hn,
			q.patient,
			q.diagnosis,
			q.treatment,
			viewEquip(q.equipment),
			q.admission,
			q.final,
			q.contact
		].forEach((item, i) => { cells[i].innerHTML = item })
	}
})
