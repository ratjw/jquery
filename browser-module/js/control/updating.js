import {
	DIAGNOSIS, TREATMENT, CONTACT,
	DIAGNOSISSV, TREATMENTSV, ADMISSIONSV, FINALSV, PROFILESV
} from "../model/const.js"
import {
	pointer, oldcontent, getNewcontent, editcellLocation
} from "./edit.js"
import { fetchdoUpdate, fetchGetUpdate, fetchSaveOnChange } from "../model/fetch.js"
import { fetchGetUpdateWithService, fetchSaveOnChangeService } from "../model/fetchService.js"
import { timestamp, dialogServiceShowing, updateBOOK, Alert } from "../util/util.js"
import { clearAllEditing } from "./clearAllEditing.js"
import { viewGetUpdate, viewOnIdling } from "../view/fill.js"
import { saveProfileService } from "../service/savePreviousCellService.js"
import { setSERVICE } from "../service/setSERVICE.js"

// timer is just an id number of setTimeout, not the clock object
// idleCounter is number of cycles of idle setTimeout
let timer = 0,
    idleCounter = 0

// poke server every 10 sec.
export function clearTimer() {
	clearTimeout(timer)
}
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
export function updating() {
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
  if (!pointer) { return false }

  let newcontent = getNewcontent(),
      index = pointer.cellIndex,
      whereisEditcell = editcellLocation(),
	  qn = $(pointer).siblings(":last").html()

  if (oldcontent === newcontent) {
    return false
  }

  if (whereisEditcell === "dialogService") {
    return saveOnChangeService(pointer, index, newcontent, qn)
  } else {
    return saveOnChange(pointer, index, newcontent, qn)
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
    fetchGetUpdateWithService().then(response => {
      if (typeof response === "object") {
        updateBOOK(response)
		setSERVICE(response.SERVICE)
        viewGetUpdateWithService(response)
      } else {
        Alert ("getUpdateWithService", response)
      }
    })
  }	else {
    fetchGetUpdate().then(response => {
      if (typeof response === "object") {
        updateBOOK(response)
        viewGetUpdate(response)
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
	  viewOnIdling()
    } else if (idleCounter > 59) {
      history.back()
    }

    idleCounter += 1
}

function saveOnChange(pointer, index, content, qn)
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

  pointer.innerHTML = content
  return true
}

function saveOnChangeService(pointer, index, content, qn)
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

  if (index === PROFILESV) { saveProfileService(pointer) }
  if (!column) { return false }

  fetchSaveOnChangeService(column, content, qn).then(response => {
    if (typeof response === "object") {
      updateBOOK(response)
    } else {
      Alert ("saveOnChangeService", response)
    }
  })

  pointer.innerHTML = content
  return true
}
