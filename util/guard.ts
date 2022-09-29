import express from 'express';

export const isLoggedIn = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => {
	if (req.session?.user) {
		//called Next here
		next();
	} else {
		res.json({status: "Not Logged In"});
	}
};