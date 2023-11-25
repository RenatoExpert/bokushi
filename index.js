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
});

app.route('/notifications')
	.get((req, res) => {
		let notifications = database.notifications;
		let filtered = [];
		for(i in notifications) {
			let spice = notifications[i];
			if(spice.to == req.session.userid) {
				spice.id = i;
				filtered.push(spice);
			}
		}
		console.log(filtered);
		res.render("notifications", { notifications: filtered });
	})

app.route('/notifications/:id')
	.get((req, res) => {
		//	Show information about a single notification
	})

app.route('/workers')
	.get((req, res) => {
		let table = database.workers;
		let email = req.session.userid;
		let account = database.users[email];
		console.log(email, account, database.users);
		let workers_list = [];
		for(i in table) {
			let worker = table[i];
			worker.id = i;
			if(account.type == "admin" || worker.business == email) {
				workers_list.push(worker);
			} else {
				throw new Error("Unknown account type");
			}
		}
		res.render("workers", { workers: workers_list });
	})
	.post((req, res) => {
		let {name, cpf} = req.body;
		let business = req.session.userid;
		database.workers.push({
			name,
			cpf,
			business
		});
		res.redirect("/workers");
	})

app.route('/workers/:id')
	.get((req, res) => {
		let id = req.params.id;
		let worker = database.workers[req.params.id];
		let submissions = [];
		let table = database.submissions;
		let fields = database.fields;
		for(i in table) {
			let cpf = worker.cpf;
			let reff = table[i]
			if(cpf == reff.worker) {
				submissions.push(reff);
			}
		}
		res.render("worker", {
			worker,
			submissions,
			fields
		})
	})
	.put((req, res) => {
		//	Change information about a worker
	})
	.delete((req, res) => {
		let id = req.params.id;
		database.workers.splice(id, 1);
		res.status(200);
		res.send("Usuário excluído");
	})

app.route('/fields')
	.get((req, res) => {
		let email = req.session.userid;
		let account = database.users[email];
		if(account.type == "admin") {
			const table = database.fields;
			res.send(table);
		} else {
			res.status(403);
			res.send();
		}
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
		let { data, field, cpf } = req.body;
		let submission = {
			status: "pendente",
			data,
			field,
			worker: cpf
		};
		database.submissions.push(submission);
		let previous_url = req.header("Referer");
		res.redirect(previous_url);
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

