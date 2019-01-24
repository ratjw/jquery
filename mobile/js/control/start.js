
import { addStaff } from "./addStaff.js"
import { clicktable } from "./clicktable.js"
import { exchangeOncall } from "./exchangeOncall.js"
import { clearAllEditing } from "./clearAllEditing.js"
import { editcellEvent, clearEditcell } from "./edit.js"
import { resetTimer, resetTimerCounter } from "./timer.js"
import { setClickMenu } from "../menu/setClickMenu.js"
import { setClickSetting } from "./setClickSetting.js"
import { setClickService } from "../service/serviceReview.js"
import { fetchStart } from "../model/update.js"
import { sortable } from "./sort.js"
import { clearSelection } from "./clearSelection.js"
import { fillall } from "../view/fill.js"
import { fillConsults } from "../view/fillConsults.js"
import { START, ISOdate, thDate } from "../util/date.js"
import { BOOK, updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { htmlStafflist, htmlEquipment, htmldivRecord } from "../view/html.js"

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
  scrolltoToday()

  // setting up html
  htmlEquipment()
  htmldivRecord()
  htmlStafflist()

  // make the document editable
  editcellEvent()
  dialogServiceEvent()
  wrapperEvent()
  documentEvent()
  fillConsults()
  setClickMenu()
//  setClickSetting()
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

// Display everyday on main table 1 month back, and 10 days ahead
let makeStart = function() {		
	// Start with 1st date of last month
	let	tableID = "tbl",
		table = document.getElementById(tableID),
		book = BOOK

	// No case from server
	if (book.length === 0) { book.push({"opdate" : START}) }

	// Fill until 10 days from now
	let	end = new Date().setDate(new Date().getDate() + 10),
		until = ISOdate(new Date(end))

	fillall(book, table, START, until)
}

// Display everyday on main table 10 days ahead, to 1 year ahead
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
		begin = today.setDate(today.getDate() + 11),
		start = ISOdate(new Date(begin)),
		nextyear = today.getFullYear() + 1,
		month = today.getMonth(),
		todate = today.getDate(),
		until = ISOdate((new Date(nextyear, month, todate)))

	fillall(book, table, start, until, table.rows.length-1)
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

  $("#wrapper").off("click").on("click", (event) => {
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
      target = target.closest('td')
    }
    else if (target.nodeName === "IMG") {
      target = target.closest("td")
    }
    else if (target.nodeName === "TD") {
      clicktable(event, target)
    }
    else {
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
      if (doPrevent(event)) {
        event.preventDefault()
        return false
      }
    }
    else if (esc) {
      clearAllEditing()
    }
    // ctrl+shift+Home to see last entries of local and server
/*    else if (home && ctrl && shift) {
      // Merge data to server
      latestEntry()
      event.preventDefault()
    }
    else if (y && ctrl) {
      UndoManager.redo()
      event.preventDefault()
    }
    else if (z && ctrl) {
      UndoManager.undo()
      event.preventDefault()
    }
*/
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

// prevent browser go back in history
function doPrevent(evt)
{
  let doPrevent = true
  let types = ["text", "password", "file", "number", "date", "time"]
  let d = $(evt.srcElement || evt.target)
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
  return doPrevent
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
