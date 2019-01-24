
// const
export const MYSQLIPHP	= "php/mysqli.php"

export async function postData(url = ``, data) {
    const response = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
		body: data
    })
    const text = await response.text()
    try {
        const result = JSON.parse(text)
        return result
    } catch(e) {
        return text
    }
}
