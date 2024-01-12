package com.my.docker.controller;

import com.my.docker.dto.CreateUserDto;
import com.my.docker.dto.SuccessResponseDto;
import com.sun.net.httpserver.Authenticator;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UserDetailsController {

    private static final Logger LOG = LoggerFactory.getLogger(UserDetailsController.class);


    @PostMapping("")
    public ResponseEntity<SuccessResponseDto> submitUserDetails(@Valid @RequestBody @NotNull CreateUserDto userData) {
        LOG.info("Received User Data {}", userData);
        SuccessResponseDto successResponse = SuccessResponseDto.builder()
                .message("Operation Completed Successfully")
                .operation(SuccessResponseDto.Operation.CREATE_USER)
                .build();
        return new ResponseEntity<>(successResponse, HttpStatus.OK);
    }

}
