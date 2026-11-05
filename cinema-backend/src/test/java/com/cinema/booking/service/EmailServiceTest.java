package com.cinema.booking.service;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class EmailServiceTest {
    @Test void usesConfiguredSenderAndDeliversOtpWithoutPuttingSecretInSubject() {
        var sender = mock(JavaMailSender.class);
        var service = new EmailService(sender);
        ReflectionTestUtils.setField(service, "fromAddress", "configured@example.invalid");
        service.sendOtpEmail("test@example.invalid", "123456", "Registration");
        var capture = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(sender).send(capture.capture());
        assertEquals("configured@example.invalid", capture.getValue().getFrom());
        assertTrue(capture.getValue().getText().contains("123456"));
        assertFalse(capture.getValue().getSubject().contains("123456"));
    }
    @Test void failedDeliveryFailsRegistrationWithoutExposingSmtpDetails() {
        var sender = mock(JavaMailSender.class);
        var service = new EmailService(sender);
        ReflectionTestUtils.setField(service, "fromAddress", "configured@example.invalid");
        doThrow(new MailSendException("sensitive smtp detail")).when(sender).send(any(SimpleMailMessage.class));
        var error = assertThrows(IllegalStateException.class,
                () -> service.sendOtpEmail("test@example.invalid", "123456", "Registration"));
        assertFalse(error.getMessage().contains("sensitive"));
        assertNull(error.getCause());
    }
}
