const app = new Realm.App({ id: "asteria-gccgo" });
const credentials = Realm.Credentials.anonymous();
try {
  // Authenticate the user
  const user = await app.logIn(credentials);
  // `App.currentUser` updates to match the logged in user
  console.assert(user.id === app.currentUser.id)
  console.log(user)
} catch (err) {
  console.error("Failed to log in", err);
}

const graphqlURL = "https://realm.mongodb.com/api/client/v2.0/app/asteria-gccgo/graphql"

const fetchAsteroids = async (query) => {
  const response = await fetch(graphqlURL,
    {
      method: 'POST',
      body: JSON.stringify({ query }),
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
const { data } = await fetchAsteroids(`query {
    neos(query:{close_approach_data:{close_approach_date:"2021-12-18"}}) {
          is_potentially_hazardous_asteroid
          is_sentry_object
          name
          nasa_jpl_url
      close_approach_data{
        close_approach_date_full,
        miss_distance{
          kilometers
        }
        relative_velocity{
          kilometers_per_hour
        }
      }
    }
  }`)

const table = document.getElementById('neo')
const tbody = table.querySelector('tbody')
const loader = document.getElementById('table-loader')
loader.hidden = true
for (const entry of data.neos) {
  const row = document.createElement('tr')
  row.innerHTML =
    `<td><a href="${entry.nasa_jpl_url}">${entry.name}</a></td>` +
    `<td>${entry.close_approach_data[0].close_approach_date_full}</td>` +
    `<td>${entry.close_approach_data[0].relative_velocity.kilometers_per_hour}</td>` +
    `<td>${entry.close_approach_data[0].miss_distance.kilometers}</td>`
  tbody.appendChild(row)
}