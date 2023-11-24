package com.cookandroid.smarthome2;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class userUpdate extends AppCompatActivity {

    private AutoCompleteTextView mUseridView;
    private EditText mPasswordView;
    private EditText mNameView;
    private EditText mphoneView;
    private EditText mEmailView;
    private EditText mGenderView;
    private Button mUsermodificationButton;
    private Button mBackButton;
    private ProgressBar mProgressView;
    private ApiService service;


    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_usermodification);
        getSupportActionBar().setDisplayShowHomeEnabled(true);
        getSupportActionBar().setTitle("회원정보 수정");

        service = RetrofitClient.getClient().create(ApiService.class);

        mUseridView = (AutoCompleteTextView) findViewById(R.id.et_userid);
        mPasswordView = (EditText) findViewById(R.id.et_password);
        mNameView = (EditText) findViewById(R.id.et_name);
        mphoneView = (EditText) findViewById(R.id.et_phone);
        mEmailView = (EditText) findViewById(R.id.et_email);
        mGenderView = (EditText) findViewById(R.id.et_gender);
        mUsermodificationButton = (Button) findViewById(R.id.mUsermodification_button);
        mBackButton = (Button) findViewById(R.id.mBackButton);
        mProgressView = (ProgressBar) findViewById(R.id.update_progress);

        mUsermodificationButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptUpdate();
            }
        });

        mBackButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        String userid = loginActivity.userid;

        getUserInfo(userid);
    }


    private void getUserInfo(String userid) {
        Call<updateResponse> call = service.getUserUpdate(userid);
        call.enqueue((new Callback<updateResponse>() {
            @Override
            public void onResponse(Call<updateResponse> call, Response<updateResponse> response) {
                if (response.isSuccessful()) {
                    updateResponse result = response.body();
                    String userid = result.getUserid();
                    String password = result.getPassword();
                    String name = result.getName();
                    String email = result.getEmail();
                    String phone = result.getPhone();
                    String gender = result.getGender();

                    mUseridView.setText(userid);
                    mPasswordView.setText(password);
                    mNameView.setText(name);
                    mEmailView.setText(email);
                    mphoneView.setText(phone);
                    mGenderView.setText(gender);

                } else {
                    Toast.makeText(userUpdate.this, "기존 회원 정보를 가져오는데 실패했습니다.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<updateResponse> call, Throwable t) {
                Toast.makeText(userUpdate.this, "업데이트 에러 발생", Toast.LENGTH_SHORT).show();
                Log.e("userData()", "error:" + t.getMessage());
                showProgress(false);
            }
        }));
    }

    private void attemptUpdate() {
        mUseridView.setError(null);
        mPasswordView.setError(null);
        mNameView.setError(null);
        mEmailView.setError(null);
        mphoneView.setError(null);
        mGenderView.setError(null);

        String userid = mUseridView.getText().toString();
        String password = mPasswordView.getText().toString();
        String name = mNameView.getText().toString();
        String email = mEmailView.getText().toString();
        String phone = mphoneView.getText().toString();
        String gender = mGenderView.getText().toString();

        boolean cancel = false;
        View focusView = null;

        if (userid.isEmpty()) {
            mUseridView.setError("아이디를 입력해주세요.");
            focusView = mUseridView;
            cancel = true;
        }

        if (password.isEmpty()) {
            mPasswordView.setError("비밀번호를 입력해주세요.");
            focusView = mPasswordView;
            cancel = true;
        } else if (!isPasswordValid(password)) {
            mPasswordView.setError("6자 이상의 비밀번호를 입력해주세요.");
            focusView = mPasswordView;
            cancel = true;
        }

        if (name.isEmpty()) {
            mNameView.setError("이름을 입력해주세요.");
            focusView = mNameView;
            cancel = true;
        }

        if (phone.isEmpty()) {
            mphoneView.setError("핸드폰 번호를 입력해주세요.");
            focusView = mphoneView;
            cancel = true;
        }

        if (email.isEmpty()) {
            mEmailView.setError("이메일을 입력해주세요.");
            focusView = mEmailView;
            cancel = true;
        } else if (!isEmailValid(email)) {
            mEmailView.setError("@를 포함한 유효한 이메일을 입력하세요.");
            focusView = mEmailView;
            cancel = true;
        }

        if (gender.isEmpty()) {
            mGenderView.setError("성별을 입력해주세요.");
            focusView = mGenderView;
            cancel = true;
        }

        if (cancel) {
            focusView.requestFocus();
        } else {
            startUpdateProcess(new updateProcessData(userid, password, name, phone, email, gender));
            showProgress(true);
        }
    }

    private void startUpdateProcess(updateProcessData data) {
        service.userProcess(data).enqueue(new Callback<updateProcessResponse>() {
            @Override
            public void onResponse(Call<updateProcessResponse> call, Response<updateProcessResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    updateProcessResponse result = response.body();
                    Toast.makeText(userUpdate.this, result.getMessage(), Toast.LENGTH_SHORT).show();
                    showProgress(false);

                    if (result.getCode() == 200) {
                        Toast.makeText(userUpdate.this, "회원정보가 업데이트되었습니다.", Toast.LENGTH_SHORT).show();
                        finish();
                    } else {
                        Toast.makeText(userUpdate.this, "회원정보 업데이트에 실패했습니다.", Toast.LENGTH_SHORT).show();
                    }
                }
            }


            @Override
            public void onFailure(Call<updateProcessResponse> call, Throwable t) {
                Toast.makeText(userUpdate.this, "회원정보 수정 오류", Toast.LENGTH_SHORT).show();
                Log.e("getUserData()", "error : " + t.getMessage());
                showProgress(false);
            }
        });
    }


    private boolean isEmailValid(String email) {
        return email.contains("@");
    }

    private boolean isPasswordValid(String password) {
        return password.length() >= 6;
    }

    private void showProgress(boolean show) {
        mProgressView.setVisibility(show ? View.VISIBLE : View.GONE);
    }
}