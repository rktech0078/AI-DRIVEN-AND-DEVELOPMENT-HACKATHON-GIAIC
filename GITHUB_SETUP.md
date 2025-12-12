# GitHub Actions Setup Guide 🚀

To enable the "Plan A" Keep-Alive system, you need to add your production URL as a secret in GitHub.

## Steps

1.  **Go to your Repository on GitHub.**
2.  Click on the **Settings** tab (top right of the repo navbar).
3.  In the left sidebar, verify you are in "Settings". Scroll down to the **Security** section.
4.  Click on **Secrets and variables** -> **Actions**.
5.  Click the green button **New repository secret**.
6.  Fill in the details:
    *   **Name:** `PRODUCTION_URL`
    *   **Secret:** `https://your-project-name.vercel.app`
        *(Replace with your actual Vercel live URL)*
7.  Click **Add secret**.

## Verification
Once added, the workflow defined in `.github/workflows/keep-alive.yml` will automatically:
*   Run every 6 hours.
*   Ping your `/api/cron/keep-alive` endpoint.
*   Log a ✅ Success if it gets a 200 OK.

You can manually test it by going to the **Actions** tab -> **Supabase Keep-Alive** -> **Run workflow**.
