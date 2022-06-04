import React from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { Navbar, Container, Button, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";


export default function  Header() {
  const Web3Api = useMoralisWeb3Api();

  const {
    authenticate,
    isAuthenticated,
    isAuthenticating,
    user,
    account,
    logout,
  } = useMoralis();

  const login = async () => {
    if (!isAuthenticated) {
      await authenticate({ signingMessage: "Log in to NFT Auction" })
        .then(function (user) {
          console.log("logged in user:", user);
          console.log(user.get("ethAddress"));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  };

  const logOut = async () => {
    await logout().then((obj) => console.log(obj));
  };

  const fetchNFTTransfers = async () => {
    // get mainnet NFT transfers for the current user
    const transfersNFT = await Web3Api.account.getNFTTransfers({
      address: "0xB6Cc6Cc5e2bA9e8B0Bd72F22E61D05697dd8093A",
    });
    console.log(transfersNFT);
    const bscBalance = await Web3Api.account.getNativeBalance();
    console.log(bscBalance);
    };
    
    return (
      <>
        <Navbar>
          <Container>
            <Navbar.Brand href="#home">Navbar with text</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Nav navbarScroll className="align-items-center">
                <NavLink
                  to="/"
                  style={{ textDecoration: "none", color: "grey" }}
                >
                  Home
                </NavLink>
                &nbsp;&nbsp;
                <NavLink
                  to="collection"
                  style={{ textDecoration: "none", color: "grey" }}
                >
                  Dapper Dogo NFT
                </NavLink>
                <Nav.Link
                  href="#WorkingPage"
                  style={{ textDecoration: "none", color: "grey" }}
                >
                  My Collection
                </Nav.Link>
              </Nav>
              <Button onClick={fetchNFTTransfers} disabled={isAuthenticating}>
                Fetch NFt
              </Button>
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
