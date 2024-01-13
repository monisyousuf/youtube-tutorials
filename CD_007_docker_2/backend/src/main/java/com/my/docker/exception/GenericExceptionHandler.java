package com.my.docker.exception;

import com.my.docker.dto.ErrorDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.postgresql.util.PSQLException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GenericExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger LOG = LoggerFactory.getLogger(GenericExceptionHandler.class);

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        ErrorDto errorBody = ErrorDto.builder()
                .error(ex
                        .getFieldErrors()
                        .stream()
                        .map(DefaultMessageSourceResolvable::getDefaultMessage)
                        .collect(Collectors.toList()))
                .type(ErrorDto.ErrorType.VALIDATION_ERROR)
                .build();
        LOG.info("Error DTO: {}", errorBody);
        return handleExceptionInternal(ex, errorBody, headers, status, request);
    }

    @ExceptionHandler({RuntimeException.class})
    protected ResponseEntity<ErrorDto> handleGeneralException(RuntimeException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        ErrorDto.builder()
                                .type(ErrorDto.ErrorType.UNKNOWN)
                                .error(List.of("Unknown Error Occurred"))
                                .build()
                );

    }

    @ExceptionHandler({UserAlreadyExistsException.class})
    protected ResponseEntity<ErrorDto> handleUserAlreadyExistsException(UserAlreadyExistsException ex) {
        LOG.error(ex.toString());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        ErrorDto.builder()
                                .type(ErrorDto.ErrorType.USER_ALREADY_EXISTS)
                                .error(List.of(ex.getMessage()))
                                .build()
                );

    }
}
