import { responseError, responseFailed, responseSuccess } from "@/response"

export async function handleUploadVideo(request, storage, corsHeaders) {
	try {
		const formData = await request.formData()
		const systemname = formData.get("systemname")
		const fileName = formData.get("fileName")
		console.log("formData", formData)

		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		const file = formData.get("file")

		if (!file || !(file instanceof Blob)) {
			return responseFailed(null, "File upload not found", 404, corsHeaders)
		}

		if (file.type !== "video/mp4") {
			return responseFailed(null, "Only support mp4 video.", 400, corsHeaders)
		}

		const contentType = request.headers.get("content-type") || ""
		if (!contentType.includes("multipart/form-data")) {
			return new Response("Invalid content type. Expecting multipart form data.", { status: 400 })
		}

		const uniqueKey = `videos/original/${systemname}/${fileName}`
		// const rsupload = await storage.put(uniqueKey, file.stream())
		const arrayBuffer = await file.arrayBuffer()

		const inputcode = fileName.replace(/\.[^.]+$/, "")
		storage.put(uniqueKey, arrayBuffer, {
			httpMetadata: { contentType: file.type || "video/mp4" },
		})

		return responseSuccess(
			{ path: uniqueKey, inputcode: inputcode, url: rsupload.Location },
			`Upload ${fileName} video success`,
			corsHeaders
		)
	} catch (err) {
		const errorMessage = err.message || "An unknown error occurred"
		console.log("Exception", err)
		return responseError(err, errorMessage, 401, corsHeaders)
	}
}
