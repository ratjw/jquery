
import { createEditcell, clearEditcell } from "../control/edit.js"
import { isPACS } from "../util/updateBOOK.js"
import { inPicArea } from "../util/util.js"
import { PACS } from "./PACS.js"

export function getHN(evt, pointing)
{
  if (pointing.innerHTML) {
    clearEditcell()
    if (isPACS) {
      if (inPicArea(evt, pointing)) {
        PACS(pointing.innerHTML)
      }
    }
  } else {
    createEditcell(pointing)
  }
}
