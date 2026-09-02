// The hosted site serves the Vite build unchanged through the platform asset binding.
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  }
};
