package com.festora.service;

import java.io.File;
import java.time.LocalDateTime;
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
import java.util.List;
@Service
public class TicketService {

    private final TicketRepository repository;
    private final UserRepository userRepository;
    public TicketService(TicketRepository repository,UserRepository userRepository){

        this.repository=repository;
        this.userRepository=userRepository;
    }
    public List<Ticket> myTickets(
            String email){

        User user=userRepository
                .findByEmail(email)
                .orElseThrow();

        return repository.findAll()
                .stream()
                .filter(t->t.getBooking()
                        .getUser()
                        .getUserId()
                        .equals(user.getUserId()))
                .toList();

    }
    public void generateTicket(Booking booking)
            throws Exception{

        Ticket ticket=new Ticket();

        ticket.setBooking(booking);

        ticket.setIssueDate(LocalDateTime.now());

        String ticketNumber="FES-"+
                UUID.randomUUID()
                        .toString()
                        .substring(0,8)
                        .toUpperCase();

        ticket.setTicketNumber(ticketNumber);

        String data=
                "Ticket:"+ticketNumber+
                "\nBooking:"+booking.getBookingId()+
                "\nEvent:"+booking.getEvent().getTitle()+
                "\nUser:"+booking.getUser().getName();

        QRCodeWriter writer=
                new QRCodeWriter();

        BitMatrix matrix=
                writer.encode(
                        data,
                        BarcodeFormat.QR_CODE,
                        300,
                        300
                );

        File folder=
                new File("uploads/qr");

        if(!folder.exists()){

            folder.mkdirs();

        }

        String fileName=
                ticketNumber+".png";

        File file=
                new File(folder,fileName);

        MatrixToImageWriter.writeToPath(
                matrix,
                "PNG",
                file.toPath()
        );

        ticket.setQrCodePath(
                "uploads/qr/"+fileName
        );

        repository.save(ticket);

    }

}