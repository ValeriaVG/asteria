import { initApi } from "./api.js"
import { formatNumber } from './fmt.js'

const exec = await initApi()
const { data, errors } = await exec(`query($from: Long, $to: Long) {
  neos(sortBy: EPOCH_DATE_CLOSE_APPROACH_ASC, query: {epoch_date_close_approach_gt: $from,epoch_date_close_approach_lt: $to} ) {
    _id
		absolute_magnitude_h
		epoch_date_close_approach
		id
		is_potentially_hazardous_asteroid
		is_sentry_object
		name
		orbiting_body
		url
    relative_velocity {
      kilometers_per_hour
    }
    miss_distance {
      kilometers
    }
  }
}`, { from: Date.now().toString(), to: (new Date(Date.now() + 24 * 60 * 60 * 1_000).setHours(0, 0, 0, 0)).toString() })

const KARMAN_LINE_KM = 100

const list = document.getElementById('list')
const loader = document.getElementById('loader')
loader.hidden = true
let isOk = true
for (const entry of data.neos) {
  const row = document.createElement('li')
  const isRowOk = !entry.is_potentially_hazardous_asteroid && entry.miss_distance.kilometers > KARMAN_LINE_KM
  if (!isRowOk) row.className = 'danger'
  row.innerHTML =
    `<a href="${entry.url}" target="_blank" rel="noopener">${entry.is_sentry_object ? 'Sentry' : 'Asteroid'} ${entry.name}</a> ` +
    `approaches Earth today at <time>${new Date(Number(entry.epoch_date_close_approach)).toLocaleTimeString()}</time> ` +
    `at <em>${formatNumber(entry.relative_velocity.kilometers_per_hour)}</em> km/h ` +
    (isRowOk ? `and will miss by <em class="distance">${formatNumber(entry.miss_distance.kilometers)}</em> km.` : `and will enter Earth's atmosphere 😱`)
  list.appendChild(row)
  isOk = isOk && isRowOk
}
const status = document.getElementById('status')
status.className = isOk ? 'good' : 'bad'
status.innerHTML = isOk ? 'No collissions detected today' : 'Collision detected! We are doomed!'