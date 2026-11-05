package com.cinema.booking.service;
import com.cinema.booking.dto.BookingDtos.*;
import com.cinema.booking.entity.*;
import com.cinema.booking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor @Transactional
public class BookingService {
 private final BookingRepository bookingRepository;
 private final FoodComboRepository foodComboRepository;
 private final PromotionRepository promotionRepository;
 private final HoldService holds;
 private record Priced(Showtime show,List<Seat> seats,List<BookingCombo> combos,Promotion promo,QuoteDto quote) {}
 private Priced price(Long user,CreateBookingRequest r) {
  HoldService.requireUser(user);
  Showtime show=holds.lock(r.getShowtimeId()); holds.bookable(show);
  List<Seat> seats=holds.validateSeats(show,r.getSeatIds(),false);
  LocalDateTime deadline=holds.verify(show.getId(),user,r.getSeatIds());
  BigDecimal seatAmount=seats.stream().map(s->show.getBasePrice().add(s.getSeatType().getSurcharge())).reduce(BigDecimal.ZERO,BigDecimal::add);
  BigDecimal comboAmount=BigDecimal.ZERO; List<BookingCombo> combos=new ArrayList<>(); Set<Long> seen=new HashSet<>();
  if(r.getCombos()!=null) for(ComboItemRequest item:r.getCombos()) {
   if(item==null || item.getComboId()==null || item.getQuantity()==null || item.getQuantity()<1 || item.getQuantity()>99 || !seen.add(item.getComboId())) throw new IllegalArgumentException("Invalid or duplicate combo quantity (1-99 required)");
   FoodCombo combo=foodComboRepository.findById(item.getComboId()).orElseThrow(()->new IllegalArgumentException("Combo not found"));
   if(!"active".equalsIgnoreCase(combo.getStatus()) || !Boolean.TRUE.equals(foodComboRepository.isAvailable(combo.getId()))) throw new IllegalArgumentException("Combo unavailable");
   comboAmount=comboAmount.add(combo.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
   combos.add(BookingCombo.builder().combo(combo).quantity(item.getQuantity()).unitPrice(combo.getPrice()).build());
  }
  BigDecimal total=seatAmount.add(comboAmount); BigDecimal discount=BigDecimal.ZERO; Promotion promo=null;
  if(r.getPromotionCode()!=null && !r.getPromotionCode().isBlank()) {
   promo=promotionRepository.lockByCode(r.getPromotionCode().trim().toUpperCase(Locale.ROOT)).orElseThrow(()->new IllegalArgumentException("Voucher not found"));
   discount=PromotionService.calculate(promo,total,LocalDateTime.now());
  }
  return new Priced(show,seats,combos,promo,new QuoteDto(seatAmount,comboAmount,total,discount,total.subtract(discount),deadline,"PAY_AT_COUNTER"));
 }
 public QuoteDto quote(Long user,CreateBookingRequest r) { return price(user,r).quote(); }
 public BookingDetailDto createBooking(Long user,CreateBookingRequest r) {
  if(!"PAY_AT_COUNTER".equals(r.getPaymentMethod())) throw new IllegalArgumentException("Only confirmed PAY_AT_COUNTER reservations are supported; online payment unavailable");
  Priced p=price(user,r); QuoteDto q=p.quote();
  Booking b=Booking.builder().bookingCode("BK"+UUID.randomUUID().toString().replace("-", "").substring(0,18))
   .userId(user).showtime(p.show()).promotion(p.promo()).customerName(r.getCustomerName()).customerEmail(r.getCustomerEmail()).customerPhone(r.getCustomerPhone())
   .seatAmount(q.seatAmount()).comboAmount(q.comboAmount()).discountAmount(q.discountAmount()).finalAmount(q.finalAmount())
   .paymentMethod("PAY_AT_COUNTER").status("pending_payment").expiresAt(p.show().getStartTime()).build();
  for(Seat seat:p.seats()) b.getTickets().add(Ticket.builder().booking(b).seat(seat).showtimeId(p.show().getId())
   .ticketCode(UUID.randomUUID().toString()).price(p.show().getBasePrice().add(seat.getSeatType().getSurcharge())).status("valid").build());
  for(BookingCombo combo:p.combos()) { combo.setBooking(b); b.getCombos().add(combo); }
  // Recheck the deadline after pricing/locking the voucher: lock waits must not extend holds.
  holds.verify(p.show().getId(),user,r.getSeatIds());
  if(p.promo()!=null) { p.promo().setUsedCount(p.promo().getUsedCount()+1); promotionRepository.save(p.promo()); }
  bookingRepository.saveAndFlush(b); holds.consume(p.show().getId(),user);
  return mapToDetailDto(b,null);
 }
 public BookingDetailDto getBookingDetail(Long user,String code) {
  HoldService.requireUser(user);
  Booking b=bookingRepository.findByBookingCode(code).filter(x->user.equals(x.getUserId())).orElseThrow(()->new IllegalArgumentException("Booking not found"));
  return mapToDetailDto(b,null);
 }
 public List<BookingDetailDto> getMyBookings(Long user) { HoldService.requireUser(user); return bookingRepository.findByUserIdOrderByCreatedAtDesc(user).stream().map(b->mapToDetailDto(b,null)).toList(); }
    private BookingDetailDto mapToDetailDto(Booking b, String paymentUrl) {
        Showtime s = b.getShowtime();
        List<String> seatNumbers = b.getTickets().stream()
                .map(t -> t.getSeat() != null ? t.getSeat().getSeatNumber() : "")
                .collect(Collectors.toList());

        List<TicketDto> ticketDtos = b.getTickets().stream().map(t -> TicketDto.builder()
                .id(t.getId())
                .ticketCode("paid".equalsIgnoreCase(b.getStatus()) ? t.getTicketCode() : null)
                .seatNumber(t.getSeat() != null ? t.getSeat().getSeatNumber() : "")
                .price(t.getPrice())
                .qrPayload("paid".equalsIgnoreCase(b.getStatus()) ? t.getTicketCode() : null)
                .status("paid".equalsIgnoreCase(b.getStatus()) ? ("used".equalsIgnoreCase(t.getStatus()) ? "CHECKED_IN" : "PAID") : "PENDING_PAYMENT")
                .build()).collect(Collectors.toList());

        String cinemaName = "";
        String hallName = "";
        if (s.getHall() != null) {
            hallName = s.getHall().getName();
        }

        return BookingDetailDto.builder()
                .id(b.getId())
                .bookingCode(b.getBookingCode())
                .movieTitle(s.getMovie() != null ? s.getMovie().getTitle() : "")
                .moviePoster(s.getMovie() != null ? s.getMovie().getPosterUrl() : "")
                .cinemaName(cinemaName)
                .hallName(hallName)
                .showtimeStart(s.getStartTime())
                .seatNumbers(seatNumbers)
                .totalAmount(b.getTotalAmount())
                .discountAmount(b.getDiscountAmount())
                .finalAmount(b.getFinalAmount())
                .paymentMethod(b.getPaymentMethod())
                .status(b.getStatus().toUpperCase(java.util.Locale.ROOT))
                .paymentUrl(paymentUrl)
                .expiresAt(b.getExpiresAt())
                .tickets(ticketDtos)
                .createdAt(b.getCreatedAt())
                .build();
    }
}
