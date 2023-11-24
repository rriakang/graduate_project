package com.cookandroid.smarthome2;

import com.google.gson.annotations.SerializedName;

public class updateProcessResponse {
    @SerializedName("code")
    private int code;

    @SerializedName("message")
    private String message;

    @SerializedName("userid")
    private String userid;

    @SerializedName("password")
    private String password;

    @SerializedName("name")
    private String name;

    @SerializedName("email")
    private String email;

    @SerializedName("phone")
    private String phone;

    @SerializedName("gender")
    private String gender;

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public String getUserid() {
        return userid;
    }

    public String getPassword() {
        return password;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getGender() {
        return gender;
    }
}
