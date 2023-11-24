const port = 3000;

var database = {
	users: {
		"business@mail.com": {
			password: "abc123",
			type: "business",
			cnpj: "030301234"
		},
		"admin@mail.com": {
			password: "abc123",
			type: "admin"
		}
	},
	notifications: [
		{
			to: "business@mail.com",
			message: "Hello folk",
			status: "unread"
		},
		{
			to: "admin@mail.com",
			message: "Welcome to Bokushi",
			status: "unread"
		},
		{
			to: "business@mail.com",
			message: "Yoyoyo",
			status: "unread"
		}
	],
	workers: [ 
		{
			name: "Carlos Boca",
			cpf: "123456789-12",
			business: "business@mail.com"
		},
		{
			name: "Louro da Silva",
			cpf: "123451234-56",
			business: "business@mail.com"
		}
	],
	fields: [
		"NR10",
		"NR20",
		"antecedentes",
		"nome da mãe",
		"rg"		
	],
	submissions: [
		{
			worker: "123456789-12",
			field: "nome da mãe",
			data: "maria alves",
			status: "pendente"
		},
		{
			worker: "123456789-12",
			field: "NR10",
			data: "Foto da NR10",
			status: "aprovado"
		},
		{
			worker: "123451234-56",
			field: "nome da mãe",
			data: "joana almeida",
			status: "aprovado"
		}
	],
	agenda: [
		{
			worker: "123456789-12",
			event: "manutenção elétrica",
			status: "pendente",
			entrance: new Date()
		}
	],
	events: {
		"manutenção elétrica": [
			"NR10"
		],
		"manutenção modem": [
			"rg",
			"antecedentes"
		]
	}
}

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.set('views', './views');

app.use((req, res, next) => {
	console.log(req.method, req.originalUrl, req.params, req.body);
	next();
});

app.use((req, res, next) => {
	if('loggedin' in req.session) {
		let unknown_path = ["/", "/login", "/register"].includes(req.originalUrl);
		let loggedin = req.session.loggedin;
		if(loggedin && unknown_path) {
			res.redirect("/menu");
		} else if (!loggedin && !unknown_path) {
			res.redirect("/");
		} else {
			next();
		}
	} else {
		req.session.loggedin = false;
		next();
	}
})

app.get('/', (req, res) => {
	res.render('home');
});

app.route('/register')
	.get((req, res) => {
		res.render('register');
	})
	.post((req, res) => {
		let {email, cnpj, name, password} = req.body;
		if(email && password && !(email in database.users)) {
			database.users[email] = {
				password
			};
			res.redirect("/");
		} else {
			res.status(406);
			res.send("Dados Invalidos");
		} 
	});

app.route('/login')
	.get((req, res) => {
		res.render('login');
	})
	.post((req, res) => {
		let {email, password} = req.body;
		try {
			if(password == database.users[email].password) {
				req.session.loggedin = true;
				req.session.userid = email;
				res.redirect("/menu");
			} else {
				throw new Error("Wrong password");
			}
		} catch(e) {
			res.send(e);
		}
	});

app.get('/menu', (req, res) => {
	res.render("menu");
	//	If user is a business
	//	render options: notifications, workers, agenda
	
	//	If user is admin
	//	render options: notifications, fields, events, agenda
});

app.route('/notifications')
	.get((req, res) => {
		let notifications = database.notifications;
		let filtered = [];
		for(i in notifications) {
			if(notifications[i].to == req.session.userid) {
				let spice = notifications[i];
				spice.id = i;
				filtered.push(spice);
			}
		}
		console.log(filtered);
		res.render("notifications", { notifications: filtered });
		//	render a list of notifications, user may click on them to see better
	})

app.route('/notifications/:id')
	.get((req, res) => {
		//	Show information about a single notification
	})

app.route('/workers')
	.get((req, res) => {
		//	Busines => Show a list of workers of current business
		//	Admin => Show a list of all workers
		//	Click on one list item to go to /workers/:id
	})
	.post((req, res) => {
		//	Add a new worker
		//	Needs CPF and name
	})

app.route('/workers/:id')
	.get((req, res) => {
		//	Show information about a worker
	})
	.put((req, res) => {
		//	Change information about a worker
	})
	.delete((req, res) => {
		//	Delete worker
	})

app.route('/fields')
	.get((req, res) => {
		//	Get list of current available fields
	})
	.post((req, res) => {
		//	Add a new field
	})

app.route('/fields/:id')
	.delete((req, res) => {
		//	Delete field
	})


app.route('/submissions')
	.get((req, res) => {
		//	Render form to make new submission
	})
	.post((req, res) => {
		//	Add new submission
	})

app.route('/submissions/:id')
	.get((req, res) => {
		//	Render info about a submission
	})
	.put((req, res) => {
		//	Business => Update content
		//	Admin => Aprove or deny a submission
	})

app.route('/events')
	.get((req, res) => {
		//	Get a list of possible events
	})
	.post((req, res) => {
		//	Add a new event
	})

app.route('/events/:id')
	.delete((req, res) => {
		//	Delete event
	})

app.route('/agenda')
	.get((req, res) => {
		//	Render a list of next schedules
	})
	.post((req, res) => {
		//	Request a new schedule
	})

app.route('/agenda/:id')
	.get((req, res) => {
		//	Show information of a schedule
	})
	.put((req, res) => {
		//	Approve or decline a request
	})
	.delete((req, res) => {
		//	Delete request
	})


app.listen (port, status => {
	console.log(`Running webserver... port:${port}`);
});

