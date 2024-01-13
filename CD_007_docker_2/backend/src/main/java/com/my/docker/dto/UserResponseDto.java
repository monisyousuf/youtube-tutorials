package com.my.docker.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.my.docker.persistence.entity.UserEntity;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UserResponseDto {

    String id;
    String fullName;
    String email;
    String phoneNumber;

    public static UserResponseDto from(UserEntity userEntity) {
        return UserResponseDto.builder()
                .id(userEntity.getId().toString())
                .fullName(userEntity.getFullName())
                .email(userEntity.getEmail())
                .phoneNumber(userEntity.getPhoneNumber())
                .build();
    }
}
