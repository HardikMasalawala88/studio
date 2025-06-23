// This is a new file for the API client

const getApiBaseUrl = () => {
    // In a server component or route handler, you can access process.env
    // In client components, it needs to be prefixed with NEXT_PUBLIC_
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        console.warn("API base URL is not configured. Falling back to default.");
        return "http://127.0.0.1:8000";
    }
    return baseUrl;
};

async function apiFetch(path: string, options: RequestInit = {}) {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${path}`;

    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        ...options,
    };

    try {
        const response = await fetch(url, defaultOptions);

        if (!response.ok) {
            let errorBody;
            try {
                errorBody = await response.json();
            } catch (e) {
                errorBody = { message: `HTTP error! status: ${response.status}` };
            }
            console.error("API Error:", errorBody);
            // Use a more specific message if available from the API response
            const errorMessage = errorBody?.detail?.[0]?.msg || errorBody.message || `An error occurred: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        // Handle cases where the response body might be empty (e.g., 204 No Content or some POST/PUT/DELETE)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        }
        return {}; // Return an empty object for non-json responses or empty bodies

    } catch (error) {
        console.error('Fetch API error:', error);
        throw error;
    }
}

export default apiFetch;
