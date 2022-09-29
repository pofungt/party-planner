import express from 'express';
import path from 'path';

export const isLoggedIn = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => {
	if (req.session?.user) {
		//called Next here
		next();
	} else {
		res.status(404).sendFile(path.resolve("./public/404.html"));;
	}
};