//Actually these are constants but older browsers do not support const
var GETIPD		= "php/getipd.php";
var GETNAMEHN	= "php/getnamehn.php";
var MYSQLIPHP	= "php/mysqli.php";

//tbl, queuetbl
var OPDATE		= 0;
var ROOM		= 1;
var CASENUM		= 2;
var STAFFNAME	= 3;
var HN			= 4;
var NAME		= 5;
var DIAGNOSIS	= 6;
var TREATMENT	= 7;
var CONTACT		= 8;
var QN			= 9;

//servicetbl
var CASENUMSV	= 0;
var HNSV		= 1;
var NAMESV		= 2;
var DIAGNOSISSV	= 3;
var TREATMENTSV	= 4;
var ADMISSIONSV	= 5;
var FINALSV		= 6;
var ADMITSV		= 7;
var OPDATESV	= 8;
var DISCHARGESV	= 9;
var QNSV		= 10;

var ROWREPORT = {
	"Brain Tumor": 3,
	"Brain Vascular": 4,
	"CSF related": 5,
	"Trauma": 6,
	"Spine": 7,
	"etc": 8,
	"Radiosurgery": 10,
	"Endovascular": 11,
	"Conservative": 12
}
var COLUMNREPORT = {
	"Staff": 1,
	"Resident": 5,
	"Major": 0,
	"Minor": 2,
	"Elective": 0,
	"Emergency": 1
}

// NAMEOFDAYABBR for row color
// NAMEOFDAYFULL for 1st column color
var NAMEOFDAYABBR	= ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
var NAMEOFDAYFULL	= ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
var THAIMONTH		= ["มค.", "กพ.", "มีค.", "เมย.", "พค.", "มิย.", "กค.", "สค.", "กย.", "ตค.", "พย.", "ธค."];
var LARGESTDATE		= "9999-12-31";

var	BRAINDX = [
	/[Bb]rain/, /[Cc]avernous/, /[Cc]erebell/, /[Cc]ranio/, /CNS/,
	/[Cc]onvexity/, /CPA?/, /[Cc]liv[aou]/,
	/[Ff]acial/, /[Ff]ront/, /[Ff]al[cx]/, /\bF-?P\b/, /[Jj]ugular/, /mass/,
	/planum/, /[Pp]itui/, /[Pp]etro/, 
	/[Oo]ccipit/, /sella/, /[Ss]phenoid/, /[Ss]agittal/, /SSS/,
	/[Tt]empor/, /[Tt]entori/, /[Tt]halam/, /[Tt]onsil/, /[Tt]uberculum/,
	/[Vv]estibul/
]
var	TUMORDX = [
	/^((?!cavernoma).)*oma$/, /\bCA\b/, /CPA/, /Cushing/, /[Cc]yst/,
	/DNET/, /GBM/, /[Mm]ass/, /[Mm]etas/, /\bNFP?A\b/,
	/\bPA\b/, /[Pp]ituitary apoplexy/,
	/[Tt]umou?r/
]
var	VASCULARDX = [
	/[Aa]neurysm/, /AVM/, /AVF/, /[Cc]avernoma/,
	/[Ee]mboli/, /[Hh]a?emorrh/,
	/ICH/, /[Ii]nfarct/, /ICA|MCA|VBA.*stenosis/,
	/M1|M2|MCA occlusion/, /[Mm]oya [Mm]oya/,
	/SAH/
]
var	CSFDX = [
	/HCP/, /[Hh]ydrocephalus/, /\bNPH\b/,
	/[Ss]hunt [Oo]bstruct/, /[Ss]hunt [Mm]alfunction/
]
var	TRAUMADX = [
	/[Aa]ssult/, /EDH/, /[Cc]ontusion/, /[Ii]njury/,
	/Fx|[Ff]racture/, /[Ll]acerat/,
	/SDH/, /[Ss]ubdural [Hh]a?ematoma/, /[Tt]rauma/
]
var	SPINEDX = [
	/[Cc]ervical/, /\bCSM\b/, /\b[CTLS] ?[\d]/, /HNP/, /[Ll]umb[ao]/, /myel/,
	/[Ss]acr[ao]/, /scoliosis/, /[Ss]pin/, /[Ss]pondylo/, /[Tt]hora/
]
var	ETCDX = [
	/[Aa]bscess/, /[Cc]hiari/, /[Cc]onvulsi/, /\bCTS\b/, /cubital/,
	/[Dd]ecompress/, /[Dd]ysplasia/,
	/[Ee]pilepsy/, /[Hh]emifacial/,
	/MTS/, /ocele/, /[Pp]arkinson/,
	/[Ss]kull [Dd]efect/, /[Ss]clerosis/, /[Ss]eizure/, /[Ss]ural/,
	/TG?N/, /[Tt]rigemin/, /[Tt]unnel/
]

