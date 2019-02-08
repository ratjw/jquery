
import { postData, MYSQLIPHP } from "./fetch.js"

const SEARCH  = "php/search.php"

export function sqlSearchDB(hn, staffname, others) {
  let sql = `hn=${hn}&staffname=${staffname}&others=${others}`

  return postData(SEARCH, sql)
}
