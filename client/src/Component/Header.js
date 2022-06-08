import React,{useEffect} from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { Navbar, Container, Button, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

 
export default function Header({ login, logOut, fetchNFT, isAuthenticating }) {


  return (
    <>
      <Navbar>
        <Container>
          <Navbar.Brand href="#home">Navbar with text</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav navbarScroll className="align-items-center">
              <NavLink to="/" style={{ textDecoration: "none", color: "grey" }}>
                Home
              </NavLink>
              &nbsp;&nbsp;
              <NavLink
                to="DappDogo"
                style={{ textDecoration: "none", color: "grey" }}
              >
                Dapper Dogo NFT
              </NavLink>
              &nbsp;&nbsp;
              <NavLink
                to="collection"
                style={{ textDecoration: "none", color: "grey" }}
              >
                My Collection
              </NavLink>
            </Nav>
            <Button onClick={login}>
              <span>🦊</span> Moralis Metamask Login
            </Button>
            <Button onClick={logOut} disabled={isAuthenticating}>
              Logout
            </Button>

            <Navbar.Text>
              Signed in as: <a href="#login">Mark Otto</a>
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}
