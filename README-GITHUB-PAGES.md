# Publish EcoTale on GitHub Pages

1. Extract this ZIP and upload **all of its contents** to the root of your GitHub repository's `main` branch.
2. In GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → main / (root)**.
3. Before inviting users, open `supabase-config.js` in the repository and paste your Supabase Project URL and anon key. Do not use a service role key.
4. In Supabase, run `supabase/schema.sql`, then go to **Authentication → Providers → Email** and turn off **Confirm email**. EcoTale uses username + password, mapping the username to an internal account address.

Your site will be available at: `https://fanx07.github.io/Ecotale/`
