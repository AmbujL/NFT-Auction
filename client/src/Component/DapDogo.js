import React,{useState,useContext, useEffect} from 'react';
import {GlobalState} from '../App';
import DapDogoContract from "../contracts/DapDogoNFT.json";
import { Button } from "react-bootstrap";
import preview from "../preview_large.png";
import previewGif from "../preview.gif";


export default function () {
  const [quantity, updateQuantity] = useState(0);
    const [instance, setInstance] = useState(undefined);
  const { web3, accounts } = useContext(GlobalState);
  

  useEffect(() => {
    const init = async () => {
      const netId = await web3.eth.net.getId();
      const address = DapDogoContract.networks[netId].address;
      const instance = new web3.eth.Contract(
        DapDogoContract.abi,
        address
        
      );
      setInstance(instance);
    }
    init()
  },[web3])


  
    const mintToken = async (quantity) => {
      try {
        document.getElementById("mint").disabled = true;

        if (typeof quantity !== "number")
          throw new Error("quanity must be a number");
        
        const amount = web3.utils.toWei(String(quantity * 0.1), "ether");
        await instance.methods
          .mint(quantity)
          .send({ from: accounts[0], value: amount }).then();     
        
      } catch (error) {
        console.log(error);
      }
       document.getElementById("mint").disabled = false;
    };

    function increament() {
      if (quantity >= 5) return;
      updateQuantity(quantity + 1);
    }
    function decreament() {
      if (quantity <= 0) return;
      updateQuantity(quantity - 1);
    }

    return (
      <>
        <div className="mt-5">
          <div className="text-center mb-5  ">
            <h3 className="mb-4">
              Mint from our Exclusive DappDogo Collection!{" "}
            </h3>

            <div className="mb-5">
              <img src={preview} alt="preview" className="img-fluid" />
            </div>

            <div className="row justify-content-evenly">
              <div className="col-md-3 text-center">
                <img
                  src={previewGif}
                  alt="preview1"
                  className="img-thumbnail "
                  style={{ width: "200px", height: "200px" }}
                ></img>
              </div>

              <div className="col-md-6 mt-3">
                <div className="row justify-content-center  mb-5">
                  <Button
                    variant="outline-warning"
                    onClick={() => increament()}
                    className="col-md-4 "
                  >
                    increament
                  </Button>
                  <p id="flag" className="col-md-4">
                    {quantity}
                  </p>
                  <Button
                    variant="outline-warning"
                    onClick={() => decreament()}
                    className="col-md-4 "
                  >
                    decreament
                  </Button>
                </div>

                <Button
                  variant="outline-success"
                  id="mint"
                  onClick={() => mintToken(quantity)}
                >
                  Click to Mint NFT !
                </Button>
              </div>

              <div className="col-md-3 text-center">
                <img
                  src={previewGif}
                  alt="preview2"
                  className="img-thumbnail "
                  style={{ width: "200px", height: "200px" }}
                ></img>
              </div>
            </div>
          </div>
        </div>
      </>
    );


}