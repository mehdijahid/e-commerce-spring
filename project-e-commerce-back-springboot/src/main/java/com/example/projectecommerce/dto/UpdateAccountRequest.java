package com.example.projectecommerce.dto;

public record UpdateAccountRequest(String name, String email, String currentPassword, String newPassword) {
}
