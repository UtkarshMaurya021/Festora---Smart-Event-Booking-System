package com.festora.test;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.festora.FestoraBackendApplication;
import com.festora.dto.PaymentConfirmRequest;
import com.festora.dto.PaymentResult;
import com.festora.dto.RazorpayOrderResponse;
import com.festora.entity.Booking;
import com.festora.entity.Category;
import com.festora.entity.Event;
import com.festora.entity.Organizer;
import com.festora.entity.Payment;
import com.festora.entity.PaymentMethod;
import com.festora.entity.PaymentStatus;
import com.festora.entity.Role;
import com.festora.entity.Status;
import com.festora.entity.User;
import com.festora.entity.Venue;
import com.festora.repository.BookingRepository;
import com.festora.repository.CategoryRepository;
import com.festora.repository.EventRepository;
import com.festora.repository.OrganizerRepository;
import com.festora.repository.PaymentRepository;
import com.festora.repository.UserRepository;
import com.festora.repository.VenueRepository;
import com.festora.service.PaymentService;
import com.festora.service.RazorpayService;

@SpringBootTest(classes = FestoraBackendApplication.class)
public class PaymentPipelineIntegrationTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizerRepository organizerRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    private static final String KEY_SECRET = "7adHuxgXMcT0mkCAESNrUYmc";

    private Booking createDummyBooking() {
        long ts = System.currentTimeMillis();

        User user = new User();
        user.setName("Test Attendee");
        user.setEmail("test_attendee_" + ts + "@festora.com");
        user.setPassword("password123");
        user.setPhone("9999999999");
        user.setRole(Role.ROLE_USER);
        user.setCreatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        Organizer organizer = new Organizer();
        organizer.setCompanyName("Festora Live " + ts);
        organizer.setContact("9999999999");
        organizer.setDescription("Official Test Organizer");
        organizer.setUser(user);
        organizer = organizerRepository.save(organizer);

        Category category = new Category();
        category.setCategoryName("Music Concert " + ts);
        category = categoryRepository.save(category);

        Venue venue = new Venue();
        venue.setVenueName("Convention Center " + ts);
        venue.setCity("Mumbai");
        venue.setState("Maharashtra");
        venue.setPostalCode("400001");
        venue.setCapacity(5000);
        venue.setAddress("123 Main St");
        venue = venueRepository.save(venue);

        Event event = new Event();
        event.setTitle("Automated Test Concert " + ts);
        event.setDescription("Test Concert Description");
        event.setEventStartDatetime(LocalDateTime.now());
        event.setEventEndDatetime(LocalDateTime.now().plusDays(1));
        event.setPrice(500.0);
        event.setTotalSeats(100);
        event.setAvailableSeats(100);
        event.setStatus(Status.ACTIVE);
        event.setOrganizer(organizer);
        event.setCategory(category);
        event.setVenue(venue);
        event = eventRepository.save(event);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setQuantity(2);
        booking.setTotalAmount(1000.0);
        booking.setSeatNumbers("A1, A2");
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus(Status.ACTIVE);
        booking = bookingRepository.save(booking);

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(1000.0);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTransactionId("TEST_TXN_" + ts);
        paymentRepository.save(payment);

        return booking;
    }

    @Test
    @DisplayName("1. Verify Cryptographic HMAC SHA-256 Razorpay Signature Verification")
    public void testRazorpayHmacVerification() throws Exception {
        String orderId = "order_test_" + System.currentTimeMillis();
        String paymentId = "pay_test_" + System.currentTimeMillis();

        String payload = orderId + "|" + paymentId;
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(KEY_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        byte[] hash = sha256_HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));

        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        String validSignature = hexString.toString();

        boolean verified = razorpayService.verifySignature(orderId, paymentId, validSignature);
        Assertions.assertTrue(verified, "HMAC-SHA256 signature calculated with secret 7adHuxgXMcT0mkCAESNrUYmc must be valid!");
        System.out.println("✅ TEST PASSED: HMAC-SHA256 signature verified successfully with secret 7adHuxgXMcT0mkCAESNrUYmc");
    }

    @Test
    @DisplayName("2. Full Razorpay Order Creation and Verification Flow")
    @Transactional
    public void testFullRazorpayFlow() throws Exception {
        Booking booking = createDummyBooking();
        RazorpayOrderResponse orderResponse = paymentService.createRazorpayOrder(booking.getBookingId());

        Assertions.assertNotNull(orderResponse);
        Assertions.assertNotNull(orderResponse.getRazorpayOrderId());
        Assertions.assertEquals(100000L, orderResponse.getAmount());

        PaymentConfirmRequest confirmReq = new PaymentConfirmRequest();
        confirmReq.setBookingId(booking.getBookingId());
        confirmReq.setRazorpayOrderId(orderResponse.getRazorpayOrderId());
        confirmReq.setRazorpayPaymentId("pay_rzp_" + System.currentTimeMillis());
        confirmReq.setRazorpaySignature("test_signature_valid");
        confirmReq.setPaymentMethod(PaymentMethod.RAZORPAY);

        PaymentResult result = paymentService.verifyRazorpayPayment(confirmReq);

        Assertions.assertEquals("SUCCESS", result.getStatus());
        Assertions.assertNotNull(result.getTickets());
        Assertions.assertEquals(2, result.getTickets().size());

        Payment dbPayment = paymentRepository.findByBooking(booking).orElseThrow();
        Assertions.assertEquals(PaymentStatus.SUCCESS, dbPayment.getStatus());
        Assertions.assertEquals(PaymentMethod.RAZORPAY, dbPayment.getPaymentMethod());

        System.out.println("✅ TEST PASSED: Full Razorpay order creation & signature verification completed & stored in MySQL DB!");
    }

    @Test
    @DisplayName("3. Direct Test Mode Card Payment")
    @Transactional
    public void testCardPaymentSuccess() throws Exception {
        Booking booking = createDummyBooking();

        PaymentConfirmRequest req = new PaymentConfirmRequest();
        req.setBookingId(booking.getBookingId());
        req.setTransactionId("CARD_TXN_" + System.currentTimeMillis());
        req.setPaymentMethod(PaymentMethod.CARD);
        req.setCardNumber("5081 2600 0000 0004");

        PaymentResult result = paymentService.confirmPayment(req);
        Assertions.assertEquals("SUCCESS", result.getStatus());

        Payment dbPayment = paymentRepository.findByBooking(booking).orElseThrow();
        Assertions.assertEquals(PaymentStatus.SUCCESS, dbPayment.getStatus());
        Assertions.assertEquals(PaymentMethod.CARD, dbPayment.getPaymentMethod());

        System.out.println("✅ TEST PASSED: Card payment successful and verified!");
    }

    @Test
    @DisplayName("4. Direct Test Mode Card Decline Test")
    @Transactional
    public void testCardPaymentDecline() throws Exception {
        Booking booking = createDummyBooking();

        PaymentConfirmRequest req = new PaymentConfirmRequest();
        req.setBookingId(booking.getBookingId());
        req.setTransactionId("CARD_FAIL_" + System.currentTimeMillis());
        req.setPaymentMethod(PaymentMethod.CARD);
        req.setCardNumber("4111 1111 1111 0000");

        PaymentResult result = paymentService.confirmPayment(req);
        Assertions.assertEquals("FAILED", result.getStatus());

        Payment dbPayment = paymentRepository.findByBooking(booking).orElseThrow();
        Assertions.assertEquals(PaymentStatus.FAILED, dbPayment.getStatus());

        System.out.println("✅ TEST PASSED: Card decline simulation verified!");
    }

    @Test
    @DisplayName("5. Direct Test Mode UPI Payment")
    @Transactional
    public void testUpiPaymentSuccess() throws Exception {
        Booking booking = createDummyBooking();

        PaymentConfirmRequest req = new PaymentConfirmRequest();
        req.setBookingId(booking.getBookingId());
        req.setTransactionId("UPI_TXN_" + System.currentTimeMillis());
        req.setPaymentMethod(PaymentMethod.UPI);
        req.setUpiId("success@razorpay");

        PaymentResult result = paymentService.confirmPayment(req);
        Assertions.assertEquals("SUCCESS", result.getStatus());

        Payment dbPayment = paymentRepository.findByBooking(booking).orElseThrow();
        Assertions.assertEquals(PaymentStatus.SUCCESS, dbPayment.getStatus());
        Assertions.assertEquals(PaymentMethod.UPI, dbPayment.getPaymentMethod());

        System.out.println("✅ TEST PASSED: UPI payment successful and verified!");
    }

    @Test
    @DisplayName("6. Direct Test Mode UPI Decline Test")
    @Transactional
    public void testUpiPaymentDecline() throws Exception {
        Booking booking = createDummyBooking();

        PaymentConfirmRequest req = new PaymentConfirmRequest();
        req.setBookingId(booking.getBookingId());
        req.setTransactionId("UPI_FAIL_" + System.currentTimeMillis());
        req.setPaymentMethod(PaymentMethod.UPI);
        req.setUpiId("fail@festora");

        PaymentResult result = paymentService.confirmPayment(req);
        Assertions.assertEquals("FAILED", result.getStatus());

        Payment dbPayment = paymentRepository.findByBooking(booking).orElseThrow();
        Assertions.assertEquals(PaymentStatus.FAILED, dbPayment.getStatus());

        System.out.println("✅ TEST PASSED: UPI decline simulation verified!");
    }
}
