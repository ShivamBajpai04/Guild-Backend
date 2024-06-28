import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export default async function userMiddleware(req, res, next) {
	const token = req.headers.authorization.split(" ")[1];

	try {
		const decodedVal = jwt.verify(token, process.env.JWT_SECRET);

		if (decodedVal) {
			req.username = decodedVal;
			next();
		} else {
			res.status(403).json({
				msg: "You're not authenticated",
			});
		}
	} catch (e) {
		res.json({
			msg: "you are not authenticated",
		});
	}
}
