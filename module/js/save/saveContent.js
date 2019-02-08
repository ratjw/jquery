
import { URIcomponent } from "../util/util.js"
import { saveContentQN } from "./saveContentQN.js"
import { saveContentNoQN } from "./saveContentNoQN.js"

// use only "pointed" to save data
export function saveContent(pointed, column, newcontent) {
  let qn = pointed.closest("tr").dataset.qn

  // show instantly, no re-render after save to DB
  pointed.innerHTML = newcontent

  // take care of white space, double qoute, single qoute, and back slash
  newcontent = URIcomponent(newcontent)

  qn
  ? saveContentQN(pointed, column, newcontent)
  : saveContentNoQN(pointed, column, newcontent)
}
