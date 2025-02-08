import { responseError, responseFailed, responseSuccess } from "@/response.js"

export async function handleUploadNPY(request, storage, corsHeaders) {
	try {
		const formData = await request.formData()
		const username = formData.get("username")
		const file = formData.get("file")
		console.log("formData", formData)

		if (!file || !(file instanceof Blob)) {
			return responseFailed(null, "File upload not found", 404, corsHeaders)
		}

		const contentType = request.headers.get("content-type") || ""
		if (!contentType.includes("multipart/form-data")) {
			return responseFailed(null, "Invalid content type. Expecting multipart form data.", 400, corsHeaders)
		}

		console.log("contentType", contentType)

		const uniqueKey = `motions/${username}/${Date.now()}-${file.name}`
		console.log("uniqueKey", uniqueKey)
		const arrayBuffer = await file.arrayBuffer()
		const uint8Array = new Uint8Array(arrayBuffer)
		const uploadResult = await storage.put(uniqueKey, uint8Array, {
			httpMetadata: { contentType: file.type },
		})
		console.log("file.type", file.type, file.size)
		if (uploadResult) {
			return responseSuccess({ path: uniqueKey, res: uploadResult }, `Upload ${file.name} npy success`, corsHeaders)
		}

		console.log("Error", )
		return responseFailed(uploadResult, `Upload ${file.name} npy failed.`, 400, corsHeaders)
	} catch (err) {
		const errorMessage = err.message || "An unknown error occurred"
		console.log("Exception", err)
		return responseError(err, errorMessage, 401, corsHeaders)
	}
}
