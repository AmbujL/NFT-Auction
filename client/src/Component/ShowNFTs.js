import React, { useContext, useEffect, useState } from "react";
import { Accordion, Button, Card, Form, Modal } from "react-bootstrap";
import { useMoralisQuery } from "react-moralis";
import { GlobalState, ListedNFts } from "../App";
import { MdGavel } from "react-icons/md";
import IERC721Metadata from "../contracts/IERC721Metadata.json";
import noImg from "../no_img.png";
import "font-awesome/css/font-awesome.min.css";
import UserBidingTable from "./UserBidingTable";
import LandingPage from "./LandingPage";

const ShowNFTs = () => {
  const { fetchingListedNFts, listedNfts } = useContext(ListedNFts);

  return (
    <>
      <section>
        <LandingPage />
        <div className="container-fluid">
          <h3 className="display-6 ms-1 my-5" style={{ fontWeight: "400" }}>
            Active Auctions
          </h3>
          <div className="d-flex justify-content-evenly">
            {fetchingListedNFts ? (
              <div>Loading.....</div>
            ) : (
              listedNfts.map((item, index) => {
                return (
                  <div key={index} className="">
                    <NFTBox
                      listedItem={item}
                      size={listedNfts.length}
                      index={index}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </>
  );
};

const NFTBox = ({ listedItem, size, index }) => {
  const [show, setShow] = useState(false);
  const [nftMetadata, setNftMetadata] = useState(undefined);
  const { price, nftAddress, tokenId, seller, bid, status } =
    listedItem.attributes;
  const { web3, accounts } = useContext(GlobalState);
  const auctionStatus = React.useRef(undefined);

  const { data: BidingTable } = useMoralisQuery("BidMade", (query) =>
    query
      .equalTo("nftAddress", nftAddress)
      .equalTo("tokenNumber", tokenId)
      .equalTo("ownerofToken", seller)
      .equalTo("confirmed", true)
      .descending("block_number")
  );

  if (status == 1) auctionStatus.current = "RUNNING";
  else if (status == 2) auctionStatus.current = "ENDED";
  else if (status == 3) auctionStatus.current = "CANCELLED";
  else auctionStatus.current = "CREATED";

  useEffect(() => {
    async function init() {
      try {
        const instance = new web3.eth.Contract(IERC721Metadata.abi, nftAddress);
        await instance.methods
          .tokenURI(tokenId)
          .call()
          .catch((err) => {
            console.log("no image set to this token");
          })
          .then(
            async (baseURL) => {
              if (baseURL) {
                await fetch(baseURL)
                  .then((res) => res.json())
                  .then(async (json) => {
                    const imgURl = "https://gateway.pinata.cloud/ipfs/".concat(
                      json.image.slice(7)
                    );
                    const imgBlob = await fetch(imgURl).then((res) =>
                      res.blob()
                    );
                    setNftMetadata({
                      ...json,
                      imgURl: URL.createObjectURL(imgBlob),
                    });
                  });
              }
            } //end
          );
      } catch (e) {
        console.log(e);
      }
    }

    init();
  }, [nftAddress, tokenId, web3]);

  return (
    <>
      <div style={{ width: "300px" }} className="card-shadow">
        <Card
          style={{ width: "18rem" }}
          className="h-100 zoom "
          variant="dark"
          bg="dark"
        >
          <Card.Img
            variant="top"
            src={nftMetadata?.imgURl ? nftMetadata.imgURl : noImg}
            className="img-fluid roundness  d-block"
            style={{ height: "180px" }}
          />

          <Card.Title className="text-center fs-6 mt-3 mx-3 ">
            <div className="d-flex justify-content-between">
              <div className="">
                <i className="fa fa-clock-o" aria-hidden="true"></i>{" "}
                <span className="text-Blue  small-x">
                  {auctionStatus.current}{" "}
                </span>
              </div>
              <div>
                <span style={{ fontWeight: "500" }} className="text-info">
                  {nftMetadata?.name}
                </span>
              </div>
            </div>
          </Card.Title>

          <Card.Body className="w-100 pt-0">
            <div className="d-flex justify-content-between small py-1">
              <div>
                <small className="text-muted ms-1">Seller :</small>
              </div>
              <div
                className="d-inline-block text-truncate fs-6"
                style={{ maxWidth: "100px" }}
              >
                {accounts[0].toLowerCase() == seller ? " You" : seller}
              </div>
            </div>

            <div className="d-flex justify-content-between w-100 mb-2">
              <Card body style={{ height: "80px", background: "#E8EAF6" }}>
                <small className="text-muted small-x">
                  Binding Bid &nbsp;
                  <MdGavel className="fa-lg" />
                </small>
                <div className="mt-2 text-start">
                  <i className="fa-brands fa-ethereum"></i>&nbsp;
                  <span className="fst-italic  text-black">
                    {bid != 0
                      ? Math.round(web3.utils.fromWei(bid, "ether") * 1000) /
                        1000
                      : Math.round(web3.utils.fromWei(price, "ether") * 1000) /
                        1000}
                    &nbsp; <i className="fa-brands fa-ethereum "></i>
                  </span>
                </div>
              </Card>
              <div className="small strong align-self-center text-success">
                <span className=" fs-5">{BidingTable?.length} </span> Bids ●
              </div>
            </div>

            <Button
              onClick={() => setShow(!show)}
              variant="outline-secondary"
              className="w-100 "
            >
              SHow Details
            </Button>
          </Card.Body>
        </Card>
      </div>

      <NFTItem
        nftTuple={listedItem.attributes}
        nftMetadata={nftMetadata}
        show={show}
        setShow={setShow}
        status={auctionStatus}
        BidingTable={BidingTable}
      />
    </>
  );
};

export const NFTItem = ({
  nftTuple,
  nftMetadata,
  show,
  setShow,
  status,
  BidingTable,
}) => {
  const { web3, auctionInstance, accounts } = useContext(GlobalState);
  const [validity, setValidity] = useState(undefined);
  const [price, setPrice] = useState(undefined);
  const [bid, setBid] = useState(undefined);
  const [isowner, setIsOwner] = useState(false);
  const [updatedBid, setUpdatedBid] = useState(bid);
  const userBuyOut = React.useRef(0);

  const { data: buyOutRow } = useMoralisQuery("AuctionStarted", (query) =>
    query
      .equalTo("nftAddress", nftTuple?.nftAddress)
      .equalTo("tokenNumber", nftTuple.tokenId)
      .equalTo("ownerofToken", nftTuple.seller)
      .equalTo("confirmed", true)
  );

  const { data: totalBiddingAmount } = useMoralisQuery("BidMade", (query) =>
    query
      .equalTo("nftAddress", nftTuple?.nftAddress)
      .equalTo("tokenNumber", nftTuple.tokenId)
      .equalTo("ownerofToken", nftTuple.seller)
      .equalTo("bidder", accounts[0].toLowerCase())
      .equalTo("confirmed", true)
      .descending("block_number")
  );

  const buyOutPrice = buyOutRow[0]?.attributes?.buyOutPrice
    ? buyOutRow[0]?.attributes?.buyOutPrice
    : 0;
  const currentBid = totalBiddingAmount[0]?.attributes?.currentBid
    ? totalBiddingAmount[0]?.attributes?.currentBid
    : 0;
  userBuyOut.current = web3.utils.fromWei(String(buyOutPrice - currentBid));

  useEffect(() => {
    setValidity(toTime(nftTuple.validity));
    setPrice(
      Math.round(web3.utils.fromWei(nftTuple?.price, "ether") * 1000) / 1000
    );
    if (nftTuple.bid == 0) {
      setBid(
        Math.round(web3.utils.fromWei(nftTuple?.price, "ether") * 1000) / 1000
      );
    } else {
      setBid(
        Math.round(
          web3.utils.fromWei(String(nftTuple?.bid - currentBid), "ether") * 1000
        ) / 1000
      );
    }
    setIsOwner(accounts[0].toLowerCase() == nftTuple.seller ? true : false);

    return () => {
      setBid(undefined);
      setIsOwner(false);
      setPrice(undefined);
      setValidity(undefined);
    };
  }, [nftTuple, accounts, currentBid, web3]);

  function toTime(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor((seconds % (3600 * 24)) / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
  }

  async function placeBid(bidprice) {
    try {
      document.getElementById("bidbutton").disabled = true;
      console.log(bidprice);
      if (bidprice <= bid) {
        alert(
          "Biding Price is less than the Binding  Bid , please Bid a valid amount!!"
        );
        document.getElementById("bidbutton").disabled = false;
        return;
      }
      await auctionInstance.methods
        .enterBid(nftTuple.nftAddress, nftTuple.tokenId)
        .send({ from: accounts[0], value: web3.utils.toWei(String(bidprice)) })
        .then((res) => {
          if (res?.events?.BidMade?.returnValues)
            alert("Successfully placed Bid!!");
          else alert("oops! something went wrong  ");
        });
      document.getElementById("bidbutton").disabled = false;
    } catch (e) {
      console.log(`encountered ${e.message}`);
    }
  }

  async function cancelAuction() {
    try {
      const isCancelled = await auctionInstance.methods
        .cancelAuction(nftTuple?.nftAddress, nftTuple.tokenId)
        .send({ from: accounts[0] })
        .then(console.log);
      alert(
        isCancelled
          ? `Successfull Cancelled auction of ${nftTuple.name} !`
          : "oops! something went wrong"
      );
    } catch (e) {
      console.log(nftTuple);
      console.log(`encountered ${e.message}`);
    }
  }

  async function finalizeAuction() {
    try {
      const isFinalized = await auctionInstance.methods
        .finalizeAuction(nftTuple.nftAddress, nftTuple.tokenId)
        .send({ from: accounts[0] })
        .then(console.log);

      alert(
        isFinalized
          ? `Successfull Finalized auction of ${nftTuple.name} !`
          : "oops! something went wrong"
      );
    } catch (e) {
      console.log(`encountered ${e.message}`);
    }
  }

  return (
    <>
      <Modal
        show={show}
        centered
        onHide={() => setShow(false)}
        size="xl"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header className="bg-dark" closeButton>
          <Modal.Title id="contained-modal-title-vcenter"></Modal.Title>
        </Modal.Header>
        <Modal.Body className=" text-light bg-dimdark">
          <div
            className={nftMetadata ? "d-none" : "d-block text-center text-info"}
          >
            Note: this NFT doesn't have a Media/Metadata Attached to it.
          </div>

          <section className="my-5">
            <div className="container">
              <div className="row justify-content-end ">
                <div
                  className="col col-md-4 overflow-auto"
                  style={{ maxHeight: "600px" }}
                >
                  <div className="w-100 " style={{ width: "200px" }}>
                    <span className="rounded">
                      <img
                        src={nftMetadata?.imgURl ? nftMetadata.imgURl : noImg}
                        alt="noimg"
                        className="img-fluid p-1 w-100  roundness"
                        style={{ height: "250px" }}
                      />
                    </span>
                    <Accordion defaultActiveKey="1" alwaysOpen flush>
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>
                          <strong>Properties </strong>
                        </Accordion.Header>
                        <Accordion.Body className="bg-dark lead fs-6">
                          <div className="row justify-content-evenly g-2">
                            {nftMetadata?.attributes?.map((item, index) => {
                              return (
                                <Card
                                  key={index}
                                  body
                                  className="col col-md-4 text-center "
                                  style={{
                                    minWidth: "8rem",
                                    height: "8rem",
                                    background: "#BBDEFB",
                                  }}
                                >
                                  <div
                                    style={{ color: "#2962FF" }}
                                    className="small"
                                  >
                                    {item?.trait_type?.toUpperCase()}
                                  </div>
                                  <div className="strong text-dark">
                                    {item.value}
                                  </div>
                                  .
                                </Card>
                              );
                            })}
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                      <Accordion.Item eventKey="1">
                        <Accordion.Header>
                          <strong>Description </strong>
                        </Accordion.Header>
                        <Accordion.Body className="bg-dark lead fs-6">
                          {nftMetadata?.description}
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion defaultActiveKey="1" alwaysOpen flush>
                      <Accordion.Item eventKey="1">
                        <Accordion.Header>
                          <strong>Details</strong>
                        </Accordion.Header>
                        <Accordion.Body className="bg-dark">
                          <div className="row row-cols-2">
                            <div className="col">Owner :</div>
                            <div className="col text-truncate">
                              {accounts[0].toLowerCase() === nftTuple.seller
                                ? " You"
                                : nftTuple?.seller}
                            </div>
                            <div className="col">ContractAddress</div>
                            <div className="col text-truncate">
                              {nftTuple?.nftAddress}
                            </div>
                            <div className="col">Token Id</div>
                            <div className="col">{nftTuple?.tokenId}</div>
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </div>
                </div>
                <div className="col col-md-8">
                  <div className="container">
                    <div className="text-warning">
                      <small>{status.current}</small>{" "}
                    </div>
                    <div className="fs-5 fw-bold mb-1">
                      {" "}
                      {nftMetadata?.name}{" "}
                    </div>
                    <div className="small text-muted text-center">
                      Note: Binding bid for user is calculated by subtracting
                      total invested from Binding Bid{" "}
                    </div>
                    <div className="d-flex justify-content-between mt-4">
                      {!isowner && (
                        <div>
                          <div className="text-muted">
                            Binding Bid For User{" "}
                          </div>

                          <div>
                            <i className="fa-brands fa-ethereum fa-3x text-secondary"></i>
                            <span className="display-5"> {bid} </span>
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-muted">Ends in:</div>
                        <div className="fs-5 mt-1">{validity}</div>
                      </div>
                    </div>
                    {!isowner && (
                      <div className="d-flex justify-content-evenly align-items-end my-4 p-2 ">
                        <div className="align-self-end mb-0 ">
                          <Form>
                            <Form.Group>
                              <Form.Control
                                type="number"
                                step="0.0001"
                                min={0.0001}
                                id="bidprice"
                                placeholder={` bid More than: ${bid}`}
                                onChange={(e) => setUpdatedBid(e.target.value)}
                              />
                              <br />
                            </Form.Group>
                            <Button
                              size="lg"
                              id="bidbutton"
                              variant="outline-warning"
                              onClick={() => placeBid(updatedBid)}
                              style={{ width: "240px", height: "60px" }}
                            >
                              Place Bid
                            </Button>
                          </Form>
                        </div>
                        {buyOutPrice !== 0 && (
                          <div>
                            <Button
                              variant="outline-warning"
                              onClick={() => placeBid(userBuyOut.current)}
                              style={{ width: "240px", height: "60px" }}
                            >
                              <div className="small"> BuyOut Price </div>
                              <div className="text-secondary fs-5">
                                {userBuyOut.current}
                                <i className="fa-brands fa-ethereum "></i>
                              </div>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    {isowner && (
                      <div className="d-flex justify-content-evenly my-4 p-3">
                        <Button
                          size="lg"
                          variant="outline-warning"
                          onClick={() => cancelAuction()}
                        >
                          Cancel Auction
                        </Button>
                        {status === "Ended" && (
                          <Button
                            variant="outline-warning"
                            onClick={() => finalizeAuction()}
                          >
                            Finalize Auction
                          </Button>
                        )}
                      </div>
                    )}

                    <Accordion defaultActiveKey="0" alwaysOpen flush>
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>
                          <strong>Bid History </strong>
                        </Accordion.Header>
                        <Accordion.Body
                          className="py-0 overflow-auto bg-dimdark "
                          style={{ maxHeight: "300px" }}
                        >
                          <UserBidingTable BidingTable={BidingTable} />
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ShowNFTs;
