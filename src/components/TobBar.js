"use client";

import { Navbar, Nav, Container } from "react-bootstrap";

export default function TopBar() {
    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                {/* Brand */}
                <Navbar.Brand href="/">
                    MyApp
                </Navbar.Brand>
                {/* Mobile toggle */}
                <Navbar.Toggle aria-controls="main-navbar" />
                <Navbar.Collapse id="main-navbar">
                    <Nav className="ms-auto">
                        <Nav.Link href="/">
                            Home
                        </Nav.Link>
                        <Nav.Link href="/timepicker">
                            Time Picker
                        </Nav.Link>
                        <Nav.Link href="/admin">
                            admin
                        </Nav.Link>
                        <Nav.Link href="/student">
                            student
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
