//--- global variables --------------
let gv = {
	BOOK: [],
	CONSULT: [],
	SERVICE: [],
	SERVE: [],
	STAFF: [],
	ONCALL: [],
	HOLIDAY: [],
	timestamp: "",
	showUpload: null,
	timer: 0,
	idleCounter: 0,
	isPACS: true,
	editableSV: true,
	user: ""
}


//--- constants ---------------------

const GETIPD = "php/getipd.php", 
GETNAMEHN	= "php/getnamehn.php",
MYSQLIPHP	= "php/mysqli.php",
SEARCH		= "php/search.php",
LINEBOT		= "line/lineBot.php",
LINENOTIFY	= "line/lineNotify.php",

//tbl, queuetbl
OPDATE		= 0,
THEATRE		= 1,
OPROOM		= 2,
OPTIME		= 3,
CASENUM		= 4,
STAFFNAME	= 5,
HN			= 6,
PATIENT		= 7,
DIAGNOSIS	= 8,
TREATMENT	= 9,
EQUIPMENT	= 10,
CONTACT		= 11,
QN			= 12,

//servicetbl
CASENUMSV	= 0,
HNSV		= 1,
NAMESV		= 2,
DIAGNOSISSV	= 3,
TREATMENTSV	= 4,
ADMISSIONSV	= 5,
FINALSV		= 6,
PROFILESV	= 7,
ADMITSV		= 8,
OPDATESV	= 9,
DISCHARGESV	= 10,
QNSV		= 11,

// NAMEOFDAYABBR for 1st column color
// NAMEOFDAYFULL for row color
NAMEOFDAYABBR	= ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
NAMEOFDAYFULL	= ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
THAIMONTH		= ["มค.", "กพ.", "มีค.", "เมย.", "พค.", "มิย.", "กค.", "สค.", "กย.", "ตค.", "พย.", "ธค."],
LARGESTDATE		= "9999-12-31",

HOLIDAYENGTHAI = {
	"Magha": "วันมาฆบูชา",
	"Maghasub": "ชดเชยวันมาฆบูชา",
	"Ploughing": "วันพืชมงคล",
	"Ploughingsub": "ชดเชยวันพืชมงคล",
	"Vesak": "วันวิสาขบูชา",
	"Vesaksub": "ชดเชยวันวิสาขบูชา",
	"Asalha": "วันอาสาฬหบูชา",
	"Asalhasub": "ชดเชยวันอาสาฬหบูชา",
	"Vassa": "วันเข้าพรรษา",
	"Vassasub": "ชดเชยวันเข้าพรรษา",
	"special": "วันหยุดพิเศษ",
	"no": "ไม่หยุด"
},

ROWREPORT = {
	"Brain Tumor": 3,
	"Brain Vascular": 4,
	"CSF related": 5,
	"Trauma": 6,
	"Spine": 7,
	"etc": 8,
	"Radiosurgery": 10,
	"Endovascular": 11,
	"Conservative": 12
},
COLUMNREPORT = {
	"Staff": 1,
	"Resident": 5,
	"Major": 0,
	"Minor": 2,
	"Elective": 0,
	"Emergency": 1
},
SPECIALTY = [
	"breast",
	"cvt",
	"general",
	"hepatobiliary",
	"neurosurgery",
	"pediatrics",
	"plastic",
	"trauma",
	"urology",
	"vascular"
],

SERVICECOLOR = ["Readmission", "Reoperation", "Infection", "Morbidity", "Dead"],

