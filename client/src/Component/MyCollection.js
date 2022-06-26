import React, { useEffect, useContext, useState } from "react";
import { GlobalState, ListedNFts } from "../App";
import IERC721Contract from "../contracts/IERC721.json";
import IERC721Metadata from "../contracts/IERC721Metadata.json";
import { Card , Form, Modal,Container,Button} from "react-bootstrap";
import noImg from '../no_img.png'
import '../App.css'
import { AiOutlineFileSearch } from 'react-icons/ai'

export default function MyCollection({ fetchNFTs }) {

  const { fetchingListedNFts, listedNfts } = useContext(ListedNFts);
  const { web3, accounts } = useContext(GlobalState);
  const [nftInfo, updateNftInfo] = useState([]);
  const [isNFTPresent, setIsNFTPresent] = useState([]);
  const [showDialog, setShowDialog] = useState(false);


   function filterNftFromAuction(userNfts) {
    if (userNfts.length > 0) {
      let tempnftArray = [];
      userNfts.forEach((items) => {
        if (
          !listedNfts.some(
            (e) =>
              e?.attributes?.tokenId == items.token_id &&
              e?.attributes?.nftAddress == items.token_address &&
              e?.attributes?.seller == items.owner_of
          ) &&
          !nftInfo.some(
            (e) =>
              e?.token_id == items.token_id &&
              e?.token_address == items.token_address &&
              e?.owner_of == items.owner_of
          )
        )
          tempnftArray = [...tempnftArray, items];
      });
      if (tempnftArray.length > 0) {
        updateNftInfo(tempnftArray);
        return [true, "NFT found !"]; // in case successfully found nft's that are not available in auction return true else return false
      }
      else {
        return [
          false,
          "NFT not Available for User as they are present in Auction or already available in User Collection !",
        ];
      }
      
    }
    else {
      // in case
      return[false," User don't own any NFT !"]
    }

  }



  useEffect(() => {
    const init = async () => {
      if (!fetchingListedNFts) {
        const res = filterNftFromAuction(await fetchNFTs());
        setIsNFTPresent(res);
      }
    };
    init();
    return () => updateNftInfo([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchingListedNFts]);


  const fetchSpecificNft = async (e) => {
    try {
      e.preventDefault();
      const tokenaddress = document.getElementById("contractAddress").value;
      const tokenId = document.getElementById("tokenId").value;
      const nftInstance = new web3.eth.Contract(IERC721Contract.abi, tokenaddress);
      await nftInstance.methods.ownerOf(tokenId).call().then(async (addr) => {
        if (addr == accounts[0]) {
          const metadataInstance = new web3.eth.Contract(IERC721Metadata.abi, tokenaddress);
          const tokenURI = await metadataInstance.methods.tokenURI(tokenId).call();
          const name = await metadataInstance.methods.name().call();
          console.log(tokenURI, name);
          if (tokenURI && name) {
            var customObj = [{
              token_uri: tokenURI,
              token_address: tokenaddress,
              owner_of: accounts[0].toLowerCase(),
              token_id: tokenId,
              name: name,
            }];
            const [status, msg] = filterNftFromAuction(customObj);
            alert(msg);
          }
        }
        else
          alert("you don't own this nft");
      });
    }
    catch (e)
  {  console.log(e);
    alert(e.message)
}
   
  }

  return (
    <>
      {fetchingListedNFts ? (
        <div className="mt-5 text-center display-6 text-muted">Loading...</div>
      ) : (
        <div className="mt-5 text-center">
          <h3 className="display-6 fw-bold">NFT's Owned by User :</h3>
          <div className="container p-3 mt-2">
            <small className="text-muted">
              Please Note it may take 2-3 minutes to fetch nft minted by user
              recently{" "}
            </small>

            <div id="msg"></div>
            <div className="text-end">
              <Button
                variant="outline-warning"
                onClick={() => setShowDialog(true)}
                className="mt-5"
              >
                  <div className="small">Not able to find your Nft?</div>
                  <strong>Click Here!</strong>
              </Button>
            </div>
            {!isNFTPresent[0] && (
                <div className="text-center p-3  d-flex justify-content-center  align-items-center" style={{ height: '400px' }}>
                  <div>
                <AiOutlineFileSearch className="fa-4x" />
                <div className=" text-muted text-light">
                  {isNFTPresent[1]}
                    </div>
                  </div>
              </div>
            )}
            <div className="row justify-content-start mt-3">
              {nftInfo.map((val, k) => {
                return (
                  <div className="col-sm-4" key={k}>
                    <NFTCard nftObj={val} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Modal show={showDialog} onHide={() => setShowDialog(!showDialog)}>
        <Modal.Header
          closeButton
          className=" text-light"
          style={{ backgroundColor: "#333ca5" }}
        >
          <Modal.Title variant="secondary">Enter Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={(e) => {
              fetchSpecificNft(e);
            }}
          >
            <Form.Group className="mb-3">
              <div className=" justify-content-between">
                <Form.Control
                  type="text"
                  id="contractAddress"
                  placeholder="Enter Contract Address"
                  className="my-3 "
                />

                <Form.Control
                  type="number"
                  min="1"
                  id="tokenId"
                  placeholder="Auction Token ID"
                  className="my-3 "
                />
              </div>
            </Form.Group>
            <div className="text-end">
              <Button variant="info" id="addnft" type="submit">
                Add NFT
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

function NFTCard({ nftObj }) {

  const [checked, setChecked] = useState(false);
  const [price, setPrice] = useState(0);
  const [time, setTime] = useState(0);
  const [buyOut, setBuyOut] = useState(0);
  const { web3, accounts, auctionInstance } = useContext(GlobalState);
  const [img,setImg] = useState(undefined)



  useEffect(() => {
    const init = async () => {
      await fetchNFTImage(nftObj?.token_uri);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftObj.token_uri]);


  const fetchNFTImage = async (baseURL) => {
    try {
      if (baseURL) {
        await fetch(baseURL)
          .then((res) => res.json())
          .then((json) => {
            const imgURl = "https://gateway.pinata.cloud/ipfs/".concat(
              json.image.slice(7)
            );
            setImg(imgURl);
          });
      }
    }
    catch (error) {
      console.log(error.message);
    }
  };

  
  async function approveNFTTransferTo(RecieverContractJson) {
      document.getElementById("auctionmsg").innerHTML =
        "Approving NFT to NftHaat ...";
      if (nftObj.owner_of == accounts[0].toLowerCase()) {
        const nft_instance = new web3.eth.Contract(
          IERC721Contract.abi,
          nftObj.token_address
        );
         await nft_instance.methods
          .approve(RecieverContractJson, nftObj.token_id)
          .send({ from: accounts[0] })
          .then(
            () =>
              (document.getElementById("auctionmsg").innerHTML =
                "Approved ...")
          );
      }
      else {
        alert('NFT owner and cuurent user is not same, error ocuured in approveNFTTransfer-> MyCollection');
        return;
      }
    
  }
  
  const triggerAuction = async (e) => {
    e.preventDefault();
    document.getElementById("startAuction").disabled = true;
    document.getElementById("auctionmsg").innerHTML = "Processing ...";

    console.log("auction triggered")
    try {
      if ( time <= 0)
        throw new Error(" Time is not valid ");
      await approveNFTTransferTo(auctionInstance._address);
        document.getElementById("auctionmsg").innerHTML =
          "Initiating Auction ...";
      await auctionInstance.methods
        .startAuction(
          nftObj.token_address,
          nftObj.token_id,
          web3.utils.toWei(price),
          time,
          web3.utils.toWei(buyOut)
        )
        .send({ from: accounts[0] })
        .then(
          (res) => {
            const eventInfo = res.events?.AuctionStarted;
            if (eventInfo) {
              document.getElementById("auctionmsg").innerHTML = "Auction Created successfully ....";
              document.getElementById("info").innerHTML = "please Note : NFT will only appear on Auction section once it's transaction get's confirmed in Goerli Network."

            }
          });    
         document.getElementById("startAuction").disabled = false;
    }
    catch (error) {
      document.getElementById("auctionmsg").innerHTML =
        "cancelled ....";
     document.getElementById("startAuction").disabled = false;
      alert(error.message, " ->  occured at TriggerAuction");
      return
    }
   
  }



  return (
    <>
      <Card
        style={{ width: "16rem" }}
        className="card-shadow roundness-all"
        bg="dark"
        variant="dark"
      >
        <Card.Img
          variant="top"
          src={img ? img : noImg}
          text="yo"
          className="img-fluid p-0"
          style={{ height: "230px" , width :'100%' }}
        />

        <Card.Body>
          <Card.Title>
            <span className="fst-italic">{nftObj.name} </span>
          </Card.Title>
          <Card.Text className="text-center fs-6 fw-bold m-0 ">
            #{nftObj.token_id}
          </Card.Text>
        </Card.Body>
        <Card.Footer className="w-100 p-0">
          <Button
            variant="outline-warning"
            className="rounded-pill w-100"
            onClick={(e) => {
              setChecked(!checked);
            }}
          >
           START AUCTION
          </Button>
        </Card.Footer>
      </Card>

      <Container className="my-5">
        <Modal show={checked} onHide={() => setChecked(!checked)}>
          <Modal.Header
            closeButton
            className=" text-light"
            style={{ backgroundColor: "#333ca5" }}
          >
            <Modal.Title variant="secondary">Enter Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form
              onSubmit={(e) => {
                triggerAuction(e);
              }}
            >
              <Form.Group className="mb-3">
                <div className=" justify-content-between">
                  <Form.Control
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Enter Starting Price in eth"
                    className="my-3 "
                    onChange={(e) => setPrice(e.target.value)}
                  />

                  <Form.Control
                    type="number"
                    min="1"
                    placeholder="Auction Validity in Days"
                    className="my-3 "
                    onChange={(e) => setTime(e.target.value)}
                  />
                  <Form.Control
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Buy Out Price "
                    className="my-3 "
                    onChange={(e) => setBuyOut(e.target.value)}
                  />
                </div>
              </Form.Group>
              <div className="text-end">
                <Button variant="info" id="startAuction" type="submit">
                  Submit
                </Button>
              </div>
              <div className="fs-5 text-muted text-center" id="auctionmsg">
              </div>
              <span className="small text-info" id="info"></span>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
}
