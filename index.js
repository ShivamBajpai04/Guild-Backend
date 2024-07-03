import express from "express";
import { z } from "zod";
import router from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
const userRouter = router;
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.json());
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
	next();
  })
app.use("/", userRouter);
app.use("/admin", adminRouter);

// app.put("/completed", (req, res) => {});

// app.get("/quests", (req, res) => {});

app.listen(port, () => {
	console.log(`listening on port ${port}`);
});
