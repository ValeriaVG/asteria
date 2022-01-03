import { initApi } from "./api.js"
import { formatNumber } from './fmt.js'

const exec = await initApi()
const { data, errors } = await exec(`query($date: String) {
    neos(query:{close_approach_data:{close_approach_date:$date}}) {
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
  }`, { date: new Date().toISOString().split('T')[0] })
console.log(errors, data)

const table = document.getElementById('neo')
const tbody = table.querySelector('tbody')
const loader = document.getElementById('table-loader')
loader.hidden = true
for (const entry of data.neos) {
  const row = document.createElement('tr')
  row.innerHTML =
    `<td><a href="${entry.nasa_jpl_url}">${entry.name}</a></td>` +
    `<td>${entry.close_approach_data[0].close_approach_date_full}</td>` +
    `<td>${formatNumber(entry.close_approach_data[0].relative_velocity.kilometers_per_hour)} km/h</td>` +
    `<td>${formatNumber(entry.close_approach_data[0].miss_distance.kilometers)} km</td>`
  tbody.appendChild(row)
}