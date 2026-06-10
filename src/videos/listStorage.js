import { responseError, responseSuccess } from "@/response"

// Lists every object under the given prefix in the R2 bucket.
// R2's list() returns at most 1000 keys per call, so we page through
// using the returned cursor until the bucket is exhausted.
export async function listStorage(request, storage, corsHeaders) {
	try {
		const url = new URL(request.url)
		const prefix = url.searchParams.get("prefix") || "videos/"

		const objects = []
		let cursor = undefined

		do {
			const listed = await storage.list({ prefix, limit: 1000, cursor })
			for (const obj of listed.objects) {
				objects.push({
					key: obj.key,
					size: obj.size,
					uploaded: obj.uploaded, // Date
				})
			}
			cursor = listed.truncated ? listed.cursor : undefined
		} while (cursor)

		return responseSuccess({ prefix, count: objects.length, objects }, "Fetch storage success", corsHeaders)
	} catch (err) {
		const errorMessage = err.message || "An unknown error occurred"
		console.log("[listStorage] Exception", err)
		return responseError(err, errorMessage, 500, corsHeaders)
	}
}
