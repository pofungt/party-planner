import express from 'express';
import { dev } from '../app';

export const isLoggedIn = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	if (req.session?.user) {
		//called Next here
		next();
	} else {
		if (dev) {
			req.session.user = -1;
			next();
		} else {
			res.status(404).redirect('/');
		}
	}
};

export const isLoggedInAPI = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	if (req.session?.user) {
		//called Next here
		// console.log('user name', req.session.user);
		next();
	} else {
		if (dev) {
			req.session.user = -1;
			next();
		} else {
			// redirect to 404 page
			res.status(400).json({ error: "You don't have the permission" });
		}
	}
};

export const isLoggedInInvitation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	if (req.session?.user) {
		//called Next here
		// console.log('user name', req.session.user);
		next();
	} else {
		if (dev) {
			req.session.user = -1;
			next();
		} else {
			res.json({
				status: false,
				login: false
			});
		}
	}
};
