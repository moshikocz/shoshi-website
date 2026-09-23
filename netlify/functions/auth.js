// GitHub OAuth login for Decap CMS — step 1 of 2 (see callback.js).
//
// Requires two Netlify environment variables, set in the Netlify dashboard
// (Site settings -> Environment variables), from a GitHub OAuth App you
// register at https://github.com/settings/developers:
//   OAUTH_CLIENT_ID
//   OAUTH_CLIENT_SECRET
// The OAuth App's "Authorization callback URL" must be:
//   https://<your-site>.netlify.app/.netlify/functions/callback
// (or your custom domain's equivalent).

exports.handler = async (event) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  if (!clientId) {
    return { statusCode: 500, body: "OAUTH_CLIENT_ID is not set in Netlify environment variables." };
  }

  const host = event.headers["x-forwarded-host"] || event.headers.host;
  const protocol = event.headers["x-forwarded-proto"] || "https";
  const redirectUri = `${protocol}://${host}/.netlify/functions/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo,user",
  });

  return {
    statusCode: 302,
    headers: { Location: `https://github.com/login/oauth/authorize?${params.toString()}` },
    body: "",
  };
};
