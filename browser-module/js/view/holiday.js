
import { HOLIDAY } from "../util/variables.js"

export function holiday(date)
{
	// Buddhist holiday and compensation for religious day on weekend
	let Buddhist = HOLIDAY.find(day => day.holidate === date)
	if (Buddhist) {
		return `url('css/pic/holiday/${Buddhist.dayname}.png')`
	}

	let monthdate = date.substring(5),
		dayofweek = (new Date(date)).getDay(),
		Mon = dayofweek === 1,
		Tue = dayofweek === 2,
		Wed = dayofweek === 3,

	// Thai official holiday & Compensation
	Thai = {
		"12-31": "Yearend",
		"01-01": "Newyear",
		"01-02": (Mon || Tue) && "Yearendsub",
		"01-03": (Mon || Tue) && "Newyearsub",
		"04-06": "Chakri",
		"04-07": Mon && "Chakrisub",
		"04-08": Mon && "Chakrisub",
		"04-13": "Songkran",
		"04-14": "Songkran",
		"04-15": "Songkran",
		"04-16": (Mon || Tue || Wed) && "Songkransub",
		"04-17": (Mon || Tue || Wed) && "Songkransub",
		"07-28": "King10",
		"07-29": Mon && "King10sub",
		"07-30": Mon && "King10sub",
		"08-12": "Queen",
		"08-13": Mon && "Queensub",
		"08-14": Mon && "Queensub",
		"10-13": "King09",
		"10-14": Mon && "King09sub",
		"10-15": Mon && "King09sub",
		"10-23": "Piya",
		"10-24": Mon && "Piyasub",
		"10-25": Mon && "Piyasub",
		"12-05": "King9",
		"12-06": Mon && "King9sub",
		"12-07": Mon && "King9sub",
		"12-10": "Constitution",
		"12-11": Mon && "Constitutionsub",
		"12-12": Mon && "Constitutionsub"
	},
	govHoliday = Thai[monthdate]

	return govHoliday && `url('css/pic/holiday/${govHoliday}.png')`
}
