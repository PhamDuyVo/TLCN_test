package com.cinema.booking.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.Locale;

/** Reads both Java and legacy Node values; writes the existing MySQL enum spelling. */
@Converter
public class UserRoleConverter implements AttributeConverter<User.UserRole, String> {
    public String convertToDatabaseColumn(User.UserRole value) {
        return value == null ? null : value.name().toLowerCase(Locale.ROOT);
    }
    public User.UserRole convertToEntityAttribute(String value) {
        return value == null ? null : User.UserRole.valueOf(value.toUpperCase(Locale.ROOT));
    }
}
