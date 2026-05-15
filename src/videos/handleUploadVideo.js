import { responseError, responseFailed, responseSuccess } from "@/response"

export async function handleUploadVideo(request, storage, env, corsHeaders) {
	const t0 = Date.now()
	console.log("[uploadVideo] start", { url: request.url, method: request.method })
	try {
		if (env.PUBLIC_R2_URL === undefined) {
			console.log("[uploadVideo] missing PUBLIC_R2_URL env")
			return responseFailed(null, "No public url found", 404, corsHeaders)
		}
		const formData = await request.formData()
		const systemname = formData.get("systemname")
		const fileName = formData.get("fileName")
		const videoType = formData.get("videoType") || "origin"
		console.log("[uploadVideo] formData parsed", { systemname, fileName, videoType })

		const file = formData.get("file")

		if (!file || !(file instanceof Blob)) {
			console.log("[uploadVideo] file missing or not a Blob", { hasFile: !!file, isBlob: file instanceof Blob })
			return responseFailed(null, "File upload not found", 404, corsHeaders)
		}
		console.log("[uploadVideo] file received", { size: file.size, type: file.type, name: file.name })

		if (file.type !== "video/mp4") {
			console.log("[uploadVideo] rejected non-mp4 file", { type: file.type })
			return responseFailed(null, "Only support mp4 video.", 400, corsHeaders)
		}

		const contentType = request.headers.get("content-type") || ""
		if (!contentType.includes("multipart/form-data")) {
			console.log("[uploadVideo] invalid content-type", { contentType })
			return new Response("Invalid content type. Expecting multipart form data.", { status: 400 })
		}

		const keyPrefix = videoType === "origin" ? "videos/original" : `videos/${videoType}`
		const uniqueKey = `${keyPrefix}/${systemname}/${Date.now()}-${fileName}`
		console.log("[uploadVideo] computed key", { uniqueKey })

		const bufStart = Date.now()
		const arrayBuffer = await file.arrayBuffer()
		console.log("[uploadVideo] arrayBuffer ready", { bytes: arrayBuffer.byteLength, ms: Date.now() - bufStart })

		const inputcode = fileName.replace(/\.[^.]+$/, "")
		const putStart = Date.now()
		const rsupload = await storage.put(uniqueKey, arrayBuffer, {
			httpMetadata: { contentType: file.type || "video/mp4" },
		})
		console.log("[uploadVideo] r2.put done", { ok: !!rsupload, ms: Date.now() - putStart })

		if (rsupload) {
			console.log("[uploadVideo] success", { uniqueKey, totalMs: Date.now() - t0 })
			return responseSuccess(
				{ path: uniqueKey, inputcode: inputcode, url: `${env.PUBLIC_R2_URL}/${uniqueKey}` },
				`Upload ${fileName} video success`,
				corsHeaders
			)
		}

		console.log("[uploadVideo] r2.put returned falsy", { rsupload })
		return responseFailed(rsupload, `Upload ${file.name} failed.`, 400, corsHeaders)
	} catch (err) {
		const errorMessage = err.message || "An unknown error occurred"
		console.log("[uploadVideo] exception", { message: errorMessage, stack: err.stack, totalMs: Date.now() - t0 })
		return responseError(err, errorMessage, 401, corsHeaders)
	}
}
