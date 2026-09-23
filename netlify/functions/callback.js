// GitHub OAuth login for Decap CMS — step 2 of 2 (see auth.js).
// GitHub redirects here with a `code` after Shoshi (or Moshiko) approves the
// login. We exchange it for an access token, then hand that token back to
// the Decap popup window via postMessage, using the exact message format
// Decap's GitHub backend listens for.

exports.handler = async (event) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  const code = event.queryStringParameters && event.queryStringParameters.code;

  if (!clientId || !clientSecret) {
    return { statusCode: 500, body: "OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET are not set in Netlify environment variables." };
  }
  if (!code) {
    return { statusCode: 400, body: "Missing ?code from GitHub redirect." };
  }

  let token;
  let error;
  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await tokenRes.json();
    if (data.error) {
      error = data.error_description || data.error;
    } else {
      token = data.access_token;
    }
  } catch (e) {
    error = e.message;
  }

  // Decap's popup-window handshake: it listens for any "message" event from
  // this window, replies once to confirm it's ready, and only then do we
  // send the real "authorization:github:success:{...}" payload.
  const payload = error
    ? `authorization:github:error:${JSON.stringify({ message: error })}`
    : `authorization:github:success:${JSON.stringify({ token, provider: "github" })}`;

  const html = `<!DOCTYPE html>
<html><body>
<script>
  (function () {
    function receiveMessage(e) {
      window.opener.postMessage(${JSON.stringify(payload)}, e.origin);
      window.removeEventListener("message", receiveMessage, false);
    }
    window.addEventListener("message", receiveMessage, false);
    window.opener.postMessage("authorizing:github", "*");
  })();
</script>
</body></html>`;

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: html,
  };
};
