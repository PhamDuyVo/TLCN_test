package com.cinema.booking.service;
import com.cinema.booking.entity.*;
import com.cinema.booking.repository.*;
import com.cinema.booking.dto.BookingDtos.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
@DataJpaTest(properties={"spring.jpa.show-sql=false","spring.config.name=booking-tests"})
@AutoConfigureTestDatabase(replace=AutoConfigureTestDatabase.Replace.NONE)
@Import({HoldService.class,BookingService.class})
@Transactional(propagation=Propagation.NOT_SUPPORTED)
class BookingConcurrencyTest {
 @DynamicPropertySource static void db(DynamicPropertyRegistry r) {
  String url=System.getenv("BOOKING_TEST_DB_URL"); boolean mysql=url!=null;
  r.add("spring.datasource.url",()->mysql?url:"jdbc:h2:mem:bookingtest;MODE=MySQL;DB_CLOSE_DELAY=-1");
  r.add("spring.datasource.username",()->mysql?System.getenv("BOOKING_TEST_DB_USER"):"sa");
  r.add("spring.datasource.password",()->mysql?System.getenv("BOOKING_TEST_DB_PASSWORD"):"");
  r.add("spring.datasource.driver-class-name",()->mysql?"com.mysql.cj.jdbc.Driver":"org.h2.Driver");
  r.add("spring.jpa.hibernate.ddl-auto",()->mysql?"none":"create-drop");
  r.add("spring.jpa.database-platform",()->mysql?"org.hibernate.dialect.MySQLDialect":"org.hibernate.dialect.H2Dialect");
 }
 @Autowired HoldService holds; @Autowired BookingService bookings;
 @Autowired EntityManager em; @Autowired PlatformTransactionManager tm;
 @Autowired HoldSessionRepository sessions; @Autowired PromotionRepository promotions;
 long show,seat,seat2,user1,user2; String tag;
 @BeforeEach void fixture() {
  tag=UUID.randomUUID().toString().substring(0,8);
  new TransactionTemplate(tm).executeWithoutResult(tx->{
   Cinema c=Cinema.builder().name("Booking test "+tag).address("Test").city("Test").build();em.persist(c);
   Hall h=Hall.builder().cinemaId(c.getId()).name("Test "+tag).totalSeats(2).build();em.persist(h);
   Movie m=Movie.builder().title("Booking test "+tag).durationMinutes(90).releaseDate(LocalDate.now()).build();em.persist(m);
   Showtime sh=Showtime.builder().movie(m).hall(h).startTime(LocalDateTime.now().plusDays(2)).endTime(LocalDateTime.now().plusDays(2).plusHours(2)).basePrice(new BigDecimal("100")).build();em.persist(sh);show=sh.getId();
   SeatType st=SeatType.builder().name("Test "+tag).surcharge(BigDecimal.ZERO).build();em.persist(st);
   Seat a=Seat.builder().hallId(h.getId()).seatType(st).seatNumber("A1").seatRow("A").seatCol(1).build();em.persist(a);seat=a.getId();
   Seat b=Seat.builder().hallId(h.getId()).seatType(st).seatNumber("A2").seatRow("A").seatCol(2).build();em.persist(b);seat2=b.getId();
   User u=User.builder().fullName("Test").email(tag+"a@test.invalid").passwordHash("unused").build();em.persist(u);user1=u.getId();
   User v=User.builder().fullName("Test").email(tag+"b@test.invalid").passwordHash("unused").build();em.persist(v);user2=v.getId();
  });
 }
 @Test void simultaneousHoldHasExactlyOneWinner() throws Exception {
  assertEquals(1,race(()->holds.put(show,user1,List.of(seat)),()->holds.put(show,user2,List.of(seat))));
 }
 @Test void refreshSelectionAndDeleteNeverExtendDeadlineAndExpiredHoldCannotBook() {
  HoldDto first=holds.put(show,user1,List.of(seat));
  assertEquals(first.expiresAt(),holds.get(show,user1).expiresAt());
  assertEquals(first.expiresAt(),holds.put(show,user1,List.of(seat2)).expiresAt());
  assertEquals(first.expiresAt(),holds.delete(show,user1).expiresAt());
  assertEquals(first.expiresAt(),holds.put(show,user1,List.of(seat)).expiresAt());
  new TransactionTemplate(tm).executeWithoutResult(tx->{HoldSession s=sessions.findByShowtimeIdAndUserId(show,user1).orElseThrow();s.setExpiresAt(LocalDateTime.now().minusSeconds(1));sessions.save(s);});
  assertThrows(IllegalArgumentException.class,()->bookings.createBooking(user1,request(seat,null)));
 }
 @Test void duplicateCreateHasOneWinnerAndNoFakePayment() throws Exception {
  holds.put(show,user1,List.of(seat));
  assertEquals(1,race(()->bookings.createBooking(user1,request(seat,null)),()->bookings.createBooking(user1,request(seat,null))));
  BookingDetailDto b=bookings.getMyBookings(user1).get(0);
  assertEquals("PENDING_PAYMENT",b.getStatus());assertNull(b.getPaymentUrl());assertNull(b.getTickets().get(0).getQrPayload());
  assertThrows(IllegalArgumentException.class,()->bookings.getBookingDetail(user2,b.getBookingCode()));
 }
 @Test void lastVoucherUseHasOneWinner() throws Exception {
  String code="T"+tag.toUpperCase(Locale.ROOT);
  new TransactionTemplate(tm).executeWithoutResult(tx->promotions.save(Promotion.builder().code(code).discountType("amount").discountValue(BigDecimal.TEN).startDate(LocalDateTime.now().minusDays(1)).endDate(LocalDateTime.now().plusDays(1)).usageLimit(1).build()));
  Long otherShow=new TransactionTemplate(tm).execute(tx->{
   Showtime original=em.find(Showtime.class,show);
   Showtime other=Showtime.builder().movie(original.getMovie()).hall(original.getHall()).startTime(original.getStartTime().plusHours(3)).endTime(original.getEndTime().plusHours(3)).basePrice(original.getBasePrice()).build();em.persist(other);return other.getId();
  });
  holds.put(show,user1,List.of(seat));holds.put(otherShow,user2,List.of(seat2));
  CreateBookingRequest second=request(seat2,code);second.setShowtimeId(otherShow);
  assertEquals(1,race(()->bookings.createBooking(user1,request(seat,code)),()->bookings.createBooking(user2,second)));
  assertEquals(1,promotions.findByCodeAndStatus(code,"active").orElseThrow().getUsedCount());
 }
 @Test void invalidSelectionComboAndPaymentAreRejectedWithoutConsumingHold() {
  assertThrows(IllegalArgumentException.class,()->holds.put(show,user1,List.of(seat,seat)));
  assertThrows(IllegalArgumentException.class,()->holds.put(show,user1,List.of(Long.MAX_VALUE)));
  holds.put(show,user1,List.of(seat));
  CreateBookingRequest r=request(seat,null);r.setCombos(List.of(new ComboItemRequest(123L,0)));
  assertThrows(IllegalArgumentException.class,()->bookings.quote(user1,r));
  r.setCombos(null);r.setPaymentMethod("VNPAY");assertThrows(IllegalArgumentException.class,()->bookings.createBooking(user1,r));
  assertEquals(List.of(seat),holds.get(show,user1).seatIds());
  assertEquals(new BigDecimal("100.00"),bookings.quote(user1,r).finalAmount());
 }
 @Test void mysqlUniqueConstraintRejectsDirectDuplicateActiveTicket() {
  Assumptions.assumeTrue(System.getenv("BOOKING_TEST_DB_URL")!=null,"Original generated unique index requires MySQL schema");
  holds.put(show,user1,List.of(seat));BookingDetailDto booked=bookings.createBooking(user1,request(seat,null));
  assertThrows(RuntimeException.class,()->new TransactionTemplate(tm).executeWithoutResult(tx->{
   Booking b=em.find(Booking.class,booked.getId());
   Ticket t=Ticket.builder().booking(b).seat(em.find(Seat.class,seat)).showtimeId(show).ticketCode(UUID.randomUUID().toString()).price(BigDecimal.TEN).status("valid").build();em.persist(t);em.flush();
  }));
 }
 private CreateBookingRequest request(long id,String code) { CreateBookingRequest r=new CreateBookingRequest();r.setShowtimeId(show);r.setSeatIds(List.of(id));r.setPaymentMethod("PAY_AT_COUNTER");r.setPromotionCode(code);return r; }
 private int race(Callable<?> a,Callable<?> b) throws Exception {
  ExecutorService pool=Executors.newFixedThreadPool(2);CountDownLatch start=new CountDownLatch(1);
  try { List<Future<Boolean>> fs=new ArrayList<>();for(Callable<?> action:List.of(a,b)) fs.add(pool.submit(()->{start.await();try {action.call();return true;}catch(IllegalArgumentException ex){return false;}}));start.countDown();int won=0;for(Future<Boolean> f:fs)if(f.get(15,TimeUnit.SECONDS))won++;return won; }
  finally {pool.shutdownNow();}
 }
}
