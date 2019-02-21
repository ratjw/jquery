
import { UndoManager } from "../model/UndoManager.js"
import { HN } from "../model/const.js"
import { clearSelection } from "../control/clearSelection.js"
import { createEditcell } from "../control/edit.js"
import { blankRowData } from "../model/rowdata.js"

export function addnewrow() {
  let row = document.querySelector(".selected"),
    tableID = row.closest('table').id,
    clone = row.cloneNode(true),
    cells = clone.querySelectorAll("td")

  cells[HN].classList.remove("pacs")
  Array.from(clone.querySelectorAll("td:not(:first-child)")).forEach(e => e.innerHTML = "")
  row.classList.remove("selected")
  row.after(clone)
  clearSelection()
  createEditcell(cells[HN])
  blankRowData(clone, row.dataset.opdate)
}
