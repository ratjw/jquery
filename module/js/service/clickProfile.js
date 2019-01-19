
import { POINTER } from "../control/edit.js"
import { savePreviousCellService } from "./savePreviousCellService.js"
import { editPresentCellService } from "./editPresentCellService.js"
import { countAllServices } from "./countAllServices.js"
import { getBOOKrowByQN } from "../util/getrows.js"
import { BOOK } from "../util/variables.js"

const UPDATECOUNTER = ["disease", "admitted", "operated", "infection", "morbid", "dead"]
const SERVICECOLOR = ["Readmission", "Reoperation", "Infection", "Morbidity", "Dead"]

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
