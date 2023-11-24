const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const MySqlStore = require('express-mysql-session')(session);
const db = require('./db/db'); // Assuming you have a separate file for database connection

var page = require('./page');
var sensor = require('./sensor');
var login = require('./users/login');
var register = require('./users/registeration');
var update = require('./users/update');
var airconMessage = require('./airconMessage');
var windowMessage = require('./windowMessage');
var alertMessage = require('./alertMessage');
var lightMessage = require('./lightMessage');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var options = {
  host: 'localhost',
  user: 'dbid231',
  password: 'dbpass231',
  database: 'db23102'
};

var sessionStore = new MySqlStore(options);

app.use(
  session({
    secret: 'sjhflauih192hfualkejf',
    resave: false,
    saveUninitialized: true,
    store: sessionStore
  })
);

function authIsOwner(request, response) {
  if (request.session.is_logined) {
    return true;
  } else {
    return false;
  }
}

// Admin Page SERVER
app.get('/', (request, response) => {
  if (!authIsOwner(request, response)) {
    response.redirect('/login');
  } else {
    response.redirect('/userManage/:pNum');
  }
});
app.get('/login', (request, response) => {
  page.login(request, response);
});
app.post('/login_process', (request, response) => {
  page.login_process(request, response);
});
app.get('/logout', (request, response) => {
  page.logout(request, response);
});

app.get('/userManage', (request, response) => {
  page.userManage(request, response);
});

app.get('/userManage/:pNum', (request, response) => {
  page.userManage(request, response);
});

app.get('/userManage/userUpdate/:uId', (request, response) => {
  page.userUpdate(request, response);
});

app.get('/userManage/userUpdate/:uId/:pNum', (request, response) => {
  page.userUpdate(request, response);
});

app.post('/userManage/userUpdate_process/:uId', (request, response) => {
  const { uId } = request.params;
  const { userid, password, name, email, phone, gender } = request.body;

  db.query(
    `UPDATE user SET userid=?, password=?, name=?, email=?, phone=?, gender=? WHERE id=?`,
    [userid, password, name, email, phone, gender, uId],
    (error) => {
      if (error) {
        console.error(error);
      }
      response.redirect('/userManage');
    }
  );
});
app.get('/userManage/userSuspend/:uId', (request, response) => {
  page.userSuspend(request, response);
});
app.get('/userManage/userDelete_process/:uId', (request, response) => {
  page.userDelete_process(request, response);
});
app.get('/userManage/userMonitoring/:uId', (request, response) => {
  page.userMonitoring(request, response);
});
app.get('/userManage/userMonitoring_light/:uId', (request, response) => {
  page.userMonitoring_light(request, response);
});
app.get('/userManage/userMonitoring_window/:uId', (request, response) => {
  page.userMonitoring_window(request, response);
});
app.get('/userManage/userMonitoring_aircon/:uId', (request, response) => {
  page.userMonitoring_aircon(request, response);
});
app.get('/userManage/userMonitoring_alert/:uId', (request, response) => {
  page.userMonitoring_alert(request, response);
});

// Raspberry PI SERVER
app.post('/sensor/temp', (request, response) => {
  sensor.temp(request, response);
});
app.post('/sensor/humi', (request, response) => {
  sensor.humi(request, response);
});
app.post('/sensor/lightValue', (request, response) => {
  sensor.lightValue(request, response);
});
app.post('/sensor/alert', (request, response) => {
  sensor.alert(request, response);
});

// App SERVER
app.post('/users/login', (request, response) => {
  login.login(request, response);
});

app.post('/users/register', (request, response) => {
  register.register(request, response);
});

app.post('/users/update', (request, response) => {
  update.update(request, response);
});

app.post('/user/user_process', (request, response) => {
  update.update_process(request, response);
});

// Alarm Message
app.post('/sensor/airconMessage', (request, response) => {
  airconMessage.airconMessage(request, response);
});
app.post('/sensor/windowMessage', (request, response) => {
  windowMessage.windowMessage(request, response);
});
app.post('/sensor/alertMessage', (request, response) => {
  alertMessage.alertMessage(request, response);
});
app.post('/sensor/lightMessage', (request, response) => {
  lightMessage.lightMessage(request, response);
});


app.listen(60002, () => {
  console.log('60002');
});
