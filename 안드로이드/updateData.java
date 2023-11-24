package com.cookandroid.smarthome2;

import com.google.gson.annotations.SerializedName;

public class updateData {
    @SerializedName("uId")
    int uId;
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
    String gender;


    public updateData(String userid, String password, String name, String email, String phone, String gender) {

        this.userid = userid;
        this.password = userid;
        this.name = userid;
        this.email = userid;
        this.phone = userid;
        this.gender = gender;
    }

}
