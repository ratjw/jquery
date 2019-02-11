
export function getBOOKrowByQN(book, qn) {  
  return book.find(q => Number(q.qn) === Number(qn) )
}

export function getTableRowByQN(tableID, qn)
{
  return Array.from(document.querySelectorAll(`#${tableID} tr`))
        .find(row => Number(row.dataset.qn) === Number(qn))
}

// main table (#maintbl) only
export function getTableRowsByDate(tableID, opdate)
{
  return Array.from(document.querySelectorAll(`#${tableID} tr`))
            .filter(e => e.dataset.opdate === opdate)
}

// main table (#maintbl) only
// remove empty value
export function sameDateRoomTableQNs(tableID, row)
{
  return sameDateRoomTableRows(tableID, row).map(e => e.dataset.qn).filter(e => e)
}

// main table (#maintbl) only
export function sameDateRoomTableRows(tableID, row)
{
  return Array.from(document.querySelectorAll(`#${tableID} tr`)).filter(e => {
    return e.dataset.opdate === row.dataset.opdate
      && e.dataset.theatre === row.dataset.theatre
      && e.dataset.oproom === row.dataset.oproom;
  })
}
