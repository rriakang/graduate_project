package com.cookandroid.smarthome2;


import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Field;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;


public interface ApiService {

    @POST("/users/login")
    Call<loginResponse> userLogin(@Body loginData data);

    @POST("/users/register")
    Call<joinResponse> userJoin(@Body joinData data);

    @GET("/users/update/{userid}")
    Call<updateResponse> getUserUpdate(@Path("userid") String userid);

    @POST("/users/update_process")
    Call<updateProcessResponse> userProcess(@Body updateProcessData data);

}
