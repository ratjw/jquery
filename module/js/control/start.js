
import { THEATRE } from "../model/const.js"
import { addStaff } from "./addStaff.js"
import { clicktable } from "./clicktable.js"
import { exchangeOncall } from "./exchangeOncall.js"
import { clearAllEditing } from "./clearAllEditing.js"
import { editcellEvent, clearEditcell } from "./edit.js"
import { resetTimer, resetTimerCounter } from "./timer.js"
import { setClickMenu } from "../menu/setClickMenu.js"
import { setClickSetting } from "./setClickSetting.js"
import { setClickService } from "../service/serviceReview.js"
import { sqlStart } from "../model/sqlupdate.js"
import { sortable } from "./sort.js"
import { clearSelection } from "./clearSelection.js"
import { fillmain } from "../view/fill.js"
import { fillConsults } from "../view/fillConsults.js"
import { START, ISOdate, thDate } from "../util/date.js"
import { BOOK, updateBOOK } from "../util/updateBOOK.js"
import { Alert } from "../util/util.js"
import { UndoManager } from "../model/UndoManager.js"
import { htmlStafflist, htmlEquipment, htmldivRecord } from "../view/html.js"
import { scrolltoToday } from "../view/scrolltoThisCase.js"

// For staff & residents with login id / password from Get_staff_detail
export function userStaff() {
  sqlStart().then(response => {
    typeof response === "object"
    ? success(response)
    : failed(response)
  }).catch(error => {})

  document.oncontextmenu = () => false
}

// Success return from server
function success(response) {

  // call sortable before render, otherwise it renders very slowly
  sortable()
  updateBOOK(response)
  scrolltoToday('maintbl')
  fillConsults()

  // setting up html
  htmlEquipment()
  htmldivRecord()
  htmlStafflist()

  // make the document editable
  editcellEvent()
  dialogServiceEvent()
  wrapperEvent()
  documentEvent()
  setClickMenu()
  setClickSetting()
  setClickService()
  clearSelection()
  overrideJqueryUI()
  resetTimer()
}

// *** plan -> offline browsing by service worker ***
function failed(response) {
  let title = "Server Error",
    error = error + "<br><br>Response from server has no data"

  Alert(title, error + "No localStorage backup")
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
    } else if (target.nodeName === "IMG") {
      target = target.closest("td")
    }

    if (target.cellIndex === THEATRE) {
      let maintbl = document.getElementById("maintbl")
      if (maintbl.querySelectorAll("th")[THEATRE].offsetWidth < 10) {
        maintbl.classList.add("showColumn2")
      } else if (target.nodeName === "TH") {
        maintbl.classList.remove("showColumn2")
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
    let keycode = event.which,
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
    resetTimerCounter()
  });

  $(document).contextmenu( event => {
    let target = event.target
    let oncall = target.dataset.consult

    if (oncall) {
      if (event.altKey) {
        addStaff(target)
      } else {
        exchangeOncall(target)
      }
      event.preventDefault()
    }
  })

  window.addEventListener('resize', () => {
    $("#mainwrapper").css("height", window.innerHeight - $("#cssmenu").height())
    $("#queuecontainer").css({
      "height": $("#mainwrapper").height() - $("#titlebar").height()
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
