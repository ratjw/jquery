
import { POINTER } from "../control/edit.js"
import { savePreviousCellService } from "./savePreviousCellService.js"
import { editPresentCellService } from "./editPresentCellService.js"
import { countAllServices } from "./countAllServices.js"

// calc counter in service header
// "admitted", "operated", use .on('input') in showService
const UPDATECOUNTER = ["disease", "infection", "morbid", "dead"]

// user-defined "no" by unchecked click
const RADIOENDO = ["Radiosurgery", "Endovascular"]

// use to show disease when operated is up from 0 to 1
let prevDisease = ""

export function clickProfile(evt, target)
{
  let inCell = target.closest("td")

  if (target.nodeName === "INPUT") {
    let nameqn = target.name.split(/(\d+)/)
    let name = nameqn[0]
    let qn = nameqn[1]

    if (RADIOENDO.includes(name)) {
      target.value = target.checked ? name : "no"
    } else if (UPDATECOUNTER.includes(name)) {
      if (name === "disease") {
        diseaseToOperation(target, inCell, qn)
      } else {
        showInputColor(target)
      }
      countAllServices()
    }

    if (inCell !== POINTER) {
      if (POINTER) {
       savePreviousCellService()
      }
      editPresentCellService(evt, inCell)
    }
  }
}

export function showInputColor(target)
{
  let row = target.closest("tr")
  let classname = target.title

  if (target.checked || target.value > 1) {
    row.classList.add(classname)
  } else {
    row.classList.remove(classname)
  }
}

function diseaseToOperation(target, inCell, qn)
{
  let inputOperated = inCell.querySelector("input[name='operated" + qn + "']")
  let operatedValue = Number(inputOperated.value)

  if (target.checked) {
    if (target.beforeDz) {
      inputOperated.value = operatedValue || 1
    } else {
      inputOperated.value = operatedValue + 1
    }
  } else {
    inputOperated.value = operatedValue - 1
    prevDisease = target.value
  }
}

export function operationToDisease(target)
{
  let inCell = target.closest("td")
  let qn = target.name.split(/(\d+)/)[1]
  let inputDisease = inCell.querySelectorAll("input[name='disease" + qn + "']")
  let checkedDz = Array.from(inputDisease).filter(e => e.checked)

  if (target.value === "0") {
    prevDisease = checkedDz.length ? checkedDz[0].value : ""
    Array.from(inputDisease).forEach(e => e.checked = false)
  } else if (target.value > "0" && target.prevVal === "0") {
    Array.from(inputDisease).forEach(e => e.checked = e.value === prevDisease)
  }
}
