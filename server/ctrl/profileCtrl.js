require("dotenv").config();
const axios = require("axios");

const { ZIP_API_KEY } = process.env;

module.exports = {
  deleteProfile: (req, res) => {
    const db = req.app.get("db");
    const { id: deleteId } = req.params;
    req.session.destroy(); // clears out session

    db.delete_profile(deleteId)
      .then(() => res.status(200).send("deleted"))
      .catch((err) => {
        console.log(err);
      });
  },
  updateZip: async (req, res) => {
    const db = await req.app.get("db");
    const { id: updateId } = req.params;
    const { zip: updateZip } = req.query;
    // console.log("updateId", updateId);
    // console.log("updateZip", updateZip);

    //axios to external api with new zip
    const zipData = await axios
      .get(
        `https://www.zipcodeapi.com/rest/${ZIP_API_KEY}/info.json/${updateZip}/degrees`
      ) //not my api key"
      .then((res) => {
        return res.data;
      });

    const lat = zipData.lat;
    const lng = zipData.lng;
    
    req.session.user = {
      user_id: updateId,
      user_zip: updateZip,
      user_lat: lat,
      user_lng: lng,
    };

    db.update_zip([updateId, updateZip, lat, lng])
      .then(() => res.status(200).send(req.session.user))
      .catch((err) => {
        console.log(err);
      });
  },
};
