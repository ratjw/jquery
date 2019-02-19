import {
  DIAGNOSIS, TREATMENT, CONTACT,
  DIAGNOSISSV, TREATMENTSV, ADMISSIONSV, FINALSV, PROFILESV
} from "../model/const.js"
import {
  POINTER, OLDCONTENT, getNewcontent, editcellLocation, renewEditcell
} from "./edit.js"
import { clearAllEditing } from "./clearAllEditing.js"
import { sqlSaveOnChange } from "../model/sqlupdate.js"
import { sqlSaveOnChangeService } from "../model/sqlservice.js"
import { saveProfileService } from "../service/savePreviousCellService.js"
import { updateBOOK } from "../util/updateBOOK.js"
import { Alert } from "../util/util.js"

// timer is just an id number of setTimeout, not the clock object
// idleCounter is number of cycles of idle setTimeout
let timer = 0
let idleCounter = 0

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

export function clearTimer() {
  clearTimeout(timer)
}

// While idling every 10 sec., get updated by itself and another clients
// 1. Visible editcell
//   1.1 Editcell changed (update itself and from another client on the way)
//  1.2 Editcell not changed, check updated from another client
// 2. Not visible editcell, get update from another client
function updating() {
  if (onChange()) {
    idleCounter = 0
  } else {
    onIdling()
  }

  resetTimer()
}

// savePreviousCell and return with true (changed) or false (not changed)
let onChange = function () {

  // When editcell is not pointing, there must be no change by this editor
  if (!POINTER) { return false }

  let content = getNewcontent(),
      whereisEditcell = editcellLocation()

  if (OLDCONTENT === content) {
    return false
  }

  if (whereisEditcell === "dialogService") {
    return saveOnChangeService(content)
  } else {
    return saveOnChange(content)
  }
}

// if not being editing on screen (idling) 1 minute, clear editing setup
// if idling 10 minutes, logout
function onIdling()
{
    if (idleCounter && !(idleCounter % 6)) {
      clearAllEditing()
      renewEditcell()
    } else if (idleCounter > 59) {
      history.back()
    }

    idleCounter += 1
}

function saveOnChange(content)
{
  let index = POINTER.cellIndex,
      qn = POINTER.closest("tr").dataset.qn,
      column = index === DIAGNOSIS
                ? "diagnosis"
                : index === TREATMENT
                ? "treatment"
                : index === CONTACT
                ? "contact"
                : ""

  if (!column) { return false }

  sqlSaveOnChange(column, content, qn).then(response => {
    if (typeof response === "object") {
      updateBOOK(response)
    } else {
      Alert ("saveOnChange", response)
    }
  })

  POINTER.innerHTML = content
  return true
}

function saveOnChangeService(content)
{
  let index = POINTER.cellIndex,
      qn = POINTER.closest("tr").dataset.qn,
      column = index === DIAGNOSISSV
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

  sqlSaveOnChangeService(column, content, qn).then(response => {
    if (typeof response === "object") {
      updateBOOK(response)
    } else {
      Alert ("saveOnChangeService", response)
    }
  })

  POINTER.innerHTML = content
  return true
}
