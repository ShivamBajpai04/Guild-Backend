import express from "express";
import { z } from "zod";
import router from "./routes/userRoutes.js";
const userRouter = router;
const app = express();
const port = 3000;


app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.json());
app.use("",userRouter)


// app.put("/completed", (req, res) => {});

// app.get("/todos", (req, res) => {});

app.listen(port, () => {
	console.log(`listening on port ${port}`);
});
