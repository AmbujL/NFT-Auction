import React, { useEffect, useContext, useState } from "react";
import { GlobalState } from "../App";
import IERC721Contract from "../contracts/IERC721.json";
import AuctionContract from "../contracts/IERC721.json";
import SellingContract from "../contracts/IERC721.json";
import { Card ,ButtonGroup,ToggleButton , Form, Modal,Container,Button} from "react-bootstrap";

export default function MyCollection({ fetchNFTs }) {
  const [nftInfo, updateNftInfo] = useState([]);

  const { isAuthenticated } = useContext(GlobalState);

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated == true) {
          updateNftInfo(await fetchNFTs());
      }
    };
    init();
  }, [isAuthenticated]);

  return (
    <>
      <h3>NFT's Owned by address</h3>
      <div className="container">
        <div className="d-flex justify-content-start">
          {nftInfo.map((val, k) => {
            return (
              <div className="col-sm-4" key={k}>
                <NFTCard nftObj={val} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function NFTCard({ nftObj }) {

  const [checked, setChecked] = useState(false);
  const [price, setPrice] = useState(0);
  const [time, setTime] = useState(0);
  const [radioValue, setRadioValue] = useState("1");
  const { web3 ,accounts} = useContext(GlobalState);
  
  const radios = [{ name: "Auction", value: '1' }, { name: "Sale", value: '2' }];
  

  
  async function approveNFTTransferTo(RecieverContractJson ) {
   if (nftObj.owner_of == accounts[0]) {
     const nft_instance = new web3.eth.Contract(
       IERC721Contract.abi,
       nftObj.address
     );
     await nft_instance.methods
       .approve(RecieverContractJson, nftObj.token_id)
       .send({ from: accounts[0] })
       .then(console.log);
    }
   else {
     alert('NFT owner and cuurent user is not same, error ocuured in approveNFTTransfer-> MyCollection')
    }

  }
  
  const triggerAuction = async (e) => {
    e.preventDefault();
    console.log("auction triggered")
    try {
      if (price <= 0 || time <= 0)
        throw new Error("price or Time is not valid ");
      const netId = await web3.eth.net.getId();
      const auctionAddress = AuctionContract.networks[netId].address;
      await approveNFTTransferTo(auctionAddress);
      
      const auctionInstance = new web3.eth.Contract(
        AuctionContract.abi,
        auctionAddress
      );

       auctionInstance.methods.startAuction(nftObj.address,nftObj.token_id,price,time); 
     
    }
    catch (error) {
      console.log(error," ->  occured at TriggerAuction");
    }

  }



  const triggerSale = async(e) => {
    e.preventDefault()
    try {
      if (price <= 0)
        throw new Error("price is not valid ");
      const netId = await web3.eth.net.getId();

      const SellingAddress = AuctionContract.networks[netId].address;
      await approveNFTTransferTo(SellingAddress);
      
      const SaleInstance = new web3.eth.Contract(
        AuctionContract.abi,
        SellingAddress
      );

       SaleInstance.methods.listItem(nftObj.address, nftObj.token_id, price); 
     
    }
    catch (error) {
      console.log(error," ->  occured at TriggerAuction");
    }
  };

  const InvokeModal = ({ x }) => {
    
   return (
      <>
       
      </>
    )
  }

  return (
    <>
      <Card style={{ width: "18rem" }}>
        <Card.Img
          variant="top"
          src={nftObj.token_uri}
          className={"img-fluid " + "p-1"}
        />
        <Card.Body>
          <Card.Title>
            From Collection of <strong>{nftObj.name} </strong>
          </Card.Title>
          <Card.Text className="text-center fs-6 fw-bold">
            {nftObj.token_id}
          </Card.Text>
          <div className="d-flex">
            <span>Put it on :</span>
            <ButtonGroup className="mb-2">
              {radios.map((radio, idx) => (
                <ToggleButton
                  key={idx}
                  id={`radio-${idx}`}
                  type="radio"
                  variant={idx % 2 ? "outline-success" : "outline-warning"}
                  name="radio"
                  value={radio.value}
                  checked={radioValue === radio.value}
                  onChange={(e) => setRadioValue(e.currentTarget.value)}
                  onClick={(e) => {
                    setChecked(!checked);
                  }}
                >
                  {radio.name}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </div>
        </Card.Body>
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
                radioValue == 1 ? triggerAuction(e) : triggerSale(e);
              }}
            >
              <Form.Group className="mb-3">
                <div className="d-flex justify-content-between">
                  <Form.Control
                    type="text"
                    placeholder="Enter Price in eth"
                    className="my-3 "
                    style={{ width: "40%" }}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  {(radioValue == 1 ? true : false) && (
                    <Form.Control
                      type="text"
                      placeholder="Auction Validity in Days"
                      className="my-3 "
                      style={{ width: "40%" }}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  )}
                </div>
              </Form.Group>
              <Button variant="info" type="submit">
                Submit
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
}
