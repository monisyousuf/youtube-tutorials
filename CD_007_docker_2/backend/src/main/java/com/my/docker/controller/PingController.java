package com.my.docker.controller;

import com.my.docker.dto.Pong;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ping")
public class PingController {

    private static final Logger LOG = LoggerFactory.getLogger(PingController.class);

    @GetMapping("")
    public ResponseEntity<Pong> handlePing() {
        LOG.debug("Health Check Ping Endpoint Called");
        return ResponseEntity.ok(
                Pong.builder()
                        .ping("pong")
                        .build()
                );
    }
}
