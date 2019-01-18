
import { pagination } from "./pagination.js"

// Make paginated dialog box containing alltbl
export function viewCaseAll(response) {
    pagination($("#dialogAll"), $("#alltbl"), response, "All Saved Cases")
}
