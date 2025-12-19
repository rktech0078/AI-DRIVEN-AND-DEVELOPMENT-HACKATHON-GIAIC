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

## How to Verify (Step-by-Step) ✅

1.  **Open GitHub Actions:**
    *   Go to your repository's **"Actions"** tab.
    *   On the left sidebar, click **"Supabase Keep-Alive (Plan A)"**.

2.  **Trigger Manually:**
    *   Click the **"Run workflow"** dropdown button on the right side.
    *   Select the branch (usually `main`) and click the green **"Run workflow"** button.

3.  **Check Results:**
    *   Wait a few seconds for the new run to appear in the list.
    *   **Click on the run title** (e.g., "Supabase Keep-Alive (Plan A) #1").
    *   Click on the **"ping"** job button on the left or in the visualization graph.
    *   Expand the **"Ping Keep-Alive Endpoint"** step.
    *   Look for the log output:
        > `✅ Success! Status Code: 200`

If you see the green checkmark and status 200, **Plan A is working!** 🎉
