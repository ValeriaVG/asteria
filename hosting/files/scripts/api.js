export async function initApi() {
    const app = new Realm.App({ id: "asteria-gccgo" });
    const credentials = Realm.Credentials.anonymous();
    await app.logIn(credentials);
    const graphqlURL = "https://realm.mongodb.com/api/client/v2.0/app/asteria-gccgo/graphql"

    return async (query, variables) => {
        const response = await fetch(graphqlURL,
            {
                method: 'POST',
                body: JSON.stringify({ query, variables }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${app.currentUser.accessToken}`
                }
            })
        if (response.ok) {
            const data = await response.json()
            return data
        }
    }
}