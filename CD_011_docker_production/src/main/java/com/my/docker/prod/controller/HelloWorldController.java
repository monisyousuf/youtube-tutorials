package com.my.docker.prod.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public class HelloWorldController {

    @GetMapping
    public String sayHello() {
        return "hello-world";
    }
}
