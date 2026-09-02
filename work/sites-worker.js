// The hosted site serves the Vite build unchanged through the platform asset binding.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Static bindings resolve files, not directory indexes. Route the public
    // root explicitly to the Vite entry page so the app can boot at `/`.
    if (url.pathname === '/') {
      url.pathname = '/index.html';
      return env.ASSETS.fetch(new Request(url, request));
    }
    return env.ASSETS.fetch(request);
  }
};
