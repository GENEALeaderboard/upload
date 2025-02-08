import { responseError, responseFailed, responseSuccess } from "@/response.js"

export async function handleUploadNPY(request, storage, env, corsHeaders) {
	try {
		const formData = await request.formData()
		const username = formData.get("username")
		const file = formData.get("file")
		// console.log("formData", formData)

		if (!file || !(file instanceof Blob)) {
			return responseFailed(null, "File upload not found", 404, corsHeaders)
		}

		const contentType = request.headers.get("content-type") || ""
		if (!contentType.includes("multipart/form-data")) {
			return responseFailed(null, "Invalid content type. Expecting multipart form data.", 400, corsHeaders)
		}

		const uniqueKey = `motions/${username}/${file.name}`
		const arrayBuffer = await file.arrayBuffer()
		const uint8Array = new Uint8Array(arrayBuffer)
		const uploadResult = await storage.put(uniqueKey, uint8Array, {
			httpMetadata: { contentType: file.type },
		})
		if (uploadResult) {
			return responseSuccess({ path: uniqueKey, uploadResult }, `Upload ${file.name} npy success`, corsHeaders)
		}

		console.log("Error", uploadResult)
		return responseFailed(uploadResult, `Upload ${file.name} npy failed.`, 400, corsHeaders)
	} catch (err) {
		const errorMessage = err.message || "An unknown error occurred"
		console.log("Exception", err)
		return responseError(err, errorMessage, 401, corsHeaders)
	}
}
