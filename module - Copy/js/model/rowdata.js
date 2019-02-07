
export function setRowData(row, q)
{
  row.dataset.waitnum = q.waitnum
  row.dataset.opdate = q.opdate
  row.dataset.theatre = q.theatre
  row.dataset.oproom = q.oproom || ""
  row.dataset.optime = q.optime
  row.dataset.casenum = q.casenum || ""
  row.dataset.staffname = q.staffname
  row.dataset.hn = q.hn
  row.dataset.patient = q.patient
  row.dataset.dob = q.dob || ""
	row.dataset.diagnosis = q.diagnosis
	row.dataset.treatment = q.treatment
	row.dataset.equipment = q.equipment
	row.dataset.contact = q.contact
  row.dataset.qn = q.qn
}

export function blankRowData(row, opdate)
{
  row.dataset.waitnum = ""
  row.dataset.opdate = opdate
  row.dataset.theatre = ""
  row.dataset.oproom = ""
  row.dataset.optime = ""
  row.dataset.casenum = ""
  row.dataset.staffname = ""
  row.dataset.hn = ""
  row.dataset.patient = ""
  row.dataset.dob = ""
	row.dataset.diagnosis = ""
	row.dataset.treatment = ""
	row.dataset.equipment = ""
	row.dataset.contact = ""
  row.dataset.qn = ""
}

// for viewGetNameHN
export function setGetNameHNRowData(row, q)
{
  row.dataset.waitnum = q.waitnum
  row.dataset.staffname = q.staffname
  row.dataset.hn = q.hn
  row.dataset.patient = q.patient
	row.dataset.diagnosis = q.diagnosis
	row.dataset.treatment = q.treatment
	row.dataset.contact = q.contact
  row.dataset.qn = q.qn
}

export function setAllDeletedRowdata(row, q)
{
  row.dataset.waitnum = q.waitnum
  row.dataset.opdate = q.opdate
  row.dataset.oproom = q.oproom
  row.dataset.casenum = q.casenum
  row.dataset.staffname = q.staffname
  row.dataset.qn = q.qn
}
