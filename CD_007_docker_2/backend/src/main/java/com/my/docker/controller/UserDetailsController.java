package com.my.docker.controller;

import com.my.docker.dto.CreateUserDto;
import com.my.docker.dto.ErrorDto;
import com.my.docker.dto.SuccessResponseDto;
import com.my.docker.dto.UserResponseDto;
import com.my.docker.exception.UserAlreadyExistsException;
import com.my.docker.persistence.entity.UserEntity;
import com.my.docker.persistence.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user")
public class UserDetailsController {

    private static final Logger LOG = LoggerFactory.getLogger(UserDetailsController.class);

    //Ideally should be in Service class, added here only for demo purposes
    @Autowired
    private UserRepository userRepository;


    @PostMapping("")
    public ResponseEntity<SuccessResponseDto> submitUserDetails(@Valid @RequestBody @NotNull CreateUserDto userData) {
        LOG.info("Received User Data {}", userData);
        if (userRepository.findByEmail(userData.getEmail()) != null) {
            throw userAlreadyExistsException("A user with this email already exists");
        }
        if(userRepository.findByPhoneNumber(userData.getPhoneNumber()) != null) {
            throw userAlreadyExistsException("A user with this phone number already exists");
        }

        UserEntity user = UserEntity.builder()
                .fullName(userData.getFullName())
                .phoneNumber(userData.getPhoneNumber())
                .email(userData.getEmail())
                .build();
        user = userRepository.save(user);
        LOG.info("Data Saved Successfully : {}", user);
        SuccessResponseDto successResponse = SuccessResponseDto.builder()
                .message("Success. User ID : " + user.getId())
                .operation(SuccessResponseDto.Operation.CREATE_USER)
                .build();
        return new ResponseEntity<>(successResponse, HttpStatus.CREATED);
    }


    @GetMapping("")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(
                userRepository.findAll().stream().map(UserResponseDto::from).collect(Collectors.toList())
        );
    }



    private UserAlreadyExistsException userAlreadyExistsException(String message) {
        return UserAlreadyExistsException
                .builder()
                .errorType(ErrorDto.ErrorType.USER_ALREADY_EXISTS)
                .message(message)
                .build();
    }

}
