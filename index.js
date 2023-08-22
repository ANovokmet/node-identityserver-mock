const express = require('express');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3450;
const serverUrl = `http://localhost:${port}`;

app.use(express.json());
app.use(express.urlencoded());

const clients = [
    {
        client_id: 'client1',
        client_secret: 'secret',
        redirect_uri: `http://localhost:3000/callback`
    }
];

const accessTokens = {};

// Authorization Endpoint: /authorize
app.get('/connect/authorize', (req, res) => {
    const { client_id, redirect_uri, response_type } = req.query;

    // Check if the client is registered
    const client = clients.find((c) => c.client_id === client_id);

    if (!client || client.redirect_uri !== redirect_uri || response_type !== 'token') {
        return res.status(401).send('Unauthorized');
    }

    // Generate a random access token and associate it with the client
    const accessToken = uuid.v4();
    accessTokens[accessToken] = { client_id: client_id };

    // Redirect back to the client with the access token in the URL hash fragment
    const redirectUrl = `${redirect_uri}#access_token=${accessToken}&token_type=bearer`;
    res.redirect(redirectUrl);
});

app.get('/login', (req, res) => {
    const { signin } = req.query;

    // login form
});
app.post('/login', (req, res) => {
    const { signin } = req.query;
    
    // redirect to /oidc
});

// Token Endpoint: /token
app.post('/connect/token', (req, res) => {
    const { client_id, client_secret, grant_type } = req.body;

    // Check client credentials
    const client = clients.find((c) => c.client_id === client_id);

    if (!client) {
        return res.status(401).json({ error: 'invalid_client' });
    }
    
    if (client.client_secret !== client_secret) {
        return res.status(401).json({ error: 'invalid_secret' });
    }

    if (grant_type !== 'client_credentials') {
        return res.status(401).json({ error: 'invalid_grant_type' });
    }

    // Generate a random access token and send it in the response
    // const accessToken = uuid.v4();
    const accessToken = jwt.sign({
        sub: 'user123',
        name: 'John Doe',
        email: 'john.doe@example.com'
    }, 'WEDpdjly2o6luM6q5fLUbjnZQFc', { algorithm: 'RS256' });
    res.json({ access_token: accessToken, token_type: 'bearer', expires_in: 3600 });
});

// logout endpoint https://identityserver.github.io/Documentation/docsv2/endpoints/endSession.html
app.get('/connect/endsession', (req, res) => {

});

// UserInfo Endpoint: /userinfo
app.get('/connect/userinfo', (req, res) => {
    const accessToken = req.headers.authorization;

    // Validate the access token
    if (!accessToken || !accessTokens[accessToken]) {
        return res.status(401).send('Unauthorized');
    }

    // Access token is valid; return dummy user information
    const userInfo = {
        sub: 'user123',
        name: 'John Doe',
        email: 'john.doe@example.com'
    };
    res.json(userInfo);
});

// JWKS Endpoint: /.well-known/jwks.json
app.get('/.well-known/jwks.json', (req, res) => {
    // Mock JWKS with a single key
    const jwks = {
        keys: [
            {
                kty: 'RSA',
                alg: 'RS256',
                use: 'sig',
                kid: '12345',
                n: 'mockRSAPublicKey',
                e: 'AQAB',
            },
        ],
    };
    res.json(jwks);
});

// Discovery Endpoint: /.well-known/openid-configuration
app.get('/.well-known/openid-configuration', (req, res) => {
    const discovery = {
        issuer: `${serverUrl}`,
        authorization_endpoint: `${serverUrl}/connect/authorize`,
        token_endpoint: `${serverUrl}/connect/token`,
        userinfo_endpoint: `${serverUrl}/connect/userinfo`,
        jwks_uri: `${serverUrl}/.well-known/jwks.json`,
    };
    res.json(discovery);
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});


// app.get('/.well-known/openid-configuration', (req, res) => {
//     // if (!wait) {
//     const jsonResponse = {
//         "issuer": "<identityserver-url>",
//         "jwks_uri": "<identityserver-url>/.well-known/jwks",
//         "authorization_endpoint": "<identityserver-url>/connect/authorize",
//         "token_endpoint": "<identityserver-url>/connect/token",
//         "userinfo_endpoint": "<identityserver-url>/connect/userinfo",
//         "end_session_endpoint": "<identityserver-url>/connect/endsession",
//         "check_session_iframe": "<identityserver-url>/connect/checksession",
//         "revocation_endpoint": "<identityserver-url>/connect/revocation",
//         "introspection_endpoint": "<identityserver-url>/connect/introspect",
//         "frontchannel_logout_supported": true,
//         "frontchannel_logout_session_supported": true,
//         "scopes_supported": ["openid", "profile", "email", "address", "phone", "tenant", "all_claims", "check", "roles", "offline_access"],
//         "claims_supported": ["sub", "name", "family_name", "given_name", "middle_name", "nickname", "preferred_username", "profile", "picture", "website", "gender", "birthdate", "zoneinfo", "locale", "updated_at", "email", "email_verified", "address", "phone_number", "phone_number_verified", "tenantId", "openid"],
//         "response_types_supported": ["code", "token", "id_token", "id_token token", "code id_token", "code token", "code id_token token"],
//         "response_modes_supported": ["form_post", "query", "fragment"],
//         "grant_types_supported": ["authorization_code", "client_credentials", "password", "refresh_token", "implicit"],
//         "subject_types_supported": ["public"],
//         "id_token_signing_alg_values_supported": ["RS256"],
//         "code_challenge_methods_supported": ["plain", "S256"],
//         "token_endpoint_auth_methods_supported": ["client_secret_post", "client_secret_basic"]
//     };
//     res.json(jsonResponse);
//     // }
//     wait = false;
// });