var	TUMORRX = [
	/crani[oe].*tumou?r/i, /crani[oe].*biopsy/i,
	/petro/i, /TSS/,
	/tumou?r biopsy|biopsy.*tumou?r/i,
	/tumou?r remov/i
]
var	VASCULARRX = [
	/bypass/i, /clip/i, /excision.*AVM|AVM.*excision/i
]
var	CSFRX = [
	/EVD/, /lumbar drain/i, /OMMAYA/i,
	/tap test/i, /VP|LP|periton.*shunt/i
]
var	TRAUMARX = [
	/debridement/i, /(clot|hematoma).*(removal|irrigation|evacuation)/i
]
var	SPINERX = [
	/cervical/i, /\b[CTLS][\d]/i, /lamin[eo]/i,
	/sacr[ao]/i, /thora/i
]
var ETCRX = [
	/change battery/i, /cranioplast/i, /DBS/, /grid/i, /MVD/,
	/lesionectomy/i, /lobectomy/i, /rhizotomy/i,
	/tracheos/i, /VNS/
]

var	OPERATION = [
	/ACDF/i, /ALIF/i, /anast/i, /approa/i, /aspirat/i, /advance/i,
	/biop/i, /block/i, /burr/i, /bx/i, /bypass/i, /balloon/i,
	/clip/i, 
	/decom/i, /DBS/, /drain/i, /disconnect/i,
	/ECOG/i, /ectom/i, /endoscop/i, /ESI/, /ETS/, /ETV/, /EVD/, /excis/i,
	/fix/i, /fusion/i,
	/grid/i,
	/insert/i,
	/lesion/i, /lysis/i, 
	/MIDLIF/i, /MVD/,
	/neurot/i, /Navigator/i,
	/OLIF/i, /occlu/i, /operat/i, /ostom/i, /otom/i,
	/plast/i, /PLF/i, /PLIF/i,
	/recons/i, /redo/i, /remov/i, /repa/i, /revis/i, /robot/i,
	/scope/i, /screw/i, /shunt/i, /stim/i, /SNRB/i, /suture/i,
	/TSP/i, /TSS/i, /TLIF/i, /[Tt]ranforam/i, /[Tt]ransnasal/i,
	/transoral/i, /transphenoid/i, /transtent/i,
	/untether/i,
	/VNS/i
]
var	NOTOPERATION = [
	/adjust/i, /conservative/i, /observe/i
]
var	RADIOSURGERY = [
	/conformal radiotherapy/i, /CRT/, /CyberKnife/i,
	/Gamma knife/i, /GKS/, /Linac/i,
	/radiosurgery/i, /RS/,
	/SRS/, /SRT/, /stereotactic radiotherapy/i,
	/Tomotherapy/i
]
var	ENDOVASCULAR = [
	/balloon/i, /coil/i, /emboli[zs]/i, /endovasc/i, /intervention/i,
	/stent/i, /transart/i, /transvenous/i
]

//====================================================================================================

var gv = {
	BOOK: [],
	CONSULT: [],
	SERVICE: [],
	SERVE: [],
	STAFF: [],
	user: "",
	timestamp: "",
	uploadWindow: null,
	timer: {},
	idleCounter: 0,
	mobile: false,
	isPACS: true
}

if (/Android|webOS|iPhone|iPad|BlackBerry|IEMobile/i.test(navigator.userAgent)) {
	gv.mobile = true
	gv.isPACS = false
}
