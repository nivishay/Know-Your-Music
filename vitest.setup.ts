import "@testing-library/jest-dom";

// Required env vars for all tests
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.SPOTIFY_CLIENT_ID = "test-spotify-client-id";
process.env.SPOTIFY_CLIENT_SECRET = "test-spotify-client-secret";
process.env.SPOTIFY_REDIRECT_URI = "http://localhost:3000/auth/callback";
process.env.REFRESH_TOKEN_SECRET = "test-encryption-secret-32-chars!!";
