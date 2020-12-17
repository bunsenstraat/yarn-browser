const { Buffer } = require("buffer");

function fetchWithTimeout(timeoutDuration, url, options) {
	if (timeoutDuration == null || timeoutDuration === 0) {
		return fetch(url, options);
	}

	const controller = new AbortController();
	const signal = controller.signal;

	const timeout = setTimeout(() => {
		controller.abort();
	}, timeoutDuration);

	return fetch(url, { ...options, signal }).then(
		(res) => (clearTimeout(timeout), res),
		(res) => (clearTimeout(timeout), res)
	);
}

export function extend(options) {
	let timeoutDuration = options?.timeout?.socket;
	let responseType = options?.responseType ?? "text";

	let fetchOptions = {
		method: options.method,
	};

	return (url) =>
		fetchWithTimeout(
			timeoutDuration,
			url.replace("registry.npmjs.org", "registry.npmjs.cf"),
			fetchOptions
		)
			.then((res) => {
				if (!res.ok) {
					throw res;
				} else {
					return res;
				}
			})
			.then(async (res) => {
				let body;
				if (responseType === "buffer") {
					body = Buffer.from(await res.arrayBuffer());
				} else if (responseType === "text") {
					body = await res.text();
				} else if (responseType === "json") {
					body = await res.json();
				}
				return { body };
			});
}
