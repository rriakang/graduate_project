var db = require('./db/db');
var qs = require('querystring');

var template = require('./template');

module.exports = {
  login: (request, response) => {
    var title = "로그인";
    var html = template.HTML(title, '', '',
      `
          <form class="row g-3" action="/login_process" method="post">
            <div
              class="col-md-6 position-absolute top-50 start-50 translate-middle"
              style="
                position: absolute;
                top: 40%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding-left: 10%;
              "
            >
              <div>
                <label class="form-label" for="inputID"> 로그인 ID * </label>
              </div>
              <div>
                <input
                  class="form-control-plaintext form-control-lg shadow-sm p-3 mb-5 bg-body rounded w-75 p-3"
                  type="id"
                  placeholder="ID"
                  id="inputID"
                  name="adminid"
                  maxlength="20"
                  style="box-shadow: 1px 1px 1px 1px green"
                />
              </div>
              <div>
                <label class="form-label" for="inputPW"> 패스워드 * </label>
              </div>
              <div>
                <input
                  class="form-control-plaintext form-control-lg shadow-sm p-3 mb-5 bg-body rounded w-75 p-3"
                  type="password"
                  placeholder="Password"
                  id="inputPW"
                  name="password"
                  maxlength="20"
                  style="box-shadow: 1px 1px 1px 1px green"
                />
              </div>
              <div>
                <button
                  class="btn btn-outline-success shadow p-3 mb-5 bg-body rounded"
                  type="submit"
                >
                  Sigh In
                </button>
              </div>
            </div>
          </form>
          `);
    response.send(html);
  },
  login_process: (request, response) => {
    var adminid = request.body.adminid;
    var password = request.body.password;
    if (adminid && password) {
      db.query(`SELECT adminid, password FROM admin WHERE adminid=? and password=?`,
        [adminid, password], (error, results, fields) => {
          if (results.length > 0) {
            request.session.is_logined = true;
            response.redirect('/userManage');
          } else {
            response.send(`<script type="text/javascript">
                    alert("로그인정보가 일치하지 않습니다.");
                    document.location.href="/login";
                  </script>`);
          };
        });
    } else {
      response.send(`<script type="text/javasript">
              alert("아이디와 비밀번호를 입력하세요.");
              document.location.href="/login";
            </script>`);
    };
  },
  logout: (request, response) => {
    request.session.destroy((error) => {
      if (error) {
        throw error;
      };
      response.redirect('/login');
    });
  },
  userManage: (request, response) => {
    db.query(`SELECT count(*) total FROM user`, (error, nums) => {
      if (error) {
        throw error;
      };
      var numPerPage = 8;
      var pageNum = request.params.pNum;
      var offs = (pageNum - 1) * numPerPage || 1;
      var totalPages = Math.ceil(nums[0].total / numPerPage);
      db.query(`SELECT * FROM user ORDER BY id desc, id LIMIT ? OFFSET ?`, [numPerPage, offs], (error, results) => {
        if (error) {
          console.error(error);
        }
        var table = `<table class="table table-hover table-borderless">
                <tbody class="table-group-divider">
                  <tr style="text-align: center; font-size: 150%;">
                  <td><b>#</b></td>
                  <td><b>사용자 ID</b></td>
                  <td><b>이름</b></td>
                  <td><b>정보 수정</b></td>
                  <td><b>계정 탈퇴</b></td>
                  <td><b>사용자 모니터링</b></td>
                  </tr>
                </tbody>`;

        var i = 0
        while (i < results.length) {
          table += `
              <tr style="text-align: center;">
              <th class="border-end" scope="row" style="font-size: 150%;"><b>${i + 1}</b></th>
              <td class="border-end"><b>${results[i].userid}</b></td>
              <td class="border-end"><b>${results[i].name}</b></td>
              <td class="border-end"><button type="button" class="btn btn-outline-success"><a href='/userManage/userUpdate/${results[i].id}' class="link-secondary" style="text-decoration: none;">사용자 정보 수정</a></button></td>
              <td class="border-end"><button type="button" class="btn btn-outline-success"><a href='/userManage/userDelete_process/${results[i].id}' onclick="return confirm('사용자를 탈퇴 시키겠습니까??');" class="link-secondary" style="text-decoration: none;">사용자 계정 탈퇴</a></button></td>
              <td class="border-end"><button type="button" class="btn btn-outline-success"><a href='/userManage/userMonitoring/${results[i].id}' class="link-secondary" style="text-decoration: none;">사용자 모니터링</a></button></td>
              </tr>
              `
          i++;
        }
        db.query(`SELECT count(*) AS total FROM user`, (error, countResult) => {
          var totalUsers = countResult[0].total;
          var totalPages = Math.ceil(totalUsers / numPerPage);

          var page = '<div>'
          var j = 1;
          while (j <= totalPages) {
            if (j == pageNum) {
              page += `<span style="font-weight: bold">${j}</span> &nbsp;&nbsp; `
            } else {
              page += `<span><a href="/userManage/${j}">${j}</a></span> &nbsp;&nbsp;`
            }
            j++
          }
          page += '</div>'

          var title = "사용자 목록"
          var html = template.HTML(title, '', '', `
              <div class="position-relative">
                ${table}
                <div class="position-absolute top-100 start-50 translate-middle fs-4" style="padding-top: 100px; text-shadow: 2px 2px 2px black">
                  ${page}
                </div>
                <div class="position-absolute top-0 start-100 translate-middle">
                  <button class="btn btn-outline-success" style="box-shadow: 1px 1px 1px 1px"><a href='/logout' class="link-secondary" style="text-decoration: none;">로그아웃</a></button>
                </div>
              </div>
              `)
          var html = template.HTML(title, '', '', `
              <div class="position-relative">
                ${table}
                <div class="position-absolute top-100 start-50 translate-middle fs-4" style="padding-top: 100px; text-shadow: 2px 2px 2px black">
                  ${page}
                </div>
                <div>
                  <button class="btn btn-outline-success" style="box-shadow: 1px 1px 1px 1px"><a href='/logout' class="link-secondary" style="text-decoration: none;">로그아웃</a></button>
                </div>
              </div>
              `)
          response.send(html);
        });
      });
    });
  },
  userUpdate: (request, response) => {
    var uId = request.params.uId;
    var pNum = request.params.pNum
    var title = "사용자 정보 수정";
    db.query(`SELECT * FROM user WHERE id=?`, uId, (error, result) => {
      if (error) {
        console.error(error);;
      };
      var context = {
        doc: `./views/update.ejs`,
        title: title,
        userid: result[0].userid,
        password: result[0].password,
        name: result[0].name,
        email: result[0].email,
        phone: result[0].phone,
        gender: result[0].gender,
        pNum: pNum,
        uId: uId,
        id: "adminid"
      }
      request.app.render('index', context, (error, html) => {
        if (error) {
          console.error(error);
        }
        response.end(html);
      });
    });
  },
  userUpdate_process: (request, response) => {
    var body = '';
    request.on('data', (data) => {
      body += data;
    });
    request.on('end', () => {
      var uId = request.params.uId;
      var user = qs.parse(body);
      db.query(`UPDATE user SET userid=?, password=?, name=?, email=?, phone=?, gender=? WHERE id=?`,
        [user.userid, user.password, user.name, user.email, user.phone, user.gender, uId], (error) => {
          if (error) {
            console.error(error);
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end('An error occurred');
            return;
          }
          response.writeHead(302, { Location: '/userManage' });
          response.end();
        });
    });
  },

  userSuspend: (request, response) => {
    var uId = request.params.id;
    db.query(`SELECT * FROM user WHERE id=?`, [uId], (error, result) => {
      if (error) {
        throw error;
      };

    });
  },
  userDelete_process: (request, response) => {
    var uId = request.params.uId;
    db.query(`DELETE FROM user WHERE id=?`, [uId], (error) => {
      if (error) {
        throw error;
      };
      response.writeHead(302, { Location: `/userManage` });
      response.end();
    });
  },
  userMonitoring: (request, response) => {
    var uId = request.params.uId;
    db.query(`SELECT * FROM user WHERE id=?`, [uId], (error, result) => {
      if (error) {
        throw error;
      }
      var title = `${result[0].userid} 모니터링`
      var context = template.HTML(title, '', '', `
            <div class="dropdown">
              <a class="btn btn-secondary dropdown-toggle" href="/userManage/userMonitoring/${uId}" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                기능별 모니터링
              </a>

              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="/userManage/userMonitoring_light/${uId}">light</a></li>
                <li><a class="dropdown-item" href="/userManage/userMonitoring_window/${uId}">window</a></li>
                <li><a class="dropdown-item" href="/userManage/userMonitoring_aircon/${uId}">aircon</a></li>
                <li><a class="dropdown-item" href="/userManage/userMonitoring_alert/${uId}">alert</a></li>
              </ul>
            </div>
            <div style="width: 900px; height: 900px;">
                <canvas id="myChart"></canvas>
              </div>
              <script type="text/javascript">
                var context = document
                  .getElementById('myChart')
                  .getContext('2d');
                var myChart = new Chart(context, {
                  type: 'line',
                  data: {
                    labels: [
                      '5월 20일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 21일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 22일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 23일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 24일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 25일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 26일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                    ],
                    datasets: [
                      {
                        label: '사용자 모니터링',
                        fill: false,
                        data: [],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                      }
                    ]
                  },
                  options: {
                      scales: {
                          yAxes: [
                              {
                                  ticks: {
                                      beginAtZero: true
                                  }
                              }
                          ]
                      }
                  }
              });
              </script>
            `)
      console.log(error);
      response.writeHead(200);
      response.end(context);
    })
  },
  userMonitoring_light: (request, response) => {
    var uId = request.params.uId;
    db.query(`SELECT * FROM user WHERE id=?`, [uId], (error, result) => {
      if (error) {
        throw error;
      };
      var userid = result[0].userid;
      db.query(`SELECT light_value FROM light WHERE userid=?`, [userid], (error, values) => {
        if (error) {
          console.error(error);
        }
        var title = `${result[0].userid} 조명 모니터링`;
        var context = template.HTML(title, '', '', `
              <div class="dropdown">
                <a class="btn btn-secondary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  기능별 모니터링
                </a>

                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="/userManage/userMonitoring_light/${uId}">light</a></li>
                  <li><a class="dropdown-item" href="/userManage/userMonitoring_window/${uId}">window</a></li>
                  <li><a class="dropdown-item" href="/userManage/userMonitoring_aircon/${uId}">aircon</a></li>
                  <li><a class="dropdown-item" href="/userManage/userMonitoring_alert/${uId}">alert</a></li>
                </ul>
              </div>
              <div style="width: 900px; height: 900px;">
                <canvas id="myChart"></canvas>
              </div>
              <script type="text/javascript">
                var context = document
                  .getElementById('myChart')
                  .getContext('2d');
                var myChart = new Chart(context, {
                  type: 'line',
                  data: {
                    labels: [
                      '5월 20일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 21일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 22일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 23일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 24일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 25일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 26일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                    ],
                    datasets: [
                      {
                        label: '${userid}의 조도 센서값',
                        fill: false,
                        data: [${values.map(obj => obj.light_value).join(',')}],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                      }
                    ]
                  },
                  options: {
                      scales: {
                          yAxes: [
                              {
                                  ticks: {
                                      beginAtZero: true
                                  }
                              }
                          ]
                      }
                  }
              });
              </script>
              `)
        response.writeHead(200);
        response.end(context);
      });
    });
  },
  userMonitoring_window: (request, response) => {
    var uId = request.params.uId;
    db.query('SELECT * FROM user WHERE id=?', [uId], (error, result) => {
      if (error) {
        throw error;
      };
      var userid = result[0].userid;
      db.query('SELECT humidity FROM window WHERE userid=?', [userid], (error, values) => {
        if (error) {
          console.error(error);
        }
        var title = `${result[0].userid} 창문 모니터링`;
        var context = template.HTML(title, '', '', `
              <div class="dropdown">
                <a class="btn btn-secondary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  기능별 모니터링
                </a>

                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="/userManage/userMonitoring_light/${uId}">light</a></li>
                  <li><a class="dropdown-item" href="/userManage/userMonitoring_window/${uId}">window</a></li>
                  <li><a class="dropdown-item" href="/userManage/userMonitoring_aircon/${uId}">aircon</a></li>
                  <li><a class="dropdown-item" href="/userManage/userMonitoring_alert/${uId}">alert</a></li>
                </ul>
              </div>
              <div style="width: 900px; height: 900px;">
                <canvas id="myChart"></canvas>
              </div>
              <script type="text/javascript">
                var context = document
                  .getElementById('myChart')
                  .getContext('2d');
                var myChart = new Chart(context, {
                  type: 'line',
                  data: {
                    labels: [
                      '5월 20일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 21일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 22일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 23일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 24일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 25일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 26일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                    ],
                    datasets: [
                      {
                        label: '${userid}의 습도 센서값',
                        fill: false,
                        data: [${values.map(obj => obj.humidity).join(',')}],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                      }
                    ]
                  },
                  options: {
                      scales: {
                          yAxes: [
                              {
                                  ticks: {
                                      beginAtZero: true
                                  }
                              }
                          ]
                      }
                  }
              });
              </script>
              `)
        response.writeHead(200);
        response.end(context);
      });
    });
  },
  userMonitoring_aircon: (request, response) => {
    var uId = request.params.uId;
    db.query(`SELECT * FROM user WHERE id=?`, [uId], (error, result) => {
      if (error) {
        throw error;
      };
      var userid = result[0].userid;
      db.query(`SELECT temp FROM aircon WHERE userid=?`, [userid], (error, values) => {
        if (error) {
          console.error(error);
        }
        var title = `${result[0].userid} 에어콘 모니터링`;
        var context = template.HTML(title, '', '', `
              <div class="dropdown">
                <a class="btn btn-secondary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  기능별 모니터링
                </a>

                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="/userManage/userMonitoring_light/${uId}">light</a></li>
                  <li><a class="dropdown-item" href="/userManage/userMonitoring_window/${uId}">window</a></li>
                  <li><a class="dropdown-item" href="/userManage/userMonitoring_aircon/${uId}">aircon</a></li>
                  <li><a class="dropdown-item" href="/userManage/userMonitoring_alert/${uId}">alert</a></li>
                </ul>
              </div>
              <div style="width: 900px; height: 900px;">
                <canvas id="myChart"></canvas>
              </div>
              <script type="text/javascript">
                var context = document
                  .getElementById('myChart')
                  .getContext('2d');
                var myChart = new Chart(context, {
                  type: 'line',
                  data: {
                    labels: [
                      '5월 20일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 21일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 22일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 23일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 24일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 25일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 26일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                    ],
                    datasets: [
                      {
                        label: '${userid}의 온도 센서값',
                        fill: false,
                        data: [${values.map(obj => obj.temp).join(',')}],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                      }
                    ]
                  },
                  options: {
                      scales: {
                          yAxes: [
                              {
                                  ticks: {
                                      beginAtZero: true
                                  }
                              }
                          ]
                      }
                  }
              });
              </script>
              `)
        response.writeHead(200);
        response.end(context);
      });
    });
  },
  userMonitoring_alert: (request, response) => {
    var uId = request.params.uId;
    db.query(`SELECT * FROM user WHERE id=?`, [uId], (error, result) => {
      if (error) {
        throw error;
      };
      var userid = result[0].userid;
      db.query(`SELECT distance FROM alert WHERE userid=?`, [userid], (error, values) => {
        if (error) {
          console.error(error);
        }
        var title = `${result[0].userid} 경보 모니터링`;
        var context = template.HTML(title, '', '', `
              <div class="dropdown">
                <a class="btn btn-secondary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  기능별 모니터링
                </a>

                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="/userManage/userMonitoring_light/${uId}">light</a></li>
                  <li><a class="dropdown-item" href="/userManage/userMonitoring_window/${uId}">window</a></li>
                  <li><a class="dropdown-item" href="/userManage/userMonitoring_aircon/${uId}">aircon</a></li>
                  <li><a class="dropdown-item" href="/userManage/userMonitoring_alert/${uId}">alert</a></li>
                </ul>
              </div>
              <div style="width: 900px; height: 900px;">
                <canvas id="myChart"></canvas>
              </div>
              <script type="text/javascript">
                var context = document
                  .getElementById('myChart')
                  .getContext('2d');
                var myChart = new Chart(context, {
                  type: 'line',
                  data: {
                    labels: [
                      '5월 20일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 21일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 22일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 23일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 24일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 25일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                      '5월 26일','5월 12시','5월 13시','5월 14시','5월 15시','5월 16시','5월 17시',
                    ],
                    datasets: [
                      {
                        label: '${userid}의 거리 센서값',
                        fill: false,
                        data: [${values.map(obj => obj.distance).join(',')}],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                      }
                    ]
                  },
                  options: {
                      scales: {
                          yAxes: [
                              {
                                  ticks: {
                                      beginAtZero: true
                                  }
                              }
                          ]
                      }
                  }
              });
              </script>
              `)
        response.writeHead(200);
        response.end(context);
      });
    });
  },
};
