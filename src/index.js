import { responseError, responseFailed } from "./response"
import { handleUploadVideo } from "./videos/handleUploadVideo"
import { handleUploadNPY } from "./submission/handleUploadNPY"

export default {
	async fetch(request, env, ctx) {
		const corsHeaders = {
			"Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
			"Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
			"Access-Control-Allow-Credentials": "true",
			"Access-Control-Max-Age": "86400",
		}

		if (request.method === "OPTIONS") {
			// Handle CORS preflight requests
			return new Response(null, { headers: corsHeaders })
		}

		if (request.method === "GET") {
			return new Response(JSON.stringify({ message: "It work" }), { headers: corsHeaders })
		}

		const url = new URL(request.url)
		const path = url.pathname
		const menthod = request.method

		try {
			const storage = env.GENEA_BUCKET
			if (!storage) {
				return responseError(null, "No storage found", 404, corsHeaders)
			}

			if (menthod === "POST") {
				switch (path) {
					case "/upload/videos":
						return handleUploadVideo(request, storage, corsHeaders)
					case "/upload/npy":
						return handleUploadNPY(request, storage, corsHeaders)
					default:
						return responseFailed(null, "Invalid api", 404, corsHeaders)
				}
			}

			// if (url.pathname.startsWith("/auth/")) {
			// 	switch (path) {
			// 		case "/auth/callback":
			// 			return handleGithubCallback(request, env, corsHeaders)
			// 		default:
			// 			return responseFailed(null, "Invalid api", 404, corsHeaders)
			// 	}
			// } else
			if (url.pathname.startsWith("/api/")) {
				// const isValid = await isValidateToken(request, env)
				// if (!isValid) {
				// 	return responseError(null, "Unauthorized", 401, corsHeaders)
				// }
				// if (menthod === "GET") {
				// 	switch (path) {
				// 		case "/upload/videos":
				// 			return fetchInputCode(request, env, corsHeaders)
				// 		default:
				// 			return responseFailed(null, "Invalid api", 404, corsHeaders)
				// 	}
				// }
			}

			return responseError(null, "Invalid api", 404, corsHeaders)
		} catch (err) {
			const errorMessage = err.message || "An unknown error occurred"
			console.log("Exception", err)
			return responseError(err, errorMessage, 500, corsHeaders)
		}
	},
}
