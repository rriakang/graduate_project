package com.cookandroid.smarthome2;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.Switch;

import java.io.BufferedReader;
import java.io.PrintWriter;
import java.net.Socket;
import android.content.SharedPreferences;

public class light extends AppCompatActivity {

    private Socket clientSocket;
    private BufferedReader inputReader;
    private PrintWriter outputWriter;  // 추가된 출력 스트림

    private static final String SERVER_IP = "172.30.1.3";
    private static final int SERVER_PORT = 60002;

    private static final int MESSAGE_READ = 1;

    private SocketClient socketClient;

    Switch switchAgree,switchAuto;
    boolean switchAgreeState, switchAutoState;

    Button btnQuit;

    private SocketClient socket;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_light);
        setTitle("스마트 조명");

        btnQuit = (Button) findViewById(R.id.btnQuit);
        switchAgree = (Switch) findViewById(R.id.switchAgree);
        switchAuto = (Switch) findViewById(R.id.switchAuto);

        switchAgreeState = getSwitchAgreeStateFromPreferences();
        switchAgree.setChecked(switchAgreeState);

        switchAutoState = getSwitchAutoStateFromPreferences();
        switchAuto.setChecked(switchAutoState);

        socketClient = new SocketClient();

        switchAgree
                .setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
                    public void onCheckedChanged(CompoundButton arg0,
                                                 boolean isChecked) {
                        switchAgreeState = isChecked;
                        // 체크되면 모두 보이도록 설정
                        if (switchAgree.isChecked() == true) {
                            switchAuto.setChecked(false); // 스위치 2를 해제;
                            socketClient.sendMessage("Led On");
                        } else {
                            switchAgree.setChecked(false);
                            socketClient.sendMessage("Led Off");
                        }
                    }
                });

        switchAuto
                .setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
                    public void onCheckedChanged(CompoundButton arg0,
                                                 boolean isChecked) {
                        switchAutoState = isChecked;
                        // 체크되면 모두 보이도록 설정
                        if (switchAuto.isChecked()== true) {
                            switchAgree.setChecked(false);
                            socketClient.sendMessage("Auto On");
                        } else {
                            switchAuto.setChecked(false);
                            socketClient.sendMessage("Auto Off");
                        }
                    }
                });



        // 종료 버튼을 클릭하면
        btnQuit.setOnClickListener(new View.OnClickListener() {
            public void onClick(View arg0) {
                finish();
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

}