// ["type", "width", "name", "id" (also used in label for), "label"]
EQUIPSHEET = [
    ["spanInSpan", "w70", "", "oproom", "ห้อง "],
    ["spanInSpan", "w70", "", "casenum", "Case "],
    ["spanInSpan", "w120", "", "optime", "เวลา "],
    ["spanInSpan", "", "", "opday", "วัน"],
    ["spanInSpan", "w150", "", "opdate", "ที่ "],
    ["spanInSpan", "w150", "", "staffname", "Surgeon "],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", "ชื่อ-นามสกุล"],
    ["span", "", "", "patientname", ""],
    ["span", "w20", "", "", ""],
    ["span", "", "", "", "อายุ&nbsp;"],
    ["span", "", "", "age", ""],
    ["span", "w20", "", "", ""],
    ["span", "", "", "", "HN&nbsp;"],
    ["span", "", "", "hn", ""],
    ["br", "", "", "", ""],
    // floatleft makes the subsequent text rows go downwards
    // instead of pushing previous rows upward
    ["span", "w110 floatleft", "", "", "Diagnosis"],
    ["span", "w540", "", "diagnosis", ""],
    ["br", "", "", "", ""],
    ["span", "w110 floatleft", "", "", "Operation"],
    ["span", "w540", "", "treatment", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "ส่วนเกิน", "", ""],
    ["span", "w110", "", "", ""],
    ["span", "", "", "", "<i><b>***</b> ผู้ป่วยและญาติสามารถ<b><u>จ่ายส่วนเกินได้ </u></b></i> "],
    ["text", "", "w110 textcenter", "copay", ""],
    ["span", "", "", "", " บาท <b>***</b>"],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "position", "", ""],
    ["span", "w110", "", "clearPosition", "Position <small>(คลิกลบ)</small>"],
    ["radio", "w170", "pose", "Supine_left", "Supine left"],
    ["radio", "w170", "pose", "Supine_right", "Supine right"],
    ["radio", "w170", "pose", "Supine", "Supine"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["radio", "w170", "pose", "Parkbench_ขวาลง", "Parkbench ขวาลง"],
    ["radio", "w170", "pose", "Lateral_ขวาลง", "Lateral ขวาลง"],
    ["radio", "w170", "pose", "Semiprone_ขวาลง", "Semiprone ขวาลง"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["radio", "w170", "pose", "Parkbench_ซ้ายลง", "Parkbench ซ้ายลง"],
    ["radio", "w170", "pose", "Lateral_ซ้ายลง", "Lateral ซ้ายลง"],
    ["radio", "w170", "pose", "Semiprone_ซ้ายลง", "Semiprone ซ้ายลง"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["radio", "w170", "pose", "Concorde", "Concorde"],
    ["radio", "w170", "pose", "Prone", "Prone"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["text", "", "w500", "position", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "Imaging"],
    ["span", "w110", "", "", "Imaging"],
    ["checkbox", "w170", "", "Navigator_frameless", "Navigator frameless"],
    ["checkbox", "w170", "", "Navigator_frame-based", "Navigator frame-based"],
    ["checkbox", "", "", "Stereotactic_frame-based", "Stereotactic frame-based"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["checkbox", "w170", "", "Fluoroscope", "Fluoroscope"],
    ["checkbox", "w170", "", "Robotics", "Robotics"],
    ["checkbox", "w170", "", "O-arm", "O-arm"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["checkbox", "w170", "", "iMRI", "iMRI"],
    ["checkbox", "w170", "", "iCT", "iCT"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["text", "", "w500", "Imaging", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "อุปกรณ์ยึดผู้ป่วย"],
    ["span", "w110", "", "", "อุปกรณ์ยึดผู้ป่วย"],
    ["checkbox", "w170", "", "Mayfield", "Mayfield"],
    ["checkbox", "w170", "", "GelHeadRing", "Gel Head Ring"],
    ["checkbox", "w170", "", "Horseshoe", "Horseshoe"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["text", "", "w500", "อุปกรณ์ยึดผู้ป่วย", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "เครื่องตัดกระดูก"],
    ["span", "w110", "", "", "เครื่องตัดกระดูก"],
    ["checkbox", "w170", "", "HighSpeedDrill", "High Speed Drill"],
    ["checkbox", "w170", "", "SagittalSaw", "Sagittal Saw"],
    ["checkbox", "w170", "", "Osteotome", "Osteotome"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["text", "", "w500", "เครื่องตัดกระดูก", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "กล้อง"],
    ["span", "w110", "", "", "กล้อง"],
    ["checkbox", "w170", "", "Microscope", "Microscope"],
    ["checkbox", "w170", "", "ICG", "ICG"],
    ["checkbox", "w170", "", "Endoscope", "Endoscope"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["text", "", "w500", "กล้อง", "ระบุยี่ห้อ"],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "Retractor"],
    ["span", "w110", "", "", "Retractor"],
    ["checkbox", "w170", "", "Leylar", "Leylar"],
    ["checkbox", "w170", "", "Halo", "Halo"],
    ["checkbox", "w170", "", "Greenberg", "Greenberg"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["text", "", "w500", "Retractor", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "CUSA"],
    ["span", "w110", "", "", "CUSA"],
    ["checkbox", "w170", "", "Excell", "Excell"],
    ["checkbox", "w170", "", "Soring", "Soring"],
    ["checkbox", "w170", "", "Sonar", "Sonar"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["text", "", "w500", "CUSA", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "U/S"],
    ["span", "w110", "", "", "U/S"],
    ["checkbox", "w170", "", "Ultrasound", "Ultrasound"],
    ["checkbox", "w170", "", "Doppler", "Doppler"],
    ["checkbox", "w170", "", "Duplex", "Duplex"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["text", "", "w500", "U/S", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "Shunt"],
    ["span", "w110", "", "clearShunt", "Shunt <small>(คลิกลบ)</small>"],
    ["br", "", "", "", ""],
    ["span", "w10", "", "", ""],
    ["span", "w30", "", "", "Pudenz"],
    ["span", "w30", "", "", ""],
    ["span", "w40", "", "", "หัว"],
    ["radio", "w170", "head", "Pudenz_proximalLow", "low"],
    ["radio", "w170", "head", "Pudenz_proximalMedium", "med"],
    ["radio", "w170", "head", "Pudenz_proximalHigh", "high"],
    ["br", "", "", "", ""],
    ["span", "w70", "", "", ""],
    ["span", "w40", "", "", "ท้อง"],
    ["radio", "w170", "peritoneum", "Pudenz_distalLow", "low"],
    ["radio", "w170", "peritoneum", "Pudenz_distalMedium", "med"],
    ["radio", "w170", "peritoneum", "Pudenz_distalHigh", "high"],
    ["br", "", "", "", ""],
    ["span", "w10", "", "", ""],
    ["span", "w100", "", "", "Programmable"],
    ["radio", "w170", "program", "shunt_Medtronic", "Medtronic"],
    ["radio", "w170", "program", "shunt_Codman", "Codman"],
    ["radio", "w170", "program", "shunt_proGAV", "proGAV"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["text", "", "w500", "Shunt", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "เครื่องมือบริษัท"],
    ["span", "w110", "", "", "เครื่องมือบริษัท"],
    ["span", "", "", "", "เวลาส่งเครื่อง"],
    ["text", "", "w100", "เวลาส่งเครื่อง", ""],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["text", "", "w500", "เครื่องมือบริษัท", "ชื่อบริษัท ชื่อเครื่องมือ"],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "อุปกรณ์อื่นๆ"],
    ["span", "w110", "", "", "อุปกรณ์อื่นๆ"],
    ["checkbox", "w170", "", "cranioplastic_Cement", "cranioplastic Cement"],
    ["checkbox", "w170", "", "MTEC_skull", "MTEC skull"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["text", "", "w500", "อุปกรณ์อื่นๆ", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "Monitor"],
    ["span", "w110", "", "", "Monitor"],
    ["checkbox", "w170", "", "CN3", "CN3"],
    ["checkbox", "w170", "", "CN5", "CN5"],
    ["checkbox", "w170", "", "CN6", "CN6"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["checkbox", "w170", "", "CN7", "CN7"],
    ["checkbox", "w170", "", "CN8", "CN8"],
    ["checkbox", "w170", "", "CN9", "CN9"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["checkbox", "w170", "", "CN10", "CN10"],
    ["checkbox", "w170", "", "CN11", "CN11"],
    ["checkbox", "w170", "", "CN12", "CN12"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["checkbox", "w170", "", "SSEP", "SSEP"],
    ["checkbox", "w170", "", "EMG", "EMG"],
    ["checkbox", "w170", "", "MEP", "MEP"],
    ["br", "", "", "", ""],
    ["span", "w110", "", "", ""],
    ["text", "", "w500", "Monitor", "อื่นๆ"],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "Notice"],
    ["span", "w110 floatleft", "", "", "Notice"],
    ["textarea", "", "", "Notice", "เครื่องมือพิเศษอื่นๆ"],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", ""],
    ["span", "w350", "", "", ""],
    ["span", "w70", "", "", " Edited by "],
    ["span", "", "", "editedby", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""]
],

EQUIPICONS = {
    Fluoroscope: "Fluoroscope",
    "Navigator_frameless": "Navigator",
    "Navigator_frame-based": "Navigator",
    Oarm: "Oarm",
    Robotics: "Robotics",
    Microscope: "Microscope",
    ICG: "Microscope",
    Endoscope: "Endoscope",
    Excell: "CUSA",
    Soring: "CUSA",
    Sonar: "CUSA",
    ultrasound: "Ultrasound",
    Doppler: "Ultrasound",
    Duplex: "Ultrasound",
    CN5: "Monitor",
    CN6: "Monitor",
    CN7: "Monitor",
    CN8: "Monitor",
    CN9: "Monitor",
    CN10: "Monitor",
    CN11: "Monitor",
    CN12: "Monitor",
    SSEP: "Monitor",
    EMG: "Monitor",
    MEP: "Monitor"
},

//===========================================================================================
// Keyword constants for program to guess the disease in Service Review from disease and treatment

BRAINDX = [
	/\bbrain\b/i, /basal ganglion/i, /basal.*gg/i, /bgg/i, /cavernous/i, /cerebell/i, 
	/cranio/i, /\bCNS\b/i, /convexity/i, /\bCPA?\b/i, /cliv[aou]/i,
	/facial/i, /front/i, /fal[cx]/i, /\bF\-?P\b/i, /jugular/i,
	/pariet/i, /planum/i, /pitui/i, /pineal/i, /petro/i, 
	/occipit/i, /sella/i, /sphenoid/i, /sagittal/i, /\bSSS\b/i,
	/tempor/i, /tentori/i, /thalam/i, /tonsil/i,
	/transnasal/i, /transsphenoid/i, /transtent/i, /transventric/i, 
	/tuberculum/i, /vestibul/i
],
BRAINTUMORDX = [
	/^((?!cavernoma|hematoma|osteo|zyg).)*oma/i, /\bCA\b/i, /CPA/i, /crani[oe]/i,
	/Cushing/i, /cyst\b/i,
	/DNET/i, /GBM/i, /lesion/i, /mass/i, /metas/i, /\bNFP?A\b/i,
	/\bPA\b/i, /pituitary apoplexy/i, /tumou?r/i
],
BRAINVASCULARDX = [
	/aneurysm/i, /AVM/i, /AVF/i, /basal ganglion|\bbg|cerebellar hemorrhage/i,
	/cavernoma/i, /emboli/i, /ha?ematoma/i, /ha?emorrh/i, /HT?ICH/i,
	/\bICH\b/i, /infarct/i, /ischemi/i, /(\bICA\b|MCA|VBA).*stenosis/i,
	/\bM1\b|\bM2\b|MCA/i, /moya moya/i, /\bSAH\b/i, /stroke/i,
],
CSFDX = [
	/\bHCP\b/i, /hydrocephalus/i, /\bNPH\b/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,
	/shunt obstruct/i, /shunt malfunction/i
],
TRAUMADX = [
	/accident/i, /assault/i, /concussion/i, /contusion/i, /\bEDH\b/i,
	/fall/i, /Fx|fracture/i, /injury/i, /lacerat/i,
	/\bSDH\b/i, /subdural ha?ematoma/i, /trauma/i
],
SPINEDX = [
	/cervical/i, /cord/i, /\bCSM\b/i, /^((?!mri|mri|MRI?).)*[CTLS] ?[\d]/,
	/degenerat/i, /dislocat/i,
	/HNP/i, /lamin[eo]/i, /listhesis/i, /lumb[ao]/i,/lesion/i,
	/mass/i, /metas/i,  /myel/i,
	/odontoid/i, /sacr[ao]/i, /scoliosis/i, /spin[aeo]/i, /spondylo/i, /thora/i
],
ETCDX = [
	/abscess/i, /chiari/i, /convulsi/i, /\bCTS\b/i, /cubital/i,
	/dysplasia/i, /epilepsy/i, /hemifacial/i,
	/\bMTS\b/i, /ocele/i, /parkinson/i,
	/skull defect/i, /sclerosis/i, /seizure/i, /sural/i,
	/\bTG?N\b/i, /trigemin/i, /tunnel/i
],

BRAINTUMORDXNO = [
	/aneurysm/i, /AVM/i, /AVF/i, /basal ganglion|\bbg|cerebellar hemorrhage/i,
	/cavernoma/i, /emboli/i, /ha?ematoma/i, /HT?ICH/i,
	/\bICH\b/i, /infarct/i, /ischemi/i, /(ICA|MCA|VBA).*stenosis/i,
	/M1|M2|MCA occlusion/i, /moya moya/i, /\bSAH\b/i, /stroke/i,

	/\bHCP\b/i, /hydrocephalus/i, /\bNPH\b/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,
	/shunt obstruct/i, /shunt malfunction/i,

	/assault/i, /\bEDH\b/i, /contusion/i, /injury/i,
	/Fx|fracture/i, /lacerat/i,
	/\bC?SDH\b/i, /trauma/i,

	/cervical/i, /cord/i, /\bCSM\b/i, /^((?!mri|mri|MRI?).)*[CTLS] ?[\d]/,
	/dislocat/i, /neck/i,
	/HNP/i, /lamin[eo]/i, /listhesis/i, /lumb[ao]/i, /myel/i,
	/odontoid/i, /sacr[ao]/i, /scoliosis/i, /spin[aeo]/i, /spondylo/i, /thora/i,

	/abscess/i, /chiari/i, /\bCTS\b/i, /cubital/i,
	/dysplasia/i, /hemifacial/i,
	/\bMTS\b/i, /ocele/i, /parkinson/i,
	/skull defect/i, /sclerosis/i, /sural/i,
	/tunnel/i
],
BRAINVASCULARDXNO = [
	/^((?!cavernoma|hematoma|osteo|zyg).)*oma/i, /\bCA\b/i, /CPA/i, /Cushing/i, /cyst\b/i,
	/DNET/i, /GBM/i, /mass/i, /metas/i, /\bNFP?A\b/i,
	/pituitary apoplexy/i, /tumou?r/i,

	/\bHCP\b/i, /hydrocephalus/i, /\bNPH\b/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,
	/shunt obstruct/i, /shunt malfunction/i,

	/assault/i, /\bEDH\b/i, /contusion/i, /injury/i,
	/Fx|fracture/i, /lacerat/i,
	/\bC?SDH\b/i, /subdural ha?ematoma/i, /trauma/i,

	/cervical/i, /cord/i, /\bCSM\b/i, /^((?!mri|mri|MRI?).)*[CTLS] ?[\d]/,
	/degenerat/i, /dislocat/i,
	/HNP/i, /lamin[eo]/i, /listhesis/i, /lumb[ao]/i, /myel/i,
	/odontoid/i, /sacr[ao]/i, /scoliosis/i, /spin[aeo]/i, /spondylo/i, /thora/i,

	/abscess/i, /chiari/i, /convulsi/i, /\bCTS\b/i, /cubital/i,
	/dysplasia/i, /epilepsy/i, /hemifacial/i,
	/\bMTS\b/i, /ocele/i, /parkinson/i,
	/skull defect/i, /sclerosis/i, /seizure/i, /sural/i,
	/\bTG?N\b/i, /trigemin/i, /tunnel/i
],
CSFDXNO = [
	/cavernoma/i, /emboli/i, /ha?emorrh/i, /HT?ICH/i,
	/\bICH\b/i, /infarct/i, /ischemi/i, /(ICA|MCA|VBA).*stenosis/i,
	/M1|M2|MCA occlusion/i, /moya moya/i, /\bSAH\b/i, /stroke/i,

	/assault/i, /\bEDH\b/i, /contusion/i, /injury/i,
	/Fx|fracture/i, /lacerat/i, /trauma/i,

	/cord/i, /\bCSM\b/i,
	/degenerat/i, /dislocat/i,
	/HNP/i, /listhesis/i,
	/odontoid/i, /sacr[ao]/i, /scoliosis/i, /spin[aeo]/i, /spondylo/i,

	/abscess/i, /\bCTS\b/i, /cubital/i,
	/dysplasia/i, /hemifacial/i,
	/\bMTS\b/i,
	/sclerosis/i, /sural/i,
	/\bTG?N\b/i, /tunnel/i
],
TRAUMADXNO = [
	/^((?!cavernoma|hematoma|osteoma|zygoma).)*oma/i, /\bCA\b/i,
	/CPA/i, /Cushing/i, /cyst\b/i,
	/DNET/i, /GBM/i, /mass/i, /metas/i, /\bNFP?A\b/i,
	/\bPA\b/i, /pituitary apoplexy/i, /tumou?r/i,

	/^((?!pseudo?).)*aneurysm/i, /AVM/i, /AVF/i,
	/basal ganglion|\bbg|cerebellar hemorrhage/i,
	/cavernoma/i, /emboli/i, /ha?emorrh/i, /HT?ICH/i,
	/\bICH\b/i, /infarct/i, /ischemi/i, /(ICA|MCA|VBA).*stenosis/i,
	/M1|M2|MCA occlusion/i, /moya moya/i, /\bSAH\b/i, /stroke/i,

	/\bHCP\b/i, /hydrocephalus/i, /\bNPH\b/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,
	/shunt obstruct/i, /shunt malfunction/i,

	/\bCSM\b/i,
	/degenerat/i, /dislocat/i,
	/HNP/i, /myel/i,
	/odontoid/i, /scoliosis/i,

	/abscess/i, /chiari/i, /\bCTS\b/i, /cubital/i,
	/dysplasia/i, /hemifacial/i,
	/\bMTS\b/i, /ocele/i, /sural/i,
	/\bTG?N\b/i, /trigemin/i, /tunnel/i
],
SPINEDXNO = [
	/CPA/i, /crani[oe]/i, /Cushing/i,
	/GBM/i, /\bNFP?A\b/i,
	/\bPA\b/i, /pituitary apoplexy/i,

	/basal ganglion|\bbg|cerebellar hemorrhage/i, /HT?ICH/i,
	/\bICH\b/i, /infarct/i, /ischemi/i, /(ICA|MCA|VBA).*stenosis/i,
	/M1|M2|MCA occlusion/i, /moya moya/i, /\bSAH\b/i, /stroke/i,

	/\bHCP\b/i, /hydrocephalus/i, /\bNPH\b/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,
	/shunt obstruct/i, /shunt malfunction/i,

	/\bCTS\b/i, /cubital/i,
	/hemifacial/i,
	/\bMTS\b/i, /sural/i,
	/\bTG?N\b/i, /trigemin/i
],
ETCDXNO = [
	/DNET/i, /GBM/i, /mass/i, /metas/i, /\bNFP?A\b/i,
	/\bPA\b/i, /pituitary apoplexy/i, /tumou?r/i,

	/\bHCP\b/i, /hydrocephalus/i, /\bNPH\b/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,
	/shunt obstruct/i, /shunt malfunction/i,

	/assault/i, /\bEDH\b/i, /contusion/i, /injury/i,

	/HNP/i, /lamin[eo]/i, /listhesis/i, /lumb[ao]/i, /myel/i,
	/odontoid/i, /sacr[ao]/i, /scoliosis/i, /spin[aeo]/i, /spondylo/i, /thora/i
],

BRAINTUMORRX = [
	/approa/i, /biopsy/i, /\bbx\b/i, /crani[oe]c?tomy/i, /\bETS\b/i, /trans.*remov/i,
	/TSP/i, /TSS/i, /transnasal/i, /transsphenoid/i, /transventric/i, /tumou?r/i
],
BRAINVASCULARRX = [
	/anast/i, /bypass/i, /(clot|hematoma).*(remov|irrigat|evacuat)/i,
	/clamp/i, /clip/i, /crani[oe]c?tomy/i,
	/EDAS/i, /EDAMS/i, /excision.*AVM|AVM.*excision/i,
	/occlu/i, /thromb.*ectomy/i
],
CSFRX = [
	/ETV/i, /EVD/i, /lumbar drain/i, /OMMAYA/i,
	/Pudenz/i, /pressure.*valve/i, /Programmable/i,
	/(\bV\-?P|\bL\-?P|periton|subgaleal).*shunt/i,
],
TRAUMARX = [
	/debridement/i, /(clot|hematoma).*(remov|irrigat|evacuat)/i, /trauma/i
],
SPINERX = [
	/ACDF/i, /ALIF/i, /biopsy/i, /\bbx\b/i, /cervical/i, /^((?!mri|MRI?).)*[CTLS][\d]/,
	/corpectomy/i, /decompress/i, /Discectomy/i,
	/\bESI\b/i, /fixation/i, /foraminotomy/i, /\bfusion/i, /kyphoplasty/i,
	/lamin[eo]/i, /MIDLIF/i, /OLIF/i, 
	/PDS/i, /PLF/i, /PLIF/i, /remov/i, /sacr[ao]/i, /screw/i, /SNRB/i,
	/thora/i, /TLIF/i, /transoral/i, /transforam/i, /tumou?r/i,
	/vertebr/i, /untether/i
],
SPINEOP = [
	/ACDF/i, /ALIF/i, /biopsy/i, /\bbx\b/i, /block/i,
	/corpectomy/i, /decompress/i, /Discectomy/i, /disc.*fx/i, /ectomy/,
	/\bESI\b/i, /fixation/i, /foraminotomy/i, /\bfusion/i, /kyphoplasty/i,
	/lamin[eo]/i, /MIDLIF/i, /OLIF/i, 
	/PDS/i, /PLF/i, /PLIF/i, /remov/i, /sacr[ao]/i, /screw/i, /SNRB/i,
	/TLIF/i, /transoral/i, /transforam/i,
	/vertebr(oplasty|ectomy)\b/i, /untether/i
],
ETCRX = [
	/anast/i, /aspirat/i, /advance/i,
	/biop/i, /block/i, /burr/i, /\bbx\b/i, /balloon/i, /cranioplasty/i,
	/battery/i, /DBS/i, /grid/i, /MVD/i,
	/decom/i, /DBS/i, /drain/i, /disconnect/i,
	/ECOG/i, /ectom/i, /endoscop/i, /\bESI\b/i, /excis/i,
	/grid/i, /insert/i,
	/lesion/i, /lysis/i, /lesionectomy/i, /lobectomy/i,
	/neurot/i, /Navigator/i,
	/occlu/i, /operat/i, /ostom/i, /plast/i, 
	/rhizotomy/i,
	/recons/i, /redo/i, /remov/i, /repa/i, /revis/i, /\bRF/i, /robot/i,
	/scope/i, /stim/i, /suture/i,
	/tracheos/i, /VNS/i
],

BRAINTUMORRXNO = [
	/(clot|hematoma).*(remov|irrigat|evacuat)/i,
	/clip/i, /EDAS/i, /EDAMS/i, /excision.*AVM|AVM.*excision/i,

	/ETV/i,

	/trauma/i,
	
	/ACDF/i, /ALIF/i,
	/cervical/i, /corpectomy/i, /discectomy/i, /disc.*fx/i,
	/\bfusion/i, /kyphoplasty/i,
	/lamin[eo]/i, /lumbar/i, /MIDLIF/i, /OLIF/i, 
	/PDS/i, /PLF/i, /PLIF/i, /sacr[ao]/i, /screw/i, /SNRB/i,
	/thora/i, /TLIF/i,
	/vertebr(oplasty|ectomy)\b/i, /untether/i,

	/battery/i, /DBS/i, /decompressive.*craniectomy/i,
	/grid/i, /irrigate/i, /lesionectomy/i, /MVD/i,
	/untether/i, /VNS/i
],
BRAINVASCULARRXNO = [
	/biopsy/i, /\bbx\b/i, /tumou?r/i,
	/TSP/i, /TSS/i, /transnasal/i, /transsphenoid/i, /transventric/i,

	/ETV/i, /OMMAYA/i,

	/trauma/i,

	/ACDF/i, /ALIF/i,
	/corpectomy/i, /discectomy/i, /disc.*fx/i,
	/\bfusion/i, /kyphoplasty/i,
	/lamin[eo]/i, /MIDLIF/i, /OLIF/i, 
	/PDS/i, /PLF/i, /PLIF/i, /sacr[ao]/i, /screw/i, /SNRB/i,
	/thora/i, /TLIF/i,
	/vertebr(oplasty|ectomy)\b/i, /untether/i,

	/battery/i, /DBS/i,
	/grid/i, /irrigate/i, /MVD/i,
	/untether/i, /VNS/i
],
CSFRXNO = [
	/biopsy/i, /\bbx\b/i, /tumou?r.*remov/i,
	/TSP/i, /TSS/i, /transnasal/i, /transsphenoid/i, /transventric/i,

	/(clot|hematoma).*(remov|irrigat|evacuat)/i,
	/clip/i, /EDAS/i, /EDAMS/i, /excision.*AVM|AVM.*excision/i,

	/trauma/i,

	/ACDF/i, /ALIF/i, /MIDLIF/i, /OLIF/i, 
	/PLF/i, /PLIF/i, /SNRB/i, /TLIF/i,

	/battery/i, /DBS/i, /decompressive.*craniectomy/i, 
	/grid/i, /irrigate/i, /lobectomy/i, /MVD/i,
	/untether/i, /VNS/i
],
TRAUMARXNO = [
	/biopsy/i, /\bbx\b/i, /tumou?r/i,
	/TSP/i, /TSS/i, /transnasal/i, /transsphenoid/i, /transventric/i,

	/EDAS/i, /EDAMS/i, /excision.*AVM|AVM.*excision/i,

	/ETV/i, /OMMAYA/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,

	/ACDF/i, /ALIF/i,
	/lumbar drain/i, /MIDLIF/i, /OLIF/i, 
	/PLF/i, /PLIF/i, /SNRB/i,
	/TLIF/i,

	/battery/i, /DBS/i, /grid/i, /MVD/i,
	/untether/i, /VNS/i
],
SPINERXNO = [
	/crani[oe]/i, /\bETS\b/i,
	/TSP/i, /TSS/i, /transnasal/i, /transsphenoid/i, /transventric/i,

	/EDAS/i, /EDAMS/i,

	/ETV/i, /EVD/i, /OMMAYA/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,
	/lumbar drain/i,

	/battery/i, /DBS/i, /decompressive.*craniectomy/i, 
	/grid/i, /MVD/i, /cranioplasty/i,
	/VNS/i
],
ETCRXNO = [
	/tumou?r.*(biopsy|\bbx\b|remov)/i, /craniot.*tumou?r|clot remov/i,
	/TSP/i, /TSS/i, /transnasal/i, /transsphenoid/i, /transventric/i,

	/clip/i, /EDAS/i, /EDAMS/i, /excision.*AVM|AVM.*excision/i,

	/trauma/i,

	/ETV/i, /OMMAYA/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,

	/ACDF/i, /ALIF/i, /^((?!mri|mri|mri|MRI?).)*[CTLS][\d]/,
	/lamin[eo]/i, /lumbar drain/i, /MIDLIF/i, /OLIF/i, 
	/PLF/i, /PLIF/i, /sacr[ao]/i, /SNRB/i,
	/thora/i, /TLIF/i
],

NOOPERATION = [
	/adjust.*pressure/i, /advice.*surg[ery|ical]/i, /conservative/i, /observe/i, /\boff OR/
],
RADIOSURGERY = [
	/conformal radiotherapy/i, /CRT/i, /Cyber ?Knife/i,
	/Gamma knife/i, /GKS/i, /Linac/i,
	/radiosurgery/i, /\bRS\b/i,
	/\bSRS\b/i, /\bSRT\b/i, /stereotactic radiotherapy/i,
	/Tomotherapy/i
],
ENDOVASCULAR = [
	/\bcoil/i, /emboli[zs]/i, /\bendovasc/i, /\bintervention/i,
	/\bstent/i, /\btransart/i, /\btransvenous/i
]