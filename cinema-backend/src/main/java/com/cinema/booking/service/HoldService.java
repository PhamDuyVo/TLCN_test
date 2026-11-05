package com.cinema.booking.service;
import com.cinema.booking.dto.BookingDtos.HoldDto;
import com.cinema.booking.entity.*;
import com.cinema.booking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
@Service @RequiredArgsConstructor @Transactional
public class HoldService {
 private final ShowtimeRepository showtimes;
 private final SeatRepository seats;
 private final ShowtimeSeatRepository inventory;
 private final HoldSessionRepository sessions;
 private final TicketRepository tickets;
 public Showtime lock(Long id) {
  if(id==null) throw new IllegalArgumentException("showtimeId is required");
  return showtimes.lockById(id).orElseThrow(()->new IllegalArgumentException("Showtime not found"));
 }
 public void bookable(Showtime s) {
  if(!"scheduled".equalsIgnoreCase(s.getStatus()) || s.getHall()==null || !"active".equalsIgnoreCase(s.getHall().getStatus()) || !s.getStartTime().isAfter(LocalDateTime.now()))
   throw new IllegalArgumentException("Showtime is not open for booking");
 }
 public List<Seat> validateSeats(Showtime s,List<Long> ids,boolean emptyAllowed) {
  if(ids==null || (!emptyAllowed && ids.isEmpty()) || ids.size()>20 || ids.stream().anyMatch(Objects::isNull) || new HashSet<>(ids).size()!=ids.size())
   throw new IllegalArgumentException("Provide distinct seatIds (1-20 seats)");
  List<Seat> result=seats.findByIdIn(ids);
  if(result.size()!=ids.size() || result.stream().anyMatch(x-> !Objects.equals(x.getHallId(),s.getHall().getId()) || !"active".equalsIgnoreCase(x.getStatus())))
   throw new IllegalArgumentException("Seat unavailable or outside showtime room");
  return result;
 }
 public static boolean activeTicket(Ticket t) {
  return List.of("PENDING","PENDING_PAYMENT","PAID","CHECKED_IN","VALID","USED").contains(t.getStatus().toUpperCase(Locale.ROOT));
 }
 public HoldDto get(Long id,Long user) { requireUser(user); lock(id); return snapshot(id,user); }
 public HoldDto put(Long id,Long user,List<Long> ids) {
  requireUser(user); Showtime show=lock(id); bookable(show); validateSeats(show,ids,true);
  LocalDateTime now=LocalDateTime.now();
  HoldSession session=sessions.findByShowtimeIdAndUserId(id,user).orElse(null);
  if(session==null || !session.getExpiresAt().isAfter(now)) {
   if(ids.isEmpty()) return snapshot(id,user);
   if(session==null) { session=new HoldSession(); session.setShowtimeId(id); session.setUserId(user); }
   session.setExpiresAt(now.plusSeconds(300).withNano(0)); sessions.save(session);
  }
  List<ShowtimeSeat> rows=inventory.findByShowtimeId(id);
  Set<Long> booked=new HashSet<>(); tickets.findByShowtimeId(id).stream().filter(HoldService::activeTicket).forEach(t->booked.add(t.getSeat().getId()));
  for(Long seat:ids) {
   ShowtimeSeat row=rows.stream().filter(r->r.getSeatId().equals(seat)).findFirst().orElse(null);
   if(booked.contains(seat) || (row!=null && ("booked".equals(row.getStatus()) || (live(row,now) && !user.equals(row.getHeldByUserId())))))
    throw new IllegalArgumentException("Seat already booked or held");
  }
  for(ShowtimeSeat row:rows) if(user.equals(row.getHeldByUserId()) && "held".equals(row.getStatus())) release(row);
  for(Long seat:ids) {
   ShowtimeSeat row=rows.stream().filter(r->r.getSeatId().equals(seat)).findFirst().orElseGet(ShowtimeSeat::new);
   row.setShowtimeId(id); row.setSeatId(seat); row.setStatus("held"); row.setHeldByUserId(user); row.setHoldExpiresAt(session.getExpiresAt()); inventory.save(row);
  }
  return snapshot(id,user);
 }
 public HoldDto delete(Long id,Long user) {
  requireUser(user); lock(id);
  inventory.findByShowtimeId(id).stream().filter(r->user.equals(r.getHeldByUserId()) && "held".equals(r.getStatus())).forEach(this::release);
  return snapshot(id,user);
 }
 private void release(ShowtimeSeat r) { r.setStatus("available"); r.setHeldByUserId(null); r.setHoldExpiresAt(null); inventory.save(r); }
 public static boolean live(ShowtimeSeat r,LocalDateTime now) { return "held".equals(r.getStatus()) && r.getHoldExpiresAt()!=null && r.getHoldExpiresAt().isAfter(now); }
 private HoldDto snapshot(Long id,Long user) {
  LocalDateTime now=LocalDateTime.now(); HoldSession s=sessions.findByShowtimeIdAndUserId(id,user).orElse(null);
  List<Long> ids=inventory.findByShowtimeId(id).stream().filter(r->user.equals(r.getHeldByUserId()) && live(r,now)).map(ShowtimeSeat::getSeatId).sorted().toList();
  return new HoldDto(id,ids,s==null?null:s.getExpiresAt(),now,s==null?"NONE":s.getExpiresAt().isAfter(now)?"ACTIVE":"EXPIRED");
 }
 public LocalDateTime verify(Long id,Long user,List<Long> ids) {
  HoldDto h=snapshot(id,user);
  if(!"ACTIVE".equals(h.status()) || !new HashSet<>(h.seatIds()).equals(new HashSet<>(ids))) throw new IllegalArgumentException("Hold expired or selection does not match your hold");
  if(tickets.findByShowtimeIdAndSeatIdIn(id,ids).stream().anyMatch(HoldService::activeTicket)) throw new IllegalArgumentException("Seat already booked");
  return h.expiresAt();
 }
 public void consume(Long id,Long user) {
  inventory.findByShowtimeId(id).stream().filter(r->user.equals(r.getHeldByUserId()) && "held".equals(r.getStatus())).forEach(r->{r.setStatus("booked");r.setHeldByUserId(null);r.setHoldExpiresAt(null);inventory.save(r);});
 }
 public static void requireUser(Long user) { if(user==null) throw new IllegalArgumentException("Authentication required"); }
}
