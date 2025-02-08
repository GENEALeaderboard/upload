import { responseError, responseFailed, responseSuccess } from "../response"

export async function uploadVideo(request, storage, corsHeaders) {
	try {
		const response = await storage.prepare("SELECT * FROM videos").all()

		if (!response.results) {
			return responseFailed(null, "No videos found", 404, corsHeaders)
		}

		return responseSuccess(response.results, "Fetch videos success", corsHeaders)
	} catch (err) {
		const errorMessage = err.message || "An unknown error occurred"
		console.log("Exception", err)
		return responseError(err, errorMessage, 401, corsHeaders)
	}
}
