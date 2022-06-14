import React, { useContext, useEffect, useState } from "react";
import { Accordion, Button, ButtonGroup, Card, Modal } from "react-bootstrap";
import { useMoralisQuery } from "react-moralis";
import {  Navigate, useParams } from "react-router-dom";
import { GlobalState } from "../App";
import IERC721Metadata from "../contracts/IERC721Metadata.json";
import noImg from '../no_img.png';
import "font-awesome/css/font-awesome.min.css";



export default function () {

  const { data: listedNfts, isFetching: fetchingListedNFts } = useMoralisQuery(
    "activeAuction",
    (query) => query.limit(10).descending("tokenId")
  );

  return (
    <>
          <div>
              <h3 className="display-4 text-center my-5"> Auctions</h3>
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
    </>
  );
}

const NFTBox = ({ listedItem ,size, index }) => {
  const [show, setShow] = useState(false);
  const [nftMetadata, setNftMetadata] = useState(undefined);
  const {
    price,
    nftAddress,
    tokenId,
    marketplaceAddress,
    seller,
    bid,
    status,
  } = listedItem.attributes;
  const { web3, accounts } = useContext(GlobalState);

  useEffect(() => {
    async function init() {
      try {
          const instance = new web3.eth.Contract(
            IERC721Metadata.abi,
            nftAddress
          );
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
                    .then((json) => {
                      const imgURl =
                        "https://gateway.pinata.cloud/ipfs/".concat(
                          json.image.slice(7)
                        );
                      setNftMetadata({
                        ...json,
                        imgURl: imgURl,
                      })

                    });
                }

              } //end
        );
      } catch (e) {
        console.log(e);
      }
    }
  
      init();    
  }, [nftAddress]);


  return (
    <>
      <div style={{ width: "300px" }}>
        <Card style={{ width: "18rem" }} className="h-100">
          <Card.Title
            style={{ minHeight: "40px" }}
            className="text-center fs-6"
          >
            <div className="d-flex justify-content-evenly">
              <span className="text-success"> {status}</span>
              <span>
                token id: <strong>{tokenId} </strong>
              </span>
            </div>
          </Card.Title>
          <Card.Img
            variant="top"
            src={nftMetadata?.imgURl ? nftMetadata.imgURl : noImg}
            className="img-fluid p-1 roundness"
            style={{ height: "180px" }}
          />

          <Card.Body>
            <Card.Text className="text-center fs-6">
              <div className="d-flex justify-content-end">
                <div>
                  initial price :{" "}
                  {Math.round(web3.utils.fromWei(price, "ether") * 100) / 100}
                </div>
                <div>
                  owner :
                  <div
                    className="d-inline-block text-truncate"
                    style={{ maxWidth: "100px" }}
                  >
                    {seller}
                  </div>
                </div>
              </div>
            </Card.Text>
            <div className="d-flex">
              <span>
                place Bid : more than{" "}
                {Math.round(web3.utils.fromWei(bid, "ether") * 100) / 100}{" "}
              </span>
              <ButtonGroup className="mb-2"></ButtonGroup>

              <button
                onClick={() => {
                  setShow(!show);
                }}
              >
                SHow details
              </button>
            </div>
          </Card.Body>
        </Card>
      </div>
      <NFTItem
        nftTuple={listedItem.attributes}
        nftMetadata={nftMetadata}
        show={show}
        setShow={setShow}
      />
    </>
  );
};


export const NFTItem = ({ nftTuple, nftMetadata, show, setShow }) => {

  const { web3 } = useContext(GlobalState);
  const [validity, setValidity] = useState(undefined)
  const [price,setPrice] = useState(undefined)
  const [bid, setBid] = useState(undefined)
  
  useEffect(() => {
    if (nftTuple) {
     setValidity(toTime(nftTuple.validity));
      setPrice(Math.round(web3.utils.fromWei(nftTuple?.price, "ether") * 100) / 100);
      setBid(Math.round(web3.utils.fromWei(nftTuple?.bid, "ether") * 100) / 100);

    }

  })


    function toTime(seconds) {
       var date = new Date(null);
       date.setSeconds(seconds);
       return date.toISOString().substr(11, 8);
  }

  function PlaceBid() {
    var bidprice = document.getElementById('bidprice');
    
    
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
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Modal heading
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className={nftMetadata ? "d-none" : "d-block text-center text-info"}
          >
            Note: this NFT doesn't have a Media Attached to it.
          </div>

          <section className="my-5">
            <div className="container">
              <div className="row justify-content-end">
                <div className="col col-md-4 ">
                  <div className="w-100" style={{ width: "200px" }}>
                    <img
                      src={nftMetadata?.imgURl ? nftMetadata.imgURl : noImg}
                      className="img-fluid p-1 roundness w-100"
                      style={{ height: "250px" }}
                    />
                    <Accordion defaultActiveKey="0" flush>
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>
                          <strong>Description </strong>
                        </Accordion.Header>
                        <Accordion.Body className="lead fs-5">
                          {nftMetadata?.description}
                        </Accordion.Body>
                      </Accordion.Item>
                      <Accordion.Item eventKey="1">
                        <Accordion.Header>
                          <strong>Details</strong>
                        </Accordion.Header>
                        <Accordion.Body>
                          <div className="row row-cols-2">
                            <div className="col">Owner :</div>
                            <div className="col text-truncate">
                              {nftTuple?.seller}
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
                    <div>
                      {" "}
                      <small>{nftTuple?.status}</small>{" "}
                    </div>
                    <div className="fs-5 fw-bold"> {nftMetadata?.name} </div>

                    <div className="d-flex justify-content-between">
                      <div>
                        <div className="text-muted small">Price </div>

                        <div>
                          <span className="display-5"> {price} </span>
                          <i class="fa-brands fa-ethereum"></i>
                        </div>
                      </div>
                      <div>
                        <div className="text-muted">Ends in:</div>
                        <div>{validity}</div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-evenly my-4">
                      <div>
                        <input
                          type="text"
                          id="bidprice"
                          name={bid}
                          placeholder={` bid More than: ${bid}`}
                        />
                        <br />
                        <Button size="lg">Place Bid</Button>
                      </div>

                      <Button size="lg">BuyOut Price </Button>
                    </div>
                    <Accordion defaultActiveKey="0" flush>
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>
                          <strong>Bid History </strong>
                        </Accordion.Header>
                        <Accordion.Body className="lead fs-5"></Accordion.Body>
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