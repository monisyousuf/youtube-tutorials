package com.my.docker.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Builder;
import lombok.ToString;
import lombok.Value;

@Value
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class SuccessResponseDto {

    Operation operation;
    String message;

    @ToString
    public enum Operation {
        CREATE_USER
    }

}
