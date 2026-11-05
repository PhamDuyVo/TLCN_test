-- Apply after schema_and_seed.sql to the selected database. No destructive DDL.
-- Existing showtime_seats is reused unchanged, including owner/expiry and unique pair.
-- This separate session row preserves the original deadline when selection is emptied
-- or DELETE releases seats. A new PUT after expiry explicitly begins a new session.
CREATE TABLE IF NOT EXISTS booking_hold_sessions (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 showtime_id BIGINT UNSIGNED NOT NULL,
 user_id BIGINT UNSIGNED NOT NULL,
 expires_at DATETIME(6) NOT NULL,
 UNIQUE KEY uq_hold_session_owner (showtime_id, user_id),
 CONSTRAINT fk_hold_session_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes(id),
 CONSTRAINT fk_hold_session_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- REQUIRED existing protection: booking_seats.active_showtime_seat generated from
-- ticket_status valid/used, UNIQUE uq_active_showtime_seat (schema_and_seed.sql).
-- Do not create a second tickets or showtime_seats table. Verify before deployment:
SHOW INDEX FROM booking_seats WHERE Key_name = 'uq_active_showtime_seat';

-- Mapping notes: Java Booking.userId -> bookings.customer_id; customer* -> guest_*;
-- totalAmount is computed from seat_amount + combo_amount, paymentMethod is the
-- PAY_AT_COUNTER API contract (not a stored payment or claim that money was received).
-- Java Ticket -> booking_seats; ticketCode -> qr_code; status -> ticket_status.
-- Valid ticket rows reserve seats even while parent booking is pending_payment.
-- Their tokens are withheld from customer responses until payment is recorded.
-- Java Promotion -> discount_type/discount_value (percent or amount).
-- Original schema has global usage_limit/used_count, no per-user limit column.
-- Reservations consume voucher quota atomically; no cancellation/refund endpoint
-- is introduced here. No payment success or payment record is fabricated.
-- Java Showtime.hall -> room_id. Other original-vs-Java mappings are handled
-- by the parent schema-alignment work; this migration must not invent parallel tables.
