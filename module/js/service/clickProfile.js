
import { POINTER } from "../control/edit.js"
import { savePreviousCellService } from "./savePreviousCellService.js"
import { editPresentCellService } from "./editPresentCellService.js"
import { countAllServices } from "./countAllServices.js"

const UPDATECOUNTER = ["disease", "admitted", "operated", "infection", "morbid", "dead"]
const SERVICECOLOR = ["Readmission", "Reoperation", "Infection", "Morbidity", "Dead"]

let beforePrevDz = ""
let prevDisease = ""

export function clickProfile(evt, target)
{
  let inCell = target.closest("td")

  if (target.nodeName === "INPUT") {
    let name = target.name.replace(/\d+/g, "")
    if (UPDATECOUNTER.includes(name)) {
      if (SERVICECOLOR.includes(target.title)) {
        showInputColor(target)
      } else if (name === "disease") {
        diseaseOperation(target)
      }
      if (name === "operated") {
        operationDisease(target)
      }
      countAllServices()
    }
    if (inCell !== POINTER) {
      if (POINTER) {
       savePreviousCellService()
      }
      editPresentCellService(evt, inCell)
    }
    if (prevDisease) { lastDisease = prevDisease }
    prevDisease = target.checked ? target.value : ""
  }
}

function showInputColor(target)
{
  let row = target.closest("tr"),
    classname = target.title

  if (target.checked || target.value > 1) {
    row.classList.add(classname)
  } else {
    row.classList.remove(classname)
  }
}

function diseaseOperation(target)
{
  let inCell = target.closest("td")
  let qn = inCell.parentElement.lastElementChild.innerHTML
  let inputOperated = inCell.querySelector("input[name='operated" + qn + "']")
  let operatedValue = Number(inputOperated.value)

  if (target.checked) {
    if (!target.disease) {
      inputOperated.value = operatedValue + 1
    }
  } else {
    inputOperated.value = operatedValue - 1
  }
}

function operationDisease(target)
{
  let inCell = target.closest("td")
  let qn = inCell.parentElement.lastElementChild.innerHTML
  let inputDisease = inCell.querySelectorAll("input[name='disease" + qn + "']")

  if (target.value === "0") {
    Array.from(inputDisease).forEach(e => e.checked = false)
  } else if (target.value === "1" && target.prevVal === "0") {
    Array.from(inputDisease).forEach(e => e.checked = e.value === beforePrevDz)
  }
}
