# zk Tickets

This is a ZKP based ticketing platform built with Circom, SnarkJS and Solidity and deployed on Bittorrent Chain

The application offers the user to create an event that can have tickets and users can purchase these tickets using cryptocurrency.

The webapp is divided into 3 pages.
On the first page you can create a ticketed event and interact with the smart contract to do so.

The second page is created to be included into another website as an iframe. This displays the ticketed event and allows users to purchase the tickets. They download these tickets as PDF!

The third page allows users to handle tickets, they can open the website on mobile devices, open up a QR code scanner and validate the tickets.

This application was created generally with Concert tickets in mind where you can receive an armband after your ticket is handled, so they are single use tickets with no further use-case after validation. However it could be useful for any other events, even to sell services and the crypto notes used for the tickets can be used as single time verifiable proof of payment.