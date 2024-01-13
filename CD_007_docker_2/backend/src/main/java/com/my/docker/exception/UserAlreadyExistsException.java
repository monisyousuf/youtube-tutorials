package com.my.docker.exception;

import com.my.docker.dto.ErrorDto;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Builder
@ToString
@Setter
@Getter
public class UserAlreadyExistsException extends RuntimeException{

    ErrorDto.ErrorType errorType;
    String message;

}
