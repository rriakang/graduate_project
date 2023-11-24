package com.cookandroid.smarthome2;

import com.google.gson.annotations.SerializedName;

public class updateProcessData {
    @SerializedName("userid")
    String userid;

    @SerializedName("password")
    String password;

    @SerializedName("name")
    String name;

    @SerializedName("email")
    String email;

    @SerializedName("phone")
    String phone;

    @SerializedName("gender")
    String gender ;


    public updateProcessData(String userid, String password, String name, String email, String phone, String gender) {
        this.userid  = userid;
        this.password = password;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.gender = gender;
    }
}
