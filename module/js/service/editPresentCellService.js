
import {
  CASENUMSV, HNSV, NAMESV, DIAGNOSISSV, TREATMENTSV, ADMISSIONSV,
  FINALSV, PROFILESV, ADMITSV, OPDATESV, DISCHARGESV
} from "../model/const.js"
import {
  clearEditcell, createEditcell, editcellSaveData
} from "../control/edit.js"
import { isPACS } from "../util/updateBOOK.js"
import { inPicArea } from "../util/util.js"
import { editableSV } from "./setSERVICE.js"
import { PACS } from "../get/PACS.js"

// Set up editcell for keyin
// redirect click to openPACS or file upload
export function editPresentCellService(evt, pointing) {
  let cindex = pointing.cellIndex

  switch(cindex)
  {
    case CASENUMSV:
      break
    case HNSV:
      getHNSV(evt, pointing)
      break
    case NAMESV:
      clearEditcell()
      break
    case DIAGNOSISSV:
    case TREATMENTSV:
    case ADMISSIONSV:
    case FINALSV:
      editableSV && createEditcell(pointing)
      break
    case PROFILESV:
      editableSV && editcellSaveData(pointing, "edited")
      break
    case ADMITSV:
    case OPDATESV:
    case DISCHARGESV:
      clearEditcell()
      break
  }
}

function getHNSV(evt, pointing)
{
  clearEditcell()
  if (isPACS) {
    if (inPicArea(evt, pointing)) {
      PACS(pointing.innerHTML)
    }
  }
}
