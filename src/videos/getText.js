import { responseError, responseFailed, responseSuccess } from "@/response"

// Returns the text content of a single R2 object (used for the .txt descriptions
// that accompany Seamless Semantic Mismatch videos). Restricted to .txt keys so
// it can't be used to read arbitrary blobs.
export async function getText(request, storage, corsHeaders) {
	try {
		const url = new URL(request.url)
		const key = url.searchParams.get("key") || ""

		if (!key || !key.endsWith(".txt")) {
			return responseFailed(null, "A .txt key is required", 400, corsHeaders)
		}

		const object = await storage.get(key)
		if (!object) {
			return responseFailed(null, `No file found for key: ${key}`, 404, corsHeaders)
		}

		const text = await object.text()
		return responseSuccess({ key, text }, "Fetch text success", corsHeaders)
	} catch (err) {
		const errorMessage = err.message || "An unknown error occurred"
		console.log("[getText] Exception", err)
		return responseError(err, errorMessage, 500, corsHeaders)
	}
}
