
import { pagination } from "./pagination.js"

// Make paginated dialog box containing alltbl
export function viewAllCases(response) {
    pagination($("#dialogAll"), $("#alltbl"), response, "All Saved Cases")
}
