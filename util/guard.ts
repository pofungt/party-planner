import express from 'express';

export const isLoggedIn = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	if (req.session?.user) {
		next();
	} else {
		res.status(404).redirect('/landingPage.html');
	}
};

export const isLoggedInAPI = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	if (req.session?.user) {
		next();
	} else {
		// redirect to 404 page
		res.status(400).json({ error: "You don't have the permission" });
	}
};

export const isLoggedInInvitation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	if (req.session?.user) {
		next();
	} else {
		res.json({
			status: false,
			login: false
		});
	}
};
