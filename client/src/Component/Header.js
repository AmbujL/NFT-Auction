import React,{ useContext, useEffect, useState} from "react";
import { Navbar, Container, Button, Nav, Badge, Offcanvas, Card } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import falcon from '../falcon.png'
import { GlobalState } from "../App";

export default function Header({ login, logOut, isAuthenticating }) {

const [show, setShow] = useState(false);

const handleClose = () => setShow(false);
const handleShow = () => setShow(true);
const balance = React.useRef(undefined);

  const { accounts, web3 } = useContext(GlobalState);

  useEffect(() => {
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3, accounts]);
  


  const fetchBalance = async () => {

    if (web3 && accounts[0])
       await web3.eth.getBalance(accounts[0]).then((value) => {
         balance.current = Math.round(web3.utils.fromWei(value)* 100)/100;
      })
  }

  return (
    <>
      <Navbar expand="sm"  bg="black" variant="black"  >
        <Container fluid className="mx-4">
          <NavLink
            to="/"
            style={{
              textDecoration: "none",
              color: "white",
              fontWeight: "400",
            }}
            className="fs-6 ms-1"
          >
            <img src={falcon} alt="falcon" style={{ height: "40px", width: "40px" }} /> NFT
            HAAT
          </NavLink>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav navbarScroll className="align-items-center me-2">
              <NavLink
                to="/"
                style={{ textDecoration: "none", color: "white" }}
                className="me-3"
              >
                Home
              </NavLink>
              <NavLink
                to="DappDogo"
                style={{ textDecoration: "none", color: "white" }}
                className="me-3"
              >
                Dapper Dogo
              </NavLink>
              <NavLink
                to="collection"
                style={{ textDecoration: "none", color: "white" }}
                className="me-3"
              >
                My Collection
              </NavLink>
            </Nav>

            <div className="dropdown me-3">
              <Badge className=" bg-dark ms-2">
                <i className="fa-solid fa-user-astronaut fa-2x text-light"></i>
              </Badge>
              <div className="dropdown-content">
                <Button
                  onClick={login}
                  variant="outline-success"
                  disabled={isAuthenticating}
                  style={{ border: "none" }}
                >
                  <i className="fa-solid fa-right-to-bracket "></i>
                  <span> Login</span>
                </Button>
                <Button
                  onClick={logOut}
                  variant="outline-warning"
                  disabled={isAuthenticating}
                  style={{ border: "none" }}
                >
                  <i className="fa-solid fa-right-from-bracket"></i> Logout
                </Button>
              </div>
            </div>
            <Button
              variant="dark"
              onClick={() => {
                handleShow();
              }}
            >
              <i className="fa-solid fa-wallet fa-lg text-light"></i>
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="end"
        className="bg-dark text-light"
      >
        <Offcanvas.Header closeButton></Offcanvas.Header>
        <Offcanvas.Body className="text-center">
          <div className="p-2 my-3 d-flex ">
            <div className="me-auto">
              <i className="fa-solid fa-user fa-lg"></i> :
            </div>
            <div className="ms-auto">
              <span
                className=" d-inline-block text-truncate text-muted"
                style={{ maxWidth: "150px" }}
              >
                {accounts[0]}
              </span>
            </div>
          </div>
          <hr className="strong" />

          <Card
            body
            className="d-flex rounded-3 "
            style={{ background: "#4527A0" }}
          >
            <span className="text-muted small">Total Balance:</span>{" "}
            <strong className="fs-5">
              {balance?.current} <i className="fa-brands fa-ethereum"></i>
            </strong>
          </Card>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
