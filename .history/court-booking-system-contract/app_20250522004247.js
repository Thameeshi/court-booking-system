import express from "express";
import courtApi from "./src/api/courtApi.js";

const app = express();
app.use(express.json());
app.use(courtApi);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});