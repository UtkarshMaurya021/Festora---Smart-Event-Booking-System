package com.festora.service;

import java.io.File;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.festora.entity.Booking;
import com.festora.entity.Ticket;
import com.festora.entity.User;
import com.festora.repository.TicketRepository;
import com.festora.repository.UserRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

@Service
public class TicketService {

    // Folder the QR images are written to, relative to the app's working
    // directory. WebConfig maps "/uploads/**" -> "file:uploads/", so this
    // must stay in sync with that mapping.
    private static final String QR_FOLDER = "uploads" + File.separator + "qr";

    private final TicketRepository repository;
    private final UserRepository userRepository;

    public TicketService(TicketRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public List<Ticket> myTickets(String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow();

        return repository.findAll()
                .stream()
                .filter(t -> t.getBooking()
                        .getUser()
                        .getUserId()
                        .equals(user.getUserId()))
                .toList();
    }

    /**
     * Generates (or returns the existing) ticket for a booking.
     *
     * Idempotent: since Ticket has a one-to-one relationship with Booking,
     * calling this twice for the same booking (e.g. a duplicate payment
     * confirmation, a retried request) must NOT create a second row or a
     * second QR file. We look the ticket up first and only mint a new one
     * if it doesn't already exist.
     */
    public Ticket generateTicket(Booking booking) throws Exception {

        Optional<Ticket> existing = repository.findByBooking(booking);
        if (existing.isPresent()) {
            return existing.get();
        }

        Ticket ticket = new Ticket();
        ticket.setBooking(booking);
        ticket.setIssueDate(LocalDateTime.now());

        String ticketNumber = "FES-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();
        ticket.setTicketNumber(ticketNumber);

        String qrPath = writeQrCode(ticketNumber, buildQrPayload(ticketNumber, booking));
        ticket.setQrCodePath(qrPath);

        return repository.save(ticket);
    }

    private String buildQrPayload(String ticketNumber, Booking booking) {
        String eventTitle = booking.getEvent() != null ? booking.getEvent().getTitle() : "N/A";
        String userName = booking.getUser() != null ? booking.getUser().getName() : "N/A";
        String eventStart = (booking.getEvent() != null && booking.getEvent().getEventStartDatetime() != null)
                ? booking.getEvent().getEventStartDatetime().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"))
                : "N/A";
        String venueName = (booking.getEvent() != null && booking.getEvent().getVenue() != null)
                ? booking.getEvent().getVenue().getVenueName()
                : "N/A";

        return "Ticket:" + ticketNumber +
                "\nBooking:" + booking.getBookingId() +
                "\nEvent:" + eventTitle +
                "\nVenue:" + venueName +
                "\nWhen:" + eventStart +
                "\nQty:" + booking.getQuantity() +
                "\nUser:" + userName;
    }

    private String writeQrCode(String ticketNumber, String data) throws Exception {

        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(data, BarcodeFormat.QR_CODE, 300, 300);

        File folder = new File(QR_FOLDER);
        if (!folder.exists() && !folder.mkdirs()) {
            throw new IllegalStateException("Could not create QR upload folder: " + folder.getAbsolutePath());
        }

        String fileName = ticketNumber + ".png";
        Path filePath = new File(folder, fileName).toPath();

        MatrixToImageWriter.writeToPath(matrix, "PNG", filePath);

        // Stored with forward slashes so it concatenates cleanly into a URL
        // on the frontend regardless of OS: http://host/{qrCodePath}
        return "uploads/qr/" + fileName;
    }
}