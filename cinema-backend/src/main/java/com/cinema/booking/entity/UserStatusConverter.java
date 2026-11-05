package com.cinema.booking.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.Locale;

/** Reads both Java and legacy Node values; writes the existing MySQL enum spelling. */
@Converter
public class UserStatusConverter implements AttributeConverter<User.UserStatus, String> {
    public String convertToDatabaseColumn(User.UserStatus value) {
        return value == null ? null : value.name().toLowerCase(Locale.ROOT);
    }
    public User.UserStatus convertToEntityAttribute(String value) {
        return value == null ? null : User.UserStatus.valueOf(value.toUpperCase(Locale.ROOT));
    }
}
