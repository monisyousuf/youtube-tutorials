package com.my.docker.persistence.repository;

import com.my.docker.persistence.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    UserEntity findByEmail(String email);
    UserEntity findByPhoneNumber(String phoneNumber);

}
