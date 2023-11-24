package com.cookandroid.smarthome2;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Switch;
import android.widget.Toast;
import android.content.SharedPreferences;

import androidx.appcompat.app.AppCompatActivity;

import java.io.BufferedReader;
import java.io.PrintWriter;
import java.net.Socket;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class window extends AppCompatActivity {
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

    Switch switchAgree, switchAuto;
    boolean switchAgreeState, switchAutoState;

    Button btnQuit;

    Button btnhumidity;

    EditText edit1;

    String num1;

    String user_humi;
    String user_id;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_window);
        setTitle("스마트 윈도우");

        // 위젯을 변수에 대입
        switchAgree = (Switch) findViewById(R.id.switchAgree);
        switchAuto = (Switch) findViewById(R.id.switchAuto);

        edit1 = (EditText) findViewById(R.id.Edit1);

        btnQuit = (Button) findViewById(R.id.BtnQuit);
        btnhumidity = (Button) findViewById(R.id.Btnhumidity);

        mProgressView = (ProgressBar) findViewById(R.id.humi_progress);
        service = RetrofitClient.getClient().create(ApiService.class);

        socketClient = new SocketClient();

        switchAgreeState = getSwitchAgreeStateFromPreferences();
        switchAgree.setChecked(switchAgreeState);

        switchAutoState = getSwitchAutoStateFromPreferences();
        switchAuto.setChecked(switchAutoState);


        // 동의함 체크박스의 체크가 변경되면
        switchAgree
                .setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
                    public void onCheckedChanged(CompoundButton arg0,
                                                 boolean isChecked) {
                        switchAgreeState = isChecked;
                        // 체크되면 모두 보이도록 설정
                        if (switchAgree.isChecked() == true) {
                            switchAuto.setChecked(false); // 스위치 2를 해제;
                            socketClient.sendwin("window On");

                        } else {
                            switchAgree.setChecked(false);
                            socketClient.sendwin("window Off");
                        }
                    }
                });

        switchAuto
                .setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
                    public void onCheckedChanged(CompoundButton arg0,
                                                 boolean isChecked) {
                        switchAutoState = isChecked;
                        // 체크되면 모두 보이도록 설정
                        if (switchAuto.isChecked() == true) {
                            switchAgree.setChecked(false);
                            socketClient.sendwin("windowAuto On");
                        } else {
                            switchAuto.setChecked(false);
                            socketClient.sendwin("windowAuto Off");
                        }
                    }
                });

        // 종료 버튼을 클릭하면
        btnQuit.setOnClickListener(new View.OnClickListener() {
            public void onClick(View arg0) {
                finish();
            }
        });
        btnhumidity.setOnClickListener(new View.OnClickListener() {
            public void onClick(View arg0) {
               attemptHumi();
                socketClient.sendwin("userid:" + user_id);
                socketClient.sendwin(user_id);
               socketClient.sendwin("userhumi:" + user_humi);
               socketClient.sendwin(user_humi);
            }
        });

    }
    @Override
    protected void onPause() {
        super.onPause();
        saveSwitchAgreeStateToPreferences(switchAgreeState);
        saveSwitchAutoStateToPreferences(switchAutoState);
    }

    private boolean getSwitchAgreeStateFromPreferences() {
        SharedPreferences preferences = getPreferences(MODE_PRIVATE);
        return preferences.getBoolean("switch_agree_state", false);
    }

    private void saveSwitchAgreeStateToPreferences(boolean state) {
        SharedPreferences preferences = getPreferences(MODE_PRIVATE);
        SharedPreferences.Editor editor = preferences.edit();
        editor.putBoolean("switch_agree_state", state);
        editor.apply();
    }

    private boolean getSwitchAutoStateFromPreferences() {
        SharedPreferences preferences = getPreferences(MODE_PRIVATE);
        return preferences.getBoolean("switch_auto_state", false);
    }

    private void saveSwitchAutoStateToPreferences(boolean state) {
        SharedPreferences preferences = getPreferences(MODE_PRIVATE);
        SharedPreferences.Editor editor = preferences.edit();
        editor.putBoolean("switch_auto_state", state);
        editor.apply();
    }

    private void attemptHumi() {
        edit1.setError(null);
        user_humi = edit1.getText().toString();

        boolean cancel = false;
        View focusView = null;

        if (user_humi.isEmpty()) {
            edit1.setError("습도를 입력해주세요.");
            focusView = edit1;
            cancel = true;
        }
        if (cancel) {
            focusView.requestFocus();
        } else {
            SharedPreferences loginId = getSharedPreferences("userid", Activity.MODE_PRIVATE);
            String userid = loginId.getString("loginUserid", "");
            Toast.makeText(window.this, userid, Toast.LENGTH_SHORT).show();
            startHumi(new winData(user_humi, userid, user_id=userid));
            showProgress(true);
        }
    }
    private void startHumi(winData data) {
        service.humi(data).enqueue(new Callback<winResponse>() {
            @Override
            public void onResponse(Call<winResponse> call, Response<winResponse> response) {
                winResponse result = response.body();
                Toast.makeText(window.this, result.getMessage(), Toast.LENGTH_SHORT).show();
                showProgress(false);

                if (result.getCode() == 200) {
                }
            }

            @Override
            public void onFailure(Call<winResponse> call, Throwable t) {
                Toast.makeText(window.this, "습도 에러 발생", Toast.LENGTH_SHORT).show();
                Log.e("습도 에러 발생", t.getMessage());
                showProgress(false);
            }
        });
    }

    private void showProgress(boolean show) {
        mProgressView.setVisibility(show ? View.VISIBLE : View.GONE);
    }
}




