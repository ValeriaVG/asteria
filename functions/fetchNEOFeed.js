exports = async function() {
  try{
  const today = new Date().toISOString().split('T').shift() // YYYY-MM-DD
  const response = await context.http.get({ url: `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&api_key=${context.values.get("NasaApiKey")}` })
  if(response.statusCode != 200) {
    console.error(response.status, response.body.text())
    return
  }
  const data = EJSON.parse(response.body.text())
  const mongodb = context.services.get("mongodb-atlas");
  const neoCollection = mongodb.db("asteria").collection("neo");
  const nearEarthObjects = []
  for(const date in data.near_earth_objects){
    nearEarthObjects.push(...data.near_earth_objects[date].map(entry=>{
      delete entry.links
      return entry
    }))
  }
  
  const ops = nearEarthObjects.map(item=>({
            updateOne: {
                filter: { id: item.id },
                update: {
                    $set: item
                },
                upsert: true
            }
        }))

  await neoCollection.bulkWrite(ops, { ordered: false });
  }catch(error){
    console.error("Failed to insert data", error)
  }

};
