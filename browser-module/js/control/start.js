
import { THEATRE, EQUIPSHEET } from "../model/const.js"
import { addStaff } from "./addStaff.js"
import { clicktable } from "./clicktable.js"
import { exchangeOncall } from "./exchangeOncall.js"
import { clearAllEditing } from "./clearAllEditing.js"
import { editcellEvent, clearEditcell } from "./edit.js"
import { resetTimer, resetTimerCounter } from "./updating.js"
import { setClickMenu } from "../menu/setClickMenu.js"
import { setClickSetting } from "./setClickSetting.js"
import { setClickService } from "../service/serviceReview.js"
import { clearMouseoverTR } from "../menu/changeDate.js"
import { fetchStart } from "../model/fetch.js"
import { sortable } from "../model/sort.js"
import { clearSelection } from "./clearSelection.js"
import { fillall, setClickStaff } from "../view/fill.js"
import { fillConsults } from "../view/fillConsults.js"
import { START, ISOdate, thDate } from "../util/date.js"
import { BOOK, STAFF, Alert, updateBOOK } from "../util/util.js"
import { UndoManager } from "../model/UndoManager.js"

// For staff & residents with login id / password from Get_staff_detail
export function userStaff() {
	fetchStart().then(response => {
		typeof response === "object"
		? success(response)
		: failed(response)
	}).catch(error => {})

	document.oncontextmenu = () => false
}

// Success return from server
function success(response) {
  updateBOOK(response)

  // call sortable before render, otherwise it renders very slowly
  sortable()
  makeStart()

  // setting up equipments
  initEquipment()

  // make the document editable
  editcellEvent()
  dialogServiceEvent()
  wrapperEvent()
  documentEvent()
  scrolltoToday()
  setStafflist()
  fillConsults()
  setClickMenu()
  setClickSetting()
  setClickService()
  clearSelection()
  overrideJqueryUI()
  resetTimer()

  setTimeout( makeFinish, 1000)
}

// *** plan -> offline browsing by service worker ***
function failed(response) {
	let title = "Server Error",
		error = error + "<br><br>Response from server has no data"

	Alert(title, error + "No localStorage backup")
}

// Display everyday on main table 1 month back, and 2 years ahead
let makeStart = function() {		
	// Start with 1st date of last month
	let	tableID = "tbl",
		table = document.getElementById(tableID),
		book = BOOK

	// No case from server
	if (book.length === 0) { book.push({"opdate" : START}) }

	// Fill until 20 days from now
	let	end = new Date().setDate(new Date().getDate() + 20),
		until = ISOdate(new Date(end))

	fillall(book, table, START, until)
}

// Display everyday on main table 1 month back, and 2 years ahead
let makeFinish = function() {		
	// Start with 1st date of last month
	let	tableID = "tbl",
		table = document.getElementById(tableID),
		book = BOOK

	// No case from server
	if (book.length === 0) {
		book.push({"opdate" : START})
	}

	// Fill until 2 year from now
	let	today = new Date(),
		begin = today.setDate(today.getDate() + 21),
		start = ISOdate(new Date(begin)),
		nextyear = today.getFullYear() + 2,
		month = today.getMonth(),
		todate = today.getDate(),
		until = ISOdate((new Date(nextyear, month, todate)))

	fillall(book, table, start, until, table.rows.length-1)
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

function dialogServiceEvent()
{
	document.getElementById("dialogService").addEventListener("wheel", resetTimerCounter)
	
	document.getElementById("dialogService").addEventListener("mousemove", resetTimerCounter)
}

function wrapperEvent()
{
  document.getElementById("wrapper").addEventListener("wheel", () => {
    resetTimerCounter()
    $(".marker").removeClass("marker")
  })
  
  document.getElementById("wrapper").addEventListener("mousemove", resetTimerCounter)

  $("#wrapper").click(event => {
    let target = event.target
    let $stafflist = $('#stafflist')

    resetTimerCounter()
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
      clearAllEditing()
    }

    event.stopPropagation()
  })
}

function documentEvent()
{
  // Prevent the Backspace key from navigating back.
  // Esc to cancel everything
  $(document).keydown(event => {
    let keycode = event.which || window.event.keyCode,
      ctrl = event.ctrlKey,
      shift = event.shiftKey,
      home = keycode === 36,
      backspace = keycode === 8,
      esc = keycode === 27,
      y = keycode === 89,
      z = keycode === 90

    if (backspace) {
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
    else if (esc) {
      clearAllEditing()
    }
    // ctrl+shift+Home to see last entries of local and server
//    else if (home && ctrl && shift) {
      // Merge data to server
//      latestEntry()
//      event.preventDefault()
//    }
    else if (y && ctrl) {
      UndoManager.redo()
      event.preventDefault()
    }
    else if (z && ctrl) {
      UndoManager.undo()
      event.preventDefault()
    }

    resetTimerCounter()
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
    todate = ISOdate(today),
    todateth = thDate(todate)
  $('#tblcontainer').scrollTop(0)
  let thishead = $("#tbl tr:contains(" + todateth + ")")[0]
  $('#tblcontainer').animate({
    scrollTop: thishead.offsetTop
  }, 300);
}

// stafflist for enter name in Staff column
// staffmenu for dropdown sub-menu
export function setStafflist() {
  let stafflist = '',
      staffmenu = ''
  STAFF.forEach(each => {
    stafflist += `<li><div>${each.staffname}</div></li>`
    staffmenu += `<li><a class="clickStaff ${each.staffname}">
                 <span>${each.staffname}</span></a></li>`
  })
  staffmenu += `<li><a class="clickStaff Consults"><span>Consults</span></a></li>`
  document.getElementById("stafflist").innerHTML = stafflist
  document.getElementById("staffmenu").innerHTML = staffmenu
  setClickStaff()
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
