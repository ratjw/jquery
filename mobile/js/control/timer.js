import {
	DIAGNOSIS, TREATMENT, CONTACT,
	DIAGNOSISSV, TREATMENTSV, ADMISSIONSV, FINALSV, PROFILESV
} from "../model/const.js"
import {
	POINTER, OLDCONTENT, getNewcontent, editcellLocation, renewEditcell
} from "./edit.js"
import { clearAllEditing } from "./clearAllEditing.js"
import { fetchdoUpdate, fetchGetUpdate, fetchSaveOnChange } from "../model/update.js"
import { fetchGetUpdateService, fetchSaveOnChangeService } from "../model/servicedb.js"
import { saveProfileService } from "../service/savePreviousCellService.js"
import { setSERVICE } from "../service/setSERVICE.js"
import { reViewService } from "../service/showService.js"
import { timestamp, updateBOOK } from "../util/variables.js"
import { Alert, isSplit } from "../util/util.js"
import { refillall, refillstaffqueue } from "../view/fill.js"
import { fillConsults } from "../view/fillConsults.js"

// timer is just an id number of setTimeout, not the clock object
// idleCounter is number of cycles of idle setTimeout
let timer = 0
let idleCounter = 0

export function clearTimer() {
	clearTimeout(timer)
}

// poke server every 10 sec.
export function resetTimer() {
	clearTimeout(timer)
	timer = setTimeout( updating, 10000)
}

export function resetTimerCounter()
{
	resetTimer();
	idleCounter = 0
}

// While idling every 10 sec., get updated by itself and another clients
// 1. Visible editcell
// 	1.1 Editcell changed (update itself and from another client on the way)
//	1.2 Editcell not changed, check updated from another client
// 2. Not visible editcell, get update from another client
function updating() {
	if (onChange()) {
		idleCounter = 0
	} else {
		doUpdate()
	}

	resetTimer()
}

// savePreviousCell and return with true (changed) or false (not changed)
let onChange = function () {

  // When editcell is not pointing, there must be no change by this editor
  if (!POINTER) { return false }

  let newcontent = getNewcontent(),
      index = POINTER.cellIndex,
      whereisEditcell = editcellLocation(),
	  qn = $(POINTER).siblings(":last").html()

  if (OLDCONTENT === newcontent) {
    return false
  }

  if (whereisEditcell === "dialogService") {
    return saveOnChangeService(POINTER, index, newcontent, qn)
  } else {
    return saveOnChange(POINTER, index, newcontent, qn)
  }
}

// Check data changed in server
// if some changes in database from other users (while this user is idling),
// then sync data of editcell with underlying table cell
// timestamp is this client last save to server
function doUpdate()
{
  fetchdoUpdate().then(response => {
    if (typeof response === "object") {
      if (timestamp < response[0].timestamp) {
        getUpdate()
      } else {
        onIdling()
	  }
    }
  })
}

// There is some changes in database from other users
function getUpdate()
{
  if (dialogServiceShowing()) {
    fetchGetUpdateService().then(response => {
      if (typeof response === "object") {
        updateBOOK(response)
        setSERVICE(response.SERVICE)
        reViewService()
        viewGetUpdate()
      } else {
        Alert ("getUpdateWithService", response)
      }
    })
  }	else {
    fetchGetUpdate().then(response => {
      if (typeof response === "object") {
        updateBOOK(response)
        viewGetUpdate()
      } else {
        Alert ("getUpdate", response)
      }
    })
  }
}

// if not being editing on screen (idling) 1 minute, clear editing setup
// if idling 10 minutes, logout
function onIdling()
{
    if (idleCounter && !(idleCounter % 6)) {
      clearAllEditing()
      viewGetUpdate()
    } else if (idleCounter > 59) {
      history.back()
    }

    idleCounter += 1
}

function viewGetUpdate()
{
	refillall()
	fillConsults()
	if (isSplit()) { refillstaffqueue() }
	renewEditcell()
}

function saveOnChange(POINTER, index, content, qn)
{
  let column = index === DIAGNOSIS
                ? "diagnosis"
                : index === TREATMENT
                ? "treatment"
                : index === CONTACT
                ? "contact"
                : ""

  if (!column) { return false }

  fetchSaveOnChange(column, content, qn).then(response => {
    if (typeof response === "object") {
      updateBOOK(response)
    } else {
      Alert ("saveOnChange", response)
    }
  })

  POINTER.innerHTML = content
  return true
}

function saveOnChangeService(POINTER, index, content, qn)
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

  if (index === PROFILESV) { saveProfileService(POINTER) }
  if (!column) { return false }

  fetchSaveOnChangeService(column, content, qn).then(response => {
    if (typeof response === "object") {
      updateBOOK(response)
    } else {
      Alert ("saveOnChangeService", response)
    }
  })

  POINTER.innerHTML = content
  return true
}

function dialogServiceShowing()
{
  let $dialogService = $("#dialogService")

  return $dialogService.hasClass('ui-dialog-content') && $dialogService.dialog('isOpen')
}
