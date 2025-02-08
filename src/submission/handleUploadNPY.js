import { responseError } from "@/response.js"

export async function handleUploadNPY(request, storage, corsHeaders) {
	try {
		const formData = await request.formData()
		const username = formData.get("username")
		const fileName = formData.get("fileName")
		const file = formData.get("file")

		if (!file || !(file instanceof Blob)) {
			return responseFailed(null, "File upload not found", 404, corsHeaders)
		}

		const contentType = request.headers.get("content-type") || ""
		if (!contentType.includes("multipart/form-data")) {
			return new Response("Invalid content type. Expecting multipart form data.", { status: 400 })
		}

		const uniqueKey = `motions/${username}/${fileName}`
		const arrayBuffer = await file.arrayBuffer()
		storage.put(uniqueKey, arrayBuffer, {
			httpMetadata: { contentType: file.type || "video/mp4" },
		})

		return responseSuccess({ path: uniqueKey }, `Upload ${fileName} video success`, corsHeaders)
	} catch (err) {
		const errorMessage = err.message || "An unknown error occurred"
		console.log("Exception", err)
		return responseError(err, errorMessage, 401, corsHeaders)
	}
}
