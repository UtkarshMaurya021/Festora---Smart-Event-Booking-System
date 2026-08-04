package com.festora.service;

import java.io.File;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.festora.entity.Booking;
import com.festora.entity.Ticket;
import com.festora.entity.TicketStatus;
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
     * Generates (or returns the existing) tickets for a booking — one ticket
     * per seat, per the ER diagram's Booking (1) -> Ticket (N) relationship.
     *
     * Idempotent: calling this twice for the same booking (e.g. a duplicate
     * payment confirmation, a retried request) must NOT create duplicate
     * rows or QR files. We look up however many tickets already exist for
     * the booking and only mint the ones still missing, so the booking ends
     * up with exactly `quantity` tickets no matter how many times this runs.
     */
    public List<Ticket> generateTicket(Booking booking) throws Exception {

        List<Ticket> existing = repository.findAllByBooking(booking);

        int quantity = booking.getQuantity() != null ? booking.getQuantity() : 1;
        int alreadyIssued = existing.size();

        if (alreadyIssued >= quantity) {
            return existing;
        }

        List<Ticket> newlyIssued = new ArrayList<>();
        for (int seatNumber = alreadyIssued + 1; seatNumber <= quantity; seatNumber++) {

            Ticket ticket = new Ticket();
            ticket.setBooking(booking);
            ticket.setIssueDate(LocalDateTime.now());
            ticket.setStatus(TicketStatus.VALID);

            String ticketNumber = "FES-" +
                    UUID.randomUUID()
                            .toString()
                            .substring(0, 8)
                            .toUpperCase();
            ticket.setTicketNumber(ticketNumber);

            String qrPath = writeQrCode(ticketNumber, buildQrPayload(ticketNumber, booking, seatNumber, quantity));
            ticket.setQrCodePath(qrPath);

            newlyIssued.add(repository.save(ticket));
        }

        List<Ticket> all = new ArrayList<>(existing);
        all.addAll(newlyIssued);
        return all;
    }

    private String buildQrPayload(String ticketNumber, Booking booking, int seatNumber, int quantity) {
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
                "\nSeat:" + seatNumber + " of " + quantity +
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