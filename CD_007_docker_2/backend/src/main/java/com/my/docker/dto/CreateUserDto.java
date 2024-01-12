package com.my.docker.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CreateUserDto {

    @NotEmpty(message = "Name cannot be empty")
    String fullName;

    @NotEmpty(message = "Email cannot be empty") @Email(message = "Malformed Email")
    String email;

    @NotEmpty(message = "Phone Number cannot be empty") @Pattern(regexp="[\\d]{10}", message = "Phone number must be 10 digits")
    String phoneNumber;

}
