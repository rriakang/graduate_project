package com.cookandroid.smarthome2;

import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import java.io.BufferedReader;
import java.io.PrintWriter;
import java.net.Socket;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Switch;
import android.widget.Toast;
import android.content.SharedPreferences;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class alert extends AppCompatActivity {

    private Socket clientSocket;
    private BufferedReader inputReader;
    private PrintWriter outputWriter;  // 추가된 출력 스트림
    private ProgressBar mProgressView;
    private ApiService service;

    private static final String SERVER_IP = "172.30.1.3";
    private static final int SERVER_PORT = 60002;

    private static final int MESSAGE_READ = 1;

    private SocketClient socketClient;
    private SocketClient socket;

    Switch switchAgree;
    boolean switchState;
    Button btnQuit;
    Button btndistance;
    EditText edit1;

    String user_distance;
    String user_id;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_alert);
        setTitle("경보음 알림");

        // 위젯을 변수에 대입
        switchAgree = (Switch) findViewById(R.id.switchAgree);
        mProgressView = (ProgressBar) findViewById(R.id.dis_progress);
        service = RetrofitClient.getClient().create(ApiService.class);

        edit1 = (EditText) findViewById(R.id.Edit1);

        btnQuit = (Button) findViewById(R.id.BtnQuit);
        btndistance = (Button) findViewById(R.id.Btndistance);
        socketClient = new SocketClient();

        switchState = getSwitchStateFromPreferences();
        switchAgree.setChecked(switchState);


        // 동의함 체크박스의 체크가 변경되면
        switchAgree
                .setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
                    public void onCheckedChanged(CompoundButton arg0, boolean isChecked) {
                        switchState = isChecked;
                        // 체크되면 모두 보이도록 설정
                        if (switchAgree.isChecked() == true) {
                            socketClient.sendAlert("Alert On");
                        } else{
                            socketClient.sendAlert("Alert Off");
                        }
                    }
                });

        // 종료 버튼을 클릭하면
        btnQuit.setOnClickListener(new View.OnClickListener() {
            public void onClick(View arg0) {
                finish();
            }
        });
        btndistance.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptDis();
                socketClient.sendAlert("userid:" + user_id);
                socketClient.sendAlert(user_id);
                socketClient.sendAlert("userdistance:" + user_distance);
                socketClient.sendAlert(user_distance);
            }
        });
    }

    @Override
    protected void onPause() {
        super.onPause();
        saveSwitchStateToPreferences(switchState);
    }

    private boolean getSwitchStateFromPreferences() {
        SharedPreferences preferences = getPreferences(MODE_PRIVATE);
        return preferences.getBoolean("switch_state", false);
    }

    private void saveSwitchStateToPreferences(boolean state) {
        SharedPreferences preferences = getPreferences(MODE_PRIVATE);
        SharedPreferences.Editor editor = preferences.edit();
        editor.putBoolean("switch_state", state);
        editor.apply();
    }
    private void attemptDis() {
        edit1.setError(null);
        user_distance = edit1.getText().toString();

        boolean cancel = false;
        View focusView = null;

        if (user_distance.isEmpty()) {
            edit1.setError("거리를 입력해주세요.");
            focusView = edit1;
            cancel = true;
        }
        if (cancel) {
            focusView.requestFocus();
        } else {
            SharedPreferences loginId = getSharedPreferences("userid", Activity.MODE_PRIVATE);
            String userid = loginId.getString("loginUserid", "");
            Toast.makeText(alert.this, userid, Toast.LENGTH_SHORT).show();
            startDis(new disData(user_distance, userid, user_id=userid));
            showProgress(true);
        }
    }
    private void startDis(disData data) {
        service.alarm(data).enqueue(new Callback<disResponse>() {
                @Override
                public void onResponse(Call<disResponse> call, Response<disResponse> response) {
                    disResponse result = response.body();
                    Toast.makeText(alert.this, result.getMessage(), Toast.LENGTH_SHORT).show();
                    showProgress(false);

                    if (result.getCode() == 200) {
                    }
                }

                @Override
                public void onFailure(Call<disResponse> call, Throwable t) {
                    Toast.makeText(alert.this, "거리 에러 발생", Toast.LENGTH_SHORT).show();
                    Log.e("거리 에러 발생", t.getMessage());
                    showProgress(false);
                }
            });
            }

       private void showProgress(boolean show) {
           mProgressView.setVisibility(show ? View.VISIBLE : View.GONE);
       }
}