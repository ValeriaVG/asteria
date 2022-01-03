/**
 * 
 * @param {{ 
 *  links: Record<string,string>, 
 *  id:string, 
 *  neo_reference_id: string, 
 *  name: string, 
 *  nasa_jpl_url:string, 
 *  absolute_magnitude_h: number,
 *  estimated_diameter: Record<'kilometers'|'meters'|'miles'|'feet',{estimated_diameter_min:number,estimated_diameter_max:number}>,
 *  is_potentially_hazardous_asteroid: boolean,
 *  close_approach_data: Array<
 *    {
 *      close_approach_date:string,
 *      close_approach_date_full:string,
 *      epoch_date_close_approach:number,
 *      relative_velocity:Record<'kilometers_per_second'|'kilometers_per_hour'|'miles_per_hour',string>,
 *      miss_distance: Record<'astronomical'|'lunar'|'kilometers'|'miles',string>,
 *      orbiting_body: string,
 *    }>,
 *  is_sentry_object: boolean
 * }} item from NASA NEO API
 * 
 * @returns {{
 *  id: string,
 *  name: string,
 *  url: string
 *  absolute_magnitude_h: number,
 *  estimated_diameter: Record<'kilometers'|'meters'|'miles'|'feet',{estimated_diameter_min:number,estimated_diameter_max:number}>,
 *  is_potentially_hazardous_asteroid: boolean,
 *  is_sentry_object: boolean,
 *  epoch_date_close_approach: number,
 *  relative_velocity:Record<'kilometers_per_second'|'kilometers_per_hour'|'miles_per_hour',number>,
 *  miss_distance: Record<'astronomical'|'lunar'|'kilometers'|'miles',number>,
 *  orbiting_body: string
 * }|undefined}
 */
function transformData(item) {
  if (!item.close_approach_data.length) return
  const close_approach_data = item.close_approach_data[0]
  return {
    id: item.id,
    name: item.name,
    url: item.nasa_jpl_url,
    absolute_magnitude_h: item.absolute_magnitude_h,
    estimated_diameter: item.estimated_diameter,
    is_potentially_hazardous_asteroid: item.is_potentially_hazardous_asteroid,
    is_sentry_object: item.is_sentry_object,
    epoch_date_close_approach: close_approach_data.epoch_date_close_approach,
    relative_velocity: close_approach_data.relative_velocity,
    miss_distance: close_approach_data.miss_distance,
    orbiting_body: close_approach_data.orbiting_body
  }
}


exports = async function () {
  try {
    const today = new Date().toISOString().split('T').shift() // YYYY-MM-DD
    const response = await context.http.get({ url: `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&api_key=${context.values.get("NasaApiKey")}` })
    if (response.statusCode != 200) {
      console.error(response.status, response.body.text())
      return
    }
    const data = EJSON.parse(response.body.text())
    const mongodb = context.services.get("mongodb-atlas");
    const neoCollection = mongodb.db("asteria").collection("neo");
    const nearEarthObjects = []
    for (const date in data.near_earth_objects) {
      nearEarthObjects.push(...data.near_earth_objects[date].map(transformData).filter(Boolean))
    }

    const ops = nearEarthObjects.map(item => ({
      updateOne: {
        filter: { id: item.id },
        update: {
          $set: item
        },
        upsert: true
      }
    }))

    await neoCollection.bulkWrite(ops, { ordered: false });
   
  } catch (error) {
    console.error("Failed to insert data", error)
  }
};
