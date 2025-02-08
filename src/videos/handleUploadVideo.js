import { responseError, responseFailed, responseSuccess } from "@/response"

export async function handleUploadVideo(request, storage, env, corsHeaders) {
	try {
		if (env.PUBLIC_R2_URL === undefined) {
			return responseFailed(null, "No public url found", 404, corsHeaders)
		}
		const formData = await request.formData()
		const systemname = formData.get("systemname")
		const fileName = formData.get("fileName")
		// console.log("formData", formData)

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

		const uniqueKey = `videos/original/${systemname}/${Date.now()}-${fileName}`
		// const rsupload = await storage.put(uniqueKey, file.stream())
		const arrayBuffer = await file.arrayBuffer()

		const inputcode = fileName.replace(/\.[^.]+$/, "")
		const rsupload = await storage.put(uniqueKey, arrayBuffer, {
			httpMetadata: { contentType: file.type || "video/mp4" },
		})

		if (rsupload) {
			return responseSuccess(
				{ path: uniqueKey, inputcode: inputcode, url: `${env.PUBLIC_R2_URL}/${uniqueKey}` },
				`Upload ${fileName} video success`,
				corsHeaders
			)
		}

		console.log("Error", uploadResult)
		return responseFailed(uploadResult, `Upload ${file.name} npy failed.`, 400, corsHeaders)
	} catch (err) {
		const errorMessage = err.message || "An unknown error occurred"
		console.log("Exception", err)
		return responseError(err, errorMessage, 401, corsHeaders)
	}
}
